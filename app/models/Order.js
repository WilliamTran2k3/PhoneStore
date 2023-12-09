const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Order Schema
const OrderSchema = new Schema({
	total: {
		type: Number,
	},
	moneyGiven: {
		type: Number,
	},
	moneyBack: {
		type: Number,
	},
	dateCheckout: {
		type: Date,
		default: Date.now(),
	},
	customer: {
		type: Schema.Types.ObjectId,
		ref: 'Customer',
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	orderDetails: [{
		product: {
			type: Schema.Types.ObjectId,
			ref: 'Product',
		},
		price: Number,
		quantity: Number,
	}]
}, { timestamps: true });

module.exports = Mongoose.model('Order', OrderSchema);