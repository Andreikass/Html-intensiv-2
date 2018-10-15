var gulp = require('gulp'),
	svgSprite = require('gulp-svg-sprites'),
	svgmin = require('gulp-svgmin'),
	cheerio = require('gulp-cheerio'),
	replace = require('gulp-replace'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	pug = require('gulp-pug'),
	sass = require('gulp-sass'),
	imagemin = require('gulp-imagemin'),
	del = require('del'),
	flatten = require('gulp-flatten'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	runSequence = require('run-sequence'),
	browserSync = require('browser-sync').create(),
	autoprefixer = require('gulp-autoprefixer'),
	reload = browserSync.reload;

var params = {
	out: 'build',
	images: 'build/images',
	js: 'build/js',
	css: 'build/css',
	fonts: 'build/fonts'
}

//gulp.task('default', ['pug', 'sass', 'resources-js', 'resources-css', 'resources-fonts', 'images', 'js', 'server']);

gulp.task('default', function(callback) {
	runSequence('clean', 'pug', 'sass', 'resources-js', 'resources-css', 'resources-fonts', 'svgSpriteBuild', 'images', 'js', 'server', callback);
});

var plumberCfg = {
  errorHandler: notify.onError({
    message: "Error: <%= error.message %>",
  })
};

gulp.task('svgSpriteBuild', function () {
	return gulp.src('src/resources/icons/*.svg')
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[style]').removeAttr('style');
			},
			parserOptions: { xmlMode: true }
		}))
		.pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
    	mode: "symbols",
    	preview: {
          sprite: "index.html"
      },
    }))
    .pipe(gulp.dest(params.images));
});

gulp.task('pug', function(){
	return gulp.src('src/pages/*.pug')
			.pipe(plumber(plumberCfg))
	    .pipe(pug({
	    	pretty: true
	    }))
	    .pipe(gulp.dest(params.out));
});

gulp.task('sass', function(){
	return gulp.src('src/sass/style.scss')
			.pipe(plumber(plumberCfg))
	    .pipe(sass())
	    .pipe(autoprefixer({
	        browsers: ['last 2 versions'],
	        cascade: false
	    }))	       
			.pipe(sass({outputStyle: 'compressed'}))
	    .pipe(gulp.dest(params.css))
});

gulp.task('resources-js', function(){
	return gulp.src('src/resources/js/*.js')
		.pipe(gulp.dest(params.js))
});

gulp.task('resources-css', function(){
	return gulp.src('src/resources/css/*.css')
		.pipe(gulp.dest(params.css))		
});

gulp.task('resources-fonts', function(){
	return gulp.src('src/resources/fonts/*.{eot,svg,ttf,woff,woff2,otf}')
		.pipe(gulp.dest(params.fonts))
});


gulp.task('images', function(){
	return gulp.src('src/blocks/**/*.{png,jpg,jpeg,svg,gif}')
		.pipe(flatten())
		.pipe(imagemin())
		.pipe(gulp.dest(params.images))
});

gulp.task('js', function(){
	gulp.src(['src/blocks/**/*.js'])
	.pipe(plumber(plumberCfg))
	.pipe(concat('script.js'))
	.pipe(gulp.dest(params.js))
	.pipe(reload({stream: true}));
});

gulp.task('server', function(){
	browserSync.init({
		server: params.out
	});

	gulp.watch('src/**/*.pug', ['pug']);
	gulp.watch('src/**/*.scss', ['sass']);
	gulp.watch('src/blocks/**/*.{png,jpg,jpeg,svg}', ['images']);
	gulp.watch('src/blocks/**/*.js', ['js']);
});

gulp.task('clean', function(){
	del('build/**/*');
});