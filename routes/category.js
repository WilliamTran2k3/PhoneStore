const express = require('express');
const { verifyToken, verifyTokenAPIAdmin } = require('../app/middlewares/verifyToken');
const router = express.Router();

const categoryController = require('../app/controllers/CategoryController');

router.get('/', verifyToken, categoryController.home);
router.post('/', verifyTokenAPIAdmin, categoryController.addCategory);
router.delete('/:id', verifyTokenAPIAdmin, categoryController.removeCategory);
router.put('/:id', verifyTokenAPIAdmin, categoryController.updateCategory);

module.exports = router;
