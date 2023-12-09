const Mongoose = require('mongoose');

const { ROLES } = require('../constants');

const { Schema } = Mongoose;

// User Schema
const UserSchema = new Schema({
	email: {
		type: String,
	},
	username: {
		type: String
	},
	fullname: {
		type: String
	},
	password: {
		type: String
	},
	avatar: {
		type: String,
		default: 'user.jpg'
	},
	role: {
		type: String,
		default: ROLES.Staff,
		enum: [ROLES.Admin, ROLES.Staff]
	},
	locked: {
		type: Boolean,
		default: false
	},
	verified: {
		type: Boolean,
		default: false
	},
	emailToken: {
        type: String,
    },
	orders: [{
		type: Schema.Types.ObjectId,
		ref: 'Order',
	}]
}, { timestamps: true });

module.exports = Mongoose.model('User', UserSchema);