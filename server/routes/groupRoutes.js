const express = require('express');
const router = express.Router();
const {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getGroups);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

module.exports = router;
