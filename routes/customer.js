const express = require('express');
const router = express.Router();
const { verifyToken } = require('../app/middlewares/verifyToken');

const customerController = require('../app/controllers/CustomerController');

router.get('/', verifyToken, customerController.customersList);
router.get('/:phone', verifyToken, customerController.customerDetail);
router.get('/getOne/:phone', customerController.getOne);
module.exports = router;
