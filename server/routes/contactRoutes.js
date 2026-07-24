const express = require('express');
const router = express.Router();
const {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  importContacts,
  exportContacts
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', getContacts);
router.post('/', addContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.post('/bulk-delete', bulkDeleteContacts);
router.post('/import', upload.single('file'), importContacts);
router.get('/export', exportContacts);

module.exports = router;
