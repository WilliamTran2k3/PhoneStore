const multer = require("multer");
/* FILE STORAGE */
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		let uploadPath = "public/images";

		if(req.body.type) {
			uploadPath += `/${req.body.type}`;
		}
		cb(null, uploadPath);
	},
	filename: function (req, file, cb) {
		const userId = req.params.id;
		var filename = null;
		if(req.body.type === 'profile') {
			filename = `${userId}_${file.originalname}`;
		} else {
			filename = file.originalname;
		}
		cb(null, filename);
	},
});
const upload = multer({ storage });
module.exports = upload;
