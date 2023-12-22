const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const { sendMailToUser } = require("../utils/mail");
const { ROLES } = require('../constants');
const Order = require("../models/Order");

class AccountController {
    async accountsPage(req, res) {
        const user = req.session.user;
        if (user.role !== ROLES.Admin) {
            return res.redirect("/");
        }
        const users = await User.find({ role: ROLES.Staff })
            .sort({ _id: -1 })
            .limit(10)
            .lean();
        const usersNum = await User.countDocuments();
        let pageNum = Math.ceil((usersNum-1)/10);
        if (pageNum == 0) {
            pageNum++;
        }
        return res.render('accounts', {
            layout: 'layout',
            title: 'Quản lý nhân viên',
            user,
            users,
            pageNum,
        });
    }

    async profile(req, res) {
        const user = req.session.user;
        const orders = await Order.find({ user: user._id })
            .populate("customer")
            .populate("orderDetails.product")
            .sort({ createdAt: 'desc' })
            .limit(10)
            .lean();
        const ordersNum = await Order.countDocuments({ user: user._id });
        let pageNum = Math.ceil(ordersNum/10);
        if (pageNum == 0) {
            pageNum++;
        }
        return res.render('userDetail', {
            layout: 'layout',
            title: 'Thông tin tài khoản',
            user,
            staff: user,
            orders,
            pageNum,
        });
    }

    async accountDetailPage(req, res) {
        const user = req.session.user;
        const staffId = req.params.id;
        if (user.role !== ROLES.Admin) {
            return res.redirect("/");
        }
        const staff = await User.findById(staffId)
            .lean();

        const orders = await Order.find({ user: staffId })
            .populate("customer")
            .populate("orderDetails.product")
            .sort({ createdAt: 'desc' })
            .limit(10)
            .lean();
            const ordersNum = await Order.countDocuments({ user: staffId });
        let pageNum = Math.ceil(ordersNum/10);
        if (pageNum == 0) {
            pageNum++;
        }
        return res.render('userDetail', {
            layout: 'layout',
            title: 'Chi tiết nhân viên',
            user,
            staff,
            orders,
            pageNum,
        });
    }

    async pagination(req, res) {
        const page = req.params.page;
        const users = await User.find({ role: ROLES.Staff })
            .sort({ _id: -1 })
            .skip((page - 1) * 10)
            .limit(10)
            .lean();
        const usersNum = await User.countDocuments();
        let pageNum = Math.ceil((usersNum-1)/10);
        if (pageNum == 0) {
            pageNum++;
        }
        return res.status(200).json({ users, page, pageNum });
    }

    async orderPagination(req, res) {
        const id = req.params.id;
        const page = req.params.page;
        const orders = await Order.find({ user: id })
            .populate("customer")
            .populate("orderDetails.product")
            .sort({ createdAt: 'desc' })
            .skip((page - 1) * 10)
            .limit(10)
            .lean();
        const ordersNum = await Order.countDocuments({ user: id });
        let pageNum = Math.ceil(ordersNum/10);
        if (pageNum == 0) {
            pageNum++;
        }
        return res.status(200).json({ orders, page, pageNum });
    }

    async search(req, res) {
        const fullname = req.query.fullname;
        const users = await User.find({ fullname: { $regex: fullname, $options: 'i' }, role: ROLES.Staff })
            .sort({ _id: -1 })
            .lean();
        const usersNum = await User.countDocuments();
        let pageNum = Math.ceil((usersNum-1)/10);
        if (pageNum == 0) {
            pageNum++;
        }
        return res.status(200).json({ users, pageNum });
    }

    async addAccount(req, res) {
        const { fullname, email } = req.body;
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ error: "Email đã được đăng ký" });
        }
        const username = email.split('@')[0];
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(username, salt);
        const newUser = new User({
            email: email,
            username: username,
            fullname: fullname,
            password: hash,
            role: ROLES.Staff,
            emailToken: crypto.randomBytes(64).toString("hex"),
        });
        sendMailToUser(newUser);
        const savedUser = await newUser.save();
        const userObj = savedUser.toObject();
        delete userObj.password;
        const usersNum = await User.countDocuments();
        const pageNum = Math.ceil((usersNum-1)/10);
        return res.status(201).json({ userObj, pageNum});
    }

    async resendEmail(req, res) {
        const email = req.body.email;
        const user = await User.findOne({ email: email });
        if (user) {
            user.emailToken = crypto.randomBytes(64).toString("hex");
            sendMailToUser(user);
            const updatedUser = await user.save();
            const userObj = updatedUser.toObject();
            delete userObj.password;
            return res.status(200).json(userObj);
        } else {
            return res.status(404).json("Email không được đăng ký");
        }
    }

    async changeDefaultPassword(req, res) {
        const userId = req.body.userId;
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        await User.findByIdAndUpdate(userId, { password: hash });
        return res.status(200).json({ success: "Đổi mật khẩu thành công" });
    }

    async resetPassword(req, res) {
        const id = req.params.id;
        const user = await User.findById(id);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.username, salt);
        user.password = hash;
        await user.save();
        return res.status(200).json({ success: "Đặt lại mật khẩu thành công" });
    }

    async lockAccount(req, res) {
        const userId = req.body.userId;
        const locked = req.body.locked;
        const user = await User.findByIdAndUpdate(userId, { locked: locked });
        if (locked) {
            return res.status(200).json({ success: "Đã khóa tài khoản "+user.fullname });
        } else {
            return res.status(200).json({ success: "Đã mở khóa tài khoản "+user.fullname });
        }
    }

    async changePassword(req, res) {
        const userId = req.body.userId;
        const oldpassword = req.body.oldpassword;
        const newpassword = req.body.newpassword;
        const user = await User.findById(userId);
        const isMatch = bcrypt.compareSync(oldpassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Mật khẩu cũ sai" });
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newpassword, salt);
        user.password = hash;
        await user.save();
        return res.status(200).json({ success: "Đổi mật khẩu thành công" });
    }

    async changeAvatar(req, res) {
        try {
            const file = req.file;
            const userSession = req.session.user;
            const user = await User.findById(userSession._id);
            console.log(user);
            console.log(file.filename);
            if (user.avatar != 'user.jpg') {
                const folderPath = path.join(__dirname, '..', '..', '/public/images/profile');
                const filePath = path.join(folderPath, user.avatar);
                fs.unlinkSync(filePath);
            }
            user.avatar = file.filename;
            await user.save();
            return res.status(200).json({ success: file.filename });
        } catch (err) {
            console.error(err);
            return res.status(200).json({ error: err });
        }
    }

    async deleteAccount(req, res) {
        const userId = req.params.id;
        let page = req.params.page;
        const user = await User.findById(userId);
        const name = user.fullname;
        if (user.avatar != 'user.jpg') {
            const folderPath = path.join(__dirname, '..', '..', '/public/images/profile');
            const filePath = path.join(folderPath, user.avatar);
            fs.unlinkSync(filePath);
        }
        await user.deleteOne();
        let users = await User.find({ role: ROLES.Staff })
            .sort({ _id: -1 })
            .skip((page - 1) * 10)
            .limit(10)
            .lean();
        if (users.length == 0) {
            page--;
            users = await User.find({ role: ROLES.Staff })
            .sort({ _id: -1 })
            .skip((page - 1) * 10)
            .limit(10)
            .lean();
        }
        const usersNum = await User.countDocuments();
        let pageNum = Math.ceil((usersNum-1)/10);
        if (pageNum == 0) {
            pageNum++;
        }
        return res.status(200).json({ success: "Đã xóa tài khoản nhân viên "+name, users, page, pageNum });
    }
}

module.exports = new AccountController;
