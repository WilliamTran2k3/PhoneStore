const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../constants");

const checkChangePassword = async (req, res, next) => {
    const sUser = req.session.user;
    const user = await User.findById(sUser._id);
    if (user.role === ROLES.Staff) {
        const isMatch = bcrypt.compareSync(user.username, user.password);
        if (isMatch) {
            return res.render("changePassword", {
                layout: 'layout',
                title: 'Đổi mật khẩu mặc định',
                user: sUser,
            });
        } else {
            next();
        }
    } else {
        next();
    }
    
}

module.exports = { checkChangePassword };