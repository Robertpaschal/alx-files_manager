// routes/index.js
const express = require('express');
const router = express.Router();
const AppController = require('../controllers/AppController');

// Define routes and map them to controller methods
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UsersController');

router.post('/users', UsersController.postNew);
module.exports = router;
