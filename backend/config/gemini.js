const https = require('https');

// Default model — use gemini-2.0-flash (stable on v1beta)
const DEFAULT_MODEL = 'gemini-2.0-flash';

/**
 * Call Gemini REST API directly using v1beta endpoint.
 * NOTE: gemini-2.0-flash and gemini-2.5-flash require /v1beta/, NOT /v1/.
 * Returns a simple object with { generateContent, startChat } interface.
 */
const getGeminiModel = (modelName = DEFAULT_MODEL) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const callAPI = (body) => new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      // ✅ FIXED: Must use /v1beta/ for gemini-2.0-flash and gemini-2.5-flash
      path: `/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 60000, // 60 second timeout
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            const errMsg = `[Gemini ${json.error.code}] ${json.error.message}`;
            const err = new Error(errMsg);
            // Attach status for quota detection
            err.status = json.error.code;
            reject(err);
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error('Failed to parse Gemini response'));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timed out after 60 seconds'));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  return {
    // generateContent(prompt: string) → response.text()
    generateContent: async (prompt) => {
      const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      };
      const json = await callAPI(body);
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { response: { text: () => text } };
    },

    // startChat({ history, systemInstruction }) → { sendMessage(msg) }
    startChat: ({ history = [], systemInstruction = '' }) => ({
      sendMessage: async (message) => {
        const contents = [];
        // Prepend system instruction as first user turn if provided
        if (systemInstruction) {
          contents.push({ role: 'user', parts: [{ text: systemInstruction }] });
          contents.push({ role: 'model', parts: [{ text: 'Understood. I will answer only based on the provided document.' }] });
        }
        contents.push(...history);
        contents.push({ role: 'user', parts: [{ text: message }] });

        const body = {
          contents,
          generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
        };
        const json = await callAPI(body);
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return { response: { text: () => text } };
      },
    }),
  };
};

// Legacy export kept for compatibility
const getGeminiClient = () => ({ getGenerativeModel: getGeminiModel });

module.exports = { getGeminiClient, getGeminiModel };
