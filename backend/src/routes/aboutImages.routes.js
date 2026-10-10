const express = require('express');
const requireAuth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAboutImages,
  addAboutImages,
  deleteAboutImage,
  MAX_IMAGES,
} = require('../controllers/aboutImages.controller');

const router = express.Router();

router.get('/', getAboutImages);
router.post('/', requireAuth, upload.array('images', MAX_IMAGES), addAboutImages);
router.delete('/:id', requireAuth, deleteAboutImage);

module.exports = router;
