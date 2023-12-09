

const Customer = require('../models/Customer');

class CustomerController {
    async customersList(req, res) {
        const user = req.session.user;
        const customers = await Customer.find()
            .sort({ phone: 'asc' })
            .lean();

        // const customersCount = await Customer.countDocuments();
        // console.log(customersCount);

        return res.render('customers', {
            title: 'Customers Information',
            layout: 'layout',
            user,
            customers,
        })
    }

    async customerDetail(req, res) {
        const user = req.session.user;
        const phoneNumber = req.params.phone;
        const customer = await Customer.findOne({ phone: phoneNumber })
            .populate({
                path: 'order',
                populate: {
                    path: 'orderDetail'
                }
            })
            .lean();

        return res.render('customerDetail', {
            title: 'Customer Information',
            layout: 'layout',
            user,
            customer,
        })
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