(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * FOR MO.pjax
 * API:
 * MO.state: Set Current State and Page-Fn
 * MO.touch: Push to Next State, and store the state and data
 * MO.config: Config the options for MO.pjax
 */

// let _mo_events = {}
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var _pjax_req = {};
var _mo_cache = {};
var _mo_cache_time = {};

var opts = {
    'type': 'POST',
    'cache': true,
    // 'cacheExpires': 10000, // 0 means always avaliable
    'storage': true,

    //如果storageExpires设置为0或false，永不过期
    'storageExpires': 43200000, // 12 hours

    'dataType': 'html',
    beforeSend: function beforeSend(req) {
        req.setRequestHeader("Http-Request-Pjax", "Fragment");
    }
};

/**
 * INIT EVENTS
 */

function _ref(e) {
    // console.log('*on popstate: ', e)

    if (history.state && e.state) {
        _execute(e.state);
    }
}

function initEvents() {
    window.addEventListener('popstate', _ref, false);
}

initEvents();

/**
 * CORE PJAX CODE
 * @type {Object}
 */

var _api = {
    fetch: function fetch(url, dataType, _fetch) {
        function _ref2(err) {
            console.error('fetch error: ' + url, err);
        }

        /*let prefix = '/api'
         if(url == '/'){
            prefix = ''
        }*/

        //null and false is OK!, but undefined is not in cache
        var cacheData = _cache(url);
        // console.log(url, cacheData)

        function _ref3(data) {
            //if succeed, cache the res data
            // _cache(url, data)
            opts['cache'] ? _cache(url, data) : '';
            opts['storage'] ? _store(url, data) : '';
        }

        if (!_fetch || cacheData !== undefined) {
            var _ret = (function () {

                var _pObj = {
                    'done': function done(_done) {
                        _done ? _done(cacheData) : '';
                        return _pObj;
                    }
                };

                return {
                    v: _pObj
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        } else {
            return $.ajax($.extend({
                'url': url
            }, opts)).fail(_ref2).done(_ref3);
            /*.complete((rs)=>{
                console.log(`fetch complete: ${url}`,  rs)
            })*/
        }
    }
};

/**
 * Store data in localStorage
 */

function _removeStorage(k, _tsK) {
    var tsK = _tsK || k + '_createdAt';

    localStorage.removeItem(k);
    localStorage.removeItem(tsK);
}

/**
 * Store data in storage
 */

function _store(k, v) {
    if (!opts['storage']) return;

    var tsK = k + '_createdAt';

    if (v !== undefined) {

        localStorage.setItem(k, v);

        var ts = new Date().getTime();
        localStorage.setItem(tsK, ts);

        // _mo_cache_time[k] = (new Date()).getTime()
    } else if (k) {

            var ts = parseInt(localStorage.getItem(tsK)),
                cs = new Date().getTime();

            var d = localStorage.getItem(k);

            //如果设置了storageExpires ，并且storage过期了
            //如果storageExpires设置为0或false，永不过期
            if (d && ts && opts['storageExpires'] && cs - ts >= opts['storageExpires']) {
                _removeStorage(k, tsK);

                return;
            }

            if (d == 'null') {
                d = null;
            }
            if (d == 'undefined') {
                d = undefined;
            }

            //传递出去undefined，避免Null被认为是有效值
            if (d == null) {
                d = undefined;
            }

            //同步到内存Cache
            if (d) _cache(k, d);

            return d;
        }
}

function _removeCache(k) {
    delete _mo_cache[k];
    delete _mo_cache_time[k];
}

function _cache(k, v) {
    if (!opts['cache']) return;

    /**
     * if v is null, that also a avaliable data
     * only undefined is Invalid!
     */
    if (v !== undefined) {

        _mo_cache[k] = v;
        _mo_cache_time[k] = new Date().getTime();

        return;
    } else if (k) {

        //如果设定了过期时间,且过期时间>0。如果设置为0，代表永不过期
        if (opts['cacheExpires']) {
            var _v = _mo_cache[k],
                _createdAt = _mo_cache_time[k];

            if (_v !== undefined) {

                var _current = new Date().getTime(),
                    _diff = _current - _createdAt;

                console.log("diff: ", _diff);

                if (_diff < opts['cacheExpires']) {
                    console.log('Cache Hit: ', k);
                    return _v;
                } else {
                    console.log('Cache Expired: ', k);
                    //then api.fetch will update the Cache
                    _removeCache(k);
                    /**
                     * 如果cache也过期了，默认认为storage中
                     * 也过期了，清除掉storage
                     */
                    _removeStorage(k);

                    return;
                }
            } else {
                //检查是否storagez中存在
                return _store(k);
            }

            //如果没有设定过期时间，cache永久有效
        } else {
                return _mo_cache[k] || _store(k);
            }
    } else {
        throw Error('Unknown Error In _cache');
    }
}

function _execute(state) {

    //trigger events
    return _trigger(state);
}

function _register(apiUrl, fn) {
    var _fetch = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    //update events fn
    // delete _mo_events[apiUrl]
    // _mo_events[apiUrl] = fn

    delete _pjax_req[apiUrl];

    _pjax_req[apiUrl] = {
        'fn': fn,
        'fetch': _fetch
    };
}

function _trigger(state) {

    var apiUrl = state['url'];
    var title = state['title'];
    var dataType = state['dataType'];

    var _fetch = undefined,
        onpopFn = undefined;

    // let onpopFn = _mo_events[apiUrl]
    var _req = _pjax_req[apiUrl];
    if (_req) {
        onpopFn = _req['fn'];
        _fetch = _req['fetch'];
    }

    // console.log(`*trigger: ${apiUrl}`)

    return _api.fetch(apiUrl, dataType, _fetch).done(function (res) {
        document.title = title;
    }).done(onpopFn);
}

function touch(apiUrl, title, onpopFn) {
    var _fetch = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

    _register(apiUrl, onpopFn, _fetch);

    var state = {
        'url': apiUrl,
        'title': title,
        'dataType': opts['dataType']
    };

    /**
     * 此时push的是下个当前状态，不是上个状态。
     * 上个状态，在操作之前的时候就确定了
     */
    history.pushState(state, document.title, apiUrl);

    return _execute(state);
}

function state(url, title, onpopFn) {
    var _data = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    var _fetch = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

    var _fire = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];

    _register(url, onpopFn, _fetch);

    // let _data = null
    //if data is null, it will be also cached!
    _cache(url, _data);

    var _state = {
        'url': url,
        'title': title,
        'dataType': opts['dataType']
    };

    if (_fire) _execute(_state);

    history.replaceState(_state, title, url);
}

function go(aEle, ctn, cb) {
    var evtType = arguments.length <= 3 || arguments[3] === undefined ? 'click' : arguments[3];

    function _ref4(res) {
        // debugger;
        var $doc = $(res);
        var t = $doc.text();

        $(ctn).html(t);
        cb ? cb(t) : '';
    }

    var $ctn = $(ctn),
        rawHtml = $ctn.html();

    state(location.pathname, document.title, function (_data) {
        $ctn.html(_data);
    }, rawHtml, false, false);

    $(aEle).on(evtType, function (evt) {
        evt.stopPropagation();

        var $a = $(this),

        // $ctn = $(ctn),
        url = $a.attr('href'),
            title = $a.html();
        try {

            touch(url, title, _ref4);
        } catch (err) {
            console.error(err);
        }

        //stop propagation
        return false;
    });
}

function define(ctn, _data) {
    var title = arguments.length <= 2 || arguments[2] === undefined ? document.title : arguments[2];
    var url = arguments.length <= 3 || arguments[3] === undefined ? location.pathname : arguments[3];

    MO.state(url, title, function (_data) {
        $(ctn).html(_data);
    }, _data, false, true);
}

function config(conf) {
    if (conf) return $.extend(opts, conf);else return opts;
}

exports.go = go;
exports.define = define;
exports.touch = touch;
exports.state = state;
exports.config = config;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vbW8ucGpheC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogRk9SIE1PLnBqYXhcbiAqIEFQSTpcbiAqIE1PLnN0YXRlOiBTZXQgQ3VycmVudCBTdGF0ZSBhbmQgUGFnZS1GblxuICogTU8udG91Y2g6IFB1c2ggdG8gTmV4dCBTdGF0ZSwgYW5kIHN0b3JlIHRoZSBzdGF0ZSBhbmQgZGF0YVxuICogTU8uY29uZmlnOiBDb25maWcgdGhlIG9wdGlvbnMgZm9yIE1PLnBqYXhcbiAqL1xuXG4vLyBsZXQgX21vX2V2ZW50cyA9IHt9XG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgX3BqYXhfcmVxID0ge307XG52YXIgX21vX2NhY2hlID0ge307XG52YXIgX21vX2NhY2hlX3RpbWUgPSB7fTtcblxudmFyIG9wdHMgPSB7XG4gICAgJ3R5cGUnOiAnUE9TVCcsXG4gICAgJ2NhY2hlJzogdHJ1ZSxcbiAgICAvLyAnY2FjaGVFeHBpcmVzJzogMTAwMDAsIC8vIDAgbWVhbnMgYWx3YXlzIGF2YWxpYWJsZVxuICAgICdzdG9yYWdlJzogdHJ1ZSxcblxuICAgIC8v5aaC5p6cc3RvcmFnZUV4cGlyZXPorr7nva7kuLow5oiWZmFsc2XvvIzmsLjkuI3ov4fmnJ9cbiAgICAnc3RvcmFnZUV4cGlyZXMnOiA0MzIwMDAwMCwgLy8gMTIgaG91cnNcblxuICAgICdkYXRhVHlwZSc6ICdodG1sJyxcbiAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiBiZWZvcmVTZW5kKHJlcSkge1xuICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcIkh0dHAtUmVxdWVzdC1QamF4XCIsIFwiRnJhZ21lbnRcIik7XG4gICAgfVxufTtcblxuLyoqXG4gKiBJTklUIEVWRU5UU1xuICovXG5cbmZ1bmN0aW9uIF9yZWYoZSkge1xuICAgIC8vIGNvbnNvbGUubG9nKCcqb24gcG9wc3RhdGU6ICcsIGUpXG5cbiAgICBpZiAoaGlzdG9yeS5zdGF0ZSAmJiBlLnN0YXRlKSB7XG4gICAgICAgIF9leGVjdXRlKGUuc3RhdGUpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaW5pdEV2ZW50cygpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBfcmVmLCBmYWxzZSk7XG59XG5cbmluaXRFdmVudHMoKTtcblxuLyoqXG4gKiBDT1JFIFBKQVggQ09ERVxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG52YXIgX2FwaSA9IHtcbiAgICBmZXRjaDogZnVuY3Rpb24gZmV0Y2godXJsLCBkYXRhVHlwZSwgX2ZldGNoKSB7XG4gICAgICAgIGZ1bmN0aW9uIF9yZWYyKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignZmV0Y2ggZXJyb3I6ICcgKyB1cmwsIGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvKmxldCBwcmVmaXggPSAnL2FwaSdcbiAgICAgICAgIGlmKHVybCA9PSAnLycpe1xuICAgICAgICAgICAgcHJlZml4ID0gJydcbiAgICAgICAgfSovXG5cbiAgICAgICAgLy9udWxsIGFuZCBmYWxzZSBpcyBPSyEsIGJ1dCB1bmRlZmluZWQgaXMgbm90IGluIGNhY2hlXG4gICAgICAgIHZhciBjYWNoZURhdGEgPSBfY2FjaGUodXJsKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2codXJsLCBjYWNoZURhdGEpXG5cbiAgICAgICAgZnVuY3Rpb24gX3JlZjMoZGF0YSkge1xuICAgICAgICAgICAgLy9pZiBzdWNjZWVkLCBjYWNoZSB0aGUgcmVzIGRhdGFcbiAgICAgICAgICAgIC8vIF9jYWNoZSh1cmwsIGRhdGEpXG4gICAgICAgICAgICBvcHRzWydjYWNoZSddID8gX2NhY2hlKHVybCwgZGF0YSkgOiAnJztcbiAgICAgICAgICAgIG9wdHNbJ3N0b3JhZ2UnXSA/IF9zdG9yZSh1cmwsIGRhdGEpIDogJyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIV9mZXRjaCB8fCBjYWNoZURhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIF9yZXQgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIF9wT2JqID0ge1xuICAgICAgICAgICAgICAgICAgICAnZG9uZSc6IGZ1bmN0aW9uIGRvbmUoX2RvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kb25lID8gX2RvbmUoY2FjaGVEYXRhKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9wT2JqO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHY6IF9wT2JqXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgX3JldCA9PT0gJ29iamVjdCcpIHJldHVybiBfcmV0LnY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJC5hamF4KCQuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAndXJsJzogdXJsXG4gICAgICAgICAgICB9LCBvcHRzKSkuZmFpbChfcmVmMikuZG9uZShfcmVmMyk7XG4gICAgICAgICAgICAvKi5jb21wbGV0ZSgocnMpPT57XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGZldGNoIGNvbXBsZXRlOiAke3VybH1gLCAgcnMpXG4gICAgICAgICAgICB9KSovXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIFN0b3JlIGRhdGEgaW4gbG9jYWxTdG9yYWdlXG4gKi9cblxuZnVuY3Rpb24gX3JlbW92ZVN0b3JhZ2UoaywgX3RzSykge1xuICAgIHZhciB0c0sgPSBfdHNLIHx8IGsgKyAnX2NyZWF0ZWRBdCc7XG5cbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrKTtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0c0spO1xufVxuXG4vKipcbiAqIFN0b3JlIGRhdGEgaW4gc3RvcmFnZVxuICovXG5cbmZ1bmN0aW9uIF9zdG9yZShrLCB2KSB7XG4gICAgaWYgKCFvcHRzWydzdG9yYWdlJ10pIHJldHVybjtcblxuICAgIHZhciB0c0sgPSBrICsgJ19jcmVhdGVkQXQnO1xuXG4gICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGssIHYpO1xuXG4gICAgICAgIHZhciB0cyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0c0ssIHRzKTtcblxuICAgICAgICAvLyBfbW9fY2FjaGVfdGltZVtrXSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICB9IGVsc2UgaWYgKGspIHtcblxuICAgICAgICAgICAgdmFyIHRzID0gcGFyc2VJbnQobG9jYWxTdG9yYWdlLmdldEl0ZW0odHNLKSksXG4gICAgICAgICAgICAgICAgY3MgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgdmFyIGQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrKTtcblxuICAgICAgICAgICAgLy/lpoLmnpzorr7nva7kuoZzdG9yYWdlRXhwaXJlcyDvvIzlubbkuJRzdG9yYWdl6L+H5pyf5LqGXG4gICAgICAgICAgICAvL+WmguaenHN0b3JhZ2VFeHBpcmVz6K6+572u5Li6MOaIlmZhbHNl77yM5rC45LiN6L+H5pyfXG4gICAgICAgICAgICBpZiAoZCAmJiB0cyAmJiBvcHRzWydzdG9yYWdlRXhwaXJlcyddICYmIGNzIC0gdHMgPj0gb3B0c1snc3RvcmFnZUV4cGlyZXMnXSkge1xuICAgICAgICAgICAgICAgIF9yZW1vdmVTdG9yYWdlKGssIHRzSyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkID09ICdudWxsJykge1xuICAgICAgICAgICAgICAgIGQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGQgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+S8oOmAkuWHuuWOu3VuZGVmaW5lZO+8jOmBv+WFjU51bGzooqvorqTkuLrmmK/mnInmlYjlgLxcbiAgICAgICAgICAgIGlmIChkID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+WQjOatpeWIsOWGheWtmENhY2hlXG4gICAgICAgICAgICBpZiAoZCkgX2NhY2hlKGssIGQpO1xuXG4gICAgICAgICAgICByZXR1cm4gZDtcbiAgICAgICAgfVxufVxuXG5mdW5jdGlvbiBfcmVtb3ZlQ2FjaGUoaykge1xuICAgIGRlbGV0ZSBfbW9fY2FjaGVba107XG4gICAgZGVsZXRlIF9tb19jYWNoZV90aW1lW2tdO1xufVxuXG5mdW5jdGlvbiBfY2FjaGUoaywgdikge1xuICAgIGlmICghb3B0c1snY2FjaGUnXSkgcmV0dXJuO1xuXG4gICAgLyoqXG4gICAgICogaWYgdiBpcyBudWxsLCB0aGF0IGFsc28gYSBhdmFsaWFibGUgZGF0YVxuICAgICAqIG9ubHkgdW5kZWZpbmVkIGlzIEludmFsaWQhXG4gICAgICovXG4gICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgIF9tb19jYWNoZVtrXSA9IHY7XG4gICAgICAgIF9tb19jYWNoZV90aW1lW2tdID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoaykge1xuXG4gICAgICAgIC8v5aaC5p6c6K6+5a6a5LqG6L+H5pyf5pe26Ze0LOS4lOi/h+acn+aXtumXtD4w44CC5aaC5p6c6K6+572u5Li6MO+8jOS7o+ihqOawuOS4jei/h+acn1xuICAgICAgICBpZiAob3B0c1snY2FjaGVFeHBpcmVzJ10pIHtcbiAgICAgICAgICAgIHZhciBfdiA9IF9tb19jYWNoZVtrXSxcbiAgICAgICAgICAgICAgICBfY3JlYXRlZEF0ID0gX21vX2NhY2hlX3RpbWVba107XG5cbiAgICAgICAgICAgIGlmIChfdiAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgX2N1cnJlbnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICAgICAgICAgICAgICAgICAgX2RpZmYgPSBfY3VycmVudCAtIF9jcmVhdGVkQXQ7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImRpZmY6IFwiLCBfZGlmZik7XG5cbiAgICAgICAgICAgICAgICBpZiAoX2RpZmYgPCBvcHRzWydjYWNoZUV4cGlyZXMnXSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FjaGUgSGl0OiAnLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF92O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYWNoZSBFeHBpcmVkOiAnLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgLy90aGVuIGFwaS5mZXRjaCB3aWxsIHVwZGF0ZSB0aGUgQ2FjaGVcbiAgICAgICAgICAgICAgICAgICAgX3JlbW92ZUNhY2hlKGspO1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICog5aaC5p6cY2FjaGXkuZ/ov4fmnJ/kuobvvIzpu5jorqTorqTkuLpzdG9yYWdl5LitXG4gICAgICAgICAgICAgICAgICAgICAqIOS5n+i/h+acn+S6hu+8jOa4hemZpOaOiXN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIF9yZW1vdmVTdG9yYWdlKGspO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8v5qOA5p+l5piv5ZCmc3RvcmFnZXrkuK3lrZjlnKhcbiAgICAgICAgICAgICAgICByZXR1cm4gX3N0b3JlKGspO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+WmguaenOayoeacieiuvuWumui/h+acn+aXtumXtO+8jGNhY2hl5rC45LmF5pyJ5pWIXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9tb19jYWNoZVtrXSB8fCBfc3RvcmUoayk7XG4gICAgICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gRXJyb3IgSW4gX2NhY2hlJyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBfZXhlY3V0ZShzdGF0ZSkge1xuXG4gICAgLy90cmlnZ2VyIGV2ZW50c1xuICAgIHJldHVybiBfdHJpZ2dlcihzdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIF9yZWdpc3RlcihhcGlVcmwsIGZuKSB7XG4gICAgdmFyIF9mZXRjaCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IHRydWUgOiBhcmd1bWVudHNbMl07XG5cbiAgICAvL3VwZGF0ZSBldmVudHMgZm5cbiAgICAvLyBkZWxldGUgX21vX2V2ZW50c1thcGlVcmxdXG4gICAgLy8gX21vX2V2ZW50c1thcGlVcmxdID0gZm5cblxuICAgIGRlbGV0ZSBfcGpheF9yZXFbYXBpVXJsXTtcblxuICAgIF9wamF4X3JlcVthcGlVcmxdID0ge1xuICAgICAgICAnZm4nOiBmbixcbiAgICAgICAgJ2ZldGNoJzogX2ZldGNoXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gX3RyaWdnZXIoc3RhdGUpIHtcblxuICAgIHZhciBhcGlVcmwgPSBzdGF0ZVsndXJsJ107XG4gICAgdmFyIHRpdGxlID0gc3RhdGVbJ3RpdGxlJ107XG4gICAgdmFyIGRhdGFUeXBlID0gc3RhdGVbJ2RhdGFUeXBlJ107XG5cbiAgICB2YXIgX2ZldGNoID0gdW5kZWZpbmVkLFxuICAgICAgICBvbnBvcEZuID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gbGV0IG9ucG9wRm4gPSBfbW9fZXZlbnRzW2FwaVVybF1cbiAgICB2YXIgX3JlcSA9IF9wamF4X3JlcVthcGlVcmxdO1xuICAgIGlmIChfcmVxKSB7XG4gICAgICAgIG9ucG9wRm4gPSBfcmVxWydmbiddO1xuICAgICAgICBfZmV0Y2ggPSBfcmVxWydmZXRjaCddO1xuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKGAqdHJpZ2dlcjogJHthcGlVcmx9YClcblxuICAgIHJldHVybiBfYXBpLmZldGNoKGFwaVVybCwgZGF0YVR5cGUsIF9mZXRjaCkuZG9uZShmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGRvY3VtZW50LnRpdGxlID0gdGl0bGU7XG4gICAgfSkuZG9uZShvbnBvcEZuKTtcbn1cblxuZnVuY3Rpb24gdG91Y2goYXBpVXJsLCB0aXRsZSwgb25wb3BGbikge1xuICAgIHZhciBfZmV0Y2ggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyB0cnVlIDogYXJndW1lbnRzWzNdO1xuXG4gICAgX3JlZ2lzdGVyKGFwaVVybCwgb25wb3BGbiwgX2ZldGNoKTtcblxuICAgIHZhciBzdGF0ZSA9IHtcbiAgICAgICAgJ3VybCc6IGFwaVVybCxcbiAgICAgICAgJ3RpdGxlJzogdGl0bGUsXG4gICAgICAgICdkYXRhVHlwZSc6IG9wdHNbJ2RhdGFUeXBlJ11cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICog5q2k5pe2cHVzaOeahOaYr+S4i+S4quW9k+WJjeeKtuaAge+8jOS4jeaYr+S4iuS4queKtuaAgeOAglxuICAgICAqIOS4iuS4queKtuaAge+8jOWcqOaTjeS9nOS5i+WJjeeahOaXtuWAmeWwseehruWumuS6hlxuICAgICAqL1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKHN0YXRlLCBkb2N1bWVudC50aXRsZSwgYXBpVXJsKTtcblxuICAgIHJldHVybiBfZXhlY3V0ZShzdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIHN0YXRlKHVybCwgdGl0bGUsIG9ucG9wRm4pIHtcbiAgICB2YXIgX2RhdGEgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyBudWxsIDogYXJndW1lbnRzWzNdO1xuXG4gICAgdmFyIF9mZXRjaCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNCB8fCBhcmd1bWVudHNbNF0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzRdO1xuXG4gICAgdmFyIF9maXJlID0gYXJndW1lbnRzLmxlbmd0aCA8PSA1IHx8IGFyZ3VtZW50c1s1XSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbNV07XG5cbiAgICBfcmVnaXN0ZXIodXJsLCBvbnBvcEZuLCBfZmV0Y2gpO1xuXG4gICAgLy8gbGV0IF9kYXRhID0gbnVsbFxuICAgIC8vaWYgZGF0YSBpcyBudWxsLCBpdCB3aWxsIGJlIGFsc28gY2FjaGVkIVxuICAgIF9jYWNoZSh1cmwsIF9kYXRhKTtcblxuICAgIHZhciBfc3RhdGUgPSB7XG4gICAgICAgICd1cmwnOiB1cmwsXG4gICAgICAgICd0aXRsZSc6IHRpdGxlLFxuICAgICAgICAnZGF0YVR5cGUnOiBvcHRzWydkYXRhVHlwZSddXG4gICAgfTtcblxuICAgIGlmIChfZmlyZSkgX2V4ZWN1dGUoX3N0YXRlKTtcblxuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKF9zdGF0ZSwgdGl0bGUsIHVybCk7XG59XG5cbmZ1bmN0aW9uIGdvKGFFbGUsIGN0biwgY2IpIHtcbiAgICB2YXIgZXZ0VHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/ICdjbGljaycgOiBhcmd1bWVudHNbM107XG5cbiAgICBmdW5jdGlvbiBfcmVmNChyZXMpIHtcbiAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgIHZhciAkZG9jID0gJChyZXMpO1xuICAgICAgICB2YXIgdCA9ICRkb2MudGV4dCgpO1xuXG4gICAgICAgICQoY3RuKS5odG1sKHQpO1xuICAgICAgICBjYiA/IGNiKHQpIDogJyc7XG4gICAgfVxuXG4gICAgdmFyICRjdG4gPSAkKGN0biksXG4gICAgICAgIHJhd0h0bWwgPSAkY3RuLmh0bWwoKTtcblxuICAgIHN0YXRlKGxvY2F0aW9uLnBhdGhuYW1lLCBkb2N1bWVudC50aXRsZSwgZnVuY3Rpb24gKF9kYXRhKSB7XG4gICAgICAgICRjdG4uaHRtbChfZGF0YSk7XG4gICAgfSwgcmF3SHRtbCwgZmFsc2UsIGZhbHNlKTtcblxuICAgICQoYUVsZSkub24oZXZ0VHlwZSwgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgdmFyICRhID0gJCh0aGlzKSxcblxuICAgICAgICAvLyAkY3RuID0gJChjdG4pLFxuICAgICAgICB1cmwgPSAkYS5hdHRyKCdocmVmJyksXG4gICAgICAgICAgICB0aXRsZSA9ICRhLmh0bWwoKTtcbiAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgdG91Y2godXJsLCB0aXRsZSwgX3JlZjQpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vc3RvcCBwcm9wYWdhdGlvblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGRlZmluZShjdG4sIF9kYXRhKSB7XG4gICAgdmFyIHRpdGxlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gZG9jdW1lbnQudGl0bGUgOiBhcmd1bWVudHNbMl07XG4gICAgdmFyIHVybCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMyB8fCBhcmd1bWVudHNbM10gPT09IHVuZGVmaW5lZCA/IGxvY2F0aW9uLnBhdGhuYW1lIDogYXJndW1lbnRzWzNdO1xuXG4gICAgTU8uc3RhdGUodXJsLCB0aXRsZSwgZnVuY3Rpb24gKF9kYXRhKSB7XG4gICAgICAgICQoY3RuKS5odG1sKF9kYXRhKTtcbiAgICB9LCBfZGF0YSwgZmFsc2UsIHRydWUpO1xufVxuXG5mdW5jdGlvbiBjb25maWcoY29uZikge1xuICAgIGlmIChjb25mKSByZXR1cm4gJC5leHRlbmQob3B0cywgY29uZik7ZWxzZSByZXR1cm4gb3B0cztcbn1cblxuZXhwb3J0cy5nbyA9IGdvO1xuZXhwb3J0cy5kZWZpbmUgPSBkZWZpbmU7XG5leHBvcnRzLnRvdWNoID0gdG91Y2g7XG5leHBvcnRzLnN0YXRlID0gc3RhdGU7XG5leHBvcnRzLmNvbmZpZyA9IGNvbmZpZzsiXX0=
