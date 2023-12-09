const Order = require('../models/Order');
const Product = require('../models/Product');
class StatisticsController {
	homePage(req, res) {
		const user = req.session.user;
		return res.render('statistics', {
			layout: 'layout',
			title: 'Thống kê',
			user
		});
	}
	async statisticsByDate(req, res) {
		try {
			var { startDate, endDate } = req.body;
			// const startOfDay = new Date(startDate);
			// const endOfDay = new Date(endDate);

			// // Đặt giờ, phút, giây và millisecond cho ngày kết thúc
			// endOfDay.setHours(23, 59, 59, 999);
			startDate = new Date(startDate);
			endDate = new Date(endDate);
			// Chuyển về múi giờ 0
			const startOfDay = new Date(Date.UTC(
				startDate.getUTCFullYear(),
				startDate.getUTCMonth(),
				startDate.getUTCDate(),
				0, 0, 0, 0
			));
			startOfDay.setHours(startOfDay.getHours() - 7);
			const endOfDay = new Date(Date.UTC(
				endDate.getUTCFullYear(),
				endDate.getUTCMonth(),
				endDate.getUTCDate(),
				23, 59, 59, 999
			));
			endOfDay.setHours(endOfDay.getHours() - 7);


			console.log(startOfDay.toISOString(), endOfDay.toISOString());
			const orders = await Order.find({
				createdAt: {
					$gte: startOfDay.toISOString(),
					$lte: endOfDay.toISOString()
				}
			}).sort({ dateCheckout: -1 }).lean();
			// console.log(orders)
			const productIds = orders.reduce((ids, order) => {
				order.orderDetails.forEach(detail => {
					ids.push(detail.product);
				});
				return ids;
			}, []);

			const products = await Product.find({ _id: { $in: productIds } }).lean();
			let totalRevenue = 0;
			let totalProfit = 0;
			orders.forEach(order => {
				let profit = 0;
				order.orderDetails.forEach(detail => {
					const product = products.find(product => product._id.toString() === detail.product.toString());
					if (product) {
						detail.product = product;
					}
					profit += product.retailPrice - product.price;
				});
				totalProfit += profit;
				totalRevenue += order.total;
				order.profit = profit;
			});
			return res.status(200).json({ totalRevenue, totalProfit, orders });

		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}

	async statisticsByDatePaging(req, res) {
		try {
			const page = req.params.pageNum;
			const pageSize = 5;
			var { startDate, endDate } = req.body;
			// const startOfDay = new Date(startDate);
			// const endOfDay = new Date(endDate);

			// // Đặt giờ, phút, giây và millisecond cho ngày kết thúc
			// endOfDay.setHours(23, 59, 59, 999);
			startDate = new Date(startDate);
			endDate = new Date(endDate);
			// Chuyển về múi giờ 0
			const startOfDay = new Date(Date.UTC(
				startDate.getUTCFullYear(),
				startDate.getUTCMonth(),
				startDate.getUTCDate(),
				0, 0, 0, 0
			));
			startOfDay.setHours(startOfDay.getHours() - 7);
			const endOfDay = new Date(Date.UTC(
				endDate.getUTCFullYear(),
				endDate.getUTCMonth(),
				endDate.getUTCDate(),
				23, 59, 59, 999
			));
			endOfDay.setHours(endOfDay.getHours() - 7);

			const orders = await Order.find({
				dateCheckout: {
					$gte: startOfDay,
					$lte: endOfDay
				}
			})
				.sort({ dateCheckout: -1 })
				.skip((page - 1) * pageSize)
				.limit(pageSize).lean();
			var ordersNum = await Order.countDocuments({
				dateCheckout: {
					$gte: startOfDay,
					$lte: endOfDay
				}
			});
			if (ordersNum < 2) {
				ordersNum++;
			}
			const pageNum = Math.ceil((ordersNum - 1) / pageSize);
			console.log(pageNum);
			return res.status(200).json({ orders, page, pageNum });
		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}
}


module.exports = new StatisticsController;