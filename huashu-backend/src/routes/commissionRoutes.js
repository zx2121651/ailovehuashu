const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const auth = require('../middleware/auth');

router.get('/distributor-info', auth, commissionController.getDistributorInfo);
router.get('/my-team', auth, commissionController.getMyTeam);
router.get('/commission-logs', auth, commissionController.getCommissionLogs);
router.post('/withdraw', auth, commissionController.applyWithdrawal);
router.post('/simulate-order', auth, commissionController.simulateOrderWithCommission);

module.exports = router;
