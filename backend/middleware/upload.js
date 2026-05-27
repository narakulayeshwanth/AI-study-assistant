const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);

    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, '-')
      .toLowerCase();

    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  const allowedExts = ['.pdf', '.docx', '.txt', '.pptx'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === '.ppt') {
    return cb(
      new Error(
        'Old .ppt format is not supported. Please save your file as .pptx and try again.'
      ),
      false
    );
  }

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, TXT, and PPTX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize:
      parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
  },
});

module.exports = upload;