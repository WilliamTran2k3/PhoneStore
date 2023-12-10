const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ROLES } = require("../constants");

const verifyTokenAPIAdmin = async (req, res, next) => {
	try {
		let token = req.header("Authorization");
		if (!token) {
			return res.status(403).json({ error: "Quyền truy cập bị từ chối" });
		}
		if (token.startsWith("Bearer ")) {
			token = token.substring(7, token.length).trimLeft();
		}
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified;
		const user = await User.findById(verified.userId);
		if (user.role === ROLES.Admin) {
			next();
		} else {
			return res.status(403).json({ error: "Quyền truy cập bị từ chối" });
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const verifyTokenAPI = async (req, res, next) => {
	try {
		let token = req.header("Authorization");
		if (!token) {
			return res.status(403).json({ error: "Quyền truy cập bị từ chối" });
		}
		if (token.startsWith("Bearer ")) {
			token = token.substring(7, token.length).trimLeft();
		}
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified;
		next();
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const verifyToken = async (req, res, next) => {
	try {
		let token = req.cookies.jwt;

		if (!token) {
			// return res.status(403).send("Access Denied");
			return res.redirect('/login');
		}
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified;
		const user = await User.findById(verified.userId);
		if (user.locked == true) {
			req.session.destroy((err) => {
				if (err) {
					console.error('Lỗi khi xóa session: ' + err);
				}
			});
			res.clearCookie('jwt');
			return res.redirect('/login');
		}
		const userObj = user.toObject();
		delete userObj.password;
		req.session.user = userObj;
		next();
	} catch (err) {
		return res.redirect('/login');
	}
};

const verifyTokenAdmin = async (req, res, next) => {
	try {
		let token = req.cookies.jwt;

		if (!token) {
			// return res.status(403).send("Access Denied");
			return res.redirect('/login');
		}
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified;
		const user = await User.findById(verified.userId);
		if (user.role != ROLES.Admin) {
			// req.session.destroy((err) => {
			// 	if (err) {
			// 		console.error('Lỗi khi xóa session: ' + err);
			// 	}
			// });
			// res.clearCookie('jwt');
			return res.redirect('/');
		}
		const userObj = user.toObject();
		delete userObj.password;
		req.session.user = userObj;
		next();
	} catch (err) {
		return res.redirect('/login');
	}
};

module.exports = {
	verifyTokenAPIAdmin,
	verifyTokenAPI,
	verifyToken,
	verifyTokenAdmin,
};
