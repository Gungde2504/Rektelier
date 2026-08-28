const express = require('express');
const rateLimit = require('express-rate-limit');
const upload = require('../middleware/upload');
const {
  getPublishedProjects,
  getProjectBySlug,
  submitProject,
} = require('../controllers/projects.controller');

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
  { name: 'header_image', maxCount: 1 },
  { name: 'header_video', maxCount: 1 },
  { name: 'gallery', maxCount: 20 },
]);

router.get('/', getPublishedProjects);
router.post('/submit', submitLimiter, uploadFields, submitProject);
router.get('/:slug', getProjectBySlug);

module.exports = router;