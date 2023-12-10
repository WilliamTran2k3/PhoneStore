const Category = require('../models/Category');
const Product = require('../models/Product');
class CategoryController {
	async home(req, res) {
		try {
			const user = req.session.user;
			const categories = await Category.find().lean();
			res.render('category', {
				title: 'Quản lý danh mục',
				layout: 'layout',
				user,
				categories
			});
		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}
	async addCategory(req, res) {
		try {
			const categories = await Category.find().lean();
			const name = req.body.name;
			const index = categories.findIndex(c => c.name === name);
			if (index !== -1) {
				return res.status(400).json('Trùng tên');
			}
			const category = await new Category({ name }).save();
			res.status(200).json(category);
		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}

	async removeCategory(req, res) {
		try {
			const id = req.params.id;
			const products = await Product.find({ category: id }).lean();
			console.log(products)
			if (products.length > 0) {
				return res.status(400).json("Bad request");
			}
			await Category.findByIdAndDelete(id);
			return res.status(204).json("Delete successfully");
		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}

	async updateCategory(req, res) {
		try {
			const name = req.body.name;
			const id = req.params.id;
			const categories = await Category.find().lean();
			const index = categories.findIndex(c => c.name === name);
			if (index !== -1) {
				return res.status(400).json('Trùng tên');
			}
			const category = await Category.findByIdAndUpdate(id, { name }, { new: true }).lean();
			res.status(200).json(category);
		} catch (err) {
			console.error(err);
			res.status(500).json(err);
		}
	}
}



module.exports = new CategoryController;