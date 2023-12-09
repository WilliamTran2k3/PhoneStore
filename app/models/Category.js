const Mongoose = require('mongoose');

const { Schema } = Mongoose;

// Category Schema
const CategorySchema = new Schema({
	name: {
		type: String
	},
	products: [{
		type: Schema.Types.ObjectId,
		ref: 'Product',
	}]
}, { timestamps: true });

module.exports = Mongoose.model('Category', CategorySchema);