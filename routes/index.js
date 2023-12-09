const authRouter = require('./auth');
const accountRouter = require('./account');
const productRouter = require('./product');
const customerRouter = require('./customer');
const sellingRouter = require('./selling');
const statisticsRouter = require('./statistics');
function route(app) {
    app.use('/', authRouter);
    app.use('/account', accountRouter);
    app.use('/product', productRouter);
    app.use('/customer', customerRouter);
    app.use('/selling', sellingRouter);
    app.use('/statistics', statisticsRouter);
}

module.exports = route;