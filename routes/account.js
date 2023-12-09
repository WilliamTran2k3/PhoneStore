const express = require('express');
const router = express.Router();
const upload = require("../app/middlewares/upload");
const { verifyToken, verifyTokenAPIAdmin } = require('../app/middlewares/verifyToken');

const accountController = require('../app/controllers/AccountController');

router.get('/', verifyToken, accountController.accountsPage);
router.get('/profile', verifyToken, accountController.profile);
router.get('/search', accountController.search);
router.get('/:id', verifyToken, accountController.accountDetailPage);
router.get('/page/:page', accountController.pagination);
router.post('/', verifyTokenAPIAdmin, accountController.addAccount);
router.put('/', verifyTokenAPIAdmin, accountController.resendEmail);
router.put('/change-default-password', accountController.changeDefaultPassword);
router.put('/change-password', accountController.changePassword);
router.put('/reset-password/:id', verifyTokenAPIAdmin, accountController.resetPassword);
router.put('/lock', verifyTokenAPIAdmin, accountController.lockAccount);
router.put('/change-avatar/:id', upload.single("file"), accountController.changeAvatar);
router.delete('/:id', verifyTokenAPIAdmin, accountController.deleteAccount);

module.exports = router;
