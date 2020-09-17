# H5 活动模板

使用 gulp 构建程序，满足日常前后端混合开发

## 目录

```
...
|-- dist                           // 静态文件目录
|-- src 
    |-- _include                   // 公用文件目录
        |-- _meta.html             // 公用 meta 信息
    |-- fonts                      // 字体
    |-- images                     // 图片
    |-- js                         // js
    |-- less                       // less
    |-- pages                      // html
|-- gulpfile.js                    // gulp 配置文件
|-- package.json                   // 配置项目相关信息
...

```

## 启动

```
npm install --g gulp-cli

npm install or yarn install

npm run dev
```

## 打包生产环境

- 执行命令

```
npm run build or yarn build
```

- 输出 `dist` 目录下文件


## 注意

- 使用 `dev` 模式下输出的 `css` `js` 文件是没有压缩的，可用于混合开发

- include 公用文件使用 [gulp-file-include](https://github.com/haoxins/gulp-file-include#readme) 插件