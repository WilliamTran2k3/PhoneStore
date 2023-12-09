const express = require('express');
const router = express.Router();
const { verifyToken, verifyTokenAPI } = require('../app/middlewares/verifyToken');


const statisticsController = require('../app/controllers/StatisticsController');
router.get('/', verifyToken, statisticsController.homePage);
router.post('/dateToDate', verifyTokenAPI, statisticsController.statisticsByDate);
router.post('/dateToDatePaging/:pageNum', verifyTokenAPI, statisticsController.statisticsByDatePaging)
module.exports = router;