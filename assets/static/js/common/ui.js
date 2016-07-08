(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * FOR UI
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
function scrollToBodyTop(pos, cb, tri) {

    /**
     * Use jquery animate cause 2 times cb trigger !! ?
     * @debug 
     * @type {[type]}
     */
    /*$('html, body').animate(
        {
            scrollTop: pos || 0
        }, 
        600, 
        'linear',
        cb
    )*/

    var _pos = pos || 0;
    var _tri = tri || 15;

    function _ref() {
        var _abs = Math.abs;

        var unit = 5;
        var unit_abs = _abs(unit);
        var st = document.body.scrollTop;

        if (st > pos) {
            unit = -unit;
        }

        //判断行为
        _abs(st - pos) < unit_abs ? (document.body.scrollTop = pos, cb ? cb() : '') : (document.body.scrollTop += unit, _animateScroll());
    }

    function _animateScroll() {

        setTimeout(_ref, _tri);
    }

    _animateScroll();
}

exports.scrollToBodyTop = scrollToBodyTop;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vdWkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEZPUiBVSVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmZ1bmN0aW9uIHNjcm9sbFRvQm9keVRvcChwb3MsIGNiLCB0cmkpIHtcblxuICAgIC8qKlxuICAgICAqIFVzZSBqcXVlcnkgYW5pbWF0ZSBjYXVzZSAyIHRpbWVzIGNiIHRyaWdnZXIgISEgP1xuICAgICAqIEBkZWJ1ZyBcbiAgICAgKiBAdHlwZSB7W3R5cGVdfVxuICAgICAqL1xuICAgIC8qJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoXG4gICAgICAgIHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogcG9zIHx8IDBcbiAgICAgICAgfSwgXG4gICAgICAgIDYwMCwgXG4gICAgICAgICdsaW5lYXInLFxuICAgICAgICBjYlxuICAgICkqL1xuXG4gICAgdmFyIF9wb3MgPSBwb3MgfHwgMDtcbiAgICB2YXIgX3RyaSA9IHRyaSB8fCAxNTtcblxuICAgIGZ1bmN0aW9uIF9yZWYoKSB7XG4gICAgICAgIHZhciBfYWJzID0gTWF0aC5hYnM7XG5cbiAgICAgICAgdmFyIHVuaXQgPSA1O1xuICAgICAgICB2YXIgdW5pdF9hYnMgPSBfYWJzKHVuaXQpO1xuICAgICAgICB2YXIgc3QgPSBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcblxuICAgICAgICBpZiAoc3QgPiBwb3MpIHtcbiAgICAgICAgICAgIHVuaXQgPSAtdW5pdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v5Yik5pat6KGM5Li6XG4gICAgICAgIF9hYnMoc3QgLSBwb3MpIDwgdW5pdF9hYnMgPyAoZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgPSBwb3MsIGNiID8gY2IoKSA6ICcnKSA6IChkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArPSB1bml0LCBfYW5pbWF0ZVNjcm9sbCgpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYW5pbWF0ZVNjcm9sbCgpIHtcblxuICAgICAgICBzZXRUaW1lb3V0KF9yZWYsIF90cmkpO1xuICAgIH1cblxuICAgIF9hbmltYXRlU2Nyb2xsKCk7XG59XG5cbmV4cG9ydHMuc2Nyb2xsVG9Cb2R5VG9wID0gc2Nyb2xsVG9Cb2R5VG9wOyJdfQ==
