const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAPI } = require('../app/middlewares/verifyToken');
const { checkChangePassword } = require('../app/middlewares/changePassword');


const statisticsController = require('../app/controllers/StatisticsController');
router.get('/', verifyToken, checkChangePassword, statisticsController.homePage);
router.post('/dateToDate', verifyTokenAPI, statisticsController.statisticsByDate);
router.post('/dateToDatePaging/:pageNum', verifyTokenAPI, statisticsController.statisticsByDatePaging)
module.exports = router;