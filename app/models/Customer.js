const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Customer Schema
const CustomerSchema = new Schema({
	phone: {
		type: String,
	},
	name: {
		type: String
	},
	address: {
		type: String
	},
	orders: [{
		type: Schema.Types.ObjectId,
		ref: 'Order',
	}],
}, { timestamps: true });

module.exports = Mongoose.model('Customer', CustomerSchema);