const express = require('express');
const { verifyToken } = require('../app/middlewares/verifyToken');
const router = express.Router();

const authController = require('../app/controllers/AuthController');

router.get('/', verifyToken, authController.home);
router.get('/login', authController.login);
router.post('/login', authController.doLogin);
router.get('/logout', authController.logout);
router.get('/register', authController.register);
router.get('/verify-email', authController.verifyEmail);

module.exports = router;
