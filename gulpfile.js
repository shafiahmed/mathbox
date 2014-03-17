var gulp       = require('gulp');
var gutil      = require('gulp-util');
var uglify     = require('gulp-uglify');
var concat     = require('gulp-concat');
var rename     = require("gulp-rename");
var karma      = require('gulp-karma');
var sequence   = require('run-sequence');
var browserify = require('gulp-browserify');
var watch      = require('gulp-watch');
var jsify      = require('./vendor/gulp-jsify');

var builds = {
  core: 'build/mathbox-core.js',
  bundle: 'build/mathbox-bundle.js',
};

var products = [
  builds.core,
  builds.bundle
];

var vendor = [
  'vendor/three.js',
  'vendor/threestrap/build/threestrap.js',
  'vendor/shadergraph/build/shadergraph.js',
  'vendor/fix.js',
];

var core = [
  '.tmp/index.js'
];

var bundle = vendor.concat(core);

var glsls = [
  'src/shaders/glsl/**/*.glsl'
];

var coffees = [
  'src/**/*.coffee'
];

var test = bundle.concat([
  'test/**/*.spec.js',
]);

gulp.task('glsl', function () {
  return gulp.src(glsls)
    .pipe(jsify("shaders.js", "window.MathBox.Shaders"))
    .pipe(gulp.dest('./build/'))
});

gulp.task('browserify', function () {
  return gulp.src('src/index.coffee', { read: false })
      .pipe(browserify({
        debug: false,
        //detectGlobals: false,
        bare: true,
        transform: ['coffeeify'],
        extensions: ['.coffee'],
      }))
      .pipe(rename({
        ext: ".js"
      }))
      .pipe(gulp.dest('.tmp/'))
});

gulp.task('core', function () {
  return gulp.src(core)
    .pipe(concat(builds.core))
    .pipe(gulp.dest(''));
});

gulp.task('bundle', function () {
  return gulp.src(bundle)
    .pipe(concat(builds.bundle))
    .pipe(gulp.dest(''));
});

gulp.task('uglify', function () {
  return gulp.src(products)
    .pipe(uglify())
    .pipe(rename({
      ext: ".min.js"
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('karma', function() {
  return gulp.src(test)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'single',
    }));
});

gulp.task('watch-karma', function() {
  return gulp.src(test)
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch',
    }));
});

gulp.task('watch-build', function () {
  gulp.src(coffees)
    .pipe(
      watch(function(files) {
        return gulp.start('build');
      })
    );
});

// Main tasks

gulp.task('build', function (callback) {
  sequence('glsl', 'browserify', ['core', 'bundle'], callback);
})

gulp.task('default', function (callback) {
  sequence('build', 'uglify', callback);
});

gulp.task('test', function (callback) {
  sequence('build', 'karma', callback);
});

gulp.task('watch', function (callback) {
  sequence('watch-build', 'watch-karma', callback);
});
