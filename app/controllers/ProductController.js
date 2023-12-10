const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class ProductController {
	async homePage(req, res) {
		const user = req.session.user;
		const typeRender = req.query.accessory;
		var isPhone = true;
		var pageRender = 'phone';
		var title = 'Điện thoại';
		if (typeRender) {
			isPhone = false;
			pageRender = 'accessory';
			title = 'Phụ kiện';
		}
		const product = await Product.find({ isPhone: isPhone }).limit(8).lean();
		var numProduct = await Product.countDocuments({ isPhone: isPhone });
		
		const pageNum = Math.ceil((numProduct) / 8);
		const category = await Category.find().lean();
		return res.render(pageRender, {
			layout: 'layout',
			category,
			product,
			title,
			user,
			pageNum
		});
	}

	async addNew(req, res) {
		try {
			const accessory = req.query.accessory;
			if (accessory) {
				const { name, category, price, retailPrice, image } = req.body;
				const savedAccessory = await new Product({ name, category, price, retailPrice, isPhone: false, image }).save();
				const barcodeData = savedAccessory._id.toString();
				bwipjs.toBuffer({
					bcid: 'code128',
					text: barcodeData,
					scale: 3,
					height: 10,
					includetext: true,
					textxalign: 'center',
				}, async (err, png) => {
					if (err) {
						console.error(err);
					} else {
						// Lưu hình ảnh mã vạch vào sản phẩm
						savedAccessory.barcode = png;

						await savedAccessory.save();
					}
				});
				res.status(201).json(savedAccessory);
			} else {
				var phones = req.body.phones;
				phones = JSON.parse(phones);

				const newPhones = [];
				const promises = phones.map(async (phoneData) => {
					const newPhone = new Product(phoneData);

					// Lưu newPhone vào cơ sở dữ liệu để có _id duy nhất và trả về savedPhone
					return await newPhone.save();
				});

				const savedPhones = await Promise.all(promises);

				const barcodePromises = savedPhones.map(async (savedPhone) => {
					const barcodeData = savedPhone._id.toString(); // Chuyển _id thành chuỗi để tạo mã vạch

					// Tạo mã vạch từ _id
					return new Promise((resolve, reject) => {
						bwipjs.toBuffer({
							bcid: 'code128', // Loại mã vạch
							text: barcodeData, // Dữ liệu mã vạch
							scale: 3, // Tỉ lệ
							height: 10, // Chiều cao
							includetext: true, // Bao gồm văn bản trong mã vạch
							textxalign: 'center', // Canh giữa văn bản
						}, (err, png) => {
							if (err) {
								console.error(err);
								reject(err);
							} else {
								resolve({ savedPhone, png });
							}
						});
					});
				});

				const barcodeResults = await Promise.all(barcodePromises);

				for (const { savedPhone, png } of barcodeResults) {
					// Lưu hình ảnh mã vạch vào savedPhone
					savedPhone.barcode = png;

					// Lưu lại savedPhone có chứa barcode vào cơ sở dữ liệu
					await savedPhone.save();

					// Thêm savedPhone vào mảng newPhones
					newPhones.push(savedPhone);
				}

				res.status(201).json(newPhones);
			}

		} catch (err) {
			console.error(err);
			res.status(500).json({ error: err });
		}
	}
	async editPhone(req, res) {
		try {
			const id = req.params.id;

			const { name, category, color, ram, rom, price, retailPrice, imageName } = req.body;
			var updates = {};
			if (req.file) {
				updates = { name, category, color, ram, rom, price, retailPrice, image: imageName };
			} else {
				updates = { name, category, color, ram, rom, price, retailPrice };
			}
			const updatePhone = await Product.findByIdAndUpdate(id,
				updates,
				{ new: true }
			);
			res.status(200).json(updatePhone);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: err });
		}
	}

	async deletePhone(req, res) {
		try {
			const id = req.params.id;
			const order = await Order.findOne({ 'orderDetails.product': id }).lean();
			if (order) {
				return res.status(400).json("Cannot delete phone because it already exists in order details");
			}
			await Product.findByIdAndRemove(id);
			res.status(204).send();
		} catch (err) {
			console.error(err);
			res.status(500).json({ err: err });
		}
	}

	async search(req, res) {
		try {
			const user = req.session.user;
			const keyword = req.query.keyword;
			const phones = await Product.find({ name: { $regex: keyword, $options: 'i' } }).lean();
			res.render('search', {
				layout: 'layout',
				phones,
				keyword,
				user,
				title: 'Kết quả tìm kiếm',
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: err });
		}
	}

	async getAll(req, res) {
		try {
			const accessory = req.query.accessory;
			var isPhone = true;
			if(accessory) {
				isPhone = false;
			}
			const phones = await Product.find({ isPhone: isPhone }).lean();
			return res.status(200).json(phones);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: err });
		}
	}

	async getOne(req, res) {
		try {
			const id = req.params.id;
			const phone = await Product.findById(id).lean();
			return res.status(200).json(phone);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: err });
		}
	}

	// Liên quan category
	async filterPhone(req, res) {
		try {
			const idCategory = req.params.id;
			const accessory = req.query.accessory;
			var isPhone = true;
			if(accessory) {
				isPhone = false;
			}
			var phones;
			if (idCategory != 'undefined') {
				phones = await Product.find({ category: idCategory, isPhone: isPhone }).lean();
			} else {
				phones = await Product.find({ isPhone: isPhone }).lean();
			}
			res.status(200).json(phones);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: err });
		}
	}

	async exportBarcodes(req, res) {
		try {
			const accessory = req.query.accessory;
			var isPhone = true;
			if(accessory) {
				isPhone = false;
			}
			// Lấy danh sách điện thoại từ cơ sở dữ liệu
			const products = await Product.find({ isPhone: isPhone });
			console.log(products);
			const directory = isPhone ? path.join(__dirname, '../barcodes/phone/') : path.join(__dirname, '../barcodes/accessory/');
			if (!fs.existsSync(directory)) {
				fs.mkdirSync(directory);
			}

			products.forEach((product) => {
				const barcodeImage = product.barcode;

				if (barcodeImage) {
					var name;
					if(isPhone) {
						name = `${product.name} ${product.color} ${product.ram}GB ${product.rom}GB`;
					} else {
						name = product.name;
					}
					const imagePath = path.join(directory, `${name.replace(/ /g, '_')}.png`);
					fs.writeFileSync(imagePath, barcodeImage, { encoding: 'base64' });
				}
			});

			res.status(200).json({ message: 'Lấy hình ảnh mã vạch hoàn thành.' });
		} catch (err) {
			console.error('Lỗi khi lấy hình ảnh mã vạch:', err);
			res.status(500).json({ error: err });
		}
	};

	async exportBarcodesTest(req, res) {
		try {
			const accessory = req.query.accessory;
			const isPhone = !accessory;

			const products = await Product.find({ isPhone });

			const archive = archiver('zip', {
				zlib: { level: 9 } // Mức độ nén 
			});

			// Pipe file ZIP vào response
			archive.pipe(res);

			products.forEach((product, index) => {
				const barcodeImage = product.barcode;

				if (barcodeImage) {
					const buffer = Buffer.from(barcodeImage, 'base64');
					let name = product.name;

					if (isPhone) {
						name = `${product.name}_${product.color}_${product.ram}GB_${product.rom}GB`;
					}

					// Thêm tệp tin vào file ZIP
					archive.append(buffer, { name: `${name}.png` });
				}
			});

			// Kết thúc file ZIP và gửi cho người dùng
			archive.finalize();

			// Đặt header cho response là file ZIP
			var zipName = isPhone ? 'barcodes_phone.zip' : 'barcodes_accessory.zip';
			res.attachment(zipName);
			res.status(200);
		} catch (err) {
			console.error('Lỗi khi lấy hình ảnh mã vạch:', err);
			res.status(500).json({ error: err });
		}
	}


	async getPhoneByIds(req, res) {
		try {
			const ids = req.body;
			const phones = await Product.find({ _id: { $in: ids } }).lean();
			return res.status(200).json(phones);
		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}
	async getByPage(req, res) {
		try {
			const accessory = req.query.accessory;
			var isPhone = true;
			if(accessory) {
				isPhone = false;
			}
			const { page, idCategory } = req.params;
			console.log(idCategory)
			const filter = idCategory != -1 ? {
				isPhone: isPhone, category: idCategory 
			} : {
				isPhone: isPhone,
			}
			const phones = await Product.find(filter)
				.skip((page - 1) * 8)
				.limit(8)
				.lean();
			var phonesNum = await Product.countDocuments(filter);
			const pageNum = Math.ceil((phonesNum) / 8);
			return res.status(200).json({ phones, page, pageNum });
		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}
}

module.exports = new ProductController;