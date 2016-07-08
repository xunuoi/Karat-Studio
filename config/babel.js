/**
 * Configuration for Babel 
 * @type {Object}
 */


module.exports.babel = {
    // Turn babel compile on by default
    compile: true,
    //Activates experimental functionality such as ES7 async/await. defuault stage: 2;
    stage: 0,
    //See http://babeljs.io/docs/usage/loose
    //Can be "all", false or a an array, e.g. ["es6.classes", "es6.properties.computed"]
    loose: "all",
    //can be false or a regex. Defaults to node_modules in babel
    ignore: null,
    //can be any regex. Only these files will be transpiled
    only: null,
    //an array of extensions, defaults to [".es6", ".es", ".jsx", ".js"] in babel
    extensions: null
  }