'use strict';

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const	del = require('del');
const	browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const flatten = require('gulp-flatten');

var path = {
  build: {
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/images/',
    fonts: 'build/fonts/'
  },
  src: {
    style: 'src/sass/style.scss',
    pug: 'src/pages/*.pug',
    img: 'src/blocks/**/*.{png,jpg,jpeg,svg,gif}'
  },
  watch: {
    style: 'src/**/*.scss',
    pug: 'src/**/*.pug',
    img: 'src/blocks/**/*.{png,jpg,jpeg,svg,gif}'
  },
  clean: './build'
};

var plumberCfg = {
  errorHandler: notify.onError(function(err) {
    return {
      message: err.message 
    }
  })
};

gulp.task('sass', function(){
	return gulp.src(path.src.style)
    .pipe(plumber(plumberCfg))
		.pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))	       
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.build.css))
});

gulp.task('pug', function(){
  return gulp.src(path.src.pug)
    .pipe(plumber(plumberCfg))
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(path.build.html));
});

gulp.task('images', function(){
  return gulp.src(path.src.img)
    .pipe(flatten())
    //.pipe(imagemin())
    .pipe(gulp.dest(path.build.img))
});

gulp.task('resources-js', function(){
  return gulp.src('src/resources/js/*.js')
    .pipe(gulp.dest(path.build.js))
});

gulp.task('resources-css', function(){
  return gulp.src('src/resources/css/*.css')
    .pipe(gulp.dest(path.build.css))    
});

gulp.task('resources-fonts', function(){
  return gulp.src('src/resources/fonts/*.{eot,svg,ttf,woff,woff2,otf}')
    .pipe(gulp.dest(path.build.fonts))
});


gulp.task('clean', function(){
	return del('build/**/*');
});

gulp.task('watch', function(){
  gulp.watch(path.watch.style, gulp.series('sass'));
  gulp.watch(path.watch.pug, gulp.series('pug'));
	gulp.watch(path.watch.img, gulp.series('images'));
});

gulp.task('server', function(){
	browserSync.init({
		server: path.build.html
	});

	browserSync.watch(path.build.html+'/**/*.*').on('change', browserSync.reload);
});

gulp.task('default', gulp.series(
	'clean',
  'sass',
	'pug',
  'images',
  'resources-js',
  'resources-css',
  'resources-fonts',
	gulp.parallel(
		'watch',
		'server'
	)	
));