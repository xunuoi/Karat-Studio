(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
/**
 * ES6 FILE FOR EssayController 
 * 2015-08-28 06:08:50
 */

'use strict';

require('header');
},{"header":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vaGVhZGVyLmpzIiwic3RhdGljLy50bXAvZXNzYXkvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogRk9SIEhFQURFUiBcbiAqIEBwYXJhbSAge1t0eXBlXX0gKCBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgW2Rlc2NyaXB0aW9uXVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbnZhciAkbWVudXMgPSBudWxsO1xudmFyICRoZWFkZXIgPSBudWxsO1xuXG5mdW5jdGlvbiBfcmVmKGV2dCkge1xuXG4gICAgJChldnQuY3VycmVudFRhcmdldCkucGFyZW50KCcubWVudScpLmFkZENsYXNzKCdvbicpO1xuXG4gICAgLy8gcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBfcmVmMihldnQpIHtcbiAgICAkKGV2dC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoJy5tZW51JykucmVtb3ZlQ2xhc3MoJ29uJyk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGluaXRIZWFkZXIoKSB7XG5cbiAgICAkaGVhZGVyID0gJCgnYm9keSA+IGhlYWRlcicpLm9uKCdtb3VzZWVudGVyJywgJy5zdWItbWVudScsIF9yZWYpLm9uKCdtb3VzZWxlYXZlJywgJy5zdWItbWVudScsIF9yZWYyKTtcblxuICAgIC8vaGlkZSB0aGUgc3ViLW1lbnUgYWZ0ZXIgY2xpY2sgdGhlIHN1Yi1tZW51IGxpXG4gICAgLyoub24oJ2NsaWNrJywgJy5zdWItbWVudSA+IGxpJywgZXZ0ID0+IHtcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAkKGV2dC5jdXJyZW50VGFyZ2V0KVxuICAgICAgICAucGFyZW50cygnLnN1Yi1tZW51JykuY3NzKCd2aXNpYmlsaXR5JzogJ2hpZGRlbicpXG4gICAgfSkqL1xuXG4gICAgJG1lbnVzID0gJGhlYWRlci5maW5kKCcubWVudScpO1xuXG4gICAgaWYgKHdpbmRvdy5faXNfbW9iaWxlKSB7XG4gICAgICAgIC8vaGlkZSBzdWItbWVudSAsd2hlbiBjbGljayBvdGhlciBzcGFjZXNcbiAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAgIHZhciAkYXJlYSA9ICQodGhpcyk7XG4gICAgICAgICAgICBpZiAoJGFyZWEubm90KCcuc3ViLW1lbnUsIC5zdWItbWVudSA+IGxpJykpIHtcbiAgICAgICAgICAgICAgICAkaGVhZGVyLmZpbmQoJy5zdWItbWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGxvY2F0ZShuYXYpIHtcbiAgICB2YXIgbmF2VGV4dCA9IG5hdi50b0xvd2VyQ2FzZSgpO1xuXG4gICAgZm9yICh2YXIgaSBpbiAkbWVudXMpIHtcbiAgICAgICAgdmFyICRtID0gJG1lbnVzLmVxKGkpO1xuICAgICAgICB2YXIgJGEgPSAkbS5jaGlsZHJlbignYScpO1xuICAgICAgICB2YXIgYVRleHQgPSAkYS5odG1sKCkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBpZiAobmF2VGV4dCA9PSBhVGV4dCkge1xuICAgICAgICAgICAgJG1lbnVzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICRtLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIGluaXRIZWFkZXIoKTtcbn0pO1xuXG5leHBvcnRzLmxvY2F0ZSA9IGxvY2F0ZTsiLCIvKipcbiAqIEVTNiBGSUxFIEZPUiBFc3NheUNvbnRyb2xsZXIgXG4gKiAyMDE1LTA4LTI4IDA2OjA4OjUwXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCdoZWFkZXInKTsiXX0=
