const gulp = require('gulp');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const uglify = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();

/**  FUNCTIONS 
gulp.task - Define tasks
gulp.src - Point to files to use
gulp.dest - Points to folder to output
gulp.watch - Watch files and folders for changes
*/

/** Minify JS */
gulp.task('minify', function(){
    // return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.js', 'js/*.js'])
    gulp.src('src/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('assets/js'));
});

/** Minify CSS */
gulp.task('css', function () {
    return gulp.src(['assets/css/*.css', 'src/css-vendors/*.css'])
    .pipe(concat('main.css'))
    .pipe(uglifycss({
    "maxLineLen": 80,
    "uglyComments": true
    }))
    .pipe(gulp.dest('assets/css'));
});

/** Optimize Images */
gulp.task('imageMin', () =>
    gulp.src('assets/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('assets/images'))
);

/** Compile sass */
gulp.task('sass', function(){
    gulp.src('src/sass/main.scss')
    // gulp.src('src/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe( sass({
            errorLogToConsole: true,
            outputStyle: 'compressed'
    }) )
    .on( 'error', console.error.bind( console ))
    // .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(uglifycss({
        "maxLineLen": 80,
        "uglyComments": true
      }))
    // .pipe(concat('main.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('assets/css'));
});

gulp.task('sass-pages', function(){
    gulp.src('src/sass/pages/*.scss')
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(sass().on('error', sass.logError))
    .pipe(uglifycss({
        "maxLineLen": 80,
        "uglyComments": true
      }))
    .pipe(gulp.dest('assets/css/'));
});

/** Concat all files */ 
gulp.task('scripts', function(){
    return gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/popper.js/dist/umd/popper.js', 'node_modules/bootstrap/dist/js/bootstrap.js','src/js/*.js'])
    // gulp.src('src/js/*.js')
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js'));
});

/** Browser Sync */
gulp.task('serve', ['sass'], function() {
    browserSync.init({
        /**  change local url accordingly
         * proxy: "https://html-workflow.local/
         */  
        proxy: "http://localhost/github-searchAPI/"  
    });
    gulp.watch(['src/sass/main.scss', 'src/sass/abstracts/*.scss', 'src/sass/base/*.scss', 'src/sass/components/*.scss', 'src/sass/layout/*.scss', 'src/sass/pages/*.scss', 'src/sass/themes/*.scss'], ['sass']);
    gulp.watch(['src/js/main.js'], ['scripts']);
    gulp.watch("*.php").on('change', browserSync.reload);
    gulp.watch("*.html").on('change', browserSync.reload);
    gulp.watch("template-parts/*.php").on('change', browserSync.reload);
    gulp.watch("assets/css/main.css").on('change', browserSync.reload);
    gulp.watch("assets/js/main.js").on('change', browserSync.reload);
});

/** Default Task: Browser sync */
gulp.task('default', ['serve']);
gulp.task('build', ['scripts', 'sass']);