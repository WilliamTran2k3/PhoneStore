const Customer = require('../models/Customer');
const Order = require('../models/Order');
const User = require('../models/User');

class CustomerController {
    async customersList(req, res) {
        const user = req.session.user;
        const customers = await Customer.find()
            .sort({ _id: -1 })
            .limit(15)
            .lean();

        const customersNum = await Customer.countDocuments();
        let pageNum = Math.ceil(customersNum/15);
        if (pageNum == 0) {
            pageNum++;
        }

        return res.render('customers', {
            title: 'Customers Information',
            layout: 'layout',
            user,
            customers,
            pageNum,
        })
    }

    async pagination(req, res) {
        const page = req.params.page;
        const customers = await Customer.find()
            .sort({ _id: -1 })
            .skip((page - 1) * 15)
            .limit(15)
            .lean();
        const customersNum = await Customer.countDocuments();
        let pageNum = Math.ceil(customersNum/15);
        if (pageNum == 0) {
            pageNum++;
        }
        return res.status(200).json({ customers, page, pageNum });
    }

    async search(req, res) {
        const phone = req.query.phone;
        const customers = await Customer.find({ phone: { $regex: phone, $options: 'i' } })
            .sort({ _id: -1 })
            .lean();
        const customersNum = await Customer.countDocuments();
        let pageNum = Math.ceil(customersNum/15);
        if (pageNum == 0) {
            pageNum++;
        }
        return res.status(200).json({ customers, pageNum });
    }

    async customerDetail(req, res) {
        const user = req.session.user;
        const phoneNumber = req.params.phone;
        const customer = await Customer.findOne({ phone: phoneNumber }).lean();
        const orders = await Order.find({ customer: customer._id })
            .populate("orderDetails.product")
            .sort({ createdAt: 'desc' })
            .limit(10)
            .lean();
        const ordersNum = await Order.countDocuments({ customer: customer._id });
        let pageNum = Math.ceil(ordersNum/10);
        if (pageNum == 0) {
            pageNum++;
        }
        return res.render('customerDetail', {
            title: 'Customer Information',
            layout: 'layout',
            user,
            customer,
            orders,
            pageNum,
        })
    }

    async orderPagination(req, res) {
        const id = req.params.id;
        const page = req.params.page;
        const orders = await Order.find({ customer: id })
            .populate("orderDetails.product")
            .sort({ createdAt: 'desc' })
            .skip((page - 1) * 10)
            .limit(10)
            .lean();
        const ordersNum = await Order.countDocuments({ customer: id });
        let pageNum = Math.ceil(ordersNum/10);
        if (pageNum == 0) {
            pageNum++;
        }
        return res.status(200).json({ orders, page, pageNum });
    }

    async getOne(req, res) {
        try {
            const phone = req.params.phone;
            const customer = await Customer.findOne({ phone: phone })
                                    .populate('orders').lean();
            return res.status(200).json(customer);
        } catch (err) {
            console.error(err);
            res.status(500).json({ err: err });
        }
    }
}

module.exports = new CustomerController;