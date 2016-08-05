var moment = require('moment')

var _viewConf = {
    'production': {
        engine: {
          'name': 'swig',
          'ext': 'html',
          // debug: true,
          fn: function (pathName, locals, cb) {
            var swig = require('swig')
            swig.setDefaults({
              // 'cache': false,//default,use cache in 'memory'
              'loader': swig.loaders.fs('./views_dist'),
              'debug': false
            })

            swig.setFilter('moment', function (input, idx) {
                // console.log(input, idx)
                return moment(input).fromNow();
            })

            swig.setFilter('randNum', function (input, idx) {
              // console.log(input, idx)
              function _randomNum(Min,Max){ 
                Min = parseInt(Min)  
                Max = parseInt(Max)
                var Range = Max - Min;   
                var Rand = Math.random();   
                return(Min + Math.round(Rand * Range));   
              }  

              var range = input.split(',')

              return _randomNum(range[0], range[1])
            })
            
            return swig.renderFile(pathName, locals, cb);
          } 
        }
    },
    'development': {
        engine: {
            'name': 'swig',
            'ext': 'html',
            debug: true,
            fn: function (pathName, locals, cb) {
                var swig = require('swig')
                swig.setDefaults({
                    'cache': false,//needn't restart 
                    'loader': swig.loaders.fs('./views'),
                    'debug': true
                })

                swig.setFilter('moment', function (input, idx) {
                    // console.log(input, idx)
                    return moment(input).fromNow();
                })

                swig.setFilter('randNum', function (input, idx) {
                    // console.log(input, idx)
                    function _randomNum(Min,Max){ 
                        Min = parseInt(Min)  
                        Max = parseInt(Max)
                        var Range = Max - Min;   
                        var Rand = Math.random();   
                        return(Min + Math.round(Rand * Range));   
                    }  

                    var range = input.split(',')

                    return _randomNum(range[0], range[1])
                })

                return swig.renderFile(pathName, locals, cb);
            } 
        }
    }
}


function getViewConf(key){
    console.log('*Views Config Env: '+key)
    return _viewConf[key]
}


exports.getViewConf = getViewConf