const express = require('express');
const requireAuth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllProjectsAdmin,
  getProjectByIdAdmin,
  updateProject,
  updateProjectStatus,
  deleteProject,
} = require('../controllers/projects.controller');

const router = express.Router();
router.use(requireAuth);

const uploadFields = upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'gallery', maxCount: 20 },
]);

router.get('/', getAllProjectsAdmin);
router.get('/:id', getProjectByIdAdmin);
router.put('/:id', uploadFields, updateProject);
router.patch('/:id/status', updateProjectStatus);
router.delete('/:id', deleteProject);

module.exports = router;