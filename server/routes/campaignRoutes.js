const express = require('express');
const router = express.Router();
const {
  getCampaigns,
  createCampaign,
  duplicateCampaign,
  deleteCampaign,
  getCampaignStats
} = require('../controllers/campaignController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.post('/:id/duplicate', duplicateCampaign);
router.delete('/:id', deleteCampaign);
router.get('/:id/stats', getCampaignStats);

module.exports = router;
