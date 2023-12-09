const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Phone Schema
const ProductSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	category : {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		default: null
	},
	isPhone: {
		type: Boolean,
		default: true
	},
	color: String,
	ram: Number,
	rom: Number,
	price: Number,
	retailPrice: Number,
	image: String,
	barcode: Buffer,
}, { timestamps: true });

module.exports = Mongoose.model('Product', ProductSchema);
