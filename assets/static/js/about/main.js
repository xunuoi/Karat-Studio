(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * ES6 FILE FOR AboutController 
 * 2015-08-28 06:08:46
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

require('header');

function hello() {
  var page = 'about';
  alert('Hello, this is ' + page + '. You can use es6 now.');
}

// hello()

exports.hello = hello;
},{"header":2}],2:[function(require,module,exports){
/**
 * FOR HEADER 
 * @param  {[type]} ( [description]
 * @return {[type]}   [description]
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var $menus = null;
var $header = null;

function _ref(evt) {

    $(evt.currentTarget).parent('.menu').addClass('on');

    // return false;
}

function _ref2(evt) {
    $(evt.currentTarget).parent('.menu').removeClass('on');

    return false;
}

function initHeader() {

    $header = $('body > header').on('mouseenter', '.sub-menu', _ref).on('mouseleave', '.sub-menu', _ref2);

    //hide the sub-menu after click the sub-menu li
    /*.on('click', '.sub-menu > li', evt => {
        evt.stopPropagation()
         $(evt.currentTarget)
        .parents('.sub-menu').css('visibility': 'hidden')
    })*/

    $menus = $header.find('.menu');

    if (window._is_mobile) {
        //hide sub-menu ,when click other spaces
        $('body').on('click', function (evt) {
            var $area = $(this);
            if ($area.not('.sub-menu, .sub-menu > li')) {
                $header.find('.sub-menu').removeClass('on');
            }
        });
    }
}

function locate(nav) {
    var navText = nav.toLowerCase();

    for (var i in $menus) {
        var $m = $menus.eq(i);
        var $a = $m.children('a');
        var aText = $a.html().toLowerCase();

        if (navText == aText) {
            $menus.removeClass('active');
            $m.addClass('active');

            break;
        }
    }
}

$(function () {
    initHeader();
});

exports.locate = locate;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9hYm91dC9tYWluLmpzIiwic3RhdGljLy50bXAvY29tbW9uL2hlYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBFUzYgRklMRSBGT1IgQWJvdXRDb250cm9sbGVyIFxuICogMjAxNS0wOC0yOCAwNjowODo0NlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnJlcXVpcmUoJ2hlYWRlcicpO1xuXG5mdW5jdGlvbiBoZWxsbygpIHtcbiAgdmFyIHBhZ2UgPSAnYWJvdXQnO1xuICBhbGVydCgnSGVsbG8sIHRoaXMgaXMgJyArIHBhZ2UgKyAnLiBZb3UgY2FuIHVzZSBlczYgbm93LicpO1xufVxuXG4vLyBoZWxsbygpXG5cbmV4cG9ydHMuaGVsbG8gPSBoZWxsbzsiLCIvKipcbiAqIEZPUiBIRUFERVIgXG4gKiBAcGFyYW0gIHtbdHlwZV19ICggW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7W3R5cGVdfSAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgJG1lbnVzID0gbnVsbDtcbnZhciAkaGVhZGVyID0gbnVsbDtcblxuZnVuY3Rpb24gX3JlZihldnQpIHtcblxuICAgICQoZXZ0LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgnLm1lbnUnKS5hZGRDbGFzcygnb24nKTtcblxuICAgIC8vIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gX3JlZjIoZXZ0KSB7XG4gICAgJChldnQuY3VycmVudFRhcmdldCkucGFyZW50KCcubWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpbml0SGVhZGVyKCkge1xuXG4gICAgJGhlYWRlciA9ICQoJ2JvZHkgPiBoZWFkZXInKS5vbignbW91c2VlbnRlcicsICcuc3ViLW1lbnUnLCBfcmVmKS5vbignbW91c2VsZWF2ZScsICcuc3ViLW1lbnUnLCBfcmVmMik7XG5cbiAgICAvL2hpZGUgdGhlIHN1Yi1tZW51IGFmdGVyIGNsaWNrIHRoZSBzdWItbWVudSBsaVxuICAgIC8qLm9uKCdjbGljaycsICcuc3ViLW1lbnUgPiBsaScsIGV2dCA9PiB7XG4gICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgJChldnQuY3VycmVudFRhcmdldClcbiAgICAgICAgLnBhcmVudHMoJy5zdWItbWVudScpLmNzcygndmlzaWJpbGl0eSc6ICdoaWRkZW4nKVxuICAgIH0pKi9cblxuICAgICRtZW51cyA9ICRoZWFkZXIuZmluZCgnLm1lbnUnKTtcblxuICAgIGlmICh3aW5kb3cuX2lzX21vYmlsZSkge1xuICAgICAgICAvL2hpZGUgc3ViLW1lbnUgLHdoZW4gY2xpY2sgb3RoZXIgc3BhY2VzXG4gICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICB2YXIgJGFyZWEgPSAkKHRoaXMpO1xuICAgICAgICAgICAgaWYgKCRhcmVhLm5vdCgnLnN1Yi1tZW51LCAuc3ViLW1lbnUgPiBsaScpKSB7XG4gICAgICAgICAgICAgICAgJGhlYWRlci5maW5kKCcuc3ViLW1lbnUnKS5yZW1vdmVDbGFzcygnb24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBsb2NhdGUobmF2KSB7XG4gICAgdmFyIG5hdlRleHQgPSBuYXYudG9Mb3dlckNhc2UoKTtcblxuICAgIGZvciAodmFyIGkgaW4gJG1lbnVzKSB7XG4gICAgICAgIHZhciAkbSA9ICRtZW51cy5lcShpKTtcbiAgICAgICAgdmFyICRhID0gJG0uY2hpbGRyZW4oJ2EnKTtcbiAgICAgICAgdmFyIGFUZXh0ID0gJGEuaHRtbCgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgaWYgKG5hdlRleHQgPT0gYVRleHQpIHtcbiAgICAgICAgICAgICRtZW51cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAkbS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4kKGZ1bmN0aW9uICgpIHtcbiAgICBpbml0SGVhZGVyKCk7XG59KTtcblxuZXhwb3J0cy5sb2NhdGUgPSBsb2NhdGU7Il19
