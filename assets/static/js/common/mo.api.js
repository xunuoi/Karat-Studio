(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * FOR MO.api
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var _mo_cache = undefined;

function _ref2(rs) {
    // console.log(`fetch complete: ${url}`,  rs)
}

exports['default'] = {
    _init: function _init(_cache) {
        _mo_cache = _cache;
    },

    'fetch': function fetch(url, dataType) {
        function _ref(err) {
            console.log('fetch error: ' + url, err);
        }

        /*let prefix = '/api'
         if(url == '/'){
            prefix = ''
        }*/

        //null and false is OK!
        if (_mo_cache[url] !== undefined) {
            return {
                'done': function done(onDone) {
                    onDone ? onDone(_mo_cache[url]) : '';
                }
            };
        } else {
            return $.ajax({
                'url': url,
                'type': 'POST',
                // 'headers': {
                //     'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                //     'Content-Type': 'text/html; charset=utf-8'
                // },

                'dataType': dataType || 'json'
            }).fail(_ref).done(function (data) {
                //if succeed, cache the res data
                _mo_cache[url] = data;
            }).complete(_ref2);
        }
    }
};
module.exports = exports['default'];
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vbW8uYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBGT1IgTU8uYXBpXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xudmFyIF9tb19jYWNoZSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gX3JlZjIocnMpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhgZmV0Y2ggY29tcGxldGU6ICR7dXJsfWAsICBycylcbn1cblxuZXhwb3J0c1snZGVmYXVsdCddID0ge1xuICAgIF9pbml0OiBmdW5jdGlvbiBfaW5pdChfY2FjaGUpIHtcbiAgICAgICAgX21vX2NhY2hlID0gX2NhY2hlO1xuICAgIH0sXG5cbiAgICAnZmV0Y2gnOiBmdW5jdGlvbiBmZXRjaCh1cmwsIGRhdGFUeXBlKSB7XG4gICAgICAgIGZ1bmN0aW9uIF9yZWYoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZmV0Y2ggZXJyb3I6ICcgKyB1cmwsIGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvKmxldCBwcmVmaXggPSAnL2FwaSdcbiAgICAgICAgIGlmKHVybCA9PSAnLycpe1xuICAgICAgICAgICAgcHJlZml4ID0gJydcbiAgICAgICAgfSovXG5cbiAgICAgICAgLy9udWxsIGFuZCBmYWxzZSBpcyBPSyFcbiAgICAgICAgaWYgKF9tb19jYWNoZVt1cmxdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ2RvbmUnOiBmdW5jdGlvbiBkb25lKG9uRG9uZSkge1xuICAgICAgICAgICAgICAgICAgICBvbkRvbmUgPyBvbkRvbmUoX21vX2NhY2hlW3VybF0pIDogJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICd1cmwnOiB1cmwsXG4gICAgICAgICAgICAgICAgJ3R5cGUnOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgLy8gJ2hlYWRlcnMnOiB7XG4gICAgICAgICAgICAgICAgLy8gICAgICdBY2NlcHQnOiBcInRleHQvaHRtbCxhcHBsaWNhdGlvbi94aHRtbCt4bWwsYXBwbGljYXRpb24veG1sO3E9MC45LGltYWdlL3dlYnAsKi8qO3E9MC44XCIsXG4gICAgICAgICAgICAgICAgLy8gICAgICdDb250ZW50LVR5cGUnOiAndGV4dC9odG1sOyBjaGFyc2V0PXV0Zi04J1xuICAgICAgICAgICAgICAgIC8vIH0sXG5cbiAgICAgICAgICAgICAgICAnZGF0YVR5cGUnOiBkYXRhVHlwZSB8fCAnanNvbidcbiAgICAgICAgICAgIH0pLmZhaWwoX3JlZikuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vaWYgc3VjY2VlZCwgY2FjaGUgdGhlIHJlcyBkYXRhXG4gICAgICAgICAgICAgICAgX21vX2NhY2hlW3VybF0gPSBkYXRhO1xuICAgICAgICAgICAgfSkuY29tcGxldGUoX3JlZjIpO1xuICAgICAgICB9XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyJdfQ==
