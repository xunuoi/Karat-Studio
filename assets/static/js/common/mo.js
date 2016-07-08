(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Formatter = (function () {
  function Formatter() {
    _classCallCheck(this, Formatter);
  }

  _createClass(Formatter, [{
    key: 'autolink',
    value: function autolink(_$el) {
      var _target = arguments.length <= 1 || arguments[1] === undefined ? '_blank' : arguments[1];

      var $link = undefined,
          $node = undefined,
          findLinkNode = undefined,
          k = undefined,
          lastIndex = undefined,
          len = undefined,
          linkNodes = undefined,
          match = undefined,
          re = undefined,
          replaceEls = undefined,
          subStr = undefined,
          text = undefined,
          uri = undefined;

      if (_$el == null) {
        throw Error('Need Element');
      }

      var $el = $('<div class"_pre_format_ele">' + (_$el.val() || _$el.html()) + '</div>');

      linkNodes = [];

      findLinkNode = function ($parentNode) {
        return $parentNode.contents().each(function (i, node) {
          var $node, text;
          $node = $(node);
          if ($node.is('a') || $node.closest('a, pre', $el).length) {
            return;
          }
          if (!$node.is('iframe') && $node.contents().length) {
            return findLinkNode($node);
          } else if ((text = $node.text()) && /https?:\/\/|www\./ig.test(text)) {
            return linkNodes.push($node);
          }
        });
      };

      findLinkNode($el);

      re = /(https?:\/\/|www\.)[\w\-\.\?&=\/#%:,@\!\+]+/ig;
      for (k = 0, len = linkNodes.length; k < len; k++) {
        $node = linkNodes[k];
        text = $node.text();
        replaceEls = [];
        match = null;
        lastIndex = 0;
        while ((match = re.exec(text)) !== null) {
          subStr = text.substring(lastIndex, match.index);
          replaceEls.push(document.createTextNode(subStr));
          lastIndex = re.lastIndex;
          uri = /^(http(s)?:\/\/|\/)/.test(match[0]) ? match[0] : 'http://' + match[0];
          $link = $("<a target=\"" + _target + "\" href=\"" + uri + "\" rel=\"nofollow\"></a>").text(match[0]);
          replaceEls.push($link[0]);
        }
        replaceEls.push(document.createTextNode(text.substring(lastIndex)));

        $node.replaceWith($(replaceEls));
      }

      return $el;
    }
  }]);

  return Formatter;
})();

var _formatter = new Formatter();

exports['default'] = _formatter;
module.exports = exports['default'];
},{}],2:[function(require,module,exports){
/**
 * FOR MAOV 
 * jQuery is necessary
 * @author  Cloud
 */

// import * as util from 'mo.util'
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _moPjax = require('mo.pjax');

var pjax = _interopRequireWildcard(_moPjax);

var _moSource = require('mo.source');

var _moUtil = require('mo.util');

var util = _interopRequireWildcard(_moUtil);

var _moFormatter = require('mo.formatter');

var _moFormatter2 = _interopRequireDefault(_moFormatter);

var _export = {
    'go': pjax.go,
    'define': pjax.define,
    'state': pjax.state,
    'touch': pjax.touch,
    'config': pjax.config,
    'preload': _moSource.preload,
    'util': util,
    'formatter': _moFormatter2['default']
};

window.MO = _export;

exports['default'] = _export;
module.exports = exports['default'];
},{"mo.formatter":1,"mo.pjax":3,"mo.source":4,"mo.util":5}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var _component = {
    'source': {
        'img': ['/static/abd.jpg']
    }
};

function addImg(src) {
    //window add img
}

function preload(component) {
    if (component.source && component.source.img) {
        if (typeof component.source.img == 'string') {
            addImg(component.source.img);
        } else {

            //component.source.img.forEach
        }
    }
}

exports.preload = preload;
},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _ref(c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
}

/**
 * FOR MO.util
 */

exports['default'] = {

    getEvent: function getEvent(event) {
        return event ? event : window.event; // or default e
    },
    getTarget: function getTarget(event) {
        //currentTarget是处理事件的调用者，如果document.body.onclick = function(event){}中event.currentTarget ===this===document.body  target是目标
        return event.target || event.srcElement;
    },
    preventDefault: function preventDefault(event) {
        if (event.preventDefault != undefined) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        } //for IE
    },
    stopPropagation: function stopPropagation(event) {
        if (event.stopPropagation != undefined) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },
    killEvent: function killEvent(event) {
        if (typeof event == 'object' && this.getTarget(event) != undefined) {
            this.stopPropagation(event);
            this.preventDefault(event);
            return false;
        } else {
            return false;
        }
    },
    getClientSize: function getClientSize() {
        var winWidth, winHeight;
        if (window.innerWidth) winWidth = window.innerWidth;else if (document.body && document.body.clientWidth) winWidth = document.body.clientWidth;
        // 获取窗口高度
        if (window.innerHeight) winHeight = window.innerHeight;else if (document.body && document.body.clientHeight) winHeight = document.body.clientHeight;
        // 通过深入 Document 内部对 body 进行检测，获取窗口大小
        if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
            winHeight = document.documentElement.clientHeight;
            winWidth = document.documentElement.clientWidth;
        }
        return {
            'width': winWidth,
            'height': winHeight
        };
    },

    addURLParam: function addURLParam(url, name, value) {
        //put the parameters into url
        url += url.indexOf('?') == -1 ? '?' : '&';
        url += encodeURIComponent(name) + '=' + encodeURIComponent(value);

        return url;
    },

    '_guidBase': {},
    getGUID: function getGUID(forWhat) {
        //create the GUID
        var curGUID = 'xxxxxxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, _ref).toUpperCase();

        if (typeof forWhat == 'string') {
            this['_guidBase'][forWhat] = curGUID;
        }

        return curGUID;
    },

    randomNum: function randomNum(min, max) {
        min = parseInt(min);
        max = parseInt(max);
        var range = max - min;
        var rand = Math.random();
        return min + Math.round(rand * range);
    },

    validate: function validate(tar, type) {
        //stone.typeCheck([[type, 'string'], [tar, 'string'] ]);

        switch (type) {

            case 'number':
                return _number_pt = /^\d+(\.\d+)?$/.test(tar);
            case 'integer':
                var _integer_pt = /^(-|\+)?\d+$/;
                return _integer_pt.test(tar);

            case 'mail':
                //MAIL : "^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$",
                var _email_pt = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
                return _email_pt.test(tar);

            case 'tel':
                //TEL : "^0(10|2[0-5789]|\\d{3})-\\d{7,8}$",
                var _tel_pt = /^[0-9]{3,4}(\-|\s)[0-9]{7,8}$/;
                return _tel_pt.test(tar);
            case 'mobile':
                var _mobile_pt = new RegExp('^1(3[0-9]|5[0-35-9]|8[0235-9])\\d{8}$');
                return _mobile_pt.test(tar);
            case 'url':
                var _url_pt = new RegExp('^http[s]?://[\\w\\.\\-]+$');
                return _url_pt.test(tar);
            case 'idcard':
                var _id_pt = new RegExp('((11|12|13|14|15|21|22|23|31|32|33|34|35|36|37|41|42|43|44|45|46|50|51|52|53|54|61|62|63|64|65|71|81|82|91)\\d{4})((((19|20)(([02468][048])|([13579][26]))0229))|((20[0-9][0-9])|(19[0-9][0-9]))((((0[1-9])|(1[0-2]))((0[1-9])|(1\\d)|(2[0-8])))|((((0[1,3-9])|(1[0-2]))(29|30))|(((0[13578])|(1[02]))31))))((\\d{3}(x|X))|(\\d{4}))');
                return _id_pt.test(tar);
            case 'ip':
                var _ip_pt = new RegExp('^((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]|[*])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]|[*])$');
                return _ip_pt.test(tar);
            case 'chinese':
                var _ch_pt = new RegExp('^([一-﨩]|[-])*$');
                return _ch_pt.test(tar);

            // default ==========================================================
            default:
                this.throwError('TypeError', 'No Type Matched: ' + type);

        }

        return false;
    }
};
module.exports = exports['default'];
},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vbW8uZm9ybWF0dGVyLmpzIiwic3RhdGljLy50bXAvY29tbW9uL21vLmpzIiwic3RhdGljLy50bXAvY29tbW9uL21vLnBqYXguanMiLCJzdGF0aWMvLnRtcC9jb21tb24vbW8uc291cmNlLmpzIiwic3RhdGljLy50bXAvY29tbW9uL21vLnV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBGb3JtYXR0ZXIgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBGb3JtYXR0ZXIoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEZvcm1hdHRlcik7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoRm9ybWF0dGVyLCBbe1xuICAgIGtleTogJ2F1dG9saW5rJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYXV0b2xpbmsoXyRlbCkge1xuICAgICAgdmFyIF90YXJnZXQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyAnX2JsYW5rJyA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgdmFyICRsaW5rID0gdW5kZWZpbmVkLFxuICAgICAgICAgICRub2RlID0gdW5kZWZpbmVkLFxuICAgICAgICAgIGZpbmRMaW5rTm9kZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICBrID0gdW5kZWZpbmVkLFxuICAgICAgICAgIGxhc3RJbmRleCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICBsZW4gPSB1bmRlZmluZWQsXG4gICAgICAgICAgbGlua05vZGVzID0gdW5kZWZpbmVkLFxuICAgICAgICAgIG1hdGNoID0gdW5kZWZpbmVkLFxuICAgICAgICAgIHJlID0gdW5kZWZpbmVkLFxuICAgICAgICAgIHJlcGxhY2VFbHMgPSB1bmRlZmluZWQsXG4gICAgICAgICAgc3ViU3RyID0gdW5kZWZpbmVkLFxuICAgICAgICAgIHRleHQgPSB1bmRlZmluZWQsXG4gICAgICAgICAgdXJpID0gdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoXyRlbCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdOZWVkIEVsZW1lbnQnKTtcbiAgICAgIH1cblxuICAgICAgdmFyICRlbCA9ICQoJzxkaXYgY2xhc3NcIl9wcmVfZm9ybWF0X2VsZVwiPicgKyAoXyRlbC52YWwoKSB8fCBfJGVsLmh0bWwoKSkgKyAnPC9kaXY+Jyk7XG5cbiAgICAgIGxpbmtOb2RlcyA9IFtdO1xuXG4gICAgICBmaW5kTGlua05vZGUgPSBmdW5jdGlvbiAoJHBhcmVudE5vZGUpIHtcbiAgICAgICAgcmV0dXJuICRwYXJlbnROb2RlLmNvbnRlbnRzKCkuZWFjaChmdW5jdGlvbiAoaSwgbm9kZSkge1xuICAgICAgICAgIHZhciAkbm9kZSwgdGV4dDtcbiAgICAgICAgICAkbm9kZSA9ICQobm9kZSk7XG4gICAgICAgICAgaWYgKCRub2RlLmlzKCdhJykgfHwgJG5vZGUuY2xvc2VzdCgnYSwgcHJlJywgJGVsKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEkbm9kZS5pcygnaWZyYW1lJykgJiYgJG5vZGUuY29udGVudHMoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmaW5kTGlua05vZGUoJG5vZGUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoKHRleHQgPSAkbm9kZS50ZXh0KCkpICYmIC9odHRwcz86XFwvXFwvfHd3d1xcLi9pZy50ZXN0KHRleHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbGlua05vZGVzLnB1c2goJG5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBmaW5kTGlua05vZGUoJGVsKTtcblxuICAgICAgcmUgPSAvKGh0dHBzPzpcXC9cXC98d3d3XFwuKVtcXHdcXC1cXC5cXD8mPVxcLyMlOixAXFwhXFwrXSsvaWc7XG4gICAgICBmb3IgKGsgPSAwLCBsZW4gPSBsaW5rTm9kZXMubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgJG5vZGUgPSBsaW5rTm9kZXNba107XG4gICAgICAgIHRleHQgPSAkbm9kZS50ZXh0KCk7XG4gICAgICAgIHJlcGxhY2VFbHMgPSBbXTtcbiAgICAgICAgbWF0Y2ggPSBudWxsO1xuICAgICAgICBsYXN0SW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoKG1hdGNoID0gcmUuZXhlYyh0ZXh0KSkgIT09IG51bGwpIHtcbiAgICAgICAgICBzdWJTdHIgPSB0ZXh0LnN1YnN0cmluZyhsYXN0SW5kZXgsIG1hdGNoLmluZGV4KTtcbiAgICAgICAgICByZXBsYWNlRWxzLnB1c2goZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3ViU3RyKSk7XG4gICAgICAgICAgbGFzdEluZGV4ID0gcmUubGFzdEluZGV4O1xuICAgICAgICAgIHVyaSA9IC9eKGh0dHAocyk/OlxcL1xcL3xcXC8pLy50ZXN0KG1hdGNoWzBdKSA/IG1hdGNoWzBdIDogJ2h0dHA6Ly8nICsgbWF0Y2hbMF07XG4gICAgICAgICAgJGxpbmsgPSAkKFwiPGEgdGFyZ2V0PVxcXCJcIiArIF90YXJnZXQgKyBcIlxcXCIgaHJlZj1cXFwiXCIgKyB1cmkgKyBcIlxcXCIgcmVsPVxcXCJub2ZvbGxvd1xcXCI+PC9hPlwiKS50ZXh0KG1hdGNoWzBdKTtcbiAgICAgICAgICByZXBsYWNlRWxzLnB1c2goJGxpbmtbMF0pO1xuICAgICAgICB9XG4gICAgICAgIHJlcGxhY2VFbHMucHVzaChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0LnN1YnN0cmluZyhsYXN0SW5kZXgpKSk7XG5cbiAgICAgICAgJG5vZGUucmVwbGFjZVdpdGgoJChyZXBsYWNlRWxzKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAkZWw7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEZvcm1hdHRlcjtcbn0pKCk7XG5cbnZhciBfZm9ybWF0dGVyID0gbmV3IEZvcm1hdHRlcigpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBfZm9ybWF0dGVyO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLyoqXG4gKiBGT1IgTUFPViBcbiAqIGpRdWVyeSBpcyBuZWNlc3NhcnlcbiAqIEBhdXRob3IgIENsb3VkXG4gKi9cblxuLy8gaW1wb3J0ICogYXMgdXRpbCBmcm9tICdtby51dGlsJ1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikgeyBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7IHJldHVybiBvYmo7IH0gZWxzZSB7IHZhciBuZXdPYmogPSB7fTsgaWYgKG9iaiAhPSBudWxsKSB7IGZvciAodmFyIGtleSBpbiBvYmopIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07IH0gfSBuZXdPYmpbJ2RlZmF1bHQnXSA9IG9iajsgcmV0dXJuIG5ld09iajsgfSB9XG5cbnZhciBfbW9QamF4ID0gcmVxdWlyZSgnbW8ucGpheCcpO1xuXG52YXIgcGpheCA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9tb1BqYXgpO1xuXG52YXIgX21vU291cmNlID0gcmVxdWlyZSgnbW8uc291cmNlJyk7XG5cbnZhciBfbW9VdGlsID0gcmVxdWlyZSgnbW8udXRpbCcpO1xuXG52YXIgdXRpbCA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9tb1V0aWwpO1xuXG52YXIgX21vRm9ybWF0dGVyID0gcmVxdWlyZSgnbW8uZm9ybWF0dGVyJyk7XG5cbnZhciBfbW9Gb3JtYXR0ZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbW9Gb3JtYXR0ZXIpO1xuXG52YXIgX2V4cG9ydCA9IHtcbiAgICAnZ28nOiBwamF4LmdvLFxuICAgICdkZWZpbmUnOiBwamF4LmRlZmluZSxcbiAgICAnc3RhdGUnOiBwamF4LnN0YXRlLFxuICAgICd0b3VjaCc6IHBqYXgudG91Y2gsXG4gICAgJ2NvbmZpZyc6IHBqYXguY29uZmlnLFxuICAgICdwcmVsb2FkJzogX21vU291cmNlLnByZWxvYWQsXG4gICAgJ3V0aWwnOiB1dGlsLFxuICAgICdmb3JtYXR0ZXInOiBfbW9Gb3JtYXR0ZXIyWydkZWZhdWx0J11cbn07XG5cbndpbmRvdy5NTyA9IF9leHBvcnQ7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IF9leHBvcnQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIvKipcbiAqIEZPUiBNTy5wamF4XG4gKiBBUEk6XG4gKiBNTy5zdGF0ZTogU2V0IEN1cnJlbnQgU3RhdGUgYW5kIFBhZ2UtRm5cbiAqIE1PLnRvdWNoOiBQdXNoIHRvIE5leHQgU3RhdGUsIGFuZCBzdG9yZSB0aGUgc3RhdGUgYW5kIGRhdGFcbiAqIE1PLmNvbmZpZzogQ29uZmlnIHRoZSBvcHRpb25zIGZvciBNTy5wamF4XG4gKi9cblxuLy8gbGV0IF9tb19ldmVudHMgPSB7fVxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xudmFyIF9wamF4X3JlcSA9IHt9O1xudmFyIF9tb19jYWNoZSA9IHt9O1xudmFyIF9tb19jYWNoZV90aW1lID0ge307XG5cbnZhciBvcHRzID0ge1xuICAgICd0eXBlJzogJ1BPU1QnLFxuICAgICdjYWNoZSc6IHRydWUsXG4gICAgLy8gJ2NhY2hlRXhwaXJlcyc6IDEwMDAwLCAvLyAwIG1lYW5zIGFsd2F5cyBhdmFsaWFibGVcbiAgICAnc3RvcmFnZSc6IHRydWUsXG5cbiAgICAvL+WmguaenHN0b3JhZ2VFeHBpcmVz6K6+572u5Li6MOaIlmZhbHNl77yM5rC45LiN6L+H5pyfXG4gICAgJ3N0b3JhZ2VFeHBpcmVzJzogNDMyMDAwMDAsIC8vIDEyIGhvdXJzXG5cbiAgICAnZGF0YVR5cGUnOiAnaHRtbCcsXG4gICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gYmVmb3JlU2VuZChyZXEpIHtcbiAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJIdHRwLVJlcXVlc3QtUGpheFwiLCBcIkZyYWdtZW50XCIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogSU5JVCBFVkVOVFNcbiAqL1xuXG5mdW5jdGlvbiBfcmVmKGUpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnKm9uIHBvcHN0YXRlOiAnLCBlKVxuXG4gICAgaWYgKGhpc3Rvcnkuc3RhdGUgJiYgZS5zdGF0ZSkge1xuICAgICAgICBfZXhlY3V0ZShlLnN0YXRlKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGluaXRFdmVudHMoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgX3JlZiwgZmFsc2UpO1xufVxuXG5pbml0RXZlbnRzKCk7XG5cbi8qKlxuICogQ09SRSBQSkFYIENPREVcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxudmFyIF9hcGkgPSB7XG4gICAgZmV0Y2g6IGZ1bmN0aW9uIGZldGNoKHVybCwgZGF0YVR5cGUsIF9mZXRjaCkge1xuICAgICAgICBmdW5jdGlvbiBfcmVmMihlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2ZldGNoIGVycm9yOiAnICsgdXJsLCBlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLypsZXQgcHJlZml4ID0gJy9hcGknXG4gICAgICAgICBpZih1cmwgPT0gJy8nKXtcbiAgICAgICAgICAgIHByZWZpeCA9ICcnXG4gICAgICAgIH0qL1xuXG4gICAgICAgIC8vbnVsbCBhbmQgZmFsc2UgaXMgT0shLCBidXQgdW5kZWZpbmVkIGlzIG5vdCBpbiBjYWNoZVxuICAgICAgICB2YXIgY2FjaGVEYXRhID0gX2NhY2hlKHVybCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHVybCwgY2FjaGVEYXRhKVxuXG4gICAgICAgIGZ1bmN0aW9uIF9yZWYzKGRhdGEpIHtcbiAgICAgICAgICAgIC8vaWYgc3VjY2VlZCwgY2FjaGUgdGhlIHJlcyBkYXRhXG4gICAgICAgICAgICAvLyBfY2FjaGUodXJsLCBkYXRhKVxuICAgICAgICAgICAgb3B0c1snY2FjaGUnXSA/IF9jYWNoZSh1cmwsIGRhdGEpIDogJyc7XG4gICAgICAgICAgICBvcHRzWydzdG9yYWdlJ10gPyBfc3RvcmUodXJsLCBkYXRhKSA6ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFfZmV0Y2ggfHwgY2FjaGVEYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciBfcmV0ID0gKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBfcE9iaiA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ2RvbmUnOiBmdW5jdGlvbiBkb25lKF9kb25lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfZG9uZSA/IF9kb25lKGNhY2hlRGF0YSkgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfcE9iajtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB2OiBfcE9ialxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIF9yZXQgPT09ICdvYmplY3QnKSByZXR1cm4gX3JldC52O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICQuYWpheCgkLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgJ3VybCc6IHVybFxuICAgICAgICAgICAgfSwgb3B0cykpLmZhaWwoX3JlZjIpLmRvbmUoX3JlZjMpO1xuICAgICAgICAgICAgLyouY29tcGxldGUoKHJzKT0+e1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBmZXRjaCBjb21wbGV0ZTogJHt1cmx9YCwgIHJzKVxuICAgICAgICAgICAgfSkqL1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBTdG9yZSBkYXRhIGluIGxvY2FsU3RvcmFnZVxuICovXG5cbmZ1bmN0aW9uIF9yZW1vdmVTdG9yYWdlKGssIF90c0spIHtcbiAgICB2YXIgdHNLID0gX3RzSyB8fCBrICsgJ19jcmVhdGVkQXQnO1xuXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oayk7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odHNLKTtcbn1cblxuLyoqXG4gKiBTdG9yZSBkYXRhIGluIHN0b3JhZ2VcbiAqL1xuXG5mdW5jdGlvbiBfc3RvcmUoaywgdikge1xuICAgIGlmICghb3B0c1snc3RvcmFnZSddKSByZXR1cm47XG5cbiAgICB2YXIgdHNLID0gayArICdfY3JlYXRlZEF0JztcblxuICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrLCB2KTtcblxuICAgICAgICB2YXIgdHMgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odHNLLCB0cyk7XG5cbiAgICAgICAgLy8gX21vX2NhY2hlX3RpbWVba10gPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG4gICAgfSBlbHNlIGlmIChrKSB7XG5cbiAgICAgICAgICAgIHZhciB0cyA9IHBhcnNlSW50KGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRzSykpLFxuICAgICAgICAgICAgICAgIGNzID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgIHZhciBkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oayk7XG5cbiAgICAgICAgICAgIC8v5aaC5p6c6K6+572u5LqGc3RvcmFnZUV4cGlyZXMg77yM5bm25LiUc3RvcmFnZei/h+acn+S6hlxuICAgICAgICAgICAgLy/lpoLmnpxzdG9yYWdlRXhwaXJlc+iuvue9ruS4ujDmiJZmYWxzZe+8jOawuOS4jei/h+acn1xuICAgICAgICAgICAgaWYgKGQgJiYgdHMgJiYgb3B0c1snc3RvcmFnZUV4cGlyZXMnXSAmJiBjcyAtIHRzID49IG9wdHNbJ3N0b3JhZ2VFeHBpcmVzJ10pIHtcbiAgICAgICAgICAgICAgICBfcmVtb3ZlU3RvcmFnZShrLCB0c0spO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZCA9PSAnbnVsbCcpIHtcbiAgICAgICAgICAgICAgICBkID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/kvKDpgJLlh7rljrt1bmRlZmluZWTvvIzpgb/lhY1OdWxs6KKr6K6k5Li65piv5pyJ5pWI5YC8XG4gICAgICAgICAgICBpZiAoZCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/lkIzmraXliLDlhoXlrZhDYWNoZVxuICAgICAgICAgICAgaWYgKGQpIF9jYWNoZShrLCBkKTtcblxuICAgICAgICAgICAgcmV0dXJuIGQ7XG4gICAgICAgIH1cbn1cblxuZnVuY3Rpb24gX3JlbW92ZUNhY2hlKGspIHtcbiAgICBkZWxldGUgX21vX2NhY2hlW2tdO1xuICAgIGRlbGV0ZSBfbW9fY2FjaGVfdGltZVtrXTtcbn1cblxuZnVuY3Rpb24gX2NhY2hlKGssIHYpIHtcbiAgICBpZiAoIW9wdHNbJ2NhY2hlJ10pIHJldHVybjtcblxuICAgIC8qKlxuICAgICAqIGlmIHYgaXMgbnVsbCwgdGhhdCBhbHNvIGEgYXZhbGlhYmxlIGRhdGFcbiAgICAgKiBvbmx5IHVuZGVmaW5lZCBpcyBJbnZhbGlkIVxuICAgICAqL1xuICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICBfbW9fY2FjaGVba10gPSB2O1xuICAgICAgICBfbW9fY2FjaGVfdGltZVtrXSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGspIHtcblxuICAgICAgICAvL+WmguaenOiuvuWumuS6hui/h+acn+aXtumXtCzkuJTov4fmnJ/ml7bpl7Q+MOOAguWmguaenOiuvue9ruS4ujDvvIzku6PooajmsLjkuI3ov4fmnJ9cbiAgICAgICAgaWYgKG9wdHNbJ2NhY2hlRXhwaXJlcyddKSB7XG4gICAgICAgICAgICB2YXIgX3YgPSBfbW9fY2FjaGVba10sXG4gICAgICAgICAgICAgICAgX2NyZWF0ZWRBdCA9IF9tb19jYWNoZV90aW1lW2tdO1xuXG4gICAgICAgICAgICBpZiAoX3YgIT09IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIF9jdXJyZW50ID0gbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgICAgIF9kaWZmID0gX2N1cnJlbnQgLSBfY3JlYXRlZEF0O1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJkaWZmOiBcIiwgX2RpZmYpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF9kaWZmIDwgb3B0c1snY2FjaGVFeHBpcmVzJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhY2hlIEhpdDogJywgayk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FjaGUgRXhwaXJlZDogJywgayk7XG4gICAgICAgICAgICAgICAgICAgIC8vdGhlbiBhcGkuZmV0Y2ggd2lsbCB1cGRhdGUgdGhlIENhY2hlXG4gICAgICAgICAgICAgICAgICAgIF9yZW1vdmVDYWNoZShrKTtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIOWmguaenGNhY2hl5Lmf6L+H5pyf5LqG77yM6buY6K6k6K6k5Li6c3RvcmFnZeS4rVxuICAgICAgICAgICAgICAgICAgICAgKiDkuZ/ov4fmnJ/kuobvvIzmuIXpmaTmjolzdG9yYWdlXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBfcmVtb3ZlU3RvcmFnZShrKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL+ajgOafpeaYr+WQpnN0b3JhZ2V65Lit5a2Y5ZyoXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9zdG9yZShrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/lpoLmnpzmsqHmnInorr7lrprov4fmnJ/ml7bpl7TvvIxjYWNoZeawuOS5heacieaViFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfbW9fY2FjaGVba10gfHwgX3N0b3JlKGspO1xuICAgICAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IEVycm9yKCdVbmtub3duIEVycm9yIEluIF9jYWNoZScpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gX2V4ZWN1dGUoc3RhdGUpIHtcblxuICAgIC8vdHJpZ2dlciBldmVudHNcbiAgICByZXR1cm4gX3RyaWdnZXIoc3RhdGUpO1xufVxuXG5mdW5jdGlvbiBfcmVnaXN0ZXIoYXBpVXJsLCBmbikge1xuICAgIHZhciBfZmV0Y2ggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyB0cnVlIDogYXJndW1lbnRzWzJdO1xuXG4gICAgLy91cGRhdGUgZXZlbnRzIGZuXG4gICAgLy8gZGVsZXRlIF9tb19ldmVudHNbYXBpVXJsXVxuICAgIC8vIF9tb19ldmVudHNbYXBpVXJsXSA9IGZuXG5cbiAgICBkZWxldGUgX3BqYXhfcmVxW2FwaVVybF07XG5cbiAgICBfcGpheF9yZXFbYXBpVXJsXSA9IHtcbiAgICAgICAgJ2ZuJzogZm4sXG4gICAgICAgICdmZXRjaCc6IF9mZXRjaFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIF90cmlnZ2VyKHN0YXRlKSB7XG5cbiAgICB2YXIgYXBpVXJsID0gc3RhdGVbJ3VybCddO1xuICAgIHZhciB0aXRsZSA9IHN0YXRlWyd0aXRsZSddO1xuICAgIHZhciBkYXRhVHlwZSA9IHN0YXRlWydkYXRhVHlwZSddO1xuXG4gICAgdmFyIF9mZXRjaCA9IHVuZGVmaW5lZCxcbiAgICAgICAgb25wb3BGbiA9IHVuZGVmaW5lZDtcblxuICAgIC8vIGxldCBvbnBvcEZuID0gX21vX2V2ZW50c1thcGlVcmxdXG4gICAgdmFyIF9yZXEgPSBfcGpheF9yZXFbYXBpVXJsXTtcbiAgICBpZiAoX3JlcSkge1xuICAgICAgICBvbnBvcEZuID0gX3JlcVsnZm4nXTtcbiAgICAgICAgX2ZldGNoID0gX3JlcVsnZmV0Y2gnXTtcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhgKnRyaWdnZXI6ICR7YXBpVXJsfWApXG5cbiAgICByZXR1cm4gX2FwaS5mZXRjaChhcGlVcmwsIGRhdGFUeXBlLCBfZmV0Y2gpLmRvbmUoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBkb2N1bWVudC50aXRsZSA9IHRpdGxlO1xuICAgIH0pLmRvbmUob25wb3BGbik7XG59XG5cbmZ1bmN0aW9uIHRvdWNoKGFwaVVybCwgdGl0bGUsIG9ucG9wRm4pIHtcbiAgICB2YXIgX2ZldGNoID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGFyZ3VtZW50c1szXTtcblxuICAgIF9yZWdpc3RlcihhcGlVcmwsIG9ucG9wRm4sIF9mZXRjaCk7XG5cbiAgICB2YXIgc3RhdGUgPSB7XG4gICAgICAgICd1cmwnOiBhcGlVcmwsXG4gICAgICAgICd0aXRsZSc6IHRpdGxlLFxuICAgICAgICAnZGF0YVR5cGUnOiBvcHRzWydkYXRhVHlwZSddXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIOatpOaXtnB1c2jnmoTmmK/kuIvkuKrlvZPliY3nirbmgIHvvIzkuI3mmK/kuIrkuKrnirbmgIHjgIJcbiAgICAgKiDkuIrkuKrnirbmgIHvvIzlnKjmk43kvZzkuYvliY3nmoTml7blgJnlsLHnoa7lrprkuoZcbiAgICAgKi9cbiAgICBoaXN0b3J5LnB1c2hTdGF0ZShzdGF0ZSwgZG9jdW1lbnQudGl0bGUsIGFwaVVybCk7XG5cbiAgICByZXR1cm4gX2V4ZWN1dGUoc3RhdGUpO1xufVxuXG5mdW5jdGlvbiBzdGF0ZSh1cmwsIHRpdGxlLCBvbnBvcEZuKSB7XG4gICAgdmFyIF9kYXRhID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1szXTtcblxuICAgIHZhciBfZmV0Y2ggPSBhcmd1bWVudHMubGVuZ3RoIDw9IDQgfHwgYXJndW1lbnRzWzRdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1s0XTtcblxuICAgIHZhciBfZmlyZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gNSB8fCBhcmd1bWVudHNbNV0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzVdO1xuXG4gICAgX3JlZ2lzdGVyKHVybCwgb25wb3BGbiwgX2ZldGNoKTtcblxuICAgIC8vIGxldCBfZGF0YSA9IG51bGxcbiAgICAvL2lmIGRhdGEgaXMgbnVsbCwgaXQgd2lsbCBiZSBhbHNvIGNhY2hlZCFcbiAgICBfY2FjaGUodXJsLCBfZGF0YSk7XG5cbiAgICB2YXIgX3N0YXRlID0ge1xuICAgICAgICAndXJsJzogdXJsLFxuICAgICAgICAndGl0bGUnOiB0aXRsZSxcbiAgICAgICAgJ2RhdGFUeXBlJzogb3B0c1snZGF0YVR5cGUnXVxuICAgIH07XG5cbiAgICBpZiAoX2ZpcmUpIF9leGVjdXRlKF9zdGF0ZSk7XG5cbiAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShfc3RhdGUsIHRpdGxlLCB1cmwpO1xufVxuXG5mdW5jdGlvbiBnbyhhRWxlLCBjdG4sIGNiKSB7XG4gICAgdmFyIGV2dFR5cGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyAnY2xpY2snIDogYXJndW1lbnRzWzNdO1xuXG4gICAgZnVuY3Rpb24gX3JlZjQocmVzKSB7XG4gICAgICAgIC8vIGRlYnVnZ2VyO1xuICAgICAgICB2YXIgJGRvYyA9ICQocmVzKTtcbiAgICAgICAgdmFyIHQgPSAkZG9jLnRleHQoKTtcblxuICAgICAgICAkKGN0bikuaHRtbCh0KTtcbiAgICAgICAgY2IgPyBjYih0KSA6ICcnO1xuICAgIH1cblxuICAgIHZhciAkY3RuID0gJChjdG4pLFxuICAgICAgICByYXdIdG1sID0gJGN0bi5odG1sKCk7XG5cbiAgICBzdGF0ZShsb2NhdGlvbi5wYXRobmFtZSwgZG9jdW1lbnQudGl0bGUsIGZ1bmN0aW9uIChfZGF0YSkge1xuICAgICAgICAkY3RuLmh0bWwoX2RhdGEpO1xuICAgIH0sIHJhd0h0bWwsIGZhbHNlLCBmYWxzZSk7XG5cbiAgICAkKGFFbGUpLm9uKGV2dFR5cGUsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHZhciAkYSA9ICQodGhpcyksXG5cbiAgICAgICAgLy8gJGN0biA9ICQoY3RuKSxcbiAgICAgICAgdXJsID0gJGEuYXR0cignaHJlZicpLFxuICAgICAgICAgICAgdGl0bGUgPSAkYS5odG1sKCk7XG4gICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgIHRvdWNoKHVybCwgdGl0bGUsIF9yZWY0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cblxuICAgICAgICAvL3N0b3AgcHJvcGFnYXRpb25cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBkZWZpbmUoY3RuLCBfZGF0YSkge1xuICAgIHZhciB0aXRsZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMiB8fCBhcmd1bWVudHNbMl0gPT09IHVuZGVmaW5lZCA/IGRvY3VtZW50LnRpdGxlIDogYXJndW1lbnRzWzJdO1xuICAgIHZhciB1cmwgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDMgfHwgYXJndW1lbnRzWzNdID09PSB1bmRlZmluZWQgPyBsb2NhdGlvbi5wYXRobmFtZSA6IGFyZ3VtZW50c1szXTtcblxuICAgIE1PLnN0YXRlKHVybCwgdGl0bGUsIGZ1bmN0aW9uIChfZGF0YSkge1xuICAgICAgICAkKGN0bikuaHRtbChfZGF0YSk7XG4gICAgfSwgX2RhdGEsIGZhbHNlLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gY29uZmlnKGNvbmYpIHtcbiAgICBpZiAoY29uZikgcmV0dXJuICQuZXh0ZW5kKG9wdHMsIGNvbmYpO2Vsc2UgcmV0dXJuIG9wdHM7XG59XG5cbmV4cG9ydHMuZ28gPSBnbztcbmV4cG9ydHMuZGVmaW5lID0gZGVmaW5lO1xuZXhwb3J0cy50b3VjaCA9IHRvdWNoO1xuZXhwb3J0cy5zdGF0ZSA9IHN0YXRlO1xuZXhwb3J0cy5jb25maWcgPSBjb25maWc7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xudmFyIF9jb21wb25lbnQgPSB7XG4gICAgJ3NvdXJjZSc6IHtcbiAgICAgICAgJ2ltZyc6IFsnL3N0YXRpYy9hYmQuanBnJ11cbiAgICB9XG59O1xuXG5mdW5jdGlvbiBhZGRJbWcoc3JjKSB7XG4gICAgLy93aW5kb3cgYWRkIGltZ1xufVxuXG5mdW5jdGlvbiBwcmVsb2FkKGNvbXBvbmVudCkge1xuICAgIGlmIChjb21wb25lbnQuc291cmNlICYmIGNvbXBvbmVudC5zb3VyY2UuaW1nKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY29tcG9uZW50LnNvdXJjZS5pbWcgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGFkZEltZyhjb21wb25lbnQuc291cmNlLmltZyk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vY29tcG9uZW50LnNvdXJjZS5pbWcuZm9yRWFjaFxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnRzLnByZWxvYWQgPSBwcmVsb2FkOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX3JlZihjKSB7XG4gICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogMTYgfCAwLFxuICAgICAgICB2ID0gYyA9PSAneCcgPyByIDogciAmIDB4MyB8IDB4ODtcbiAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG59XG5cbi8qKlxuICogRk9SIE1PLnV0aWxcbiAqL1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSB7XG5cbiAgICBnZXRFdmVudDogZnVuY3Rpb24gZ2V0RXZlbnQoZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50ID8gZXZlbnQgOiB3aW5kb3cuZXZlbnQ7IC8vIG9yIGRlZmF1bHQgZVxuICAgIH0sXG4gICAgZ2V0VGFyZ2V0OiBmdW5jdGlvbiBnZXRUYXJnZXQoZXZlbnQpIHtcbiAgICAgICAgLy9jdXJyZW50VGFyZ2V05piv5aSE55CG5LqL5Lu255qE6LCD55So6ICF77yM5aaC5p6cZG9jdW1lbnQuYm9keS5vbmNsaWNrID0gZnVuY3Rpb24oZXZlbnQpe33kuK1ldmVudC5jdXJyZW50VGFyZ2V0ID09PXRoaXM9PT1kb2N1bWVudC5ib2R5ICB0YXJnZXTmmK/nm67moIdcbiAgICAgICAgcmV0dXJuIGV2ZW50LnRhcmdldCB8fCBldmVudC5zcmNFbGVtZW50O1xuICAgIH0sXG4gICAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICB9IC8vZm9yIElFXG4gICAgfSxcbiAgICBzdG9wUHJvcGFnYXRpb246IGZ1bmN0aW9uIHN0b3BQcm9wYWdhdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuc3RvcFByb3BhZ2F0aW9uICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBraWxsRXZlbnQ6IGZ1bmN0aW9uIGtpbGxFdmVudChldmVudCkge1xuICAgICAgICBpZiAodHlwZW9mIGV2ZW50ID09ICdvYmplY3QnICYmIHRoaXMuZ2V0VGFyZ2V0KGV2ZW50KSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcFByb3BhZ2F0aW9uKGV2ZW50KTtcbiAgICAgICAgICAgIHRoaXMucHJldmVudERlZmF1bHQoZXZlbnQpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRDbGllbnRTaXplOiBmdW5jdGlvbiBnZXRDbGllbnRTaXplKCkge1xuICAgICAgICB2YXIgd2luV2lkdGgsIHdpbkhlaWdodDtcbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoKSB3aW5XaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO2Vsc2UgaWYgKGRvY3VtZW50LmJvZHkgJiYgZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCkgd2luV2lkdGggPSBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoO1xuICAgICAgICAvLyDojrflj5bnqpflj6Ppq5jluqZcbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lckhlaWdodCkgd2luSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O2Vsc2UgaWYgKGRvY3VtZW50LmJvZHkgJiYgZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQpIHdpbkhlaWdodCA9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0O1xuICAgICAgICAvLyDpgJrov4fmt7HlhaUgRG9jdW1lbnQg5YaF6YOo5a+5IGJvZHkg6L+b6KGM5qOA5rWL77yM6I635Y+W56qX5Y+j5aSn5bCPXG4gICAgICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpIHtcbiAgICAgICAgICAgIHdpbkhlaWdodCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICB3aW5XaWR0aCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ3dpZHRoJzogd2luV2lkdGgsXG4gICAgICAgICAgICAnaGVpZ2h0Jzogd2luSGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGFkZFVSTFBhcmFtOiBmdW5jdGlvbiBhZGRVUkxQYXJhbSh1cmwsIG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIC8vcHV0IHRoZSBwYXJhbWV0ZXJzIGludG8gdXJsXG4gICAgICAgIHVybCArPSB1cmwuaW5kZXhPZignPycpID09IC0xID8gJz8nIDogJyYnO1xuICAgICAgICB1cmwgKz0gZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblxuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH0sXG5cbiAgICAnX2d1aWRCYXNlJzoge30sXG4gICAgZ2V0R1VJRDogZnVuY3Rpb24gZ2V0R1VJRChmb3JXaGF0KSB7XG4gICAgICAgIC8vY3JlYXRlIHRoZSBHVUlEXG4gICAgICAgIHZhciBjdXJHVUlEID0gJ3h4eHh4eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgX3JlZikudG9VcHBlckNhc2UoKTtcblxuICAgICAgICBpZiAodHlwZW9mIGZvcldoYXQgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRoaXNbJ19ndWlkQmFzZSddW2ZvcldoYXRdID0gY3VyR1VJRDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJHVUlEO1xuICAgIH0sXG5cbiAgICByYW5kb21OdW06IGZ1bmN0aW9uIHJhbmRvbU51bShtaW4sIG1heCkge1xuICAgICAgICBtaW4gPSBwYXJzZUludChtaW4pO1xuICAgICAgICBtYXggPSBwYXJzZUludChtYXgpO1xuICAgICAgICB2YXIgcmFuZ2UgPSBtYXggLSBtaW47XG4gICAgICAgIHZhciByYW5kID0gTWF0aC5yYW5kb20oKTtcbiAgICAgICAgcmV0dXJuIG1pbiArIE1hdGgucm91bmQocmFuZCAqIHJhbmdlKTtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGU6IGZ1bmN0aW9uIHZhbGlkYXRlKHRhciwgdHlwZSkge1xuICAgICAgICAvL3N0b25lLnR5cGVDaGVjayhbW3R5cGUsICdzdHJpbmcnXSwgW3RhciwgJ3N0cmluZyddIF0pO1xuXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuXG4gICAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgICAgIHJldHVybiBfbnVtYmVyX3B0ID0gL15cXGQrKFxcLlxcZCspPyQvLnRlc3QodGFyKTtcbiAgICAgICAgICAgIGNhc2UgJ2ludGVnZXInOlxuICAgICAgICAgICAgICAgIHZhciBfaW50ZWdlcl9wdCA9IC9eKC18XFwrKT9cXGQrJC87XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9pbnRlZ2VyX3B0LnRlc3QodGFyKTtcblxuICAgICAgICAgICAgY2FzZSAnbWFpbCc6XG4gICAgICAgICAgICAgICAgLy9NQUlMIDogXCJeKFthLXpBLVowLTldK1tffFxcX3xcXC5dPykqW2EtekEtWjAtOV0rQChbYS16QS1aMC05XStbX3xcXF98XFwuXT8pKlthLXpBLVowLTldK1xcLlthLXpBLVpdezIsM30kXCIsXG4gICAgICAgICAgICAgICAgdmFyIF9lbWFpbF9wdCA9IC9eKFthLXpBLVowLTlfLV0pK0AoW2EtekEtWjAtOV8tXSkrKChcXC5bYS16QS1aMC05Xy1dezIsM30pezEsMn0pJC87XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9lbWFpbF9wdC50ZXN0KHRhcik7XG5cbiAgICAgICAgICAgIGNhc2UgJ3RlbCc6XG4gICAgICAgICAgICAgICAgLy9URUwgOiBcIl4wKDEwfDJbMC01Nzg5XXxcXFxcZHszfSktXFxcXGR7Nyw4fSRcIixcbiAgICAgICAgICAgICAgICB2YXIgX3RlbF9wdCA9IC9eWzAtOV17Myw0fShcXC18XFxzKVswLTldezcsOH0kLztcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RlbF9wdC50ZXN0KHRhcik7XG4gICAgICAgICAgICBjYXNlICdtb2JpbGUnOlxuICAgICAgICAgICAgICAgIHZhciBfbW9iaWxlX3B0ID0gbmV3IFJlZ0V4cCgnXjEoM1swLTldfDVbMC0zNS05XXw4WzAyMzUtOV0pXFxcXGR7OH0kJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9tb2JpbGVfcHQudGVzdCh0YXIpO1xuICAgICAgICAgICAgY2FzZSAndXJsJzpcbiAgICAgICAgICAgICAgICB2YXIgX3VybF9wdCA9IG5ldyBSZWdFeHAoJ15odHRwW3NdPzovL1tcXFxcd1xcXFwuXFxcXC1dKyQnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3VybF9wdC50ZXN0KHRhcik7XG4gICAgICAgICAgICBjYXNlICdpZGNhcmQnOlxuICAgICAgICAgICAgICAgIHZhciBfaWRfcHQgPSBuZXcgUmVnRXhwKCcoKDExfDEyfDEzfDE0fDE1fDIxfDIyfDIzfDMxfDMyfDMzfDM0fDM1fDM2fDM3fDQxfDQyfDQzfDQ0fDQ1fDQ2fDUwfDUxfDUyfDUzfDU0fDYxfDYyfDYzfDY0fDY1fDcxfDgxfDgyfDkxKVxcXFxkezR9KSgoKCgxOXwyMCkoKFswMjQ2OF1bMDQ4XSl8KFsxMzU3OV1bMjZdKSkwMjI5KSl8KCgyMFswLTldWzAtOV0pfCgxOVswLTldWzAtOV0pKSgoKCgwWzEtOV0pfCgxWzAtMl0pKSgoMFsxLTldKXwoMVxcXFxkKXwoMlswLThdKSkpfCgoKCgwWzEsMy05XSl8KDFbMC0yXSkpKDI5fDMwKSl8KCgoMFsxMzU3OF0pfCgxWzAyXSkpMzEpKSkpKChcXFxcZHszfSh4fFgpKXwoXFxcXGR7NH0pKScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfaWRfcHQudGVzdCh0YXIpO1xuICAgICAgICAgICAgY2FzZSAnaXAnOlxuICAgICAgICAgICAgICAgIHZhciBfaXBfcHQgPSBuZXcgUmVnRXhwKCdeKChcXFxcZHxbMS05XVxcXFxkfDFcXFxcZFxcXFxkfDJbMC00XVxcXFxkfDI1WzAtNV18WypdKVxcXFwuKXszfShcXFxcZHxbMS05XVxcXFxkfDFcXFxcZFxcXFxkfDJbMC00XVxcXFxkfDI1WzAtNV18WypdKSQnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2lwX3B0LnRlc3QodGFyKTtcbiAgICAgICAgICAgIGNhc2UgJ2NoaW5lc2UnOlxuICAgICAgICAgICAgICAgIHZhciBfY2hfcHQgPSBuZXcgUmVnRXhwKCdeKFvkuIAt76ipXXxb7p+HLe6fs10pKiQnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2NoX3B0LnRlc3QodGFyKTtcblxuICAgICAgICAgICAgLy8gZGVmYXVsdCA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMudGhyb3dFcnJvcignVHlwZUVycm9yJywgJ05vIFR5cGUgTWF0Y2hlZDogJyArIHR5cGUpO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyJdfQ==
