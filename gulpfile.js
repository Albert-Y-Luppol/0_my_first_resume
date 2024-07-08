'use strict';

var gulp       	 = require('gulp'),
    browserSync	 = require('browser-sync').create(),
    sass       	 = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    // babel        = require('gulp-babel'),
    sourcemaps   = require('gulp-sourcemaps'),
    rigger          = require('gulp-rigger'),
    rename          = require("gulp-rename"),
    uglify          = require("gulp-uglify-es").default,
    pngquant        = require('imagemin-pngquant'),
    zopfli          = require('imagemin-zopfli'),
    mozjpeg         = require('imagemin-mozjpeg'),
    gifsicle        = require('imagemin-gifsicle'),
    jpegtran        = require('imagemin-jpegtran'),
    imagemin        = require('gulp-imagemin'),
    clean           = require('gulp-clean');

// Compile sass into CSS & auto-inject into browsers

gulp.task('html', gulp.series(function(){
    return gulp.src(['src/**/*.html', '!src/**/_*.html'])
        .pipe(rigger())
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.stream());
}));


gulp.task('sass', function() {
    return gulp.src("src/scss/**/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest("dist/css"))
        .pipe(browserSync.stream());
});


gulp.task('js', function (){
    return gulp.src(['src/js/**/*.js', '!src/js/**/_*.js'])
        .pipe(sourcemaps.init())
        .pipe(rigger())
        // .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest("dist/js"))
        .pipe(browserSync.stream());
});


gulp.task('img', gulp.series( function() {
    return gulp.src(['src/img/**/*.*'])
        .pipe(imagemin([
            pngquant({
                speed: 1,
                quality: [0.95, 1]
            }),
            zopfli({more: true}),
            gifsicle({
                optimizationLevel: 3
            }),
            imagemin.svgo({
                plugins: [{
                    removeViewBox: false
                }]
            }),
            jpegtran({
                progressive: true
            }),
            mozjpeg({
                quality: 90
            })
        ]))
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
}));


gulp.task('docs', gulp.series( function() {
    return gulp.src(['src/docs/**/*.*'])
        .pipe(gulp.dest('dist/docs'))
        .pipe(browserSync.stream());
}));


gulp.task('clean', function (){
    return gulp.src('dist', {allowEmpty: true, read: false}).pipe(clean());
});

// Static Server + watching scss/html files
gulp.task('serve', gulp.series('html', 'sass', 'js', 'img', 'docs', function() {

    browserSync.init({
        server: "./dist"
    });

    gulp.watch("./src/**/*.html",  gulp.parallel('html'));
    gulp.watch("./src/scss/**/*.scss", gulp.parallel('sass'));
    gulp.watch("./src/js/**/*.js", gulp.parallel('js'));
    gulp.watch("./src/img/**/*.*", gulp.parallel('img'));
    gulp.watch("./src/docs/**/*.*", gulp.parallel('docs'));
}));


gulp.task('default', gulp.series('clean', 'html', 'sass', 'js', 'img', 'docs'));