/**
 * View Engine Configuration
 * (sails.config.views)
 *
 * Server-sent views are a classic and effective way to get your app up
 * and running. Views are normally served from controllers.  Below, you can
 * configure your templating language/framework of choice and configure
 * Sails' layout support.
 *
 * For more information on views and layouts, check out:
 * http://sailsjs.org/#!/documentation/concepts/Views
 */


module.exports.views = {

  /****************************************************************************
  *                                                                           *
  * View engine (aka template language) to use for your app's *server-side*   *
  * views                                                                     *
  *                                                                           *
  * Sails+Express supports all view engines which implement TJ Holowaychuk's  *
  * `consolidate.js`, including, but not limited to:                          *
  *                                                                           *
  * ejs, jade, handlebars, mustache underscore, hogan, haml, haml-coffee,     *
  * dust atpl, eco, ect, jazz, jqtpl, JUST, liquor, QEJS, swig, templayed,    *
  * toffee, walrus, & whiskers                                                *
  *                                                                           *
  * For more options, check out the docs:                                     *
  * https://github.com/balderdashy/sails-wiki/blob/0.9/config.views.md#engine *
  *                                                                           *
  ****************************************************************************/

  /*engine: {
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

  },*/


  /**
   * Only for ejs,jade ..
   * @type {Boolean}
   */
  layout: false,


};