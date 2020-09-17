const gulp = require('gulp');
const gulpif = require('gulp-if');
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
const watch = require('gulp-watch');
const fontSpider = require('gulp-font-spider');
const plumber = require('gulp-plumber'); // 防止因 gulp 插件的错误而导致管道中断
const browserSync = require('browser-sync').create();

const folder = {
  pages: {
    include: path.resolve(__dirname, 'src/_include'),
    src: path.resolve(__dirname, 'src/pages/*.html'),
    dest: path.resolve(__dirname, 'dist/pages')
  },
  css: {
    src: path.resolve(__dirname, './src/less/*.less'),
    dest: path.resolve(__dirname, './dist/css')
  },
  js: {
    src: path.resolve(__dirname, 'src/js/*.js'),
    dest: path.resolve(__dirname, 'dist/js')
  },
  img: {
    src: path.resolve(__dirname, 'src/images/**'),
    dest: path.resolve(__dirname, 'dist/images/')
  },
  libs: {
    src: path.resolve(__dirname, 'src/libs/**'),
    dest: path.resolve(__dirname, 'dist/libs/')
  }
}

// 清理缓存
gulp.task('clean', done => {
  // del(['dist/**']);
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

const compoleLess = (isUglify) => {
  return () => {
    return gulp.src([folder.css.src]) // 主文件
    .pipe(less())
    .pipe(postCss([autoPrefixer(), px2rem({
      rootValue: 750 / 10, // 设计稿宽度 750
      propList: ['*'], // 需要做转化处理的属性，如`hight`、`width`、`margin`等，`*`表示全部
    })]))
    .pipe(gulpif(isUglify, minifyCss()))
    .pipe(gulp.dest(folder.css.dest));
  }
}

const compileJs = (isUglify) => {
  return () => {
    return gulp.src([folder.js.src]) // 主文件
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulpif(isUglify, uglify().on('error', function (e) {
      console.log(`压缩出错：`, e);
    })))
    .pipe(gulp.dest(folder.js.dest));
  }
}

// 编译 less 文件
gulp.task('compileLess', compoleLess())

// 编译 Js 文件
gulp.task('compileJs', compileJs())

// 生产环境下编译压缩 CSS
gulp.task('buildCompileCss', compoleLess(true))

// 生产环境下编译压缩 Js
gulp.task('buildCompileJs', compileJs(true))

// 图片处理
gulp.task('compileImages', done => {
  return gulp.src(folder.img.src) // 主文件
    .pipe(gulp.dest(folder.img.dest));
})

// 插件处理
gulp.task('compileLibs', done => {
  return gulp.src(folder.libs.src) // 主文件
    .pipe(gulp.dest(folder.libs.dest));
})

// font任务，复制字体到 dist
gulp.task('font', function() {
  return gulp.src("src/fonts/*")
      .pipe(plumber())        
      .pipe(gulp.dest("dist/fonts"))
      .pipe(browserSync.stream());
});

// fontspider任务，在dist中压缩字体文件并替换。成功后会发现dist/fonts中的字体文件比app/fonts中的小了很多
gulp.task('fontspider', function() {
  return gulp.src('dist/pages/*.html') //只要告诉它html文件所在的文件夹就可以了，超方便
    .pipe(fontSpider());
});

gulp.task('dev', gulp.series('compileImages', 'compileLibs', 'compileLess', 'compileHtml', 'compileJs'))

gulp.task('build', gulp.series('compileImages', 'compileLibs', 'buildCompileCss', 'compileHtml', 'buildCompileJs'))

// watch 文件
gulp.task('watcher', done => {
  watch([folder.pages.src], gulp.series('compileHtml'));
  
  watch([folder.pages.include], gulp.series('compileHtml'));

  watch([folder.css.src], gulp.series('compileLess'));
  
  watch([folder.js.src], gulp.series('compileJs'));

  watch([folder.img.src], gulp.series('compileImages'));

  watch([folder.libs.src], gulp.series('compileLibs'));
  done();
})

// 本地服务
gulp.task('server', done => {
  return connect.server({
    name: 'H5 Template',
    root: 'dist',
    host: '::',
    port: 9528,
    livereload: true
  });
})

gulp.task('build', gulp.series('clean', 'build'));
gulp.task('default', gulp.series('clean', 'dev', 'font', 'fontspider', 'watcher', 'server'))
