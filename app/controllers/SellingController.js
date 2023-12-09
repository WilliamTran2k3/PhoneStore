const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const pdf = require('pdf-creator-node');
const path = require('path');
const fs = require("fs");


class SellingController {
	homePage(req, res) {
		const user = req.session.user;
		res.render('selling', {
			layout: 'layout',
			title: 'Bán hàng',
			user
		})
	}
	checkoutPage(req, res) {
		const user = req.session.user;
		res.render('checkout', {
			layout: 'layout',
			title: 'Thanh toán',
			user
		})
	}
	async checkout(req, res) {
		try {
			const user = req.session.user;
			const { total, moneyGiven, moneyBack, orderDetails, isNew, phone, address, name } = req.body;
			var newOrder = null;
			if (isNew) {
				const newCustomer = await new Customer({ name, phone, address }).save();
				newOrder = await new Order({
					total: total, moneyGiven: moneyGiven,
					moneyBack: moneyBack, customer: newCustomer._id,
					user: user._id, orderDetails: orderDetails
				}).save();
				newCustomer.orders.push(newOrder);
				await newCustomer.save();
				await User.findByIdAndUpdate(user._id, { $push: { orders: newOrder._id } });
			} else {
				const customer = await Customer.findOne({ phone: phone }).lean();
				newOrder = await new Order({
					total: total, moneyGiven: moneyGiven,
					moneyBack: moneyBack, customer: customer._id,
					user: user._id, orderDetails: orderDetails
				}).save();
				await Customer.findByIdAndUpdate(customer._id, { $push: { orders: newOrder._id } });
				await User.findByIdAndUpdate(user._id, { $push: { orders: newOrder._id } });
			}
			return res.status(200).json(newOrder);
		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}
	async detailOrder(req, res) {
		try {
			const id = req.params.id;
			const order = await Order.findById(id).lean();
			var orderDetails = order.orderDetails;
			for (let i = 0; i < orderDetails.length; i++) {
				const productId = orderDetails[i].product;
				const productDetails = await Product.findById(productId).lean();
				order.orderDetails[i].product = productDetails;
			}

			return res.status(200).json(orderDetails);

		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}

	async customerPaging(req, res) {
		try {
			const { id, page } = req.params;
			const pageSize = 5;
			const orders = await Order.find({ customer: id }).sort({ dateCheckout: -1 })
				.skip((page - 1) * pageSize)
				.limit(pageSize).lean();
			let ordersNum = await Order.countDocuments({ customer: id });
			if (ordersNum < 2) {
				ordersNum++;
			}
			const pageNum = Math.ceil((ordersNum - 1) / pageSize);
			console.log(pageNum)
			return res.status(200).json({ orders, page, pageNum });
		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}

	async printInvoice(req, res) {
		try {
			const html = fs.readFileSync(path.join(__dirname, '../views/invoice/invoice.html'), 'utf8');
			const id = req.params.id;
			const order = await Order.findById(id).populate(['customer', 'user']).lean();
			const productIds = [];
			order.orderDetails.forEach(detail => {
				productIds.push(detail.product);
			});

			const products = await Product.find({ _id: { $in: productIds } }).lean();
			const date = new Date(order.dateCheckout);
			const options = {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			};
			// Chuyển múi giờ từ UTC sang múi giờ Việt Nam (UTC+7)
			const vietnamTime = date.toLocaleString("vi-VN", options);
			console.log(vietnamTime);
			order.dateCheckout = vietnamTime;
			order.total = order.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
			order.moneyGiven = order.moneyGiven.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
			order.moneyBack = order.moneyBack.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
			order.orderDetails.forEach((detail, index) => {
				const product = products.find(product => product._id.toString() === detail.product.toString());
				if (product) {
					detail.price = detail.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
					detail.product = product;
					detail.detailTotal = (product.retailPrice * detail.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
					detail.index = index + 1;
				}
			});
			const filePath = 'invoice.pdf';
			console.log(order)
			const document = {
				html: html,
				data: {
					order: order
				},
				path: filePath
			};
			pdf.create(document)
				.then(result => {
					

					// Đọc tệp PDF và gửi về client
					const fileStream = fs.createReadStream(filePath);

					res.setHeader('Content-Type', 'application/pdf');
					fileStream.pipe(res); // Gửi file PDF bằng stream

					fileStream.on('close', () => {
						fs.unlinkSync(filePath); // Xóa tệp PDF sau khi gửi đi xong
					});
				})
				.catch(err => {
					console.error(err);
				})
		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}
}

module.exports = new SellingController;