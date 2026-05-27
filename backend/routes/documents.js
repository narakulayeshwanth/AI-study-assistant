const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  updateDocument,
} = require('../controllers/documentController');

router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.patch('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
