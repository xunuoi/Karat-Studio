(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * HOME BANNER SVG ANIMATION
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
function start() {
    var pathColor = 'transparent';
    var animationTime = 6000;
    var airImg = '/static/img/home/air.png';

    var paper = Snap('#banner_svg');

    var myPathB = paper.path('M880,32C376-4.2,80,42,44,191').attr({
        id: 'squiggle',
        fill: 'none',
        strokeWidth: '4',
        stroke: pathColor,
        strokeMiterLimit: '10',
        strokeDasharray: '9 9',
        strokeDashOffset: '988.01'
    });

    var lenB = myPathB.getTotalLength();

    myPathB.attr({
        stroke: pathColor,
        strokeWidth: 4,
        fill: 'none',
        'stroke-dasharray': lenB + ' ' + lenB,
        'stroke-dashoffset': -lenB
    }).animate({
        'stroke-dashoffset': 10
    }, animationTime, mina.easeoutinout);

    //创建点
    /*let CircleB = paper.circle(16, 16, 8);
    CircleB.attr({
        fill: '#3f4445',
        stroke: '#fff',
        strokeWidth: 2
    })*/
    var plane = paper.image(airImg, 0, 0, 50, 44);

    Snap.animate(lenB, 0, function (value) {
        var movePoint = myPathB.getPointAtLength(value);

        plane.attr({
            'x': movePoint.x,
            'y': movePoint.y
        });
    }, animationTime, mina.easeinout);
}

exports.start = start;

/*var snapA = Snap('#svgA');
var myPathA = snapA.path('M62.9 14.9c-25-7.74-56.6 4.8-60.4 24.3-3.73 19.6 21.6 35 39.6 37.6 42.8 6.2 72.9-53.4 116-58.9 65-18.2 191 101 215 28.8 5-16.7-7-49.1-34-44-34 11.5-31 46.5-14 69.3 9.38 12.6 24.2 20.6 39.8 22.9 91.4 9.05 102-98.9 176-86.7 18.8 3.81 33 17.3 36.7 34.6 2.01 10.2.124 21.1-5.18 30.1').attr({
    id: 'squiggle',
    fill: 'none',
    strokeWidth: '4',
    stroke: '#ffffff',
    strokeMiterLimit: '10',
    strokeDasharray: '9 9',
    strokeDashOffset: '988.01'
});
var len = myPathA.getTotalLength();
myPathA.attr({
    stroke: '#fff',
    strokeWidth: 4,
    fill: 'none',
    'stroke-dasharray': '12 6',
    'stroke-dashoffset': len
}).animate({
    'stroke-dashoffset': 10
}, 2500, mina.easeinout);
var CircleA = snapA.circle(32, 32, 16);
CircleA.attr({
    fill: '#3f4445',
    stroke: '#fff',
    strokeWidth: 2
});
setTimeout(function() {
    Snap.animate(0, len, function(value) {
        movePoint = myPathA.getPointAtLength(value);
        CircleA.attr({
            cx: movePoint.x,
            cy: movePoint.y
        });
    }, 2500, mina.easeinout);
});*/

/*
var snapC = Snap('#svgC');
var myPathC = snapC.path('M62.9 14.9c-25-7.74-56.6 4.8-60.4 24.3-3.73 19.6 21.6 35 39.6 37.6 42.8 6.2 72.9-53.4 116-58.9 65-18.2 191 101 215 28.8 5-16.7-7-49.1-34-44-34 11.5-31 46.5-14 69.3 9.38 12.6 24.2 20.6 39.8 22.9 91.4 9.05 102-98.9 176-86.7 18.8 3.81 33 17.3 36.7 34.6 2.01 10.2.124 21.1-5.18 30.1').attr({
    id: 'squiggle',
    fill: 'none',
    strokeWidth: '4',
    stroke: '#ffffff',
    strokeMiterLimit: '10',
    strokeDasharray: '9 9',
    strokeDashOffset: '988.01'
});
var lenC = myPathC.getTotalLength();
myPathC.attr({
    stroke: '#fff',
    strokeWidth: 4,
    fill: 'none',
    'stroke-dasharray': '12 6',
    'stroke-dashoffset': '180'
}).animate({
    'stroke-dashoffset': 10
}, 4500, mina.easeinout);
var Triangle = snapC.polyline('0,30 15,0 30,30');
Triangle.attr({
    id: 'plane',
    fill: '#fff'
});
var triangleGroup = snapC.g(Triangle);
setTimeout(function() {
    Snap.animate(0, lenC, function(value) {
        movePoint = myPathC.getPointAtLength(value);
        triangleGroup.transform('t' + parseInt(movePoint.x - 15) + ',' + parseInt(movePoint.y - 15) + 'r' + (movePoint.alpha - 90));
    }, 4500, mina.easeinout);
});
*/
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9ob21lL2ZseS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogSE9NRSBCQU5ORVIgU1ZHIEFOSU1BVElPTlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbmZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgIHZhciBwYXRoQ29sb3IgPSAndHJhbnNwYXJlbnQnO1xuICAgIHZhciBhbmltYXRpb25UaW1lID0gNjAwMDtcbiAgICB2YXIgYWlySW1nID0gJy9zdGF0aWMvaW1nL2hvbWUvYWlyLnBuZyc7XG5cbiAgICB2YXIgcGFwZXIgPSBTbmFwKCcjYmFubmVyX3N2ZycpO1xuXG4gICAgdmFyIG15UGF0aEIgPSBwYXBlci5wYXRoKCdNODgwLDMyQzM3Ni00LjIsODAsNDIsNDQsMTkxJykuYXR0cih7XG4gICAgICAgIGlkOiAnc3F1aWdnbGUnLFxuICAgICAgICBmaWxsOiAnbm9uZScsXG4gICAgICAgIHN0cm9rZVdpZHRoOiAnNCcsXG4gICAgICAgIHN0cm9rZTogcGF0aENvbG9yLFxuICAgICAgICBzdHJva2VNaXRlckxpbWl0OiAnMTAnLFxuICAgICAgICBzdHJva2VEYXNoYXJyYXk6ICc5IDknLFxuICAgICAgICBzdHJva2VEYXNoT2Zmc2V0OiAnOTg4LjAxJ1xuICAgIH0pO1xuXG4gICAgdmFyIGxlbkIgPSBteVBhdGhCLmdldFRvdGFsTGVuZ3RoKCk7XG5cbiAgICBteVBhdGhCLmF0dHIoe1xuICAgICAgICBzdHJva2U6IHBhdGhDb2xvcixcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDQsXG4gICAgICAgIGZpbGw6ICdub25lJyxcbiAgICAgICAgJ3N0cm9rZS1kYXNoYXJyYXknOiBsZW5CICsgJyAnICsgbGVuQixcbiAgICAgICAgJ3N0cm9rZS1kYXNob2Zmc2V0JzogLWxlbkJcbiAgICB9KS5hbmltYXRlKHtcbiAgICAgICAgJ3N0cm9rZS1kYXNob2Zmc2V0JzogMTBcbiAgICB9LCBhbmltYXRpb25UaW1lLCBtaW5hLmVhc2VvdXRpbm91dCk7XG5cbiAgICAvL+WIm+W7uueCuVxuICAgIC8qbGV0IENpcmNsZUIgPSBwYXBlci5jaXJjbGUoMTYsIDE2LCA4KTtcbiAgICBDaXJjbGVCLmF0dHIoe1xuICAgICAgICBmaWxsOiAnIzNmNDQ0NScsXG4gICAgICAgIHN0cm9rZTogJyNmZmYnLFxuICAgICAgICBzdHJva2VXaWR0aDogMlxuICAgIH0pKi9cbiAgICB2YXIgcGxhbmUgPSBwYXBlci5pbWFnZShhaXJJbWcsIDAsIDAsIDUwLCA0NCk7XG5cbiAgICBTbmFwLmFuaW1hdGUobGVuQiwgMCwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBtb3ZlUG9pbnQgPSBteVBhdGhCLmdldFBvaW50QXRMZW5ndGgodmFsdWUpO1xuXG4gICAgICAgIHBsYW5lLmF0dHIoe1xuICAgICAgICAgICAgJ3gnOiBtb3ZlUG9pbnQueCxcbiAgICAgICAgICAgICd5JzogbW92ZVBvaW50LnlcbiAgICAgICAgfSk7XG4gICAgfSwgYW5pbWF0aW9uVGltZSwgbWluYS5lYXNlaW5vdXQpO1xufVxuXG5leHBvcnRzLnN0YXJ0ID0gc3RhcnQ7XG5cbi8qdmFyIHNuYXBBID0gU25hcCgnI3N2Z0EnKTtcbnZhciBteVBhdGhBID0gc25hcEEucGF0aCgnTTYyLjkgMTQuOWMtMjUtNy43NC01Ni42IDQuOC02MC40IDI0LjMtMy43MyAxOS42IDIxLjYgMzUgMzkuNiAzNy42IDQyLjggNi4yIDcyLjktNTMuNCAxMTYtNTguOSA2NS0xOC4yIDE5MSAxMDEgMjE1IDI4LjggNS0xNi43LTctNDkuMS0zNC00NC0zNCAxMS41LTMxIDQ2LjUtMTQgNjkuMyA5LjM4IDEyLjYgMjQuMiAyMC42IDM5LjggMjIuOSA5MS40IDkuMDUgMTAyLTk4LjkgMTc2LTg2LjcgMTguOCAzLjgxIDMzIDE3LjMgMzYuNyAzNC42IDIuMDEgMTAuMi4xMjQgMjEuMS01LjE4IDMwLjEnKS5hdHRyKHtcbiAgICBpZDogJ3NxdWlnZ2xlJyxcbiAgICBmaWxsOiAnbm9uZScsXG4gICAgc3Ryb2tlV2lkdGg6ICc0JyxcbiAgICBzdHJva2U6ICcjZmZmZmZmJyxcbiAgICBzdHJva2VNaXRlckxpbWl0OiAnMTAnLFxuICAgIHN0cm9rZURhc2hhcnJheTogJzkgOScsXG4gICAgc3Ryb2tlRGFzaE9mZnNldDogJzk4OC4wMSdcbn0pO1xudmFyIGxlbiA9IG15UGF0aEEuZ2V0VG90YWxMZW5ndGgoKTtcbm15UGF0aEEuYXR0cih7XG4gICAgc3Ryb2tlOiAnI2ZmZicsXG4gICAgc3Ryb2tlV2lkdGg6IDQsXG4gICAgZmlsbDogJ25vbmUnLFxuICAgICdzdHJva2UtZGFzaGFycmF5JzogJzEyIDYnLFxuICAgICdzdHJva2UtZGFzaG9mZnNldCc6IGxlblxufSkuYW5pbWF0ZSh7XG4gICAgJ3N0cm9rZS1kYXNob2Zmc2V0JzogMTBcbn0sIDI1MDAsIG1pbmEuZWFzZWlub3V0KTtcbnZhciBDaXJjbGVBID0gc25hcEEuY2lyY2xlKDMyLCAzMiwgMTYpO1xuQ2lyY2xlQS5hdHRyKHtcbiAgICBmaWxsOiAnIzNmNDQ0NScsXG4gICAgc3Ryb2tlOiAnI2ZmZicsXG4gICAgc3Ryb2tlV2lkdGg6IDJcbn0pO1xuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBTbmFwLmFuaW1hdGUoMCwgbGVuLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBtb3ZlUG9pbnQgPSBteVBhdGhBLmdldFBvaW50QXRMZW5ndGgodmFsdWUpO1xuICAgICAgICBDaXJjbGVBLmF0dHIoe1xuICAgICAgICAgICAgY3g6IG1vdmVQb2ludC54LFxuICAgICAgICAgICAgY3k6IG1vdmVQb2ludC55XG4gICAgICAgIH0pO1xuICAgIH0sIDI1MDAsIG1pbmEuZWFzZWlub3V0KTtcbn0pOyovXG5cbi8qXG52YXIgc25hcEMgPSBTbmFwKCcjc3ZnQycpO1xudmFyIG15UGF0aEMgPSBzbmFwQy5wYXRoKCdNNjIuOSAxNC45Yy0yNS03Ljc0LTU2LjYgNC44LTYwLjQgMjQuMy0zLjczIDE5LjYgMjEuNiAzNSAzOS42IDM3LjYgNDIuOCA2LjIgNzIuOS01My40IDExNi01OC45IDY1LTE4LjIgMTkxIDEwMSAyMTUgMjguOCA1LTE2LjctNy00OS4xLTM0LTQ0LTM0IDExLjUtMzEgNDYuNS0xNCA2OS4zIDkuMzggMTIuNiAyNC4yIDIwLjYgMzkuOCAyMi45IDkxLjQgOS4wNSAxMDItOTguOSAxNzYtODYuNyAxOC44IDMuODEgMzMgMTcuMyAzNi43IDM0LjYgMi4wMSAxMC4yLjEyNCAyMS4xLTUuMTggMzAuMScpLmF0dHIoe1xuICAgIGlkOiAnc3F1aWdnbGUnLFxuICAgIGZpbGw6ICdub25lJyxcbiAgICBzdHJva2VXaWR0aDogJzQnLFxuICAgIHN0cm9rZTogJyNmZmZmZmYnLFxuICAgIHN0cm9rZU1pdGVyTGltaXQ6ICcxMCcsXG4gICAgc3Ryb2tlRGFzaGFycmF5OiAnOSA5JyxcbiAgICBzdHJva2VEYXNoT2Zmc2V0OiAnOTg4LjAxJ1xufSk7XG52YXIgbGVuQyA9IG15UGF0aEMuZ2V0VG90YWxMZW5ndGgoKTtcbm15UGF0aEMuYXR0cih7XG4gICAgc3Ryb2tlOiAnI2ZmZicsXG4gICAgc3Ryb2tlV2lkdGg6IDQsXG4gICAgZmlsbDogJ25vbmUnLFxuICAgICdzdHJva2UtZGFzaGFycmF5JzogJzEyIDYnLFxuICAgICdzdHJva2UtZGFzaG9mZnNldCc6ICcxODAnXG59KS5hbmltYXRlKHtcbiAgICAnc3Ryb2tlLWRhc2hvZmZzZXQnOiAxMFxufSwgNDUwMCwgbWluYS5lYXNlaW5vdXQpO1xudmFyIFRyaWFuZ2xlID0gc25hcEMucG9seWxpbmUoJzAsMzAgMTUsMCAzMCwzMCcpO1xuVHJpYW5nbGUuYXR0cih7XG4gICAgaWQ6ICdwbGFuZScsXG4gICAgZmlsbDogJyNmZmYnXG59KTtcbnZhciB0cmlhbmdsZUdyb3VwID0gc25hcEMuZyhUcmlhbmdsZSk7XG5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIFNuYXAuYW5pbWF0ZSgwLCBsZW5DLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBtb3ZlUG9pbnQgPSBteVBhdGhDLmdldFBvaW50QXRMZW5ndGgodmFsdWUpO1xuICAgICAgICB0cmlhbmdsZUdyb3VwLnRyYW5zZm9ybSgndCcgKyBwYXJzZUludChtb3ZlUG9pbnQueCAtIDE1KSArICcsJyArIHBhcnNlSW50KG1vdmVQb2ludC55IC0gMTUpICsgJ3InICsgKG1vdmVQb2ludC5hbHBoYSAtIDkwKSk7XG4gICAgfSwgNDUwMCwgbWluYS5lYXNlaW5vdXQpO1xufSk7XG4qLyJdfQ==
