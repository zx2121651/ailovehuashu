const express = require('express');
const router = express.Router();
const floatScriptController = require('../controllers/floatScriptController');
const auth = require('../middleware/auth');

// Public/User Routes (Requires standard user auth)
// Add auth middleware if the app requires users to be logged in to fetch these
router.get('/', auth, floatScriptController.getFloatScripts);

module.exports = router;
