//This is where all gulp configurations are stored
var gulp = require('gulp'); //tells Node to look in the node-modules folder for the package named gulp
var sass = require('gulp-sass');//compiles Sass to CSS
var browserSync = require('browser-sync');//spins up & live-reloads local dev environment
var useref = require('gulp-useref');//tells node how to properly concatenate files to create minified versions
var uglify = require('gulp-uglify');//minifies js
var gulpIf = require('gulp-if');//tells uglify to only minify js files
var minifyCSS = require('gulp-minify-css');//minifies css files
var imagemin = require('gulp-imagemin');//minifies images (png, jpg, gif, svg)
var cache = require('gulp-cache');
var del = require('del');//used for cleaning up generated files, takes an array of node globs that tell it what folders to delete
var runSequence = require('run-sequence');//ensures tasks execute in the correct order

//Tasks
  //This is the syntax of a gulp task -> gulp.task('task-name', function() {
    //stuff here
  //});
  //task-name - refers to the name of the task & is used to run that task in gulp; can be run in the command line with 'gulp "task-name"'
gulp.task('sass', function() {//Task to compile Sass to CSS
  return gulp.src('./src/scss/**/*.scss')// Gets all files ending with .scss in app/scss and children dirs ->globbing
    .pipe(sass())//Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

//Watch - method for compiling Sass to CSS every time the file is saved
  //Gulp watch syntax
  //gulp.watch('files-to-watch', ['tasks', 'to', 'run']);
gulp.task('watch', ['sass', 'browserSync'], function() {//adding the browserSync argument tells gulp the browserSync task must be completed before watch task can run; sass and browserSync arguments may need to be switched in order
  //Reloads browser whenever Sass files change
  gulp.watch('./src/scss/**/*.scss', ['sass']);//watch all Sass files and run the sass task when a Sass file is saved
  //Reloads browser whenever HTML files change
  gulp.watch('./*.html', browserSync.reload);
  //Reloads browser whenever JS files change
  gulp.watch('./js/**/*.js', browserSync.reload);
});

//Browser Sync - spins up a web server to let us do live-reloading easily, can also synchronize actions across devices
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: './'
    },
  })
});

//Useref - for properly concatenating files prior to minification
  //Use '<build>' tags in html to select what sections of code should be concatenated
    //ex: <!-- build:<type> <path> -->...<!-- endbuild --> = <!-- build:js js/main.min.js --><!-- endbuild -->
        //type can be js, css, or remove (to exclude code)
        //path refers to the target path of the generated file
gulp.task('useref', function() {
  var assets = useref.assets();

  return gulp.src('./*.html')
  .pipe(assets)
  .pipe(gulpIf('*.css', minifyCSS()))//minifies only if its a CSS file
  .pipe(gulpIf('*.js',uglify()))//uglify-minifies JS files whenever useref task is run; gulp-if - tells uglify to minify js ONLY
  .pipe(assets.restore())
  .pipe(useref())
  .pipe(gulp.dest('dist'))
});

//Imagemin - minify images
gulp.task('images', function() {
  return gulp.src('./images/**/*.+(png|jpg|gif|svg)')
  .pipe(cache(imagemin({//cache plugin caches images because minifying them is a slow process
    interlaced: true
  })))
  .pipe(gulp.dest('dist/images'))
});

//Copying fonts over to the dist directory
gulp.task('fonts', function() {
  return gulp.src('./fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))//fonts will be copied to the dist folder whenever 'gulp fonts' is run
});//no semicolon?

//Cleaning up generated files automatically with del task
gulp.task('clean', function(callback) {
  del('dist');//dist folder will be deleted whenever 'gulp-clean' is run
  return cache.clearAll(callback);
});//no semicolon?

//Clean task to delete everything in dist folder EXCEPT images
gulp.task('clean:dist', function(callback) {
  del(['dist/**/*', '!dist/images', '!dist/images/**/*'], callback)
});

//Run Sequence plugin
  //syntax:
    //gulp.task('task-name', function(callback) {
      //runSequence('task-one', 'task-two', 'task-three', callback); - tasks can also be run simultaneously if placed in an array
    //});
gulp.task('build', function(callback) {
  runSequence('clean:dist',
    ['sass', 'useref', 'images', 'fonts'],
    callback
    )
}); //no semicolon?

//Default Task
gulp.task('default', function (callback) {//runs just by typing in 'gulp'
  runSequence(['sass','browserSync', 'watch'],
    callback
  )
});//no semicolon?




