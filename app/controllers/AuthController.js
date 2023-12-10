// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const User = require("../models/User");

class AuthController {
    // GET /
    home(req, res, next) {
        const user = req.session.user;
        return res.render('index', {
            layout: 'layout',
            title: 'Coding Duo',
            user 
        });
    }

    // GET /login
    login(req, res, next) {
        let token = req.cookies.jwt;
        if (token) {
            res.redirect('/');
        } else {
            res.render('login');
        }
    }

    // POST /login
    async doLogin(req, res, next) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username: username });
            if (!user) {
                return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu sai' });
            }
            if (!user.verified) {
                return res.status(403).json({ error: 'Xin hãy đăng nhập lần đầu qua email' });
            }
            if (user.locked == true) {
                return res.status(403).json({ error: 'Tài khoản này đã bị khóa' });
            }
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    res.status(500).json(err);
                }
                if (isMatch) {
                    // const userObj = user.toObject();
                    // delete userObj.password;
                    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
                    res.cookie('jwt', token, { maxAge: 60 * 60 * 1000, httpOnly: false });
                    return res.status(200).json({ success: 'Đăng nhập thành công' });
                } else {
                    return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu sai' });
                }
            });
            
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    }

    // GET /logout
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Lỗi khi xóa session: ' + err);
            }
        });
        res.clearCookie('jwt');
        res.redirect('/login');
    }

    async verifyEmail(req, res) {
        const token = req.query.token;
        const user = await User.findOne({ emailToken: token });
        if (user) {
            const expirationTime = 60 * 1000;
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - user.updatedAt.getTime();
            if (timeDiff > expirationTime) {
                user.emailToken = null;
                await user.save();
                return res.render("invalidEmailVerify");
            } else {
                user.verified = true;
                user.emailToken = null;
                const savedUser = await user.save();
                const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET);
                res.cookie('jwt', token, { maxAge: 60 * 60 * 1000, httpOnly: false });
                return res.redirect("/");
            }
        } else {
            return res.render("invalidEmailVerify");
        }
    }

    // GET /register
    register(req, res, next) {
        res.render('register');
    }
}

module.exports = new AuthController;