const express = require('express');
const requireAuth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require('../controllers/team.controller');

const router = express.Router();

router.get('/', getTeam);
router.post('/', requireAuth, upload.single('photo'), createTeamMember);
router.put('/:id', requireAuth, upload.single('photo'), updateTeamMember);
router.delete('/:id', requireAuth, deleteTeamMember);

module.exports = router;