const bcrypt = require('bcryptjs');
const User = require("../models/User");
const { ROLES } = require('../constants');

const seedDB = async () => {
    try {
        const existingUser = await User.findOne({ username: 'admin' });
        if (existingUser) {
            console.log('Admin already existed');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin', salt);

        const user = new User({
            email: null,
            username: 'admin',
            fullname: 'admin',
            password: hash,
            role: ROLES.Admin,
            verified: true,
        });

        await user.save();
        console.log('Admin created');
    } catch (err) {
        console.log(err);
    }
}

module.exports = { seedDB }
