"use strict";

const gulp = require('gulp'),
    posthtml = require('gulp-posthtml'),
    include = require('posthtml-include'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    csscomb = require('gulp-csscomb'),
    csso = require('gulp-csso'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    jpegoptim = require('imagemin-jpegoptim'),
    webp = require('imagemin-webp'),
    svgstore = require('gulp-svgstore'),
    svgMinify = require('gulp-svgmin'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    del = require('del'),
    browserSync = require('browser-sync').create();

const root = {
  src: 'src/',
  build: 'build/'
}    

const path = {
  src: {
    html: root.src + '*.html',
    css: root.src + '*.scss',
    js: root.src + 'scripts/**/*.js',
    img: root.src + 'images/',
    font: root.src + 'fonts/**/*.ttf',
    ico: root.src + 'icons/**/*.svg'
  },
  build: {
    html: root.build,
    css: root.build + 'styles/',
    js: root.build + 'scripts/',
    img: root.build + 'images/',
    font: root.build + 'fonts/',
    ico: root.build + 'icons/'
  },
  watch: {
    html: [
      root.src + 'markup/*.html',
      root.src + '*.html'
    ],
    css: [
      root.src + 'styles/blocks/*.scss',
      root.src + 'styles/common/*.scss',
      root.src + 'styles/helpers/*.scss'
    ],
    js: root.src + 'scripts/**/*.js',
    img: root.src + 'images/',
    font: root.src + 'fonts/**/*.ttf',
    ico: root.src + 'icons/**/*.svg'
  }
};

// Clean dir
function clean() {
  console.log('Очистка дериктории...');
  return del([
    'build/**',
    '!build',
    '!build/vendor/**'
  ]);
}

// Markup
function markup() {
  console.log('Компиляция HTML...');
  return gulp.src(path.src.html)
    .pipe(posthtml([ include() ]))
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream());
}

// Styles
function styles() {
  console.log('Компиляция CSS...');
  return gulp.src(path.src.css)
    .pipe(plumber())
    .pipe(scss())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(csscomb())
    .pipe(csso({ comments: false }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(path.build.css))
    .pipe(browserSync.stream());
}

// Scripts
function scripts() {
  console.log('Компиляция JS...');
  return gulp.src(path.src.js)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(path.build.js))
    .pipe(browserSync.stream());
}

//Fonts
function toWoff() {
  console.log('Конвертация ttf в woff...');
  return gulp.src(path.src.font)
    .pipe(ttf2woff())
    .pipe(gulp.dest(path.build.font))
    .pipe(browserSync.stream());
}

//Fonts
function toWoff2() {
  console.log('Конвертация ttf в woff2...');
  return gulp.src(path.src.font)
    .pipe(ttf2woff2())
    .pipe(gulp.dest(path.build.font))
    .pipe(browserSync.stream());
}

// Scripts
function images() {
  console.log('Оптимизация изображений...');
  return gulp.src(path.src.img + '**/*.{jpg,png,svg}')
    .pipe(imagemin([
      imagemin.optipng(),
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {removeTitle: true},
          {cleanupNumericValues:
            {floatPrecision: 0}
          }
        ]
      }),
      jpegoptim({
        max: 80,
        progressive: true
      })
    ]))
    .pipe(gulp.dest(path.build.img))
    .pipe(browserSync.stream());
}

// Webp
function toWebp() {
  console.log('Конвертирование изображений в формат WebP...');
  return gulp.src(path.src.img + '**/*.jpg')
    .pipe(imagemin([
      webp({ quality: 80 })
    ]))
    .pipe(rename({ extname: '.webp' }))
    .pipe(gulp.dest(path.build.img))
    .pipe(browserSync.stream());
}

// SVG sprite
function toSvgSprite() {
  console.log('Сборка спрайта SVG...');
  return gulp.src(path.src.ico)
    .pipe(svgMinify())
    .pipe(gulp.dest(path.build.ico))
		.pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest(path.build.ico))
    .pipe(browserSync.stream());
}

// Server
function server() {
  browserSync.init({ 
    server: path.build.html,
    cors: true,
    notify: false 
  });
  gulp.watch(path.watch.html, markup);
  gulp.watch(path.watch.css, styles);
  gulp.watch(path.watch.js, scripts);
  gulp.watch(path.watch.font, toWoff);
  gulp.watch(path.watch.font, toWoff2);
  gulp.watch(path.watch.img + '**/*.{jpg,png,svg}', images);
  gulp.watch(path.watch.img + '**/*.jpg', toWebp);
  gulp.watch(path.watch.ico, toSvgSprite);
  gulp.watch(path.watch.html).on('change', browserSync.reload);
}

// Clean task
exports.clean = clean;

// Main task
exports.markup = markup;
exports.styles = styles;
exports.scripts = scripts;
exports.mainBuild = gulp.series(markup, styles, scripts);

// Fonts task
exports.toWoff = toWoff;
exports.toWoff2 = toWoff2;
exports.fontConvert = gulp.series(toWoff, toWoff2);

// Images task
exports.images = images;
exports.toWebp = toWebp;
exports.toSvgSprite = toSvgSprite;
exports.imageConvert = gulp.series(images, toWebp, toSvgSprite);

// Run build
var build = gulp.series(clean, gulp.parallel(markup, styles, scripts, toWoff, toWoff2, images, toWebp, toSvgSprite));
exports.build = build;

// Default
exports.default = gulp.series(build, server);