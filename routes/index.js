const authRouter = require('./auth');
const accountRouter = require('./account');
const productRouter = require('./product');
const customerRouter = require('./customer');
const sellingRouter = require('./selling');
const statisticsRouter = require('./statistics');
const categoryRouter = require('./category');
function route(app) {
    app.use('/', authRouter);
    app.use('/account', accountRouter);
    app.use('/product', productRouter);
    app.use('/customer', customerRouter);
    app.use('/selling', sellingRouter);
    app.use('/statistics', statisticsRouter);
    app.use('/category', categoryRouter);
    app.use(function (req, res, next) {
        res.render('error', {
            title: 'Trang không tìm thấy',
            content: '404 - Trang không tồn tại',
            desc: 'Trang bạn đang tìm không tồn tại. Quay về trang chủ'
        })
    });

    // Middleware bắt lỗi 500
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.render('error', {
            title: 'Lỗi',
            content: '500 - Lỗi server',
            desc: 'Lỗi server. Quay về trang chủ'
        })
    });
}

module.exports = route;