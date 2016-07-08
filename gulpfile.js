/**
 * FOR Project Startup
 */

'use strict'

var fs = require('fs')
var j = require('path').join
var repl = require('repl')

var gulp = require('gulp')

//in assets dir
var babel = require('./assets/node_modules/gulp-babel')
var babelify = require('./assets/node_modules/babelify')

//for broswerify
var browserify = require('./assets/node_modules/browserify')
var buffer = require('./assets/node_modules/vinyl-buffer')
var source = require('./assets/node_modules/vinyl-source-stream')

//for rename dest
var rename = require('./assets/node_modules/gulp-rename')

//in project dir
var swig = require('swig')
var sh = require('shelljs')


/**
 * COMMON CONFIG =====================================
 */
var babelOptional = [
    "es7.asyncFunctions",
    "es7.objectRestSpread",
    "es7.functionBind",
    "es7.comprehensions",
]

swig.setDefaults({
    // cache: false,
    varControls: ['{$', '$}'],
    tagControls: ['{:', ':}'],
    loader: swig.loaders.fs('.gulp/sails_template')
})

var routePath = 'config/routes.js'

var tplControllerPath = 'api/controllers/TemplateController.es6',
    outControllerDir = 'api/controllers'

var tplViewPath = 'views/templateView.html',
    outViewsDir = 'views'

var tplEs6Path = 'assets/static/es6/main.es6',
    outEs6Dir = 'assets/static/es6/',
    outJSDir = 'assets/static/js/',
    tmpJSDir = 'assets/static/.tmp'

var tplScssPath = 'assets/static/scss/main.scss',
    outScssDir = 'assets/static/scss',
    outCSSDir = 'assets/static/css'


/**
 * COMMON FN =========================================
 */


function formatControllerName (str) {
    var first = str[0].toUpperCase()
    var remain = str.substring(1)
    return (first + remain)
}


function browserifyOne(fpath){

    return browserify({
          entries: fpath,
          debug: true,
          extensions: ['.es6', '.jsx'],
          transform: [
            babelify.configure({
                optional: babelOptional
            })
          ]
      })
      .bundle()
      .pipe(source(fpath))
      .pipe(buffer())
}


function renderFile(type, rawName, formatedName, controllerName){
    var now = new Date();

    if(type == 'controller'){
        //Use sails-hook-babel replaced! 
        var fileName = controllerName+'.js'
        // var outFileName = controllerName + '.js'

        var tplPath = tplControllerPath
        var outTarDir = outControllerDir

    }else if(type == 'view'){
        var fileName = rawName + '.html'
        var outFileName = fileName

        var tplPath = tplViewPath
        var outTarDir = j(outViewsDir, rawName) //eg. views/test/test.html
        //mkdir
        sh.mkdir('-p', outTarDir)

    }else if(type == 'browser_es6') {
        var fileName = 'main.es6'
        var outFileName = fileName

        var tplPath = tplEs6Path
        var outTarDir = j(outEs6Dir, rawName) //eg. es6/test/main.es6
        var outJSTarDir = j(outJSDir, rawName)

        //mkdir
        sh.mkdir('-p', outTarDir)
        sh.mkdir('-p', outJSTarDir)
    }else if(type == 'scss') {
        var fileName = 'main.scss'
        var outFileName = fileName

        var tplPath = tplScssPath
        var outTarDir = j(outScssDir, rawName) //eg. es6/test/main.es6
        var outCSSTarDir = j(outCSSDir, rawName)

        //mkdir
        sh.mkdir('-p', outTarDir)
        sh.mkdir('-p', outCSSTarDir)
    }else {
        throw Error('Unknown Type: ' + type)
    }

    var outPath = j(outTarDir, fileName)

    // console.log(outTarDir)
    // console.log(tplPath)


    swig.renderFile(
        tplPath, 
        {
            'rawName': rawName,
            'formatedName': formatedName,
            'controllerName': controllerName,
            'fileName': fileName,
            'now': now
        }, 
        function(err, rs){
            // console.log('Content: ', rs)
            if(!err){
                fs.writeFileSync(outPath, rs)
                console.log('output: ' + outPath)
                // just for controller, trans es6 to js
                if(type == 'controller'){
                    console.log('Use sails-hook-babel replaced! ')
                    /*gulp.src(outPath)
                    .pipe(babel())
                    .pipe(gulp.dest(outTarDir))*/
                }else if(type == 'browser_es6'){

                    browserifyOne(outPath)
                    .pipe(rename(function(path) {
                        
                        // return
                        path['dirname'] = path['dirname'].replace(outEs6Dir, outJSDir)
                        path['extname'] = '.js'
                        // console.log(path)
                    }))
                    .pipe(gulp.dest('./'))
                    .on('error', function(a,b){
                      throw Error(a)
                    })
                }else if(type == 'scss'){
                    sh.cp(outPath, j(outCSSTarDir, 'main.css') )

                }else {
                    console.log('None Sub Process.')
                }

                console.log('***Generated '+formatControllerName(type)+' Succeed!')
            }
        }
    )

}


function generateRoute(rawName, formatedName, controllerName){
     //自动增加路由的正则
    var routeRe = /\/\*+\s*@(\w+)\:(\w+)\s*\*+\//gim
    var routeFileStr = fs.readFileSync(routePath, 'utf-8')

    var mr = routeRe.exec(routeFileStr)

    if(mr){
        var cmd = mr[1], cmd_way = mr[2]
        // console.log(cmd, cmd_way)
        if(cmd == 'autoGenerateRoute' && cmd_way == 'prepend'){
            var newRouteStr = "'\/"+rawName+"': '"+controllerName+".index'"
            if(routeFileStr.match(newRouteStr)){
                console.log('!!!Route has existed: '+newRouteStr+', So can not generated route.')
                return
            }
            var rsStr = routeFileStr.replace(
                routeRe, 
                [newRouteStr, ", \n\n  \/\* @autoGenerateRoute:prepend \*\/" ].join('')
            ) 

            //更新routes文件
            fs.writeFileSync(routePath, rsStr)
            console.log('***Update cong/routes.js Succeed!')

        }else {
            console.warn('!!!Unknown Error on routes generate')
        }

        return
        
    }else {
        console.warn('!!!Not update config/routes.js , need inside comment symbol, such as: /*@auto:prepend*/ ')
    }
}


/**
 * TRANS ES6 TO ES5, nodejs used
 * !! Use the bable-hooks, now this was
 * deprecated
 * ===================================
 */

// gulp.task('es6', function () {
//     //just for backend nodejs trans!
//     return gulp.src('./api/**/*.es6')
//         .pipe(babel({
//             optional: babelOptional
//         }))
//         .pipe(gulp.dest(
//             './api'
//           )
//         )

// })


/**
 * AUTO GENERATE FEA ===================================
 */


gulp.task('generate', function () {
    var cmd = {
        'controller': {
            '--controller': 'generate controller and view and assets',
            '-c': 'same with up' 
        },
        'view': {
            '--view': 'generate view and assets',
            '-v': 'same with up' 
        },
        'bare': {
            '--bare': 'bare',
            '-b': 'bare'
        }
        
    }
    var type = process.argv[3]

    if(type in cmd['controller'] || type in cmd['view']){
        var rawName = process.argv[4]
        var formatedName = formatControllerName(rawName)
        var controllerName = formatedName+'Controller'
        var isView = false
        if (type in cmd['view']){
            isView = true
            console.log('***Generate View')
        }
        
        var bare = process.argv[5]
        if(bare in cmd['bare']){
            bare = true
        }else {
            bare = false
        }
        //controller,if isView, then skip
        !isView ? renderFile('controller', rawName, formatedName, controllerName) : '';

        if(!bare){

            //routes auto insert generate by comment: /*@cmd*/
            !isView ? generateRoute(rawName, formatedName, controllerName) : ''
            
            //views
            renderFile('view', rawName, formatedName, controllerName)

            // browser_es6: init a es6 file and a js file
            renderFile('browser_es6', rawName, formatedName, controllerName)

            //scss: init scss and css file
            renderFile('scss', rawName, formatedName, controllerName)
        
        }else {
            'Generate In Bare Pattern, No views and js and css created'
        }

        // console.log('Generate Controller File: ' + fileName)
    }else {
        throw Error('Unknown Type:' + type)
    }

})


/**
 * AUTO GENERATE FEA ===================================
 */


gulp.task('remove', function () {
    var cmd = {
        'controller': {
            '--controller': 'remove controller and view and assets',
            '-c': 'same with up' 
        },
        'view': {
            '--view': 'remove view and assets',
            '-v': 'same with up' 
        },
        'bare': {
            '--bare': 'bare',
            '-b': 'bare'
        }
        
    }
    var type = process.argv[3]
    if(type in cmd['controller'] || type in cmd['view']){
        var rawName = process.argv[4]
        var formatedName = formatControllerName(rawName)
        var controllerName = formatedName+'Controller'
        
        var isView = false
        if (type in cmd['view']){
            isView = true
            console.log('***Remove View')
        }


        var bare = process.argv[5]
        if(bare in cmd['bare']){
            bare = true
        }else {
            bare = false
        }
        //remove tmp assets dir: .tmp
        sh.rm('-rf', tmpJSDir)
        //remove other files
        removeFile(rawName, formatedName, controllerName, isView)

        // console.log('Generate Controller File: ' + fileName)
    }else {
        throw Error('Unknown Type:' + type)
    }

})


/**
 * Remove File ===================================
 */

function removeFile(rawName, formatedName, controllerName, isView){
    // console.log(rawName, formatedName, controllerName)

    function getFilesToRemove(){
        var fList = [
            //used sails-hook-babel
            // j(outControllerDir, controllerName+'.es6'),
            j(outControllerDir, controllerName+'.js'),

            //views
            j(outViewsDir, rawName),

            //assets
            j(outEs6Dir, rawName),
            j(outJSDir, rawName),
            j(outScssDir, rawName),
            j(outCSSDir, rawName)
        ]

        //如果只remove view, 那么跳过controller 
        isView ? fList.shift() : ''

        return fList
    }
    
    function doRemove(fileList){
        sh.rm('-rf', fileList)
        console.log('\n\n>>Tip: \n\nYou should clear its route in config/routes.js manualy.')
        console.log('\n', 'All Files Removed!!!\n\n')

        return true
    }

    var files = getFilesToRemove()

    console.warn('\nThese files or folders would be all removed: \n\n=========================\n\n', files.join('\n '), '\n\n=========================\n')

    repl.start({
        prompt: "Are you sure? y/n >",
        input: process.stdin,
        output: process.stdout,
        eval: function (cmd, context, filename, callback) {
            var cmd = cmd.toLowerCase().replace(/[\s\b\n\r\t\f]+/g, '')

            // return
            if((cmd == 'y') || (cmd == 'yes')){
                
                doRemove(files)
                process.exit()

            }else {

                console.log('Canceled! Not Remove any file')
                process.exit()
            }

          // callback(null, result)
        }
    })
    .on('exit', function(){
        process.exit()
    })
}


/**
 * Sever Start ===================================
 */

//start develop
gulp.task('s', function() {  
    var nodemon = require('nodemon') 
    //backend develop 
    /**
     * Now use babel-hooks ,so the api/es6 schema was deprecated
     */
    // gulp.watch('./api/**/*.es6', ['es6'])
    
    nodemon('app.js')
})
//develop assets 
gulp.task('assets', function() {   
    //backend develop 
    sh.cd('assets')
    sh.exec('gulp develop')
})

/**
 * Auto deploy prodution
 */

gulp.task('deploy', function() {    
    sh.exec('git pull && gulp publish && gulp rs-prod')
})

/**
 * Assets Publish ===================================
 */

gulp.task('publish', function() {    
    sh.cd('assets')
    sh.exec('gulp publish')
    // sh.cd('-') --> this is error ,for the build process async!
})


/**
 *  RESTART PRODUCTION
 */
gulp.task('rs-prod', function() {    
    sh.exec('pm2 restart karat -x -- --prod')
    // sh.cd('-') --> this is error ,for the build process async!
})
/**
 * START PRODUCTION IN SERVER HOST
 */
gulp.task('s-prod', function() {    
    sh.exec('pm2 start ./app.js --name karat -x -- --prod')
    // sh.cd('-') --> this is error ,for the build process async!
})


/**
 * REST UPLOAD DIR,mkdir dir and delete old
 */

gulp.task("uploads-init", function(){
    // sh.rm('-rf', '.tmp')
    sh.mkdir('.tmp')
    sh.mkdir('.tmp/uploads')
    sh.mkdir('.tmp/uploads/img')
    sh.mkdir('.tmp/uploads/img/thumb')
    sh.mkdir('.tmp/uploads/img/mid')
    sh.mkdir('.tmp/uploads/img/large')
})

/**
 * Assets Init ===================================
 */

gulp.task('assets-init', function() {    
    sh.cd('assets')
    sh.exec('gulp develop_init')
    // sh.cd('-') --> this is error ,for the build process async!
})


/**
 * Assets Clean ===================================
 */

gulp.task('clean', function() {    
    sh.cd('assets')
    sh.exec('gulp publish_clean')
    // sh.cd('-') --> this is error ,for the build process async!
})

/**
 * Quick Post To Git
 */

gulp.task('post', function(){
    repl.start({
        prompt: "Are you sure to quick commit and push ? y/n >",
        input: process.stdin,
        output: process.stdout,
        eval: function (cmd, context, filename, callback) {
            var cmd = cmd.toLowerCase().replace(/[\s\b\n\r\t\f]+/g, '')
            var d = new Date()
            if((cmd == 'y') || (cmd == 'yes')){
                sh.exec('git add . && git commit -am"Quic Post To Git, Time: '+d.toLocaleDateString() + '  '+d.toLocaleTimeString()+'" && git push')
                process.exit()

            }else {

                console.log('Quick Post Code to git has been Canceled')
                process.exit()
            }

          // callback(null, result)
        }
    })
    .on('exit', function(){
        process.exit()
    })
})
