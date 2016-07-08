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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vaGVhZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBGT1IgSEVBREVSIFxuICogQHBhcmFtICB7W3R5cGVdfSAoIFtkZXNjcmlwdGlvbl1cbiAqIEByZXR1cm4ge1t0eXBlXX0gICBbZGVzY3JpcHRpb25dXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xudmFyICRtZW51cyA9IG51bGw7XG52YXIgJGhlYWRlciA9IG51bGw7XG5cbmZ1bmN0aW9uIF9yZWYoZXZ0KSB7XG5cbiAgICAkKGV2dC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoJy5tZW51JykuYWRkQ2xhc3MoJ29uJyk7XG5cbiAgICAvLyByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIF9yZWYyKGV2dCkge1xuICAgICQoZXZ0LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgnLm1lbnUnKS5yZW1vdmVDbGFzcygnb24nKTtcblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaW5pdEhlYWRlcigpIHtcblxuICAgICRoZWFkZXIgPSAkKCdib2R5ID4gaGVhZGVyJykub24oJ21vdXNlZW50ZXInLCAnLnN1Yi1tZW51JywgX3JlZikub24oJ21vdXNlbGVhdmUnLCAnLnN1Yi1tZW51JywgX3JlZjIpO1xuXG4gICAgLy9oaWRlIHRoZSBzdWItbWVudSBhZnRlciBjbGljayB0aGUgc3ViLW1lbnUgbGlcbiAgICAvKi5vbignY2xpY2snLCAnLnN1Yi1tZW51ID4gbGknLCBldnQgPT4ge1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICQoZXZ0LmN1cnJlbnRUYXJnZXQpXG4gICAgICAgIC5wYXJlbnRzKCcuc3ViLW1lbnUnKS5jc3MoJ3Zpc2liaWxpdHknOiAnaGlkZGVuJylcbiAgICB9KSovXG5cbiAgICAkbWVudXMgPSAkaGVhZGVyLmZpbmQoJy5tZW51Jyk7XG5cbiAgICBpZiAod2luZG93Ll9pc19tb2JpbGUpIHtcbiAgICAgICAgLy9oaWRlIHN1Yi1tZW51ICx3aGVuIGNsaWNrIG90aGVyIHNwYWNlc1xuICAgICAgICAkKCdib2R5Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICAgICAgdmFyICRhcmVhID0gJCh0aGlzKTtcbiAgICAgICAgICAgIGlmICgkYXJlYS5ub3QoJy5zdWItbWVudSwgLnN1Yi1tZW51ID4gbGknKSkge1xuICAgICAgICAgICAgICAgICRoZWFkZXIuZmluZCgnLnN1Yi1tZW51JykucmVtb3ZlQ2xhc3MoJ29uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbG9jYXRlKG5hdikge1xuICAgIHZhciBuYXZUZXh0ID0gbmF2LnRvTG93ZXJDYXNlKCk7XG5cbiAgICBmb3IgKHZhciBpIGluICRtZW51cykge1xuICAgICAgICB2YXIgJG0gPSAkbWVudXMuZXEoaSk7XG4gICAgICAgIHZhciAkYSA9ICRtLmNoaWxkcmVuKCdhJyk7XG4gICAgICAgIHZhciBhVGV4dCA9ICRhLmh0bWwoKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgIGlmIChuYXZUZXh0ID09IGFUZXh0KSB7XG4gICAgICAgICAgICAkbWVudXMucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgJG0uYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cblxuJChmdW5jdGlvbiAoKSB7XG4gICAgaW5pdEhlYWRlcigpO1xufSk7XG5cbmV4cG9ydHMubG9jYXRlID0gbG9jYXRlOyJdfQ==
