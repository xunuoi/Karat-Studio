(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * FOR ARTICLE COMMENT
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var aid = undefined,
    apiUrl = undefined,
    $comment = undefined,
    $v = undefined,
    $nickname = undefined,
    $c = undefined,
    $mail = undefined,
    $status = undefined,
    $postBtn = undefined;

var _commentCache = {};

function loadComment(cb) {

    //if comments exist
    if ($('.wrap > .content.content_full > .comment').length) return console.log('Comment Block existed!') || false;

    var $cardMeta = $('.wrap > .content > .card > .excerpt .full').not(':hidden').parents('.excerpt').prev('.card-meta');

    //set article
    aid = $cardMeta.find('._article_id').eq(0).val();

    function _cb(rs) {

        $('.content.content_full').append($(rs));
        setVars();
        // debugger;
        cb ? cb(rs) : '';
    }

    //如果缓存中有，那么从缓存中读取
    apiUrl = '/comment/get/' + aid;
    var _cachedRes = _commentCache[apiUrl];
    if (_cachedRes) {

        return _cb(_cachedRes);
    }

    $.ajax({
        'url': apiUrl,
        'type': 'POST',
        'dataType': 'html'
    }).done(function (res) {
        _cb(res);
        _commentCache[apiUrl] = res;
    }).fail(function (err) {
        cb ? cb(rs) : '';
        console.log(err);
    });
}

function setVars() {
    $comment = $('.content.content_full .comment');

    $v = $('.content_full input[name="verification"]');
    $nickname = $('.content_full input[name="nickname"]');
    $c = $('.content_full textarea[name="comment_content"]');
    $mail = $('.content_full input[name="mail"]');

    $status = $comment.find('.dialog .dialog-status');

    $postBtn = $('.comment-panel .post_btn');
}

function refreshVerification() {

    var src = $('#verification_img').attr('src');
    // $('#verification_img').attr('src', '')
    $('#verification_img').attr('src', MO.util.addURLParam(src, 'st', new Date().getTime()));

    $v.val('');
}

function _refreshCache(_data) {
    var newData = _data || $comment.get(0).outerHTML;
    _commentCache[apiUrl] = newData;
}

function _ref(err) {
    console.log(err);
    refreshVerification();
    alert('验证码错误，请您重新输入');
}

function addComment(evt) {
    var $btn = $(this);
    if ($btn.is('.disabled')) {
        return false;
    } else {
        $btn.addClass('disabled');
    }

    var content = $c.val(),
        mail = $mail.val(),
        nickname = $nickname.val(),
        verification = $v.val();

    //是否是回复某个人
    var relCommentId = $status.data('id');
    var to = $status.data('toAuthor');
    var $list = $status.data('list');

    // console.log($list)

    var is_valid = true;

    if (!verification) {
        $btn.removeClass('disabled');
        return alert('请填写验证码');
    }

    if (!content || !nickname) {
        $btn.removeClass('disabled');
        return alert('请填写评论内容和称呼');
    }

    if (mail && !MO.util.validate(mail, 'mail')) {
        $btn.removeClass('disabled');
        return alert('请填写正确的邮箱地址');
    }
    var _rd = MO.util.randomNum(1, 14);

    var avatarUrl = '/static/img/common/avatar/' + _rd + '.png';

    /**
     * @debug 
     */
    // get the content with a link
    var _$f = MO.formatter.autolink($c),
        fContent = _$f.html();

    $.ajax({
        'url': '/comment/add/' + aid,
        'type': 'POST',
        'dataType': 'html',
        'data': {
            'article_id': aid,
            'content': fContent,
            'avatar': avatarUrl,
            'rel_comment': relCommentId,
            'toAuthor': to,
            'mail': mail,
            'nickname': nickname,
            'verification': verification
        }
    }).done(function (rs) {
        if ($list && $list.length) {
            console.log('Response Comment List');
            $list.append($(rs));
        } else {
            $comment.find('> ul').prepend($(rs));
        }

        //add count
        increaseCommentCount();
        _refreshCache();

        alert('评论成功');
        resetComment();
    }).fail(_ref).complete(function (result) {
        $btn.removeClass('disabled');
    });
}

function increaseCommentCount() {
    var $count = $comment.find('> h3 > span');
    var count = parseInt($count.html());

    // console.log(count)
    $count.html(count + 1);
}

function destroyComment() {
    // $('.wrap > .content').off('click.comment')
    $comment.remove();
}

function resSomeone() {
    var $meta = $(this).parents('.comment-meta');
    var $absoluteMeta = $(this).parents('li').find('> .comment-meta');

    var $rel_list = $(this).parents('.response-list');
    if (!$rel_list.length) $rel_list = $meta.nextAll('.response-list');

    // console.log($rel_list)

    var commentId = $absoluteMeta.data('id');

    // console.log(commentId)

    var author = $meta.find('a[data-author]').data('author');

    // console.log(commentId)

    $status.data('id', commentId);
    $status.data('toAuthor', author);
    $status.data('list', $rel_list);

    $status.html('回复 <a href="javascript:;">@' + author + '</a>');
    // $comment.find('textarea').val(`回复 @${author}: \n`)
    $postBtn.html('回复');
    openCommentDialog();
}

function openCommentDialog(evt) {
    $comment.find('.dialog-content').addClass('triggered');

    var statusOffsetTop = $status.offset().top - 15;

    $('html,body').animate({
        'scrollTop': statusOffsetTop + 'px'

    }, 400, function () {
        $comment.find('textarea').focus();
    });

    // document.body.scrollTop = $status.offset().top-15

    // ui.scrollToBodyTop($status.offset().top-15)
}

function newComment() {

    resetComment();

    openCommentDialog();
}

function initComment() {

    $('.wrap > .content').on('click.comment', '.comment-panel .post_btn', addComment).on('click.comment', '.dialog-content textarea', openCommentDialog).on('click.comment', '.ui-button.refresh, #verification_img', refreshVerification).on('click.comment', '.comment .res_btn', resSomeone).on('click.comment', '.comment .new_comment_btn', newComment);
}

function fetchUrl(text) {
    var replaceEls = [],
        match = null,
        lastIndex = 0,
        re = /(https?:\/\/|www\.)[\w\-\.\?&=\/#%:,@\!\+]+/ig;

    while ((match = re.exec(text)) !== null) {
        // match = re.exec(text)
        var subStr = text.substring(lastIndex, match.index);
        replaceEls.push(document.createTextNode(subStr));
        lastIndex = re.lastIndex;

        var uri = /^(http(s)?:\/\/|\/)/.test(match[0]) ? match[0] : 'http://' + match[0];

        var $link = $("<a taget=\"_blank\" href=\"" + uri + "\" rel=\"nofollow\"></a>").text(match[0]);

        replaceEls.push($link[0]);
    }

    // console.log(replaceEls)
}

function resetComment() {
    $v.val(''), $nickname.val(''), $c.val(''), $mail.val('');

    $status.removeData('id');
    $status.removeData('toAuthor');
    $status.removeData('list');

    $status.html('发表新评论');
    $postBtn.html('发表');
    $comment.find('textarea').val('');

    refreshVerification();
}

exports.initComment = initComment;
exports.destroyComment = destroyComment;
exports.loadComment = loadComment;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vY29tbWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBGT1IgQVJUSUNMRSBDT01NRU5UXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xudmFyIGFpZCA9IHVuZGVmaW5lZCxcbiAgICBhcGlVcmwgPSB1bmRlZmluZWQsXG4gICAgJGNvbW1lbnQgPSB1bmRlZmluZWQsXG4gICAgJHYgPSB1bmRlZmluZWQsXG4gICAgJG5pY2tuYW1lID0gdW5kZWZpbmVkLFxuICAgICRjID0gdW5kZWZpbmVkLFxuICAgICRtYWlsID0gdW5kZWZpbmVkLFxuICAgICRzdGF0dXMgPSB1bmRlZmluZWQsXG4gICAgJHBvc3RCdG4gPSB1bmRlZmluZWQ7XG5cbnZhciBfY29tbWVudENhY2hlID0ge307XG5cbmZ1bmN0aW9uIGxvYWRDb21tZW50KGNiKSB7XG5cbiAgICAvL2lmIGNvbW1lbnRzIGV4aXN0XG4gICAgaWYgKCQoJy53cmFwID4gLmNvbnRlbnQuY29udGVudF9mdWxsID4gLmNvbW1lbnQnKS5sZW5ndGgpIHJldHVybiBjb25zb2xlLmxvZygnQ29tbWVudCBCbG9jayBleGlzdGVkIScpIHx8IGZhbHNlO1xuXG4gICAgdmFyICRjYXJkTWV0YSA9ICQoJy53cmFwID4gLmNvbnRlbnQgPiAuY2FyZCA+IC5leGNlcnB0IC5mdWxsJykubm90KCc6aGlkZGVuJykucGFyZW50cygnLmV4Y2VycHQnKS5wcmV2KCcuY2FyZC1tZXRhJyk7XG5cbiAgICAvL3NldCBhcnRpY2xlXG4gICAgYWlkID0gJGNhcmRNZXRhLmZpbmQoJy5fYXJ0aWNsZV9pZCcpLmVxKDApLnZhbCgpO1xuXG4gICAgZnVuY3Rpb24gX2NiKHJzKSB7XG5cbiAgICAgICAgJCgnLmNvbnRlbnQuY29udGVudF9mdWxsJykuYXBwZW5kKCQocnMpKTtcbiAgICAgICAgc2V0VmFycygpO1xuICAgICAgICAvLyBkZWJ1Z2dlcjtcbiAgICAgICAgY2IgPyBjYihycykgOiAnJztcbiAgICB9XG5cbiAgICAvL+WmguaenOe8k+WtmOS4reacie+8jOmCo+S5iOS7jue8k+WtmOS4reivu+WPllxuICAgIGFwaVVybCA9ICcvY29tbWVudC9nZXQvJyArIGFpZDtcbiAgICB2YXIgX2NhY2hlZFJlcyA9IF9jb21tZW50Q2FjaGVbYXBpVXJsXTtcbiAgICBpZiAoX2NhY2hlZFJlcykge1xuXG4gICAgICAgIHJldHVybiBfY2IoX2NhY2hlZFJlcyk7XG4gICAgfVxuXG4gICAgJC5hamF4KHtcbiAgICAgICAgJ3VybCc6IGFwaVVybCxcbiAgICAgICAgJ3R5cGUnOiAnUE9TVCcsXG4gICAgICAgICdkYXRhVHlwZSc6ICdodG1sJ1xuICAgIH0pLmRvbmUoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBfY2IocmVzKTtcbiAgICAgICAgX2NvbW1lbnRDYWNoZVthcGlVcmxdID0gcmVzO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24gKGVycikge1xuICAgICAgICBjYiA/IGNiKHJzKSA6ICcnO1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRWYXJzKCkge1xuICAgICRjb21tZW50ID0gJCgnLmNvbnRlbnQuY29udGVudF9mdWxsIC5jb21tZW50Jyk7XG5cbiAgICAkdiA9ICQoJy5jb250ZW50X2Z1bGwgaW5wdXRbbmFtZT1cInZlcmlmaWNhdGlvblwiXScpO1xuICAgICRuaWNrbmFtZSA9ICQoJy5jb250ZW50X2Z1bGwgaW5wdXRbbmFtZT1cIm5pY2tuYW1lXCJdJyk7XG4gICAgJGMgPSAkKCcuY29udGVudF9mdWxsIHRleHRhcmVhW25hbWU9XCJjb21tZW50X2NvbnRlbnRcIl0nKTtcbiAgICAkbWFpbCA9ICQoJy5jb250ZW50X2Z1bGwgaW5wdXRbbmFtZT1cIm1haWxcIl0nKTtcblxuICAgICRzdGF0dXMgPSAkY29tbWVudC5maW5kKCcuZGlhbG9nIC5kaWFsb2ctc3RhdHVzJyk7XG5cbiAgICAkcG9zdEJ0biA9ICQoJy5jb21tZW50LXBhbmVsIC5wb3N0X2J0bicpO1xufVxuXG5mdW5jdGlvbiByZWZyZXNoVmVyaWZpY2F0aW9uKCkge1xuXG4gICAgdmFyIHNyYyA9ICQoJyN2ZXJpZmljYXRpb25faW1nJykuYXR0cignc3JjJyk7XG4gICAgLy8gJCgnI3ZlcmlmaWNhdGlvbl9pbWcnKS5hdHRyKCdzcmMnLCAnJylcbiAgICAkKCcjdmVyaWZpY2F0aW9uX2ltZycpLmF0dHIoJ3NyYycsIE1PLnV0aWwuYWRkVVJMUGFyYW0oc3JjLCAnc3QnLCBuZXcgRGF0ZSgpLmdldFRpbWUoKSkpO1xuXG4gICAgJHYudmFsKCcnKTtcbn1cblxuZnVuY3Rpb24gX3JlZnJlc2hDYWNoZShfZGF0YSkge1xuICAgIHZhciBuZXdEYXRhID0gX2RhdGEgfHwgJGNvbW1lbnQuZ2V0KDApLm91dGVySFRNTDtcbiAgICBfY29tbWVudENhY2hlW2FwaVVybF0gPSBuZXdEYXRhO1xufVxuXG5mdW5jdGlvbiBfcmVmKGVycikge1xuICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgcmVmcmVzaFZlcmlmaWNhdGlvbigpO1xuICAgIGFsZXJ0KCfpqozor4HnoIHplJnor6/vvIzor7fmgqjph43mlrDovpPlhaUnKTtcbn1cblxuZnVuY3Rpb24gYWRkQ29tbWVudChldnQpIHtcbiAgICB2YXIgJGJ0biA9ICQodGhpcyk7XG4gICAgaWYgKCRidG4uaXMoJy5kaXNhYmxlZCcpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAkYnRuLmFkZENsYXNzKCdkaXNhYmxlZCcpO1xuICAgIH1cblxuICAgIHZhciBjb250ZW50ID0gJGMudmFsKCksXG4gICAgICAgIG1haWwgPSAkbWFpbC52YWwoKSxcbiAgICAgICAgbmlja25hbWUgPSAkbmlja25hbWUudmFsKCksXG4gICAgICAgIHZlcmlmaWNhdGlvbiA9ICR2LnZhbCgpO1xuXG4gICAgLy/mmK/lkKbmmK/lm57lpI3mn5DkuKrkurpcbiAgICB2YXIgcmVsQ29tbWVudElkID0gJHN0YXR1cy5kYXRhKCdpZCcpO1xuICAgIHZhciB0byA9ICRzdGF0dXMuZGF0YSgndG9BdXRob3InKTtcbiAgICB2YXIgJGxpc3QgPSAkc3RhdHVzLmRhdGEoJ2xpc3QnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCRsaXN0KVxuXG4gICAgdmFyIGlzX3ZhbGlkID0gdHJ1ZTtcblxuICAgIGlmICghdmVyaWZpY2F0aW9uKSB7XG4gICAgICAgICRidG4ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgIHJldHVybiBhbGVydCgn6K+35aGr5YaZ6aqM6K+B56CBJyk7XG4gICAgfVxuXG4gICAgaWYgKCFjb250ZW50IHx8ICFuaWNrbmFtZSkge1xuICAgICAgICAkYnRuLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICByZXR1cm4gYWxlcnQoJ+ivt+Whq+WGmeivhOiuuuWGheWuueWSjOensOWRvCcpO1xuICAgIH1cblxuICAgIGlmIChtYWlsICYmICFNTy51dGlsLnZhbGlkYXRlKG1haWwsICdtYWlsJykpIHtcbiAgICAgICAgJGJ0bi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgcmV0dXJuIGFsZXJ0KCfor7floavlhpnmraPnoa7nmoTpgq7nrrHlnLDlnYAnKTtcbiAgICB9XG4gICAgdmFyIF9yZCA9IE1PLnV0aWwucmFuZG9tTnVtKDEsIDE0KTtcblxuICAgIHZhciBhdmF0YXJVcmwgPSAnL3N0YXRpYy9pbWcvY29tbW9uL2F2YXRhci8nICsgX3JkICsgJy5wbmcnO1xuXG4gICAgLyoqXG4gICAgICogQGRlYnVnIFxuICAgICAqL1xuICAgIC8vIGdldCB0aGUgY29udGVudCB3aXRoIGEgbGlua1xuICAgIHZhciBfJGYgPSBNTy5mb3JtYXR0ZXIuYXV0b2xpbmsoJGMpLFxuICAgICAgICBmQ29udGVudCA9IF8kZi5odG1sKCk7XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICAndXJsJzogJy9jb21tZW50L2FkZC8nICsgYWlkLFxuICAgICAgICAndHlwZSc6ICdQT1NUJyxcbiAgICAgICAgJ2RhdGFUeXBlJzogJ2h0bWwnLFxuICAgICAgICAnZGF0YSc6IHtcbiAgICAgICAgICAgICdhcnRpY2xlX2lkJzogYWlkLFxuICAgICAgICAgICAgJ2NvbnRlbnQnOiBmQ29udGVudCxcbiAgICAgICAgICAgICdhdmF0YXInOiBhdmF0YXJVcmwsXG4gICAgICAgICAgICAncmVsX2NvbW1lbnQnOiByZWxDb21tZW50SWQsXG4gICAgICAgICAgICAndG9BdXRob3InOiB0byxcbiAgICAgICAgICAgICdtYWlsJzogbWFpbCxcbiAgICAgICAgICAgICduaWNrbmFtZSc6IG5pY2tuYW1lLFxuICAgICAgICAgICAgJ3ZlcmlmaWNhdGlvbic6IHZlcmlmaWNhdGlvblxuICAgICAgICB9XG4gICAgfSkuZG9uZShmdW5jdGlvbiAocnMpIHtcbiAgICAgICAgaWYgKCRsaXN0ICYmICRsaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Jlc3BvbnNlIENvbW1lbnQgTGlzdCcpO1xuICAgICAgICAgICAgJGxpc3QuYXBwZW5kKCQocnMpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRjb21tZW50LmZpbmQoJz4gdWwnKS5wcmVwZW5kKCQocnMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vYWRkIGNvdW50XG4gICAgICAgIGluY3JlYXNlQ29tbWVudENvdW50KCk7XG4gICAgICAgIF9yZWZyZXNoQ2FjaGUoKTtcblxuICAgICAgICBhbGVydCgn6K+E6K665oiQ5YqfJyk7XG4gICAgICAgIHJlc2V0Q29tbWVudCgpO1xuICAgIH0pLmZhaWwoX3JlZikuY29tcGxldGUoZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAkYnRuLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBpbmNyZWFzZUNvbW1lbnRDb3VudCgpIHtcbiAgICB2YXIgJGNvdW50ID0gJGNvbW1lbnQuZmluZCgnPiBoMyA+IHNwYW4nKTtcbiAgICB2YXIgY291bnQgPSBwYXJzZUludCgkY291bnQuaHRtbCgpKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKGNvdW50KVxuICAgICRjb3VudC5odG1sKGNvdW50ICsgMSk7XG59XG5cbmZ1bmN0aW9uIGRlc3Ryb3lDb21tZW50KCkge1xuICAgIC8vICQoJy53cmFwID4gLmNvbnRlbnQnKS5vZmYoJ2NsaWNrLmNvbW1lbnQnKVxuICAgICRjb21tZW50LnJlbW92ZSgpO1xufVxuXG5mdW5jdGlvbiByZXNTb21lb25lKCkge1xuICAgIHZhciAkbWV0YSA9ICQodGhpcykucGFyZW50cygnLmNvbW1lbnQtbWV0YScpO1xuICAgIHZhciAkYWJzb2x1dGVNZXRhID0gJCh0aGlzKS5wYXJlbnRzKCdsaScpLmZpbmQoJz4gLmNvbW1lbnQtbWV0YScpO1xuXG4gICAgdmFyICRyZWxfbGlzdCA9ICQodGhpcykucGFyZW50cygnLnJlc3BvbnNlLWxpc3QnKTtcbiAgICBpZiAoISRyZWxfbGlzdC5sZW5ndGgpICRyZWxfbGlzdCA9ICRtZXRhLm5leHRBbGwoJy5yZXNwb25zZS1saXN0Jyk7XG5cbiAgICAvLyBjb25zb2xlLmxvZygkcmVsX2xpc3QpXG5cbiAgICB2YXIgY29tbWVudElkID0gJGFic29sdXRlTWV0YS5kYXRhKCdpZCcpO1xuXG4gICAgLy8gY29uc29sZS5sb2coY29tbWVudElkKVxuXG4gICAgdmFyIGF1dGhvciA9ICRtZXRhLmZpbmQoJ2FbZGF0YS1hdXRob3JdJykuZGF0YSgnYXV0aG9yJyk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhjb21tZW50SWQpXG5cbiAgICAkc3RhdHVzLmRhdGEoJ2lkJywgY29tbWVudElkKTtcbiAgICAkc3RhdHVzLmRhdGEoJ3RvQXV0aG9yJywgYXV0aG9yKTtcbiAgICAkc3RhdHVzLmRhdGEoJ2xpc3QnLCAkcmVsX2xpc3QpO1xuXG4gICAgJHN0YXR1cy5odG1sKCflm57lpI0gPGEgaHJlZj1cImphdmFzY3JpcHQ6O1wiPkAnICsgYXV0aG9yICsgJzwvYT4nKTtcbiAgICAvLyAkY29tbWVudC5maW5kKCd0ZXh0YXJlYScpLnZhbChg5Zue5aSNIEAke2F1dGhvcn06IFxcbmApXG4gICAgJHBvc3RCdG4uaHRtbCgn5Zue5aSNJyk7XG4gICAgb3BlbkNvbW1lbnREaWFsb2coKTtcbn1cblxuZnVuY3Rpb24gb3BlbkNvbW1lbnREaWFsb2coZXZ0KSB7XG4gICAgJGNvbW1lbnQuZmluZCgnLmRpYWxvZy1jb250ZW50JykuYWRkQ2xhc3MoJ3RyaWdnZXJlZCcpO1xuXG4gICAgdmFyIHN0YXR1c09mZnNldFRvcCA9ICRzdGF0dXMub2Zmc2V0KCkudG9wIC0gMTU7XG5cbiAgICAkKCdodG1sLGJvZHknKS5hbmltYXRlKHtcbiAgICAgICAgJ3Njcm9sbFRvcCc6IHN0YXR1c09mZnNldFRvcCArICdweCdcblxuICAgIH0sIDQwMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAkY29tbWVudC5maW5kKCd0ZXh0YXJlYScpLmZvY3VzKCk7XG4gICAgfSk7XG5cbiAgICAvLyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA9ICRzdGF0dXMub2Zmc2V0KCkudG9wLTE1XG5cbiAgICAvLyB1aS5zY3JvbGxUb0JvZHlUb3AoJHN0YXR1cy5vZmZzZXQoKS50b3AtMTUpXG59XG5cbmZ1bmN0aW9uIG5ld0NvbW1lbnQoKSB7XG5cbiAgICByZXNldENvbW1lbnQoKTtcblxuICAgIG9wZW5Db21tZW50RGlhbG9nKCk7XG59XG5cbmZ1bmN0aW9uIGluaXRDb21tZW50KCkge1xuXG4gICAgJCgnLndyYXAgPiAuY29udGVudCcpLm9uKCdjbGljay5jb21tZW50JywgJy5jb21tZW50LXBhbmVsIC5wb3N0X2J0bicsIGFkZENvbW1lbnQpLm9uKCdjbGljay5jb21tZW50JywgJy5kaWFsb2ctY29udGVudCB0ZXh0YXJlYScsIG9wZW5Db21tZW50RGlhbG9nKS5vbignY2xpY2suY29tbWVudCcsICcudWktYnV0dG9uLnJlZnJlc2gsICN2ZXJpZmljYXRpb25faW1nJywgcmVmcmVzaFZlcmlmaWNhdGlvbikub24oJ2NsaWNrLmNvbW1lbnQnLCAnLmNvbW1lbnQgLnJlc19idG4nLCByZXNTb21lb25lKS5vbignY2xpY2suY29tbWVudCcsICcuY29tbWVudCAubmV3X2NvbW1lbnRfYnRuJywgbmV3Q29tbWVudCk7XG59XG5cbmZ1bmN0aW9uIGZldGNoVXJsKHRleHQpIHtcbiAgICB2YXIgcmVwbGFjZUVscyA9IFtdLFxuICAgICAgICBtYXRjaCA9IG51bGwsXG4gICAgICAgIGxhc3RJbmRleCA9IDAsXG4gICAgICAgIHJlID0gLyhodHRwcz86XFwvXFwvfHd3d1xcLilbXFx3XFwtXFwuXFw/Jj1cXC8jJTosQFxcIVxcK10rL2lnO1xuXG4gICAgd2hpbGUgKChtYXRjaCA9IHJlLmV4ZWModGV4dCkpICE9PSBudWxsKSB7XG4gICAgICAgIC8vIG1hdGNoID0gcmUuZXhlYyh0ZXh0KVxuICAgICAgICB2YXIgc3ViU3RyID0gdGV4dC5zdWJzdHJpbmcobGFzdEluZGV4LCBtYXRjaC5pbmRleCk7XG4gICAgICAgIHJlcGxhY2VFbHMucHVzaChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdWJTdHIpKTtcbiAgICAgICAgbGFzdEluZGV4ID0gcmUubGFzdEluZGV4O1xuXG4gICAgICAgIHZhciB1cmkgPSAvXihodHRwKHMpPzpcXC9cXC98XFwvKS8udGVzdChtYXRjaFswXSkgPyBtYXRjaFswXSA6ICdodHRwOi8vJyArIG1hdGNoWzBdO1xuXG4gICAgICAgIHZhciAkbGluayA9ICQoXCI8YSB0YWdldD1cXFwiX2JsYW5rXFxcIiBocmVmPVxcXCJcIiArIHVyaSArIFwiXFxcIiByZWw9XFxcIm5vZm9sbG93XFxcIj48L2E+XCIpLnRleHQobWF0Y2hbMF0pO1xuXG4gICAgICAgIHJlcGxhY2VFbHMucHVzaCgkbGlua1swXSk7XG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2cocmVwbGFjZUVscylcbn1cblxuZnVuY3Rpb24gcmVzZXRDb21tZW50KCkge1xuICAgICR2LnZhbCgnJyksICRuaWNrbmFtZS52YWwoJycpLCAkYy52YWwoJycpLCAkbWFpbC52YWwoJycpO1xuXG4gICAgJHN0YXR1cy5yZW1vdmVEYXRhKCdpZCcpO1xuICAgICRzdGF0dXMucmVtb3ZlRGF0YSgndG9BdXRob3InKTtcbiAgICAkc3RhdHVzLnJlbW92ZURhdGEoJ2xpc3QnKTtcblxuICAgICRzdGF0dXMuaHRtbCgn5Y+R6KGo5paw6K+E6K66Jyk7XG4gICAgJHBvc3RCdG4uaHRtbCgn5Y+R6KGoJyk7XG4gICAgJGNvbW1lbnQuZmluZCgndGV4dGFyZWEnKS52YWwoJycpO1xuXG4gICAgcmVmcmVzaFZlcmlmaWNhdGlvbigpO1xufVxuXG5leHBvcnRzLmluaXRDb21tZW50ID0gaW5pdENvbW1lbnQ7XG5leHBvcnRzLmRlc3Ryb3lDb21tZW50ID0gZGVzdHJveUNvbW1lbnQ7XG5leHBvcnRzLmxvYWRDb21tZW50ID0gbG9hZENvbW1lbnQ7Il19
