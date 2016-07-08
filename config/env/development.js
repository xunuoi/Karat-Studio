/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */
var moment = require('moment')


module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/
   port: 1337,

  // models: {
  //   connection: 'someMongodbServer'
  // }
  
    views: {
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

        },


        /**
        * Only for ejs,jade ..
        * @type {Boolean}
        */
        // layout: false,
    }

};
