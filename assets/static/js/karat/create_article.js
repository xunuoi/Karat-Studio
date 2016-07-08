(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * FOR KARAT CREATE ARTICLE
 */

// import 'jquery/dist/jquery'

//FOR SMDITOR
'use strict';

require('simple-module/lib/module');

require('simple-hotkeys/lib/hotkeys');

require('simple-uploader/lib/uploader');

require('simditor/lib/simditor');

require('simditor-autosave/lib/simditor-autosave');

require('simditor-emoji/lib/simditor-emoji');

//check staging
var _staging_host = false;
if (location.href.search('staging') != -1) {
    _staging_host = true;
}

function _ref4(err) {
    console.log(err);
}

function _ref(evt) {
    var $t = $(this);
    var tagName = $t.data('tag');

    $.ajax({
        'url': '/tag/delete/' + tagName,
        'type': 'POST',
        'dataType': 'json'
    }).success(function (rs) {
        console.log(rs);
        $t.parents('span').remove();
    }).fail(_ref4);
}

function _ref2(evt) {
    var $btn = $(this);
    var $nt = $('#tag_list .new_tag');
    var tagName = $nt.val();

    var $eTag = $('<span>\
            <input value="' + tagName + '" type="checkbox" />\
            <label>' + tagName + '</label>\
            <button data-tag="' + tagName + '" class="del_tag">X</button>\
        </span>');

    $.ajax({
        'url': '/tag/add/' + tagName,
        'type': 'POST',
        'dataType': 'json'
    }).success(function (rs) {
        console.log(rs);

        $btn.parent('span').before($eTag);
        // alert(`add tag succeed: ${tagName}`)
        $nt.val('');
    }).fail(function (err) {
        alert('Add tag failed: ' + tagName);
        console.log(err);
    });
}

function _ref3(err) {
    console.log(err);
}

$(function () {

    //init editor
    var editor = new Simditor({
        textarea: $('#article_editor'),
        defaultImage: '/static/img/logo/logo.png',
        pasteImage: true,
        autosave: 'editor-content',
        emoji: {
            imagePath: '/static/lib/simditor-emoji/images/emoji/'
        },
        toolbar: ['emoji', 'bold', 'italic', 'underline', 'strikethrough', '|', 'ol', 'ul', 'blockquote', 'code', '|', 'link', 'image', '|', 'indent', 'outdent'],
        upload: {
            url: '/karat/upload',
            params: null,
            fileKey: 'article_img',
            connectionCount: 5,
            leaveConfirm: 'Uploading is in progress, are you sure to leave this page?'
        }
        //optional options
    });

    //delete tag
    $("#tag_list").on('click', '.del_tag', _ref).on('click', '.add_tag_btn', _ref2);

    //submit post
    $('.btn_post').on('click', function (evt) {
        var $btn = $(this);
        if ($btn.hasClass('disabled')) {
            return false;
        } else {
            $btn.addClass('disabled');
        }

        var $attr = $('ul.article-attr');

        var aid = $attr.find('input[name="article_id"]').val();
        var $checkbox_tag = $('#tag_list input[type=checkbox]');
        var tag_list = [];

        $checkbox_tag.each(function (i, c) {
            var $c = $(c);
            $c.is(':checked') ? tag_list.push($c.val()) : '';
        });
        if ($attr.find('input[name="title"]').val() == '') {
            return alert('Title can not be empty');
        }

        var postContent = editor.getValue();
        var $content = $(postContent);

        var excerpt = $content.text().trim().replace(/\n+/g, '').substring(0, 280);

        var $gallery = $content.find('img');
        var gList = [];
        // alert('ddd')
        // console.log([for ($g of $gallery) $g.attr('src')]);
        $gallery.each(function () {
            var imgUrl = $(this).attr('src');
            //filter the emoji
            !imgUrl.match('simditor-emoji/images/emoji/') ? gList.push(imgUrl) : 'pass';
        });
        function resetForm() {
            $attr.find('input[name="title"]').val('无标题');
            editor.setValue('');
        }
        var subData = {
            'content': postContent,
            'excerpt': excerpt,
            'img': gList, //just gallery
            'title': $attr.find('input[name="title"]').val(),
            'author': $attr.find('input[name="author"]').val(),
            'type': $attr.find('select[name="type"]').val(),
            'en_gallery': $attr.find('input[name="en_gallery"]').is(':checked') ? true : false,
            'enable': $attr.find('input[name="enable"]').is(':checked') ? true : false,
            'tag': tag_list
        };
        //如果是编辑，那么将aid传回到后台
        if (aid) subData['article_id'] = aid;

        $.ajax({
            'url': '/karat/article_update',
            'type': 'POST',
            'dataType': 'json',
            'data': subData

        }).success(function (rs) {
            console.log(rs);
            if (rs['state'] == 'succeed') {
                alert('Submit Succeed! ');

                if (!aid && !_staging_host) {
                    //如果是新建文章，那么完成后重置
                    resetForm();
                }
                // location.reload()
            }
        }).fail(_ref3).complete(function (rs) {
            $btn.removeClass('disabled');
        });
    });
});
},{"simditor-autosave/lib/simditor-autosave":2,"simditor-emoji/lib/simditor-emoji":3,"simditor/lib/simditor":4,"simple-hotkeys/lib/hotkeys":5,"simple-module/lib/module":6,"simple-uploader/lib/uploader":7}],2:[function(require,module,exports){
(function (root, factory) {
  
  root['SimditorAutosave'] = factory(jQuery,SimpleModule,Simditor);
  
}(window, function ($, SimpleModule, Simditor) {

var SimditorAutosave,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SimditorAutosave = (function(superClass) {
  extend(SimditorAutosave, superClass);

  function SimditorAutosave() {
    return SimditorAutosave.__super__.constructor.apply(this, arguments);
  }

  SimditorAutosave.pluginName = 'Autosave';

  SimditorAutosave.prototype.opts = {
    autosave: true,
    autosavePath: null
  };

  SimditorAutosave.prototype._init = function() {
    var currentVal, link, name, val;
    this.editor = this._module;
    if (!this.opts.autosave) {
      return;
    }
    this.name = typeof this.opts.autosave === 'string' ? this.opts.autosave : 'simditor';
    if (this.opts.autosavePath) {
      this.path = this.opts.autosavePath;
    } else {
      link = $("<a/>", {
        href: location.href
      });
      name = this.editor.textarea.data('autosave') || this.name;
      this.path = "/" + (link[0].pathname.replace(/\/$/g, "").replace(/^\//g, "")) + "/autosave/" + name + "/";
    }
    if (!this.path) {
      return;
    }
    this.editor.on("valuechanged", (function(_this) {
      return function() {
        return _this.storage.set(_this.path, _this.editor.getValue());
      };
    })(this));
    this.editor.el.closest('form').on('ajax:success.simditor-' + this.editor.id, (function(_this) {
      return function(e) {
        return _this.storage.remove(_this.path);
      };
    })(this));
    val = this.storage.get(this.path);
    if (!val) {
      return;
    }
    currentVal = this.editor.textarea.val();
    if (val === currentVal) {
      return;
    }
    if (this.editor.textarea.is('[data-autosave-confirm]')) {
      if (confirm(this.editor.textarea.data('autosave-confirm') || 'Are you sure to restore unsaved changes?')) {
        return this.editor.setValue(val);
      } else {
        return this.storage.remove(this.path);
      }
    } else {
      return this.editor.setValue(val);
    }
  };

  SimditorAutosave.prototype.storage = {
    supported: function() {
      var error;
      try {
        localStorage.setItem('_storageSupported', 'yes');
        localStorage.removeItem('_storageSupported');
        return true;
      } catch (_error) {
        error = _error;
        return false;
      }
    },
    set: function(key, val, session) {
      var storage;
      if (session == null) {
        session = false;
      }
      if (!this.supported()) {
        return;
      }
      storage = session ? sessionStorage : localStorage;
      return storage.setItem(key, val);
    },
    get: function(key, session) {
      var storage;
      if (session == null) {
        session = false;
      }
      if (!this.supported()) {
        return;
      }
      storage = session ? sessionStorage : localStorage;
      return storage[key];
    },
    remove: function(key, session) {
      var storage;
      if (session == null) {
        session = false;
      }
      if (!this.supported()) {
        return;
      }
      storage = session ? sessionStorage : localStorage;
      return storage.removeItem(key);
    }
  };

  return SimditorAutosave;

})(SimpleModule);

Simditor.connect(SimditorAutosave);

return SimditorAutosave;

}));

},{}],3:[function(require,module,exports){
(function (root, factory) {

    root['SimditorEmoji'] = factory(jQuery,Simditor);
  
}(window, function ($, Simditor) {

var EmojiButton,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

EmojiButton = (function(superClass) {
  extend(EmojiButton, superClass);

  EmojiButton.i18n = {
    'zh-CN': {
      emoji: '表情'
    },
    'en-US': {
      emoji: 'emoji'
    }
  };

  EmojiButton.images = ['smile', 'smiley', 'laughing', 'blush', 'heart_eyes', 'smirk', 'flushed', 'grin', 'wink', 'kissing_closed_eyes', 'stuck_out_tongue_winking_eye', 'stuck_out_tongue', 'sleeping', 'worried', 'expressionless', 'sweat_smile', 'cold_sweat', 'joy', 'sob', 'angry', 'mask', 'scream', 'sunglasses', 'heart', 'broken_heart', 'star', 'anger', 'exclamation', 'question', 'zzz', 'thumbsup', 'thumbsdown', 'ok_hand', 'punch', 'v', 'clap', 'muscle', 'pray', 'skull', 'trollface'];

  EmojiButton.prototype.name = 'emoji';

  EmojiButton.prototype.icon = 'smile-o';

  EmojiButton.prototype.menu = true;

  function EmojiButton() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    EmojiButton.__super__.constructor.apply(this, args);
    $.merge(this.editor.formatter._allowedAttributes['img'], ['data-emoji', 'alt']);
  }

  EmojiButton.prototype.renderMenu = function() {
    var $list, dir, html, i, len, name, opts, ref, tpl;
    tpl = '<ul class="emoji-list">\n</ul>';
    opts = $.extend({
      imagePath: 'images/emoji/',
      images: EmojiButton.images
    }, this.editor.opts.emoji || {});
    html = "";
    dir = opts.imagePath.replace(/\/$/, '') + '/';
    ref = opts.images;
    for (i = 0, len = ref.length; i < len; i++) {
      name = ref[i];
      html += "<li data-name='" + name + "'><img src='" + dir + name + ".png' width='20' height='20' alt='" + name + "' /></li>";
    }
    $list = $(tpl);
    $list.html(html).appendTo(this.menuWrapper);
    return $list.on('mousedown', 'li', (function(_this) {
      return function(e) {
        var $img;
        _this.wrapper.removeClass('menu-on');
        if (!_this.editor.inputManager.focused) {
          return;
        }
        $img = $(e.currentTarget).find('img').clone().attr({
          'data-emoji': true,
          'data-non-image': true
        });
        _this.editor.selection.insertNode($img);
        _this.editor.trigger('valuechanged');
        _this.editor.trigger('selectionchanged');
        return false;
      };
    })(this));
  };

  EmojiButton.prototype.status = function() {};

  return EmojiButton;

})(Simditor.Button);

Simditor.Toolbar.addButton(EmojiButton);

return EmojiButton;

}));

},{}],4:[function(require,module,exports){
/*!
* Simditor v2.2.3
* http://simditor.tower.im/
* 2015-08-22
*/
(function (root, factory) {

  //@Cloud debug for es6 using...
   
  root['Simditor'] = factory(jQuery,SimpleModule,simple.hotkeys,simple.uploader);

}(window, function ($, SimpleModule, simpleHotkeys, simpleUploader) {

var AlignmentButton, BlockquoteButton, BoldButton, Button, CodeButton, CodePopover, ColorButton, Formatter, HrButton, ImageButton, ImagePopover, IndentButton, Indentation, InputManager, ItalicButton, Keystroke, LinkButton, LinkPopover, ListButton, OrderListButton, OutdentButton, Popover, Selection, Simditor, StrikethroughButton, TableButton, TitleButton, Toolbar, UnderlineButton, UndoManager, UnorderListButton, Util,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

Selection = (function(superClass) {
  extend(Selection, superClass);

  function Selection() {
    return Selection.__super__.constructor.apply(this, arguments);
  }

  Selection.pluginName = 'Selection';

  Selection.prototype._range = null;

  Selection.prototype._startNodes = null;

  Selection.prototype._endNodes = null;

  Selection.prototype._containerNode = null;

  Selection.prototype._nodes = null;

  Selection.prototype._blockNodes = null;

  Selection.prototype._rootNodes = null;

  Selection.prototype._init = function() {
    this.editor = this._module;
    this._selection = document.getSelection();
    this.editor.on('selectionchanged', (function(_this) {
      return function(e) {
        _this._reset();
        return _this._range = _this._selection.getRangeAt(0);
      };
    })(this));
    return this.editor.on('blur', (function(_this) {
      return function(e) {
        return _this.clear();
      };
    })(this));
  };

  Selection.prototype._reset = function() {
    this._range = null;
    this._startNodes = null;
    this._endNodes = null;
    this._containerNode = null;
    this._nodes = null;
    this._blockNodes = null;
    return this._rootNodes = null;
  };

  Selection.prototype.clear = function() {
    var e;
    try {
      this._selection.removeAllRanges();
    } catch (_error) {
      e = _error;
    }
    return this._reset();
  };

  Selection.prototype.range = function(range) {
    var ffOrIE;
    if (range) {
      this.clear();
      this._selection.addRange(range);
      this._range = range;
      ffOrIE = this.editor.util.browser.firefox || this.editor.util.browser.msie;
      if (!this.editor.inputManager.focused && ffOrIE) {
        this.editor.body.focus();
      }
    } else if (!this._range && this.editor.inputManager.focused && this._selection.rangeCount) {
      this._range = this._selection.getRangeAt(0);
    }
    return this._range;
  };

  Selection.prototype.startNodes = function() {
    if (this._range) {
      this._startNodes || (this._startNodes = (function(_this) {
        return function() {
          var startNodes;
          startNodes = $(_this._range.startContainer).parentsUntil(_this.editor.body).get();
          startNodes.unshift(_this._range.startContainer);
          return $(startNodes);
        };
      })(this)());
    }
    return this._startNodes;
  };

  Selection.prototype.endNodes = function() {
    var endNodes;
    if (this._range) {
      this._endNodes || (this._endNodes = this._range.collapsed ? this.startNodes() : (endNodes = $(this._range.endContainer).parentsUntil(this.editor.body).get(), endNodes.unshift(this._range.endContainer), $(endNodes)));
    }
    return this._endNodes;
  };

  Selection.prototype.containerNode = function() {
    if (this._range) {
      this._containerNode || (this._containerNode = $(this._range.commonAncestorContainer));
    }
    return this._containerNode;
  };

  Selection.prototype.nodes = function() {
    if (this._range) {
      this._nodes || (this._nodes = (function(_this) {
        return function() {
          var nodes;
          nodes = [];
          if (_this.startNodes().first().is(_this.endNodes().first())) {
            nodes = _this.startNodes().get();
          } else {
            _this.startNodes().each(function(i, node) {
              var $endNode, $node, $nodes, endIndex, index, sharedIndex, startIndex;
              $node = $(node);
              if (_this.endNodes().index($node) > -1) {
                return nodes.push(node);
              } else if ($node.parent().is(_this.editor.body) || (sharedIndex = _this.endNodes().index($node.parent())) > -1) {
                if (sharedIndex && sharedIndex > -1) {
                  $endNode = _this.endNodes().eq(sharedIndex - 1);
                } else {
                  $endNode = _this.endNodes().last();
                }
                $nodes = $node.parent().contents();
                startIndex = $nodes.index($node);
                endIndex = $nodes.index($endNode);
                return $.merge(nodes, $nodes.slice(startIndex, endIndex).get());
              } else {
                $nodes = $node.parent().contents();
                index = $nodes.index($node);
                return $.merge(nodes, $nodes.slice(index).get());
              }
            });
            _this.endNodes().each(function(i, node) {
              var $node, $nodes, index;
              $node = $(node);
              if ($node.parent().is(_this.editor.body) || _this.startNodes().index($node.parent()) > -1) {
                nodes.push(node);
                return false;
              } else {
                $nodes = $node.parent().contents();
                index = $nodes.index($node);
                return $.merge(nodes, $nodes.slice(0, index + 1));
              }
            });
          }
          return $($.unique(nodes));
        };
      })(this)());
    }
    return this._nodes;
  };

  Selection.prototype.blockNodes = function() {
    if (!this._range) {
      return;
    }
    this._blockNodes || (this._blockNodes = (function(_this) {
      return function() {
        return _this.nodes().filter(function(i, node) {
          return _this.editor.util.isBlockNode(node);
        });
      };
    })(this)());
    return this._blockNodes;
  };

  Selection.prototype.rootNodes = function() {
    if (!this._range) {
      return;
    }
    this._rootNodes || (this._rootNodes = (function(_this) {
      return function() {
        return _this.nodes().filter(function(i, node) {
          var $parent;
          $parent = $(node).parent();
          return $parent.is(_this.editor.body) || $parent.is('blockquote');
        });
      };
    })(this)());
    return this._rootNodes;
  };

  Selection.prototype.rangeAtEndOf = function(node, range) {
    var afterLastNode, beforeLastNode, endNode, endNodeLength, lastNodeIsBr, result;
    if (range == null) {
      range = this.range();
    }
    if (!(range && range.collapsed)) {
      return;
    }
    node = $(node)[0];
    endNode = range.endContainer;
    endNodeLength = this.editor.util.getNodeLength(endNode);
    beforeLastNode = range.endOffset === endNodeLength - 1;
    lastNodeIsBr = $(endNode).contents().last().is('br');
    afterLastNode = range.endOffset === endNodeLength;
    if (!((beforeLastNode && lastNodeIsBr) || afterLastNode)) {
      return false;
    }
    if (node === endNode) {
      return true;
    } else if (!$.contains(node, endNode)) {
      return false;
    }
    result = true;
    $(endNode).parentsUntil(node).addBack().each(function(i, n) {
      var $lastChild, beforeLastbr, isLastNode, nodes;
      nodes = $(n).parent().contents().filter(function() {
        return !(this !== n && this.nodeType === 3 && !this.nodeValue);
      });
      $lastChild = nodes.last();
      isLastNode = $lastChild.get(0) === n;
      beforeLastbr = $lastChild.is('br') && $lastChild.prev().get(0) === n;
      if (!(isLastNode || beforeLastbr)) {
        result = false;
        return false;
      }
    });
    return result;
  };

  Selection.prototype.rangeAtStartOf = function(node, range) {
    var result, startNode;
    if (range == null) {
      range = this.range();
    }
    if (!(range && range.collapsed)) {
      return;
    }
    node = $(node)[0];
    startNode = range.startContainer;
    if (range.startOffset !== 0) {
      return false;
    }
    if (node === startNode) {
      return true;
    } else if (!$.contains(node, startNode)) {
      return false;
    }
    result = true;
    $(startNode).parentsUntil(node).addBack().each(function(i, n) {
      var nodes;
      nodes = $(n).parent().contents().filter(function() {
        return !(this !== n && this.nodeType === 3 && !this.nodeValue);
      });
      if (nodes.first().get(0) !== n) {
        return result = false;
      }
    });
    return result;
  };

  Selection.prototype.insertNode = function(node, range) {
    if (range == null) {
      range = this.range();
    }
    if (!range) {
      return;
    }
    node = $(node)[0];
    range.insertNode(node);
    return this.setRangeAfter(node, range);
  };

  Selection.prototype.setRangeAfter = function(node, range) {
    if (range == null) {
      range = this.range();
    }
    if (range == null) {
      return;
    }
    node = $(node)[0];
    range.setEndAfter(node);
    range.collapse(false);
    return this.range(range);
  };

  Selection.prototype.setRangeBefore = function(node, range) {
    if (range == null) {
      range = this.range();
    }
    if (range == null) {
      return;
    }
    node = $(node)[0];
    range.setEndBefore(node);
    range.collapse(false);
    return this.range(range);
  };

  Selection.prototype.setRangeAtStartOf = function(node, range) {
    if (range == null) {
      range = this.range();
    }
    node = $(node).get(0);
    range.setEnd(node, 0);
    range.collapse(false);
    return this.range(range);
  };

  Selection.prototype.setRangeAtEndOf = function(node, range) {
    var $lastNode, $node, contents, lastChild, lastChildLength, lastText, nodeLength;
    if (range == null) {
      range = this.range();
    }
    $node = $(node);
    node = $node[0];
    if ($node.is('pre')) {
      contents = $node.contents();
      if (contents.length > 0) {
        lastChild = contents.last();
        lastText = lastChild.text();
        lastChildLength = this.editor.util.getNodeLength(lastChild[0]);
        if (lastText.charAt(lastText.length - 1) === '\n') {
          range.setEnd(lastChild[0], lastChildLength - 1);
        } else {
          range.setEnd(lastChild[0], lastChildLength);
        }
      } else {
        range.setEnd(node, 0);
      }
    } else {
      nodeLength = this.editor.util.getNodeLength(node);
      if (node.nodeType !== 3 && nodeLength > 0) {
        $lastNode = $(node).contents().last();
        if ($lastNode.is('br')) {
          nodeLength -= 1;
        } else if ($lastNode[0].nodeType !== 3 && this.editor.util.isEmptyNode($lastNode)) {
          $lastNode.append(this.editor.util.phBr);
          node = $lastNode[0];
          nodeLength = 0;
        }
      }
      range.setEnd(node, nodeLength);
    }
    range.collapse(false);
    return this.range(range);
  };

  Selection.prototype.deleteRangeContents = function(range) {
    var atEndOfBody, atStartOfBody, endRange, startRange;
    if (range == null) {
      range = this.range();
    }
    startRange = range.cloneRange();
    endRange = range.cloneRange();
    startRange.collapse(true);
    endRange.collapse(false);
    atStartOfBody = this.rangeAtStartOf(this.editor.body, startRange);
    atEndOfBody = this.rangeAtEndOf(this.editor.body, endRange);
    if (!range.collapsed && atStartOfBody && atEndOfBody) {
      this.editor.body.empty();
      range.setStart(this.editor.body[0], 0);
      range.collapse(true);
      this.range(range);
    } else {
      range.deleteContents();
    }
    return range;
  };

  Selection.prototype.breakBlockEl = function(el, range) {
    var $el;
    if (range == null) {
      range = this.range();
    }
    $el = $(el);
    if (!range.collapsed) {
      return $el;
    }
    range.setStartBefore($el.get(0));
    if (range.collapsed) {
      return $el;
    }
    return $el.before(range.extractContents());
  };

  Selection.prototype.save = function(range) {
    var endCaret, endRange, startCaret;
    if (range == null) {
      range = this.range();
    }
    if (this._selectionSaved) {
      return;
    }
    endRange = range.cloneRange();
    endRange.collapse(false);
    startCaret = $('<span/>').addClass('simditor-caret-start');
    endCaret = $('<span/>').addClass('simditor-caret-end');
    endRange.insertNode(endCaret[0]);
    range.insertNode(startCaret[0]);
    this.clear();
    return this._selectionSaved = true;
  };

  Selection.prototype.restore = function() {
    var endCaret, endContainer, endOffset, range, startCaret, startContainer, startOffset;
    if (!this._selectionSaved) {
      return false;
    }
    startCaret = this.editor.body.find('.simditor-caret-start');
    endCaret = this.editor.body.find('.simditor-caret-end');
    if (startCaret.length && endCaret.length) {
      startContainer = startCaret.parent();
      startOffset = startContainer.contents().index(startCaret);
      endContainer = endCaret.parent();
      endOffset = endContainer.contents().index(endCaret);
      if (startContainer[0] === endContainer[0]) {
        endOffset -= 1;
      }
      range = document.createRange();
      range.setStart(startContainer.get(0), startOffset);
      range.setEnd(endContainer.get(0), endOffset);
      startCaret.remove();
      endCaret.remove();
      this.range(range);
    } else {
      startCaret.remove();
      endCaret.remove();
    }
    this._selectionSaved = false;
    return range;
  };

  return Selection;

})(SimpleModule);

Formatter = (function(superClass) {
  extend(Formatter, superClass);

  function Formatter() {
    return Formatter.__super__.constructor.apply(this, arguments);
  }

  Formatter.pluginName = 'Formatter';

  Formatter.prototype.opts = {
    allowedTags: [],
    allowedAttributes: {},
    allowedStyles: {}
  };

  Formatter.prototype._init = function() {
    this.editor = this._module;
    this._allowedTags = $.merge(['br', 'span', 'a', 'img', 'b', 'strong', 'i', 'u', 'font', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'hr'], this.opts.allowedTags);
    this._allowedAttributes = $.extend({
      img: ['src', 'alt', 'width', 'height', 'data-non-image'],
      a: ['href', 'target'],
      font: ['color'],
      code: ['class']
    }, this.opts.allowedAttributes);
    this._allowedStyles = $.extend({
      span: ['color'],
      p: ['margin-left', 'text-align'],
      h1: ['margin-left', 'text-align'],
      h2: ['margin-left', 'text-align'],
      h3: ['margin-left', 'text-align'],
      h4: ['margin-left', 'text-align']
    }, this.opts.allowedStyles);
    return this.editor.body.on('click', 'a', function(e) {
      return false;
    });
  };

  Formatter.prototype.decorate = function($el) {
    if ($el == null) {
      $el = this.editor.body;
    }
    this.editor.trigger('decorate', [$el]);
    return $el;
  };

  Formatter.prototype.undecorate = function($el) {
    if ($el == null) {
      $el = this.editor.body.clone();
    }
    this.editor.trigger('undecorate', [$el]);
    return $el;
  };

  Formatter.prototype.autolink = function($el) {
    var $link, $node, findLinkNode, k, lastIndex, len, linkNodes, match, re, replaceEls, subStr, text, uri;
    if ($el == null) {
      $el = this.editor.body;
    }
    linkNodes = [];
    findLinkNode = function($parentNode) {
      return $parentNode.contents().each(function(i, node) {
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
        $link = $("<a taget=\"_blank\" href=\"" + uri + "\" rel=\"nofollow\"></a>").text(match[0]);
        replaceEls.push($link[0]);
      }
      replaceEls.push(document.createTextNode(text.substring(lastIndex)));
      $node.replaceWith($(replaceEls));
    }
    return $el;
  };

  Formatter.prototype.format = function($el) {
    var $node, blockNode, k, l, len, len1, n, node, ref, ref1;
    if ($el == null) {
      $el = this.editor.body;
    }
    if ($el.is(':empty')) {
      $el.append('<p>' + this.editor.util.phBr + '</p>');
      return $el;
    }
    ref = $el.contents();
    for (k = 0, len = ref.length; k < len; k++) {
      n = ref[k];
      this.cleanNode(n, true);
    }
    ref1 = $el.contents();
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      node = ref1[l];
      $node = $(node);
      if ($node.is('br')) {
        if (typeof blockNode !== "undefined" && blockNode !== null) {
          blockNode = null;
        }
        $node.remove();
      } else if (this.editor.util.isBlockNode(node)) {
        if ($node.is('li')) {
          if (blockNode && blockNode.is('ul, ol')) {
            blockNode.append(node);
          } else {
            blockNode = $('<ul/>').insertBefore(node);
            blockNode.append(node);
          }
        } else {
          blockNode = null;
        }
      } else {
        if (!blockNode || blockNode.is('ul, ol')) {
          blockNode = $('<p/>').insertBefore(node);
        }
        blockNode.append(node);
      }
    }
    return $el;
  };

  Formatter.prototype.cleanNode = function(node, recursive) {
    var $childImg, $node, $p, $td, allowedAttributes, attr, contents, isDecoration, k, l, len, len1, n, ref, ref1, text, textNode;
    $node = $(node);
    if (!($node.length > 0)) {
      return;
    }
    if ($node[0].nodeType === 3) {
      text = $node.text().replace(/(\r\n|\n|\r)/gm, '');
      if (text) {
        textNode = document.createTextNode(text);
        $node.replaceWith(textNode);
      } else {
        $node.remove();
      }
      return;
    }
    contents = $node.is('iframe') ? null : $node.contents();
    isDecoration = this.editor.util.isDecoratedNode($node);
    if ($node.is(this._allowedTags.join(',')) || isDecoration) {
      if ($node.is('a') && ($childImg = $node.find('img')).length > 0) {
        $node.replaceWith($childImg);
        $node = $childImg;
        contents = null;
      }
      if ($node.is('img') && $node.hasClass('uploading')) {
        $node.remove();
      }
      if (!isDecoration) {
        allowedAttributes = this._allowedAttributes[$node[0].tagName.toLowerCase()];
        ref = $.makeArray($node[0].attributes);
        for (k = 0, len = ref.length; k < len; k++) {
          attr = ref[k];
          if (attr.name === 'style') {
            continue;
          }
          if (!((allowedAttributes != null) && (ref1 = attr.name, indexOf.call(allowedAttributes, ref1) >= 0))) {
            $node.removeAttr(attr.name);
          }
        }
        this._cleanNodeStyles($node);
        if ($node.is('span') && $node[0].attributes.length === 0) {
          $node.contents().first().unwrap();
        }
      }
    } else if ($node[0].nodeType === 1 && !$node.is(':empty')) {
      if ($node.is('div, article, dl, header, footer, tr')) {
        $node.append('<br/>');
        contents.first().unwrap();
      } else if ($node.is('table')) {
        $p = $('<p/>');
        $node.find('tr').each(function(i, tr) {
          return $p.append($(tr).text() + '<br/>');
        });
        $node.replaceWith($p);
        contents = null;
      } else if ($node.is('thead, tfoot')) {
        $node.remove();
        contents = null;
      } else if ($node.is('th')) {
        $td = $('<td/>').append($node.contents());
        $node.replaceWith($td);
      } else {
        contents.first().unwrap();
      }
    } else {
      $node.remove();
      contents = null;
    }
    if (recursive && (contents != null) && !$node.is('pre')) {
      for (l = 0, len1 = contents.length; l < len1; l++) {
        n = contents[l];
        this.cleanNode(n, true);
      }
    }
    return null;
  };

  Formatter.prototype._cleanNodeStyles = function($node) {
    var allowedStyles, k, len, pair, ref, ref1, style, styleStr, styles;
    styleStr = $node.attr('style');
    if (!styleStr) {
      return;
    }
    $node.removeAttr('style');
    allowedStyles = this._allowedStyles[$node[0].tagName.toLowerCase()];
    if (!(allowedStyles && allowedStyles.length > 0)) {
      return $node;
    }
    styles = {};
    ref = styleStr.split(';');
    for (k = 0, len = ref.length; k < len; k++) {
      style = ref[k];
      style = $.trim(style);
      pair = style.split(':');
      if (!(pair.length = 2)) {
        continue;
      }
      if (ref1 = pair[0], indexOf.call(allowedStyles, ref1) >= 0) {
        styles[$.trim(pair[0])] = $.trim(pair[1]);
      }
    }
    if (Object.keys(styles).length > 0) {
      $node.css(styles);
    }
    return $node;
  };

  Formatter.prototype.clearHtml = function(html, lineBreak) {
    var container, contents, result;
    if (lineBreak == null) {
      lineBreak = true;
    }
    container = $('<div/>').append(html);
    contents = container.contents();
    result = '';
    contents.each((function(_this) {
      return function(i, node) {
        var $node, children;
        if (node.nodeType === 3) {
          return result += node.nodeValue;
        } else if (node.nodeType === 1) {
          $node = $(node);
          children = $node.is('iframe') ? null : $node.contents();
          if (children && children.length > 0) {
            result += _this.clearHtml(children);
          }
          if (lineBreak && i < contents.length - 1 && $node.is('br, p, div, li,tr, pre, address, artticle, aside, dl, figcaption, footer, h1, h2,h3, h4, header')) {
            return result += '\n';
          }
        }
      };
    })(this));
    return result;
  };

  Formatter.prototype.beautify = function($contents) {
    var uselessP;
    uselessP = function($el) {
      return !!($el.is('p') && !$el.text() && $el.children(':not(br)').length < 1);
    };
    return $contents.each(function(i, el) {
      var $el, invalid;
      $el = $(el);
      invalid = $el.is(':not(img, br, col, td, hr, [class^="simditor-"]):empty');
      if (invalid || uselessP($el)) {
        $el.remove();
      }
      return $el.find(':not(img, br, col, td, hr, [class^="simditor-"]):empty').remove();
    });
  };

  return Formatter;

})(SimpleModule);

InputManager = (function(superClass) {
  extend(InputManager, superClass);

  function InputManager() {
    return InputManager.__super__.constructor.apply(this, arguments);
  }

  InputManager.pluginName = 'InputManager';

  InputManager.prototype.opts = {
    pasteImage: false
  };

  InputManager.prototype._modifierKeys = [16, 17, 18, 91, 93, 224];

  InputManager.prototype._arrowKeys = [37, 38, 39, 40];

  InputManager.prototype._init = function() {
    var submitKey;
    this.editor = this._module;
    this.throttledValueChanged = this.editor.util.throttle((function(_this) {
      return function(params) {
        return setTimeout(function() {
          return _this.editor.trigger('valuechanged', params);
        }, 10);
      };
    })(this), 300);
    this.throttledSelectionChanged = this.editor.util.throttle((function(_this) {
      return function() {
        return _this.editor.trigger('selectionchanged');
      };
    })(this), 50);
    if (this.opts.pasteImage && typeof this.opts.pasteImage !== 'string') {
      this.opts.pasteImage = 'inline';
    }
    this._keystrokeHandlers = {};
    this.hotkeys = simpleHotkeys({
      el: this.editor.body
    });
    this._pasteArea = $('<div/>').css({
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      position: 'fixed',
      right: '0',
      bottom: '100px'
    }).attr({
      tabIndex: '-1',
      contentEditable: true
    }).addClass('simditor-paste-area').appendTo(this.editor.el);
    $(document).on('selectionchange.simditor' + this.editor.id, (function(_this) {
      return function(e) {
        if (!_this.focused) {
          return;
        }
        return _this.throttledSelectionChanged();
      };
    })(this));
    this.editor.on('valuechanged', (function(_this) {
      return function() {
        _this.lastCaretPosition = null;
        if (_this.focused && !_this.editor.selection.blockNodes().length) {
          _this.editor.selection.save();
          _this.editor.formatter.format();
          _this.editor.selection.restore();
        }
        _this.editor.body.find('hr, pre, .simditor-table').each(function(i, el) {
          var $el, formatted;
          $el = $(el);
          if ($el.parent().is('blockquote') || $el.parent()[0] === _this.editor.body[0]) {
            formatted = false;
            if ($el.next().length === 0) {
              $('<p/>').append(_this.editor.util.phBr).insertAfter($el);
              formatted = true;
            }
            if ($el.prev().length === 0) {
              $('<p/>').append(_this.editor.util.phBr).insertBefore($el);
              formatted = true;
            }
            if (formatted) {
              return _this.throttledValueChanged();
            }
          }
        });
        _this.editor.body.find('pre:empty').append(_this.editor.util.phBr);
        if (!_this.editor.util.support.onselectionchange && _this.focused) {
          return _this.throttledSelectionChanged();
        }
      };
    })(this));
    this.editor.body.on('keydown', $.proxy(this._onKeyDown, this)).on('keypress', $.proxy(this._onKeyPress, this)).on('keyup', $.proxy(this._onKeyUp, this)).on('mouseup', $.proxy(this._onMouseUp, this)).on('focus', $.proxy(this._onFocus, this)).on('blur', $.proxy(this._onBlur, this)).on('paste', $.proxy(this._onPaste, this)).on('drop', $.proxy(this._onDrop, this)).on('input', $.proxy(this._onInput, this));
    if (this.editor.util.browser.firefox) {
      this.addShortcut('cmd+left', (function(_this) {
        return function(e) {
          e.preventDefault();
          _this.editor.selection._selection.modify('move', 'backward', 'lineboundary');
          return false;
        };
      })(this));
      this.addShortcut('cmd+right', (function(_this) {
        return function(e) {
          e.preventDefault();
          _this.editor.selection._selection.modify('move', 'forward', 'lineboundary');
          return false;
        };
      })(this));
      this.addShortcut((this.editor.util.os.mac ? 'cmd+a' : 'ctrl+a'), (function(_this) {
        return function(e) {
          var $children, firstBlock, lastBlock, range;
          $children = _this.editor.body.children();
          if (!($children.length > 0)) {
            return;
          }
          firstBlock = $children.first().get(0);
          lastBlock = $children.last().get(0);
          range = document.createRange();
          range.setStart(firstBlock, 0);
          range.setEnd(lastBlock, _this.editor.util.getNodeLength(lastBlock));
          _this.editor.selection.range(range);
          return false;
        };
      })(this));
    }
    submitKey = this.editor.util.os.mac ? 'cmd+enter' : 'ctrl+enter';
    this.addShortcut(submitKey, (function(_this) {
      return function(e) {
        _this.editor.el.closest('form').find('button:submit').click();
        return false;
      };
    })(this));
    if (this.editor.textarea.attr('autofocus')) {
      return setTimeout((function(_this) {
        return function() {
          return _this.editor.focus();
        };
      })(this), 0);
    }
  };

  InputManager.prototype._onFocus = function(e) {
    this.editor.el.addClass('focus').removeClass('error');
    this.focused = true;
    this.lastCaretPosition = null;
    return setTimeout((function(_this) {
      return function() {
        _this.editor.triggerHandler('focus');
        if (!_this.editor.util.support.onselectionchange) {
          return _this.throttledSelectionChanged();
        }
      };
    })(this), 0);
  };

  InputManager.prototype._onBlur = function(e) {
    var ref;
    this.editor.el.removeClass('focus');
    this.editor.sync();
    this.focused = false;
    this.lastCaretPosition = (ref = this.editor.undoManager.currentState()) != null ? ref.caret : void 0;
    return this.editor.triggerHandler('blur');
  };

  InputManager.prototype._onMouseUp = function(e) {
    if (!this.editor.util.support.onselectionchange) {
      return this.throttledSelectionChanged();
    }
  };

  InputManager.prototype._onKeyDown = function(e) {
    var base, ref, ref1, result;
    if (this.editor.triggerHandler(e) === false) {
      return false;
    }
    if (this.hotkeys.respondTo(e)) {
      return;
    }
    if (e.which in this._keystrokeHandlers) {
      result = typeof (base = this._keystrokeHandlers[e.which])['*'] === "function" ? base['*'](e) : void 0;
      if (result) {
        this.throttledValueChanged();
        return false;
      }
      this.editor.selection.startNodes().each((function(_this) {
        return function(i, node) {
          var handler, ref;
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }
          handler = (ref = _this._keystrokeHandlers[e.which]) != null ? ref[node.tagName.toLowerCase()] : void 0;
          result = typeof handler === "function" ? handler(e, $(node)) : void 0;
          if (result === true || result === false) {
            return false;
          }
        };
      })(this));
      if (result) {
        this.throttledValueChanged();
        return false;
      }
    }
    if ((ref = e.which, indexOf.call(this._modifierKeys, ref) >= 0) || (ref1 = e.which, indexOf.call(this._arrowKeys, ref1) >= 0)) {
      return;
    }
    if (this.editor.util.metaKey(e) && e.which === 86) {
      return;
    }
    if (!this.editor.util.support.oninput) {
      this.throttledValueChanged(['typing']);
    }
    return null;
  };

  InputManager.prototype._onKeyPress = function(e) {
    if (this.editor.triggerHandler(e) === false) {
      return false;
    }
  };

  InputManager.prototype._onKeyUp = function(e) {
    var p, ref;
    if (this.editor.triggerHandler(e) === false) {
      return false;
    }
    if (!this.editor.util.support.onselectionchange && (ref = e.which, indexOf.call(this._arrowKeys, ref) >= 0)) {
      this.throttledValueChanged();
      return;
    }
    if ((e.which === 8 || e.which === 46) && this.editor.util.isEmptyNode(this.editor.body)) {
      this.editor.body.empty();
      p = $('<p/>').append(this.editor.util.phBr).appendTo(this.editor.body);
      this.editor.selection.setRangeAtStartOf(p);
    }
  };

  InputManager.prototype._onPaste = function(e) {
    var $blockEl, cleanPaste, imageFile, pasteContent, pasteItem, processPasteContent, range, ref, uploadOpt;
    if (this.editor.triggerHandler(e) === false) {
      return false;
    }
    range = this.editor.selection.deleteRangeContents();
    if (!range.collapsed) {
      range.collapse(true);
    }
    this.editor.selection.range(range);
    $blockEl = this.editor.selection.blockNodes().last();
    cleanPaste = $blockEl.is('pre, table');
    if (e.originalEvent.clipboardData && e.originalEvent.clipboardData.items && e.originalEvent.clipboardData.items.length > 0) {
      pasteItem = e.originalEvent.clipboardData.items[0];
      if (/^image\//.test(pasteItem.type) && !cleanPaste) {
        imageFile = pasteItem.getAsFile();
        if (!((imageFile != null) && this.opts.pasteImage)) {
          return;
        }
        if (!imageFile.name) {
          imageFile.name = "Clipboard Image.png";
        }
        uploadOpt = {};
        uploadOpt[this.opts.pasteImage] = true;
        if ((ref = this.editor.uploader) != null) {
          ref.upload(imageFile, uploadOpt);
        }
        return false;
      }
    }
    processPasteContent = (function(_this) {
      return function(pasteContent) {
        var $img, blob, children, insertPosition, k, l, lastLine, len, len1, len2, len3, len4, line, lines, m, node, o, q, ref1, ref2, ref3;
        if (_this.editor.triggerHandler('pasting', [pasteContent]) === false) {
          return;
        }
        if (!pasteContent) {
          return;
        } else if (cleanPaste) {
          if ($blockEl.is('table')) {
            lines = pasteContent.split('\n');
            lastLine = lines.pop();
            for (k = 0, len = lines.length; k < len; k++) {
              line = lines[k];
              _this.editor.selection.insertNode(document.createTextNode(line));
              _this.editor.selection.insertNode($('<br/>'));
            }
            _this.editor.selection.insertNode(document.createTextNode(lastLine));
          } else {
            pasteContent = $('<div/>').text(pasteContent);
            ref1 = pasteContent.contents();
            for (l = 0, len1 = ref1.length; l < len1; l++) {
              node = ref1[l];
              _this.editor.selection.insertNode($(node)[0], range);
            }
          }
        } else if ($blockEl.is(_this.editor.body)) {
          for (m = 0, len2 = pasteContent.length; m < len2; m++) {
            node = pasteContent[m];
            _this.editor.selection.insertNode(node, range);
          }
        } else if (pasteContent.length < 1) {
          return;
        } else if (pasteContent.length === 1) {
          if (pasteContent.is('p')) {
            children = pasteContent.contents();
            if (children.length === 1 && children.is('img')) {
              $img = children;
              if (/^data:image/.test($img.attr('src'))) {
                if (!_this.opts.pasteImage) {
                  return;
                }
                blob = _this.editor.util.dataURLtoBlob($img.attr("src"));
                blob.name = "Clipboard Image.png";
                uploadOpt = {};
                uploadOpt[_this.opts.pasteImage] = true;
                if ((ref2 = _this.editor.uploader) != null) {
                  ref2.upload(blob, uploadOpt);
                }
                return;
              } else if ($img.is('img[src^="webkit-fake-url://"]')) {
                return;
              }
            }
            for (o = 0, len3 = children.length; o < len3; o++) {
              node = children[o];
              _this.editor.selection.insertNode(node, range);
            }
          } else if ($blockEl.is('p') && _this.editor.util.isEmptyNode($blockEl)) {
            $blockEl.replaceWith(pasteContent);
            _this.editor.selection.setRangeAtEndOf(pasteContent, range);
          } else if (pasteContent.is('ul, ol')) {
            if (pasteContent.find('li').length === 1) {
              pasteContent = $('<div/>').text(pasteContent.text());
              ref3 = pasteContent.contents();
              for (q = 0, len4 = ref3.length; q < len4; q++) {
                node = ref3[q];
                _this.editor.selection.insertNode($(node)[0], range);
              }
            } else if ($blockEl.is('li')) {
              $blockEl.parent().after(pasteContent);
              _this.editor.selection.setRangeAtEndOf(pasteContent, range);
            } else {
              $blockEl.after(pasteContent);
              _this.editor.selection.setRangeAtEndOf(pasteContent, range);
            }
          } else {
            $blockEl.after(pasteContent);
            _this.editor.selection.setRangeAtEndOf(pasteContent, range);
          }
        } else {
          if ($blockEl.is('li')) {
            $blockEl = $blockEl.parent();
          }
          if (_this.editor.selection.rangeAtStartOf($blockEl, range)) {
            insertPosition = 'before';
          } else if (_this.editor.selection.rangeAtEndOf($blockEl, range)) {
            insertPosition = 'after';
          } else {
            _this.editor.selection.breakBlockEl($blockEl, range);
            insertPosition = 'before';
          }
          $blockEl[insertPosition](pasteContent);
          _this.editor.selection.setRangeAtEndOf(pasteContent.last(), range);
        }
        return _this.throttledValueChanged();
      };
    })(this);
    if (cleanPaste) {
      e.preventDefault();
      if (this.editor.util.browser.msie) {
        pasteContent = window.clipboardData.getData('Text');
      } else {
        pasteContent = e.originalEvent.clipboardData.getData('text/plain');
      }
      return processPasteContent(pasteContent);
    } else {
      this.editor.selection.save(range);
      this._pasteArea.focus();
      if (this.editor.util.browser.msie && this.editor.util.browser.version === 10) {
        e.preventDefault();
        this._pasteArea.html(window.clipboardData.getData('Text'));
      }
      return setTimeout((function(_this) {
        return function() {
          if (_this._pasteArea.is(':empty')) {
            pasteContent = null;
          } else {
            pasteContent = $('<div/>').append(_this._pasteArea.contents());
            pasteContent.find('table colgroup').remove();
            _this.editor.formatter.format(pasteContent);
            _this.editor.formatter.decorate(pasteContent);
            _this.editor.formatter.beautify(pasteContent.children());
            pasteContent = pasteContent.contents();
          }
          _this._pasteArea.empty();
          range = _this.editor.selection.restore();
          return processPasteContent(pasteContent);
        };
      })(this), 10);
    }
  };

  InputManager.prototype._onDrop = function(e) {
    if (this.editor.triggerHandler(e) === false) {
      return false;
    }
    return this.throttledValueChanged();
  };

  InputManager.prototype._onInput = function(e) {
    return this.throttledValueChanged(['oninput']);
  };

  InputManager.prototype.addKeystrokeHandler = function(key, node, handler) {
    if (!this._keystrokeHandlers[key]) {
      this._keystrokeHandlers[key] = {};
    }
    return this._keystrokeHandlers[key][node] = handler;
  };

  InputManager.prototype.addShortcut = function(keys, handler) {
    return this.hotkeys.add(keys, $.proxy(handler, this));
  };

  return InputManager;

})(SimpleModule);

Keystroke = (function(superClass) {
  extend(Keystroke, superClass);

  function Keystroke() {
    return Keystroke.__super__.constructor.apply(this, arguments);
  }

  Keystroke.pluginName = 'Keystroke';

  Keystroke.prototype._init = function() {
    var titleEnterHandler;
    this.editor = this._module;
    if (this.editor.util.browser.safari) {
      this.editor.inputManager.addKeystrokeHandler('13', '*', (function(_this) {
        return function(e) {
          var $blockEl, $br;
          if (!e.shiftKey) {
            return;
          }
          $blockEl = _this.editor.selection.blockNodes().last();
          if ($blockEl.is('pre')) {
            return;
          }
          $br = $('<br/>');
          if (_this.editor.selection.rangeAtEndOf($blockEl)) {
            _this.editor.selection.insertNode($br);
            _this.editor.selection.insertNode($('<br/>'));
            _this.editor.selection.setRangeBefore($br);
          } else {
            _this.editor.selection.insertNode($br);
          }
          return true;
        };
      })(this));
    }
    if (this.editor.util.browser.webkit || this.editor.util.browser.msie) {
      titleEnterHandler = (function(_this) {
        return function(e, $node) {
          var $p;
          if (!_this.editor.selection.rangeAtEndOf($node)) {
            return;
          }
          $p = $('<p/>').append(_this.editor.util.phBr).insertAfter($node);
          _this.editor.selection.setRangeAtStartOf($p);
          return true;
        };
      })(this);
      this.editor.inputManager.addKeystrokeHandler('13', 'h1', titleEnterHandler);
      this.editor.inputManager.addKeystrokeHandler('13', 'h2', titleEnterHandler);
      this.editor.inputManager.addKeystrokeHandler('13', 'h3', titleEnterHandler);
      this.editor.inputManager.addKeystrokeHandler('13', 'h4', titleEnterHandler);
      this.editor.inputManager.addKeystrokeHandler('13', 'h5', titleEnterHandler);
      this.editor.inputManager.addKeystrokeHandler('13', 'h6', titleEnterHandler);
    }
    this.editor.inputManager.addKeystrokeHandler('8', '*', (function(_this) {
      return function(e) {
        var $blockEl, $prevBlockEl, $rootBlock, isWebkit;
        $rootBlock = _this.editor.selection.rootNodes().first();
        $prevBlockEl = $rootBlock.prev();
        if ($prevBlockEl.is('hr') && _this.editor.selection.rangeAtStartOf($rootBlock)) {
          _this.editor.selection.save();
          $prevBlockEl.remove();
          _this.editor.selection.restore();
          return true;
        }
        $blockEl = _this.editor.selection.blockNodes().last();
        isWebkit = _this.editor.util.browser.webkit;
        if (isWebkit && _this.editor.selection.rangeAtStartOf($blockEl)) {
          _this.editor.selection.save();
          _this.editor.formatter.cleanNode($blockEl, true);
          _this.editor.selection.restore();
          return null;
        }
      };
    })(this));
    this.editor.inputManager.addKeystrokeHandler('13', 'li', (function(_this) {
      return function(e, $node) {
        var $cloneNode, listEl, newBlockEl, newListEl;
        $cloneNode = $node.clone();
        $cloneNode.find('ul, ol').remove();
        if (!(_this.editor.util.isEmptyNode($cloneNode) && $node.is(_this.editor.selection.blockNodes().last()))) {
          return;
        }
        listEl = $node.parent();
        if ($node.next('li').length > 0) {
          if (!_this.editor.util.isEmptyNode($node)) {
            return;
          }
          if (listEl.parent('li').length > 0) {
            newBlockEl = $('<li/>').append(_this.editor.util.phBr).insertAfter(listEl.parent('li'));
            newListEl = $('<' + listEl[0].tagName + '/>').append($node.nextAll('li'));
            newBlockEl.append(newListEl);
          } else {
            newBlockEl = $('<p/>').append(_this.editor.util.phBr).insertAfter(listEl);
            newListEl = $('<' + listEl[0].tagName + '/>').append($node.nextAll('li'));
            newBlockEl.after(newListEl);
          }
        } else {
          if (listEl.parent('li').length > 0) {
            newBlockEl = $('<li/>').insertAfter(listEl.parent('li'));
            if ($node.contents().length > 0) {
              newBlockEl.append($node.contents());
            } else {
              newBlockEl.append(_this.editor.util.phBr);
            }
          } else {
            newBlockEl = $('<p/>').append(_this.editor.util.phBr).insertAfter(listEl);
            if ($node.children('ul, ol').length > 0) {
              newBlockEl.after($node.children('ul, ol'));
            }
          }
        }
        if ($node.prev('li').length) {
          $node.remove();
        } else {
          listEl.remove();
        }
        _this.editor.selection.setRangeAtStartOf(newBlockEl);
        return true;
      };
    })(this));
    this.editor.inputManager.addKeystrokeHandler('13', 'pre', (function(_this) {
      return function(e, $node) {
        var $p, breakNode, range;
        e.preventDefault();
        if (e.shiftKey) {
          $p = $('<p/>').append(_this.editor.util.phBr).insertAfter($node);
          _this.editor.selection.setRangeAtStartOf($p);
          return true;
        }
        range = _this.editor.selection.range();
        breakNode = null;
        range.deleteContents();
        if (!_this.editor.util.browser.msie && _this.editor.selection.rangeAtEndOf($node)) {
          breakNode = document.createTextNode('\n\n');
          range.insertNode(breakNode);
          range.setEnd(breakNode, 1);
        } else {
          breakNode = document.createTextNode('\n');
          range.insertNode(breakNode);
          range.setStartAfter(breakNode);
        }
        range.collapse(false);
        _this.editor.selection.range(range);
        return true;
      };
    })(this));
    this.editor.inputManager.addKeystrokeHandler('13', 'blockquote', (function(_this) {
      return function(e, $node) {
        var $closestBlock, range;
        $closestBlock = _this.editor.selection.blockNodes().last();
        if (!($closestBlock.is('p') && !$closestBlock.next().length && _this.editor.util.isEmptyNode($closestBlock))) {
          return;
        }
        $node.after($closestBlock);
        range = document.createRange();
        _this.editor.selection.setRangeAtStartOf($closestBlock, range);
        return true;
      };
    })(this));
    this.editor.inputManager.addKeystrokeHandler('8', 'li', (function(_this) {
      return function(e, $node) {
        var $br, $childList, $newLi, $prevChildList, $prevNode, $textNode, isFF, range, text;
        $childList = $node.children('ul, ol');
        $prevNode = $node.prev('li');
        if (!($childList.length > 0 && $prevNode.length > 0)) {
          return false;
        }
        text = '';
        $textNode = null;
        $node.contents().each(function(i, n) {
          if (n.nodeType === 1 && /UL|OL/.test(n.nodeName)) {
            return false;
          }
          if (n.nodeType === 1 && /BR/.test(n.nodeName)) {
            return;
          }
          if (n.nodeType === 3 && n.nodeValue) {
            text += n.nodeValue;
          } else if (n.nodeType === 1) {
            text += $(n).text();
          }
          return $textNode = $(n);
        });
        isFF = _this.editor.util.browser.firefox && !$textNode.next('br').length;
        if ($textNode && text.length === 1 && isFF) {
          $br = $(_this.editor.util.phBr).insertAfter($textNode);
          $textNode.remove();
          _this.editor.selection.setRangeBefore($br);
          return true;
        } else if (text.length > 0) {
          return false;
        }
        range = document.createRange();
        $prevChildList = $prevNode.children('ul, ol');
        if ($prevChildList.length > 0) {
          $newLi = $('<li/>').append(_this.editor.util.phBr).appendTo($prevChildList);
          $prevChildList.append($childList.children('li'));
          $node.remove();
          _this.editor.selection.setRangeAtEndOf($newLi, range);
        } else {
          _this.editor.selection.setRangeAtEndOf($prevNode, range);
          $prevNode.append($childList);
          $node.remove();
          _this.editor.selection.range(range);
        }
        return true;
      };
    })(this));
    this.editor.inputManager.addKeystrokeHandler('8', 'pre', (function(_this) {
      return function(e, $node) {
        var $newNode, codeStr, range;
        if (!_this.editor.selection.rangeAtStartOf($node)) {
          return;
        }
        codeStr = $node.html().replace('\n', '<br/>') || _this.editor.util.phBr;
        $newNode = $('<p/>').append(codeStr).insertAfter($node);
        $node.remove();
        range = document.createRange();
        _this.editor.selection.setRangeAtStartOf($newNode, range);
        return true;
      };
    })(this));
    return this.editor.inputManager.addKeystrokeHandler('8', 'blockquote', (function(_this) {
      return function(e, $node) {
        var $firstChild, range;
        if (!_this.editor.selection.rangeAtStartOf($node)) {
          return;
        }
        $firstChild = $node.children().first().unwrap();
        range = document.createRange();
        _this.editor.selection.setRangeAtStartOf($firstChild, range);
        return true;
      };
    })(this));
  };

  return Keystroke;

})(SimpleModule);

UndoManager = (function(superClass) {
  extend(UndoManager, superClass);

  function UndoManager() {
    return UndoManager.__super__.constructor.apply(this, arguments);
  }

  UndoManager.pluginName = 'UndoManager';

  UndoManager.prototype._index = -1;

  UndoManager.prototype._capacity = 20;

  UndoManager.prototype._startPosition = null;

  UndoManager.prototype._endPosition = null;

  UndoManager.prototype._init = function() {
    var redoShortcut, throttledPushState, undoShortcut;
    this.editor = this._module;
    this._stack = [];
    if (this.editor.util.os.mac) {
      undoShortcut = 'cmd+z';
      redoShortcut = 'shift+cmd+z';
    } else if (this.editor.util.os.win) {
      undoShortcut = 'ctrl+z';
      redoShortcut = 'ctrl+y';
    } else {
      undoShortcut = 'ctrl+z';
      redoShortcut = 'shift+ctrl+z';
    }
    this.editor.inputManager.addShortcut(undoShortcut, (function(_this) {
      return function(e) {
        e.preventDefault();
        _this.undo();
        return false;
      };
    })(this));
    this.editor.inputManager.addShortcut(redoShortcut, (function(_this) {
      return function(e) {
        e.preventDefault();
        _this.redo();
        return false;
      };
    })(this));
    throttledPushState = this.editor.util.throttle((function(_this) {
      return function() {
        return _this._pushUndoState();
      };
    })(this), 500);
    this.editor.on('valuechanged', function(e, src) {
      if (src === 'undo' || src === 'redo') {
        return;
      }
      return throttledPushState();
    });
    this.editor.on('selectionchanged', (function(_this) {
      return function(e) {
        _this._startPosition = null;
        _this._endPosition = null;
        return _this.update();
      };
    })(this));
    return this.editor.on('blur', (function(_this) {
      return function(e) {
        _this._startPosition = null;
        return _this._endPosition = null;
      };
    })(this));
  };

  UndoManager.prototype.startPosition = function() {
    if (this.editor.selection._range) {
      this._startPosition || (this._startPosition = this._getPosition('start'));
    }
    return this._startPosition;
  };

  UndoManager.prototype.endPosition = function() {
    if (this.editor.selection._range) {
      this._endPosition || (this._endPosition = (function(_this) {
        return function() {
          var range;
          range = _this.editor.selection.range();
          if (range.collapsed) {
            return _this._startPosition;
          }
          return _this._getPosition('end');
        };
      })(this)());
    }
    return this._endPosition;
  };

  UndoManager.prototype._pushUndoState = function() {
    var currentState, html;
    if (this.editor.triggerHandler('pushundostate') === false) {
      return;
    }
    currentState = this.currentState();
    html = this.editor.body.html();
    if (currentState && currentState.html === html) {
      return;
    }
    this._index += 1;
    this._stack.length = this._index;
    this._stack.push({
      html: html,
      caret: this.caretPosition()
    });
    if (this._stack.length > this._capacity) {
      this._stack.shift();
      return this._index -= 1;
    }
  };

  UndoManager.prototype.currentState = function() {
    if (this._stack.length && this._index > -1) {
      return this._stack[this._index];
    } else {
      return null;
    }
  };

  UndoManager.prototype.undo = function() {
    var state;
    if (this._index < 1 || this._stack.length < 2) {
      return;
    }
    this.editor.hidePopover();
    this._index -= 1;
    state = this._stack[this._index];
    this.editor.body.html(state.html);
    this.caretPosition(state.caret);
    this.editor.body.find('.selected').removeClass('selected');
    this.editor.sync();
    return this.editor.trigger('valuechanged', ['undo']);
  };

  UndoManager.prototype.redo = function() {
    var state;
    if (this._index < 0 || this._stack.length < this._index + 2) {
      return;
    }
    this.editor.hidePopover();
    this._index += 1;
    state = this._stack[this._index];
    this.editor.body.html(state.html);
    this.caretPosition(state.caret);
    this.editor.body.find('.selected').removeClass('selected');
    this.editor.sync();
    return this.editor.trigger('valuechanged', ['redo']);
  };

  UndoManager.prototype.update = function() {
    var currentState, html;
    if (this._timer) {
      return;
    }
    currentState = this.currentState();
    if (!currentState) {
      return;
    }
    html = this.editor.body.html();
    if (html !== currentState.html) {
      return;
    }
    currentState.html = html;
    return currentState.caret = this.caretPosition();
  };

  UndoManager.prototype._getNodeOffset = function(node, index) {
    var $parent, merging, offset;
    if (index) {
      $parent = $(node);
    } else {
      $parent = $(node).parent();
    }
    offset = 0;
    merging = false;
    $parent.contents().each(function(i, child) {
      if (index === i || node === child) {
        return false;
      }
      if (child.nodeType === 3) {
        if (!merging) {
          offset += 1;
          merging = true;
        }
      } else {
        offset += 1;
        merging = false;
      }
      return null;
    });
    return offset;
  };

  UndoManager.prototype._getPosition = function(type) {
    var $nodes, node, nodes, offset, position, prevNode, range;
    if (type == null) {
      type = 'start';
    }
    range = this.editor.selection.range();
    offset = range[type + "Offset"];
    $nodes = this.editor.selection[type + "Nodes"]();
    if ((node = $nodes.first()[0]).nodeType === Node.TEXT_NODE) {
      prevNode = node.previousSibling;
      while (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
        node = prevNode;
        offset += this.editor.util.getNodeLength(prevNode);
        prevNode = prevNode.previousSibling;
      }
      nodes = $nodes.get();
      nodes[0] = node;
      $nodes = $(nodes);
    }
    position = [offset];
    $nodes.each((function(_this) {
      return function(i, node) {
        return position.unshift(_this._getNodeOffset(node));
      };
    })(this));
    return position;
  };

  UndoManager.prototype._getNodeByPosition = function(position) {
    var child, childNodes, i, k, len, node, offset, ref;
    node = this.editor.body[0];
    ref = position.slice(0, position.length - 1);
    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      offset = ref[i];
      childNodes = node.childNodes;
      if (offset > childNodes.length - 1) {
        if (i === position.length - 2 && $(node).is('pre')) {
          child = document.createTextNode('');
          node.appendChild(child);
          childNodes = node.childNodes;
        } else {
          node = null;
          break;
        }
      }
      node = childNodes[offset];
    }
    return node;
  };

  UndoManager.prototype.caretPosition = function(caret) {
    var endContainer, endOffset, range, startContainer, startOffset;
    if (!caret) {
      range = this.editor.selection.range();
      caret = this.editor.inputManager.focused && (range != null) ? {
        start: this.startPosition(),
        end: this.endPosition(),
        collapsed: range.collapsed
      } : {};
      return caret;
    } else {
      if (!caret.start) {
        return;
      }
      startContainer = this._getNodeByPosition(caret.start);
      startOffset = caret.start[caret.start.length - 1];
      if (caret.collapsed) {
        endContainer = startContainer;
        endOffset = startOffset;
      } else {
        endContainer = this._getNodeByPosition(caret.end);
        endOffset = caret.start[caret.start.length - 1];
      }
      if (!startContainer || !endContainer) {
        throw new Error('simditor: invalid caret state');
        return;
      }
      range = document.createRange();
      range.setStart(startContainer, startOffset);
      range.setEnd(endContainer, endOffset);
      return this.editor.selection.range(range);
    }
  };

  return UndoManager;

})(SimpleModule);

Util = (function(superClass) {
  extend(Util, superClass);

  function Util() {
    return Util.__super__.constructor.apply(this, arguments);
  }

  Util.pluginName = 'Util';

  Util.prototype._init = function() {
    this.editor = this._module;
    if (this.browser.msie && this.browser.version < 11) {
      return this.phBr = '';
    }
  };

  Util.prototype.phBr = '<br/>';

  Util.prototype.os = (function() {
    var os;
    os = {};
    if (/Mac/.test(navigator.appVersion)) {
      os.mac = true;
    } else if (/Linux/.test(navigator.appVersion)) {
      os.linux = true;
    } else if (/Win/.test(navigator.appVersion)) {
      os.win = true;
    } else if (/X11/.test(navigator.appVersion)) {
      os.unix = true;
    }
    if (/Mobi/.test(navigator.appVersion)) {
      os.mobile = true;
    }
    return os;
  })();

  Util.prototype.browser = (function() {
    var chrome, firefox, ie, ref, ref1, ref2, ref3, safari, ua;
    ua = navigator.userAgent;
    ie = /(msie|trident)/i.test(ua);
    chrome = /chrome|crios/i.test(ua);
    safari = /safari/i.test(ua) && !chrome;
    firefox = /firefox/i.test(ua);
    if (ie) {
      return {
        msie: true,
        version: ((ref = ua.match(/(msie |rv:)(\d+(\.\d+)?)/i)) != null ? ref[2] : void 0) * 1
      };
    } else if (chrome) {
      return {
        webkit: true,
        chrome: true,
        version: ((ref1 = ua.match(/(?:chrome|crios)\/(\d+(\.\d+)?)/i)) != null ? ref1[1] : void 0) * 1
      };
    } else if (safari) {
      return {
        webkit: true,
        safari: true,
        version: ((ref2 = ua.match(/version\/(\d+(\.\d+)?)/i)) != null ? ref2[1] : void 0) * 1
      };
    } else if (firefox) {
      return {
        mozilla: true,
        firefox: true,
        version: ((ref3 = ua.match(/firefox\/(\d+(\.\d+)?)/i)) != null ? ref3[1] : void 0) * 1
      };
    } else {
      return {};
    }
  })();

  Util.prototype.support = (function() {
    return {
      onselectionchange: (function() {
        var e, onselectionchange;
        onselectionchange = document.onselectionchange;
        if (onselectionchange !== void 0) {
          try {
            document.onselectionchange = 0;
            return document.onselectionchange === null;
          } catch (_error) {
            e = _error;
          } finally {
            document.onselectionchange = onselectionchange;
          }
        }
        return false;
      })(),
      oninput: (function() {
        return !/(msie|trident)/i.test(navigator.userAgent);
      })()
    };
  })();

  Util.prototype.reflow = function(el) {
    if (el == null) {
      el = document;
    }
    return $(el)[0].offsetHeight;
  };

  Util.prototype.metaKey = function(e) {
    var isMac;
    isMac = /Mac/.test(navigator.userAgent);
    if (isMac) {
      return e.metaKey;
    } else {
      return e.ctrlKey;
    }
  };

  Util.prototype.isEmptyNode = function(node) {
    var $node;
    $node = $(node);
    return $node.is(':empty') || (!$node.text() && !$node.find(':not(br, span, div)').length);
  };

  Util.prototype.isDecoratedNode = function(node) {
    return $(node).is('[class^="simditor-"]');
  };

  Util.prototype.blockNodes = ["div", "p", "ul", "ol", "li", "blockquote", "hr", "pre", "h1", "h2", "h3", "h4", "table"];

  Util.prototype.isBlockNode = function(node) {
    node = $(node)[0];
    if (!node || node.nodeType === 3) {
      return false;
    }
    return new RegExp("^(" + (this.blockNodes.join('|')) + ")$").test(node.nodeName.toLowerCase());
  };

  Util.prototype.getNodeLength = function(node) {
    node = $(node)[0];
    switch (node.nodeType) {
      case 7:
      case 10:
        return 0;
      case 3:
      case 8:
        return node.length;
      default:
        return node.childNodes.length;
    }
  };

  Util.prototype.dataURLtoBlob = function(dataURL) {
    var BlobBuilder, arrayBuffer, bb, blobArray, byteString, hasArrayBufferViewSupport, hasBlobConstructor, i, intArray, k, mimeString, ref, supportBlob;
    hasBlobConstructor = window.Blob && (function() {
      var e;
      try {
        return Boolean(new Blob());
      } catch (_error) {
        e = _error;
        return false;
      }
    })();
    hasArrayBufferViewSupport = hasBlobConstructor && window.Uint8Array && (function() {
      var e;
      try {
        return new Blob([new Uint8Array(100)]).size === 100;
      } catch (_error) {
        e = _error;
        return false;
      }
    })();
    BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
    supportBlob = hasBlobConstructor || BlobBuilder;
    if (!(supportBlob && window.atob && window.ArrayBuffer && window.Uint8Array)) {
      return false;
    }
    if (dataURL.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURL.split(',')[1]);
    } else {
      byteString = decodeURIComponent(dataURL.split(',')[1]);
    }
    arrayBuffer = new ArrayBuffer(byteString.length);
    intArray = new Uint8Array(arrayBuffer);
    for (i = k = 0, ref = byteString.length; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
      intArray[i] = byteString.charCodeAt(i);
    }
    mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    if (hasBlobConstructor) {
      blobArray = hasArrayBufferViewSupport ? intArray : arrayBuffer;
      return new Blob([blobArray], {
        type: mimeString
      });
    }
    bb = new BlobBuilder();
    bb.append(arrayBuffer);
    return bb.getBlob(mimeString);
  };

  Util.prototype.throttle = function(func, wait) {
    var args, call, ctx, last, rtn, throttled, timeoutID;
    last = 0;
    timeoutID = 0;
    ctx = args = rtn = null;
    call = function() {
      timeoutID = 0;
      last = +new Date();
      rtn = func.apply(ctx, args);
      ctx = null;
      return args = null;
    };
    return throttled = function() {
      var delta;
      ctx = this;
      args = arguments;
      delta = new Date() - last;
      if (!timeoutID) {
        if (delta >= wait) {
          call();
        } else {
          timeoutID = setTimeout(call, wait - delta);
        }
      }
      return rtn;
    };
  };

  Util.prototype.formatHTML = function(html) {
    var cursor, indentString, lastMatch, level, match, re, repeatString, result, str;
    re = /<(\/?)(.+?)(\/?)>/g;
    result = '';
    level = 0;
    lastMatch = null;
    indentString = '  ';
    repeatString = function(str, n) {
      return new Array(n + 1).join(str);
    };
    while ((match = re.exec(html)) !== null) {
      match.isBlockNode = $.inArray(match[2], this.blockNodes) > -1;
      match.isStartTag = match[1] !== '/' && match[3] !== '/';
      match.isEndTag = match[1] === '/' || match[3] === '/';
      cursor = lastMatch ? lastMatch.index + lastMatch[0].length : 0;
      if ((str = html.substring(cursor, match.index)).length > 0 && $.trim(str)) {
        result += str;
      }
      if (match.isBlockNode && match.isEndTag && !match.isStartTag) {
        level -= 1;
      }
      if (match.isBlockNode && match.isStartTag) {
        if (!(lastMatch && lastMatch.isBlockNode && lastMatch.isEndTag)) {
          result += '\n';
        }
        result += repeatString(indentString, level);
      }
      result += match[0];
      if (match.isBlockNode && match.isEndTag) {
        result += '\n';
      }
      if (match.isBlockNode && match.isStartTag) {
        level += 1;
      }
      lastMatch = match;
    }
    return $.trim(result);
  };

  return Util;

})(SimpleModule);

Toolbar = (function(superClass) {
  extend(Toolbar, superClass);

  function Toolbar() {
    return Toolbar.__super__.constructor.apply(this, arguments);
  }

  Toolbar.pluginName = 'Toolbar';

  Toolbar.prototype.opts = {
    toolbar: true,
    toolbarFloat: true,
    toolbarHidden: false,
    toolbarFloatOffset: 0
  };

  Toolbar.prototype._tpl = {
    wrapper: '<div class="simditor-toolbar"><ul></ul></div>',
    separator: '<li><span class="separator"></span></li>'
  };

  Toolbar.prototype._init = function() {
    var floatInitialized, initToolbarFloat, toolbarHeight;
    this.editor = this._module;
    if (!this.opts.toolbar) {
      return;
    }
    if (!$.isArray(this.opts.toolbar)) {
      this.opts.toolbar = ['bold', 'italic', 'underline', 'strikethrough', '|', 'ol', 'ul', 'blockquote', 'code', '|', 'link', 'image', '|', 'indent', 'outdent'];
    }
    this._render();
    this.list.on('click', function(e) {
      return false;
    });
    this.wrapper.on('mousedown', (function(_this) {
      return function(e) {
        return _this.list.find('.menu-on').removeClass('.menu-on');
      };
    })(this));
    $(document).on('mousedown.simditor' + this.editor.id, (function(_this) {
      return function(e) {
        return _this.list.find('.menu-on').removeClass('.menu-on');
      };
    })(this));
    if (!this.opts.toolbarHidden && this.opts.toolbarFloat) {
      this.wrapper.css('top', this.opts.toolbarFloatOffset);
      toolbarHeight = 0;
      initToolbarFloat = (function(_this) {
        return function() {
          _this.wrapper.css('position', 'static');
          _this.wrapper.width('auto');
          _this.editor.util.reflow(_this.wrapper);
          _this.wrapper.width(_this.wrapper.outerWidth());
          _this.wrapper.css('left', _this.editor.util.os.mobile ? _this.wrapper.position().left : _this.wrapper.offset().left);
          _this.wrapper.css('position', '');
          toolbarHeight = _this.wrapper.outerHeight();
          _this.editor.placeholderEl.css('top', toolbarHeight);
          return true;
        };
      })(this);
      $(window).on('resize.simditor-' + this.editor.id, function(e) {
        var floatInitialized;
        return floatInitialized = null;
      });
      floatInitialized = null;
      $(window).on('scroll.simditor-' + this.editor.id, (function(_this) {
        return function(e) {
          var bottomEdge, scrollTop, topEdge;
          if (!_this.wrapper.is(':visible')) {
            return;
          }
          topEdge = _this.editor.wrapper.offset().top;
          bottomEdge = topEdge + _this.editor.wrapper.outerHeight() - 80;
          scrollTop = $(document).scrollTop() + _this.opts.toolbarFloatOffset;
          if (scrollTop <= topEdge || scrollTop >= bottomEdge) {
            _this.editor.wrapper.removeClass('toolbar-floating').css('padding-top', '');
            if (_this.editor.util.os.mobile) {
              return _this.wrapper.css('top', _this.opts.toolbarFloatOffset);
            }
          } else {
            floatInitialized || (floatInitialized = initToolbarFloat());
            _this.editor.wrapper.addClass('toolbar-floating').css('padding-top', toolbarHeight);
            if (_this.editor.util.os.mobile) {
              return _this.wrapper.css('top', scrollTop - topEdge + _this.opts.toolbarFloatOffset);
            }
          }
        };
      })(this));
    }
    this.editor.on('destroy', (function(_this) {
      return function() {
        return _this.buttons.length = 0;
      };
    })(this));
    return $(document).on("mousedown.simditor-" + this.editor.id, (function(_this) {
      return function(e) {
        return _this.list.find('li.menu-on').removeClass('menu-on');
      };
    })(this));
  };

  Toolbar.prototype._render = function() {
    var k, len, name, ref;
    this.buttons = [];
    this.wrapper = $(this._tpl.wrapper).prependTo(this.editor.wrapper);
    this.list = this.wrapper.find('ul');
    ref = this.opts.toolbar;
    for (k = 0, len = ref.length; k < len; k++) {
      name = ref[k];
      if (name === '|') {
        $(this._tpl.separator).appendTo(this.list);
        continue;
      }
      if (!this.constructor.buttons[name]) {
        throw new Error("simditor: invalid toolbar button " + name);
        continue;
      }
      this.buttons.push(new this.constructor.buttons[name]({
        editor: this.editor
      }));
    }
    if (this.opts.toolbarHidden) {
      return this.wrapper.hide();
    }
  };

  Toolbar.prototype.findButton = function(name) {
    var button;
    button = this.list.find('.toolbar-item-' + name).data('button');
    return button != null ? button : null;
  };

  Toolbar.addButton = function(btn) {
    return this.buttons[btn.prototype.name] = btn;
  };

  Toolbar.buttons = {};

  return Toolbar;

})(SimpleModule);

Indentation = (function(superClass) {
  extend(Indentation, superClass);

  function Indentation() {
    return Indentation.__super__.constructor.apply(this, arguments);
  }

  Indentation.pluginName = 'Indentation';

  Indentation.prototype.opts = {
    tabIndent: true
  };

  Indentation.prototype._init = function() {
    this.editor = this._module;
    return this.editor.inputManager.addKeystrokeHandler('9', '*', (function(_this) {
      return function(e) {
        var codeButton;
        codeButton = _this.editor.toolbar.findButton('code');
        if (!(_this.opts.tabIndent || (codeButton && codeButton.active))) {
          return;
        }
        return _this.indent(e.shiftKey);
      };
    })(this));
  };

  Indentation.prototype.indent = function(isBackward) {
    var $blockNodes, $endNodes, $startNodes, nodes, result;
    $startNodes = this.editor.selection.startNodes();
    $endNodes = this.editor.selection.endNodes();
    $blockNodes = this.editor.selection.blockNodes();
    nodes = [];
    $blockNodes = $blockNodes.each(function(i, node) {
      var include, j, k, len, n;
      include = true;
      for (j = k = 0, len = nodes.length; k < len; j = ++k) {
        n = nodes[j];
        if ($.contains(node, n)) {
          include = false;
          break;
        } else if ($.contains(n, node)) {
          nodes.splice(j, 1, node);
          include = false;
          break;
        }
      }
      if (include) {
        return nodes.push(node);
      }
    });
    $blockNodes = $(nodes);
    result = false;
    $blockNodes.each((function(_this) {
      return function(i, blockEl) {
        var r;
        r = isBackward ? _this.outdentBlock(blockEl) : _this.indentBlock(blockEl);
        if (r) {
          return result = r;
        }
      };
    })(this));
    return result;
  };

  Indentation.prototype.indentBlock = function(blockEl) {
    var $blockEl, $childList, $nextTd, $nextTr, $parentLi, $pre, $td, $tr, marginLeft, tagName;
    $blockEl = $(blockEl);
    if (!$blockEl.length) {
      return;
    }
    if ($blockEl.is('pre')) {
      $pre = this.editor.selection.containerNode();
      if (!($pre.is($blockEl) || $pre.closest('pre').is($blockEl))) {
        return;
      }
      this.indentText(range);
    } else if ($blockEl.is('li')) {
      $parentLi = $blockEl.prev('li');
      if ($parentLi.length < 1) {
        return;
      }
      this.editor.selection.save();
      tagName = $blockEl.parent()[0].tagName;
      $childList = $parentLi.children('ul, ol');
      if ($childList.length > 0) {
        $childList.append($blockEl);
      } else {
        $('<' + tagName + '/>').append($blockEl).appendTo($parentLi);
      }
      this.editor.selection.restore();
    } else if ($blockEl.is('p, h1, h2, h3, h4')) {
      marginLeft = parseInt($blockEl.css('margin-left')) || 0;
      marginLeft = (Math.round(marginLeft / this.opts.indentWidth) + 1) * this.opts.indentWidth;
      $blockEl.css('margin-left', marginLeft);
    } else if ($blockEl.is('table') || $blockEl.is('.simditor-table')) {
      $td = this.editor.selection.containerNode().closest('td, th');
      $nextTd = $td.next('td, th');
      if (!($nextTd.length > 0)) {
        $tr = $td.parent('tr');
        $nextTr = $tr.next('tr');
        if ($nextTr.length < 1 && $tr.parent().is('thead')) {
          $nextTr = $tr.parent('thead').next('tbody').find('tr:first');
        }
        $nextTd = $nextTr.find('td:first, th:first');
      }
      if (!($td.length > 0 && $nextTd.length > 0)) {
        return;
      }
      this.editor.selection.setRangeAtEndOf($nextTd);
    } else {
      return false;
    }
    return true;
  };

  Indentation.prototype.indentText = function(range) {
    var text, textNode;
    text = range.toString().replace(/^(?=.+)/mg, '\u00A0\u00A0');
    textNode = document.createTextNode(text || '\u00A0\u00A0');
    range.deleteContents();
    range.insertNode(textNode);
    if (text) {
      range.selectNode(textNode);
      return this.editor.selection.range(range);
    } else {
      return this.editor.selection.setRangeAfter(textNode);
    }
  };

  Indentation.prototype.outdentBlock = function(blockEl) {
    var $blockEl, $parent, $parentLi, $pre, $prevTd, $prevTr, $td, $tr, marginLeft, range;
    $blockEl = $(blockEl);
    if (!($blockEl && $blockEl.length > 0)) {
      return;
    }
    if ($blockEl.is('pre')) {
      $pre = this.editor.selection.containerNode();
      if (!($pre.is($blockEl) || $pre.closest('pre').is($blockEl))) {
        return;
      }
      this.outdentText(range);
    } else if ($blockEl.is('li')) {
      $parent = $blockEl.parent();
      $parentLi = $parent.parent('li');
      this.editor.selection.save();
      if ($parentLi.length < 1) {
        range = document.createRange();
        range.setStartBefore($parent[0]);
        range.setEndBefore($blockEl[0]);
        $parent.before(range.extractContents());
        $('<p/>').insertBefore($parent).after($blockEl.children('ul, ol')).append($blockEl.contents());
        $blockEl.remove();
      } else {
        if ($blockEl.next('li').length > 0) {
          $('<' + $parent[0].tagName + '/>').append($blockEl.nextAll('li')).appendTo($blockEl);
        }
        $blockEl.insertAfter($parentLi);
        if ($parent.children('li').length < 1) {
          $parent.remove();
        }
      }
      this.editor.selection.restore();
    } else if ($blockEl.is('p, h1, h2, h3, h4')) {
      marginLeft = parseInt($blockEl.css('margin-left')) || 0;
      marginLeft = Math.max(Math.round(marginLeft / this.opts.indentWidth) - 1, 0) * this.opts.indentWidth;
      $blockEl.css('margin-left', marginLeft === 0 ? '' : marginLeft);
    } else if ($blockEl.is('table') || $blockEl.is('.simditor-table')) {
      $td = this.editor.selection.containerNode().closest('td, th');
      $prevTd = $td.prev('td, th');
      if (!($prevTd.length > 0)) {
        $tr = $td.parent('tr');
        $prevTr = $tr.prev('tr');
        if ($prevTr.length < 1 && $tr.parent().is('tbody')) {
          $prevTr = $tr.parent('tbody').prev('thead').find('tr:first');
        }
        $prevTd = $prevTr.find('td:last, th:last');
      }
      if (!($td.length > 0 && $prevTd.length > 0)) {
        return;
      }
      this.editor.selection.setRangeAtEndOf($prevTd);
    } else {
      return false;
    }
    return true;
  };

  Indentation.prototype.outdentText = function(range) {};

  return Indentation;

})(SimpleModule);

Simditor = (function(superClass) {
  extend(Simditor, superClass);

  function Simditor() {
    return Simditor.__super__.constructor.apply(this, arguments);
  }

  Simditor.connect(Util);

  Simditor.connect(InputManager);

  Simditor.connect(Selection);

  Simditor.connect(UndoManager);

  Simditor.connect(Keystroke);

  Simditor.connect(Formatter);

  Simditor.connect(Toolbar);

  Simditor.connect(Indentation);

  Simditor.count = 0;

  Simditor.prototype.opts = {
    textarea: null,
    placeholder: '',
    defaultImage: 'images/image.png',
    params: {},
    upload: false,
    indentWidth: 40
  };

  Simditor.prototype._init = function() {
    var e, editor, form, uploadOpts;
    this.textarea = $(this.opts.textarea);
    this.opts.placeholder = this.opts.placeholder || this.textarea.attr('placeholder');
    if (!this.textarea.length) {
      throw new Error('simditor: param textarea is required.');
      return;
    }
    editor = this.textarea.data('simditor');
    if (editor != null) {
      editor.destroy();
    }
    this.id = ++Simditor.count;
    this._render();
    if (this.opts.upload && simpleUploader) {
      uploadOpts = typeof this.opts.upload === 'object' ? this.opts.upload : {};
      this.uploader = simpleUploader(uploadOpts);
    }
    form = this.textarea.closest('form');
    if (form.length) {
      form.on('submit.simditor-' + this.id, (function(_this) {
        return function() {
          return _this.sync();
        };
      })(this));
      form.on('reset.simditor-' + this.id, (function(_this) {
        return function() {
          return _this.setValue('');
        };
      })(this));
    }
    this.on('initialized', (function(_this) {
      return function() {
        if (_this.opts.placeholder) {
          _this.on('valuechanged', function() {
            return _this._placeholder();
          });
        }
        return _this.setValue(_this.textarea.val().trim() || '');
      };
    })(this));
    if (this.util.browser.mozilla) {
      this.util.reflow();
      try {
        document.execCommand('enableObjectResizing', false, false);
        return document.execCommand('enableInlineTableEditing', false, false);
      } catch (_error) {
        e = _error;
      }
    }
  };

  Simditor.prototype._tpl = "<div class=\"simditor\">\n  <div class=\"simditor-wrapper\">\n    <div class=\"simditor-placeholder\"></div>\n    <div class=\"simditor-body\" contenteditable=\"true\">\n    </div>\n  </div>\n</div>";

  Simditor.prototype._render = function() {
    var key, ref, results, val;
    this.el = $(this._tpl).insertBefore(this.textarea);
    this.wrapper = this.el.find('.simditor-wrapper');
    this.body = this.wrapper.find('.simditor-body');
    this.placeholderEl = this.wrapper.find('.simditor-placeholder').append(this.opts.placeholder);
    this.el.data('simditor', this);
    this.wrapper.append(this.textarea);
    this.textarea.data('simditor', this).blur();
    this.body.attr('tabindex', this.textarea.attr('tabindex'));
    if (this.util.os.mac) {
      this.el.addClass('simditor-mac');
    } else if (this.util.os.linux) {
      this.el.addClass('simditor-linux');
    }
    if (this.util.os.mobile) {
      this.el.addClass('simditor-mobile');
    }
    if (this.opts.params) {
      ref = this.opts.params;
      results = [];
      for (key in ref) {
        val = ref[key];
        results.push($('<input/>', {
          type: 'hidden',
          name: key,
          value: val
        }).insertAfter(this.textarea));
      }
      return results;
    }
  };

  Simditor.prototype._placeholder = function() {
    var children;
    children = this.body.children();
    if (children.length === 0 || (children.length === 1 && this.util.isEmptyNode(children) && parseInt(children.css('margin-left') || 0) < this.opts.indentWidth)) {
      return this.placeholderEl.show();
    } else {
      return this.placeholderEl.hide();
    }
  };

  Simditor.prototype.setValue = function(val) {
    this.hidePopover();
    this.textarea.val(val);
    this.body.html(val);
    this.formatter.format();
    this.formatter.decorate();
    this.util.reflow(this.body);
    this.inputManager.lastCaretPosition = null;
    return this.trigger('valuechanged');
  };

  Simditor.prototype.getValue = function() {
    return this.sync();
  };

  Simditor.prototype.sync = function() {
    var children, cloneBody, emptyP, firstP, lastP, val;
    cloneBody = this.body.clone();
    this.formatter.undecorate(cloneBody);
    this.formatter.format(cloneBody);
    this.formatter.autolink(cloneBody);
    children = cloneBody.children();
    lastP = children.last('p');
    firstP = children.first('p');
    while (lastP.is('p') && this.util.isEmptyNode(lastP)) {
      emptyP = lastP;
      lastP = lastP.prev('p');
      emptyP.remove();
    }
    while (firstP.is('p') && this.util.isEmptyNode(firstP)) {
      emptyP = firstP;
      firstP = lastP.next('p');
      emptyP.remove();
    }
    cloneBody.find('img.uploading').remove();
    val = $.trim(cloneBody.html());
    this.textarea.val(val);
    return val;
  };

  Simditor.prototype.focus = function() {
    if (!(this.body.is(':visible') && this.body.is('[contenteditable]'))) {
      this.el.find('textarea:visible').focus();
      return;
    }
    if (this.inputManager.lastCaretPosition) {
      return this.undoManager.caretPosition(this.inputManager.lastCaretPosition);
    } else {
      return this.body.focus();
    }
  };

  Simditor.prototype.blur = function() {
    if (this.body.is(':visible') && this.body.is('[contenteditable]')) {
      return this.body.blur();
    } else {
      return this.body.find('textarea:visible').blur();
    }
  };

  Simditor.prototype.hidePopover = function() {
    return this.el.find('.simditor-popover').each(function(i, popover) {
      popover = $(popover).data('popover');
      if (popover.active) {
        return popover.hide();
      }
    });
  };

  Simditor.prototype.destroy = function() {
    this.triggerHandler('destroy');
    this.textarea.closest('form').off('.simditor .simditor-' + this.id);
    this.selection.clear();
    this.inputManager.focused = false;
    this.textarea.insertBefore(this.el).hide().val('').removeData('simditor');
    this.el.remove();
    $(document).off('.simditor-' + this.id);
    $(window).off('.simditor-' + this.id);
    return this.off();
  };

  return Simditor;

})(SimpleModule);

Simditor.i18n = {
  'zh-CN': {
    'blockquote': '引用',
    'bold': '加粗文字',
    'code': '插入代码',
    'color': '文字颜色',
    'coloredText': '彩色文字',
    'hr': '分隔线',
    'image': '插入图片',
    'externalImage': '外链图片',
    'uploadImage': '上传图片',
    'uploadFailed': '上传失败了',
    'uploadError': '上传出错了',
    'imageUrl': '图片地址',
    'imageSize': '图片尺寸',
    'imageAlt': '图片描述',
    'restoreImageSize': '还原图片尺寸',
    'uploading': '正在上传',
    'indent': '向右缩进',
    'outdent': '向左缩进',
    'italic': '斜体文字',
    'link': '插入链接',
    'text': '文本',
    'linkText': '链接文字',
    'linkUrl': '地址',
    'removeLink': '移除链接',
    'ol': '有序列表',
    'ul': '无序列表',
    'strikethrough': '删除线文字',
    'table': '表格',
    'deleteRow': '删除行',
    'insertRowAbove': '在上面插入行',
    'insertRowBelow': '在下面插入行',
    'deleteColumn': '删除列',
    'insertColumnLeft': '在左边插入列',
    'insertColumnRight': '在右边插入列',
    'deleteTable': '删除表格',
    'title': '标题',
    'normalText': '普通文本',
    'underline': '下划线文字',
    'alignment': '水平对齐',
    'alignCenter': '居中',
    'alignLeft': '居左',
    'alignRight': '居右',
    'selectLanguage': '选择程序语言'
  },
  'en-US': {
    'blockquote': 'Block Quote',
    'bold': 'Bold',
    'code': 'Code',
    'color': 'Text Color',
    'coloredText': 'Colored Text',
    'hr': 'Horizontal Line',
    'image': 'Insert Image',
    'externalImage': 'External Image',
    'uploadImage': 'Upload Image',
    'uploadFailed': 'Upload failed',
    'uploadError': 'Error occurs during upload',
    'imageUrl': 'Url',
    'imageSize': 'Size',
    'imageAlt': 'Alt',
    'restoreImageSize': 'Restore Origin Size',
    'uploading': 'Uploading',
    'indent': 'Indent',
    'outdent': 'Outdent',
    'italic': 'Italic',
    'link': 'Insert Link',
    'text': 'Text',
    'linkText': 'Link Text',
    'linkUrl': 'Link Url',
    'removeLink': 'Remove Link',
    'ol': 'Ordered List',
    'ul': 'Unordered List',
    'strikethrough': 'Strikethrough',
    'table': 'Table',
    'deleteRow': 'Delete Row',
    'insertRowAbove': 'Insert Row Above',
    'insertRowBelow': 'Insert Row Below',
    'deleteColumn': 'Delete Column',
    'insertColumnLeft': 'Insert Column Left',
    'insertColumnRight': 'Insert Column Right',
    'deleteTable': 'Delete Table',
    'title': 'Title',
    'normalText': 'Text',
    'underline': 'Underline',
    'alignment': 'Alignment',
    'alignCenter': 'Align Center',
    'alignLeft': 'Align Left',
    'alignRight': 'Align Right',
    'selectLanguage': 'Select Language'
  }
};

Button = (function(superClass) {
  extend(Button, superClass);

  Button.prototype._tpl = {
    item: '<li><a tabindex="-1" unselectable="on" class="toolbar-item" href="javascript:;"><span></span></a></li>',
    menuWrapper: '<div class="toolbar-menu"></div>',
    menuItem: '<li><a tabindex="-1" unselectable="on" class="menu-item" href="javascript:;"><span></span></a></li>',
    separator: '<li><span class="separator"></span></li>'
  };

  Button.prototype.name = '';

  Button.prototype.icon = '';

  Button.prototype.title = '';

  Button.prototype.text = '';

  Button.prototype.htmlTag = '';

  Button.prototype.disableTag = '';

  Button.prototype.menu = false;

  Button.prototype.active = false;

  Button.prototype.disabled = false;

  Button.prototype.needFocus = true;

  Button.prototype.shortcut = null;

  function Button(opts) {
    this.editor = opts.editor;
    this.title = this._t(this.name);
    Button.__super__.constructor.call(this, opts);
  }

  Button.prototype._init = function() {
    var k, len, ref, tag;
    this.render();
    this.el.on('mousedown', (function(_this) {
      return function(e) {
        var exceed, noFocus, param;
        e.preventDefault();
        noFocus = _this.needFocus && !_this.editor.inputManager.focused;
        if (_this.el.hasClass('disabled') || noFocus) {
          return false;
        }
        if (_this.menu) {
          _this.wrapper.toggleClass('menu-on').siblings('li').removeClass('menu-on');
          if (_this.wrapper.is('.menu-on')) {
            exceed = _this.menuWrapper.offset().left + _this.menuWrapper.outerWidth() + 5 - _this.editor.wrapper.offset().left - _this.editor.wrapper.outerWidth();
            if (exceed > 0) {
              _this.menuWrapper.css({
                'left': 'auto',
                'right': 0
              });
            }
            _this.trigger('menuexpand');
          }
          return false;
        }
        param = _this.el.data('param');
        _this.command(param);
        return false;
      };
    })(this));
    this.wrapper.on('click', 'a.menu-item', (function(_this) {
      return function(e) {
        var btn, noFocus, param;
        e.preventDefault();
        btn = $(e.currentTarget);
        _this.wrapper.removeClass('menu-on');
        noFocus = _this.needFocus && !_this.editor.inputManager.focused;
        if (btn.hasClass('disabled') || noFocus) {
          return false;
        }
        _this.editor.toolbar.wrapper.removeClass('menu-on');
        param = btn.data('param');
        _this.command(param);
        return false;
      };
    })(this));
    this.wrapper.on('mousedown', 'a.menu-item', function(e) {
      return false;
    });
    this.editor.on('blur', (function(_this) {
      return function() {
        var editorActive;
        editorActive = _this.editor.body.is(':visible') && _this.editor.body.is('[contenteditable]');
        if (!editorActive) {
          return;
        }
        _this.setActive(false);
        return _this.setDisabled(false);
      };
    })(this));
    if (this.shortcut != null) {
      this.editor.inputManager.addShortcut(this.shortcut, (function(_this) {
        return function(e) {
          _this.el.mousedown();
          return false;
        };
      })(this));
    }
    ref = this.htmlTag.split(',');
    for (k = 0, len = ref.length; k < len; k++) {
      tag = ref[k];
      tag = $.trim(tag);
      if (tag && $.inArray(tag, this.editor.formatter._allowedTags) < 0) {
        this.editor.formatter._allowedTags.push(tag);
      }
    }
    return this.editor.on('selectionchanged', (function(_this) {
      return function(e) {
        if (_this.editor.inputManager.focused) {
          return _this._status();
        }
      };
    })(this));
  };

  Button.prototype.iconClassOf = function(icon) {
    if (icon) {
      return "simditor-icon simditor-icon-" + icon;
    } else {
      return '';
    }
  };

  Button.prototype.setIcon = function(icon) {
    return this.el.find('span').removeClass().addClass(this.iconClassOf(icon)).text(this.text);
  };

  Button.prototype.render = function() {
    this.wrapper = $(this._tpl.item).appendTo(this.editor.toolbar.list);
    this.el = this.wrapper.find('a.toolbar-item');
    this.el.attr('title', this.title).addClass("toolbar-item-" + this.name).data('button', this);
    this.setIcon(this.icon);
    if (!this.menu) {
      return;
    }
    this.menuWrapper = $(this._tpl.menuWrapper).appendTo(this.wrapper);
    this.menuWrapper.addClass("toolbar-menu-" + this.name);
    return this.renderMenu();
  };

  Button.prototype.renderMenu = function() {
    var $menuBtnEl, $menuItemEl, k, len, menuItem, ref, ref1, results;
    if (!$.isArray(this.menu)) {
      return;
    }
    this.menuEl = $('<ul/>').appendTo(this.menuWrapper);
    ref = this.menu;
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      menuItem = ref[k];
      if (menuItem === '|') {
        $(this._tpl.separator).appendTo(this.menuEl);
        continue;
      }
      $menuItemEl = $(this._tpl.menuItem).appendTo(this.menuEl);
      $menuBtnEl = $menuItemEl.find('a.menu-item').attr({
        'title': (ref1 = menuItem.title) != null ? ref1 : menuItem.text,
        'data-param': menuItem.param
      }).addClass('menu-item-' + menuItem.name);
      if (menuItem.icon) {
        results.push($menuBtnEl.find('span').addClass(this.iconClassOf(menuItem.icon)));
      } else {
        results.push($menuBtnEl.find('span').text(menuItem.text));
      }
    }
    return results;
  };

  Button.prototype.setActive = function(active) {
    if (active === this.active) {
      return;
    }
    this.active = active;
    return this.el.toggleClass('active', this.active);
  };

  Button.prototype.setDisabled = function(disabled) {
    if (disabled === this.disabled) {
      return;
    }
    this.disabled = disabled;
    return this.el.toggleClass('disabled', this.disabled);
  };

  Button.prototype._disableStatus = function() {
    var disabled, endNodes, startNodes;
    startNodes = this.editor.selection.startNodes();
    endNodes = this.editor.selection.endNodes();
    disabled = startNodes.filter(this.disableTag).length > 0 || endNodes.filter(this.disableTag).length > 0;
    this.setDisabled(disabled);
    if (this.disabled) {
      this.setActive(false);
    }
    return this.disabled;
  };

  Button.prototype._activeStatus = function() {
    var active, endNode, endNodes, startNode, startNodes;
    startNodes = this.editor.selection.startNodes();
    endNodes = this.editor.selection.endNodes();
    startNode = startNodes.filter(this.htmlTag);
    endNode = endNodes.filter(this.htmlTag);
    active = startNode.length > 0 && endNode.length > 0 && startNode.is(endNode);
    this.node = active ? startNode : null;
    this.setActive(active);
    return this.active;
  };

  Button.prototype._status = function() {
    this._disableStatus();
    if (this.disabled) {
      return;
    }
    return this._activeStatus();
  };

  Button.prototype.command = function(param) {};

  Button.prototype._t = function() {
    var args, ref, result;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    result = Button.__super__._t.apply(this, args);
    if (!result) {
      result = (ref = this.editor)._t.apply(ref, args);
    }
    return result;
  };

  return Button;

})(SimpleModule);

Simditor.Button = Button;

Popover = (function(superClass) {
  extend(Popover, superClass);

  Popover.prototype.offset = {
    top: 4,
    left: 0
  };

  Popover.prototype.target = null;

  Popover.prototype.active = false;

  function Popover(opts) {
    this.button = opts.button;
    this.editor = opts.button.editor;
    Popover.__super__.constructor.call(this, opts);
  }

  Popover.prototype._init = function() {
    this.el = $('<div class="simditor-popover"></div>').appendTo(this.editor.el).data('popover', this);
    this.render();
    this.el.on('mouseenter', (function(_this) {
      return function(e) {
        return _this.el.addClass('hover');
      };
    })(this));
    return this.el.on('mouseleave', (function(_this) {
      return function(e) {
        return _this.el.removeClass('hover');
      };
    })(this));
  };

  Popover.prototype.render = function() {};

  Popover.prototype.show = function($target, position) {
    if (position == null) {
      position = 'bottom';
    }
    if ($target == null) {
      return;
    }
    this.el.siblings('.simditor-popover').each(function(i, popover) {
      popover = $(popover).data('popover');
      if (popover.active) {
        return popover.hide();
      }
    });
    if (this.active && this.target) {
      this.target.removeClass('selected');
    }
    this.target = $target.addClass('selected');
    if (this.active) {
      this.refresh(position);
      return this.trigger('popovershow');
    } else {
      this.active = true;
      this.el.css({
        left: -9999
      }).show();
      this.editor.util.reflow();
      this.refresh(position);
      return this.trigger('popovershow');
    }
  };

  Popover.prototype.hide = function() {
    if (!this.active) {
      return;
    }
    if (this.target) {
      this.target.removeClass('selected');
    }
    this.target = null;
    this.active = false;
    this.el.hide();
    return this.trigger('popoverhide');
  };

  Popover.prototype.refresh = function(position) {
    var editorOffset, left, maxLeft, targetH, targetOffset, top;
    if (position == null) {
      position = 'bottom';
    }
    if (!this.active) {
      return;
    }
    editorOffset = this.editor.el.offset();
    targetOffset = this.target.offset();
    targetH = this.target.outerHeight();
    if (position === 'bottom') {
      top = targetOffset.top - editorOffset.top + targetH;
    } else if (position === 'top') {
      top = targetOffset.top - editorOffset.top - this.el.height();
    }
    maxLeft = this.editor.wrapper.width() - this.el.outerWidth() - 10;
    left = Math.min(targetOffset.left - editorOffset.left, maxLeft);
    return this.el.css({
      top: top + this.offset.top,
      left: left + this.offset.left
    });
  };

  Popover.prototype.destroy = function() {
    this.target = null;
    this.active = false;
    this.editor.off('.linkpopover');
    return this.el.remove();
  };

  Popover.prototype._t = function() {
    var args, ref, result;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    result = Popover.__super__._t.apply(this, args);
    if (!result) {
      result = (ref = this.button)._t.apply(ref, args);
    }
    return result;
  };

  return Popover;

})(SimpleModule);

Simditor.Popover = Popover;

TitleButton = (function(superClass) {
  extend(TitleButton, superClass);

  function TitleButton() {
    return TitleButton.__super__.constructor.apply(this, arguments);
  }

  TitleButton.prototype.name = 'title';

  TitleButton.prototype.htmlTag = 'h1, h2, h3, h4';

  TitleButton.prototype.disableTag = 'pre, table';

  TitleButton.prototype._init = function() {
    this.menu = [
      {
        name: 'normal',
        text: this._t('normalText'),
        param: 'p'
      }, '|', {
        name: 'h1',
        text: this._t('title') + ' 1',
        param: 'h1'
      }, {
        name: 'h2',
        text: this._t('title') + ' 2',
        param: 'h2'
      }, {
        name: 'h3',
        text: this._t('title') + ' 3',
        param: 'h3'
      }, {
        name: 'h4',
        text: this._t('title') + ' 4',
        param: 'h4'
      }, {
        name: 'h5',
        text: this._t('title') + ' 5',
        param: 'h5'
      }
    ];
    return TitleButton.__super__._init.call(this);
  };

  TitleButton.prototype.setActive = function(active, param) {
    TitleButton.__super__.setActive.call(this, active);
    if (active) {
      param || (param = this.node[0].tagName.toLowerCase());
    }
    this.el.removeClass('active-p active-h1 active-h2 active-h3');
    if (active) {
      return this.el.addClass('active active-' + param);
    }
  };

  TitleButton.prototype.command = function(param) {
    var $rootNodes;
    $rootNodes = this.editor.selection.rootNodes();
    this.editor.selection.save();
    $rootNodes.each((function(_this) {
      return function(i, node) {
        var $node;
        $node = $(node);
        if ($node.is('blockquote') || $node.is(param) || $node.is(_this.disableTag) || _this.editor.util.isDecoratedNode($node)) {
          return;
        }
        return $('<' + param + '/>').append($node.contents()).replaceAll($node);
      };
    })(this));
    this.editor.selection.restore();
    return this.editor.trigger('valuechanged');
  };

  return TitleButton;

})(Button);

Simditor.Toolbar.addButton(TitleButton);

BoldButton = (function(superClass) {
  extend(BoldButton, superClass);

  function BoldButton() {
    return BoldButton.__super__.constructor.apply(this, arguments);
  }

  BoldButton.prototype.name = 'bold';

  BoldButton.prototype.icon = 'bold';

  BoldButton.prototype.htmlTag = 'b, strong';

  BoldButton.prototype.disableTag = 'pre';

  BoldButton.prototype.shortcut = 'cmd+b';

  BoldButton.prototype._init = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + ' ( Cmd + b )';
    } else {
      this.title = this.title + ' ( Ctrl + b )';
      this.shortcut = 'ctrl+b';
    }
    return BoldButton.__super__._init.call(this);
  };

  BoldButton.prototype._activeStatus = function() {
    var active;
    active = document.queryCommandState('bold') === true;
    this.setActive(active);
    return this.active;
  };

  BoldButton.prototype.command = function() {
    document.execCommand('bold');
    if (!this.editor.util.support.oninput) {
      this.editor.trigger('valuechanged');
    }
    return $(document).trigger('selectionchange');
  };

  return BoldButton;

})(Button);

Simditor.Toolbar.addButton(BoldButton);

ItalicButton = (function(superClass) {
  extend(ItalicButton, superClass);

  function ItalicButton() {
    return ItalicButton.__super__.constructor.apply(this, arguments);
  }

  ItalicButton.prototype.name = 'italic';

  ItalicButton.prototype.icon = 'italic';

  ItalicButton.prototype.htmlTag = 'i';

  ItalicButton.prototype.disableTag = 'pre';

  ItalicButton.prototype.shortcut = 'cmd+i';

  ItalicButton.prototype._init = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + " ( Cmd + i )";
    } else {
      this.title = this.title + " ( Ctrl + i )";
      this.shortcut = 'ctrl+i';
    }
    return ItalicButton.__super__._init.call(this);
  };

  ItalicButton.prototype._activeStatus = function() {
    var active;
    active = document.queryCommandState('italic') === true;
    this.setActive(active);
    return this.active;
  };

  ItalicButton.prototype.command = function() {
    document.execCommand('italic');
    if (!this.editor.util.support.oninput) {
      this.editor.trigger('valuechanged');
    }
    return $(document).trigger('selectionchange');
  };

  return ItalicButton;

})(Button);

Simditor.Toolbar.addButton(ItalicButton);

UnderlineButton = (function(superClass) {
  extend(UnderlineButton, superClass);

  function UnderlineButton() {
    return UnderlineButton.__super__.constructor.apply(this, arguments);
  }

  UnderlineButton.prototype.name = 'underline';

  UnderlineButton.prototype.icon = 'underline';

  UnderlineButton.prototype.htmlTag = 'u';

  UnderlineButton.prototype.disableTag = 'pre';

  UnderlineButton.prototype.shortcut = 'cmd+u';

  UnderlineButton.prototype.render = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + ' ( Cmd + u )';
    } else {
      this.title = this.title + ' ( Ctrl + u )';
      this.shortcut = 'ctrl+u';
    }
    return UnderlineButton.__super__.render.call(this);
  };

  UnderlineButton.prototype._activeStatus = function() {
    var active;
    active = document.queryCommandState('underline') === true;
    this.setActive(active);
    return this.active;
  };

  UnderlineButton.prototype.command = function() {
    document.execCommand('underline');
    if (!this.editor.util.support.oninput) {
      this.editor.trigger('valuechanged');
    }
    return $(document).trigger('selectionchange');
  };

  return UnderlineButton;

})(Button);

Simditor.Toolbar.addButton(UnderlineButton);

ColorButton = (function(superClass) {
  extend(ColorButton, superClass);

  function ColorButton() {
    return ColorButton.__super__.constructor.apply(this, arguments);
  }

  ColorButton.prototype.name = 'color';

  ColorButton.prototype.icon = 'tint';

  ColorButton.prototype.disableTag = 'pre';

  ColorButton.prototype.menu = true;

  ColorButton.prototype.render = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return ColorButton.__super__.render.apply(this, args);
  };

  ColorButton.prototype.renderMenu = function() {
    $('<ul class="color-list">\n  <li><a href="javascript:;" class="font-color font-color-1"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-2"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-3"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-4"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-5"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-6"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-7"></a></li>\n  <li><a href="javascript:;" class="font-color font-color-default"></a></li>\n</ul>').appendTo(this.menuWrapper);
    this.menuWrapper.on('mousedown', '.color-list', function(e) {
      return false;
    });
    return this.menuWrapper.on('click', '.font-color', (function(_this) {
      return function(e) {
        var $link, $p, hex, range, rgb, textNode;
        _this.wrapper.removeClass('menu-on');
        $link = $(e.currentTarget);
        if ($link.hasClass('font-color-default')) {
          $p = _this.editor.body.find('p, li');
          if (!($p.length > 0)) {
            return;
          }
          rgb = window.getComputedStyle($p[0], null).getPropertyValue('color');
          hex = _this._convertRgbToHex(rgb);
        } else {
          rgb = window.getComputedStyle($link[0], null).getPropertyValue('background-color');
          hex = _this._convertRgbToHex(rgb);
        }
        if (!hex) {
          return;
        }
        range = _this.editor.selection.range();
        if (!$link.hasClass('font-color-default') && range.collapsed) {
          textNode = document.createTextNode(_this._t('coloredText'));
          range.insertNode(textNode);
          range.selectNodeContents(textNode);
          _this.editor.selection.range(range);
        }
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('foreColor', false, hex);
        document.execCommand('styleWithCSS', false, false);
        if (!_this.editor.util.support.oninput) {
          return _this.editor.trigger('valuechanged');
        }
      };
    })(this));
  };

  ColorButton.prototype._convertRgbToHex = function(rgb) {
    var match, re, rgbToHex;
    re = /rgb\((\d+),\s?(\d+),\s?(\d+)\)/g;
    match = re.exec(rgb);
    if (!match) {
      return '';
    }
    rgbToHex = function(r, g, b) {
      var componentToHex;
      componentToHex = function(c) {
        var hex;
        hex = c.toString(16);
        if (hex.length === 1) {
          return '0' + hex;
        } else {
          return hex;
        }
      };
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };
    return rgbToHex(match[1] * 1, match[2] * 1, match[3] * 1);
  };

  return ColorButton;

})(Button);

Simditor.Toolbar.addButton(ColorButton);

ListButton = (function(superClass) {
  extend(ListButton, superClass);

  function ListButton() {
    return ListButton.__super__.constructor.apply(this, arguments);
  }

  ListButton.prototype.type = '';

  ListButton.prototype.disableTag = 'pre, table';

  ListButton.prototype.command = function(param) {
    var $list, $rootNodes, anotherType;
    $rootNodes = this.editor.selection.blockNodes();
    anotherType = this.type === 'ul' ? 'ol' : 'ul';
    this.editor.selection.save();
    $list = null;
    $rootNodes.each((function(_this) {
      return function(i, node) {
        var $node;
        $node = $(node);
        if ($node.is('blockquote, li') || $node.is(_this.disableTag) || _this.editor.util.isDecoratedNode($node) || !$.contains(document, node)) {
          return;
        }
        if ($node.is(_this.type)) {
          $node.children('li').each(function(i, li) {
            var $childList, $li;
            $li = $(li);
            $childList = $li.children('ul, ol').insertAfter($node);
            return $('<p/>').append($(li).html() || _this.editor.util.phBr).insertBefore($node);
          });
          return $node.remove();
        } else if ($node.is(anotherType)) {
          return $('<' + _this.type + '/>').append($node.contents()).replaceAll($node);
        } else if ($list && $node.prev().is($list)) {
          $('<li/>').append($node.html() || _this.editor.util.phBr).appendTo($list);
          return $node.remove();
        } else {
          $list = $("<" + _this.type + "><li></li></" + _this.type + ">");
          $list.find('li').append($node.html() || _this.editor.util.phBr);
          return $list.replaceAll($node);
        }
      };
    })(this));
    this.editor.selection.restore();
    return this.editor.trigger('valuechanged');
  };

  return ListButton;

})(Button);

OrderListButton = (function(superClass) {
  extend(OrderListButton, superClass);

  function OrderListButton() {
    return OrderListButton.__super__.constructor.apply(this, arguments);
  }

  OrderListButton.prototype.type = 'ol';

  OrderListButton.prototype.name = 'ol';

  OrderListButton.prototype.icon = 'list-ol';

  OrderListButton.prototype.htmlTag = 'ol';

  OrderListButton.prototype.shortcut = 'cmd+/';

  OrderListButton.prototype._init = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + ' ( Cmd + / )';
    } else {
      this.title = this.title + ' ( ctrl + / )';
      this.shortcut = 'ctrl+/';
    }
    return OrderListButton.__super__._init.call(this);
  };

  return OrderListButton;

})(ListButton);

UnorderListButton = (function(superClass) {
  extend(UnorderListButton, superClass);

  function UnorderListButton() {
    return UnorderListButton.__super__.constructor.apply(this, arguments);
  }

  UnorderListButton.prototype.type = 'ul';

  UnorderListButton.prototype.name = 'ul';

  UnorderListButton.prototype.icon = 'list-ul';

  UnorderListButton.prototype.htmlTag = 'ul';

  UnorderListButton.prototype.shortcut = 'cmd+.';

  UnorderListButton.prototype._init = function() {
    if (this.editor.util.os.mac) {
      this.title = this.title + ' ( Cmd + . )';
    } else {
      this.title = this.title + ' ( Ctrl + . )';
      this.shortcut = 'ctrl+.';
    }
    return UnorderListButton.__super__._init.call(this);
  };

  return UnorderListButton;

})(ListButton);

Simditor.Toolbar.addButton(OrderListButton);

Simditor.Toolbar.addButton(UnorderListButton);

BlockquoteButton = (function(superClass) {
  extend(BlockquoteButton, superClass);

  function BlockquoteButton() {
    return BlockquoteButton.__super__.constructor.apply(this, arguments);
  }

  BlockquoteButton.prototype.name = 'blockquote';

  BlockquoteButton.prototype.icon = 'quote-left';

  BlockquoteButton.prototype.htmlTag = 'blockquote';

  BlockquoteButton.prototype.disableTag = 'pre, table';

  BlockquoteButton.prototype.command = function() {
    var $rootNodes, clearCache, nodeCache;
    $rootNodes = this.editor.selection.rootNodes();
    $rootNodes = $rootNodes.filter(function(i, node) {
      return !$(node).parent().is('blockquote');
    });
    this.editor.selection.save();
    nodeCache = [];
    clearCache = (function(_this) {
      return function() {
        if (nodeCache.length > 0) {
          $("<" + _this.htmlTag + "/>").insertBefore(nodeCache[0]).append(nodeCache);
          return nodeCache.length = 0;
        }
      };
    })(this);
    $rootNodes.each((function(_this) {
      return function(i, node) {
        var $node;
        $node = $(node);
        if (!$node.parent().is(_this.editor.body)) {
          return;
        }
        if ($node.is(_this.htmlTag)) {
          clearCache();
          return $node.children().unwrap();
        } else if ($node.is(_this.disableTag) || _this.editor.util.isDecoratedNode($node)) {
          return clearCache();
        } else {
          return nodeCache.push(node);
        }
      };
    })(this));
    clearCache();
    this.editor.selection.restore();
    return this.editor.trigger('valuechanged');
  };

  return BlockquoteButton;

})(Button);

Simditor.Toolbar.addButton(BlockquoteButton);

CodeButton = (function(superClass) {
  extend(CodeButton, superClass);

  function CodeButton() {
    return CodeButton.__super__.constructor.apply(this, arguments);
  }

  CodeButton.prototype.name = 'code';

  CodeButton.prototype.icon = 'code';

  CodeButton.prototype.htmlTag = 'pre';

  CodeButton.prototype.disableTag = 'ul, ol, table';

  CodeButton.prototype._init = function() {
    CodeButton.__super__._init.call(this);
    this.editor.on('decorate', (function(_this) {
      return function(e, $el) {
        return $el.find('pre').each(function(i, pre) {
          return _this.decorate($(pre));
        });
      };
    })(this));
    return this.editor.on('undecorate', (function(_this) {
      return function(e, $el) {
        return $el.find('pre').each(function(i, pre) {
          return _this.undecorate($(pre));
        });
      };
    })(this));
  };

  CodeButton.prototype.render = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    CodeButton.__super__.render.apply(this, args);
    return this.popover = new CodePopover({
      button: this
    });
  };

  CodeButton.prototype._status = function() {
    CodeButton.__super__._status.call(this);
    // console.log('test');
    if (this.active) {
      return this.popover.show(this.node);
    } else {
      return this.popover.hide();
    }
  };

  CodeButton.prototype.decorate = function($pre) {
    var $code, lang, ref, ref1;
    $code = $pre.find('> code');
    if ($code.length > 0) {
      lang = (ref = $code.attr('class')) != null ? (ref1 = ref.match(/lang-(\S+)/)) != null ? ref1[1] : void 0 : void 0;
      $code.contents().unwrap();
      if (lang) {
        return $pre.attr('data-lang', lang);
      }
    }
  };

  CodeButton.prototype.undecorate = function($pre) {
    var $code, lang;
    lang = $pre.attr('data-lang');
    $code = $('<code/>');
    if (lang && lang !== -1) {
      $code.addClass('lang-' + lang);
    }
    return $pre.wrapInner($code).removeAttr('data-lang');
  };

  CodeButton.prototype.command = function() {
    var $rootNodes, clearCache, nodeCache, resultNodes;
    $rootNodes = this.editor.selection.rootNodes();
    nodeCache = [];
    resultNodes = [];
    clearCache = (function(_this) {
      return function() {
        var $pre;
        if (!(nodeCache.length > 0)) {
          return;
        }
        $pre = $("<" + _this.htmlTag + "/>").insertBefore(nodeCache[0]).text(_this.editor.formatter.clearHtml(nodeCache));
        resultNodes.push($pre[0]);
        return nodeCache.length = 0;
      };
    })(this);
    $rootNodes.each((function(_this) {
      return function(i, node) {
        var $node, $p;
        $node = $(node);
        if ($node.is(_this.htmlTag)) {
          clearCache();
          $p = $('<p/>').append($node.html().replace('\n', '<br/>')).replaceAll($node);
          return resultNodes.push($p[0]);
        } else if ($node.is(_this.disableTag) || _this.editor.util.isDecoratedNode($node) || $node.is('blockquote')) {
          return clearCache();
        } else {
          return nodeCache.push(node);
        }
      };
    })(this));
    clearCache();
    this.editor.selection.setRangeAtEndOf($(resultNodes).last());
    return this.editor.trigger('valuechanged');
  };

  return CodeButton;

})(Button);

CodePopover = (function(superClass) {
  extend(CodePopover, superClass);

  function CodePopover() {
    return CodePopover.__super__.constructor.apply(this, arguments);
  }

  CodePopover.prototype.render = function() {
    var $option, k, lang, len, ref;
    this._tpl = "<div class=\"code-settings\">\n  <div class=\"settings-field\">\n    <select class=\"select-lang\">\n      <option value=\"-1\">" + (this._t('selectLanguage')) + "</option>\n    </select>\n  </div>\n</div>";
    this.langs = this.editor.opts.codeLanguages || [
      {
        name: 'Bash',
        value: 'bash'
      }, {
        name: 'C++',
        value: 'c++'
      }, {
        name: 'C#',
        value: 'cs'
      }, {
        name: 'CSS',
        value: 'css'
      }, {
        name: 'Erlang',
        value: 'erlang'
      }, {
        name: 'Less',
        value: 'less'
      }, {
        name: 'Sass',
        value: 'sass'
      },
      {
        name: 'SCSS',
        value: 'scss'
      },
      {
        name: 'Diff',
        value: 'diff'
      }, {
        name: 'CoffeeScript',
        value: 'coffeescript'
      }, {
        name: 'HTML,XML',
        value: 'html'
      }, {
        name: 'JSON',
        value: 'json'
      }, {
        name: 'Java',
        value: 'java'
      }, {
        name: 'JavaScript',
        value: 'js'
      },   
      {
        name: 'ES6',
        value: 'es6'
      },
      {
        name: 'Markdown',
        value: 'markdown'
      }, {
        name: 'Objective C',
        value: 'oc'
      }, {
        name: 'PHP',
        value: 'php'
      }, {
        name: 'Perl',
        value: 'parl'
      }, {
        name: 'Python',
        value: 'python'
      }, {
        name: 'Ruby',
        value: 'ruby'
      }, {
        name: 'SQL',
        value: 'sql'
      }
    ];
    this.el.addClass('code-popover').append(this._tpl);
    this.selectEl = this.el.find('.select-lang');
    ref = this.langs;
    for (k = 0, len = ref.length; k < len; k++) {
      lang = ref[k];
      $option = $('<option/>', {
        text: lang.name,
        value: lang.value
      }).appendTo(this.selectEl);
    }
    this.selectEl.on('change', (function(_this) {
      return function(e) {
        var selected;
        _this.lang = _this.selectEl.val();
        selected = _this.target.hasClass('selected');
        _this.target.removeClass().removeAttr('data-lang');
        if (_this.lang !== -1) {
          _this.target.attr('data-lang', _this.lang);
        }
        if (selected) {
          _this.target.addClass('selected');
        }
        return _this.editor.trigger('valuechanged');
      };
    })(this));
    return this.editor.on('valuechanged', (function(_this) {
      return function(e) {
        if (_this.active) {
          return _this.refresh();
        }
      };
    })(this));
  };

  CodePopover.prototype.show = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    CodePopover.__super__.show.apply(this, args);
    this.lang = this.target.attr('data-lang');
    if (this.lang != null) {
      return this.selectEl.val(this.lang);
    } else {
      return this.selectEl.val(-1);
    }
  };

  return CodePopover;

})(Popover);

Simditor.Toolbar.addButton(CodeButton);

LinkButton = (function(superClass) {
  extend(LinkButton, superClass);

  function LinkButton() {
    return LinkButton.__super__.constructor.apply(this, arguments);
  }

  LinkButton.prototype.name = 'link';

  LinkButton.prototype.icon = 'link';

  LinkButton.prototype.htmlTag = 'a';

  LinkButton.prototype.disableTag = 'pre';

  LinkButton.prototype.render = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    LinkButton.__super__.render.apply(this, args);
    return this.popover = new LinkPopover({
      button: this
    });
  };

  LinkButton.prototype._status = function() {
    LinkButton.__super__._status.call(this);
    if (this.active && !this.editor.selection.rangeAtEndOf(this.node)) {
      return this.popover.show(this.node);
    } else {
      return this.popover.hide();
    }
  };

  LinkButton.prototype.command = function() {
    var $contents, $link, $newBlock, linkText, range, txtNode;
    range = this.editor.selection.range();
    if (this.active) {
      txtNode = document.createTextNode(this.node.text());
      this.node.replaceWith(txtNode);
      range.selectNode(txtNode);
    } else {
      $contents = $(range.extractContents());
      linkText = this.editor.formatter.clearHtml($contents.contents(), false);
      $link = $('<a/>', {
        href: 'http://www.example.com',
        target: '_blank',
        text: linkText || this._t('linkText')
      });
      if (this.editor.selection.blockNodes().length === 1) {
        range.insertNode($link[0]);
      } else {
        $newBlock = $('<p/>').append($link);
        range.insertNode($newBlock[0]);
      }
      range.selectNodeContents($link[0]);
      this.popover.one('popovershow', (function(_this) {
        return function() {
          if (linkText) {
            _this.popover.urlEl.focus();
            return _this.popover.urlEl[0].select();
          } else {
            _this.popover.textEl.focus();
            return _this.popover.textEl[0].select();
          }
        };
      })(this));
    }
    this.editor.selection.range(range);
    return this.editor.trigger('valuechanged');
  };

  return LinkButton;

})(Button);

LinkPopover = (function(superClass) {
  extend(LinkPopover, superClass);

  function LinkPopover() {
    return LinkPopover.__super__.constructor.apply(this, arguments);
  }

  LinkPopover.prototype.render = function() {
    var tpl;
    tpl = "<div class=\"link-settings\">\n  <div class=\"settings-field\">\n    <label>" + (this._t('text')) + "</label>\n    <input class=\"link-text\" type=\"text\"/>\n    <a class=\"btn-unlink\" href=\"javascript:;\" title=\"" + (this._t('removeLink')) + "\"\n      tabindex=\"-1\">\n      <span class=\"simditor-icon simditor-icon-unlink\"></span>\n    </a>\n  </div>\n  <div class=\"settings-field\">\n    <label>" + (this._t('linkUrl')) + "</label>\n    <input class=\"link-url\" type=\"text\"/>\n  </div>\n</div>";
    this.el.addClass('link-popover').append(tpl);
    this.textEl = this.el.find('.link-text');
    this.urlEl = this.el.find('.link-url');
    this.unlinkEl = this.el.find('.btn-unlink');
    this.textEl.on('keyup', (function(_this) {
      return function(e) {
        if (e.which === 13) {
          return;
        }
        return _this.target.text(_this.textEl.val());
      };
    })(this));
    this.urlEl.on('keyup', (function(_this) {
      return function(e) {
        var val;
        if (e.which === 13) {
          return;
        }
        val = _this.urlEl.val();
        if (!(/https?:\/\/|^\//ig.test(val) || !val)) {
          val = 'http://' + val;
        }
        return _this.target.attr('href', val);
      };
    })(this));
    $([this.urlEl[0], this.textEl[0]]).on('keydown', (function(_this) {
      return function(e) {
        var range;
        if (e.which === 13 || e.which === 27 || (!e.shiftKey && e.which === 9 && $(e.target).hasClass('link-url'))) {
          e.preventDefault();
          range = document.createRange();
          _this.editor.selection.setRangeAfter(_this.target, range);
          _this.hide();
          return _this.editor.trigger('valuechanged');
        }
      };
    })(this));
    return this.unlinkEl.on('click', (function(_this) {
      return function(e) {
        var range, txtNode;
        txtNode = document.createTextNode(_this.target.text());
        _this.target.replaceWith(txtNode);
        _this.hide();
        range = document.createRange();
        _this.editor.selection.setRangeAfter(txtNode, range);
        return _this.editor.trigger('valuechanged');
      };
    })(this));
  };

  LinkPopover.prototype.show = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    LinkPopover.__super__.show.apply(this, args);
    this.textEl.val(this.target.text());
    return this.urlEl.val(this.target.attr('href'));
  };

  return LinkPopover;

})(Popover);

Simditor.Toolbar.addButton(LinkButton);

ImageButton = (function(superClass) {
  extend(ImageButton, superClass);

  function ImageButton() {
    return ImageButton.__super__.constructor.apply(this, arguments);
  }

  ImageButton.prototype.name = 'image';

  ImageButton.prototype.icon = 'picture-o';

  ImageButton.prototype.htmlTag = 'img';

  ImageButton.prototype.disableTag = 'pre, table';

  ImageButton.prototype.defaultImage = '';

  ImageButton.prototype.needFocus = false;

  ImageButton.prototype._init = function() {
    var item, k, len, ref;
    if (this.editor.opts.imageButton) {
      if (Array.isArray(this.editor.opts.imageButton)) {
        this.menu = [];
        ref = this.editor.opts.imageButton;
        for (k = 0, len = ref.length; k < len; k++) {
          item = ref[k];
          this.menu.push({
            name: item + '-image',
            text: this._t(item + 'Image')
          });
        }
      } else {
        this.menu = false;
      }
    } else {
      if (this.editor.uploader != null) {
        this.menu = [
          {
            name: 'upload-image',
            text: this._t('uploadImage')
          }, {
            name: 'external-image',
            text: this._t('externalImage')
          }
        ];
      } else {
        this.menu = false;
      }
    }
    this.defaultImage = this.editor.opts.defaultImage;
    this.editor.body.on('click', 'img:not([data-non-image])', (function(_this) {
      return function(e) {
        var $img, range;
        $img = $(e.currentTarget);
        range = document.createRange();
        range.selectNode($img[0]);
        _this.editor.selection.range(range);
        if (!_this.editor.util.support.onselectionchange) {
          _this.editor.trigger('selectionchanged');
        }
        return false;
      };
    })(this));
    this.editor.body.on('mouseup', 'img:not([data-non-image])', function(e) {
      return false;
    });
    this.editor.on('selectionchanged.image', (function(_this) {
      return function() {
        var $contents, $img, range;
        range = _this.editor.selection.range();
        if (range == null) {
          return;
        }
        $contents = $(range.cloneContents()).contents();
        if ($contents.length === 1 && $contents.is('img:not([data-non-image])')) {
          $img = $(range.startContainer).contents().eq(range.startOffset);
          return _this.popover.show($img);
        } else {
          return _this.popover.hide();
        }
      };
    })(this));
    this.editor.on('valuechanged.image', (function(_this) {
      return function() {
        var $masks;
        $masks = _this.editor.wrapper.find('.simditor-image-loading');
        if (!($masks.length > 0)) {
          return;
        }
        return $masks.each(function(i, mask) {
          var $img, $mask, file;
          $mask = $(mask);
          $img = $mask.data('img');
          if (!($img && $img.parent().length > 0)) {
            $mask.remove();
            if ($img) {
              file = $img.data('file');
              if (file) {
                _this.editor.uploader.cancel(file);
                if (_this.editor.body.find('img.uploading').length < 1) {
                  return _this.editor.uploader.trigger('uploadready', [file]);
                }
              }
            }
          }
        });
      };
    })(this));
    return ImageButton.__super__._init.call(this);
  };

  ImageButton.prototype.render = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ImageButton.__super__.render.apply(this, args);
    this.popover = new ImagePopover({
      button: this
    });
    if (this.editor.opts.imageButton === 'upload') {
      return this._initUploader(this.el);
    }
  };

  ImageButton.prototype.renderMenu = function() {
    ImageButton.__super__.renderMenu.call(this);
    return this._initUploader();
  };

  ImageButton.prototype._initUploader = function($uploadItem) {
    var $input, createInput, uploadProgress;
    if ($uploadItem == null) {
      $uploadItem = this.menuEl.find('.menu-item-upload-image');
    }
    if (this.editor.uploader == null) {
      this.el.find('.btn-upload').remove();
      return;
    }
    $input = null;
    createInput = (function(_this) {
      return function() {
        if ($input) {
          $input.remove();
        }
        return $input = $('<input/>', {
          type: 'file',
          title: _this._t('uploadImage'),
          multiple: true,
          accept: 'image/*'
        }).appendTo($uploadItem);
      };
    })(this);
    createInput();
    $uploadItem.on('click mousedown', 'input[type=file]', function(e) {
      return e.stopPropagation();
    });
    $uploadItem.on('change', 'input[type=file]', (function(_this) {
      return function(e) {
        if (_this.editor.inputManager.focused) {
          _this.editor.uploader.upload($input, {
            inline: true
          });
          createInput();
        } else {
          _this.editor.one('focus', function(e) {
            _this.editor.uploader.upload($input, {
              inline: true
            });
            return createInput();
          });
          _this.editor.focus();
        }
        return _this.wrapper.removeClass('menu-on');
      };
    })(this));
    this.editor.uploader.on('beforeupload', (function(_this) {
      return function(e, file) {
        var $img;
        if (!file.inline) {
          return;
        }
        if (file.img) {
          $img = $(file.img);
        } else {
          $img = _this.createImage(file.name);
          file.img = $img;
        }
        $img.addClass('uploading');
        $img.data('file', file);
        return _this.editor.uploader.readImageFile(file.obj, function(img) {
          var src;
          if (!$img.hasClass('uploading')) {
            return;
          }
          src = img ? img.src : _this.defaultImage;
          return _this.loadImage($img, src, function() {
            if (_this.popover.active) {
              _this.popover.refresh();
              return _this.popover.srcEl.val(_this._t('uploading')).prop('disabled', true);
            }
          });
        });
      };
    })(this));
    uploadProgress = $.proxy(this.editor.util.throttle(function(e, file, loaded, total) {
      var $img, $mask, percent;
      if (!file.inline) {
        return;
      }
      $mask = file.img.data('mask');
      if (!$mask) {
        return;
      }
      $img = $mask.data('img');
      if (!($img.hasClass('uploading') && $img.parent().length > 0)) {
        $mask.remove();
        return;
      }
      percent = loaded / total;
      percent = (percent * 100).toFixed(0);
      if (percent > 99) {
        percent = 99;
      }
      return $mask.find('.progress').height((100 - percent) + "%");
    }, 500), this);
    this.editor.uploader.on('uploadprogress', uploadProgress);
    this.editor.uploader.on('uploadsuccess', (function(_this) {
      return function(e, file, result) {
        var $img, $mask, msg;
        if (!file.inline) {
          return;
        }
        $img = file.img;
        if (!($img.hasClass('uploading') && $img.parent().length > 0)) {
          return;
        }
        $img.removeData('file');
        $img.removeClass('uploading').removeClass('loading');
        $mask = $img.data('mask');
        if ($mask) {
          $mask.remove();
        }
        $img.removeData('mask');
        if (typeof result !== 'object') {
          try {
            result = $.parseJSON(result);
          } catch (_error) {
            e = _error;
            result = {
              success: false
            };
          }
        }
        if (result.success === false) {
          msg = result.msg || _this._t('uploadFailed');
          alert(msg);
          $img.attr('src', _this.defaultImage);
        } else {
          $img.attr('src', result.file_path);
        }
        if (_this.popover.active) {
          _this.popover.srcEl.prop('disabled', false);
          _this.popover.srcEl.val(result.file_path);
        }
        _this.editor.trigger('valuechanged');
        if (_this.editor.body.find('img.uploading').length < 1) {
          return _this.editor.uploader.trigger('uploadready', [file, result]);
        }
      };
    })(this));
    return this.editor.uploader.on('uploaderror', (function(_this) {
      return function(e, file, xhr) {
        var $img, $mask, msg, result;
        if (!file.inline) {
          return;
        }
        if (xhr.statusText === 'abort') {
          return;
        }
        if (xhr.responseText) {
          try {
            result = $.parseJSON(xhr.responseText);
            msg = result.msg;
          } catch (_error) {
            e = _error;
            msg = _this._t('uploadError');
          }
          alert(msg);
        }
        $img = file.img;
        if (!($img.hasClass('uploading') && $img.parent().length > 0)) {
          return;
        }
        $img.removeData('file');
        $img.removeClass('uploading').removeClass('loading');
        $mask = $img.data('mask');
        if ($mask) {
          $mask.remove();
        }
        $img.removeData('mask');
        $img.attr('src', _this.defaultImage);
        if (_this.popover.active) {
          _this.popover.srcEl.prop('disabled', false);
          _this.popover.srcEl.val(_this.defaultImage);
        }
        _this.editor.trigger('valuechanged');
        if (_this.editor.body.find('img.uploading').length < 1) {
          return _this.editor.uploader.trigger('uploadready', [file, result]);
        }
      };
    })(this));
  };

  ImageButton.prototype._status = function() {
    return this._disableStatus();
  };

  ImageButton.prototype.loadImage = function($img, src, callback) {
    var $mask, img, positionMask;
    positionMask = (function(_this) {
      return function() {
        var imgOffset, wrapperOffset;
        imgOffset = $img.offset();
        wrapperOffset = _this.editor.wrapper.offset();
        return $mask.css({
          top: imgOffset.top - wrapperOffset.top,
          left: imgOffset.left - wrapperOffset.left,
          width: $img.width(),
          height: $img.height()
        }).show();
      };
    })(this);
    $img.addClass('loading');
    $mask = $img.data('mask');
    if (!$mask) {
      $mask = $('<div class="simditor-image-loading">\n  <div class="progress"></div>\n</div>').hide().appendTo(this.editor.wrapper);
      positionMask();
      $img.data('mask', $mask);
      $mask.data('img', $img);
    }
    img = new Image();
    img.onload = (function(_this) {
      return function() {
        var height, width;
        if (!$img.hasClass('loading') && !$img.hasClass('uploading')) {
          return;
        }
        width = img.width;
        height = img.height;
        $img.attr({
          src: src,
          width: width,
          height: height,
          'data-image-size': width + ',' + height
        }).removeClass('loading');
        if ($img.hasClass('uploading')) {
          _this.editor.util.reflow(_this.editor.body);
          positionMask();
        } else {
          $mask.remove();
          $img.removeData('mask');
        }
        return callback(img);
      };
    })(this);
    img.onerror = function() {
      callback(false);
      $mask.remove();
      return $img.removeData('mask').removeClass('loading');
    };
    return img.src = src;
  };

  ImageButton.prototype.createImage = function(name) {
    var $img, range;
    if (name == null) {
      name = 'Image';
    }
    if (!this.editor.inputManager.focused) {
      this.editor.focus();
    }
    range = this.editor.selection.range();
    range.deleteContents();
    this.editor.selection.range(range);
    $img = $('<img/>').attr('alt', name);
    range.insertNode($img[0]);
    this.editor.selection.setRangeAfter($img, range);
    this.editor.trigger('valuechanged');
    return $img;
  };

  ImageButton.prototype.command = function(src) {
    var $img;
    $img = this.createImage();
    return this.loadImage($img, src || this.defaultImage, (function(_this) {
      return function() {
        _this.editor.trigger('valuechanged');
        _this.editor.util.reflow($img);
        $img.click();
        return _this.popover.one('popovershow', function() {
          _this.popover.srcEl.focus();
          return _this.popover.srcEl[0].select();
        });
      };
    })(this));
  };

  return ImageButton;

})(Button);

ImagePopover = (function(superClass) {
  extend(ImagePopover, superClass);

  function ImagePopover() {
    return ImagePopover.__super__.constructor.apply(this, arguments);
  }

  ImagePopover.prototype.offset = {
    top: 6,
    left: -4
  };

  ImagePopover.prototype.render = function() {
    var tpl;
    tpl = "<div class=\"link-settings\">\n  <div class=\"settings-field\">\n    <label>" + (this._t('imageUrl')) + "</label>\n    <input class=\"image-src\" type=\"text\" tabindex=\"1\" />\n    <a class=\"btn-upload\" href=\"javascript:;\"\n      title=\"" + (this._t('uploadImage')) + "\" tabindex=\"-1\">\n      <span class=\"simditor-icon simditor-icon-upload\"></span>\n    </a>\n  </div>\n  <div class='settings-field'>\n    <label>" + (this._t('imageAlt')) + "</label>\n    <input class=\"image-alt\" id=\"image-alt\" type=\"text\" tabindex=\"1\" />\n  </div>\n  <div class=\"settings-field\">\n    <label>" + (this._t('imageSize')) + "</label>\n    <input class=\"image-size\" id=\"image-width\" type=\"text\" tabindex=\"2\" />\n    <span class=\"times\">×</span>\n    <input class=\"image-size\" id=\"image-height\" type=\"text\" tabindex=\"3\" />\n    <a class=\"btn-restore\" href=\"javascript:;\"\n      title=\"" + (this._t('restoreImageSize')) + "\" tabindex=\"-1\">\n      <span class=\"simditor-icon simditor-icon-undo\"></span>\n    </a>\n  </div>\n</div>";
    this.el.addClass('image-popover').append(tpl);
    this.srcEl = this.el.find('.image-src');
    this.widthEl = this.el.find('#image-width');
    this.heightEl = this.el.find('#image-height');
    this.altEl = this.el.find('#image-alt');
    this.srcEl.on('keydown', (function(_this) {
      return function(e) {
        var range;
        if (!(e.which === 13 && !_this.target.hasClass('uploading'))) {
          return;
        }
        e.preventDefault();
        range = document.createRange();
        _this.button.editor.selection.setRangeAfter(_this.target, range);
        return _this.hide();
      };
    })(this));
    this.srcEl.on('blur', (function(_this) {
      return function(e) {
        return _this._loadImage(_this.srcEl.val());
      };
    })(this));
    this.el.find('.image-size').on('blur', (function(_this) {
      return function(e) {
        _this._resizeImg($(e.currentTarget));
        return _this.el.data('popover').refresh();
      };
    })(this));
    this.el.find('.image-size').on('keyup', (function(_this) {
      return function(e) {
        var inputEl;
        inputEl = $(e.currentTarget);
        if (!(e.which === 13 || e.which === 27 || e.which === 9)) {
          return _this._resizeImg(inputEl, true);
        }
      };
    })(this));
    this.el.find('.image-size').on('keydown', (function(_this) {
      return function(e) {
        var $img, inputEl, range;
        inputEl = $(e.currentTarget);
        if (e.which === 13 || e.which === 27) {
          e.preventDefault();
          if (e.which === 13) {
            _this._resizeImg(inputEl);
          } else {
            _this._restoreImg();
          }
          $img = _this.target;
          _this.hide();
          range = document.createRange();
          return _this.button.editor.selection.setRangeAfter($img, range);
        } else if (e.which === 9) {
          return _this.el.data('popover').refresh();
        }
      };
    })(this));
    this.altEl.on('keydown', (function(_this) {
      return function(e) {
        var range;
        if (e.which === 13) {
          e.preventDefault();
          range = document.createRange();
          _this.button.editor.selection.setRangeAfter(_this.target, range);
          return _this.hide();
        }
      };
    })(this));
    this.altEl.on('keyup', (function(_this) {
      return function(e) {
        if (e.which === 13 || e.which === 27 || e.which === 9) {
          return;
        }
        _this.alt = _this.altEl.val();
        return _this.target.attr('alt', _this.alt);
      };
    })(this));
    this.el.find('.btn-restore').on('click', (function(_this) {
      return function(e) {
        _this._restoreImg();
        return _this.el.data('popover').refresh();
      };
    })(this));
    this.editor.on('valuechanged', (function(_this) {
      return function(e) {
        if (_this.active) {
          return _this.refresh();
        }
      };
    })(this));
    return this._initUploader();
  };

  ImagePopover.prototype._initUploader = function() {
    var $uploadBtn, createInput;
    $uploadBtn = this.el.find('.btn-upload');
    if (this.editor.uploader == null) {
      $uploadBtn.remove();
      return;
    }
    createInput = (function(_this) {
      return function() {
        if (_this.input) {
          _this.input.remove();
        }
        return _this.input = $('<input/>', {
          type: 'file',
          title: _this._t('uploadImage'),
          multiple: true,
          accept: 'image/*'
        }).appendTo($uploadBtn);
      };
    })(this);
    createInput();
    this.el.on('click mousedown', 'input[type=file]', function(e) {
      return e.stopPropagation();
    });
    return this.el.on('change', 'input[type=file]', (function(_this) {
      return function(e) {
        _this.editor.uploader.upload(_this.input, {
          inline: true,
          img: _this.target
        });
        return createInput();
      };
    })(this));
  };

  ImagePopover.prototype._resizeImg = function(inputEl, onlySetVal) {
    var height, value, width;
    if (onlySetVal == null) {
      onlySetVal = false;
    }
    value = inputEl.val() * 1;
    if (!(this.target && ($.isNumeric(value) || value < 0))) {
      return;
    }
    if (inputEl.is(this.widthEl)) {
      width = value;
      height = this.height * value / this.width;
      this.heightEl.val(height);
    } else {
      height = value;
      width = this.width * value / this.height;
      this.widthEl.val(width);
    }
    if (!onlySetVal) {
      this.target.attr({
        width: width,
        height: height
      });
      return this.editor.trigger('valuechanged');
    }
  };

  ImagePopover.prototype._restoreImg = function() {
    var ref, size;
    size = ((ref = this.target.data('image-size')) != null ? ref.split(",") : void 0) || [this.width, this.height];
    this.target.attr({
      width: size[0] * 1,
      height: size[1] * 1
    });
    this.widthEl.val(size[0]);
    this.heightEl.val(size[1]);
    return this.editor.trigger('valuechanged');
  };

  ImagePopover.prototype._loadImage = function(src, callback) {
    if (/^data:image/.test(src) && !this.editor.uploader) {
      if (callback) {
        callback(false);
      }
      return;
    }
    if (this.target.attr('src') === src) {
      return;
    }
    return this.button.loadImage(this.target, src, (function(_this) {
      return function(img) {
        var blob;
        if (!img) {
          return;
        }
        if (_this.active) {
          _this.width = img.width;
          _this.height = img.height;
          _this.widthEl.val(_this.width);
          _this.heightEl.val(_this.height);
        }
        if (/^data:image/.test(src)) {
          blob = _this.editor.util.dataURLtoBlob(src);
          blob.name = "Base64 Image.png";
          _this.editor.uploader.upload(blob, {
            inline: true,
            img: _this.target
          });
        } else {
          _this.editor.trigger('valuechanged');
        }
        if (callback) {
          return callback(img);
        }
      };
    })(this));
  };

  ImagePopover.prototype.show = function() {
    var $img, args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ImagePopover.__super__.show.apply(this, args);
    $img = this.target;
    this.width = $img.width();
    this.height = $img.height();
    this.alt = $img.attr('alt');
    if ($img.hasClass('uploading')) {
      return this.srcEl.val(this._t('uploading')).prop('disabled', true);
    } else {
      this.srcEl.val($img.attr('src')).prop('disabled', false);
      this.widthEl.val(this.width);
      this.heightEl.val(this.height);
      return this.altEl.val(this.alt);
    }
  };

  return ImagePopover;

})(Popover);

Simditor.Toolbar.addButton(ImageButton);

IndentButton = (function(superClass) {
  extend(IndentButton, superClass);

  function IndentButton() {
    return IndentButton.__super__.constructor.apply(this, arguments);
  }

  IndentButton.prototype.name = 'indent';

  IndentButton.prototype.icon = 'indent';

  IndentButton.prototype._init = function() {
    this.title = this._t(this.name) + ' (Tab)';
    return IndentButton.__super__._init.call(this);
  };

  IndentButton.prototype._status = function() {};

  IndentButton.prototype.command = function() {
    return this.editor.indentation.indent();
  };

  return IndentButton;

})(Button);

Simditor.Toolbar.addButton(IndentButton);

OutdentButton = (function(superClass) {
  extend(OutdentButton, superClass);

  function OutdentButton() {
    return OutdentButton.__super__.constructor.apply(this, arguments);
  }

  OutdentButton.prototype.name = 'outdent';

  OutdentButton.prototype.icon = 'outdent';

  OutdentButton.prototype._init = function() {
    this.title = this._t(this.name) + ' (Shift + Tab)';
    return OutdentButton.__super__._init.call(this);
  };

  OutdentButton.prototype._status = function() {};

  OutdentButton.prototype.command = function() {
    return this.editor.indentation.indent(true);
  };

  return OutdentButton;

})(Button);

Simditor.Toolbar.addButton(OutdentButton);

HrButton = (function(superClass) {
  extend(HrButton, superClass);

  function HrButton() {
    return HrButton.__super__.constructor.apply(this, arguments);
  }

  HrButton.prototype.name = 'hr';

  HrButton.prototype.icon = 'minus';

  HrButton.prototype.htmlTag = 'hr';

  HrButton.prototype._status = function() {};

  HrButton.prototype.command = function() {
    var $hr, $newBlock, $nextBlock, $rootBlock;
    $rootBlock = this.editor.selection.rootNodes().first();
    $nextBlock = $rootBlock.next();
    if ($nextBlock.length > 0) {
      this.editor.selection.save();
    } else {
      $newBlock = $('<p/>').append(this.editor.util.phBr);
    }
    $hr = $('<hr/>').insertAfter($rootBlock);
    if ($newBlock) {
      $newBlock.insertAfter($hr);
      this.editor.selection.setRangeAtStartOf($newBlock);
    } else {
      this.editor.selection.restore();
    }
    return this.editor.trigger('valuechanged');
  };

  return HrButton;

})(Button);

Simditor.Toolbar.addButton(HrButton);

TableButton = (function(superClass) {
  extend(TableButton, superClass);

  function TableButton() {
    return TableButton.__super__.constructor.apply(this, arguments);
  }

  TableButton.prototype.name = 'table';

  TableButton.prototype.icon = 'table';

  TableButton.prototype.htmlTag = 'table';

  TableButton.prototype.disableTag = 'pre, li, blockquote';

  TableButton.prototype.menu = true;

  TableButton.prototype._init = function() {
    TableButton.__super__._init.call(this);
    $.merge(this.editor.formatter._allowedTags, ['thead', 'th', 'tbody', 'tr', 'td', 'colgroup', 'col']);
    $.extend(this.editor.formatter._allowedAttributes, {
      td: ['rowspan', 'colspan'],
      col: ['width']
    });
    $.extend(this.editor.formatter._allowedStyles, {
      td: ['text-align'],
      th: ['text-align']
    });
    this._initShortcuts();
    this.editor.on('decorate', (function(_this) {
      return function(e, $el) {
        return $el.find('table').each(function(i, table) {
          return _this.decorate($(table));
        });
      };
    })(this));
    this.editor.on('undecorate', (function(_this) {
      return function(e, $el) {
        return $el.find('table').each(function(i, table) {
          return _this.undecorate($(table));
        });
      };
    })(this));
    this.editor.on('selectionchanged.table', (function(_this) {
      return function(e) {
        var $container, range;
        _this.editor.body.find('.simditor-table td, .simditor-table th').removeClass('active');
        range = _this.editor.selection.range();
        if (!range) {
          return;
        }
        $container = _this.editor.selection.containerNode();
        if (range.collapsed && $container.is('.simditor-table')) {
          if (_this.editor.selection.rangeAtStartOf($container)) {
            $container = $container.find('th:first');
          } else {
            $container = $container.find('td:last');
          }
          _this.editor.selection.setRangeAtEndOf($container);
        }
        return $container.closest('td, th', _this.editor.body).addClass('active');
      };
    })(this));
    this.editor.on('blur.table', (function(_this) {
      return function(e) {
        return _this.editor.body.find('.simditor-table td, .simditor-table th').removeClass('active');
      };
    })(this));
    this.editor.inputManager.addKeystrokeHandler('38', 'td', (function(_this) {
      return function(e, $node) {
        _this._tdNav($node, 'up');
        return true;
      };
    })(this));
    this.editor.inputManager.addKeystrokeHandler('38', 'th', (function(_this) {
      return function(e, $node) {
        _this._tdNav($node, 'up');
        return true;
      };
    })(this));
    this.editor.inputManager.addKeystrokeHandler('40', 'td', (function(_this) {
      return function(e, $node) {
        _this._tdNav($node, 'down');
        return true;
      };
    })(this));
    return this.editor.inputManager.addKeystrokeHandler('40', 'th', (function(_this) {
      return function(e, $node) {
        _this._tdNav($node, 'down');
        return true;
      };
    })(this));
  };

  TableButton.prototype._tdNav = function($td, direction) {
    var $anotherTr, $tr, action, anotherTag, index, parentTag, ref;
    if (direction == null) {
      direction = 'up';
    }
    action = direction === 'up' ? 'prev' : 'next';
    ref = direction === 'up' ? ['tbody', 'thead'] : ['thead', 'tbody'], parentTag = ref[0], anotherTag = ref[1];
    $tr = $td.parent('tr');
    $anotherTr = this["_" + action + "Row"]($tr);
    if (!($anotherTr.length > 0)) {
      return true;
    }
    index = $tr.find('td, th').index($td);
    return this.editor.selection.setRangeAtEndOf($anotherTr.find('td, th').eq(index));
  };

  TableButton.prototype._nextRow = function($tr) {
    var $nextTr;
    $nextTr = $tr.next('tr');
    if ($nextTr.length < 1 && $tr.parent('thead').length > 0) {
      $nextTr = $tr.parent('thead').next('tbody').find('tr:first');
    }
    return $nextTr;
  };

  TableButton.prototype._prevRow = function($tr) {
    var $prevTr;
    $prevTr = $tr.prev('tr');
    if ($prevTr.length < 1 && $tr.parent('tbody').length > 0) {
      $prevTr = $tr.parent('tbody').prev('thead').find('tr');
    }
    return $prevTr;
  };

  TableButton.prototype.initResize = function($table) {
    var $colgroup, $resizeHandle, $wrapper;
    $wrapper = $table.parent('.simditor-table');
    $colgroup = $table.find('colgroup');
    if ($colgroup.length < 1) {
      $colgroup = $('<colgroup/>').prependTo($table);
      $table.find('thead tr th').each(function(i, td) {
        var $col;
        return $col = $('<col/>').appendTo($colgroup);
      });
      this.refreshTableWidth($table);
    }
    $resizeHandle = $('<div />', {
      "class": 'simditor-resize-handle',
      contenteditable: 'false'
    }).appendTo($wrapper);
    $wrapper.on('mousemove', 'td, th', function(e) {
      var $col, $td, index, ref, ref1, x;
      if ($wrapper.hasClass('resizing')) {
        return;
      }
      $td = $(e.currentTarget);
      x = e.pageX - $(e.currentTarget).offset().left;
      if (x < 5 && $td.prev().length > 0) {
        $td = $td.prev();
      }
      if ($td.next('td, th').length < 1) {
        $resizeHandle.hide();
        return;
      }
      if ((ref = $resizeHandle.data('td')) != null ? ref.is($td) : void 0) {
        $resizeHandle.show();
        return;
      }
      index = $td.parent().find('td, th').index($td);
      $col = $colgroup.find('col').eq(index);
      if ((ref1 = $resizeHandle.data('col')) != null ? ref1.is($col) : void 0) {
        $resizeHandle.show();
        return;
      }
      return $resizeHandle.css('left', $td.position().left + $td.outerWidth() - 5).data('td', $td).data('col', $col).show();
    });
    $wrapper.on('mouseleave', function(e) {
      return $resizeHandle.hide();
    });
    return $wrapper.on('mousedown', '.simditor-resize-handle', function(e) {
      var $handle, $leftCol, $leftTd, $rightCol, $rightTd, minWidth, startHandleLeft, startLeftWidth, startRightWidth, startX, tableWidth;
      $handle = $(e.currentTarget);
      $leftTd = $handle.data('td');
      $leftCol = $handle.data('col');
      $rightTd = $leftTd.next('td, th');
      $rightCol = $leftCol.next('col');
      startX = e.pageX;
      startLeftWidth = $leftTd.outerWidth() * 1;
      startRightWidth = $rightTd.outerWidth() * 1;
      startHandleLeft = parseFloat($handle.css('left'));
      tableWidth = $leftTd.closest('table').width();
      minWidth = 50;
      $(document).on('mousemove.simditor-resize-table', function(e) {
        var deltaX, leftWidth, rightWidth;
        deltaX = e.pageX - startX;
        leftWidth = startLeftWidth + deltaX;
        rightWidth = startRightWidth - deltaX;
        if (leftWidth < minWidth) {
          leftWidth = minWidth;
          deltaX = minWidth - startLeftWidth;
          rightWidth = startRightWidth - deltaX;
        } else if (rightWidth < minWidth) {
          rightWidth = minWidth;
          deltaX = startRightWidth - minWidth;
          leftWidth = startLeftWidth + deltaX;
        }
        $leftCol.attr('width', (leftWidth / tableWidth * 100) + '%');
        $rightCol.attr('width', (rightWidth / tableWidth * 100) + '%');
        return $handle.css('left', startHandleLeft + deltaX);
      });
      $(document).one('mouseup.simditor-resize-table', function(e) {
        $(document).off('.simditor-resize-table');
        return $wrapper.removeClass('resizing');
      });
      $wrapper.addClass('resizing');
      return false;
    });
  };

  TableButton.prototype._initShortcuts = function() {
    this.editor.inputManager.addShortcut('ctrl+alt+up', (function(_this) {
      return function(e) {
        _this.editMenu.find('.menu-item[data-param=insertRowAbove]').click();
        return false;
      };
    })(this));
    this.editor.inputManager.addShortcut('ctrl+alt+down', (function(_this) {
      return function(e) {
        _this.editMenu.find('.menu-item[data-param=insertRowBelow]').click();
        return false;
      };
    })(this));
    this.editor.inputManager.addShortcut('ctrl+alt+left', (function(_this) {
      return function(e) {
        _this.editMenu.find('.menu-item[data-param=insertColLeft]').click();
        return false;
      };
    })(this));
    return this.editor.inputManager.addShortcut('ctrl+alt+right', (function(_this) {
      return function(e) {
        _this.editMenu.find('.menu-item[data-param=insertColRight]').click();
        return false;
      };
    })(this));
  };

  TableButton.prototype.decorate = function($table) {
    if ($table.parent('.simditor-table').length > 0) {
      this.undecorate($table);
    }
    $table.wrap('<div class="simditor-table"></div>');
    this.initResize($table);
    return $table.parent();
  };

  TableButton.prototype.undecorate = function($table) {
    if (!($table.parent('.simditor-table').length > 0)) {
      return;
    }
    return $table.parent().replaceWith($table);
  };

  TableButton.prototype.renderMenu = function() {
    var $table;
    $("<div class=\"menu-create-table\">\n</div>\n<div class=\"menu-edit-table\">\n  <ul>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"deleteRow\">\n        <span>" + (this._t('deleteRow')) + "</span>\n      </a>\n    </li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"insertRowAbove\">\n        <span>" + (this._t('insertRowAbove')) + " ( Ctrl + Alt + ↑ )</span>\n      </a>\n    </li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"insertRowBelow\">\n        <span>" + (this._t('insertRowBelow')) + " ( Ctrl + Alt + ↓ )</span>\n      </a>\n    </li>\n    <li><span class=\"separator\"></span></li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"deleteCol\">\n        <span>" + (this._t('deleteColumn')) + "</span>\n      </a>\n    </li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"insertColLeft\">\n        <span>" + (this._t('insertColumnLeft')) + " ( Ctrl + Alt + ← )</span>\n      </a>\n    </li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"insertColRight\">\n        <span>" + (this._t('insertColumnRight')) + " ( Ctrl + Alt + → )</span>\n      </a>\n    </li>\n    <li><span class=\"separator\"></span></li>\n    <li>\n      <a tabindex=\"-1\" unselectable=\"on\" class=\"menu-item\"\n        href=\"javascript:;\" data-param=\"deleteTable\">\n        <span>" + (this._t('deleteTable')) + "</span>\n      </a>\n    </li>\n  </ul>\n</div>").appendTo(this.menuWrapper);
    this.createMenu = this.menuWrapper.find('.menu-create-table');
    this.editMenu = this.menuWrapper.find('.menu-edit-table');
    $table = this.createTable(6, 6).appendTo(this.createMenu);
    this.createMenu.on('mouseenter', 'td, th', (function(_this) {
      return function(e) {
        var $td, $tr, $trs, num;
        _this.createMenu.find('td, th').removeClass('selected');
        $td = $(e.currentTarget);
        $tr = $td.parent();
        num = $tr.find('td, th').index($td) + 1;
        $trs = $tr.prevAll('tr').addBack();
        if ($tr.parent().is('tbody')) {
          $trs = $trs.add($table.find('thead tr'));
        }
        return $trs.find("td:lt(" + num + "), th:lt(" + num + ")").addClass('selected');
      };
    })(this));
    this.createMenu.on('mouseleave', function(e) {
      return $(e.currentTarget).find('td, th').removeClass('selected');
    });
    return this.createMenu.on('mousedown', 'td, th', (function(_this) {
      return function(e) {
        var $closestBlock, $td, $tr, colNum, rowNum;
        _this.wrapper.removeClass('menu-on');
        if (!_this.editor.inputManager.focused) {
          return;
        }
        $td = $(e.currentTarget);
        $tr = $td.parent();
        colNum = $tr.find('td').index($td) + 1;
        rowNum = $tr.prevAll('tr').length + 1;
        if ($tr.parent().is('tbody')) {
          rowNum += 1;
        }
        $table = _this.createTable(rowNum, colNum, true);
        $closestBlock = _this.editor.selection.blockNodes().last();
        if (_this.editor.util.isEmptyNode($closestBlock)) {
          $closestBlock.replaceWith($table);
        } else {
          $closestBlock.after($table);
        }
        _this.decorate($table);
        _this.editor.selection.setRangeAtStartOf($table.find('th:first'));
        _this.editor.trigger('valuechanged');
        return false;
      };
    })(this));
  };

  TableButton.prototype.createTable = function(row, col, phBr) {
    var $table, $tbody, $td, $thead, $tr, c, k, l, r, ref, ref1;
    $table = $('<table/>');
    $thead = $('<thead/>').appendTo($table);
    $tbody = $('<tbody/>').appendTo($table);
    for (r = k = 0, ref = row; 0 <= ref ? k < ref : k > ref; r = 0 <= ref ? ++k : --k) {
      $tr = $('<tr/>');
      $tr.appendTo(r === 0 ? $thead : $tbody);
      for (c = l = 0, ref1 = col; 0 <= ref1 ? l < ref1 : l > ref1; c = 0 <= ref1 ? ++l : --l) {
        $td = $(r === 0 ? '<th/>' : '<td/>').appendTo($tr);
        if (phBr) {
          $td.append(this.editor.util.phBr);
        }
      }
    }
    return $table;
  };

  TableButton.prototype.refreshTableWidth = function($table) {
    var cols, tableWidth;
    tableWidth = $table.width();
    cols = $table.find('col');
    return $table.find('thead tr th').each(function(i, td) {
      var $col;
      $col = cols.eq(i);
      return $col.attr('width', ($(td).outerWidth() / tableWidth * 100) + '%');
    });
  };

  TableButton.prototype.setActive = function(active) {
    TableButton.__super__.setActive.call(this, active);
    if (active) {
      this.createMenu.hide();
      return this.editMenu.show();
    } else {
      this.createMenu.show();
      return this.editMenu.hide();
    }
  };

  TableButton.prototype._changeCellTag = function($tr, tagName) {
    return $tr.find('td, th').each(function(i, cell) {
      var $cell;
      $cell = $(cell);
      return $cell.replaceWith("<" + tagName + ">" + ($cell.html()) + "</" + tagName + ">");
    });
  };

  TableButton.prototype.deleteRow = function($td) {
    var $newTr, $tr, index;
    $tr = $td.parent('tr');
    if ($tr.closest('table').find('tr').length < 1) {
      return this.deleteTable($td);
    } else {
      $newTr = this._nextRow($tr);
      if (!($newTr.length > 0)) {
        $newTr = this._prevRow($tr);
      }
      index = $tr.find('td, th').index($td);
      if ($tr.parent().is('thead')) {
        $newTr.appendTo($tr.parent());
        this._changeCellTag($newTr, 'th');
      }
      $tr.remove();
      return this.editor.selection.setRangeAtEndOf($newTr.find('td, th').eq(index));
    }
  };

  TableButton.prototype.insertRow = function($td, direction) {
    var $newTr, $table, $tr, cellTag, colNum, i, index, k, ref;
    if (direction == null) {
      direction = 'after';
    }
    $tr = $td.parent('tr');
    $table = $tr.closest('table');
    colNum = 0;
    $table.find('tr').each(function(i, tr) {
      return colNum = Math.max(colNum, $(tr).find('td').length);
    });
    index = $tr.find('td, th').index($td);
    $newTr = $('<tr/>');
    cellTag = 'td';
    if (direction === 'after' && $tr.parent().is('thead')) {
      $tr.parent().next('tbody').prepend($newTr);
    } else if (direction === 'before' && $tr.parent().is('thead')) {
      $tr.before($newTr);
      $tr.parent().next('tbody').prepend($tr);
      this._changeCellTag($tr, 'td');
      cellTag = 'th';
    } else {
      $tr[direction]($newTr);
    }
    for (i = k = 1, ref = colNum; 1 <= ref ? k <= ref : k >= ref; i = 1 <= ref ? ++k : --k) {
      $("<" + cellTag + "/>").append(this.editor.util.phBr).appendTo($newTr);
    }
    return this.editor.selection.setRangeAtStartOf($newTr.find('td, th').eq(index));
  };

  TableButton.prototype.deleteCol = function($td) {
    var $newTd, $table, $tr, index, noOtherCol, noOtherRow;
    $tr = $td.parent('tr');
    noOtherRow = $tr.closest('table').find('tr').length < 2;
    noOtherCol = $td.siblings('td, th').length < 1;
    if (noOtherRow && noOtherCol) {
      return this.deleteTable($td);
    } else {
      index = $tr.find('td, th').index($td);
      $newTd = $td.next('td, th');
      if (!($newTd.length > 0)) {
        $newTd = $tr.prev('td, th');
      }
      $table = $tr.closest('table');
      $table.find('col').eq(index).remove();
      $table.find('tr').each(function(i, tr) {
        return $(tr).find('td, th').eq(index).remove();
      });
      this.refreshTableWidth($table);
      return this.editor.selection.setRangeAtEndOf($newTd);
    }
  };

  TableButton.prototype.insertCol = function($td, direction) {
    var $col, $newCol, $newTd, $table, $tr, index, tableWidth, width;
    if (direction == null) {
      direction = 'after';
    }
    $tr = $td.parent('tr');
    index = $tr.find('td, th').index($td);
    $table = $td.closest('table');
    $col = $table.find('col').eq(index);
    $table.find('tr').each((function(_this) {
      return function(i, tr) {
        var $newTd, cellTag;
        cellTag = $(tr).parent().is('thead') ? 'th' : 'td';
        $newTd = $("<" + cellTag + "/>").append(_this.editor.util.phBr);
        return $(tr).find('td, th').eq(index)[direction]($newTd);
      };
    })(this));
    $newCol = $('<col/>');
    $col[direction]($newCol);
    tableWidth = $table.width();
    width = Math.max(parseFloat($col.attr('width')) / 2, 50 / tableWidth * 100);
    $col.attr('width', width + '%');
    $newCol.attr('width', width + '%');
    this.refreshTableWidth($table);
    $newTd = direction === 'after' ? $td.next('td, th') : $td.prev('td, th');
    return this.editor.selection.setRangeAtStartOf($newTd);
  };

  TableButton.prototype.deleteTable = function($td) {
    var $block, $table;
    $table = $td.closest('.simditor-table');
    $block = $table.next('p');
    $table.remove();
    if ($block.length > 0) {
      return this.editor.selection.setRangeAtStartOf($block);
    }
  };

  TableButton.prototype.command = function(param) {
    var $td;
    $td = this.editor.selection.containerNode().closest('td, th');
    if (!($td.length > 0)) {
      return;
    }
    if (param === 'deleteRow') {
      this.deleteRow($td);
    } else if (param === 'insertRowAbove') {
      this.insertRow($td, 'before');
    } else if (param === 'insertRowBelow') {
      this.insertRow($td);
    } else if (param === 'deleteCol') {
      this.deleteCol($td);
    } else if (param === 'insertColLeft') {
      this.insertCol($td, 'before');
    } else if (param === 'insertColRight') {
      this.insertCol($td);
    } else if (param === 'deleteTable') {
      this.deleteTable($td);
    } else {
      return;
    }
    return this.editor.trigger('valuechanged');
  };

  return TableButton;

})(Button);

Simditor.Toolbar.addButton(TableButton);

StrikethroughButton = (function(superClass) {
  extend(StrikethroughButton, superClass);

  function StrikethroughButton() {
    return StrikethroughButton.__super__.constructor.apply(this, arguments);
  }

  StrikethroughButton.prototype.name = 'strikethrough';

  StrikethroughButton.prototype.icon = 'strikethrough';

  StrikethroughButton.prototype.htmlTag = 'strike';

  StrikethroughButton.prototype.disableTag = 'pre';

  StrikethroughButton.prototype._activeStatus = function() {
    var active;
    active = document.queryCommandState('strikethrough') === true;
    this.setActive(active);
    return this.active;
  };

  StrikethroughButton.prototype.command = function() {
    document.execCommand('strikethrough');
    if (!this.editor.util.support.oninput) {
      this.editor.trigger('valuechanged');
    }
    return $(document).trigger('selectionchange');
  };

  return StrikethroughButton;

})(Button);

Simditor.Toolbar.addButton(StrikethroughButton);

AlignmentButton = (function(superClass) {
  extend(AlignmentButton, superClass);

  function AlignmentButton() {
    return AlignmentButton.__super__.constructor.apply(this, arguments);
  }

  AlignmentButton.prototype.name = "alignment";

  AlignmentButton.prototype.icon = 'align-left';

  AlignmentButton.prototype.htmlTag = 'p, h1, h2, h3, h4, td, th';

  AlignmentButton.prototype._init = function() {
    this.menu = [
      {
        name: 'left',
        text: this._t('alignLeft'),
        icon: 'align-left',
        param: 'left'
      }, {
        name: 'center',
        text: this._t('alignCenter'),
        icon: 'align-center',
        param: 'center'
      }, {
        name: 'right',
        text: this._t('alignRight'),
        icon: 'align-right',
        param: 'right'
      }
    ];
    return AlignmentButton.__super__._init.call(this);
  };

  AlignmentButton.prototype.setActive = function(active, align) {
    if (align == null) {
      align = 'left';
    }
    if (align !== 'left' && align !== 'center' && align !== 'right') {
      align = 'left';
    }
    if (align === 'left') {
      AlignmentButton.__super__.setActive.call(this, false);
    } else {
      AlignmentButton.__super__.setActive.call(this, active);
    }
    this.el.removeClass('align-left align-center align-right');
    if (active) {
      this.el.addClass('align-' + align);
    }
    this.setIcon('align-' + align);
    return this.menuEl.find('.menu-item').show().end().find('.menu-item-' + align).hide();
  };

  AlignmentButton.prototype._status = function() {
    this.nodes = this.editor.selection.nodes().filter(this.htmlTag);
    if (this.nodes.length < 1) {
      this.setDisabled(true);
      return this.setActive(false);
    } else {
      this.setDisabled(false);
      return this.setActive(true, this.nodes.first().css('text-align'));
    }
  };

  AlignmentButton.prototype.command = function(align) {
    if (align !== 'left' && align !== 'center' && align !== 'right') {
      throw new Error("simditor alignment button: invalid align " + align);
    }
    this.nodes.css({
      'text-align': align === 'left' ? '' : align
    });
    return this.editor.trigger('valuechanged');
  };

  return AlignmentButton;

})(Button);

Simditor.Toolbar.addButton(AlignmentButton);

return Simditor;

}));

},{}],5:[function(require,module,exports){
(function (root, factory) {

  root.simple = root.simple || {};
  root.simple['hotkeys'] = factory(jQuery,SimpleModule);
  
}(window, function ($, SimpleModule) {

var Hotkeys, hotkeys,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Hotkeys = (function(superClass) {
  extend(Hotkeys, superClass);

  function Hotkeys() {
    return Hotkeys.__super__.constructor.apply(this, arguments);
  }

  Hotkeys.count = 0;

  Hotkeys.keyNameMap = {
    8: "Backspace",
    9: "Tab",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Esc",
    32: "Spacebar",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "Left",
    38: "Up",
    39: "Right",
    40: "Down",
    45: "Insert",
    46: "Del",
    91: "Meta",
    93: "Meta",
    48: "0",
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    65: "A",
    66: "B",
    67: "C",
    68: "D",
    69: "E",
    70: "F",
    71: "G",
    72: "H",
    73: "I",
    74: "J",
    75: "K",
    76: "L",
    77: "M",
    78: "N",
    79: "O",
    80: "P",
    81: "Q",
    82: "R",
    83: "S",
    84: "T",
    85: "U",
    86: "V",
    87: "W",
    88: "X",
    89: "Y",
    90: "Z",
    96: "0",
    97: "1",
    98: "2",
    99: "3",
    100: "4",
    101: "5",
    102: "6",
    103: "7",
    104: "8",
    105: "9",
    106: "Multiply",
    107: "Add",
    109: "Subtract",
    110: "Decimal",
    111: "Divide",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    124: "F13",
    125: "F14",
    126: "F15",
    127: "F16",
    128: "F17",
    129: "F18",
    130: "F19",
    131: "F20",
    132: "F21",
    133: "F22",
    134: "F23",
    135: "F24",
    59: ";",
    61: "=",
    186: ";",
    187: "=",
    188: ",",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'"
  };

  Hotkeys.aliases = {
    "escape": "esc",
    "delete": "del",
    "return": "enter",
    "ctrl": "control",
    "space": "spacebar",
    "ins": "insert",
    "cmd": "meta",
    "command": "meta",
    "wins": "meta",
    "windows": "meta"
  };

  Hotkeys.normalize = function(shortcut) {
    var i, j, key, keyname, keys, len;
    keys = shortcut.toLowerCase().replace(/\s+/gi, "").split("+");
    for (i = j = 0, len = keys.length; j < len; i = ++j) {
      key = keys[i];
      keys[i] = this.aliases[key] || key;
    }
    keyname = keys.pop();
    keys.sort().push(keyname);
    return keys.join("_");
  };

  Hotkeys.prototype.opts = {
    el: document
  };

  Hotkeys.prototype._init = function() {
    this.id = ++this.constructor.count;
    this._map = {};
    this._delegate = typeof this.opts.el === "string" ? document : this.opts.el;
    return $(this._delegate).on("keydown.simple-hotkeys-" + this.id, this.opts.el, (function(_this) {
      return function(e) {
        var ref;
        return (ref = _this._getHander(e)) != null ? ref.call(_this, e) : void 0;
      };
    })(this));
  };

  Hotkeys.prototype._getHander = function(e) {
    var keyname, shortcut;
    if (!(keyname = this.constructor.keyNameMap[e.which])) {
      return;
    }
    shortcut = "";
    if (e.altKey) {
      shortcut += "alt_";
    }
    if (e.ctrlKey) {
      shortcut += "control_";
    }
    if (e.metaKey) {
      shortcut += "meta_";
    }
    if (e.shiftKey) {
      shortcut += "shift_";
    }
    shortcut += keyname.toLowerCase();
    return this._map[shortcut];
  };

  Hotkeys.prototype.respondTo = function(subject) {
    if (typeof subject === 'string') {
      return this._map[this.constructor.normalize(subject)] != null;
    } else {
      return this._getHander(subject) != null;
    }
  };

  Hotkeys.prototype.add = function(shortcut, handler) {
    this._map[this.constructor.normalize(shortcut)] = handler;
    return this;
  };

  Hotkeys.prototype.remove = function(shortcut) {
    delete this._map[this.constructor.normalize(shortcut)];
    return this;
  };

  Hotkeys.prototype.destroy = function() {
    $(this._delegate).off(".simple-hotkeys-" + this.id);
    this._map = {};
    return this;
  };

  return Hotkeys;

})(SimpleModule);

hotkeys = function(opts) {
  return new Hotkeys(opts);
};

return hotkeys;

}));


},{}],6:[function(require,module,exports){
(function (root, factory) {

  root['SimpleModule'] = factory(jQuery);

}(window, function ($) {

var Module,
  slice = [].slice;

Module = (function() {
  Module.extend = function(obj) {
    var key, ref, val;
    if (!((obj != null) && typeof obj === 'object')) {
      return;
    }
    for (key in obj) {
      val = obj[key];
      if (key !== 'included' && key !== 'extended') {
        this[key] = val;
      }
    }
    return (ref = obj.extended) != null ? ref.call(this) : void 0;
  };

  Module.include = function(obj) {
    var key, ref, val;
    if (!((obj != null) && typeof obj === 'object')) {
      return;
    }
    for (key in obj) {
      val = obj[key];
      if (key !== 'included' && key !== 'extended') {
        this.prototype[key] = val;
      }
    }
    return (ref = obj.included) != null ? ref.call(this) : void 0;
  };

  Module.connect = function(cls) {
    if (typeof cls !== 'function') {
      return;
    }
    if (!cls.pluginName) {
      throw new Error('Module.connect: cannot connect plugin without pluginName');
      return;
    }
    cls.prototype._connected = true;
    if (!this._connectedClasses) {
      this._connectedClasses = [];
    }
    this._connectedClasses.push(cls);
    if (cls.pluginName) {
      return this[cls.pluginName] = cls;
    }
  };

  Module.prototype.opts = {};

  function Module(opts) {
    var base, cls, i, instance, instances, len, name;
    this.opts = $.extend({}, this.opts, opts);
    (base = this.constructor)._connectedClasses || (base._connectedClasses = []);
    instances = (function() {
      var i, len, ref, results;
      ref = this.constructor._connectedClasses;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        cls = ref[i];
        name = cls.pluginName.charAt(0).toLowerCase() + cls.pluginName.slice(1);
        if (cls.prototype._connected) {
          cls.prototype._module = this;
        }
        results.push(this[name] = new cls());
      }
      return results;
    }).call(this);
    if (this._connected) {
      this.opts = $.extend({}, this.opts, this._module.opts);
    } else {
      this._init();
      for (i = 0, len = instances.length; i < len; i++) {
        instance = instances[i];
        if (typeof instance._init === "function") {
          instance._init();
        }
      }
    }
    this.trigger('initialized');
  }

  Module.prototype._init = function() {};

  Module.prototype.on = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    (ref = $(this)).on.apply(ref, args);
    return this;
  };

  Module.prototype.one = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    (ref = $(this)).one.apply(ref, args);
    return this;
  };

  Module.prototype.off = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    (ref = $(this)).off.apply(ref, args);
    return this;
  };

  Module.prototype.trigger = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    (ref = $(this)).trigger.apply(ref, args);
    return this;
  };

  Module.prototype.triggerHandler = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return (ref = $(this)).triggerHandler.apply(ref, args);
  };

  Module.prototype._t = function() {
    var args, ref;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return (ref = this.constructor)._t.apply(ref, args);
  };

  Module._t = function() {
    var args, key, ref, result;
    key = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    result = ((ref = this.i18n[this.locale]) != null ? ref[key] : void 0) || '';
    if (!(args.length > 0)) {
      return result;
    }
    result = result.replace(/([^%]|^)%(?:(\d+)\$)?s/g, function(p0, p, position) {
      if (position) {
        return p + args[parseInt(position) - 1];
      } else {
        return p + args.shift();
      }
    });
    return result.replace(/%%s/g, '%s');
  };

  Module.i18n = {
    'zh-CN': {}
  };

  Module.locale = 'zh-CN';

  return Module;

})();

return Module;

}));

},{}],7:[function(require,module,exports){
(function (root, factory) {

  root.simple = root.simple || {};
  root.simple['uploader'] = factory(jQuery,SimpleModule);

}(window, function ($, SimpleModule) {

var Uploader, uploader,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Uploader = (function(superClass) {
  extend(Uploader, superClass);

  function Uploader() {
    return Uploader.__super__.constructor.apply(this, arguments);
  }

  Uploader.count = 0;

  Uploader.prototype.opts = {
    url: '',
    params: null,
    fileKey: 'upload_file',
    connectionCount: 3
  };

  Uploader.prototype._init = function() {
    this.files = [];
    this.queue = [];
    this.id = ++Uploader.count;
    this.on('uploadcomplete', (function(_this) {
      return function(e, file) {
        _this.files.splice($.inArray(file, _this.files), 1);
        if (_this.queue.length > 0 && _this.files.length < _this.opts.connectionCount) {
          return _this.upload(_this.queue.shift());
        } else {
          return _this.uploading = false;
        }
      };
    })(this));
    return $(window).on('beforeunload.uploader-' + this.id, (function(_this) {
      return function(e) {
        if (!_this.uploading) {
          return;
        }
        e.originalEvent.returnValue = _this._t('leaveConfirm');
        return _this._t('leaveConfirm');
      };
    })(this));
  };

  Uploader.prototype.generateId = (function() {
    var id;
    id = 0;
    return function() {
      return id += 1;
    };
  })();

  Uploader.prototype.upload = function(file, opts) {
    var f, i, key, len;
    if (opts == null) {
      opts = {};
    }
    if (file == null) {
      return;
    }
    if ($.isArray(file) || file instanceof FileList) {
      for (i = 0, len = file.length; i < len; i++) {
        f = file[i];
        this.upload(f, opts);
      }
    } else if ($(file).is('input:file')) {
      key = $(file).attr('name');
      if (key) {
        opts.fileKey = key;
      }
      this.upload($.makeArray($(file)[0].files), opts);
    } else if (!file.id || !file.obj) {
      file = this.getFile(file);
    }
    if (!(file && file.obj)) {
      return;
    }
    $.extend(file, opts);
    if (this.files.length >= this.opts.connectionCount) {
      this.queue.push(file);
      return;
    }
    if (this.triggerHandler('beforeupload', [file]) === false) {
      return;
    }
    this.files.push(file);
    this._xhrUpload(file);
    return this.uploading = true;
  };

  Uploader.prototype.getFile = function(fileObj) {
    var name, ref, ref1;
    if (fileObj instanceof window.File || fileObj instanceof window.Blob) {
      name = (ref = fileObj.fileName) != null ? ref : fileObj.name;
    } else {
      return null;
    }
    return {
      id: this.generateId(),
      url: this.opts.url,
      params: this.opts.params,
      fileKey: this.opts.fileKey,
      name: name,
      size: (ref1 = fileObj.fileSize) != null ? ref1 : fileObj.size,
      ext: name ? name.split('.').pop().toLowerCase() : '',
      obj: fileObj
    };
  };

  Uploader.prototype._xhrUpload = function(file) {
    var formData, k, ref, v;
    formData = new FormData();
    formData.append(file.fileKey, file.obj);
    formData.append("original_filename", file.name);
    if (file.params) {
      ref = file.params;
      for (k in ref) {
        v = ref[k];
        formData.append(k, v);
      }
    }
    return file.xhr = $.ajax({
      url: file.url,
      data: formData,
      processData: false,
      contentType: false,
      type: 'POST',
      headers: {
        'X-File-Name': encodeURIComponent(file.name)
      },
      xhr: function() {
        var req;
        req = $.ajaxSettings.xhr();
        if (req) {
          req.upload.onprogress = (function(_this) {
            return function(e) {
              return _this.progress(e);
            };
          })(this);
        }
        return req;
      },
      progress: (function(_this) {
        return function(e) {
          if (!e.lengthComputable) {
            return;
          }
          return _this.trigger('uploadprogress', [file, e.loaded, e.total]);
        };
      })(this),
      error: (function(_this) {
        return function(xhr, status, err) {
          return _this.trigger('uploaderror', [file, xhr, status]);
        };
      })(this),
      success: (function(_this) {
        return function(result) {
          _this.trigger('uploadprogress', [file, file.size, file.size]);
          _this.trigger('uploadsuccess', [file, result]);
          return $(document).trigger('uploadsuccess', [file, result, _this]);
        };
      })(this),
      complete: (function(_this) {
        return function(xhr, status) {
          return _this.trigger('uploadcomplete', [file, xhr.responseText]);
        };
      })(this)
    });
  };

  Uploader.prototype.cancel = function(file) {
    var f, i, len, ref;
    if (!file.id) {
      ref = this.files;
      for (i = 0, len = ref.length; i < len; i++) {
        f = ref[i];
        if (f.id === file * 1) {
          file = f;
          break;
        }
      }
    }
    this.trigger('uploadcancel', [file]);
    if (file.xhr) {
      file.xhr.abort();
    }
    return file.xhr = null;
  };

  Uploader.prototype.readImageFile = function(fileObj, callback) {
    var fileReader, img;
    if (!$.isFunction(callback)) {
      return;
    }
    img = new Image();
    img.onload = function() {
      return callback(img);
    };
    img.onerror = function() {
      return callback();
    };
    if (window.FileReader && FileReader.prototype.readAsDataURL && /^image/.test(fileObj.type)) {
      fileReader = new FileReader();
      fileReader.onload = function(e) {
        return img.src = e.target.result;
      };
      return fileReader.readAsDataURL(fileObj);
    } else {
      return callback();
    }
  };

  Uploader.prototype.destroy = function() {
    var file, i, len, ref;
    this.queue.length = 0;
    ref = this.files;
    for (i = 0, len = ref.length; i < len; i++) {
      file = ref[i];
      this.cancel(file);
    }
    $(window).off('.uploader-' + this.id);
    return $(document).off('.uploader-' + this.id);
  };

  Uploader.i18n = {
    'zh-CN': {
      leaveConfirm: '正在上传文件，如果离开上传会自动取消'
    }
  };

  Uploader.locale = 'zh-CN';

  return Uploader;

})(SimpleModule);

uploader = function(opts) {
  return new Uploader(opts);
};

return uploader;

}));

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9rYXJhdC9jcmVhdGVfYXJ0aWNsZS5qcyIsInN0YXRpYy9saWIvc2ltZGl0b3ItYXV0b3NhdmUvbGliL3NpbWRpdG9yLWF1dG9zYXZlLmpzIiwic3RhdGljL2xpYi9zaW1kaXRvci1lbW9qaS9saWIvc2ltZGl0b3ItZW1vamkuanMiLCJzdGF0aWMvbGliL3NpbWRpdG9yL2xpYi9zaW1kaXRvci5qcyIsInN0YXRpYy9saWIvc2ltcGxlLWhvdGtleXMvbGliL2hvdGtleXMuanMiLCJzdGF0aWMvbGliL3NpbXBsZS1tb2R1bGUvbGliL21vZHVsZS5qcyIsInN0YXRpYy9saWIvc2ltcGxlLXVwbG9hZGVyL2xpYi91cGxvYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzltS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBGT1IgS0FSQVQgQ1JFQVRFIEFSVElDTEVcbiAqL1xuXG4vLyBpbXBvcnQgJ2pxdWVyeS9kaXN0L2pxdWVyeSdcblxuLy9GT1IgU01ESVRPUlxuJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCdzaW1wbGUtbW9kdWxlL2xpYi9tb2R1bGUnKTtcblxucmVxdWlyZSgnc2ltcGxlLWhvdGtleXMvbGliL2hvdGtleXMnKTtcblxucmVxdWlyZSgnc2ltcGxlLXVwbG9hZGVyL2xpYi91cGxvYWRlcicpO1xuXG5yZXF1aXJlKCdzaW1kaXRvci9saWIvc2ltZGl0b3InKTtcblxucmVxdWlyZSgnc2ltZGl0b3ItYXV0b3NhdmUvbGliL3NpbWRpdG9yLWF1dG9zYXZlJyk7XG5cbnJlcXVpcmUoJ3NpbWRpdG9yLWVtb2ppL2xpYi9zaW1kaXRvci1lbW9qaScpO1xuXG4vL2NoZWNrIHN0YWdpbmdcbnZhciBfc3RhZ2luZ19ob3N0ID0gZmFsc2U7XG5pZiAobG9jYXRpb24uaHJlZi5zZWFyY2goJ3N0YWdpbmcnKSAhPSAtMSkge1xuICAgIF9zdGFnaW5nX2hvc3QgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBfcmVmNChlcnIpIHtcbiAgICBjb25zb2xlLmxvZyhlcnIpO1xufVxuXG5mdW5jdGlvbiBfcmVmKGV2dCkge1xuICAgIHZhciAkdCA9ICQodGhpcyk7XG4gICAgdmFyIHRhZ05hbWUgPSAkdC5kYXRhKCd0YWcnKTtcblxuICAgICQuYWpheCh7XG4gICAgICAgICd1cmwnOiAnL3RhZy9kZWxldGUvJyArIHRhZ05hbWUsXG4gICAgICAgICd0eXBlJzogJ1BPU1QnLFxuICAgICAgICAnZGF0YVR5cGUnOiAnanNvbidcbiAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uIChycykge1xuICAgICAgICBjb25zb2xlLmxvZyhycyk7XG4gICAgICAgICR0LnBhcmVudHMoJ3NwYW4nKS5yZW1vdmUoKTtcbiAgICB9KS5mYWlsKF9yZWY0KTtcbn1cblxuZnVuY3Rpb24gX3JlZjIoZXZ0KSB7XG4gICAgdmFyICRidG4gPSAkKHRoaXMpO1xuICAgIHZhciAkbnQgPSAkKCcjdGFnX2xpc3QgLm5ld190YWcnKTtcbiAgICB2YXIgdGFnTmFtZSA9ICRudC52YWwoKTtcblxuICAgIHZhciAkZVRhZyA9ICQoJzxzcGFuPlxcXG4gICAgICAgICAgICA8aW5wdXQgdmFsdWU9XCInICsgdGFnTmFtZSArICdcIiB0eXBlPVwiY2hlY2tib3hcIiAvPlxcXG4gICAgICAgICAgICA8bGFiZWw+JyArIHRhZ05hbWUgKyAnPC9sYWJlbD5cXFxuICAgICAgICAgICAgPGJ1dHRvbiBkYXRhLXRhZz1cIicgKyB0YWdOYW1lICsgJ1wiIGNsYXNzPVwiZGVsX3RhZ1wiPlg8L2J1dHRvbj5cXFxuICAgICAgICA8L3NwYW4+Jyk7XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICAndXJsJzogJy90YWcvYWRkLycgKyB0YWdOYW1lLFxuICAgICAgICAndHlwZSc6ICdQT1NUJyxcbiAgICAgICAgJ2RhdGFUeXBlJzogJ2pzb24nXG4gICAgfSkuc3VjY2VzcyhmdW5jdGlvbiAocnMpIHtcbiAgICAgICAgY29uc29sZS5sb2cocnMpO1xuXG4gICAgICAgICRidG4ucGFyZW50KCdzcGFuJykuYmVmb3JlKCRlVGFnKTtcbiAgICAgICAgLy8gYWxlcnQoYGFkZCB0YWcgc3VjY2VlZDogJHt0YWdOYW1lfWApXG4gICAgICAgICRudC52YWwoJycpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKGVycikge1xuICAgICAgICBhbGVydCgnQWRkIHRhZyBmYWlsZWQ6ICcgKyB0YWdOYW1lKTtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gX3JlZjMoZXJyKSB7XG4gICAgY29uc29sZS5sb2coZXJyKTtcbn1cblxuJChmdW5jdGlvbiAoKSB7XG5cbiAgICAvL2luaXQgZWRpdG9yXG4gICAgdmFyIGVkaXRvciA9IG5ldyBTaW1kaXRvcih7XG4gICAgICAgIHRleHRhcmVhOiAkKCcjYXJ0aWNsZV9lZGl0b3InKSxcbiAgICAgICAgZGVmYXVsdEltYWdlOiAnL3N0YXRpYy9pbWcvbG9nby9sb2dvLnBuZycsXG4gICAgICAgIHBhc3RlSW1hZ2U6IHRydWUsXG4gICAgICAgIGF1dG9zYXZlOiAnZWRpdG9yLWNvbnRlbnQnLFxuICAgICAgICBlbW9qaToge1xuICAgICAgICAgICAgaW1hZ2VQYXRoOiAnL3N0YXRpYy9saWIvc2ltZGl0b3ItZW1vamkvaW1hZ2VzL2Vtb2ppLydcbiAgICAgICAgfSxcbiAgICAgICAgdG9vbGJhcjogWydlbW9qaScsICdib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnc3RyaWtldGhyb3VnaCcsICd8JywgJ29sJywgJ3VsJywgJ2Jsb2NrcXVvdGUnLCAnY29kZScsICd8JywgJ2xpbmsnLCAnaW1hZ2UnLCAnfCcsICdpbmRlbnQnLCAnb3V0ZGVudCddLFxuICAgICAgICB1cGxvYWQ6IHtcbiAgICAgICAgICAgIHVybDogJy9rYXJhdC91cGxvYWQnLFxuICAgICAgICAgICAgcGFyYW1zOiBudWxsLFxuICAgICAgICAgICAgZmlsZUtleTogJ2FydGljbGVfaW1nJyxcbiAgICAgICAgICAgIGNvbm5lY3Rpb25Db3VudDogNSxcbiAgICAgICAgICAgIGxlYXZlQ29uZmlybTogJ1VwbG9hZGluZyBpcyBpbiBwcm9ncmVzcywgYXJlIHlvdSBzdXJlIHRvIGxlYXZlIHRoaXMgcGFnZT8nXG4gICAgICAgIH1cbiAgICAgICAgLy9vcHRpb25hbCBvcHRpb25zXG4gICAgfSk7XG5cbiAgICAvL2RlbGV0ZSB0YWdcbiAgICAkKFwiI3RhZ19saXN0XCIpLm9uKCdjbGljaycsICcuZGVsX3RhZycsIF9yZWYpLm9uKCdjbGljaycsICcuYWRkX3RhZ19idG4nLCBfcmVmMik7XG5cbiAgICAvL3N1Ym1pdCBwb3N0XG4gICAgJCgnLmJ0bl9wb3N0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICB2YXIgJGJ0biA9ICQodGhpcyk7XG4gICAgICAgIGlmICgkYnRuLmhhc0NsYXNzKCdkaXNhYmxlZCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkYnRuLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyICRhdHRyID0gJCgndWwuYXJ0aWNsZS1hdHRyJyk7XG5cbiAgICAgICAgdmFyIGFpZCA9ICRhdHRyLmZpbmQoJ2lucHV0W25hbWU9XCJhcnRpY2xlX2lkXCJdJykudmFsKCk7XG4gICAgICAgIHZhciAkY2hlY2tib3hfdGFnID0gJCgnI3RhZ19saXN0IGlucHV0W3R5cGU9Y2hlY2tib3hdJyk7XG4gICAgICAgIHZhciB0YWdfbGlzdCA9IFtdO1xuXG4gICAgICAgICRjaGVja2JveF90YWcuZWFjaChmdW5jdGlvbiAoaSwgYykge1xuICAgICAgICAgICAgdmFyICRjID0gJChjKTtcbiAgICAgICAgICAgICRjLmlzKCc6Y2hlY2tlZCcpID8gdGFnX2xpc3QucHVzaCgkYy52YWwoKSkgOiAnJztcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICgkYXR0ci5maW5kKCdpbnB1dFtuYW1lPVwidGl0bGVcIl0nKS52YWwoKSA9PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIGFsZXJ0KCdUaXRsZSBjYW4gbm90IGJlIGVtcHR5Jyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcG9zdENvbnRlbnQgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgdmFyICRjb250ZW50ID0gJChwb3N0Q29udGVudCk7XG5cbiAgICAgICAgdmFyIGV4Y2VycHQgPSAkY29udGVudC50ZXh0KCkudHJpbSgpLnJlcGxhY2UoL1xcbisvZywgJycpLnN1YnN0cmluZygwLCAyODApO1xuXG4gICAgICAgIHZhciAkZ2FsbGVyeSA9ICRjb250ZW50LmZpbmQoJ2ltZycpO1xuICAgICAgICB2YXIgZ0xpc3QgPSBbXTtcbiAgICAgICAgLy8gYWxlcnQoJ2RkZCcpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFtmb3IgKCRnIG9mICRnYWxsZXJ5KSAkZy5hdHRyKCdzcmMnKV0pO1xuICAgICAgICAkZ2FsbGVyeS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbWdVcmwgPSAkKHRoaXMpLmF0dHIoJ3NyYycpO1xuICAgICAgICAgICAgLy9maWx0ZXIgdGhlIGVtb2ppXG4gICAgICAgICAgICAhaW1nVXJsLm1hdGNoKCdzaW1kaXRvci1lbW9qaS9pbWFnZXMvZW1vamkvJykgPyBnTGlzdC5wdXNoKGltZ1VybCkgOiAncGFzcyc7XG4gICAgICAgIH0pO1xuICAgICAgICBmdW5jdGlvbiByZXNldEZvcm0oKSB7XG4gICAgICAgICAgICAkYXR0ci5maW5kKCdpbnB1dFtuYW1lPVwidGl0bGVcIl0nKS52YWwoJ+aXoOagh+mimCcpO1xuICAgICAgICAgICAgZWRpdG9yLnNldFZhbHVlKCcnKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3ViRGF0YSA9IHtcbiAgICAgICAgICAgICdjb250ZW50JzogcG9zdENvbnRlbnQsXG4gICAgICAgICAgICAnZXhjZXJwdCc6IGV4Y2VycHQsXG4gICAgICAgICAgICAnaW1nJzogZ0xpc3QsIC8vanVzdCBnYWxsZXJ5XG4gICAgICAgICAgICAndGl0bGUnOiAkYXR0ci5maW5kKCdpbnB1dFtuYW1lPVwidGl0bGVcIl0nKS52YWwoKSxcbiAgICAgICAgICAgICdhdXRob3InOiAkYXR0ci5maW5kKCdpbnB1dFtuYW1lPVwiYXV0aG9yXCJdJykudmFsKCksXG4gICAgICAgICAgICAndHlwZSc6ICRhdHRyLmZpbmQoJ3NlbGVjdFtuYW1lPVwidHlwZVwiXScpLnZhbCgpLFxuICAgICAgICAgICAgJ2VuX2dhbGxlcnknOiAkYXR0ci5maW5kKCdpbnB1dFtuYW1lPVwiZW5fZ2FsbGVyeVwiXScpLmlzKCc6Y2hlY2tlZCcpID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgJ2VuYWJsZSc6ICRhdHRyLmZpbmQoJ2lucHV0W25hbWU9XCJlbmFibGVcIl0nKS5pcygnOmNoZWNrZWQnKSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgICd0YWcnOiB0YWdfbGlzdFxuICAgICAgICB9O1xuICAgICAgICAvL+WmguaenOaYr+e8lui+ke+8jOmCo+S5iOWwhmFpZOS8oOWbnuWIsOWQjuWPsFxuICAgICAgICBpZiAoYWlkKSBzdWJEYXRhWydhcnRpY2xlX2lkJ10gPSBhaWQ7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICd1cmwnOiAnL2thcmF0L2FydGljbGVfdXBkYXRlJyxcbiAgICAgICAgICAgICd0eXBlJzogJ1BPU1QnLFxuICAgICAgICAgICAgJ2RhdGFUeXBlJzogJ2pzb24nLFxuICAgICAgICAgICAgJ2RhdGEnOiBzdWJEYXRhXG5cbiAgICAgICAgfSkuc3VjY2VzcyhmdW5jdGlvbiAocnMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJzKTtcbiAgICAgICAgICAgIGlmIChyc1snc3RhdGUnXSA9PSAnc3VjY2VlZCcpIHtcbiAgICAgICAgICAgICAgICBhbGVydCgnU3VibWl0IFN1Y2NlZWQhICcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFhaWQgJiYgIV9zdGFnaW5nX2hvc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/lpoLmnpzmmK/mlrDlu7rmlofnq6DvvIzpgqPkuYjlrozmiJDlkI7ph43nva5cbiAgICAgICAgICAgICAgICAgICAgcmVzZXRGb3JtKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmZhaWwoX3JlZjMpLmNvbXBsZXRlKGZ1bmN0aW9uIChycykge1xuICAgICAgICAgICAgJGJ0bi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTsiLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgXG4gIHJvb3RbJ1NpbWRpdG9yQXV0b3NhdmUnXSA9IGZhY3RvcnkoalF1ZXJ5LFNpbXBsZU1vZHVsZSxTaW1kaXRvcik7XG4gIFxufSh3aW5kb3csIGZ1bmN0aW9uICgkLCBTaW1wbGVNb2R1bGUsIFNpbWRpdG9yKSB7XG5cbnZhciBTaW1kaXRvckF1dG9zYXZlLFxuICBleHRlbmQgPSBmdW5jdGlvbihjaGlsZCwgcGFyZW50KSB7IGZvciAodmFyIGtleSBpbiBwYXJlbnQpIHsgaWYgKGhhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuU2ltZGl0b3JBdXRvc2F2ZSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChTaW1kaXRvckF1dG9zYXZlLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBTaW1kaXRvckF1dG9zYXZlKCkge1xuICAgIHJldHVybiBTaW1kaXRvckF1dG9zYXZlLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgU2ltZGl0b3JBdXRvc2F2ZS5wbHVnaW5OYW1lID0gJ0F1dG9zYXZlJztcblxuICBTaW1kaXRvckF1dG9zYXZlLnByb3RvdHlwZS5vcHRzID0ge1xuICAgIGF1dG9zYXZlOiB0cnVlLFxuICAgIGF1dG9zYXZlUGF0aDogbnVsbFxuICB9O1xuXG4gIFNpbWRpdG9yQXV0b3NhdmUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGN1cnJlbnRWYWwsIGxpbmssIG5hbWUsIHZhbDtcbiAgICB0aGlzLmVkaXRvciA9IHRoaXMuX21vZHVsZTtcbiAgICBpZiAoIXRoaXMub3B0cy5hdXRvc2F2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm5hbWUgPSB0eXBlb2YgdGhpcy5vcHRzLmF1dG9zYXZlID09PSAnc3RyaW5nJyA/IHRoaXMub3B0cy5hdXRvc2F2ZSA6ICdzaW1kaXRvcic7XG4gICAgaWYgKHRoaXMub3B0cy5hdXRvc2F2ZVBhdGgpIHtcbiAgICAgIHRoaXMucGF0aCA9IHRoaXMub3B0cy5hdXRvc2F2ZVBhdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmsgPSAkKFwiPGEvPlwiLCB7XG4gICAgICAgIGhyZWY6IGxvY2F0aW9uLmhyZWZcbiAgICAgIH0pO1xuICAgICAgbmFtZSA9IHRoaXMuZWRpdG9yLnRleHRhcmVhLmRhdGEoJ2F1dG9zYXZlJykgfHwgdGhpcy5uYW1lO1xuICAgICAgdGhpcy5wYXRoID0gXCIvXCIgKyAobGlua1swXS5wYXRobmFtZS5yZXBsYWNlKC9cXC8kL2csIFwiXCIpLnJlcGxhY2UoL15cXC8vZywgXCJcIikpICsgXCIvYXV0b3NhdmUvXCIgKyBuYW1lICsgXCIvXCI7XG4gICAgfVxuICAgIGlmICghdGhpcy5wYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZWRpdG9yLm9uKFwidmFsdWVjaGFuZ2VkXCIsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMuc3RvcmFnZS5zZXQoX3RoaXMucGF0aCwgX3RoaXMuZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy5lZGl0b3IuZWwuY2xvc2VzdCgnZm9ybScpLm9uKCdhamF4OnN1Y2Nlc3Muc2ltZGl0b3ItJyArIHRoaXMuZWRpdG9yLmlkLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5zdG9yYWdlLnJlbW92ZShfdGhpcy5wYXRoKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHZhbCA9IHRoaXMuc3RvcmFnZS5nZXQodGhpcy5wYXRoKTtcbiAgICBpZiAoIXZhbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjdXJyZW50VmFsID0gdGhpcy5lZGl0b3IudGV4dGFyZWEudmFsKCk7XG4gICAgaWYgKHZhbCA9PT0gY3VycmVudFZhbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5lZGl0b3IudGV4dGFyZWEuaXMoJ1tkYXRhLWF1dG9zYXZlLWNvbmZpcm1dJykpIHtcbiAgICAgIGlmIChjb25maXJtKHRoaXMuZWRpdG9yLnRleHRhcmVhLmRhdGEoJ2F1dG9zYXZlLWNvbmZpcm0nKSB8fCAnQXJlIHlvdSBzdXJlIHRvIHJlc3RvcmUgdW5zYXZlZCBjaGFuZ2VzPycpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVkaXRvci5zZXRWYWx1ZSh2YWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmFnZS5yZW1vdmUodGhpcy5wYXRoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLnNldFZhbHVlKHZhbCk7XG4gICAgfVxuICB9O1xuXG4gIFNpbWRpdG9yQXV0b3NhdmUucHJvdG90eXBlLnN0b3JhZ2UgPSB7XG4gICAgc3VwcG9ydGVkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlcnJvcjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdfc3RvcmFnZVN1cHBvcnRlZCcsICd5ZXMnKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ19zdG9yYWdlU3VwcG9ydGVkJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgIGVycm9yID0gX2Vycm9yO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsLCBzZXNzaW9uKSB7XG4gICAgICB2YXIgc3RvcmFnZTtcbiAgICAgIGlmIChzZXNzaW9uID09IG51bGwpIHtcbiAgICAgICAgc2Vzc2lvbiA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLnN1cHBvcnRlZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHN0b3JhZ2UgPSBzZXNzaW9uID8gc2Vzc2lvblN0b3JhZ2UgOiBsb2NhbFN0b3JhZ2U7XG4gICAgICByZXR1cm4gc3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsKTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24oa2V5LCBzZXNzaW9uKSB7XG4gICAgICB2YXIgc3RvcmFnZTtcbiAgICAgIGlmIChzZXNzaW9uID09IG51bGwpIHtcbiAgICAgICAgc2Vzc2lvbiA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLnN1cHBvcnRlZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHN0b3JhZ2UgPSBzZXNzaW9uID8gc2Vzc2lvblN0b3JhZ2UgOiBsb2NhbFN0b3JhZ2U7XG4gICAgICByZXR1cm4gc3RvcmFnZVtrZXldO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihrZXksIHNlc3Npb24pIHtcbiAgICAgIHZhciBzdG9yYWdlO1xuICAgICAgaWYgKHNlc3Npb24gPT0gbnVsbCkge1xuICAgICAgICBzZXNzaW9uID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuc3VwcG9ydGVkKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc3RvcmFnZSA9IHNlc3Npb24gPyBzZXNzaW9uU3RvcmFnZSA6IGxvY2FsU3RvcmFnZTtcbiAgICAgIHJldHVybiBzdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFNpbWRpdG9yQXV0b3NhdmU7XG5cbn0pKFNpbXBsZU1vZHVsZSk7XG5cblNpbWRpdG9yLmNvbm5lY3QoU2ltZGl0b3JBdXRvc2F2ZSk7XG5cbnJldHVybiBTaW1kaXRvckF1dG9zYXZlO1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblxuICAgIHJvb3RbJ1NpbWRpdG9yRW1vamknXSA9IGZhY3RvcnkoalF1ZXJ5LFNpbWRpdG9yKTtcbiAgXG59KHdpbmRvdywgZnVuY3Rpb24gKCQsIFNpbWRpdG9yKSB7XG5cbnZhciBFbW9qaUJ1dHRvbixcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHksXG4gIHNsaWNlID0gW10uc2xpY2U7XG5cbkVtb2ppQnV0dG9uID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKEVtb2ppQnV0dG9uLCBzdXBlckNsYXNzKTtcblxuICBFbW9qaUJ1dHRvbi5pMThuID0ge1xuICAgICd6aC1DTic6IHtcbiAgICAgIGVtb2ppOiAn6KGo5oOFJ1xuICAgIH0sXG4gICAgJ2VuLVVTJzoge1xuICAgICAgZW1vamk6ICdlbW9qaSdcbiAgICB9XG4gIH07XG5cbiAgRW1vamlCdXR0b24uaW1hZ2VzID0gWydzbWlsZScsICdzbWlsZXknLCAnbGF1Z2hpbmcnLCAnYmx1c2gnLCAnaGVhcnRfZXllcycsICdzbWlyaycsICdmbHVzaGVkJywgJ2dyaW4nLCAnd2luaycsICdraXNzaW5nX2Nsb3NlZF9leWVzJywgJ3N0dWNrX291dF90b25ndWVfd2lua2luZ19leWUnLCAnc3R1Y2tfb3V0X3Rvbmd1ZScsICdzbGVlcGluZycsICd3b3JyaWVkJywgJ2V4cHJlc3Npb25sZXNzJywgJ3N3ZWF0X3NtaWxlJywgJ2NvbGRfc3dlYXQnLCAnam95JywgJ3NvYicsICdhbmdyeScsICdtYXNrJywgJ3NjcmVhbScsICdzdW5nbGFzc2VzJywgJ2hlYXJ0JywgJ2Jyb2tlbl9oZWFydCcsICdzdGFyJywgJ2FuZ2VyJywgJ2V4Y2xhbWF0aW9uJywgJ3F1ZXN0aW9uJywgJ3p6eicsICd0aHVtYnN1cCcsICd0aHVtYnNkb3duJywgJ29rX2hhbmQnLCAncHVuY2gnLCAndicsICdjbGFwJywgJ211c2NsZScsICdwcmF5JywgJ3NrdWxsJywgJ3Ryb2xsZmFjZSddO1xuXG4gIEVtb2ppQnV0dG9uLnByb3RvdHlwZS5uYW1lID0gJ2Vtb2ppJztcblxuICBFbW9qaUJ1dHRvbi5wcm90b3R5cGUuaWNvbiA9ICdzbWlsZS1vJztcblxuICBFbW9qaUJ1dHRvbi5wcm90b3R5cGUubWVudSA9IHRydWU7XG5cbiAgZnVuY3Rpb24gRW1vamlCdXR0b24oKSB7XG4gICAgdmFyIGFyZ3M7XG4gICAgYXJncyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIEVtb2ppQnV0dG9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAkLm1lcmdlKHRoaXMuZWRpdG9yLmZvcm1hdHRlci5fYWxsb3dlZEF0dHJpYnV0ZXNbJ2ltZyddLCBbJ2RhdGEtZW1vamknLCAnYWx0J10pO1xuICB9XG5cbiAgRW1vamlCdXR0b24ucHJvdG90eXBlLnJlbmRlck1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgJGxpc3QsIGRpciwgaHRtbCwgaSwgbGVuLCBuYW1lLCBvcHRzLCByZWYsIHRwbDtcbiAgICB0cGwgPSAnPHVsIGNsYXNzPVwiZW1vamktbGlzdFwiPlxcbjwvdWw+JztcbiAgICBvcHRzID0gJC5leHRlbmQoe1xuICAgICAgaW1hZ2VQYXRoOiAnaW1hZ2VzL2Vtb2ppLycsXG4gICAgICBpbWFnZXM6IEVtb2ppQnV0dG9uLmltYWdlc1xuICAgIH0sIHRoaXMuZWRpdG9yLm9wdHMuZW1vamkgfHwge30pO1xuICAgIGh0bWwgPSBcIlwiO1xuICAgIGRpciA9IG9wdHMuaW1hZ2VQYXRoLnJlcGxhY2UoL1xcLyQvLCAnJykgKyAnLyc7XG4gICAgcmVmID0gb3B0cy5pbWFnZXM7XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBuYW1lID0gcmVmW2ldO1xuICAgICAgaHRtbCArPSBcIjxsaSBkYXRhLW5hbWU9J1wiICsgbmFtZSArIFwiJz48aW1nIHNyYz0nXCIgKyBkaXIgKyBuYW1lICsgXCIucG5nJyB3aWR0aD0nMjAnIGhlaWdodD0nMjAnIGFsdD0nXCIgKyBuYW1lICsgXCInIC8+PC9saT5cIjtcbiAgICB9XG4gICAgJGxpc3QgPSAkKHRwbCk7XG4gICAgJGxpc3QuaHRtbChodG1sKS5hcHBlbmRUbyh0aGlzLm1lbnVXcmFwcGVyKTtcbiAgICByZXR1cm4gJGxpc3Qub24oJ21vdXNlZG93bicsICdsaScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRpbWc7XG4gICAgICAgIF90aGlzLndyYXBwZXIucmVtb3ZlQ2xhc3MoJ21lbnUtb24nKTtcbiAgICAgICAgaWYgKCFfdGhpcy5lZGl0b3IuaW5wdXRNYW5hZ2VyLmZvY3VzZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJGltZyA9ICQoZS5jdXJyZW50VGFyZ2V0KS5maW5kKCdpbWcnKS5jbG9uZSgpLmF0dHIoe1xuICAgICAgICAgICdkYXRhLWVtb2ppJzogdHJ1ZSxcbiAgICAgICAgICAnZGF0YS1ub24taW1hZ2UnOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLmluc2VydE5vZGUoJGltZyk7XG4gICAgICAgIF90aGlzLmVkaXRvci50cmlnZ2VyKCd2YWx1ZWNoYW5nZWQnKTtcbiAgICAgICAgX3RoaXMuZWRpdG9yLnRyaWdnZXIoJ3NlbGVjdGlvbmNoYW5nZWQnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgRW1vamlCdXR0b24ucHJvdG90eXBlLnN0YXR1cyA9IGZ1bmN0aW9uKCkge307XG5cbiAgcmV0dXJuIEVtb2ppQnV0dG9uO1xuXG59KShTaW1kaXRvci5CdXR0b24pO1xuXG5TaW1kaXRvci5Ub29sYmFyLmFkZEJ1dHRvbihFbW9qaUJ1dHRvbik7XG5cbnJldHVybiBFbW9qaUJ1dHRvbjtcblxufSkpO1xuIiwiLyohXG4qIFNpbWRpdG9yIHYyLjIuM1xuKiBodHRwOi8vc2ltZGl0b3IudG93ZXIuaW0vXG4qIDIwMTUtMDgtMjJcbiovXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblxuICAvL0BDbG91ZCBkZWJ1ZyBmb3IgZXM2IHVzaW5nLi4uXG4gICBcbiAgcm9vdFsnU2ltZGl0b3InXSA9IGZhY3RvcnkoalF1ZXJ5LFNpbXBsZU1vZHVsZSxzaW1wbGUuaG90a2V5cyxzaW1wbGUudXBsb2FkZXIpO1xuXG59KHdpbmRvdywgZnVuY3Rpb24gKCQsIFNpbXBsZU1vZHVsZSwgc2ltcGxlSG90a2V5cywgc2ltcGxlVXBsb2FkZXIpIHtcblxudmFyIEFsaWdubWVudEJ1dHRvbiwgQmxvY2txdW90ZUJ1dHRvbiwgQm9sZEJ1dHRvbiwgQnV0dG9uLCBDb2RlQnV0dG9uLCBDb2RlUG9wb3ZlciwgQ29sb3JCdXR0b24sIEZvcm1hdHRlciwgSHJCdXR0b24sIEltYWdlQnV0dG9uLCBJbWFnZVBvcG92ZXIsIEluZGVudEJ1dHRvbiwgSW5kZW50YXRpb24sIElucHV0TWFuYWdlciwgSXRhbGljQnV0dG9uLCBLZXlzdHJva2UsIExpbmtCdXR0b24sIExpbmtQb3BvdmVyLCBMaXN0QnV0dG9uLCBPcmRlckxpc3RCdXR0b24sIE91dGRlbnRCdXR0b24sIFBvcG92ZXIsIFNlbGVjdGlvbiwgU2ltZGl0b3IsIFN0cmlrZXRocm91Z2hCdXR0b24sIFRhYmxlQnV0dG9uLCBUaXRsZUJ1dHRvbiwgVG9vbGJhciwgVW5kZXJsaW5lQnV0dG9uLCBVbmRvTWFuYWdlciwgVW5vcmRlckxpc3RCdXR0b24sIFV0aWwsXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5LFxuICBpbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH0sXG4gIHNsaWNlID0gW10uc2xpY2U7XG5cblNlbGVjdGlvbiA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChTZWxlY3Rpb24sIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIFNlbGVjdGlvbigpIHtcbiAgICByZXR1cm4gU2VsZWN0aW9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgU2VsZWN0aW9uLnBsdWdpbk5hbWUgPSAnU2VsZWN0aW9uJztcblxuICBTZWxlY3Rpb24ucHJvdG90eXBlLl9yYW5nZSA9IG51bGw7XG5cbiAgU2VsZWN0aW9uLnByb3RvdHlwZS5fc3RhcnROb2RlcyA9IG51bGw7XG5cbiAgU2VsZWN0aW9uLnByb3RvdHlwZS5fZW5kTm9kZXMgPSBudWxsO1xuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUuX2NvbnRhaW5lck5vZGUgPSBudWxsO1xuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUuX25vZGVzID0gbnVsbDtcblxuICBTZWxlY3Rpb24ucHJvdG90eXBlLl9ibG9ja05vZGVzID0gbnVsbDtcblxuICBTZWxlY3Rpb24ucHJvdG90eXBlLl9yb290Tm9kZXMgPSBudWxsO1xuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVkaXRvciA9IHRoaXMuX21vZHVsZTtcbiAgICB0aGlzLl9zZWxlY3Rpb24gPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgICB0aGlzLmVkaXRvci5vbignc2VsZWN0aW9uY2hhbmdlZCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RoaXMuX3Jlc2V0KCk7XG4gICAgICAgIHJldHVybiBfdGhpcy5fcmFuZ2UgPSBfdGhpcy5fc2VsZWN0aW9uLmdldFJhbmdlQXQoMCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3Iub24oJ2JsdXInLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5jbGVhcigpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgU2VsZWN0aW9uLnByb3RvdHlwZS5fcmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9yYW5nZSA9IG51bGw7XG4gICAgdGhpcy5fc3RhcnROb2RlcyA9IG51bGw7XG4gICAgdGhpcy5fZW5kTm9kZXMgPSBudWxsO1xuICAgIHRoaXMuX2NvbnRhaW5lck5vZGUgPSBudWxsO1xuICAgIHRoaXMuX25vZGVzID0gbnVsbDtcbiAgICB0aGlzLl9ibG9ja05vZGVzID0gbnVsbDtcbiAgICByZXR1cm4gdGhpcy5fcm9vdE5vZGVzID0gbnVsbDtcbiAgfTtcblxuICBTZWxlY3Rpb24ucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGU7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3NlbGVjdGlvbi5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgIGUgPSBfZXJyb3I7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZXNldCgpO1xuICB9O1xuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUucmFuZ2UgPSBmdW5jdGlvbihyYW5nZSkge1xuICAgIHZhciBmZk9ySUU7XG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICB0aGlzLl9zZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xuICAgICAgdGhpcy5fcmFuZ2UgPSByYW5nZTtcbiAgICAgIGZmT3JJRSA9IHRoaXMuZWRpdG9yLnV0aWwuYnJvd3Nlci5maXJlZm94IHx8IHRoaXMuZWRpdG9yLnV0aWwuYnJvd3Nlci5tc2llO1xuICAgICAgaWYgKCF0aGlzLmVkaXRvci5pbnB1dE1hbmFnZXIuZm9jdXNlZCAmJiBmZk9ySUUpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuYm9keS5mb2N1cygpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXRoaXMuX3JhbmdlICYmIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5mb2N1c2VkICYmIHRoaXMuX3NlbGVjdGlvbi5yYW5nZUNvdW50KSB7XG4gICAgICB0aGlzLl9yYW5nZSA9IHRoaXMuX3NlbGVjdGlvbi5nZXRSYW5nZUF0KDApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcmFuZ2U7XG4gIH07XG5cbiAgU2VsZWN0aW9uLnByb3RvdHlwZS5zdGFydE5vZGVzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3JhbmdlKSB7XG4gICAgICB0aGlzLl9zdGFydE5vZGVzIHx8ICh0aGlzLl9zdGFydE5vZGVzID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgc3RhcnROb2RlcztcbiAgICAgICAgICBzdGFydE5vZGVzID0gJChfdGhpcy5fcmFuZ2Uuc3RhcnRDb250YWluZXIpLnBhcmVudHNVbnRpbChfdGhpcy5lZGl0b3IuYm9keSkuZ2V0KCk7XG4gICAgICAgICAgc3RhcnROb2Rlcy51bnNoaWZ0KF90aGlzLl9yYW5nZS5zdGFydENvbnRhaW5lcik7XG4gICAgICAgICAgcmV0dXJuICQoc3RhcnROb2Rlcyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3N0YXJ0Tm9kZXM7XG4gIH07XG5cbiAgU2VsZWN0aW9uLnByb3RvdHlwZS5lbmROb2RlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbmROb2RlcztcbiAgICBpZiAodGhpcy5fcmFuZ2UpIHtcbiAgICAgIHRoaXMuX2VuZE5vZGVzIHx8ICh0aGlzLl9lbmROb2RlcyA9IHRoaXMuX3JhbmdlLmNvbGxhcHNlZCA/IHRoaXMuc3RhcnROb2RlcygpIDogKGVuZE5vZGVzID0gJCh0aGlzLl9yYW5nZS5lbmRDb250YWluZXIpLnBhcmVudHNVbnRpbCh0aGlzLmVkaXRvci5ib2R5KS5nZXQoKSwgZW5kTm9kZXMudW5zaGlmdCh0aGlzLl9yYW5nZS5lbmRDb250YWluZXIpLCAkKGVuZE5vZGVzKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZW5kTm9kZXM7XG4gIH07XG5cbiAgU2VsZWN0aW9uLnByb3RvdHlwZS5jb250YWluZXJOb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3JhbmdlKSB7XG4gICAgICB0aGlzLl9jb250YWluZXJOb2RlIHx8ICh0aGlzLl9jb250YWluZXJOb2RlID0gJCh0aGlzLl9yYW5nZS5jb21tb25BbmNlc3RvckNvbnRhaW5lcikpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyTm9kZTtcbiAgfTtcblxuICBTZWxlY3Rpb24ucHJvdG90eXBlLm5vZGVzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3JhbmdlKSB7XG4gICAgICB0aGlzLl9ub2RlcyB8fCAodGhpcy5fbm9kZXMgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBub2RlcztcbiAgICAgICAgICBub2RlcyA9IFtdO1xuICAgICAgICAgIGlmIChfdGhpcy5zdGFydE5vZGVzKCkuZmlyc3QoKS5pcyhfdGhpcy5lbmROb2RlcygpLmZpcnN0KCkpKSB7XG4gICAgICAgICAgICBub2RlcyA9IF90aGlzLnN0YXJ0Tm9kZXMoKS5nZXQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3RoaXMuc3RhcnROb2RlcygpLmVhY2goZnVuY3Rpb24oaSwgbm9kZSkge1xuICAgICAgICAgICAgICB2YXIgJGVuZE5vZGUsICRub2RlLCAkbm9kZXMsIGVuZEluZGV4LCBpbmRleCwgc2hhcmVkSW5kZXgsIHN0YXJ0SW5kZXg7XG4gICAgICAgICAgICAgICRub2RlID0gJChub2RlKTtcbiAgICAgICAgICAgICAgaWYgKF90aGlzLmVuZE5vZGVzKCkuaW5kZXgoJG5vZGUpID4gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICgkbm9kZS5wYXJlbnQoKS5pcyhfdGhpcy5lZGl0b3IuYm9keSkgfHwgKHNoYXJlZEluZGV4ID0gX3RoaXMuZW5kTm9kZXMoKS5pbmRleCgkbm9kZS5wYXJlbnQoKSkpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hhcmVkSW5kZXggJiYgc2hhcmVkSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgICAgJGVuZE5vZGUgPSBfdGhpcy5lbmROb2RlcygpLmVxKHNoYXJlZEluZGV4IC0gMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICRlbmROb2RlID0gX3RoaXMuZW5kTm9kZXMoKS5sYXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRub2RlcyA9ICRub2RlLnBhcmVudCgpLmNvbnRlbnRzKCk7XG4gICAgICAgICAgICAgICAgc3RhcnRJbmRleCA9ICRub2Rlcy5pbmRleCgkbm9kZSk7XG4gICAgICAgICAgICAgICAgZW5kSW5kZXggPSAkbm9kZXMuaW5kZXgoJGVuZE5vZGUpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkLm1lcmdlKG5vZGVzLCAkbm9kZXMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpLmdldCgpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkbm9kZXMgPSAkbm9kZS5wYXJlbnQoKS5jb250ZW50cygpO1xuICAgICAgICAgICAgICAgIGluZGV4ID0gJG5vZGVzLmluZGV4KCRub2RlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJC5tZXJnZShub2RlcywgJG5vZGVzLnNsaWNlKGluZGV4KS5nZXQoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgX3RoaXMuZW5kTm9kZXMoKS5lYWNoKGZ1bmN0aW9uKGksIG5vZGUpIHtcbiAgICAgICAgICAgICAgdmFyICRub2RlLCAkbm9kZXMsIGluZGV4O1xuICAgICAgICAgICAgICAkbm9kZSA9ICQobm9kZSk7XG4gICAgICAgICAgICAgIGlmICgkbm9kZS5wYXJlbnQoKS5pcyhfdGhpcy5lZGl0b3IuYm9keSkgfHwgX3RoaXMuc3RhcnROb2RlcygpLmluZGV4KCRub2RlLnBhcmVudCgpKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJG5vZGVzID0gJG5vZGUucGFyZW50KCkuY29udGVudHMoKTtcbiAgICAgICAgICAgICAgICBpbmRleCA9ICRub2Rlcy5pbmRleCgkbm9kZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICQubWVyZ2Uobm9kZXMsICRub2Rlcy5zbGljZSgwLCBpbmRleCArIDEpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAkKCQudW5pcXVlKG5vZGVzKSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX25vZGVzO1xuICB9O1xuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUuYmxvY2tOb2RlcyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fcmFuZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fYmxvY2tOb2RlcyB8fCAodGhpcy5fYmxvY2tOb2RlcyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMubm9kZXMoKS5maWx0ZXIoZnVuY3Rpb24oaSwgbm9kZSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5lZGl0b3IudXRpbC5pc0Jsb2NrTm9kZShub2RlKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKCkpO1xuICAgIHJldHVybiB0aGlzLl9ibG9ja05vZGVzO1xuICB9O1xuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUucm9vdE5vZGVzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9yYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9yb290Tm9kZXMgfHwgKHRoaXMuX3Jvb3ROb2RlcyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMubm9kZXMoKS5maWx0ZXIoZnVuY3Rpb24oaSwgbm9kZSkge1xuICAgICAgICAgIHZhciAkcGFyZW50O1xuICAgICAgICAgICRwYXJlbnQgPSAkKG5vZGUpLnBhcmVudCgpO1xuICAgICAgICAgIHJldHVybiAkcGFyZW50LmlzKF90aGlzLmVkaXRvci5ib2R5KSB8fCAkcGFyZW50LmlzKCdibG9ja3F1b3RlJyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSgpKTtcbiAgICByZXR1cm4gdGhpcy5fcm9vdE5vZGVzO1xuICB9O1xuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUucmFuZ2VBdEVuZE9mID0gZnVuY3Rpb24obm9kZSwgcmFuZ2UpIHtcbiAgICB2YXIgYWZ0ZXJMYXN0Tm9kZSwgYmVmb3JlTGFzdE5vZGUsIGVuZE5vZGUsIGVuZE5vZGVMZW5ndGgsIGxhc3ROb2RlSXNCciwgcmVzdWx0O1xuICAgIGlmIChyYW5nZSA9PSBudWxsKSB7XG4gICAgICByYW5nZSA9IHRoaXMucmFuZ2UoKTtcbiAgICB9XG4gICAgaWYgKCEocmFuZ2UgJiYgcmFuZ2UuY29sbGFwc2VkKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub2RlID0gJChub2RlKVswXTtcbiAgICBlbmROb2RlID0gcmFuZ2UuZW5kQ29udGFpbmVyO1xuICAgIGVuZE5vZGVMZW5ndGggPSB0aGlzLmVkaXRvci51dGlsLmdldE5vZGVMZW5ndGgoZW5kTm9kZSk7XG4gICAgYmVmb3JlTGFzdE5vZGUgPSByYW5nZS5lbmRPZmZzZXQgPT09IGVuZE5vZGVMZW5ndGggLSAxO1xuICAgIGxhc3ROb2RlSXNCciA9ICQoZW5kTm9kZSkuY29udGVudHMoKS5sYXN0KCkuaXMoJ2JyJyk7XG4gICAgYWZ0ZXJMYXN0Tm9kZSA9IHJhbmdlLmVuZE9mZnNldCA9PT0gZW5kTm9kZUxlbmd0aDtcbiAgICBpZiAoISgoYmVmb3JlTGFzdE5vZGUgJiYgbGFzdE5vZGVJc0JyKSB8fCBhZnRlckxhc3ROb2RlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAobm9kZSA9PT0gZW5kTm9kZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICghJC5jb250YWlucyhub2RlLCBlbmROb2RlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXN1bHQgPSB0cnVlO1xuICAgICQoZW5kTm9kZSkucGFyZW50c1VudGlsKG5vZGUpLmFkZEJhY2soKS5lYWNoKGZ1bmN0aW9uKGksIG4pIHtcbiAgICAgIHZhciAkbGFzdENoaWxkLCBiZWZvcmVMYXN0YnIsIGlzTGFzdE5vZGUsIG5vZGVzO1xuICAgICAgbm9kZXMgPSAkKG4pLnBhcmVudCgpLmNvbnRlbnRzKCkuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gISh0aGlzICE9PSBuICYmIHRoaXMubm9kZVR5cGUgPT09IDMgJiYgIXRoaXMubm9kZVZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgJGxhc3RDaGlsZCA9IG5vZGVzLmxhc3QoKTtcbiAgICAgIGlzTGFzdE5vZGUgPSAkbGFzdENoaWxkLmdldCgwKSA9PT0gbjtcbiAgICAgIGJlZm9yZUxhc3RiciA9ICRsYXN0Q2hpbGQuaXMoJ2JyJykgJiYgJGxhc3RDaGlsZC5wcmV2KCkuZ2V0KDApID09PSBuO1xuICAgICAgaWYgKCEoaXNMYXN0Tm9kZSB8fCBiZWZvcmVMYXN0YnIpKSB7XG4gICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICBTZWxlY3Rpb24ucHJvdG90eXBlLnJhbmdlQXRTdGFydE9mID0gZnVuY3Rpb24obm9kZSwgcmFuZ2UpIHtcbiAgICB2YXIgcmVzdWx0LCBzdGFydE5vZGU7XG4gICAgaWYgKHJhbmdlID09IG51bGwpIHtcbiAgICAgIHJhbmdlID0gdGhpcy5yYW5nZSgpO1xuICAgIH1cbiAgICBpZiAoIShyYW5nZSAmJiByYW5nZS5jb2xsYXBzZWQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5vZGUgPSAkKG5vZGUpWzBdO1xuICAgIHN0YXJ0Tm9kZSA9IHJhbmdlLnN0YXJ0Q29udGFpbmVyO1xuICAgIGlmIChyYW5nZS5zdGFydE9mZnNldCAhPT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAobm9kZSA9PT0gc3RhcnROb2RlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCEkLmNvbnRhaW5zKG5vZGUsIHN0YXJ0Tm9kZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAkKHN0YXJ0Tm9kZSkucGFyZW50c1VudGlsKG5vZGUpLmFkZEJhY2soKS5lYWNoKGZ1bmN0aW9uKGksIG4pIHtcbiAgICAgIHZhciBub2RlcztcbiAgICAgIG5vZGVzID0gJChuKS5wYXJlbnQoKS5jb250ZW50cygpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEodGhpcyAhPT0gbiAmJiB0aGlzLm5vZGVUeXBlID09PSAzICYmICF0aGlzLm5vZGVWYWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIGlmIChub2Rlcy5maXJzdCgpLmdldCgwKSAhPT0gbikge1xuICAgICAgICByZXR1cm4gcmVzdWx0ID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICBTZWxlY3Rpb24ucHJvdG90eXBlLmluc2VydE5vZGUgPSBmdW5jdGlvbihub2RlLCByYW5nZSkge1xuICAgIGlmIChyYW5nZSA9PSBudWxsKSB7XG4gICAgICByYW5nZSA9IHRoaXMucmFuZ2UoKTtcbiAgICB9XG4gICAgaWYgKCFyYW5nZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub2RlID0gJChub2RlKVswXTtcbiAgICByYW5nZS5pbnNlcnROb2RlKG5vZGUpO1xuICAgIHJldHVybiB0aGlzLnNldFJhbmdlQWZ0ZXIobm9kZSwgcmFuZ2UpO1xuICB9O1xuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUuc2V0UmFuZ2VBZnRlciA9IGZ1bmN0aW9uKG5vZGUsIHJhbmdlKSB7XG4gICAgaWYgKHJhbmdlID09IG51bGwpIHtcbiAgICAgIHJhbmdlID0gdGhpcy5yYW5nZSgpO1xuICAgIH1cbiAgICBpZiAocmFuZ2UgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBub2RlID0gJChub2RlKVswXTtcbiAgICByYW5nZS5zZXRFbmRBZnRlcihub2RlKTtcbiAgICByYW5nZS5jb2xsYXBzZShmYWxzZSk7XG4gICAgcmV0dXJuIHRoaXMucmFuZ2UocmFuZ2UpO1xuICB9O1xuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUuc2V0UmFuZ2VCZWZvcmUgPSBmdW5jdGlvbihub2RlLCByYW5nZSkge1xuICAgIGlmIChyYW5nZSA9PSBudWxsKSB7XG4gICAgICByYW5nZSA9IHRoaXMucmFuZ2UoKTtcbiAgICB9XG4gICAgaWYgKHJhbmdlID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbm9kZSA9ICQobm9kZSlbMF07XG4gICAgcmFuZ2Uuc2V0RW5kQmVmb3JlKG5vZGUpO1xuICAgIHJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcbiAgICByZXR1cm4gdGhpcy5yYW5nZShyYW5nZSk7XG4gIH07XG5cbiAgU2VsZWN0aW9uLnByb3RvdHlwZS5zZXRSYW5nZUF0U3RhcnRPZiA9IGZ1bmN0aW9uKG5vZGUsIHJhbmdlKSB7XG4gICAgaWYgKHJhbmdlID09IG51bGwpIHtcbiAgICAgIHJhbmdlID0gdGhpcy5yYW5nZSgpO1xuICAgIH1cbiAgICBub2RlID0gJChub2RlKS5nZXQoMCk7XG4gICAgcmFuZ2Uuc2V0RW5kKG5vZGUsIDApO1xuICAgIHJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcbiAgICByZXR1cm4gdGhpcy5yYW5nZShyYW5nZSk7XG4gIH07XG5cbiAgU2VsZWN0aW9uLnByb3RvdHlwZS5zZXRSYW5nZUF0RW5kT2YgPSBmdW5jdGlvbihub2RlLCByYW5nZSkge1xuICAgIHZhciAkbGFzdE5vZGUsICRub2RlLCBjb250ZW50cywgbGFzdENoaWxkLCBsYXN0Q2hpbGRMZW5ndGgsIGxhc3RUZXh0LCBub2RlTGVuZ3RoO1xuICAgIGlmIChyYW5nZSA9PSBudWxsKSB7XG4gICAgICByYW5nZSA9IHRoaXMucmFuZ2UoKTtcbiAgICB9XG4gICAgJG5vZGUgPSAkKG5vZGUpO1xuICAgIG5vZGUgPSAkbm9kZVswXTtcbiAgICBpZiAoJG5vZGUuaXMoJ3ByZScpKSB7XG4gICAgICBjb250ZW50cyA9ICRub2RlLmNvbnRlbnRzKCk7XG4gICAgICBpZiAoY29udGVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICBsYXN0Q2hpbGQgPSBjb250ZW50cy5sYXN0KCk7XG4gICAgICAgIGxhc3RUZXh0ID0gbGFzdENoaWxkLnRleHQoKTtcbiAgICAgICAgbGFzdENoaWxkTGVuZ3RoID0gdGhpcy5lZGl0b3IudXRpbC5nZXROb2RlTGVuZ3RoKGxhc3RDaGlsZFswXSk7XG4gICAgICAgIGlmIChsYXN0VGV4dC5jaGFyQXQobGFzdFRleHQubGVuZ3RoIC0gMSkgPT09ICdcXG4nKSB7XG4gICAgICAgICAgcmFuZ2Uuc2V0RW5kKGxhc3RDaGlsZFswXSwgbGFzdENoaWxkTGVuZ3RoIC0gMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmFuZ2Uuc2V0RW5kKGxhc3RDaGlsZFswXSwgbGFzdENoaWxkTGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmFuZ2Uuc2V0RW5kKG5vZGUsIDApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBub2RlTGVuZ3RoID0gdGhpcy5lZGl0b3IudXRpbC5nZXROb2RlTGVuZ3RoKG5vZGUpO1xuICAgICAgaWYgKG5vZGUubm9kZVR5cGUgIT09IDMgJiYgbm9kZUxlbmd0aCA+IDApIHtcbiAgICAgICAgJGxhc3ROb2RlID0gJChub2RlKS5jb250ZW50cygpLmxhc3QoKTtcbiAgICAgICAgaWYgKCRsYXN0Tm9kZS5pcygnYnInKSkge1xuICAgICAgICAgIG5vZGVMZW5ndGggLT0gMTtcbiAgICAgICAgfSBlbHNlIGlmICgkbGFzdE5vZGVbMF0ubm9kZVR5cGUgIT09IDMgJiYgdGhpcy5lZGl0b3IudXRpbC5pc0VtcHR5Tm9kZSgkbGFzdE5vZGUpKSB7XG4gICAgICAgICAgJGxhc3ROb2RlLmFwcGVuZCh0aGlzLmVkaXRvci51dGlsLnBoQnIpO1xuICAgICAgICAgIG5vZGUgPSAkbGFzdE5vZGVbMF07XG4gICAgICAgICAgbm9kZUxlbmd0aCA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJhbmdlLnNldEVuZChub2RlLCBub2RlTGVuZ3RoKTtcbiAgICB9XG4gICAgcmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xuICAgIHJldHVybiB0aGlzLnJhbmdlKHJhbmdlKTtcbiAgfTtcblxuICBTZWxlY3Rpb24ucHJvdG90eXBlLmRlbGV0ZVJhbmdlQ29udGVudHMgPSBmdW5jdGlvbihyYW5nZSkge1xuICAgIHZhciBhdEVuZE9mQm9keSwgYXRTdGFydE9mQm9keSwgZW5kUmFuZ2UsIHN0YXJ0UmFuZ2U7XG4gICAgaWYgKHJhbmdlID09IG51bGwpIHtcbiAgICAgIHJhbmdlID0gdGhpcy5yYW5nZSgpO1xuICAgIH1cbiAgICBzdGFydFJhbmdlID0gcmFuZ2UuY2xvbmVSYW5nZSgpO1xuICAgIGVuZFJhbmdlID0gcmFuZ2UuY2xvbmVSYW5nZSgpO1xuICAgIHN0YXJ0UmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG4gICAgZW5kUmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xuICAgIGF0U3RhcnRPZkJvZHkgPSB0aGlzLnJhbmdlQXRTdGFydE9mKHRoaXMuZWRpdG9yLmJvZHksIHN0YXJ0UmFuZ2UpO1xuICAgIGF0RW5kT2ZCb2R5ID0gdGhpcy5yYW5nZUF0RW5kT2YodGhpcy5lZGl0b3IuYm9keSwgZW5kUmFuZ2UpO1xuICAgIGlmICghcmFuZ2UuY29sbGFwc2VkICYmIGF0U3RhcnRPZkJvZHkgJiYgYXRFbmRPZkJvZHkpIHtcbiAgICAgIHRoaXMuZWRpdG9yLmJvZHkuZW1wdHkoKTtcbiAgICAgIHJhbmdlLnNldFN0YXJ0KHRoaXMuZWRpdG9yLmJvZHlbMF0sIDApO1xuICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG4gICAgICB0aGlzLnJhbmdlKHJhbmdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmFuZ2UuZGVsZXRlQ29udGVudHMoKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUuYnJlYWtCbG9ja0VsID0gZnVuY3Rpb24oZWwsIHJhbmdlKSB7XG4gICAgdmFyICRlbDtcbiAgICBpZiAocmFuZ2UgPT0gbnVsbCkge1xuICAgICAgcmFuZ2UgPSB0aGlzLnJhbmdlKCk7XG4gICAgfVxuICAgICRlbCA9ICQoZWwpO1xuICAgIGlmICghcmFuZ2UuY29sbGFwc2VkKSB7XG4gICAgICByZXR1cm4gJGVsO1xuICAgIH1cbiAgICByYW5nZS5zZXRTdGFydEJlZm9yZSgkZWwuZ2V0KDApKTtcbiAgICBpZiAocmFuZ2UuY29sbGFwc2VkKSB7XG4gICAgICByZXR1cm4gJGVsO1xuICAgIH1cbiAgICByZXR1cm4gJGVsLmJlZm9yZShyYW5nZS5leHRyYWN0Q29udGVudHMoKSk7XG4gIH07XG5cbiAgU2VsZWN0aW9uLnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICB2YXIgZW5kQ2FyZXQsIGVuZFJhbmdlLCBzdGFydENhcmV0O1xuICAgIGlmIChyYW5nZSA9PSBudWxsKSB7XG4gICAgICByYW5nZSA9IHRoaXMucmFuZ2UoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3NlbGVjdGlvblNhdmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVuZFJhbmdlID0gcmFuZ2UuY2xvbmVSYW5nZSgpO1xuICAgIGVuZFJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcbiAgICBzdGFydENhcmV0ID0gJCgnPHNwYW4vPicpLmFkZENsYXNzKCdzaW1kaXRvci1jYXJldC1zdGFydCcpO1xuICAgIGVuZENhcmV0ID0gJCgnPHNwYW4vPicpLmFkZENsYXNzKCdzaW1kaXRvci1jYXJldC1lbmQnKTtcbiAgICBlbmRSYW5nZS5pbnNlcnROb2RlKGVuZENhcmV0WzBdKTtcbiAgICByYW5nZS5pbnNlcnROb2RlKHN0YXJ0Q2FyZXRbMF0pO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0aW9uU2F2ZWQgPSB0cnVlO1xuICB9O1xuXG4gIFNlbGVjdGlvbi5wcm90b3R5cGUucmVzdG9yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbmRDYXJldCwgZW5kQ29udGFpbmVyLCBlbmRPZmZzZXQsIHJhbmdlLCBzdGFydENhcmV0LCBzdGFydENvbnRhaW5lciwgc3RhcnRPZmZzZXQ7XG4gICAgaWYgKCF0aGlzLl9zZWxlY3Rpb25TYXZlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBzdGFydENhcmV0ID0gdGhpcy5lZGl0b3IuYm9keS5maW5kKCcuc2ltZGl0b3ItY2FyZXQtc3RhcnQnKTtcbiAgICBlbmRDYXJldCA9IHRoaXMuZWRpdG9yLmJvZHkuZmluZCgnLnNpbWRpdG9yLWNhcmV0LWVuZCcpO1xuICAgIGlmIChzdGFydENhcmV0Lmxlbmd0aCAmJiBlbmRDYXJldC5sZW5ndGgpIHtcbiAgICAgIHN0YXJ0Q29udGFpbmVyID0gc3RhcnRDYXJldC5wYXJlbnQoKTtcbiAgICAgIHN0YXJ0T2Zmc2V0ID0gc3RhcnRDb250YWluZXIuY29udGVudHMoKS5pbmRleChzdGFydENhcmV0KTtcbiAgICAgIGVuZENvbnRhaW5lciA9IGVuZENhcmV0LnBhcmVudCgpO1xuICAgICAgZW5kT2Zmc2V0ID0gZW5kQ29udGFpbmVyLmNvbnRlbnRzKCkuaW5kZXgoZW5kQ2FyZXQpO1xuICAgICAgaWYgKHN0YXJ0Q29udGFpbmVyWzBdID09PSBlbmRDb250YWluZXJbMF0pIHtcbiAgICAgICAgZW5kT2Zmc2V0IC09IDE7XG4gICAgICB9XG4gICAgICByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICByYW5nZS5zZXRTdGFydChzdGFydENvbnRhaW5lci5nZXQoMCksIHN0YXJ0T2Zmc2V0KTtcbiAgICAgIHJhbmdlLnNldEVuZChlbmRDb250YWluZXIuZ2V0KDApLCBlbmRPZmZzZXQpO1xuICAgICAgc3RhcnRDYXJldC5yZW1vdmUoKTtcbiAgICAgIGVuZENhcmV0LnJlbW92ZSgpO1xuICAgICAgdGhpcy5yYW5nZShyYW5nZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXJ0Q2FyZXQucmVtb3ZlKCk7XG4gICAgICBlbmRDYXJldC5yZW1vdmUoKTtcbiAgICB9XG4gICAgdGhpcy5fc2VsZWN0aW9uU2F2ZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgcmV0dXJuIFNlbGVjdGlvbjtcblxufSkoU2ltcGxlTW9kdWxlKTtcblxuRm9ybWF0dGVyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKEZvcm1hdHRlciwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gRm9ybWF0dGVyKCkge1xuICAgIHJldHVybiBGb3JtYXR0ZXIuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBGb3JtYXR0ZXIucGx1Z2luTmFtZSA9ICdGb3JtYXR0ZXInO1xuXG4gIEZvcm1hdHRlci5wcm90b3R5cGUub3B0cyA9IHtcbiAgICBhbGxvd2VkVGFnczogW10sXG4gICAgYWxsb3dlZEF0dHJpYnV0ZXM6IHt9LFxuICAgIGFsbG93ZWRTdHlsZXM6IHt9XG4gIH07XG5cbiAgRm9ybWF0dGVyLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWRpdG9yID0gdGhpcy5fbW9kdWxlO1xuICAgIHRoaXMuX2FsbG93ZWRUYWdzID0gJC5tZXJnZShbJ2JyJywgJ3NwYW4nLCAnYScsICdpbWcnLCAnYicsICdzdHJvbmcnLCAnaScsICd1JywgJ2ZvbnQnLCAncCcsICd1bCcsICdvbCcsICdsaScsICdibG9ja3F1b3RlJywgJ3ByZScsICdjb2RlJywgJ2gxJywgJ2gyJywgJ2gzJywgJ2g0JywgJ2hyJ10sIHRoaXMub3B0cy5hbGxvd2VkVGFncyk7XG4gICAgdGhpcy5fYWxsb3dlZEF0dHJpYnV0ZXMgPSAkLmV4dGVuZCh7XG4gICAgICBpbWc6IFsnc3JjJywgJ2FsdCcsICd3aWR0aCcsICdoZWlnaHQnLCAnZGF0YS1ub24taW1hZ2UnXSxcbiAgICAgIGE6IFsnaHJlZicsICd0YXJnZXQnXSxcbiAgICAgIGZvbnQ6IFsnY29sb3InXSxcbiAgICAgIGNvZGU6IFsnY2xhc3MnXVxuICAgIH0sIHRoaXMub3B0cy5hbGxvd2VkQXR0cmlidXRlcyk7XG4gICAgdGhpcy5fYWxsb3dlZFN0eWxlcyA9ICQuZXh0ZW5kKHtcbiAgICAgIHNwYW46IFsnY29sb3InXSxcbiAgICAgIHA6IFsnbWFyZ2luLWxlZnQnLCAndGV4dC1hbGlnbiddLFxuICAgICAgaDE6IFsnbWFyZ2luLWxlZnQnLCAndGV4dC1hbGlnbiddLFxuICAgICAgaDI6IFsnbWFyZ2luLWxlZnQnLCAndGV4dC1hbGlnbiddLFxuICAgICAgaDM6IFsnbWFyZ2luLWxlZnQnLCAndGV4dC1hbGlnbiddLFxuICAgICAgaDQ6IFsnbWFyZ2luLWxlZnQnLCAndGV4dC1hbGlnbiddXG4gICAgfSwgdGhpcy5vcHRzLmFsbG93ZWRTdHlsZXMpO1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5ib2R5Lm9uKCdjbGljaycsICdhJywgZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICB9O1xuXG4gIEZvcm1hdHRlci5wcm90b3R5cGUuZGVjb3JhdGUgPSBmdW5jdGlvbigkZWwpIHtcbiAgICBpZiAoJGVsID09IG51bGwpIHtcbiAgICAgICRlbCA9IHRoaXMuZWRpdG9yLmJvZHk7XG4gICAgfVxuICAgIHRoaXMuZWRpdG9yLnRyaWdnZXIoJ2RlY29yYXRlJywgWyRlbF0pO1xuICAgIHJldHVybiAkZWw7XG4gIH07XG5cbiAgRm9ybWF0dGVyLnByb3RvdHlwZS51bmRlY29yYXRlID0gZnVuY3Rpb24oJGVsKSB7XG4gICAgaWYgKCRlbCA9PSBudWxsKSB7XG4gICAgICAkZWwgPSB0aGlzLmVkaXRvci5ib2R5LmNsb25lKCk7XG4gICAgfVxuICAgIHRoaXMuZWRpdG9yLnRyaWdnZXIoJ3VuZGVjb3JhdGUnLCBbJGVsXSk7XG4gICAgcmV0dXJuICRlbDtcbiAgfTtcblxuICBGb3JtYXR0ZXIucHJvdG90eXBlLmF1dG9saW5rID0gZnVuY3Rpb24oJGVsKSB7XG4gICAgdmFyICRsaW5rLCAkbm9kZSwgZmluZExpbmtOb2RlLCBrLCBsYXN0SW5kZXgsIGxlbiwgbGlua05vZGVzLCBtYXRjaCwgcmUsIHJlcGxhY2VFbHMsIHN1YlN0ciwgdGV4dCwgdXJpO1xuICAgIGlmICgkZWwgPT0gbnVsbCkge1xuICAgICAgJGVsID0gdGhpcy5lZGl0b3IuYm9keTtcbiAgICB9XG4gICAgbGlua05vZGVzID0gW107XG4gICAgZmluZExpbmtOb2RlID0gZnVuY3Rpb24oJHBhcmVudE5vZGUpIHtcbiAgICAgIHJldHVybiAkcGFyZW50Tm9kZS5jb250ZW50cygpLmVhY2goZnVuY3Rpb24oaSwgbm9kZSkge1xuICAgICAgICB2YXIgJG5vZGUsIHRleHQ7XG4gICAgICAgICRub2RlID0gJChub2RlKTtcbiAgICAgICAgaWYgKCRub2RlLmlzKCdhJykgfHwgJG5vZGUuY2xvc2VzdCgnYSwgcHJlJywgJGVsKS5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEkbm9kZS5pcygnaWZyYW1lJykgJiYgJG5vZGUuY29udGVudHMoKS5sZW5ndGgpIHtcbiAgICAgICAgICByZXR1cm4gZmluZExpbmtOb2RlKCRub2RlKTtcbiAgICAgICAgfSBlbHNlIGlmICgodGV4dCA9ICRub2RlLnRleHQoKSkgJiYgL2h0dHBzPzpcXC9cXC98d3d3XFwuL2lnLnRlc3QodGV4dCkpIHtcbiAgICAgICAgICByZXR1cm4gbGlua05vZGVzLnB1c2goJG5vZGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICAgIGZpbmRMaW5rTm9kZSgkZWwpO1xuICAgIHJlID0gLyhodHRwcz86XFwvXFwvfHd3d1xcLilbXFx3XFwtXFwuXFw/Jj1cXC8jJTosQFxcIVxcK10rL2lnO1xuICAgIGZvciAoayA9IDAsIGxlbiA9IGxpbmtOb2Rlcy5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgJG5vZGUgPSBsaW5rTm9kZXNba107XG4gICAgICB0ZXh0ID0gJG5vZGUudGV4dCgpO1xuICAgICAgcmVwbGFjZUVscyA9IFtdO1xuICAgICAgbWF0Y2ggPSBudWxsO1xuICAgICAgbGFzdEluZGV4ID0gMDtcbiAgICAgIHdoaWxlICgobWF0Y2ggPSByZS5leGVjKHRleHQpKSAhPT0gbnVsbCkge1xuICAgICAgICBzdWJTdHIgPSB0ZXh0LnN1YnN0cmluZyhsYXN0SW5kZXgsIG1hdGNoLmluZGV4KTtcbiAgICAgICAgcmVwbGFjZUVscy5wdXNoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN1YlN0cikpO1xuICAgICAgICBsYXN0SW5kZXggPSByZS5sYXN0SW5kZXg7XG4gICAgICAgIHVyaSA9IC9eKGh0dHAocyk/OlxcL1xcL3xcXC8pLy50ZXN0KG1hdGNoWzBdKSA/IG1hdGNoWzBdIDogJ2h0dHA6Ly8nICsgbWF0Y2hbMF07XG4gICAgICAgICRsaW5rID0gJChcIjxhIHRhZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiICsgdXJpICsgXCJcXFwiIHJlbD1cXFwibm9mb2xsb3dcXFwiPjwvYT5cIikudGV4dChtYXRjaFswXSk7XG4gICAgICAgIHJlcGxhY2VFbHMucHVzaCgkbGlua1swXSk7XG4gICAgICB9XG4gICAgICByZXBsYWNlRWxzLnB1c2goZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dC5zdWJzdHJpbmcobGFzdEluZGV4KSkpO1xuICAgICAgJG5vZGUucmVwbGFjZVdpdGgoJChyZXBsYWNlRWxzKSk7XG4gICAgfVxuICAgIHJldHVybiAkZWw7XG4gIH07XG5cbiAgRm9ybWF0dGVyLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigkZWwpIHtcbiAgICB2YXIgJG5vZGUsIGJsb2NrTm9kZSwgaywgbCwgbGVuLCBsZW4xLCBuLCBub2RlLCByZWYsIHJlZjE7XG4gICAgaWYgKCRlbCA9PSBudWxsKSB7XG4gICAgICAkZWwgPSB0aGlzLmVkaXRvci5ib2R5O1xuICAgIH1cbiAgICBpZiAoJGVsLmlzKCc6ZW1wdHknKSkge1xuICAgICAgJGVsLmFwcGVuZCgnPHA+JyArIHRoaXMuZWRpdG9yLnV0aWwucGhCciArICc8L3A+Jyk7XG4gICAgICByZXR1cm4gJGVsO1xuICAgIH1cbiAgICByZWYgPSAkZWwuY29udGVudHMoKTtcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIG4gPSByZWZba107XG4gICAgICB0aGlzLmNsZWFuTm9kZShuLCB0cnVlKTtcbiAgICB9XG4gICAgcmVmMSA9ICRlbC5jb250ZW50cygpO1xuICAgIGZvciAobCA9IDAsIGxlbjEgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjE7IGwrKykge1xuICAgICAgbm9kZSA9IHJlZjFbbF07XG4gICAgICAkbm9kZSA9ICQobm9kZSk7XG4gICAgICBpZiAoJG5vZGUuaXMoJ2JyJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBibG9ja05vZGUgIT09IFwidW5kZWZpbmVkXCIgJiYgYmxvY2tOb2RlICE9PSBudWxsKSB7XG4gICAgICAgICAgYmxvY2tOb2RlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAkbm9kZS5yZW1vdmUoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IudXRpbC5pc0Jsb2NrTm9kZShub2RlKSkge1xuICAgICAgICBpZiAoJG5vZGUuaXMoJ2xpJykpIHtcbiAgICAgICAgICBpZiAoYmxvY2tOb2RlICYmIGJsb2NrTm9kZS5pcygndWwsIG9sJykpIHtcbiAgICAgICAgICAgIGJsb2NrTm9kZS5hcHBlbmQobm9kZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJsb2NrTm9kZSA9ICQoJzx1bC8+JykuaW5zZXJ0QmVmb3JlKG5vZGUpO1xuICAgICAgICAgICAgYmxvY2tOb2RlLmFwcGVuZChub2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmxvY2tOb2RlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFibG9ja05vZGUgfHwgYmxvY2tOb2RlLmlzKCd1bCwgb2wnKSkge1xuICAgICAgICAgIGJsb2NrTm9kZSA9ICQoJzxwLz4nKS5pbnNlcnRCZWZvcmUobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgYmxvY2tOb2RlLmFwcGVuZChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICRlbDtcbiAgfTtcblxuICBGb3JtYXR0ZXIucHJvdG90eXBlLmNsZWFuTm9kZSA9IGZ1bmN0aW9uKG5vZGUsIHJlY3Vyc2l2ZSkge1xuICAgIHZhciAkY2hpbGRJbWcsICRub2RlLCAkcCwgJHRkLCBhbGxvd2VkQXR0cmlidXRlcywgYXR0ciwgY29udGVudHMsIGlzRGVjb3JhdGlvbiwgaywgbCwgbGVuLCBsZW4xLCBuLCByZWYsIHJlZjEsIHRleHQsIHRleHROb2RlO1xuICAgICRub2RlID0gJChub2RlKTtcbiAgICBpZiAoISgkbm9kZS5sZW5ndGggPiAwKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoJG5vZGVbMF0ubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgIHRleHQgPSAkbm9kZS50ZXh0KCkucmVwbGFjZSgvKFxcclxcbnxcXG58XFxyKS9nbSwgJycpO1xuICAgICAgaWYgKHRleHQpIHtcbiAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbiAgICAgICAgJG5vZGUucmVwbGFjZVdpdGgodGV4dE5vZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJG5vZGUucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnRlbnRzID0gJG5vZGUuaXMoJ2lmcmFtZScpID8gbnVsbCA6ICRub2RlLmNvbnRlbnRzKCk7XG4gICAgaXNEZWNvcmF0aW9uID0gdGhpcy5lZGl0b3IudXRpbC5pc0RlY29yYXRlZE5vZGUoJG5vZGUpO1xuICAgIGlmICgkbm9kZS5pcyh0aGlzLl9hbGxvd2VkVGFncy5qb2luKCcsJykpIHx8IGlzRGVjb3JhdGlvbikge1xuICAgICAgaWYgKCRub2RlLmlzKCdhJykgJiYgKCRjaGlsZEltZyA9ICRub2RlLmZpbmQoJ2ltZycpKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICRub2RlLnJlcGxhY2VXaXRoKCRjaGlsZEltZyk7XG4gICAgICAgICRub2RlID0gJGNoaWxkSW1nO1xuICAgICAgICBjb250ZW50cyA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoJG5vZGUuaXMoJ2ltZycpICYmICRub2RlLmhhc0NsYXNzKCd1cGxvYWRpbmcnKSkge1xuICAgICAgICAkbm9kZS5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICAgIGlmICghaXNEZWNvcmF0aW9uKSB7XG4gICAgICAgIGFsbG93ZWRBdHRyaWJ1dGVzID0gdGhpcy5fYWxsb3dlZEF0dHJpYnV0ZXNbJG5vZGVbMF0udGFnTmFtZS50b0xvd2VyQ2FzZSgpXTtcbiAgICAgICAgcmVmID0gJC5tYWtlQXJyYXkoJG5vZGVbMF0uYXR0cmlidXRlcyk7XG4gICAgICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICAgIGF0dHIgPSByZWZba107XG4gICAgICAgICAgaWYgKGF0dHIubmFtZSA9PT0gJ3N0eWxlJykge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghKChhbGxvd2VkQXR0cmlidXRlcyAhPSBudWxsKSAmJiAocmVmMSA9IGF0dHIubmFtZSwgaW5kZXhPZi5jYWxsKGFsbG93ZWRBdHRyaWJ1dGVzLCByZWYxKSA+PSAwKSkpIHtcbiAgICAgICAgICAgICRub2RlLnJlbW92ZUF0dHIoYXR0ci5uYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY2xlYW5Ob2RlU3R5bGVzKCRub2RlKTtcbiAgICAgICAgaWYgKCRub2RlLmlzKCdzcGFuJykgJiYgJG5vZGVbMF0uYXR0cmlidXRlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAkbm9kZS5jb250ZW50cygpLmZpcnN0KCkudW53cmFwKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCRub2RlWzBdLm5vZGVUeXBlID09PSAxICYmICEkbm9kZS5pcygnOmVtcHR5JykpIHtcbiAgICAgIGlmICgkbm9kZS5pcygnZGl2LCBhcnRpY2xlLCBkbCwgaGVhZGVyLCBmb290ZXIsIHRyJykpIHtcbiAgICAgICAgJG5vZGUuYXBwZW5kKCc8YnIvPicpO1xuICAgICAgICBjb250ZW50cy5maXJzdCgpLnVud3JhcCgpO1xuICAgICAgfSBlbHNlIGlmICgkbm9kZS5pcygndGFibGUnKSkge1xuICAgICAgICAkcCA9ICQoJzxwLz4nKTtcbiAgICAgICAgJG5vZGUuZmluZCgndHInKS5lYWNoKGZ1bmN0aW9uKGksIHRyKSB7XG4gICAgICAgICAgcmV0dXJuICRwLmFwcGVuZCgkKHRyKS50ZXh0KCkgKyAnPGJyLz4nKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRub2RlLnJlcGxhY2VXaXRoKCRwKTtcbiAgICAgICAgY29udGVudHMgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICgkbm9kZS5pcygndGhlYWQsIHRmb290JykpIHtcbiAgICAgICAgJG5vZGUucmVtb3ZlKCk7XG4gICAgICAgIGNvbnRlbnRzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoJG5vZGUuaXMoJ3RoJykpIHtcbiAgICAgICAgJHRkID0gJCgnPHRkLz4nKS5hcHBlbmQoJG5vZGUuY29udGVudHMoKSk7XG4gICAgICAgICRub2RlLnJlcGxhY2VXaXRoKCR0ZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZW50cy5maXJzdCgpLnVud3JhcCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkbm9kZS5yZW1vdmUoKTtcbiAgICAgIGNvbnRlbnRzID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHJlY3Vyc2l2ZSAmJiAoY29udGVudHMgIT0gbnVsbCkgJiYgISRub2RlLmlzKCdwcmUnKSkge1xuICAgICAgZm9yIChsID0gMCwgbGVuMSA9IGNvbnRlbnRzLmxlbmd0aDsgbCA8IGxlbjE7IGwrKykge1xuICAgICAgICBuID0gY29udGVudHNbbF07XG4gICAgICAgIHRoaXMuY2xlYW5Ob2RlKG4sIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBGb3JtYXR0ZXIucHJvdG90eXBlLl9jbGVhbk5vZGVTdHlsZXMgPSBmdW5jdGlvbigkbm9kZSkge1xuICAgIHZhciBhbGxvd2VkU3R5bGVzLCBrLCBsZW4sIHBhaXIsIHJlZiwgcmVmMSwgc3R5bGUsIHN0eWxlU3RyLCBzdHlsZXM7XG4gICAgc3R5bGVTdHIgPSAkbm9kZS5hdHRyKCdzdHlsZScpO1xuICAgIGlmICghc3R5bGVTdHIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgJG5vZGUucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICBhbGxvd2VkU3R5bGVzID0gdGhpcy5fYWxsb3dlZFN0eWxlc1skbm9kZVswXS50YWdOYW1lLnRvTG93ZXJDYXNlKCldO1xuICAgIGlmICghKGFsbG93ZWRTdHlsZXMgJiYgYWxsb3dlZFN0eWxlcy5sZW5ndGggPiAwKSkge1xuICAgICAgcmV0dXJuICRub2RlO1xuICAgIH1cbiAgICBzdHlsZXMgPSB7fTtcbiAgICByZWYgPSBzdHlsZVN0ci5zcGxpdCgnOycpO1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgc3R5bGUgPSByZWZba107XG4gICAgICBzdHlsZSA9ICQudHJpbShzdHlsZSk7XG4gICAgICBwYWlyID0gc3R5bGUuc3BsaXQoJzonKTtcbiAgICAgIGlmICghKHBhaXIubGVuZ3RoID0gMikpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAocmVmMSA9IHBhaXJbMF0sIGluZGV4T2YuY2FsbChhbGxvd2VkU3R5bGVzLCByZWYxKSA+PSAwKSB7XG4gICAgICAgIHN0eWxlc1skLnRyaW0ocGFpclswXSldID0gJC50cmltKHBhaXJbMV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoc3R5bGVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAkbm9kZS5jc3Moc3R5bGVzKTtcbiAgICB9XG4gICAgcmV0dXJuICRub2RlO1xuICB9O1xuXG4gIEZvcm1hdHRlci5wcm90b3R5cGUuY2xlYXJIdG1sID0gZnVuY3Rpb24oaHRtbCwgbGluZUJyZWFrKSB7XG4gICAgdmFyIGNvbnRhaW5lciwgY29udGVudHMsIHJlc3VsdDtcbiAgICBpZiAobGluZUJyZWFrID09IG51bGwpIHtcbiAgICAgIGxpbmVCcmVhayA9IHRydWU7XG4gICAgfVxuICAgIGNvbnRhaW5lciA9ICQoJzxkaXYvPicpLmFwcGVuZChodG1sKTtcbiAgICBjb250ZW50cyA9IGNvbnRhaW5lci5jb250ZW50cygpO1xuICAgIHJlc3VsdCA9ICcnO1xuICAgIGNvbnRlbnRzLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oaSwgbm9kZSkge1xuICAgICAgICB2YXIgJG5vZGUsIGNoaWxkcmVuO1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICAgIHJldHVybiByZXN1bHQgKz0gbm9kZS5ub2RlVmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICRub2RlID0gJChub2RlKTtcbiAgICAgICAgICBjaGlsZHJlbiA9ICRub2RlLmlzKCdpZnJhbWUnKSA/IG51bGwgOiAkbm9kZS5jb250ZW50cygpO1xuICAgICAgICAgIGlmIChjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gX3RoaXMuY2xlYXJIdG1sKGNoaWxkcmVuKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGxpbmVCcmVhayAmJiBpIDwgY29udGVudHMubGVuZ3RoIC0gMSAmJiAkbm9kZS5pcygnYnIsIHAsIGRpdiwgbGksdHIsIHByZSwgYWRkcmVzcywgYXJ0dGljbGUsIGFzaWRlLCBkbCwgZmlnY2FwdGlvbiwgZm9vdGVyLCBoMSwgaDIsaDMsIGg0LCBoZWFkZXInKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCArPSAnXFxuJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgRm9ybWF0dGVyLnByb3RvdHlwZS5iZWF1dGlmeSA9IGZ1bmN0aW9uKCRjb250ZW50cykge1xuICAgIHZhciB1c2VsZXNzUDtcbiAgICB1c2VsZXNzUCA9IGZ1bmN0aW9uKCRlbCkge1xuICAgICAgcmV0dXJuICEhKCRlbC5pcygncCcpICYmICEkZWwudGV4dCgpICYmICRlbC5jaGlsZHJlbignOm5vdChiciknKS5sZW5ndGggPCAxKTtcbiAgICB9O1xuICAgIHJldHVybiAkY29udGVudHMuZWFjaChmdW5jdGlvbihpLCBlbCkge1xuICAgICAgdmFyICRlbCwgaW52YWxpZDtcbiAgICAgICRlbCA9ICQoZWwpO1xuICAgICAgaW52YWxpZCA9ICRlbC5pcygnOm5vdChpbWcsIGJyLCBjb2wsIHRkLCBociwgW2NsYXNzXj1cInNpbWRpdG9yLVwiXSk6ZW1wdHknKTtcbiAgICAgIGlmIChpbnZhbGlkIHx8IHVzZWxlc3NQKCRlbCkpIHtcbiAgICAgICAgJGVsLnJlbW92ZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuICRlbC5maW5kKCc6bm90KGltZywgYnIsIGNvbCwgdGQsIGhyLCBbY2xhc3NePVwic2ltZGl0b3ItXCJdKTplbXB0eScpLnJlbW92ZSgpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBGb3JtYXR0ZXI7XG5cbn0pKFNpbXBsZU1vZHVsZSk7XG5cbklucHV0TWFuYWdlciA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChJbnB1dE1hbmFnZXIsIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIElucHV0TWFuYWdlcigpIHtcbiAgICByZXR1cm4gSW5wdXRNYW5hZ2VyLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgSW5wdXRNYW5hZ2VyLnBsdWdpbk5hbWUgPSAnSW5wdXRNYW5hZ2VyJztcblxuICBJbnB1dE1hbmFnZXIucHJvdG90eXBlLm9wdHMgPSB7XG4gICAgcGFzdGVJbWFnZTogZmFsc2VcbiAgfTtcblxuICBJbnB1dE1hbmFnZXIucHJvdG90eXBlLl9tb2RpZmllcktleXMgPSBbMTYsIDE3LCAxOCwgOTEsIDkzLCAyMjRdO1xuXG4gIElucHV0TWFuYWdlci5wcm90b3R5cGUuX2Fycm93S2V5cyA9IFszNywgMzgsIDM5LCA0MF07XG5cbiAgSW5wdXRNYW5hZ2VyLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdWJtaXRLZXk7XG4gICAgdGhpcy5lZGl0b3IgPSB0aGlzLl9tb2R1bGU7XG4gICAgdGhpcy50aHJvdHRsZWRWYWx1ZUNoYW5nZWQgPSB0aGlzLmVkaXRvci51dGlsLnRocm90dGxlKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuZWRpdG9yLnRyaWdnZXIoJ3ZhbHVlY2hhbmdlZCcsIHBhcmFtcyk7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgIH07XG4gICAgfSkodGhpcyksIDMwMCk7XG4gICAgdGhpcy50aHJvdHRsZWRTZWxlY3Rpb25DaGFuZ2VkID0gdGhpcy5lZGl0b3IudXRpbC50aHJvdHRsZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmVkaXRvci50cmlnZ2VyKCdzZWxlY3Rpb25jaGFuZ2VkJyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpLCA1MCk7XG4gICAgaWYgKHRoaXMub3B0cy5wYXN0ZUltYWdlICYmIHR5cGVvZiB0aGlzLm9wdHMucGFzdGVJbWFnZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMub3B0cy5wYXN0ZUltYWdlID0gJ2lubGluZSc7XG4gICAgfVxuICAgIHRoaXMuX2tleXN0cm9rZUhhbmRsZXJzID0ge307XG4gICAgdGhpcy5ob3RrZXlzID0gc2ltcGxlSG90a2V5cyh7XG4gICAgICBlbDogdGhpcy5lZGl0b3IuYm9keVxuICAgIH0pO1xuICAgIHRoaXMuX3Bhc3RlQXJlYSA9ICQoJzxkaXYvPicpLmNzcyh7XG4gICAgICB3aWR0aDogJzFweCcsXG4gICAgICBoZWlnaHQ6ICcxcHgnLFxuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICByaWdodDogJzAnLFxuICAgICAgYm90dG9tOiAnMTAwcHgnXG4gICAgfSkuYXR0cih7XG4gICAgICB0YWJJbmRleDogJy0xJyxcbiAgICAgIGNvbnRlbnRFZGl0YWJsZTogdHJ1ZVxuICAgIH0pLmFkZENsYXNzKCdzaW1kaXRvci1wYXN0ZS1hcmVhJykuYXBwZW5kVG8odGhpcy5lZGl0b3IuZWwpO1xuICAgICQoZG9jdW1lbnQpLm9uKCdzZWxlY3Rpb25jaGFuZ2Uuc2ltZGl0b3InICsgdGhpcy5lZGl0b3IuaWQsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKCFfdGhpcy5mb2N1c2VkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcy50aHJvdHRsZWRTZWxlY3Rpb25DaGFuZ2VkKCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLmVkaXRvci5vbigndmFsdWVjaGFuZ2VkJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLmxhc3RDYXJldFBvc2l0aW9uID0gbnVsbDtcbiAgICAgICAgaWYgKF90aGlzLmZvY3VzZWQgJiYgIV90aGlzLmVkaXRvci5zZWxlY3Rpb24uYmxvY2tOb2RlcygpLmxlbmd0aCkge1xuICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uc2F2ZSgpO1xuICAgICAgICAgIF90aGlzLmVkaXRvci5mb3JtYXR0ZXIuZm9ybWF0KCk7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yZXN0b3JlKCk7XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuZWRpdG9yLmJvZHkuZmluZCgnaHIsIHByZSwgLnNpbWRpdG9yLXRhYmxlJykuZWFjaChmdW5jdGlvbihpLCBlbCkge1xuICAgICAgICAgIHZhciAkZWwsIGZvcm1hdHRlZDtcbiAgICAgICAgICAkZWwgPSAkKGVsKTtcbiAgICAgICAgICBpZiAoJGVsLnBhcmVudCgpLmlzKCdibG9ja3F1b3RlJykgfHwgJGVsLnBhcmVudCgpWzBdID09PSBfdGhpcy5lZGl0b3IuYm9keVswXSkge1xuICAgICAgICAgICAgZm9ybWF0dGVkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoJGVsLm5leHQoKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgJCgnPHAvPicpLmFwcGVuZChfdGhpcy5lZGl0b3IudXRpbC5waEJyKS5pbnNlcnRBZnRlcigkZWwpO1xuICAgICAgICAgICAgICBmb3JtYXR0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCRlbC5wcmV2KCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICQoJzxwLz4nKS5hcHBlbmQoX3RoaXMuZWRpdG9yLnV0aWwucGhCcikuaW5zZXJ0QmVmb3JlKCRlbCk7XG4gICAgICAgICAgICAgIGZvcm1hdHRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZm9ybWF0dGVkKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy50aHJvdHRsZWRWYWx1ZUNoYW5nZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBfdGhpcy5lZGl0b3IuYm9keS5maW5kKCdwcmU6ZW1wdHknKS5hcHBlbmQoX3RoaXMuZWRpdG9yLnV0aWwucGhCcik7XG4gICAgICAgIGlmICghX3RoaXMuZWRpdG9yLnV0aWwuc3VwcG9ydC5vbnNlbGVjdGlvbmNoYW5nZSAmJiBfdGhpcy5mb2N1c2VkKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnRocm90dGxlZFNlbGVjdGlvbkNoYW5nZWQoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy5lZGl0b3IuYm9keS5vbigna2V5ZG93bicsICQucHJveHkodGhpcy5fb25LZXlEb3duLCB0aGlzKSkub24oJ2tleXByZXNzJywgJC5wcm94eSh0aGlzLl9vbktleVByZXNzLCB0aGlzKSkub24oJ2tleXVwJywgJC5wcm94eSh0aGlzLl9vbktleVVwLCB0aGlzKSkub24oJ21vdXNldXAnLCAkLnByb3h5KHRoaXMuX29uTW91c2VVcCwgdGhpcykpLm9uKCdmb2N1cycsICQucHJveHkodGhpcy5fb25Gb2N1cywgdGhpcykpLm9uKCdibHVyJywgJC5wcm94eSh0aGlzLl9vbkJsdXIsIHRoaXMpKS5vbigncGFzdGUnLCAkLnByb3h5KHRoaXMuX29uUGFzdGUsIHRoaXMpKS5vbignZHJvcCcsICQucHJveHkodGhpcy5fb25Ecm9wLCB0aGlzKSkub24oJ2lucHV0JywgJC5wcm94eSh0aGlzLl9vbklucHV0LCB0aGlzKSk7XG4gICAgaWYgKHRoaXMuZWRpdG9yLnV0aWwuYnJvd3Nlci5maXJlZm94KSB7XG4gICAgICB0aGlzLmFkZFNob3J0Y3V0KCdjbWQrbGVmdCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLl9zZWxlY3Rpb24ubW9kaWZ5KCdtb3ZlJywgJ2JhY2t3YXJkJywgJ2xpbmVib3VuZGFyeScpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMuYWRkU2hvcnRjdXQoJ2NtZCtyaWdodCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLl9zZWxlY3Rpb24ubW9kaWZ5KCdtb3ZlJywgJ2ZvcndhcmQnLCAnbGluZWJvdW5kYXJ5Jyk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgdGhpcy5hZGRTaG9ydGN1dCgodGhpcy5lZGl0b3IudXRpbC5vcy5tYWMgPyAnY21kK2EnIDogJ2N0cmwrYScpLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICB2YXIgJGNoaWxkcmVuLCBmaXJzdEJsb2NrLCBsYXN0QmxvY2ssIHJhbmdlO1xuICAgICAgICAgICRjaGlsZHJlbiA9IF90aGlzLmVkaXRvci5ib2R5LmNoaWxkcmVuKCk7XG4gICAgICAgICAgaWYgKCEoJGNoaWxkcmVuLmxlbmd0aCA+IDApKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpcnN0QmxvY2sgPSAkY2hpbGRyZW4uZmlyc3QoKS5nZXQoMCk7XG4gICAgICAgICAgbGFzdEJsb2NrID0gJGNoaWxkcmVuLmxhc3QoKS5nZXQoMCk7XG4gICAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAgIHJhbmdlLnNldFN0YXJ0KGZpcnN0QmxvY2ssIDApO1xuICAgICAgICAgIHJhbmdlLnNldEVuZChsYXN0QmxvY2ssIF90aGlzLmVkaXRvci51dGlsLmdldE5vZGVMZW5ndGgobGFzdEJsb2NrKSk7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZShyYW5nZSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH1cbiAgICBzdWJtaXRLZXkgPSB0aGlzLmVkaXRvci51dGlsLm9zLm1hYyA/ICdjbWQrZW50ZXInIDogJ2N0cmwrZW50ZXInO1xuICAgIHRoaXMuYWRkU2hvcnRjdXQoc3VibWl0S2V5LCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIF90aGlzLmVkaXRvci5lbC5jbG9zZXN0KCdmb3JtJykuZmluZCgnYnV0dG9uOnN1Ym1pdCcpLmNsaWNrKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIGlmICh0aGlzLmVkaXRvci50ZXh0YXJlYS5hdHRyKCdhdXRvZm9jdXMnKSkge1xuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuZWRpdG9yLmZvY3VzKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSwgMCk7XG4gICAgfVxuICB9O1xuXG4gIElucHV0TWFuYWdlci5wcm90b3R5cGUuX29uRm9jdXMgPSBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5lZGl0b3IuZWwuYWRkQ2xhc3MoJ2ZvY3VzJykucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XG4gICAgdGhpcy5mb2N1c2VkID0gdHJ1ZTtcbiAgICB0aGlzLmxhc3RDYXJldFBvc2l0aW9uID0gbnVsbDtcbiAgICByZXR1cm4gc2V0VGltZW91dCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuZWRpdG9yLnRyaWdnZXJIYW5kbGVyKCdmb2N1cycpO1xuICAgICAgICBpZiAoIV90aGlzLmVkaXRvci51dGlsLnN1cHBvcnQub25zZWxlY3Rpb25jaGFuZ2UpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMudGhyb3R0bGVkU2VsZWN0aW9uQ2hhbmdlZCgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpLCAwKTtcbiAgfTtcblxuICBJbnB1dE1hbmFnZXIucHJvdG90eXBlLl9vbkJsdXIgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHJlZjtcbiAgICB0aGlzLmVkaXRvci5lbC5yZW1vdmVDbGFzcygnZm9jdXMnKTtcbiAgICB0aGlzLmVkaXRvci5zeW5jKCk7XG4gICAgdGhpcy5mb2N1c2VkID0gZmFsc2U7XG4gICAgdGhpcy5sYXN0Q2FyZXRQb3NpdGlvbiA9IChyZWYgPSB0aGlzLmVkaXRvci51bmRvTWFuYWdlci5jdXJyZW50U3RhdGUoKSkgIT0gbnVsbCA/IHJlZi5jYXJldCA6IHZvaWQgMDtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IudHJpZ2dlckhhbmRsZXIoJ2JsdXInKTtcbiAgfTtcblxuICBJbnB1dE1hbmFnZXIucHJvdG90eXBlLl9vbk1vdXNlVXAgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCF0aGlzLmVkaXRvci51dGlsLnN1cHBvcnQub25zZWxlY3Rpb25jaGFuZ2UpIHtcbiAgICAgIHJldHVybiB0aGlzLnRocm90dGxlZFNlbGVjdGlvbkNoYW5nZWQoKTtcbiAgICB9XG4gIH07XG5cbiAgSW5wdXRNYW5hZ2VyLnByb3RvdHlwZS5fb25LZXlEb3duID0gZnVuY3Rpb24oZSkge1xuICAgIHZhciBiYXNlLCByZWYsIHJlZjEsIHJlc3VsdDtcbiAgICBpZiAodGhpcy5lZGl0b3IudHJpZ2dlckhhbmRsZXIoZSkgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0aGlzLmhvdGtleXMucmVzcG9uZFRvKGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChlLndoaWNoIGluIHRoaXMuX2tleXN0cm9rZUhhbmRsZXJzKSB7XG4gICAgICByZXN1bHQgPSB0eXBlb2YgKGJhc2UgPSB0aGlzLl9rZXlzdHJva2VIYW5kbGVyc1tlLndoaWNoXSlbJyonXSA9PT0gXCJmdW5jdGlvblwiID8gYmFzZVsnKiddKGUpIDogdm9pZCAwO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICB0aGlzLnRocm90dGxlZFZhbHVlQ2hhbmdlZCgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc3RhcnROb2RlcygpLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBub2RlKSB7XG4gICAgICAgICAgdmFyIGhhbmRsZXIsIHJlZjtcbiAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSAhPT0gTm9kZS5FTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaGFuZGxlciA9IChyZWYgPSBfdGhpcy5fa2V5c3Ryb2tlSGFuZGxlcnNbZS53aGljaF0pICE9IG51bGwgPyByZWZbbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCldIDogdm9pZCAwO1xuICAgICAgICAgIHJlc3VsdCA9IHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIgPyBoYW5kbGVyKGUsICQobm9kZSkpIDogdm9pZCAwO1xuICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRydWUgfHwgcmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgdGhpcy50aHJvdHRsZWRWYWx1ZUNoYW5nZWQoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoKHJlZiA9IGUud2hpY2gsIGluZGV4T2YuY2FsbCh0aGlzLl9tb2RpZmllcktleXMsIHJlZikgPj0gMCkgfHwgKHJlZjEgPSBlLndoaWNoLCBpbmRleE9mLmNhbGwodGhpcy5fYXJyb3dLZXlzLCByZWYxKSA+PSAwKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5lZGl0b3IudXRpbC5tZXRhS2V5KGUpICYmIGUud2hpY2ggPT09IDg2KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghdGhpcy5lZGl0b3IudXRpbC5zdXBwb3J0Lm9uaW5wdXQpIHtcbiAgICAgIHRoaXMudGhyb3R0bGVkVmFsdWVDaGFuZ2VkKFsndHlwaW5nJ10pO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcblxuICBJbnB1dE1hbmFnZXIucHJvdG90eXBlLl9vbktleVByZXNzID0gZnVuY3Rpb24oZSkge1xuICAgIGlmICh0aGlzLmVkaXRvci50cmlnZ2VySGFuZGxlcihlKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgSW5wdXRNYW5hZ2VyLnByb3RvdHlwZS5fb25LZXlVcCA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgcCwgcmVmO1xuICAgIGlmICh0aGlzLmVkaXRvci50cmlnZ2VySGFuZGxlcihlKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmVkaXRvci51dGlsLnN1cHBvcnQub25zZWxlY3Rpb25jaGFuZ2UgJiYgKHJlZiA9IGUud2hpY2gsIGluZGV4T2YuY2FsbCh0aGlzLl9hcnJvd0tleXMsIHJlZikgPj0gMCkpIHtcbiAgICAgIHRoaXMudGhyb3R0bGVkVmFsdWVDaGFuZ2VkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICgoZS53aGljaCA9PT0gOCB8fCBlLndoaWNoID09PSA0NikgJiYgdGhpcy5lZGl0b3IudXRpbC5pc0VtcHR5Tm9kZSh0aGlzLmVkaXRvci5ib2R5KSkge1xuICAgICAgdGhpcy5lZGl0b3IuYm9keS5lbXB0eSgpO1xuICAgICAgcCA9ICQoJzxwLz4nKS5hcHBlbmQodGhpcy5lZGl0b3IudXRpbC5waEJyKS5hcHBlbmRUbyh0aGlzLmVkaXRvci5ib2R5KTtcbiAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUF0U3RhcnRPZihwKTtcbiAgICB9XG4gIH07XG5cbiAgSW5wdXRNYW5hZ2VyLnByb3RvdHlwZS5fb25QYXN0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgJGJsb2NrRWwsIGNsZWFuUGFzdGUsIGltYWdlRmlsZSwgcGFzdGVDb250ZW50LCBwYXN0ZUl0ZW0sIHByb2Nlc3NQYXN0ZUNvbnRlbnQsIHJhbmdlLCByZWYsIHVwbG9hZE9wdDtcbiAgICBpZiAodGhpcy5lZGl0b3IudHJpZ2dlckhhbmRsZXIoZSkgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJhbmdlID0gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLmRlbGV0ZVJhbmdlQ29udGVudHMoKTtcbiAgICBpZiAoIXJhbmdlLmNvbGxhcHNlZCkge1xuICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG4gICAgfVxuICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZShyYW5nZSk7XG4gICAgJGJsb2NrRWwgPSB0aGlzLmVkaXRvci5zZWxlY3Rpb24uYmxvY2tOb2RlcygpLmxhc3QoKTtcbiAgICBjbGVhblBhc3RlID0gJGJsb2NrRWwuaXMoJ3ByZSwgdGFibGUnKTtcbiAgICBpZiAoZS5vcmlnaW5hbEV2ZW50LmNsaXBib2FyZERhdGEgJiYgZS5vcmlnaW5hbEV2ZW50LmNsaXBib2FyZERhdGEuaXRlbXMgJiYgZS5vcmlnaW5hbEV2ZW50LmNsaXBib2FyZERhdGEuaXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgcGFzdGVJdGVtID0gZS5vcmlnaW5hbEV2ZW50LmNsaXBib2FyZERhdGEuaXRlbXNbMF07XG4gICAgICBpZiAoL15pbWFnZVxcLy8udGVzdChwYXN0ZUl0ZW0udHlwZSkgJiYgIWNsZWFuUGFzdGUpIHtcbiAgICAgICAgaW1hZ2VGaWxlID0gcGFzdGVJdGVtLmdldEFzRmlsZSgpO1xuICAgICAgICBpZiAoISgoaW1hZ2VGaWxlICE9IG51bGwpICYmIHRoaXMub3B0cy5wYXN0ZUltYWdlKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWltYWdlRmlsZS5uYW1lKSB7XG4gICAgICAgICAgaW1hZ2VGaWxlLm5hbWUgPSBcIkNsaXBib2FyZCBJbWFnZS5wbmdcIjtcbiAgICAgICAgfVxuICAgICAgICB1cGxvYWRPcHQgPSB7fTtcbiAgICAgICAgdXBsb2FkT3B0W3RoaXMub3B0cy5wYXN0ZUltYWdlXSA9IHRydWU7XG4gICAgICAgIGlmICgocmVmID0gdGhpcy5lZGl0b3IudXBsb2FkZXIpICE9IG51bGwpIHtcbiAgICAgICAgICByZWYudXBsb2FkKGltYWdlRmlsZSwgdXBsb2FkT3B0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHByb2Nlc3NQYXN0ZUNvbnRlbnQgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihwYXN0ZUNvbnRlbnQpIHtcbiAgICAgICAgdmFyICRpbWcsIGJsb2IsIGNoaWxkcmVuLCBpbnNlcnRQb3NpdGlvbiwgaywgbCwgbGFzdExpbmUsIGxlbiwgbGVuMSwgbGVuMiwgbGVuMywgbGVuNCwgbGluZSwgbGluZXMsIG0sIG5vZGUsIG8sIHEsIHJlZjEsIHJlZjIsIHJlZjM7XG4gICAgICAgIGlmIChfdGhpcy5lZGl0b3IudHJpZ2dlckhhbmRsZXIoJ3Bhc3RpbmcnLCBbcGFzdGVDb250ZW50XSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGFzdGVDb250ZW50KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGNsZWFuUGFzdGUpIHtcbiAgICAgICAgICBpZiAoJGJsb2NrRWwuaXMoJ3RhYmxlJykpIHtcbiAgICAgICAgICAgIGxpbmVzID0gcGFzdGVDb250ZW50LnNwbGl0KCdcXG4nKTtcbiAgICAgICAgICAgIGxhc3RMaW5lID0gbGluZXMucG9wKCk7XG4gICAgICAgICAgICBmb3IgKGsgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICAgICAgICBsaW5lID0gbGluZXNba107XG4gICAgICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uaW5zZXJ0Tm9kZShkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShsaW5lKSk7XG4gICAgICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uaW5zZXJ0Tm9kZSgkKCc8YnIvPicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uaW5zZXJ0Tm9kZShkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShsYXN0TGluZSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXN0ZUNvbnRlbnQgPSAkKCc8ZGl2Lz4nKS50ZXh0KHBhc3RlQ29udGVudCk7XG4gICAgICAgICAgICByZWYxID0gcGFzdGVDb250ZW50LmNvbnRlbnRzKCk7XG4gICAgICAgICAgICBmb3IgKGwgPSAwLCBsZW4xID0gcmVmMS5sZW5ndGg7IGwgPCBsZW4xOyBsKyspIHtcbiAgICAgICAgICAgICAgbm9kZSA9IHJlZjFbbF07XG4gICAgICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uaW5zZXJ0Tm9kZSgkKG5vZGUpWzBdLCByYW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCRibG9ja0VsLmlzKF90aGlzLmVkaXRvci5ib2R5KSkge1xuICAgICAgICAgIGZvciAobSA9IDAsIGxlbjIgPSBwYXN0ZUNvbnRlbnQubGVuZ3RoOyBtIDwgbGVuMjsgbSsrKSB7XG4gICAgICAgICAgICBub2RlID0gcGFzdGVDb250ZW50W21dO1xuICAgICAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5pbnNlcnROb2RlKG5vZGUsIHJhbmdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGFzdGVDb250ZW50Lmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAocGFzdGVDb250ZW50Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIGlmIChwYXN0ZUNvbnRlbnQuaXMoJ3AnKSkge1xuICAgICAgICAgICAgY2hpbGRyZW4gPSBwYXN0ZUNvbnRlbnQuY29udGVudHMoKTtcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPT09IDEgJiYgY2hpbGRyZW4uaXMoJ2ltZycpKSB7XG4gICAgICAgICAgICAgICRpbWcgPSBjaGlsZHJlbjtcbiAgICAgICAgICAgICAgaWYgKC9eZGF0YTppbWFnZS8udGVzdCgkaW1nLmF0dHIoJ3NyYycpKSkge1xuICAgICAgICAgICAgICAgIGlmICghX3RoaXMub3B0cy5wYXN0ZUltYWdlKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJsb2IgPSBfdGhpcy5lZGl0b3IudXRpbC5kYXRhVVJMdG9CbG9iKCRpbWcuYXR0cihcInNyY1wiKSk7XG4gICAgICAgICAgICAgICAgYmxvYi5uYW1lID0gXCJDbGlwYm9hcmQgSW1hZ2UucG5nXCI7XG4gICAgICAgICAgICAgICAgdXBsb2FkT3B0ID0ge307XG4gICAgICAgICAgICAgICAgdXBsb2FkT3B0W190aGlzLm9wdHMucGFzdGVJbWFnZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICgocmVmMiA9IF90aGlzLmVkaXRvci51cGxvYWRlcikgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgcmVmMi51cGxvYWQoYmxvYiwgdXBsb2FkT3B0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCRpbWcuaXMoJ2ltZ1tzcmNePVwid2Via2l0LWZha2UtdXJsOi8vXCJdJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobyA9IDAsIGxlbjMgPSBjaGlsZHJlbi5sZW5ndGg7IG8gPCBsZW4zOyBvKyspIHtcbiAgICAgICAgICAgICAgbm9kZSA9IGNoaWxkcmVuW29dO1xuICAgICAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLmluc2VydE5vZGUobm9kZSwgcmFuZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoJGJsb2NrRWwuaXMoJ3AnKSAmJiBfdGhpcy5lZGl0b3IudXRpbC5pc0VtcHR5Tm9kZSgkYmxvY2tFbCkpIHtcbiAgICAgICAgICAgICRibG9ja0VsLnJlcGxhY2VXaXRoKHBhc3RlQ29udGVudCk7XG4gICAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnNldFJhbmdlQXRFbmRPZihwYXN0ZUNvbnRlbnQsIHJhbmdlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHBhc3RlQ29udGVudC5pcygndWwsIG9sJykpIHtcbiAgICAgICAgICAgIGlmIChwYXN0ZUNvbnRlbnQuZmluZCgnbGknKS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgcGFzdGVDb250ZW50ID0gJCgnPGRpdi8+JykudGV4dChwYXN0ZUNvbnRlbnQudGV4dCgpKTtcbiAgICAgICAgICAgICAgcmVmMyA9IHBhc3RlQ29udGVudC5jb250ZW50cygpO1xuICAgICAgICAgICAgICBmb3IgKHEgPSAwLCBsZW40ID0gcmVmMy5sZW5ndGg7IHEgPCBsZW40OyBxKyspIHtcbiAgICAgICAgICAgICAgICBub2RlID0gcmVmM1txXTtcbiAgICAgICAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLmluc2VydE5vZGUoJChub2RlKVswXSwgcmFuZ2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCRibG9ja0VsLmlzKCdsaScpKSB7XG4gICAgICAgICAgICAgICRibG9ja0VsLnBhcmVudCgpLmFmdGVyKHBhc3RlQ29udGVudCk7XG4gICAgICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VBdEVuZE9mKHBhc3RlQ29udGVudCwgcmFuZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgJGJsb2NrRWwuYWZ0ZXIocGFzdGVDb250ZW50KTtcbiAgICAgICAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUF0RW5kT2YocGFzdGVDb250ZW50LCByYW5nZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRibG9ja0VsLmFmdGVyKHBhc3RlQ29udGVudCk7XG4gICAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnNldFJhbmdlQXRFbmRPZihwYXN0ZUNvbnRlbnQsIHJhbmdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCRibG9ja0VsLmlzKCdsaScpKSB7XG4gICAgICAgICAgICAkYmxvY2tFbCA9ICRibG9ja0VsLnBhcmVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZUF0U3RhcnRPZigkYmxvY2tFbCwgcmFuZ2UpKSB7XG4gICAgICAgICAgICBpbnNlcnRQb3NpdGlvbiA9ICdiZWZvcmUnO1xuICAgICAgICAgIH0gZWxzZSBpZiAoX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZUF0RW5kT2YoJGJsb2NrRWwsIHJhbmdlKSkge1xuICAgICAgICAgICAgaW5zZXJ0UG9zaXRpb24gPSAnYWZ0ZXInO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLmJyZWFrQmxvY2tFbCgkYmxvY2tFbCwgcmFuZ2UpO1xuICAgICAgICAgICAgaW5zZXJ0UG9zaXRpb24gPSAnYmVmb3JlJztcbiAgICAgICAgICB9XG4gICAgICAgICAgJGJsb2NrRWxbaW5zZXJ0UG9zaXRpb25dKHBhc3RlQ29udGVudCk7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUF0RW5kT2YocGFzdGVDb250ZW50Lmxhc3QoKSwgcmFuZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcy50aHJvdHRsZWRWYWx1ZUNoYW5nZWQoKTtcbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gICAgaWYgKGNsZWFuUGFzdGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmICh0aGlzLmVkaXRvci51dGlsLmJyb3dzZXIubXNpZSkge1xuICAgICAgICBwYXN0ZUNvbnRlbnQgPSB3aW5kb3cuY2xpcGJvYXJkRGF0YS5nZXREYXRhKCdUZXh0Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXN0ZUNvbnRlbnQgPSBlLm9yaWdpbmFsRXZlbnQuY2xpcGJvYXJkRGF0YS5nZXREYXRhKCd0ZXh0L3BsYWluJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvY2Vzc1Bhc3RlQ29udGVudChwYXN0ZUNvbnRlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc2F2ZShyYW5nZSk7XG4gICAgICB0aGlzLl9wYXN0ZUFyZWEuZm9jdXMoKTtcbiAgICAgIGlmICh0aGlzLmVkaXRvci51dGlsLmJyb3dzZXIubXNpZSAmJiB0aGlzLmVkaXRvci51dGlsLmJyb3dzZXIudmVyc2lvbiA9PT0gMTApIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLl9wYXN0ZUFyZWEuaHRtbCh3aW5kb3cuY2xpcGJvYXJkRGF0YS5nZXREYXRhKCdUZXh0JykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoX3RoaXMuX3Bhc3RlQXJlYS5pcygnOmVtcHR5JykpIHtcbiAgICAgICAgICAgIHBhc3RlQ29udGVudCA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhc3RlQ29udGVudCA9ICQoJzxkaXYvPicpLmFwcGVuZChfdGhpcy5fcGFzdGVBcmVhLmNvbnRlbnRzKCkpO1xuICAgICAgICAgICAgcGFzdGVDb250ZW50LmZpbmQoJ3RhYmxlIGNvbGdyb3VwJykucmVtb3ZlKCk7XG4gICAgICAgICAgICBfdGhpcy5lZGl0b3IuZm9ybWF0dGVyLmZvcm1hdChwYXN0ZUNvbnRlbnQpO1xuICAgICAgICAgICAgX3RoaXMuZWRpdG9yLmZvcm1hdHRlci5kZWNvcmF0ZShwYXN0ZUNvbnRlbnQpO1xuICAgICAgICAgICAgX3RoaXMuZWRpdG9yLmZvcm1hdHRlci5iZWF1dGlmeShwYXN0ZUNvbnRlbnQuY2hpbGRyZW4oKSk7XG4gICAgICAgICAgICBwYXN0ZUNvbnRlbnQgPSBwYXN0ZUNvbnRlbnQuY29udGVudHMoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3RoaXMuX3Bhc3RlQXJlYS5lbXB0eSgpO1xuICAgICAgICAgIHJhbmdlID0gX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yZXN0b3JlKCk7XG4gICAgICAgICAgcmV0dXJuIHByb2Nlc3NQYXN0ZUNvbnRlbnQocGFzdGVDb250ZW50KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpLCAxMCk7XG4gICAgfVxuICB9O1xuXG4gIElucHV0TWFuYWdlci5wcm90b3R5cGUuX29uRHJvcCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAodGhpcy5lZGl0b3IudHJpZ2dlckhhbmRsZXIoZSkgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRocm90dGxlZFZhbHVlQ2hhbmdlZCgpO1xuICB9O1xuXG4gIElucHV0TWFuYWdlci5wcm90b3R5cGUuX29uSW5wdXQgPSBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIHRoaXMudGhyb3R0bGVkVmFsdWVDaGFuZ2VkKFsnb25pbnB1dCddKTtcbiAgfTtcblxuICBJbnB1dE1hbmFnZXIucHJvdG90eXBlLmFkZEtleXN0cm9rZUhhbmRsZXIgPSBmdW5jdGlvbihrZXksIG5vZGUsIGhhbmRsZXIpIHtcbiAgICBpZiAoIXRoaXMuX2tleXN0cm9rZUhhbmRsZXJzW2tleV0pIHtcbiAgICAgIHRoaXMuX2tleXN0cm9rZUhhbmRsZXJzW2tleV0gPSB7fTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2tleXN0cm9rZUhhbmRsZXJzW2tleV1bbm9kZV0gPSBoYW5kbGVyO1xuICB9O1xuXG4gIElucHV0TWFuYWdlci5wcm90b3R5cGUuYWRkU2hvcnRjdXQgPSBmdW5jdGlvbihrZXlzLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuaG90a2V5cy5hZGQoa2V5cywgJC5wcm94eShoYW5kbGVyLCB0aGlzKSk7XG4gIH07XG5cbiAgcmV0dXJuIElucHV0TWFuYWdlcjtcblxufSkoU2ltcGxlTW9kdWxlKTtcblxuS2V5c3Ryb2tlID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKEtleXN0cm9rZSwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gS2V5c3Ryb2tlKCkge1xuICAgIHJldHVybiBLZXlzdHJva2UuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBLZXlzdHJva2UucGx1Z2luTmFtZSA9ICdLZXlzdHJva2UnO1xuXG4gIEtleXN0cm9rZS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGl0bGVFbnRlckhhbmRsZXI7XG4gICAgdGhpcy5lZGl0b3IgPSB0aGlzLl9tb2R1bGU7XG4gICAgaWYgKHRoaXMuZWRpdG9yLnV0aWwuYnJvd3Nlci5zYWZhcmkpIHtcbiAgICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRLZXlzdHJva2VIYW5kbGVyKCcxMycsICcqJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgdmFyICRibG9ja0VsLCAkYnI7XG4gICAgICAgICAgaWYgKCFlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgICRibG9ja0VsID0gX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5ibG9ja05vZGVzKCkubGFzdCgpO1xuICAgICAgICAgIGlmICgkYmxvY2tFbC5pcygncHJlJykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgJGJyID0gJCgnPGJyLz4nKTtcbiAgICAgICAgICBpZiAoX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZUF0RW5kT2YoJGJsb2NrRWwpKSB7XG4gICAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLmluc2VydE5vZGUoJGJyKTtcbiAgICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uaW5zZXJ0Tm9kZSgkKCc8YnIvPicpKTtcbiAgICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VCZWZvcmUoJGJyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5pbnNlcnROb2RlKCRicik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH1cbiAgICBpZiAodGhpcy5lZGl0b3IudXRpbC5icm93c2VyLndlYmtpdCB8fCB0aGlzLmVkaXRvci51dGlsLmJyb3dzZXIubXNpZSkge1xuICAgICAgdGl0bGVFbnRlckhhbmRsZXIgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsICRub2RlKSB7XG4gICAgICAgICAgdmFyICRwO1xuICAgICAgICAgIGlmICghX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZUF0RW5kT2YoJG5vZGUpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgICRwID0gJCgnPHAvPicpLmFwcGVuZChfdGhpcy5lZGl0b3IudXRpbC5waEJyKS5pbnNlcnRBZnRlcigkbm9kZSk7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUF0U3RhcnRPZigkcCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRLZXlzdHJva2VIYW5kbGVyKCcxMycsICdoMScsIHRpdGxlRW50ZXJIYW5kbGVyKTtcbiAgICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRLZXlzdHJva2VIYW5kbGVyKCcxMycsICdoMicsIHRpdGxlRW50ZXJIYW5kbGVyKTtcbiAgICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRLZXlzdHJva2VIYW5kbGVyKCcxMycsICdoMycsIHRpdGxlRW50ZXJIYW5kbGVyKTtcbiAgICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRLZXlzdHJva2VIYW5kbGVyKCcxMycsICdoNCcsIHRpdGxlRW50ZXJIYW5kbGVyKTtcbiAgICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRLZXlzdHJva2VIYW5kbGVyKCcxMycsICdoNScsIHRpdGxlRW50ZXJIYW5kbGVyKTtcbiAgICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRLZXlzdHJva2VIYW5kbGVyKCcxMycsICdoNicsIHRpdGxlRW50ZXJIYW5kbGVyKTtcbiAgICB9XG4gICAgdGhpcy5lZGl0b3IuaW5wdXRNYW5hZ2VyLmFkZEtleXN0cm9rZUhhbmRsZXIoJzgnLCAnKicsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRibG9ja0VsLCAkcHJldkJsb2NrRWwsICRyb290QmxvY2ssIGlzV2Via2l0O1xuICAgICAgICAkcm9vdEJsb2NrID0gX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yb290Tm9kZXMoKS5maXJzdCgpO1xuICAgICAgICAkcHJldkJsb2NrRWwgPSAkcm9vdEJsb2NrLnByZXYoKTtcbiAgICAgICAgaWYgKCRwcmV2QmxvY2tFbC5pcygnaHInKSAmJiBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJhbmdlQXRTdGFydE9mKCRyb290QmxvY2spKSB7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5zYXZlKCk7XG4gICAgICAgICAgJHByZXZCbG9ja0VsLnJlbW92ZSgpO1xuICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24ucmVzdG9yZSgpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgICRibG9ja0VsID0gX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5ibG9ja05vZGVzKCkubGFzdCgpO1xuICAgICAgICBpc1dlYmtpdCA9IF90aGlzLmVkaXRvci51dGlsLmJyb3dzZXIud2Via2l0O1xuICAgICAgICBpZiAoaXNXZWJraXQgJiYgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZUF0U3RhcnRPZigkYmxvY2tFbCkpIHtcbiAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnNhdmUoKTtcbiAgICAgICAgICBfdGhpcy5lZGl0b3IuZm9ybWF0dGVyLmNsZWFuTm9kZSgkYmxvY2tFbCwgdHJ1ZSk7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yZXN0b3JlKCk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRLZXlzdHJva2VIYW5kbGVyKCcxMycsICdsaScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsICRub2RlKSB7XG4gICAgICAgIHZhciAkY2xvbmVOb2RlLCBsaXN0RWwsIG5ld0Jsb2NrRWwsIG5ld0xpc3RFbDtcbiAgICAgICAgJGNsb25lTm9kZSA9ICRub2RlLmNsb25lKCk7XG4gICAgICAgICRjbG9uZU5vZGUuZmluZCgndWwsIG9sJykucmVtb3ZlKCk7XG4gICAgICAgIGlmICghKF90aGlzLmVkaXRvci51dGlsLmlzRW1wdHlOb2RlKCRjbG9uZU5vZGUpICYmICRub2RlLmlzKF90aGlzLmVkaXRvci5zZWxlY3Rpb24uYmxvY2tOb2RlcygpLmxhc3QoKSkpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxpc3RFbCA9ICRub2RlLnBhcmVudCgpO1xuICAgICAgICBpZiAoJG5vZGUubmV4dCgnbGknKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgaWYgKCFfdGhpcy5lZGl0b3IudXRpbC5pc0VtcHR5Tm9kZSgkbm9kZSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGxpc3RFbC5wYXJlbnQoJ2xpJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbmV3QmxvY2tFbCA9ICQoJzxsaS8+JykuYXBwZW5kKF90aGlzLmVkaXRvci51dGlsLnBoQnIpLmluc2VydEFmdGVyKGxpc3RFbC5wYXJlbnQoJ2xpJykpO1xuICAgICAgICAgICAgbmV3TGlzdEVsID0gJCgnPCcgKyBsaXN0RWxbMF0udGFnTmFtZSArICcvPicpLmFwcGVuZCgkbm9kZS5uZXh0QWxsKCdsaScpKTtcbiAgICAgICAgICAgIG5ld0Jsb2NrRWwuYXBwZW5kKG5ld0xpc3RFbCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld0Jsb2NrRWwgPSAkKCc8cC8+JykuYXBwZW5kKF90aGlzLmVkaXRvci51dGlsLnBoQnIpLmluc2VydEFmdGVyKGxpc3RFbCk7XG4gICAgICAgICAgICBuZXdMaXN0RWwgPSAkKCc8JyArIGxpc3RFbFswXS50YWdOYW1lICsgJy8+JykuYXBwZW5kKCRub2RlLm5leHRBbGwoJ2xpJykpO1xuICAgICAgICAgICAgbmV3QmxvY2tFbC5hZnRlcihuZXdMaXN0RWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAobGlzdEVsLnBhcmVudCgnbGknKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBuZXdCbG9ja0VsID0gJCgnPGxpLz4nKS5pbnNlcnRBZnRlcihsaXN0RWwucGFyZW50KCdsaScpKTtcbiAgICAgICAgICAgIGlmICgkbm9kZS5jb250ZW50cygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgbmV3QmxvY2tFbC5hcHBlbmQoJG5vZGUuY29udGVudHMoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdCbG9ja0VsLmFwcGVuZChfdGhpcy5lZGl0b3IudXRpbC5waEJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3QmxvY2tFbCA9ICQoJzxwLz4nKS5hcHBlbmQoX3RoaXMuZWRpdG9yLnV0aWwucGhCcikuaW5zZXJ0QWZ0ZXIobGlzdEVsKTtcbiAgICAgICAgICAgIGlmICgkbm9kZS5jaGlsZHJlbigndWwsIG9sJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBuZXdCbG9ja0VsLmFmdGVyKCRub2RlLmNoaWxkcmVuKCd1bCwgb2wnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICgkbm9kZS5wcmV2KCdsaScpLmxlbmd0aCkge1xuICAgICAgICAgICRub2RlLnJlbW92ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpc3RFbC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnNldFJhbmdlQXRTdGFydE9mKG5ld0Jsb2NrRWwpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRLZXlzdHJva2VIYW5kbGVyKCcxMycsICdwcmUnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlLCAkbm9kZSkge1xuICAgICAgICB2YXIgJHAsIGJyZWFrTm9kZSwgcmFuZ2U7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKGUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAkcCA9ICQoJzxwLz4nKS5hcHBlbmQoX3RoaXMuZWRpdG9yLnV0aWwucGhCcikuaW5zZXJ0QWZ0ZXIoJG5vZGUpO1xuICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VBdFN0YXJ0T2YoJHApO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJhbmdlID0gX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZSgpO1xuICAgICAgICBicmVha05vZGUgPSBudWxsO1xuICAgICAgICByYW5nZS5kZWxldGVDb250ZW50cygpO1xuICAgICAgICBpZiAoIV90aGlzLmVkaXRvci51dGlsLmJyb3dzZXIubXNpZSAmJiBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJhbmdlQXRFbmRPZigkbm9kZSkpIHtcbiAgICAgICAgICBicmVha05vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnXFxuXFxuJyk7XG4gICAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZShicmVha05vZGUpO1xuICAgICAgICAgIHJhbmdlLnNldEVuZChicmVha05vZGUsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdcXG4nKTtcbiAgICAgICAgICByYW5nZS5pbnNlcnROb2RlKGJyZWFrTm9kZSk7XG4gICAgICAgICAgcmFuZ2Uuc2V0U3RhcnRBZnRlcihicmVha05vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcbiAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZShyYW5nZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy5lZGl0b3IuaW5wdXRNYW5hZ2VyLmFkZEtleXN0cm9rZUhhbmRsZXIoJzEzJywgJ2Jsb2NrcXVvdGUnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlLCAkbm9kZSkge1xuICAgICAgICB2YXIgJGNsb3Nlc3RCbG9jaywgcmFuZ2U7XG4gICAgICAgICRjbG9zZXN0QmxvY2sgPSBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLmJsb2NrTm9kZXMoKS5sYXN0KCk7XG4gICAgICAgIGlmICghKCRjbG9zZXN0QmxvY2suaXMoJ3AnKSAmJiAhJGNsb3Nlc3RCbG9jay5uZXh0KCkubGVuZ3RoICYmIF90aGlzLmVkaXRvci51dGlsLmlzRW1wdHlOb2RlKCRjbG9zZXN0QmxvY2spKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkbm9kZS5hZnRlcigkY2xvc2VzdEJsb2NrKTtcbiAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnNldFJhbmdlQXRTdGFydE9mKCRjbG9zZXN0QmxvY2ssIHJhbmdlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLmVkaXRvci5pbnB1dE1hbmFnZXIuYWRkS2V5c3Ryb2tlSGFuZGxlcignOCcsICdsaScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsICRub2RlKSB7XG4gICAgICAgIHZhciAkYnIsICRjaGlsZExpc3QsICRuZXdMaSwgJHByZXZDaGlsZExpc3QsICRwcmV2Tm9kZSwgJHRleHROb2RlLCBpc0ZGLCByYW5nZSwgdGV4dDtcbiAgICAgICAgJGNoaWxkTGlzdCA9ICRub2RlLmNoaWxkcmVuKCd1bCwgb2wnKTtcbiAgICAgICAgJHByZXZOb2RlID0gJG5vZGUucHJldignbGknKTtcbiAgICAgICAgaWYgKCEoJGNoaWxkTGlzdC5sZW5ndGggPiAwICYmICRwcmV2Tm9kZS5sZW5ndGggPiAwKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0ZXh0ID0gJyc7XG4gICAgICAgICR0ZXh0Tm9kZSA9IG51bGw7XG4gICAgICAgICRub2RlLmNvbnRlbnRzKCkuZWFjaChmdW5jdGlvbihpLCBuKSB7XG4gICAgICAgICAgaWYgKG4ubm9kZVR5cGUgPT09IDEgJiYgL1VMfE9MLy50ZXN0KG4ubm9kZU5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChuLm5vZGVUeXBlID09PSAxICYmIC9CUi8udGVzdChuLm5vZGVOYW1lKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobi5ub2RlVHlwZSA9PT0gMyAmJiBuLm5vZGVWYWx1ZSkge1xuICAgICAgICAgICAgdGV4dCArPSBuLm5vZGVWYWx1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG4ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgIHRleHQgKz0gJChuKS50ZXh0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAkdGV4dE5vZGUgPSAkKG4pO1xuICAgICAgICB9KTtcbiAgICAgICAgaXNGRiA9IF90aGlzLmVkaXRvci51dGlsLmJyb3dzZXIuZmlyZWZveCAmJiAhJHRleHROb2RlLm5leHQoJ2JyJykubGVuZ3RoO1xuICAgICAgICBpZiAoJHRleHROb2RlICYmIHRleHQubGVuZ3RoID09PSAxICYmIGlzRkYpIHtcbiAgICAgICAgICAkYnIgPSAkKF90aGlzLmVkaXRvci51dGlsLnBoQnIpLmluc2VydEFmdGVyKCR0ZXh0Tm9kZSk7XG4gICAgICAgICAgJHRleHROb2RlLnJlbW92ZSgpO1xuICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VCZWZvcmUoJGJyKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAkcHJldkNoaWxkTGlzdCA9ICRwcmV2Tm9kZS5jaGlsZHJlbigndWwsIG9sJyk7XG4gICAgICAgIGlmICgkcHJldkNoaWxkTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgJG5ld0xpID0gJCgnPGxpLz4nKS5hcHBlbmQoX3RoaXMuZWRpdG9yLnV0aWwucGhCcikuYXBwZW5kVG8oJHByZXZDaGlsZExpc3QpO1xuICAgICAgICAgICRwcmV2Q2hpbGRMaXN0LmFwcGVuZCgkY2hpbGRMaXN0LmNoaWxkcmVuKCdsaScpKTtcbiAgICAgICAgICAkbm9kZS5yZW1vdmUoKTtcbiAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnNldFJhbmdlQXRFbmRPZigkbmV3TGksIHJhbmdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnNldFJhbmdlQXRFbmRPZigkcHJldk5vZGUsIHJhbmdlKTtcbiAgICAgICAgICAkcHJldk5vZGUuYXBwZW5kKCRjaGlsZExpc3QpO1xuICAgICAgICAgICRub2RlLnJlbW92ZSgpO1xuICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24ucmFuZ2UocmFuZ2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy5lZGl0b3IuaW5wdXRNYW5hZ2VyLmFkZEtleXN0cm9rZUhhbmRsZXIoJzgnLCAncHJlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSwgJG5vZGUpIHtcbiAgICAgICAgdmFyICRuZXdOb2RlLCBjb2RlU3RyLCByYW5nZTtcbiAgICAgICAgaWYgKCFfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJhbmdlQXRTdGFydE9mKCRub2RlKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb2RlU3RyID0gJG5vZGUuaHRtbCgpLnJlcGxhY2UoJ1xcbicsICc8YnIvPicpIHx8IF90aGlzLmVkaXRvci51dGlsLnBoQnI7XG4gICAgICAgICRuZXdOb2RlID0gJCgnPHAvPicpLmFwcGVuZChjb2RlU3RyKS5pbnNlcnRBZnRlcigkbm9kZSk7XG4gICAgICAgICRub2RlLnJlbW92ZSgpO1xuICAgICAgICByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VBdFN0YXJ0T2YoJG5ld05vZGUsIHJhbmdlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuaW5wdXRNYW5hZ2VyLmFkZEtleXN0cm9rZUhhbmRsZXIoJzgnLCAnYmxvY2txdW90ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsICRub2RlKSB7XG4gICAgICAgIHZhciAkZmlyc3RDaGlsZCwgcmFuZ2U7XG4gICAgICAgIGlmICghX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZUF0U3RhcnRPZigkbm9kZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJGZpcnN0Q2hpbGQgPSAkbm9kZS5jaGlsZHJlbigpLmZpcnN0KCkudW53cmFwKCk7XG4gICAgICAgIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUF0U3RhcnRPZigkZmlyc3RDaGlsZCwgcmFuZ2UpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIHJldHVybiBLZXlzdHJva2U7XG5cbn0pKFNpbXBsZU1vZHVsZSk7XG5cblVuZG9NYW5hZ2VyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKFVuZG9NYW5hZ2VyLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBVbmRvTWFuYWdlcigpIHtcbiAgICByZXR1cm4gVW5kb01hbmFnZXIuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBVbmRvTWFuYWdlci5wbHVnaW5OYW1lID0gJ1VuZG9NYW5hZ2VyJztcblxuICBVbmRvTWFuYWdlci5wcm90b3R5cGUuX2luZGV4ID0gLTE7XG5cbiAgVW5kb01hbmFnZXIucHJvdG90eXBlLl9jYXBhY2l0eSA9IDIwO1xuXG4gIFVuZG9NYW5hZ2VyLnByb3RvdHlwZS5fc3RhcnRQb3NpdGlvbiA9IG51bGw7XG5cbiAgVW5kb01hbmFnZXIucHJvdG90eXBlLl9lbmRQb3NpdGlvbiA9IG51bGw7XG5cbiAgVW5kb01hbmFnZXIucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlZG9TaG9ydGN1dCwgdGhyb3R0bGVkUHVzaFN0YXRlLCB1bmRvU2hvcnRjdXQ7XG4gICAgdGhpcy5lZGl0b3IgPSB0aGlzLl9tb2R1bGU7XG4gICAgdGhpcy5fc3RhY2sgPSBbXTtcbiAgICBpZiAodGhpcy5lZGl0b3IudXRpbC5vcy5tYWMpIHtcbiAgICAgIHVuZG9TaG9ydGN1dCA9ICdjbWQreic7XG4gICAgICByZWRvU2hvcnRjdXQgPSAnc2hpZnQrY21kK3onO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lZGl0b3IudXRpbC5vcy53aW4pIHtcbiAgICAgIHVuZG9TaG9ydGN1dCA9ICdjdHJsK3onO1xuICAgICAgcmVkb1Nob3J0Y3V0ID0gJ2N0cmwreSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVuZG9TaG9ydGN1dCA9ICdjdHJsK3onO1xuICAgICAgcmVkb1Nob3J0Y3V0ID0gJ3NoaWZ0K2N0cmwreic7XG4gICAgfVxuICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRTaG9ydGN1dCh1bmRvU2hvcnRjdXQsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfdGhpcy51bmRvKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRTaG9ydGN1dChyZWRvU2hvcnRjdXQsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfdGhpcy5yZWRvKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRocm90dGxlZFB1c2hTdGF0ZSA9IHRoaXMuZWRpdG9yLnV0aWwudGhyb3R0bGUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5fcHVzaFVuZG9TdGF0ZSgpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSwgNTAwKTtcbiAgICB0aGlzLmVkaXRvci5vbigndmFsdWVjaGFuZ2VkJywgZnVuY3Rpb24oZSwgc3JjKSB7XG4gICAgICBpZiAoc3JjID09PSAndW5kbycgfHwgc3JjID09PSAncmVkbycpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRocm90dGxlZFB1c2hTdGF0ZSgpO1xuICAgIH0pO1xuICAgIHRoaXMuZWRpdG9yLm9uKCdzZWxlY3Rpb25jaGFuZ2VkJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBfdGhpcy5fc3RhcnRQb3NpdGlvbiA9IG51bGw7XG4gICAgICAgIF90aGlzLl9lbmRQb3NpdGlvbiA9IG51bGw7XG4gICAgICAgIHJldHVybiBfdGhpcy51cGRhdGUoKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5vbignYmx1cicsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RoaXMuX3N0YXJ0UG9zaXRpb24gPSBudWxsO1xuICAgICAgICByZXR1cm4gX3RoaXMuX2VuZFBvc2l0aW9uID0gbnVsbDtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIFVuZG9NYW5hZ2VyLnByb3RvdHlwZS5zdGFydFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5fcmFuZ2UpIHtcbiAgICAgIHRoaXMuX3N0YXJ0UG9zaXRpb24gfHwgKHRoaXMuX3N0YXJ0UG9zaXRpb24gPSB0aGlzLl9nZXRQb3NpdGlvbignc3RhcnQnKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9zdGFydFBvc2l0aW9uO1xuICB9O1xuXG4gIFVuZG9NYW5hZ2VyLnByb3RvdHlwZS5lbmRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmVkaXRvci5zZWxlY3Rpb24uX3JhbmdlKSB7XG4gICAgICB0aGlzLl9lbmRQb3NpdGlvbiB8fCAodGhpcy5fZW5kUG9zaXRpb24gPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciByYW5nZTtcbiAgICAgICAgICByYW5nZSA9IF90aGlzLmVkaXRvci5zZWxlY3Rpb24ucmFuZ2UoKTtcbiAgICAgICAgICBpZiAocmFuZ2UuY29sbGFwc2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuX3N0YXJ0UG9zaXRpb247XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfdGhpcy5fZ2V0UG9zaXRpb24oJ2VuZCcpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykoKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbmRQb3NpdGlvbjtcbiAgfTtcblxuICBVbmRvTWFuYWdlci5wcm90b3R5cGUuX3B1c2hVbmRvU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY3VycmVudFN0YXRlLCBodG1sO1xuICAgIGlmICh0aGlzLmVkaXRvci50cmlnZ2VySGFuZGxlcigncHVzaHVuZG9zdGF0ZScpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjdXJyZW50U3RhdGUgPSB0aGlzLmN1cnJlbnRTdGF0ZSgpO1xuICAgIGh0bWwgPSB0aGlzLmVkaXRvci5ib2R5Lmh0bWwoKTtcbiAgICBpZiAoY3VycmVudFN0YXRlICYmIGN1cnJlbnRTdGF0ZS5odG1sID09PSBodG1sKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2luZGV4ICs9IDE7XG4gICAgdGhpcy5fc3RhY2subGVuZ3RoID0gdGhpcy5faW5kZXg7XG4gICAgdGhpcy5fc3RhY2sucHVzaCh7XG4gICAgICBodG1sOiBodG1sLFxuICAgICAgY2FyZXQ6IHRoaXMuY2FyZXRQb3NpdGlvbigpXG4gICAgfSk7XG4gICAgaWYgKHRoaXMuX3N0YWNrLmxlbmd0aCA+IHRoaXMuX2NhcGFjaXR5KSB7XG4gICAgICB0aGlzLl9zdGFjay5zaGlmdCgpO1xuICAgICAgcmV0dXJuIHRoaXMuX2luZGV4IC09IDE7XG4gICAgfVxuICB9O1xuXG4gIFVuZG9NYW5hZ2VyLnByb3RvdHlwZS5jdXJyZW50U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fc3RhY2subGVuZ3RoICYmIHRoaXMuX2luZGV4ID4gLTEpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdGFja1t0aGlzLl9pbmRleF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcblxuICBVbmRvTWFuYWdlci5wcm90b3R5cGUudW5kbyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdGF0ZTtcbiAgICBpZiAodGhpcy5faW5kZXggPCAxIHx8IHRoaXMuX3N0YWNrLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5lZGl0b3IuaGlkZVBvcG92ZXIoKTtcbiAgICB0aGlzLl9pbmRleCAtPSAxO1xuICAgIHN0YXRlID0gdGhpcy5fc3RhY2tbdGhpcy5faW5kZXhdO1xuICAgIHRoaXMuZWRpdG9yLmJvZHkuaHRtbChzdGF0ZS5odG1sKTtcbiAgICB0aGlzLmNhcmV0UG9zaXRpb24oc3RhdGUuY2FyZXQpO1xuICAgIHRoaXMuZWRpdG9yLmJvZHkuZmluZCgnLnNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgdGhpcy5lZGl0b3Iuc3luYygpO1xuICAgIHJldHVybiB0aGlzLmVkaXRvci50cmlnZ2VyKCd2YWx1ZWNoYW5nZWQnLCBbJ3VuZG8nXSk7XG4gIH07XG5cbiAgVW5kb01hbmFnZXIucHJvdG90eXBlLnJlZG8gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhdGU7XG4gICAgaWYgKHRoaXMuX2luZGV4IDwgMCB8fCB0aGlzLl9zdGFjay5sZW5ndGggPCB0aGlzLl9pbmRleCArIDIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5lZGl0b3IuaGlkZVBvcG92ZXIoKTtcbiAgICB0aGlzLl9pbmRleCArPSAxO1xuICAgIHN0YXRlID0gdGhpcy5fc3RhY2tbdGhpcy5faW5kZXhdO1xuICAgIHRoaXMuZWRpdG9yLmJvZHkuaHRtbChzdGF0ZS5odG1sKTtcbiAgICB0aGlzLmNhcmV0UG9zaXRpb24oc3RhdGUuY2FyZXQpO1xuICAgIHRoaXMuZWRpdG9yLmJvZHkuZmluZCgnLnNlbGVjdGVkJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgdGhpcy5lZGl0b3Iuc3luYygpO1xuICAgIHJldHVybiB0aGlzLmVkaXRvci50cmlnZ2VyKCd2YWx1ZWNoYW5nZWQnLCBbJ3JlZG8nXSk7XG4gIH07XG5cbiAgVW5kb01hbmFnZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjdXJyZW50U3RhdGUsIGh0bWw7XG4gICAgaWYgKHRoaXMuX3RpbWVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGN1cnJlbnRTdGF0ZSA9IHRoaXMuY3VycmVudFN0YXRlKCk7XG4gICAgaWYgKCFjdXJyZW50U3RhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaHRtbCA9IHRoaXMuZWRpdG9yLmJvZHkuaHRtbCgpO1xuICAgIGlmIChodG1sICE9PSBjdXJyZW50U3RhdGUuaHRtbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjdXJyZW50U3RhdGUuaHRtbCA9IGh0bWw7XG4gICAgcmV0dXJuIGN1cnJlbnRTdGF0ZS5jYXJldCA9IHRoaXMuY2FyZXRQb3NpdGlvbigpO1xuICB9O1xuXG4gIFVuZG9NYW5hZ2VyLnByb3RvdHlwZS5fZ2V0Tm9kZU9mZnNldCA9IGZ1bmN0aW9uKG5vZGUsIGluZGV4KSB7XG4gICAgdmFyICRwYXJlbnQsIG1lcmdpbmcsIG9mZnNldDtcbiAgICBpZiAoaW5kZXgpIHtcbiAgICAgICRwYXJlbnQgPSAkKG5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkcGFyZW50ID0gJChub2RlKS5wYXJlbnQoKTtcbiAgICB9XG4gICAgb2Zmc2V0ID0gMDtcbiAgICBtZXJnaW5nID0gZmFsc2U7XG4gICAgJHBhcmVudC5jb250ZW50cygpLmVhY2goZnVuY3Rpb24oaSwgY2hpbGQpIHtcbiAgICAgIGlmIChpbmRleCA9PT0gaSB8fCBub2RlID09PSBjaGlsZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgaWYgKCFtZXJnaW5nKSB7XG4gICAgICAgICAgb2Zmc2V0ICs9IDE7XG4gICAgICAgICAgbWVyZ2luZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9mZnNldCArPSAxO1xuICAgICAgICBtZXJnaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9KTtcbiAgICByZXR1cm4gb2Zmc2V0O1xuICB9O1xuXG4gIFVuZG9NYW5hZ2VyLnByb3RvdHlwZS5fZ2V0UG9zaXRpb24gPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgdmFyICRub2Rlcywgbm9kZSwgbm9kZXMsIG9mZnNldCwgcG9zaXRpb24sIHByZXZOb2RlLCByYW5nZTtcbiAgICBpZiAodHlwZSA9PSBudWxsKSB7XG4gICAgICB0eXBlID0gJ3N0YXJ0JztcbiAgICB9XG4gICAgcmFuZ2UgPSB0aGlzLmVkaXRvci5zZWxlY3Rpb24ucmFuZ2UoKTtcbiAgICBvZmZzZXQgPSByYW5nZVt0eXBlICsgXCJPZmZzZXRcIl07XG4gICAgJG5vZGVzID0gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uW3R5cGUgKyBcIk5vZGVzXCJdKCk7XG4gICAgaWYgKChub2RlID0gJG5vZGVzLmZpcnN0KClbMF0pLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSkge1xuICAgICAgcHJldk5vZGUgPSBub2RlLnByZXZpb3VzU2libGluZztcbiAgICAgIHdoaWxlIChwcmV2Tm9kZSAmJiBwcmV2Tm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUpIHtcbiAgICAgICAgbm9kZSA9IHByZXZOb2RlO1xuICAgICAgICBvZmZzZXQgKz0gdGhpcy5lZGl0b3IudXRpbC5nZXROb2RlTGVuZ3RoKHByZXZOb2RlKTtcbiAgICAgICAgcHJldk5vZGUgPSBwcmV2Tm9kZS5wcmV2aW91c1NpYmxpbmc7XG4gICAgICB9XG4gICAgICBub2RlcyA9ICRub2Rlcy5nZXQoKTtcbiAgICAgIG5vZGVzWzBdID0gbm9kZTtcbiAgICAgICRub2RlcyA9ICQobm9kZXMpO1xuICAgIH1cbiAgICBwb3NpdGlvbiA9IFtvZmZzZXRdO1xuICAgICRub2Rlcy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHBvc2l0aW9uLnVuc2hpZnQoX3RoaXMuX2dldE5vZGVPZmZzZXQobm9kZSkpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIHBvc2l0aW9uO1xuICB9O1xuXG4gIFVuZG9NYW5hZ2VyLnByb3RvdHlwZS5fZ2V0Tm9kZUJ5UG9zaXRpb24gPSBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgIHZhciBjaGlsZCwgY2hpbGROb2RlcywgaSwgaywgbGVuLCBub2RlLCBvZmZzZXQsIHJlZjtcbiAgICBub2RlID0gdGhpcy5lZGl0b3IuYm9keVswXTtcbiAgICByZWYgPSBwb3NpdGlvbi5zbGljZSgwLCBwb3NpdGlvbi5sZW5ndGggLSAxKTtcbiAgICBmb3IgKGkgPSBrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgaSA9ICsraykge1xuICAgICAgb2Zmc2V0ID0gcmVmW2ldO1xuICAgICAgY2hpbGROb2RlcyA9IG5vZGUuY2hpbGROb2RlcztcbiAgICAgIGlmIChvZmZzZXQgPiBjaGlsZE5vZGVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgaWYgKGkgPT09IHBvc2l0aW9uLmxlbmd0aCAtIDIgJiYgJChub2RlKS5pcygncHJlJykpIHtcbiAgICAgICAgICBjaGlsZCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICAgICAgICBjaGlsZE5vZGVzID0gbm9kZS5jaGlsZE5vZGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vZGUgPSBudWxsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBub2RlID0gY2hpbGROb2Rlc1tvZmZzZXRdO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfTtcblxuICBVbmRvTWFuYWdlci5wcm90b3R5cGUuY2FyZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKGNhcmV0KSB7XG4gICAgdmFyIGVuZENvbnRhaW5lciwgZW5kT2Zmc2V0LCByYW5nZSwgc3RhcnRDb250YWluZXIsIHN0YXJ0T2Zmc2V0O1xuICAgIGlmICghY2FyZXQpIHtcbiAgICAgIHJhbmdlID0gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJhbmdlKCk7XG4gICAgICBjYXJldCA9IHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5mb2N1c2VkICYmIChyYW5nZSAhPSBudWxsKSA/IHtcbiAgICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRQb3NpdGlvbigpLFxuICAgICAgICBlbmQ6IHRoaXMuZW5kUG9zaXRpb24oKSxcbiAgICAgICAgY29sbGFwc2VkOiByYW5nZS5jb2xsYXBzZWRcbiAgICAgIH0gOiB7fTtcbiAgICAgIHJldHVybiBjYXJldDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFjYXJldC5zdGFydCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzdGFydENvbnRhaW5lciA9IHRoaXMuX2dldE5vZGVCeVBvc2l0aW9uKGNhcmV0LnN0YXJ0KTtcbiAgICAgIHN0YXJ0T2Zmc2V0ID0gY2FyZXQuc3RhcnRbY2FyZXQuc3RhcnQubGVuZ3RoIC0gMV07XG4gICAgICBpZiAoY2FyZXQuY29sbGFwc2VkKSB7XG4gICAgICAgIGVuZENvbnRhaW5lciA9IHN0YXJ0Q29udGFpbmVyO1xuICAgICAgICBlbmRPZmZzZXQgPSBzdGFydE9mZnNldDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVuZENvbnRhaW5lciA9IHRoaXMuX2dldE5vZGVCeVBvc2l0aW9uKGNhcmV0LmVuZCk7XG4gICAgICAgIGVuZE9mZnNldCA9IGNhcmV0LnN0YXJ0W2NhcmV0LnN0YXJ0Lmxlbmd0aCAtIDFdO1xuICAgICAgfVxuICAgICAgaWYgKCFzdGFydENvbnRhaW5lciB8fCAhZW5kQ29udGFpbmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignc2ltZGl0b3I6IGludmFsaWQgY2FyZXQgc3RhdGUnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgcmFuZ2Uuc2V0U3RhcnQoc3RhcnRDb250YWluZXIsIHN0YXJ0T2Zmc2V0KTtcbiAgICAgIHJhbmdlLnNldEVuZChlbmRDb250YWluZXIsIGVuZE9mZnNldCk7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJhbmdlKHJhbmdlKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFVuZG9NYW5hZ2VyO1xuXG59KShTaW1wbGVNb2R1bGUpO1xuXG5VdGlsID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKFV0aWwsIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIFV0aWwoKSB7XG4gICAgcmV0dXJuIFV0aWwuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBVdGlsLnBsdWdpbk5hbWUgPSAnVXRpbCc7XG5cbiAgVXRpbC5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVkaXRvciA9IHRoaXMuX21vZHVsZTtcbiAgICBpZiAodGhpcy5icm93c2VyLm1zaWUgJiYgdGhpcy5icm93c2VyLnZlcnNpb24gPCAxMSkge1xuICAgICAgcmV0dXJuIHRoaXMucGhCciA9ICcnO1xuICAgIH1cbiAgfTtcblxuICBVdGlsLnByb3RvdHlwZS5waEJyID0gJzxici8+JztcblxuICBVdGlsLnByb3RvdHlwZS5vcyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgb3M7XG4gICAgb3MgPSB7fTtcbiAgICBpZiAoL01hYy8udGVzdChuYXZpZ2F0b3IuYXBwVmVyc2lvbikpIHtcbiAgICAgIG9zLm1hYyA9IHRydWU7XG4gICAgfSBlbHNlIGlmICgvTGludXgvLnRlc3QobmF2aWdhdG9yLmFwcFZlcnNpb24pKSB7XG4gICAgICBvcy5saW51eCA9IHRydWU7XG4gICAgfSBlbHNlIGlmICgvV2luLy50ZXN0KG5hdmlnYXRvci5hcHBWZXJzaW9uKSkge1xuICAgICAgb3Mud2luID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKC9YMTEvLnRlc3QobmF2aWdhdG9yLmFwcFZlcnNpb24pKSB7XG4gICAgICBvcy51bml4ID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKC9Nb2JpLy50ZXN0KG5hdmlnYXRvci5hcHBWZXJzaW9uKSkge1xuICAgICAgb3MubW9iaWxlID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG9zO1xuICB9KSgpO1xuXG4gIFV0aWwucHJvdG90eXBlLmJyb3dzZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNocm9tZSwgZmlyZWZveCwgaWUsIHJlZiwgcmVmMSwgcmVmMiwgcmVmMywgc2FmYXJpLCB1YTtcbiAgICB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gICAgaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KHVhKTtcbiAgICBjaHJvbWUgPSAvY2hyb21lfGNyaW9zL2kudGVzdCh1YSk7XG4gICAgc2FmYXJpID0gL3NhZmFyaS9pLnRlc3QodWEpICYmICFjaHJvbWU7XG4gICAgZmlyZWZveCA9IC9maXJlZm94L2kudGVzdCh1YSk7XG4gICAgaWYgKGllKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtc2llOiB0cnVlLFxuICAgICAgICB2ZXJzaW9uOiAoKHJlZiA9IHVhLm1hdGNoKC8obXNpZSB8cnY6KShcXGQrKFxcLlxcZCspPykvaSkpICE9IG51bGwgPyByZWZbMl0gOiB2b2lkIDApICogMVxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGNocm9tZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd2Via2l0OiB0cnVlLFxuICAgICAgICBjaHJvbWU6IHRydWUsXG4gICAgICAgIHZlcnNpb246ICgocmVmMSA9IHVhLm1hdGNoKC8oPzpjaHJvbWV8Y3Jpb3MpXFwvKFxcZCsoXFwuXFxkKyk/KS9pKSkgIT0gbnVsbCA/IHJlZjFbMV0gOiB2b2lkIDApICogMVxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHNhZmFyaSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd2Via2l0OiB0cnVlLFxuICAgICAgICBzYWZhcmk6IHRydWUsXG4gICAgICAgIHZlcnNpb246ICgocmVmMiA9IHVhLm1hdGNoKC92ZXJzaW9uXFwvKFxcZCsoXFwuXFxkKyk/KS9pKSkgIT0gbnVsbCA/IHJlZjJbMV0gOiB2b2lkIDApICogMVxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGZpcmVmb3gpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1vemlsbGE6IHRydWUsXG4gICAgICAgIGZpcmVmb3g6IHRydWUsXG4gICAgICAgIHZlcnNpb246ICgocmVmMyA9IHVhLm1hdGNoKC9maXJlZm94XFwvKFxcZCsoXFwuXFxkKyk/KS9pKSkgIT0gbnVsbCA/IHJlZjNbMV0gOiB2b2lkIDApICogMVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfSkoKTtcblxuICBVdGlsLnByb3RvdHlwZS5zdXBwb3J0ID0gKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvbnNlbGVjdGlvbmNoYW5nZTogKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZSwgb25zZWxlY3Rpb25jaGFuZ2U7XG4gICAgICAgIG9uc2VsZWN0aW9uY2hhbmdlID0gZG9jdW1lbnQub25zZWxlY3Rpb25jaGFuZ2U7XG4gICAgICAgIGlmIChvbnNlbGVjdGlvbmNoYW5nZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRvY3VtZW50Lm9uc2VsZWN0aW9uY2hhbmdlID0gMDtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5vbnNlbGVjdGlvbmNoYW5nZSA9PT0gbnVsbDtcbiAgICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgICAgIGUgPSBfZXJyb3I7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGRvY3VtZW50Lm9uc2VsZWN0aW9uY2hhbmdlID0gb25zZWxlY3Rpb25jaGFuZ2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pKCksXG4gICAgICBvbmlucHV0OiAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIH0pKClcbiAgICB9O1xuICB9KSgpO1xuXG4gIFV0aWwucHJvdG90eXBlLnJlZmxvdyA9IGZ1bmN0aW9uKGVsKSB7XG4gICAgaWYgKGVsID09IG51bGwpIHtcbiAgICAgIGVsID0gZG9jdW1lbnQ7XG4gICAgfVxuICAgIHJldHVybiAkKGVsKVswXS5vZmZzZXRIZWlnaHQ7XG4gIH07XG5cbiAgVXRpbC5wcm90b3R5cGUubWV0YUtleSA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgaXNNYWM7XG4gICAgaXNNYWMgPSAvTWFjLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgIGlmIChpc01hYykge1xuICAgICAgcmV0dXJuIGUubWV0YUtleTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGUuY3RybEtleTtcbiAgICB9XG4gIH07XG5cbiAgVXRpbC5wcm90b3R5cGUuaXNFbXB0eU5vZGUgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdmFyICRub2RlO1xuICAgICRub2RlID0gJChub2RlKTtcbiAgICByZXR1cm4gJG5vZGUuaXMoJzplbXB0eScpIHx8ICghJG5vZGUudGV4dCgpICYmICEkbm9kZS5maW5kKCc6bm90KGJyLCBzcGFuLCBkaXYpJykubGVuZ3RoKTtcbiAgfTtcblxuICBVdGlsLnByb3RvdHlwZS5pc0RlY29yYXRlZE5vZGUgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuICQobm9kZSkuaXMoJ1tjbGFzc149XCJzaW1kaXRvci1cIl0nKTtcbiAgfTtcblxuICBVdGlsLnByb3RvdHlwZS5ibG9ja05vZGVzID0gW1wiZGl2XCIsIFwicFwiLCBcInVsXCIsIFwib2xcIiwgXCJsaVwiLCBcImJsb2NrcXVvdGVcIiwgXCJoclwiLCBcInByZVwiLCBcImgxXCIsIFwiaDJcIiwgXCJoM1wiLCBcImg0XCIsIFwidGFibGVcIl07XG5cbiAgVXRpbC5wcm90b3R5cGUuaXNCbG9ja05vZGUgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgbm9kZSA9ICQobm9kZSlbMF07XG4gICAgaWYgKCFub2RlIHx8IG5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoXCJeKFwiICsgKHRoaXMuYmxvY2tOb2Rlcy5qb2luKCd8JykpICsgXCIpJFwiKS50ZXN0KG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSk7XG4gIH07XG5cbiAgVXRpbC5wcm90b3R5cGUuZ2V0Tm9kZUxlbmd0aCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBub2RlID0gJChub2RlKVswXTtcbiAgICBzd2l0Y2ggKG5vZGUubm9kZVR5cGUpIHtcbiAgICAgIGNhc2UgNzpcbiAgICAgIGNhc2UgMTA6XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgY2FzZSAzOlxuICAgICAgY2FzZSA4OlxuICAgICAgICByZXR1cm4gbm9kZS5sZW5ndGg7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDtcbiAgICB9XG4gIH07XG5cbiAgVXRpbC5wcm90b3R5cGUuZGF0YVVSTHRvQmxvYiA9IGZ1bmN0aW9uKGRhdGFVUkwpIHtcbiAgICB2YXIgQmxvYkJ1aWxkZXIsIGFycmF5QnVmZmVyLCBiYiwgYmxvYkFycmF5LCBieXRlU3RyaW5nLCBoYXNBcnJheUJ1ZmZlclZpZXdTdXBwb3J0LCBoYXNCbG9iQ29uc3RydWN0b3IsIGksIGludEFycmF5LCBrLCBtaW1lU3RyaW5nLCByZWYsIHN1cHBvcnRCbG9iO1xuICAgIGhhc0Jsb2JDb25zdHJ1Y3RvciA9IHdpbmRvdy5CbG9iICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4obmV3IEJsb2IoKSk7XG4gICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgZSA9IF9lcnJvcjtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pKCk7XG4gICAgaGFzQXJyYXlCdWZmZXJWaWV3U3VwcG9ydCA9IGhhc0Jsb2JDb25zdHJ1Y3RvciAmJiB3aW5kb3cuVWludDhBcnJheSAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgQmxvYihbbmV3IFVpbnQ4QXJyYXkoMTAwKV0pLnNpemUgPT09IDEwMDtcbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICBlID0gX2Vycm9yO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSkoKTtcbiAgICBCbG9iQnVpbGRlciA9IHdpbmRvdy5CbG9iQnVpbGRlciB8fCB3aW5kb3cuV2ViS2l0QmxvYkJ1aWxkZXIgfHwgd2luZG93Lk1vekJsb2JCdWlsZGVyIHx8IHdpbmRvdy5NU0Jsb2JCdWlsZGVyO1xuICAgIHN1cHBvcnRCbG9iID0gaGFzQmxvYkNvbnN0cnVjdG9yIHx8IEJsb2JCdWlsZGVyO1xuICAgIGlmICghKHN1cHBvcnRCbG9iICYmIHdpbmRvdy5hdG9iICYmIHdpbmRvdy5BcnJheUJ1ZmZlciAmJiB3aW5kb3cuVWludDhBcnJheSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGRhdGFVUkwuc3BsaXQoJywnKVswXS5pbmRleE9mKCdiYXNlNjQnKSA+PSAwKSB7XG4gICAgICBieXRlU3RyaW5nID0gYXRvYihkYXRhVVJMLnNwbGl0KCcsJylbMV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBieXRlU3RyaW5nID0gZGVjb2RlVVJJQ29tcG9uZW50KGRhdGFVUkwuc3BsaXQoJywnKVsxXSk7XG4gICAgfVxuICAgIGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGJ5dGVTdHJpbmcubGVuZ3RoKTtcbiAgICBpbnRBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKTtcbiAgICBmb3IgKGkgPSBrID0gMCwgcmVmID0gYnl0ZVN0cmluZy5sZW5ndGg7IDAgPD0gcmVmID8gayA8PSByZWYgOiBrID49IHJlZjsgaSA9IDAgPD0gcmVmID8gKytrIDogLS1rKSB7XG4gICAgICBpbnRBcnJheVtpXSA9IGJ5dGVTdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgbWltZVN0cmluZyA9IGRhdGFVUkwuc3BsaXQoJywnKVswXS5zcGxpdCgnOicpWzFdLnNwbGl0KCc7JylbMF07XG4gICAgaWYgKGhhc0Jsb2JDb25zdHJ1Y3Rvcikge1xuICAgICAgYmxvYkFycmF5ID0gaGFzQXJyYXlCdWZmZXJWaWV3U3VwcG9ydCA/IGludEFycmF5IDogYXJyYXlCdWZmZXI7XG4gICAgICByZXR1cm4gbmV3IEJsb2IoW2Jsb2JBcnJheV0sIHtcbiAgICAgICAgdHlwZTogbWltZVN0cmluZ1xuICAgICAgfSk7XG4gICAgfVxuICAgIGJiID0gbmV3IEJsb2JCdWlsZGVyKCk7XG4gICAgYmIuYXBwZW5kKGFycmF5QnVmZmVyKTtcbiAgICByZXR1cm4gYmIuZ2V0QmxvYihtaW1lU3RyaW5nKTtcbiAgfTtcblxuICBVdGlsLnByb3RvdHlwZS50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncywgY2FsbCwgY3R4LCBsYXN0LCBydG4sIHRocm90dGxlZCwgdGltZW91dElEO1xuICAgIGxhc3QgPSAwO1xuICAgIHRpbWVvdXRJRCA9IDA7XG4gICAgY3R4ID0gYXJncyA9IHJ0biA9IG51bGw7XG4gICAgY2FsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGltZW91dElEID0gMDtcbiAgICAgIGxhc3QgPSArbmV3IERhdGUoKTtcbiAgICAgIHJ0biA9IGZ1bmMuYXBwbHkoY3R4LCBhcmdzKTtcbiAgICAgIGN0eCA9IG51bGw7XG4gICAgICByZXR1cm4gYXJncyA9IG51bGw7XG4gICAgfTtcbiAgICByZXR1cm4gdGhyb3R0bGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVsdGE7XG4gICAgICBjdHggPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGRlbHRhID0gbmV3IERhdGUoKSAtIGxhc3Q7XG4gICAgICBpZiAoIXRpbWVvdXRJRCkge1xuICAgICAgICBpZiAoZGVsdGEgPj0gd2FpdCkge1xuICAgICAgICAgIGNhbGwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aW1lb3V0SUQgPSBzZXRUaW1lb3V0KGNhbGwsIHdhaXQgLSBkZWx0YSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBydG47XG4gICAgfTtcbiAgfTtcblxuICBVdGlsLnByb3RvdHlwZS5mb3JtYXRIVE1MID0gZnVuY3Rpb24oaHRtbCkge1xuICAgIHZhciBjdXJzb3IsIGluZGVudFN0cmluZywgbGFzdE1hdGNoLCBsZXZlbCwgbWF0Y2gsIHJlLCByZXBlYXRTdHJpbmcsIHJlc3VsdCwgc3RyO1xuICAgIHJlID0gLzwoXFwvPykoLis/KShcXC8/KT4vZztcbiAgICByZXN1bHQgPSAnJztcbiAgICBsZXZlbCA9IDA7XG4gICAgbGFzdE1hdGNoID0gbnVsbDtcbiAgICBpbmRlbnRTdHJpbmcgPSAnICAnO1xuICAgIHJlcGVhdFN0cmluZyA9IGZ1bmN0aW9uKHN0ciwgbikge1xuICAgICAgcmV0dXJuIG5ldyBBcnJheShuICsgMSkuam9pbihzdHIpO1xuICAgIH07XG4gICAgd2hpbGUgKChtYXRjaCA9IHJlLmV4ZWMoaHRtbCkpICE9PSBudWxsKSB7XG4gICAgICBtYXRjaC5pc0Jsb2NrTm9kZSA9ICQuaW5BcnJheShtYXRjaFsyXSwgdGhpcy5ibG9ja05vZGVzKSA+IC0xO1xuICAgICAgbWF0Y2guaXNTdGFydFRhZyA9IG1hdGNoWzFdICE9PSAnLycgJiYgbWF0Y2hbM10gIT09ICcvJztcbiAgICAgIG1hdGNoLmlzRW5kVGFnID0gbWF0Y2hbMV0gPT09ICcvJyB8fCBtYXRjaFszXSA9PT0gJy8nO1xuICAgICAgY3Vyc29yID0gbGFzdE1hdGNoID8gbGFzdE1hdGNoLmluZGV4ICsgbGFzdE1hdGNoWzBdLmxlbmd0aCA6IDA7XG4gICAgICBpZiAoKHN0ciA9IGh0bWwuc3Vic3RyaW5nKGN1cnNvciwgbWF0Y2guaW5kZXgpKS5sZW5ndGggPiAwICYmICQudHJpbShzdHIpKSB7XG4gICAgICAgIHJlc3VsdCArPSBzdHI7XG4gICAgICB9XG4gICAgICBpZiAobWF0Y2guaXNCbG9ja05vZGUgJiYgbWF0Y2guaXNFbmRUYWcgJiYgIW1hdGNoLmlzU3RhcnRUYWcpIHtcbiAgICAgICAgbGV2ZWwgLT0gMTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXRjaC5pc0Jsb2NrTm9kZSAmJiBtYXRjaC5pc1N0YXJ0VGFnKSB7XG4gICAgICAgIGlmICghKGxhc3RNYXRjaCAmJiBsYXN0TWF0Y2guaXNCbG9ja05vZGUgJiYgbGFzdE1hdGNoLmlzRW5kVGFnKSkge1xuICAgICAgICAgIHJlc3VsdCArPSAnXFxuJztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gcmVwZWF0U3RyaW5nKGluZGVudFN0cmluZywgbGV2ZWwpO1xuICAgICAgfVxuICAgICAgcmVzdWx0ICs9IG1hdGNoWzBdO1xuICAgICAgaWYgKG1hdGNoLmlzQmxvY2tOb2RlICYmIG1hdGNoLmlzRW5kVGFnKSB7XG4gICAgICAgIHJlc3VsdCArPSAnXFxuJztcbiAgICAgIH1cbiAgICAgIGlmIChtYXRjaC5pc0Jsb2NrTm9kZSAmJiBtYXRjaC5pc1N0YXJ0VGFnKSB7XG4gICAgICAgIGxldmVsICs9IDE7XG4gICAgICB9XG4gICAgICBsYXN0TWF0Y2ggPSBtYXRjaDtcbiAgICB9XG4gICAgcmV0dXJuICQudHJpbShyZXN1bHQpO1xuICB9O1xuXG4gIHJldHVybiBVdGlsO1xuXG59KShTaW1wbGVNb2R1bGUpO1xuXG5Ub29sYmFyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKFRvb2xiYXIsIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIFRvb2xiYXIoKSB7XG4gICAgcmV0dXJuIFRvb2xiYXIuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBUb29sYmFyLnBsdWdpbk5hbWUgPSAnVG9vbGJhcic7XG5cbiAgVG9vbGJhci5wcm90b3R5cGUub3B0cyA9IHtcbiAgICB0b29sYmFyOiB0cnVlLFxuICAgIHRvb2xiYXJGbG9hdDogdHJ1ZSxcbiAgICB0b29sYmFySGlkZGVuOiBmYWxzZSxcbiAgICB0b29sYmFyRmxvYXRPZmZzZXQ6IDBcbiAgfTtcblxuICBUb29sYmFyLnByb3RvdHlwZS5fdHBsID0ge1xuICAgIHdyYXBwZXI6ICc8ZGl2IGNsYXNzPVwic2ltZGl0b3ItdG9vbGJhclwiPjx1bD48L3VsPjwvZGl2PicsXG4gICAgc2VwYXJhdG9yOiAnPGxpPjxzcGFuIGNsYXNzPVwic2VwYXJhdG9yXCI+PC9zcGFuPjwvbGk+J1xuICB9O1xuXG4gIFRvb2xiYXIucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZsb2F0SW5pdGlhbGl6ZWQsIGluaXRUb29sYmFyRmxvYXQsIHRvb2xiYXJIZWlnaHQ7XG4gICAgdGhpcy5lZGl0b3IgPSB0aGlzLl9tb2R1bGU7XG4gICAgaWYgKCF0aGlzLm9wdHMudG9vbGJhcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoISQuaXNBcnJheSh0aGlzLm9wdHMudG9vbGJhcikpIHtcbiAgICAgIHRoaXMub3B0cy50b29sYmFyID0gWydib2xkJywgJ2l0YWxpYycsICd1bmRlcmxpbmUnLCAnc3RyaWtldGhyb3VnaCcsICd8JywgJ29sJywgJ3VsJywgJ2Jsb2NrcXVvdGUnLCAnY29kZScsICd8JywgJ2xpbmsnLCAnaW1hZ2UnLCAnfCcsICdpbmRlbnQnLCAnb3V0ZGVudCddO1xuICAgIH1cbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICB0aGlzLmxpc3Qub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICAgIHRoaXMud3JhcHBlci5vbignbW91c2Vkb3duJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gX3RoaXMubGlzdC5maW5kKCcubWVudS1vbicpLnJlbW92ZUNsYXNzKCcubWVudS1vbicpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlZG93bi5zaW1kaXRvcicgKyB0aGlzLmVkaXRvci5pZCwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gX3RoaXMubGlzdC5maW5kKCcubWVudS1vbicpLnJlbW92ZUNsYXNzKCcubWVudS1vbicpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgaWYgKCF0aGlzLm9wdHMudG9vbGJhckhpZGRlbiAmJiB0aGlzLm9wdHMudG9vbGJhckZsb2F0KSB7XG4gICAgICB0aGlzLndyYXBwZXIuY3NzKCd0b3AnLCB0aGlzLm9wdHMudG9vbGJhckZsb2F0T2Zmc2V0KTtcbiAgICAgIHRvb2xiYXJIZWlnaHQgPSAwO1xuICAgICAgaW5pdFRvb2xiYXJGbG9hdCA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMud3JhcHBlci5jc3MoJ3Bvc2l0aW9uJywgJ3N0YXRpYycpO1xuICAgICAgICAgIF90aGlzLndyYXBwZXIud2lkdGgoJ2F1dG8nKTtcbiAgICAgICAgICBfdGhpcy5lZGl0b3IudXRpbC5yZWZsb3coX3RoaXMud3JhcHBlcik7XG4gICAgICAgICAgX3RoaXMud3JhcHBlci53aWR0aChfdGhpcy53cmFwcGVyLm91dGVyV2lkdGgoKSk7XG4gICAgICAgICAgX3RoaXMud3JhcHBlci5jc3MoJ2xlZnQnLCBfdGhpcy5lZGl0b3IudXRpbC5vcy5tb2JpbGUgPyBfdGhpcy53cmFwcGVyLnBvc2l0aW9uKCkubGVmdCA6IF90aGlzLndyYXBwZXIub2Zmc2V0KCkubGVmdCk7XG4gICAgICAgICAgX3RoaXMud3JhcHBlci5jc3MoJ3Bvc2l0aW9uJywgJycpO1xuICAgICAgICAgIHRvb2xiYXJIZWlnaHQgPSBfdGhpcy53cmFwcGVyLm91dGVySGVpZ2h0KCk7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLnBsYWNlaG9sZGVyRWwuY3NzKCd0b3AnLCB0b29sYmFySGVpZ2h0KTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuc2ltZGl0b3ItJyArIHRoaXMuZWRpdG9yLmlkLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBmbG9hdEluaXRpYWxpemVkO1xuICAgICAgICByZXR1cm4gZmxvYXRJbml0aWFsaXplZCA9IG51bGw7XG4gICAgICB9KTtcbiAgICAgIGZsb2F0SW5pdGlhbGl6ZWQgPSBudWxsO1xuICAgICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwuc2ltZGl0b3ItJyArIHRoaXMuZWRpdG9yLmlkLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICB2YXIgYm90dG9tRWRnZSwgc2Nyb2xsVG9wLCB0b3BFZGdlO1xuICAgICAgICAgIGlmICghX3RoaXMud3JhcHBlci5pcygnOnZpc2libGUnKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b3BFZGdlID0gX3RoaXMuZWRpdG9yLndyYXBwZXIub2Zmc2V0KCkudG9wO1xuICAgICAgICAgIGJvdHRvbUVkZ2UgPSB0b3BFZGdlICsgX3RoaXMuZWRpdG9yLndyYXBwZXIub3V0ZXJIZWlnaHQoKSAtIDgwO1xuICAgICAgICAgIHNjcm9sbFRvcCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpICsgX3RoaXMub3B0cy50b29sYmFyRmxvYXRPZmZzZXQ7XG4gICAgICAgICAgaWYgKHNjcm9sbFRvcCA8PSB0b3BFZGdlIHx8IHNjcm9sbFRvcCA+PSBib3R0b21FZGdlKSB7XG4gICAgICAgICAgICBfdGhpcy5lZGl0b3Iud3JhcHBlci5yZW1vdmVDbGFzcygndG9vbGJhci1mbG9hdGluZycpLmNzcygncGFkZGluZy10b3AnLCAnJyk7XG4gICAgICAgICAgICBpZiAoX3RoaXMuZWRpdG9yLnV0aWwub3MubW9iaWxlKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy53cmFwcGVyLmNzcygndG9wJywgX3RoaXMub3B0cy50b29sYmFyRmxvYXRPZmZzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmbG9hdEluaXRpYWxpemVkIHx8IChmbG9hdEluaXRpYWxpemVkID0gaW5pdFRvb2xiYXJGbG9hdCgpKTtcbiAgICAgICAgICAgIF90aGlzLmVkaXRvci53cmFwcGVyLmFkZENsYXNzKCd0b29sYmFyLWZsb2F0aW5nJykuY3NzKCdwYWRkaW5nLXRvcCcsIHRvb2xiYXJIZWlnaHQpO1xuICAgICAgICAgICAgaWYgKF90aGlzLmVkaXRvci51dGlsLm9zLm1vYmlsZSkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMud3JhcHBlci5jc3MoJ3RvcCcsIHNjcm9sbFRvcCAtIHRvcEVkZ2UgKyBfdGhpcy5vcHRzLnRvb2xiYXJGbG9hdE9mZnNldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH1cbiAgICB0aGlzLmVkaXRvci5vbignZGVzdHJveScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMuYnV0dG9ucy5sZW5ndGggPSAwO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuICQoZG9jdW1lbnQpLm9uKFwibW91c2Vkb3duLnNpbWRpdG9yLVwiICsgdGhpcy5lZGl0b3IuaWQsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmxpc3QuZmluZCgnbGkubWVudS1vbicpLnJlbW92ZUNsYXNzKCdtZW51LW9uJyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBUb29sYmFyLnByb3RvdHlwZS5fcmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGssIGxlbiwgbmFtZSwgcmVmO1xuICAgIHRoaXMuYnV0dG9ucyA9IFtdO1xuICAgIHRoaXMud3JhcHBlciA9ICQodGhpcy5fdHBsLndyYXBwZXIpLnByZXBlbmRUbyh0aGlzLmVkaXRvci53cmFwcGVyKTtcbiAgICB0aGlzLmxpc3QgPSB0aGlzLndyYXBwZXIuZmluZCgndWwnKTtcbiAgICByZWYgPSB0aGlzLm9wdHMudG9vbGJhcjtcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIG5hbWUgPSByZWZba107XG4gICAgICBpZiAobmFtZSA9PT0gJ3wnKSB7XG4gICAgICAgICQodGhpcy5fdHBsLnNlcGFyYXRvcikuYXBwZW5kVG8odGhpcy5saXN0KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuY29uc3RydWN0b3IuYnV0dG9uc1tuYW1lXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzaW1kaXRvcjogaW52YWxpZCB0b29sYmFyIGJ1dHRvbiBcIiArIG5hbWUpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYnV0dG9ucy5wdXNoKG5ldyB0aGlzLmNvbnN0cnVjdG9yLmJ1dHRvbnNbbmFtZV0oe1xuICAgICAgICBlZGl0b3I6IHRoaXMuZWRpdG9yXG4gICAgICB9KSk7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdHMudG9vbGJhckhpZGRlbikge1xuICAgICAgcmV0dXJuIHRoaXMud3JhcHBlci5oaWRlKCk7XG4gICAgfVxuICB9O1xuXG4gIFRvb2xiYXIucHJvdG90eXBlLmZpbmRCdXR0b24gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGJ1dHRvbjtcbiAgICBidXR0b24gPSB0aGlzLmxpc3QuZmluZCgnLnRvb2xiYXItaXRlbS0nICsgbmFtZSkuZGF0YSgnYnV0dG9uJyk7XG4gICAgcmV0dXJuIGJ1dHRvbiAhPSBudWxsID8gYnV0dG9uIDogbnVsbDtcbiAgfTtcblxuICBUb29sYmFyLmFkZEJ1dHRvbiA9IGZ1bmN0aW9uKGJ0bikge1xuICAgIHJldHVybiB0aGlzLmJ1dHRvbnNbYnRuLnByb3RvdHlwZS5uYW1lXSA9IGJ0bjtcbiAgfTtcblxuICBUb29sYmFyLmJ1dHRvbnMgPSB7fTtcblxuICByZXR1cm4gVG9vbGJhcjtcblxufSkoU2ltcGxlTW9kdWxlKTtcblxuSW5kZW50YXRpb24gPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoSW5kZW50YXRpb24sIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIEluZGVudGF0aW9uKCkge1xuICAgIHJldHVybiBJbmRlbnRhdGlvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIEluZGVudGF0aW9uLnBsdWdpbk5hbWUgPSAnSW5kZW50YXRpb24nO1xuXG4gIEluZGVudGF0aW9uLnByb3RvdHlwZS5vcHRzID0ge1xuICAgIHRhYkluZGVudDogdHJ1ZVxuICB9O1xuXG4gIEluZGVudGF0aW9uLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWRpdG9yID0gdGhpcy5fbW9kdWxlO1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5pbnB1dE1hbmFnZXIuYWRkS2V5c3Ryb2tlSGFuZGxlcignOScsICcqJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgY29kZUJ1dHRvbjtcbiAgICAgICAgY29kZUJ1dHRvbiA9IF90aGlzLmVkaXRvci50b29sYmFyLmZpbmRCdXR0b24oJ2NvZGUnKTtcbiAgICAgICAgaWYgKCEoX3RoaXMub3B0cy50YWJJbmRlbnQgfHwgKGNvZGVCdXR0b24gJiYgY29kZUJ1dHRvbi5hY3RpdmUpKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXMuaW5kZW50KGUuc2hpZnRLZXkpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgSW5kZW50YXRpb24ucHJvdG90eXBlLmluZGVudCA9IGZ1bmN0aW9uKGlzQmFja3dhcmQpIHtcbiAgICB2YXIgJGJsb2NrTm9kZXMsICRlbmROb2RlcywgJHN0YXJ0Tm9kZXMsIG5vZGVzLCByZXN1bHQ7XG4gICAgJHN0YXJ0Tm9kZXMgPSB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc3RhcnROb2RlcygpO1xuICAgICRlbmROb2RlcyA9IHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5lbmROb2RlcygpO1xuICAgICRibG9ja05vZGVzID0gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLmJsb2NrTm9kZXMoKTtcbiAgICBub2RlcyA9IFtdO1xuICAgICRibG9ja05vZGVzID0gJGJsb2NrTm9kZXMuZWFjaChmdW5jdGlvbihpLCBub2RlKSB7XG4gICAgICB2YXIgaW5jbHVkZSwgaiwgaywgbGVuLCBuO1xuICAgICAgaW5jbHVkZSA9IHRydWU7XG4gICAgICBmb3IgKGogPSBrID0gMCwgbGVuID0gbm9kZXMubGVuZ3RoOyBrIDwgbGVuOyBqID0gKytrKSB7XG4gICAgICAgIG4gPSBub2Rlc1tqXTtcbiAgICAgICAgaWYgKCQuY29udGFpbnMobm9kZSwgbikpIHtcbiAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSBpZiAoJC5jb250YWlucyhuLCBub2RlKSkge1xuICAgICAgICAgIG5vZGVzLnNwbGljZShqLCAxLCBub2RlKTtcbiAgICAgICAgICBpbmNsdWRlID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpbmNsdWRlKSB7XG4gICAgICAgIHJldHVybiBub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgICRibG9ja05vZGVzID0gJChub2Rlcyk7XG4gICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgJGJsb2NrTm9kZXMuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihpLCBibG9ja0VsKSB7XG4gICAgICAgIHZhciByO1xuICAgICAgICByID0gaXNCYWNrd2FyZCA/IF90aGlzLm91dGRlbnRCbG9jayhibG9ja0VsKSA6IF90aGlzLmluZGVudEJsb2NrKGJsb2NrRWwpO1xuICAgICAgICBpZiAocikge1xuICAgICAgICAgIHJldHVybiByZXN1bHQgPSByO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIEluZGVudGF0aW9uLnByb3RvdHlwZS5pbmRlbnRCbG9jayA9IGZ1bmN0aW9uKGJsb2NrRWwpIHtcbiAgICB2YXIgJGJsb2NrRWwsICRjaGlsZExpc3QsICRuZXh0VGQsICRuZXh0VHIsICRwYXJlbnRMaSwgJHByZSwgJHRkLCAkdHIsIG1hcmdpbkxlZnQsIHRhZ05hbWU7XG4gICAgJGJsb2NrRWwgPSAkKGJsb2NrRWwpO1xuICAgIGlmICghJGJsb2NrRWwubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICgkYmxvY2tFbC5pcygncHJlJykpIHtcbiAgICAgICRwcmUgPSB0aGlzLmVkaXRvci5zZWxlY3Rpb24uY29udGFpbmVyTm9kZSgpO1xuICAgICAgaWYgKCEoJHByZS5pcygkYmxvY2tFbCkgfHwgJHByZS5jbG9zZXN0KCdwcmUnKS5pcygkYmxvY2tFbCkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5kZW50VGV4dChyYW5nZSk7XG4gICAgfSBlbHNlIGlmICgkYmxvY2tFbC5pcygnbGknKSkge1xuICAgICAgJHBhcmVudExpID0gJGJsb2NrRWwucHJldignbGknKTtcbiAgICAgIGlmICgkcGFyZW50TGkubGVuZ3RoIDwgMSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc2F2ZSgpO1xuICAgICAgdGFnTmFtZSA9ICRibG9ja0VsLnBhcmVudCgpWzBdLnRhZ05hbWU7XG4gICAgICAkY2hpbGRMaXN0ID0gJHBhcmVudExpLmNoaWxkcmVuKCd1bCwgb2wnKTtcbiAgICAgIGlmICgkY2hpbGRMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgJGNoaWxkTGlzdC5hcHBlbmQoJGJsb2NrRWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCgnPCcgKyB0YWdOYW1lICsgJy8+JykuYXBwZW5kKCRibG9ja0VsKS5hcHBlbmRUbygkcGFyZW50TGkpO1xuICAgICAgfVxuICAgICAgdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJlc3RvcmUoKTtcbiAgICB9IGVsc2UgaWYgKCRibG9ja0VsLmlzKCdwLCBoMSwgaDIsIGgzLCBoNCcpKSB7XG4gICAgICBtYXJnaW5MZWZ0ID0gcGFyc2VJbnQoJGJsb2NrRWwuY3NzKCdtYXJnaW4tbGVmdCcpKSB8fCAwO1xuICAgICAgbWFyZ2luTGVmdCA9IChNYXRoLnJvdW5kKG1hcmdpbkxlZnQgLyB0aGlzLm9wdHMuaW5kZW50V2lkdGgpICsgMSkgKiB0aGlzLm9wdHMuaW5kZW50V2lkdGg7XG4gICAgICAkYmxvY2tFbC5jc3MoJ21hcmdpbi1sZWZ0JywgbWFyZ2luTGVmdCk7XG4gICAgfSBlbHNlIGlmICgkYmxvY2tFbC5pcygndGFibGUnKSB8fCAkYmxvY2tFbC5pcygnLnNpbWRpdG9yLXRhYmxlJykpIHtcbiAgICAgICR0ZCA9IHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5jb250YWluZXJOb2RlKCkuY2xvc2VzdCgndGQsIHRoJyk7XG4gICAgICAkbmV4dFRkID0gJHRkLm5leHQoJ3RkLCB0aCcpO1xuICAgICAgaWYgKCEoJG5leHRUZC5sZW5ndGggPiAwKSkge1xuICAgICAgICAkdHIgPSAkdGQucGFyZW50KCd0cicpO1xuICAgICAgICAkbmV4dFRyID0gJHRyLm5leHQoJ3RyJyk7XG4gICAgICAgIGlmICgkbmV4dFRyLmxlbmd0aCA8IDEgJiYgJHRyLnBhcmVudCgpLmlzKCd0aGVhZCcpKSB7XG4gICAgICAgICAgJG5leHRUciA9ICR0ci5wYXJlbnQoJ3RoZWFkJykubmV4dCgndGJvZHknKS5maW5kKCd0cjpmaXJzdCcpO1xuICAgICAgICB9XG4gICAgICAgICRuZXh0VGQgPSAkbmV4dFRyLmZpbmQoJ3RkOmZpcnN0LCB0aDpmaXJzdCcpO1xuICAgICAgfVxuICAgICAgaWYgKCEoJHRkLmxlbmd0aCA+IDAgJiYgJG5leHRUZC5sZW5ndGggPiAwKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VBdEVuZE9mKCRuZXh0VGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIEluZGVudGF0aW9uLnByb3RvdHlwZS5pbmRlbnRUZXh0ID0gZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICB2YXIgdGV4dCwgdGV4dE5vZGU7XG4gICAgdGV4dCA9IHJhbmdlLnRvU3RyaW5nKCkucmVwbGFjZSgvXig/PS4rKS9tZywgJ1xcdTAwQTBcXHUwMEEwJyk7XG4gICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0IHx8ICdcXHUwMEEwXFx1MDBBMCcpO1xuICAgIHJhbmdlLmRlbGV0ZUNvbnRlbnRzKCk7XG4gICAgcmFuZ2UuaW5zZXJ0Tm9kZSh0ZXh0Tm9kZSk7XG4gICAgaWYgKHRleHQpIHtcbiAgICAgIHJhbmdlLnNlbGVjdE5vZGUodGV4dE5vZGUpO1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZShyYW5nZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VBZnRlcih0ZXh0Tm9kZSk7XG4gICAgfVxuICB9O1xuXG4gIEluZGVudGF0aW9uLnByb3RvdHlwZS5vdXRkZW50QmxvY2sgPSBmdW5jdGlvbihibG9ja0VsKSB7XG4gICAgdmFyICRibG9ja0VsLCAkcGFyZW50LCAkcGFyZW50TGksICRwcmUsICRwcmV2VGQsICRwcmV2VHIsICR0ZCwgJHRyLCBtYXJnaW5MZWZ0LCByYW5nZTtcbiAgICAkYmxvY2tFbCA9ICQoYmxvY2tFbCk7XG4gICAgaWYgKCEoJGJsb2NrRWwgJiYgJGJsb2NrRWwubGVuZ3RoID4gMCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCRibG9ja0VsLmlzKCdwcmUnKSkge1xuICAgICAgJHByZSA9IHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5jb250YWluZXJOb2RlKCk7XG4gICAgICBpZiAoISgkcHJlLmlzKCRibG9ja0VsKSB8fCAkcHJlLmNsb3Nlc3QoJ3ByZScpLmlzKCRibG9ja0VsKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5vdXRkZW50VGV4dChyYW5nZSk7XG4gICAgfSBlbHNlIGlmICgkYmxvY2tFbC5pcygnbGknKSkge1xuICAgICAgJHBhcmVudCA9ICRibG9ja0VsLnBhcmVudCgpO1xuICAgICAgJHBhcmVudExpID0gJHBhcmVudC5wYXJlbnQoJ2xpJyk7XG4gICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc2F2ZSgpO1xuICAgICAgaWYgKCRwYXJlbnRMaS5sZW5ndGggPCAxKSB7XG4gICAgICAgIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2V0U3RhcnRCZWZvcmUoJHBhcmVudFswXSk7XG4gICAgICAgIHJhbmdlLnNldEVuZEJlZm9yZSgkYmxvY2tFbFswXSk7XG4gICAgICAgICRwYXJlbnQuYmVmb3JlKHJhbmdlLmV4dHJhY3RDb250ZW50cygpKTtcbiAgICAgICAgJCgnPHAvPicpLmluc2VydEJlZm9yZSgkcGFyZW50KS5hZnRlcigkYmxvY2tFbC5jaGlsZHJlbigndWwsIG9sJykpLmFwcGVuZCgkYmxvY2tFbC5jb250ZW50cygpKTtcbiAgICAgICAgJGJsb2NrRWwucmVtb3ZlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoJGJsb2NrRWwubmV4dCgnbGknKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgJCgnPCcgKyAkcGFyZW50WzBdLnRhZ05hbWUgKyAnLz4nKS5hcHBlbmQoJGJsb2NrRWwubmV4dEFsbCgnbGknKSkuYXBwZW5kVG8oJGJsb2NrRWwpO1xuICAgICAgICB9XG4gICAgICAgICRibG9ja0VsLmluc2VydEFmdGVyKCRwYXJlbnRMaSk7XG4gICAgICAgIGlmICgkcGFyZW50LmNoaWxkcmVuKCdsaScpLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAkcGFyZW50LnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24ucmVzdG9yZSgpO1xuICAgIH0gZWxzZSBpZiAoJGJsb2NrRWwuaXMoJ3AsIGgxLCBoMiwgaDMsIGg0JykpIHtcbiAgICAgIG1hcmdpbkxlZnQgPSBwYXJzZUludCgkYmxvY2tFbC5jc3MoJ21hcmdpbi1sZWZ0JykpIHx8IDA7XG4gICAgICBtYXJnaW5MZWZ0ID0gTWF0aC5tYXgoTWF0aC5yb3VuZChtYXJnaW5MZWZ0IC8gdGhpcy5vcHRzLmluZGVudFdpZHRoKSAtIDEsIDApICogdGhpcy5vcHRzLmluZGVudFdpZHRoO1xuICAgICAgJGJsb2NrRWwuY3NzKCdtYXJnaW4tbGVmdCcsIG1hcmdpbkxlZnQgPT09IDAgPyAnJyA6IG1hcmdpbkxlZnQpO1xuICAgIH0gZWxzZSBpZiAoJGJsb2NrRWwuaXMoJ3RhYmxlJykgfHwgJGJsb2NrRWwuaXMoJy5zaW1kaXRvci10YWJsZScpKSB7XG4gICAgICAkdGQgPSB0aGlzLmVkaXRvci5zZWxlY3Rpb24uY29udGFpbmVyTm9kZSgpLmNsb3Nlc3QoJ3RkLCB0aCcpO1xuICAgICAgJHByZXZUZCA9ICR0ZC5wcmV2KCd0ZCwgdGgnKTtcbiAgICAgIGlmICghKCRwcmV2VGQubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgJHRyID0gJHRkLnBhcmVudCgndHInKTtcbiAgICAgICAgJHByZXZUciA9ICR0ci5wcmV2KCd0cicpO1xuICAgICAgICBpZiAoJHByZXZUci5sZW5ndGggPCAxICYmICR0ci5wYXJlbnQoKS5pcygndGJvZHknKSkge1xuICAgICAgICAgICRwcmV2VHIgPSAkdHIucGFyZW50KCd0Ym9keScpLnByZXYoJ3RoZWFkJykuZmluZCgndHI6Zmlyc3QnKTtcbiAgICAgICAgfVxuICAgICAgICAkcHJldlRkID0gJHByZXZUci5maW5kKCd0ZDpsYXN0LCB0aDpsYXN0Jyk7XG4gICAgICB9XG4gICAgICBpZiAoISgkdGQubGVuZ3RoID4gMCAmJiAkcHJldlRkLmxlbmd0aCA+IDApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUF0RW5kT2YoJHByZXZUZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgSW5kZW50YXRpb24ucHJvdG90eXBlLm91dGRlbnRUZXh0ID0gZnVuY3Rpb24ocmFuZ2UpIHt9O1xuXG4gIHJldHVybiBJbmRlbnRhdGlvbjtcblxufSkoU2ltcGxlTW9kdWxlKTtcblxuU2ltZGl0b3IgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoU2ltZGl0b3IsIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIFNpbWRpdG9yKCkge1xuICAgIHJldHVybiBTaW1kaXRvci5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIFNpbWRpdG9yLmNvbm5lY3QoVXRpbCk7XG5cbiAgU2ltZGl0b3IuY29ubmVjdChJbnB1dE1hbmFnZXIpO1xuXG4gIFNpbWRpdG9yLmNvbm5lY3QoU2VsZWN0aW9uKTtcblxuICBTaW1kaXRvci5jb25uZWN0KFVuZG9NYW5hZ2VyKTtcblxuICBTaW1kaXRvci5jb25uZWN0KEtleXN0cm9rZSk7XG5cbiAgU2ltZGl0b3IuY29ubmVjdChGb3JtYXR0ZXIpO1xuXG4gIFNpbWRpdG9yLmNvbm5lY3QoVG9vbGJhcik7XG5cbiAgU2ltZGl0b3IuY29ubmVjdChJbmRlbnRhdGlvbik7XG5cbiAgU2ltZGl0b3IuY291bnQgPSAwO1xuXG4gIFNpbWRpdG9yLnByb3RvdHlwZS5vcHRzID0ge1xuICAgIHRleHRhcmVhOiBudWxsLFxuICAgIHBsYWNlaG9sZGVyOiAnJyxcbiAgICBkZWZhdWx0SW1hZ2U6ICdpbWFnZXMvaW1hZ2UucG5nJyxcbiAgICBwYXJhbXM6IHt9LFxuICAgIHVwbG9hZDogZmFsc2UsXG4gICAgaW5kZW50V2lkdGg6IDQwXG4gIH07XG5cbiAgU2ltZGl0b3IucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGUsIGVkaXRvciwgZm9ybSwgdXBsb2FkT3B0cztcbiAgICB0aGlzLnRleHRhcmVhID0gJCh0aGlzLm9wdHMudGV4dGFyZWEpO1xuICAgIHRoaXMub3B0cy5wbGFjZWhvbGRlciA9IHRoaXMub3B0cy5wbGFjZWhvbGRlciB8fCB0aGlzLnRleHRhcmVhLmF0dHIoJ3BsYWNlaG9sZGVyJyk7XG4gICAgaWYgKCF0aGlzLnRleHRhcmVhLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdzaW1kaXRvcjogcGFyYW0gdGV4dGFyZWEgaXMgcmVxdWlyZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVkaXRvciA9IHRoaXMudGV4dGFyZWEuZGF0YSgnc2ltZGl0b3InKTtcbiAgICBpZiAoZWRpdG9yICE9IG51bGwpIHtcbiAgICAgIGVkaXRvci5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuaWQgPSArK1NpbWRpdG9yLmNvdW50O1xuICAgIHRoaXMuX3JlbmRlcigpO1xuICAgIGlmICh0aGlzLm9wdHMudXBsb2FkICYmIHNpbXBsZVVwbG9hZGVyKSB7XG4gICAgICB1cGxvYWRPcHRzID0gdHlwZW9mIHRoaXMub3B0cy51cGxvYWQgPT09ICdvYmplY3QnID8gdGhpcy5vcHRzLnVwbG9hZCA6IHt9O1xuICAgICAgdGhpcy51cGxvYWRlciA9IHNpbXBsZVVwbG9hZGVyKHVwbG9hZE9wdHMpO1xuICAgIH1cbiAgICBmb3JtID0gdGhpcy50ZXh0YXJlYS5jbG9zZXN0KCdmb3JtJyk7XG4gICAgaWYgKGZvcm0ubGVuZ3RoKSB7XG4gICAgICBmb3JtLm9uKCdzdWJtaXQuc2ltZGl0b3ItJyArIHRoaXMuaWQsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnN5bmMoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIGZvcm0ub24oJ3Jlc2V0LnNpbWRpdG9yLScgKyB0aGlzLmlkLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5zZXRWYWx1ZSgnJyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfVxuICAgIHRoaXMub24oJ2luaXRpYWxpemVkJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfdGhpcy5vcHRzLnBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgX3RoaXMub24oJ3ZhbHVlY2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLl9wbGFjZWhvbGRlcigpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcy5zZXRWYWx1ZShfdGhpcy50ZXh0YXJlYS52YWwoKS50cmltKCkgfHwgJycpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgaWYgKHRoaXMudXRpbC5icm93c2VyLm1vemlsbGEpIHtcbiAgICAgIHRoaXMudXRpbC5yZWZsb3coKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdlbmFibGVPYmplY3RSZXNpemluZycsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5leGVjQ29tbWFuZCgnZW5hYmxlSW5saW5lVGFibGVFZGl0aW5nJywgZmFsc2UsIGZhbHNlKTtcbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICBlID0gX2Vycm9yO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBTaW1kaXRvci5wcm90b3R5cGUuX3RwbCA9IFwiPGRpdiBjbGFzcz1cXFwic2ltZGl0b3JcXFwiPlxcbiAgPGRpdiBjbGFzcz1cXFwic2ltZGl0b3Itd3JhcHBlclxcXCI+XFxuICAgIDxkaXYgY2xhc3M9XFxcInNpbWRpdG9yLXBsYWNlaG9sZGVyXFxcIj48L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cXFwic2ltZGl0b3ItYm9keVxcXCIgY29udGVudGVkaXRhYmxlPVxcXCJ0cnVlXFxcIj5cXG4gICAgPC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj5cIjtcblxuICBTaW1kaXRvci5wcm90b3R5cGUuX3JlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrZXksIHJlZiwgcmVzdWx0cywgdmFsO1xuICAgIHRoaXMuZWwgPSAkKHRoaXMuX3RwbCkuaW5zZXJ0QmVmb3JlKHRoaXMudGV4dGFyZWEpO1xuICAgIHRoaXMud3JhcHBlciA9IHRoaXMuZWwuZmluZCgnLnNpbWRpdG9yLXdyYXBwZXInKTtcbiAgICB0aGlzLmJvZHkgPSB0aGlzLndyYXBwZXIuZmluZCgnLnNpbWRpdG9yLWJvZHknKTtcbiAgICB0aGlzLnBsYWNlaG9sZGVyRWwgPSB0aGlzLndyYXBwZXIuZmluZCgnLnNpbWRpdG9yLXBsYWNlaG9sZGVyJykuYXBwZW5kKHRoaXMub3B0cy5wbGFjZWhvbGRlcik7XG4gICAgdGhpcy5lbC5kYXRhKCdzaW1kaXRvcicsIHRoaXMpO1xuICAgIHRoaXMud3JhcHBlci5hcHBlbmQodGhpcy50ZXh0YXJlYSk7XG4gICAgdGhpcy50ZXh0YXJlYS5kYXRhKCdzaW1kaXRvcicsIHRoaXMpLmJsdXIoKTtcbiAgICB0aGlzLmJvZHkuYXR0cigndGFiaW5kZXgnLCB0aGlzLnRleHRhcmVhLmF0dHIoJ3RhYmluZGV4JykpO1xuICAgIGlmICh0aGlzLnV0aWwub3MubWFjKSB7XG4gICAgICB0aGlzLmVsLmFkZENsYXNzKCdzaW1kaXRvci1tYWMnKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMudXRpbC5vcy5saW51eCkge1xuICAgICAgdGhpcy5lbC5hZGRDbGFzcygnc2ltZGl0b3ItbGludXgnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudXRpbC5vcy5tb2JpbGUpIHtcbiAgICAgIHRoaXMuZWwuYWRkQ2xhc3MoJ3NpbWRpdG9yLW1vYmlsZScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRzLnBhcmFtcykge1xuICAgICAgcmVmID0gdGhpcy5vcHRzLnBhcmFtcztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoa2V5IGluIHJlZikge1xuICAgICAgICB2YWwgPSByZWZba2V5XTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKCQoJzxpbnB1dC8+Jywge1xuICAgICAgICAgIHR5cGU6ICdoaWRkZW4nLFxuICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICB2YWx1ZTogdmFsXG4gICAgICAgIH0pLmluc2VydEFmdGVyKHRoaXMudGV4dGFyZWEpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgfTtcblxuICBTaW1kaXRvci5wcm90b3R5cGUuX3BsYWNlaG9sZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNoaWxkcmVuO1xuICAgIGNoaWxkcmVuID0gdGhpcy5ib2R5LmNoaWxkcmVuKCk7XG4gICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMCB8fCAoY2hpbGRyZW4ubGVuZ3RoID09PSAxICYmIHRoaXMudXRpbC5pc0VtcHR5Tm9kZShjaGlsZHJlbikgJiYgcGFyc2VJbnQoY2hpbGRyZW4uY3NzKCdtYXJnaW4tbGVmdCcpIHx8IDApIDwgdGhpcy5vcHRzLmluZGVudFdpZHRoKSkge1xuICAgICAgcmV0dXJuIHRoaXMucGxhY2Vob2xkZXJFbC5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBsYWNlaG9sZGVyRWwuaGlkZSgpO1xuICAgIH1cbiAgfTtcblxuICBTaW1kaXRvci5wcm90b3R5cGUuc2V0VmFsdWUgPSBmdW5jdGlvbih2YWwpIHtcbiAgICB0aGlzLmhpZGVQb3BvdmVyKCk7XG4gICAgdGhpcy50ZXh0YXJlYS52YWwodmFsKTtcbiAgICB0aGlzLmJvZHkuaHRtbCh2YWwpO1xuICAgIHRoaXMuZm9ybWF0dGVyLmZvcm1hdCgpO1xuICAgIHRoaXMuZm9ybWF0dGVyLmRlY29yYXRlKCk7XG4gICAgdGhpcy51dGlsLnJlZmxvdyh0aGlzLmJvZHkpO1xuICAgIHRoaXMuaW5wdXRNYW5hZ2VyLmxhc3RDYXJldFBvc2l0aW9uID0gbnVsbDtcbiAgICByZXR1cm4gdGhpcy50cmlnZ2VyKCd2YWx1ZWNoYW5nZWQnKTtcbiAgfTtcblxuICBTaW1kaXRvci5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zeW5jKCk7XG4gIH07XG5cbiAgU2ltZGl0b3IucHJvdG90eXBlLnN5bmMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2hpbGRyZW4sIGNsb25lQm9keSwgZW1wdHlQLCBmaXJzdFAsIGxhc3RQLCB2YWw7XG4gICAgY2xvbmVCb2R5ID0gdGhpcy5ib2R5LmNsb25lKCk7XG4gICAgdGhpcy5mb3JtYXR0ZXIudW5kZWNvcmF0ZShjbG9uZUJvZHkpO1xuICAgIHRoaXMuZm9ybWF0dGVyLmZvcm1hdChjbG9uZUJvZHkpO1xuICAgIHRoaXMuZm9ybWF0dGVyLmF1dG9saW5rKGNsb25lQm9keSk7XG4gICAgY2hpbGRyZW4gPSBjbG9uZUJvZHkuY2hpbGRyZW4oKTtcbiAgICBsYXN0UCA9IGNoaWxkcmVuLmxhc3QoJ3AnKTtcbiAgICBmaXJzdFAgPSBjaGlsZHJlbi5maXJzdCgncCcpO1xuICAgIHdoaWxlIChsYXN0UC5pcygncCcpICYmIHRoaXMudXRpbC5pc0VtcHR5Tm9kZShsYXN0UCkpIHtcbiAgICAgIGVtcHR5UCA9IGxhc3RQO1xuICAgICAgbGFzdFAgPSBsYXN0UC5wcmV2KCdwJyk7XG4gICAgICBlbXB0eVAucmVtb3ZlKCk7XG4gICAgfVxuICAgIHdoaWxlIChmaXJzdFAuaXMoJ3AnKSAmJiB0aGlzLnV0aWwuaXNFbXB0eU5vZGUoZmlyc3RQKSkge1xuICAgICAgZW1wdHlQID0gZmlyc3RQO1xuICAgICAgZmlyc3RQID0gbGFzdFAubmV4dCgncCcpO1xuICAgICAgZW1wdHlQLnJlbW92ZSgpO1xuICAgIH1cbiAgICBjbG9uZUJvZHkuZmluZCgnaW1nLnVwbG9hZGluZycpLnJlbW92ZSgpO1xuICAgIHZhbCA9ICQudHJpbShjbG9uZUJvZHkuaHRtbCgpKTtcbiAgICB0aGlzLnRleHRhcmVhLnZhbCh2YWwpO1xuICAgIHJldHVybiB2YWw7XG4gIH07XG5cbiAgU2ltZGl0b3IucHJvdG90eXBlLmZvY3VzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEodGhpcy5ib2R5LmlzKCc6dmlzaWJsZScpICYmIHRoaXMuYm9keS5pcygnW2NvbnRlbnRlZGl0YWJsZV0nKSkpIHtcbiAgICAgIHRoaXMuZWwuZmluZCgndGV4dGFyZWE6dmlzaWJsZScpLmZvY3VzKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLmlucHV0TWFuYWdlci5sYXN0Q2FyZXRQb3NpdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMudW5kb01hbmFnZXIuY2FyZXRQb3NpdGlvbih0aGlzLmlucHV0TWFuYWdlci5sYXN0Q2FyZXRQb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmJvZHkuZm9jdXMoKTtcbiAgICB9XG4gIH07XG5cbiAgU2ltZGl0b3IucHJvdG90eXBlLmJsdXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5ib2R5LmlzKCc6dmlzaWJsZScpICYmIHRoaXMuYm9keS5pcygnW2NvbnRlbnRlZGl0YWJsZV0nKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYm9keS5ibHVyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmJvZHkuZmluZCgndGV4dGFyZWE6dmlzaWJsZScpLmJsdXIoKTtcbiAgICB9XG4gIH07XG5cbiAgU2ltZGl0b3IucHJvdG90eXBlLmhpZGVQb3BvdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZWwuZmluZCgnLnNpbWRpdG9yLXBvcG92ZXInKS5lYWNoKGZ1bmN0aW9uKGksIHBvcG92ZXIpIHtcbiAgICAgIHBvcG92ZXIgPSAkKHBvcG92ZXIpLmRhdGEoJ3BvcG92ZXInKTtcbiAgICAgIGlmIChwb3BvdmVyLmFjdGl2ZSkge1xuICAgICAgICByZXR1cm4gcG9wb3Zlci5oaWRlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgU2ltZGl0b3IucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRyaWdnZXJIYW5kbGVyKCdkZXN0cm95Jyk7XG4gICAgdGhpcy50ZXh0YXJlYS5jbG9zZXN0KCdmb3JtJykub2ZmKCcuc2ltZGl0b3IgLnNpbWRpdG9yLScgKyB0aGlzLmlkKTtcbiAgICB0aGlzLnNlbGVjdGlvbi5jbGVhcigpO1xuICAgIHRoaXMuaW5wdXRNYW5hZ2VyLmZvY3VzZWQgPSBmYWxzZTtcbiAgICB0aGlzLnRleHRhcmVhLmluc2VydEJlZm9yZSh0aGlzLmVsKS5oaWRlKCkudmFsKCcnKS5yZW1vdmVEYXRhKCdzaW1kaXRvcicpO1xuICAgIHRoaXMuZWwucmVtb3ZlKCk7XG4gICAgJChkb2N1bWVudCkub2ZmKCcuc2ltZGl0b3ItJyArIHRoaXMuaWQpO1xuICAgICQod2luZG93KS5vZmYoJy5zaW1kaXRvci0nICsgdGhpcy5pZCk7XG4gICAgcmV0dXJuIHRoaXMub2ZmKCk7XG4gIH07XG5cbiAgcmV0dXJuIFNpbWRpdG9yO1xuXG59KShTaW1wbGVNb2R1bGUpO1xuXG5TaW1kaXRvci5pMThuID0ge1xuICAnemgtQ04nOiB7XG4gICAgJ2Jsb2NrcXVvdGUnOiAn5byV55SoJyxcbiAgICAnYm9sZCc6ICfliqDnspfmloflrZcnLFxuICAgICdjb2RlJzogJ+aPkuWFpeS7o+eggScsXG4gICAgJ2NvbG9yJzogJ+aWh+Wtl+minOiJsicsXG4gICAgJ2NvbG9yZWRUZXh0JzogJ+W9qeiJsuaWh+WtlycsXG4gICAgJ2hyJzogJ+WIhumalOe6vycsXG4gICAgJ2ltYWdlJzogJ+aPkuWFpeWbvueJhycsXG4gICAgJ2V4dGVybmFsSW1hZ2UnOiAn5aSW6ZO+5Zu+54mHJyxcbiAgICAndXBsb2FkSW1hZ2UnOiAn5LiK5Lyg5Zu+54mHJyxcbiAgICAndXBsb2FkRmFpbGVkJzogJ+S4iuS8oOWksei0peS6hicsXG4gICAgJ3VwbG9hZEVycm9yJzogJ+S4iuS8oOWHuumUmeS6hicsXG4gICAgJ2ltYWdlVXJsJzogJ+WbvueJh+WcsOWdgCcsXG4gICAgJ2ltYWdlU2l6ZSc6ICflm77niYflsLrlr7gnLFxuICAgICdpbWFnZUFsdCc6ICflm77niYfmj4/ov7AnLFxuICAgICdyZXN0b3JlSW1hZ2VTaXplJzogJ+i/mOWOn+WbvueJh+WwuuWvuCcsXG4gICAgJ3VwbG9hZGluZyc6ICfmraPlnKjkuIrkvKAnLFxuICAgICdpbmRlbnQnOiAn5ZCR5Y+z57yp6L+bJyxcbiAgICAnb3V0ZGVudCc6ICflkJHlt6bnvKnov5snLFxuICAgICdpdGFsaWMnOiAn5pac5L2T5paH5a2XJyxcbiAgICAnbGluayc6ICfmj5LlhaXpk77mjqUnLFxuICAgICd0ZXh0JzogJ+aWh+acrCcsXG4gICAgJ2xpbmtUZXh0JzogJ+mTvuaOpeaWh+WtlycsXG4gICAgJ2xpbmtVcmwnOiAn5Zyw5Z2AJyxcbiAgICAncmVtb3ZlTGluayc6ICfnp7vpmaTpk77mjqUnLFxuICAgICdvbCc6ICfmnInluo/liJfooagnLFxuICAgICd1bCc6ICfml6Dluo/liJfooagnLFxuICAgICdzdHJpa2V0aHJvdWdoJzogJ+WIoOmZpOe6v+aWh+WtlycsXG4gICAgJ3RhYmxlJzogJ+ihqOagvCcsXG4gICAgJ2RlbGV0ZVJvdyc6ICfliKDpmaTooYwnLFxuICAgICdpbnNlcnRSb3dBYm92ZSc6ICflnKjkuIrpnaLmj5LlhaXooYwnLFxuICAgICdpbnNlcnRSb3dCZWxvdyc6ICflnKjkuIvpnaLmj5LlhaXooYwnLFxuICAgICdkZWxldGVDb2x1bW4nOiAn5Yig6Zmk5YiXJyxcbiAgICAnaW5zZXJ0Q29sdW1uTGVmdCc6ICflnKjlt6bovrnmj5LlhaXliJcnLFxuICAgICdpbnNlcnRDb2x1bW5SaWdodCc6ICflnKjlj7Povrnmj5LlhaXliJcnLFxuICAgICdkZWxldGVUYWJsZSc6ICfliKDpmaTooajmoLwnLFxuICAgICd0aXRsZSc6ICfmoIfpopgnLFxuICAgICdub3JtYWxUZXh0JzogJ+aZrumAmuaWh+acrCcsXG4gICAgJ3VuZGVybGluZSc6ICfkuIvliJLnur/mloflrZcnLFxuICAgICdhbGlnbm1lbnQnOiAn5rC05bmz5a+56b2QJyxcbiAgICAnYWxpZ25DZW50ZXInOiAn5bGF5LitJyxcbiAgICAnYWxpZ25MZWZ0JzogJ+WxheW3picsXG4gICAgJ2FsaWduUmlnaHQnOiAn5bGF5Y+zJyxcbiAgICAnc2VsZWN0TGFuZ3VhZ2UnOiAn6YCJ5oup56iL5bqP6K+t6KiAJ1xuICB9LFxuICAnZW4tVVMnOiB7XG4gICAgJ2Jsb2NrcXVvdGUnOiAnQmxvY2sgUXVvdGUnLFxuICAgICdib2xkJzogJ0JvbGQnLFxuICAgICdjb2RlJzogJ0NvZGUnLFxuICAgICdjb2xvcic6ICdUZXh0IENvbG9yJyxcbiAgICAnY29sb3JlZFRleHQnOiAnQ29sb3JlZCBUZXh0JyxcbiAgICAnaHInOiAnSG9yaXpvbnRhbCBMaW5lJyxcbiAgICAnaW1hZ2UnOiAnSW5zZXJ0IEltYWdlJyxcbiAgICAnZXh0ZXJuYWxJbWFnZSc6ICdFeHRlcm5hbCBJbWFnZScsXG4gICAgJ3VwbG9hZEltYWdlJzogJ1VwbG9hZCBJbWFnZScsXG4gICAgJ3VwbG9hZEZhaWxlZCc6ICdVcGxvYWQgZmFpbGVkJyxcbiAgICAndXBsb2FkRXJyb3InOiAnRXJyb3Igb2NjdXJzIGR1cmluZyB1cGxvYWQnLFxuICAgICdpbWFnZVVybCc6ICdVcmwnLFxuICAgICdpbWFnZVNpemUnOiAnU2l6ZScsXG4gICAgJ2ltYWdlQWx0JzogJ0FsdCcsXG4gICAgJ3Jlc3RvcmVJbWFnZVNpemUnOiAnUmVzdG9yZSBPcmlnaW4gU2l6ZScsXG4gICAgJ3VwbG9hZGluZyc6ICdVcGxvYWRpbmcnLFxuICAgICdpbmRlbnQnOiAnSW5kZW50JyxcbiAgICAnb3V0ZGVudCc6ICdPdXRkZW50JyxcbiAgICAnaXRhbGljJzogJ0l0YWxpYycsXG4gICAgJ2xpbmsnOiAnSW5zZXJ0IExpbmsnLFxuICAgICd0ZXh0JzogJ1RleHQnLFxuICAgICdsaW5rVGV4dCc6ICdMaW5rIFRleHQnLFxuICAgICdsaW5rVXJsJzogJ0xpbmsgVXJsJyxcbiAgICAncmVtb3ZlTGluayc6ICdSZW1vdmUgTGluaycsXG4gICAgJ29sJzogJ09yZGVyZWQgTGlzdCcsXG4gICAgJ3VsJzogJ1Vub3JkZXJlZCBMaXN0JyxcbiAgICAnc3RyaWtldGhyb3VnaCc6ICdTdHJpa2V0aHJvdWdoJyxcbiAgICAndGFibGUnOiAnVGFibGUnLFxuICAgICdkZWxldGVSb3cnOiAnRGVsZXRlIFJvdycsXG4gICAgJ2luc2VydFJvd0Fib3ZlJzogJ0luc2VydCBSb3cgQWJvdmUnLFxuICAgICdpbnNlcnRSb3dCZWxvdyc6ICdJbnNlcnQgUm93IEJlbG93JyxcbiAgICAnZGVsZXRlQ29sdW1uJzogJ0RlbGV0ZSBDb2x1bW4nLFxuICAgICdpbnNlcnRDb2x1bW5MZWZ0JzogJ0luc2VydCBDb2x1bW4gTGVmdCcsXG4gICAgJ2luc2VydENvbHVtblJpZ2h0JzogJ0luc2VydCBDb2x1bW4gUmlnaHQnLFxuICAgICdkZWxldGVUYWJsZSc6ICdEZWxldGUgVGFibGUnLFxuICAgICd0aXRsZSc6ICdUaXRsZScsXG4gICAgJ25vcm1hbFRleHQnOiAnVGV4dCcsXG4gICAgJ3VuZGVybGluZSc6ICdVbmRlcmxpbmUnLFxuICAgICdhbGlnbm1lbnQnOiAnQWxpZ25tZW50JyxcbiAgICAnYWxpZ25DZW50ZXInOiAnQWxpZ24gQ2VudGVyJyxcbiAgICAnYWxpZ25MZWZ0JzogJ0FsaWduIExlZnQnLFxuICAgICdhbGlnblJpZ2h0JzogJ0FsaWduIFJpZ2h0JyxcbiAgICAnc2VsZWN0TGFuZ3VhZ2UnOiAnU2VsZWN0IExhbmd1YWdlJ1xuICB9XG59O1xuXG5CdXR0b24gPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoQnV0dG9uLCBzdXBlckNsYXNzKTtcblxuICBCdXR0b24ucHJvdG90eXBlLl90cGwgPSB7XG4gICAgaXRlbTogJzxsaT48YSB0YWJpbmRleD1cIi0xXCIgdW5zZWxlY3RhYmxlPVwib25cIiBjbGFzcz1cInRvb2xiYXItaXRlbVwiIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj48c3Bhbj48L3NwYW4+PC9hPjwvbGk+JyxcbiAgICBtZW51V3JhcHBlcjogJzxkaXYgY2xhc3M9XCJ0b29sYmFyLW1lbnVcIj48L2Rpdj4nLFxuICAgIG1lbnVJdGVtOiAnPGxpPjxhIHRhYmluZGV4PVwiLTFcIiB1bnNlbGVjdGFibGU9XCJvblwiIGNsYXNzPVwibWVudS1pdGVtXCIgaHJlZj1cImphdmFzY3JpcHQ6O1wiPjxzcGFuPjwvc3Bhbj48L2E+PC9saT4nLFxuICAgIHNlcGFyYXRvcjogJzxsaT48c3BhbiBjbGFzcz1cInNlcGFyYXRvclwiPjwvc3Bhbj48L2xpPidcbiAgfTtcblxuICBCdXR0b24ucHJvdG90eXBlLm5hbWUgPSAnJztcblxuICBCdXR0b24ucHJvdG90eXBlLmljb24gPSAnJztcblxuICBCdXR0b24ucHJvdG90eXBlLnRpdGxlID0gJyc7XG5cbiAgQnV0dG9uLnByb3RvdHlwZS50ZXh0ID0gJyc7XG5cbiAgQnV0dG9uLnByb3RvdHlwZS5odG1sVGFnID0gJyc7XG5cbiAgQnV0dG9uLnByb3RvdHlwZS5kaXNhYmxlVGFnID0gJyc7XG5cbiAgQnV0dG9uLnByb3RvdHlwZS5tZW51ID0gZmFsc2U7XG5cbiAgQnV0dG9uLnByb3RvdHlwZS5hY3RpdmUgPSBmYWxzZTtcblxuICBCdXR0b24ucHJvdG90eXBlLmRpc2FibGVkID0gZmFsc2U7XG5cbiAgQnV0dG9uLnByb3RvdHlwZS5uZWVkRm9jdXMgPSB0cnVlO1xuXG4gIEJ1dHRvbi5wcm90b3R5cGUuc2hvcnRjdXQgPSBudWxsO1xuXG4gIGZ1bmN0aW9uIEJ1dHRvbihvcHRzKSB7XG4gICAgdGhpcy5lZGl0b3IgPSBvcHRzLmVkaXRvcjtcbiAgICB0aGlzLnRpdGxlID0gdGhpcy5fdCh0aGlzLm5hbWUpO1xuICAgIEJ1dHRvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCBvcHRzKTtcbiAgfVxuXG4gIEJ1dHRvbi5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaywgbGVuLCByZWYsIHRhZztcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHRoaXMuZWwub24oJ21vdXNlZG93bicsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGV4Y2VlZCwgbm9Gb2N1cywgcGFyYW07XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbm9Gb2N1cyA9IF90aGlzLm5lZWRGb2N1cyAmJiAhX3RoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5mb2N1c2VkO1xuICAgICAgICBpZiAoX3RoaXMuZWwuaGFzQ2xhc3MoJ2Rpc2FibGVkJykgfHwgbm9Gb2N1cykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3RoaXMubWVudSkge1xuICAgICAgICAgIF90aGlzLndyYXBwZXIudG9nZ2xlQ2xhc3MoJ21lbnUtb24nKS5zaWJsaW5ncygnbGknKS5yZW1vdmVDbGFzcygnbWVudS1vbicpO1xuICAgICAgICAgIGlmIChfdGhpcy53cmFwcGVyLmlzKCcubWVudS1vbicpKSB7XG4gICAgICAgICAgICBleGNlZWQgPSBfdGhpcy5tZW51V3JhcHBlci5vZmZzZXQoKS5sZWZ0ICsgX3RoaXMubWVudVdyYXBwZXIub3V0ZXJXaWR0aCgpICsgNSAtIF90aGlzLmVkaXRvci53cmFwcGVyLm9mZnNldCgpLmxlZnQgLSBfdGhpcy5lZGl0b3Iud3JhcHBlci5vdXRlcldpZHRoKCk7XG4gICAgICAgICAgICBpZiAoZXhjZWVkID4gMCkge1xuICAgICAgICAgICAgICBfdGhpcy5tZW51V3JhcHBlci5jc3Moe1xuICAgICAgICAgICAgICAgICdsZWZ0JzogJ2F1dG8nLFxuICAgICAgICAgICAgICAgICdyaWdodCc6IDBcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdGhpcy50cmlnZ2VyKCdtZW51ZXhwYW5kJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBwYXJhbSA9IF90aGlzLmVsLmRhdGEoJ3BhcmFtJyk7XG4gICAgICAgIF90aGlzLmNvbW1hbmQocGFyYW0pO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLndyYXBwZXIub24oJ2NsaWNrJywgJ2EubWVudS1pdGVtJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgYnRuLCBub0ZvY3VzLCBwYXJhbTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBidG4gPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgIF90aGlzLndyYXBwZXIucmVtb3ZlQ2xhc3MoJ21lbnUtb24nKTtcbiAgICAgICAgbm9Gb2N1cyA9IF90aGlzLm5lZWRGb2N1cyAmJiAhX3RoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5mb2N1c2VkO1xuICAgICAgICBpZiAoYnRuLmhhc0NsYXNzKCdkaXNhYmxlZCcpIHx8IG5vRm9jdXMpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuZWRpdG9yLnRvb2xiYXIud3JhcHBlci5yZW1vdmVDbGFzcygnbWVudS1vbicpO1xuICAgICAgICBwYXJhbSA9IGJ0bi5kYXRhKCdwYXJhbScpO1xuICAgICAgICBfdGhpcy5jb21tYW5kKHBhcmFtKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy53cmFwcGVyLm9uKCdtb3VzZWRvd24nLCAnYS5tZW51LWl0ZW0nLCBmdW5jdGlvbihlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gICAgdGhpcy5lZGl0b3Iub24oJ2JsdXInLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVkaXRvckFjdGl2ZTtcbiAgICAgICAgZWRpdG9yQWN0aXZlID0gX3RoaXMuZWRpdG9yLmJvZHkuaXMoJzp2aXNpYmxlJykgJiYgX3RoaXMuZWRpdG9yLmJvZHkuaXMoJ1tjb250ZW50ZWRpdGFibGVdJyk7XG4gICAgICAgIGlmICghZWRpdG9yQWN0aXZlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLnNldEFjdGl2ZShmYWxzZSk7XG4gICAgICAgIHJldHVybiBfdGhpcy5zZXREaXNhYmxlZChmYWxzZSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICBpZiAodGhpcy5zaG9ydGN1dCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmVkaXRvci5pbnB1dE1hbmFnZXIuYWRkU2hvcnRjdXQodGhpcy5zaG9ydGN1dCwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgX3RoaXMuZWwubW91c2Vkb3duKCk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH1cbiAgICByZWYgPSB0aGlzLmh0bWxUYWcuc3BsaXQoJywnKTtcbiAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgIHRhZyA9IHJlZltrXTtcbiAgICAgIHRhZyA9ICQudHJpbSh0YWcpO1xuICAgICAgaWYgKHRhZyAmJiAkLmluQXJyYXkodGFnLCB0aGlzLmVkaXRvci5mb3JtYXR0ZXIuX2FsbG93ZWRUYWdzKSA8IDApIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZm9ybWF0dGVyLl9hbGxvd2VkVGFncy5wdXNoKHRhZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVkaXRvci5vbignc2VsZWN0aW9uY2hhbmdlZCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKF90aGlzLmVkaXRvci5pbnB1dE1hbmFnZXIuZm9jdXNlZCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5fc3RhdHVzKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIEJ1dHRvbi5wcm90b3R5cGUuaWNvbkNsYXNzT2YgPSBmdW5jdGlvbihpY29uKSB7XG4gICAgaWYgKGljb24pIHtcbiAgICAgIHJldHVybiBcInNpbWRpdG9yLWljb24gc2ltZGl0b3ItaWNvbi1cIiArIGljb247XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH07XG5cbiAgQnV0dG9uLnByb3RvdHlwZS5zZXRJY29uID0gZnVuY3Rpb24oaWNvbikge1xuICAgIHJldHVybiB0aGlzLmVsLmZpbmQoJ3NwYW4nKS5yZW1vdmVDbGFzcygpLmFkZENsYXNzKHRoaXMuaWNvbkNsYXNzT2YoaWNvbikpLnRleHQodGhpcy50ZXh0KTtcbiAgfTtcblxuICBCdXR0b24ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMud3JhcHBlciA9ICQodGhpcy5fdHBsLml0ZW0pLmFwcGVuZFRvKHRoaXMuZWRpdG9yLnRvb2xiYXIubGlzdCk7XG4gICAgdGhpcy5lbCA9IHRoaXMud3JhcHBlci5maW5kKCdhLnRvb2xiYXItaXRlbScpO1xuICAgIHRoaXMuZWwuYXR0cigndGl0bGUnLCB0aGlzLnRpdGxlKS5hZGRDbGFzcyhcInRvb2xiYXItaXRlbS1cIiArIHRoaXMubmFtZSkuZGF0YSgnYnV0dG9uJywgdGhpcyk7XG4gICAgdGhpcy5zZXRJY29uKHRoaXMuaWNvbik7XG4gICAgaWYgKCF0aGlzLm1lbnUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5tZW51V3JhcHBlciA9ICQodGhpcy5fdHBsLm1lbnVXcmFwcGVyKS5hcHBlbmRUbyh0aGlzLndyYXBwZXIpO1xuICAgIHRoaXMubWVudVdyYXBwZXIuYWRkQ2xhc3MoXCJ0b29sYmFyLW1lbnUtXCIgKyB0aGlzLm5hbWUpO1xuICAgIHJldHVybiB0aGlzLnJlbmRlck1lbnUoKTtcbiAgfTtcblxuICBCdXR0b24ucHJvdG90eXBlLnJlbmRlck1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgJG1lbnVCdG5FbCwgJG1lbnVJdGVtRWwsIGssIGxlbiwgbWVudUl0ZW0sIHJlZiwgcmVmMSwgcmVzdWx0cztcbiAgICBpZiAoISQuaXNBcnJheSh0aGlzLm1lbnUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubWVudUVsID0gJCgnPHVsLz4nKS5hcHBlbmRUbyh0aGlzLm1lbnVXcmFwcGVyKTtcbiAgICByZWYgPSB0aGlzLm1lbnU7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgbWVudUl0ZW0gPSByZWZba107XG4gICAgICBpZiAobWVudUl0ZW0gPT09ICd8Jykge1xuICAgICAgICAkKHRoaXMuX3RwbC5zZXBhcmF0b3IpLmFwcGVuZFRvKHRoaXMubWVudUVsKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICAkbWVudUl0ZW1FbCA9ICQodGhpcy5fdHBsLm1lbnVJdGVtKS5hcHBlbmRUbyh0aGlzLm1lbnVFbCk7XG4gICAgICAkbWVudUJ0bkVsID0gJG1lbnVJdGVtRWwuZmluZCgnYS5tZW51LWl0ZW0nKS5hdHRyKHtcbiAgICAgICAgJ3RpdGxlJzogKHJlZjEgPSBtZW51SXRlbS50aXRsZSkgIT0gbnVsbCA/IHJlZjEgOiBtZW51SXRlbS50ZXh0LFxuICAgICAgICAnZGF0YS1wYXJhbSc6IG1lbnVJdGVtLnBhcmFtXG4gICAgICB9KS5hZGRDbGFzcygnbWVudS1pdGVtLScgKyBtZW51SXRlbS5uYW1lKTtcbiAgICAgIGlmIChtZW51SXRlbS5pY29uKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCgkbWVudUJ0bkVsLmZpbmQoJ3NwYW4nKS5hZGRDbGFzcyh0aGlzLmljb25DbGFzc09mKG1lbnVJdGVtLmljb24pKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRzLnB1c2goJG1lbnVCdG5FbC5maW5kKCdzcGFuJykudGV4dChtZW51SXRlbS50ZXh0KSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIEJ1dHRvbi5wcm90b3R5cGUuc2V0QWN0aXZlID0gZnVuY3Rpb24oYWN0aXZlKSB7XG4gICAgaWYgKGFjdGl2ZSA9PT0gdGhpcy5hY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5hY3RpdmUgPSBhY3RpdmU7XG4gICAgcmV0dXJuIHRoaXMuZWwudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScsIHRoaXMuYWN0aXZlKTtcbiAgfTtcblxuICBCdXR0b24ucHJvdG90eXBlLnNldERpc2FibGVkID0gZnVuY3Rpb24oZGlzYWJsZWQpIHtcbiAgICBpZiAoZGlzYWJsZWQgPT09IHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5kaXNhYmxlZCA9IGRpc2FibGVkO1xuICAgIHJldHVybiB0aGlzLmVsLnRvZ2dsZUNsYXNzKCdkaXNhYmxlZCcsIHRoaXMuZGlzYWJsZWQpO1xuICB9O1xuXG4gIEJ1dHRvbi5wcm90b3R5cGUuX2Rpc2FibGVTdGF0dXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGlzYWJsZWQsIGVuZE5vZGVzLCBzdGFydE5vZGVzO1xuICAgIHN0YXJ0Tm9kZXMgPSB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc3RhcnROb2RlcygpO1xuICAgIGVuZE5vZGVzID0gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLmVuZE5vZGVzKCk7XG4gICAgZGlzYWJsZWQgPSBzdGFydE5vZGVzLmZpbHRlcih0aGlzLmRpc2FibGVUYWcpLmxlbmd0aCA+IDAgfHwgZW5kTm9kZXMuZmlsdGVyKHRoaXMuZGlzYWJsZVRhZykubGVuZ3RoID4gMDtcbiAgICB0aGlzLnNldERpc2FibGVkKGRpc2FibGVkKTtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5zZXRBY3RpdmUoZmFsc2UpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZDtcbiAgfTtcblxuICBCdXR0b24ucHJvdG90eXBlLl9hY3RpdmVTdGF0dXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWN0aXZlLCBlbmROb2RlLCBlbmROb2Rlcywgc3RhcnROb2RlLCBzdGFydE5vZGVzO1xuICAgIHN0YXJ0Tm9kZXMgPSB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc3RhcnROb2RlcygpO1xuICAgIGVuZE5vZGVzID0gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLmVuZE5vZGVzKCk7XG4gICAgc3RhcnROb2RlID0gc3RhcnROb2Rlcy5maWx0ZXIodGhpcy5odG1sVGFnKTtcbiAgICBlbmROb2RlID0gZW5kTm9kZXMuZmlsdGVyKHRoaXMuaHRtbFRhZyk7XG4gICAgYWN0aXZlID0gc3RhcnROb2RlLmxlbmd0aCA+IDAgJiYgZW5kTm9kZS5sZW5ndGggPiAwICYmIHN0YXJ0Tm9kZS5pcyhlbmROb2RlKTtcbiAgICB0aGlzLm5vZGUgPSBhY3RpdmUgPyBzdGFydE5vZGUgOiBudWxsO1xuICAgIHRoaXMuc2V0QWN0aXZlKGFjdGl2ZSk7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlO1xuICB9O1xuXG4gIEJ1dHRvbi5wcm90b3R5cGUuX3N0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2Rpc2FibGVTdGF0dXMoKTtcbiAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlU3RhdHVzKCk7XG4gIH07XG5cbiAgQnV0dG9uLnByb3RvdHlwZS5jb21tYW5kID0gZnVuY3Rpb24ocGFyYW0pIHt9O1xuXG4gIEJ1dHRvbi5wcm90b3R5cGUuX3QgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgcmVmLCByZXN1bHQ7XG4gICAgYXJncyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIHJlc3VsdCA9IEJ1dHRvbi5fX3N1cGVyX18uX3QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJlc3VsdCA9IChyZWYgPSB0aGlzLmVkaXRvcikuX3QuYXBwbHkocmVmLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICByZXR1cm4gQnV0dG9uO1xuXG59KShTaW1wbGVNb2R1bGUpO1xuXG5TaW1kaXRvci5CdXR0b24gPSBCdXR0b247XG5cblBvcG92ZXIgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoUG9wb3Zlciwgc3VwZXJDbGFzcyk7XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUub2Zmc2V0ID0ge1xuICAgIHRvcDogNCxcbiAgICBsZWZ0OiAwXG4gIH07XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUudGFyZ2V0ID0gbnVsbDtcblxuICBQb3BvdmVyLnByb3RvdHlwZS5hY3RpdmUgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBQb3BvdmVyKG9wdHMpIHtcbiAgICB0aGlzLmJ1dHRvbiA9IG9wdHMuYnV0dG9uO1xuICAgIHRoaXMuZWRpdG9yID0gb3B0cy5idXR0b24uZWRpdG9yO1xuICAgIFBvcG92ZXIuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgb3B0cyk7XG4gIH1cblxuICBQb3BvdmVyLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWwgPSAkKCc8ZGl2IGNsYXNzPVwic2ltZGl0b3ItcG9wb3ZlclwiPjwvZGl2PicpLmFwcGVuZFRvKHRoaXMuZWRpdG9yLmVsKS5kYXRhKCdwb3BvdmVyJywgdGhpcyk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICB0aGlzLmVsLm9uKCdtb3VzZWVudGVyJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gX3RoaXMuZWwuYWRkQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gdGhpcy5lbC5vbignbW91c2VsZWF2ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLmVsLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgUG9wb3Zlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7fTtcblxuICBQb3BvdmVyLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oJHRhcmdldCwgcG9zaXRpb24pIHtcbiAgICBpZiAocG9zaXRpb24gPT0gbnVsbCkge1xuICAgICAgcG9zaXRpb24gPSAnYm90dG9tJztcbiAgICB9XG4gICAgaWYgKCR0YXJnZXQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmVsLnNpYmxpbmdzKCcuc2ltZGl0b3ItcG9wb3ZlcicpLmVhY2goZnVuY3Rpb24oaSwgcG9wb3Zlcikge1xuICAgICAgcG9wb3ZlciA9ICQocG9wb3ZlcikuZGF0YSgncG9wb3ZlcicpO1xuICAgICAgaWYgKHBvcG92ZXIuYWN0aXZlKSB7XG4gICAgICAgIHJldHVybiBwb3BvdmVyLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAodGhpcy5hY3RpdmUgJiYgdGhpcy50YXJnZXQpIHtcbiAgICAgIHRoaXMudGFyZ2V0LnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgIH1cbiAgICB0aGlzLnRhcmdldCA9ICR0YXJnZXQuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICB0aGlzLnJlZnJlc2gocG9zaXRpb24pO1xuICAgICAgcmV0dXJuIHRoaXMudHJpZ2dlcigncG9wb3ZlcnNob3cnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICAgICAgdGhpcy5lbC5jc3Moe1xuICAgICAgICBsZWZ0OiAtOTk5OVxuICAgICAgfSkuc2hvdygpO1xuICAgICAgdGhpcy5lZGl0b3IudXRpbC5yZWZsb3coKTtcbiAgICAgIHRoaXMucmVmcmVzaChwb3NpdGlvbik7XG4gICAgICByZXR1cm4gdGhpcy50cmlnZ2VyKCdwb3BvdmVyc2hvdycpO1xuICAgIH1cbiAgfTtcblxuICBQb3BvdmVyLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy50YXJnZXQpIHtcbiAgICAgIHRoaXMudGFyZ2V0LnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgIH1cbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLmVsLmhpZGUoKTtcbiAgICByZXR1cm4gdGhpcy50cmlnZ2VyKCdwb3BvdmVyaGlkZScpO1xuICB9O1xuXG4gIFBvcG92ZXIucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbihwb3NpdGlvbikge1xuICAgIHZhciBlZGl0b3JPZmZzZXQsIGxlZnQsIG1heExlZnQsIHRhcmdldEgsIHRhcmdldE9mZnNldCwgdG9wO1xuICAgIGlmIChwb3NpdGlvbiA9PSBudWxsKSB7XG4gICAgICBwb3NpdGlvbiA9ICdib3R0b20nO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuYWN0aXZlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVkaXRvck9mZnNldCA9IHRoaXMuZWRpdG9yLmVsLm9mZnNldCgpO1xuICAgIHRhcmdldE9mZnNldCA9IHRoaXMudGFyZ2V0Lm9mZnNldCgpO1xuICAgIHRhcmdldEggPSB0aGlzLnRhcmdldC5vdXRlckhlaWdodCgpO1xuICAgIGlmIChwb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICAgIHRvcCA9IHRhcmdldE9mZnNldC50b3AgLSBlZGl0b3JPZmZzZXQudG9wICsgdGFyZ2V0SDtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAndG9wJykge1xuICAgICAgdG9wID0gdGFyZ2V0T2Zmc2V0LnRvcCAtIGVkaXRvck9mZnNldC50b3AgLSB0aGlzLmVsLmhlaWdodCgpO1xuICAgIH1cbiAgICBtYXhMZWZ0ID0gdGhpcy5lZGl0b3Iud3JhcHBlci53aWR0aCgpIC0gdGhpcy5lbC5vdXRlcldpZHRoKCkgLSAxMDtcbiAgICBsZWZ0ID0gTWF0aC5taW4odGFyZ2V0T2Zmc2V0LmxlZnQgLSBlZGl0b3JPZmZzZXQubGVmdCwgbWF4TGVmdCk7XG4gICAgcmV0dXJuIHRoaXMuZWwuY3NzKHtcbiAgICAgIHRvcDogdG9wICsgdGhpcy5vZmZzZXQudG9wLFxuICAgICAgbGVmdDogbGVmdCArIHRoaXMub2Zmc2V0LmxlZnRcbiAgICB9KTtcbiAgfTtcblxuICBQb3BvdmVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50YXJnZXQgPSBudWxsO1xuICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5lZGl0b3Iub2ZmKCcubGlua3BvcG92ZXInKTtcbiAgICByZXR1cm4gdGhpcy5lbC5yZW1vdmUoKTtcbiAgfTtcblxuICBQb3BvdmVyLnByb3RvdHlwZS5fdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCByZWYsIHJlc3VsdDtcbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgcmVzdWx0ID0gUG9wb3Zlci5fX3N1cGVyX18uX3QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHJlc3VsdCA9IChyZWYgPSB0aGlzLmJ1dHRvbikuX3QuYXBwbHkocmVmLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICByZXR1cm4gUG9wb3ZlcjtcblxufSkoU2ltcGxlTW9kdWxlKTtcblxuU2ltZGl0b3IuUG9wb3ZlciA9IFBvcG92ZXI7XG5cblRpdGxlQnV0dG9uID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKFRpdGxlQnV0dG9uLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBUaXRsZUJ1dHRvbigpIHtcbiAgICByZXR1cm4gVGl0bGVCdXR0b24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBUaXRsZUJ1dHRvbi5wcm90b3R5cGUubmFtZSA9ICd0aXRsZSc7XG5cbiAgVGl0bGVCdXR0b24ucHJvdG90eXBlLmh0bWxUYWcgPSAnaDEsIGgyLCBoMywgaDQnO1xuXG4gIFRpdGxlQnV0dG9uLnByb3RvdHlwZS5kaXNhYmxlVGFnID0gJ3ByZSwgdGFibGUnO1xuXG4gIFRpdGxlQnV0dG9uLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubWVudSA9IFtcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ25vcm1hbCcsXG4gICAgICAgIHRleHQ6IHRoaXMuX3QoJ25vcm1hbFRleHQnKSxcbiAgICAgICAgcGFyYW06ICdwJ1xuICAgICAgfSwgJ3wnLCB7XG4gICAgICAgIG5hbWU6ICdoMScsXG4gICAgICAgIHRleHQ6IHRoaXMuX3QoJ3RpdGxlJykgKyAnIDEnLFxuICAgICAgICBwYXJhbTogJ2gxJ1xuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnaDInLFxuICAgICAgICB0ZXh0OiB0aGlzLl90KCd0aXRsZScpICsgJyAyJyxcbiAgICAgICAgcGFyYW06ICdoMidcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ2gzJyxcbiAgICAgICAgdGV4dDogdGhpcy5fdCgndGl0bGUnKSArICcgMycsXG4gICAgICAgIHBhcmFtOiAnaDMnXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdoNCcsXG4gICAgICAgIHRleHQ6IHRoaXMuX3QoJ3RpdGxlJykgKyAnIDQnLFxuICAgICAgICBwYXJhbTogJ2g0J1xuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnaDUnLFxuICAgICAgICB0ZXh0OiB0aGlzLl90KCd0aXRsZScpICsgJyA1JyxcbiAgICAgICAgcGFyYW06ICdoNSdcbiAgICAgIH1cbiAgICBdO1xuICAgIHJldHVybiBUaXRsZUJ1dHRvbi5fX3N1cGVyX18uX2luaXQuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBUaXRsZUJ1dHRvbi5wcm90b3R5cGUuc2V0QWN0aXZlID0gZnVuY3Rpb24oYWN0aXZlLCBwYXJhbSkge1xuICAgIFRpdGxlQnV0dG9uLl9fc3VwZXJfXy5zZXRBY3RpdmUuY2FsbCh0aGlzLCBhY3RpdmUpO1xuICAgIGlmIChhY3RpdmUpIHtcbiAgICAgIHBhcmFtIHx8IChwYXJhbSA9IHRoaXMubm9kZVswXS50YWdOYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgIH1cbiAgICB0aGlzLmVsLnJlbW92ZUNsYXNzKCdhY3RpdmUtcCBhY3RpdmUtaDEgYWN0aXZlLWgyIGFjdGl2ZS1oMycpO1xuICAgIGlmIChhY3RpdmUpIHtcbiAgICAgIHJldHVybiB0aGlzLmVsLmFkZENsYXNzKCdhY3RpdmUgYWN0aXZlLScgKyBwYXJhbSk7XG4gICAgfVxuICB9O1xuXG4gIFRpdGxlQnV0dG9uLnByb3RvdHlwZS5jb21tYW5kID0gZnVuY3Rpb24ocGFyYW0pIHtcbiAgICB2YXIgJHJvb3ROb2RlcztcbiAgICAkcm9vdE5vZGVzID0gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJvb3ROb2RlcygpO1xuICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5zYXZlKCk7XG4gICAgJHJvb3ROb2Rlcy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIG5vZGUpIHtcbiAgICAgICAgdmFyICRub2RlO1xuICAgICAgICAkbm9kZSA9ICQobm9kZSk7XG4gICAgICAgIGlmICgkbm9kZS5pcygnYmxvY2txdW90ZScpIHx8ICRub2RlLmlzKHBhcmFtKSB8fCAkbm9kZS5pcyhfdGhpcy5kaXNhYmxlVGFnKSB8fCBfdGhpcy5lZGl0b3IudXRpbC5pc0RlY29yYXRlZE5vZGUoJG5vZGUpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkKCc8JyArIHBhcmFtICsgJy8+JykuYXBwZW5kKCRub2RlLmNvbnRlbnRzKCkpLnJlcGxhY2VBbGwoJG5vZGUpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJlc3RvcmUoKTtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IudHJpZ2dlcigndmFsdWVjaGFuZ2VkJyk7XG4gIH07XG5cbiAgcmV0dXJuIFRpdGxlQnV0dG9uO1xuXG59KShCdXR0b24pO1xuXG5TaW1kaXRvci5Ub29sYmFyLmFkZEJ1dHRvbihUaXRsZUJ1dHRvbik7XG5cbkJvbGRCdXR0b24gPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoQm9sZEJ1dHRvbiwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gQm9sZEJ1dHRvbigpIHtcbiAgICByZXR1cm4gQm9sZEJ1dHRvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIEJvbGRCdXR0b24ucHJvdG90eXBlLm5hbWUgPSAnYm9sZCc7XG5cbiAgQm9sZEJ1dHRvbi5wcm90b3R5cGUuaWNvbiA9ICdib2xkJztcblxuICBCb2xkQnV0dG9uLnByb3RvdHlwZS5odG1sVGFnID0gJ2IsIHN0cm9uZyc7XG5cbiAgQm9sZEJ1dHRvbi5wcm90b3R5cGUuZGlzYWJsZVRhZyA9ICdwcmUnO1xuXG4gIEJvbGRCdXR0b24ucHJvdG90eXBlLnNob3J0Y3V0ID0gJ2NtZCtiJztcblxuICBCb2xkQnV0dG9uLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmVkaXRvci51dGlsLm9zLm1hYykge1xuICAgICAgdGhpcy50aXRsZSA9IHRoaXMudGl0bGUgKyAnICggQ21kICsgYiApJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50aXRsZSA9IHRoaXMudGl0bGUgKyAnICggQ3RybCArIGIgKSc7XG4gICAgICB0aGlzLnNob3J0Y3V0ID0gJ2N0cmwrYic7XG4gICAgfVxuICAgIHJldHVybiBCb2xkQnV0dG9uLl9fc3VwZXJfXy5faW5pdC5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIEJvbGRCdXR0b24ucHJvdG90eXBlLl9hY3RpdmVTdGF0dXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWN0aXZlO1xuICAgIGFjdGl2ZSA9IGRvY3VtZW50LnF1ZXJ5Q29tbWFuZFN0YXRlKCdib2xkJykgPT09IHRydWU7XG4gICAgdGhpcy5zZXRBY3RpdmUoYWN0aXZlKTtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmU7XG4gIH07XG5cbiAgQm9sZEJ1dHRvbi5wcm90b3R5cGUuY29tbWFuZCA9IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdib2xkJyk7XG4gICAgaWYgKCF0aGlzLmVkaXRvci51dGlsLnN1cHBvcnQub25pbnB1dCkge1xuICAgICAgdGhpcy5lZGl0b3IudHJpZ2dlcigndmFsdWVjaGFuZ2VkJyk7XG4gICAgfVxuICAgIHJldHVybiAkKGRvY3VtZW50KS50cmlnZ2VyKCdzZWxlY3Rpb25jaGFuZ2UnKTtcbiAgfTtcblxuICByZXR1cm4gQm9sZEJ1dHRvbjtcblxufSkoQnV0dG9uKTtcblxuU2ltZGl0b3IuVG9vbGJhci5hZGRCdXR0b24oQm9sZEJ1dHRvbik7XG5cbkl0YWxpY0J1dHRvbiA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChJdGFsaWNCdXR0b24sIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIEl0YWxpY0J1dHRvbigpIHtcbiAgICByZXR1cm4gSXRhbGljQnV0dG9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgSXRhbGljQnV0dG9uLnByb3RvdHlwZS5uYW1lID0gJ2l0YWxpYyc7XG5cbiAgSXRhbGljQnV0dG9uLnByb3RvdHlwZS5pY29uID0gJ2l0YWxpYyc7XG5cbiAgSXRhbGljQnV0dG9uLnByb3RvdHlwZS5odG1sVGFnID0gJ2knO1xuXG4gIEl0YWxpY0J1dHRvbi5wcm90b3R5cGUuZGlzYWJsZVRhZyA9ICdwcmUnO1xuXG4gIEl0YWxpY0J1dHRvbi5wcm90b3R5cGUuc2hvcnRjdXQgPSAnY21kK2knO1xuXG4gIEl0YWxpY0J1dHRvbi5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5lZGl0b3IudXRpbC5vcy5tYWMpIHtcbiAgICAgIHRoaXMudGl0bGUgPSB0aGlzLnRpdGxlICsgXCIgKCBDbWQgKyBpIClcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50aXRsZSA9IHRoaXMudGl0bGUgKyBcIiAoIEN0cmwgKyBpIClcIjtcbiAgICAgIHRoaXMuc2hvcnRjdXQgPSAnY3RybCtpJztcbiAgICB9XG4gICAgcmV0dXJuIEl0YWxpY0J1dHRvbi5fX3N1cGVyX18uX2luaXQuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBJdGFsaWNCdXR0b24ucHJvdG90eXBlLl9hY3RpdmVTdGF0dXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWN0aXZlO1xuICAgIGFjdGl2ZSA9IGRvY3VtZW50LnF1ZXJ5Q29tbWFuZFN0YXRlKCdpdGFsaWMnKSA9PT0gdHJ1ZTtcbiAgICB0aGlzLnNldEFjdGl2ZShhY3RpdmUpO1xuICAgIHJldHVybiB0aGlzLmFjdGl2ZTtcbiAgfTtcblxuICBJdGFsaWNCdXR0b24ucHJvdG90eXBlLmNvbW1hbmQgPSBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnaXRhbGljJyk7XG4gICAgaWYgKCF0aGlzLmVkaXRvci51dGlsLnN1cHBvcnQub25pbnB1dCkge1xuICAgICAgdGhpcy5lZGl0b3IudHJpZ2dlcigndmFsdWVjaGFuZ2VkJyk7XG4gICAgfVxuICAgIHJldHVybiAkKGRvY3VtZW50KS50cmlnZ2VyKCdzZWxlY3Rpb25jaGFuZ2UnKTtcbiAgfTtcblxuICByZXR1cm4gSXRhbGljQnV0dG9uO1xuXG59KShCdXR0b24pO1xuXG5TaW1kaXRvci5Ub29sYmFyLmFkZEJ1dHRvbihJdGFsaWNCdXR0b24pO1xuXG5VbmRlcmxpbmVCdXR0b24gPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoVW5kZXJsaW5lQnV0dG9uLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBVbmRlcmxpbmVCdXR0b24oKSB7XG4gICAgcmV0dXJuIFVuZGVybGluZUJ1dHRvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIFVuZGVybGluZUJ1dHRvbi5wcm90b3R5cGUubmFtZSA9ICd1bmRlcmxpbmUnO1xuXG4gIFVuZGVybGluZUJ1dHRvbi5wcm90b3R5cGUuaWNvbiA9ICd1bmRlcmxpbmUnO1xuXG4gIFVuZGVybGluZUJ1dHRvbi5wcm90b3R5cGUuaHRtbFRhZyA9ICd1JztcblxuICBVbmRlcmxpbmVCdXR0b24ucHJvdG90eXBlLmRpc2FibGVUYWcgPSAncHJlJztcblxuICBVbmRlcmxpbmVCdXR0b24ucHJvdG90eXBlLnNob3J0Y3V0ID0gJ2NtZCt1JztcblxuICBVbmRlcmxpbmVCdXR0b24ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmVkaXRvci51dGlsLm9zLm1hYykge1xuICAgICAgdGhpcy50aXRsZSA9IHRoaXMudGl0bGUgKyAnICggQ21kICsgdSApJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50aXRsZSA9IHRoaXMudGl0bGUgKyAnICggQ3RybCArIHUgKSc7XG4gICAgICB0aGlzLnNob3J0Y3V0ID0gJ2N0cmwrdSc7XG4gICAgfVxuICAgIHJldHVybiBVbmRlcmxpbmVCdXR0b24uX19zdXBlcl9fLnJlbmRlci5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIFVuZGVybGluZUJ1dHRvbi5wcm90b3R5cGUuX2FjdGl2ZVN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhY3RpdmU7XG4gICAgYWN0aXZlID0gZG9jdW1lbnQucXVlcnlDb21tYW5kU3RhdGUoJ3VuZGVybGluZScpID09PSB0cnVlO1xuICAgIHRoaXMuc2V0QWN0aXZlKGFjdGl2ZSk7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlO1xuICB9O1xuXG4gIFVuZGVybGluZUJ1dHRvbi5wcm90b3R5cGUuY29tbWFuZCA9IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCd1bmRlcmxpbmUnKTtcbiAgICBpZiAoIXRoaXMuZWRpdG9yLnV0aWwuc3VwcG9ydC5vbmlucHV0KSB7XG4gICAgICB0aGlzLmVkaXRvci50cmlnZ2VyKCd2YWx1ZWNoYW5nZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuICQoZG9jdW1lbnQpLnRyaWdnZXIoJ3NlbGVjdGlvbmNoYW5nZScpO1xuICB9O1xuXG4gIHJldHVybiBVbmRlcmxpbmVCdXR0b247XG5cbn0pKEJ1dHRvbik7XG5cblNpbWRpdG9yLlRvb2xiYXIuYWRkQnV0dG9uKFVuZGVybGluZUJ1dHRvbik7XG5cbkNvbG9yQnV0dG9uID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKENvbG9yQnV0dG9uLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBDb2xvckJ1dHRvbigpIHtcbiAgICByZXR1cm4gQ29sb3JCdXR0b24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBDb2xvckJ1dHRvbi5wcm90b3R5cGUubmFtZSA9ICdjb2xvcic7XG5cbiAgQ29sb3JCdXR0b24ucHJvdG90eXBlLmljb24gPSAndGludCc7XG5cbiAgQ29sb3JCdXR0b24ucHJvdG90eXBlLmRpc2FibGVUYWcgPSAncHJlJztcblxuICBDb2xvckJ1dHRvbi5wcm90b3R5cGUubWVudSA9IHRydWU7XG5cbiAgQ29sb3JCdXR0b24ucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzO1xuICAgIGFyZ3MgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICByZXR1cm4gQ29sb3JCdXR0b24uX19zdXBlcl9fLnJlbmRlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfTtcblxuICBDb2xvckJ1dHRvbi5wcm90b3R5cGUucmVuZGVyTWVudSA9IGZ1bmN0aW9uKCkge1xuICAgICQoJzx1bCBjbGFzcz1cImNvbG9yLWxpc3RcIj5cXG4gIDxsaT48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJmb250LWNvbG9yIGZvbnQtY29sb3ItMVwiPjwvYT48L2xpPlxcbiAgPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImZvbnQtY29sb3IgZm9udC1jb2xvci0yXCI+PC9hPjwvbGk+XFxuICA8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwiZm9udC1jb2xvciBmb250LWNvbG9yLTNcIj48L2E+PC9saT5cXG4gIDxsaT48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJmb250LWNvbG9yIGZvbnQtY29sb3ItNFwiPjwvYT48L2xpPlxcbiAgPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImZvbnQtY29sb3IgZm9udC1jb2xvci01XCI+PC9hPjwvbGk+XFxuICA8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiIGNsYXNzPVwiZm9udC1jb2xvciBmb250LWNvbG9yLTZcIj48L2E+PC9saT5cXG4gIDxsaT48YSBocmVmPVwiamF2YXNjcmlwdDo7XCIgY2xhc3M9XCJmb250LWNvbG9yIGZvbnQtY29sb3ItN1wiPjwvYT48L2xpPlxcbiAgPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIiBjbGFzcz1cImZvbnQtY29sb3IgZm9udC1jb2xvci1kZWZhdWx0XCI+PC9hPjwvbGk+XFxuPC91bD4nKS5hcHBlbmRUbyh0aGlzLm1lbnVXcmFwcGVyKTtcbiAgICB0aGlzLm1lbnVXcmFwcGVyLm9uKCdtb3VzZWRvd24nLCAnLmNvbG9yLWxpc3QnLCBmdW5jdGlvbihlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMubWVudVdyYXBwZXIub24oJ2NsaWNrJywgJy5mb250LWNvbG9yJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJGxpbmssICRwLCBoZXgsIHJhbmdlLCByZ2IsIHRleHROb2RlO1xuICAgICAgICBfdGhpcy53cmFwcGVyLnJlbW92ZUNsYXNzKCdtZW51LW9uJyk7XG4gICAgICAgICRsaW5rID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICBpZiAoJGxpbmsuaGFzQ2xhc3MoJ2ZvbnQtY29sb3ItZGVmYXVsdCcpKSB7XG4gICAgICAgICAgJHAgPSBfdGhpcy5lZGl0b3IuYm9keS5maW5kKCdwLCBsaScpO1xuICAgICAgICAgIGlmICghKCRwLmxlbmd0aCA+IDApKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJnYiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCRwWzBdLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdjb2xvcicpO1xuICAgICAgICAgIGhleCA9IF90aGlzLl9jb252ZXJ0UmdiVG9IZXgocmdiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZ2IgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSgkbGlua1swXSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZSgnYmFja2dyb3VuZC1jb2xvcicpO1xuICAgICAgICAgIGhleCA9IF90aGlzLl9jb252ZXJ0UmdiVG9IZXgocmdiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWhleCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByYW5nZSA9IF90aGlzLmVkaXRvci5zZWxlY3Rpb24ucmFuZ2UoKTtcbiAgICAgICAgaWYgKCEkbGluay5oYXNDbGFzcygnZm9udC1jb2xvci1kZWZhdWx0JykgJiYgcmFuZ2UuY29sbGFwc2VkKSB7XG4gICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShfdGhpcy5fdCgnY29sb3JlZFRleHQnKSk7XG4gICAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZSh0ZXh0Tm9kZSk7XG4gICAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKHRleHROb2RlKTtcbiAgICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJhbmdlKHJhbmdlKTtcbiAgICAgICAgfVxuICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnc3R5bGVXaXRoQ1NTJywgZmFsc2UsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnZm9yZUNvbG9yJywgZmFsc2UsIGhleCk7XG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdzdHlsZVdpdGhDU1MnLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICBpZiAoIV90aGlzLmVkaXRvci51dGlsLnN1cHBvcnQub25pbnB1dCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5lZGl0b3IudHJpZ2dlcigndmFsdWVjaGFuZ2VkJyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIENvbG9yQnV0dG9uLnByb3RvdHlwZS5fY29udmVydFJnYlRvSGV4ID0gZnVuY3Rpb24ocmdiKSB7XG4gICAgdmFyIG1hdGNoLCByZSwgcmdiVG9IZXg7XG4gICAgcmUgPSAvcmdiXFwoKFxcZCspLFxccz8oXFxkKyksXFxzPyhcXGQrKVxcKS9nO1xuICAgIG1hdGNoID0gcmUuZXhlYyhyZ2IpO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmdiVG9IZXggPSBmdW5jdGlvbihyLCBnLCBiKSB7XG4gICAgICB2YXIgY29tcG9uZW50VG9IZXg7XG4gICAgICBjb21wb25lbnRUb0hleCA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgdmFyIGhleDtcbiAgICAgICAgaGV4ID0gYy50b1N0cmluZygxNik7XG4gICAgICAgIGlmIChoZXgubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuICcwJyArIGhleDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gaGV4O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuIFwiI1wiICsgY29tcG9uZW50VG9IZXgocikgKyBjb21wb25lbnRUb0hleChnKSArIGNvbXBvbmVudFRvSGV4KGIpO1xuICAgIH07XG4gICAgcmV0dXJuIHJnYlRvSGV4KG1hdGNoWzFdICogMSwgbWF0Y2hbMl0gKiAxLCBtYXRjaFszXSAqIDEpO1xuICB9O1xuXG4gIHJldHVybiBDb2xvckJ1dHRvbjtcblxufSkoQnV0dG9uKTtcblxuU2ltZGl0b3IuVG9vbGJhci5hZGRCdXR0b24oQ29sb3JCdXR0b24pO1xuXG5MaXN0QnV0dG9uID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKExpc3RCdXR0b24sIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIExpc3RCdXR0b24oKSB7XG4gICAgcmV0dXJuIExpc3RCdXR0b24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBMaXN0QnV0dG9uLnByb3RvdHlwZS50eXBlID0gJyc7XG5cbiAgTGlzdEJ1dHRvbi5wcm90b3R5cGUuZGlzYWJsZVRhZyA9ICdwcmUsIHRhYmxlJztcblxuICBMaXN0QnV0dG9uLnByb3RvdHlwZS5jb21tYW5kID0gZnVuY3Rpb24ocGFyYW0pIHtcbiAgICB2YXIgJGxpc3QsICRyb290Tm9kZXMsIGFub3RoZXJUeXBlO1xuICAgICRyb290Tm9kZXMgPSB0aGlzLmVkaXRvci5zZWxlY3Rpb24uYmxvY2tOb2RlcygpO1xuICAgIGFub3RoZXJUeXBlID0gdGhpcy50eXBlID09PSAndWwnID8gJ29sJyA6ICd1bCc7XG4gICAgdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnNhdmUoKTtcbiAgICAkbGlzdCA9IG51bGw7XG4gICAgJHJvb3ROb2Rlcy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIG5vZGUpIHtcbiAgICAgICAgdmFyICRub2RlO1xuICAgICAgICAkbm9kZSA9ICQobm9kZSk7XG4gICAgICAgIGlmICgkbm9kZS5pcygnYmxvY2txdW90ZSwgbGknKSB8fCAkbm9kZS5pcyhfdGhpcy5kaXNhYmxlVGFnKSB8fCBfdGhpcy5lZGl0b3IudXRpbC5pc0RlY29yYXRlZE5vZGUoJG5vZGUpIHx8ICEkLmNvbnRhaW5zKGRvY3VtZW50LCBub2RlKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJG5vZGUuaXMoX3RoaXMudHlwZSkpIHtcbiAgICAgICAgICAkbm9kZS5jaGlsZHJlbignbGknKS5lYWNoKGZ1bmN0aW9uKGksIGxpKSB7XG4gICAgICAgICAgICB2YXIgJGNoaWxkTGlzdCwgJGxpO1xuICAgICAgICAgICAgJGxpID0gJChsaSk7XG4gICAgICAgICAgICAkY2hpbGRMaXN0ID0gJGxpLmNoaWxkcmVuKCd1bCwgb2wnKS5pbnNlcnRBZnRlcigkbm9kZSk7XG4gICAgICAgICAgICByZXR1cm4gJCgnPHAvPicpLmFwcGVuZCgkKGxpKS5odG1sKCkgfHwgX3RoaXMuZWRpdG9yLnV0aWwucGhCcikuaW5zZXJ0QmVmb3JlKCRub2RlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gJG5vZGUucmVtb3ZlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoJG5vZGUuaXMoYW5vdGhlclR5cGUpKSB7XG4gICAgICAgICAgcmV0dXJuICQoJzwnICsgX3RoaXMudHlwZSArICcvPicpLmFwcGVuZCgkbm9kZS5jb250ZW50cygpKS5yZXBsYWNlQWxsKCRub2RlKTtcbiAgICAgICAgfSBlbHNlIGlmICgkbGlzdCAmJiAkbm9kZS5wcmV2KCkuaXMoJGxpc3QpKSB7XG4gICAgICAgICAgJCgnPGxpLz4nKS5hcHBlbmQoJG5vZGUuaHRtbCgpIHx8IF90aGlzLmVkaXRvci51dGlsLnBoQnIpLmFwcGVuZFRvKCRsaXN0KTtcbiAgICAgICAgICByZXR1cm4gJG5vZGUucmVtb3ZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGxpc3QgPSAkKFwiPFwiICsgX3RoaXMudHlwZSArIFwiPjxsaT48L2xpPjwvXCIgKyBfdGhpcy50eXBlICsgXCI+XCIpO1xuICAgICAgICAgICRsaXN0LmZpbmQoJ2xpJykuYXBwZW5kKCRub2RlLmh0bWwoKSB8fCBfdGhpcy5lZGl0b3IudXRpbC5waEJyKTtcbiAgICAgICAgICByZXR1cm4gJGxpc3QucmVwbGFjZUFsbCgkbm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5yZXN0b3JlKCk7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLnRyaWdnZXIoJ3ZhbHVlY2hhbmdlZCcpO1xuICB9O1xuXG4gIHJldHVybiBMaXN0QnV0dG9uO1xuXG59KShCdXR0b24pO1xuXG5PcmRlckxpc3RCdXR0b24gPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoT3JkZXJMaXN0QnV0dG9uLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBPcmRlckxpc3RCdXR0b24oKSB7XG4gICAgcmV0dXJuIE9yZGVyTGlzdEJ1dHRvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIE9yZGVyTGlzdEJ1dHRvbi5wcm90b3R5cGUudHlwZSA9ICdvbCc7XG5cbiAgT3JkZXJMaXN0QnV0dG9uLnByb3RvdHlwZS5uYW1lID0gJ29sJztcblxuICBPcmRlckxpc3RCdXR0b24ucHJvdG90eXBlLmljb24gPSAnbGlzdC1vbCc7XG5cbiAgT3JkZXJMaXN0QnV0dG9uLnByb3RvdHlwZS5odG1sVGFnID0gJ29sJztcblxuICBPcmRlckxpc3RCdXR0b24ucHJvdG90eXBlLnNob3J0Y3V0ID0gJ2NtZCsvJztcblxuICBPcmRlckxpc3RCdXR0b24ucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yLnV0aWwub3MubWFjKSB7XG4gICAgICB0aGlzLnRpdGxlID0gdGhpcy50aXRsZSArICcgKCBDbWQgKyAvICknO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRpdGxlID0gdGhpcy50aXRsZSArICcgKCBjdHJsICsgLyApJztcbiAgICAgIHRoaXMuc2hvcnRjdXQgPSAnY3RybCsvJztcbiAgICB9XG4gICAgcmV0dXJuIE9yZGVyTGlzdEJ1dHRvbi5fX3N1cGVyX18uX2luaXQuY2FsbCh0aGlzKTtcbiAgfTtcblxuICByZXR1cm4gT3JkZXJMaXN0QnV0dG9uO1xuXG59KShMaXN0QnV0dG9uKTtcblxuVW5vcmRlckxpc3RCdXR0b24gPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoVW5vcmRlckxpc3RCdXR0b24sIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIFVub3JkZXJMaXN0QnV0dG9uKCkge1xuICAgIHJldHVybiBVbm9yZGVyTGlzdEJ1dHRvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIFVub3JkZXJMaXN0QnV0dG9uLnByb3RvdHlwZS50eXBlID0gJ3VsJztcblxuICBVbm9yZGVyTGlzdEJ1dHRvbi5wcm90b3R5cGUubmFtZSA9ICd1bCc7XG5cbiAgVW5vcmRlckxpc3RCdXR0b24ucHJvdG90eXBlLmljb24gPSAnbGlzdC11bCc7XG5cbiAgVW5vcmRlckxpc3RCdXR0b24ucHJvdG90eXBlLmh0bWxUYWcgPSAndWwnO1xuXG4gIFVub3JkZXJMaXN0QnV0dG9uLnByb3RvdHlwZS5zaG9ydGN1dCA9ICdjbWQrLic7XG5cbiAgVW5vcmRlckxpc3RCdXR0b24ucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yLnV0aWwub3MubWFjKSB7XG4gICAgICB0aGlzLnRpdGxlID0gdGhpcy50aXRsZSArICcgKCBDbWQgKyAuICknO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRpdGxlID0gdGhpcy50aXRsZSArICcgKCBDdHJsICsgLiApJztcbiAgICAgIHRoaXMuc2hvcnRjdXQgPSAnY3RybCsuJztcbiAgICB9XG4gICAgcmV0dXJuIFVub3JkZXJMaXN0QnV0dG9uLl9fc3VwZXJfXy5faW5pdC5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIHJldHVybiBVbm9yZGVyTGlzdEJ1dHRvbjtcblxufSkoTGlzdEJ1dHRvbik7XG5cblNpbWRpdG9yLlRvb2xiYXIuYWRkQnV0dG9uKE9yZGVyTGlzdEJ1dHRvbik7XG5cblNpbWRpdG9yLlRvb2xiYXIuYWRkQnV0dG9uKFVub3JkZXJMaXN0QnV0dG9uKTtcblxuQmxvY2txdW90ZUJ1dHRvbiA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChCbG9ja3F1b3RlQnV0dG9uLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBCbG9ja3F1b3RlQnV0dG9uKCkge1xuICAgIHJldHVybiBCbG9ja3F1b3RlQnV0dG9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgQmxvY2txdW90ZUJ1dHRvbi5wcm90b3R5cGUubmFtZSA9ICdibG9ja3F1b3RlJztcblxuICBCbG9ja3F1b3RlQnV0dG9uLnByb3RvdHlwZS5pY29uID0gJ3F1b3RlLWxlZnQnO1xuXG4gIEJsb2NrcXVvdGVCdXR0b24ucHJvdG90eXBlLmh0bWxUYWcgPSAnYmxvY2txdW90ZSc7XG5cbiAgQmxvY2txdW90ZUJ1dHRvbi5wcm90b3R5cGUuZGlzYWJsZVRhZyA9ICdwcmUsIHRhYmxlJztcblxuICBCbG9ja3F1b3RlQnV0dG9uLnByb3RvdHlwZS5jb21tYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICRyb290Tm9kZXMsIGNsZWFyQ2FjaGUsIG5vZGVDYWNoZTtcbiAgICAkcm9vdE5vZGVzID0gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJvb3ROb2RlcygpO1xuICAgICRyb290Tm9kZXMgPSAkcm9vdE5vZGVzLmZpbHRlcihmdW5jdGlvbihpLCBub2RlKSB7XG4gICAgICByZXR1cm4gISQobm9kZSkucGFyZW50KCkuaXMoJ2Jsb2NrcXVvdGUnKTtcbiAgICB9KTtcbiAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc2F2ZSgpO1xuICAgIG5vZGVDYWNoZSA9IFtdO1xuICAgIGNsZWFyQ2FjaGUgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKG5vZGVDYWNoZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgJChcIjxcIiArIF90aGlzLmh0bWxUYWcgKyBcIi8+XCIpLmluc2VydEJlZm9yZShub2RlQ2FjaGVbMF0pLmFwcGVuZChub2RlQ2FjaGUpO1xuICAgICAgICAgIHJldHVybiBub2RlQ2FjaGUubGVuZ3RoID0gMDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKTtcbiAgICAkcm9vdE5vZGVzLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oaSwgbm9kZSkge1xuICAgICAgICB2YXIgJG5vZGU7XG4gICAgICAgICRub2RlID0gJChub2RlKTtcbiAgICAgICAgaWYgKCEkbm9kZS5wYXJlbnQoKS5pcyhfdGhpcy5lZGl0b3IuYm9keSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRub2RlLmlzKF90aGlzLmh0bWxUYWcpKSB7XG4gICAgICAgICAgY2xlYXJDYWNoZSgpO1xuICAgICAgICAgIHJldHVybiAkbm9kZS5jaGlsZHJlbigpLnVud3JhcCgpO1xuICAgICAgICB9IGVsc2UgaWYgKCRub2RlLmlzKF90aGlzLmRpc2FibGVUYWcpIHx8IF90aGlzLmVkaXRvci51dGlsLmlzRGVjb3JhdGVkTm9kZSgkbm9kZSkpIHtcbiAgICAgICAgICByZXR1cm4gY2xlYXJDYWNoZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBub2RlQ2FjaGUucHVzaChub2RlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgY2xlYXJDYWNoZSgpO1xuICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5yZXN0b3JlKCk7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLnRyaWdnZXIoJ3ZhbHVlY2hhbmdlZCcpO1xuICB9O1xuXG4gIHJldHVybiBCbG9ja3F1b3RlQnV0dG9uO1xuXG59KShCdXR0b24pO1xuXG5TaW1kaXRvci5Ub29sYmFyLmFkZEJ1dHRvbihCbG9ja3F1b3RlQnV0dG9uKTtcblxuQ29kZUJ1dHRvbiA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChDb2RlQnV0dG9uLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBDb2RlQnV0dG9uKCkge1xuICAgIHJldHVybiBDb2RlQnV0dG9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgQ29kZUJ1dHRvbi5wcm90b3R5cGUubmFtZSA9ICdjb2RlJztcblxuICBDb2RlQnV0dG9uLnByb3RvdHlwZS5pY29uID0gJ2NvZGUnO1xuXG4gIENvZGVCdXR0b24ucHJvdG90eXBlLmh0bWxUYWcgPSAncHJlJztcblxuICBDb2RlQnV0dG9uLnByb3RvdHlwZS5kaXNhYmxlVGFnID0gJ3VsLCBvbCwgdGFibGUnO1xuXG4gIENvZGVCdXR0b24ucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgQ29kZUJ1dHRvbi5fX3N1cGVyX18uX2luaXQuY2FsbCh0aGlzKTtcbiAgICB0aGlzLmVkaXRvci5vbignZGVjb3JhdGUnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlLCAkZWwpIHtcbiAgICAgICAgcmV0dXJuICRlbC5maW5kKCdwcmUnKS5lYWNoKGZ1bmN0aW9uKGksIHByZSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5kZWNvcmF0ZSgkKHByZSkpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5vbigndW5kZWNvcmF0ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsICRlbCkge1xuICAgICAgICByZXR1cm4gJGVsLmZpbmQoJ3ByZScpLmVhY2goZnVuY3Rpb24oaSwgcHJlKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnVuZGVjb3JhdGUoJChwcmUpKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBDb2RlQnV0dG9uLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgQ29kZUJ1dHRvbi5fX3N1cGVyX18ucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIHJldHVybiB0aGlzLnBvcG92ZXIgPSBuZXcgQ29kZVBvcG92ZXIoe1xuICAgICAgYnV0dG9uOiB0aGlzXG4gICAgfSk7XG4gIH07XG5cbiAgQ29kZUJ1dHRvbi5wcm90b3R5cGUuX3N0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgIENvZGVCdXR0b24uX19zdXBlcl9fLl9zdGF0dXMuY2FsbCh0aGlzKTtcbiAgICAvLyBjb25zb2xlLmxvZygndGVzdCcpO1xuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucG9wb3Zlci5zaG93KHRoaXMubm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBvcG92ZXIuaGlkZSgpO1xuICAgIH1cbiAgfTtcblxuICBDb2RlQnV0dG9uLnByb3RvdHlwZS5kZWNvcmF0ZSA9IGZ1bmN0aW9uKCRwcmUpIHtcbiAgICB2YXIgJGNvZGUsIGxhbmcsIHJlZiwgcmVmMTtcbiAgICAkY29kZSA9ICRwcmUuZmluZCgnPiBjb2RlJyk7XG4gICAgaWYgKCRjb2RlLmxlbmd0aCA+IDApIHtcbiAgICAgIGxhbmcgPSAocmVmID0gJGNvZGUuYXR0cignY2xhc3MnKSkgIT0gbnVsbCA/IChyZWYxID0gcmVmLm1hdGNoKC9sYW5nLShcXFMrKS8pKSAhPSBudWxsID8gcmVmMVsxXSA6IHZvaWQgMCA6IHZvaWQgMDtcbiAgICAgICRjb2RlLmNvbnRlbnRzKCkudW53cmFwKCk7XG4gICAgICBpZiAobGFuZykge1xuICAgICAgICByZXR1cm4gJHByZS5hdHRyKCdkYXRhLWxhbmcnLCBsYW5nKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgQ29kZUJ1dHRvbi5wcm90b3R5cGUudW5kZWNvcmF0ZSA9IGZ1bmN0aW9uKCRwcmUpIHtcbiAgICB2YXIgJGNvZGUsIGxhbmc7XG4gICAgbGFuZyA9ICRwcmUuYXR0cignZGF0YS1sYW5nJyk7XG4gICAgJGNvZGUgPSAkKCc8Y29kZS8+Jyk7XG4gICAgaWYgKGxhbmcgJiYgbGFuZyAhPT0gLTEpIHtcbiAgICAgICRjb2RlLmFkZENsYXNzKCdsYW5nLScgKyBsYW5nKTtcbiAgICB9XG4gICAgcmV0dXJuICRwcmUud3JhcElubmVyKCRjb2RlKS5yZW1vdmVBdHRyKCdkYXRhLWxhbmcnKTtcbiAgfTtcblxuICBDb2RlQnV0dG9uLnByb3RvdHlwZS5jb21tYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICRyb290Tm9kZXMsIGNsZWFyQ2FjaGUsIG5vZGVDYWNoZSwgcmVzdWx0Tm9kZXM7XG4gICAgJHJvb3ROb2RlcyA9IHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5yb290Tm9kZXMoKTtcbiAgICBub2RlQ2FjaGUgPSBbXTtcbiAgICByZXN1bHROb2RlcyA9IFtdO1xuICAgIGNsZWFyQ2FjaGUgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRwcmU7XG4gICAgICAgIGlmICghKG5vZGVDYWNoZS5sZW5ndGggPiAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkcHJlID0gJChcIjxcIiArIF90aGlzLmh0bWxUYWcgKyBcIi8+XCIpLmluc2VydEJlZm9yZShub2RlQ2FjaGVbMF0pLnRleHQoX3RoaXMuZWRpdG9yLmZvcm1hdHRlci5jbGVhckh0bWwobm9kZUNhY2hlKSk7XG4gICAgICAgIHJlc3VsdE5vZGVzLnB1c2goJHByZVswXSk7XG4gICAgICAgIHJldHVybiBub2RlQ2FjaGUubGVuZ3RoID0gMDtcbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gICAgJHJvb3ROb2Rlcy5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIG5vZGUpIHtcbiAgICAgICAgdmFyICRub2RlLCAkcDtcbiAgICAgICAgJG5vZGUgPSAkKG5vZGUpO1xuICAgICAgICBpZiAoJG5vZGUuaXMoX3RoaXMuaHRtbFRhZykpIHtcbiAgICAgICAgICBjbGVhckNhY2hlKCk7XG4gICAgICAgICAgJHAgPSAkKCc8cC8+JykuYXBwZW5kKCRub2RlLmh0bWwoKS5yZXBsYWNlKCdcXG4nLCAnPGJyLz4nKSkucmVwbGFjZUFsbCgkbm9kZSk7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdE5vZGVzLnB1c2goJHBbMF0pO1xuICAgICAgICB9IGVsc2UgaWYgKCRub2RlLmlzKF90aGlzLmRpc2FibGVUYWcpIHx8IF90aGlzLmVkaXRvci51dGlsLmlzRGVjb3JhdGVkTm9kZSgkbm9kZSkgfHwgJG5vZGUuaXMoJ2Jsb2NrcXVvdGUnKSkge1xuICAgICAgICAgIHJldHVybiBjbGVhckNhY2hlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5vZGVDYWNoZS5wdXNoKG5vZGUpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICBjbGVhckNhY2hlKCk7XG4gICAgdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnNldFJhbmdlQXRFbmRPZigkKHJlc3VsdE5vZGVzKS5sYXN0KCkpO1xuICAgIHJldHVybiB0aGlzLmVkaXRvci50cmlnZ2VyKCd2YWx1ZWNoYW5nZWQnKTtcbiAgfTtcblxuICByZXR1cm4gQ29kZUJ1dHRvbjtcblxufSkoQnV0dG9uKTtcblxuQ29kZVBvcG92ZXIgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoQ29kZVBvcG92ZXIsIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIENvZGVQb3BvdmVyKCkge1xuICAgIHJldHVybiBDb2RlUG9wb3Zlci5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIENvZGVQb3BvdmVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgJG9wdGlvbiwgaywgbGFuZywgbGVuLCByZWY7XG4gICAgdGhpcy5fdHBsID0gXCI8ZGl2IGNsYXNzPVxcXCJjb2RlLXNldHRpbmdzXFxcIj5cXG4gIDxkaXYgY2xhc3M9XFxcInNldHRpbmdzLWZpZWxkXFxcIj5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwic2VsZWN0LWxhbmdcXFwiPlxcbiAgICAgIDxvcHRpb24gdmFsdWU9XFxcIi0xXFxcIj5cIiArICh0aGlzLl90KCdzZWxlY3RMYW5ndWFnZScpKSArIFwiPC9vcHRpb24+XFxuICAgIDwvc2VsZWN0PlxcbiAgPC9kaXY+XFxuPC9kaXY+XCI7XG4gICAgdGhpcy5sYW5ncyA9IHRoaXMuZWRpdG9yLm9wdHMuY29kZUxhbmd1YWdlcyB8fCBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdCYXNoJyxcbiAgICAgICAgdmFsdWU6ICdiYXNoJ1xuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnQysrJyxcbiAgICAgICAgdmFsdWU6ICdjKysnXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdDIycsXG4gICAgICAgIHZhbHVlOiAnY3MnXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdDU1MnLFxuICAgICAgICB2YWx1ZTogJ2NzcydcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0VybGFuZycsXG4gICAgICAgIHZhbHVlOiAnZXJsYW5nJ1xuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnTGVzcycsXG4gICAgICAgIHZhbHVlOiAnbGVzcydcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ1Nhc3MnLFxuICAgICAgICB2YWx1ZTogJ3Nhc3MnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnU0NTUycsXG4gICAgICAgIHZhbHVlOiAnc2NzcydcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdEaWZmJyxcbiAgICAgICAgdmFsdWU6ICdkaWZmJ1xuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnQ29mZmVlU2NyaXB0JyxcbiAgICAgICAgdmFsdWU6ICdjb2ZmZWVzY3JpcHQnXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdIVE1MLFhNTCcsXG4gICAgICAgIHZhbHVlOiAnaHRtbCdcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0pTT04nLFxuICAgICAgICB2YWx1ZTogJ2pzb24nXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdKYXZhJyxcbiAgICAgICAgdmFsdWU6ICdqYXZhJ1xuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnSmF2YVNjcmlwdCcsXG4gICAgICAgIHZhbHVlOiAnanMnXG4gICAgICB9LCAgIFxuICAgICAge1xuICAgICAgICBuYW1lOiAnRVM2JyxcbiAgICAgICAgdmFsdWU6ICdlczYnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBuYW1lOiAnTWFya2Rvd24nLFxuICAgICAgICB2YWx1ZTogJ21hcmtkb3duJ1xuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnT2JqZWN0aXZlIEMnLFxuICAgICAgICB2YWx1ZTogJ29jJ1xuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnUEhQJyxcbiAgICAgICAgdmFsdWU6ICdwaHAnXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdQZXJsJyxcbiAgICAgICAgdmFsdWU6ICdwYXJsJ1xuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnUHl0aG9uJyxcbiAgICAgICAgdmFsdWU6ICdweXRob24nXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdSdWJ5JyxcbiAgICAgICAgdmFsdWU6ICdydWJ5J1xuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnU1FMJyxcbiAgICAgICAgdmFsdWU6ICdzcWwnXG4gICAgICB9XG4gICAgXTtcbiAgICB0aGlzLmVsLmFkZENsYXNzKCdjb2RlLXBvcG92ZXInKS5hcHBlbmQodGhpcy5fdHBsKTtcbiAgICB0aGlzLnNlbGVjdEVsID0gdGhpcy5lbC5maW5kKCcuc2VsZWN0LWxhbmcnKTtcbiAgICByZWYgPSB0aGlzLmxhbmdzO1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgbGFuZyA9IHJlZltrXTtcbiAgICAgICRvcHRpb24gPSAkKCc8b3B0aW9uLz4nLCB7XG4gICAgICAgIHRleHQ6IGxhbmcubmFtZSxcbiAgICAgICAgdmFsdWU6IGxhbmcudmFsdWVcbiAgICAgIH0pLmFwcGVuZFRvKHRoaXMuc2VsZWN0RWwpO1xuICAgIH1cbiAgICB0aGlzLnNlbGVjdEVsLm9uKCdjaGFuZ2UnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBzZWxlY3RlZDtcbiAgICAgICAgX3RoaXMubGFuZyA9IF90aGlzLnNlbGVjdEVsLnZhbCgpO1xuICAgICAgICBzZWxlY3RlZCA9IF90aGlzLnRhcmdldC5oYXNDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgX3RoaXMudGFyZ2V0LnJlbW92ZUNsYXNzKCkucmVtb3ZlQXR0cignZGF0YS1sYW5nJyk7XG4gICAgICAgIGlmIChfdGhpcy5sYW5nICE9PSAtMSkge1xuICAgICAgICAgIF90aGlzLnRhcmdldC5hdHRyKCdkYXRhLWxhbmcnLCBfdGhpcy5sYW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICBfdGhpcy50YXJnZXQuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzLmVkaXRvci50cmlnZ2VyKCd2YWx1ZWNoYW5nZWQnKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5vbigndmFsdWVjaGFuZ2VkJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoX3RoaXMuYWN0aXZlKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnJlZnJlc2goKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgQ29kZVBvcG92ZXIucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgQ29kZVBvcG92ZXIuX19zdXBlcl9fLnNob3cuYXBwbHkodGhpcywgYXJncyk7XG4gICAgdGhpcy5sYW5nID0gdGhpcy50YXJnZXQuYXR0cignZGF0YS1sYW5nJyk7XG4gICAgaWYgKHRoaXMubGFuZyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZWxlY3RFbC52YWwodGhpcy5sYW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0RWwudmFsKC0xKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIENvZGVQb3BvdmVyO1xuXG59KShQb3BvdmVyKTtcblxuU2ltZGl0b3IuVG9vbGJhci5hZGRCdXR0b24oQ29kZUJ1dHRvbik7XG5cbkxpbmtCdXR0b24gPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoTGlua0J1dHRvbiwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gTGlua0J1dHRvbigpIHtcbiAgICByZXR1cm4gTGlua0J1dHRvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIExpbmtCdXR0b24ucHJvdG90eXBlLm5hbWUgPSAnbGluayc7XG5cbiAgTGlua0J1dHRvbi5wcm90b3R5cGUuaWNvbiA9ICdsaW5rJztcblxuICBMaW5rQnV0dG9uLnByb3RvdHlwZS5odG1sVGFnID0gJ2EnO1xuXG4gIExpbmtCdXR0b24ucHJvdG90eXBlLmRpc2FibGVUYWcgPSAncHJlJztcblxuICBMaW5rQnV0dG9uLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgTGlua0J1dHRvbi5fX3N1cGVyX18ucmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIHJldHVybiB0aGlzLnBvcG92ZXIgPSBuZXcgTGlua1BvcG92ZXIoe1xuICAgICAgYnV0dG9uOiB0aGlzXG4gICAgfSk7XG4gIH07XG5cbiAgTGlua0J1dHRvbi5wcm90b3R5cGUuX3N0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgIExpbmtCdXR0b24uX19zdXBlcl9fLl9zdGF0dXMuY2FsbCh0aGlzKTtcbiAgICBpZiAodGhpcy5hY3RpdmUgJiYgIXRoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZUF0RW5kT2YodGhpcy5ub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMucG9wb3Zlci5zaG93KHRoaXMubm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBvcG92ZXIuaGlkZSgpO1xuICAgIH1cbiAgfTtcblxuICBMaW5rQnV0dG9uLnByb3RvdHlwZS5jb21tYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICRjb250ZW50cywgJGxpbmssICRuZXdCbG9jaywgbGlua1RleHQsIHJhbmdlLCB0eHROb2RlO1xuICAgIHJhbmdlID0gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJhbmdlKCk7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgICB0eHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5ub2RlLnRleHQoKSk7XG4gICAgICB0aGlzLm5vZGUucmVwbGFjZVdpdGgodHh0Tm9kZSk7XG4gICAgICByYW5nZS5zZWxlY3ROb2RlKHR4dE5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkY29udGVudHMgPSAkKHJhbmdlLmV4dHJhY3RDb250ZW50cygpKTtcbiAgICAgIGxpbmtUZXh0ID0gdGhpcy5lZGl0b3IuZm9ybWF0dGVyLmNsZWFySHRtbCgkY29udGVudHMuY29udGVudHMoKSwgZmFsc2UpO1xuICAgICAgJGxpbmsgPSAkKCc8YS8+Jywge1xuICAgICAgICBocmVmOiAnaHR0cDovL3d3dy5leGFtcGxlLmNvbScsXG4gICAgICAgIHRhcmdldDogJ19ibGFuaycsXG4gICAgICAgIHRleHQ6IGxpbmtUZXh0IHx8IHRoaXMuX3QoJ2xpbmtUZXh0JylcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5ibG9ja05vZGVzKCkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJhbmdlLmluc2VydE5vZGUoJGxpbmtbMF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJG5ld0Jsb2NrID0gJCgnPHAvPicpLmFwcGVuZCgkbGluayk7XG4gICAgICAgIHJhbmdlLmluc2VydE5vZGUoJG5ld0Jsb2NrWzBdKTtcbiAgICAgIH1cbiAgICAgIHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cygkbGlua1swXSk7XG4gICAgICB0aGlzLnBvcG92ZXIub25lKCdwb3BvdmVyc2hvdycsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGxpbmtUZXh0KSB7XG4gICAgICAgICAgICBfdGhpcy5wb3BvdmVyLnVybEVsLmZvY3VzKCk7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMucG9wb3Zlci51cmxFbFswXS5zZWxlY3QoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3RoaXMucG9wb3Zlci50ZXh0RWwuZm9jdXMoKTtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5wb3BvdmVyLnRleHRFbFswXS5zZWxlY3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfVxuICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZShyYW5nZSk7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLnRyaWdnZXIoJ3ZhbHVlY2hhbmdlZCcpO1xuICB9O1xuXG4gIHJldHVybiBMaW5rQnV0dG9uO1xuXG59KShCdXR0b24pO1xuXG5MaW5rUG9wb3ZlciA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChMaW5rUG9wb3Zlciwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gTGlua1BvcG92ZXIoKSB7XG4gICAgcmV0dXJuIExpbmtQb3BvdmVyLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgTGlua1BvcG92ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0cGw7XG4gICAgdHBsID0gXCI8ZGl2IGNsYXNzPVxcXCJsaW5rLXNldHRpbmdzXFxcIj5cXG4gIDxkaXYgY2xhc3M9XFxcInNldHRpbmdzLWZpZWxkXFxcIj5cXG4gICAgPGxhYmVsPlwiICsgKHRoaXMuX3QoJ3RleHQnKSkgKyBcIjwvbGFiZWw+XFxuICAgIDxpbnB1dCBjbGFzcz1cXFwibGluay10ZXh0XFxcIiB0eXBlPVxcXCJ0ZXh0XFxcIi8+XFxuICAgIDxhIGNsYXNzPVxcXCJidG4tdW5saW5rXFxcIiBocmVmPVxcXCJqYXZhc2NyaXB0OjtcXFwiIHRpdGxlPVxcXCJcIiArICh0aGlzLl90KCdyZW1vdmVMaW5rJykpICsgXCJcXFwiXFxuICAgICAgdGFiaW5kZXg9XFxcIi0xXFxcIj5cXG4gICAgICA8c3BhbiBjbGFzcz1cXFwic2ltZGl0b3ItaWNvbiBzaW1kaXRvci1pY29uLXVubGlua1xcXCI+PC9zcGFuPlxcbiAgICA8L2E+XFxuICA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XFxcInNldHRpbmdzLWZpZWxkXFxcIj5cXG4gICAgPGxhYmVsPlwiICsgKHRoaXMuX3QoJ2xpbmtVcmwnKSkgKyBcIjwvbGFiZWw+XFxuICAgIDxpbnB1dCBjbGFzcz1cXFwibGluay11cmxcXFwiIHR5cGU9XFxcInRleHRcXFwiLz5cXG4gIDwvZGl2PlxcbjwvZGl2PlwiO1xuICAgIHRoaXMuZWwuYWRkQ2xhc3MoJ2xpbmstcG9wb3ZlcicpLmFwcGVuZCh0cGwpO1xuICAgIHRoaXMudGV4dEVsID0gdGhpcy5lbC5maW5kKCcubGluay10ZXh0Jyk7XG4gICAgdGhpcy51cmxFbCA9IHRoaXMuZWwuZmluZCgnLmxpbmstdXJsJyk7XG4gICAgdGhpcy51bmxpbmtFbCA9IHRoaXMuZWwuZmluZCgnLmJ0bi11bmxpbmsnKTtcbiAgICB0aGlzLnRleHRFbC5vbigna2V5dXAnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLndoaWNoID09PSAxMykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXMudGFyZ2V0LnRleHQoX3RoaXMudGV4dEVsLnZhbCgpKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMudXJsRWwub24oJ2tleXVwJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgdmFsO1xuICAgICAgICBpZiAoZS53aGljaCA9PT0gMTMpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFsID0gX3RoaXMudXJsRWwudmFsKCk7XG4gICAgICAgIGlmICghKC9odHRwcz86XFwvXFwvfF5cXC8vaWcudGVzdCh2YWwpIHx8ICF2YWwpKSB7XG4gICAgICAgICAgdmFsID0gJ2h0dHA6Ly8nICsgdmFsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcy50YXJnZXQuYXR0cignaHJlZicsIHZhbCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICAkKFt0aGlzLnVybEVsWzBdLCB0aGlzLnRleHRFbFswXV0pLm9uKCdrZXlkb3duJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgcmFuZ2U7XG4gICAgICAgIGlmIChlLndoaWNoID09PSAxMyB8fCBlLndoaWNoID09PSAyNyB8fCAoIWUuc2hpZnRLZXkgJiYgZS53aGljaCA9PT0gOSAmJiAkKGUudGFyZ2V0KS5oYXNDbGFzcygnbGluay11cmwnKSkpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VBZnRlcihfdGhpcy50YXJnZXQsIHJhbmdlKTtcbiAgICAgICAgICBfdGhpcy5oaWRlKCk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmVkaXRvci50cmlnZ2VyKCd2YWx1ZWNoYW5nZWQnKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIHRoaXMudW5saW5rRWwub24oJ2NsaWNrJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgcmFuZ2UsIHR4dE5vZGU7XG4gICAgICAgIHR4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShfdGhpcy50YXJnZXQudGV4dCgpKTtcbiAgICAgICAgX3RoaXMudGFyZ2V0LnJlcGxhY2VXaXRoKHR4dE5vZGUpO1xuICAgICAgICBfdGhpcy5oaWRlKCk7XG4gICAgICAgIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUFmdGVyKHR4dE5vZGUsIHJhbmdlKTtcbiAgICAgICAgcmV0dXJuIF90aGlzLmVkaXRvci50cmlnZ2VyKCd2YWx1ZWNoYW5nZWQnKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIExpbmtQb3BvdmVyLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3M7XG4gICAgYXJncyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIExpbmtQb3BvdmVyLl9fc3VwZXJfXy5zaG93LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIHRoaXMudGV4dEVsLnZhbCh0aGlzLnRhcmdldC50ZXh0KCkpO1xuICAgIHJldHVybiB0aGlzLnVybEVsLnZhbCh0aGlzLnRhcmdldC5hdHRyKCdocmVmJykpO1xuICB9O1xuXG4gIHJldHVybiBMaW5rUG9wb3ZlcjtcblxufSkoUG9wb3Zlcik7XG5cblNpbWRpdG9yLlRvb2xiYXIuYWRkQnV0dG9uKExpbmtCdXR0b24pO1xuXG5JbWFnZUJ1dHRvbiA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChJbWFnZUJ1dHRvbiwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gSW1hZ2VCdXR0b24oKSB7XG4gICAgcmV0dXJuIEltYWdlQnV0dG9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgSW1hZ2VCdXR0b24ucHJvdG90eXBlLm5hbWUgPSAnaW1hZ2UnO1xuXG4gIEltYWdlQnV0dG9uLnByb3RvdHlwZS5pY29uID0gJ3BpY3R1cmUtbyc7XG5cbiAgSW1hZ2VCdXR0b24ucHJvdG90eXBlLmh0bWxUYWcgPSAnaW1nJztcblxuICBJbWFnZUJ1dHRvbi5wcm90b3R5cGUuZGlzYWJsZVRhZyA9ICdwcmUsIHRhYmxlJztcblxuICBJbWFnZUJ1dHRvbi5wcm90b3R5cGUuZGVmYXVsdEltYWdlID0gJyc7XG5cbiAgSW1hZ2VCdXR0b24ucHJvdG90eXBlLm5lZWRGb2N1cyA9IGZhbHNlO1xuXG4gIEltYWdlQnV0dG9uLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtLCBrLCBsZW4sIHJlZjtcbiAgICBpZiAodGhpcy5lZGl0b3Iub3B0cy5pbWFnZUJ1dHRvbikge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5lZGl0b3Iub3B0cy5pbWFnZUJ1dHRvbikpIHtcbiAgICAgICAgdGhpcy5tZW51ID0gW107XG4gICAgICAgIHJlZiA9IHRoaXMuZWRpdG9yLm9wdHMuaW1hZ2VCdXR0b247XG4gICAgICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsrKykge1xuICAgICAgICAgIGl0ZW0gPSByZWZba107XG4gICAgICAgICAgdGhpcy5tZW51LnB1c2goe1xuICAgICAgICAgICAgbmFtZTogaXRlbSArICctaW1hZ2UnLFxuICAgICAgICAgICAgdGV4dDogdGhpcy5fdChpdGVtICsgJ0ltYWdlJylcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tZW51ID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmVkaXRvci51cGxvYWRlciAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMubWVudSA9IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAndXBsb2FkLWltYWdlJyxcbiAgICAgICAgICAgIHRleHQ6IHRoaXMuX3QoJ3VwbG9hZEltYWdlJylcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBuYW1lOiAnZXh0ZXJuYWwtaW1hZ2UnLFxuICAgICAgICAgICAgdGV4dDogdGhpcy5fdCgnZXh0ZXJuYWxJbWFnZScpXG4gICAgICAgICAgfVxuICAgICAgICBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5tZW51ID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZGVmYXVsdEltYWdlID0gdGhpcy5lZGl0b3Iub3B0cy5kZWZhdWx0SW1hZ2U7XG4gICAgdGhpcy5lZGl0b3IuYm9keS5vbignY2xpY2snLCAnaW1nOm5vdChbZGF0YS1ub24taW1hZ2VdKScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRpbWcsIHJhbmdlO1xuICAgICAgICAkaW1nID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIHJhbmdlLnNlbGVjdE5vZGUoJGltZ1swXSk7XG4gICAgICAgIF90aGlzLmVkaXRvci5zZWxlY3Rpb24ucmFuZ2UocmFuZ2UpO1xuICAgICAgICBpZiAoIV90aGlzLmVkaXRvci51dGlsLnN1cHBvcnQub25zZWxlY3Rpb25jaGFuZ2UpIHtcbiAgICAgICAgICBfdGhpcy5lZGl0b3IudHJpZ2dlcignc2VsZWN0aW9uY2hhbmdlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWRpdG9yLmJvZHkub24oJ21vdXNldXAnLCAnaW1nOm5vdChbZGF0YS1ub24taW1hZ2VdKScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgICB0aGlzLmVkaXRvci5vbignc2VsZWN0aW9uY2hhbmdlZC5pbWFnZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGNvbnRlbnRzLCAkaW1nLCByYW5nZTtcbiAgICAgICAgcmFuZ2UgPSBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJhbmdlKCk7XG4gICAgICAgIGlmIChyYW5nZSA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRjb250ZW50cyA9ICQocmFuZ2UuY2xvbmVDb250ZW50cygpKS5jb250ZW50cygpO1xuICAgICAgICBpZiAoJGNvbnRlbnRzLmxlbmd0aCA9PT0gMSAmJiAkY29udGVudHMuaXMoJ2ltZzpub3QoW2RhdGEtbm9uLWltYWdlXSknKSkge1xuICAgICAgICAgICRpbWcgPSAkKHJhbmdlLnN0YXJ0Q29udGFpbmVyKS5jb250ZW50cygpLmVxKHJhbmdlLnN0YXJ0T2Zmc2V0KTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMucG9wb3Zlci5zaG93KCRpbWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5wb3BvdmVyLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy5lZGl0b3Iub24oJ3ZhbHVlY2hhbmdlZC5pbWFnZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJG1hc2tzO1xuICAgICAgICAkbWFza3MgPSBfdGhpcy5lZGl0b3Iud3JhcHBlci5maW5kKCcuc2ltZGl0b3ItaW1hZ2UtbG9hZGluZycpO1xuICAgICAgICBpZiAoISgkbWFza3MubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRtYXNrcy5lYWNoKGZ1bmN0aW9uKGksIG1hc2spIHtcbiAgICAgICAgICB2YXIgJGltZywgJG1hc2ssIGZpbGU7XG4gICAgICAgICAgJG1hc2sgPSAkKG1hc2spO1xuICAgICAgICAgICRpbWcgPSAkbWFzay5kYXRhKCdpbWcnKTtcbiAgICAgICAgICBpZiAoISgkaW1nICYmICRpbWcucGFyZW50KCkubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgICAgICRtYXNrLnJlbW92ZSgpO1xuICAgICAgICAgICAgaWYgKCRpbWcpIHtcbiAgICAgICAgICAgICAgZmlsZSA9ICRpbWcuZGF0YSgnZmlsZScpO1xuICAgICAgICAgICAgICBpZiAoZmlsZSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmVkaXRvci51cGxvYWRlci5jYW5jZWwoZmlsZSk7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmVkaXRvci5ib2R5LmZpbmQoJ2ltZy51cGxvYWRpbmcnKS5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZWRpdG9yLnVwbG9hZGVyLnRyaWdnZXIoJ3VwbG9hZHJlYWR5JywgW2ZpbGVdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIEltYWdlQnV0dG9uLl9fc3VwZXJfXy5faW5pdC5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIEltYWdlQnV0dG9uLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgSW1hZ2VCdXR0b24uX19zdXBlcl9fLnJlbmRlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB0aGlzLnBvcG92ZXIgPSBuZXcgSW1hZ2VQb3BvdmVyKHtcbiAgICAgIGJ1dHRvbjogdGhpc1xuICAgIH0pO1xuICAgIGlmICh0aGlzLmVkaXRvci5vcHRzLmltYWdlQnV0dG9uID09PSAndXBsb2FkJykge1xuICAgICAgcmV0dXJuIHRoaXMuX2luaXRVcGxvYWRlcih0aGlzLmVsKTtcbiAgICB9XG4gIH07XG5cbiAgSW1hZ2VCdXR0b24ucHJvdG90eXBlLnJlbmRlck1lbnUgPSBmdW5jdGlvbigpIHtcbiAgICBJbWFnZUJ1dHRvbi5fX3N1cGVyX18ucmVuZGVyTWVudS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzLl9pbml0VXBsb2FkZXIoKTtcbiAgfTtcblxuICBJbWFnZUJ1dHRvbi5wcm90b3R5cGUuX2luaXRVcGxvYWRlciA9IGZ1bmN0aW9uKCR1cGxvYWRJdGVtKSB7XG4gICAgdmFyICRpbnB1dCwgY3JlYXRlSW5wdXQsIHVwbG9hZFByb2dyZXNzO1xuICAgIGlmICgkdXBsb2FkSXRlbSA9PSBudWxsKSB7XG4gICAgICAkdXBsb2FkSXRlbSA9IHRoaXMubWVudUVsLmZpbmQoJy5tZW51LWl0ZW0tdXBsb2FkLWltYWdlJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmVkaXRvci51cGxvYWRlciA9PSBudWxsKSB7XG4gICAgICB0aGlzLmVsLmZpbmQoJy5idG4tdXBsb2FkJykucmVtb3ZlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICRpbnB1dCA9IG51bGw7XG4gICAgY3JlYXRlSW5wdXQgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCRpbnB1dCkge1xuICAgICAgICAgICRpbnB1dC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJGlucHV0ID0gJCgnPGlucHV0Lz4nLCB7XG4gICAgICAgICAgdHlwZTogJ2ZpbGUnLFxuICAgICAgICAgIHRpdGxlOiBfdGhpcy5fdCgndXBsb2FkSW1hZ2UnKSxcbiAgICAgICAgICBtdWx0aXBsZTogdHJ1ZSxcbiAgICAgICAgICBhY2NlcHQ6ICdpbWFnZS8qJ1xuICAgICAgICB9KS5hcHBlbmRUbygkdXBsb2FkSXRlbSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpO1xuICAgIGNyZWF0ZUlucHV0KCk7XG4gICAgJHVwbG9hZEl0ZW0ub24oJ2NsaWNrIG1vdXNlZG93bicsICdpbnB1dFt0eXBlPWZpbGVdJywgZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSk7XG4gICAgJHVwbG9hZEl0ZW0ub24oJ2NoYW5nZScsICdpbnB1dFt0eXBlPWZpbGVdJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoX3RoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5mb2N1c2VkKSB7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLnVwbG9hZGVyLnVwbG9hZCgkaW5wdXQsIHtcbiAgICAgICAgICAgIGlubGluZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNyZWF0ZUlucHV0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLm9uZSgnZm9jdXMnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBfdGhpcy5lZGl0b3IudXBsb2FkZXIudXBsb2FkKCRpbnB1dCwge1xuICAgICAgICAgICAgICBpbmxpbmU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGNyZWF0ZUlucHV0KCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzLndyYXBwZXIucmVtb3ZlQ2xhc3MoJ21lbnUtb24nKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWRpdG9yLnVwbG9hZGVyLm9uKCdiZWZvcmV1cGxvYWQnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlLCBmaWxlKSB7XG4gICAgICAgIHZhciAkaW1nO1xuICAgICAgICBpZiAoIWZpbGUuaW5saW5lKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaWxlLmltZykge1xuICAgICAgICAgICRpbWcgPSAkKGZpbGUuaW1nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkaW1nID0gX3RoaXMuY3JlYXRlSW1hZ2UoZmlsZS5uYW1lKTtcbiAgICAgICAgICBmaWxlLmltZyA9ICRpbWc7XG4gICAgICAgIH1cbiAgICAgICAgJGltZy5hZGRDbGFzcygndXBsb2FkaW5nJyk7XG4gICAgICAgICRpbWcuZGF0YSgnZmlsZScsIGZpbGUpO1xuICAgICAgICByZXR1cm4gX3RoaXMuZWRpdG9yLnVwbG9hZGVyLnJlYWRJbWFnZUZpbGUoZmlsZS5vYmosIGZ1bmN0aW9uKGltZykge1xuICAgICAgICAgIHZhciBzcmM7XG4gICAgICAgICAgaWYgKCEkaW1nLmhhc0NsYXNzKCd1cGxvYWRpbmcnKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzcmMgPSBpbWcgPyBpbWcuc3JjIDogX3RoaXMuZGVmYXVsdEltYWdlO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5sb2FkSW1hZ2UoJGltZywgc3JjLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5wb3BvdmVyLmFjdGl2ZSkge1xuICAgICAgICAgICAgICBfdGhpcy5wb3BvdmVyLnJlZnJlc2goKTtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnBvcG92ZXIuc3JjRWwudmFsKF90aGlzLl90KCd1cGxvYWRpbmcnKSkucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB1cGxvYWRQcm9ncmVzcyA9ICQucHJveHkodGhpcy5lZGl0b3IudXRpbC50aHJvdHRsZShmdW5jdGlvbihlLCBmaWxlLCBsb2FkZWQsIHRvdGFsKSB7XG4gICAgICB2YXIgJGltZywgJG1hc2ssIHBlcmNlbnQ7XG4gICAgICBpZiAoIWZpbGUuaW5saW5lKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgICRtYXNrID0gZmlsZS5pbWcuZGF0YSgnbWFzaycpO1xuICAgICAgaWYgKCEkbWFzaykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAkaW1nID0gJG1hc2suZGF0YSgnaW1nJyk7XG4gICAgICBpZiAoISgkaW1nLmhhc0NsYXNzKCd1cGxvYWRpbmcnKSAmJiAkaW1nLnBhcmVudCgpLmxlbmd0aCA+IDApKSB7XG4gICAgICAgICRtYXNrLnJlbW92ZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwZXJjZW50ID0gbG9hZGVkIC8gdG90YWw7XG4gICAgICBwZXJjZW50ID0gKHBlcmNlbnQgKiAxMDApLnRvRml4ZWQoMCk7XG4gICAgICBpZiAocGVyY2VudCA+IDk5KSB7XG4gICAgICAgIHBlcmNlbnQgPSA5OTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkbWFzay5maW5kKCcucHJvZ3Jlc3MnKS5oZWlnaHQoKDEwMCAtIHBlcmNlbnQpICsgXCIlXCIpO1xuICAgIH0sIDUwMCksIHRoaXMpO1xuICAgIHRoaXMuZWRpdG9yLnVwbG9hZGVyLm9uKCd1cGxvYWRwcm9ncmVzcycsIHVwbG9hZFByb2dyZXNzKTtcbiAgICB0aGlzLmVkaXRvci51cGxvYWRlci5vbigndXBsb2Fkc3VjY2VzcycsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsIGZpbGUsIHJlc3VsdCkge1xuICAgICAgICB2YXIgJGltZywgJG1hc2ssIG1zZztcbiAgICAgICAgaWYgKCFmaWxlLmlubGluZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkaW1nID0gZmlsZS5pbWc7XG4gICAgICAgIGlmICghKCRpbWcuaGFzQ2xhc3MoJ3VwbG9hZGluZycpICYmICRpbWcucGFyZW50KCkubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJGltZy5yZW1vdmVEYXRhKCdmaWxlJyk7XG4gICAgICAgICRpbWcucmVtb3ZlQ2xhc3MoJ3VwbG9hZGluZycpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICRtYXNrID0gJGltZy5kYXRhKCdtYXNrJyk7XG4gICAgICAgIGlmICgkbWFzaykge1xuICAgICAgICAgICRtYXNrLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgICRpbWcucmVtb3ZlRGF0YSgnbWFzaycpO1xuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzdWx0ID0gJC5wYXJzZUpTT04ocmVzdWx0KTtcbiAgICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgICAgIGUgPSBfZXJyb3I7XG4gICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgPT09IGZhbHNlKSB7XG4gICAgICAgICAgbXNnID0gcmVzdWx0Lm1zZyB8fCBfdGhpcy5fdCgndXBsb2FkRmFpbGVkJyk7XG4gICAgICAgICAgYWxlcnQobXNnKTtcbiAgICAgICAgICAkaW1nLmF0dHIoJ3NyYycsIF90aGlzLmRlZmF1bHRJbWFnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGltZy5hdHRyKCdzcmMnLCByZXN1bHQuZmlsZV9wYXRoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3RoaXMucG9wb3Zlci5hY3RpdmUpIHtcbiAgICAgICAgICBfdGhpcy5wb3BvdmVyLnNyY0VsLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICAgIF90aGlzLnBvcG92ZXIuc3JjRWwudmFsKHJlc3VsdC5maWxlX3BhdGgpO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLmVkaXRvci50cmlnZ2VyKCd2YWx1ZWNoYW5nZWQnKTtcbiAgICAgICAgaWYgKF90aGlzLmVkaXRvci5ib2R5LmZpbmQoJ2ltZy51cGxvYWRpbmcnKS5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmVkaXRvci51cGxvYWRlci50cmlnZ2VyKCd1cGxvYWRyZWFkeScsIFtmaWxlLCByZXN1bHRdKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLnVwbG9hZGVyLm9uKCd1cGxvYWRlcnJvcicsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsIGZpbGUsIHhocikge1xuICAgICAgICB2YXIgJGltZywgJG1hc2ssIG1zZywgcmVzdWx0O1xuICAgICAgICBpZiAoIWZpbGUuaW5saW5lKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh4aHIuc3RhdHVzVGV4dCA9PT0gJ2Fib3J0Jykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoeGhyLnJlc3BvbnNlVGV4dCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQgPSAkLnBhcnNlSlNPTih4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgIG1zZyA9IHJlc3VsdC5tc2c7XG4gICAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgICAgICBlID0gX2Vycm9yO1xuICAgICAgICAgICAgbXNnID0gX3RoaXMuX3QoJ3VwbG9hZEVycm9yJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFsZXJ0KG1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgJGltZyA9IGZpbGUuaW1nO1xuICAgICAgICBpZiAoISgkaW1nLmhhc0NsYXNzKCd1cGxvYWRpbmcnKSAmJiAkaW1nLnBhcmVudCgpLmxlbmd0aCA+IDApKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRpbWcucmVtb3ZlRGF0YSgnZmlsZScpO1xuICAgICAgICAkaW1nLnJlbW92ZUNsYXNzKCd1cGxvYWRpbmcnKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAkbWFzayA9ICRpbWcuZGF0YSgnbWFzaycpO1xuICAgICAgICBpZiAoJG1hc2spIHtcbiAgICAgICAgICAkbWFzay5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICAkaW1nLnJlbW92ZURhdGEoJ21hc2snKTtcbiAgICAgICAgJGltZy5hdHRyKCdzcmMnLCBfdGhpcy5kZWZhdWx0SW1hZ2UpO1xuICAgICAgICBpZiAoX3RoaXMucG9wb3Zlci5hY3RpdmUpIHtcbiAgICAgICAgICBfdGhpcy5wb3BvdmVyLnNyY0VsLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICAgIF90aGlzLnBvcG92ZXIuc3JjRWwudmFsKF90aGlzLmRlZmF1bHRJbWFnZSk7XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuZWRpdG9yLnRyaWdnZXIoJ3ZhbHVlY2hhbmdlZCcpO1xuICAgICAgICBpZiAoX3RoaXMuZWRpdG9yLmJvZHkuZmluZCgnaW1nLnVwbG9hZGluZycpLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuZWRpdG9yLnVwbG9hZGVyLnRyaWdnZXIoJ3VwbG9hZHJlYWR5JywgW2ZpbGUsIHJlc3VsdF0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBJbWFnZUJ1dHRvbi5wcm90b3R5cGUuX3N0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlU3RhdHVzKCk7XG4gIH07XG5cbiAgSW1hZ2VCdXR0b24ucHJvdG90eXBlLmxvYWRJbWFnZSA9IGZ1bmN0aW9uKCRpbWcsIHNyYywgY2FsbGJhY2spIHtcbiAgICB2YXIgJG1hc2ssIGltZywgcG9zaXRpb25NYXNrO1xuICAgIHBvc2l0aW9uTWFzayA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaW1nT2Zmc2V0LCB3cmFwcGVyT2Zmc2V0O1xuICAgICAgICBpbWdPZmZzZXQgPSAkaW1nLm9mZnNldCgpO1xuICAgICAgICB3cmFwcGVyT2Zmc2V0ID0gX3RoaXMuZWRpdG9yLndyYXBwZXIub2Zmc2V0KCk7XG4gICAgICAgIHJldHVybiAkbWFzay5jc3Moe1xuICAgICAgICAgIHRvcDogaW1nT2Zmc2V0LnRvcCAtIHdyYXBwZXJPZmZzZXQudG9wLFxuICAgICAgICAgIGxlZnQ6IGltZ09mZnNldC5sZWZ0IC0gd3JhcHBlck9mZnNldC5sZWZ0LFxuICAgICAgICAgIHdpZHRoOiAkaW1nLndpZHRoKCksXG4gICAgICAgICAgaGVpZ2h0OiAkaW1nLmhlaWdodCgpXG4gICAgICAgIH0pLnNob3coKTtcbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gICAgJGltZy5hZGRDbGFzcygnbG9hZGluZycpO1xuICAgICRtYXNrID0gJGltZy5kYXRhKCdtYXNrJyk7XG4gICAgaWYgKCEkbWFzaykge1xuICAgICAgJG1hc2sgPSAkKCc8ZGl2IGNsYXNzPVwic2ltZGl0b3ItaW1hZ2UtbG9hZGluZ1wiPlxcbiAgPGRpdiBjbGFzcz1cInByb2dyZXNzXCI+PC9kaXY+XFxuPC9kaXY+JykuaGlkZSgpLmFwcGVuZFRvKHRoaXMuZWRpdG9yLndyYXBwZXIpO1xuICAgICAgcG9zaXRpb25NYXNrKCk7XG4gICAgICAkaW1nLmRhdGEoJ21hc2snLCAkbWFzayk7XG4gICAgICAkbWFzay5kYXRhKCdpbWcnLCAkaW1nKTtcbiAgICB9XG4gICAgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgaW1nLm9ubG9hZCA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGVpZ2h0LCB3aWR0aDtcbiAgICAgICAgaWYgKCEkaW1nLmhhc0NsYXNzKCdsb2FkaW5nJykgJiYgISRpbWcuaGFzQ2xhc3MoJ3VwbG9hZGluZycpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHdpZHRoID0gaW1nLndpZHRoO1xuICAgICAgICBoZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgICAgICAkaW1nLmF0dHIoe1xuICAgICAgICAgIHNyYzogc3JjLFxuICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAnZGF0YS1pbWFnZS1zaXplJzogd2lkdGggKyAnLCcgKyBoZWlnaHRcbiAgICAgICAgfSkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgICAgaWYgKCRpbWcuaGFzQ2xhc3MoJ3VwbG9hZGluZycpKSB7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLnV0aWwucmVmbG93KF90aGlzLmVkaXRvci5ib2R5KTtcbiAgICAgICAgICBwb3NpdGlvbk1hc2soKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkbWFzay5yZW1vdmUoKTtcbiAgICAgICAgICAkaW1nLnJlbW92ZURhdGEoJ21hc2snKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2soaW1nKTtcbiAgICAgIH07XG4gICAgfSkodGhpcyk7XG4gICAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIGNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICRtYXNrLnJlbW92ZSgpO1xuICAgICAgcmV0dXJuICRpbWcucmVtb3ZlRGF0YSgnbWFzaycpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgfTtcbiAgICByZXR1cm4gaW1nLnNyYyA9IHNyYztcbiAgfTtcblxuICBJbWFnZUJ1dHRvbi5wcm90b3R5cGUuY3JlYXRlSW1hZ2UgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyICRpbWcsIHJhbmdlO1xuICAgIGlmIChuYW1lID09IG51bGwpIHtcbiAgICAgIG5hbWUgPSAnSW1hZ2UnO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5mb2N1c2VkKSB7XG4gICAgICB0aGlzLmVkaXRvci5mb2N1cygpO1xuICAgIH1cbiAgICByYW5nZSA9IHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5yYW5nZSgpO1xuICAgIHJhbmdlLmRlbGV0ZUNvbnRlbnRzKCk7XG4gICAgdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJhbmdlKHJhbmdlKTtcbiAgICAkaW1nID0gJCgnPGltZy8+JykuYXR0cignYWx0JywgbmFtZSk7XG4gICAgcmFuZ2UuaW5zZXJ0Tm9kZSgkaW1nWzBdKTtcbiAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VBZnRlcigkaW1nLCByYW5nZSk7XG4gICAgdGhpcy5lZGl0b3IudHJpZ2dlcigndmFsdWVjaGFuZ2VkJyk7XG4gICAgcmV0dXJuICRpbWc7XG4gIH07XG5cbiAgSW1hZ2VCdXR0b24ucHJvdG90eXBlLmNvbW1hbmQgPSBmdW5jdGlvbihzcmMpIHtcbiAgICB2YXIgJGltZztcbiAgICAkaW1nID0gdGhpcy5jcmVhdGVJbWFnZSgpO1xuICAgIHJldHVybiB0aGlzLmxvYWRJbWFnZSgkaW1nLCBzcmMgfHwgdGhpcy5kZWZhdWx0SW1hZ2UsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5lZGl0b3IudHJpZ2dlcigndmFsdWVjaGFuZ2VkJyk7XG4gICAgICAgIF90aGlzLmVkaXRvci51dGlsLnJlZmxvdygkaW1nKTtcbiAgICAgICAgJGltZy5jbGljaygpO1xuICAgICAgICByZXR1cm4gX3RoaXMucG9wb3Zlci5vbmUoJ3BvcG92ZXJzaG93JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMucG9wb3Zlci5zcmNFbC5mb2N1cygpO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5wb3BvdmVyLnNyY0VsWzBdLnNlbGVjdCgpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9O1xuXG4gIHJldHVybiBJbWFnZUJ1dHRvbjtcblxufSkoQnV0dG9uKTtcblxuSW1hZ2VQb3BvdmVyID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKEltYWdlUG9wb3Zlciwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gSW1hZ2VQb3BvdmVyKCkge1xuICAgIHJldHVybiBJbWFnZVBvcG92ZXIuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBJbWFnZVBvcG92ZXIucHJvdG90eXBlLm9mZnNldCA9IHtcbiAgICB0b3A6IDYsXG4gICAgbGVmdDogLTRcbiAgfTtcblxuICBJbWFnZVBvcG92ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0cGw7XG4gICAgdHBsID0gXCI8ZGl2IGNsYXNzPVxcXCJsaW5rLXNldHRpbmdzXFxcIj5cXG4gIDxkaXYgY2xhc3M9XFxcInNldHRpbmdzLWZpZWxkXFxcIj5cXG4gICAgPGxhYmVsPlwiICsgKHRoaXMuX3QoJ2ltYWdlVXJsJykpICsgXCI8L2xhYmVsPlxcbiAgICA8aW5wdXQgY2xhc3M9XFxcImltYWdlLXNyY1xcXCIgdHlwZT1cXFwidGV4dFxcXCIgdGFiaW5kZXg9XFxcIjFcXFwiIC8+XFxuICAgIDxhIGNsYXNzPVxcXCJidG4tdXBsb2FkXFxcIiBocmVmPVxcXCJqYXZhc2NyaXB0OjtcXFwiXFxuICAgICAgdGl0bGU9XFxcIlwiICsgKHRoaXMuX3QoJ3VwbG9hZEltYWdlJykpICsgXCJcXFwiIHRhYmluZGV4PVxcXCItMVxcXCI+XFxuICAgICAgPHNwYW4gY2xhc3M9XFxcInNpbWRpdG9yLWljb24gc2ltZGl0b3ItaWNvbi11cGxvYWRcXFwiPjwvc3Bhbj5cXG4gICAgPC9hPlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPSdzZXR0aW5ncy1maWVsZCc+XFxuICAgIDxsYWJlbD5cIiArICh0aGlzLl90KCdpbWFnZUFsdCcpKSArIFwiPC9sYWJlbD5cXG4gICAgPGlucHV0IGNsYXNzPVxcXCJpbWFnZS1hbHRcXFwiIGlkPVxcXCJpbWFnZS1hbHRcXFwiIHR5cGU9XFxcInRleHRcXFwiIHRhYmluZGV4PVxcXCIxXFxcIiAvPlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVxcXCJzZXR0aW5ncy1maWVsZFxcXCI+XFxuICAgIDxsYWJlbD5cIiArICh0aGlzLl90KCdpbWFnZVNpemUnKSkgKyBcIjwvbGFiZWw+XFxuICAgIDxpbnB1dCBjbGFzcz1cXFwiaW1hZ2Utc2l6ZVxcXCIgaWQ9XFxcImltYWdlLXdpZHRoXFxcIiB0eXBlPVxcXCJ0ZXh0XFxcIiB0YWJpbmRleD1cXFwiMlxcXCIgLz5cXG4gICAgPHNwYW4gY2xhc3M9XFxcInRpbWVzXFxcIj7Dlzwvc3Bhbj5cXG4gICAgPGlucHV0IGNsYXNzPVxcXCJpbWFnZS1zaXplXFxcIiBpZD1cXFwiaW1hZ2UtaGVpZ2h0XFxcIiB0eXBlPVxcXCJ0ZXh0XFxcIiB0YWJpbmRleD1cXFwiM1xcXCIgLz5cXG4gICAgPGEgY2xhc3M9XFxcImJ0bi1yZXN0b3JlXFxcIiBocmVmPVxcXCJqYXZhc2NyaXB0OjtcXFwiXFxuICAgICAgdGl0bGU9XFxcIlwiICsgKHRoaXMuX3QoJ3Jlc3RvcmVJbWFnZVNpemUnKSkgKyBcIlxcXCIgdGFiaW5kZXg9XFxcIi0xXFxcIj5cXG4gICAgICA8c3BhbiBjbGFzcz1cXFwic2ltZGl0b3ItaWNvbiBzaW1kaXRvci1pY29uLXVuZG9cXFwiPjwvc3Bhbj5cXG4gICAgPC9hPlxcbiAgPC9kaXY+XFxuPC9kaXY+XCI7XG4gICAgdGhpcy5lbC5hZGRDbGFzcygnaW1hZ2UtcG9wb3ZlcicpLmFwcGVuZCh0cGwpO1xuICAgIHRoaXMuc3JjRWwgPSB0aGlzLmVsLmZpbmQoJy5pbWFnZS1zcmMnKTtcbiAgICB0aGlzLndpZHRoRWwgPSB0aGlzLmVsLmZpbmQoJyNpbWFnZS13aWR0aCcpO1xuICAgIHRoaXMuaGVpZ2h0RWwgPSB0aGlzLmVsLmZpbmQoJyNpbWFnZS1oZWlnaHQnKTtcbiAgICB0aGlzLmFsdEVsID0gdGhpcy5lbC5maW5kKCcjaW1hZ2UtYWx0Jyk7XG4gICAgdGhpcy5zcmNFbC5vbigna2V5ZG93bicsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHJhbmdlO1xuICAgICAgICBpZiAoIShlLndoaWNoID09PSAxMyAmJiAhX3RoaXMudGFyZ2V0Lmhhc0NsYXNzKCd1cGxvYWRpbmcnKSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIF90aGlzLmJ1dHRvbi5lZGl0b3Iuc2VsZWN0aW9uLnNldFJhbmdlQWZ0ZXIoX3RoaXMudGFyZ2V0LCByYW5nZSk7XG4gICAgICAgIHJldHVybiBfdGhpcy5oaWRlKCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLnNyY0VsLm9uKCdibHVyJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gX3RoaXMuX2xvYWRJbWFnZShfdGhpcy5zcmNFbC52YWwoKSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLmVsLmZpbmQoJy5pbWFnZS1zaXplJykub24oJ2JsdXInLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIF90aGlzLl9yZXNpemVJbWcoJChlLmN1cnJlbnRUYXJnZXQpKTtcbiAgICAgICAgcmV0dXJuIF90aGlzLmVsLmRhdGEoJ3BvcG92ZXInKS5yZWZyZXNoKCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLmVsLmZpbmQoJy5pbWFnZS1zaXplJykub24oJ2tleXVwJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgaW5wdXRFbDtcbiAgICAgICAgaW5wdXRFbCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgaWYgKCEoZS53aGljaCA9PT0gMTMgfHwgZS53aGljaCA9PT0gMjcgfHwgZS53aGljaCA9PT0gOSkpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuX3Jlc2l6ZUltZyhpbnB1dEVsLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy5lbC5maW5kKCcuaW1hZ2Utc2l6ZScpLm9uKCdrZXlkb3duJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJGltZywgaW5wdXRFbCwgcmFuZ2U7XG4gICAgICAgIGlucHV0RWwgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgIGlmIChlLndoaWNoID09PSAxMyB8fCBlLndoaWNoID09PSAyNykge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMTMpIHtcbiAgICAgICAgICAgIF90aGlzLl9yZXNpemVJbWcoaW5wdXRFbCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF90aGlzLl9yZXN0b3JlSW1nKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgICRpbWcgPSBfdGhpcy50YXJnZXQ7XG4gICAgICAgICAgX3RoaXMuaGlkZSgpO1xuICAgICAgICAgIHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnV0dG9uLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VBZnRlcigkaW1nLCByYW5nZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gOSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5lbC5kYXRhKCdwb3BvdmVyJykucmVmcmVzaCgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLmFsdEVsLm9uKCdrZXlkb3duJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgcmFuZ2U7XG4gICAgICAgIGlmIChlLndoaWNoID09PSAxMykge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgX3RoaXMuYnV0dG9uLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VBZnRlcihfdGhpcy50YXJnZXQsIHJhbmdlKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLmFsdEVsLm9uKCdrZXl1cCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDEzIHx8IGUud2hpY2ggPT09IDI3IHx8IGUud2hpY2ggPT09IDkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuYWx0ID0gX3RoaXMuYWx0RWwudmFsKCk7XG4gICAgICAgIHJldHVybiBfdGhpcy50YXJnZXQuYXR0cignYWx0JywgX3RoaXMuYWx0KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWwuZmluZCgnLmJ0bi1yZXN0b3JlJykub24oJ2NsaWNrJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBfdGhpcy5fcmVzdG9yZUltZygpO1xuICAgICAgICByZXR1cm4gX3RoaXMuZWwuZGF0YSgncG9wb3ZlcicpLnJlZnJlc2goKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWRpdG9yLm9uKCd2YWx1ZWNoYW5nZWQnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChfdGhpcy5hY3RpdmUpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMucmVmcmVzaCgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gdGhpcy5faW5pdFVwbG9hZGVyKCk7XG4gIH07XG5cbiAgSW1hZ2VQb3BvdmVyLnByb3RvdHlwZS5faW5pdFVwbG9hZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICR1cGxvYWRCdG4sIGNyZWF0ZUlucHV0O1xuICAgICR1cGxvYWRCdG4gPSB0aGlzLmVsLmZpbmQoJy5idG4tdXBsb2FkJyk7XG4gICAgaWYgKHRoaXMuZWRpdG9yLnVwbG9hZGVyID09IG51bGwpIHtcbiAgICAgICR1cGxvYWRCdG4ucmVtb3ZlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNyZWF0ZUlucHV0ID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfdGhpcy5pbnB1dCkge1xuICAgICAgICAgIF90aGlzLmlucHV0LnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdGhpcy5pbnB1dCA9ICQoJzxpbnB1dC8+Jywge1xuICAgICAgICAgIHR5cGU6ICdmaWxlJyxcbiAgICAgICAgICB0aXRsZTogX3RoaXMuX3QoJ3VwbG9hZEltYWdlJyksXG4gICAgICAgICAgbXVsdGlwbGU6IHRydWUsXG4gICAgICAgICAgYWNjZXB0OiAnaW1hZ2UvKidcbiAgICAgICAgfSkuYXBwZW5kVG8oJHVwbG9hZEJ0bik7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpO1xuICAgIGNyZWF0ZUlucHV0KCk7XG4gICAgdGhpcy5lbC5vbignY2xpY2sgbW91c2Vkb3duJywgJ2lucHV0W3R5cGU9ZmlsZV0nLCBmdW5jdGlvbihlKSB7XG4gICAgICByZXR1cm4gZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5lbC5vbignY2hhbmdlJywgJ2lucHV0W3R5cGU9ZmlsZV0nLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIF90aGlzLmVkaXRvci51cGxvYWRlci51cGxvYWQoX3RoaXMuaW5wdXQsIHtcbiAgICAgICAgICBpbmxpbmU6IHRydWUsXG4gICAgICAgICAgaW1nOiBfdGhpcy50YXJnZXRcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjcmVhdGVJbnB1dCgpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgSW1hZ2VQb3BvdmVyLnByb3RvdHlwZS5fcmVzaXplSW1nID0gZnVuY3Rpb24oaW5wdXRFbCwgb25seVNldFZhbCkge1xuICAgIHZhciBoZWlnaHQsIHZhbHVlLCB3aWR0aDtcbiAgICBpZiAob25seVNldFZhbCA9PSBudWxsKSB7XG4gICAgICBvbmx5U2V0VmFsID0gZmFsc2U7XG4gICAgfVxuICAgIHZhbHVlID0gaW5wdXRFbC52YWwoKSAqIDE7XG4gICAgaWYgKCEodGhpcy50YXJnZXQgJiYgKCQuaXNOdW1lcmljKHZhbHVlKSB8fCB2YWx1ZSA8IDApKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaW5wdXRFbC5pcyh0aGlzLndpZHRoRWwpKSB7XG4gICAgICB3aWR0aCA9IHZhbHVlO1xuICAgICAgaGVpZ2h0ID0gdGhpcy5oZWlnaHQgKiB2YWx1ZSAvIHRoaXMud2lkdGg7XG4gICAgICB0aGlzLmhlaWdodEVsLnZhbChoZWlnaHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBoZWlnaHQgPSB2YWx1ZTtcbiAgICAgIHdpZHRoID0gdGhpcy53aWR0aCAqIHZhbHVlIC8gdGhpcy5oZWlnaHQ7XG4gICAgICB0aGlzLndpZHRoRWwudmFsKHdpZHRoKTtcbiAgICB9XG4gICAgaWYgKCFvbmx5U2V0VmFsKSB7XG4gICAgICB0aGlzLnRhcmdldC5hdHRyKHtcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICBoZWlnaHQ6IGhlaWdodFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3IudHJpZ2dlcigndmFsdWVjaGFuZ2VkJyk7XG4gICAgfVxuICB9O1xuXG4gIEltYWdlUG9wb3Zlci5wcm90b3R5cGUuX3Jlc3RvcmVJbWcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVmLCBzaXplO1xuICAgIHNpemUgPSAoKHJlZiA9IHRoaXMudGFyZ2V0LmRhdGEoJ2ltYWdlLXNpemUnKSkgIT0gbnVsbCA/IHJlZi5zcGxpdChcIixcIikgOiB2b2lkIDApIHx8IFt0aGlzLndpZHRoLCB0aGlzLmhlaWdodF07XG4gICAgdGhpcy50YXJnZXQuYXR0cih7XG4gICAgICB3aWR0aDogc2l6ZVswXSAqIDEsXG4gICAgICBoZWlnaHQ6IHNpemVbMV0gKiAxXG4gICAgfSk7XG4gICAgdGhpcy53aWR0aEVsLnZhbChzaXplWzBdKTtcbiAgICB0aGlzLmhlaWdodEVsLnZhbChzaXplWzFdKTtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IudHJpZ2dlcigndmFsdWVjaGFuZ2VkJyk7XG4gIH07XG5cbiAgSW1hZ2VQb3BvdmVyLnByb3RvdHlwZS5fbG9hZEltYWdlID0gZnVuY3Rpb24oc3JjLCBjYWxsYmFjaykge1xuICAgIGlmICgvXmRhdGE6aW1hZ2UvLnRlc3Qoc3JjKSAmJiAhdGhpcy5lZGl0b3IudXBsb2FkZXIpIHtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhmYWxzZSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnRhcmdldC5hdHRyKCdzcmMnKSA9PT0gc3JjKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJ1dHRvbi5sb2FkSW1hZ2UodGhpcy50YXJnZXQsIHNyYywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oaW1nKSB7XG4gICAgICAgIHZhciBibG9iO1xuICAgICAgICBpZiAoIWltZykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3RoaXMuYWN0aXZlKSB7XG4gICAgICAgICAgX3RoaXMud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgICAgX3RoaXMuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgICBfdGhpcy53aWR0aEVsLnZhbChfdGhpcy53aWR0aCk7XG4gICAgICAgICAgX3RoaXMuaGVpZ2h0RWwudmFsKF90aGlzLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC9eZGF0YTppbWFnZS8udGVzdChzcmMpKSB7XG4gICAgICAgICAgYmxvYiA9IF90aGlzLmVkaXRvci51dGlsLmRhdGFVUkx0b0Jsb2Ioc3JjKTtcbiAgICAgICAgICBibG9iLm5hbWUgPSBcIkJhc2U2NCBJbWFnZS5wbmdcIjtcbiAgICAgICAgICBfdGhpcy5lZGl0b3IudXBsb2FkZXIudXBsb2FkKGJsb2IsIHtcbiAgICAgICAgICAgIGlubGluZTogdHJ1ZSxcbiAgICAgICAgICAgIGltZzogX3RoaXMudGFyZ2V0XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLnRyaWdnZXIoJ3ZhbHVlY2hhbmdlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayhpbWcpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBJbWFnZVBvcG92ZXIucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgJGltZywgYXJncztcbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgSW1hZ2VQb3BvdmVyLl9fc3VwZXJfXy5zaG93LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICRpbWcgPSB0aGlzLnRhcmdldDtcbiAgICB0aGlzLndpZHRoID0gJGltZy53aWR0aCgpO1xuICAgIHRoaXMuaGVpZ2h0ID0gJGltZy5oZWlnaHQoKTtcbiAgICB0aGlzLmFsdCA9ICRpbWcuYXR0cignYWx0Jyk7XG4gICAgaWYgKCRpbWcuaGFzQ2xhc3MoJ3VwbG9hZGluZycpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zcmNFbC52YWwodGhpcy5fdCgndXBsb2FkaW5nJykpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3JjRWwudmFsKCRpbWcuYXR0cignc3JjJykpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgdGhpcy53aWR0aEVsLnZhbCh0aGlzLndpZHRoKTtcbiAgICAgIHRoaXMuaGVpZ2h0RWwudmFsKHRoaXMuaGVpZ2h0KTtcbiAgICAgIHJldHVybiB0aGlzLmFsdEVsLnZhbCh0aGlzLmFsdCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBJbWFnZVBvcG92ZXI7XG5cbn0pKFBvcG92ZXIpO1xuXG5TaW1kaXRvci5Ub29sYmFyLmFkZEJ1dHRvbihJbWFnZUJ1dHRvbik7XG5cbkluZGVudEJ1dHRvbiA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChJbmRlbnRCdXR0b24sIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIEluZGVudEJ1dHRvbigpIHtcbiAgICByZXR1cm4gSW5kZW50QnV0dG9uLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgSW5kZW50QnV0dG9uLnByb3RvdHlwZS5uYW1lID0gJ2luZGVudCc7XG5cbiAgSW5kZW50QnV0dG9uLnByb3RvdHlwZS5pY29uID0gJ2luZGVudCc7XG5cbiAgSW5kZW50QnV0dG9uLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGl0bGUgPSB0aGlzLl90KHRoaXMubmFtZSkgKyAnIChUYWIpJztcbiAgICByZXR1cm4gSW5kZW50QnV0dG9uLl9fc3VwZXJfXy5faW5pdC5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIEluZGVudEJ1dHRvbi5wcm90b3R5cGUuX3N0YXR1cyA9IGZ1bmN0aW9uKCkge307XG5cbiAgSW5kZW50QnV0dG9uLnByb3RvdHlwZS5jb21tYW5kID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmluZGVudGF0aW9uLmluZGVudCgpO1xuICB9O1xuXG4gIHJldHVybiBJbmRlbnRCdXR0b247XG5cbn0pKEJ1dHRvbik7XG5cblNpbWRpdG9yLlRvb2xiYXIuYWRkQnV0dG9uKEluZGVudEJ1dHRvbik7XG5cbk91dGRlbnRCdXR0b24gPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoT3V0ZGVudEJ1dHRvbiwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gT3V0ZGVudEJ1dHRvbigpIHtcbiAgICByZXR1cm4gT3V0ZGVudEJ1dHRvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIE91dGRlbnRCdXR0b24ucHJvdG90eXBlLm5hbWUgPSAnb3V0ZGVudCc7XG5cbiAgT3V0ZGVudEJ1dHRvbi5wcm90b3R5cGUuaWNvbiA9ICdvdXRkZW50JztcblxuICBPdXRkZW50QnV0dG9uLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGl0bGUgPSB0aGlzLl90KHRoaXMubmFtZSkgKyAnIChTaGlmdCArIFRhYiknO1xuICAgIHJldHVybiBPdXRkZW50QnV0dG9uLl9fc3VwZXJfXy5faW5pdC5jYWxsKHRoaXMpO1xuICB9O1xuXG4gIE91dGRlbnRCdXR0b24ucHJvdG90eXBlLl9zdGF0dXMgPSBmdW5jdGlvbigpIHt9O1xuXG4gIE91dGRlbnRCdXR0b24ucHJvdG90eXBlLmNvbW1hbmQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuaW5kZW50YXRpb24uaW5kZW50KHRydWUpO1xuICB9O1xuXG4gIHJldHVybiBPdXRkZW50QnV0dG9uO1xuXG59KShCdXR0b24pO1xuXG5TaW1kaXRvci5Ub29sYmFyLmFkZEJ1dHRvbihPdXRkZW50QnV0dG9uKTtcblxuSHJCdXR0b24gPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoSHJCdXR0b24sIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIEhyQnV0dG9uKCkge1xuICAgIHJldHVybiBIckJ1dHRvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIEhyQnV0dG9uLnByb3RvdHlwZS5uYW1lID0gJ2hyJztcblxuICBIckJ1dHRvbi5wcm90b3R5cGUuaWNvbiA9ICdtaW51cyc7XG5cbiAgSHJCdXR0b24ucHJvdG90eXBlLmh0bWxUYWcgPSAnaHInO1xuXG4gIEhyQnV0dG9uLnByb3RvdHlwZS5fc3RhdHVzID0gZnVuY3Rpb24oKSB7fTtcblxuICBIckJ1dHRvbi5wcm90b3R5cGUuY29tbWFuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkaHIsICRuZXdCbG9jaywgJG5leHRCbG9jaywgJHJvb3RCbG9jaztcbiAgICAkcm9vdEJsb2NrID0gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJvb3ROb2RlcygpLmZpcnN0KCk7XG4gICAgJG5leHRCbG9jayA9ICRyb290QmxvY2submV4dCgpO1xuICAgIGlmICgkbmV4dEJsb2NrLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5zYXZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRuZXdCbG9jayA9ICQoJzxwLz4nKS5hcHBlbmQodGhpcy5lZGl0b3IudXRpbC5waEJyKTtcbiAgICB9XG4gICAgJGhyID0gJCgnPGhyLz4nKS5pbnNlcnRBZnRlcigkcm9vdEJsb2NrKTtcbiAgICBpZiAoJG5ld0Jsb2NrKSB7XG4gICAgICAkbmV3QmxvY2suaW5zZXJ0QWZ0ZXIoJGhyKTtcbiAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUF0U3RhcnRPZigkbmV3QmxvY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24ucmVzdG9yZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lZGl0b3IudHJpZ2dlcigndmFsdWVjaGFuZ2VkJyk7XG4gIH07XG5cbiAgcmV0dXJuIEhyQnV0dG9uO1xuXG59KShCdXR0b24pO1xuXG5TaW1kaXRvci5Ub29sYmFyLmFkZEJ1dHRvbihIckJ1dHRvbik7XG5cblRhYmxlQnV0dG9uID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKFRhYmxlQnV0dG9uLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBUYWJsZUJ1dHRvbigpIHtcbiAgICByZXR1cm4gVGFibGVCdXR0b24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBUYWJsZUJ1dHRvbi5wcm90b3R5cGUubmFtZSA9ICd0YWJsZSc7XG5cbiAgVGFibGVCdXR0b24ucHJvdG90eXBlLmljb24gPSAndGFibGUnO1xuXG4gIFRhYmxlQnV0dG9uLnByb3RvdHlwZS5odG1sVGFnID0gJ3RhYmxlJztcblxuICBUYWJsZUJ1dHRvbi5wcm90b3R5cGUuZGlzYWJsZVRhZyA9ICdwcmUsIGxpLCBibG9ja3F1b3RlJztcblxuICBUYWJsZUJ1dHRvbi5wcm90b3R5cGUubWVudSA9IHRydWU7XG5cbiAgVGFibGVCdXR0b24ucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgVGFibGVCdXR0b24uX19zdXBlcl9fLl9pbml0LmNhbGwodGhpcyk7XG4gICAgJC5tZXJnZSh0aGlzLmVkaXRvci5mb3JtYXR0ZXIuX2FsbG93ZWRUYWdzLCBbJ3RoZWFkJywgJ3RoJywgJ3Rib2R5JywgJ3RyJywgJ3RkJywgJ2NvbGdyb3VwJywgJ2NvbCddKTtcbiAgICAkLmV4dGVuZCh0aGlzLmVkaXRvci5mb3JtYXR0ZXIuX2FsbG93ZWRBdHRyaWJ1dGVzLCB7XG4gICAgICB0ZDogWydyb3dzcGFuJywgJ2NvbHNwYW4nXSxcbiAgICAgIGNvbDogWyd3aWR0aCddXG4gICAgfSk7XG4gICAgJC5leHRlbmQodGhpcy5lZGl0b3IuZm9ybWF0dGVyLl9hbGxvd2VkU3R5bGVzLCB7XG4gICAgICB0ZDogWyd0ZXh0LWFsaWduJ10sXG4gICAgICB0aDogWyd0ZXh0LWFsaWduJ11cbiAgICB9KTtcbiAgICB0aGlzLl9pbml0U2hvcnRjdXRzKCk7XG4gICAgdGhpcy5lZGl0b3Iub24oJ2RlY29yYXRlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSwgJGVsKSB7XG4gICAgICAgIHJldHVybiAkZWwuZmluZCgndGFibGUnKS5lYWNoKGZ1bmN0aW9uKGksIHRhYmxlKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmRlY29yYXRlKCQodGFibGUpKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLmVkaXRvci5vbigndW5kZWNvcmF0ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsICRlbCkge1xuICAgICAgICByZXR1cm4gJGVsLmZpbmQoJ3RhYmxlJykuZWFjaChmdW5jdGlvbihpLCB0YWJsZSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy51bmRlY29yYXRlKCQodGFibGUpKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLmVkaXRvci5vbignc2VsZWN0aW9uY2hhbmdlZC50YWJsZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRjb250YWluZXIsIHJhbmdlO1xuICAgICAgICBfdGhpcy5lZGl0b3IuYm9keS5maW5kKCcuc2ltZGl0b3ItdGFibGUgdGQsIC5zaW1kaXRvci10YWJsZSB0aCcpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgcmFuZ2UgPSBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnJhbmdlKCk7XG4gICAgICAgIGlmICghcmFuZ2UpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJGNvbnRhaW5lciA9IF90aGlzLmVkaXRvci5zZWxlY3Rpb24uY29udGFpbmVyTm9kZSgpO1xuICAgICAgICBpZiAocmFuZ2UuY29sbGFwc2VkICYmICRjb250YWluZXIuaXMoJy5zaW1kaXRvci10YWJsZScpKSB7XG4gICAgICAgICAgaWYgKF90aGlzLmVkaXRvci5zZWxlY3Rpb24ucmFuZ2VBdFN0YXJ0T2YoJGNvbnRhaW5lcikpIHtcbiAgICAgICAgICAgICRjb250YWluZXIgPSAkY29udGFpbmVyLmZpbmQoJ3RoOmZpcnN0Jyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRjb250YWluZXIgPSAkY29udGFpbmVyLmZpbmQoJ3RkOmxhc3QnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3RoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUF0RW5kT2YoJGNvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRjb250YWluZXIuY2xvc2VzdCgndGQsIHRoJywgX3RoaXMuZWRpdG9yLmJvZHkpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWRpdG9yLm9uKCdibHVyLnRhYmxlJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gX3RoaXMuZWRpdG9yLmJvZHkuZmluZCgnLnNpbWRpdG9yLXRhYmxlIHRkLCAuc2ltZGl0b3ItdGFibGUgdGgnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICB0aGlzLmVkaXRvci5pbnB1dE1hbmFnZXIuYWRkS2V5c3Ryb2tlSGFuZGxlcignMzgnLCAndGQnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlLCAkbm9kZSkge1xuICAgICAgICBfdGhpcy5fdGROYXYoJG5vZGUsICd1cCcpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRLZXlzdHJva2VIYW5kbGVyKCczOCcsICd0aCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsICRub2RlKSB7XG4gICAgICAgIF90aGlzLl90ZE5hdigkbm9kZSwgJ3VwJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy5lZGl0b3IuaW5wdXRNYW5hZ2VyLmFkZEtleXN0cm9rZUhhbmRsZXIoJzQwJywgJ3RkJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSwgJG5vZGUpIHtcbiAgICAgICAgX3RoaXMuX3RkTmF2KCRub2RlLCAnZG93bicpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5pbnB1dE1hbmFnZXIuYWRkS2V5c3Ryb2tlSGFuZGxlcignNDAnLCAndGgnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlLCAkbm9kZSkge1xuICAgICAgICBfdGhpcy5fdGROYXYoJG5vZGUsICdkb3duJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgVGFibGVCdXR0b24ucHJvdG90eXBlLl90ZE5hdiA9IGZ1bmN0aW9uKCR0ZCwgZGlyZWN0aW9uKSB7XG4gICAgdmFyICRhbm90aGVyVHIsICR0ciwgYWN0aW9uLCBhbm90aGVyVGFnLCBpbmRleCwgcGFyZW50VGFnLCByZWY7XG4gICAgaWYgKGRpcmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICBkaXJlY3Rpb24gPSAndXAnO1xuICAgIH1cbiAgICBhY3Rpb24gPSBkaXJlY3Rpb24gPT09ICd1cCcgPyAncHJldicgOiAnbmV4dCc7XG4gICAgcmVmID0gZGlyZWN0aW9uID09PSAndXAnID8gWyd0Ym9keScsICd0aGVhZCddIDogWyd0aGVhZCcsICd0Ym9keSddLCBwYXJlbnRUYWcgPSByZWZbMF0sIGFub3RoZXJUYWcgPSByZWZbMV07XG4gICAgJHRyID0gJHRkLnBhcmVudCgndHInKTtcbiAgICAkYW5vdGhlclRyID0gdGhpc1tcIl9cIiArIGFjdGlvbiArIFwiUm93XCJdKCR0cik7XG4gICAgaWYgKCEoJGFub3RoZXJUci5sZW5ndGggPiAwKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGluZGV4ID0gJHRyLmZpbmQoJ3RkLCB0aCcpLmluZGV4KCR0ZCk7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUF0RW5kT2YoJGFub3RoZXJUci5maW5kKCd0ZCwgdGgnKS5lcShpbmRleCkpO1xuICB9O1xuXG4gIFRhYmxlQnV0dG9uLnByb3RvdHlwZS5fbmV4dFJvdyA9IGZ1bmN0aW9uKCR0cikge1xuICAgIHZhciAkbmV4dFRyO1xuICAgICRuZXh0VHIgPSAkdHIubmV4dCgndHInKTtcbiAgICBpZiAoJG5leHRUci5sZW5ndGggPCAxICYmICR0ci5wYXJlbnQoJ3RoZWFkJykubGVuZ3RoID4gMCkge1xuICAgICAgJG5leHRUciA9ICR0ci5wYXJlbnQoJ3RoZWFkJykubmV4dCgndGJvZHknKS5maW5kKCd0cjpmaXJzdCcpO1xuICAgIH1cbiAgICByZXR1cm4gJG5leHRUcjtcbiAgfTtcblxuICBUYWJsZUJ1dHRvbi5wcm90b3R5cGUuX3ByZXZSb3cgPSBmdW5jdGlvbigkdHIpIHtcbiAgICB2YXIgJHByZXZUcjtcbiAgICAkcHJldlRyID0gJHRyLnByZXYoJ3RyJyk7XG4gICAgaWYgKCRwcmV2VHIubGVuZ3RoIDwgMSAmJiAkdHIucGFyZW50KCd0Ym9keScpLmxlbmd0aCA+IDApIHtcbiAgICAgICRwcmV2VHIgPSAkdHIucGFyZW50KCd0Ym9keScpLnByZXYoJ3RoZWFkJykuZmluZCgndHInKTtcbiAgICB9XG4gICAgcmV0dXJuICRwcmV2VHI7XG4gIH07XG5cbiAgVGFibGVCdXR0b24ucHJvdG90eXBlLmluaXRSZXNpemUgPSBmdW5jdGlvbigkdGFibGUpIHtcbiAgICB2YXIgJGNvbGdyb3VwLCAkcmVzaXplSGFuZGxlLCAkd3JhcHBlcjtcbiAgICAkd3JhcHBlciA9ICR0YWJsZS5wYXJlbnQoJy5zaW1kaXRvci10YWJsZScpO1xuICAgICRjb2xncm91cCA9ICR0YWJsZS5maW5kKCdjb2xncm91cCcpO1xuICAgIGlmICgkY29sZ3JvdXAubGVuZ3RoIDwgMSkge1xuICAgICAgJGNvbGdyb3VwID0gJCgnPGNvbGdyb3VwLz4nKS5wcmVwZW5kVG8oJHRhYmxlKTtcbiAgICAgICR0YWJsZS5maW5kKCd0aGVhZCB0ciB0aCcpLmVhY2goZnVuY3Rpb24oaSwgdGQpIHtcbiAgICAgICAgdmFyICRjb2w7XG4gICAgICAgIHJldHVybiAkY29sID0gJCgnPGNvbC8+JykuYXBwZW5kVG8oJGNvbGdyb3VwKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZWZyZXNoVGFibGVXaWR0aCgkdGFibGUpO1xuICAgIH1cbiAgICAkcmVzaXplSGFuZGxlID0gJCgnPGRpdiAvPicsIHtcbiAgICAgIFwiY2xhc3NcIjogJ3NpbWRpdG9yLXJlc2l6ZS1oYW5kbGUnLFxuICAgICAgY29udGVudGVkaXRhYmxlOiAnZmFsc2UnXG4gICAgfSkuYXBwZW5kVG8oJHdyYXBwZXIpO1xuICAgICR3cmFwcGVyLm9uKCdtb3VzZW1vdmUnLCAndGQsIHRoJywgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyICRjb2wsICR0ZCwgaW5kZXgsIHJlZiwgcmVmMSwgeDtcbiAgICAgIGlmICgkd3JhcHBlci5oYXNDbGFzcygncmVzaXppbmcnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAkdGQgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICB4ID0gZS5wYWdlWCAtICQoZS5jdXJyZW50VGFyZ2V0KS5vZmZzZXQoKS5sZWZ0O1xuICAgICAgaWYgKHggPCA1ICYmICR0ZC5wcmV2KCkubGVuZ3RoID4gMCkge1xuICAgICAgICAkdGQgPSAkdGQucHJldigpO1xuICAgICAgfVxuICAgICAgaWYgKCR0ZC5uZXh0KCd0ZCwgdGgnKS5sZW5ndGggPCAxKSB7XG4gICAgICAgICRyZXNpemVIYW5kbGUuaGlkZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoKHJlZiA9ICRyZXNpemVIYW5kbGUuZGF0YSgndGQnKSkgIT0gbnVsbCA/IHJlZi5pcygkdGQpIDogdm9pZCAwKSB7XG4gICAgICAgICRyZXNpemVIYW5kbGUuc2hvdygpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpbmRleCA9ICR0ZC5wYXJlbnQoKS5maW5kKCd0ZCwgdGgnKS5pbmRleCgkdGQpO1xuICAgICAgJGNvbCA9ICRjb2xncm91cC5maW5kKCdjb2wnKS5lcShpbmRleCk7XG4gICAgICBpZiAoKHJlZjEgPSAkcmVzaXplSGFuZGxlLmRhdGEoJ2NvbCcpKSAhPSBudWxsID8gcmVmMS5pcygkY29sKSA6IHZvaWQgMCkge1xuICAgICAgICAkcmVzaXplSGFuZGxlLnNob3coKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuICRyZXNpemVIYW5kbGUuY3NzKCdsZWZ0JywgJHRkLnBvc2l0aW9uKCkubGVmdCArICR0ZC5vdXRlcldpZHRoKCkgLSA1KS5kYXRhKCd0ZCcsICR0ZCkuZGF0YSgnY29sJywgJGNvbCkuc2hvdygpO1xuICAgIH0pO1xuICAgICR3cmFwcGVyLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuICRyZXNpemVIYW5kbGUuaGlkZSgpO1xuICAgIH0pO1xuICAgIHJldHVybiAkd3JhcHBlci5vbignbW91c2Vkb3duJywgJy5zaW1kaXRvci1yZXNpemUtaGFuZGxlJywgZnVuY3Rpb24oZSkge1xuICAgICAgdmFyICRoYW5kbGUsICRsZWZ0Q29sLCAkbGVmdFRkLCAkcmlnaHRDb2wsICRyaWdodFRkLCBtaW5XaWR0aCwgc3RhcnRIYW5kbGVMZWZ0LCBzdGFydExlZnRXaWR0aCwgc3RhcnRSaWdodFdpZHRoLCBzdGFydFgsIHRhYmxlV2lkdGg7XG4gICAgICAkaGFuZGxlID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgJGxlZnRUZCA9ICRoYW5kbGUuZGF0YSgndGQnKTtcbiAgICAgICRsZWZ0Q29sID0gJGhhbmRsZS5kYXRhKCdjb2wnKTtcbiAgICAgICRyaWdodFRkID0gJGxlZnRUZC5uZXh0KCd0ZCwgdGgnKTtcbiAgICAgICRyaWdodENvbCA9ICRsZWZ0Q29sLm5leHQoJ2NvbCcpO1xuICAgICAgc3RhcnRYID0gZS5wYWdlWDtcbiAgICAgIHN0YXJ0TGVmdFdpZHRoID0gJGxlZnRUZC5vdXRlcldpZHRoKCkgKiAxO1xuICAgICAgc3RhcnRSaWdodFdpZHRoID0gJHJpZ2h0VGQub3V0ZXJXaWR0aCgpICogMTtcbiAgICAgIHN0YXJ0SGFuZGxlTGVmdCA9IHBhcnNlRmxvYXQoJGhhbmRsZS5jc3MoJ2xlZnQnKSk7XG4gICAgICB0YWJsZVdpZHRoID0gJGxlZnRUZC5jbG9zZXN0KCd0YWJsZScpLndpZHRoKCk7XG4gICAgICBtaW5XaWR0aCA9IDUwO1xuICAgICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZS5zaW1kaXRvci1yZXNpemUtdGFibGUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBkZWx0YVgsIGxlZnRXaWR0aCwgcmlnaHRXaWR0aDtcbiAgICAgICAgZGVsdGFYID0gZS5wYWdlWCAtIHN0YXJ0WDtcbiAgICAgICAgbGVmdFdpZHRoID0gc3RhcnRMZWZ0V2lkdGggKyBkZWx0YVg7XG4gICAgICAgIHJpZ2h0V2lkdGggPSBzdGFydFJpZ2h0V2lkdGggLSBkZWx0YVg7XG4gICAgICAgIGlmIChsZWZ0V2lkdGggPCBtaW5XaWR0aCkge1xuICAgICAgICAgIGxlZnRXaWR0aCA9IG1pbldpZHRoO1xuICAgICAgICAgIGRlbHRhWCA9IG1pbldpZHRoIC0gc3RhcnRMZWZ0V2lkdGg7XG4gICAgICAgICAgcmlnaHRXaWR0aCA9IHN0YXJ0UmlnaHRXaWR0aCAtIGRlbHRhWDtcbiAgICAgICAgfSBlbHNlIGlmIChyaWdodFdpZHRoIDwgbWluV2lkdGgpIHtcbiAgICAgICAgICByaWdodFdpZHRoID0gbWluV2lkdGg7XG4gICAgICAgICAgZGVsdGFYID0gc3RhcnRSaWdodFdpZHRoIC0gbWluV2lkdGg7XG4gICAgICAgICAgbGVmdFdpZHRoID0gc3RhcnRMZWZ0V2lkdGggKyBkZWx0YVg7XG4gICAgICAgIH1cbiAgICAgICAgJGxlZnRDb2wuYXR0cignd2lkdGgnLCAobGVmdFdpZHRoIC8gdGFibGVXaWR0aCAqIDEwMCkgKyAnJScpO1xuICAgICAgICAkcmlnaHRDb2wuYXR0cignd2lkdGgnLCAocmlnaHRXaWR0aCAvIHRhYmxlV2lkdGggKiAxMDApICsgJyUnKTtcbiAgICAgICAgcmV0dXJuICRoYW5kbGUuY3NzKCdsZWZ0Jywgc3RhcnRIYW5kbGVMZWZ0ICsgZGVsdGFYKTtcbiAgICAgIH0pO1xuICAgICAgJChkb2N1bWVudCkub25lKCdtb3VzZXVwLnNpbWRpdG9yLXJlc2l6ZS10YWJsZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgJChkb2N1bWVudCkub2ZmKCcuc2ltZGl0b3ItcmVzaXplLXRhYmxlJyk7XG4gICAgICAgIHJldHVybiAkd3JhcHBlci5yZW1vdmVDbGFzcygncmVzaXppbmcnKTtcbiAgICAgIH0pO1xuICAgICAgJHdyYXBwZXIuYWRkQ2xhc3MoJ3Jlc2l6aW5nJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gIH07XG5cbiAgVGFibGVCdXR0b24ucHJvdG90eXBlLl9pbml0U2hvcnRjdXRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lZGl0b3IuaW5wdXRNYW5hZ2VyLmFkZFNob3J0Y3V0KCdjdHJsK2FsdCt1cCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RoaXMuZWRpdE1lbnUuZmluZCgnLm1lbnUtaXRlbVtkYXRhLXBhcmFtPWluc2VydFJvd0Fib3ZlXScpLmNsaWNrKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRTaG9ydGN1dCgnY3RybCthbHQrZG93bicsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RoaXMuZWRpdE1lbnUuZmluZCgnLm1lbnUtaXRlbVtkYXRhLXBhcmFtPWluc2VydFJvd0JlbG93XScpLmNsaWNrKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRTaG9ydGN1dCgnY3RybCthbHQrbGVmdCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgX3RoaXMuZWRpdE1lbnUuZmluZCgnLm1lbnUtaXRlbVtkYXRhLXBhcmFtPWluc2VydENvbExlZnRdJykuY2xpY2soKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5hZGRTaG9ydGN1dCgnY3RybCthbHQrcmlnaHQnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIF90aGlzLmVkaXRNZW51LmZpbmQoJy5tZW51LWl0ZW1bZGF0YS1wYXJhbT1pbnNlcnRDb2xSaWdodF0nKS5jbGljaygpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBUYWJsZUJ1dHRvbi5wcm90b3R5cGUuZGVjb3JhdGUgPSBmdW5jdGlvbigkdGFibGUpIHtcbiAgICBpZiAoJHRhYmxlLnBhcmVudCgnLnNpbWRpdG9yLXRhYmxlJykubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy51bmRlY29yYXRlKCR0YWJsZSk7XG4gICAgfVxuICAgICR0YWJsZS53cmFwKCc8ZGl2IGNsYXNzPVwic2ltZGl0b3ItdGFibGVcIj48L2Rpdj4nKTtcbiAgICB0aGlzLmluaXRSZXNpemUoJHRhYmxlKTtcbiAgICByZXR1cm4gJHRhYmxlLnBhcmVudCgpO1xuICB9O1xuXG4gIFRhYmxlQnV0dG9uLnByb3RvdHlwZS51bmRlY29yYXRlID0gZnVuY3Rpb24oJHRhYmxlKSB7XG4gICAgaWYgKCEoJHRhYmxlLnBhcmVudCgnLnNpbWRpdG9yLXRhYmxlJykubGVuZ3RoID4gMCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuICR0YWJsZS5wYXJlbnQoKS5yZXBsYWNlV2l0aCgkdGFibGUpO1xuICB9O1xuXG4gIFRhYmxlQnV0dG9uLnByb3RvdHlwZS5yZW5kZXJNZW51ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyICR0YWJsZTtcbiAgICAkKFwiPGRpdiBjbGFzcz1cXFwibWVudS1jcmVhdGUtdGFibGVcXFwiPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcIm1lbnUtZWRpdC10YWJsZVxcXCI+XFxuICA8dWw+XFxuICAgIDxsaT5cXG4gICAgICA8YSB0YWJpbmRleD1cXFwiLTFcXFwiIHVuc2VsZWN0YWJsZT1cXFwib25cXFwiIGNsYXNzPVxcXCJtZW51LWl0ZW1cXFwiXFxuICAgICAgICBocmVmPVxcXCJqYXZhc2NyaXB0OjtcXFwiIGRhdGEtcGFyYW09XFxcImRlbGV0ZVJvd1xcXCI+XFxuICAgICAgICA8c3Bhbj5cIiArICh0aGlzLl90KCdkZWxldGVSb3cnKSkgKyBcIjwvc3Bhbj5cXG4gICAgICA8L2E+XFxuICAgIDwvbGk+XFxuICAgIDxsaT5cXG4gICAgICA8YSB0YWJpbmRleD1cXFwiLTFcXFwiIHVuc2VsZWN0YWJsZT1cXFwib25cXFwiIGNsYXNzPVxcXCJtZW51LWl0ZW1cXFwiXFxuICAgICAgICBocmVmPVxcXCJqYXZhc2NyaXB0OjtcXFwiIGRhdGEtcGFyYW09XFxcImluc2VydFJvd0Fib3ZlXFxcIj5cXG4gICAgICAgIDxzcGFuPlwiICsgKHRoaXMuX3QoJ2luc2VydFJvd0Fib3ZlJykpICsgXCIgKCBDdHJsICsgQWx0ICsg4oaRICk8L3NwYW4+XFxuICAgICAgPC9hPlxcbiAgICA8L2xpPlxcbiAgICA8bGk+XFxuICAgICAgPGEgdGFiaW5kZXg9XFxcIi0xXFxcIiB1bnNlbGVjdGFibGU9XFxcIm9uXFxcIiBjbGFzcz1cXFwibWVudS1pdGVtXFxcIlxcbiAgICAgICAgaHJlZj1cXFwiamF2YXNjcmlwdDo7XFxcIiBkYXRhLXBhcmFtPVxcXCJpbnNlcnRSb3dCZWxvd1xcXCI+XFxuICAgICAgICA8c3Bhbj5cIiArICh0aGlzLl90KCdpbnNlcnRSb3dCZWxvdycpKSArIFwiICggQ3RybCArIEFsdCArIOKGkyApPC9zcGFuPlxcbiAgICAgIDwvYT5cXG4gICAgPC9saT5cXG4gICAgPGxpPjxzcGFuIGNsYXNzPVxcXCJzZXBhcmF0b3JcXFwiPjwvc3Bhbj48L2xpPlxcbiAgICA8bGk+XFxuICAgICAgPGEgdGFiaW5kZXg9XFxcIi0xXFxcIiB1bnNlbGVjdGFibGU9XFxcIm9uXFxcIiBjbGFzcz1cXFwibWVudS1pdGVtXFxcIlxcbiAgICAgICAgaHJlZj1cXFwiamF2YXNjcmlwdDo7XFxcIiBkYXRhLXBhcmFtPVxcXCJkZWxldGVDb2xcXFwiPlxcbiAgICAgICAgPHNwYW4+XCIgKyAodGhpcy5fdCgnZGVsZXRlQ29sdW1uJykpICsgXCI8L3NwYW4+XFxuICAgICAgPC9hPlxcbiAgICA8L2xpPlxcbiAgICA8bGk+XFxuICAgICAgPGEgdGFiaW5kZXg9XFxcIi0xXFxcIiB1bnNlbGVjdGFibGU9XFxcIm9uXFxcIiBjbGFzcz1cXFwibWVudS1pdGVtXFxcIlxcbiAgICAgICAgaHJlZj1cXFwiamF2YXNjcmlwdDo7XFxcIiBkYXRhLXBhcmFtPVxcXCJpbnNlcnRDb2xMZWZ0XFxcIj5cXG4gICAgICAgIDxzcGFuPlwiICsgKHRoaXMuX3QoJ2luc2VydENvbHVtbkxlZnQnKSkgKyBcIiAoIEN0cmwgKyBBbHQgKyDihpAgKTwvc3Bhbj5cXG4gICAgICA8L2E+XFxuICAgIDwvbGk+XFxuICAgIDxsaT5cXG4gICAgICA8YSB0YWJpbmRleD1cXFwiLTFcXFwiIHVuc2VsZWN0YWJsZT1cXFwib25cXFwiIGNsYXNzPVxcXCJtZW51LWl0ZW1cXFwiXFxuICAgICAgICBocmVmPVxcXCJqYXZhc2NyaXB0OjtcXFwiIGRhdGEtcGFyYW09XFxcImluc2VydENvbFJpZ2h0XFxcIj5cXG4gICAgICAgIDxzcGFuPlwiICsgKHRoaXMuX3QoJ2luc2VydENvbHVtblJpZ2h0JykpICsgXCIgKCBDdHJsICsgQWx0ICsg4oaSICk8L3NwYW4+XFxuICAgICAgPC9hPlxcbiAgICA8L2xpPlxcbiAgICA8bGk+PHNwYW4gY2xhc3M9XFxcInNlcGFyYXRvclxcXCI+PC9zcGFuPjwvbGk+XFxuICAgIDxsaT5cXG4gICAgICA8YSB0YWJpbmRleD1cXFwiLTFcXFwiIHVuc2VsZWN0YWJsZT1cXFwib25cXFwiIGNsYXNzPVxcXCJtZW51LWl0ZW1cXFwiXFxuICAgICAgICBocmVmPVxcXCJqYXZhc2NyaXB0OjtcXFwiIGRhdGEtcGFyYW09XFxcImRlbGV0ZVRhYmxlXFxcIj5cXG4gICAgICAgIDxzcGFuPlwiICsgKHRoaXMuX3QoJ2RlbGV0ZVRhYmxlJykpICsgXCI8L3NwYW4+XFxuICAgICAgPC9hPlxcbiAgICA8L2xpPlxcbiAgPC91bD5cXG48L2Rpdj5cIikuYXBwZW5kVG8odGhpcy5tZW51V3JhcHBlcik7XG4gICAgdGhpcy5jcmVhdGVNZW51ID0gdGhpcy5tZW51V3JhcHBlci5maW5kKCcubWVudS1jcmVhdGUtdGFibGUnKTtcbiAgICB0aGlzLmVkaXRNZW51ID0gdGhpcy5tZW51V3JhcHBlci5maW5kKCcubWVudS1lZGl0LXRhYmxlJyk7XG4gICAgJHRhYmxlID0gdGhpcy5jcmVhdGVUYWJsZSg2LCA2KS5hcHBlbmRUbyh0aGlzLmNyZWF0ZU1lbnUpO1xuICAgIHRoaXMuY3JlYXRlTWVudS5vbignbW91c2VlbnRlcicsICd0ZCwgdGgnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciAkdGQsICR0ciwgJHRycywgbnVtO1xuICAgICAgICBfdGhpcy5jcmVhdGVNZW51LmZpbmQoJ3RkLCB0aCcpLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAkdGQgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgICR0ciA9ICR0ZC5wYXJlbnQoKTtcbiAgICAgICAgbnVtID0gJHRyLmZpbmQoJ3RkLCB0aCcpLmluZGV4KCR0ZCkgKyAxO1xuICAgICAgICAkdHJzID0gJHRyLnByZXZBbGwoJ3RyJykuYWRkQmFjaygpO1xuICAgICAgICBpZiAoJHRyLnBhcmVudCgpLmlzKCd0Ym9keScpKSB7XG4gICAgICAgICAgJHRycyA9ICR0cnMuYWRkKCR0YWJsZS5maW5kKCd0aGVhZCB0cicpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJHRycy5maW5kKFwidGQ6bHQoXCIgKyBudW0gKyBcIiksIHRoOmx0KFwiICsgbnVtICsgXCIpXCIpLmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gICAgdGhpcy5jcmVhdGVNZW51Lm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24oZSkge1xuICAgICAgcmV0dXJuICQoZS5jdXJyZW50VGFyZ2V0KS5maW5kKCd0ZCwgdGgnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVNZW51Lm9uKCdtb3VzZWRvd24nLCAndGQsIHRoJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJGNsb3Nlc3RCbG9jaywgJHRkLCAkdHIsIGNvbE51bSwgcm93TnVtO1xuICAgICAgICBfdGhpcy53cmFwcGVyLnJlbW92ZUNsYXNzKCdtZW51LW9uJyk7XG4gICAgICAgIGlmICghX3RoaXMuZWRpdG9yLmlucHV0TWFuYWdlci5mb2N1c2VkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICR0ZCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgJHRyID0gJHRkLnBhcmVudCgpO1xuICAgICAgICBjb2xOdW0gPSAkdHIuZmluZCgndGQnKS5pbmRleCgkdGQpICsgMTtcbiAgICAgICAgcm93TnVtID0gJHRyLnByZXZBbGwoJ3RyJykubGVuZ3RoICsgMTtcbiAgICAgICAgaWYgKCR0ci5wYXJlbnQoKS5pcygndGJvZHknKSkge1xuICAgICAgICAgIHJvd051bSArPSAxO1xuICAgICAgICB9XG4gICAgICAgICR0YWJsZSA9IF90aGlzLmNyZWF0ZVRhYmxlKHJvd051bSwgY29sTnVtLCB0cnVlKTtcbiAgICAgICAgJGNsb3Nlc3RCbG9jayA9IF90aGlzLmVkaXRvci5zZWxlY3Rpb24uYmxvY2tOb2RlcygpLmxhc3QoKTtcbiAgICAgICAgaWYgKF90aGlzLmVkaXRvci51dGlsLmlzRW1wdHlOb2RlKCRjbG9zZXN0QmxvY2spKSB7XG4gICAgICAgICAgJGNsb3Nlc3RCbG9jay5yZXBsYWNlV2l0aCgkdGFibGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRjbG9zZXN0QmxvY2suYWZ0ZXIoJHRhYmxlKTtcbiAgICAgICAgfVxuICAgICAgICBfdGhpcy5kZWNvcmF0ZSgkdGFibGUpO1xuICAgICAgICBfdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnNldFJhbmdlQXRTdGFydE9mKCR0YWJsZS5maW5kKCd0aDpmaXJzdCcpKTtcbiAgICAgICAgX3RoaXMuZWRpdG9yLnRyaWdnZXIoJ3ZhbHVlY2hhbmdlZCcpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBUYWJsZUJ1dHRvbi5wcm90b3R5cGUuY3JlYXRlVGFibGUgPSBmdW5jdGlvbihyb3csIGNvbCwgcGhCcikge1xuICAgIHZhciAkdGFibGUsICR0Ym9keSwgJHRkLCAkdGhlYWQsICR0ciwgYywgaywgbCwgciwgcmVmLCByZWYxO1xuICAgICR0YWJsZSA9ICQoJzx0YWJsZS8+Jyk7XG4gICAgJHRoZWFkID0gJCgnPHRoZWFkLz4nKS5hcHBlbmRUbygkdGFibGUpO1xuICAgICR0Ym9keSA9ICQoJzx0Ym9keS8+JykuYXBwZW5kVG8oJHRhYmxlKTtcbiAgICBmb3IgKHIgPSBrID0gMCwgcmVmID0gcm93OyAwIDw9IHJlZiA/IGsgPCByZWYgOiBrID4gcmVmOyByID0gMCA8PSByZWYgPyArK2sgOiAtLWspIHtcbiAgICAgICR0ciA9ICQoJzx0ci8+Jyk7XG4gICAgICAkdHIuYXBwZW5kVG8ociA9PT0gMCA/ICR0aGVhZCA6ICR0Ym9keSk7XG4gICAgICBmb3IgKGMgPSBsID0gMCwgcmVmMSA9IGNvbDsgMCA8PSByZWYxID8gbCA8IHJlZjEgOiBsID4gcmVmMTsgYyA9IDAgPD0gcmVmMSA/ICsrbCA6IC0tbCkge1xuICAgICAgICAkdGQgPSAkKHIgPT09IDAgPyAnPHRoLz4nIDogJzx0ZC8+JykuYXBwZW5kVG8oJHRyKTtcbiAgICAgICAgaWYgKHBoQnIpIHtcbiAgICAgICAgICAkdGQuYXBwZW5kKHRoaXMuZWRpdG9yLnV0aWwucGhCcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICR0YWJsZTtcbiAgfTtcblxuICBUYWJsZUJ1dHRvbi5wcm90b3R5cGUucmVmcmVzaFRhYmxlV2lkdGggPSBmdW5jdGlvbigkdGFibGUpIHtcbiAgICB2YXIgY29scywgdGFibGVXaWR0aDtcbiAgICB0YWJsZVdpZHRoID0gJHRhYmxlLndpZHRoKCk7XG4gICAgY29scyA9ICR0YWJsZS5maW5kKCdjb2wnKTtcbiAgICByZXR1cm4gJHRhYmxlLmZpbmQoJ3RoZWFkIHRyIHRoJykuZWFjaChmdW5jdGlvbihpLCB0ZCkge1xuICAgICAgdmFyICRjb2w7XG4gICAgICAkY29sID0gY29scy5lcShpKTtcbiAgICAgIHJldHVybiAkY29sLmF0dHIoJ3dpZHRoJywgKCQodGQpLm91dGVyV2lkdGgoKSAvIHRhYmxlV2lkdGggKiAxMDApICsgJyUnKTtcbiAgICB9KTtcbiAgfTtcblxuICBUYWJsZUJ1dHRvbi5wcm90b3R5cGUuc2V0QWN0aXZlID0gZnVuY3Rpb24oYWN0aXZlKSB7XG4gICAgVGFibGVCdXR0b24uX19zdXBlcl9fLnNldEFjdGl2ZS5jYWxsKHRoaXMsIGFjdGl2ZSk7XG4gICAgaWYgKGFjdGl2ZSkge1xuICAgICAgdGhpcy5jcmVhdGVNZW51LmhpZGUoKTtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRNZW51LnNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jcmVhdGVNZW51LnNob3coKTtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRNZW51LmhpZGUoKTtcbiAgICB9XG4gIH07XG5cbiAgVGFibGVCdXR0b24ucHJvdG90eXBlLl9jaGFuZ2VDZWxsVGFnID0gZnVuY3Rpb24oJHRyLCB0YWdOYW1lKSB7XG4gICAgcmV0dXJuICR0ci5maW5kKCd0ZCwgdGgnKS5lYWNoKGZ1bmN0aW9uKGksIGNlbGwpIHtcbiAgICAgIHZhciAkY2VsbDtcbiAgICAgICRjZWxsID0gJChjZWxsKTtcbiAgICAgIHJldHVybiAkY2VsbC5yZXBsYWNlV2l0aChcIjxcIiArIHRhZ05hbWUgKyBcIj5cIiArICgkY2VsbC5odG1sKCkpICsgXCI8L1wiICsgdGFnTmFtZSArIFwiPlwiKTtcbiAgICB9KTtcbiAgfTtcblxuICBUYWJsZUJ1dHRvbi5wcm90b3R5cGUuZGVsZXRlUm93ID0gZnVuY3Rpb24oJHRkKSB7XG4gICAgdmFyICRuZXdUciwgJHRyLCBpbmRleDtcbiAgICAkdHIgPSAkdGQucGFyZW50KCd0cicpO1xuICAgIGlmICgkdHIuY2xvc2VzdCgndGFibGUnKS5maW5kKCd0cicpLmxlbmd0aCA8IDEpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlbGV0ZVRhYmxlKCR0ZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRuZXdUciA9IHRoaXMuX25leHRSb3coJHRyKTtcbiAgICAgIGlmICghKCRuZXdUci5sZW5ndGggPiAwKSkge1xuICAgICAgICAkbmV3VHIgPSB0aGlzLl9wcmV2Um93KCR0cik7XG4gICAgICB9XG4gICAgICBpbmRleCA9ICR0ci5maW5kKCd0ZCwgdGgnKS5pbmRleCgkdGQpO1xuICAgICAgaWYgKCR0ci5wYXJlbnQoKS5pcygndGhlYWQnKSkge1xuICAgICAgICAkbmV3VHIuYXBwZW5kVG8oJHRyLnBhcmVudCgpKTtcbiAgICAgICAgdGhpcy5fY2hhbmdlQ2VsbFRhZygkbmV3VHIsICd0aCcpO1xuICAgICAgfVxuICAgICAgJHRyLnJlbW92ZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUF0RW5kT2YoJG5ld1RyLmZpbmQoJ3RkLCB0aCcpLmVxKGluZGV4KSk7XG4gICAgfVxuICB9O1xuXG4gIFRhYmxlQnV0dG9uLnByb3RvdHlwZS5pbnNlcnRSb3cgPSBmdW5jdGlvbigkdGQsIGRpcmVjdGlvbikge1xuICAgIHZhciAkbmV3VHIsICR0YWJsZSwgJHRyLCBjZWxsVGFnLCBjb2xOdW0sIGksIGluZGV4LCBrLCByZWY7XG4gICAgaWYgKGRpcmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICBkaXJlY3Rpb24gPSAnYWZ0ZXInO1xuICAgIH1cbiAgICAkdHIgPSAkdGQucGFyZW50KCd0cicpO1xuICAgICR0YWJsZSA9ICR0ci5jbG9zZXN0KCd0YWJsZScpO1xuICAgIGNvbE51bSA9IDA7XG4gICAgJHRhYmxlLmZpbmQoJ3RyJykuZWFjaChmdW5jdGlvbihpLCB0cikge1xuICAgICAgcmV0dXJuIGNvbE51bSA9IE1hdGgubWF4KGNvbE51bSwgJCh0cikuZmluZCgndGQnKS5sZW5ndGgpO1xuICAgIH0pO1xuICAgIGluZGV4ID0gJHRyLmZpbmQoJ3RkLCB0aCcpLmluZGV4KCR0ZCk7XG4gICAgJG5ld1RyID0gJCgnPHRyLz4nKTtcbiAgICBjZWxsVGFnID0gJ3RkJztcbiAgICBpZiAoZGlyZWN0aW9uID09PSAnYWZ0ZXInICYmICR0ci5wYXJlbnQoKS5pcygndGhlYWQnKSkge1xuICAgICAgJHRyLnBhcmVudCgpLm5leHQoJ3Rib2R5JykucHJlcGVuZCgkbmV3VHIpO1xuICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnYmVmb3JlJyAmJiAkdHIucGFyZW50KCkuaXMoJ3RoZWFkJykpIHtcbiAgICAgICR0ci5iZWZvcmUoJG5ld1RyKTtcbiAgICAgICR0ci5wYXJlbnQoKS5uZXh0KCd0Ym9keScpLnByZXBlbmQoJHRyKTtcbiAgICAgIHRoaXMuX2NoYW5nZUNlbGxUYWcoJHRyLCAndGQnKTtcbiAgICAgIGNlbGxUYWcgPSAndGgnO1xuICAgIH0gZWxzZSB7XG4gICAgICAkdHJbZGlyZWN0aW9uXSgkbmV3VHIpO1xuICAgIH1cbiAgICBmb3IgKGkgPSBrID0gMSwgcmVmID0gY29sTnVtOyAxIDw9IHJlZiA/IGsgPD0gcmVmIDogayA+PSByZWY7IGkgPSAxIDw9IHJlZiA/ICsrayA6IC0taykge1xuICAgICAgJChcIjxcIiArIGNlbGxUYWcgKyBcIi8+XCIpLmFwcGVuZCh0aGlzLmVkaXRvci51dGlsLnBoQnIpLmFwcGVuZFRvKCRuZXdUcik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VBdFN0YXJ0T2YoJG5ld1RyLmZpbmQoJ3RkLCB0aCcpLmVxKGluZGV4KSk7XG4gIH07XG5cbiAgVGFibGVCdXR0b24ucHJvdG90eXBlLmRlbGV0ZUNvbCA9IGZ1bmN0aW9uKCR0ZCkge1xuICAgIHZhciAkbmV3VGQsICR0YWJsZSwgJHRyLCBpbmRleCwgbm9PdGhlckNvbCwgbm9PdGhlclJvdztcbiAgICAkdHIgPSAkdGQucGFyZW50KCd0cicpO1xuICAgIG5vT3RoZXJSb3cgPSAkdHIuY2xvc2VzdCgndGFibGUnKS5maW5kKCd0cicpLmxlbmd0aCA8IDI7XG4gICAgbm9PdGhlckNvbCA9ICR0ZC5zaWJsaW5ncygndGQsIHRoJykubGVuZ3RoIDwgMTtcbiAgICBpZiAobm9PdGhlclJvdyAmJiBub090aGVyQ29sKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWxldGVUYWJsZSgkdGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbmRleCA9ICR0ci5maW5kKCd0ZCwgdGgnKS5pbmRleCgkdGQpO1xuICAgICAgJG5ld1RkID0gJHRkLm5leHQoJ3RkLCB0aCcpO1xuICAgICAgaWYgKCEoJG5ld1RkLmxlbmd0aCA+IDApKSB7XG4gICAgICAgICRuZXdUZCA9ICR0ci5wcmV2KCd0ZCwgdGgnKTtcbiAgICAgIH1cbiAgICAgICR0YWJsZSA9ICR0ci5jbG9zZXN0KCd0YWJsZScpO1xuICAgICAgJHRhYmxlLmZpbmQoJ2NvbCcpLmVxKGluZGV4KS5yZW1vdmUoKTtcbiAgICAgICR0YWJsZS5maW5kKCd0cicpLmVhY2goZnVuY3Rpb24oaSwgdHIpIHtcbiAgICAgICAgcmV0dXJuICQodHIpLmZpbmQoJ3RkLCB0aCcpLmVxKGluZGV4KS5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZWZyZXNoVGFibGVXaWR0aCgkdGFibGUpO1xuICAgICAgcmV0dXJuIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5zZXRSYW5nZUF0RW5kT2YoJG5ld1RkKTtcbiAgICB9XG4gIH07XG5cbiAgVGFibGVCdXR0b24ucHJvdG90eXBlLmluc2VydENvbCA9IGZ1bmN0aW9uKCR0ZCwgZGlyZWN0aW9uKSB7XG4gICAgdmFyICRjb2wsICRuZXdDb2wsICRuZXdUZCwgJHRhYmxlLCAkdHIsIGluZGV4LCB0YWJsZVdpZHRoLCB3aWR0aDtcbiAgICBpZiAoZGlyZWN0aW9uID09IG51bGwpIHtcbiAgICAgIGRpcmVjdGlvbiA9ICdhZnRlcic7XG4gICAgfVxuICAgICR0ciA9ICR0ZC5wYXJlbnQoJ3RyJyk7XG4gICAgaW5kZXggPSAkdHIuZmluZCgndGQsIHRoJykuaW5kZXgoJHRkKTtcbiAgICAkdGFibGUgPSAkdGQuY2xvc2VzdCgndGFibGUnKTtcbiAgICAkY29sID0gJHRhYmxlLmZpbmQoJ2NvbCcpLmVxKGluZGV4KTtcbiAgICAkdGFibGUuZmluZCgndHInKS5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIHRyKSB7XG4gICAgICAgIHZhciAkbmV3VGQsIGNlbGxUYWc7XG4gICAgICAgIGNlbGxUYWcgPSAkKHRyKS5wYXJlbnQoKS5pcygndGhlYWQnKSA/ICd0aCcgOiAndGQnO1xuICAgICAgICAkbmV3VGQgPSAkKFwiPFwiICsgY2VsbFRhZyArIFwiLz5cIikuYXBwZW5kKF90aGlzLmVkaXRvci51dGlsLnBoQnIpO1xuICAgICAgICByZXR1cm4gJCh0cikuZmluZCgndGQsIHRoJykuZXEoaW5kZXgpW2RpcmVjdGlvbl0oJG5ld1RkKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICAgICRuZXdDb2wgPSAkKCc8Y29sLz4nKTtcbiAgICAkY29sW2RpcmVjdGlvbl0oJG5ld0NvbCk7XG4gICAgdGFibGVXaWR0aCA9ICR0YWJsZS53aWR0aCgpO1xuICAgIHdpZHRoID0gTWF0aC5tYXgocGFyc2VGbG9hdCgkY29sLmF0dHIoJ3dpZHRoJykpIC8gMiwgNTAgLyB0YWJsZVdpZHRoICogMTAwKTtcbiAgICAkY29sLmF0dHIoJ3dpZHRoJywgd2lkdGggKyAnJScpO1xuICAgICRuZXdDb2wuYXR0cignd2lkdGgnLCB3aWR0aCArICclJyk7XG4gICAgdGhpcy5yZWZyZXNoVGFibGVXaWR0aCgkdGFibGUpO1xuICAgICRuZXdUZCA9IGRpcmVjdGlvbiA9PT0gJ2FmdGVyJyA/ICR0ZC5uZXh0KCd0ZCwgdGgnKSA6ICR0ZC5wcmV2KCd0ZCwgdGgnKTtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLnNldFJhbmdlQXRTdGFydE9mKCRuZXdUZCk7XG4gIH07XG5cbiAgVGFibGVCdXR0b24ucHJvdG90eXBlLmRlbGV0ZVRhYmxlID0gZnVuY3Rpb24oJHRkKSB7XG4gICAgdmFyICRibG9jaywgJHRhYmxlO1xuICAgICR0YWJsZSA9ICR0ZC5jbG9zZXN0KCcuc2ltZGl0b3ItdGFibGUnKTtcbiAgICAkYmxvY2sgPSAkdGFibGUubmV4dCgncCcpO1xuICAgICR0YWJsZS5yZW1vdmUoKTtcbiAgICBpZiAoJGJsb2NrLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmVkaXRvci5zZWxlY3Rpb24uc2V0UmFuZ2VBdFN0YXJ0T2YoJGJsb2NrKTtcbiAgICB9XG4gIH07XG5cbiAgVGFibGVCdXR0b24ucHJvdG90eXBlLmNvbW1hbmQgPSBmdW5jdGlvbihwYXJhbSkge1xuICAgIHZhciAkdGQ7XG4gICAgJHRkID0gdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLmNvbnRhaW5lck5vZGUoKS5jbG9zZXN0KCd0ZCwgdGgnKTtcbiAgICBpZiAoISgkdGQubGVuZ3RoID4gMCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHBhcmFtID09PSAnZGVsZXRlUm93Jykge1xuICAgICAgdGhpcy5kZWxldGVSb3coJHRkKTtcbiAgICB9IGVsc2UgaWYgKHBhcmFtID09PSAnaW5zZXJ0Um93QWJvdmUnKSB7XG4gICAgICB0aGlzLmluc2VydFJvdygkdGQsICdiZWZvcmUnKTtcbiAgICB9IGVsc2UgaWYgKHBhcmFtID09PSAnaW5zZXJ0Um93QmVsb3cnKSB7XG4gICAgICB0aGlzLmluc2VydFJvdygkdGQpO1xuICAgIH0gZWxzZSBpZiAocGFyYW0gPT09ICdkZWxldGVDb2wnKSB7XG4gICAgICB0aGlzLmRlbGV0ZUNvbCgkdGQpO1xuICAgIH0gZWxzZSBpZiAocGFyYW0gPT09ICdpbnNlcnRDb2xMZWZ0Jykge1xuICAgICAgdGhpcy5pbnNlcnRDb2woJHRkLCAnYmVmb3JlJyk7XG4gICAgfSBlbHNlIGlmIChwYXJhbSA9PT0gJ2luc2VydENvbFJpZ2h0Jykge1xuICAgICAgdGhpcy5pbnNlcnRDb2woJHRkKTtcbiAgICB9IGVsc2UgaWYgKHBhcmFtID09PSAnZGVsZXRlVGFibGUnKSB7XG4gICAgICB0aGlzLmRlbGV0ZVRhYmxlKCR0ZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLnRyaWdnZXIoJ3ZhbHVlY2hhbmdlZCcpO1xuICB9O1xuXG4gIHJldHVybiBUYWJsZUJ1dHRvbjtcblxufSkoQnV0dG9uKTtcblxuU2ltZGl0b3IuVG9vbGJhci5hZGRCdXR0b24oVGFibGVCdXR0b24pO1xuXG5TdHJpa2V0aHJvdWdoQnV0dG9uID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgZXh0ZW5kKFN0cmlrZXRocm91Z2hCdXR0b24sIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIFN0cmlrZXRocm91Z2hCdXR0b24oKSB7XG4gICAgcmV0dXJuIFN0cmlrZXRocm91Z2hCdXR0b24uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBTdHJpa2V0aHJvdWdoQnV0dG9uLnByb3RvdHlwZS5uYW1lID0gJ3N0cmlrZXRocm91Z2gnO1xuXG4gIFN0cmlrZXRocm91Z2hCdXR0b24ucHJvdG90eXBlLmljb24gPSAnc3RyaWtldGhyb3VnaCc7XG5cbiAgU3RyaWtldGhyb3VnaEJ1dHRvbi5wcm90b3R5cGUuaHRtbFRhZyA9ICdzdHJpa2UnO1xuXG4gIFN0cmlrZXRocm91Z2hCdXR0b24ucHJvdG90eXBlLmRpc2FibGVUYWcgPSAncHJlJztcblxuICBTdHJpa2V0aHJvdWdoQnV0dG9uLnByb3RvdHlwZS5fYWN0aXZlU3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFjdGl2ZTtcbiAgICBhY3RpdmUgPSBkb2N1bWVudC5xdWVyeUNvbW1hbmRTdGF0ZSgnc3RyaWtldGhyb3VnaCcpID09PSB0cnVlO1xuICAgIHRoaXMuc2V0QWN0aXZlKGFjdGl2ZSk7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlO1xuICB9O1xuXG4gIFN0cmlrZXRocm91Z2hCdXR0b24ucHJvdG90eXBlLmNvbW1hbmQgPSBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnc3RyaWtldGhyb3VnaCcpO1xuICAgIGlmICghdGhpcy5lZGl0b3IudXRpbC5zdXBwb3J0Lm9uaW5wdXQpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnRyaWdnZXIoJ3ZhbHVlY2hhbmdlZCcpO1xuICAgIH1cbiAgICByZXR1cm4gJChkb2N1bWVudCkudHJpZ2dlcignc2VsZWN0aW9uY2hhbmdlJyk7XG4gIH07XG5cbiAgcmV0dXJuIFN0cmlrZXRocm91Z2hCdXR0b247XG5cbn0pKEJ1dHRvbik7XG5cblNpbWRpdG9yLlRvb2xiYXIuYWRkQnV0dG9uKFN0cmlrZXRocm91Z2hCdXR0b24pO1xuXG5BbGlnbm1lbnRCdXR0b24gPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoQWxpZ25tZW50QnV0dG9uLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBBbGlnbm1lbnRCdXR0b24oKSB7XG4gICAgcmV0dXJuIEFsaWdubWVudEJ1dHRvbi5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIEFsaWdubWVudEJ1dHRvbi5wcm90b3R5cGUubmFtZSA9IFwiYWxpZ25tZW50XCI7XG5cbiAgQWxpZ25tZW50QnV0dG9uLnByb3RvdHlwZS5pY29uID0gJ2FsaWduLWxlZnQnO1xuXG4gIEFsaWdubWVudEJ1dHRvbi5wcm90b3R5cGUuaHRtbFRhZyA9ICdwLCBoMSwgaDIsIGgzLCBoNCwgdGQsIHRoJztcblxuICBBbGlnbm1lbnRCdXR0b24ucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tZW51ID0gW1xuICAgICAge1xuICAgICAgICBuYW1lOiAnbGVmdCcsXG4gICAgICAgIHRleHQ6IHRoaXMuX3QoJ2FsaWduTGVmdCcpLFxuICAgICAgICBpY29uOiAnYWxpZ24tbGVmdCcsXG4gICAgICAgIHBhcmFtOiAnbGVmdCdcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ2NlbnRlcicsXG4gICAgICAgIHRleHQ6IHRoaXMuX3QoJ2FsaWduQ2VudGVyJyksXG4gICAgICAgIGljb246ICdhbGlnbi1jZW50ZXInLFxuICAgICAgICBwYXJhbTogJ2NlbnRlcidcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ3JpZ2h0JyxcbiAgICAgICAgdGV4dDogdGhpcy5fdCgnYWxpZ25SaWdodCcpLFxuICAgICAgICBpY29uOiAnYWxpZ24tcmlnaHQnLFxuICAgICAgICBwYXJhbTogJ3JpZ2h0J1xuICAgICAgfVxuICAgIF07XG4gICAgcmV0dXJuIEFsaWdubWVudEJ1dHRvbi5fX3N1cGVyX18uX2luaXQuY2FsbCh0aGlzKTtcbiAgfTtcblxuICBBbGlnbm1lbnRCdXR0b24ucHJvdG90eXBlLnNldEFjdGl2ZSA9IGZ1bmN0aW9uKGFjdGl2ZSwgYWxpZ24pIHtcbiAgICBpZiAoYWxpZ24gPT0gbnVsbCkge1xuICAgICAgYWxpZ24gPSAnbGVmdCc7XG4gICAgfVxuICAgIGlmIChhbGlnbiAhPT0gJ2xlZnQnICYmIGFsaWduICE9PSAnY2VudGVyJyAmJiBhbGlnbiAhPT0gJ3JpZ2h0Jykge1xuICAgICAgYWxpZ24gPSAnbGVmdCc7XG4gICAgfVxuICAgIGlmIChhbGlnbiA9PT0gJ2xlZnQnKSB7XG4gICAgICBBbGlnbm1lbnRCdXR0b24uX19zdXBlcl9fLnNldEFjdGl2ZS5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgQWxpZ25tZW50QnV0dG9uLl9fc3VwZXJfXy5zZXRBY3RpdmUuY2FsbCh0aGlzLCBhY3RpdmUpO1xuICAgIH1cbiAgICB0aGlzLmVsLnJlbW92ZUNsYXNzKCdhbGlnbi1sZWZ0IGFsaWduLWNlbnRlciBhbGlnbi1yaWdodCcpO1xuICAgIGlmIChhY3RpdmUpIHtcbiAgICAgIHRoaXMuZWwuYWRkQ2xhc3MoJ2FsaWduLScgKyBhbGlnbik7XG4gICAgfVxuICAgIHRoaXMuc2V0SWNvbignYWxpZ24tJyArIGFsaWduKTtcbiAgICByZXR1cm4gdGhpcy5tZW51RWwuZmluZCgnLm1lbnUtaXRlbScpLnNob3coKS5lbmQoKS5maW5kKCcubWVudS1pdGVtLScgKyBhbGlnbikuaGlkZSgpO1xuICB9O1xuXG4gIEFsaWdubWVudEJ1dHRvbi5wcm90b3R5cGUuX3N0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubm9kZXMgPSB0aGlzLmVkaXRvci5zZWxlY3Rpb24ubm9kZXMoKS5maWx0ZXIodGhpcy5odG1sVGFnKTtcbiAgICBpZiAodGhpcy5ub2Rlcy5sZW5ndGggPCAxKSB7XG4gICAgICB0aGlzLnNldERpc2FibGVkKHRydWUpO1xuICAgICAgcmV0dXJuIHRoaXMuc2V0QWN0aXZlKGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXREaXNhYmxlZChmYWxzZSk7XG4gICAgICByZXR1cm4gdGhpcy5zZXRBY3RpdmUodHJ1ZSwgdGhpcy5ub2Rlcy5maXJzdCgpLmNzcygndGV4dC1hbGlnbicpKTtcbiAgICB9XG4gIH07XG5cbiAgQWxpZ25tZW50QnV0dG9uLnByb3RvdHlwZS5jb21tYW5kID0gZnVuY3Rpb24oYWxpZ24pIHtcbiAgICBpZiAoYWxpZ24gIT09ICdsZWZ0JyAmJiBhbGlnbiAhPT0gJ2NlbnRlcicgJiYgYWxpZ24gIT09ICdyaWdodCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInNpbWRpdG9yIGFsaWdubWVudCBidXR0b246IGludmFsaWQgYWxpZ24gXCIgKyBhbGlnbik7XG4gICAgfVxuICAgIHRoaXMubm9kZXMuY3NzKHtcbiAgICAgICd0ZXh0LWFsaWduJzogYWxpZ24gPT09ICdsZWZ0JyA/ICcnIDogYWxpZ25cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IudHJpZ2dlcigndmFsdWVjaGFuZ2VkJyk7XG4gIH07XG5cbiAgcmV0dXJuIEFsaWdubWVudEJ1dHRvbjtcblxufSkoQnV0dG9uKTtcblxuU2ltZGl0b3IuVG9vbGJhci5hZGRCdXR0b24oQWxpZ25tZW50QnV0dG9uKTtcblxucmV0dXJuIFNpbWRpdG9yO1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblxuICByb290LnNpbXBsZSA9IHJvb3Quc2ltcGxlIHx8IHt9O1xuICByb290LnNpbXBsZVsnaG90a2V5cyddID0gZmFjdG9yeShqUXVlcnksU2ltcGxlTW9kdWxlKTtcbiAgXG59KHdpbmRvdywgZnVuY3Rpb24gKCQsIFNpbXBsZU1vZHVsZSkge1xuXG52YXIgSG90a2V5cywgaG90a2V5cyxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbkhvdGtleXMgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoSG90a2V5cywgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gSG90a2V5cygpIHtcbiAgICByZXR1cm4gSG90a2V5cy5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIEhvdGtleXMuY291bnQgPSAwO1xuXG4gIEhvdGtleXMua2V5TmFtZU1hcCA9IHtcbiAgICA4OiBcIkJhY2tzcGFjZVwiLFxuICAgIDk6IFwiVGFiXCIsXG4gICAgMTM6IFwiRW50ZXJcIixcbiAgICAxNjogXCJTaGlmdFwiLFxuICAgIDE3OiBcIkNvbnRyb2xcIixcbiAgICAxODogXCJBbHRcIixcbiAgICAxOTogXCJQYXVzZVwiLFxuICAgIDIwOiBcIkNhcHNMb2NrXCIsXG4gICAgMjc6IFwiRXNjXCIsXG4gICAgMzI6IFwiU3BhY2ViYXJcIixcbiAgICAzMzogXCJQYWdlVXBcIixcbiAgICAzNDogXCJQYWdlRG93blwiLFxuICAgIDM1OiBcIkVuZFwiLFxuICAgIDM2OiBcIkhvbWVcIixcbiAgICAzNzogXCJMZWZ0XCIsXG4gICAgMzg6IFwiVXBcIixcbiAgICAzOTogXCJSaWdodFwiLFxuICAgIDQwOiBcIkRvd25cIixcbiAgICA0NTogXCJJbnNlcnRcIixcbiAgICA0NjogXCJEZWxcIixcbiAgICA5MTogXCJNZXRhXCIsXG4gICAgOTM6IFwiTWV0YVwiLFxuICAgIDQ4OiBcIjBcIixcbiAgICA0OTogXCIxXCIsXG4gICAgNTA6IFwiMlwiLFxuICAgIDUxOiBcIjNcIixcbiAgICA1MjogXCI0XCIsXG4gICAgNTM6IFwiNVwiLFxuICAgIDU0OiBcIjZcIixcbiAgICA1NTogXCI3XCIsXG4gICAgNTY6IFwiOFwiLFxuICAgIDU3OiBcIjlcIixcbiAgICA2NTogXCJBXCIsXG4gICAgNjY6IFwiQlwiLFxuICAgIDY3OiBcIkNcIixcbiAgICA2ODogXCJEXCIsXG4gICAgNjk6IFwiRVwiLFxuICAgIDcwOiBcIkZcIixcbiAgICA3MTogXCJHXCIsXG4gICAgNzI6IFwiSFwiLFxuICAgIDczOiBcIklcIixcbiAgICA3NDogXCJKXCIsXG4gICAgNzU6IFwiS1wiLFxuICAgIDc2OiBcIkxcIixcbiAgICA3NzogXCJNXCIsXG4gICAgNzg6IFwiTlwiLFxuICAgIDc5OiBcIk9cIixcbiAgICA4MDogXCJQXCIsXG4gICAgODE6IFwiUVwiLFxuICAgIDgyOiBcIlJcIixcbiAgICA4MzogXCJTXCIsXG4gICAgODQ6IFwiVFwiLFxuICAgIDg1OiBcIlVcIixcbiAgICA4NjogXCJWXCIsXG4gICAgODc6IFwiV1wiLFxuICAgIDg4OiBcIlhcIixcbiAgICA4OTogXCJZXCIsXG4gICAgOTA6IFwiWlwiLFxuICAgIDk2OiBcIjBcIixcbiAgICA5NzogXCIxXCIsXG4gICAgOTg6IFwiMlwiLFxuICAgIDk5OiBcIjNcIixcbiAgICAxMDA6IFwiNFwiLFxuICAgIDEwMTogXCI1XCIsXG4gICAgMTAyOiBcIjZcIixcbiAgICAxMDM6IFwiN1wiLFxuICAgIDEwNDogXCI4XCIsXG4gICAgMTA1OiBcIjlcIixcbiAgICAxMDY6IFwiTXVsdGlwbHlcIixcbiAgICAxMDc6IFwiQWRkXCIsXG4gICAgMTA5OiBcIlN1YnRyYWN0XCIsXG4gICAgMTEwOiBcIkRlY2ltYWxcIixcbiAgICAxMTE6IFwiRGl2aWRlXCIsXG4gICAgMTEyOiBcIkYxXCIsXG4gICAgMTEzOiBcIkYyXCIsXG4gICAgMTE0OiBcIkYzXCIsXG4gICAgMTE1OiBcIkY0XCIsXG4gICAgMTE2OiBcIkY1XCIsXG4gICAgMTE3OiBcIkY2XCIsXG4gICAgMTE4OiBcIkY3XCIsXG4gICAgMTE5OiBcIkY4XCIsXG4gICAgMTIwOiBcIkY5XCIsXG4gICAgMTIxOiBcIkYxMFwiLFxuICAgIDEyMjogXCJGMTFcIixcbiAgICAxMjM6IFwiRjEyXCIsXG4gICAgMTI0OiBcIkYxM1wiLFxuICAgIDEyNTogXCJGMTRcIixcbiAgICAxMjY6IFwiRjE1XCIsXG4gICAgMTI3OiBcIkYxNlwiLFxuICAgIDEyODogXCJGMTdcIixcbiAgICAxMjk6IFwiRjE4XCIsXG4gICAgMTMwOiBcIkYxOVwiLFxuICAgIDEzMTogXCJGMjBcIixcbiAgICAxMzI6IFwiRjIxXCIsXG4gICAgMTMzOiBcIkYyMlwiLFxuICAgIDEzNDogXCJGMjNcIixcbiAgICAxMzU6IFwiRjI0XCIsXG4gICAgNTk6IFwiO1wiLFxuICAgIDYxOiBcIj1cIixcbiAgICAxODY6IFwiO1wiLFxuICAgIDE4NzogXCI9XCIsXG4gICAgMTg4OiBcIixcIixcbiAgICAxOTA6IFwiLlwiLFxuICAgIDE5MTogXCIvXCIsXG4gICAgMTkyOiBcImBcIixcbiAgICAyMTk6IFwiW1wiLFxuICAgIDIyMDogXCJcXFxcXCIsXG4gICAgMjIxOiBcIl1cIixcbiAgICAyMjI6IFwiJ1wiXG4gIH07XG5cbiAgSG90a2V5cy5hbGlhc2VzID0ge1xuICAgIFwiZXNjYXBlXCI6IFwiZXNjXCIsXG4gICAgXCJkZWxldGVcIjogXCJkZWxcIixcbiAgICBcInJldHVyblwiOiBcImVudGVyXCIsXG4gICAgXCJjdHJsXCI6IFwiY29udHJvbFwiLFxuICAgIFwic3BhY2VcIjogXCJzcGFjZWJhclwiLFxuICAgIFwiaW5zXCI6IFwiaW5zZXJ0XCIsXG4gICAgXCJjbWRcIjogXCJtZXRhXCIsXG4gICAgXCJjb21tYW5kXCI6IFwibWV0YVwiLFxuICAgIFwid2luc1wiOiBcIm1ldGFcIixcbiAgICBcIndpbmRvd3NcIjogXCJtZXRhXCJcbiAgfTtcblxuICBIb3RrZXlzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHNob3J0Y3V0KSB7XG4gICAgdmFyIGksIGosIGtleSwga2V5bmFtZSwga2V5cywgbGVuO1xuICAgIGtleXMgPSBzaG9ydGN1dC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccysvZ2ksIFwiXCIpLnNwbGl0KFwiK1wiKTtcbiAgICBmb3IgKGkgPSBqID0gMCwgbGVuID0ga2V5cy5sZW5ndGg7IGogPCBsZW47IGkgPSArK2opIHtcbiAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICBrZXlzW2ldID0gdGhpcy5hbGlhc2VzW2tleV0gfHwga2V5O1xuICAgIH1cbiAgICBrZXluYW1lID0ga2V5cy5wb3AoKTtcbiAgICBrZXlzLnNvcnQoKS5wdXNoKGtleW5hbWUpO1xuICAgIHJldHVybiBrZXlzLmpvaW4oXCJfXCIpO1xuICB9O1xuXG4gIEhvdGtleXMucHJvdG90eXBlLm9wdHMgPSB7XG4gICAgZWw6IGRvY3VtZW50XG4gIH07XG5cbiAgSG90a2V5cy5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlkID0gKyt0aGlzLmNvbnN0cnVjdG9yLmNvdW50O1xuICAgIHRoaXMuX21hcCA9IHt9O1xuICAgIHRoaXMuX2RlbGVnYXRlID0gdHlwZW9mIHRoaXMub3B0cy5lbCA9PT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50IDogdGhpcy5vcHRzLmVsO1xuICAgIHJldHVybiAkKHRoaXMuX2RlbGVnYXRlKS5vbihcImtleWRvd24uc2ltcGxlLWhvdGtleXMtXCIgKyB0aGlzLmlkLCB0aGlzLm9wdHMuZWwsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgcmV0dXJuIChyZWYgPSBfdGhpcy5fZ2V0SGFuZGVyKGUpKSAhPSBudWxsID8gcmVmLmNhbGwoX3RoaXMsIGUpIDogdm9pZCAwO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgSG90a2V5cy5wcm90b3R5cGUuX2dldEhhbmRlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIga2V5bmFtZSwgc2hvcnRjdXQ7XG4gICAgaWYgKCEoa2V5bmFtZSA9IHRoaXMuY29uc3RydWN0b3Iua2V5TmFtZU1hcFtlLndoaWNoXSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2hvcnRjdXQgPSBcIlwiO1xuICAgIGlmIChlLmFsdEtleSkge1xuICAgICAgc2hvcnRjdXQgKz0gXCJhbHRfXCI7XG4gICAgfVxuICAgIGlmIChlLmN0cmxLZXkpIHtcbiAgICAgIHNob3J0Y3V0ICs9IFwiY29udHJvbF9cIjtcbiAgICB9XG4gICAgaWYgKGUubWV0YUtleSkge1xuICAgICAgc2hvcnRjdXQgKz0gXCJtZXRhX1wiO1xuICAgIH1cbiAgICBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgc2hvcnRjdXQgKz0gXCJzaGlmdF9cIjtcbiAgICB9XG4gICAgc2hvcnRjdXQgKz0ga2V5bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHJldHVybiB0aGlzLl9tYXBbc2hvcnRjdXRdO1xuICB9O1xuXG4gIEhvdGtleXMucHJvdG90eXBlLnJlc3BvbmRUbyA9IGZ1bmN0aW9uKHN1YmplY3QpIHtcbiAgICBpZiAodHlwZW9mIHN1YmplY3QgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWFwW3RoaXMuY29uc3RydWN0b3Iubm9ybWFsaXplKHN1YmplY3QpXSAhPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0SGFuZGVyKHN1YmplY3QpICE9IG51bGw7XG4gICAgfVxuICB9O1xuXG4gIEhvdGtleXMucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHNob3J0Y3V0LCBoYW5kbGVyKSB7XG4gICAgdGhpcy5fbWFwW3RoaXMuY29uc3RydWN0b3Iubm9ybWFsaXplKHNob3J0Y3V0KV0gPSBoYW5kbGVyO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEhvdGtleXMucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKHNob3J0Y3V0KSB7XG4gICAgZGVsZXRlIHRoaXMuX21hcFt0aGlzLmNvbnN0cnVjdG9yLm5vcm1hbGl6ZShzaG9ydGN1dCldO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEhvdGtleXMucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICAkKHRoaXMuX2RlbGVnYXRlKS5vZmYoXCIuc2ltcGxlLWhvdGtleXMtXCIgKyB0aGlzLmlkKTtcbiAgICB0aGlzLl9tYXAgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICByZXR1cm4gSG90a2V5cztcblxufSkoU2ltcGxlTW9kdWxlKTtcblxuaG90a2V5cyA9IGZ1bmN0aW9uKG9wdHMpIHtcbiAgcmV0dXJuIG5ldyBIb3RrZXlzKG9wdHMpO1xufTtcblxucmV0dXJuIGhvdGtleXM7XG5cbn0pKTtcblxuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG5cbiAgcm9vdFsnU2ltcGxlTW9kdWxlJ10gPSBmYWN0b3J5KGpRdWVyeSk7XG5cbn0od2luZG93LCBmdW5jdGlvbiAoJCkge1xuXG52YXIgTW9kdWxlLFxuICBzbGljZSA9IFtdLnNsaWNlO1xuXG5Nb2R1bGUgPSAoZnVuY3Rpb24oKSB7XG4gIE1vZHVsZS5leHRlbmQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5LCByZWYsIHZhbDtcbiAgICBpZiAoISgob2JqICE9IG51bGwpICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgIHZhbCA9IG9ialtrZXldO1xuICAgICAgaWYgKGtleSAhPT0gJ2luY2x1ZGVkJyAmJiBrZXkgIT09ICdleHRlbmRlZCcpIHtcbiAgICAgICAgdGhpc1trZXldID0gdmFsO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gKHJlZiA9IG9iai5leHRlbmRlZCkgIT0gbnVsbCA/IHJlZi5jYWxsKHRoaXMpIDogdm9pZCAwO1xuICB9O1xuXG4gIE1vZHVsZS5pbmNsdWRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleSwgcmVmLCB2YWw7XG4gICAgaWYgKCEoKG9iaiAhPSBudWxsKSAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICB2YWwgPSBvYmpba2V5XTtcbiAgICAgIGlmIChrZXkgIT09ICdpbmNsdWRlZCcgJiYga2V5ICE9PSAnZXh0ZW5kZWQnKSB7XG4gICAgICAgIHRoaXMucHJvdG90eXBlW2tleV0gPSB2YWw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAocmVmID0gb2JqLmluY2x1ZGVkKSAhPSBudWxsID8gcmVmLmNhbGwodGhpcykgOiB2b2lkIDA7XG4gIH07XG5cbiAgTW9kdWxlLmNvbm5lY3QgPSBmdW5jdGlvbihjbHMpIHtcbiAgICBpZiAodHlwZW9mIGNscyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIWNscy5wbHVnaW5OYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01vZHVsZS5jb25uZWN0OiBjYW5ub3QgY29ubmVjdCBwbHVnaW4gd2l0aG91dCBwbHVnaW5OYW1lJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNscy5wcm90b3R5cGUuX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgaWYgKCF0aGlzLl9jb25uZWN0ZWRDbGFzc2VzKSB7XG4gICAgICB0aGlzLl9jb25uZWN0ZWRDbGFzc2VzID0gW107XG4gICAgfVxuICAgIHRoaXMuX2Nvbm5lY3RlZENsYXNzZXMucHVzaChjbHMpO1xuICAgIGlmIChjbHMucGx1Z2luTmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXNbY2xzLnBsdWdpbk5hbWVdID0gY2xzO1xuICAgIH1cbiAgfTtcblxuICBNb2R1bGUucHJvdG90eXBlLm9wdHMgPSB7fTtcblxuICBmdW5jdGlvbiBNb2R1bGUob3B0cykge1xuICAgIHZhciBiYXNlLCBjbHMsIGksIGluc3RhbmNlLCBpbnN0YW5jZXMsIGxlbiwgbmFtZTtcbiAgICB0aGlzLm9wdHMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRzLCBvcHRzKTtcbiAgICAoYmFzZSA9IHRoaXMuY29uc3RydWN0b3IpLl9jb25uZWN0ZWRDbGFzc2VzIHx8IChiYXNlLl9jb25uZWN0ZWRDbGFzc2VzID0gW10pO1xuICAgIGluc3RhbmNlcyA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICAgIHJlZiA9IHRoaXMuY29uc3RydWN0b3IuX2Nvbm5lY3RlZENsYXNzZXM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY2xzID0gcmVmW2ldO1xuICAgICAgICBuYW1lID0gY2xzLnBsdWdpbk5hbWUuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyBjbHMucGx1Z2luTmFtZS5zbGljZSgxKTtcbiAgICAgICAgaWYgKGNscy5wcm90b3R5cGUuX2Nvbm5lY3RlZCkge1xuICAgICAgICAgIGNscy5wcm90b3R5cGUuX21vZHVsZSA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXNbbmFtZV0gPSBuZXcgY2xzKCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSkuY2FsbCh0aGlzKTtcbiAgICBpZiAodGhpcy5fY29ubmVjdGVkKSB7XG4gICAgICB0aGlzLm9wdHMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRzLCB0aGlzLl9tb2R1bGUub3B0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGluc3RhbmNlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpbnN0YW5jZSA9IGluc3RhbmNlc1tpXTtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnN0YW5jZS5faW5pdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgaW5zdGFuY2UuX2luaXQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRyaWdnZXIoJ2luaXRpYWxpemVkJyk7XG4gIH1cblxuICBNb2R1bGUucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7fTtcblxuICBNb2R1bGUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIHJlZjtcbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgKHJlZiA9ICQodGhpcykpLm9uLmFwcGx5KHJlZiwgYXJncyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgTW9kdWxlLnByb3RvdHlwZS5vbmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgcmVmO1xuICAgIGFyZ3MgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAocmVmID0gJCh0aGlzKSkub25lLmFwcGx5KHJlZiwgYXJncyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgTW9kdWxlLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgcmVmO1xuICAgIGFyZ3MgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAocmVmID0gJCh0aGlzKSkub2ZmLmFwcGx5KHJlZiwgYXJncyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgTW9kdWxlLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIHJlZjtcbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgKHJlZiA9ICQodGhpcykpLnRyaWdnZXIuYXBwbHkocmVmLCBhcmdzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBNb2R1bGUucHJvdG90eXBlLnRyaWdnZXJIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIHJlZjtcbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgcmV0dXJuIChyZWYgPSAkKHRoaXMpKS50cmlnZ2VySGFuZGxlci5hcHBseShyZWYsIGFyZ3MpO1xuICB9O1xuXG4gIE1vZHVsZS5wcm90b3R5cGUuX3QgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgcmVmO1xuICAgIGFyZ3MgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICByZXR1cm4gKHJlZiA9IHRoaXMuY29uc3RydWN0b3IpLl90LmFwcGx5KHJlZiwgYXJncyk7XG4gIH07XG5cbiAgTW9kdWxlLl90ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIGtleSwgcmVmLCByZXN1bHQ7XG4gICAga2V5ID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgcmVzdWx0ID0gKChyZWYgPSB0aGlzLmkxOG5bdGhpcy5sb2NhbGVdKSAhPSBudWxsID8gcmVmW2tleV0gOiB2b2lkIDApIHx8ICcnO1xuICAgIGlmICghKGFyZ3MubGVuZ3RoID4gMCkpIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC8oW14lXXxeKSUoPzooXFxkKylcXCQpP3MvZywgZnVuY3Rpb24ocDAsIHAsIHBvc2l0aW9uKSB7XG4gICAgICBpZiAocG9zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHAgKyBhcmdzW3BhcnNlSW50KHBvc2l0aW9uKSAtIDFdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHAgKyBhcmdzLnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKC8lJXMvZywgJyVzJyk7XG4gIH07XG5cbiAgTW9kdWxlLmkxOG4gPSB7XG4gICAgJ3poLUNOJzoge31cbiAgfTtcblxuICBNb2R1bGUubG9jYWxlID0gJ3poLUNOJztcblxuICByZXR1cm4gTW9kdWxlO1xuXG59KSgpO1xuXG5yZXR1cm4gTW9kdWxlO1xuXG59KSk7XG4iLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcblxuICByb290LnNpbXBsZSA9IHJvb3Quc2ltcGxlIHx8IHt9O1xuICByb290LnNpbXBsZVsndXBsb2FkZXInXSA9IGZhY3RvcnkoalF1ZXJ5LFNpbXBsZU1vZHVsZSk7XG5cbn0od2luZG93LCBmdW5jdGlvbiAoJCwgU2ltcGxlTW9kdWxlKSB7XG5cbnZhciBVcGxvYWRlciwgdXBsb2FkZXIsXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5VcGxvYWRlciA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gIGV4dGVuZChVcGxvYWRlciwgc3VwZXJDbGFzcyk7XG5cbiAgZnVuY3Rpb24gVXBsb2FkZXIoKSB7XG4gICAgcmV0dXJuIFVwbG9hZGVyLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgVXBsb2FkZXIuY291bnQgPSAwO1xuXG4gIFVwbG9hZGVyLnByb3RvdHlwZS5vcHRzID0ge1xuICAgIHVybDogJycsXG4gICAgcGFyYW1zOiBudWxsLFxuICAgIGZpbGVLZXk6ICd1cGxvYWRfZmlsZScsXG4gICAgY29ubmVjdGlvbkNvdW50OiAzXG4gIH07XG5cbiAgVXBsb2FkZXIucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5maWxlcyA9IFtdO1xuICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICB0aGlzLmlkID0gKytVcGxvYWRlci5jb3VudDtcbiAgICB0aGlzLm9uKCd1cGxvYWRjb21wbGV0ZScsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUsIGZpbGUpIHtcbiAgICAgICAgX3RoaXMuZmlsZXMuc3BsaWNlKCQuaW5BcnJheShmaWxlLCBfdGhpcy5maWxlcyksIDEpO1xuICAgICAgICBpZiAoX3RoaXMucXVldWUubGVuZ3RoID4gMCAmJiBfdGhpcy5maWxlcy5sZW5ndGggPCBfdGhpcy5vcHRzLmNvbm5lY3Rpb25Db3VudCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy51cGxvYWQoX3RoaXMucXVldWUuc2hpZnQoKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnVwbG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgICByZXR1cm4gJCh3aW5kb3cpLm9uKCdiZWZvcmV1bmxvYWQudXBsb2FkZXItJyArIHRoaXMuaWQsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKCFfdGhpcy51cGxvYWRpbmcpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZS5vcmlnaW5hbEV2ZW50LnJldHVyblZhbHVlID0gX3RoaXMuX3QoJ2xlYXZlQ29uZmlybScpO1xuICAgICAgICByZXR1cm4gX3RoaXMuX3QoJ2xlYXZlQ29uZmlybScpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH07XG5cbiAgVXBsb2FkZXIucHJvdG90eXBlLmdlbmVyYXRlSWQgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGlkO1xuICAgIGlkID0gMDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gaWQgKz0gMTtcbiAgICB9O1xuICB9KSgpO1xuXG4gIFVwbG9hZGVyLnByb3RvdHlwZS51cGxvYWQgPSBmdW5jdGlvbihmaWxlLCBvcHRzKSB7XG4gICAgdmFyIGYsIGksIGtleSwgbGVuO1xuICAgIGlmIChvcHRzID09IG51bGwpIHtcbiAgICAgIG9wdHMgPSB7fTtcbiAgICB9XG4gICAgaWYgKGZpbGUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoJC5pc0FycmF5KGZpbGUpIHx8IGZpbGUgaW5zdGFuY2VvZiBGaWxlTGlzdCkge1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gZmlsZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBmID0gZmlsZVtpXTtcbiAgICAgICAgdGhpcy51cGxvYWQoZiwgb3B0cyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICgkKGZpbGUpLmlzKCdpbnB1dDpmaWxlJykpIHtcbiAgICAgIGtleSA9ICQoZmlsZSkuYXR0cignbmFtZScpO1xuICAgICAgaWYgKGtleSkge1xuICAgICAgICBvcHRzLmZpbGVLZXkgPSBrZXk7XG4gICAgICB9XG4gICAgICB0aGlzLnVwbG9hZCgkLm1ha2VBcnJheSgkKGZpbGUpWzBdLmZpbGVzKSwgb3B0cyk7XG4gICAgfSBlbHNlIGlmICghZmlsZS5pZCB8fCAhZmlsZS5vYmopIHtcbiAgICAgIGZpbGUgPSB0aGlzLmdldEZpbGUoZmlsZSk7XG4gICAgfVxuICAgIGlmICghKGZpbGUgJiYgZmlsZS5vYmopKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICQuZXh0ZW5kKGZpbGUsIG9wdHMpO1xuICAgIGlmICh0aGlzLmZpbGVzLmxlbmd0aCA+PSB0aGlzLm9wdHMuY29ubmVjdGlvbkNvdW50KSB7XG4gICAgICB0aGlzLnF1ZXVlLnB1c2goZmlsZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLnRyaWdnZXJIYW5kbGVyKCdiZWZvcmV1cGxvYWQnLCBbZmlsZV0pID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZpbGVzLnB1c2goZmlsZSk7XG4gICAgdGhpcy5feGhyVXBsb2FkKGZpbGUpO1xuICAgIHJldHVybiB0aGlzLnVwbG9hZGluZyA9IHRydWU7XG4gIH07XG5cbiAgVXBsb2FkZXIucHJvdG90eXBlLmdldEZpbGUgPSBmdW5jdGlvbihmaWxlT2JqKSB7XG4gICAgdmFyIG5hbWUsIHJlZiwgcmVmMTtcbiAgICBpZiAoZmlsZU9iaiBpbnN0YW5jZW9mIHdpbmRvdy5GaWxlIHx8IGZpbGVPYmogaW5zdGFuY2VvZiB3aW5kb3cuQmxvYikge1xuICAgICAgbmFtZSA9IChyZWYgPSBmaWxlT2JqLmZpbGVOYW1lKSAhPSBudWxsID8gcmVmIDogZmlsZU9iai5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmdlbmVyYXRlSWQoKSxcbiAgICAgIHVybDogdGhpcy5vcHRzLnVybCxcbiAgICAgIHBhcmFtczogdGhpcy5vcHRzLnBhcmFtcyxcbiAgICAgIGZpbGVLZXk6IHRoaXMub3B0cy5maWxlS2V5LFxuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIHNpemU6IChyZWYxID0gZmlsZU9iai5maWxlU2l6ZSkgIT0gbnVsbCA/IHJlZjEgOiBmaWxlT2JqLnNpemUsXG4gICAgICBleHQ6IG5hbWUgPyBuYW1lLnNwbGl0KCcuJykucG9wKCkudG9Mb3dlckNhc2UoKSA6ICcnLFxuICAgICAgb2JqOiBmaWxlT2JqXG4gICAgfTtcbiAgfTtcblxuICBVcGxvYWRlci5wcm90b3R5cGUuX3hoclVwbG9hZCA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB2YXIgZm9ybURhdGEsIGssIHJlZiwgdjtcbiAgICBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGZvcm1EYXRhLmFwcGVuZChmaWxlLmZpbGVLZXksIGZpbGUub2JqKTtcbiAgICBmb3JtRGF0YS5hcHBlbmQoXCJvcmlnaW5hbF9maWxlbmFtZVwiLCBmaWxlLm5hbWUpO1xuICAgIGlmIChmaWxlLnBhcmFtcykge1xuICAgICAgcmVmID0gZmlsZS5wYXJhbXM7XG4gICAgICBmb3IgKGsgaW4gcmVmKSB7XG4gICAgICAgIHYgPSByZWZba107XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZChrLCB2KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZpbGUueGhyID0gJC5hamF4KHtcbiAgICAgIHVybDogZmlsZS51cmwsXG4gICAgICBkYXRhOiBmb3JtRGF0YSxcbiAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgIGNvbnRlbnRUeXBlOiBmYWxzZSxcbiAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ1gtRmlsZS1OYW1lJzogZW5jb2RlVVJJQ29tcG9uZW50KGZpbGUubmFtZSlcbiAgICAgIH0sXG4gICAgICB4aHI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVxO1xuICAgICAgICByZXEgPSAkLmFqYXhTZXR0aW5ncy54aHIoKTtcbiAgICAgICAgaWYgKHJlcSkge1xuICAgICAgICAgIHJlcS51cGxvYWQub25wcm9ncmVzcyA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnByb2dyZXNzKGUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVxO1xuICAgICAgfSxcbiAgICAgIHByb2dyZXNzOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBpZiAoIWUubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3RoaXMudHJpZ2dlcigndXBsb2FkcHJvZ3Jlc3MnLCBbZmlsZSwgZS5sb2FkZWQsIGUudG90YWxdKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpLFxuICAgICAgZXJyb3I6IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuICAgICAgICAgIHJldHVybiBfdGhpcy50cmlnZ2VyKCd1cGxvYWRlcnJvcicsIFtmaWxlLCB4aHIsIHN0YXR1c10pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyksXG4gICAgICBzdWNjZXNzOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIF90aGlzLnRyaWdnZXIoJ3VwbG9hZHByb2dyZXNzJywgW2ZpbGUsIGZpbGUuc2l6ZSwgZmlsZS5zaXplXSk7XG4gICAgICAgICAgX3RoaXMudHJpZ2dlcigndXBsb2Fkc3VjY2VzcycsIFtmaWxlLCByZXN1bHRdKTtcbiAgICAgICAgICByZXR1cm4gJChkb2N1bWVudCkudHJpZ2dlcigndXBsb2Fkc3VjY2VzcycsIFtmaWxlLCByZXN1bHQsIF90aGlzXSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSxcbiAgICAgIGNvbXBsZXRlOiAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHhociwgc3RhdHVzKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnRyaWdnZXIoJ3VwbG9hZGNvbXBsZXRlJywgW2ZpbGUsIHhoci5yZXNwb25zZVRleHRdKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpXG4gICAgfSk7XG4gIH07XG5cbiAgVXBsb2FkZXIucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uKGZpbGUpIHtcbiAgICB2YXIgZiwgaSwgbGVuLCByZWY7XG4gICAgaWYgKCFmaWxlLmlkKSB7XG4gICAgICByZWYgPSB0aGlzLmZpbGVzO1xuICAgICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGYgPSByZWZbaV07XG4gICAgICAgIGlmIChmLmlkID09PSBmaWxlICogMSkge1xuICAgICAgICAgIGZpbGUgPSBmO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudHJpZ2dlcigndXBsb2FkY2FuY2VsJywgW2ZpbGVdKTtcbiAgICBpZiAoZmlsZS54aHIpIHtcbiAgICAgIGZpbGUueGhyLmFib3J0KCk7XG4gICAgfVxuICAgIHJldHVybiBmaWxlLnhociA9IG51bGw7XG4gIH07XG5cbiAgVXBsb2FkZXIucHJvdG90eXBlLnJlYWRJbWFnZUZpbGUgPSBmdW5jdGlvbihmaWxlT2JqLCBjYWxsYmFjaykge1xuICAgIHZhciBmaWxlUmVhZGVyLCBpbWc7XG4gICAgaWYgKCEkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhpbWcpO1xuICAgIH07XG4gICAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgIH07XG4gICAgaWYgKHdpbmRvdy5GaWxlUmVhZGVyICYmIEZpbGVSZWFkZXIucHJvdG90eXBlLnJlYWRBc0RhdGFVUkwgJiYgL15pbWFnZS8udGVzdChmaWxlT2JqLnR5cGUpKSB7XG4gICAgICBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gaW1nLnNyYyA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgIH07XG4gICAgICByZXR1cm4gZmlsZVJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICB9XG4gIH07XG5cbiAgVXBsb2FkZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZmlsZSwgaSwgbGVuLCByZWY7XG4gICAgdGhpcy5xdWV1ZS5sZW5ndGggPSAwO1xuICAgIHJlZiA9IHRoaXMuZmlsZXM7XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBmaWxlID0gcmVmW2ldO1xuICAgICAgdGhpcy5jYW5jZWwoZmlsZSk7XG4gICAgfVxuICAgICQod2luZG93KS5vZmYoJy51cGxvYWRlci0nICsgdGhpcy5pZCk7XG4gICAgcmV0dXJuICQoZG9jdW1lbnQpLm9mZignLnVwbG9hZGVyLScgKyB0aGlzLmlkKTtcbiAgfTtcblxuICBVcGxvYWRlci5pMThuID0ge1xuICAgICd6aC1DTic6IHtcbiAgICAgIGxlYXZlQ29uZmlybTogJ+ato+WcqOS4iuS8oOaWh+S7tu+8jOWmguaenOemu+W8gOS4iuS8oOS8muiHquWKqOWPlua2iCdcbiAgICB9XG4gIH07XG5cbiAgVXBsb2FkZXIubG9jYWxlID0gJ3poLUNOJztcblxuICByZXR1cm4gVXBsb2FkZXI7XG5cbn0pKFNpbXBsZU1vZHVsZSk7XG5cbnVwbG9hZGVyID0gZnVuY3Rpb24ob3B0cykge1xuICByZXR1cm4gbmV3IFVwbG9hZGVyKG9wdHMpO1xufTtcblxucmV0dXJuIHVwbG9hZGVyO1xuXG59KSk7XG4iXX0=
