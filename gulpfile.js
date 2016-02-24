var gulp        = require('gulp');
var postcss     = require('gulp-postcss');
var cssnext     = require('postcss-cssnext');
var nested      = require('postcss-nested');
var rename      = require('gulp-rename');
// var mqpacker = require('css-mqpacker');
var csswring    = require('csswring');

var processors = [
        // autoprefixer({browsers: ['last 2 version']}),
        cssnext,
        nested,
        // mqpacker,
        csswring
];

gulp.task('css', function () {
    return gulp.src('./*.scss')
        .pipe(postcss(processors))
        .pipe(rename({
        	extname: '.css'
        }))
        .pipe(gulp.dest('./assets'));
});

gulp.task('default', ['css']);

gulp.task('release', ['default'], function() {
	console.log('releasing');
});

gulp.task('watch', function() {
	gulp.watch('./*.scss', ['css']);
});