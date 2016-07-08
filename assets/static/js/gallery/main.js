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
 * ES6 FILE FOR GalleryController 
 * 2015-08-28 06:08:59
 */

// import 'jquery/dist/jquery'
'use strict';

require('viewer-master/dist/viewer');

require('header');

function initViewer() {
    $('.line-content').viewer();
}

$(function () {
    initViewer();
});
},{"header":1,"viewer-master/dist/viewer":3}],3:[function(require,module,exports){
/*!
 * Viewer v0.1.1
 * https://github.com/fengyuanchen/viewer
 *
 * Copyright (c) 2015 Fengyuan Chen
 * Released under the MIT license
 *
 * Date: 2015-10-07T06:34:31.917Z
 */

(function (factory) {
  if (false && typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define('viewer', ['jquery'], factory);
  } else if (false && typeof exports === 'object') {
    // Node / CommonJS
    
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function ($) {

  'use strict';

  var $window = $(window);
  var $document = $(document);

  // Constants
  var NAMESPACE = 'viewer';
  var ELEMENT_VIEWER = document.createElement(NAMESPACE);

  // Classes
  var CLASS_TOGGLE = 'viewer-toggle';
  var CLASS_FIXED = 'viewer-fixed';
  var CLASS_OPEN = 'viewer-open';
  var CLASS_SHOW = 'viewer-show';
  var CLASS_HIDE = 'viewer-hide';
  var CLASS_FADE = 'viewer-fade';
  var CLASS_IN = 'viewer-in';
  var CLASS_MOVE = 'viewer-move';
  var CLASS_ACTIVE = 'viewer-active';
  var CLASS_INVISIBLE = 'viewer-invisible';
  var CLASS_TRANSITION = 'viewer-transition';
  var CLASS_FULLSCREEN = 'viewer-fullscreen';
  var CLASS_FULLSCREEN_EXIT = 'viewer-fullscreen-exit';
  var CLASS_CLOSE = 'viewer-close';

  // Selectors
  var SELECTOR_IMG = 'img';

  // Events
  var EVENT_MOUSEDOWN = 'mousedown touchstart pointerdown MSPointerDown';
  var EVENT_MOUSEMOVE = 'mousemove touchmove pointermove MSPointerMove';
  var EVENT_MOUSEUP = 'mouseup touchend touchcancel pointerup pointercancel MSPointerUp MSPointerCancel';
  var EVENT_WHEEL = 'wheel mousewheel DOMMouseScroll';
  var EVENT_TRANSITIONEND = 'transitionend';
  var EVENT_LOAD = 'load.' + NAMESPACE;
  var EVENT_KEYDOWN = 'keydown.' + NAMESPACE;
  var EVENT_CLICK = 'click.' + NAMESPACE;
  var EVENT_RESIZE = 'resize.' + NAMESPACE;
  var EVENT_BUILD = 'build.' + NAMESPACE;
  var EVENT_BUILT = 'built.' + NAMESPACE;
  var EVENT_SHOW = 'show.' + NAMESPACE;
  var EVENT_SHOWN = 'shown.' + NAMESPACE;
  var EVENT_HIDE = 'hide.' + NAMESPACE;
  var EVENT_HIDDEN = 'hidden.' + NAMESPACE;
  var EVENT_VIEW = 'view.' + NAMESPACE;
  var EVENT_VIEWED = 'viewed.' + NAMESPACE;

  // Supports
  var SUPPORT_TRANSITION = typeof ELEMENT_VIEWER.style.transition !== 'undefined';

  // Others
  var round = Math.round;
  var sqrt = Math.sqrt;
  var abs = Math.abs;
  var min = Math.min;
  var max = Math.max;
  var num = parseFloat;

  // Prototype
  var prototype = {};

  function isString(s) {
    return typeof s === 'string';
  }

  function isNumber(n) {
    return typeof n === 'number' && !isNaN(n);
  }

  function isUndefined(u) {
    return typeof u === 'undefined';
  }

  function toArray(obj, offset) {
    var args = [];

    if (isNumber(offset)) { // It's necessary for IE8
      args.push(offset);
    }

    return args.slice.apply(obj, args);
  }

  // Custom proxy to avoid jQuery's guid
  function proxy(fn, context) {
    var args = toArray(arguments, 2);

    return function () {
      return fn.apply(context, args.concat(toArray(arguments)));
    };
  }

  function getTransform(options) {
    var transforms = [];
    var rotate = options.rotate;
    var scaleX = options.scaleX;
    var scaleY = options.scaleY;

    if (isNumber(rotate)) {
      transforms.push('rotate(' + rotate + 'deg)');
    }

    if (isNumber(scaleX) && isNumber(scaleY)) {
      transforms.push('scale(' + scaleX + ',' + scaleY + ')');
    }

    return transforms.length ? transforms.join(' ') : 'none';
  }

  // e.g.: http://domain.com/path/to/picture.jpg?size=1280×960 -> picture.jpg
  function getImageName(url) {
    return isString(url) ? url.replace(/^.*\//, '').replace(/[\?&#].*$/, '') : '';
  }

  function getImageSize(image, callback) {
    var newImage;

    // Modern browsers
    if (image.naturalWidth) {
      return callback(image.naturalWidth, image.naturalHeight);
    }

    // IE8: Don't use `new Image()` here
    newImage = document.createElement('img');

    newImage.onload = function () {
      callback(this.width, this.height);
    };

    newImage.src = image.src;
  }

  function Viewer(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Viewer.DEFAULTS, $.isPlainObject(options) && options);
    this.isImg = false;
    this.isBuilt = false;
    this.isShown = false;
    this.isViewed = false;
    this.isFulled = false;
    this.isPlayed = false;
    this.playing = false;
    this.fading = false;
    this.transitioning = false;
    this.action = false;
    this.target = false;
    this.index = 0;
    this.length = 0;
    this.init();
  }

  $.extend(prototype, {
    init: function () {
      var options = this.options;
      var $this = this.$element;
      var isImg = $this.is(SELECTOR_IMG);
      var $images = isImg ? $this : $this.find(SELECTOR_IMG);
      
      var length = $images.length;
      var ready = $.proxy(this.ready, this);

      if (!length) {
        return;
      }

      if ($.isFunction(options.build)) {
        $this.one(EVENT_BUILD, options.build);
      }

      if (this.trigger(EVENT_BUILD).isDefaultPrevented()) {
        return;
      }

      // Override `transiton` option if it is not supported
      if (!SUPPORT_TRANSITION) {
        options.transition = false;
      }

      this.isImg = isImg;
      this.length = length;
      this.count = 0;
      this.$images = $images;
      this.$body = $('body');

      if (options.inline) {
        $this.one(EVENT_BUILT, $.proxy(function () {
          this.view();
        }, this));

        $images.each(function () {
          if (this.complete) {
            ready();
          } else {
            $(this).one(EVENT_LOAD, ready);
          }
        });
      } else {
        $images.addClass(CLASS_TOGGLE);
        $this.on(EVENT_CLICK, $.proxy(this.start, this));
      }
    },

    ready: function () {
      this.count++;

      if (this.count === this.length) {
        this.build();
      }
    }
  });

  $.extend(prototype, {
    build: function () {
      var options = this.options;
      var $this = this.$element;
      var $parent;
      var $viewer;
      var $button;
      var $toolbar;

      if (this.isBuilt) {
        return;
      }

      if (!$parent || !$parent.length) {
        $parent = $this.parent();
      }

      this.$parent = $parent;
      this.$viewer = $viewer = $(Viewer.TEMPLATE);
      this.$canvas = $viewer.find('.viewer-canvas');
      this.$footer = $viewer.find('.viewer-footer');
      this.$title = $viewer.find('.viewer-title').toggleClass(CLASS_HIDE, !options.title);
      this.$toolbar = $toolbar = $viewer.find('.viewer-toolbar').toggleClass(CLASS_HIDE, !options.toolbar);
      this.$navbar = $viewer.find('.viewer-navbar').toggleClass(CLASS_HIDE, !options.navbar);
      this.$button = $button = $viewer.find('.viewer-button').toggleClass(CLASS_HIDE, !options.button);
      this.$tooltip = $viewer.find('.viewer-tooltip');
      this.$player = $viewer.find('.viewer-player');
      this.$list = $viewer.find('.viewer-list');

      $toolbar.find('li[class*=zoom]').toggleClass(CLASS_INVISIBLE, !options.zoomable);
      $toolbar.find('li[class*=flip]').toggleClass(CLASS_INVISIBLE, !options.scalable);

      if (!options.rotatable) {
        $toolbar.find('li[class*=rotate]').addClass(CLASS_INVISIBLE).appendTo($toolbar);
      }

      if (options.inline) {
        $button.addClass(CLASS_FULLSCREEN);
        $viewer.css('z-index', options.zIndexInline);

        if ($parent.css('position') === 'static') {
          $parent.css('position', 'relative');
        }
      } else {
        $button.addClass(CLASS_CLOSE);
        $viewer.
          css('z-index', options.zIndex).
          addClass([CLASS_FIXED, CLASS_FADE, CLASS_HIDE].join(' '));
      }

      $this.after($viewer);

      if (options.inline) {
        this.render();
        this.bind();
        this.isShown = true;
      }

      this.isBuilt = true;

      if ($.isFunction(options.built)) {
        $this.one(EVENT_BUILT, options.built);
      }

      this.trigger(EVENT_BUILT);
    },

    unbuild: function () {
      var options = this.options;
      var $this = this.$element;

      if (!this.isBuilt) {
        return;
      }

      if (options.inline && !options.container) {
        $this.removeClass(CLASS_HIDE);
      }

      this.$viewer.remove();
    }
  });

  $.extend(prototype, {
    bind: function () {
      this.$viewer.
        on(EVENT_CLICK, $.proxy(this.click, this)).
        on(EVENT_WHEEL, $.proxy(this.wheel, this));

      this.$canvas.on(EVENT_MOUSEDOWN, $.proxy(this.mousedown, this));

      $document.
        on(EVENT_MOUSEMOVE, (this._mousemove = proxy(this.mousemove, this))).
        on(EVENT_MOUSEUP, (this._mouseup = proxy(this.mouseup, this))).
        on(EVENT_KEYDOWN, (this._keydown = proxy(this.keydown, this)));

      $window.on(EVENT_RESIZE, (this._resize = proxy(this.resize, this)));
    },

    unbind: function () {
      this.$viewer.
        off(EVENT_CLICK, this.click).
        off(EVENT_WHEEL, this.wheel);

      this.$canvas.off(EVENT_MOUSEDOWN, this.mousedown);

      $document.
        off(EVENT_MOUSEMOVE, this._mousemove).
        off(EVENT_MOUSEUP, this._mouseup).
        off(EVENT_KEYDOWN, this._keydown);

      $window.off(EVENT_RESIZE, this._resize);
    }
  });

  $.extend(prototype, {
    render: function () {
      this.initContainer();
      this.initViewer();
      this.initList();
      this.renderViewer();
    },

    initContainer: function () {
      this.container = {
        width: $window.innerWidth(),
        height: $window.innerHeight()
      };
    },

    initViewer: function () {
      var options = this.options;
      var $parent = this.$parent;
      var viewer;

      if (options.inline) {
        this.parent = viewer = {
          width: max($parent.width(), options.minWidth),
          height: max($parent.height(), options.minHeight)
        };
      }

      if (this.isFulled || !viewer) {
        viewer = this.container;
      }

      this.viewer = $.extend({}, viewer);
    },

    renderViewer: function () {
      if (this.options.inline && !this.isFulled) {
        this.$viewer.css(this.viewer);
      }
    },

    initList: function () {
      var options = this.options;
      var $this = this.$element;
      var $list = this.$list;
      var list = [];

      this.$images.each(function (i) {
        var src = this.src;
        var alt = this.alt || getImageName(src);
        var url = options.url;

        if (!src) {
          return;
        }

        if (isString(url)) {
          url = this.getAttribute(url);
        } else if ($.isFunction(url)) {
          url = url.call(this, this);
        }

        list.push(
          '<li>' +
            '<img' +
              ' src="' + src + '"' +
              ' data-action="view"' +
              ' data-index="' +  i + '"' +
              ' data-original-url="' +  (url || src) + '"' +
              ' alt="' +  alt + '"' +
            '>' +
          '</li>'
        );
      });

      $list.html(list.join('')).find(SELECTOR_IMG).one(EVENT_LOAD, {
        filled: true
      }, $.proxy(this.loadImage, this));

      this.$items = $list.children();

      if (options.transition) {
        $this.one(EVENT_VIEWED, function () {
          $list.addClass(CLASS_TRANSITION);
        });
      }
    },

    renderList: function (index) {
      var i = index || this.index;
      var width = this.$items.eq(i).width();
      var outerWidth = width + 1; // 1 pixel of `margin-left` width

      // Place the active item in the center of the screen
      this.$list.css({
        width: outerWidth * this.length,
        marginLeft: (this.viewer.width - width) / 2 - outerWidth * i
      });
    },

    resetList: function () {
      this.$list.empty().removeClass(CLASS_TRANSITION).css('margin-left', 0);
    },

    initImage: function (callback) {
      var options = this.options;
      var $image = this.$image;
      var viewer = this.viewer;
      var footerHeight = this.$footer.height();
      var viewerWidth = viewer.width;
      var viewerHeight = max(viewer.height - footerHeight, footerHeight);
      var oldImage = this.image || {};

      getImageSize($image[0], $.proxy(function (naturalWidth, naturalHeight) {
        var aspectRatio = naturalWidth / naturalHeight;
        var width = viewerWidth;
        var height = viewerHeight;
        var initialImage;
        var image;

        if (viewerHeight * aspectRatio > viewerWidth) {
          height = viewerWidth / aspectRatio;
        } else {
          width = viewerHeight * aspectRatio;
        }

        width = min(width * 0.9, naturalWidth);
        height = min(height * 0.9, naturalHeight);

        image = {
          naturalWidth: naturalWidth,
          naturalHeight: naturalHeight,
          aspectRatio: aspectRatio,
          ratio: width / naturalWidth,
          width: width,
          height: height,
          left: (viewerWidth - width) / 2,
          top: (viewerHeight - height) / 2
        };

        initialImage = $.extend({}, image);

        if (options.rotatable) {
          image.rotate = oldImage.rotate || 0;
          initialImage.rotate = 0;
        }

        if (options.scalable) {
          image.scaleX = oldImage.scaleX || 1;
          image.scaleY = oldImage.scaleY || 1;
          initialImage.scaleX = 1;
          initialImage.scaleY = 1;
        }

        this.image = image;
        this.initialImage = initialImage;

        if ($.isFunction(callback)) {
          callback();
        }
      }, this));
    },

    renderImage: function (callback) {
      var image = this.image;
      var $image = this.$image;

      $image.css({
        width: image.width,
        height: image.height,
        marginLeft: image.left,
        marginTop: image.top,
        transform: getTransform(image)
      });

      if ($.isFunction(callback)) {
        if (this.options.transition) {
          $image.one(EVENT_TRANSITIONEND, callback);
        } else {
          callback();
        }
      }
    },

    resetImage: function () {
      this.$image.remove();
      this.$image = null;
    }
  });

  $.extend(prototype, {
    start: function (e) {
      var target = e.target;

      if ($(target).hasClass(CLASS_TOGGLE)) {
        this.target = target;
        this.show();
      }
    },

    click: function (e) {
      var $target = $(e.target);
      var action = $target.data('action');
      var image = this.image;
      switch (action) {
        case 'mix':
          if (this.isPlayed) {
            this.stop();
          } else {
            if (this.options.inline) {
              if (this.isFulled) {
                this.exit();
              } else {
                this.full();
              }
            } else {
              this.hide();
            }
          }

          break;

        case 'view':
          this.view($target.data('index'));
          break;

        case 'zoom-in':
          this.zoom(0.1, true);
          break;

        case 'zoom-out':
          this.zoom(-0.1, true);
          break;

        case 'one-to-one':
          if (this.image.ratio === 1) {
            this.zoomTo(this.initialImage.ratio);
          } else {
            this.zoomTo(1);
          }

          break;

        case 'reset':
          this.reset();
          break;

        case 'prev':
          this.prev();
          break;

        case 'play':
          this.play();
          break;

        case 'next':
          this.next();
          break;

        case 'rotate-left':
          this.rotate(-90);
          break;

        case 'rotate-right':
          this.rotate(90);
          break;

        case 'flip-horizontal':
          this.scale(-image.scaleX || -1, image.scaleY || 1);
          break;

        case 'flip-vertical':
          this.scale(image.scaleX || 1, -image.scaleY || -1);
          break;

        default:
          if (this.isPlayed) {
            this.stop();
          }
      }
    },

    load: function () {
      this.initImage($.proxy(function () {
        this.renderImage($.proxy(function () {
          this.isViewed = true;
          this.trigger(EVENT_VIEWED);
        }, this));
      }, this));
    },

    loadImage: function (e) {
      var image = e.target;
      var $image = $(image);
      var $parent = $image.parent();
      var parentWidth = $parent.width();
      var parentHeight = $parent.height();
      var filled = e.data && e.data.filled;

      getImageSize(image, $.proxy(function (naturalWidth, naturalHeight) {
        var aspectRatio = naturalWidth / naturalHeight;
        var width = parentWidth;
        var height = parentHeight;

        if (parentHeight * aspectRatio > parentWidth) {
          if (filled) {
            width = parentHeight * aspectRatio;
          } else {
            height = parentWidth / aspectRatio;
          }
        } else {
          if (filled) {
            height = parentWidth / aspectRatio;
          } else {
            width = parentHeight * aspectRatio;
          }
        }

        $image.css({
          width: width,
          height: height,
          marginLeft: (parentWidth - width) / 2,
          marginTop: (parentHeight - height) / 2
        });
      }, this));
    },

    resize: function () {
      this.initContainer();
      this.initViewer();
      this.renderViewer();
      this.renderList();
      this.initImage($.proxy(function () {
        this.renderImage();
      }, this));

      if (this.isPlayed) {
        this.$player.
          find(SELECTOR_IMG).
          one(EVENT_LOAD, $.proxy(this.loadImage, this)).
          trigger(EVENT_LOAD);
      }
    },

    wheel: function (event) {
      var e = event.originalEvent;
      var ratio = num(this.options.zoomRatio) || 0.1;
      var delta = 1;

      if (!this.isViewed) {
        return;
      }

      event.preventDefault();

      if (e.deltaY) {
        delta = e.deltaY > 0 ? 1 : -1;
      } else if (e.wheelDelta) {
        delta = -e.wheelDelta / 120;
      } else if (e.detail) {
        delta = e.detail > 0 ? 1 : -1;
      }

      this.zoom(-delta * ratio, true);
    },

    keydown: function (e) {
      var options = this.options;
      var which = e.which;

      if (!this.isFulled || !options.keyboard) {
        return;
      }

      switch (which) {

        // (Key: Esc)
        case 27:
          if (this.isPlayed) {
            this.stop();
          } else {
            if (options.inline) {
              if (this.isFulled) {
                this.exit();
              }
            } else {
              this.hide();
            }
          }

          break;

        // View previous (Key: ←)
        case 37:
          this.prev();
          break;

        // Zoom in (Key: ↑)
        case 38:
          this.zoom(options.zoomRatio, true);
          break;

        // View next (Key: →)
        case 39:
          this.next();
          break;

        // Zoom out (Key: ↓)
        case 40:
          this.zoom(-options.zoomRatio, true);
          break;

        // Zoom out to initial size (Key: Ctrl + 0)
        case 48:
          // Go to next

        // Zoom in to natural size (Key: Ctrl + 1)
        case 49:
          if (e.ctrlKey || e.shiftKey) {
            e.preventDefault();

            if (this.image.ratio === 1) {
              this.zoomTo(this.initialImage.ratio);
            } else {
              this.zoomTo(1);
            }
          }

          break;

        // No default
      }
    },

    mousedown: function (event) {
      var options = this.options;
      var originalEvent = event.originalEvent;
      var touches = originalEvent && originalEvent.touches;
      var e = event;
      var action = options.movable ? 'move' : false;
      var touchesLength;

      if (!this.isViewed) {
        return;
      }

      if (touches) {
        touchesLength = touches.length;

        if (touchesLength > 1) {
          if (options.zoomable && touchesLength === 2) {
            e = touches[1];
            this.startX2 = e.pageX;
            this.startY2 = e.pageY;
            action = 'zoom';
          } else {
            return;
          }
        } else {
          if (this.isSwitchable()) {
            action = 'switch';
          }
        }

        e = touches[0];
      }

      if (action) {
        event.preventDefault();
        this.action = action;

        // IE8  has `event.pageX/Y`, but not `event.originalEvent.pageX/Y`
        // IE10 has `event.originalEvent.pageX/Y`, but not `event.pageX/Y`
        this.startX = e.pageX || originalEvent && originalEvent.pageX;
        this.startY = e.pageY || originalEvent && originalEvent.pageY;
      }
    },

    mousemove: function (event) {
      var options = this.options;
      var action = this.action;
      var $image = this.$image;
      var originalEvent = event.originalEvent;
      var touches = originalEvent && originalEvent.touches;
      var e = event;
      var touchesLength;

      if (!this.isViewed) {
        return;
      }

      if (touches) {
        touchesLength = touches.length;

        if (touchesLength > 1) {
          if (options.zoomable && touchesLength === 2) {
            e = touches[1];
            this.endX2 = e.pageX;
            this.endY2 = e.pageY;
          } else {
            return;
          }
        }

        e = touches[0];
      }

      if (action) {
        event.preventDefault();

        if (action === 'move' && options.transition && $image.hasClass(CLASS_TRANSITION)) {
          $image.removeClass(CLASS_TRANSITION);
        }

        this.endX = e.pageX || originalEvent && originalEvent.pageX;
        this.endY = e.pageY || originalEvent && originalEvent.pageY;

        this.change();
      }
    },

    mouseup: function (event) {
      var action = this.action;

      if (action) {
        event.preventDefault();

        if (action === 'move' && this.options.transition) {
          this.$image.addClass(CLASS_TRANSITION);
        }

        this.action = false;
      }
    }
  });

  $.extend(prototype, {

    // Show the viewer (only available in modal mode)
    show: function () {
      var options = this.options;
      var $viewer;

      if (options.inline || this.transitioning) {
        return;
      }

      if (!this.isBuilt) {
        this.build();
      }

      if ($.isFunction(options.show)) {
        this.$element.one(EVENT_SHOW, options.show);
      }

      if (this.trigger(EVENT_SHOW).isDefaultPrevented()) {
        return;
      }

      this.$body.addClass(CLASS_OPEN);
      $viewer = this.$viewer.removeClass(CLASS_HIDE);

      this.$element.one(EVENT_SHOWN, $.proxy(function () {
        this.view((this.target ? this.$images.index(this.target) : 0) || this.index);
        this.target = false;
      }, this));

      if (options.transition) {
        this.transitioning = true;

        /* jshint expr:true */
        $viewer.addClass(CLASS_TRANSITION).get(0).offsetWidth;
        $viewer.one(EVENT_TRANSITIONEND, $.proxy(this.shown, this)).addClass(CLASS_IN);
      } else {
        $viewer.addClass(CLASS_IN);
        this.shown();
      }
    },

    // Hide the viewer (only available in modal mode)
    hide: function () {
      var options = this.options;
      var $viewer = this.$viewer;

      if (options.inline || this.transitioning || !this.isShown) {
        return;
      }

      if ($.isFunction(options.hide)) {
        this.$element.one(EVENT_HIDE, options.hide);
      }

      if (this.trigger(EVENT_HIDE).isDefaultPrevented()) {
        return;
      }

      if (this.isViewed && options.transition) {
        this.transitioning = true;
        this.$image.one(EVENT_TRANSITIONEND, $.proxy(function () {
          $viewer.one(EVENT_TRANSITIONEND, $.proxy(this.hidden, this)).removeClass(CLASS_IN);
        }, this));
        this.zoomTo(0, false, true);
      } else {
        $viewer.removeClass(CLASS_IN);
        this.hidden();
      }
    },

    /**
     * View one of the images with image's index
     *
     * @param {Number} index
     */
    view: function (index) {
      var options = this.options;
      var viewer = this.viewer;
      var $title = this.$title;
      var $image;
      var $item;
      var $img;
      var url;
      var alt;

      index = Number(index) || 0;

      if (!this.isShown || this.isPlayed || index < 0 || index >= this.length ||
        this.isViewed && index === this.index) {
        return;
      }

      if (this.trigger(EVENT_VIEW).isDefaultPrevented()) {
        return;
      }

      $item = this.$items.eq(index);
      $img = $item.find(SELECTOR_IMG);
      url = $img.data('originalUrl');
      alt = $img.attr('alt');

      this.$image = $image = $('<img src="' + url + '" alt="' + alt + '">');

      $image.
        toggleClass(CLASS_TRANSITION, options.transition).
        toggleClass(CLASS_MOVE, options.movable).
        css({
          width: 0,
          height: 0,
          marginLeft: viewer.width / 2,
          marginTop: viewer.height / 2
        });

      this.$items.eq(this.index).removeClass(CLASS_ACTIVE);
      $item.addClass(CLASS_ACTIVE);

      this.isViewed = false;
      this.index = index;
      this.image = null;
      $image.one(EVENT_LOAD, $.proxy(this.load, this));
      this.$canvas.html($image);
      $title.empty();

      // Center current item
      this.renderList();

      // Show title when viewed
      this.$element.one(EVENT_VIEWED, $.proxy(function () {
        var image = this.image;
        var width = image.naturalWidth;
        var height = image.naturalHeight;

        $title.html(alt + ' (' + width + ' &times; ' + height + ')');
      }, this));
    },

    // View the previous image
    prev: function () {
      this.view(max(this.index - 1, 0));
    },

    // View the next image
    next: function () {
      this.view(min(this.index + 1, this.length - 1));
    },

    /**
     * Move the image
     *
     * @param {Number} offsetX
     * @param {Number} offsetY (optional)
     */
    move: function (offsetX, offsetY) {
      var image = this.image;

      // If "offsetY" is not present, its default value is "offsetX"
      if (isUndefined(offsetY)) {
        offsetY = offsetX;
      }

      offsetX = num(offsetX);
      offsetY = num(offsetY);

      if (this.isShown && !this.isPlayed && this.options.movable) {
        image.left += isNumber(offsetX) ? offsetX : 0;
        image.top += isNumber(offsetY) ? offsetY : 0;
        this.renderImage();
      }
    },

    /**
     * Zoom the image
     *
     * @param {Number} ratio
     * @param {Boolean} hasTooltip (optional)
     */
    zoom: function (ratio, hasTooltip) {
      var options = this.options;
      var minZoomRatio = max(0.01, options.minZoomRatio);
      var maxZoomRatio = min(100, options.maxZoomRatio);
      var image = this.image;
      var width;
      var height;

      ratio = num(ratio);

      if (isNumber(ratio) && this.isShown && !this.isPlayed && options.zoomable) {
        if (ratio < 0) {
          ratio =  1 / (1 - ratio);
        } else {
          ratio = 1 + ratio;
        }

        width = image.width * ratio;
        height = image.height * ratio;
        ratio = width / image.naturalWidth;
        ratio = min(max(ratio, minZoomRatio), maxZoomRatio);

        if (ratio > 0.95 && ratio < 1.05) {
          ratio = 1;
          width = image.naturalWidth;
          height = image.naturalHeight;
        }

        image.left -= (width - image.width) / 2;
        image.top -= (height - image.height) / 2;
        image.width = width;
        image.height = height;
        image.ratio = ratio;
        this.renderImage();

        if (hasTooltip) {
          this.tooltip();
        }
      }
    },

    /**
     * Zoom the image to a special ratio
     *
     * @param {Number} ratio
     * @param {Boolean} hasTooltip (optional)
     * @param {Boolean} _zoomable (private)
     */
    zoomTo: function (ratio, hasTooltip, _zoomable) {
      var image = this.image;
      var width;
      var height;

      ratio = max(ratio, 0);

      if (isNumber(ratio) && this.isShown && !this.isPlayed && (_zoomable || this.options.zoomable)) {
        width = image.naturalWidth * ratio;
        height = image.naturalHeight * ratio;
        image.left -= (width - image.width) / 2;
        image.top -= (height - image.height) / 2;
        image.width = width;
        image.height = height;
        image.ratio = ratio;
        this.renderImage();

        if (hasTooltip) {
          this.tooltip();
        }
      }
    },

    /**
     * Rotate the image
     * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#rotate()
     *
     * @param {Number} degrees
     */
    rotate: function (degrees) {
      var image = this.image;

      degrees = num(degrees);

      if (isNumber(degrees) && this.isShown && !this.isPlayed && this.options.rotatable) {
        image.rotate = ((image.rotate || 0) + degrees);
        this.renderImage();
      }
    },

    /**
     * Rotate the image to a special angle
     *
     * @param {Number} degrees
     */
    rotateTo: function (degrees) {
      var image = this.image;

      degrees = num(degrees);

      if (isNumber(degrees) && this.isShown && !this.isPlayed && this.options.rotatable) {
        image.rotate = degrees;
        this.renderImage();
      }
    },

    /**
     * Scale the image
     * https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#scale()
     *
     * @param {Number} scaleX
     * @param {Number} scaleY (optional)
     */
    scale: function (scaleX, scaleY) {
      var image = this.image;

      // If "scaleY" is not present, its default value is "scaleX"
      if (isUndefined(scaleY)) {
        scaleY = scaleX;
      }

      scaleX = num(scaleX);
      scaleY = num(scaleY);

      if (this.isShown && !this.isPlayed && this.options.scalable) {
        image.scaleX = isNumber(scaleX) ? scaleX : 1;
        image.scaleY = isNumber(scaleY) ? scaleY : 1;
        this.renderImage();
      }
    },

    /**
     * Scale the abscissa of the image
     *
     * @param {Number} scaleX
     */
    scaleX: function (scaleX) {
      this.scale(scaleX, this.image.scaleY);
    },

    /**
     * Scale the ordinate of the image
     *
     * @param {Number} scaleY
     */
    scaleY: function (scaleY) {
      this.scale(this.image.scaleX, scaleY);
    },

    // Play the images
    play: function () {
      var options = this.options;
      var $player = this.$player;
      var load = $.proxy(this.loadImage, this);
      var list = [];
      var total = 0;
      var index = 0;
      var playing;

      if (!this.isShown || this.isPlayed) {
        return;
      }

      if (options.fullscreen) {
        this.fullscreen();
      }

      this.isPlayed = true;
      $player.addClass(CLASS_SHOW);

      this.$items.each(function (i) {
        var $this = $(this);
        var $img = $this.find(SELECTOR_IMG);
        var $image = $('<img src="' + $img.data('originalUrl') + '" alt="' + $img.attr('alt') + '">');

        total++;

        $image.addClass(CLASS_FADE).toggleClass(CLASS_TRANSITION, options.transition);

        if ($this.hasClass(CLASS_ACTIVE)) {
          $image.addClass(CLASS_IN);
          index = i;
        }

        list.push($image);
        $image.one(EVENT_LOAD, {
          filled: false
        }, load);
        $player.append($image);
      });

      if (isNumber(options.interval) && options.interval > 0) {
        playing = $.proxy(function () {
          this.playing = setTimeout(function () {
            list[index].removeClass(CLASS_IN);
            index++;
            index = index < total ? index : 0;
            list[index].addClass(CLASS_IN);

            playing();
          }, options.interval);
        }, this);

        if (total > 1) {
          playing();
        }
      }
    },

    // Stop play
    stop: function () {
      if (!this.isPlayed) {
        return;
      }

      this.isPlayed = false;
      clearTimeout(this.playing);
      this.$player.removeClass(CLASS_SHOW).empty();
    },

    // Enter modal mode (only available in inline mode)
    full: function () {
      var options = this.options;
      var $image = this.$image;
      var $list = this.$list;

      if (!this.isShown || this.isPlayed || this.isFulled || !options.inline) {
        return;
      }

      this.isFulled = true;
      this.$body.addClass(CLASS_OPEN);
      this.$button.addClass(CLASS_FULLSCREEN_EXIT);

      if (options.transition) {
        $image.removeClass(CLASS_TRANSITION);
        $list.removeClass(CLASS_TRANSITION);
      }

      this.$viewer.addClass(CLASS_FIXED).removeAttr('style').css('z-index', options.zIndex);
      this.initContainer();
      this.viewer = $.extend({}, this.container);
      this.renderList();
      this.initImage($.proxy(function () {
        this.renderImage(function () {
          if (options.transition) {
            setTimeout(function () {
              $image.addClass(CLASS_TRANSITION);
              $list.addClass(CLASS_TRANSITION);
            }, 0);
          }
        });
      }, this));
    },

    // Exit modal mode (only available in inline mode)
    exit: function () {
      var options = this.options;
      var $image = this.$image;
      var $list = this.$list;

      if (!this.isFulled) {
        return;
      }

      this.isFulled = false;
      this.$body.removeClass(CLASS_OPEN);
      this.$button.removeClass(CLASS_FULLSCREEN_EXIT);

      if (options.transition) {
        $image.removeClass(CLASS_TRANSITION);
        $list.removeClass(CLASS_TRANSITION);
      }

      this.$viewer.removeClass(CLASS_FIXED).css('z-index', options.zIndexInline);
      this.viewer = $.extend({}, this.parent);
      this.renderViewer();
      this.renderList();
      this.initImage($.proxy(function () {
        this.renderImage(function () {
          if (options.transition) {
            setTimeout(function () {
              $image.addClass(CLASS_TRANSITION);
              $list.addClass(CLASS_TRANSITION);
            }, 0);
          }
        });
      }, this));
    },

    // Show the current ratio of the image with percentage
    tooltip: function () {
      var options = this.options;
      var $tooltip = this.$tooltip;
      var image = this.image;
      var classes = [
            CLASS_SHOW,
            CLASS_FADE,
            CLASS_TRANSITION
          ].join(' ');

      if (!this.isShown || this.isPlayed || !options.tooltip) {
        return;
      }

      $tooltip.text(round(image.ratio * 100) + '%');

      if (!this.fading) {
        if (options.transition) {

          /* jshint expr:true */
          $tooltip.addClass(classes).get(0).offsetWidth;
          $tooltip.addClass(CLASS_IN);
        } else {
          $tooltip.addClass(CLASS_SHOW);
        }
      } else {
        clearTimeout(this.fading);
      }

      this.fading = setTimeout($.proxy(function () {
        if (options.transition) {
          $tooltip.one(EVENT_TRANSITIONEND, function () {
            $tooltip.removeClass(classes);
          }).removeClass(CLASS_IN);
        } else {
          $tooltip.removeClass(CLASS_SHOW);
        }

        this.fading = false;
      }, this), 1000);
    },

    // Toggle the image size between its natural size and initial size.
    toggle: function () {
      if (this.image.ratio === 1) {
        this.zoomTo(this.initialImage.ratio);
      } else {
        this.zoomTo(1);
      }
    },

    // Reset the image to its initial state.
    reset: function () {
      if (this.isShown && !this.isPlayed) {
        this.image = $.extend({}, this.initialImage);
        this.renderImage();
      }
    },

    // Destroy the viewer
    destroy: function () {
      var $this = this.$element;

      if (this.options.inline) {
        this.unbind();
      } else {
        if (this.isShown) {
          this.unbind();
        }
        /**
         * @debug
         * @Cloud
         * Fix no-images bug, add length inspect:
         */
        this.$images ? this.$images.removeClass(CLASS_TOGGLE) : '';

        $this.off(EVENT_CLICK, this.start);
      }

      this.unbuild();
      $this.removeData(NAMESPACE);
    }
  });

  $.extend(prototype, {

    // A shortcut for triggering custom events
    trigger: function (type, data) {
      var e = $.Event(type, data);

      this.$element.trigger(e);

      return e;
    },

    shown: function () {
      var options = this.options;

      this.transitioning = false;
      this.isFulled = true;
      this.isShown = true;
      this.isVisible = true;
      this.render();
      this.bind();

      if ($.isFunction(options.shown)) {
        this.$element.one(EVENT_SHOWN, options.shown);
      }

      this.trigger(EVENT_SHOWN);
    },

    hidden: function () {
      var options = this.options;

      this.transitioning = false;
      this.isViewed = false;
      this.isFulled = false;
      this.isShown = false;
      this.isVisible = false;
      this.unbind();
      this.$body.removeClass(CLASS_OPEN);
      this.$viewer.addClass(CLASS_HIDE);
      this.resetList();
      this.resetImage();

      if ($.isFunction(options.hidden)) {
        this.$element.one(EVENT_HIDDEN, options.hidden);
      }

      this.trigger(EVENT_HIDDEN);
    },

    fullscreen: function () {
      var documentElement = document.documentElement;

      if (this.isFulled && !document.fullscreenElement && !document.mozFullScreenElement &&
        !document.webkitFullscreenElement && !document.msFullscreenElement) {

        if (documentElement.requestFullscreen) {
          documentElement.requestFullscreen();
        } else if (documentElement.msRequestFullscreen) {
          documentElement.msRequestFullscreen();
        } else if (documentElement.mozRequestFullScreen) {
          documentElement.mozRequestFullScreen();
        } else if (documentElement.webkitRequestFullscreen) {
          documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      }
    },

    change: function () {
      var offsetX = this.endX - this.startX;
      var offsetY = this.endY - this.startY;

      switch (this.action) {

        // Move the current image
        case 'move':
          this.move(offsetX, offsetY);
          break;

        // Zoom the current image
        case 'zoom':
          this.zoom(function (x1, y1, x2, y2) {
            var z1 = sqrt(x1 * x1 + y1 * y1);
            var z2 = sqrt(x2 * x2 + y2 * y2);

            return (z2 - z1) / z1;
          }(
            abs(this.startX - this.startX2),
            abs(this.startY - this.startY2),
            abs(this.endX - this.endX2),
            abs(this.endY - this.endY2)
          ));

          this.startX2 = this.endX2;
          this.startY2 = this.endY2;
          break;

        case 'switch':
          this.action = 'switched';

          if (offsetX > 1) {
            this.prev();
          } else if (offsetX < -1) {
            this.next();
          }

          break;

        // No default
      }

      // Override
      this.startX = this.endX;
      this.startY = this.endY;
    },

    isSwitchable: function () {
      var image = this.image;
      var viewer = this.viewer;

      return (image.left >= 0 && image.top >= 0 && image.width <= viewer.width &&
        image.height <= viewer.height);
    }
  });

  $.extend(Viewer.prototype, prototype);

  Viewer.DEFAULTS = {
    // Enable inline mode
    inline: false,

    // Show the button on the top-right of the viewer
    button: true,

    // Show the navbar
    navbar: true,

    // Show the title
    title: true,

    // Show the toolbar
    toolbar: true,

    // Show the tooltip with image ratio (percentage) when zoom in or zoom out
    tooltip: true,

    // Enable to move the image
    movable: true,

    // Enable to zoom the image
    zoomable: true,

    // Enable to rotate the image
    rotatable: true,

    // Enable to scale the image
    scalable: true,

    // Enable CSS3 Transition for some special elements
    transition: true,

    // Enable to request fullscreen when play
    fullscreen: true,

    // Enable keyboard support
    keyboard: true,

    // Define interval of each image when playing
    interval: 5000,

    // Min width of the viewer in inline mode
    minWidth: 200,

    // Min height of the viewer in inline mode
    minHeight: 100,

    // Define the ratio when zoom the image by wheeling mouse
    zoomRatio: 0.1,

    // Define the min ratio of the image when zoom out
    minZoomRatio: 0.01,

    // Define the max ratio of the image when zoom in
    maxZoomRatio: 100,

    // Define the CSS `z-index` value of viewer in modal mode.
    zIndex: 2015,

    // Define the CSS `z-index` value of viewer in inline mode.
    zIndexInline: 0,

    // Define where to get the original image URL for viewing
    // Type: String (an image attribute) or Function (should return an image URL)
    url: 'src',

    // Event shortcuts
    build: null,
    built: null,
    show: null,
    shown: null,
    hide: null,
    hidden: null
  };

  Viewer.TEMPLATE = (
    '<div class="viewer-container">' +
      '<div class="viewer-canvas"></div>' +
      '<div class="viewer-footer">' +
        '<div class="viewer-title"></div>' +
        '<ul class="viewer-toolbar">' +
          '<li class="viewer-zoom-in" data-action="zoom-in"></li>' +
          '<li class="viewer-zoom-out" data-action="zoom-out"></li>' +
          '<li class="viewer-one-to-one" data-action="one-to-one"></li>' +
          '<li class="viewer-reset" data-action="reset"></li>' +
          '<li class="viewer-prev" data-action="prev"></li>' +
          '<li class="viewer-play" data-action="play"></li>' +
          '<li class="viewer-next" data-action="next"></li>' +
          '<li class="viewer-rotate-left" data-action="rotate-left"></li>' +
          '<li class="viewer-rotate-right" data-action="rotate-right"></li>' +
          '<li class="viewer-flip-horizontal" data-action="flip-horizontal"></li>' +
          '<li class="viewer-flip-vertical" data-action="flip-vertical"></li>' +
        '</ul>' +
        '<div class="viewer-navbar">' +
          '<ul class="viewer-list"></ul>' +
        '</div>' +
      '</div>' +
      '<div class="viewer-tooltip"></div>' +
      '<div class="viewer-button" data-action="mix"></div>' +
      '<div class="viewer-player"></div>' +
    '</div>'
  );

  // Save the other viewer
  Viewer.other = $.fn.viewer;

  // Register as jQuery plugin
  $.fn.viewer = function (options) {
    var args = toArray(arguments, 1);
    var result;

    this.each(function () {
      var $this = $(this);
      var data = $this.data(NAMESPACE);
      var fn;

      if (!data) {
        if (/destroy|hide|exit|stop|reset/.test(options)) {
          return;
        }

        $this.data(NAMESPACE, (data = new Viewer(this, options)));
      }

      if (isString(options) && $.isFunction(fn = data[options])) {
        result = fn.apply(data, args);
      }
    });

    return isUndefined(result) ? this : result;
  };

  $.fn.viewer.Constructor = Viewer;
  $.fn.viewer.setDefaults = Viewer.setDefaults;

  // No conflict
  $.fn.viewer.noConflict = function () {
    $.fn.viewer = Viewer.other;
    return this;
  };

});

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vaGVhZGVyLmpzIiwic3RhdGljLy50bXAvZ2FsbGVyeS9tYWluLmpzIiwic3RhdGljL2xpYi92aWV3ZXItbWFzdGVyL2Rpc3Qvdmlld2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogRk9SIEhFQURFUiBcbiAqIEBwYXJhbSAge1t0eXBlXX0gKCBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgW2Rlc2NyaXB0aW9uXVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbnZhciAkbWVudXMgPSBudWxsO1xudmFyICRoZWFkZXIgPSBudWxsO1xuXG5mdW5jdGlvbiBfcmVmKGV2dCkge1xuXG4gICAgJChldnQuY3VycmVudFRhcmdldCkucGFyZW50KCcubWVudScpLmFkZENsYXNzKCdvbicpO1xuXG4gICAgLy8gcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBfcmVmMihldnQpIHtcbiAgICAkKGV2dC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoJy5tZW51JykucmVtb3ZlQ2xhc3MoJ29uJyk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGluaXRIZWFkZXIoKSB7XG5cbiAgICAkaGVhZGVyID0gJCgnYm9keSA+IGhlYWRlcicpLm9uKCdtb3VzZWVudGVyJywgJy5zdWItbWVudScsIF9yZWYpLm9uKCdtb3VzZWxlYXZlJywgJy5zdWItbWVudScsIF9yZWYyKTtcblxuICAgIC8vaGlkZSB0aGUgc3ViLW1lbnUgYWZ0ZXIgY2xpY2sgdGhlIHN1Yi1tZW51IGxpXG4gICAgLyoub24oJ2NsaWNrJywgJy5zdWItbWVudSA+IGxpJywgZXZ0ID0+IHtcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAkKGV2dC5jdXJyZW50VGFyZ2V0KVxuICAgICAgICAucGFyZW50cygnLnN1Yi1tZW51JykuY3NzKCd2aXNpYmlsaXR5JzogJ2hpZGRlbicpXG4gICAgfSkqL1xuXG4gICAgJG1lbnVzID0gJGhlYWRlci5maW5kKCcubWVudScpO1xuXG4gICAgaWYgKHdpbmRvdy5faXNfbW9iaWxlKSB7XG4gICAgICAgIC8vaGlkZSBzdWItbWVudSAsd2hlbiBjbGljayBvdGhlciBzcGFjZXNcbiAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAgIHZhciAkYXJlYSA9ICQodGhpcyk7XG4gICAgICAgICAgICBpZiAoJGFyZWEubm90KCcuc3ViLW1lbnUsIC5zdWItbWVudSA+IGxpJykpIHtcbiAgICAgICAgICAgICAgICAkaGVhZGVyLmZpbmQoJy5zdWItbWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGxvY2F0ZShuYXYpIHtcbiAgICB2YXIgbmF2VGV4dCA9IG5hdi50b0xvd2VyQ2FzZSgpO1xuXG4gICAgZm9yICh2YXIgaSBpbiAkbWVudXMpIHtcbiAgICAgICAgdmFyICRtID0gJG1lbnVzLmVxKGkpO1xuICAgICAgICB2YXIgJGEgPSAkbS5jaGlsZHJlbignYScpO1xuICAgICAgICB2YXIgYVRleHQgPSAkYS5odG1sKCkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBpZiAobmF2VGV4dCA9PSBhVGV4dCkge1xuICAgICAgICAgICAgJG1lbnVzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICRtLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIGluaXRIZWFkZXIoKTtcbn0pO1xuXG5leHBvcnRzLmxvY2F0ZSA9IGxvY2F0ZTsiLCIvKipcbiAqIEVTNiBGSUxFIEZPUiBHYWxsZXJ5Q29udHJvbGxlciBcbiAqIDIwMTUtMDgtMjggMDY6MDg6NTlcbiAqL1xuXG4vLyBpbXBvcnQgJ2pxdWVyeS9kaXN0L2pxdWVyeSdcbid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgndmlld2VyLW1hc3Rlci9kaXN0L3ZpZXdlcicpO1xuXG5yZXF1aXJlKCdoZWFkZXInKTtcblxuZnVuY3Rpb24gaW5pdFZpZXdlcigpIHtcbiAgICAkKCcubGluZS1jb250ZW50Jykudmlld2VyKCk7XG59XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIGluaXRWaWV3ZXIoKTtcbn0pOyIsIi8qIVxuICogVmlld2VyIHYwLjEuMVxuICogaHR0cHM6Ly9naXRodWIuY29tL2Zlbmd5dWFuY2hlbi92aWV3ZXJcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUgRmVuZ3l1YW4gQ2hlblxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKlxuICogRGF0ZTogMjAxNS0xMC0wN1QwNjozNDozMS45MTdaXG4gKi9cblxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gIGlmIChmYWxzZSAmJiB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKCd2aWV3ZXInLCBbJ2pxdWVyeSddLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmIChmYWxzZSAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBOb2RlIC8gQ29tbW9uSlNcbiAgICBcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHMuXG4gICAgZmFjdG9yeShqUXVlcnkpO1xuICB9XG59KShmdW5jdGlvbiAoJCkge1xuXG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcbiAgdmFyICRkb2N1bWVudCA9ICQoZG9jdW1lbnQpO1xuXG4gIC8vIENvbnN0YW50c1xuICB2YXIgTkFNRVNQQUNFID0gJ3ZpZXdlcic7XG4gIHZhciBFTEVNRU5UX1ZJRVdFUiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoTkFNRVNQQUNFKTtcblxuICAvLyBDbGFzc2VzXG4gIHZhciBDTEFTU19UT0dHTEUgPSAndmlld2VyLXRvZ2dsZSc7XG4gIHZhciBDTEFTU19GSVhFRCA9ICd2aWV3ZXItZml4ZWQnO1xuICB2YXIgQ0xBU1NfT1BFTiA9ICd2aWV3ZXItb3Blbic7XG4gIHZhciBDTEFTU19TSE9XID0gJ3ZpZXdlci1zaG93JztcbiAgdmFyIENMQVNTX0hJREUgPSAndmlld2VyLWhpZGUnO1xuICB2YXIgQ0xBU1NfRkFERSA9ICd2aWV3ZXItZmFkZSc7XG4gIHZhciBDTEFTU19JTiA9ICd2aWV3ZXItaW4nO1xuICB2YXIgQ0xBU1NfTU9WRSA9ICd2aWV3ZXItbW92ZSc7XG4gIHZhciBDTEFTU19BQ1RJVkUgPSAndmlld2VyLWFjdGl2ZSc7XG4gIHZhciBDTEFTU19JTlZJU0lCTEUgPSAndmlld2VyLWludmlzaWJsZSc7XG4gIHZhciBDTEFTU19UUkFOU0lUSU9OID0gJ3ZpZXdlci10cmFuc2l0aW9uJztcbiAgdmFyIENMQVNTX0ZVTExTQ1JFRU4gPSAndmlld2VyLWZ1bGxzY3JlZW4nO1xuICB2YXIgQ0xBU1NfRlVMTFNDUkVFTl9FWElUID0gJ3ZpZXdlci1mdWxsc2NyZWVuLWV4aXQnO1xuICB2YXIgQ0xBU1NfQ0xPU0UgPSAndmlld2VyLWNsb3NlJztcblxuICAvLyBTZWxlY3RvcnNcbiAgdmFyIFNFTEVDVE9SX0lNRyA9ICdpbWcnO1xuXG4gIC8vIEV2ZW50c1xuICB2YXIgRVZFTlRfTU9VU0VET1dOID0gJ21vdXNlZG93biB0b3VjaHN0YXJ0IHBvaW50ZXJkb3duIE1TUG9pbnRlckRvd24nO1xuICB2YXIgRVZFTlRfTU9VU0VNT1ZFID0gJ21vdXNlbW92ZSB0b3VjaG1vdmUgcG9pbnRlcm1vdmUgTVNQb2ludGVyTW92ZSc7XG4gIHZhciBFVkVOVF9NT1VTRVVQID0gJ21vdXNldXAgdG91Y2hlbmQgdG91Y2hjYW5jZWwgcG9pbnRlcnVwIHBvaW50ZXJjYW5jZWwgTVNQb2ludGVyVXAgTVNQb2ludGVyQ2FuY2VsJztcbiAgdmFyIEVWRU5UX1dIRUVMID0gJ3doZWVsIG1vdXNld2hlZWwgRE9NTW91c2VTY3JvbGwnO1xuICB2YXIgRVZFTlRfVFJBTlNJVElPTkVORCA9ICd0cmFuc2l0aW9uZW5kJztcbiAgdmFyIEVWRU5UX0xPQUQgPSAnbG9hZC4nICsgTkFNRVNQQUNFO1xuICB2YXIgRVZFTlRfS0VZRE9XTiA9ICdrZXlkb3duLicgKyBOQU1FU1BBQ0U7XG4gIHZhciBFVkVOVF9DTElDSyA9ICdjbGljay4nICsgTkFNRVNQQUNFO1xuICB2YXIgRVZFTlRfUkVTSVpFID0gJ3Jlc2l6ZS4nICsgTkFNRVNQQUNFO1xuICB2YXIgRVZFTlRfQlVJTEQgPSAnYnVpbGQuJyArIE5BTUVTUEFDRTtcbiAgdmFyIEVWRU5UX0JVSUxUID0gJ2J1aWx0LicgKyBOQU1FU1BBQ0U7XG4gIHZhciBFVkVOVF9TSE9XID0gJ3Nob3cuJyArIE5BTUVTUEFDRTtcbiAgdmFyIEVWRU5UX1NIT1dOID0gJ3Nob3duLicgKyBOQU1FU1BBQ0U7XG4gIHZhciBFVkVOVF9ISURFID0gJ2hpZGUuJyArIE5BTUVTUEFDRTtcbiAgdmFyIEVWRU5UX0hJRERFTiA9ICdoaWRkZW4uJyArIE5BTUVTUEFDRTtcbiAgdmFyIEVWRU5UX1ZJRVcgPSAndmlldy4nICsgTkFNRVNQQUNFO1xuICB2YXIgRVZFTlRfVklFV0VEID0gJ3ZpZXdlZC4nICsgTkFNRVNQQUNFO1xuXG4gIC8vIFN1cHBvcnRzXG4gIHZhciBTVVBQT1JUX1RSQU5TSVRJT04gPSB0eXBlb2YgRUxFTUVOVF9WSUVXRVIuc3R5bGUudHJhbnNpdGlvbiAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgLy8gT3RoZXJzXG4gIHZhciByb3VuZCA9IE1hdGgucm91bmQ7XG4gIHZhciBzcXJ0ID0gTWF0aC5zcXJ0O1xuICB2YXIgYWJzID0gTWF0aC5hYnM7XG4gIHZhciBtaW4gPSBNYXRoLm1pbjtcbiAgdmFyIG1heCA9IE1hdGgubWF4O1xuICB2YXIgbnVtID0gcGFyc2VGbG9hdDtcblxuICAvLyBQcm90b3R5cGVcbiAgdmFyIHByb3RvdHlwZSA9IHt9O1xuXG4gIGZ1bmN0aW9uIGlzU3RyaW5nKHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNOdW1iZXIobikge1xuICAgIHJldHVybiB0eXBlb2YgbiA9PT0gJ251bWJlcicgJiYgIWlzTmFOKG4pO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNVbmRlZmluZWQodSkge1xuICAgIHJldHVybiB0eXBlb2YgdSA9PT0gJ3VuZGVmaW5lZCc7XG4gIH1cblxuICBmdW5jdGlvbiB0b0FycmF5KG9iaiwgb2Zmc2V0KSB7XG4gICAgdmFyIGFyZ3MgPSBbXTtcblxuICAgIGlmIChpc051bWJlcihvZmZzZXQpKSB7IC8vIEl0J3MgbmVjZXNzYXJ5IGZvciBJRThcbiAgICAgIGFyZ3MucHVzaChvZmZzZXQpO1xuICAgIH1cblxuICAgIHJldHVybiBhcmdzLnNsaWNlLmFwcGx5KG9iaiwgYXJncyk7XG4gIH1cblxuICAvLyBDdXN0b20gcHJveHkgdG8gYXZvaWQgalF1ZXJ5J3MgZ3VpZFxuICBmdW5jdGlvbiBwcm94eShmbiwgY29udGV4dCkge1xuICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMsIDIpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdCh0b0FycmF5KGFyZ3VtZW50cykpKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VHJhbnNmb3JtKG9wdGlvbnMpIHtcbiAgICB2YXIgdHJhbnNmb3JtcyA9IFtdO1xuICAgIHZhciByb3RhdGUgPSBvcHRpb25zLnJvdGF0ZTtcbiAgICB2YXIgc2NhbGVYID0gb3B0aW9ucy5zY2FsZVg7XG4gICAgdmFyIHNjYWxlWSA9IG9wdGlvbnMuc2NhbGVZO1xuXG4gICAgaWYgKGlzTnVtYmVyKHJvdGF0ZSkpIHtcbiAgICAgIHRyYW5zZm9ybXMucHVzaCgncm90YXRlKCcgKyByb3RhdGUgKyAnZGVnKScpO1xuICAgIH1cblxuICAgIGlmIChpc051bWJlcihzY2FsZVgpICYmIGlzTnVtYmVyKHNjYWxlWSkpIHtcbiAgICAgIHRyYW5zZm9ybXMucHVzaCgnc2NhbGUoJyArIHNjYWxlWCArICcsJyArIHNjYWxlWSArICcpJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyYW5zZm9ybXMubGVuZ3RoID8gdHJhbnNmb3Jtcy5qb2luKCcgJykgOiAnbm9uZSc7XG4gIH1cblxuICAvLyBlLmcuOiBodHRwOi8vZG9tYWluLmNvbS9wYXRoL3RvL3BpY3R1cmUuanBnP3NpemU9MTI4MMOXOTYwIC0+IHBpY3R1cmUuanBnXG4gIGZ1bmN0aW9uIGdldEltYWdlTmFtZSh1cmwpIHtcbiAgICByZXR1cm4gaXNTdHJpbmcodXJsKSA/IHVybC5yZXBsYWNlKC9eLipcXC8vLCAnJykucmVwbGFjZSgvW1xcPyYjXS4qJC8sICcnKSA6ICcnO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0SW1hZ2VTaXplKGltYWdlLCBjYWxsYmFjaykge1xuICAgIHZhciBuZXdJbWFnZTtcblxuICAgIC8vIE1vZGVybiBicm93c2Vyc1xuICAgIGlmIChpbWFnZS5uYXR1cmFsV2lkdGgpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhpbWFnZS5uYXR1cmFsV2lkdGgsIGltYWdlLm5hdHVyYWxIZWlnaHQpO1xuICAgIH1cblxuICAgIC8vIElFODogRG9uJ3QgdXNlIGBuZXcgSW1hZ2UoKWAgaGVyZVxuICAgIG5ld0ltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cbiAgICBuZXdJbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjYWxsYmFjayh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfTtcblxuICAgIG5ld0ltYWdlLnNyYyA9IGltYWdlLnNyYztcbiAgfVxuXG4gIGZ1bmN0aW9uIFZpZXdlcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFZpZXdlci5ERUZBVUxUUywgJC5pc1BsYWluT2JqZWN0KG9wdGlvbnMpICYmIG9wdGlvbnMpO1xuICAgIHRoaXMuaXNJbWcgPSBmYWxzZTtcbiAgICB0aGlzLmlzQnVpbHQgPSBmYWxzZTtcbiAgICB0aGlzLmlzU2hvd24gPSBmYWxzZTtcbiAgICB0aGlzLmlzVmlld2VkID0gZmFsc2U7XG4gICAgdGhpcy5pc0Z1bGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuaXNQbGF5ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmZhZGluZyA9IGZhbHNlO1xuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IGZhbHNlO1xuICAgIHRoaXMuYWN0aW9uID0gZmFsc2U7XG4gICAgdGhpcy50YXJnZXQgPSBmYWxzZTtcbiAgICB0aGlzLmluZGV4ID0gMDtcbiAgICB0aGlzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICAkLmV4dGVuZChwcm90b3R5cGUsIHtcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkdGhpcyA9IHRoaXMuJGVsZW1lbnQ7XG4gICAgICB2YXIgaXNJbWcgPSAkdGhpcy5pcyhTRUxFQ1RPUl9JTUcpO1xuICAgICAgdmFyICRpbWFnZXMgPSBpc0ltZyA/ICR0aGlzIDogJHRoaXMuZmluZChTRUxFQ1RPUl9JTUcpO1xuICAgICAgXG4gICAgICB2YXIgbGVuZ3RoID0gJGltYWdlcy5sZW5ndGg7XG4gICAgICB2YXIgcmVhZHkgPSAkLnByb3h5KHRoaXMucmVhZHksIHRoaXMpO1xuXG4gICAgICBpZiAoIWxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5idWlsZCkpIHtcbiAgICAgICAgJHRoaXMub25lKEVWRU5UX0JVSUxELCBvcHRpb25zLmJ1aWxkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudHJpZ2dlcihFVkVOVF9CVUlMRCkuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBPdmVycmlkZSBgdHJhbnNpdG9uYCBvcHRpb24gaWYgaXQgaXMgbm90IHN1cHBvcnRlZFxuICAgICAgaWYgKCFTVVBQT1JUX1RSQU5TSVRJT04pIHtcbiAgICAgICAgb3B0aW9ucy50cmFuc2l0aW9uID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXNJbWcgPSBpc0ltZztcbiAgICAgIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xuICAgICAgdGhpcy5jb3VudCA9IDA7XG4gICAgICB0aGlzLiRpbWFnZXMgPSAkaW1hZ2VzO1xuICAgICAgdGhpcy4kYm9keSA9ICQoJ2JvZHknKTtcblxuICAgICAgaWYgKG9wdGlvbnMuaW5saW5lKSB7XG4gICAgICAgICR0aGlzLm9uZShFVkVOVF9CVUlMVCwgJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy52aWV3KCk7XG4gICAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgICAkaW1hZ2VzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICh0aGlzLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICByZWFkeSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHRoaXMpLm9uZShFVkVOVF9MT0FELCByZWFkeSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRpbWFnZXMuYWRkQ2xhc3MoQ0xBU1NfVE9HR0xFKTtcbiAgICAgICAgJHRoaXMub24oRVZFTlRfQ0xJQ0ssICQucHJveHkodGhpcy5zdGFydCwgdGhpcykpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZWFkeTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jb3VudCsrO1xuXG4gICAgICBpZiAodGhpcy5jb3VudCA9PT0gdGhpcy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5idWlsZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgJC5leHRlbmQocHJvdG90eXBlLCB7XG4gICAgYnVpbGQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICR0aGlzID0gdGhpcy4kZWxlbWVudDtcbiAgICAgIHZhciAkcGFyZW50O1xuICAgICAgdmFyICR2aWV3ZXI7XG4gICAgICB2YXIgJGJ1dHRvbjtcbiAgICAgIHZhciAkdG9vbGJhcjtcblxuICAgICAgaWYgKHRoaXMuaXNCdWlsdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghJHBhcmVudCB8fCAhJHBhcmVudC5sZW5ndGgpIHtcbiAgICAgICAgJHBhcmVudCA9ICR0aGlzLnBhcmVudCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRwYXJlbnQgPSAkcGFyZW50O1xuICAgICAgdGhpcy4kdmlld2VyID0gJHZpZXdlciA9ICQoVmlld2VyLlRFTVBMQVRFKTtcbiAgICAgIHRoaXMuJGNhbnZhcyA9ICR2aWV3ZXIuZmluZCgnLnZpZXdlci1jYW52YXMnKTtcbiAgICAgIHRoaXMuJGZvb3RlciA9ICR2aWV3ZXIuZmluZCgnLnZpZXdlci1mb290ZXInKTtcbiAgICAgIHRoaXMuJHRpdGxlID0gJHZpZXdlci5maW5kKCcudmlld2VyLXRpdGxlJykudG9nZ2xlQ2xhc3MoQ0xBU1NfSElERSwgIW9wdGlvbnMudGl0bGUpO1xuICAgICAgdGhpcy4kdG9vbGJhciA9ICR0b29sYmFyID0gJHZpZXdlci5maW5kKCcudmlld2VyLXRvb2xiYXInKS50b2dnbGVDbGFzcyhDTEFTU19ISURFLCAhb3B0aW9ucy50b29sYmFyKTtcbiAgICAgIHRoaXMuJG5hdmJhciA9ICR2aWV3ZXIuZmluZCgnLnZpZXdlci1uYXZiYXInKS50b2dnbGVDbGFzcyhDTEFTU19ISURFLCAhb3B0aW9ucy5uYXZiYXIpO1xuICAgICAgdGhpcy4kYnV0dG9uID0gJGJ1dHRvbiA9ICR2aWV3ZXIuZmluZCgnLnZpZXdlci1idXR0b24nKS50b2dnbGVDbGFzcyhDTEFTU19ISURFLCAhb3B0aW9ucy5idXR0b24pO1xuICAgICAgdGhpcy4kdG9vbHRpcCA9ICR2aWV3ZXIuZmluZCgnLnZpZXdlci10b29sdGlwJyk7XG4gICAgICB0aGlzLiRwbGF5ZXIgPSAkdmlld2VyLmZpbmQoJy52aWV3ZXItcGxheWVyJyk7XG4gICAgICB0aGlzLiRsaXN0ID0gJHZpZXdlci5maW5kKCcudmlld2VyLWxpc3QnKTtcblxuICAgICAgJHRvb2xiYXIuZmluZCgnbGlbY2xhc3MqPXpvb21dJykudG9nZ2xlQ2xhc3MoQ0xBU1NfSU5WSVNJQkxFLCAhb3B0aW9ucy56b29tYWJsZSk7XG4gICAgICAkdG9vbGJhci5maW5kKCdsaVtjbGFzcyo9ZmxpcF0nKS50b2dnbGVDbGFzcyhDTEFTU19JTlZJU0lCTEUsICFvcHRpb25zLnNjYWxhYmxlKTtcblxuICAgICAgaWYgKCFvcHRpb25zLnJvdGF0YWJsZSkge1xuICAgICAgICAkdG9vbGJhci5maW5kKCdsaVtjbGFzcyo9cm90YXRlXScpLmFkZENsYXNzKENMQVNTX0lOVklTSUJMRSkuYXBwZW5kVG8oJHRvb2xiYXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5pbmxpbmUpIHtcbiAgICAgICAgJGJ1dHRvbi5hZGRDbGFzcyhDTEFTU19GVUxMU0NSRUVOKTtcbiAgICAgICAgJHZpZXdlci5jc3MoJ3otaW5kZXgnLCBvcHRpb25zLnpJbmRleElubGluZSk7XG5cbiAgICAgICAgaWYgKCRwYXJlbnQuY3NzKCdwb3NpdGlvbicpID09PSAnc3RhdGljJykge1xuICAgICAgICAgICRwYXJlbnQuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkYnV0dG9uLmFkZENsYXNzKENMQVNTX0NMT1NFKTtcbiAgICAgICAgJHZpZXdlci5cbiAgICAgICAgICBjc3MoJ3otaW5kZXgnLCBvcHRpb25zLnpJbmRleCkuXG4gICAgICAgICAgYWRkQ2xhc3MoW0NMQVNTX0ZJWEVELCBDTEFTU19GQURFLCBDTEFTU19ISURFXS5qb2luKCcgJykpO1xuICAgICAgfVxuXG4gICAgICAkdGhpcy5hZnRlcigkdmlld2VyKTtcblxuICAgICAgaWYgKG9wdGlvbnMuaW5saW5lKSB7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIHRoaXMuYmluZCgpO1xuICAgICAgICB0aGlzLmlzU2hvd24gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmlzQnVpbHQgPSB0cnVlO1xuXG4gICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMuYnVpbHQpKSB7XG4gICAgICAgICR0aGlzLm9uZShFVkVOVF9CVUlMVCwgb3B0aW9ucy5idWlsdCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudHJpZ2dlcihFVkVOVF9CVUlMVCk7XG4gICAgfSxcblxuICAgIHVuYnVpbGQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICR0aGlzID0gdGhpcy4kZWxlbWVudDtcblxuICAgICAgaWYgKCF0aGlzLmlzQnVpbHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5pbmxpbmUgJiYgIW9wdGlvbnMuY29udGFpbmVyKSB7XG4gICAgICAgICR0aGlzLnJlbW92ZUNsYXNzKENMQVNTX0hJREUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiR2aWV3ZXIucmVtb3ZlKCk7XG4gICAgfVxuICB9KTtcblxuICAkLmV4dGVuZChwcm90b3R5cGUsIHtcbiAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLiR2aWV3ZXIuXG4gICAgICAgIG9uKEVWRU5UX0NMSUNLLCAkLnByb3h5KHRoaXMuY2xpY2ssIHRoaXMpKS5cbiAgICAgICAgb24oRVZFTlRfV0hFRUwsICQucHJveHkodGhpcy53aGVlbCwgdGhpcykpO1xuXG4gICAgICB0aGlzLiRjYW52YXMub24oRVZFTlRfTU9VU0VET1dOLCAkLnByb3h5KHRoaXMubW91c2Vkb3duLCB0aGlzKSk7XG5cbiAgICAgICRkb2N1bWVudC5cbiAgICAgICAgb24oRVZFTlRfTU9VU0VNT1ZFLCAodGhpcy5fbW91c2Vtb3ZlID0gcHJveHkodGhpcy5tb3VzZW1vdmUsIHRoaXMpKSkuXG4gICAgICAgIG9uKEVWRU5UX01PVVNFVVAsICh0aGlzLl9tb3VzZXVwID0gcHJveHkodGhpcy5tb3VzZXVwLCB0aGlzKSkpLlxuICAgICAgICBvbihFVkVOVF9LRVlET1dOLCAodGhpcy5fa2V5ZG93biA9IHByb3h5KHRoaXMua2V5ZG93biwgdGhpcykpKTtcblxuICAgICAgJHdpbmRvdy5vbihFVkVOVF9SRVNJWkUsICh0aGlzLl9yZXNpemUgPSBwcm94eSh0aGlzLnJlc2l6ZSwgdGhpcykpKTtcbiAgICB9LFxuXG4gICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLiR2aWV3ZXIuXG4gICAgICAgIG9mZihFVkVOVF9DTElDSywgdGhpcy5jbGljaykuXG4gICAgICAgIG9mZihFVkVOVF9XSEVFTCwgdGhpcy53aGVlbCk7XG5cbiAgICAgIHRoaXMuJGNhbnZhcy5vZmYoRVZFTlRfTU9VU0VET1dOLCB0aGlzLm1vdXNlZG93bik7XG5cbiAgICAgICRkb2N1bWVudC5cbiAgICAgICAgb2ZmKEVWRU5UX01PVVNFTU9WRSwgdGhpcy5fbW91c2Vtb3ZlKS5cbiAgICAgICAgb2ZmKEVWRU5UX01PVVNFVVAsIHRoaXMuX21vdXNldXApLlxuICAgICAgICBvZmYoRVZFTlRfS0VZRE9XTiwgdGhpcy5fa2V5ZG93bik7XG5cbiAgICAgICR3aW5kb3cub2ZmKEVWRU5UX1JFU0laRSwgdGhpcy5fcmVzaXplKTtcbiAgICB9XG4gIH0pO1xuXG4gICQuZXh0ZW5kKHByb3RvdHlwZSwge1xuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5pbml0Q29udGFpbmVyKCk7XG4gICAgICB0aGlzLmluaXRWaWV3ZXIoKTtcbiAgICAgIHRoaXMuaW5pdExpc3QoKTtcbiAgICAgIHRoaXMucmVuZGVyVmlld2VyKCk7XG4gICAgfSxcblxuICAgIGluaXRDb250YWluZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY29udGFpbmVyID0ge1xuICAgICAgICB3aWR0aDogJHdpbmRvdy5pbm5lcldpZHRoKCksXG4gICAgICAgIGhlaWdodDogJHdpbmRvdy5pbm5lckhlaWdodCgpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBpbml0Vmlld2VyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkcGFyZW50ID0gdGhpcy4kcGFyZW50O1xuICAgICAgdmFyIHZpZXdlcjtcblxuICAgICAgaWYgKG9wdGlvbnMuaW5saW5lKSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gdmlld2VyID0ge1xuICAgICAgICAgIHdpZHRoOiBtYXgoJHBhcmVudC53aWR0aCgpLCBvcHRpb25zLm1pbldpZHRoKSxcbiAgICAgICAgICBoZWlnaHQ6IG1heCgkcGFyZW50LmhlaWdodCgpLCBvcHRpb25zLm1pbkhlaWdodClcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaXNGdWxsZWQgfHwgIXZpZXdlcikge1xuICAgICAgICB2aWV3ZXIgPSB0aGlzLmNvbnRhaW5lcjtcbiAgICAgIH1cblxuICAgICAgdGhpcy52aWV3ZXIgPSAkLmV4dGVuZCh7fSwgdmlld2VyKTtcbiAgICB9LFxuXG4gICAgcmVuZGVyVmlld2VyOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmlubGluZSAmJiAhdGhpcy5pc0Z1bGxlZCkge1xuICAgICAgICB0aGlzLiR2aWV3ZXIuY3NzKHRoaXMudmlld2VyKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaW5pdExpc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICR0aGlzID0gdGhpcy4kZWxlbWVudDtcbiAgICAgIHZhciAkbGlzdCA9IHRoaXMuJGxpc3Q7XG4gICAgICB2YXIgbGlzdCA9IFtdO1xuXG4gICAgICB0aGlzLiRpbWFnZXMuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgICB2YXIgc3JjID0gdGhpcy5zcmM7XG4gICAgICAgIHZhciBhbHQgPSB0aGlzLmFsdCB8fCBnZXRJbWFnZU5hbWUoc3JjKTtcbiAgICAgICAgdmFyIHVybCA9IG9wdGlvbnMudXJsO1xuXG4gICAgICAgIGlmICghc3JjKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzU3RyaW5nKHVybCkpIHtcbiAgICAgICAgICB1cmwgPSB0aGlzLmdldEF0dHJpYnV0ZSh1cmwpO1xuICAgICAgICB9IGVsc2UgaWYgKCQuaXNGdW5jdGlvbih1cmwpKSB7XG4gICAgICAgICAgdXJsID0gdXJsLmNhbGwodGhpcywgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0LnB1c2goXG4gICAgICAgICAgJzxsaT4nICtcbiAgICAgICAgICAgICc8aW1nJyArXG4gICAgICAgICAgICAgICcgc3JjPVwiJyArIHNyYyArICdcIicgK1xuICAgICAgICAgICAgICAnIGRhdGEtYWN0aW9uPVwidmlld1wiJyArXG4gICAgICAgICAgICAgICcgZGF0YS1pbmRleD1cIicgKyAgaSArICdcIicgK1xuICAgICAgICAgICAgICAnIGRhdGEtb3JpZ2luYWwtdXJsPVwiJyArICAodXJsIHx8IHNyYykgKyAnXCInICtcbiAgICAgICAgICAgICAgJyBhbHQ9XCInICsgIGFsdCArICdcIicgK1xuICAgICAgICAgICAgJz4nICtcbiAgICAgICAgICAnPC9saT4nXG4gICAgICAgICk7XG4gICAgICB9KTtcblxuICAgICAgJGxpc3QuaHRtbChsaXN0LmpvaW4oJycpKS5maW5kKFNFTEVDVE9SX0lNRykub25lKEVWRU5UX0xPQUQsIHtcbiAgICAgICAgZmlsbGVkOiB0cnVlXG4gICAgICB9LCAkLnByb3h5KHRoaXMubG9hZEltYWdlLCB0aGlzKSk7XG5cbiAgICAgIHRoaXMuJGl0ZW1zID0gJGxpc3QuY2hpbGRyZW4oKTtcblxuICAgICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgICAkdGhpcy5vbmUoRVZFTlRfVklFV0VELCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJGxpc3QuYWRkQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXJMaXN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgIHZhciBpID0gaW5kZXggfHwgdGhpcy5pbmRleDtcbiAgICAgIHZhciB3aWR0aCA9IHRoaXMuJGl0ZW1zLmVxKGkpLndpZHRoKCk7XG4gICAgICB2YXIgb3V0ZXJXaWR0aCA9IHdpZHRoICsgMTsgLy8gMSBwaXhlbCBvZiBgbWFyZ2luLWxlZnRgIHdpZHRoXG5cbiAgICAgIC8vIFBsYWNlIHRoZSBhY3RpdmUgaXRlbSBpbiB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW5cbiAgICAgIHRoaXMuJGxpc3QuY3NzKHtcbiAgICAgICAgd2lkdGg6IG91dGVyV2lkdGggKiB0aGlzLmxlbmd0aCxcbiAgICAgICAgbWFyZ2luTGVmdDogKHRoaXMudmlld2VyLndpZHRoIC0gd2lkdGgpIC8gMiAtIG91dGVyV2lkdGggKiBpXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVzZXRMaXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLiRsaXN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTikuY3NzKCdtYXJnaW4tbGVmdCcsIDApO1xuICAgIH0sXG5cbiAgICBpbml0SW1hZ2U6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJGltYWdlID0gdGhpcy4kaW1hZ2U7XG4gICAgICB2YXIgdmlld2VyID0gdGhpcy52aWV3ZXI7XG4gICAgICB2YXIgZm9vdGVySGVpZ2h0ID0gdGhpcy4kZm9vdGVyLmhlaWdodCgpO1xuICAgICAgdmFyIHZpZXdlcldpZHRoID0gdmlld2VyLndpZHRoO1xuICAgICAgdmFyIHZpZXdlckhlaWdodCA9IG1heCh2aWV3ZXIuaGVpZ2h0IC0gZm9vdGVySGVpZ2h0LCBmb290ZXJIZWlnaHQpO1xuICAgICAgdmFyIG9sZEltYWdlID0gdGhpcy5pbWFnZSB8fCB7fTtcblxuICAgICAgZ2V0SW1hZ2VTaXplKCRpbWFnZVswXSwgJC5wcm94eShmdW5jdGlvbiAobmF0dXJhbFdpZHRoLCBuYXR1cmFsSGVpZ2h0KSB7XG4gICAgICAgIHZhciBhc3BlY3RSYXRpbyA9IG5hdHVyYWxXaWR0aCAvIG5hdHVyYWxIZWlnaHQ7XG4gICAgICAgIHZhciB3aWR0aCA9IHZpZXdlcldpZHRoO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gdmlld2VySGVpZ2h0O1xuICAgICAgICB2YXIgaW5pdGlhbEltYWdlO1xuICAgICAgICB2YXIgaW1hZ2U7XG5cbiAgICAgICAgaWYgKHZpZXdlckhlaWdodCAqIGFzcGVjdFJhdGlvID4gdmlld2VyV2lkdGgpIHtcbiAgICAgICAgICBoZWlnaHQgPSB2aWV3ZXJXaWR0aCAvIGFzcGVjdFJhdGlvO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdpZHRoID0gdmlld2VySGVpZ2h0ICogYXNwZWN0UmF0aW87XG4gICAgICAgIH1cblxuICAgICAgICB3aWR0aCA9IG1pbih3aWR0aCAqIDAuOSwgbmF0dXJhbFdpZHRoKTtcbiAgICAgICAgaGVpZ2h0ID0gbWluKGhlaWdodCAqIDAuOSwgbmF0dXJhbEhlaWdodCk7XG5cbiAgICAgICAgaW1hZ2UgPSB7XG4gICAgICAgICAgbmF0dXJhbFdpZHRoOiBuYXR1cmFsV2lkdGgsXG4gICAgICAgICAgbmF0dXJhbEhlaWdodDogbmF0dXJhbEhlaWdodCxcbiAgICAgICAgICBhc3BlY3RSYXRpbzogYXNwZWN0UmF0aW8sXG4gICAgICAgICAgcmF0aW86IHdpZHRoIC8gbmF0dXJhbFdpZHRoLFxuICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICBsZWZ0OiAodmlld2VyV2lkdGggLSB3aWR0aCkgLyAyLFxuICAgICAgICAgIHRvcDogKHZpZXdlckhlaWdodCAtIGhlaWdodCkgLyAyXG4gICAgICAgIH07XG5cbiAgICAgICAgaW5pdGlhbEltYWdlID0gJC5leHRlbmQoe30sIGltYWdlKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5yb3RhdGFibGUpIHtcbiAgICAgICAgICBpbWFnZS5yb3RhdGUgPSBvbGRJbWFnZS5yb3RhdGUgfHwgMDtcbiAgICAgICAgICBpbml0aWFsSW1hZ2Uucm90YXRlID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLnNjYWxhYmxlKSB7XG4gICAgICAgICAgaW1hZ2Uuc2NhbGVYID0gb2xkSW1hZ2Uuc2NhbGVYIHx8IDE7XG4gICAgICAgICAgaW1hZ2Uuc2NhbGVZID0gb2xkSW1hZ2Uuc2NhbGVZIHx8IDE7XG4gICAgICAgICAgaW5pdGlhbEltYWdlLnNjYWxlWCA9IDE7XG4gICAgICAgICAgaW5pdGlhbEltYWdlLnNjYWxlWSA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIHRoaXMuaW5pdGlhbEltYWdlID0gaW5pdGlhbEltYWdlO1xuXG4gICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICByZW5kZXJJbWFnZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICB2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgICAgdmFyICRpbWFnZSA9IHRoaXMuJGltYWdlO1xuXG4gICAgICAkaW1hZ2UuY3NzKHtcbiAgICAgICAgd2lkdGg6IGltYWdlLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IGltYWdlLmhlaWdodCxcbiAgICAgICAgbWFyZ2luTGVmdDogaW1hZ2UubGVmdCxcbiAgICAgICAgbWFyZ2luVG9wOiBpbWFnZS50b3AsXG4gICAgICAgIHRyYW5zZm9ybTogZ2V0VHJhbnNmb3JtKGltYWdlKVxuICAgICAgfSk7XG5cbiAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgICAgICRpbWFnZS5vbmUoRVZFTlRfVFJBTlNJVElPTkVORCwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVzZXRJbWFnZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy4kaW1hZ2UucmVtb3ZlKCk7XG4gICAgICB0aGlzLiRpbWFnZSA9IG51bGw7XG4gICAgfVxuICB9KTtcblxuICAkLmV4dGVuZChwcm90b3R5cGUsIHtcbiAgICBzdGFydDogZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcblxuICAgICAgaWYgKCQodGFyZ2V0KS5oYXNDbGFzcyhDTEFTU19UT0dHTEUpKSB7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICB0aGlzLnNob3coKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xpY2s6IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xuICAgICAgdmFyIGFjdGlvbiA9ICR0YXJnZXQuZGF0YSgnYWN0aW9uJyk7XG4gICAgICB2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgY2FzZSAnbWl4JzpcbiAgICAgICAgICBpZiAodGhpcy5pc1BsYXllZCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaW5saW5lKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmlzRnVsbGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5leGl0KCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mdWxsKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3ZpZXcnOlxuICAgICAgICAgIHRoaXMudmlldygkdGFyZ2V0LmRhdGEoJ2luZGV4JykpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3pvb20taW4nOlxuICAgICAgICAgIHRoaXMuem9vbSgwLjEsIHRydWUpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3pvb20tb3V0JzpcbiAgICAgICAgICB0aGlzLnpvb20oLTAuMSwgdHJ1ZSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnb25lLXRvLW9uZSc6XG4gICAgICAgICAgaWYgKHRoaXMuaW1hZ2UucmF0aW8gPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuem9vbVRvKHRoaXMuaW5pdGlhbEltYWdlLnJhdGlvKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy56b29tVG8oMSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncmVzZXQnOlxuICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwcmV2JzpcbiAgICAgICAgICB0aGlzLnByZXYoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwbGF5JzpcbiAgICAgICAgICB0aGlzLnBsYXkoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICduZXh0JzpcbiAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdyb3RhdGUtbGVmdCc6XG4gICAgICAgICAgdGhpcy5yb3RhdGUoLTkwKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdyb3RhdGUtcmlnaHQnOlxuICAgICAgICAgIHRoaXMucm90YXRlKDkwKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdmbGlwLWhvcml6b250YWwnOlxuICAgICAgICAgIHRoaXMuc2NhbGUoLWltYWdlLnNjYWxlWCB8fCAtMSwgaW1hZ2Uuc2NhbGVZIHx8IDEpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2ZsaXAtdmVydGljYWwnOlxuICAgICAgICAgIHRoaXMuc2NhbGUoaW1hZ2Uuc2NhbGVYIHx8IDEsIC1pbWFnZS5zY2FsZVkgfHwgLTEpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKHRoaXMuaXNQbGF5ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5pbml0SW1hZ2UoJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5pc1ZpZXdlZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy50cmlnZ2VyKEVWRU5UX1ZJRVdFRCk7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgbG9hZEltYWdlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIGltYWdlID0gZS50YXJnZXQ7XG4gICAgICB2YXIgJGltYWdlID0gJChpbWFnZSk7XG4gICAgICB2YXIgJHBhcmVudCA9ICRpbWFnZS5wYXJlbnQoKTtcbiAgICAgIHZhciBwYXJlbnRXaWR0aCA9ICRwYXJlbnQud2lkdGgoKTtcbiAgICAgIHZhciBwYXJlbnRIZWlnaHQgPSAkcGFyZW50LmhlaWdodCgpO1xuICAgICAgdmFyIGZpbGxlZCA9IGUuZGF0YSAmJiBlLmRhdGEuZmlsbGVkO1xuXG4gICAgICBnZXRJbWFnZVNpemUoaW1hZ2UsICQucHJveHkoZnVuY3Rpb24gKG5hdHVyYWxXaWR0aCwgbmF0dXJhbEhlaWdodCkge1xuICAgICAgICB2YXIgYXNwZWN0UmF0aW8gPSBuYXR1cmFsV2lkdGggLyBuYXR1cmFsSGVpZ2h0O1xuICAgICAgICB2YXIgd2lkdGggPSBwYXJlbnRXaWR0aDtcbiAgICAgICAgdmFyIGhlaWdodCA9IHBhcmVudEhlaWdodDtcblxuICAgICAgICBpZiAocGFyZW50SGVpZ2h0ICogYXNwZWN0UmF0aW8gPiBwYXJlbnRXaWR0aCkge1xuICAgICAgICAgIGlmIChmaWxsZWQpIHtcbiAgICAgICAgICAgIHdpZHRoID0gcGFyZW50SGVpZ2h0ICogYXNwZWN0UmF0aW87XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhlaWdodCA9IHBhcmVudFdpZHRoIC8gYXNwZWN0UmF0aW87XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChmaWxsZWQpIHtcbiAgICAgICAgICAgIGhlaWdodCA9IHBhcmVudFdpZHRoIC8gYXNwZWN0UmF0aW87XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdpZHRoID0gcGFyZW50SGVpZ2h0ICogYXNwZWN0UmF0aW87XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJGltYWdlLmNzcyh7XG4gICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgIG1hcmdpbkxlZnQ6IChwYXJlbnRXaWR0aCAtIHdpZHRoKSAvIDIsXG4gICAgICAgICAgbWFyZ2luVG9wOiAocGFyZW50SGVpZ2h0IC0gaGVpZ2h0KSAvIDJcbiAgICAgICAgfSk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIHJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5pbml0Q29udGFpbmVyKCk7XG4gICAgICB0aGlzLmluaXRWaWV3ZXIoKTtcbiAgICAgIHRoaXMucmVuZGVyVmlld2VyKCk7XG4gICAgICB0aGlzLnJlbmRlckxpc3QoKTtcbiAgICAgIHRoaXMuaW5pdEltYWdlKCQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlbmRlckltYWdlKCk7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIGlmICh0aGlzLmlzUGxheWVkKSB7XG4gICAgICAgIHRoaXMuJHBsYXllci5cbiAgICAgICAgICBmaW5kKFNFTEVDVE9SX0lNRykuXG4gICAgICAgICAgb25lKEVWRU5UX0xPQUQsICQucHJveHkodGhpcy5sb2FkSW1hZ2UsIHRoaXMpKS5cbiAgICAgICAgICB0cmlnZ2VyKEVWRU5UX0xPQUQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB3aGVlbDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgZSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XG4gICAgICB2YXIgcmF0aW8gPSBudW0odGhpcy5vcHRpb25zLnpvb21SYXRpbykgfHwgMC4xO1xuICAgICAgdmFyIGRlbHRhID0gMTtcblxuICAgICAgaWYgKCF0aGlzLmlzVmlld2VkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgaWYgKGUuZGVsdGFZKSB7XG4gICAgICAgIGRlbHRhID0gZS5kZWx0YVkgPiAwID8gMSA6IC0xO1xuICAgICAgfSBlbHNlIGlmIChlLndoZWVsRGVsdGEpIHtcbiAgICAgICAgZGVsdGEgPSAtZS53aGVlbERlbHRhIC8gMTIwO1xuICAgICAgfSBlbHNlIGlmIChlLmRldGFpbCkge1xuICAgICAgICBkZWx0YSA9IGUuZGV0YWlsID4gMCA/IDEgOiAtMTtcbiAgICAgIH1cblxuICAgICAgdGhpcy56b29tKC1kZWx0YSAqIHJhdGlvLCB0cnVlKTtcbiAgICB9LFxuXG4gICAga2V5ZG93bjogZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyIHdoaWNoID0gZS53aGljaDtcblxuICAgICAgaWYgKCF0aGlzLmlzRnVsbGVkIHx8ICFvcHRpb25zLmtleWJvYXJkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc3dpdGNoICh3aGljaCkge1xuXG4gICAgICAgIC8vIChLZXk6IEVzYylcbiAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICBpZiAodGhpcy5pc1BsYXllZCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmlubGluZSkge1xuICAgICAgICAgICAgICBpZiAodGhpcy5pc0Z1bGxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhpdCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBWaWV3IHByZXZpb3VzIChLZXk6IOKGkClcbiAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICB0aGlzLnByZXYoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBab29tIGluIChLZXk6IOKGkSlcbiAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICB0aGlzLnpvb20ob3B0aW9ucy56b29tUmF0aW8sIHRydWUpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIFZpZXcgbmV4dCAoS2V5OiDihpIpXG4gICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy8gWm9vbSBvdXQgKEtleTog4oaTKVxuICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgIHRoaXMuem9vbSgtb3B0aW9ucy56b29tUmF0aW8sIHRydWUpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIFpvb20gb3V0IHRvIGluaXRpYWwgc2l6ZSAoS2V5OiBDdHJsICsgMClcbiAgICAgICAgY2FzZSA0ODpcbiAgICAgICAgICAvLyBHbyB0byBuZXh0XG5cbiAgICAgICAgLy8gWm9vbSBpbiB0byBuYXR1cmFsIHNpemUgKEtleTogQ3RybCArIDEpXG4gICAgICAgIGNhc2UgNDk6XG4gICAgICAgICAgaWYgKGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlLnJhdGlvID09PSAxKSB7XG4gICAgICAgICAgICAgIHRoaXMuem9vbVRvKHRoaXMuaW5pdGlhbEltYWdlLnJhdGlvKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuem9vbVRvKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIE5vIGRlZmF1bHRcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyIG9yaWdpbmFsRXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuICAgICAgdmFyIHRvdWNoZXMgPSBvcmlnaW5hbEV2ZW50ICYmIG9yaWdpbmFsRXZlbnQudG91Y2hlcztcbiAgICAgIHZhciBlID0gZXZlbnQ7XG4gICAgICB2YXIgYWN0aW9uID0gb3B0aW9ucy5tb3ZhYmxlID8gJ21vdmUnIDogZmFsc2U7XG4gICAgICB2YXIgdG91Y2hlc0xlbmd0aDtcblxuICAgICAgaWYgKCF0aGlzLmlzVmlld2VkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRvdWNoZXMpIHtcbiAgICAgICAgdG91Y2hlc0xlbmd0aCA9IHRvdWNoZXMubGVuZ3RoO1xuXG4gICAgICAgIGlmICh0b3VjaGVzTGVuZ3RoID4gMSkge1xuICAgICAgICAgIGlmIChvcHRpb25zLnpvb21hYmxlICYmIHRvdWNoZXNMZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIGUgPSB0b3VjaGVzWzFdO1xuICAgICAgICAgICAgdGhpcy5zdGFydFgyID0gZS5wYWdlWDtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRZMiA9IGUucGFnZVk7XG4gICAgICAgICAgICBhY3Rpb24gPSAnem9vbSc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNTd2l0Y2hhYmxlKCkpIHtcbiAgICAgICAgICAgIGFjdGlvbiA9ICdzd2l0Y2gnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGUgPSB0b3VjaGVzWzBdO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWN0aW9uKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuYWN0aW9uID0gYWN0aW9uO1xuXG4gICAgICAgIC8vIElFOCAgaGFzIGBldmVudC5wYWdlWC9ZYCwgYnV0IG5vdCBgZXZlbnQub3JpZ2luYWxFdmVudC5wYWdlWC9ZYFxuICAgICAgICAvLyBJRTEwIGhhcyBgZXZlbnQub3JpZ2luYWxFdmVudC5wYWdlWC9ZYCwgYnV0IG5vdCBgZXZlbnQucGFnZVgvWWBcbiAgICAgICAgdGhpcy5zdGFydFggPSBlLnBhZ2VYIHx8IG9yaWdpbmFsRXZlbnQgJiYgb3JpZ2luYWxFdmVudC5wYWdlWDtcbiAgICAgICAgdGhpcy5zdGFydFkgPSBlLnBhZ2VZIHx8IG9yaWdpbmFsRXZlbnQgJiYgb3JpZ2luYWxFdmVudC5wYWdlWTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyIGFjdGlvbiA9IHRoaXMuYWN0aW9uO1xuICAgICAgdmFyICRpbWFnZSA9IHRoaXMuJGltYWdlO1xuICAgICAgdmFyIG9yaWdpbmFsRXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuICAgICAgdmFyIHRvdWNoZXMgPSBvcmlnaW5hbEV2ZW50ICYmIG9yaWdpbmFsRXZlbnQudG91Y2hlcztcbiAgICAgIHZhciBlID0gZXZlbnQ7XG4gICAgICB2YXIgdG91Y2hlc0xlbmd0aDtcblxuICAgICAgaWYgKCF0aGlzLmlzVmlld2VkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRvdWNoZXMpIHtcbiAgICAgICAgdG91Y2hlc0xlbmd0aCA9IHRvdWNoZXMubGVuZ3RoO1xuXG4gICAgICAgIGlmICh0b3VjaGVzTGVuZ3RoID4gMSkge1xuICAgICAgICAgIGlmIChvcHRpb25zLnpvb21hYmxlICYmIHRvdWNoZXNMZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIGUgPSB0b3VjaGVzWzFdO1xuICAgICAgICAgICAgdGhpcy5lbmRYMiA9IGUucGFnZVg7XG4gICAgICAgICAgICB0aGlzLmVuZFkyID0gZS5wYWdlWTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGUgPSB0b3VjaGVzWzBdO1xuICAgICAgfVxuXG4gICAgICBpZiAoYWN0aW9uKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ21vdmUnICYmIG9wdGlvbnMudHJhbnNpdGlvbiAmJiAkaW1hZ2UuaGFzQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTikpIHtcbiAgICAgICAgICAkaW1hZ2UucmVtb3ZlQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVuZFggPSBlLnBhZ2VYIHx8IG9yaWdpbmFsRXZlbnQgJiYgb3JpZ2luYWxFdmVudC5wYWdlWDtcbiAgICAgICAgdGhpcy5lbmRZID0gZS5wYWdlWSB8fCBvcmlnaW5hbEV2ZW50ICYmIG9yaWdpbmFsRXZlbnQucGFnZVk7XG5cbiAgICAgICAgdGhpcy5jaGFuZ2UoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbW91c2V1cDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgYWN0aW9uID0gdGhpcy5hY3Rpb247XG5cbiAgICAgIGlmIChhY3Rpb24pIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoYWN0aW9uID09PSAnbW92ZScgJiYgdGhpcy5vcHRpb25zLnRyYW5zaXRpb24pIHtcbiAgICAgICAgICB0aGlzLiRpbWFnZS5hZGRDbGFzcyhDTEFTU19UUkFOU0lUSU9OKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWN0aW9uID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAkLmV4dGVuZChwcm90b3R5cGUsIHtcblxuICAgIC8vIFNob3cgdGhlIHZpZXdlciAob25seSBhdmFpbGFibGUgaW4gbW9kYWwgbW9kZSlcbiAgICBzaG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkdmlld2VyO1xuXG4gICAgICBpZiAob3B0aW9ucy5pbmxpbmUgfHwgdGhpcy50cmFuc2l0aW9uaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmlzQnVpbHQpIHtcbiAgICAgICAgdGhpcy5idWlsZCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMuc2hvdykpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRVZFTlRfU0hPVywgb3B0aW9ucy5zaG93KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudHJpZ2dlcihFVkVOVF9TSE9XKS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGJvZHkuYWRkQ2xhc3MoQ0xBU1NfT1BFTik7XG4gICAgICAkdmlld2VyID0gdGhpcy4kdmlld2VyLnJlbW92ZUNsYXNzKENMQVNTX0hJREUpO1xuXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uZShFVkVOVF9TSE9XTiwgJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudmlldygodGhpcy50YXJnZXQgPyB0aGlzLiRpbWFnZXMuaW5kZXgodGhpcy50YXJnZXQpIDogMCkgfHwgdGhpcy5pbmRleCk7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gZmFsc2U7XG4gICAgICB9LCB0aGlzKSk7XG5cbiAgICAgIGlmIChvcHRpb25zLnRyYW5zaXRpb24pIHtcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gdHJ1ZTtcblxuICAgICAgICAvKiBqc2hpbnQgZXhwcjp0cnVlICovXG4gICAgICAgICR2aWV3ZXIuYWRkQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTikuZ2V0KDApLm9mZnNldFdpZHRoO1xuICAgICAgICAkdmlld2VyLm9uZShFVkVOVF9UUkFOU0lUSU9ORU5ELCAkLnByb3h5KHRoaXMuc2hvd24sIHRoaXMpKS5hZGRDbGFzcyhDTEFTU19JTik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkdmlld2VyLmFkZENsYXNzKENMQVNTX0lOKTtcbiAgICAgICAgdGhpcy5zaG93bigpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBIaWRlIHRoZSB2aWV3ZXIgKG9ubHkgYXZhaWxhYmxlIGluIG1vZGFsIG1vZGUpXG4gICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJHZpZXdlciA9IHRoaXMuJHZpZXdlcjtcblxuICAgICAgaWYgKG9wdGlvbnMuaW5saW5lIHx8IHRoaXMudHJhbnNpdGlvbmluZyB8fCAhdGhpcy5pc1Nob3duKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLmhpZGUpKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub25lKEVWRU5UX0hJREUsIG9wdGlvbnMuaGlkZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnRyaWdnZXIoRVZFTlRfSElERSkuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc1ZpZXdlZCAmJiBvcHRpb25zLnRyYW5zaXRpb24pIHtcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy4kaW1hZ2Uub25lKEVWRU5UX1RSQU5TSVRJT05FTkQsICQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICR2aWV3ZXIub25lKEVWRU5UX1RSQU5TSVRJT05FTkQsICQucHJveHkodGhpcy5oaWRkZW4sIHRoaXMpKS5yZW1vdmVDbGFzcyhDTEFTU19JTik7XG4gICAgICAgIH0sIHRoaXMpKTtcbiAgICAgICAgdGhpcy56b29tVG8oMCwgZmFsc2UsIHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHZpZXdlci5yZW1vdmVDbGFzcyhDTEFTU19JTik7XG4gICAgICAgIHRoaXMuaGlkZGVuKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFZpZXcgb25lIG9mIHRoZSBpbWFnZXMgd2l0aCBpbWFnZSdzIGluZGV4XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAgICAgKi9cbiAgICB2aWV3OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyIHZpZXdlciA9IHRoaXMudmlld2VyO1xuICAgICAgdmFyICR0aXRsZSA9IHRoaXMuJHRpdGxlO1xuICAgICAgdmFyICRpbWFnZTtcbiAgICAgIHZhciAkaXRlbTtcbiAgICAgIHZhciAkaW1nO1xuICAgICAgdmFyIHVybDtcbiAgICAgIHZhciBhbHQ7XG5cbiAgICAgIGluZGV4ID0gTnVtYmVyKGluZGV4KSB8fCAwO1xuXG4gICAgICBpZiAoIXRoaXMuaXNTaG93biB8fCB0aGlzLmlzUGxheWVkIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLmxlbmd0aCB8fFxuICAgICAgICB0aGlzLmlzVmlld2VkICYmIGluZGV4ID09PSB0aGlzLmluZGV4KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudHJpZ2dlcihFVkVOVF9WSUVXKS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgICRpdGVtID0gdGhpcy4kaXRlbXMuZXEoaW5kZXgpO1xuICAgICAgJGltZyA9ICRpdGVtLmZpbmQoU0VMRUNUT1JfSU1HKTtcbiAgICAgIHVybCA9ICRpbWcuZGF0YSgnb3JpZ2luYWxVcmwnKTtcbiAgICAgIGFsdCA9ICRpbWcuYXR0cignYWx0Jyk7XG5cbiAgICAgIHRoaXMuJGltYWdlID0gJGltYWdlID0gJCgnPGltZyBzcmM9XCInICsgdXJsICsgJ1wiIGFsdD1cIicgKyBhbHQgKyAnXCI+Jyk7XG5cbiAgICAgICRpbWFnZS5cbiAgICAgICAgdG9nZ2xlQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTiwgb3B0aW9ucy50cmFuc2l0aW9uKS5cbiAgICAgICAgdG9nZ2xlQ2xhc3MoQ0xBU1NfTU9WRSwgb3B0aW9ucy5tb3ZhYmxlKS5cbiAgICAgICAgY3NzKHtcbiAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgICAgbWFyZ2luTGVmdDogdmlld2VyLndpZHRoIC8gMixcbiAgICAgICAgICBtYXJnaW5Ub3A6IHZpZXdlci5oZWlnaHQgLyAyXG4gICAgICAgIH0pO1xuXG4gICAgICB0aGlzLiRpdGVtcy5lcSh0aGlzLmluZGV4KS5yZW1vdmVDbGFzcyhDTEFTU19BQ1RJVkUpO1xuICAgICAgJGl0ZW0uYWRkQ2xhc3MoQ0xBU1NfQUNUSVZFKTtcblxuICAgICAgdGhpcy5pc1ZpZXdlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgICAgdGhpcy5pbWFnZSA9IG51bGw7XG4gICAgICAkaW1hZ2Uub25lKEVWRU5UX0xPQUQsICQucHJveHkodGhpcy5sb2FkLCB0aGlzKSk7XG4gICAgICB0aGlzLiRjYW52YXMuaHRtbCgkaW1hZ2UpO1xuICAgICAgJHRpdGxlLmVtcHR5KCk7XG5cbiAgICAgIC8vIENlbnRlciBjdXJyZW50IGl0ZW1cbiAgICAgIHRoaXMucmVuZGVyTGlzdCgpO1xuXG4gICAgICAvLyBTaG93IHRpdGxlIHdoZW4gdmlld2VkXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uZShFVkVOVF9WSUVXRUQsICQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgICAgICB2YXIgd2lkdGggPSBpbWFnZS5uYXR1cmFsV2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQgPSBpbWFnZS5uYXR1cmFsSGVpZ2h0O1xuXG4gICAgICAgICR0aXRsZS5odG1sKGFsdCArICcgKCcgKyB3aWR0aCArICcgJnRpbWVzOyAnICsgaGVpZ2h0ICsgJyknKTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gVmlldyB0aGUgcHJldmlvdXMgaW1hZ2VcbiAgICBwcmV2OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnZpZXcobWF4KHRoaXMuaW5kZXggLSAxLCAwKSk7XG4gICAgfSxcblxuICAgIC8vIFZpZXcgdGhlIG5leHQgaW1hZ2VcbiAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnZpZXcobWluKHRoaXMuaW5kZXggKyAxLCB0aGlzLmxlbmd0aCAtIDEpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0aGUgaW1hZ2VcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRYXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldFkgKG9wdGlvbmFsKVxuICAgICAqL1xuICAgIG1vdmU6IGZ1bmN0aW9uIChvZmZzZXRYLCBvZmZzZXRZKSB7XG4gICAgICB2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuXG4gICAgICAvLyBJZiBcIm9mZnNldFlcIiBpcyBub3QgcHJlc2VudCwgaXRzIGRlZmF1bHQgdmFsdWUgaXMgXCJvZmZzZXRYXCJcbiAgICAgIGlmIChpc1VuZGVmaW5lZChvZmZzZXRZKSkge1xuICAgICAgICBvZmZzZXRZID0gb2Zmc2V0WDtcbiAgICAgIH1cblxuICAgICAgb2Zmc2V0WCA9IG51bShvZmZzZXRYKTtcbiAgICAgIG9mZnNldFkgPSBudW0ob2Zmc2V0WSk7XG5cbiAgICAgIGlmICh0aGlzLmlzU2hvd24gJiYgIXRoaXMuaXNQbGF5ZWQgJiYgdGhpcy5vcHRpb25zLm1vdmFibGUpIHtcbiAgICAgICAgaW1hZ2UubGVmdCArPSBpc051bWJlcihvZmZzZXRYKSA/IG9mZnNldFggOiAwO1xuICAgICAgICBpbWFnZS50b3AgKz0gaXNOdW1iZXIob2Zmc2V0WSkgPyBvZmZzZXRZIDogMDtcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBab29tIHRoZSBpbWFnZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJhdGlvXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBoYXNUb29sdGlwIChvcHRpb25hbClcbiAgICAgKi9cbiAgICB6b29tOiBmdW5jdGlvbiAocmF0aW8sIGhhc1Rvb2x0aXApIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyIG1pblpvb21SYXRpbyA9IG1heCgwLjAxLCBvcHRpb25zLm1pblpvb21SYXRpbyk7XG4gICAgICB2YXIgbWF4Wm9vbVJhdGlvID0gbWluKDEwMCwgb3B0aW9ucy5tYXhab29tUmF0aW8pO1xuICAgICAgdmFyIGltYWdlID0gdGhpcy5pbWFnZTtcbiAgICAgIHZhciB3aWR0aDtcbiAgICAgIHZhciBoZWlnaHQ7XG5cbiAgICAgIHJhdGlvID0gbnVtKHJhdGlvKTtcblxuICAgICAgaWYgKGlzTnVtYmVyKHJhdGlvKSAmJiB0aGlzLmlzU2hvd24gJiYgIXRoaXMuaXNQbGF5ZWQgJiYgb3B0aW9ucy56b29tYWJsZSkge1xuICAgICAgICBpZiAocmF0aW8gPCAwKSB7XG4gICAgICAgICAgcmF0aW8gPSAgMSAvICgxIC0gcmF0aW8pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJhdGlvID0gMSArIHJhdGlvO1xuICAgICAgICB9XG5cbiAgICAgICAgd2lkdGggPSBpbWFnZS53aWR0aCAqIHJhdGlvO1xuICAgICAgICBoZWlnaHQgPSBpbWFnZS5oZWlnaHQgKiByYXRpbztcbiAgICAgICAgcmF0aW8gPSB3aWR0aCAvIGltYWdlLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgcmF0aW8gPSBtaW4obWF4KHJhdGlvLCBtaW5ab29tUmF0aW8pLCBtYXhab29tUmF0aW8pO1xuXG4gICAgICAgIGlmIChyYXRpbyA+IDAuOTUgJiYgcmF0aW8gPCAxLjA1KSB7XG4gICAgICAgICAgcmF0aW8gPSAxO1xuICAgICAgICAgIHdpZHRoID0gaW1hZ2UubmF0dXJhbFdpZHRoO1xuICAgICAgICAgIGhlaWdodCA9IGltYWdlLm5hdHVyYWxIZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpbWFnZS5sZWZ0IC09ICh3aWR0aCAtIGltYWdlLndpZHRoKSAvIDI7XG4gICAgICAgIGltYWdlLnRvcCAtPSAoaGVpZ2h0IC0gaW1hZ2UuaGVpZ2h0KSAvIDI7XG4gICAgICAgIGltYWdlLndpZHRoID0gd2lkdGg7XG4gICAgICAgIGltYWdlLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgaW1hZ2UucmF0aW8gPSByYXRpbztcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZSgpO1xuXG4gICAgICAgIGlmIChoYXNUb29sdGlwKSB7XG4gICAgICAgICAgdGhpcy50b29sdGlwKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogWm9vbSB0aGUgaW1hZ2UgdG8gYSBzcGVjaWFsIHJhdGlvXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcmF0aW9cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGhhc1Rvb2x0aXAgKG9wdGlvbmFsKVxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gX3pvb21hYmxlIChwcml2YXRlKVxuICAgICAqL1xuICAgIHpvb21UbzogZnVuY3Rpb24gKHJhdGlvLCBoYXNUb29sdGlwLCBfem9vbWFibGUpIHtcbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG4gICAgICB2YXIgd2lkdGg7XG4gICAgICB2YXIgaGVpZ2h0O1xuXG4gICAgICByYXRpbyA9IG1heChyYXRpbywgMCk7XG5cbiAgICAgIGlmIChpc051bWJlcihyYXRpbykgJiYgdGhpcy5pc1Nob3duICYmICF0aGlzLmlzUGxheWVkICYmIChfem9vbWFibGUgfHwgdGhpcy5vcHRpb25zLnpvb21hYmxlKSkge1xuICAgICAgICB3aWR0aCA9IGltYWdlLm5hdHVyYWxXaWR0aCAqIHJhdGlvO1xuICAgICAgICBoZWlnaHQgPSBpbWFnZS5uYXR1cmFsSGVpZ2h0ICogcmF0aW87XG4gICAgICAgIGltYWdlLmxlZnQgLT0gKHdpZHRoIC0gaW1hZ2Uud2lkdGgpIC8gMjtcbiAgICAgICAgaW1hZ2UudG9wIC09IChoZWlnaHQgLSBpbWFnZS5oZWlnaHQpIC8gMjtcbiAgICAgICAgaW1hZ2Uud2lkdGggPSB3aWR0aDtcbiAgICAgICAgaW1hZ2UuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBpbWFnZS5yYXRpbyA9IHJhdGlvO1xuICAgICAgICB0aGlzLnJlbmRlckltYWdlKCk7XG5cbiAgICAgICAgaWYgKGhhc1Rvb2x0aXApIHtcbiAgICAgICAgICB0aGlzLnRvb2x0aXAoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3RhdGUgdGhlIGltYWdlXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL3RyYW5zZm9ybS1mdW5jdGlvbiNyb3RhdGUoKVxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRlZ3JlZXNcbiAgICAgKi9cbiAgICByb3RhdGU6IGZ1bmN0aW9uIChkZWdyZWVzKSB7XG4gICAgICB2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuXG4gICAgICBkZWdyZWVzID0gbnVtKGRlZ3JlZXMpO1xuXG4gICAgICBpZiAoaXNOdW1iZXIoZGVncmVlcykgJiYgdGhpcy5pc1Nob3duICYmICF0aGlzLmlzUGxheWVkICYmIHRoaXMub3B0aW9ucy5yb3RhdGFibGUpIHtcbiAgICAgICAgaW1hZ2Uucm90YXRlID0gKChpbWFnZS5yb3RhdGUgfHwgMCkgKyBkZWdyZWVzKTtcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSb3RhdGUgdGhlIGltYWdlIHRvIGEgc3BlY2lhbCBhbmdsZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGRlZ3JlZXNcbiAgICAgKi9cbiAgICByb3RhdGVUbzogZnVuY3Rpb24gKGRlZ3JlZXMpIHtcbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG5cbiAgICAgIGRlZ3JlZXMgPSBudW0oZGVncmVlcyk7XG5cbiAgICAgIGlmIChpc051bWJlcihkZWdyZWVzKSAmJiB0aGlzLmlzU2hvd24gJiYgIXRoaXMuaXNQbGF5ZWQgJiYgdGhpcy5vcHRpb25zLnJvdGF0YWJsZSkge1xuICAgICAgICBpbWFnZS5yb3RhdGUgPSBkZWdyZWVzO1xuICAgICAgICB0aGlzLnJlbmRlckltYWdlKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNjYWxlIHRoZSBpbWFnZVxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy90cmFuc2Zvcm0tZnVuY3Rpb24jc2NhbGUoKVxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlWFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZVkgKG9wdGlvbmFsKVxuICAgICAqL1xuICAgIHNjYWxlOiBmdW5jdGlvbiAoc2NhbGVYLCBzY2FsZVkpIHtcbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG5cbiAgICAgIC8vIElmIFwic2NhbGVZXCIgaXMgbm90IHByZXNlbnQsIGl0cyBkZWZhdWx0IHZhbHVlIGlzIFwic2NhbGVYXCJcbiAgICAgIGlmIChpc1VuZGVmaW5lZChzY2FsZVkpKSB7XG4gICAgICAgIHNjYWxlWSA9IHNjYWxlWDtcbiAgICAgIH1cblxuICAgICAgc2NhbGVYID0gbnVtKHNjYWxlWCk7XG4gICAgICBzY2FsZVkgPSBudW0oc2NhbGVZKTtcblxuICAgICAgaWYgKHRoaXMuaXNTaG93biAmJiAhdGhpcy5pc1BsYXllZCAmJiB0aGlzLm9wdGlvbnMuc2NhbGFibGUpIHtcbiAgICAgICAgaW1hZ2Uuc2NhbGVYID0gaXNOdW1iZXIoc2NhbGVYKSA/IHNjYWxlWCA6IDE7XG4gICAgICAgIGltYWdlLnNjYWxlWSA9IGlzTnVtYmVyKHNjYWxlWSkgPyBzY2FsZVkgOiAxO1xuICAgICAgICB0aGlzLnJlbmRlckltYWdlKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNjYWxlIHRoZSBhYnNjaXNzYSBvZiB0aGUgaW1hZ2VcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZVhcbiAgICAgKi9cbiAgICBzY2FsZVg6IGZ1bmN0aW9uIChzY2FsZVgpIHtcbiAgICAgIHRoaXMuc2NhbGUoc2NhbGVYLCB0aGlzLmltYWdlLnNjYWxlWSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNjYWxlIHRoZSBvcmRpbmF0ZSBvZiB0aGUgaW1hZ2VcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZVlcbiAgICAgKi9cbiAgICBzY2FsZVk6IGZ1bmN0aW9uIChzY2FsZVkpIHtcbiAgICAgIHRoaXMuc2NhbGUodGhpcy5pbWFnZS5zY2FsZVgsIHNjYWxlWSk7XG4gICAgfSxcblxuICAgIC8vIFBsYXkgdGhlIGltYWdlc1xuICAgIHBsYXk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICRwbGF5ZXIgPSB0aGlzLiRwbGF5ZXI7XG4gICAgICB2YXIgbG9hZCA9ICQucHJveHkodGhpcy5sb2FkSW1hZ2UsIHRoaXMpO1xuICAgICAgdmFyIGxpc3QgPSBbXTtcbiAgICAgIHZhciB0b3RhbCA9IDA7XG4gICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgdmFyIHBsYXlpbmc7XG5cbiAgICAgIGlmICghdGhpcy5pc1Nob3duIHx8IHRoaXMuaXNQbGF5ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5mdWxsc2NyZWVuKSB7XG4gICAgICAgIHRoaXMuZnVsbHNjcmVlbigpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmlzUGxheWVkID0gdHJ1ZTtcbiAgICAgICRwbGF5ZXIuYWRkQ2xhc3MoQ0xBU1NfU0hPVyk7XG5cbiAgICAgIHRoaXMuJGl0ZW1zLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgdmFyICRpbWcgPSAkdGhpcy5maW5kKFNFTEVDVE9SX0lNRyk7XG4gICAgICAgIHZhciAkaW1hZ2UgPSAkKCc8aW1nIHNyYz1cIicgKyAkaW1nLmRhdGEoJ29yaWdpbmFsVXJsJykgKyAnXCIgYWx0PVwiJyArICRpbWcuYXR0cignYWx0JykgKyAnXCI+Jyk7XG5cbiAgICAgICAgdG90YWwrKztcblxuICAgICAgICAkaW1hZ2UuYWRkQ2xhc3MoQ0xBU1NfRkFERSkudG9nZ2xlQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTiwgb3B0aW9ucy50cmFuc2l0aW9uKTtcblxuICAgICAgICBpZiAoJHRoaXMuaGFzQ2xhc3MoQ0xBU1NfQUNUSVZFKSkge1xuICAgICAgICAgICRpbWFnZS5hZGRDbGFzcyhDTEFTU19JTik7XG4gICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5wdXNoKCRpbWFnZSk7XG4gICAgICAgICRpbWFnZS5vbmUoRVZFTlRfTE9BRCwge1xuICAgICAgICAgIGZpbGxlZDogZmFsc2VcbiAgICAgICAgfSwgbG9hZCk7XG4gICAgICAgICRwbGF5ZXIuYXBwZW5kKCRpbWFnZSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGlzTnVtYmVyKG9wdGlvbnMuaW50ZXJ2YWwpICYmIG9wdGlvbnMuaW50ZXJ2YWwgPiAwKSB7XG4gICAgICAgIHBsYXlpbmcgPSAkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLnBsYXlpbmcgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxpc3RbaW5kZXhdLnJlbW92ZUNsYXNzKENMQVNTX0lOKTtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICBpbmRleCA9IGluZGV4IDwgdG90YWwgPyBpbmRleCA6IDA7XG4gICAgICAgICAgICBsaXN0W2luZGV4XS5hZGRDbGFzcyhDTEFTU19JTik7XG5cbiAgICAgICAgICAgIHBsYXlpbmcoKTtcbiAgICAgICAgICB9LCBvcHRpb25zLmludGVydmFsKTtcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgaWYgKHRvdGFsID4gMSkge1xuICAgICAgICAgIHBsYXlpbmcoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBTdG9wIHBsYXlcbiAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXRoaXMuaXNQbGF5ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmlzUGxheWVkID0gZmFsc2U7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5wbGF5aW5nKTtcbiAgICAgIHRoaXMuJHBsYXllci5yZW1vdmVDbGFzcyhDTEFTU19TSE9XKS5lbXB0eSgpO1xuICAgIH0sXG5cbiAgICAvLyBFbnRlciBtb2RhbCBtb2RlIChvbmx5IGF2YWlsYWJsZSBpbiBpbmxpbmUgbW9kZSlcbiAgICBmdWxsOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkaW1hZ2UgPSB0aGlzLiRpbWFnZTtcbiAgICAgIHZhciAkbGlzdCA9IHRoaXMuJGxpc3Q7XG5cbiAgICAgIGlmICghdGhpcy5pc1Nob3duIHx8IHRoaXMuaXNQbGF5ZWQgfHwgdGhpcy5pc0Z1bGxlZCB8fCAhb3B0aW9ucy5pbmxpbmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmlzRnVsbGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuJGJvZHkuYWRkQ2xhc3MoQ0xBU1NfT1BFTik7XG4gICAgICB0aGlzLiRidXR0b24uYWRkQ2xhc3MoQ0xBU1NfRlVMTFNDUkVFTl9FWElUKTtcblxuICAgICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgICAkaW1hZ2UucmVtb3ZlQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTik7XG4gICAgICAgICRsaXN0LnJlbW92ZUNsYXNzKENMQVNTX1RSQU5TSVRJT04pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiR2aWV3ZXIuYWRkQ2xhc3MoQ0xBU1NfRklYRUQpLnJlbW92ZUF0dHIoJ3N0eWxlJykuY3NzKCd6LWluZGV4Jywgb3B0aW9ucy56SW5kZXgpO1xuICAgICAgdGhpcy5pbml0Q29udGFpbmVyKCk7XG4gICAgICB0aGlzLnZpZXdlciA9ICQuZXh0ZW5kKHt9LCB0aGlzLmNvbnRhaW5lcik7XG4gICAgICB0aGlzLnJlbmRlckxpc3QoKTtcbiAgICAgIHRoaXMuaW5pdEltYWdlKCQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlbmRlckltYWdlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy50cmFuc2l0aW9uKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJGltYWdlLmFkZENsYXNzKENMQVNTX1RSQU5TSVRJT04pO1xuICAgICAgICAgICAgICAkbGlzdC5hZGRDbGFzcyhDTEFTU19UUkFOU0lUSU9OKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIEV4aXQgbW9kYWwgbW9kZSAob25seSBhdmFpbGFibGUgaW4gaW5saW5lIG1vZGUpXG4gICAgZXhpdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJGltYWdlID0gdGhpcy4kaW1hZ2U7XG4gICAgICB2YXIgJGxpc3QgPSB0aGlzLiRsaXN0O1xuXG4gICAgICBpZiAoIXRoaXMuaXNGdWxsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmlzRnVsbGVkID0gZmFsc2U7XG4gICAgICB0aGlzLiRib2R5LnJlbW92ZUNsYXNzKENMQVNTX09QRU4pO1xuICAgICAgdGhpcy4kYnV0dG9uLnJlbW92ZUNsYXNzKENMQVNTX0ZVTExTQ1JFRU5fRVhJVCk7XG5cbiAgICAgIGlmIChvcHRpb25zLnRyYW5zaXRpb24pIHtcbiAgICAgICAgJGltYWdlLnJlbW92ZUNsYXNzKENMQVNTX1RSQU5TSVRJT04pO1xuICAgICAgICAkbGlzdC5yZW1vdmVDbGFzcyhDTEFTU19UUkFOU0lUSU9OKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy4kdmlld2VyLnJlbW92ZUNsYXNzKENMQVNTX0ZJWEVEKS5jc3MoJ3otaW5kZXgnLCBvcHRpb25zLnpJbmRleElubGluZSk7XG4gICAgICB0aGlzLnZpZXdlciA9ICQuZXh0ZW5kKHt9LCB0aGlzLnBhcmVudCk7XG4gICAgICB0aGlzLnJlbmRlclZpZXdlcigpO1xuICAgICAgdGhpcy5yZW5kZXJMaXN0KCk7XG4gICAgICB0aGlzLmluaXRJbWFnZSgkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICRpbWFnZS5hZGRDbGFzcyhDTEFTU19UUkFOU0lUSU9OKTtcbiAgICAgICAgICAgICAgJGxpc3QuYWRkQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTik7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBTaG93IHRoZSBjdXJyZW50IHJhdGlvIG9mIHRoZSBpbWFnZSB3aXRoIHBlcmNlbnRhZ2VcbiAgICB0b29sdGlwOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkdG9vbHRpcCA9IHRoaXMuJHRvb2x0aXA7XG4gICAgICB2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgICAgdmFyIGNsYXNzZXMgPSBbXG4gICAgICAgICAgICBDTEFTU19TSE9XLFxuICAgICAgICAgICAgQ0xBU1NfRkFERSxcbiAgICAgICAgICAgIENMQVNTX1RSQU5TSVRJT05cbiAgICAgICAgICBdLmpvaW4oJyAnKTtcblxuICAgICAgaWYgKCF0aGlzLmlzU2hvd24gfHwgdGhpcy5pc1BsYXllZCB8fCAhb3B0aW9ucy50b29sdGlwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgJHRvb2x0aXAudGV4dChyb3VuZChpbWFnZS5yYXRpbyAqIDEwMCkgKyAnJScpO1xuXG4gICAgICBpZiAoIXRoaXMuZmFkaW5nKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnRyYW5zaXRpb24pIHtcblxuICAgICAgICAgIC8qIGpzaGludCBleHByOnRydWUgKi9cbiAgICAgICAgICAkdG9vbHRpcC5hZGRDbGFzcyhjbGFzc2VzKS5nZXQoMCkub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgJHRvb2x0aXAuYWRkQ2xhc3MoQ0xBU1NfSU4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICR0b29sdGlwLmFkZENsYXNzKENMQVNTX1NIT1cpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5mYWRpbmcpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmZhZGluZyA9IHNldFRpbWVvdXQoJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnRyYW5zaXRpb24pIHtcbiAgICAgICAgICAkdG9vbHRpcC5vbmUoRVZFTlRfVFJBTlNJVElPTkVORCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHRvb2x0aXAucmVtb3ZlQ2xhc3MoY2xhc3Nlcyk7XG4gICAgICAgICAgfSkucmVtb3ZlQ2xhc3MoQ0xBU1NfSU4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICR0b29sdGlwLnJlbW92ZUNsYXNzKENMQVNTX1NIT1cpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mYWRpbmcgPSBmYWxzZTtcbiAgICAgIH0sIHRoaXMpLCAxMDAwKTtcbiAgICB9LFxuXG4gICAgLy8gVG9nZ2xlIHRoZSBpbWFnZSBzaXplIGJldHdlZW4gaXRzIG5hdHVyYWwgc2l6ZSBhbmQgaW5pdGlhbCBzaXplLlxuICAgIHRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuaW1hZ2UucmF0aW8gPT09IDEpIHtcbiAgICAgICAgdGhpcy56b29tVG8odGhpcy5pbml0aWFsSW1hZ2UucmF0aW8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy56b29tVG8oMSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IHRoZSBpbWFnZSB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuaXNTaG93biAmJiAhdGhpcy5pc1BsYXllZCkge1xuICAgICAgICB0aGlzLmltYWdlID0gJC5leHRlbmQoe30sIHRoaXMuaW5pdGlhbEltYWdlKTtcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBEZXN0cm95IHRoZSB2aWV3ZXJcbiAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSB0aGlzLiRlbGVtZW50O1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmlubGluZSkge1xuICAgICAgICB0aGlzLnVuYmluZCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTaG93bikge1xuICAgICAgICAgIHRoaXMudW5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBkZWJ1Z1xuICAgICAgICAgKiBAQ2xvdWRcbiAgICAgICAgICogRml4IG5vLWltYWdlcyBidWcsIGFkZCBsZW5ndGggaW5zcGVjdDpcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuJGltYWdlcyA/IHRoaXMuJGltYWdlcy5yZW1vdmVDbGFzcyhDTEFTU19UT0dHTEUpIDogJyc7XG5cbiAgICAgICAgJHRoaXMub2ZmKEVWRU5UX0NMSUNLLCB0aGlzLnN0YXJ0KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy51bmJ1aWxkKCk7XG4gICAgICAkdGhpcy5yZW1vdmVEYXRhKE5BTUVTUEFDRSk7XG4gICAgfVxuICB9KTtcblxuICAkLmV4dGVuZChwcm90b3R5cGUsIHtcblxuICAgIC8vIEEgc2hvcnRjdXQgZm9yIHRyaWdnZXJpbmcgY3VzdG9tIGV2ZW50c1xuICAgIHRyaWdnZXI6IGZ1bmN0aW9uICh0eXBlLCBkYXRhKSB7XG4gICAgICB2YXIgZSA9ICQuRXZlbnQodHlwZSwgZGF0YSk7XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKTtcblxuICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIHNob3duOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmlzRnVsbGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNTaG93biA9IHRydWU7XG4gICAgICB0aGlzLmlzVmlzaWJsZSA9IHRydWU7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgdGhpcy5iaW5kKCk7XG5cbiAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5zaG93bikpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRVZFTlRfU0hPV04sIG9wdGlvbnMuc2hvd24pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRyaWdnZXIoRVZFTlRfU0hPV04pO1xuICAgIH0sXG5cbiAgICBoaWRkZW46IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNWaWV3ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNGdWxsZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNTaG93biA9IGZhbHNlO1xuICAgICAgdGhpcy5pc1Zpc2libGUgPSBmYWxzZTtcbiAgICAgIHRoaXMudW5iaW5kKCk7XG4gICAgICB0aGlzLiRib2R5LnJlbW92ZUNsYXNzKENMQVNTX09QRU4pO1xuICAgICAgdGhpcy4kdmlld2VyLmFkZENsYXNzKENMQVNTX0hJREUpO1xuICAgICAgdGhpcy5yZXNldExpc3QoKTtcbiAgICAgIHRoaXMucmVzZXRJbWFnZSgpO1xuXG4gICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMuaGlkZGVuKSkge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uZShFVkVOVF9ISURERU4sIG9wdGlvbnMuaGlkZGVuKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50cmlnZ2VyKEVWRU5UX0hJRERFTik7XG4gICAgfSxcblxuICAgIGZ1bGxzY3JlZW46IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgICAgIGlmICh0aGlzLmlzRnVsbGVkICYmICFkb2N1bWVudC5mdWxsc2NyZWVuRWxlbWVudCAmJiAhZG9jdW1lbnQubW96RnVsbFNjcmVlbkVsZW1lbnQgJiZcbiAgICAgICAgIWRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50ICYmICFkb2N1bWVudC5tc0Z1bGxzY3JlZW5FbGVtZW50KSB7XG5cbiAgICAgICAgaWYgKGRvY3VtZW50RWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbikge1xuICAgICAgICAgIGRvY3VtZW50RWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50RWxlbWVudC5tc1JlcXVlc3RGdWxsc2NyZWVuKSB7XG4gICAgICAgICAgZG9jdW1lbnRFbGVtZW50Lm1zUmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudEVsZW1lbnQubW96UmVxdWVzdEZ1bGxTY3JlZW4pIHtcbiAgICAgICAgICBkb2N1bWVudEVsZW1lbnQubW96UmVxdWVzdEZ1bGxTY3JlZW4oKTtcbiAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudEVsZW1lbnQud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4pIHtcbiAgICAgICAgICBkb2N1bWVudEVsZW1lbnQud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oRWxlbWVudC5BTExPV19LRVlCT0FSRF9JTlBVVCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb2Zmc2V0WCA9IHRoaXMuZW5kWCAtIHRoaXMuc3RhcnRYO1xuICAgICAgdmFyIG9mZnNldFkgPSB0aGlzLmVuZFkgLSB0aGlzLnN0YXJ0WTtcblxuICAgICAgc3dpdGNoICh0aGlzLmFjdGlvbikge1xuXG4gICAgICAgIC8vIE1vdmUgdGhlIGN1cnJlbnQgaW1hZ2VcbiAgICAgICAgY2FzZSAnbW92ZSc6XG4gICAgICAgICAgdGhpcy5tb3ZlKG9mZnNldFgsIG9mZnNldFkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIFpvb20gdGhlIGN1cnJlbnQgaW1hZ2VcbiAgICAgICAgY2FzZSAnem9vbSc6XG4gICAgICAgICAgdGhpcy56b29tKGZ1bmN0aW9uICh4MSwgeTEsIHgyLCB5Mikge1xuICAgICAgICAgICAgdmFyIHoxID0gc3FydCh4MSAqIHgxICsgeTEgKiB5MSk7XG4gICAgICAgICAgICB2YXIgejIgPSBzcXJ0KHgyICogeDIgKyB5MiAqIHkyKTtcblxuICAgICAgICAgICAgcmV0dXJuICh6MiAtIHoxKSAvIHoxO1xuICAgICAgICAgIH0oXG4gICAgICAgICAgICBhYnModGhpcy5zdGFydFggLSB0aGlzLnN0YXJ0WDIpLFxuICAgICAgICAgICAgYWJzKHRoaXMuc3RhcnRZIC0gdGhpcy5zdGFydFkyKSxcbiAgICAgICAgICAgIGFicyh0aGlzLmVuZFggLSB0aGlzLmVuZFgyKSxcbiAgICAgICAgICAgIGFicyh0aGlzLmVuZFkgLSB0aGlzLmVuZFkyKVxuICAgICAgICAgICkpO1xuXG4gICAgICAgICAgdGhpcy5zdGFydFgyID0gdGhpcy5lbmRYMjtcbiAgICAgICAgICB0aGlzLnN0YXJ0WTIgPSB0aGlzLmVuZFkyO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3N3aXRjaCc6XG4gICAgICAgICAgdGhpcy5hY3Rpb24gPSAnc3dpdGNoZWQnO1xuXG4gICAgICAgICAgaWYgKG9mZnNldFggPiAxKSB7XG4gICAgICAgICAgICB0aGlzLnByZXYoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldFggPCAtMSkge1xuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy8gTm8gZGVmYXVsdFxuICAgICAgfVxuXG4gICAgICAvLyBPdmVycmlkZVxuICAgICAgdGhpcy5zdGFydFggPSB0aGlzLmVuZFg7XG4gICAgICB0aGlzLnN0YXJ0WSA9IHRoaXMuZW5kWTtcbiAgICB9LFxuXG4gICAgaXNTd2l0Y2hhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgICAgdmFyIHZpZXdlciA9IHRoaXMudmlld2VyO1xuXG4gICAgICByZXR1cm4gKGltYWdlLmxlZnQgPj0gMCAmJiBpbWFnZS50b3AgPj0gMCAmJiBpbWFnZS53aWR0aCA8PSB2aWV3ZXIud2lkdGggJiZcbiAgICAgICAgaW1hZ2UuaGVpZ2h0IDw9IHZpZXdlci5oZWlnaHQpO1xuICAgIH1cbiAgfSk7XG5cbiAgJC5leHRlbmQoVmlld2VyLnByb3RvdHlwZSwgcHJvdG90eXBlKTtcblxuICBWaWV3ZXIuREVGQVVMVFMgPSB7XG4gICAgLy8gRW5hYmxlIGlubGluZSBtb2RlXG4gICAgaW5saW5lOiBmYWxzZSxcblxuICAgIC8vIFNob3cgdGhlIGJ1dHRvbiBvbiB0aGUgdG9wLXJpZ2h0IG9mIHRoZSB2aWV3ZXJcbiAgICBidXR0b246IHRydWUsXG5cbiAgICAvLyBTaG93IHRoZSBuYXZiYXJcbiAgICBuYXZiYXI6IHRydWUsXG5cbiAgICAvLyBTaG93IHRoZSB0aXRsZVxuICAgIHRpdGxlOiB0cnVlLFxuXG4gICAgLy8gU2hvdyB0aGUgdG9vbGJhclxuICAgIHRvb2xiYXI6IHRydWUsXG5cbiAgICAvLyBTaG93IHRoZSB0b29sdGlwIHdpdGggaW1hZ2UgcmF0aW8gKHBlcmNlbnRhZ2UpIHdoZW4gem9vbSBpbiBvciB6b29tIG91dFxuICAgIHRvb2x0aXA6IHRydWUsXG5cbiAgICAvLyBFbmFibGUgdG8gbW92ZSB0aGUgaW1hZ2VcbiAgICBtb3ZhYmxlOiB0cnVlLFxuXG4gICAgLy8gRW5hYmxlIHRvIHpvb20gdGhlIGltYWdlXG4gICAgem9vbWFibGU6IHRydWUsXG5cbiAgICAvLyBFbmFibGUgdG8gcm90YXRlIHRoZSBpbWFnZVxuICAgIHJvdGF0YWJsZTogdHJ1ZSxcblxuICAgIC8vIEVuYWJsZSB0byBzY2FsZSB0aGUgaW1hZ2VcbiAgICBzY2FsYWJsZTogdHJ1ZSxcblxuICAgIC8vIEVuYWJsZSBDU1MzIFRyYW5zaXRpb24gZm9yIHNvbWUgc3BlY2lhbCBlbGVtZW50c1xuICAgIHRyYW5zaXRpb246IHRydWUsXG5cbiAgICAvLyBFbmFibGUgdG8gcmVxdWVzdCBmdWxsc2NyZWVuIHdoZW4gcGxheVxuICAgIGZ1bGxzY3JlZW46IHRydWUsXG5cbiAgICAvLyBFbmFibGUga2V5Ym9hcmQgc3VwcG9ydFxuICAgIGtleWJvYXJkOiB0cnVlLFxuXG4gICAgLy8gRGVmaW5lIGludGVydmFsIG9mIGVhY2ggaW1hZ2Ugd2hlbiBwbGF5aW5nXG4gICAgaW50ZXJ2YWw6IDUwMDAsXG5cbiAgICAvLyBNaW4gd2lkdGggb2YgdGhlIHZpZXdlciBpbiBpbmxpbmUgbW9kZVxuICAgIG1pbldpZHRoOiAyMDAsXG5cbiAgICAvLyBNaW4gaGVpZ2h0IG9mIHRoZSB2aWV3ZXIgaW4gaW5saW5lIG1vZGVcbiAgICBtaW5IZWlnaHQ6IDEwMCxcblxuICAgIC8vIERlZmluZSB0aGUgcmF0aW8gd2hlbiB6b29tIHRoZSBpbWFnZSBieSB3aGVlbGluZyBtb3VzZVxuICAgIHpvb21SYXRpbzogMC4xLFxuXG4gICAgLy8gRGVmaW5lIHRoZSBtaW4gcmF0aW8gb2YgdGhlIGltYWdlIHdoZW4gem9vbSBvdXRcbiAgICBtaW5ab29tUmF0aW86IDAuMDEsXG5cbiAgICAvLyBEZWZpbmUgdGhlIG1heCByYXRpbyBvZiB0aGUgaW1hZ2Ugd2hlbiB6b29tIGluXG4gICAgbWF4Wm9vbVJhdGlvOiAxMDAsXG5cbiAgICAvLyBEZWZpbmUgdGhlIENTUyBgei1pbmRleGAgdmFsdWUgb2Ygdmlld2VyIGluIG1vZGFsIG1vZGUuXG4gICAgekluZGV4OiAyMDE1LFxuXG4gICAgLy8gRGVmaW5lIHRoZSBDU1MgYHotaW5kZXhgIHZhbHVlIG9mIHZpZXdlciBpbiBpbmxpbmUgbW9kZS5cbiAgICB6SW5kZXhJbmxpbmU6IDAsXG5cbiAgICAvLyBEZWZpbmUgd2hlcmUgdG8gZ2V0IHRoZSBvcmlnaW5hbCBpbWFnZSBVUkwgZm9yIHZpZXdpbmdcbiAgICAvLyBUeXBlOiBTdHJpbmcgKGFuIGltYWdlIGF0dHJpYnV0ZSkgb3IgRnVuY3Rpb24gKHNob3VsZCByZXR1cm4gYW4gaW1hZ2UgVVJMKVxuICAgIHVybDogJ3NyYycsXG5cbiAgICAvLyBFdmVudCBzaG9ydGN1dHNcbiAgICBidWlsZDogbnVsbCxcbiAgICBidWlsdDogbnVsbCxcbiAgICBzaG93OiBudWxsLFxuICAgIHNob3duOiBudWxsLFxuICAgIGhpZGU6IG51bGwsXG4gICAgaGlkZGVuOiBudWxsXG4gIH07XG5cbiAgVmlld2VyLlRFTVBMQVRFID0gKFxuICAgICc8ZGl2IGNsYXNzPVwidmlld2VyLWNvbnRhaW5lclwiPicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJ2aWV3ZXItY2FudmFzXCI+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInZpZXdlci1mb290ZXJcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJ2aWV3ZXItdGl0bGVcIj48L2Rpdj4nICtcbiAgICAgICAgJzx1bCBjbGFzcz1cInZpZXdlci10b29sYmFyXCI+JyArXG4gICAgICAgICAgJzxsaSBjbGFzcz1cInZpZXdlci16b29tLWluXCIgZGF0YS1hY3Rpb249XCJ6b29tLWluXCI+PC9saT4nICtcbiAgICAgICAgICAnPGxpIGNsYXNzPVwidmlld2VyLXpvb20tb3V0XCIgZGF0YS1hY3Rpb249XCJ6b29tLW91dFwiPjwvbGk+JyArXG4gICAgICAgICAgJzxsaSBjbGFzcz1cInZpZXdlci1vbmUtdG8tb25lXCIgZGF0YS1hY3Rpb249XCJvbmUtdG8tb25lXCI+PC9saT4nICtcbiAgICAgICAgICAnPGxpIGNsYXNzPVwidmlld2VyLXJlc2V0XCIgZGF0YS1hY3Rpb249XCJyZXNldFwiPjwvbGk+JyArXG4gICAgICAgICAgJzxsaSBjbGFzcz1cInZpZXdlci1wcmV2XCIgZGF0YS1hY3Rpb249XCJwcmV2XCI+PC9saT4nICtcbiAgICAgICAgICAnPGxpIGNsYXNzPVwidmlld2VyLXBsYXlcIiBkYXRhLWFjdGlvbj1cInBsYXlcIj48L2xpPicgK1xuICAgICAgICAgICc8bGkgY2xhc3M9XCJ2aWV3ZXItbmV4dFwiIGRhdGEtYWN0aW9uPVwibmV4dFwiPjwvbGk+JyArXG4gICAgICAgICAgJzxsaSBjbGFzcz1cInZpZXdlci1yb3RhdGUtbGVmdFwiIGRhdGEtYWN0aW9uPVwicm90YXRlLWxlZnRcIj48L2xpPicgK1xuICAgICAgICAgICc8bGkgY2xhc3M9XCJ2aWV3ZXItcm90YXRlLXJpZ2h0XCIgZGF0YS1hY3Rpb249XCJyb3RhdGUtcmlnaHRcIj48L2xpPicgK1xuICAgICAgICAgICc8bGkgY2xhc3M9XCJ2aWV3ZXItZmxpcC1ob3Jpem9udGFsXCIgZGF0YS1hY3Rpb249XCJmbGlwLWhvcml6b250YWxcIj48L2xpPicgK1xuICAgICAgICAgICc8bGkgY2xhc3M9XCJ2aWV3ZXItZmxpcC12ZXJ0aWNhbFwiIGRhdGEtYWN0aW9uPVwiZmxpcC12ZXJ0aWNhbFwiPjwvbGk+JyArXG4gICAgICAgICc8L3VsPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInZpZXdlci1uYXZiYXJcIj4nICtcbiAgICAgICAgICAnPHVsIGNsYXNzPVwidmlld2VyLWxpc3RcIj48L3VsPicgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAnPC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInZpZXdlci10b29sdGlwXCI+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInZpZXdlci1idXR0b25cIiBkYXRhLWFjdGlvbj1cIm1peFwiPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJ2aWV3ZXItcGxheWVyXCI+PC9kaXY+JyArXG4gICAgJzwvZGl2PidcbiAgKTtcblxuICAvLyBTYXZlIHRoZSBvdGhlciB2aWV3ZXJcbiAgVmlld2VyLm90aGVyID0gJC5mbi52aWV3ZXI7XG5cbiAgLy8gUmVnaXN0ZXIgYXMgalF1ZXJ5IHBsdWdpblxuICAkLmZuLnZpZXdlciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgdmFyIGRhdGEgPSAkdGhpcy5kYXRhKE5BTUVTUEFDRSk7XG4gICAgICB2YXIgZm47XG5cbiAgICAgIGlmICghZGF0YSkge1xuICAgICAgICBpZiAoL2Rlc3Ryb3l8aGlkZXxleGl0fHN0b3B8cmVzZXQvLnRlc3Qob3B0aW9ucykpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkdGhpcy5kYXRhKE5BTUVTUEFDRSwgKGRhdGEgPSBuZXcgVmlld2VyKHRoaXMsIG9wdGlvbnMpKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1N0cmluZyhvcHRpb25zKSAmJiAkLmlzRnVuY3Rpb24oZm4gPSBkYXRhW29wdGlvbnNdKSkge1xuICAgICAgICByZXN1bHQgPSBmbi5hcHBseShkYXRhLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBpc1VuZGVmaW5lZChyZXN1bHQpID8gdGhpcyA6IHJlc3VsdDtcbiAgfTtcblxuICAkLmZuLnZpZXdlci5Db25zdHJ1Y3RvciA9IFZpZXdlcjtcbiAgJC5mbi52aWV3ZXIuc2V0RGVmYXVsdHMgPSBWaWV3ZXIuc2V0RGVmYXVsdHM7XG5cbiAgLy8gTm8gY29uZmxpY3RcbiAgJC5mbi52aWV3ZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkLmZuLnZpZXdlciA9IFZpZXdlci5vdGhlcjtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxufSk7XG4iXX0=
