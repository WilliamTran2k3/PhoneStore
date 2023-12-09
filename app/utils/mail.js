const nodemailer = require('nodemailer');
const exphbs = require('express-handlebars');
const nodemailerhbs = require('nodemailer-express-handlebars');
require('dotenv').config();

exports.sendMailToUser = async (user) => {
	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS
		}
	});

	const hbs = exphbs.create({
		extname: '.hbs', 
		defaultLayout: false,
	});

	// Template Handlebars cho email body
	transporter.use('compile', nodemailerhbs({
		viewEngine: hbs,
		viewPath: 'app/views/mails',
		extName: '.hbs',
	}));

    const mailOptions = {
        from: '"Coding Duo" <trantanthanh2k3lop12@gmail.com>',
        to: user.email,
        subject: "[Coding Duo] Đăng nhập vào tài khoản nhân viên của bạn",
        template: "verifyEmail",
        context: { token: user.emailToken },
    };

    await transporter.sendMail(mailOptions);
};
