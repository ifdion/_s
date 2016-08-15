var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var del = require('del');
var rsync = require('gulp-rsync');

var projectConfig = require('./project.json');

var browserSyncSetting = {
  notify: false,
  port: projectConfig.port
}

if (projectConfig.proxy != '') {
  browserSyncSetting.proxy = projectConfig.proxy
} else {
  browserSyncSetting.server = {
    baseDir: '.',
    routes: {
      '/bower_components': 'bower_components'
    }
  }
}

gulp.task('sass', () => {
  gulp.src('./static/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./static/css'))
    .pipe(reload({stream: true}));;
});

gulp.task('_s', ['clean'], () => {
  return gulp.src([
    './**/*',
    '!dist/**/*',
    '!static/**/*',
    '!bower_components/**/*',
    '!node_modules/**/*'
    ])
  .pipe(gulp.dest('dist'));
});

gulp.task('static', ['clean'], () => {
  return gulp.src([
    './static/**/*.php',
    ])
  .pipe(useref())
  .pipe(gulpif('*.js', uglify()))
  .pipe(gulpif('*.css', minifyCss()))
  .pipe(gulp.dest('dist/static'));
});

gulp.task('images', ['clean'], () => {
  return gulp.src('static/images/**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false,cleanupIDs: false}],
    }))
    .pipe(gulp.dest('dist/static/images'));
});

gulp.task('fonts', ['clean'], () => {
  return gulp.src('static/fonts/**/*.{eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest('dist/static/fonts'));
});

gulp.task('serve', ['sass'], function() {
  browserSync(browserSyncSetting);
  gulp.watch(
    [
      './**/*.php',
      './**/*.js',
      '!dist/**/*',
      '!bower_components/**/*',
      '!node_modules/**/*'
    ],
    {
      cwd: './'
    },reload
  );
  gulp.watch('static/scss/**/*.scss', ['sass']);
});

gulp.task('clean', del.bind(null, ['dist']));

gulp.task('build', ['_s', 'static', 'fonts', 'images'], () => {
  return;
});

gulp.task('deploy', () => {
  return gulp.src('dist/**')
  .pipe(rsync({
      root: 'dist',
      hostname: projectConfig.deploy.hostname,
      username: projectConfig.deploy.username,
      destination: projectConfig.deploy.destination,
      progress: true
  }));
});
