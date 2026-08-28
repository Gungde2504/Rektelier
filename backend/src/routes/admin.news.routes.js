const express = require('express');
const requireAuth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllNewsAdmin,
  getNewsByIdAdmin,
  updateNews,
  updateNewsStatus,
  deleteNews,
} = require('../controllers/news.controller');

const router = express.Router();
router.use(requireAuth);

const uploadFields = upload.fields([{ name: 'cover', maxCount: 1 }]);

router.get('/', getAllNewsAdmin);
router.get('/:id', getNewsByIdAdmin);
router.put('/:id', uploadFields, updateNews);
router.patch('/:id/status', updateNewsStatus);
router.delete('/:id', deleteNews);

module.exports = router;