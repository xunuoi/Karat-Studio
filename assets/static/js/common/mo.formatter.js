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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vbW8uZm9ybWF0dGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgRm9ybWF0dGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRm9ybWF0dGVyKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBGb3JtYXR0ZXIpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKEZvcm1hdHRlciwgW3tcbiAgICBrZXk6ICdhdXRvbGluaycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGF1dG9saW5rKF8kZWwpIHtcbiAgICAgIHZhciBfdGFyZ2V0ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gJ19ibGFuaycgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgIHZhciAkbGluayA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAkbm9kZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICBmaW5kTGlua05vZGUgPSB1bmRlZmluZWQsXG4gICAgICAgICAgayA9IHVuZGVmaW5lZCxcbiAgICAgICAgICBsYXN0SW5kZXggPSB1bmRlZmluZWQsXG4gICAgICAgICAgbGVuID0gdW5kZWZpbmVkLFxuICAgICAgICAgIGxpbmtOb2RlcyA9IHVuZGVmaW5lZCxcbiAgICAgICAgICBtYXRjaCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICByZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICByZXBsYWNlRWxzID0gdW5kZWZpbmVkLFxuICAgICAgICAgIHN1YlN0ciA9IHVuZGVmaW5lZCxcbiAgICAgICAgICB0ZXh0ID0gdW5kZWZpbmVkLFxuICAgICAgICAgIHVyaSA9IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKF8kZWwgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBFcnJvcignTmVlZCBFbGVtZW50Jyk7XG4gICAgICB9XG5cbiAgICAgIHZhciAkZWwgPSAkKCc8ZGl2IGNsYXNzXCJfcHJlX2Zvcm1hdF9lbGVcIj4nICsgKF8kZWwudmFsKCkgfHwgXyRlbC5odG1sKCkpICsgJzwvZGl2PicpO1xuXG4gICAgICBsaW5rTm9kZXMgPSBbXTtcblxuICAgICAgZmluZExpbmtOb2RlID0gZnVuY3Rpb24gKCRwYXJlbnROb2RlKSB7XG4gICAgICAgIHJldHVybiAkcGFyZW50Tm9kZS5jb250ZW50cygpLmVhY2goZnVuY3Rpb24gKGksIG5vZGUpIHtcbiAgICAgICAgICB2YXIgJG5vZGUsIHRleHQ7XG4gICAgICAgICAgJG5vZGUgPSAkKG5vZGUpO1xuICAgICAgICAgIGlmICgkbm9kZS5pcygnYScpIHx8ICRub2RlLmNsb3Nlc3QoJ2EsIHByZScsICRlbCkubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghJG5vZGUuaXMoJ2lmcmFtZScpICYmICRub2RlLmNvbnRlbnRzKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmluZExpbmtOb2RlKCRub2RlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCh0ZXh0ID0gJG5vZGUudGV4dCgpKSAmJiAvaHR0cHM/OlxcL1xcL3x3d3dcXC4vaWcudGVzdCh0ZXh0KSkge1xuICAgICAgICAgICAgcmV0dXJuIGxpbmtOb2Rlcy5wdXNoKCRub2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgZmluZExpbmtOb2RlKCRlbCk7XG5cbiAgICAgIHJlID0gLyhodHRwcz86XFwvXFwvfHd3d1xcLilbXFx3XFwtXFwuXFw/Jj1cXC8jJTosQFxcIVxcK10rL2lnO1xuICAgICAgZm9yIChrID0gMCwgbGVuID0gbGlua05vZGVzLmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgICRub2RlID0gbGlua05vZGVzW2tdO1xuICAgICAgICB0ZXh0ID0gJG5vZGUudGV4dCgpO1xuICAgICAgICByZXBsYWNlRWxzID0gW107XG4gICAgICAgIG1hdGNoID0gbnVsbDtcbiAgICAgICAgbGFzdEluZGV4ID0gMDtcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IHJlLmV4ZWModGV4dCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgc3ViU3RyID0gdGV4dC5zdWJzdHJpbmcobGFzdEluZGV4LCBtYXRjaC5pbmRleCk7XG4gICAgICAgICAgcmVwbGFjZUVscy5wdXNoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN1YlN0cikpO1xuICAgICAgICAgIGxhc3RJbmRleCA9IHJlLmxhc3RJbmRleDtcbiAgICAgICAgICB1cmkgPSAvXihodHRwKHMpPzpcXC9cXC98XFwvKS8udGVzdChtYXRjaFswXSkgPyBtYXRjaFswXSA6ICdodHRwOi8vJyArIG1hdGNoWzBdO1xuICAgICAgICAgICRsaW5rID0gJChcIjxhIHRhcmdldD1cXFwiXCIgKyBfdGFyZ2V0ICsgXCJcXFwiIGhyZWY9XFxcIlwiICsgdXJpICsgXCJcXFwiIHJlbD1cXFwibm9mb2xsb3dcXFwiPjwvYT5cIikudGV4dChtYXRjaFswXSk7XG4gICAgICAgICAgcmVwbGFjZUVscy5wdXNoKCRsaW5rWzBdKTtcbiAgICAgICAgfVxuICAgICAgICByZXBsYWNlRWxzLnB1c2goZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dC5zdWJzdHJpbmcobGFzdEluZGV4KSkpO1xuXG4gICAgICAgICRub2RlLnJlcGxhY2VXaXRoKCQocmVwbGFjZUVscykpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJGVsO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBGb3JtYXR0ZXI7XG59KSgpO1xuXG52YXIgX2Zvcm1hdHRlciA9IG5ldyBGb3JtYXR0ZXIoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gX2Zvcm1hdHRlcjtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyJdfQ==
