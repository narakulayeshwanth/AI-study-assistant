const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const officeParser = require('officeparser');
const fs = require('fs');
const path = require('path');

/**
 * Extract text from a PDF file
 */
const extractFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return {
    text: data.text.trim(),
    pageCount: data.numpages,
    wordCount: data.text.trim().split(/\s+/).filter(Boolean).length,
  };
};

/**
 * Extract text from a DOCX file
 */
const extractFromDOCX = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value.trim();
  return {
    text,
    pageCount: Math.ceil(text.split(/\s+/).length / 300), // estimate ~300 words/page
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
};

/**
 * Extract text from a plain text file
 */
const extractFromTXT = (filePath) => {
  const text = fs.readFileSync(filePath, 'utf-8').trim();
  return {
    text,
    pageCount: Math.ceil(text.split(/\s+/).length / 300),
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
};

/**
 * Extract text from a PPTX file using officeparser v6 callback API
 * Falls back to manual OOXML (JSZip) extraction if officeparser returns empty content
 */
const extractFromPPT = async (filePath) => {
  // officeparser v6 uses a callback — wrap in a Promise
  const text = await new Promise((resolve, reject) => {
    officeParser.parseOffice(filePath, (data, err) => {
      if (err) return reject(err);
      resolve(data || '');
    });
  });

  const cleaned = (typeof text === 'string' ? text : String(text || '')).trim();

  // If officeparser returned nothing, fall back to manual OOXML extraction
  if (!cleaned || cleaned.split(/\s+/).filter(Boolean).length < 5) {
    return extractFromPPTXManual(filePath);
  }

  // Estimate slide count by double-newline separators
  const slideCount = Math.max(1, cleaned.split(/\n{2,}/).length);
  return {
    text: cleaned,
    pageCount: slideCount,
    wordCount: cleaned.split(/\s+/).filter(Boolean).length,
  };
};

/**
 * Manual PPTX text extraction by reading OOXML XML directly (no external dependency beyond JSZip)
 */
const extractFromPPTXManual = async (filePath) => {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries();

  // Slide XML files are at ppt/slides/slide*.xml
  const slideEntries = entries
    .filter(e => e.entryName.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.entryName.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

  const slideTexts = slideEntries.map(entry => {
    const xml = entry.getData().toString('utf-8');
    // Extract all <a:t> text node contents
    const matches = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)];
    return matches.map(m => m[1]).filter(Boolean).join(' ');
  }).filter(Boolean);

  const fullText = slideTexts.join('\n\n');
  return {
    text: fullText || 'No text content could be extracted from this PPTX file.',
    pageCount: Math.max(1, slideEntries.length),
    wordCount: fullText.split(/\s+/).filter(Boolean).length,
  };
};

/**
 * Main extractor — routes by file extension
 */
const extractText = async (filePath, fileType) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return await extractFromPDF(filePath);
    case 'docx':
      return await extractFromDOCX(filePath);
    case 'txt':
      return extractFromTXT(filePath);
    case 'pptx':
      return await extractFromPPT(filePath);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};

/**
 * Truncate text to a max token-safe length for AI APIs
 */
const truncateText = (text, maxChars = 12000) => {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '\n\n[Content truncated for processing...]';
};

module.exports = { extractText, truncateText };
