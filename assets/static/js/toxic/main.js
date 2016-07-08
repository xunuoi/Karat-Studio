(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * ES6 FILE FOR ToxicController 
 * 2015-11-10 04:11:19
 */

// 月工资p/（（ 8+加班时间e+通勤时间t）*工作天数d）

'use strict';

function calIndex(p, e, t, d) {
    return p / ((8 + e * 1.1 + t * 0.9) * d);
}

function result($ctn, num) {
    $ctn.html(num);

    document.title = '我工作的性感指数是' + num + '!';
}

function main(argument) {
    var $c = $('.org.job_sexy_num'),
        $per = $c.find('input[name="per"]'),
        $extra = $c.find('input[name="extra"]'),
        $traffic = $c.find('input[name="traffic"]'),
        $day = $c.find('input[name="day"]'),
        $calBtn = $c.find('.cal_btn'),
        $result = $c.find('.result');

    $calBtn.on('click', function (evt) {
        var per = parseFloat($per.val()),
            extra = parseFloat($extra.val()),
            traffic = parseFloat($traffic.val()),
            day = parseFloat($day.val());

        if (!per || !day) {
            return alert('请填写相关数据');
        }

        var rs = calIndex(per, extra, traffic, day);
        result($result, rs);

        // console.log(per, extra, traffic, day)
    });
}

$(function () {
    main();
});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC90b3hpYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogRVM2IEZJTEUgRk9SIFRveGljQ29udHJvbGxlciBcbiAqIDIwMTUtMTEtMTAgMDQ6MTE6MTlcbiAqL1xuXG4vLyDmnIjlt6XotYRwL++8iO+8iCA4K+WKoOePreaXtumXtGUr6YCa5Yuk5pe26Ze0dO+8iSrlt6XkvZzlpKnmlbBk77yJXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gY2FsSW5kZXgocCwgZSwgdCwgZCkge1xuICAgIHJldHVybiBwIC8gKCg4ICsgZSAqIDEuMSArIHQgKiAwLjkpICogZCk7XG59XG5cbmZ1bmN0aW9uIHJlc3VsdCgkY3RuLCBudW0pIHtcbiAgICAkY3RuLmh0bWwobnVtKTtcblxuICAgIGRvY3VtZW50LnRpdGxlID0gJ+aIkeW3peS9nOeahOaAp+aEn+aMh+aVsOaYrycgKyBudW0gKyAnISc7XG59XG5cbmZ1bmN0aW9uIG1haW4oYXJndW1lbnQpIHtcbiAgICB2YXIgJGMgPSAkKCcub3JnLmpvYl9zZXh5X251bScpLFxuICAgICAgICAkcGVyID0gJGMuZmluZCgnaW5wdXRbbmFtZT1cInBlclwiXScpLFxuICAgICAgICAkZXh0cmEgPSAkYy5maW5kKCdpbnB1dFtuYW1lPVwiZXh0cmFcIl0nKSxcbiAgICAgICAgJHRyYWZmaWMgPSAkYy5maW5kKCdpbnB1dFtuYW1lPVwidHJhZmZpY1wiXScpLFxuICAgICAgICAkZGF5ID0gJGMuZmluZCgnaW5wdXRbbmFtZT1cImRheVwiXScpLFxuICAgICAgICAkY2FsQnRuID0gJGMuZmluZCgnLmNhbF9idG4nKSxcbiAgICAgICAgJHJlc3VsdCA9ICRjLmZpbmQoJy5yZXN1bHQnKTtcblxuICAgICRjYWxCdG4ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICB2YXIgcGVyID0gcGFyc2VGbG9hdCgkcGVyLnZhbCgpKSxcbiAgICAgICAgICAgIGV4dHJhID0gcGFyc2VGbG9hdCgkZXh0cmEudmFsKCkpLFxuICAgICAgICAgICAgdHJhZmZpYyA9IHBhcnNlRmxvYXQoJHRyYWZmaWMudmFsKCkpLFxuICAgICAgICAgICAgZGF5ID0gcGFyc2VGbG9hdCgkZGF5LnZhbCgpKTtcblxuICAgICAgICBpZiAoIXBlciB8fCAhZGF5KSB7XG4gICAgICAgICAgICByZXR1cm4gYWxlcnQoJ+ivt+Whq+WGmeebuOWFs+aVsOaNricpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJzID0gY2FsSW5kZXgocGVyLCBleHRyYSwgdHJhZmZpYywgZGF5KTtcbiAgICAgICAgcmVzdWx0KCRyZXN1bHQsIHJzKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhwZXIsIGV4dHJhLCB0cmFmZmljLCBkYXkpXG4gICAgfSk7XG59XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIG1haW4oKTtcbn0pOyJdfQ==
