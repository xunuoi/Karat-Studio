(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * ES6 FILE FOR ProductController 
 * 2015-08-28 07:08:15
 */

'use strict';

$(function () {

    MO.config({
        'type': 'GET'
    });

    /*MO.state(location.pathname, document.title, (_data)=>{
        console.log(_data)
        $('#ttt').html(_data)
    }, 'Product Page', false, true)*/

    // MO.define('#ttt', 'Product Page Define')

    MO.go('.ctn a', '#ttt');

    /*$(".ctn").on('click', 'a', function(evt){
        evt.stopPropagation()
    
        let $a = $(this),
            url = $a.attr('href'),
            title = $a.html()
    
        MO.touch(url, title, (res)=>{
            let $doc = $(res) 
            let t = $doc.text()
    
            $('#ttt').html(t)
    
        })
    
    
        //stop propagation
        return false
    
    })*/
});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9wcm9kdWN0L21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEVTNiBGSUxFIEZPUiBQcm9kdWN0Q29udHJvbGxlciBcbiAqIDIwMTUtMDgtMjggMDc6MDg6MTVcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiQoZnVuY3Rpb24gKCkge1xuXG4gICAgTU8uY29uZmlnKHtcbiAgICAgICAgJ3R5cGUnOiAnR0VUJ1xuICAgIH0pO1xuXG4gICAgLypNTy5zdGF0ZShsb2NhdGlvbi5wYXRobmFtZSwgZG9jdW1lbnQudGl0bGUsIChfZGF0YSk9PntcbiAgICAgICAgY29uc29sZS5sb2coX2RhdGEpXG4gICAgICAgICQoJyN0dHQnKS5odG1sKF9kYXRhKVxuICAgIH0sICdQcm9kdWN0IFBhZ2UnLCBmYWxzZSwgdHJ1ZSkqL1xuXG4gICAgLy8gTU8uZGVmaW5lKCcjdHR0JywgJ1Byb2R1Y3QgUGFnZSBEZWZpbmUnKVxuXG4gICAgTU8uZ28oJy5jdG4gYScsICcjdHR0Jyk7XG5cbiAgICAvKiQoXCIuY3RuXCIpLm9uKCdjbGljaycsICdhJywgZnVuY3Rpb24oZXZ0KXtcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgXG4gICAgICAgIGxldCAkYSA9ICQodGhpcyksXG4gICAgICAgICAgICB1cmwgPSAkYS5hdHRyKCdocmVmJyksXG4gICAgICAgICAgICB0aXRsZSA9ICRhLmh0bWwoKVxuICAgIFxuICAgICAgICBNTy50b3VjaCh1cmwsIHRpdGxlLCAocmVzKT0+e1xuICAgICAgICAgICAgbGV0ICRkb2MgPSAkKHJlcykgXG4gICAgICAgICAgICBsZXQgdCA9ICRkb2MudGV4dCgpXG4gICAgXG4gICAgICAgICAgICAkKCcjdHR0JykuaHRtbCh0KVxuICAgIFxuICAgICAgICB9KVxuICAgIFxuICAgIFxuICAgICAgICAvL3N0b3AgcHJvcGFnYXRpb25cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgXG4gICAgfSkqL1xufSk7Il19
