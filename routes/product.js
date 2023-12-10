const express = require('express');
const router = express.Router();
const upload = require('../app/middlewares/upload');
const productController = require('../app/controllers/ProductController');
const { verifyToken, verifyTokenAPI, verifyTokenAPIAdmin } = require('../app/middlewares/verifyToken');
const { checkChangePassword } = require("../app/middlewares/changePassword");

// Thêm sửa xóa phone
router.get('/', verifyToken, checkChangePassword, productController.homePage);
router.post('/', verifyTokenAPIAdmin, upload.array('files', 10), productController.addNew);
router.put('/:id', verifyTokenAPIAdmin, upload.single('file'), productController.editPhone);
router.delete('/:id', verifyTokenAPIAdmin, productController.deletePhone);
router.get('/search', productController.search);
router.get('/getAll', productController.getAll);
router.get('/page/:page/:idCategory', productController.getByPage);
router.post('/getAllByIds', productController.getPhoneByIds);
// Xuất barcode
// router.get('/exportBarcode', verifyTokenAPIAdmin, productController.exportBarcodes);
router.get('/exportBarcode', verifyTokenAPIAdmin, productController.exportBarcodesTest);
router.get('/:id', productController.getOne);

// Liên quan đến category
router.get('/filterByCategory/:id', productController.filterPhone);

module.exports = router;
