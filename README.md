# Sails-babel 

* 启用ES6和gulp来完成sails项目！

* 详细教程Introduction: [全栈es6、7的js开发－基于Sails](http://karat.cc/article/562f6f53d6db69011de1bbe0)

* Use es6 in both backend and frotend!

* Use browserify to pack js modules!

* You can create front-end and back-end easily

* Baed on [Sails](http://sailsjs.org) Application


#### [version 0.0.1]


## Some modules used

- used sails-hook-babel , [detail](https://github.com/artificialio/sails-hook-babel)[https://github.com/artificialio/sails-hook-babel]
- used swig for template
- used gulp for auto workflow
- used broswerify for js files package
- used es6 in both front and backend
- used babel to transform es6 files to es5
- used scss to get css
- used md5 to construct html/js/css files
-used shelljs as tools to do jobs

- also used sails-mongo and others, not necessary


## Description:

#### Dir introduction

* controllers: You can use .es6 files in controllers ,by sails-hook-babel

* assets/static: static resources, include img, es6, scss, font... 

* assets/static/es6: es6 files in this dir. You can just import its name in es6 syntax, like: `import 'home/comment'`

* Important! The dir [es6/common]and [lib] is [global modules]. global modules means you can import them just by their relative path, eg: `'jquery'`, but not a full path like: `'../static/lib/jquery'.`


#### Usage:

- Step 0: Install This Successful

- Step 1: `gulp s`

- Step 2: `gulp assets`

* Then you can write js/es6 ! Auto Watch and Auto Restart !


#### Attention:

- the [lib] is normal es5 js files, but not es6 files, can not use es6 syntax.

- And [es6/*] can be both es6 and es5 files. Recommend only .es6 files in es6 dir.



# Sails-babel Install 安装

1、install sails （use npm -g）

2、install other modules in project root

````Javascript
    "babel-core": "^5.8.22",

    "sails-hook-babel": "^5.0.1",

    "sails-mongo": "^0.11.2",

    "swig": "^1.4.2"
```

3、install modules in assets dir:
````Javascript

    "babelify": "^6.2.0",

    "browserify": "^11.0.1",

    "globby": "^2.1.0",

    "gulp-babel": "^5.2.0",

    "babel-plugin-closure-elimination": "0.0.2",

    "gulp-imagemin": "^2.3.0",

    "gulp-load-plugins": "^1.0.0-rc.1",

    "gulp-md5-plus": "^0.1.7",

    "gulp-minify-css": "^1.2.0",

    "gulp-rename": "^1.2.2",

    "gulp-sass": "^2.0.4",

    "gulp-uglify": "^1.2.0",

    "imagemin-pngquant": "^4.1.2",

    "shelljs": "^0.5.3",

    "vinyl-buffer": "^1.0.0",

    "vinyl-source-stream": "^1.1.0"
```

4、Important , Edit the gulp-md5-plus/index.js
修改gulp-md5-plus的主文件index.js，适配打包寻址的功能（替换为MD5的文件名）

##### Code Section In gulp-md5-plus

add `rootpath` param in its function:

````Javascript

module.exports = function (size, ifile, rootpath) {
    size = size || 0;
    rootpath = rootpath || ''

    ...
})


var match_file_path = path.join(rootpath, relativepath)

var md5_filename = filename.split('.').map(function(item, i, arr){
    return i == arr.length-2 ? item + '_'+ d : item;
}).join('.');

var relative_dir = path.relative(file.base, dir)

var md5_file_path = path.join(rootpath,relative_dir, md5_filename)

console.log('MD5 gulp-md5-plus: \n', md5_file_path)
```

查找index.js中全部代码，并替换, replace all with：

````Javascript
replace(new RegExp(match_file_path), md5_file_path);
```

# Sails-babel Command Usage 自动化命令使用说明

* 1、Start server in develop pattern, 
[in the root dir, and exec:]

`gulp s`

* 2、Start server in Production pattern, use [PM2]:

`gulp s-prod` , `gulp rs-prod` => restart project in production

this will use the published assets-dist and views-dist, you can config them in sails config files

* 3、init Assets so you can debug in browser

`gulp assets-init`


* 4、Watch Assets so you can develop by runtime compile(scss\es6\...), watching files...

`gulp assets`


* 5、Publish assets

`gulp publish`

* 6、Clean Assets

`gulp clean`

this will clean tmp files and published assets fils

* 7. auto deploy assets , which use shell `gulp publish` and `gulp rs-prod`:

`gulp deploy`


* 8、Generate Controller with views and js/css !!

`gulp generate -c {ControllerName}`

* 9、Generate Controller without views and js/css , bare !!

`gulp generate -c {ControllerNam} --bare`

* 10、Remove Controller !!

`gulp remove -c {ControllerName}`

* 11、Generate View with Assets: js/css , No Controller!!

`gulp generate -v {ViewName}`

* 12、Remove One View !!

`gulp remove -v {ViewName}`


# Contact Me

The docs is maybe rougth, simple, not-easily-understood. So Any questions, contact me.

Email: 

* xunuoi@163.com [recommend]
* xwlxyjk@gmail.com



QQ: [751933537]


### Best Wishes!
