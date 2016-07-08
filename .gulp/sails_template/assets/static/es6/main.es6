/**
 * ES6 FILE FOR {$ controllerName $} 
 * {$ now|date('Y-m-d h:m:s') $}
 */

function hello() {
    var page = '{$rawName$}'
    alert(`Hello, this is ${page}. You can use es6 now.`)
}


hello()

export { hello } 
