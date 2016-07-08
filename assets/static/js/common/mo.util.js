(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vbW8udXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9yZWYoYykge1xuICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMCxcbiAgICAgICAgdiA9IGMgPT0gJ3gnID8gciA6IHIgJiAweDMgfCAweDg7XG4gICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xufVxuXG4vKipcbiAqIEZPUiBNTy51dGlsXG4gKi9cblxuZXhwb3J0c1snZGVmYXVsdCddID0ge1xuXG4gICAgZ2V0RXZlbnQ6IGZ1bmN0aW9uIGdldEV2ZW50KGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBldmVudCA/IGV2ZW50IDogd2luZG93LmV2ZW50OyAvLyBvciBkZWZhdWx0IGVcbiAgICB9LFxuICAgIGdldFRhcmdldDogZnVuY3Rpb24gZ2V0VGFyZ2V0KGV2ZW50KSB7XG4gICAgICAgIC8vY3VycmVudFRhcmdldOaYr+WkhOeQhuS6i+S7tueahOiwg+eUqOiAhe+8jOWmguaenGRvY3VtZW50LmJvZHkub25jbGljayA9IGZ1bmN0aW9uKGV2ZW50KXt95LitZXZlbnQuY3VycmVudFRhcmdldCA9PT10aGlzPT09ZG9jdW1lbnQuYm9keSAgdGFyZ2V05piv55uu5qCHXG4gICAgICAgIHJldHVybiBldmVudC50YXJnZXQgfHwgZXZlbnQuc3JjRWxlbWVudDtcbiAgICB9LFxuICAgIHByZXZlbnREZWZhdWx0OiBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQucHJldmVudERlZmF1bHQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgfSAvL2ZvciBJRVxuICAgIH0sXG4gICAgc3RvcFByb3BhZ2F0aW9uOiBmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnN0b3BQcm9wYWdhdGlvbiAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAga2lsbEV2ZW50OiBmdW5jdGlvbiBraWxsRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBldmVudCA9PSAnb2JqZWN0JyAmJiB0aGlzLmdldFRhcmdldChldmVudCkgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BQcm9wYWdhdGlvbihldmVudCk7XG4gICAgICAgICAgICB0aGlzLnByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0Q2xpZW50U2l6ZTogZnVuY3Rpb24gZ2V0Q2xpZW50U2l6ZSgpIHtcbiAgICAgICAgdmFyIHdpbldpZHRoLCB3aW5IZWlnaHQ7XG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCkgd2luV2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtlbHNlIGlmIChkb2N1bWVudC5ib2R5ICYmIGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGgpIHdpbldpZHRoID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aDtcbiAgICAgICAgLy8g6I635Y+W56qX5Y+j6auY5bqmXG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJIZWlnaHQpIHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtlbHNlIGlmIChkb2N1bWVudC5ib2R5ICYmIGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0KSB3aW5IZWlnaHQgPSBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodDtcbiAgICAgICAgLy8g6YCa6L+H5rex5YWlIERvY3VtZW50IOWGhemDqOWvuSBib2R5IOi/m+ihjOajgOa1i++8jOiOt+WPlueql+WPo+Wkp+Wwj1xuICAgICAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKSB7XG4gICAgICAgICAgICB3aW5IZWlnaHQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgd2luV2lkdGggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICd3aWR0aCc6IHdpbldpZHRoLFxuICAgICAgICAgICAgJ2hlaWdodCc6IHdpbkhlaWdodFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBhZGRVUkxQYXJhbTogZnVuY3Rpb24gYWRkVVJMUGFyYW0odXJsLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICAvL3B1dCB0aGUgcGFyYW1ldGVycyBpbnRvIHVybFxuICAgICAgICB1cmwgKz0gdXJsLmluZGV4T2YoJz8nKSA9PSAtMSA/ICc/JyA6ICcmJztcbiAgICAgICAgdXJsICs9IGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9LFxuXG4gICAgJ19ndWlkQmFzZSc6IHt9LFxuICAgIGdldEdVSUQ6IGZ1bmN0aW9uIGdldEdVSUQoZm9yV2hhdCkge1xuICAgICAgICAvL2NyZWF0ZSB0aGUgR1VJRFxuICAgICAgICB2YXIgY3VyR1VJRCA9ICd4eHh4eHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIF9yZWYpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBmb3JXaGF0ID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aGlzWydfZ3VpZEJhc2UnXVtmb3JXaGF0XSA9IGN1ckdVSUQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3VyR1VJRDtcbiAgICB9LFxuXG4gICAgcmFuZG9tTnVtOiBmdW5jdGlvbiByYW5kb21OdW0obWluLCBtYXgpIHtcbiAgICAgICAgbWluID0gcGFyc2VJbnQobWluKTtcbiAgICAgICAgbWF4ID0gcGFyc2VJbnQobWF4KTtcbiAgICAgICAgdmFyIHJhbmdlID0gbWF4IC0gbWluO1xuICAgICAgICB2YXIgcmFuZCA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgIHJldHVybiBtaW4gKyBNYXRoLnJvdW5kKHJhbmQgKiByYW5nZSk7XG4gICAgfSxcblxuICAgIHZhbGlkYXRlOiBmdW5jdGlvbiB2YWxpZGF0ZSh0YXIsIHR5cGUpIHtcbiAgICAgICAgLy9zdG9uZS50eXBlQ2hlY2soW1t0eXBlLCAnc3RyaW5nJ10sIFt0YXIsICdzdHJpbmcnXSBdKTtcblxuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcblxuICAgICAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gX251bWJlcl9wdCA9IC9eXFxkKyhcXC5cXGQrKT8kLy50ZXN0KHRhcik7XG4gICAgICAgICAgICBjYXNlICdpbnRlZ2VyJzpcbiAgICAgICAgICAgICAgICB2YXIgX2ludGVnZXJfcHQgPSAvXigtfFxcKyk/XFxkKyQvO1xuICAgICAgICAgICAgICAgIHJldHVybiBfaW50ZWdlcl9wdC50ZXN0KHRhcik7XG5cbiAgICAgICAgICAgIGNhc2UgJ21haWwnOlxuICAgICAgICAgICAgICAgIC8vTUFJTCA6IFwiXihbYS16QS1aMC05XStbX3xcXF98XFwuXT8pKlthLXpBLVowLTldK0AoW2EtekEtWjAtOV0rW198XFxffFxcLl0/KSpbYS16QS1aMC05XStcXC5bYS16QS1aXXsyLDN9JFwiLFxuICAgICAgICAgICAgICAgIHZhciBfZW1haWxfcHQgPSAvXihbYS16QS1aMC05Xy1dKStAKFthLXpBLVowLTlfLV0pKygoXFwuW2EtekEtWjAtOV8tXXsyLDN9KXsxLDJ9KSQvO1xuICAgICAgICAgICAgICAgIHJldHVybiBfZW1haWxfcHQudGVzdCh0YXIpO1xuXG4gICAgICAgICAgICBjYXNlICd0ZWwnOlxuICAgICAgICAgICAgICAgIC8vVEVMIDogXCJeMCgxMHwyWzAtNTc4OV18XFxcXGR7M30pLVxcXFxkezcsOH0kXCIsXG4gICAgICAgICAgICAgICAgdmFyIF90ZWxfcHQgPSAvXlswLTldezMsNH0oXFwtfFxccylbMC05XXs3LDh9JC87XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90ZWxfcHQudGVzdCh0YXIpO1xuICAgICAgICAgICAgY2FzZSAnbW9iaWxlJzpcbiAgICAgICAgICAgICAgICB2YXIgX21vYmlsZV9wdCA9IG5ldyBSZWdFeHAoJ14xKDNbMC05XXw1WzAtMzUtOV18OFswMjM1LTldKVxcXFxkezh9JCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfbW9iaWxlX3B0LnRlc3QodGFyKTtcbiAgICAgICAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgICAgICAgICAgdmFyIF91cmxfcHQgPSBuZXcgUmVnRXhwKCdeaHR0cFtzXT86Ly9bXFxcXHdcXFxcLlxcXFwtXSskJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF91cmxfcHQudGVzdCh0YXIpO1xuICAgICAgICAgICAgY2FzZSAnaWRjYXJkJzpcbiAgICAgICAgICAgICAgICB2YXIgX2lkX3B0ID0gbmV3IFJlZ0V4cCgnKCgxMXwxMnwxM3wxNHwxNXwyMXwyMnwyM3wzMXwzMnwzM3wzNHwzNXwzNnwzN3w0MXw0Mnw0M3w0NHw0NXw0Nnw1MHw1MXw1Mnw1M3w1NHw2MXw2Mnw2M3w2NHw2NXw3MXw4MXw4Mnw5MSlcXFxcZHs0fSkoKCgoMTl8MjApKChbMDI0NjhdWzA0OF0pfChbMTM1NzldWzI2XSkpMDIyOSkpfCgoMjBbMC05XVswLTldKXwoMTlbMC05XVswLTldKSkoKCgoMFsxLTldKXwoMVswLTJdKSkoKDBbMS05XSl8KDFcXFxcZCl8KDJbMC04XSkpKXwoKCgoMFsxLDMtOV0pfCgxWzAtMl0pKSgyOXwzMCkpfCgoKDBbMTM1NzhdKXwoMVswMl0pKTMxKSkpKSgoXFxcXGR7M30oeHxYKSl8KFxcXFxkezR9KSknKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2lkX3B0LnRlc3QodGFyKTtcbiAgICAgICAgICAgIGNhc2UgJ2lwJzpcbiAgICAgICAgICAgICAgICB2YXIgX2lwX3B0ID0gbmV3IFJlZ0V4cCgnXigoXFxcXGR8WzEtOV1cXFxcZHwxXFxcXGRcXFxcZHwyWzAtNF1cXFxcZHwyNVswLTVdfFsqXSlcXFxcLil7M30oXFxcXGR8WzEtOV1cXFxcZHwxXFxcXGRcXFxcZHwyWzAtNF1cXFxcZHwyNVswLTVdfFsqXSkkJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9pcF9wdC50ZXN0KHRhcik7XG4gICAgICAgICAgICBjYXNlICdjaGluZXNlJzpcbiAgICAgICAgICAgICAgICB2YXIgX2NoX3B0ID0gbmV3IFJlZ0V4cCgnXihb5LiALe+oqV18W+6fhy3un7NdKSokJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9jaF9wdC50ZXN0KHRhcik7XG5cbiAgICAgICAgICAgIC8vIGRlZmF1bHQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLnRocm93RXJyb3IoJ1R5cGVFcnJvcicsICdObyBUeXBlIE1hdGNoZWQ6ICcgKyB0eXBlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiXX0=
