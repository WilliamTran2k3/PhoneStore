const express = require('express');
const router = express.Router();
const { verifyToken } = require('../app/middlewares/verifyToken');
const { checkChangePassword } = require('../app/middlewares/changePassword');

const customerController = require('../app/controllers/CustomerController');

router.get('/', verifyToken, checkChangePassword, customerController.customersList);
router.get('/search', customerController.search);
router.get('/order/:id/page/:page', customerController.orderPagination);
router.get('/:phone', verifyToken, checkChangePassword, customerController.customerDetail);
router.get('/getOne/:phone', customerController.getOne);
router.get('/page/:page', customerController.pagination);
module.exports = router;
