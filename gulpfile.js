const gulp = require('gulp');
const fileinclude = require('gulp-file-include');
const less = require('gulp-less');
const px2rem = require('postcss-px2rem');
const postCss = require('gulp-postcss');
const autoPrefixer = require('autoprefixer');
const connect = require('gulp-connect');
const uglify = require('gulp-uglify');
const minifyCss = require('gulp-clean-css');
const babel = require('gulp-babel');
const del = require('del');
const path = require('path');

const folder = {
  pages: {
    include: path.resolve(__dirname, 'src/_include'),
    src: path.resolve(__dirname, 'src/pages/*.html'),
    dest: path.resolve(__dirname, 'dist/pages')
  },
  css: {
    src: path.resolve(__dirname, 'src/less/*.less'),
    dest: path.resolve(__dirname, 'dist/css')
  },
  js: {
    src: path.resolve(__dirname, 'src/js/*.js'),
    dest: path.resolve(__dirname, 'dist/js')
  },
  img: {
    src: path.resolve(__dirname, 'src/images/**'),
    dest: path.resolve(__dirname, 'dist/images/')
  }
}

// 清理缓存
gulp.task('clean', done => {
  del(['dist/**']);
  done();
})

// 编译模板
gulp.task('compileHtml', done => {
  return gulp.src([folder.pages.src]) // 主文件
    .pipe(fileinclude({
      prefix: '@@', // 变量前缀 @@include
      basepath: folder.pages.include, // 引用文件路径
      indent: true // 保留文件的缩进
    }))
    .pipe(gulp.dest(folder.pages.dest));
})

// 编译 less 文件
gulp.task('compileLess', done => {
  return gulp.src([folder.css.src]) // 主文件
    .pipe(less())
    .pipe(postCss([autoPrefixer(), px2rem({
      rootValue: 750 / 10, // 设计稿宽度 750
      propList: ['*'], // 需要做转化处理的属性，如`hight`、`width`、`margin`等，`*`表示全部
    })]))
    .pipe(gulp.dest(folder.css.dest));
})

// 编译 Js 文件
gulp.task('compileJs', done => {
  return gulp.src([folder.js.src]) // 主文件
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify().on('error', function (e) {
      console.log(e);
    }))
    .pipe(gulp.dest(folder.js.dest));
})

// 生产环境下编译压缩 CSS
gulp.task('buildCompileCss', done => {
  console.log(`编译less...`);
  return gulp.src([folder.css.src]) // 主文件
    .pipe(less())
    .pipe(postCss([autoPrefixer(), px2rem({
      rootValue: 750 / 10, // 设计稿宽度 750
      propList: ['*'], // 需要做转化处理的属性，如`hight`、`width`、`margin`等，`*`表示全部
    })]))
    .pipe(minifyCss())
    .pipe(gulp.dest(folder.css.dest));
})

// 生产环境下编译压缩 Js
gulp.task('buildCompileJs', done => {
  console.log(`编译JS...`);
  return gulp.src([folder.js.src]) // 主文件
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify().on('error', function (e) {
      console.log(`压缩出错：`, e);
    }))
    .pipe(gulp.dest(folder.js.dest));
})

// 图片处理
gulp.task('compileImages', done => {
  return gulp.src(folder.img.src) // 主文件
    .pipe(gulp.dest(folder.img.dest));
})

gulp.task('dev', gulp.series('compileImages', 'compileLess', 'compileHtml', 'compileJs'))

gulp.task('build', gulp.series('compileImages', 'buildCompileCss', 'compileHtml', 'buildCompileJs'))

// watch 文件
gulp.task('watcher', done => {
  gulp.watch([folder.pages.src], { events: 'all' }, gulp.series('compileHtml'));
  
  gulp.watch([folder.pages.include], { events: 'all' }, gulp.series('compileHtml'));

  gulp.watch([folder.css.src], { events: 'all' }, gulp.series('compileLess'));
  
  gulp.watch([folder.js.src], { events: 'all' }, gulp.series('compileJs'));

  gulp.watch([folder.img.src], { events: 'all', delay: 500 }, gulp.series('compileImages'));
  done();
})

// 本地服务
gulp.task('server', done => {
  return connect.server({
    name: 'H5 Template',
    root: 'dist',
    port: 9528,
    livereload: true,
  });
})

gulp.task('build', gulp.series('clean', 'build'));
gulp.task('default', gulp.series('clean', 'dev', 'watcher', 'server'))
