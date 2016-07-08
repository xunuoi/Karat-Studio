(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Defines a new instance of the rainyday.js.
 * @param options options element with script parameters
 * @param canvas to be used (if not defined a new one will be created)
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var RainyDay = (function () {
    function RainyDay(options, canvas) {
        _classCallCheck(this, RainyDay);

        if (this === window) {
            //if *this* is the window object, start over with a *new* object
            return new RainyDay(options, canvas);
        }

        this.img = options.image;
        var defaults = {
            opacity: 1,
            blur: 10,
            crop: [0, 0, this.img.naturalWidth, this.img.naturalHeight],
            enableSizeChange: true,
            parentElement: document.getElementsByTagName('body')[0],
            fps: 30,
            fillStyle: '#8ED6FF',
            enableCollisions: true,
            gravityThreshold: 3,
            gravityAngle: Math.PI / 2,
            gravityAngleVariance: 0,
            reflectionScaledownFactor: 5,
            reflectionDropMappingWidth: 200,
            reflectionDropMappingHeight: 200,
            width: this.img.clientWidth,
            height: this.img.clientHeight,
            position: 'absolute',
            top: 0,
            left: 0
        };

        // add the defaults to options
        for (var option in defaults) {
            if (typeof options[option] === 'undefined') {
                options[option] = defaults[option];
            }
        }
        //@Cloud debug
        this.options = options;

        this.drops = [];
        // prepare canvas elements
        this.canvas = canvas || this.prepareCanvas();
        this.prepareBackground();
        this.prepareGlass();

        // assume defaults
        this.reflection = this.REFLECTION_MINIATURE;
        this.trail = this.TRAIL_DROPS;
        this.gravity = this.GRAVITY_NON_LINEAR;
        this.collision = this.COLLISION_SIMPLE;

        // set polyfill of requestAnimationFrame
        this.setRequestAnimFrame();
    }

    /**
     * Defines a new raindrop object.
     * @param rainyday reference to the parent object
     * @param centerX x position of the center of this drop
     * @param centerY y position of the center of this drop
     * @param min minimum size of a drop
     * @param base base value for randomizing drop size
     */

    /**
     * Create the main canvas over a given element
     * @returns HTMLElement the canvas
     */

    _createClass(RainyDay, [{
        key: 'prepareCanvas',
        value: function prepareCanvas() {
            var canvas = document.createElement('canvas');
            canvas.style.position = this.options.position;
            canvas.style.top = this.options.top;
            canvas.style.left = this.options.left;
            canvas.width = this.options.width;
            canvas.height = this.options.height;
            this.options.parentElement.appendChild(canvas);
            if (this.options.enableSizeChange) {
                this.setResizeHandler();
            }
            //@Cloud debug add id
            this.options['id'] ? canvas['id'] = this.options['id'] : '';
            return canvas;
        }
    }, {
        key: 'setResizeHandler',
        value: function setResizeHandler() {
            // use setInterval if oneresize event already use by other.
            if (window.onresize !== null) {
                window.setInterval(this.checkSize.bind(this), 100);
            } else {
                window.onresize = this.checkSize.bind(this);
                window.onorientationchange = this.checkSize.bind(this);
            }
        }

        /**
         * Periodically check the size of the underlying element
         */
    }, {
        key: 'checkSize',
        value: function checkSize() {
            var clientWidth = this.img.clientWidth;
            var clientHeight = this.img.clientHeight;
            var clientOffsetLeft = this.img.offsetLeft;
            var clientOffsetTop = this.img.offsetTop;
            var canvasWidth = this.canvas.width;
            var canvasHeight = this.canvas.height;
            var canvasOffsetLeft = this.canvas.offsetLeft;
            var canvasOffsetTop = this.canvas.offsetTop;

            if (canvasWidth !== clientWidth || canvasHeight !== clientHeight) {
                this.canvas.width = clientWidth;
                this.canvas.height = clientHeight;
                this.prepareBackground();
                this.glass.width = this.canvas.width;
                this.glass.height = this.canvas.height;
                this.prepareReflections();
            }
            if (canvasOffsetLeft !== clientOffsetLeft || canvasOffsetTop !== clientOffsetTop) {
                this.canvas.offsetLeft = clientOffsetLeft;
                this.canvas.offsetTop = clientOffsetTop;
            }
        }

        /**
         * Start animation loop
         */
    }, {
        key: 'animateDrops',
        value: function animateDrops() {
            if (this.addDropCallback) {
                this.addDropCallback();
            }
            // |this.drops| array may be changed as we iterate over drops
            var dropsClone = this.drops.slice();
            var newDrops = [];
            for (var i = 0; i < dropsClone.length; ++i) {
                if (dropsClone[i].animate()) {
                    newDrops.push(dropsClone[i]);
                }
            }
            this.drops = newDrops;
            window.requestAnimFrame(this.animateDrops.bind(this));
        }

        /**
         * Polyfill for requestAnimationFrame
         */
    }, {
        key: 'setRequestAnimFrame',
        value: function setRequestAnimFrame() {
            var fps = this.options.fps;

            function _ref(callback) {
                window.setTimeout(callback, 1000 / fps);
            }

            window.requestAnimFrame = (function () {
                return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || _ref;
            })();
        }

        /**
         * Create the helper canvas for rendering raindrop reflections.
         */
    }, {
        key: 'prepareReflections',
        value: function prepareReflections() {
            this.reflected = document.createElement('canvas');
            this.reflected.width = this.canvas.width / this.options.reflectionScaledownFactor;
            this.reflected.height = this.canvas.height / this.options.reflectionScaledownFactor;
            var ctx = this.reflected.getContext('2d');
            ctx.drawImage(this.img, this.options.crop[0], this.options.crop[1], this.options.crop[2], this.options.crop[3], 0, 0, this.reflected.width, this.reflected.height);
        }

        /**
         * Create the glass canvas.
         */
    }, {
        key: 'prepareGlass',
        value: function prepareGlass() {
            this.glass = document.createElement('canvas');
            this.glass.width = this.canvas.width;
            this.glass.height = this.canvas.height;
            this.context = this.glass.getContext('2d');
        }

        /**
         * Main function for starting rain rendering.
         * @param presets list of presets to be applied
         * @param speed speed of the animation (if not provided or 0 static image will be generated)
         */
    }, {
        key: 'rain',
        value: function rain(presets, speed) {
            // prepare canvas for drop reflections
            if (this.reflection !== this.REFLECTION_NONE) {
                this.prepareReflections();
            }

            this.animateDrops();

            // animation
            this.presets = presets;

            this.PRIVATE_GRAVITY_FORCE_FACTOR_Y = this.options.fps * 0.001 / 25;
            this.PRIVATE_GRAVITY_FORCE_FACTOR_X = (Math.PI / 2 - this.options.gravityAngle) * (this.options.fps * 0.001) / 50;

            // prepare gravity matrix
            if (this.options.enableCollisions) {

                // calculate max radius of a drop to establish gravity matrix resolution
                var maxDropRadius = 0;
                for (var i = 0; i < presets.length; i++) {
                    if (presets[i][0] + presets[i][1] > maxDropRadius) {
                        maxDropRadius = Math.floor(presets[i][0] + presets[i][1]);
                    }
                }

                if (maxDropRadius > 0) {
                    // initialize the gravity matrix
                    var mwi = Math.ceil(this.canvas.width / maxDropRadius);
                    var mhi = Math.ceil(this.canvas.height / maxDropRadius);
                    this.matrix = new CollisionMatrix(mwi, mhi, maxDropRadius);
                } else {
                    this.options.enableCollisions = false;
                }
            }

            for (var i = 0; i < presets.length; i++) {
                if (!presets[i][3]) {
                    presets[i][3] = -1;
                }
            }

            var lastExecutionTime = 0;
            this.addDropCallback = (function () {
                var timestamp = new Date().getTime();
                if (timestamp - lastExecutionTime < speed) {
                    return;
                }
                lastExecutionTime = timestamp;
                var context = this.canvas.getContext('2d');
                context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                context.drawImage(this.background, 0, 0, this.canvas.width, this.canvas.height);
                // select matching preset
                var preset;
                for (var i = 0; i < presets.length; i++) {
                    if (presets[i][2] > 1 || presets[i][3] === -1) {
                        if (presets[i][3] !== 0) {
                            presets[i][3]--;
                            for (var y = 0; y < presets[i][2]; ++y) {
                                this.putDrop(new Drop(this, Math.random() * this.canvas.width, Math.random() * this.canvas.height, presets[i][0], presets[i][1]));
                            }
                        }
                    } else if (Math.random() < presets[i][2]) {
                        preset = presets[i];
                        break;
                    }
                }
                if (preset) {
                    this.putDrop(new Drop(this, Math.random() * this.canvas.width, Math.random() * this.canvas.height, preset[0], preset[1]));
                }
                context.save();
                context.globalAlpha = this.options.opacity;
                context.drawImage(this.glass, 0, 0, this.canvas.width, this.canvas.height);
                context.restore();
            }).bind(this);
        }

        /**
         * Adds a new raindrop to the animation.
         * @param drop drop object to be added to the animation
         */
    }, {
        key: 'putDrop',
        value: function putDrop(drop) {
            drop.draw();
            if (this.gravity && drop.r > this.options.gravityThreshold) {
                if (this.options.enableCollisions) {
                    this.matrix.update(drop);
                }
                this.drops.push(drop);
            }
        }

        /**
         * Clear the drop and remove from the list if applicable.
         * @drop to be cleared
         * @force force removal from the list
         * result if true animation of this drop should be stopped
         */
    }, {
        key: 'clearDrop',
        value: function clearDrop(drop, force) {
            var result = drop.clear(force);
            if (result) {
                var index = this.drops.indexOf(drop);
                if (index >= 0) {
                    this.drops.splice(index, 1);
                }
            }
            return result;
        }

        /**
         * TRAIL function: no trail at all
         */
    }, {
        key: 'TRAIL_NONE',
        value: function TRAIL_NONE() {}
        // nothing going on here

        /**
         * TRAIL function: trail of small drops (default)
         * @param drop raindrop object
         */

    }, {
        key: 'TRAIL_DROPS',
        value: function TRAIL_DROPS(drop) {
            if (!drop.trailY || drop.y - drop.trailY >= Math.random() * 100 * drop.r) {
                drop.trailY = drop.y;
                this.putDrop(new Drop(this, drop.x + (Math.random() * 2 - 1) * Math.random(), drop.y - drop.r - 5, Math.ceil(drop.r / 5), 0));
            }
        }

        /**
         * TRAIL function: trail of unblurred image
         * @param drop raindrop object
         */
    }, {
        key: 'TRAIL_SMUDGE',
        value: function TRAIL_SMUDGE(drop) {
            var y = drop.y - drop.r - 3;
            var x = drop.x - drop.r / 2 + Math.random() * 2;
            if (y < 0 || x < 0) {
                return;
            }
            this.context.drawImage(this.clearbackground, x, y, drop.r, 2, x, y, drop.r, 2);
        }

        /**
         * GRAVITY function: no gravity at all
         * @returns Boolean true if the animation is stopped
         */
    }, {
        key: 'GRAVITY_NONE',
        value: function GRAVITY_NONE() {
            return true;
        }

        /**
         * GRAVITY function: linear gravity
         * @param drop raindrop object
         * @returns Boolean true if the animation is stopped
         */
    }, {
        key: 'GRAVITY_LINEAR',
        value: function GRAVITY_LINEAR(drop) {
            if (this.clearDrop(drop)) {
                return true;
            }

            if (drop.yspeed) {
                drop.yspeed += this.PRIVATE_GRAVITY_FORCE_FACTOR_Y * Math.floor(drop.r);
                drop.xspeed += this.PRIVATE_GRAVITY_FORCE_FACTOR_X * Math.floor(drop.r);
            } else {
                drop.yspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_Y;
                drop.xspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_X;
            }

            drop.y += drop.yspeed;
            drop.draw();
            return false;
        }

        /**
         * GRAVITY function: non-linear gravity (default)
         * @param drop raindrop object
         * @returns Boolean true if the animation is stopped
         */
    }, {
        key: 'GRAVITY_NON_LINEAR',
        value: function GRAVITY_NON_LINEAR(drop) {
            if (this.clearDrop(drop)) {
                return true;
            }

            if (drop.collided) {
                drop.collided = false;
                drop.seed = Math.floor(drop.r * Math.random() * this.options.fps);
                drop.skipping = false;
                drop.slowing = false;
            } else if (!drop.seed || drop.seed < 0) {
                drop.seed = Math.floor(drop.r * Math.random() * this.options.fps);
                drop.skipping = drop.skipping === false ? true : false;
                drop.slowing = true;
            }

            drop.seed--;

            if (drop.yspeed) {
                if (drop.slowing) {
                    drop.yspeed /= 1.1;
                    drop.xspeed /= 1.1;
                    if (drop.yspeed < this.PRIVATE_GRAVITY_FORCE_FACTOR_Y) {
                        drop.slowing = false;
                    }
                } else if (drop.skipping) {
                    drop.yspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_Y;
                    drop.xspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_X;
                } else {
                    drop.yspeed += 1 * this.PRIVATE_GRAVITY_FORCE_FACTOR_Y * Math.floor(drop.r);
                    drop.xspeed += 1 * this.PRIVATE_GRAVITY_FORCE_FACTOR_X * Math.floor(drop.r);
                }
            } else {
                drop.yspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_Y;
                drop.xspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_X;
            }

            if (this.options.gravityAngleVariance !== 0) {
                drop.xspeed += (Math.random() * 2 - 1) * drop.yspeed * this.options.gravityAngleVariance;
            }

            drop.y += drop.yspeed;
            drop.x += drop.xspeed;

            drop.draw();
            return false;
        }

        /**
         * Utility function to return positive min value
         * @param val1 first number
         * @param val2 second number
         */
    }, {
        key: 'positiveMin',
        value: function positiveMin(val1, val2) {
            var result = 0;
            if (val1 < val2) {
                if (val1 <= 0) {
                    result = val2;
                } else {
                    result = val1;
                }
            } else {
                if (val2 <= 0) {
                    result = val1;
                } else {
                    result = val2;
                }
            }
            return result <= 0 ? 1 : result;
        }

        /**
         * REFLECTION function: no reflection at all
         */
    }, {
        key: 'REFLECTION_NONE',
        value: function REFLECTION_NONE() {
            this.context.fillStyle = this.options.fillStyle;
            this.context.fill();
        }

        /**
         * REFLECTION function: miniature reflection (default)
         * @param drop raindrop object
         */
    }, {
        key: 'REFLECTION_MINIATURE',
        value: function REFLECTION_MINIATURE(drop) {
            var sx = Math.max((drop.x - this.options.reflectionDropMappingWidth) / this.options.reflectionScaledownFactor, 0);
            var sy = Math.max((drop.y - this.options.reflectionDropMappingHeight) / this.options.reflectionScaledownFactor, 0);
            var sw = this.positiveMin(this.options.reflectionDropMappingWidth * 2 / this.options.reflectionScaledownFactor, this.reflected.width - sx);
            var sh = this.positiveMin(this.options.reflectionDropMappingHeight * 2 / this.options.reflectionScaledownFactor, this.reflected.height - sy);
            var dx = Math.max(drop.x - 1.1 * drop.r, 0);
            var dy = Math.max(drop.y - 1.1 * drop.r, 0);
            this.context.drawImage(this.reflected, sx, sy, sw, sh, dx, dy, drop.r * 2, drop.r * 2);
        }

        /**
         * COLLISION function: default collision implementation
         * @param drop one of the drops colliding
         * @param collisions list of potential collisions
         */
    }, {
        key: 'COLLISION_SIMPLE',
        value: function COLLISION_SIMPLE(drop, collisions) {
            var item = collisions;
            var drop2;
            while (item != null) {
                var p = item.drop;
                if (Math.sqrt(Math.pow(drop.x - p.x, 2) + Math.pow(drop.y - p.y, 2)) < drop.r + p.r) {
                    drop2 = p;
                    break;
                }
                item = item.next;
            }

            if (!drop2) {
                return;
            }

            // rename so that we're dealing with low/high drops
            var higher, lower;
            if (drop.y > drop2.y) {
                higher = drop;
                lower = drop2;
            } else {
                higher = drop2;
                lower = drop;
            }

            this.clearDrop(lower);
            // force stopping the second drop
            this.clearDrop(higher, true);
            this.matrix.remove(higher);
            lower.draw();

            lower.colliding = higher;
            lower.collided = true;
        }

        /**
         * Resizes canvas, draws original image and applies blurring algorithm.
         */
    }, {
        key: 'prepareBackground',
        value: function prepareBackground() {
            this.background = document.createElement('canvas');
            this.background.width = this.canvas.width;
            this.background.height = this.canvas.height;

            this.clearbackground = document.createElement('canvas');
            this.clearbackground.width = this.canvas.width;
            this.clearbackground.height = this.canvas.height;

            var context = this.background.getContext('2d');
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            context.drawImage(this.img, this.options.crop[0], this.options.crop[1], this.options.crop[2], this.options.crop[3], 0, 0, this.canvas.width, this.canvas.height);

            context = this.clearbackground.getContext('2d');
            context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            context.drawImage(this.img, this.options.crop[0], this.options.crop[1], this.options.crop[2], this.options.crop[3], 0, 0, this.canvas.width, this.canvas.height);

            if (!isNaN(this.options.blur) && this.options.blur >= 1) {
                this.stackBlurCanvasRGB(this.canvas.width, this.canvas.height, this.options.blur);
            }
        }

        /**
         * Implements the Stack Blur Algorithm (@see http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html).
         * @param width width of the canvas
         * @param height height of the canvas
         * @param radius blur radius
         */
    }, {
        key: 'stackBlurCanvasRGB',
        value: function stackBlurCanvasRGB(width, height, radius) {

            var shgTable = [[0, 9], [1, 11], [2, 12], [3, 13], [5, 14], [7, 15], [11, 16], [15, 17], [22, 18], [31, 19], [45, 20], [63, 21], [90, 22], [127, 23], [181, 24]];

            var mulTable = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];

            radius |= 0;

            var context = this.background.getContext('2d');
            var imageData = context.getImageData(0, 0, width, height);
            var pixels = imageData.data;
            var x, y, i, p, yp, yi, yw, rSum, gSum, bSum, rOutSum, gOutSum, bOutSum, rInSum, gInSum, bInSum, pr, pg, pb, rbs;
            var radiusPlus1 = radius + 1;
            var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

            var stackStart = new BlurStack();
            var stackEnd = new BlurStack();
            var stack = stackStart;
            for (i = 1; i < 2 * radius + 1; i++) {
                stack = stack.next = new BlurStack();
                if (i === radiusPlus1) {
                    stackEnd = stack;
                }
            }
            stack.next = stackStart;
            var stackIn = null;
            var stackOut = null;

            yw = yi = 0;

            var mulSum = mulTable[radius];
            var shgSum;
            for (var ssi = 0; ssi < shgTable.length; ++ssi) {
                if (radius <= shgTable[ssi][0]) {
                    shgSum = shgTable[ssi - 1][1];
                    break;
                }
            }

            for (y = 0; y < height; y++) {
                rInSum = gInSum = bInSum = rSum = gSum = bSum = 0;

                rOutSum = radiusPlus1 * (pr = pixels[yi]);
                gOutSum = radiusPlus1 * (pg = pixels[yi + 1]);
                bOutSum = radiusPlus1 * (pb = pixels[yi + 2]);

                rSum += sumFactor * pr;
                gSum += sumFactor * pg;
                bSum += sumFactor * pb;

                stack = stackStart;

                for (i = 0; i < radiusPlus1; i++) {
                    stack.r = pr;
                    stack.g = pg;
                    stack.b = pb;
                    stack = stack.next;
                }

                for (i = 1; i < radiusPlus1; i++) {
                    p = yi + ((width - 1 < i ? width - 1 : i) << 2);
                    rSum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
                    gSum += (stack.g = pg = pixels[p + 1]) * rbs;
                    bSum += (stack.b = pb = pixels[p + 2]) * rbs;

                    rInSum += pr;
                    gInSum += pg;
                    bInSum += pb;

                    stack = stack.next;
                }

                stackIn = stackStart;
                stackOut = stackEnd;
                for (x = 0; x < width; x++) {
                    pixels[yi] = rSum * mulSum >> shgSum;
                    pixels[yi + 1] = gSum * mulSum >> shgSum;
                    pixels[yi + 2] = bSum * mulSum >> shgSum;

                    rSum -= rOutSum;
                    gSum -= gOutSum;
                    bSum -= bOutSum;

                    rOutSum -= stackIn.r;
                    gOutSum -= stackIn.g;
                    bOutSum -= stackIn.b;

                    p = yw + ((p = x + radius + 1) < width - 1 ? p : width - 1) << 2;

                    rInSum += stackIn.r = pixels[p];
                    gInSum += stackIn.g = pixels[p + 1];
                    bInSum += stackIn.b = pixels[p + 2];

                    rSum += rInSum;
                    gSum += gInSum;
                    bSum += bInSum;

                    stackIn = stackIn.next;

                    rOutSum += pr = stackOut.r;
                    gOutSum += pg = stackOut.g;
                    bOutSum += pb = stackOut.b;

                    rInSum -= pr;
                    gInSum -= pg;
                    bInSum -= pb;

                    stackOut = stackOut.next;

                    yi += 4;
                }
                yw += width;
            }

            for (x = 0; x < width; x++) {
                gInSum = bInSum = rInSum = gSum = bSum = rSum = 0;

                yi = x << 2;
                rOutSum = radiusPlus1 * (pr = pixels[yi]);
                gOutSum = radiusPlus1 * (pg = pixels[yi + 1]);
                bOutSum = radiusPlus1 * (pb = pixels[yi + 2]);

                rSum += sumFactor * pr;
                gSum += sumFactor * pg;
                bSum += sumFactor * pb;

                stack = stackStart;

                for (i = 0; i < radiusPlus1; i++) {
                    stack.r = pr;
                    stack.g = pg;
                    stack.b = pb;
                    stack = stack.next;
                }

                yp = width;

                for (i = 1; i < radiusPlus1; i++) {
                    yi = yp + x << 2;

                    rSum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
                    gSum += (stack.g = pg = pixels[yi + 1]) * rbs;
                    bSum += (stack.b = pb = pixels[yi + 2]) * rbs;

                    rInSum += pr;
                    gInSum += pg;
                    bInSum += pb;

                    stack = stack.next;

                    if (i < height - 1) {
                        yp += width;
                    }
                }

                yi = x;
                stackIn = stackStart;
                stackOut = stackEnd;
                for (y = 0; y < height; y++) {
                    p = yi << 2;
                    pixels[p] = rSum * mulSum >> shgSum;
                    pixels[p + 1] = gSum * mulSum >> shgSum;
                    pixels[p + 2] = bSum * mulSum >> shgSum;

                    rSum -= rOutSum;
                    gSum -= gOutSum;
                    bSum -= bOutSum;

                    rOutSum -= stackIn.r;
                    gOutSum -= stackIn.g;
                    bOutSum -= stackIn.b;

                    p = x + ((p = y + radiusPlus1) < height - 1 ? p : height - 1) * width << 2;

                    rSum += rInSum += stackIn.r = pixels[p];
                    gSum += gInSum += stackIn.g = pixels[p + 1];
                    bSum += bInSum += stackIn.b = pixels[p + 2];

                    stackIn = stackIn.next;

                    rOutSum += pr = stackOut.r;
                    gOutSum += pg = stackOut.g;
                    bOutSum += pb = stackOut.b;

                    rInSum -= pr;
                    gInSum -= pg;
                    bInSum -= pb;

                    stackOut = stackOut.next;

                    yi += width;
                }
            }

            context.putImageData(imageData, 0, 0);
        }
    }]);

    return RainyDay;
})();

var Drop = (function () {
    function Drop(rainyday, centerX, centerY, min, base) {
        _classCallCheck(this, Drop);

        this.x = Math.floor(centerX);
        this.y = Math.floor(centerY);
        this.r = Math.random() * base + min;
        this.rainyday = rainyday;
        this.context = rainyday.context;
        this.reflection = rainyday.reflected;
    }

    /**
     * Defines a new helper object for Stack Blur Algorithm.
     */

    /**
     * Draws a raindrop on canvas at the current position.
     */

    _createClass(Drop, [{
        key: 'draw',
        value: function draw() {
            this.context.save();
            this.context.beginPath();

            var orgR = this.r;
            this.r = 0.95 * this.r;
            if (this.r < 3) {
                this.context.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
                this.context.closePath();
            } else if (this.colliding || this.yspeed > 2) {
                if (this.colliding) {
                    var collider = this.colliding;
                    this.r = 1.001 * (this.r > collider.r ? this.r : collider.r);
                    this.x += collider.x - this.x;
                    this.colliding = null;
                }

                var yr = 1 + 0.1 * this.yspeed;
                this.context.moveTo(this.x - this.r / yr, this.y);
                this.context.bezierCurveTo(this.x - this.r, this.y - this.r * 2, this.x + this.r, this.y - this.r * 2, this.x + this.r / yr, this.y);
                this.context.bezierCurveTo(this.x + this.r, this.y + yr * this.r, this.x - this.r, this.y + yr * this.r, this.x - this.r / yr, this.y);
            } else {
                this.context.arc(this.x, this.y, this.r * 0.9, 0, Math.PI * 2, true);
                this.context.closePath();
            }

            this.context.clip();

            this.r = orgR;

            if (this.rainyday.reflection) {
                this.rainyday.reflection(this);
            }

            this.context.restore();
        }

        /**
         * Clears the raindrop region.
         * @param force force stop
         * @returns Boolean true if the animation is stopped
         */
    }, {
        key: 'clear',
        value: function clear(force) {
            this.context.clearRect(this.x - this.r - 1, this.y - this.r - 2, 2 * this.r + 2, 2 * this.r + 2);
            if (force) {
                this.terminate = true;
                return true;
            }
            if (this.y - this.r > this.rainyday.canvas.height || this.x - this.r > this.rainyday.canvas.width || this.x + this.r < 0) {
                // over edge so stop this drop
                return true;
            }
            return false;
        }

        /**
         * Moves the raindrop to a new position according to the gravity.
         */
    }, {
        key: 'animate',
        value: function animate() {
            if (this.terminate) {
                return false;
            }
            var stopped = this.rainyday.gravity(this);
            if (!stopped && this.rainyday.trail) {
                this.rainyday.trail(this);
            }
            if (this.rainyday.options.enableCollisions) {
                var collisions = this.rainyday.matrix.update(this, stopped);
                if (collisions) {
                    this.rainyday.collision(this, collisions);
                }
            }
            return !stopped || this.terminate;
        }
    }]);

    return Drop;
})();

var BlurStack = function BlurStack() {
    _classCallCheck(this, BlurStack);

    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.next = null;
}
/**
 * Defines a gravity matrix object which handles collision detection.
 * @param x number of columns in the matrix
 * @param y number of rows in the matrix
 * @param r grid size
 */
;

var CollisionMatrix = (function () {
    function CollisionMatrix(x, y, r) {
        _classCallCheck(this, CollisionMatrix);

        this.resolution = r;
        this.xc = x;
        this.yc = y;
        this.matrix = new Array(x);
        for (var i = 0; i <= x + 5; i++) {
            this.matrix[i] = new Array(y);
            for (var j = 0; j <= y + 5; ++j) {
                this.matrix[i][j] = new DropItem(null);
            }
        }
    }

    /**
     * Defines a linked list item.
     */

    /**
     * Updates position of the given drop on the collision matrix.
     * @param drop raindrop to be positioned/repositioned
     * @param forceDelete if true the raindrop will be removed from the matrix
     * @returns collisions if any
     */

    _createClass(CollisionMatrix, [{
        key: 'update',
        value: function update(drop, forceDelete) {
            if (drop.gid) {
                if (!this.matrix[drop.gmx] || !this.matrix[drop.gmx][drop.gmy]) {
                    return null;
                }
                this.matrix[drop.gmx][drop.gmy].remove(drop);
                if (forceDelete) {
                    return null;
                }

                drop.gmx = Math.floor(drop.x / this.resolution);
                drop.gmy = Math.floor(drop.y / this.resolution);
                if (!this.matrix[drop.gmx] || !this.matrix[drop.gmx][drop.gmy]) {
                    return null;
                }
                this.matrix[drop.gmx][drop.gmy].add(drop);

                var collisions = this.collisions(drop);
                if (collisions && collisions.next != null) {
                    return collisions.next;
                }
            } else {
                drop.gid = Math.random().toString(36).substr(2, 9);
                drop.gmx = Math.floor(drop.x / this.resolution);
                drop.gmy = Math.floor(drop.y / this.resolution);
                if (!this.matrix[drop.gmx] || !this.matrix[drop.gmx][drop.gmy]) {
                    return null;
                }

                this.matrix[drop.gmx][drop.gmy].add(drop);
            }
            return null;
        }

        /**
         * Looks for collisions with the given raindrop.
         * @param drop raindrop to be checked
         * @returns DropItem list of drops that collide with it
         */
    }, {
        key: 'collisions',
        value: function collisions(drop) {
            var item = new DropItem(null);
            var first = item;

            item = this.addAll(item, drop.gmx - 1, drop.gmy + 1);
            item = this.addAll(item, drop.gmx, drop.gmy + 1);
            item = this.addAll(item, drop.gmx + 1, drop.gmy + 1);

            return first;
        }

        /**
         * Appends all found drop at a given location to the given item.
         * @param to item to which the results will be appended to
         * @param x x position in the matrix
         * @param y y position in the matrix
         * @returns last discovered item on the list
         */
    }, {
        key: 'addAll',
        value: function addAll(to, x, y) {
            if (x > 0 && y > 0 && x < this.xc && y < this.yc) {
                var items = this.matrix[x][y];
                while (items.next != null) {
                    items = items.next;
                    to.next = new DropItem(items.drop);
                    to = to.next;
                }
            }
            return to;
        }

        /**
         * Removed the drop from its current position
         * @param drop to be removed
         */
    }, {
        key: 'remove',
        value: function remove(drop) {
            this.matrix[drop.gmx][drop.gmy].remove(drop);
        }
    }]);

    return CollisionMatrix;
})();

var DropItem = (function () {
    function DropItem(drop) {
        _classCallCheck(this, DropItem);

        this.drop = drop;
        this.next = null;
    }

    /**
     * Adds the raindrop to the end of the list.
     * @param drop raindrop to be added
     */

    _createClass(DropItem, [{
        key: 'add',
        value: function add(drop) {
            var item = this;
            while (item.next != null) {
                item = item.next;
            }
            item.next = new DropItem(drop);
        }

        /**
         * Removes the raindrop from the list.
         * @param drop raindrop to be removed
         */
    }, {
        key: 'remove',
        value: function remove(drop) {
            var item = this;
            var prevItem = null;
            while (item.next != null) {
                prevItem = item;
                item = item.next;
                if (item.drop.gid === drop.gid) {
                    prevItem.next = item.next;
                }
            }
        }
    }]);

    return DropItem;
})();

exports.RainyDay = RainyDay;
},{}],2:[function(require,module,exports){
/**
 * ES6 FILE FOR DancerController 
 * 2015-08-25 09:08:43
 */

// import 'jquery/dist/jquery'
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _rainyday = require('rainyday');

var rainList = undefined,
    canvas = undefined,
    dancer = undefined;

function _runRain() {
    var engine = new _rainyday.RainyDay({
        id: 'myDancer',
        element: img_dancer,
        image: img_dancer,
        parentElement: dance_ctn,
        blur: 10,
        opacity: 1,
        zIndex: -1,
        fps: 30
    });
    // engine.rain([ [1, 2, 8000] ]);
    engine.rain([[3, 3, 0.88], [5, 5, 0.9], [6, 2, 1]], 100);

    var engine1 = new _rainyday.RainyDay({
        id: 'myDancer_1',
        element: img_dancer_1,
        image: img_dancer_1,
        parentElement: dance_ctn,
        blur: 10,
        opacity: 1,
        zIndex: -2,
        fps: 30
    });

    engine1.rain([[3, 3, 0.88], [5, 5, 0.9], [6, 2, 1]], 100);

    return [engine, engine1];
}

var Dancer = (function () {
    function Dancer() {
        _classCallCheck(this, Dancer);

        this.cacheEle();
        this.initNavMenu();
        this.initRain();
    }

    _createClass(Dancer, [{
        key: 'initRain',
        value: function initRain() {
            window.onload = function () {
                rainList = _runRain();
                canvas = rainList[0].canvas;

                dancer.slideDancer(rainList);
            };
        }
    }, {
        key: 'initNavMenu',
        value: function initNavMenu() {
            this.$navMenu.on('click', function (event) {
                dancer.$navMenu.removeClass('active');
                $(this).addClass('active');
            });
        }
    }, {
        key: 'transEnd',
        value: function transEnd(tar, cbfn, isOnce) {
            function _ref(event) {
                cbfn();
            }

            var $tar = $(tar);
            var END_NAMES = {
                "Moz": "transitionEnd",
                "webkit": "webkitTransitionEnd",
                "ms": "MSTransitionEnd",
                "O": "oTransitionEnd"
            };

            if (!isOnce) {
                _bind($tar);
            } else {
                _onceBind($tar);
            }

            function _bind($target) {
                $.each(END_NAMES, function (k, v) {
                    $target.on(v, _ref);
                });
            }
            function _onceBind($target) {
                $.each(END_NAMES, function (k, v) {
                    $target.one(v, function (event) {
                        cbfn();
                        $target.unbind(v, cbfn);
                        // $tar.get(0).removeEventListener(cbfn);
                    });
                });
            }
        }
    }, {
        key: 'refreshImg',
        value: function refreshImg() {
            var $can = $(canvas);

            function _ref2(event) {
                $can.css('opacity', 1);
            }

            this.transEnd($can, function () {
                rain.refreshImg('/static/cloud/img/index/1.jpg', _ref2);
            }, true);

            $can.css('opacity', 0.6);
        }
    }, {
        key: 'slideDancer',
        value: function slideDancer() {
            var $can = $(rainList[0].canvas),
                $can1 = $(rainList[1].canvas);

            $can1.addClass('opacity_0');

            function _ref3() {
                $can.toggleClass('opacity_0');
                $can1.toggleClass('opacity_0');

                _cycle();
            }

            function _cycle() {
                setTimeout(_ref3, 6000);
            }

            _cycle();
        }
    }, {
        key: 'cacheEle',
        value: function cacheEle() {
            this.$nav = $('.main-nav');
            this.$navMenu = this.$nav.find('a');
        }
    }]);

    return Dancer;
})();

$(function () {
    dancer = new Dancer();
});

exports.Dancer = Dancer;
},{"rainyday":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vcmFpbnlkYXkuanMiLCJzdGF0aWMvLnRtcC9kYW5jZXIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogRGVmaW5lcyBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgcmFpbnlkYXkuanMuXG4gKiBAcGFyYW0gb3B0aW9ucyBvcHRpb25zIGVsZW1lbnQgd2l0aCBzY3JpcHQgcGFyYW1ldGVyc1xuICogQHBhcmFtIGNhbnZhcyB0byBiZSB1c2VkIChpZiBub3QgZGVmaW5lZCBhIG5ldyBvbmUgd2lsbCBiZSBjcmVhdGVkKVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBSYWlueURheSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUmFpbnlEYXkob3B0aW9ucywgY2FudmFzKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBSYWlueURheSk7XG5cbiAgICAgICAgaWYgKHRoaXMgPT09IHdpbmRvdykge1xuICAgICAgICAgICAgLy9pZiAqdGhpcyogaXMgdGhlIHdpbmRvdyBvYmplY3QsIHN0YXJ0IG92ZXIgd2l0aCBhICpuZXcqIG9iamVjdFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSYWlueURheShvcHRpb25zLCBjYW52YXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbWcgPSBvcHRpb25zLmltYWdlO1xuICAgICAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgICAgYmx1cjogMTAsXG4gICAgICAgICAgICBjcm9wOiBbMCwgMCwgdGhpcy5pbWcubmF0dXJhbFdpZHRoLCB0aGlzLmltZy5uYXR1cmFsSGVpZ2h0XSxcbiAgICAgICAgICAgIGVuYWJsZVNpemVDaGFuZ2U6IHRydWUsXG4gICAgICAgICAgICBwYXJlbnRFbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLFxuICAgICAgICAgICAgZnBzOiAzMCxcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyM4RUQ2RkYnLFxuICAgICAgICAgICAgZW5hYmxlQ29sbGlzaW9uczogdHJ1ZSxcbiAgICAgICAgICAgIGdyYXZpdHlUaHJlc2hvbGQ6IDMsXG4gICAgICAgICAgICBncmF2aXR5QW5nbGU6IE1hdGguUEkgLyAyLFxuICAgICAgICAgICAgZ3Jhdml0eUFuZ2xlVmFyaWFuY2U6IDAsXG4gICAgICAgICAgICByZWZsZWN0aW9uU2NhbGVkb3duRmFjdG9yOiA1LFxuICAgICAgICAgICAgcmVmbGVjdGlvbkRyb3BNYXBwaW5nV2lkdGg6IDIwMCxcbiAgICAgICAgICAgIHJlZmxlY3Rpb25Ecm9wTWFwcGluZ0hlaWdodDogMjAwLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuaW1nLmNsaWVudFdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmltZy5jbGllbnRIZWlnaHQsXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIGxlZnQ6IDBcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBhZGQgdGhlIGRlZmF1bHRzIHRvIG9wdGlvbnNcbiAgICAgICAgZm9yICh2YXIgb3B0aW9uIGluIGRlZmF1bHRzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnNbb3B0aW9uXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zW29wdGlvbl0gPSBkZWZhdWx0c1tvcHRpb25dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vQENsb3VkIGRlYnVnXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy5kcm9wcyA9IFtdO1xuICAgICAgICAvLyBwcmVwYXJlIGNhbnZhcyBlbGVtZW50c1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcyB8fCB0aGlzLnByZXBhcmVDYW52YXMoKTtcbiAgICAgICAgdGhpcy5wcmVwYXJlQmFja2dyb3VuZCgpO1xuICAgICAgICB0aGlzLnByZXBhcmVHbGFzcygpO1xuXG4gICAgICAgIC8vIGFzc3VtZSBkZWZhdWx0c1xuICAgICAgICB0aGlzLnJlZmxlY3Rpb24gPSB0aGlzLlJFRkxFQ1RJT05fTUlOSUFUVVJFO1xuICAgICAgICB0aGlzLnRyYWlsID0gdGhpcy5UUkFJTF9EUk9QUztcbiAgICAgICAgdGhpcy5ncmF2aXR5ID0gdGhpcy5HUkFWSVRZX05PTl9MSU5FQVI7XG4gICAgICAgIHRoaXMuY29sbGlzaW9uID0gdGhpcy5DT0xMSVNJT05fU0lNUExFO1xuXG4gICAgICAgIC8vIHNldCBwb2x5ZmlsbCBvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgICAgdGhpcy5zZXRSZXF1ZXN0QW5pbUZyYW1lKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVmaW5lcyBhIG5ldyByYWluZHJvcCBvYmplY3QuXG4gICAgICogQHBhcmFtIHJhaW55ZGF5IHJlZmVyZW5jZSB0byB0aGUgcGFyZW50IG9iamVjdFxuICAgICAqIEBwYXJhbSBjZW50ZXJYIHggcG9zaXRpb24gb2YgdGhlIGNlbnRlciBvZiB0aGlzIGRyb3BcbiAgICAgKiBAcGFyYW0gY2VudGVyWSB5IHBvc2l0aW9uIG9mIHRoZSBjZW50ZXIgb2YgdGhpcyBkcm9wXG4gICAgICogQHBhcmFtIG1pbiBtaW5pbXVtIHNpemUgb2YgYSBkcm9wXG4gICAgICogQHBhcmFtIGJhc2UgYmFzZSB2YWx1ZSBmb3IgcmFuZG9taXppbmcgZHJvcCBzaXplXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdGhlIG1haW4gY2FudmFzIG92ZXIgYSBnaXZlbiBlbGVtZW50XG4gICAgICogQHJldHVybnMgSFRNTEVsZW1lbnQgdGhlIGNhbnZhc1xuICAgICAqL1xuXG4gICAgX2NyZWF0ZUNsYXNzKFJhaW55RGF5LCBbe1xuICAgICAgICBrZXk6ICdwcmVwYXJlQ2FudmFzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHByZXBhcmVDYW52YXMoKSB7XG4gICAgICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSB0aGlzLm9wdGlvbnMucG9zaXRpb247XG4gICAgICAgICAgICBjYW52YXMuc3R5bGUudG9wID0gdGhpcy5vcHRpb25zLnRvcDtcbiAgICAgICAgICAgIGNhbnZhcy5zdHlsZS5sZWZ0ID0gdGhpcy5vcHRpb25zLmxlZnQ7XG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSB0aGlzLm9wdGlvbnMud2lkdGg7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gdGhpcy5vcHRpb25zLmhlaWdodDtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmVuYWJsZVNpemVDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFJlc2l6ZUhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vQENsb3VkIGRlYnVnIGFkZCBpZFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zWydpZCddID8gY2FudmFzWydpZCddID0gdGhpcy5vcHRpb25zWydpZCddIDogJyc7XG4gICAgICAgICAgICByZXR1cm4gY2FudmFzO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzZXRSZXNpemVIYW5kbGVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldFJlc2l6ZUhhbmRsZXIoKSB7XG4gICAgICAgICAgICAvLyB1c2Ugc2V0SW50ZXJ2YWwgaWYgb25lcmVzaXplIGV2ZW50IGFscmVhZHkgdXNlIGJ5IG90aGVyLlxuICAgICAgICAgICAgaWYgKHdpbmRvdy5vbnJlc2l6ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLmNoZWNrU2l6ZS5iaW5kKHRoaXMpLCAxMDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cub25yZXNpemUgPSB0aGlzLmNoZWNrU2l6ZS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5vbm9yaWVudGF0aW9uY2hhbmdlID0gdGhpcy5jaGVja1NpemUuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQZXJpb2RpY2FsbHkgY2hlY2sgdGhlIHNpemUgb2YgdGhlIHVuZGVybHlpbmcgZWxlbWVudFxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2NoZWNrU2l6ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjaGVja1NpemUoKSB7XG4gICAgICAgICAgICB2YXIgY2xpZW50V2lkdGggPSB0aGlzLmltZy5jbGllbnRXaWR0aDtcbiAgICAgICAgICAgIHZhciBjbGllbnRIZWlnaHQgPSB0aGlzLmltZy5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICB2YXIgY2xpZW50T2Zmc2V0TGVmdCA9IHRoaXMuaW1nLm9mZnNldExlZnQ7XG4gICAgICAgICAgICB2YXIgY2xpZW50T2Zmc2V0VG9wID0gdGhpcy5pbWcub2Zmc2V0VG9wO1xuICAgICAgICAgICAgdmFyIGNhbnZhc1dpZHRoID0gdGhpcy5jYW52YXMud2lkdGg7XG4gICAgICAgICAgICB2YXIgY2FudmFzSGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0O1xuICAgICAgICAgICAgdmFyIGNhbnZhc09mZnNldExlZnQgPSB0aGlzLmNhbnZhcy5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgdmFyIGNhbnZhc09mZnNldFRvcCA9IHRoaXMuY2FudmFzLm9mZnNldFRvcDtcblxuICAgICAgICAgICAgaWYgKGNhbnZhc1dpZHRoICE9PSBjbGllbnRXaWR0aCB8fCBjYW52YXNIZWlnaHQgIT09IGNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gY2xpZW50V2lkdGg7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgICAgIHRoaXMucHJlcGFyZUJhY2tncm91bmQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsYXNzLndpZHRoID0gdGhpcy5jYW52YXMud2lkdGg7XG4gICAgICAgICAgICAgICAgdGhpcy5nbGFzcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwYXJlUmVmbGVjdGlvbnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjYW52YXNPZmZzZXRMZWZ0ICE9PSBjbGllbnRPZmZzZXRMZWZ0IHx8IGNhbnZhc09mZnNldFRvcCAhPT0gY2xpZW50T2Zmc2V0VG9wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMub2Zmc2V0TGVmdCA9IGNsaWVudE9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMub2Zmc2V0VG9wID0gY2xpZW50T2Zmc2V0VG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXJ0IGFuaW1hdGlvbiBsb29wXG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYW5pbWF0ZURyb3BzJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFuaW1hdGVEcm9wcygpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmFkZERyb3BDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRHJvcENhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB8dGhpcy5kcm9wc3wgYXJyYXkgbWF5IGJlIGNoYW5nZWQgYXMgd2UgaXRlcmF0ZSBvdmVyIGRyb3BzXG4gICAgICAgICAgICB2YXIgZHJvcHNDbG9uZSA9IHRoaXMuZHJvcHMuc2xpY2UoKTtcbiAgICAgICAgICAgIHZhciBuZXdEcm9wcyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcm9wc0Nsb25lLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRyb3BzQ2xvbmVbaV0uYW5pbWF0ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0Ryb3BzLnB1c2goZHJvcHNDbG9uZVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kcm9wcyA9IG5ld0Ryb3BzO1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltRnJhbWUodGhpcy5hbmltYXRlRHJvcHMuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUG9seWZpbGwgZm9yIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3NldFJlcXVlc3RBbmltRnJhbWUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0UmVxdWVzdEFuaW1GcmFtZSgpIHtcbiAgICAgICAgICAgIHZhciBmcHMgPSB0aGlzLm9wdGlvbnMuZnBzO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBfcmVmKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyBmcHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1GcmFtZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IF9yZWY7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSB0aGUgaGVscGVyIGNhbnZhcyBmb3IgcmVuZGVyaW5nIHJhaW5kcm9wIHJlZmxlY3Rpb25zLlxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3ByZXBhcmVSZWZsZWN0aW9ucycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwcmVwYXJlUmVmbGVjdGlvbnMoKSB7XG4gICAgICAgICAgICB0aGlzLnJlZmxlY3RlZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgICAgdGhpcy5yZWZsZWN0ZWQud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMub3B0aW9ucy5yZWZsZWN0aW9uU2NhbGVkb3duRmFjdG9yO1xuICAgICAgICAgICAgdGhpcy5yZWZsZWN0ZWQuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0IC8gdGhpcy5vcHRpb25zLnJlZmxlY3Rpb25TY2FsZWRvd25GYWN0b3I7XG4gICAgICAgICAgICB2YXIgY3R4ID0gdGhpcy5yZWZsZWN0ZWQuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIHRoaXMub3B0aW9ucy5jcm9wWzBdLCB0aGlzLm9wdGlvbnMuY3JvcFsxXSwgdGhpcy5vcHRpb25zLmNyb3BbMl0sIHRoaXMub3B0aW9ucy5jcm9wWzNdLCAwLCAwLCB0aGlzLnJlZmxlY3RlZC53aWR0aCwgdGhpcy5yZWZsZWN0ZWQuaGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGUgdGhlIGdsYXNzIGNhbnZhcy5cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdwcmVwYXJlR2xhc3MnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcHJlcGFyZUdsYXNzKCkge1xuICAgICAgICAgICAgdGhpcy5nbGFzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgICAgdGhpcy5nbGFzcy53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5nbGFzcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQgPSB0aGlzLmdsYXNzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogTWFpbiBmdW5jdGlvbiBmb3Igc3RhcnRpbmcgcmFpbiByZW5kZXJpbmcuXG4gICAgICAgICAqIEBwYXJhbSBwcmVzZXRzIGxpc3Qgb2YgcHJlc2V0cyB0byBiZSBhcHBsaWVkXG4gICAgICAgICAqIEBwYXJhbSBzcGVlZCBzcGVlZCBvZiB0aGUgYW5pbWF0aW9uIChpZiBub3QgcHJvdmlkZWQgb3IgMCBzdGF0aWMgaW1hZ2Ugd2lsbCBiZSBnZW5lcmF0ZWQpXG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmFpbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByYWluKHByZXNldHMsIHNwZWVkKSB7XG4gICAgICAgICAgICAvLyBwcmVwYXJlIGNhbnZhcyBmb3IgZHJvcCByZWZsZWN0aW9uc1xuICAgICAgICAgICAgaWYgKHRoaXMucmVmbGVjdGlvbiAhPT0gdGhpcy5SRUZMRUNUSU9OX05PTkUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVSZWZsZWN0aW9ucygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGVEcm9wcygpO1xuXG4gICAgICAgICAgICAvLyBhbmltYXRpb25cbiAgICAgICAgICAgIHRoaXMucHJlc2V0cyA9IHByZXNldHM7XG5cbiAgICAgICAgICAgIHRoaXMuUFJJVkFURV9HUkFWSVRZX0ZPUkNFX0ZBQ1RPUl9ZID0gdGhpcy5vcHRpb25zLmZwcyAqIDAuMDAxIC8gMjU7XG4gICAgICAgICAgICB0aGlzLlBSSVZBVEVfR1JBVklUWV9GT1JDRV9GQUNUT1JfWCA9IChNYXRoLlBJIC8gMiAtIHRoaXMub3B0aW9ucy5ncmF2aXR5QW5nbGUpICogKHRoaXMub3B0aW9ucy5mcHMgKiAwLjAwMSkgLyA1MDtcblxuICAgICAgICAgICAgLy8gcHJlcGFyZSBncmF2aXR5IG1hdHJpeFxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5lbmFibGVDb2xsaXNpb25zKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBjYWxjdWxhdGUgbWF4IHJhZGl1cyBvZiBhIGRyb3AgdG8gZXN0YWJsaXNoIGdyYXZpdHkgbWF0cml4IHJlc29sdXRpb25cbiAgICAgICAgICAgICAgICB2YXIgbWF4RHJvcFJhZGl1cyA9IDA7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmVzZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVzZXRzW2ldWzBdICsgcHJlc2V0c1tpXVsxXSA+IG1heERyb3BSYWRpdXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heERyb3BSYWRpdXMgPSBNYXRoLmZsb29yKHByZXNldHNbaV1bMF0gKyBwcmVzZXRzW2ldWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChtYXhEcm9wUmFkaXVzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBncmF2aXR5IG1hdHJpeFxuICAgICAgICAgICAgICAgICAgICB2YXIgbXdpID0gTWF0aC5jZWlsKHRoaXMuY2FudmFzLndpZHRoIC8gbWF4RHJvcFJhZGl1cyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtaGkgPSBNYXRoLmNlaWwodGhpcy5jYW52YXMuaGVpZ2h0IC8gbWF4RHJvcFJhZGl1cyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWF0cml4ID0gbmV3IENvbGxpc2lvbk1hdHJpeChtd2ksIG1oaSwgbWF4RHJvcFJhZGl1cyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLmVuYWJsZUNvbGxpc2lvbnMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJlc2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICghcHJlc2V0c1tpXVszXSkge1xuICAgICAgICAgICAgICAgICAgICBwcmVzZXRzW2ldWzNdID0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbGFzdEV4ZWN1dGlvblRpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5hZGREcm9wQ2FsbGJhY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICBpZiAodGltZXN0YW1wIC0gbGFzdEV4ZWN1dGlvblRpbWUgPCBzcGVlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxhc3RFeGVjdXRpb25UaW1lID0gdGltZXN0YW1wO1xuICAgICAgICAgICAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmJhY2tncm91bmQsIDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIC8vIHNlbGVjdCBtYXRjaGluZyBwcmVzZXRcbiAgICAgICAgICAgICAgICB2YXIgcHJlc2V0O1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJlc2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJlc2V0c1tpXVsyXSA+IDEgfHwgcHJlc2V0c1tpXVszXSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmVzZXRzW2ldWzNdICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc2V0c1tpXVszXS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgcHJlc2V0c1tpXVsyXTsgKyt5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHV0RHJvcChuZXcgRHJvcCh0aGlzLCBNYXRoLnJhbmRvbSgpICogdGhpcy5jYW52YXMud2lkdGgsIE1hdGgucmFuZG9tKCkgKiB0aGlzLmNhbnZhcy5oZWlnaHQsIHByZXNldHNbaV1bMF0sIHByZXNldHNbaV1bMV0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8IHByZXNldHNbaV1bMl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXNldCA9IHByZXNldHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocHJlc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHV0RHJvcChuZXcgRHJvcCh0aGlzLCBNYXRoLnJhbmRvbSgpICogdGhpcy5jYW52YXMud2lkdGgsIE1hdGgucmFuZG9tKCkgKiB0aGlzLmNhbnZhcy5oZWlnaHQsIHByZXNldFswXSwgcHJlc2V0WzFdKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnRleHQuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuZ2xvYmFsQWxwaGEgPSB0aGlzLm9wdGlvbnMub3BhY2l0eTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmdsYXNzLCAwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnJlc3RvcmUoKTtcbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkcyBhIG5ldyByYWluZHJvcCB0byB0aGUgYW5pbWF0aW9uLlxuICAgICAgICAgKiBAcGFyYW0gZHJvcCBkcm9wIG9iamVjdCB0byBiZSBhZGRlZCB0byB0aGUgYW5pbWF0aW9uXG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAncHV0RHJvcCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBwdXREcm9wKGRyb3ApIHtcbiAgICAgICAgICAgIGRyb3AuZHJhdygpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZ3Jhdml0eSAmJiBkcm9wLnIgPiB0aGlzLm9wdGlvbnMuZ3Jhdml0eVRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZW5hYmxlQ29sbGlzaW9ucykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeC51cGRhdGUoZHJvcCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZHJvcHMucHVzaChkcm9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbGVhciB0aGUgZHJvcCBhbmQgcmVtb3ZlIGZyb20gdGhlIGxpc3QgaWYgYXBwbGljYWJsZS5cbiAgICAgICAgICogQGRyb3AgdG8gYmUgY2xlYXJlZFxuICAgICAgICAgKiBAZm9yY2UgZm9yY2UgcmVtb3ZhbCBmcm9tIHRoZSBsaXN0XG4gICAgICAgICAqIHJlc3VsdCBpZiB0cnVlIGFuaW1hdGlvbiBvZiB0aGlzIGRyb3Agc2hvdWxkIGJlIHN0b3BwZWRcbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhckRyb3AnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJEcm9wKGRyb3AsIGZvcmNlKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZHJvcC5jbGVhcihmb3JjZSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5kcm9wcy5pbmRleE9mKGRyb3ApO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJvcHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRSQUlMIGZ1bmN0aW9uOiBubyB0cmFpbCBhdCBhbGxcbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdUUkFJTF9OT05FJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIFRSQUlMX05PTkUoKSB7fVxuICAgICAgICAvLyBub3RoaW5nIGdvaW5nIG9uIGhlcmVcblxuICAgICAgICAvKipcbiAgICAgICAgICogVFJBSUwgZnVuY3Rpb246IHRyYWlsIG9mIHNtYWxsIGRyb3BzIChkZWZhdWx0KVxuICAgICAgICAgKiBAcGFyYW0gZHJvcCByYWluZHJvcCBvYmplY3RcbiAgICAgICAgICovXG5cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ1RSQUlMX0RST1BTJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIFRSQUlMX0RST1BTKGRyb3ApIHtcbiAgICAgICAgICAgIGlmICghZHJvcC50cmFpbFkgfHwgZHJvcC55IC0gZHJvcC50cmFpbFkgPj0gTWF0aC5yYW5kb20oKSAqIDEwMCAqIGRyb3Aucikge1xuICAgICAgICAgICAgICAgIGRyb3AudHJhaWxZID0gZHJvcC55O1xuICAgICAgICAgICAgICAgIHRoaXMucHV0RHJvcChuZXcgRHJvcCh0aGlzLCBkcm9wLnggKyAoTWF0aC5yYW5kb20oKSAqIDIgLSAxKSAqIE1hdGgucmFuZG9tKCksIGRyb3AueSAtIGRyb3AuciAtIDUsIE1hdGguY2VpbChkcm9wLnIgLyA1KSwgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRSQUlMIGZ1bmN0aW9uOiB0cmFpbCBvZiB1bmJsdXJyZWQgaW1hZ2VcbiAgICAgICAgICogQHBhcmFtIGRyb3AgcmFpbmRyb3Agb2JqZWN0XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnVFJBSUxfU01VREdFJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIFRSQUlMX1NNVURHRShkcm9wKSB7XG4gICAgICAgICAgICB2YXIgeSA9IGRyb3AueSAtIGRyb3AuciAtIDM7XG4gICAgICAgICAgICB2YXIgeCA9IGRyb3AueCAtIGRyb3AuciAvIDIgKyBNYXRoLnJhbmRvbSgpICogMjtcbiAgICAgICAgICAgIGlmICh5IDwgMCB8fCB4IDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5kcmF3SW1hZ2UodGhpcy5jbGVhcmJhY2tncm91bmQsIHgsIHksIGRyb3AuciwgMiwgeCwgeSwgZHJvcC5yLCAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHUkFWSVRZIGZ1bmN0aW9uOiBubyBncmF2aXR5IGF0IGFsbFxuICAgICAgICAgKiBAcmV0dXJucyBCb29sZWFuIHRydWUgaWYgdGhlIGFuaW1hdGlvbiBpcyBzdG9wcGVkXG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnR1JBVklUWV9OT05FJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIEdSQVZJVFlfTk9ORSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdSQVZJVFkgZnVuY3Rpb246IGxpbmVhciBncmF2aXR5XG4gICAgICAgICAqIEBwYXJhbSBkcm9wIHJhaW5kcm9wIG9iamVjdFxuICAgICAgICAgKiBAcmV0dXJucyBCb29sZWFuIHRydWUgaWYgdGhlIGFuaW1hdGlvbiBpcyBzdG9wcGVkXG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnR1JBVklUWV9MSU5FQVInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gR1JBVklUWV9MSU5FQVIoZHJvcCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2xlYXJEcm9wKGRyb3ApKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkcm9wLnlzcGVlZCkge1xuICAgICAgICAgICAgICAgIGRyb3AueXNwZWVkICs9IHRoaXMuUFJJVkFURV9HUkFWSVRZX0ZPUkNFX0ZBQ1RPUl9ZICogTWF0aC5mbG9vcihkcm9wLnIpO1xuICAgICAgICAgICAgICAgIGRyb3AueHNwZWVkICs9IHRoaXMuUFJJVkFURV9HUkFWSVRZX0ZPUkNFX0ZBQ1RPUl9YICogTWF0aC5mbG9vcihkcm9wLnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkcm9wLnlzcGVlZCA9IHRoaXMuUFJJVkFURV9HUkFWSVRZX0ZPUkNFX0ZBQ1RPUl9ZO1xuICAgICAgICAgICAgICAgIGRyb3AueHNwZWVkID0gdGhpcy5QUklWQVRFX0dSQVZJVFlfRk9SQ0VfRkFDVE9SX1g7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRyb3AueSArPSBkcm9wLnlzcGVlZDtcbiAgICAgICAgICAgIGRyb3AuZHJhdygpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdSQVZJVFkgZnVuY3Rpb246IG5vbi1saW5lYXIgZ3Jhdml0eSAoZGVmYXVsdClcbiAgICAgICAgICogQHBhcmFtIGRyb3AgcmFpbmRyb3Agb2JqZWN0XG4gICAgICAgICAqIEByZXR1cm5zIEJvb2xlYW4gdHJ1ZSBpZiB0aGUgYW5pbWF0aW9uIGlzIHN0b3BwZWRcbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdHUkFWSVRZX05PTl9MSU5FQVInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gR1JBVklUWV9OT05fTElORUFSKGRyb3ApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNsZWFyRHJvcChkcm9wKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZHJvcC5jb2xsaWRlZCkge1xuICAgICAgICAgICAgICAgIGRyb3AuY29sbGlkZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBkcm9wLnNlZWQgPSBNYXRoLmZsb29yKGRyb3AuciAqIE1hdGgucmFuZG9tKCkgKiB0aGlzLm9wdGlvbnMuZnBzKTtcbiAgICAgICAgICAgICAgICBkcm9wLnNraXBwaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZHJvcC5zbG93aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFkcm9wLnNlZWQgfHwgZHJvcC5zZWVkIDwgMCkge1xuICAgICAgICAgICAgICAgIGRyb3Auc2VlZCA9IE1hdGguZmxvb3IoZHJvcC5yICogTWF0aC5yYW5kb20oKSAqIHRoaXMub3B0aW9ucy5mcHMpO1xuICAgICAgICAgICAgICAgIGRyb3Auc2tpcHBpbmcgPSBkcm9wLnNraXBwaW5nID09PSBmYWxzZSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICBkcm9wLnNsb3dpbmcgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkcm9wLnNlZWQtLTtcblxuICAgICAgICAgICAgaWYgKGRyb3AueXNwZWVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRyb3Auc2xvd2luZykge1xuICAgICAgICAgICAgICAgICAgICBkcm9wLnlzcGVlZCAvPSAxLjE7XG4gICAgICAgICAgICAgICAgICAgIGRyb3AueHNwZWVkIC89IDEuMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyb3AueXNwZWVkIDwgdGhpcy5QUklWQVRFX0dSQVZJVFlfRk9SQ0VfRkFDVE9SX1kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3Auc2xvd2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkcm9wLnNraXBwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGRyb3AueXNwZWVkID0gdGhpcy5QUklWQVRFX0dSQVZJVFlfRk9SQ0VfRkFDVE9SX1k7XG4gICAgICAgICAgICAgICAgICAgIGRyb3AueHNwZWVkID0gdGhpcy5QUklWQVRFX0dSQVZJVFlfRk9SQ0VfRkFDVE9SX1g7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZHJvcC55c3BlZWQgKz0gMSAqIHRoaXMuUFJJVkFURV9HUkFWSVRZX0ZPUkNFX0ZBQ1RPUl9ZICogTWF0aC5mbG9vcihkcm9wLnIpO1xuICAgICAgICAgICAgICAgICAgICBkcm9wLnhzcGVlZCArPSAxICogdGhpcy5QUklWQVRFX0dSQVZJVFlfRk9SQ0VfRkFDVE9SX1ggKiBNYXRoLmZsb29yKGRyb3Aucik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkcm9wLnlzcGVlZCA9IHRoaXMuUFJJVkFURV9HUkFWSVRZX0ZPUkNFX0ZBQ1RPUl9ZO1xuICAgICAgICAgICAgICAgIGRyb3AueHNwZWVkID0gdGhpcy5QUklWQVRFX0dSQVZJVFlfRk9SQ0VfRkFDVE9SX1g7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZ3Jhdml0eUFuZ2xlVmFyaWFuY2UgIT09IDApIHtcbiAgICAgICAgICAgICAgICBkcm9wLnhzcGVlZCArPSAoTWF0aC5yYW5kb20oKSAqIDIgLSAxKSAqIGRyb3AueXNwZWVkICogdGhpcy5vcHRpb25zLmdyYXZpdHlBbmdsZVZhcmlhbmNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkcm9wLnkgKz0gZHJvcC55c3BlZWQ7XG4gICAgICAgICAgICBkcm9wLnggKz0gZHJvcC54c3BlZWQ7XG5cbiAgICAgICAgICAgIGRyb3AuZHJhdygpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gcmV0dXJuIHBvc2l0aXZlIG1pbiB2YWx1ZVxuICAgICAgICAgKiBAcGFyYW0gdmFsMSBmaXJzdCBudW1iZXJcbiAgICAgICAgICogQHBhcmFtIHZhbDIgc2Vjb25kIG51bWJlclxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3Bvc2l0aXZlTWluJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHBvc2l0aXZlTWluKHZhbDEsIHZhbDIpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSAwO1xuICAgICAgICAgICAgaWYgKHZhbDEgPCB2YWwyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbDEgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB2YWwyO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZhbDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsMiA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHZhbDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFsMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0IDw9IDAgPyAxIDogcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJFRkxFQ1RJT04gZnVuY3Rpb246IG5vIHJlZmxlY3Rpb24gYXQgYWxsXG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnUkVGTEVDVElPTl9OT05FJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIFJFRkxFQ1RJT05fTk9ORSgpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSB0aGlzLm9wdGlvbnMuZmlsbFN0eWxlO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LmZpbGwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSRUZMRUNUSU9OIGZ1bmN0aW9uOiBtaW5pYXR1cmUgcmVmbGVjdGlvbiAoZGVmYXVsdClcbiAgICAgICAgICogQHBhcmFtIGRyb3AgcmFpbmRyb3Agb2JqZWN0XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnUkVGTEVDVElPTl9NSU5JQVRVUkUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gUkVGTEVDVElPTl9NSU5JQVRVUkUoZHJvcCkge1xuICAgICAgICAgICAgdmFyIHN4ID0gTWF0aC5tYXgoKGRyb3AueCAtIHRoaXMub3B0aW9ucy5yZWZsZWN0aW9uRHJvcE1hcHBpbmdXaWR0aCkgLyB0aGlzLm9wdGlvbnMucmVmbGVjdGlvblNjYWxlZG93bkZhY3RvciwgMCk7XG4gICAgICAgICAgICB2YXIgc3kgPSBNYXRoLm1heCgoZHJvcC55IC0gdGhpcy5vcHRpb25zLnJlZmxlY3Rpb25Ecm9wTWFwcGluZ0hlaWdodCkgLyB0aGlzLm9wdGlvbnMucmVmbGVjdGlvblNjYWxlZG93bkZhY3RvciwgMCk7XG4gICAgICAgICAgICB2YXIgc3cgPSB0aGlzLnBvc2l0aXZlTWluKHRoaXMub3B0aW9ucy5yZWZsZWN0aW9uRHJvcE1hcHBpbmdXaWR0aCAqIDIgLyB0aGlzLm9wdGlvbnMucmVmbGVjdGlvblNjYWxlZG93bkZhY3RvciwgdGhpcy5yZWZsZWN0ZWQud2lkdGggLSBzeCk7XG4gICAgICAgICAgICB2YXIgc2ggPSB0aGlzLnBvc2l0aXZlTWluKHRoaXMub3B0aW9ucy5yZWZsZWN0aW9uRHJvcE1hcHBpbmdIZWlnaHQgKiAyIC8gdGhpcy5vcHRpb25zLnJlZmxlY3Rpb25TY2FsZWRvd25GYWN0b3IsIHRoaXMucmVmbGVjdGVkLmhlaWdodCAtIHN5KTtcbiAgICAgICAgICAgIHZhciBkeCA9IE1hdGgubWF4KGRyb3AueCAtIDEuMSAqIGRyb3AuciwgMCk7XG4gICAgICAgICAgICB2YXIgZHkgPSBNYXRoLm1heChkcm9wLnkgLSAxLjEgKiBkcm9wLnIsIDApO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLnJlZmxlY3RlZCwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHJvcC5yICogMiwgZHJvcC5yICogMik7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ09MTElTSU9OIGZ1bmN0aW9uOiBkZWZhdWx0IGNvbGxpc2lvbiBpbXBsZW1lbnRhdGlvblxuICAgICAgICAgKiBAcGFyYW0gZHJvcCBvbmUgb2YgdGhlIGRyb3BzIGNvbGxpZGluZ1xuICAgICAgICAgKiBAcGFyYW0gY29sbGlzaW9ucyBsaXN0IG9mIHBvdGVudGlhbCBjb2xsaXNpb25zXG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnQ09MTElTSU9OX1NJTVBMRScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBDT0xMSVNJT05fU0lNUExFKGRyb3AsIGNvbGxpc2lvbnMpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gY29sbGlzaW9ucztcbiAgICAgICAgICAgIHZhciBkcm9wMjtcbiAgICAgICAgICAgIHdoaWxlIChpdGVtICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgcCA9IGl0ZW0uZHJvcDtcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5zcXJ0KE1hdGgucG93KGRyb3AueCAtIHAueCwgMikgKyBNYXRoLnBvdyhkcm9wLnkgLSBwLnksIDIpKSA8IGRyb3AuciArIHAucikge1xuICAgICAgICAgICAgICAgICAgICBkcm9wMiA9IHA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtID0gaXRlbS5uZXh0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWRyb3AyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyByZW5hbWUgc28gdGhhdCB3ZSdyZSBkZWFsaW5nIHdpdGggbG93L2hpZ2ggZHJvcHNcbiAgICAgICAgICAgIHZhciBoaWdoZXIsIGxvd2VyO1xuICAgICAgICAgICAgaWYgKGRyb3AueSA+IGRyb3AyLnkpIHtcbiAgICAgICAgICAgICAgICBoaWdoZXIgPSBkcm9wO1xuICAgICAgICAgICAgICAgIGxvd2VyID0gZHJvcDI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhpZ2hlciA9IGRyb3AyO1xuICAgICAgICAgICAgICAgIGxvd2VyID0gZHJvcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jbGVhckRyb3AobG93ZXIpO1xuICAgICAgICAgICAgLy8gZm9yY2Ugc3RvcHBpbmcgdGhlIHNlY29uZCBkcm9wXG4gICAgICAgICAgICB0aGlzLmNsZWFyRHJvcChoaWdoZXIsIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5tYXRyaXgucmVtb3ZlKGhpZ2hlcik7XG4gICAgICAgICAgICBsb3dlci5kcmF3KCk7XG5cbiAgICAgICAgICAgIGxvd2VyLmNvbGxpZGluZyA9IGhpZ2hlcjtcbiAgICAgICAgICAgIGxvd2VyLmNvbGxpZGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXNpemVzIGNhbnZhcywgZHJhd3Mgb3JpZ2luYWwgaW1hZ2UgYW5kIGFwcGxpZXMgYmx1cnJpbmcgYWxnb3JpdGhtLlxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3ByZXBhcmVCYWNrZ3JvdW5kJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHByZXBhcmVCYWNrZ3JvdW5kKCkge1xuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmQud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZC5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG5cbiAgICAgICAgICAgIHRoaXMuY2xlYXJiYWNrZ3JvdW5kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyYmFja2dyb3VuZC53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5jbGVhcmJhY2tncm91bmQuaGVpZ2h0ID0gdGhpcy5jYW52YXMuaGVpZ2h0O1xuXG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMuYmFja2dyb3VuZC5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCB0aGlzLm9wdGlvbnMuY3JvcFswXSwgdGhpcy5vcHRpb25zLmNyb3BbMV0sIHRoaXMub3B0aW9ucy5jcm9wWzJdLCB0aGlzLm9wdGlvbnMuY3JvcFszXSwgMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgICAgIGNvbnRleHQgPSB0aGlzLmNsZWFyYmFja2dyb3VuZC5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5vcHRpb25zLmNyb3BbMF0sIHRoaXMub3B0aW9ucy5jcm9wWzFdLCB0aGlzLm9wdGlvbnMuY3JvcFsyXSwgdGhpcy5vcHRpb25zLmNyb3BbM10sIDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuXG4gICAgICAgICAgICBpZiAoIWlzTmFOKHRoaXMub3B0aW9ucy5ibHVyKSAmJiB0aGlzLm9wdGlvbnMuYmx1ciA+PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFja0JsdXJDYW52YXNSR0IodGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCwgdGhpcy5vcHRpb25zLmJsdXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEltcGxlbWVudHMgdGhlIFN0YWNrIEJsdXIgQWxnb3JpdGhtIChAc2VlIGh0dHA6Ly93d3cucXVhc2ltb25kby5jb20vU3RhY2tCbHVyRm9yQ2FudmFzL1N0YWNrQmx1ckRlbW8uaHRtbCkuXG4gICAgICAgICAqIEBwYXJhbSB3aWR0aCB3aWR0aCBvZiB0aGUgY2FudmFzXG4gICAgICAgICAqIEBwYXJhbSBoZWlnaHQgaGVpZ2h0IG9mIHRoZSBjYW52YXNcbiAgICAgICAgICogQHBhcmFtIHJhZGl1cyBibHVyIHJhZGl1c1xuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3N0YWNrQmx1ckNhbnZhc1JHQicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzdGFja0JsdXJDYW52YXNSR0Iod2lkdGgsIGhlaWdodCwgcmFkaXVzKSB7XG5cbiAgICAgICAgICAgIHZhciBzaGdUYWJsZSA9IFtbMCwgOV0sIFsxLCAxMV0sIFsyLCAxMl0sIFszLCAxM10sIFs1LCAxNF0sIFs3LCAxNV0sIFsxMSwgMTZdLCBbMTUsIDE3XSwgWzIyLCAxOF0sIFszMSwgMTldLCBbNDUsIDIwXSwgWzYzLCAyMV0sIFs5MCwgMjJdLCBbMTI3LCAyM10sIFsxODEsIDI0XV07XG5cbiAgICAgICAgICAgIHZhciBtdWxUYWJsZSA9IFs1MTIsIDUxMiwgNDU2LCA1MTIsIDMyOCwgNDU2LCAzMzUsIDUxMiwgNDA1LCAzMjgsIDI3MSwgNDU2LCAzODgsIDMzNSwgMjkyLCA1MTIsIDQ1NCwgNDA1LCAzNjQsIDMyOCwgMjk4LCAyNzEsIDQ5NiwgNDU2LCA0MjAsIDM4OCwgMzYwLCAzMzUsIDMxMiwgMjkyLCAyNzMsIDUxMiwgNDgyLCA0NTQsIDQyOCwgNDA1LCAzODMsIDM2NCwgMzQ1LCAzMjgsIDMxMiwgMjk4LCAyODQsIDI3MSwgMjU5LCA0OTYsIDQ3NSwgNDU2LCA0MzcsIDQyMCwgNDA0LCAzODgsIDM3NCwgMzYwLCAzNDcsIDMzNSwgMzIzLCAzMTIsIDMwMiwgMjkyLCAyODIsIDI3MywgMjY1LCA1MTIsIDQ5NywgNDgyLCA0NjgsIDQ1NCwgNDQxLCA0MjgsIDQxNywgNDA1LCAzOTQsIDM4MywgMzczLCAzNjQsIDM1NCwgMzQ1LCAzMzcsIDMyOCwgMzIwLCAzMTIsIDMwNSwgMjk4LCAyOTEsIDI4NCwgMjc4LCAyNzEsIDI2NSwgMjU5LCA1MDcsIDQ5NiwgNDg1LCA0NzUsIDQ2NSwgNDU2LCA0NDYsIDQzNywgNDI4LCA0MjAsIDQxMiwgNDA0LCAzOTYsIDM4OCwgMzgxLCAzNzQsIDM2NywgMzYwLCAzNTQsIDM0NywgMzQxLCAzMzUsIDMyOSwgMzIzLCAzMTgsIDMxMiwgMzA3LCAzMDIsIDI5NywgMjkyLCAyODcsIDI4MiwgMjc4LCAyNzMsIDI2OSwgMjY1LCAyNjEsIDUxMiwgNTA1LCA0OTcsIDQ4OSwgNDgyLCA0NzUsIDQ2OCwgNDYxLCA0NTQsIDQ0NywgNDQxLCA0MzUsIDQyOCwgNDIyLCA0MTcsIDQxMSwgNDA1LCAzOTksIDM5NCwgMzg5LCAzODMsIDM3OCwgMzczLCAzNjgsIDM2NCwgMzU5LCAzNTQsIDM1MCwgMzQ1LCAzNDEsIDMzNywgMzMyLCAzMjgsIDMyNCwgMzIwLCAzMTYsIDMxMiwgMzA5LCAzMDUsIDMwMSwgMjk4LCAyOTQsIDI5MSwgMjg3LCAyODQsIDI4MSwgMjc4LCAyNzQsIDI3MSwgMjY4LCAyNjUsIDI2MiwgMjU5LCAyNTcsIDUwNywgNTAxLCA0OTYsIDQ5MSwgNDg1LCA0ODAsIDQ3NSwgNDcwLCA0NjUsIDQ2MCwgNDU2LCA0NTEsIDQ0NiwgNDQyLCA0MzcsIDQzMywgNDI4LCA0MjQsIDQyMCwgNDE2LCA0MTIsIDQwOCwgNDA0LCA0MDAsIDM5NiwgMzkyLCAzODgsIDM4NSwgMzgxLCAzNzcsIDM3NCwgMzcwLCAzNjcsIDM2MywgMzYwLCAzNTcsIDM1NCwgMzUwLCAzNDcsIDM0NCwgMzQxLCAzMzgsIDMzNSwgMzMyLCAzMjksIDMyNiwgMzIzLCAzMjAsIDMxOCwgMzE1LCAzMTIsIDMxMCwgMzA3LCAzMDQsIDMwMiwgMjk5LCAyOTcsIDI5NCwgMjkyLCAyODksIDI4NywgMjg1LCAyODIsIDI4MCwgMjc4LCAyNzUsIDI3MywgMjcxLCAyNjksIDI2NywgMjY1LCAyNjMsIDI2MSwgMjU5XTtcblxuICAgICAgICAgICAgcmFkaXVzIHw9IDA7XG5cbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gdGhpcy5iYWNrZ3JvdW5kLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgICB2YXIgaW1hZ2VEYXRhID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICB2YXIgcGl4ZWxzID0gaW1hZ2VEYXRhLmRhdGE7XG4gICAgICAgICAgICB2YXIgeCwgeSwgaSwgcCwgeXAsIHlpLCB5dywgclN1bSwgZ1N1bSwgYlN1bSwgck91dFN1bSwgZ091dFN1bSwgYk91dFN1bSwgckluU3VtLCBnSW5TdW0sIGJJblN1bSwgcHIsIHBnLCBwYiwgcmJzO1xuICAgICAgICAgICAgdmFyIHJhZGl1c1BsdXMxID0gcmFkaXVzICsgMTtcbiAgICAgICAgICAgIHZhciBzdW1GYWN0b3IgPSByYWRpdXNQbHVzMSAqIChyYWRpdXNQbHVzMSArIDEpIC8gMjtcblxuICAgICAgICAgICAgdmFyIHN0YWNrU3RhcnQgPSBuZXcgQmx1clN0YWNrKCk7XG4gICAgICAgICAgICB2YXIgc3RhY2tFbmQgPSBuZXcgQmx1clN0YWNrKCk7XG4gICAgICAgICAgICB2YXIgc3RhY2sgPSBzdGFja1N0YXJ0O1xuICAgICAgICAgICAgZm9yIChpID0gMTsgaSA8IDIgKiByYWRpdXMgKyAxOyBpKyspIHtcbiAgICAgICAgICAgICAgICBzdGFjayA9IHN0YWNrLm5leHQgPSBuZXcgQmx1clN0YWNrKCk7XG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IHJhZGl1c1BsdXMxKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrRW5kID0gc3RhY2s7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2submV4dCA9IHN0YWNrU3RhcnQ7XG4gICAgICAgICAgICB2YXIgc3RhY2tJbiA9IG51bGw7XG4gICAgICAgICAgICB2YXIgc3RhY2tPdXQgPSBudWxsO1xuXG4gICAgICAgICAgICB5dyA9IHlpID0gMDtcblxuICAgICAgICAgICAgdmFyIG11bFN1bSA9IG11bFRhYmxlW3JhZGl1c107XG4gICAgICAgICAgICB2YXIgc2hnU3VtO1xuICAgICAgICAgICAgZm9yICh2YXIgc3NpID0gMDsgc3NpIDwgc2hnVGFibGUubGVuZ3RoOyArK3NzaSkge1xuICAgICAgICAgICAgICAgIGlmIChyYWRpdXMgPD0gc2hnVGFibGVbc3NpXVswXSkge1xuICAgICAgICAgICAgICAgICAgICBzaGdTdW0gPSBzaGdUYWJsZVtzc2kgLSAxXVsxXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICBySW5TdW0gPSBnSW5TdW0gPSBiSW5TdW0gPSByU3VtID0gZ1N1bSA9IGJTdW0gPSAwO1xuXG4gICAgICAgICAgICAgICAgck91dFN1bSA9IHJhZGl1c1BsdXMxICogKHByID0gcGl4ZWxzW3lpXSk7XG4gICAgICAgICAgICAgICAgZ091dFN1bSA9IHJhZGl1c1BsdXMxICogKHBnID0gcGl4ZWxzW3lpICsgMV0pO1xuICAgICAgICAgICAgICAgIGJPdXRTdW0gPSByYWRpdXNQbHVzMSAqIChwYiA9IHBpeGVsc1t5aSArIDJdKTtcblxuICAgICAgICAgICAgICAgIHJTdW0gKz0gc3VtRmFjdG9yICogcHI7XG4gICAgICAgICAgICAgICAgZ1N1bSArPSBzdW1GYWN0b3IgKiBwZztcbiAgICAgICAgICAgICAgICBiU3VtICs9IHN1bUZhY3RvciAqIHBiO1xuXG4gICAgICAgICAgICAgICAgc3RhY2sgPSBzdGFja1N0YXJ0O1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHJhZGl1c1BsdXMxOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2suciA9IHByO1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5nID0gcGc7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLmIgPSBwYjtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2sgPSBzdGFjay5uZXh0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDE7IGkgPCByYWRpdXNQbHVzMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHAgPSB5aSArICgod2lkdGggLSAxIDwgaSA/IHdpZHRoIC0gMSA6IGkpIDw8IDIpO1xuICAgICAgICAgICAgICAgICAgICByU3VtICs9IChzdGFjay5yID0gcHIgPSBwaXhlbHNbcF0pICogKHJicyA9IHJhZGl1c1BsdXMxIC0gaSk7XG4gICAgICAgICAgICAgICAgICAgIGdTdW0gKz0gKHN0YWNrLmcgPSBwZyA9IHBpeGVsc1twICsgMV0pICogcmJzO1xuICAgICAgICAgICAgICAgICAgICBiU3VtICs9IChzdGFjay5iID0gcGIgPSBwaXhlbHNbcCArIDJdKSAqIHJicztcblxuICAgICAgICAgICAgICAgICAgICBySW5TdW0gKz0gcHI7XG4gICAgICAgICAgICAgICAgICAgIGdJblN1bSArPSBwZztcbiAgICAgICAgICAgICAgICAgICAgYkluU3VtICs9IHBiO1xuXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrID0gc3RhY2submV4dDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdGFja0luID0gc3RhY2tTdGFydDtcbiAgICAgICAgICAgICAgICBzdGFja091dCA9IHN0YWNrRW5kO1xuICAgICAgICAgICAgICAgIGZvciAoeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHBpeGVsc1t5aV0gPSByU3VtICogbXVsU3VtID4+IHNoZ1N1bTtcbiAgICAgICAgICAgICAgICAgICAgcGl4ZWxzW3lpICsgMV0gPSBnU3VtICogbXVsU3VtID4+IHNoZ1N1bTtcbiAgICAgICAgICAgICAgICAgICAgcGl4ZWxzW3lpICsgMl0gPSBiU3VtICogbXVsU3VtID4+IHNoZ1N1bTtcblxuICAgICAgICAgICAgICAgICAgICByU3VtIC09IHJPdXRTdW07XG4gICAgICAgICAgICAgICAgICAgIGdTdW0gLT0gZ091dFN1bTtcbiAgICAgICAgICAgICAgICAgICAgYlN1bSAtPSBiT3V0U3VtO1xuXG4gICAgICAgICAgICAgICAgICAgIHJPdXRTdW0gLT0gc3RhY2tJbi5yO1xuICAgICAgICAgICAgICAgICAgICBnT3V0U3VtIC09IHN0YWNrSW4uZztcbiAgICAgICAgICAgICAgICAgICAgYk91dFN1bSAtPSBzdGFja0luLmI7XG5cbiAgICAgICAgICAgICAgICAgICAgcCA9IHl3ICsgKChwID0geCArIHJhZGl1cyArIDEpIDwgd2lkdGggLSAxID8gcCA6IHdpZHRoIC0gMSkgPDwgMjtcblxuICAgICAgICAgICAgICAgICAgICBySW5TdW0gKz0gc3RhY2tJbi5yID0gcGl4ZWxzW3BdO1xuICAgICAgICAgICAgICAgICAgICBnSW5TdW0gKz0gc3RhY2tJbi5nID0gcGl4ZWxzW3AgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgYkluU3VtICs9IHN0YWNrSW4uYiA9IHBpeGVsc1twICsgMl07XG5cbiAgICAgICAgICAgICAgICAgICAgclN1bSArPSBySW5TdW07XG4gICAgICAgICAgICAgICAgICAgIGdTdW0gKz0gZ0luU3VtO1xuICAgICAgICAgICAgICAgICAgICBiU3VtICs9IGJJblN1bTtcblxuICAgICAgICAgICAgICAgICAgICBzdGFja0luID0gc3RhY2tJbi5uZXh0O1xuXG4gICAgICAgICAgICAgICAgICAgIHJPdXRTdW0gKz0gcHIgPSBzdGFja091dC5yO1xuICAgICAgICAgICAgICAgICAgICBnT3V0U3VtICs9IHBnID0gc3RhY2tPdXQuZztcbiAgICAgICAgICAgICAgICAgICAgYk91dFN1bSArPSBwYiA9IHN0YWNrT3V0LmI7XG5cbiAgICAgICAgICAgICAgICAgICAgckluU3VtIC09IHByO1xuICAgICAgICAgICAgICAgICAgICBnSW5TdW0gLT0gcGc7XG4gICAgICAgICAgICAgICAgICAgIGJJblN1bSAtPSBwYjtcblxuICAgICAgICAgICAgICAgICAgICBzdGFja091dCA9IHN0YWNrT3V0Lm5leHQ7XG5cbiAgICAgICAgICAgICAgICAgICAgeWkgKz0gNDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeXcgKz0gd2lkdGg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgZ0luU3VtID0gYkluU3VtID0gckluU3VtID0gZ1N1bSA9IGJTdW0gPSByU3VtID0gMDtcblxuICAgICAgICAgICAgICAgIHlpID0geCA8PCAyO1xuICAgICAgICAgICAgICAgIHJPdXRTdW0gPSByYWRpdXNQbHVzMSAqIChwciA9IHBpeGVsc1t5aV0pO1xuICAgICAgICAgICAgICAgIGdPdXRTdW0gPSByYWRpdXNQbHVzMSAqIChwZyA9IHBpeGVsc1t5aSArIDFdKTtcbiAgICAgICAgICAgICAgICBiT3V0U3VtID0gcmFkaXVzUGx1czEgKiAocGIgPSBwaXhlbHNbeWkgKyAyXSk7XG5cbiAgICAgICAgICAgICAgICByU3VtICs9IHN1bUZhY3RvciAqIHByO1xuICAgICAgICAgICAgICAgIGdTdW0gKz0gc3VtRmFjdG9yICogcGc7XG4gICAgICAgICAgICAgICAgYlN1bSArPSBzdW1GYWN0b3IgKiBwYjtcblxuICAgICAgICAgICAgICAgIHN0YWNrID0gc3RhY2tTdGFydDtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCByYWRpdXNQbHVzMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrLnIgPSBwcjtcbiAgICAgICAgICAgICAgICAgICAgc3RhY2suZyA9IHBnO1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5iID0gcGI7XG4gICAgICAgICAgICAgICAgICAgIHN0YWNrID0gc3RhY2submV4dDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB5cCA9IHdpZHRoO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMTsgaSA8IHJhZGl1c1BsdXMxOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgeWkgPSB5cCArIHggPDwgMjtcblxuICAgICAgICAgICAgICAgICAgICByU3VtICs9IChzdGFjay5yID0gcHIgPSBwaXhlbHNbeWldKSAqIChyYnMgPSByYWRpdXNQbHVzMSAtIGkpO1xuICAgICAgICAgICAgICAgICAgICBnU3VtICs9IChzdGFjay5nID0gcGcgPSBwaXhlbHNbeWkgKyAxXSkgKiByYnM7XG4gICAgICAgICAgICAgICAgICAgIGJTdW0gKz0gKHN0YWNrLmIgPSBwYiA9IHBpeGVsc1t5aSArIDJdKSAqIHJicztcblxuICAgICAgICAgICAgICAgICAgICBySW5TdW0gKz0gcHI7XG4gICAgICAgICAgICAgICAgICAgIGdJblN1bSArPSBwZztcbiAgICAgICAgICAgICAgICAgICAgYkluU3VtICs9IHBiO1xuXG4gICAgICAgICAgICAgICAgICAgIHN0YWNrID0gc3RhY2submV4dDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IGhlaWdodCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHlwICs9IHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgeWkgPSB4O1xuICAgICAgICAgICAgICAgIHN0YWNrSW4gPSBzdGFja1N0YXJ0O1xuICAgICAgICAgICAgICAgIHN0YWNrT3V0ID0gc3RhY2tFbmQ7XG4gICAgICAgICAgICAgICAgZm9yICh5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHAgPSB5aSA8PCAyO1xuICAgICAgICAgICAgICAgICAgICBwaXhlbHNbcF0gPSByU3VtICogbXVsU3VtID4+IHNoZ1N1bTtcbiAgICAgICAgICAgICAgICAgICAgcGl4ZWxzW3AgKyAxXSA9IGdTdW0gKiBtdWxTdW0gPj4gc2hnU3VtO1xuICAgICAgICAgICAgICAgICAgICBwaXhlbHNbcCArIDJdID0gYlN1bSAqIG11bFN1bSA+PiBzaGdTdW07XG5cbiAgICAgICAgICAgICAgICAgICAgclN1bSAtPSByT3V0U3VtO1xuICAgICAgICAgICAgICAgICAgICBnU3VtIC09IGdPdXRTdW07XG4gICAgICAgICAgICAgICAgICAgIGJTdW0gLT0gYk91dFN1bTtcblxuICAgICAgICAgICAgICAgICAgICByT3V0U3VtIC09IHN0YWNrSW4ucjtcbiAgICAgICAgICAgICAgICAgICAgZ091dFN1bSAtPSBzdGFja0luLmc7XG4gICAgICAgICAgICAgICAgICAgIGJPdXRTdW0gLT0gc3RhY2tJbi5iO1xuXG4gICAgICAgICAgICAgICAgICAgIHAgPSB4ICsgKChwID0geSArIHJhZGl1c1BsdXMxKSA8IGhlaWdodCAtIDEgPyBwIDogaGVpZ2h0IC0gMSkgKiB3aWR0aCA8PCAyO1xuXG4gICAgICAgICAgICAgICAgICAgIHJTdW0gKz0gckluU3VtICs9IHN0YWNrSW4uciA9IHBpeGVsc1twXTtcbiAgICAgICAgICAgICAgICAgICAgZ1N1bSArPSBnSW5TdW0gKz0gc3RhY2tJbi5nID0gcGl4ZWxzW3AgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgYlN1bSArPSBiSW5TdW0gKz0gc3RhY2tJbi5iID0gcGl4ZWxzW3AgKyAyXTtcblxuICAgICAgICAgICAgICAgICAgICBzdGFja0luID0gc3RhY2tJbi5uZXh0O1xuXG4gICAgICAgICAgICAgICAgICAgIHJPdXRTdW0gKz0gcHIgPSBzdGFja091dC5yO1xuICAgICAgICAgICAgICAgICAgICBnT3V0U3VtICs9IHBnID0gc3RhY2tPdXQuZztcbiAgICAgICAgICAgICAgICAgICAgYk91dFN1bSArPSBwYiA9IHN0YWNrT3V0LmI7XG5cbiAgICAgICAgICAgICAgICAgICAgckluU3VtIC09IHByO1xuICAgICAgICAgICAgICAgICAgICBnSW5TdW0gLT0gcGc7XG4gICAgICAgICAgICAgICAgICAgIGJJblN1bSAtPSBwYjtcblxuICAgICAgICAgICAgICAgICAgICBzdGFja091dCA9IHN0YWNrT3V0Lm5leHQ7XG5cbiAgICAgICAgICAgICAgICAgICAgeWkgKz0gd2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFJhaW55RGF5O1xufSkoKTtcblxudmFyIERyb3AgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERyb3AocmFpbnlkYXksIGNlbnRlclgsIGNlbnRlclksIG1pbiwgYmFzZSkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRHJvcCk7XG5cbiAgICAgICAgdGhpcy54ID0gTWF0aC5mbG9vcihjZW50ZXJYKTtcbiAgICAgICAgdGhpcy55ID0gTWF0aC5mbG9vcihjZW50ZXJZKTtcbiAgICAgICAgdGhpcy5yID0gTWF0aC5yYW5kb20oKSAqIGJhc2UgKyBtaW47XG4gICAgICAgIHRoaXMucmFpbnlkYXkgPSByYWlueWRheTtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gcmFpbnlkYXkuY29udGV4dDtcbiAgICAgICAgdGhpcy5yZWZsZWN0aW9uID0gcmFpbnlkYXkucmVmbGVjdGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlZmluZXMgYSBuZXcgaGVscGVyIG9iamVjdCBmb3IgU3RhY2sgQmx1ciBBbGdvcml0aG0uXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBEcmF3cyBhIHJhaW5kcm9wIG9uIGNhbnZhcyBhdCB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICAgKi9cblxuICAgIF9jcmVhdGVDbGFzcyhEcm9wLCBbe1xuICAgICAgICBrZXk6ICdkcmF3JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuc2F2ZSgpO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xuXG4gICAgICAgICAgICB2YXIgb3JnUiA9IHRoaXMucjtcbiAgICAgICAgICAgIHRoaXMuciA9IDAuOTUgKiB0aGlzLnI7XG4gICAgICAgICAgICBpZiAodGhpcy5yIDwgMykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMuciwgMCwgTWF0aC5QSSAqIDIsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5jb2xsaWRpbmcgfHwgdGhpcy55c3BlZWQgPiAyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29sbGlkaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb2xsaWRlciA9IHRoaXMuY29sbGlkaW5nO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnIgPSAxLjAwMSAqICh0aGlzLnIgPiBjb2xsaWRlci5yID8gdGhpcy5yIDogY29sbGlkZXIucik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueCArPSBjb2xsaWRlci54IC0gdGhpcy54O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbGxpZGluZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHlyID0gMSArIDAuMSAqIHRoaXMueXNwZWVkO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5tb3ZlVG8odGhpcy54IC0gdGhpcy5yIC8geXIsIHRoaXMueSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LmJlemllckN1cnZlVG8odGhpcy54IC0gdGhpcy5yLCB0aGlzLnkgLSB0aGlzLnIgKiAyLCB0aGlzLnggKyB0aGlzLnIsIHRoaXMueSAtIHRoaXMuciAqIDIsIHRoaXMueCArIHRoaXMuciAvIHlyLCB0aGlzLnkpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5iZXppZXJDdXJ2ZVRvKHRoaXMueCArIHRoaXMuciwgdGhpcy55ICsgeXIgKiB0aGlzLnIsIHRoaXMueCAtIHRoaXMuciwgdGhpcy55ICsgeXIgKiB0aGlzLnIsIHRoaXMueCAtIHRoaXMuciAvIHlyLCB0aGlzLnkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQuYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnIgKiAwLjksIDAsIE1hdGguUEkgKiAyLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5jbGlwKCk7XG5cbiAgICAgICAgICAgIHRoaXMuciA9IG9yZ1I7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnJhaW55ZGF5LnJlZmxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJhaW55ZGF5LnJlZmxlY3Rpb24odGhpcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5yZXN0b3JlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xlYXJzIHRoZSByYWluZHJvcCByZWdpb24uXG4gICAgICAgICAqIEBwYXJhbSBmb3JjZSBmb3JjZSBzdG9wXG4gICAgICAgICAqIEByZXR1cm5zIEJvb2xlYW4gdHJ1ZSBpZiB0aGUgYW5pbWF0aW9uIGlzIHN0b3BwZWRcbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjbGVhcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhcihmb3JjZSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCh0aGlzLnggLSB0aGlzLnIgLSAxLCB0aGlzLnkgLSB0aGlzLnIgLSAyLCAyICogdGhpcy5yICsgMiwgMiAqIHRoaXMuciArIDIpO1xuICAgICAgICAgICAgaWYgKGZvcmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXJtaW5hdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMueSAtIHRoaXMuciA+IHRoaXMucmFpbnlkYXkuY2FudmFzLmhlaWdodCB8fCB0aGlzLnggLSB0aGlzLnIgPiB0aGlzLnJhaW55ZGF5LmNhbnZhcy53aWR0aCB8fCB0aGlzLnggKyB0aGlzLnIgPCAwKSB7XG4gICAgICAgICAgICAgICAgLy8gb3ZlciBlZGdlIHNvIHN0b3AgdGhpcyBkcm9wXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogTW92ZXMgdGhlIHJhaW5kcm9wIHRvIGEgbmV3IHBvc2l0aW9uIGFjY29yZGluZyB0byB0aGUgZ3Jhdml0eS5cbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdhbmltYXRlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXJtaW5hdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc3RvcHBlZCA9IHRoaXMucmFpbnlkYXkuZ3Jhdml0eSh0aGlzKTtcbiAgICAgICAgICAgIGlmICghc3RvcHBlZCAmJiB0aGlzLnJhaW55ZGF5LnRyYWlsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yYWlueWRheS50cmFpbCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnJhaW55ZGF5Lm9wdGlvbnMuZW5hYmxlQ29sbGlzaW9ucykge1xuICAgICAgICAgICAgICAgIHZhciBjb2xsaXNpb25zID0gdGhpcy5yYWlueWRheS5tYXRyaXgudXBkYXRlKHRoaXMsIHN0b3BwZWQpO1xuICAgICAgICAgICAgICAgIGlmIChjb2xsaXNpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmFpbnlkYXkuY29sbGlzaW9uKHRoaXMsIGNvbGxpc2lvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAhc3RvcHBlZCB8fCB0aGlzLnRlcm1pbmF0ZTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEcm9wO1xufSkoKTtcblxudmFyIEJsdXJTdGFjayA9IGZ1bmN0aW9uIEJsdXJTdGFjaygpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQmx1clN0YWNrKTtcblxuICAgIHRoaXMuciA9IDA7XG4gICAgdGhpcy5nID0gMDtcbiAgICB0aGlzLmIgPSAwO1xuICAgIHRoaXMubmV4dCA9IG51bGw7XG59XG4vKipcbiAqIERlZmluZXMgYSBncmF2aXR5IG1hdHJpeCBvYmplY3Qgd2hpY2ggaGFuZGxlcyBjb2xsaXNpb24gZGV0ZWN0aW9uLlxuICogQHBhcmFtIHggbnVtYmVyIG9mIGNvbHVtbnMgaW4gdGhlIG1hdHJpeFxuICogQHBhcmFtIHkgbnVtYmVyIG9mIHJvd3MgaW4gdGhlIG1hdHJpeFxuICogQHBhcmFtIHIgZ3JpZCBzaXplXG4gKi9cbjtcblxudmFyIENvbGxpc2lvbk1hdHJpeCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ29sbGlzaW9uTWF0cml4KHgsIHksIHIpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENvbGxpc2lvbk1hdHJpeCk7XG5cbiAgICAgICAgdGhpcy5yZXNvbHV0aW9uID0gcjtcbiAgICAgICAgdGhpcy54YyA9IHg7XG4gICAgICAgIHRoaXMueWMgPSB5O1xuICAgICAgICB0aGlzLm1hdHJpeCA9IG5ldyBBcnJheSh4KTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0geCArIDU7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5tYXRyaXhbaV0gPSBuZXcgQXJyYXkoeSk7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8PSB5ICsgNTsgKytqKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhbaV1bal0gPSBuZXcgRHJvcEl0ZW0obnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWZpbmVzIGEgbGlua2VkIGxpc3QgaXRlbS5cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgcG9zaXRpb24gb2YgdGhlIGdpdmVuIGRyb3Agb24gdGhlIGNvbGxpc2lvbiBtYXRyaXguXG4gICAgICogQHBhcmFtIGRyb3AgcmFpbmRyb3AgdG8gYmUgcG9zaXRpb25lZC9yZXBvc2l0aW9uZWRcbiAgICAgKiBAcGFyYW0gZm9yY2VEZWxldGUgaWYgdHJ1ZSB0aGUgcmFpbmRyb3Agd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIG1hdHJpeFxuICAgICAqIEByZXR1cm5zIGNvbGxpc2lvbnMgaWYgYW55XG4gICAgICovXG5cbiAgICBfY3JlYXRlQ2xhc3MoQ29sbGlzaW9uTWF0cml4LCBbe1xuICAgICAgICBrZXk6ICd1cGRhdGUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKGRyb3AsIGZvcmNlRGVsZXRlKSB7XG4gICAgICAgICAgICBpZiAoZHJvcC5naWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubWF0cml4W2Ryb3AuZ214XSB8fCAhdGhpcy5tYXRyaXhbZHJvcC5nbXhdW2Ryb3AuZ215XSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5tYXRyaXhbZHJvcC5nbXhdW2Ryb3AuZ215XS5yZW1vdmUoZHJvcCk7XG4gICAgICAgICAgICAgICAgaWYgKGZvcmNlRGVsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRyb3AuZ214ID0gTWF0aC5mbG9vcihkcm9wLnggLyB0aGlzLnJlc29sdXRpb24pO1xuICAgICAgICAgICAgICAgIGRyb3AuZ215ID0gTWF0aC5mbG9vcihkcm9wLnkgLyB0aGlzLnJlc29sdXRpb24pO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5tYXRyaXhbZHJvcC5nbXhdIHx8ICF0aGlzLm1hdHJpeFtkcm9wLmdteF1bZHJvcC5nbXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtkcm9wLmdteF1bZHJvcC5nbXldLmFkZChkcm9wKTtcblxuICAgICAgICAgICAgICAgIHZhciBjb2xsaXNpb25zID0gdGhpcy5jb2xsaXNpb25zKGRyb3ApO1xuICAgICAgICAgICAgICAgIGlmIChjb2xsaXNpb25zICYmIGNvbGxpc2lvbnMubmV4dCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xsaXNpb25zLm5leHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkcm9wLmdpZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KTtcbiAgICAgICAgICAgICAgICBkcm9wLmdteCA9IE1hdGguZmxvb3IoZHJvcC54IC8gdGhpcy5yZXNvbHV0aW9uKTtcbiAgICAgICAgICAgICAgICBkcm9wLmdteSA9IE1hdGguZmxvb3IoZHJvcC55IC8gdGhpcy5yZXNvbHV0aW9uKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubWF0cml4W2Ryb3AuZ214XSB8fCAhdGhpcy5tYXRyaXhbZHJvcC5nbXhdW2Ryb3AuZ215XSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeFtkcm9wLmdteF1bZHJvcC5nbXldLmFkZChkcm9wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIExvb2tzIGZvciBjb2xsaXNpb25zIHdpdGggdGhlIGdpdmVuIHJhaW5kcm9wLlxuICAgICAgICAgKiBAcGFyYW0gZHJvcCByYWluZHJvcCB0byBiZSBjaGVja2VkXG4gICAgICAgICAqIEByZXR1cm5zIERyb3BJdGVtIGxpc3Qgb2YgZHJvcHMgdGhhdCBjb2xsaWRlIHdpdGggaXRcbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjb2xsaXNpb25zJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbGxpc2lvbnMoZHJvcCkge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBuZXcgRHJvcEl0ZW0obnVsbCk7XG4gICAgICAgICAgICB2YXIgZmlyc3QgPSBpdGVtO1xuXG4gICAgICAgICAgICBpdGVtID0gdGhpcy5hZGRBbGwoaXRlbSwgZHJvcC5nbXggLSAxLCBkcm9wLmdteSArIDEpO1xuICAgICAgICAgICAgaXRlbSA9IHRoaXMuYWRkQWxsKGl0ZW0sIGRyb3AuZ214LCBkcm9wLmdteSArIDEpO1xuICAgICAgICAgICAgaXRlbSA9IHRoaXMuYWRkQWxsKGl0ZW0sIGRyb3AuZ214ICsgMSwgZHJvcC5nbXkgKyAxKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0O1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFwcGVuZHMgYWxsIGZvdW5kIGRyb3AgYXQgYSBnaXZlbiBsb2NhdGlvbiB0byB0aGUgZ2l2ZW4gaXRlbS5cbiAgICAgICAgICogQHBhcmFtIHRvIGl0ZW0gdG8gd2hpY2ggdGhlIHJlc3VsdHMgd2lsbCBiZSBhcHBlbmRlZCB0b1xuICAgICAgICAgKiBAcGFyYW0geCB4IHBvc2l0aW9uIGluIHRoZSBtYXRyaXhcbiAgICAgICAgICogQHBhcmFtIHkgeSBwb3NpdGlvbiBpbiB0aGUgbWF0cml4XG4gICAgICAgICAqIEByZXR1cm5zIGxhc3QgZGlzY292ZXJlZCBpdGVtIG9uIHRoZSBsaXN0XG4gICAgICAgICAqL1xuICAgIH0sIHtcbiAgICAgICAga2V5OiAnYWRkQWxsJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEFsbCh0bywgeCwgeSkge1xuICAgICAgICAgICAgaWYgKHggPiAwICYmIHkgPiAwICYmIHggPCB0aGlzLnhjICYmIHkgPCB0aGlzLnljKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gdGhpcy5tYXRyaXhbeF1beV07XG4gICAgICAgICAgICAgICAgd2hpbGUgKGl0ZW1zLm5leHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtcyA9IGl0ZW1zLm5leHQ7XG4gICAgICAgICAgICAgICAgICAgIHRvLm5leHQgPSBuZXcgRHJvcEl0ZW0oaXRlbXMuZHJvcCk7XG4gICAgICAgICAgICAgICAgICAgIHRvID0gdG8ubmV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdG87XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlZCB0aGUgZHJvcCBmcm9tIGl0cyBjdXJyZW50IHBvc2l0aW9uXG4gICAgICAgICAqIEBwYXJhbSBkcm9wIHRvIGJlIHJlbW92ZWRcbiAgICAgICAgICovXG4gICAgfSwge1xuICAgICAgICBrZXk6ICdyZW1vdmUnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlKGRyb3ApIHtcbiAgICAgICAgICAgIHRoaXMubWF0cml4W2Ryb3AuZ214XVtkcm9wLmdteV0ucmVtb3ZlKGRyb3ApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIENvbGxpc2lvbk1hdHJpeDtcbn0pKCk7XG5cbnZhciBEcm9wSXRlbSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRHJvcEl0ZW0oZHJvcCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRHJvcEl0ZW0pO1xuXG4gICAgICAgIHRoaXMuZHJvcCA9IGRyb3A7XG4gICAgICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgcmFpbmRyb3AgdG8gdGhlIGVuZCBvZiB0aGUgbGlzdC5cbiAgICAgKiBAcGFyYW0gZHJvcCByYWluZHJvcCB0byBiZSBhZGRlZFxuICAgICAqL1xuXG4gICAgX2NyZWF0ZUNsYXNzKERyb3BJdGVtLCBbe1xuICAgICAgICBrZXk6ICdhZGQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gYWRkKGRyb3ApIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gdGhpcztcbiAgICAgICAgICAgIHdoaWxlIChpdGVtLm5leHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGl0ZW0gPSBpdGVtLm5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVtLm5leHQgPSBuZXcgRHJvcEl0ZW0oZHJvcCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyB0aGUgcmFpbmRyb3AgZnJvbSB0aGUgbGlzdC5cbiAgICAgICAgICogQHBhcmFtIGRyb3AgcmFpbmRyb3AgdG8gYmUgcmVtb3ZlZFxuICAgICAgICAgKi9cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlbW92ZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmUoZHJvcCkge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzO1xuICAgICAgICAgICAgdmFyIHByZXZJdGVtID0gbnVsbDtcbiAgICAgICAgICAgIHdoaWxlIChpdGVtLm5leHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHByZXZJdGVtID0gaXRlbTtcbiAgICAgICAgICAgICAgICBpdGVtID0gaXRlbS5uZXh0O1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmRyb3AuZ2lkID09PSBkcm9wLmdpZCkge1xuICAgICAgICAgICAgICAgICAgICBwcmV2SXRlbS5uZXh0ID0gaXRlbS5uZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBEcm9wSXRlbTtcbn0pKCk7XG5cbmV4cG9ydHMuUmFpbnlEYXkgPSBSYWlueURheTsiLCIvKipcbiAqIEVTNiBGSUxFIEZPUiBEYW5jZXJDb250cm9sbGVyIFxuICogMjAxNS0wOC0yNSAwOTowODo0M1xuICovXG5cbi8vIGltcG9ydCAnanF1ZXJ5L2Rpc3QvanF1ZXJ5J1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9yYWlueWRheSA9IHJlcXVpcmUoJ3JhaW55ZGF5Jyk7XG5cbnZhciByYWluTGlzdCA9IHVuZGVmaW5lZCxcbiAgICBjYW52YXMgPSB1bmRlZmluZWQsXG4gICAgZGFuY2VyID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBfcnVuUmFpbigpIHtcbiAgICB2YXIgZW5naW5lID0gbmV3IF9yYWlueWRheS5SYWlueURheSh7XG4gICAgICAgIGlkOiAnbXlEYW5jZXInLFxuICAgICAgICBlbGVtZW50OiBpbWdfZGFuY2VyLFxuICAgICAgICBpbWFnZTogaW1nX2RhbmNlcixcbiAgICAgICAgcGFyZW50RWxlbWVudDogZGFuY2VfY3RuLFxuICAgICAgICBibHVyOiAxMCxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgekluZGV4OiAtMSxcbiAgICAgICAgZnBzOiAzMFxuICAgIH0pO1xuICAgIC8vIGVuZ2luZS5yYWluKFsgWzEsIDIsIDgwMDBdIF0pO1xuICAgIGVuZ2luZS5yYWluKFtbMywgMywgMC44OF0sIFs1LCA1LCAwLjldLCBbNiwgMiwgMV1dLCAxMDApO1xuXG4gICAgdmFyIGVuZ2luZTEgPSBuZXcgX3JhaW55ZGF5LlJhaW55RGF5KHtcbiAgICAgICAgaWQ6ICdteURhbmNlcl8xJyxcbiAgICAgICAgZWxlbWVudDogaW1nX2RhbmNlcl8xLFxuICAgICAgICBpbWFnZTogaW1nX2RhbmNlcl8xLFxuICAgICAgICBwYXJlbnRFbGVtZW50OiBkYW5jZV9jdG4sXG4gICAgICAgIGJsdXI6IDEwLFxuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICB6SW5kZXg6IC0yLFxuICAgICAgICBmcHM6IDMwXG4gICAgfSk7XG5cbiAgICBlbmdpbmUxLnJhaW4oW1szLCAzLCAwLjg4XSwgWzUsIDUsIDAuOV0sIFs2LCAyLCAxXV0sIDEwMCk7XG5cbiAgICByZXR1cm4gW2VuZ2luZSwgZW5naW5lMV07XG59XG5cbnZhciBEYW5jZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERhbmNlcigpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERhbmNlcik7XG5cbiAgICAgICAgdGhpcy5jYWNoZUVsZSgpO1xuICAgICAgICB0aGlzLmluaXROYXZNZW51KCk7XG4gICAgICAgIHRoaXMuaW5pdFJhaW4oKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoRGFuY2VyLCBbe1xuICAgICAgICBrZXk6ICdpbml0UmFpbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0UmFpbigpIHtcbiAgICAgICAgICAgIHdpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmFpbkxpc3QgPSBfcnVuUmFpbigpO1xuICAgICAgICAgICAgICAgIGNhbnZhcyA9IHJhaW5MaXN0WzBdLmNhbnZhcztcblxuICAgICAgICAgICAgICAgIGRhbmNlci5zbGlkZURhbmNlcihyYWluTGlzdCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdpbml0TmF2TWVudScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0TmF2TWVudSgpIHtcbiAgICAgICAgICAgIHRoaXMuJG5hdk1lbnUub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZGFuY2VyLiRuYXZNZW51LnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd0cmFuc0VuZCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB0cmFuc0VuZCh0YXIsIGNiZm4sIGlzT25jZSkge1xuICAgICAgICAgICAgZnVuY3Rpb24gX3JlZihldmVudCkge1xuICAgICAgICAgICAgICAgIGNiZm4oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyICR0YXIgPSAkKHRhcik7XG4gICAgICAgICAgICB2YXIgRU5EX05BTUVTID0ge1xuICAgICAgICAgICAgICAgIFwiTW96XCI6IFwidHJhbnNpdGlvbkVuZFwiLFxuICAgICAgICAgICAgICAgIFwid2Via2l0XCI6IFwid2Via2l0VHJhbnNpdGlvbkVuZFwiLFxuICAgICAgICAgICAgICAgIFwibXNcIjogXCJNU1RyYW5zaXRpb25FbmRcIixcbiAgICAgICAgICAgICAgICBcIk9cIjogXCJvVHJhbnNpdGlvbkVuZFwiXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoIWlzT25jZSkge1xuICAgICAgICAgICAgICAgIF9iaW5kKCR0YXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfb25jZUJpbmQoJHRhcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIF9iaW5kKCR0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAkLmVhY2goRU5EX05BTUVTLCBmdW5jdGlvbiAoaywgdikge1xuICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0Lm9uKHYsIF9yZWYpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gX29uY2VCaW5kKCR0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAkLmVhY2goRU5EX05BTUVTLCBmdW5jdGlvbiAoaywgdikge1xuICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0Lm9uZSh2LCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiZm4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0YXJnZXQudW5iaW5kKHYsIGNiZm4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJHRhci5nZXQoMCkucmVtb3ZlRXZlbnRMaXN0ZW5lcihjYmZuKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlZnJlc2hJbWcnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVmcmVzaEltZygpIHtcbiAgICAgICAgICAgIHZhciAkY2FuID0gJChjYW52YXMpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBfcmVmMihldmVudCkge1xuICAgICAgICAgICAgICAgICRjYW4uY3NzKCdvcGFjaXR5JywgMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMudHJhbnNFbmQoJGNhbiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJhaW4ucmVmcmVzaEltZygnL3N0YXRpYy9jbG91ZC9pbWcvaW5kZXgvMS5qcGcnLCBfcmVmMik7XG4gICAgICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICAgICAgJGNhbi5jc3MoJ29wYWNpdHknLCAwLjYpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdzbGlkZURhbmNlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzbGlkZURhbmNlcigpIHtcbiAgICAgICAgICAgIHZhciAkY2FuID0gJChyYWluTGlzdFswXS5jYW52YXMpLFxuICAgICAgICAgICAgICAgICRjYW4xID0gJChyYWluTGlzdFsxXS5jYW52YXMpO1xuXG4gICAgICAgICAgICAkY2FuMS5hZGRDbGFzcygnb3BhY2l0eV8wJyk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIF9yZWYzKCkge1xuICAgICAgICAgICAgICAgICRjYW4udG9nZ2xlQ2xhc3MoJ29wYWNpdHlfMCcpO1xuICAgICAgICAgICAgICAgICRjYW4xLnRvZ2dsZUNsYXNzKCdvcGFjaXR5XzAnKTtcblxuICAgICAgICAgICAgICAgIF9jeWNsZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBfY3ljbGUoKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChfcmVmMywgNjAwMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF9jeWNsZSgpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdjYWNoZUVsZScsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjYWNoZUVsZSgpIHtcbiAgICAgICAgICAgIHRoaXMuJG5hdiA9ICQoJy5tYWluLW5hdicpO1xuICAgICAgICAgICAgdGhpcy4kbmF2TWVudSA9IHRoaXMuJG5hdi5maW5kKCdhJyk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gRGFuY2VyO1xufSkoKTtcblxuJChmdW5jdGlvbiAoKSB7XG4gICAgZGFuY2VyID0gbmV3IERhbmNlcigpO1xufSk7XG5cbmV4cG9ydHMuRGFuY2VyID0gRGFuY2VyOyJdfQ==
