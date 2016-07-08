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
},{}],2:[function(require,module,exports){
/**
 * FOR MO.touch
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _moApi = require('mo.api');

var _api = _interopRequireWildcard(_moApi);

var _mo_events = {};
var _mo_cache = {};

//init the _mo_cache
_api._init(_mo_cache);

/**
 * INIT EVENTS
 */
window.addEventListener('popstate', function (e) {
    console.log('*on popstate: ', e);

    if (history.state) {
        var _state = e.state;

        var apiUrl = _state['url'];
        var onpopFn = _mo_events[apiUrl];
        // console.log(state)
        _execute(_state).then(onpopFn);
    }
}, false);

/**
 * CORE PJAX CODE
 * @type {Object}
 */

function _execute(stateObj, dataType) {

    //trigger events
    return _trigger(stateObj, dataType);

    //sent async ajax request
    // return _api['fetch'](apiUrl, dataType)
}

function _register(apiUrl, fn) {
    //update events fn
    delete _mo_events[apiUrl];

    _mo_events[apiUrl] = fn;
}

function _trigger(stateObj, dataType) {

    return new Promise(function (resolve, reject) {

        var apiUrl = stateObj['url'];
        var title = stateObj['title'];

        console.log('*trigger: ' + apiUrl);

        return _api.fetch(apiUrl, dataType).success(function (res) {
            document.title = title;
            resolve(res);
        }).fail(function (err) {
            reject(err);
        });
    });
}

function touch(apiUrl, title) {
    // _register(apiUrl, onpopFn)

    var state = {
        'url': apiUrl,
        'title': title
    };

    /**
     * 此时push的是下个当前状态，不是上个状态。
     * 上个状态，在操作之前的时候就确定了
     */
    history.pushState(state, document.title, apiUrl);

    return _execute(state, 'html');
}

function state(url, title, onpopFn, data) {
    _register(url, onpopFn);
    //if data is null, it will be also cached!
    _mo_cache[url] = data === undefined ? undefined : data;

    history.replaceState({
        'url': url,
        'title': title
    }, title, '');

    // return
}

exports.touch = touch;
exports.state = state;
},{"mo.api":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vbW8uYXBpLmpzIiwic3RhdGljLy50bXAvY29tbW9uL21vLnBqYXgucHJvbWlzZS5kZWJ1Zy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEZPUiBNTy5hcGlcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgX21vX2NhY2hlID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBfcmVmMihycykge1xuICAgIC8vIGNvbnNvbGUubG9nKGBmZXRjaCBjb21wbGV0ZTogJHt1cmx9YCwgIHJzKVxufVxuXG5leHBvcnRzWydkZWZhdWx0J10gPSB7XG4gICAgX2luaXQ6IGZ1bmN0aW9uIF9pbml0KF9jYWNoZSkge1xuICAgICAgICBfbW9fY2FjaGUgPSBfY2FjaGU7XG4gICAgfSxcblxuICAgICdmZXRjaCc6IGZ1bmN0aW9uIGZldGNoKHVybCwgZGF0YVR5cGUpIHtcbiAgICAgICAgZnVuY3Rpb24gX3JlZihlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmZXRjaCBlcnJvcjogJyArIHVybCwgZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qbGV0IHByZWZpeCA9ICcvYXBpJ1xuICAgICAgICAgaWYodXJsID09ICcvJyl7XG4gICAgICAgICAgICBwcmVmaXggPSAnJ1xuICAgICAgICB9Ki9cblxuICAgICAgICAvL251bGwgYW5kIGZhbHNlIGlzIE9LIVxuICAgICAgICBpZiAoX21vX2NhY2hlW3VybF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnZG9uZSc6IGZ1bmN0aW9uIGRvbmUob25Eb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uRG9uZSA/IG9uRG9uZShfbW9fY2FjaGVbdXJsXSkgOiAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICAgICAgJ3VybCc6IHVybCxcbiAgICAgICAgICAgICAgICAndHlwZSc6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICAvLyAnaGVhZGVycyc6IHtcbiAgICAgICAgICAgICAgICAvLyAgICAgJ0FjY2VwdCc6IFwidGV4dC9odG1sLGFwcGxpY2F0aW9uL3hodG1sK3htbCxhcHBsaWNhdGlvbi94bWw7cT0wLjksaW1hZ2Uvd2VicCwqLyo7cT0wLjhcIixcbiAgICAgICAgICAgICAgICAvLyAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L2h0bWw7IGNoYXJzZXQ9dXRmLTgnXG4gICAgICAgICAgICAgICAgLy8gfSxcblxuICAgICAgICAgICAgICAgICdkYXRhVHlwZSc6IGRhdGFUeXBlIHx8ICdqc29uJ1xuICAgICAgICAgICAgfSkuZmFpbChfcmVmKS5kb25lKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgLy9pZiBzdWNjZWVkLCBjYWNoZSB0aGUgcmVzIGRhdGFcbiAgICAgICAgICAgICAgICBfbW9fY2FjaGVbdXJsXSA9IGRhdGE7XG4gICAgICAgICAgICB9KS5jb21wbGV0ZShfcmVmMik7XG4gICAgICAgIH1cbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLyoqXG4gKiBGT1IgTU8udG91Y2hcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikgeyBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7IHJldHVybiBvYmo7IH0gZWxzZSB7IHZhciBuZXdPYmogPSB7fTsgaWYgKG9iaiAhPSBudWxsKSB7IGZvciAodmFyIGtleSBpbiBvYmopIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07IH0gfSBuZXdPYmpbJ2RlZmF1bHQnXSA9IG9iajsgcmV0dXJuIG5ld09iajsgfSB9XG5cbnZhciBfbW9BcGkgPSByZXF1aXJlKCdtby5hcGknKTtcblxudmFyIF9hcGkgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfbW9BcGkpO1xuXG52YXIgX21vX2V2ZW50cyA9IHt9O1xudmFyIF9tb19jYWNoZSA9IHt9O1xuXG4vL2luaXQgdGhlIF9tb19jYWNoZVxuX2FwaS5faW5pdChfbW9fY2FjaGUpO1xuXG4vKipcbiAqIElOSVQgRVZFTlRTXG4gKi9cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgY29uc29sZS5sb2coJypvbiBwb3BzdGF0ZTogJywgZSk7XG5cbiAgICBpZiAoaGlzdG9yeS5zdGF0ZSkge1xuICAgICAgICB2YXIgX3N0YXRlID0gZS5zdGF0ZTtcblxuICAgICAgICB2YXIgYXBpVXJsID0gX3N0YXRlWyd1cmwnXTtcbiAgICAgICAgdmFyIG9ucG9wRm4gPSBfbW9fZXZlbnRzW2FwaVVybF07XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHN0YXRlKVxuICAgICAgICBfZXhlY3V0ZShfc3RhdGUpLnRoZW4ob25wb3BGbik7XG4gICAgfVxufSwgZmFsc2UpO1xuXG4vKipcbiAqIENPUkUgUEpBWCBDT0RFXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIF9leGVjdXRlKHN0YXRlT2JqLCBkYXRhVHlwZSkge1xuXG4gICAgLy90cmlnZ2VyIGV2ZW50c1xuICAgIHJldHVybiBfdHJpZ2dlcihzdGF0ZU9iaiwgZGF0YVR5cGUpO1xuXG4gICAgLy9zZW50IGFzeW5jIGFqYXggcmVxdWVzdFxuICAgIC8vIHJldHVybiBfYXBpWydmZXRjaCddKGFwaVVybCwgZGF0YVR5cGUpXG59XG5cbmZ1bmN0aW9uIF9yZWdpc3RlcihhcGlVcmwsIGZuKSB7XG4gICAgLy91cGRhdGUgZXZlbnRzIGZuXG4gICAgZGVsZXRlIF9tb19ldmVudHNbYXBpVXJsXTtcblxuICAgIF9tb19ldmVudHNbYXBpVXJsXSA9IGZuO1xufVxuXG5mdW5jdGlvbiBfdHJpZ2dlcihzdGF0ZU9iaiwgZGF0YVR5cGUpIHtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cbiAgICAgICAgdmFyIGFwaVVybCA9IHN0YXRlT2JqWyd1cmwnXTtcbiAgICAgICAgdmFyIHRpdGxlID0gc3RhdGVPYmpbJ3RpdGxlJ107XG5cbiAgICAgICAgY29uc29sZS5sb2coJyp0cmlnZ2VyOiAnICsgYXBpVXJsKTtcblxuICAgICAgICByZXR1cm4gX2FwaS5mZXRjaChhcGlVcmwsIGRhdGFUeXBlKS5zdWNjZXNzKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnRpdGxlID0gdGl0bGU7XG4gICAgICAgICAgICByZXNvbHZlKHJlcyk7XG4gICAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiB0b3VjaChhcGlVcmwsIHRpdGxlKSB7XG4gICAgLy8gX3JlZ2lzdGVyKGFwaVVybCwgb25wb3BGbilcblxuICAgIHZhciBzdGF0ZSA9IHtcbiAgICAgICAgJ3VybCc6IGFwaVVybCxcbiAgICAgICAgJ3RpdGxlJzogdGl0bGVcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICog5q2k5pe2cHVzaOeahOaYr+S4i+S4quW9k+WJjeeKtuaAge+8jOS4jeaYr+S4iuS4queKtuaAgeOAglxuICAgICAqIOS4iuS4queKtuaAge+8jOWcqOaTjeS9nOS5i+WJjeeahOaXtuWAmeWwseehruWumuS6hlxuICAgICAqL1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKHN0YXRlLCBkb2N1bWVudC50aXRsZSwgYXBpVXJsKTtcblxuICAgIHJldHVybiBfZXhlY3V0ZShzdGF0ZSwgJ2h0bWwnKTtcbn1cblxuZnVuY3Rpb24gc3RhdGUodXJsLCB0aXRsZSwgb25wb3BGbiwgZGF0YSkge1xuICAgIF9yZWdpc3Rlcih1cmwsIG9ucG9wRm4pO1xuICAgIC8vaWYgZGF0YSBpcyBudWxsLCBpdCB3aWxsIGJlIGFsc28gY2FjaGVkIVxuICAgIF9tb19jYWNoZVt1cmxdID0gZGF0YSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogZGF0YTtcblxuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHtcbiAgICAgICAgJ3VybCc6IHVybCxcbiAgICAgICAgJ3RpdGxlJzogdGl0bGVcbiAgICB9LCB0aXRsZSwgJycpO1xuXG4gICAgLy8gcmV0dXJuXG59XG5cbmV4cG9ydHMudG91Y2ggPSB0b3VjaDtcbmV4cG9ydHMuc3RhdGUgPSBzdGF0ZTsiXX0=
