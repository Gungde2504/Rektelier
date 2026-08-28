const express = require('express');
const rateLimit = require('express-rate-limit');
const upload = require('../middleware/upload');
const { getPublishedNews, getNewsBySlug, submitNews } = require('../controllers/news.controller');

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Terlalu banyak submission, coba lagi nanti' },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadFields = upload.fields([
  { name: 'cover', maxCount: 1 },
]);

router.get('/', getPublishedNews);
router.post('/submit', submitLimiter, uploadFields, submitNews);
router.get('/:slug', getNewsBySlug);

module.exports = router;