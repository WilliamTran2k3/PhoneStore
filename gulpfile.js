const gulp = require('gulp');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const { src, series, parallel, dest, watch } = require('gulp');

const jsPath = [
	'public/libs/bootstrap/dist/js/bootstrap.bundle.min.js', 
	'public/libs/apexcharts/dist/apexcharts.min.js',
	'public/libs/simplebar/dist/simplebar.js',
	'public/js/app.min.js',
	'public/js/sidebarmenu.js',
	'public/js/header.js'
];
const cssPath = [
	'public/css/root.css',
	'public/css/phone.css'
];



function jsTask() {
	return src(jsPath)
		.pipe(sourcemaps.init())
		.pipe(concat('all.js'))
		.pipe(terser())
		.pipe(sourcemaps.write('.'))
		.pipe(dest('public/dist/assets/js'));
}

function cssTask() {
	return src(cssPath)
		.pipe(sourcemaps.init())
		.pipe(concat('all.css'))
		.pipe(postcss([autoprefixer(), cssnano()])) 
		.pipe(sourcemaps.write('.'))
		.pipe(dest('public/dist/assets/css'));
}

function watchTask() {
	watch([...cssPath, ...jsPath], { interval: 1000 }, parallel(cssTask, jsTask));
}

exports.default = series(
	parallel(jsTask, cssTask),
	watchTask
);