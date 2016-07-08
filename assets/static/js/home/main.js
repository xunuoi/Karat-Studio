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
},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
/**
 * FOR UI
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
function scrollToBodyTop(pos, cb, tri) {

    /**
     * Use jquery animate cause 2 times cb trigger !! ?
     * @debug 
     * @type {[type]}
     */
    /*$('html, body').animate(
        {
            scrollTop: pos || 0
        }, 
        600, 
        'linear',
        cb
    )*/

    var _pos = pos || 0;
    var _tri = tri || 15;

    function _ref() {
        var _abs = Math.abs;

        var unit = 5;
        var unit_abs = _abs(unit);
        var st = document.body.scrollTop;

        if (st > pos) {
            unit = -unit;
        }

        //判断行为
        _abs(st - pos) < unit_abs ? (document.body.scrollTop = pos, cb ? cb() : '') : (document.body.scrollTop += unit, _animateScroll());
    }

    function _animateScroll() {

        setTimeout(_ref, _tri);
    }

    _animateScroll();
}

exports.scrollToBodyTop = scrollToBodyTop;
},{}],4:[function(require,module,exports){
/**
 * FOR HomeController
 */

'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

require('viewer-master/dist/viewer');

require('highlight/src/highlight.min');

var _header = require('header');

var _ui = require('ui');

/**
 * FOR COMMENT 
 */

var _comment = require('comment');

var comment = _interopRequireWildcard(_comment);

/**
 * FOR BANNER SVG FLY ANIMATION
 */
// import * as fly from './fly'
// import 'shifter/shape-shifter'
// import * as MO from 'mo'

/**
 * init photo view
 */

function initViewer($ctn) {
    $ctn.viewer();
}

function destroyViewer($ctn) {
    $ctn.viewer('destroy');
}

/**
 * init code highlight
 */

function _ref(i, eCode) {
    hljs.highlightBlock(eCode);
}

function initHighlight($code) {
    $code.each(_ref);
}

/**
 * init click events for card
 */

function initEvent(argument) {
    var $card = $('.content > .card');
    var $sidebar = $('.wrap > .sidebar');
    // let $banner = $('.wrap > .banner')
    var $content = $('.wrap > .content');
    var $pagination = $('.wrap > .content > .pagination');

    $('.content').on('click.card', '.card .read-more', function (evt) {
        evt.stopPropagation();

        var $readBtn = $(this);
        var $thisCard = $readBtn.parents('.card');
        var $full = $thisCard.find('.full');

        /*if($readBtn.hasClass('frozen')){
            return false
        }else {
            $readBtn.addClass('frozen')
        }*/

        // let $thisFull = $thisCard.find('.excerpt > .full')

        /**
         * DISABLE ANIMATION, FOR THE BUG OF Chrome
         */
        // let c_height = $thisFull.height()
        // let c_height = 'auto'

        //maybe exist spaces
        var btnText = $readBtn.html().trim();

        var aid = $readBtn.data('article');
        var url = $readBtn.attr('href');
        var title = $readBtn.data('title');

        function _setScrollTop() {
            document.body.scrollTop = $thisCard.offset().top - 40;
        }

        // let _scrollTopPos = document.body.scrollTop

        function setHomeState(_d) {
            // console.log(_d)

            comment.destroyComment();

            $card.removeClass('card_hide');
            $content.removeClass('content_full');
            // $thisFull.css({'height': 'auto'})           

            $pagination.removeClass('hide');

            $readBtn.html('阅读全文');
            var nav = $readBtn.data('nav');
            (0, _header.locate)(nav);

            $readBtn.data('nav', $readBtn.data('type'));

            destroyViewer($full);

            //restore scrollTop
            // document.body.scrollTop = _scrollTopPos
        }

        function setArticleState() {
            /**
             * @debug
             * Chrome定位BUG， 重复第二次操作，第二次点击[阅读全文]，js设置容器高度后，scrollTop会无故变动，
             * Safari正常
             * 解决方式：先操作高度，再操作scrollTop，并且禁止height动画
             */

            $card.not($thisCard).addClass('card_hide');
            // document.body.scrollTop = 320

            //set height
            $content.addClass('content_full');
            // $thisFull.css({'height': 0})

            // setTimeout(()=>{

            // $thisFull.css({'height': c_height})

            $pagination.addClass('hide');

            $readBtn.html('返回上层');

            //set nav active menu
            var nav = $readBtn.data('nav');
            // locate(nav)
            (0, _header.locate)('ARTICLE');

            $readBtn.data('nav', 'home');
            //set viewer
            initViewer($full);

            initHighlight($full.find('pre code'));

            comment.loadComment(_setScrollTop);

            $full.find("img").one('load', _setScrollTop).one('error', _setScrollTop);

            /**
             * 如果要设置 scrollTop, 确保这个操作DOM回流
             * 或变化之后执行, 比如此处loadComment在之前执行的
             * 会导致后期DOM变化，
             * 结果在Chrome中， body.scrollTop的数值变化了。
             * Safari不变化，不影响body.scrollTop的数值
             *
             * 所以上面，添加到回调函数中，确保scrollTop的值在DOM完成之后执行
             * 同时，对于文章中有图片的，由于img load也是异步的，所以也会
             * 导致同样问题
             */
            // document.body.scrollTop = $thisCard.offset().top - 40
            /*alert('scrollTop Set: '+document.body.scrollTop)
            debugger;
            setTimeout(()=>{
                alert(document.body.scrollTop)
            }, 1000)*/

            // })
        }

        function _ref2(res) {
            var $fragment_card = $(res);
            $full.html($fragment_card.find('.full').html());
            setArticleState();
        }

        if (btnText == '阅读全文') {
            //以下只进行一次 初始化历史堆栈，是错误的
            /*_stateInited ? 
                '' : 
                (
                    MO.state('/', document.title, setHomeState), 
                    _stateInited = true
                )*/
            //如果此时，不重新replaceState,那么浏览器堆栈，保存的还是第一次的操作和数据，没有更新，因为pop出来的，总是第一次的

            /**
             * @debug
             * 获取一个初始状态
             * 如果不获取初始状态，那么history.back()的时候，
             * 只能获得state为undefined,那么你不知道如果去恢复现场，
             * 所以每次操作前replaceState，能够保存操作前的一些数据，
             * 从而back的时候能还原
             * null位置是传给setHomeState的data，
             * 如果不传或者传入undefined，那么不缓存，touch还会发起请求
             */
            // MO.state('/', document.title, setHomeState, null)
            MO.state(location.pathname, document.title, setHomeState);
            /*.then(res=>{
                setHomeState(res)
            })*/

            /**
             * 其实此时的pushState,是对下个当前状态的保存，不是对之前状态的修改。也就是操作之后的状态，同步给浏览器的history.state
             * !!!所以，从上个状态，back的时候，是去现在的状态，也就是pushState之前的state状态！！！而这个状态，是从第一次点击的时候产生的，如果不更新replaceState,那么永远是第一次的数据，setArticleState的变量也是第一次的，readBtn还是第一次点击的文章的按钮！！所以每次点击阅读全文，都更新一下
             */

            // try{
            MO.touch(url, title, _ref2);
            // }catch(err){console.error(err)}
            /*.then((res)=>{
                let $fragment_card = $(res)
                $full.html($fragment_card.find('.full').html())
                setArticleState()
            })
            .catch(err=>{
                console.log(err)
            })*/
            //这种方式有个问题，无法保存传入then的函数到mo_events来缓存起来，这样导致调用touch后，当其popevent发生时，无法触发前进、后退的时间
        } else if (btnText == '返回上层') {

                history.back();

                return false;
            } else {

                throw Error('Unknow Button Text: ' + btnText);
            }

        //stop propagation and default behavior
        return false;
    });
}

/**
 * Banner Animation
 * @return {[type]} [description]
 */

/*function flyAnimation(){
    setTimeout(() =>{
        fly.start()
    }, 1000)
}*/

$(function () {
    initEvent();
    comment.initComment();
    // flyAnimation()
});
},{"comment":1,"header":2,"highlight/src/highlight.min":5,"ui":3,"viewer-master/dist/viewer":6}],5:[function(require,module,exports){
!function(e){false?e(exports):(window.hljs=e({}),false&&define.amd&&define("hljs",[],function(){return window.hljs}))}(function(e){function t(e){return e.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function r(e){return e.nodeName.toLowerCase()}function a(e,t){var r=e&&e.exec(t);return r&&0==r.index}function n(e){return/^(no-?highlight|plain|text)$/i.test(e)}function i(e){var t,r,a,i=e.className+" ";if(i+=e.parentNode?e.parentNode.className:"",r=/\blang(?:uage)?-([\w-]+)\b/i.exec(i))return y(r[1])?r[1]:"no-highlight";for(i=i.split(/\s+/),t=0,a=i.length;a>t;t++)if(y(i[t])||n(i[t]))return i[t]}function s(e,t){var r,a={};for(r in e)a[r]=e[r];if(t)for(r in t)a[r]=t[r];return a}function c(e){var t=[];return function a(e,n){for(var i=e.firstChild;i;i=i.nextSibling)3==i.nodeType?n+=i.nodeValue.length:1==i.nodeType&&(t.push({event:"start",offset:n,node:i}),n=a(i,n),r(i).match(/br|hr|img|input/)||t.push({event:"stop",offset:n,node:i}));return n}(e,0),t}function o(e,a,n){function i(){return e.length&&a.length?e[0].offset!=a[0].offset?e[0].offset<a[0].offset?e:a:"start"==a[0].event?e:a:e.length?e:a}function s(e){function a(e){return" "+e.nodeName+'="'+t(e.value)+'"'}u+="<"+r(e)+Array.prototype.map.call(e.attributes,a).join("")+">"}function c(e){u+="</"+r(e)+">"}function o(e){("start"==e.event?s:c)(e.node)}for(var l=0,u="",d=[];e.length||a.length;){var b=i();if(u+=t(n.substr(l,b[0].offset-l)),l=b[0].offset,b==e){d.reverse().forEach(c);do o(b.splice(0,1)[0]),b=i();while(b==e&&b.length&&b[0].offset==l);d.reverse().forEach(s)}else"start"==b[0].event?d.push(b[0].node):d.pop(),o(b.splice(0,1)[0])}return u+t(n.substr(l))}function l(e){function t(e){return e&&e.source||e}function r(r,a){return new RegExp(t(r),"m"+(e.cI?"i":"")+(a?"g":""))}function a(n,i){if(!n.compiled){if(n.compiled=!0,n.k=n.k||n.bK,n.k){var c={},o=function(t,r){e.cI&&(r=r.toLowerCase()),r.split(" ").forEach(function(e){var r=e.split("|");c[r[0]]=[t,r[1]?Number(r[1]):1]})};"string"==typeof n.k?o("keyword",n.k):Object.keys(n.k).forEach(function(e){o(e,n.k[e])}),n.k=c}n.lR=r(n.l||/\b\w+\b/,!0),i&&(n.bK&&(n.b="\\b("+n.bK.split(" ").join("|")+")\\b"),n.b||(n.b=/\B|\b/),n.bR=r(n.b),n.e||n.eW||(n.e=/\B|\b/),n.e&&(n.eR=r(n.e)),n.tE=t(n.e)||"",n.eW&&i.tE&&(n.tE+=(n.e?"|":"")+i.tE)),n.i&&(n.iR=r(n.i)),void 0===n.r&&(n.r=1),n.c||(n.c=[]);var l=[];n.c.forEach(function(e){e.v?e.v.forEach(function(t){l.push(s(e,t))}):l.push("self"==e?n:e)}),n.c=l,n.c.forEach(function(e){a(e,n)}),n.starts&&a(n.starts,i);var u=n.c.map(function(e){return e.bK?"\\.?("+e.b+")\\.?":e.b}).concat([n.tE,n.i]).map(t).filter(Boolean);n.t=u.length?r(u.join("|"),!0):{exec:function(){return null}}}}a(e)}function u(e,r,n,i){function s(e,t){for(var r=0;r<t.c.length;r++)if(a(t.c[r].bR,e))return t.c[r]}function c(e,t){if(a(e.eR,t)){for(;e.endsParent&&e.parent;)e=e.parent;return e}return e.eW?c(e.parent,t):void 0}function o(e,t){return!n&&a(t.iR,e)}function b(e,t){var r=v.cI?t[0].toLowerCase():t[0];return e.k.hasOwnProperty(r)&&e.k[r]}function p(e,t,r,a){var n=a?"":w.classPrefix,i='<span class="'+n,s=r?"":"</span>";return i+=e+'">',i+t+s}function m(){if(!x.k)return t(E);var e="",r=0;x.lR.lastIndex=0;for(var a=x.lR.exec(E);a;){e+=t(E.substr(r,a.index-r));var n=b(x,a);n?(B+=n[1],e+=p(n[0],t(a[0]))):e+=t(a[0]),r=x.lR.lastIndex,a=x.lR.exec(E)}return e+t(E.substr(r))}function f(){var e="string"==typeof x.sL;if(e&&!N[x.sL])return t(E);var r=e?u(x.sL,E,!0,C[x.sL]):d(E,x.sL.length?x.sL:void 0);return x.r>0&&(B+=r.r),e&&(C[x.sL]=r.top),p(r.language,r.value,!1,!0)}function g(){return void 0!==x.sL?f():m()}function h(e,r){var a=e.cN?p(e.cN,"",!0):"";e.rB?(M+=a,E=""):e.eB?(M+=t(r)+a,E=""):(M+=a,E=r),x=Object.create(e,{parent:{value:x}})}function _(e,r){if(E+=e,void 0===r)return M+=g(),0;var a=s(r,x);if(a)return M+=g(),h(a,r),a.rB?0:r.length;var n=c(x,r);if(n){var i=x;i.rE||i.eE||(E+=r),M+=g();do x.cN&&(M+="</span>"),B+=x.r,x=x.parent;while(x!=n.parent);return i.eE&&(M+=t(r)),E="",n.starts&&h(n.starts,""),i.rE?0:r.length}if(o(r,x))throw new Error('Illegal lexeme "'+r+'" for mode "'+(x.cN||"<unnamed>")+'"');return E+=r,r.length||1}var v=y(e);if(!v)throw new Error('Unknown language: "'+e+'"');l(v);var k,x=i||v,C={},M="";for(k=x;k!=v;k=k.parent)k.cN&&(M=p(k.cN,"",!0)+M);var E="",B=0;try{for(var $,z,L=0;;){if(x.t.lastIndex=L,$=x.t.exec(r),!$)break;z=_(r.substr(L,$.index-L),$[0]),L=$.index+z}for(_(r.substr(L)),k=x;k.parent;k=k.parent)k.cN&&(M+="</span>");return{r:B,value:M,language:e,top:x}}catch(q){if(-1!=q.message.indexOf("Illegal"))return{r:0,value:t(r)};throw q}}function d(e,r){r=r||w.languages||Object.keys(N);var a={r:0,value:t(e)},n=a;return r.forEach(function(t){if(y(t)){var r=u(t,e,!1);r.language=t,r.r>n.r&&(n=r),r.r>a.r&&(n=a,a=r)}}),n.language&&(a.second_best=n),a}function b(e){return w.tabReplace&&(e=e.replace(/^((<[^>]+>|\t)+)/gm,function(e,t){return t.replace(/\t/g,w.tabReplace)})),w.useBR&&(e=e.replace(/\n/g,"<br>")),e}function p(e,t,r){var a=t?k[t]:r,n=[e.trim()];return e.match(/\bhljs\b/)||n.push("hljs"),-1===e.indexOf(a)&&n.push(a),n.join(" ").trim()}function m(e){var t=i(e);if(!n(t)){var r;w.useBR?(r=document.createElementNS("http://www.w3.org/1999/xhtml","div"),r.innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):r=e;var a=r.textContent,s=t?u(t,a,!0):d(a),l=c(r);if(l.length){var m=document.createElementNS("http://www.w3.org/1999/xhtml","div");m.innerHTML=s.value,s.value=o(l,c(m),a)}s.value=b(s.value),e.innerHTML=s.value,e.className=p(e.className,t,s.language),e.result={language:s.language,re:s.r},s.second_best&&(e.second_best={language:s.second_best.language,re:s.second_best.r})}}function f(e){w=s(w,e)}function g(){if(!g.called){g.called=!0;var e=document.querySelectorAll("pre code");Array.prototype.forEach.call(e,m)}}function h(){addEventListener("DOMContentLoaded",g,!1),addEventListener("load",g,!1)}function _(t,r){var a=N[t]=r(e);a.aliases&&a.aliases.forEach(function(e){k[e]=t})}function v(){return Object.keys(N)}function y(e){return e=(e||"").toLowerCase(),N[e]||N[k[e]]}var w={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0},N={},k={};return e.highlight=u,e.highlightAuto=d,e.fixMarkup=b,e.highlightBlock=m,e.configure=f,e.initHighlighting=g,e.initHighlightingOnLoad=h,e.registerLanguage=_,e.listLanguages=v,e.getLanguage=y,e.inherit=s,e.IR="[a-zA-Z]\\w*",e.UIR="[a-zA-Z_]\\w*",e.NR="\\b\\d+(\\.\\d+)?",e.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",e.BNR="\\b(0b[01]+)",e.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",e.BE={b:"\\\\[\\s\\S]",r:0},e.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[e.BE]},e.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[e.BE]},e.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|like)\b/},e.C=function(t,r,a){var n=e.inherit({cN:"comment",b:t,e:r,c:[]},a||{});return n.c.push(e.PWM),n.c.push({cN:"doctag",b:"(?:TODO|FIXME|NOTE|BUG|XXX):",r:0}),n},e.CLCM=e.C("//","$"),e.CBCM=e.C("/\\*","\\*/"),e.HCM=e.C("#","$"),e.NM={cN:"number",b:e.NR,r:0},e.CNM={cN:"number",b:e.CNR,r:0},e.BNM={cN:"number",b:e.BNR,r:0},e.CSSNM={cN:"number",b:e.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},e.RM={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[e.BE,{b:/\[/,e:/\]/,r:0,c:[e.BE]}]},e.TM={cN:"title",b:e.IR,r:0},e.UTM={cN:"title",b:e.UIR,r:0},e.registerLanguage("apache",function(e){var t={cN:"number",b:"[\\$%]\\d+"};return{aliases:["apacheconf"],cI:!0,c:[e.HCM,{cN:"tag",b:"</?",e:">"},{cN:"keyword",b:/\w+/,r:0,k:{common:"order deny allow setenv rewriterule rewriteengine rewritecond documentroot sethandler errordocument loadmodule options header listen serverroot servername"},starts:{e:/$/,r:0,k:{literal:"on off all"},c:[{cN:"sqbracket",b:"\\s\\[",e:"\\]$"},{cN:"cbracket",b:"[\\$%]\\{",e:"\\}",c:["self",t]},t,e.QSM]}}],i:/\S/}}),e.registerLanguage("bash",function(e){var t={cN:"variable",v:[{b:/\$[\w\d#@][\w\d_]*/},{b:/\$\{(.*?)}/}]},r={cN:"string",b:/"/,e:/"/,c:[e.BE,t,{cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]}]},a={cN:"string",b:/'/,e:/'/};return{aliases:["sh","zsh"],l:/-?[a-z\.]+/,k:{keyword:"if then else elif fi for while in do done case esac function",literal:"true false",built_in:"break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",operator:"-ne -eq -lt -gt -f -d -e -s -l -a"},c:[{cN:"shebang",b:/^#![^\n]+sh\s*$/,r:10},{cN:"function",b:/\w[\w\d_]*\s*\(\s*\)\s*\{/,rB:!0,c:[e.inherit(e.TM,{b:/\w[\w\d_]*/})],r:0},e.HCM,e.NM,r,a,t]}}),e.registerLanguage("coffeescript",function(e){var t={keyword:"in if for while finally new do return else break catch instanceof throw try this switch continue typeof delete debugger super then unless until loop of by when and or is isnt not",literal:"true false null undefined yes no on off",built_in:"npm require console print module global window document"},r="[A-Za-z$_][0-9A-Za-z$_]*",a={cN:"subst",b:/#\{/,e:/}/,k:t},n=[e.BNM,e.inherit(e.CNM,{starts:{e:"(\\s*/)?",r:0}}),{cN:"string",v:[{b:/'''/,e:/'''/,c:[e.BE]},{b:/'/,e:/'/,c:[e.BE]},{b:/"""/,e:/"""/,c:[e.BE,a]},{b:/"/,e:/"/,c:[e.BE,a]}]},{cN:"regexp",v:[{b:"///",e:"///",c:[a,e.HCM]},{b:"//[gim]*",r:0},{b:/\/(?![ *])(\\\/|.)*?\/[gim]*(?=\W|$)/}]},{cN:"property",b:"@"+r},{b:"`",e:"`",eB:!0,eE:!0,sL:"javascript"}];a.c=n;var i=e.inherit(e.TM,{b:r}),s="(\\(.*\\))?\\s*\\B[-=]>",c={cN:"params",b:"\\([^\\(]",rB:!0,c:[{b:/\(/,e:/\)/,k:t,c:["self"].concat(n)}]};return{aliases:["coffee","cson","iced"],k:t,i:/\/\*/,c:n.concat([e.C("###","###"),e.HCM,{cN:"function",b:"^\\s*"+r+"\\s*=\\s*"+s,e:"[-=]>",rB:!0,c:[i,c]},{b:/[:\(,=]\s*/,r:0,c:[{cN:"function",b:s,e:"[-=]>",rB:!0,c:[c]}]},{cN:"class",bK:"class",e:"$",i:/[:="\[\]]/,c:[{bK:"extends",eW:!0,i:/[:="\[\]]/,c:[i]},i]},{cN:"attribute",b:r+":",e:":",rB:!0,rE:!0,r:0}])}}),e.registerLanguage("cpp",function(e){var t={cN:"keyword",b:"\\b[a-z\\d_]*_t\\b"},r={cN:"string",v:[e.inherit(e.QSM,{b:'((u8?|U)|L)?"'}),{b:'(u8?|U)?R"',e:'"',c:[e.BE]},{b:"'\\\\?.",e:"'",i:"."}]},a={cN:"number",v:[{b:"\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)"},{b:e.CNR}]},n={cN:"preprocessor",b:"#",e:"$",k:"if else elif endif define undef warning error line pragma ifdef ifndef",c:[{b:/\\\n/,r:0},{bK:"include",e:"$",c:[r,{cN:"string",b:"<",e:">",i:"\\n"}]},r,a,e.CLCM,e.CBCM]},i=e.IR+"\\s*\\(",s={keyword:"int float while private char catch export virtual operator sizeof dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace unsigned long volatile static protected bool template mutable if public friend do goto auto void enum else break extern using class asm case typeid short reinterpret_cast|10 default double register explicit signed typename try this switch continue inline delete alignof constexpr decltype noexcept static_assert thread_local restrict _Bool complex _Complex _Imaginary atomic_bool atomic_char atomic_schar atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong atomic_ullong",built_in:"std string cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf",literal:"true false nullptr NULL"};return{aliases:["c","cc","h","c++","h++","hpp"],k:s,i:"</",c:[t,e.CLCM,e.CBCM,a,r,n,{b:"\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<",e:">",k:s,c:["self",t]},{b:e.IR+"::",k:s},{bK:"new throw return else",r:0},{cN:"function",b:"("+e.IR+"[\\*&\\s]+)+"+i,rB:!0,e:/[{;=]/,eE:!0,k:s,i:/[^\w\s\*&]/,c:[{b:i,rB:!0,c:[e.TM],r:0},{cN:"params",b:/\(/,e:/\)/,k:s,r:0,c:[e.CLCM,e.CBCM,r,a]},e.CLCM,e.CBCM,n]}]}}),e.registerLanguage("cs",function(e){var t="abstract as base bool break byte case catch char checked const continue decimal dynamic default delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long null when object operator out override params private protected public readonly ref sbyte sealed short sizeof stackalloc static string struct switch this true try typeof uint ulong unchecked unsafe ushort using virtual volatile void while async protected public private internal ascending descending from get group into join let orderby partial select set value var where yield",r=e.IR+"(<"+e.IR+">)?";return{aliases:["csharp"],k:t,i:/::/,c:[e.C("///","$",{rB:!0,c:[{cN:"xmlDocTag",v:[{b:"///",r:0},{b:"<!--|-->"},{b:"</?",e:">"}]}]}),e.CLCM,e.CBCM,{cN:"preprocessor",b:"#",e:"$",k:"if else elif endif define undef warning error line region endregion pragma checksum"},{cN:"string",b:'@"',e:'"',c:[{b:'""'}]},e.ASM,e.QSM,e.CNM,{bK:"class interface",e:/[{;=]/,i:/[^\s:]/,c:[e.TM,e.CLCM,e.CBCM]},{bK:"namespace",e:/[{;=]/,i:/[^\s:]/,c:[{cN:"title",b:"[a-zA-Z](\\.?\\w)*",r:0},e.CLCM,e.CBCM]},{bK:"new return throw await",r:0},{cN:"function",b:"("+r+"\\s+)+"+e.IR+"\\s*\\(",rB:!0,e:/[{;=]/,eE:!0,k:t,c:[{b:e.IR+"\\s*\\(",rB:!0,c:[e.TM],r:0},{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,k:t,r:0,c:[e.ASM,e.QSM,e.CNM,e.CBCM]},e.CLCM,e.CBCM]}]}}),e.registerLanguage("css",function(e){var t="[a-zA-Z-][a-zA-Z0-9_-]*",r={cN:"function",b:t+"\\(",rB:!0,eE:!0,e:"\\("},a={cN:"rule",b:/[A-Z\_\.\-]+\s*:/,rB:!0,e:";",eW:!0,c:[{cN:"attribute",b:/\S/,e:":",eE:!0,starts:{cN:"value",eW:!0,eE:!0,c:[r,e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]};return{cI:!0,i:/[=\/|'\$]/,c:[e.CBCM,{cN:"id",b:/\#[A-Za-z0-9_-]+/},{cN:"class",b:/\.[A-Za-z0-9_-]+/},{cN:"attr_selector",b:/\[/,e:/\]/,i:"$"},{cN:"pseudo",b:/:(:)?[a-zA-Z0-9\_\-\+\(\)"']+/},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:!0,eE:!0,r:0,c:[r,e.ASM,e.QSM,e.CSSNM]}]},{cN:"tag",b:t,r:0},{cN:"rules",b:"{",e:"}",i:/\S/,c:[e.CBCM,a]}]}}),e.registerLanguage("diff",function(e){return{aliases:["patch"],c:[{cN:"chunk",r:10,v:[{b:/^@@ +\-\d+,\d+ +\+\d+,\d+ +@@$/},{b:/^\*\*\* +\d+,\d+ +\*\*\*\*$/},{b:/^\-\-\- +\d+,\d+ +\-\-\-\-$/}]},{cN:"header",v:[{b:/Index: /,e:/$/},{b:/=====/,e:/=====$/},{b:/^\-\-\-/,e:/$/},{b:/^\*{3} /,e:/$/},{b:/^\+\+\+/,e:/$/},{b:/\*{5}/,e:/\*{5}$/}]},{cN:"addition",b:"^\\+",e:"$"},{cN:"deletion",b:"^\\-",e:"$"},{cN:"change",b:"^\\!",e:"$"}]}}),e.registerLanguage("http",function(e){return{aliases:["https"],i:"\\S",c:[{cN:"status",b:"^HTTP/[0-9\\.]+",e:"$",c:[{cN:"number",b:"\\b\\d{3}\\b"}]},{cN:"request",b:"^[A-Z]+ (.*?) HTTP/[0-9\\.]+$",rB:!0,e:"$",c:[{cN:"string",b:" ",e:" ",eB:!0,eE:!0}]},{cN:"attribute",b:"^\\w",e:": ",eE:!0,i:"\\n|\\s|=",starts:{cN:"string",e:"$"}},{b:"\\n\\n",starts:{sL:[],eW:!0}}]}}),e.registerLanguage("ini",function(e){var t={cN:"string",c:[e.BE],v:[{b:"'''",e:"'''",r:10},{b:'"""',e:'"""',r:10},{b:'"',e:'"'},{b:"'",e:"'"}]};return{aliases:["toml"],cI:!0,i:/\S/,c:[e.C(";","$"),e.HCM,{cN:"title",b:/^\s*\[+/,e:/\]+/},{cN:"setting",b:/^[a-z0-9\[\]_-]+\s*=\s*/,e:"$",c:[{cN:"value",eW:!0,k:"on off true false yes no",c:[{cN:"variable",v:[{b:/\$[\w\d"][\w\d_]*/},{b:/\$\{(.*?)}/}]},t,{cN:"number",b:/([\+\-]+)?[\d]+_[\d_]+/},e.NM],r:0}]}]}}),e.registerLanguage("java",function(e){var t=e.UIR+"(<"+e.UIR+">)?",r="false synchronized int abstract float private char boolean static null if const for true while long strictfp finally protected import native final void enum else break transient catch instanceof byte super volatile case assert short package default double public try this switch continue throws protected public private",a="\\b(0[bB]([01]+[01_]+[01]+|[01]+)|0[xX]([a-fA-F0-9]+[a-fA-F0-9_]+[a-fA-F0-9]+|[a-fA-F0-9]+)|(([\\d]+[\\d_]+[\\d]+|[\\d]+)(\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))?|\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))([eE][-+]?\\d+)?)[lLfF]?",n={cN:"number",b:a,r:0};return{aliases:["jsp"],k:r,i:/<\/|#/,c:[e.C("/\\*\\*","\\*/",{r:0,c:[{cN:"doctag",b:"@[A-Za-z]+"}]}),e.CLCM,e.CBCM,e.ASM,e.QSM,{cN:"class",bK:"class interface",e:/[{;=]/,eE:!0,k:"class interface",i:/[:"\[\]]/,c:[{bK:"extends implements"},e.UTM]},{bK:"new throw return else",r:0},{cN:"function",b:"("+t+"\\s+)+"+e.UIR+"\\s*\\(",rB:!0,e:/[{;=]/,eE:!0,k:r,c:[{b:e.UIR+"\\s*\\(",rB:!0,r:0,c:[e.UTM]},{cN:"params",b:/\(/,e:/\)/,k:r,r:0,c:[e.ASM,e.QSM,e.CNM,e.CBCM]},e.CLCM,e.CBCM]},n,{cN:"annotation",b:"@[A-Za-z]+"}]}}),e.registerLanguage("javascript",function(e){return{aliases:["js"],k:{keyword:"in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"},c:[{cN:"pi",r:10,b:/^\s*['"]use (strict|asm)['"]/},e.ASM,e.QSM,{cN:"string",b:"`",e:"`",c:[e.BE,{cN:"subst",b:"\\$\\{",e:"\\}"}]},e.CLCM,e.CBCM,{cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{b:/</,e:/>\s*[);\]]/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[e.inherit(e.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,c:[e.CLCM,e.CBCM]}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+e.IR,r:0},{bK:"import",e:"[;$]",k:"import from as",c:[e.ASM,e.QSM]},{cN:"class",bK:"class",e:/[{;=]/,eE:!0,i:/[:"\[\]]/,c:[{bK:"extends"},e.UTM]}],i:/#/}}),e.registerLanguage("json",function(e){var t={literal:"true false null"},r=[e.QSM,e.CNM],a={cN:"value",e:",",eW:!0,eE:!0,c:r,k:t},n={b:"{",e:"}",c:[{cN:"attribute",b:'\\s*"',e:'"\\s*:\\s*',eB:!0,eE:!0,c:[e.BE],i:"\\n",starts:a}],i:"\\S"},i={b:"\\[",e:"\\]",c:[e.inherit(a,{cN:null})],i:"\\S"};return r.splice(r.length,0,n,i),{c:r,k:t,i:"\\S"}}),e.registerLanguage("makefile",function(e){var t={cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]};return{aliases:["mk","mak"],c:[e.HCM,{b:/^\w+\s*\W*=/,rB:!0,r:0,starts:{cN:"constant",e:/\s*\W*=/,eE:!0,starts:{e:/$/,r:0,c:[t]}}},{cN:"title",b:/^[\w]+:\s*$/},{cN:"phony",b:/^\.PHONY:/,e:/$/,k:".PHONY",l:/[\.\w]+/},{b:/^\t+/,e:/$/,r:0,c:[e.QSM,t]}]}}),e.registerLanguage("xml",function(e){var t="[A-Za-z0-9\\._:-]+",r={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php"},a={eW:!0,i:/</,r:0,c:[r,{cN:"attribute",b:t,r:0},{b:"=",r:0,c:[{cN:"value",c:[r],v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xsl","plist"],cI:!0,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},e.C("<!--","-->",{r:10}),{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[a],starts:{e:"</style>",rE:!0,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[a],starts:{e:"</script>",rE:!0,sL:["actionscript","javascript","handlebars"]}},r,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:/[^ \/><\n\t]+/,r:0},a]}]}}),e.registerLanguage("markdown",function(e){return{aliases:["md","mkdown","mkd"],c:[{cN:"header",v:[{b:"^#{1,6}",e:"$"},{b:"^.+?\\n[=-]{2,}$"}]},{b:"<",e:">",sL:"xml",r:0},{cN:"bullet",b:"^([*+-]|(\\d+\\.))\\s+"},{cN:"strong",b:"[*_]{2}.+?[*_]{2}"},{cN:"emphasis",v:[{b:"\\*.+?\\*"},{b:"_.+?_",r:0}]},{cN:"blockquote",b:"^>\\s+",e:"$"},{cN:"code",v:[{b:"`.+?`"},{b:"^( {4}|	)",e:"$",r:0}]},{cN:"horizontal_rule",b:"^[-\\*]{3,}",e:"$"},{b:"\\[.+?\\][\\(\\[].*?[\\)\\]]",rB:!0,c:[{cN:"link_label",b:"\\[",e:"\\]",eB:!0,rE:!0,r:0},{cN:"link_url",b:"\\]\\(",e:"\\)",eB:!0,eE:!0},{cN:"link_reference",b:"\\]\\[",e:"\\]",eB:!0,eE:!0}],r:10},{b:"^\\[.+\\]:",rB:!0,c:[{cN:"link_reference",b:"\\[",e:"\\]:",eB:!0,eE:!0,starts:{cN:"link_url",e:"$"}}]}]}}),e.registerLanguage("nginx",function(e){var t={cN:"variable",v:[{b:/\$\d+/},{b:/\$\{/,e:/}/},{b:"[\\$\\@]"+e.UIR}]},r={eW:!0,l:"[a-z/_]+",k:{built_in:"on off yes no true false none blocked debug info notice warn error crit select break last permanent redirect kqueue rtsig epoll poll /dev/poll"},r:0,i:"=>",c:[e.HCM,{cN:"string",c:[e.BE,t],v:[{b:/"/,e:/"/},{b:/'/,e:/'/}]},{cN:"url",b:"([a-z]+):/",e:"\\s",eW:!0,eE:!0,c:[t]},{cN:"regexp",c:[e.BE,t],v:[{b:"\\s\\^",e:"\\s|{|;",rE:!0},{b:"~\\*?\\s+",e:"\\s|{|;",rE:!0},{b:"\\*(\\.[a-z\\-]+)+"},{b:"([a-z\\-]+\\.)+\\*"}]},{cN:"number",b:"\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"},{cN:"number",b:"\\b\\d+[kKmMgGdshdwy]*\\b",r:0},t]};return{aliases:["nginxconf"],c:[e.HCM,{b:e.UIR+"\\s",e:";|{",rB:!0,c:[{cN:"title",b:e.UIR,starts:r}],r:0}],i:"[^\\s\\}]"}}),e.registerLanguage("objectivec",function(e){var t={cN:"built_in",b:"(AV|CA|CF|CG|CI|MK|MP|NS|UI)\\w+"},r={keyword:"int float while char export sizeof typedef const struct for union unsigned long volatile static bool mutable if do return goto void enum else break extern asm case short default double register explicit signed typename this switch continue wchar_t inline readonly assign readwrite self @synchronized id typeof nonatomic super unichar IBOutlet IBAction strong weak copy in out inout bycopy byref oneway __strong __weak __block __autoreleasing @private @protected @public @try @property @end @throw @catch @finally @autoreleasepool @synthesize @dynamic @selector @optional @required",literal:"false true FALSE TRUE nil YES NO NULL",built_in:"BOOL dispatch_once_t dispatch_queue_t dispatch_sync dispatch_async dispatch_once"},a=/[a-zA-Z@][a-zA-Z0-9_]*/,n="@interface @class @protocol @implementation";return{aliases:["mm","objc","obj-c"],k:r,l:a,i:"</",c:[t,e.CLCM,e.CBCM,e.CNM,e.QSM,{cN:"string",v:[{b:'@"',e:'"',i:"\\n",c:[e.BE]},{b:"'",e:"[^\\\\]'",i:"[^\\\\][^']"}]},{cN:"preprocessor",b:"#",e:"$",c:[{cN:"title",v:[{b:'"',e:'"'},{b:"<",e:">"}]}]},{cN:"class",b:"("+n.split(" ").join("|")+")\\b",e:"({|$)",eE:!0,k:n,l:a,c:[e.UTM]},{cN:"variable",b:"\\."+e.UIR,r:0}]}}),e.registerLanguage("perl",function(e){var t="getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qqfileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent shutdown dump chomp connect getsockname die socketpair close flock exists index shmgetsub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedirioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when",r={cN:"subst",b:"[$@]\\{",e:"\\}",k:t},a={b:"->{",e:"}"},n={cN:"variable",v:[{b:/\$\d/},{b:/[\$%@](\^\w\b|#\w+(::\w+)*|{\w+}|\w+(::\w*)*)/},{b:/[\$%@][^\s\w{]/,r:0}]},i=[e.BE,r,n],s=[n,e.HCM,e.C("^\\=\\w","\\=cut",{eW:!0}),a,{cN:"string",c:i,v:[{b:"q[qwxr]?\\s*\\(",e:"\\)",r:5},{b:"q[qwxr]?\\s*\\[",e:"\\]",r:5},{b:"q[qwxr]?\\s*\\{",e:"\\}",r:5},{b:"q[qwxr]?\\s*\\|",e:"\\|",r:5},{b:"q[qwxr]?\\s*\\<",e:"\\>",r:5},{b:"qw\\s+q",e:"q",r:5},{b:"'",e:"'",c:[e.BE]},{b:'"',e:'"'},{b:"`",e:"`",c:[e.BE]},{b:"{\\w+}",c:[],r:0},{b:"-?\\w+\\s*\\=\\>",c:[],r:0}]},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{b:"(\\/\\/|"+e.RSR+"|\\b(split|return|print|reverse|grep)\\b)\\s*",k:"split return print reverse grep",r:0,c:[e.HCM,{cN:"regexp",b:"(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*",r:10},{cN:"regexp",b:"(m|qr)?/",e:"/[a-z]*",c:[e.BE],r:0}]},{cN:"sub",bK:"sub",e:"(\\s*\\(.*?\\))?[;{]",r:5},{cN:"operator",b:"-\\w\\b",r:0},{b:"^__DATA__$",e:"^__END__$",sL:"mojolicious",c:[{b:"^@@.*",e:"$",cN:"comment"}]}];return r.c=s,a.c=s,{aliases:["pl"],k:t,c:s}}),e.registerLanguage("php",function(e){var t={cN:"variable",b:"\\$+[a-zA-Z_-ÿ][a-zA-Z0-9_-ÿ]*"},r={cN:"preprocessor",b:/<\?(php)?|\?>/},a={cN:"string",c:[e.BE,r],v:[{b:'b"',e:'"'},{b:"b'",e:"'"},e.inherit(e.ASM,{i:null}),e.inherit(e.QSM,{i:null})]},n={v:[e.BNM,e.CNM]};return{aliases:["php3","php4","php5","php6"],cI:!0,k:"and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception default die require __FUNCTION__ enddeclare final try switch continue endfor endif declare unset true false trait goto instanceof insteadof __DIR__ __NAMESPACE__ yield finally",c:[e.CLCM,e.HCM,e.C("/\\*","\\*/",{c:[{cN:"doctag",b:"@[A-Za-z]+"},r]}),e.C("__halt_compiler.+?;",!1,{eW:!0,k:"__halt_compiler",l:e.UIR}),{cN:"string",b:/<<<['"]?\w+['"]?$/,e:/^\w+;?$/,c:[e.BE,{cN:"subst",v:[{b:/\$\w+/},{b:/\{\$/,e:/\}/}]}]},r,t,{b:/(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/},{cN:"function",bK:"function",e:/[;{]/,eE:!0,i:"\\$|\\[|%",c:[e.UTM,{cN:"params",b:"\\(",e:"\\)",c:["self",t,e.CBCM,a,n]}]},{cN:"class",bK:"class interface",e:"{",eE:!0,i:/[:\(\$"]/,c:[{bK:"extends implements"},e.UTM]},{bK:"namespace",e:";",i:/[\.']/,c:[e.UTM]},{bK:"use",e:";",c:[e.UTM]},{b:"=>"},a,n]}}),e.registerLanguage("python",function(e){var t={cN:"prompt",b:/^(>>>|\.\.\.) /},r={cN:"string",c:[e.BE],v:[{b:/(u|b)?r?'''/,e:/'''/,c:[t],r:10},{b:/(u|b)?r?"""/,e:/"""/,c:[t],r:10},{b:/(u|r|ur)'/,e:/'/,r:10},{b:/(u|r|ur)"/,e:/"/,r:10},{b:/(b|br)'/,e:/'/},{b:/(b|br)"/,e:/"/},e.ASM,e.QSM]},a={cN:"number",r:0,v:[{b:e.BNR+"[lLjJ]?"},{b:"\\b(0o[0-7]+)[lLjJ]?"},{b:e.CNR+"[lLjJ]?"}]},n={cN:"params",b:/\(/,e:/\)/,c:["self",t,a,r]};return{aliases:["py","gyp"],k:{keyword:"and elif is global as in if from raise for except finally print import pass return exec else break not with class assert yield try while continue del or def lambda async await nonlocal|10 None True False",built_in:"Ellipsis NotImplemented"},i:/(<\/|->|\?)/,c:[t,a,r,e.HCM,{v:[{cN:"function",bK:"def",r:10},{cN:"class",bK:"class"}],e:/:/,i:/[${=;\n,]/,c:[e.UTM,n]},{cN:"decorator",b:/^[\t ]*@/,e:/$/},{b:/\b(print|exec)\(/}]}}),e.registerLanguage("ruby",function(e){var t="[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?",r="and false then defined module in return redo if BEGIN retry end for true self when next until do begin unless END rescue nil else break undef not super class case require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor",a={cN:"doctag",b:"@[A-Za-z]+"},n={cN:"value",b:"#<",e:">"},i=[e.C("#","$",{c:[a]}),e.C("^\\=begin","^\\=end",{c:[a],r:10}),e.C("^__END__","\\n$")],s={cN:"subst",b:"#\\{",e:"}",k:r},c={cN:"string",c:[e.BE,s],v:[{b:/'/,e:/'/},{b:/"/,e:/"/},{b:/`/,e:/`/},{b:"%[qQwWx]?\\(",e:"\\)"},{b:"%[qQwWx]?\\[",e:"\\]"},{b:"%[qQwWx]?{",e:"}"},{b:"%[qQwWx]?<",e:">"},{b:"%[qQwWx]?/",e:"/"},{b:"%[qQwWx]?%",e:"%"},{b:"%[qQwWx]?-",e:"-"},{b:"%[qQwWx]?\\|",e:"\\|"},{b:/\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/}]},o={cN:"params",b:"\\(",e:"\\)",k:r},l=[c,n,{cN:"class",bK:"class module",e:"$|;",i:/=/,c:[e.inherit(e.TM,{b:"[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?"}),{cN:"inheritance",b:"<\\s*",c:[{cN:"parent",b:"("+e.IR+"::)?"+e.IR}]}].concat(i)},{cN:"function",bK:"def",e:"$|;",c:[e.inherit(e.TM,{b:t}),o].concat(i)},{cN:"constant",b:"(::)?(\\b[A-Z]\\w*(::)?)+",r:0},{cN:"symbol",b:e.UIR+"(\\!|\\?)?:",r:0},{cN:"symbol",b:":",c:[c,{b:t}],r:0},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{cN:"variable",b:"(\\$\\W)|((\\$|\\@\\@?)(\\w+))"},{b:"("+e.RSR+")\\s*",c:[n,{cN:"regexp",c:[e.BE,s],i:/\n/,v:[{b:"/",e:"/[a-z]*"},{b:"%r{",e:"}[a-z]*"},{b:"%r\\(",e:"\\)[a-z]*"},{b:"%r!",e:"![a-z]*"},{b:"%r\\[",e:"\\][a-z]*"}]}].concat(i),r:0}].concat(i);s.c=l,o.c=l;var u="[>?]>",d="[\\w#]+\\(\\w+\\):\\d+:\\d+>",b="(\\w+-)?\\d+\\.\\d+\\.\\d(p\\d+)?[^>]+>",p=[{b:/^\s*=>/,cN:"status",starts:{e:"$",c:l}},{cN:"prompt",b:"^("+u+"|"+d+"|"+b+")",starts:{e:"$",c:l}}];return{aliases:["rb","gemspec","podspec","thor","irb"],k:r,i:/\/\*/,c:i.concat(p).concat(l)}}),e.registerLanguage("sql",function(e){var t=e.C("--","$");return{cI:!0,i:/[<>{}*]/,c:[{cN:"operator",bK:"begin end start commit rollback savepoint lock alter create drop rename call delete do handler insert load replace select truncate update set show pragma grant merge describe use explain help declare prepare execute deallocate release unlock purge reset change stop analyze cache flush optimize repair kill install uninstall checksum restore check backup revoke",e:/;/,eW:!0,k:{keyword:"abort abs absolute acc acce accep accept access accessed accessible account acos action activate add addtime admin administer advanced advise aes_decrypt aes_encrypt after agent aggregate ali alia alias allocate allow alter always analyze ancillary and any anydata anydataset anyschema anytype apply archive archived archivelog are as asc ascii asin assembly assertion associate asynchronous at atan atn2 attr attri attrib attribu attribut attribute attributes audit authenticated authentication authid authors auto autoallocate autodblink autoextend automatic availability avg backup badfile basicfile before begin beginning benchmark between bfile bfile_base big bigfile bin binary_double binary_float binlog bit_and bit_count bit_length bit_or bit_xor bitmap blob_base block blocksize body both bound buffer_cache buffer_pool build bulk by byte byteordermark bytes c cache caching call calling cancel capacity cascade cascaded case cast catalog category ceil ceiling chain change changed char_base char_length character_length characters characterset charindex charset charsetform charsetid check checksum checksum_agg child choose chr chunk class cleanup clear client clob clob_base clone close cluster_id cluster_probability cluster_set clustering coalesce coercibility col collate collation collect colu colum column column_value columns columns_updated comment commit compact compatibility compiled complete composite_limit compound compress compute concat concat_ws concurrent confirm conn connec connect connect_by_iscycle connect_by_isleaf connect_by_root connect_time connection consider consistent constant constraint constraints constructor container content contents context contributors controlfile conv convert convert_tz corr corr_k corr_s corresponding corruption cos cost count count_big counted covar_pop covar_samp cpu_per_call cpu_per_session crc32 create creation critical cross cube cume_dist curdate current current_date current_time current_timestamp current_user cursor curtime customdatum cycle d data database databases datafile datafiles datalength date_add date_cache date_format date_sub dateadd datediff datefromparts datename datepart datetime2fromparts day day_to_second dayname dayofmonth dayofweek dayofyear days db_role_change dbtimezone ddl deallocate declare decode decompose decrement decrypt deduplicate def defa defau defaul default defaults deferred defi defin define degrees delayed delegate delete delete_all delimited demand dense_rank depth dequeue des_decrypt des_encrypt des_key_file desc descr descri describ describe descriptor deterministic diagnostics difference dimension direct_load directory disable disable_all disallow disassociate discardfile disconnect diskgroup distinct distinctrow distribute distributed div do document domain dotnet double downgrade drop dumpfile duplicate duration e each edition editionable editions element ellipsis else elsif elt empty enable enable_all enclosed encode encoding encrypt end end-exec endian enforced engine engines enqueue enterprise entityescaping eomonth error errors escaped evalname evaluate event eventdata events except exception exceptions exchange exclude excluding execu execut execute exempt exists exit exp expire explain export export_set extended extent external external_1 external_2 externally extract f failed failed_login_attempts failover failure far fast feature_set feature_value fetch field fields file file_name_convert filesystem_like_logging final finish first first_value fixed flash_cache flashback floor flush following follows for forall force form forma format found found_rows freelist freelists freepools fresh from from_base64 from_days ftp full function g general generated get get_format get_lock getdate getutcdate global global_name globally go goto grant grants greatest group group_concat group_id grouping grouping_id groups gtid_subtract guarantee guard handler hash hashkeys having hea head headi headin heading heap help hex hierarchy high high_priority hosts hour http i id ident_current ident_incr ident_seed identified identity idle_time if ifnull ignore iif ilike ilm immediate import in include including increment index indexes indexing indextype indicator indices inet6_aton inet6_ntoa inet_aton inet_ntoa infile initial initialized initially initrans inmemory inner innodb input insert install instance instantiable instr interface interleaved intersect into invalidate invisible is is_free_lock is_ipv4 is_ipv4_compat is_not is_not_null is_used_lock isdate isnull isolation iterate java join json json_exists k keep keep_duplicates key keys kill l language large last last_day last_insert_id last_value lax lcase lead leading least leaves left len lenght length less level levels library like like2 like4 likec limit lines link list listagg little ln load load_file lob lobs local localtime localtimestamp locate locator lock locked log log10 log2 logfile logfiles logging logical logical_reads_per_call logoff logon logs long loop low low_priority lower lpad lrtrim ltrim m main make_set makedate maketime managed management manual map mapping mask master master_pos_wait match matched materialized max maxextents maximize maxinstances maxlen maxlogfiles maxloghistory maxlogmembers maxsize maxtrans md5 measures median medium member memcompress memory merge microsecond mid migration min minextents minimum mining minus minute minvalue missing mod mode model modification modify module monitoring month months mount move movement multiset mutex n name name_const names nan national native natural nav nchar nclob nested never new newline next nextval no no_write_to_binlog noarchivelog noaudit nobadfile nocheck nocompress nocopy nocycle nodelay nodiscardfile noentityescaping noguarantee nokeep nologfile nomapping nomaxvalue nominimize nominvalue nomonitoring none noneditionable nonschema noorder nopr nopro noprom nopromp noprompt norely noresetlogs noreverse normal norowdependencies noschemacheck noswitch not nothing notice notrim novalidate now nowait nth_value nullif nulls num numb numbe nvarchar nvarchar2 object ocicoll ocidate ocidatetime ociduration ociinterval ociloblocator ocinumber ociref ocirefcursor ocirowid ocistring ocitype oct octet_length of off offline offset oid oidindex old on online only opaque open operations operator optimal optimize option optionally or oracle oracle_date oradata ord ordaudio orddicom orddoc order ordimage ordinality ordvideo organization orlany orlvary out outer outfile outline output over overflow overriding p package pad parallel parallel_enable parameters parent parse partial partition partitions pascal passing password password_grace_time password_lock_time password_reuse_max password_reuse_time password_verify_function patch path patindex pctincrease pctthreshold pctused pctversion percent percent_rank percentile_cont percentile_disc performance period period_add period_diff permanent physical pi pipe pipelined pivot pluggable plugin policy position post_transaction pow power pragma prebuilt precedes preceding precision prediction prediction_cost prediction_details prediction_probability prediction_set prepare present preserve prior priority private private_sga privileges procedural procedure procedure_analyze processlist profiles project prompt protection public publishingservername purge quarter query quick quiesce quota quotename radians raise rand range rank raw read reads readsize rebuild record records recover recovery recursive recycle redo reduced ref reference referenced references referencing refresh regexp_like register regr_avgx regr_avgy regr_count regr_intercept regr_r2 regr_slope regr_sxx regr_sxy reject rekey relational relative relaylog release release_lock relies_on relocate rely rem remainder rename repair repeat replace replicate replication required reset resetlogs resize resource respect restore restricted result result_cache resumable resume retention return returning returns reuse reverse revoke right rlike role roles rollback rolling rollup round row row_count rowdependencies rowid rownum rows rtrim rules safe salt sample save savepoint sb1 sb2 sb4 scan schema schemacheck scn scope scroll sdo_georaster sdo_topo_geometry search sec_to_time second section securefile security seed segment select self sequence sequential serializable server servererror session session_user sessions_per_user set sets settings sha sha1 sha2 share shared shared_pool short show shrink shutdown si_averagecolor si_colorhistogram si_featurelist si_positionalcolor si_stillimage si_texture siblings sid sign sin size size_t sizes skip slave sleep smalldatetimefromparts smallfile snapshot some soname sort soundex source space sparse spfile split sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_small_result sql_variant_property sqlcode sqldata sqlerror sqlname sqlstate sqrt square standalone standby start starting startup statement static statistics stats_binomial_test stats_crosstab stats_ks_test stats_mode stats_mw_test stats_one_way_anova stats_t_test_ stats_t_test_indep stats_t_test_one stats_t_test_paired stats_wsr_test status std stddev stddev_pop stddev_samp stdev stop storage store stored str str_to_date straight_join strcmp strict string struct stuff style subdate subpartition subpartitions substitutable substr substring subtime subtring_index subtype success sum suspend switch switchoffset switchover sync synchronous synonym sys sys_xmlagg sysasm sysaux sysdate sysdatetimeoffset sysdba sysoper system system_user sysutcdatetime t table tables tablespace tan tdo template temporary terminated tertiary_weights test than then thread through tier ties time time_format time_zone timediff timefromparts timeout timestamp timestampadd timestampdiff timezone_abbr timezone_minute timezone_region to to_base64 to_date to_days to_seconds todatetimeoffset trace tracking transaction transactional translate translation treat trigger trigger_nestlevel triggers trim truncate try_cast try_convert try_parse type ub1 ub2 ub4 ucase unarchived unbounded uncompress under undo unhex unicode uniform uninstall union unique unix_timestamp unknown unlimited unlock unpivot unrecoverable unsafe unsigned until untrusted unusable unused update updated upgrade upped upper upsert url urowid usable usage use use_stored_outlines user user_data user_resources users using utc_date utc_timestamp uuid uuid_short validate validate_password_strength validation valist value values var var_samp varcharc vari varia variab variabl variable variables variance varp varraw varrawc varray verify version versions view virtual visible void wait wallet warning warnings week weekday weekofyear wellformed when whene whenev wheneve whenever where while whitespace with within without work wrapped xdb xml xmlagg xmlattributes xmlcast xmlcolattval xmlelement xmlexists xmlforest xmlindex xmlnamespaces xmlpi xmlquery xmlroot xmlschema xmlserialize xmltable xmltype xor year year_to_month years yearweek",
literal:"true false null",built_in:"array bigint binary bit blob boolean char character date dec decimal float int int8 integer interval number numeric real record serial serial8 smallint text varchar varying void"},c:[{cN:"string",b:"'",e:"'",c:[e.BE,{b:"''"}]},{cN:"string",b:'"',e:'"',c:[e.BE,{b:'""'}]},{cN:"string",b:"`",e:"`",c:[e.BE]},e.CNM,e.CBCM,t]},e.CBCM,t]}}),e});
},{}],6:[function(require,module,exports){
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

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vY29tbWVudC5qcyIsInN0YXRpYy8udG1wL2NvbW1vbi9oZWFkZXIuanMiLCJzdGF0aWMvLnRtcC9jb21tb24vdWkuanMiLCJzdGF0aWMvLnRtcC9ob21lL21haW4uanMiLCJzdGF0aWMvbGliL2hpZ2hsaWdodC9zcmMvaGlnaGxpZ2h0Lm1pbi5qcyIsInN0YXRpYy9saWIvdmlld2VyLW1hc3Rlci9kaXN0L3ZpZXdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclFBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEZPUiBBUlRJQ0xFIENPTU1FTlRcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgYWlkID0gdW5kZWZpbmVkLFxuICAgIGFwaVVybCA9IHVuZGVmaW5lZCxcbiAgICAkY29tbWVudCA9IHVuZGVmaW5lZCxcbiAgICAkdiA9IHVuZGVmaW5lZCxcbiAgICAkbmlja25hbWUgPSB1bmRlZmluZWQsXG4gICAgJGMgPSB1bmRlZmluZWQsXG4gICAgJG1haWwgPSB1bmRlZmluZWQsXG4gICAgJHN0YXR1cyA9IHVuZGVmaW5lZCxcbiAgICAkcG9zdEJ0biA9IHVuZGVmaW5lZDtcblxudmFyIF9jb21tZW50Q2FjaGUgPSB7fTtcblxuZnVuY3Rpb24gbG9hZENvbW1lbnQoY2IpIHtcblxuICAgIC8vaWYgY29tbWVudHMgZXhpc3RcbiAgICBpZiAoJCgnLndyYXAgPiAuY29udGVudC5jb250ZW50X2Z1bGwgPiAuY29tbWVudCcpLmxlbmd0aCkgcmV0dXJuIGNvbnNvbGUubG9nKCdDb21tZW50IEJsb2NrIGV4aXN0ZWQhJykgfHwgZmFsc2U7XG5cbiAgICB2YXIgJGNhcmRNZXRhID0gJCgnLndyYXAgPiAuY29udGVudCA+IC5jYXJkID4gLmV4Y2VycHQgLmZ1bGwnKS5ub3QoJzpoaWRkZW4nKS5wYXJlbnRzKCcuZXhjZXJwdCcpLnByZXYoJy5jYXJkLW1ldGEnKTtcblxuICAgIC8vc2V0IGFydGljbGVcbiAgICBhaWQgPSAkY2FyZE1ldGEuZmluZCgnLl9hcnRpY2xlX2lkJykuZXEoMCkudmFsKCk7XG5cbiAgICBmdW5jdGlvbiBfY2IocnMpIHtcblxuICAgICAgICAkKCcuY29udGVudC5jb250ZW50X2Z1bGwnKS5hcHBlbmQoJChycykpO1xuICAgICAgICBzZXRWYXJzKCk7XG4gICAgICAgIC8vIGRlYnVnZ2VyO1xuICAgICAgICBjYiA/IGNiKHJzKSA6ICcnO1xuICAgIH1cblxuICAgIC8v5aaC5p6c57yT5a2Y5Lit5pyJ77yM6YKj5LmI5LuO57yT5a2Y5Lit6K+75Y+WXG4gICAgYXBpVXJsID0gJy9jb21tZW50L2dldC8nICsgYWlkO1xuICAgIHZhciBfY2FjaGVkUmVzID0gX2NvbW1lbnRDYWNoZVthcGlVcmxdO1xuICAgIGlmIChfY2FjaGVkUmVzKSB7XG5cbiAgICAgICAgcmV0dXJuIF9jYihfY2FjaGVkUmVzKTtcbiAgICB9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICAndXJsJzogYXBpVXJsLFxuICAgICAgICAndHlwZSc6ICdQT1NUJyxcbiAgICAgICAgJ2RhdGFUeXBlJzogJ2h0bWwnXG4gICAgfSkuZG9uZShmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIF9jYihyZXMpO1xuICAgICAgICBfY29tbWVudENhY2hlW2FwaVVybF0gPSByZXM7XG4gICAgfSkuZmFpbChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIGNiID8gY2IocnMpIDogJyc7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldFZhcnMoKSB7XG4gICAgJGNvbW1lbnQgPSAkKCcuY29udGVudC5jb250ZW50X2Z1bGwgLmNvbW1lbnQnKTtcblxuICAgICR2ID0gJCgnLmNvbnRlbnRfZnVsbCBpbnB1dFtuYW1lPVwidmVyaWZpY2F0aW9uXCJdJyk7XG4gICAgJG5pY2tuYW1lID0gJCgnLmNvbnRlbnRfZnVsbCBpbnB1dFtuYW1lPVwibmlja25hbWVcIl0nKTtcbiAgICAkYyA9ICQoJy5jb250ZW50X2Z1bGwgdGV4dGFyZWFbbmFtZT1cImNvbW1lbnRfY29udGVudFwiXScpO1xuICAgICRtYWlsID0gJCgnLmNvbnRlbnRfZnVsbCBpbnB1dFtuYW1lPVwibWFpbFwiXScpO1xuXG4gICAgJHN0YXR1cyA9ICRjb21tZW50LmZpbmQoJy5kaWFsb2cgLmRpYWxvZy1zdGF0dXMnKTtcblxuICAgICRwb3N0QnRuID0gJCgnLmNvbW1lbnQtcGFuZWwgLnBvc3RfYnRuJyk7XG59XG5cbmZ1bmN0aW9uIHJlZnJlc2hWZXJpZmljYXRpb24oKSB7XG5cbiAgICB2YXIgc3JjID0gJCgnI3ZlcmlmaWNhdGlvbl9pbWcnKS5hdHRyKCdzcmMnKTtcbiAgICAvLyAkKCcjdmVyaWZpY2F0aW9uX2ltZycpLmF0dHIoJ3NyYycsICcnKVxuICAgICQoJyN2ZXJpZmljYXRpb25faW1nJykuYXR0cignc3JjJywgTU8udXRpbC5hZGRVUkxQYXJhbShzcmMsICdzdCcsIG5ldyBEYXRlKCkuZ2V0VGltZSgpKSk7XG5cbiAgICAkdi52YWwoJycpO1xufVxuXG5mdW5jdGlvbiBfcmVmcmVzaENhY2hlKF9kYXRhKSB7XG4gICAgdmFyIG5ld0RhdGEgPSBfZGF0YSB8fCAkY29tbWVudC5nZXQoMCkub3V0ZXJIVE1MO1xuICAgIF9jb21tZW50Q2FjaGVbYXBpVXJsXSA9IG5ld0RhdGE7XG59XG5cbmZ1bmN0aW9uIF9yZWYoZXJyKSB7XG4gICAgY29uc29sZS5sb2coZXJyKTtcbiAgICByZWZyZXNoVmVyaWZpY2F0aW9uKCk7XG4gICAgYWxlcnQoJ+mqjOivgeeggemUmeivr++8jOivt+aCqOmHjeaWsOi+k+WFpScpO1xufVxuXG5mdW5jdGlvbiBhZGRDb21tZW50KGV2dCkge1xuICAgIHZhciAkYnRuID0gJCh0aGlzKTtcbiAgICBpZiAoJGJ0bi5pcygnLmRpc2FibGVkJykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgICRidG4uYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRlbnQgPSAkYy52YWwoKSxcbiAgICAgICAgbWFpbCA9ICRtYWlsLnZhbCgpLFxuICAgICAgICBuaWNrbmFtZSA9ICRuaWNrbmFtZS52YWwoKSxcbiAgICAgICAgdmVyaWZpY2F0aW9uID0gJHYudmFsKCk7XG5cbiAgICAvL+aYr+WQpuaYr+WbnuWkjeafkOS4quS6ulxuICAgIHZhciByZWxDb21tZW50SWQgPSAkc3RhdHVzLmRhdGEoJ2lkJyk7XG4gICAgdmFyIHRvID0gJHN0YXR1cy5kYXRhKCd0b0F1dGhvcicpO1xuICAgIHZhciAkbGlzdCA9ICRzdGF0dXMuZGF0YSgnbGlzdCcpO1xuXG4gICAgLy8gY29uc29sZS5sb2coJGxpc3QpXG5cbiAgICB2YXIgaXNfdmFsaWQgPSB0cnVlO1xuXG4gICAgaWYgKCF2ZXJpZmljYXRpb24pIHtcbiAgICAgICAgJGJ0bi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgcmV0dXJuIGFsZXJ0KCfor7floavlhpnpqozor4HnoIEnKTtcbiAgICB9XG5cbiAgICBpZiAoIWNvbnRlbnQgfHwgIW5pY2tuYW1lKSB7XG4gICAgICAgICRidG4ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgIHJldHVybiBhbGVydCgn6K+35aGr5YaZ6K+E6K665YaF5a655ZKM56ew5ZG8Jyk7XG4gICAgfVxuXG4gICAgaWYgKG1haWwgJiYgIU1PLnV0aWwudmFsaWRhdGUobWFpbCwgJ21haWwnKSkge1xuICAgICAgICAkYnRuLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICByZXR1cm4gYWxlcnQoJ+ivt+Whq+WGmeato+ehrueahOmCrueuseWcsOWdgCcpO1xuICAgIH1cbiAgICB2YXIgX3JkID0gTU8udXRpbC5yYW5kb21OdW0oMSwgMTQpO1xuXG4gICAgdmFyIGF2YXRhclVybCA9ICcvc3RhdGljL2ltZy9jb21tb24vYXZhdGFyLycgKyBfcmQgKyAnLnBuZyc7XG5cbiAgICAvKipcbiAgICAgKiBAZGVidWcgXG4gICAgICovXG4gICAgLy8gZ2V0IHRoZSBjb250ZW50IHdpdGggYSBsaW5rXG4gICAgdmFyIF8kZiA9IE1PLmZvcm1hdHRlci5hdXRvbGluaygkYyksXG4gICAgICAgIGZDb250ZW50ID0gXyRmLmh0bWwoKTtcblxuICAgICQuYWpheCh7XG4gICAgICAgICd1cmwnOiAnL2NvbW1lbnQvYWRkLycgKyBhaWQsXG4gICAgICAgICd0eXBlJzogJ1BPU1QnLFxuICAgICAgICAnZGF0YVR5cGUnOiAnaHRtbCcsXG4gICAgICAgICdkYXRhJzoge1xuICAgICAgICAgICAgJ2FydGljbGVfaWQnOiBhaWQsXG4gICAgICAgICAgICAnY29udGVudCc6IGZDb250ZW50LFxuICAgICAgICAgICAgJ2F2YXRhcic6IGF2YXRhclVybCxcbiAgICAgICAgICAgICdyZWxfY29tbWVudCc6IHJlbENvbW1lbnRJZCxcbiAgICAgICAgICAgICd0b0F1dGhvcic6IHRvLFxuICAgICAgICAgICAgJ21haWwnOiBtYWlsLFxuICAgICAgICAgICAgJ25pY2tuYW1lJzogbmlja25hbWUsXG4gICAgICAgICAgICAndmVyaWZpY2F0aW9uJzogdmVyaWZpY2F0aW9uXG4gICAgICAgIH1cbiAgICB9KS5kb25lKGZ1bmN0aW9uIChycykge1xuICAgICAgICBpZiAoJGxpc3QgJiYgJGxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVzcG9uc2UgQ29tbWVudCBMaXN0Jyk7XG4gICAgICAgICAgICAkbGlzdC5hcHBlbmQoJChycykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJGNvbW1lbnQuZmluZCgnPiB1bCcpLnByZXBlbmQoJChycykpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9hZGQgY291bnRcbiAgICAgICAgaW5jcmVhc2VDb21tZW50Q291bnQoKTtcbiAgICAgICAgX3JlZnJlc2hDYWNoZSgpO1xuXG4gICAgICAgIGFsZXJ0KCfor4TorrrmiJDlip8nKTtcbiAgICAgICAgcmVzZXRDb21tZW50KCk7XG4gICAgfSkuZmFpbChfcmVmKS5jb21wbGV0ZShmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICRidG4ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGluY3JlYXNlQ29tbWVudENvdW50KCkge1xuICAgIHZhciAkY291bnQgPSAkY29tbWVudC5maW5kKCc+IGgzID4gc3BhbicpO1xuICAgIHZhciBjb3VudCA9IHBhcnNlSW50KCRjb3VudC5odG1sKCkpO1xuXG4gICAgLy8gY29uc29sZS5sb2coY291bnQpXG4gICAgJGNvdW50Lmh0bWwoY291bnQgKyAxKTtcbn1cblxuZnVuY3Rpb24gZGVzdHJveUNvbW1lbnQoKSB7XG4gICAgLy8gJCgnLndyYXAgPiAuY29udGVudCcpLm9mZignY2xpY2suY29tbWVudCcpXG4gICAgJGNvbW1lbnQucmVtb3ZlKCk7XG59XG5cbmZ1bmN0aW9uIHJlc1NvbWVvbmUoKSB7XG4gICAgdmFyICRtZXRhID0gJCh0aGlzKS5wYXJlbnRzKCcuY29tbWVudC1tZXRhJyk7XG4gICAgdmFyICRhYnNvbHV0ZU1ldGEgPSAkKHRoaXMpLnBhcmVudHMoJ2xpJykuZmluZCgnPiAuY29tbWVudC1tZXRhJyk7XG5cbiAgICB2YXIgJHJlbF9saXN0ID0gJCh0aGlzKS5wYXJlbnRzKCcucmVzcG9uc2UtbGlzdCcpO1xuICAgIGlmICghJHJlbF9saXN0Lmxlbmd0aCkgJHJlbF9saXN0ID0gJG1ldGEubmV4dEFsbCgnLnJlc3BvbnNlLWxpc3QnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCRyZWxfbGlzdClcblxuICAgIHZhciBjb21tZW50SWQgPSAkYWJzb2x1dGVNZXRhLmRhdGEoJ2lkJyk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhjb21tZW50SWQpXG5cbiAgICB2YXIgYXV0aG9yID0gJG1ldGEuZmluZCgnYVtkYXRhLWF1dGhvcl0nKS5kYXRhKCdhdXRob3InKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKGNvbW1lbnRJZClcblxuICAgICRzdGF0dXMuZGF0YSgnaWQnLCBjb21tZW50SWQpO1xuICAgICRzdGF0dXMuZGF0YSgndG9BdXRob3InLCBhdXRob3IpO1xuICAgICRzdGF0dXMuZGF0YSgnbGlzdCcsICRyZWxfbGlzdCk7XG5cbiAgICAkc3RhdHVzLmh0bWwoJ+WbnuWkjSA8YSBocmVmPVwiamF2YXNjcmlwdDo7XCI+QCcgKyBhdXRob3IgKyAnPC9hPicpO1xuICAgIC8vICRjb21tZW50LmZpbmQoJ3RleHRhcmVhJykudmFsKGDlm57lpI0gQCR7YXV0aG9yfTogXFxuYClcbiAgICAkcG9zdEJ0bi5odG1sKCflm57lpI0nKTtcbiAgICBvcGVuQ29tbWVudERpYWxvZygpO1xufVxuXG5mdW5jdGlvbiBvcGVuQ29tbWVudERpYWxvZyhldnQpIHtcbiAgICAkY29tbWVudC5maW5kKCcuZGlhbG9nLWNvbnRlbnQnKS5hZGRDbGFzcygndHJpZ2dlcmVkJyk7XG5cbiAgICB2YXIgc3RhdHVzT2Zmc2V0VG9wID0gJHN0YXR1cy5vZmZzZXQoKS50b3AgLSAxNTtcblxuICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAnc2Nyb2xsVG9wJzogc3RhdHVzT2Zmc2V0VG9wICsgJ3B4J1xuXG4gICAgfSwgNDAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRjb21tZW50LmZpbmQoJ3RleHRhcmVhJykuZm9jdXMoKTtcbiAgICB9KTtcblxuICAgIC8vIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gJHN0YXR1cy5vZmZzZXQoKS50b3AtMTVcblxuICAgIC8vIHVpLnNjcm9sbFRvQm9keVRvcCgkc3RhdHVzLm9mZnNldCgpLnRvcC0xNSlcbn1cblxuZnVuY3Rpb24gbmV3Q29tbWVudCgpIHtcblxuICAgIHJlc2V0Q29tbWVudCgpO1xuXG4gICAgb3BlbkNvbW1lbnREaWFsb2coKTtcbn1cblxuZnVuY3Rpb24gaW5pdENvbW1lbnQoKSB7XG5cbiAgICAkKCcud3JhcCA+IC5jb250ZW50Jykub24oJ2NsaWNrLmNvbW1lbnQnLCAnLmNvbW1lbnQtcGFuZWwgLnBvc3RfYnRuJywgYWRkQ29tbWVudCkub24oJ2NsaWNrLmNvbW1lbnQnLCAnLmRpYWxvZy1jb250ZW50IHRleHRhcmVhJywgb3BlbkNvbW1lbnREaWFsb2cpLm9uKCdjbGljay5jb21tZW50JywgJy51aS1idXR0b24ucmVmcmVzaCwgI3ZlcmlmaWNhdGlvbl9pbWcnLCByZWZyZXNoVmVyaWZpY2F0aW9uKS5vbignY2xpY2suY29tbWVudCcsICcuY29tbWVudCAucmVzX2J0bicsIHJlc1NvbWVvbmUpLm9uKCdjbGljay5jb21tZW50JywgJy5jb21tZW50IC5uZXdfY29tbWVudF9idG4nLCBuZXdDb21tZW50KTtcbn1cblxuZnVuY3Rpb24gZmV0Y2hVcmwodGV4dCkge1xuICAgIHZhciByZXBsYWNlRWxzID0gW10sXG4gICAgICAgIG1hdGNoID0gbnVsbCxcbiAgICAgICAgbGFzdEluZGV4ID0gMCxcbiAgICAgICAgcmUgPSAvKGh0dHBzPzpcXC9cXC98d3d3XFwuKVtcXHdcXC1cXC5cXD8mPVxcLyMlOixAXFwhXFwrXSsvaWc7XG5cbiAgICB3aGlsZSAoKG1hdGNoID0gcmUuZXhlYyh0ZXh0KSkgIT09IG51bGwpIHtcbiAgICAgICAgLy8gbWF0Y2ggPSByZS5leGVjKHRleHQpXG4gICAgICAgIHZhciBzdWJTdHIgPSB0ZXh0LnN1YnN0cmluZyhsYXN0SW5kZXgsIG1hdGNoLmluZGV4KTtcbiAgICAgICAgcmVwbGFjZUVscy5wdXNoKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN1YlN0cikpO1xuICAgICAgICBsYXN0SW5kZXggPSByZS5sYXN0SW5kZXg7XG5cbiAgICAgICAgdmFyIHVyaSA9IC9eKGh0dHAocyk/OlxcL1xcL3xcXC8pLy50ZXN0KG1hdGNoWzBdKSA/IG1hdGNoWzBdIDogJ2h0dHA6Ly8nICsgbWF0Y2hbMF07XG5cbiAgICAgICAgdmFyICRsaW5rID0gJChcIjxhIHRhZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiICsgdXJpICsgXCJcXFwiIHJlbD1cXFwibm9mb2xsb3dcXFwiPjwvYT5cIikudGV4dChtYXRjaFswXSk7XG5cbiAgICAgICAgcmVwbGFjZUVscy5wdXNoKCRsaW5rWzBdKTtcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhyZXBsYWNlRWxzKVxufVxuXG5mdW5jdGlvbiByZXNldENvbW1lbnQoKSB7XG4gICAgJHYudmFsKCcnKSwgJG5pY2tuYW1lLnZhbCgnJyksICRjLnZhbCgnJyksICRtYWlsLnZhbCgnJyk7XG5cbiAgICAkc3RhdHVzLnJlbW92ZURhdGEoJ2lkJyk7XG4gICAgJHN0YXR1cy5yZW1vdmVEYXRhKCd0b0F1dGhvcicpO1xuICAgICRzdGF0dXMucmVtb3ZlRGF0YSgnbGlzdCcpO1xuXG4gICAgJHN0YXR1cy5odG1sKCflj5HooajmlrDor4TorronKTtcbiAgICAkcG9zdEJ0bi5odG1sKCflj5HooagnKTtcbiAgICAkY29tbWVudC5maW5kKCd0ZXh0YXJlYScpLnZhbCgnJyk7XG5cbiAgICByZWZyZXNoVmVyaWZpY2F0aW9uKCk7XG59XG5cbmV4cG9ydHMuaW5pdENvbW1lbnQgPSBpbml0Q29tbWVudDtcbmV4cG9ydHMuZGVzdHJveUNvbW1lbnQgPSBkZXN0cm95Q29tbWVudDtcbmV4cG9ydHMubG9hZENvbW1lbnQgPSBsb2FkQ29tbWVudDsiLCIvKipcbiAqIEZPUiBIRUFERVIgXG4gKiBAcGFyYW0gIHtbdHlwZV19ICggW2Rlc2NyaXB0aW9uXVxuICogQHJldHVybiB7W3R5cGVdfSAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgJG1lbnVzID0gbnVsbDtcbnZhciAkaGVhZGVyID0gbnVsbDtcblxuZnVuY3Rpb24gX3JlZihldnQpIHtcblxuICAgICQoZXZ0LmN1cnJlbnRUYXJnZXQpLnBhcmVudCgnLm1lbnUnKS5hZGRDbGFzcygnb24nKTtcblxuICAgIC8vIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gX3JlZjIoZXZ0KSB7XG4gICAgJChldnQuY3VycmVudFRhcmdldCkucGFyZW50KCcubWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBpbml0SGVhZGVyKCkge1xuXG4gICAgJGhlYWRlciA9ICQoJ2JvZHkgPiBoZWFkZXInKS5vbignbW91c2VlbnRlcicsICcuc3ViLW1lbnUnLCBfcmVmKS5vbignbW91c2VsZWF2ZScsICcuc3ViLW1lbnUnLCBfcmVmMik7XG5cbiAgICAvL2hpZGUgdGhlIHN1Yi1tZW51IGFmdGVyIGNsaWNrIHRoZSBzdWItbWVudSBsaVxuICAgIC8qLm9uKCdjbGljaycsICcuc3ViLW1lbnUgPiBsaScsIGV2dCA9PiB7XG4gICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgJChldnQuY3VycmVudFRhcmdldClcbiAgICAgICAgLnBhcmVudHMoJy5zdWItbWVudScpLmNzcygndmlzaWJpbGl0eSc6ICdoaWRkZW4nKVxuICAgIH0pKi9cblxuICAgICRtZW51cyA9ICRoZWFkZXIuZmluZCgnLm1lbnUnKTtcblxuICAgIGlmICh3aW5kb3cuX2lzX21vYmlsZSkge1xuICAgICAgICAvL2hpZGUgc3ViLW1lbnUgLHdoZW4gY2xpY2sgb3RoZXIgc3BhY2VzXG4gICAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICB2YXIgJGFyZWEgPSAkKHRoaXMpO1xuICAgICAgICAgICAgaWYgKCRhcmVhLm5vdCgnLnN1Yi1tZW51LCAuc3ViLW1lbnUgPiBsaScpKSB7XG4gICAgICAgICAgICAgICAgJGhlYWRlci5maW5kKCcuc3ViLW1lbnUnKS5yZW1vdmVDbGFzcygnb24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBsb2NhdGUobmF2KSB7XG4gICAgdmFyIG5hdlRleHQgPSBuYXYudG9Mb3dlckNhc2UoKTtcblxuICAgIGZvciAodmFyIGkgaW4gJG1lbnVzKSB7XG4gICAgICAgIHZhciAkbSA9ICRtZW51cy5lcShpKTtcbiAgICAgICAgdmFyICRhID0gJG0uY2hpbGRyZW4oJ2EnKTtcbiAgICAgICAgdmFyIGFUZXh0ID0gJGEuaHRtbCgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgaWYgKG5hdlRleHQgPT0gYVRleHQpIHtcbiAgICAgICAgICAgICRtZW51cy5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAkbS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4kKGZ1bmN0aW9uICgpIHtcbiAgICBpbml0SGVhZGVyKCk7XG59KTtcblxuZXhwb3J0cy5sb2NhdGUgPSBsb2NhdGU7IiwiLyoqXG4gKiBGT1IgVUlcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5mdW5jdGlvbiBzY3JvbGxUb0JvZHlUb3AocG9zLCBjYiwgdHJpKSB7XG5cbiAgICAvKipcbiAgICAgKiBVc2UganF1ZXJ5IGFuaW1hdGUgY2F1c2UgMiB0aW1lcyBjYiB0cmlnZ2VyICEhID9cbiAgICAgKiBAZGVidWcgXG4gICAgICogQHR5cGUge1t0eXBlXX1cbiAgICAgKi9cbiAgICAvKiQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKFxuICAgICAgICB7XG4gICAgICAgICAgICBzY3JvbGxUb3A6IHBvcyB8fCAwXG4gICAgICAgIH0sIFxuICAgICAgICA2MDAsIFxuICAgICAgICAnbGluZWFyJyxcbiAgICAgICAgY2JcbiAgICApKi9cblxuICAgIHZhciBfcG9zID0gcG9zIHx8IDA7XG4gICAgdmFyIF90cmkgPSB0cmkgfHwgMTU7XG5cbiAgICBmdW5jdGlvbiBfcmVmKCkge1xuICAgICAgICB2YXIgX2FicyA9IE1hdGguYWJzO1xuXG4gICAgICAgIHZhciB1bml0ID0gNTtcbiAgICAgICAgdmFyIHVuaXRfYWJzID0gX2Ficyh1bml0KTtcbiAgICAgICAgdmFyIHN0ID0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG5cbiAgICAgICAgaWYgKHN0ID4gcG9zKSB7XG4gICAgICAgICAgICB1bml0ID0gLXVuaXQ7XG4gICAgICAgIH1cblxuICAgICAgICAvL+WIpOaWreihjOS4ulxuICAgICAgICBfYWJzKHN0IC0gcG9zKSA8IHVuaXRfYWJzID8gKGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gcG9zLCBjYiA/IGNiKCkgOiAnJykgOiAoZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgKz0gdW5pdCwgX2FuaW1hdGVTY3JvbGwoKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FuaW1hdGVTY3JvbGwoKSB7XG5cbiAgICAgICAgc2V0VGltZW91dChfcmVmLCBfdHJpKTtcbiAgICB9XG5cbiAgICBfYW5pbWF0ZVNjcm9sbCgpO1xufVxuXG5leHBvcnRzLnNjcm9sbFRvQm9keVRvcCA9IHNjcm9sbFRvQm9keVRvcDsiLCIvKipcbiAqIEZPUiBIb21lQ29udHJvbGxlclxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7IGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHsgcmV0dXJuIG9iajsgfSBlbHNlIHsgdmFyIG5ld09iaiA9IHt9OyBpZiAob2JqICE9IG51bGwpIHsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTsgfSB9IG5ld09ialsnZGVmYXVsdCddID0gb2JqOyByZXR1cm4gbmV3T2JqOyB9IH1cblxucmVxdWlyZSgndmlld2VyLW1hc3Rlci9kaXN0L3ZpZXdlcicpO1xuXG5yZXF1aXJlKCdoaWdobGlnaHQvc3JjL2hpZ2hsaWdodC5taW4nKTtcblxudmFyIF9oZWFkZXIgPSByZXF1aXJlKCdoZWFkZXInKTtcblxudmFyIF91aSA9IHJlcXVpcmUoJ3VpJyk7XG5cbi8qKlxuICogRk9SIENPTU1FTlQgXG4gKi9cblxudmFyIF9jb21tZW50ID0gcmVxdWlyZSgnY29tbWVudCcpO1xuXG52YXIgY29tbWVudCA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9jb21tZW50KTtcblxuLyoqXG4gKiBGT1IgQkFOTkVSIFNWRyBGTFkgQU5JTUFUSU9OXG4gKi9cbi8vIGltcG9ydCAqIGFzIGZseSBmcm9tICcuL2ZseSdcbi8vIGltcG9ydCAnc2hpZnRlci9zaGFwZS1zaGlmdGVyJ1xuLy8gaW1wb3J0ICogYXMgTU8gZnJvbSAnbW8nXG5cbi8qKlxuICogaW5pdCBwaG90byB2aWV3XG4gKi9cblxuZnVuY3Rpb24gaW5pdFZpZXdlcigkY3RuKSB7XG4gICAgJGN0bi52aWV3ZXIoKTtcbn1cblxuZnVuY3Rpb24gZGVzdHJveVZpZXdlcigkY3RuKSB7XG4gICAgJGN0bi52aWV3ZXIoJ2Rlc3Ryb3knKTtcbn1cblxuLyoqXG4gKiBpbml0IGNvZGUgaGlnaGxpZ2h0XG4gKi9cblxuZnVuY3Rpb24gX3JlZihpLCBlQ29kZSkge1xuICAgIGhsanMuaGlnaGxpZ2h0QmxvY2soZUNvZGUpO1xufVxuXG5mdW5jdGlvbiBpbml0SGlnaGxpZ2h0KCRjb2RlKSB7XG4gICAgJGNvZGUuZWFjaChfcmVmKTtcbn1cblxuLyoqXG4gKiBpbml0IGNsaWNrIGV2ZW50cyBmb3IgY2FyZFxuICovXG5cbmZ1bmN0aW9uIGluaXRFdmVudChhcmd1bWVudCkge1xuICAgIHZhciAkY2FyZCA9ICQoJy5jb250ZW50ID4gLmNhcmQnKTtcbiAgICB2YXIgJHNpZGViYXIgPSAkKCcud3JhcCA+IC5zaWRlYmFyJyk7XG4gICAgLy8gbGV0ICRiYW5uZXIgPSAkKCcud3JhcCA+IC5iYW5uZXInKVxuICAgIHZhciAkY29udGVudCA9ICQoJy53cmFwID4gLmNvbnRlbnQnKTtcbiAgICB2YXIgJHBhZ2luYXRpb24gPSAkKCcud3JhcCA+IC5jb250ZW50ID4gLnBhZ2luYXRpb24nKTtcblxuICAgICQoJy5jb250ZW50Jykub24oJ2NsaWNrLmNhcmQnLCAnLmNhcmQgLnJlYWQtbW9yZScsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIHZhciAkcmVhZEJ0biA9ICQodGhpcyk7XG4gICAgICAgIHZhciAkdGhpc0NhcmQgPSAkcmVhZEJ0bi5wYXJlbnRzKCcuY2FyZCcpO1xuICAgICAgICB2YXIgJGZ1bGwgPSAkdGhpc0NhcmQuZmluZCgnLmZ1bGwnKTtcblxuICAgICAgICAvKmlmKCRyZWFkQnRuLmhhc0NsYXNzKCdmcm96ZW4nKSl7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgJHJlYWRCdG4uYWRkQ2xhc3MoJ2Zyb3plbicpXG4gICAgICAgIH0qL1xuXG4gICAgICAgIC8vIGxldCAkdGhpc0Z1bGwgPSAkdGhpc0NhcmQuZmluZCgnLmV4Y2VycHQgPiAuZnVsbCcpXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERJU0FCTEUgQU5JTUFUSU9OLCBGT1IgVEhFIEJVRyBPRiBDaHJvbWVcbiAgICAgICAgICovXG4gICAgICAgIC8vIGxldCBjX2hlaWdodCA9ICR0aGlzRnVsbC5oZWlnaHQoKVxuICAgICAgICAvLyBsZXQgY19oZWlnaHQgPSAnYXV0bydcblxuICAgICAgICAvL21heWJlIGV4aXN0IHNwYWNlc1xuICAgICAgICB2YXIgYnRuVGV4dCA9ICRyZWFkQnRuLmh0bWwoKS50cmltKCk7XG5cbiAgICAgICAgdmFyIGFpZCA9ICRyZWFkQnRuLmRhdGEoJ2FydGljbGUnKTtcbiAgICAgICAgdmFyIHVybCA9ICRyZWFkQnRuLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgdmFyIHRpdGxlID0gJHJlYWRCdG4uZGF0YSgndGl0bGUnKTtcblxuICAgICAgICBmdW5jdGlvbiBfc2V0U2Nyb2xsVG9wKCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgPSAkdGhpc0NhcmQub2Zmc2V0KCkudG9wIC0gNDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBsZXQgX3Njcm9sbFRvcFBvcyA9IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wXG5cbiAgICAgICAgZnVuY3Rpb24gc2V0SG9tZVN0YXRlKF9kKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhfZClcblxuICAgICAgICAgICAgY29tbWVudC5kZXN0cm95Q29tbWVudCgpO1xuXG4gICAgICAgICAgICAkY2FyZC5yZW1vdmVDbGFzcygnY2FyZF9oaWRlJyk7XG4gICAgICAgICAgICAkY29udGVudC5yZW1vdmVDbGFzcygnY29udGVudF9mdWxsJyk7XG4gICAgICAgICAgICAvLyAkdGhpc0Z1bGwuY3NzKHsnaGVpZ2h0JzogJ2F1dG8nfSkgICAgICAgICAgIFxuXG4gICAgICAgICAgICAkcGFnaW5hdGlvbi5yZW1vdmVDbGFzcygnaGlkZScpO1xuXG4gICAgICAgICAgICAkcmVhZEJ0bi5odG1sKCfpmIXor7vlhajmlocnKTtcbiAgICAgICAgICAgIHZhciBuYXYgPSAkcmVhZEJ0bi5kYXRhKCduYXYnKTtcbiAgICAgICAgICAgICgwLCBfaGVhZGVyLmxvY2F0ZSkobmF2KTtcblxuICAgICAgICAgICAgJHJlYWRCdG4uZGF0YSgnbmF2JywgJHJlYWRCdG4uZGF0YSgndHlwZScpKTtcblxuICAgICAgICAgICAgZGVzdHJveVZpZXdlcigkZnVsbCk7XG5cbiAgICAgICAgICAgIC8vcmVzdG9yZSBzY3JvbGxUb3BcbiAgICAgICAgICAgIC8vIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gX3Njcm9sbFRvcFBvc1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0QXJ0aWNsZVN0YXRlKCkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAZGVidWdcbiAgICAgICAgICAgICAqIENocm9tZeWumuS9jUJVR++8jCDph43lpI3nrKzkuozmrKHmk43kvZzvvIznrKzkuozmrKHngrnlh7tb6ZiF6K+75YWo5paHXe+8jGpz6K6+572u5a655Zmo6auY5bqm5ZCO77yMc2Nyb2xsVG9w5Lya5peg5pWF5Y+Y5Yqo77yMXG4gICAgICAgICAgICAgKiBTYWZhcmnmraPluLhcbiAgICAgICAgICAgICAqIOino+WGs+aWueW8j++8muWFiOaTjeS9nOmrmOW6pu+8jOWGjeaTjeS9nHNjcm9sbFRvcO+8jOW5tuS4lOemgeatomhlaWdodOWKqOeUu1xuICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICRjYXJkLm5vdCgkdGhpc0NhcmQpLmFkZENsYXNzKCdjYXJkX2hpZGUnKTtcbiAgICAgICAgICAgIC8vIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID0gMzIwXG5cbiAgICAgICAgICAgIC8vc2V0IGhlaWdodFxuICAgICAgICAgICAgJGNvbnRlbnQuYWRkQ2xhc3MoJ2NvbnRlbnRfZnVsbCcpO1xuICAgICAgICAgICAgLy8gJHRoaXNGdWxsLmNzcyh7J2hlaWdodCc6IDB9KVxuXG4gICAgICAgICAgICAvLyBzZXRUaW1lb3V0KCgpPT57XG5cbiAgICAgICAgICAgIC8vICR0aGlzRnVsbC5jc3MoeydoZWlnaHQnOiBjX2hlaWdodH0pXG5cbiAgICAgICAgICAgICRwYWdpbmF0aW9uLmFkZENsYXNzKCdoaWRlJyk7XG5cbiAgICAgICAgICAgICRyZWFkQnRuLmh0bWwoJ+i/lOWbnuS4iuWxgicpO1xuXG4gICAgICAgICAgICAvL3NldCBuYXYgYWN0aXZlIG1lbnVcbiAgICAgICAgICAgIHZhciBuYXYgPSAkcmVhZEJ0bi5kYXRhKCduYXYnKTtcbiAgICAgICAgICAgIC8vIGxvY2F0ZShuYXYpXG4gICAgICAgICAgICAoMCwgX2hlYWRlci5sb2NhdGUpKCdBUlRJQ0xFJyk7XG5cbiAgICAgICAgICAgICRyZWFkQnRuLmRhdGEoJ25hdicsICdob21lJyk7XG4gICAgICAgICAgICAvL3NldCB2aWV3ZXJcbiAgICAgICAgICAgIGluaXRWaWV3ZXIoJGZ1bGwpO1xuXG4gICAgICAgICAgICBpbml0SGlnaGxpZ2h0KCRmdWxsLmZpbmQoJ3ByZSBjb2RlJykpO1xuXG4gICAgICAgICAgICBjb21tZW50LmxvYWRDb21tZW50KF9zZXRTY3JvbGxUb3ApO1xuXG4gICAgICAgICAgICAkZnVsbC5maW5kKFwiaW1nXCIpLm9uZSgnbG9hZCcsIF9zZXRTY3JvbGxUb3ApLm9uZSgnZXJyb3InLCBfc2V0U2Nyb2xsVG9wKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDlpoLmnpzopoHorr7nva4gc2Nyb2xsVG9wLCDnoa7kv53ov5nkuKrmk43kvZxET03lm57mtYFcbiAgICAgICAgICAgICAqIOaIluWPmOWMluS5i+WQjuaJp+ihjCwg5q+U5aaC5q2k5aSEbG9hZENvbW1lbnTlnKjkuYvliY3miafooYznmoRcbiAgICAgICAgICAgICAqIOS8muWvvOiHtOWQjuacn0RPTeWPmOWMlu+8jFxuICAgICAgICAgICAgICog57uT5p6c5ZyoQ2hyb21l5Lit77yMIGJvZHkuc2Nyb2xsVG9w55qE5pWw5YC85Y+Y5YyW5LqG44CCXG4gICAgICAgICAgICAgKiBTYWZhcmnkuI3lj5jljJbvvIzkuI3lvbHlk41ib2R5LnNjcm9sbFRvcOeahOaVsOWAvFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIOaJgOS7peS4iumdou+8jOa3u+WKoOWIsOWbnuiwg+WHveaVsOS4re+8jOehruS/nXNjcm9sbFRvcOeahOWAvOWcqERPTeWujOaIkOS5i+WQjuaJp+ihjFxuICAgICAgICAgICAgICog5ZCM5pe277yM5a+55LqO5paH56ug5Lit5pyJ5Zu+54mH55qE77yM55Sx5LqOaW1nIGxvYWTkuZ/mmK/lvILmraXnmoTvvIzmiYDku6XkuZ/kvJpcbiAgICAgICAgICAgICAqIOWvvOiHtOWQjOagt+mXrumimFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAvLyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA9ICR0aGlzQ2FyZC5vZmZzZXQoKS50b3AgLSA0MFxuICAgICAgICAgICAgLyphbGVydCgnc2Nyb2xsVG9wIFNldDogJytkb2N1bWVudC5ib2R5LnNjcm9sbFRvcClcbiAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAgICAgICAgIGFsZXJ0KGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wKVxuICAgICAgICAgICAgfSwgMTAwMCkqL1xuXG4gICAgICAgICAgICAvLyB9KVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX3JlZjIocmVzKSB7XG4gICAgICAgICAgICB2YXIgJGZyYWdtZW50X2NhcmQgPSAkKHJlcyk7XG4gICAgICAgICAgICAkZnVsbC5odG1sKCRmcmFnbWVudF9jYXJkLmZpbmQoJy5mdWxsJykuaHRtbCgpKTtcbiAgICAgICAgICAgIHNldEFydGljbGVTdGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJ0blRleHQgPT0gJ+mYheivu+WFqOaWhycpIHtcbiAgICAgICAgICAgIC8v5Lul5LiL5Y+q6L+b6KGM5LiA5qyhIOWIneWni+WMluWOhuWPsuWghuagiO+8jOaYr+mUmeivr+eahFxuICAgICAgICAgICAgLypfc3RhdGVJbml0ZWQgPyBcbiAgICAgICAgICAgICAgICAnJyA6IFxuICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgTU8uc3RhdGUoJy8nLCBkb2N1bWVudC50aXRsZSwgc2V0SG9tZVN0YXRlKSwgXG4gICAgICAgICAgICAgICAgICAgIF9zdGF0ZUluaXRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICApKi9cbiAgICAgICAgICAgIC8v5aaC5p6c5q2k5pe277yM5LiN6YeN5pawcmVwbGFjZVN0YXRlLOmCo+S5iOa1j+iniOWZqOWghuagiO+8jOS/neWtmOeahOi/mOaYr+esrOS4gOasoeeahOaTjeS9nOWSjOaVsOaNru+8jOayoeacieabtOaWsO+8jOWboOS4unBvcOWHuuadpeeahO+8jOaAu+aYr+esrOS4gOasoeeahFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBkZWJ1Z1xuICAgICAgICAgICAgICog6I635Y+W5LiA5Liq5Yid5aeL54q25oCBXG4gICAgICAgICAgICAgKiDlpoLmnpzkuI3ojrflj5bliJ3lp4vnirbmgIHvvIzpgqPkuYhoaXN0b3J5LmJhY2soKeeahOaXtuWAme+8jFxuICAgICAgICAgICAgICog5Y+q6IO96I635b6Xc3RhdGXkuLp1bmRlZmluZWQs6YKj5LmI5L2g5LiN55+l6YGT5aaC5p6c5Y675oGi5aSN546w5Zy677yMXG4gICAgICAgICAgICAgKiDmiYDku6Xmr4/mrKHmk43kvZzliY1yZXBsYWNlU3RhdGXvvIzog73lpJ/kv53lrZjmk43kvZzliY3nmoTkuIDkupvmlbDmja7vvIxcbiAgICAgICAgICAgICAqIOS7juiAjGJhY2vnmoTml7blgJnog73ov5jljp9cbiAgICAgICAgICAgICAqIG51bGzkvY3nva7mmK/kvKDnu5lzZXRIb21lU3RhdGXnmoRkYXRh77yMXG4gICAgICAgICAgICAgKiDlpoLmnpzkuI3kvKDmiJbogIXkvKDlhaV1bmRlZmluZWTvvIzpgqPkuYjkuI3nvJPlrZjvvIx0b3VjaOi/mOS8muWPkei1t+ivt+axglxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAvLyBNTy5zdGF0ZSgnLycsIGRvY3VtZW50LnRpdGxlLCBzZXRIb21lU3RhdGUsIG51bGwpXG4gICAgICAgICAgICBNTy5zdGF0ZShsb2NhdGlvbi5wYXRobmFtZSwgZG9jdW1lbnQudGl0bGUsIHNldEhvbWVTdGF0ZSk7XG4gICAgICAgICAgICAvKi50aGVuKHJlcz0+e1xuICAgICAgICAgICAgICAgIHNldEhvbWVTdGF0ZShyZXMpXG4gICAgICAgICAgICB9KSovXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog5YW25a6e5q2k5pe255qEcHVzaFN0YXRlLOaYr+WvueS4i+S4quW9k+WJjeeKtuaAgeeahOS/neWtmO+8jOS4jeaYr+WvueS5i+WJjeeKtuaAgeeahOS/ruaUueOAguS5n+WwseaYr+aTjeS9nOS5i+WQjueahOeKtuaAge+8jOWQjOatpee7mea1j+iniOWZqOeahGhpc3Rvcnkuc3RhdGVcbiAgICAgICAgICAgICAqICEhIeaJgOS7pe+8jOS7juS4iuS4queKtuaAge+8jGJhY2vnmoTml7blgJnvvIzmmK/ljrvnjrDlnKjnmoTnirbmgIHvvIzkuZ/lsLHmmK9wdXNoU3RhdGXkuYvliY3nmoRzdGF0ZeeKtuaAge+8ge+8ge+8geiAjOi/meS4queKtuaAge+8jOaYr+S7juesrOS4gOasoeeCueWHu+eahOaXtuWAmeS6p+eUn+eahO+8jOWmguaenOS4jeabtOaWsHJlcGxhY2VTdGF0ZSzpgqPkuYjmsLjov5zmmK/nrKzkuIDmrKHnmoTmlbDmja7vvIxzZXRBcnRpY2xlU3RhdGXnmoTlj5jph4/kuZ/mmK/nrKzkuIDmrKHnmoTvvIxyZWFkQnRu6L+Y5piv56ys5LiA5qyh54K55Ye755qE5paH56ug55qE5oyJ6ZKu77yB77yB5omA5Lul5q+P5qyh54K55Ye76ZiF6K+75YWo5paH77yM6YO95pu05paw5LiA5LiLXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgLy8gdHJ5e1xuICAgICAgICAgICAgTU8udG91Y2godXJsLCB0aXRsZSwgX3JlZjIpO1xuICAgICAgICAgICAgLy8gfWNhdGNoKGVycil7Y29uc29sZS5lcnJvcihlcnIpfVxuICAgICAgICAgICAgLyoudGhlbigocmVzKT0+e1xuICAgICAgICAgICAgICAgIGxldCAkZnJhZ21lbnRfY2FyZCA9ICQocmVzKVxuICAgICAgICAgICAgICAgICRmdWxsLmh0bWwoJGZyYWdtZW50X2NhcmQuZmluZCgnLmZ1bGwnKS5odG1sKCkpXG4gICAgICAgICAgICAgICAgc2V0QXJ0aWNsZVN0YXRlKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyPT57XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgICAgICAgfSkqL1xuICAgICAgICAgICAgLy/ov5nnp43mlrnlvI/mnInkuKrpl67popjvvIzml6Dms5Xkv53lrZjkvKDlhaV0aGVu55qE5Ye95pWw5YiwbW9fZXZlbnRz5p2l57yT5a2Y6LW35p2l77yM6L+Z5qC35a+86Ie06LCD55SodG91Y2jlkI7vvIzlvZPlhbZwb3BldmVudOWPkeeUn+aXtu+8jOaXoOazleinpuWPkeWJjei/m+OAgeWQjumAgOeahOaXtumXtFxuICAgICAgICB9IGVsc2UgaWYgKGJ0blRleHQgPT0gJ+i/lOWbnuS4iuWxgicpIHtcblxuICAgICAgICAgICAgICAgIGhpc3RvcnkuYmFjaygpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKCdVbmtub3cgQnV0dG9uIFRleHQ6ICcgKyBidG5UZXh0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAvL3N0b3AgcHJvcGFnYXRpb24gYW5kIGRlZmF1bHQgYmVoYXZpb3JcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIEJhbm5lciBBbmltYXRpb25cbiAqIEByZXR1cm4ge1t0eXBlXX0gW2Rlc2NyaXB0aW9uXVxuICovXG5cbi8qZnVuY3Rpb24gZmx5QW5pbWF0aW9uKCl7XG4gICAgc2V0VGltZW91dCgoKSA9PntcbiAgICAgICAgZmx5LnN0YXJ0KClcbiAgICB9LCAxMDAwKVxufSovXG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIGluaXRFdmVudCgpO1xuICAgIGNvbW1lbnQuaW5pdENvbW1lbnQoKTtcbiAgICAvLyBmbHlBbmltYXRpb24oKVxufSk7IiwiIWZ1bmN0aW9uKGUpe2ZhbHNlP2UoZXhwb3J0cyk6KHdpbmRvdy5obGpzPWUoe30pLGZhbHNlJiZkZWZpbmUuYW1kJiZkZWZpbmUoXCJobGpzXCIsW10sZnVuY3Rpb24oKXtyZXR1cm4gd2luZG93LmhsanN9KSl9KGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoZSl7cmV0dXJuIGUucmVwbGFjZSgvJi9nbSxcIiZhbXA7XCIpLnJlcGxhY2UoLzwvZ20sXCImbHQ7XCIpLnJlcGxhY2UoLz4vZ20sXCImZ3Q7XCIpfWZ1bmN0aW9uIHIoZSl7cmV0dXJuIGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKX1mdW5jdGlvbiBhKGUsdCl7dmFyIHI9ZSYmZS5leGVjKHQpO3JldHVybiByJiYwPT1yLmluZGV4fWZ1bmN0aW9uIG4oZSl7cmV0dXJuL14obm8tP2hpZ2hsaWdodHxwbGFpbnx0ZXh0KSQvaS50ZXN0KGUpfWZ1bmN0aW9uIGkoZSl7dmFyIHQscixhLGk9ZS5jbGFzc05hbWUrXCIgXCI7aWYoaSs9ZS5wYXJlbnROb2RlP2UucGFyZW50Tm9kZS5jbGFzc05hbWU6XCJcIixyPS9cXGJsYW5nKD86dWFnZSk/LShbXFx3LV0rKVxcYi9pLmV4ZWMoaSkpcmV0dXJuIHkoclsxXSk/clsxXTpcIm5vLWhpZ2hsaWdodFwiO2ZvcihpPWkuc3BsaXQoL1xccysvKSx0PTAsYT1pLmxlbmd0aDthPnQ7dCsrKWlmKHkoaVt0XSl8fG4oaVt0XSkpcmV0dXJuIGlbdF19ZnVuY3Rpb24gcyhlLHQpe3ZhciByLGE9e307Zm9yKHIgaW4gZSlhW3JdPWVbcl07aWYodClmb3IociBpbiB0KWFbcl09dFtyXTtyZXR1cm4gYX1mdW5jdGlvbiBjKGUpe3ZhciB0PVtdO3JldHVybiBmdW5jdGlvbiBhKGUsbil7Zm9yKHZhciBpPWUuZmlyc3RDaGlsZDtpO2k9aS5uZXh0U2libGluZykzPT1pLm5vZGVUeXBlP24rPWkubm9kZVZhbHVlLmxlbmd0aDoxPT1pLm5vZGVUeXBlJiYodC5wdXNoKHtldmVudDpcInN0YXJ0XCIsb2Zmc2V0Om4sbm9kZTppfSksbj1hKGksbikscihpKS5tYXRjaCgvYnJ8aHJ8aW1nfGlucHV0Lyl8fHQucHVzaCh7ZXZlbnQ6XCJzdG9wXCIsb2Zmc2V0Om4sbm9kZTppfSkpO3JldHVybiBufShlLDApLHR9ZnVuY3Rpb24gbyhlLGEsbil7ZnVuY3Rpb24gaSgpe3JldHVybiBlLmxlbmd0aCYmYS5sZW5ndGg/ZVswXS5vZmZzZXQhPWFbMF0ub2Zmc2V0P2VbMF0ub2Zmc2V0PGFbMF0ub2Zmc2V0P2U6YTpcInN0YXJ0XCI9PWFbMF0uZXZlbnQ/ZTphOmUubGVuZ3RoP2U6YX1mdW5jdGlvbiBzKGUpe2Z1bmN0aW9uIGEoZSl7cmV0dXJuXCIgXCIrZS5ub2RlTmFtZSsnPVwiJyt0KGUudmFsdWUpKydcIid9dSs9XCI8XCIrcihlKStBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoZS5hdHRyaWJ1dGVzLGEpLmpvaW4oXCJcIikrXCI+XCJ9ZnVuY3Rpb24gYyhlKXt1Kz1cIjwvXCIrcihlKStcIj5cIn1mdW5jdGlvbiBvKGUpeyhcInN0YXJ0XCI9PWUuZXZlbnQ/czpjKShlLm5vZGUpfWZvcih2YXIgbD0wLHU9XCJcIixkPVtdO2UubGVuZ3RofHxhLmxlbmd0aDspe3ZhciBiPWkoKTtpZih1Kz10KG4uc3Vic3RyKGwsYlswXS5vZmZzZXQtbCkpLGw9YlswXS5vZmZzZXQsYj09ZSl7ZC5yZXZlcnNlKCkuZm9yRWFjaChjKTtkbyBvKGIuc3BsaWNlKDAsMSlbMF0pLGI9aSgpO3doaWxlKGI9PWUmJmIubGVuZ3RoJiZiWzBdLm9mZnNldD09bCk7ZC5yZXZlcnNlKCkuZm9yRWFjaChzKX1lbHNlXCJzdGFydFwiPT1iWzBdLmV2ZW50P2QucHVzaChiWzBdLm5vZGUpOmQucG9wKCksbyhiLnNwbGljZSgwLDEpWzBdKX1yZXR1cm4gdSt0KG4uc3Vic3RyKGwpKX1mdW5jdGlvbiBsKGUpe2Z1bmN0aW9uIHQoZSl7cmV0dXJuIGUmJmUuc291cmNlfHxlfWZ1bmN0aW9uIHIocixhKXtyZXR1cm4gbmV3IFJlZ0V4cCh0KHIpLFwibVwiKyhlLmNJP1wiaVwiOlwiXCIpKyhhP1wiZ1wiOlwiXCIpKX1mdW5jdGlvbiBhKG4saSl7aWYoIW4uY29tcGlsZWQpe2lmKG4uY29tcGlsZWQ9ITAsbi5rPW4ua3x8bi5iSyxuLmspe3ZhciBjPXt9LG89ZnVuY3Rpb24odCxyKXtlLmNJJiYocj1yLnRvTG93ZXJDYXNlKCkpLHIuc3BsaXQoXCIgXCIpLmZvckVhY2goZnVuY3Rpb24oZSl7dmFyIHI9ZS5zcGxpdChcInxcIik7Y1tyWzBdXT1bdCxyWzFdP051bWJlcihyWzFdKToxXX0pfTtcInN0cmluZ1wiPT10eXBlb2Ygbi5rP28oXCJrZXl3b3JkXCIsbi5rKTpPYmplY3Qua2V5cyhuLmspLmZvckVhY2goZnVuY3Rpb24oZSl7byhlLG4ua1tlXSl9KSxuLms9Y31uLmxSPXIobi5sfHwvXFxiXFx3K1xcYi8sITApLGkmJihuLmJLJiYobi5iPVwiXFxcXGIoXCIrbi5iSy5zcGxpdChcIiBcIikuam9pbihcInxcIikrXCIpXFxcXGJcIiksbi5ifHwobi5iPS9cXEJ8XFxiLyksbi5iUj1yKG4uYiksbi5lfHxuLmVXfHwobi5lPS9cXEJ8XFxiLyksbi5lJiYobi5lUj1yKG4uZSkpLG4udEU9dChuLmUpfHxcIlwiLG4uZVcmJmkudEUmJihuLnRFKz0obi5lP1wifFwiOlwiXCIpK2kudEUpKSxuLmkmJihuLmlSPXIobi5pKSksdm9pZCAwPT09bi5yJiYobi5yPTEpLG4uY3x8KG4uYz1bXSk7dmFyIGw9W107bi5jLmZvckVhY2goZnVuY3Rpb24oZSl7ZS52P2Uudi5mb3JFYWNoKGZ1bmN0aW9uKHQpe2wucHVzaChzKGUsdCkpfSk6bC5wdXNoKFwic2VsZlwiPT1lP246ZSl9KSxuLmM9bCxuLmMuZm9yRWFjaChmdW5jdGlvbihlKXthKGUsbil9KSxuLnN0YXJ0cyYmYShuLnN0YXJ0cyxpKTt2YXIgdT1uLmMubWFwKGZ1bmN0aW9uKGUpe3JldHVybiBlLmJLP1wiXFxcXC4/KFwiK2UuYitcIilcXFxcLj9cIjplLmJ9KS5jb25jYXQoW24udEUsbi5pXSkubWFwKHQpLmZpbHRlcihCb29sZWFuKTtuLnQ9dS5sZW5ndGg/cih1LmpvaW4oXCJ8XCIpLCEwKTp7ZXhlYzpmdW5jdGlvbigpe3JldHVybiBudWxsfX19fWEoZSl9ZnVuY3Rpb24gdShlLHIsbixpKXtmdW5jdGlvbiBzKGUsdCl7Zm9yKHZhciByPTA7cjx0LmMubGVuZ3RoO3IrKylpZihhKHQuY1tyXS5iUixlKSlyZXR1cm4gdC5jW3JdfWZ1bmN0aW9uIGMoZSx0KXtpZihhKGUuZVIsdCkpe2Zvcig7ZS5lbmRzUGFyZW50JiZlLnBhcmVudDspZT1lLnBhcmVudDtyZXR1cm4gZX1yZXR1cm4gZS5lVz9jKGUucGFyZW50LHQpOnZvaWQgMH1mdW5jdGlvbiBvKGUsdCl7cmV0dXJuIW4mJmEodC5pUixlKX1mdW5jdGlvbiBiKGUsdCl7dmFyIHI9di5jST90WzBdLnRvTG93ZXJDYXNlKCk6dFswXTtyZXR1cm4gZS5rLmhhc093blByb3BlcnR5KHIpJiZlLmtbcl19ZnVuY3Rpb24gcChlLHQscixhKXt2YXIgbj1hP1wiXCI6dy5jbGFzc1ByZWZpeCxpPSc8c3BhbiBjbGFzcz1cIicrbixzPXI/XCJcIjpcIjwvc3Bhbj5cIjtyZXR1cm4gaSs9ZSsnXCI+JyxpK3Qrc31mdW5jdGlvbiBtKCl7aWYoIXguaylyZXR1cm4gdChFKTt2YXIgZT1cIlwiLHI9MDt4LmxSLmxhc3RJbmRleD0wO2Zvcih2YXIgYT14LmxSLmV4ZWMoRSk7YTspe2UrPXQoRS5zdWJzdHIocixhLmluZGV4LXIpKTt2YXIgbj1iKHgsYSk7bj8oQis9blsxXSxlKz1wKG5bMF0sdChhWzBdKSkpOmUrPXQoYVswXSkscj14LmxSLmxhc3RJbmRleCxhPXgubFIuZXhlYyhFKX1yZXR1cm4gZSt0KEUuc3Vic3RyKHIpKX1mdW5jdGlvbiBmKCl7dmFyIGU9XCJzdHJpbmdcIj09dHlwZW9mIHguc0w7aWYoZSYmIU5beC5zTF0pcmV0dXJuIHQoRSk7dmFyIHI9ZT91KHguc0wsRSwhMCxDW3guc0xdKTpkKEUseC5zTC5sZW5ndGg/eC5zTDp2b2lkIDApO3JldHVybiB4LnI+MCYmKEIrPXIuciksZSYmKENbeC5zTF09ci50b3ApLHAoci5sYW5ndWFnZSxyLnZhbHVlLCExLCEwKX1mdW5jdGlvbiBnKCl7cmV0dXJuIHZvaWQgMCE9PXguc0w/ZigpOm0oKX1mdW5jdGlvbiBoKGUscil7dmFyIGE9ZS5jTj9wKGUuY04sXCJcIiwhMCk6XCJcIjtlLnJCPyhNKz1hLEU9XCJcIik6ZS5lQj8oTSs9dChyKSthLEU9XCJcIik6KE0rPWEsRT1yKSx4PU9iamVjdC5jcmVhdGUoZSx7cGFyZW50Ont2YWx1ZTp4fX0pfWZ1bmN0aW9uIF8oZSxyKXtpZihFKz1lLHZvaWQgMD09PXIpcmV0dXJuIE0rPWcoKSwwO3ZhciBhPXMocix4KTtpZihhKXJldHVybiBNKz1nKCksaChhLHIpLGEuckI/MDpyLmxlbmd0aDt2YXIgbj1jKHgscik7aWYobil7dmFyIGk9eDtpLnJFfHxpLmVFfHwoRSs9ciksTSs9ZygpO2RvIHguY04mJihNKz1cIjwvc3Bhbj5cIiksQis9eC5yLHg9eC5wYXJlbnQ7d2hpbGUoeCE9bi5wYXJlbnQpO3JldHVybiBpLmVFJiYoTSs9dChyKSksRT1cIlwiLG4uc3RhcnRzJiZoKG4uc3RhcnRzLFwiXCIpLGkuckU/MDpyLmxlbmd0aH1pZihvKHIseCkpdGhyb3cgbmV3IEVycm9yKCdJbGxlZ2FsIGxleGVtZSBcIicrcisnXCIgZm9yIG1vZGUgXCInKyh4LmNOfHxcIjx1bm5hbWVkPlwiKSsnXCInKTtyZXR1cm4gRSs9cixyLmxlbmd0aHx8MX12YXIgdj15KGUpO2lmKCF2KXRocm93IG5ldyBFcnJvcignVW5rbm93biBsYW5ndWFnZTogXCInK2UrJ1wiJyk7bCh2KTt2YXIgayx4PWl8fHYsQz17fSxNPVwiXCI7Zm9yKGs9eDtrIT12O2s9ay5wYXJlbnQpay5jTiYmKE09cChrLmNOLFwiXCIsITApK00pO3ZhciBFPVwiXCIsQj0wO3RyeXtmb3IodmFyICQseixMPTA7Oyl7aWYoeC50Lmxhc3RJbmRleD1MLCQ9eC50LmV4ZWMociksISQpYnJlYWs7ej1fKHIuc3Vic3RyKEwsJC5pbmRleC1MKSwkWzBdKSxMPSQuaW5kZXgren1mb3IoXyhyLnN1YnN0cihMKSksaz14O2sucGFyZW50O2s9ay5wYXJlbnQpay5jTiYmKE0rPVwiPC9zcGFuPlwiKTtyZXR1cm57cjpCLHZhbHVlOk0sbGFuZ3VhZ2U6ZSx0b3A6eH19Y2F0Y2gocSl7aWYoLTEhPXEubWVzc2FnZS5pbmRleE9mKFwiSWxsZWdhbFwiKSlyZXR1cm57cjowLHZhbHVlOnQocil9O3Rocm93IHF9fWZ1bmN0aW9uIGQoZSxyKXtyPXJ8fHcubGFuZ3VhZ2VzfHxPYmplY3Qua2V5cyhOKTt2YXIgYT17cjowLHZhbHVlOnQoZSl9LG49YTtyZXR1cm4gci5mb3JFYWNoKGZ1bmN0aW9uKHQpe2lmKHkodCkpe3ZhciByPXUodCxlLCExKTtyLmxhbmd1YWdlPXQsci5yPm4uciYmKG49ciksci5yPmEuciYmKG49YSxhPXIpfX0pLG4ubGFuZ3VhZ2UmJihhLnNlY29uZF9iZXN0PW4pLGF9ZnVuY3Rpb24gYihlKXtyZXR1cm4gdy50YWJSZXBsYWNlJiYoZT1lLnJlcGxhY2UoL14oKDxbXj5dKz58XFx0KSspL2dtLGZ1bmN0aW9uKGUsdCl7cmV0dXJuIHQucmVwbGFjZSgvXFx0L2csdy50YWJSZXBsYWNlKX0pKSx3LnVzZUJSJiYoZT1lLnJlcGxhY2UoL1xcbi9nLFwiPGJyPlwiKSksZX1mdW5jdGlvbiBwKGUsdCxyKXt2YXIgYT10P2tbdF06cixuPVtlLnRyaW0oKV07cmV0dXJuIGUubWF0Y2goL1xcYmhsanNcXGIvKXx8bi5wdXNoKFwiaGxqc1wiKSwtMT09PWUuaW5kZXhPZihhKSYmbi5wdXNoKGEpLG4uam9pbihcIiBcIikudHJpbSgpfWZ1bmN0aW9uIG0oZSl7dmFyIHQ9aShlKTtpZighbih0KSl7dmFyIHI7dy51c2VCUj8ocj1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXCJkaXZcIiksci5pbm5lckhUTUw9ZS5pbm5lckhUTUwucmVwbGFjZSgvXFxuL2csXCJcIikucmVwbGFjZSgvPGJyWyBcXC9dKj4vZyxcIlxcblwiKSk6cj1lO3ZhciBhPXIudGV4dENvbnRlbnQscz10P3UodCxhLCEwKTpkKGEpLGw9YyhyKTtpZihsLmxlbmd0aCl7dmFyIG09ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFwiZGl2XCIpO20uaW5uZXJIVE1MPXMudmFsdWUscy52YWx1ZT1vKGwsYyhtKSxhKX1zLnZhbHVlPWIocy52YWx1ZSksZS5pbm5lckhUTUw9cy52YWx1ZSxlLmNsYXNzTmFtZT1wKGUuY2xhc3NOYW1lLHQscy5sYW5ndWFnZSksZS5yZXN1bHQ9e2xhbmd1YWdlOnMubGFuZ3VhZ2UscmU6cy5yfSxzLnNlY29uZF9iZXN0JiYoZS5zZWNvbmRfYmVzdD17bGFuZ3VhZ2U6cy5zZWNvbmRfYmVzdC5sYW5ndWFnZSxyZTpzLnNlY29uZF9iZXN0LnJ9KX19ZnVuY3Rpb24gZihlKXt3PXModyxlKX1mdW5jdGlvbiBnKCl7aWYoIWcuY2FsbGVkKXtnLmNhbGxlZD0hMDt2YXIgZT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwicHJlIGNvZGVcIik7QXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChlLG0pfX1mdW5jdGlvbiBoKCl7YWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixnLCExKSxhZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLGcsITEpfWZ1bmN0aW9uIF8odCxyKXt2YXIgYT1OW3RdPXIoZSk7YS5hbGlhc2VzJiZhLmFsaWFzZXMuZm9yRWFjaChmdW5jdGlvbihlKXtrW2VdPXR9KX1mdW5jdGlvbiB2KCl7cmV0dXJuIE9iamVjdC5rZXlzKE4pfWZ1bmN0aW9uIHkoZSl7cmV0dXJuIGU9KGV8fFwiXCIpLnRvTG93ZXJDYXNlKCksTltlXXx8TltrW2VdXX12YXIgdz17Y2xhc3NQcmVmaXg6XCJobGpzLVwiLHRhYlJlcGxhY2U6bnVsbCx1c2VCUjohMSxsYW5ndWFnZXM6dm9pZCAwfSxOPXt9LGs9e307cmV0dXJuIGUuaGlnaGxpZ2h0PXUsZS5oaWdobGlnaHRBdXRvPWQsZS5maXhNYXJrdXA9YixlLmhpZ2hsaWdodEJsb2NrPW0sZS5jb25maWd1cmU9ZixlLmluaXRIaWdobGlnaHRpbmc9ZyxlLmluaXRIaWdobGlnaHRpbmdPbkxvYWQ9aCxlLnJlZ2lzdGVyTGFuZ3VhZ2U9XyxlLmxpc3RMYW5ndWFnZXM9dixlLmdldExhbmd1YWdlPXksZS5pbmhlcml0PXMsZS5JUj1cIlthLXpBLVpdXFxcXHcqXCIsZS5VSVI9XCJbYS16QS1aX11cXFxcdypcIixlLk5SPVwiXFxcXGJcXFxcZCsoXFxcXC5cXFxcZCspP1wiLGUuQ05SPVwiKFxcXFxiMFt4WF1bYS1mQS1GMC05XSt8KFxcXFxiXFxcXGQrKFxcXFwuXFxcXGQqKT98XFxcXC5cXFxcZCspKFtlRV1bLStdP1xcXFxkKyk/KVwiLGUuQk5SPVwiXFxcXGIoMGJbMDFdKylcIixlLlJTUj1cIiF8IT18IT09fCV8JT18JnwmJnwmPXxcXFxcKnxcXFxcKj18XFxcXCt8XFxcXCs9fCx8LXwtPXwvPXwvfDp8O3w8PHw8PD18PD18PHw9PT18PT18PXw+Pj49fD4+PXw+PXw+Pj58Pj58PnxcXFxcP3xcXFxcW3xcXFxce3xcXFxcKHxcXFxcXnxcXFxcXj18XFxcXHx8XFxcXHw9fFxcXFx8XFxcXHx8flwiLGUuQkU9e2I6XCJcXFxcXFxcXFtcXFxcc1xcXFxTXVwiLHI6MH0sZS5BU009e2NOOlwic3RyaW5nXCIsYjpcIidcIixlOlwiJ1wiLGk6XCJcXFxcblwiLGM6W2UuQkVdfSxlLlFTTT17Y046XCJzdHJpbmdcIixiOidcIicsZTonXCInLGk6XCJcXFxcblwiLGM6W2UuQkVdfSxlLlBXTT17YjovXFxiKGF8YW58dGhlfGFyZXxJfEknbXxpc24ndHxkb24ndHxkb2Vzbid0fHdvbid0fGJ1dHxqdXN0fHNob3VsZHxwcmV0dHl8c2ltcGx5fGVub3VnaHxnb25uYXxnb2luZ3x3dGZ8c298c3VjaHx3aWxsfHlvdXx5b3VyfGxpa2UpXFxiL30sZS5DPWZ1bmN0aW9uKHQscixhKXt2YXIgbj1lLmluaGVyaXQoe2NOOlwiY29tbWVudFwiLGI6dCxlOnIsYzpbXX0sYXx8e30pO3JldHVybiBuLmMucHVzaChlLlBXTSksbi5jLnB1c2goe2NOOlwiZG9jdGFnXCIsYjpcIig/OlRPRE98RklYTUV8Tk9URXxCVUd8WFhYKTpcIixyOjB9KSxufSxlLkNMQ009ZS5DKFwiLy9cIixcIiRcIiksZS5DQkNNPWUuQyhcIi9cXFxcKlwiLFwiXFxcXCovXCIpLGUuSENNPWUuQyhcIiNcIixcIiRcIiksZS5OTT17Y046XCJudW1iZXJcIixiOmUuTlIscjowfSxlLkNOTT17Y046XCJudW1iZXJcIixiOmUuQ05SLHI6MH0sZS5CTk09e2NOOlwibnVtYmVyXCIsYjplLkJOUixyOjB9LGUuQ1NTTk09e2NOOlwibnVtYmVyXCIsYjplLk5SK1wiKCV8ZW18ZXh8Y2h8cmVtfHZ3fHZofHZtaW58dm1heHxjbXxtbXxpbnxwdHxwY3xweHxkZWd8Z3JhZHxyYWR8dHVybnxzfG1zfEh6fGtIenxkcGl8ZHBjbXxkcHB4KT9cIixyOjB9LGUuUk09e2NOOlwicmVnZXhwXCIsYjovXFwvLyxlOi9cXC9bZ2ltdXldKi8saTovXFxuLyxjOltlLkJFLHtiOi9cXFsvLGU6L1xcXS8scjowLGM6W2UuQkVdfV19LGUuVE09e2NOOlwidGl0bGVcIixiOmUuSVIscjowfSxlLlVUTT17Y046XCJ0aXRsZVwiLGI6ZS5VSVIscjowfSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJhcGFjaGVcIixmdW5jdGlvbihlKXt2YXIgdD17Y046XCJudW1iZXJcIixiOlwiW1xcXFwkJV1cXFxcZCtcIn07cmV0dXJue2FsaWFzZXM6W1wiYXBhY2hlY29uZlwiXSxjSTohMCxjOltlLkhDTSx7Y046XCJ0YWdcIixiOlwiPC8/XCIsZTpcIj5cIn0se2NOOlwia2V5d29yZFwiLGI6L1xcdysvLHI6MCxrOntjb21tb246XCJvcmRlciBkZW55IGFsbG93IHNldGVudiByZXdyaXRlcnVsZSByZXdyaXRlZW5naW5lIHJld3JpdGVjb25kIGRvY3VtZW50cm9vdCBzZXRoYW5kbGVyIGVycm9yZG9jdW1lbnQgbG9hZG1vZHVsZSBvcHRpb25zIGhlYWRlciBsaXN0ZW4gc2VydmVycm9vdCBzZXJ2ZXJuYW1lXCJ9LHN0YXJ0czp7ZTovJC8scjowLGs6e2xpdGVyYWw6XCJvbiBvZmYgYWxsXCJ9LGM6W3tjTjpcInNxYnJhY2tldFwiLGI6XCJcXFxcc1xcXFxbXCIsZTpcIlxcXFxdJFwifSx7Y046XCJjYnJhY2tldFwiLGI6XCJbXFxcXCQlXVxcXFx7XCIsZTpcIlxcXFx9XCIsYzpbXCJzZWxmXCIsdF19LHQsZS5RU01dfX1dLGk6L1xcUy99fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwiYmFzaFwiLGZ1bmN0aW9uKGUpe3ZhciB0PXtjTjpcInZhcmlhYmxlXCIsdjpbe2I6L1xcJFtcXHdcXGQjQF1bXFx3XFxkX10qL30se2I6L1xcJFxceyguKj8pfS99XX0scj17Y046XCJzdHJpbmdcIixiOi9cIi8sZTovXCIvLGM6W2UuQkUsdCx7Y046XCJ2YXJpYWJsZVwiLGI6L1xcJFxcKC8sZTovXFwpLyxjOltlLkJFXX1dfSxhPXtjTjpcInN0cmluZ1wiLGI6LycvLGU6LycvfTtyZXR1cm57YWxpYXNlczpbXCJzaFwiLFwienNoXCJdLGw6Ly0/W2EtelxcLl0rLyxrOntrZXl3b3JkOlwiaWYgdGhlbiBlbHNlIGVsaWYgZmkgZm9yIHdoaWxlIGluIGRvIGRvbmUgY2FzZSBlc2FjIGZ1bmN0aW9uXCIsbGl0ZXJhbDpcInRydWUgZmFsc2VcIixidWlsdF9pbjpcImJyZWFrIGNkIGNvbnRpbnVlIGV2YWwgZXhlYyBleGl0IGV4cG9ydCBnZXRvcHRzIGhhc2ggcHdkIHJlYWRvbmx5IHJldHVybiBzaGlmdCB0ZXN0IHRpbWVzIHRyYXAgdW1hc2sgdW5zZXQgYWxpYXMgYmluZCBidWlsdGluIGNhbGxlciBjb21tYW5kIGRlY2xhcmUgZWNobyBlbmFibGUgaGVscCBsZXQgbG9jYWwgbG9nb3V0IG1hcGZpbGUgcHJpbnRmIHJlYWQgcmVhZGFycmF5IHNvdXJjZSB0eXBlIHR5cGVzZXQgdWxpbWl0IHVuYWxpYXMgc2V0IHNob3B0IGF1dG9sb2FkIGJnIGJpbmRrZXkgYnllIGNhcCBjaGRpciBjbG9uZSBjb21wYXJndW1lbnRzIGNvbXBjYWxsIGNvbXBjdGwgY29tcGRlc2NyaWJlIGNvbXBmaWxlcyBjb21wZ3JvdXBzIGNvbXBxdW90ZSBjb21wdGFncyBjb21wdHJ5IGNvbXB2YWx1ZXMgZGlycyBkaXNhYmxlIGRpc293biBlY2hvdGMgZWNob3RpIGVtdWxhdGUgZmMgZmcgZmxvYXQgZnVuY3Rpb25zIGdldGNhcCBnZXRsbiBoaXN0b3J5IGludGVnZXIgam9icyBraWxsIGxpbWl0IGxvZyBub2dsb2IgcG9wZCBwcmludCBwdXNoZCBwdXNobG4gcmVoYXNoIHNjaGVkIHNldGNhcCBzZXRvcHQgc3RhdCBzdXNwZW5kIHR0eWN0bCB1bmZ1bmN0aW9uIHVuaGFzaCB1bmxpbWl0IHVuc2V0b3B0IHZhcmVkIHdhaXQgd2hlbmNlIHdoZXJlIHdoaWNoIHpjb21waWxlIHpmb3JtYXQgemZ0cCB6bGUgem1vZGxvYWQgenBhcnNlb3B0cyB6cHJvZiB6cHR5IHpyZWdleHBhcnNlIHpzb2NrZXQgenN0eWxlIHp0Y3BcIixvcGVyYXRvcjpcIi1uZSAtZXEgLWx0IC1ndCAtZiAtZCAtZSAtcyAtbCAtYVwifSxjOlt7Y046XCJzaGViYW5nXCIsYjovXiMhW15cXG5dK3NoXFxzKiQvLHI6MTB9LHtjTjpcImZ1bmN0aW9uXCIsYjovXFx3W1xcd1xcZF9dKlxccypcXChcXHMqXFwpXFxzKlxcey8sckI6ITAsYzpbZS5pbmhlcml0KGUuVE0se2I6L1xcd1tcXHdcXGRfXSovfSldLHI6MH0sZS5IQ00sZS5OTSxyLGEsdF19fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwiY29mZmVlc2NyaXB0XCIsZnVuY3Rpb24oZSl7dmFyIHQ9e2tleXdvcmQ6XCJpbiBpZiBmb3Igd2hpbGUgZmluYWxseSBuZXcgZG8gcmV0dXJuIGVsc2UgYnJlYWsgY2F0Y2ggaW5zdGFuY2VvZiB0aHJvdyB0cnkgdGhpcyBzd2l0Y2ggY29udGludWUgdHlwZW9mIGRlbGV0ZSBkZWJ1Z2dlciBzdXBlciB0aGVuIHVubGVzcyB1bnRpbCBsb29wIG9mIGJ5IHdoZW4gYW5kIG9yIGlzIGlzbnQgbm90XCIsbGl0ZXJhbDpcInRydWUgZmFsc2UgbnVsbCB1bmRlZmluZWQgeWVzIG5vIG9uIG9mZlwiLGJ1aWx0X2luOlwibnBtIHJlcXVpcmUgY29uc29sZSBwcmludCBtb2R1bGUgZ2xvYmFsIHdpbmRvdyBkb2N1bWVudFwifSxyPVwiW0EtWmEteiRfXVswLTlBLVphLXokX10qXCIsYT17Y046XCJzdWJzdFwiLGI6LyNcXHsvLGU6L30vLGs6dH0sbj1bZS5CTk0sZS5pbmhlcml0KGUuQ05NLHtzdGFydHM6e2U6XCIoXFxcXHMqLyk/XCIscjowfX0pLHtjTjpcInN0cmluZ1wiLHY6W3tiOi8nJycvLGU6LycnJy8sYzpbZS5CRV19LHtiOi8nLyxlOi8nLyxjOltlLkJFXX0se2I6L1wiXCJcIi8sZTovXCJcIlwiLyxjOltlLkJFLGFdfSx7YjovXCIvLGU6L1wiLyxjOltlLkJFLGFdfV19LHtjTjpcInJlZ2V4cFwiLHY6W3tiOlwiLy8vXCIsZTpcIi8vL1wiLGM6W2EsZS5IQ01dfSx7YjpcIi8vW2dpbV0qXCIscjowfSx7YjovXFwvKD8hWyAqXSkoXFxcXFxcL3wuKSo/XFwvW2dpbV0qKD89XFxXfCQpL31dfSx7Y046XCJwcm9wZXJ0eVwiLGI6XCJAXCIrcn0se2I6XCJgXCIsZTpcImBcIixlQjohMCxlRTohMCxzTDpcImphdmFzY3JpcHRcIn1dO2EuYz1uO3ZhciBpPWUuaW5oZXJpdChlLlRNLHtiOnJ9KSxzPVwiKFxcXFwoLipcXFxcKSk/XFxcXHMqXFxcXEJbLT1dPlwiLGM9e2NOOlwicGFyYW1zXCIsYjpcIlxcXFwoW15cXFxcKF1cIixyQjohMCxjOlt7YjovXFwoLyxlOi9cXCkvLGs6dCxjOltcInNlbGZcIl0uY29uY2F0KG4pfV19O3JldHVybnthbGlhc2VzOltcImNvZmZlZVwiLFwiY3NvblwiLFwiaWNlZFwiXSxrOnQsaTovXFwvXFwqLyxjOm4uY29uY2F0KFtlLkMoXCIjIyNcIixcIiMjI1wiKSxlLkhDTSx7Y046XCJmdW5jdGlvblwiLGI6XCJeXFxcXHMqXCIrcitcIlxcXFxzKj1cXFxccypcIitzLGU6XCJbLT1dPlwiLHJCOiEwLGM6W2ksY119LHtiOi9bOlxcKCw9XVxccyovLHI6MCxjOlt7Y046XCJmdW5jdGlvblwiLGI6cyxlOlwiWy09XT5cIixyQjohMCxjOltjXX1dfSx7Y046XCJjbGFzc1wiLGJLOlwiY2xhc3NcIixlOlwiJFwiLGk6L1s6PVwiXFxbXFxdXS8sYzpbe2JLOlwiZXh0ZW5kc1wiLGVXOiEwLGk6L1s6PVwiXFxbXFxdXS8sYzpbaV19LGldfSx7Y046XCJhdHRyaWJ1dGVcIixiOnIrXCI6XCIsZTpcIjpcIixyQjohMCxyRTohMCxyOjB9XSl9fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwiY3BwXCIsZnVuY3Rpb24oZSl7dmFyIHQ9e2NOOlwia2V5d29yZFwiLGI6XCJcXFxcYlthLXpcXFxcZF9dKl90XFxcXGJcIn0scj17Y046XCJzdHJpbmdcIix2OltlLmluaGVyaXQoZS5RU00se2I6JygodTg/fFUpfEwpP1wiJ30pLHtiOicodTg/fFUpP1JcIicsZTonXCInLGM6W2UuQkVdfSx7YjpcIidcXFxcXFxcXD8uXCIsZTpcIidcIixpOlwiLlwifV19LGE9e2NOOlwibnVtYmVyXCIsdjpbe2I6XCJcXFxcYihcXFxcZCsoXFxcXC5cXFxcZCopP3xcXFxcLlxcXFxkKykodXxVfGx8THx1bHxVTHxmfEYpXCJ9LHtiOmUuQ05SfV19LG49e2NOOlwicHJlcHJvY2Vzc29yXCIsYjpcIiNcIixlOlwiJFwiLGs6XCJpZiBlbHNlIGVsaWYgZW5kaWYgZGVmaW5lIHVuZGVmIHdhcm5pbmcgZXJyb3IgbGluZSBwcmFnbWEgaWZkZWYgaWZuZGVmXCIsYzpbe2I6L1xcXFxcXG4vLHI6MH0se2JLOlwiaW5jbHVkZVwiLGU6XCIkXCIsYzpbcix7Y046XCJzdHJpbmdcIixiOlwiPFwiLGU6XCI+XCIsaTpcIlxcXFxuXCJ9XX0scixhLGUuQ0xDTSxlLkNCQ01dfSxpPWUuSVIrXCJcXFxccypcXFxcKFwiLHM9e2tleXdvcmQ6XCJpbnQgZmxvYXQgd2hpbGUgcHJpdmF0ZSBjaGFyIGNhdGNoIGV4cG9ydCB2aXJ0dWFsIG9wZXJhdG9yIHNpemVvZiBkeW5hbWljX2Nhc3R8MTAgdHlwZWRlZiBjb25zdF9jYXN0fDEwIGNvbnN0IHN0cnVjdCBmb3Igc3RhdGljX2Nhc3R8MTAgdW5pb24gbmFtZXNwYWNlIHVuc2lnbmVkIGxvbmcgdm9sYXRpbGUgc3RhdGljIHByb3RlY3RlZCBib29sIHRlbXBsYXRlIG11dGFibGUgaWYgcHVibGljIGZyaWVuZCBkbyBnb3RvIGF1dG8gdm9pZCBlbnVtIGVsc2UgYnJlYWsgZXh0ZXJuIHVzaW5nIGNsYXNzIGFzbSBjYXNlIHR5cGVpZCBzaG9ydCByZWludGVycHJldF9jYXN0fDEwIGRlZmF1bHQgZG91YmxlIHJlZ2lzdGVyIGV4cGxpY2l0IHNpZ25lZCB0eXBlbmFtZSB0cnkgdGhpcyBzd2l0Y2ggY29udGludWUgaW5saW5lIGRlbGV0ZSBhbGlnbm9mIGNvbnN0ZXhwciBkZWNsdHlwZSBub2V4Y2VwdCBzdGF0aWNfYXNzZXJ0IHRocmVhZF9sb2NhbCByZXN0cmljdCBfQm9vbCBjb21wbGV4IF9Db21wbGV4IF9JbWFnaW5hcnkgYXRvbWljX2Jvb2wgYXRvbWljX2NoYXIgYXRvbWljX3NjaGFyIGF0b21pY191Y2hhciBhdG9taWNfc2hvcnQgYXRvbWljX3VzaG9ydCBhdG9taWNfaW50IGF0b21pY191aW50IGF0b21pY19sb25nIGF0b21pY191bG9uZyBhdG9taWNfbGxvbmcgYXRvbWljX3VsbG9uZ1wiLGJ1aWx0X2luOlwic3RkIHN0cmluZyBjaW4gY291dCBjZXJyIGNsb2cgc3RkaW4gc3Rkb3V0IHN0ZGVyciBzdHJpbmdzdHJlYW0gaXN0cmluZ3N0cmVhbSBvc3RyaW5nc3RyZWFtIGF1dG9fcHRyIGRlcXVlIGxpc3QgcXVldWUgc3RhY2sgdmVjdG9yIG1hcCBzZXQgYml0c2V0IG11bHRpc2V0IG11bHRpbWFwIHVub3JkZXJlZF9zZXQgdW5vcmRlcmVkX21hcCB1bm9yZGVyZWRfbXVsdGlzZXQgdW5vcmRlcmVkX211bHRpbWFwIGFycmF5IHNoYXJlZF9wdHIgYWJvcnQgYWJzIGFjb3MgYXNpbiBhdGFuMiBhdGFuIGNhbGxvYyBjZWlsIGNvc2ggY29zIGV4aXQgZXhwIGZhYnMgZmxvb3IgZm1vZCBmcHJpbnRmIGZwdXRzIGZyZWUgZnJleHAgZnNjYW5mIGlzYWxudW0gaXNhbHBoYSBpc2NudHJsIGlzZGlnaXQgaXNncmFwaCBpc2xvd2VyIGlzcHJpbnQgaXNwdW5jdCBpc3NwYWNlIGlzdXBwZXIgaXN4ZGlnaXQgdG9sb3dlciB0b3VwcGVyIGxhYnMgbGRleHAgbG9nMTAgbG9nIG1hbGxvYyByZWFsbG9jIG1lbWNociBtZW1jbXAgbWVtY3B5IG1lbXNldCBtb2RmIHBvdyBwcmludGYgcHV0Y2hhciBwdXRzIHNjYW5mIHNpbmggc2luIHNucHJpbnRmIHNwcmludGYgc3FydCBzc2NhbmYgc3RyY2F0IHN0cmNociBzdHJjbXAgc3RyY3B5IHN0cmNzcG4gc3RybGVuIHN0cm5jYXQgc3RybmNtcCBzdHJuY3B5IHN0cnBicmsgc3RycmNociBzdHJzcG4gc3Ryc3RyIHRhbmggdGFuIHZmcHJpbnRmIHZwcmludGYgdnNwcmludGZcIixsaXRlcmFsOlwidHJ1ZSBmYWxzZSBudWxscHRyIE5VTExcIn07cmV0dXJue2FsaWFzZXM6W1wiY1wiLFwiY2NcIixcImhcIixcImMrK1wiLFwiaCsrXCIsXCJocHBcIl0sazpzLGk6XCI8L1wiLGM6W3QsZS5DTENNLGUuQ0JDTSxhLHIsbix7YjpcIlxcXFxiKGRlcXVlfGxpc3R8cXVldWV8c3RhY2t8dmVjdG9yfG1hcHxzZXR8Yml0c2V0fG11bHRpc2V0fG11bHRpbWFwfHVub3JkZXJlZF9tYXB8dW5vcmRlcmVkX3NldHx1bm9yZGVyZWRfbXVsdGlzZXR8dW5vcmRlcmVkX211bHRpbWFwfGFycmF5KVxcXFxzKjxcIixlOlwiPlwiLGs6cyxjOltcInNlbGZcIix0XX0se2I6ZS5JUitcIjo6XCIsazpzfSx7Yks6XCJuZXcgdGhyb3cgcmV0dXJuIGVsc2VcIixyOjB9LHtjTjpcImZ1bmN0aW9uXCIsYjpcIihcIitlLklSK1wiW1xcXFwqJlxcXFxzXSspK1wiK2ksckI6ITAsZTovW3s7PV0vLGVFOiEwLGs6cyxpOi9bXlxcd1xcc1xcKiZdLyxjOlt7YjppLHJCOiEwLGM6W2UuVE1dLHI6MH0se2NOOlwicGFyYW1zXCIsYjovXFwoLyxlOi9cXCkvLGs6cyxyOjAsYzpbZS5DTENNLGUuQ0JDTSxyLGFdfSxlLkNMQ00sZS5DQkNNLG5dfV19fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwiY3NcIixmdW5jdGlvbihlKXt2YXIgdD1cImFic3RyYWN0IGFzIGJhc2UgYm9vbCBicmVhayBieXRlIGNhc2UgY2F0Y2ggY2hhciBjaGVja2VkIGNvbnN0IGNvbnRpbnVlIGRlY2ltYWwgZHluYW1pYyBkZWZhdWx0IGRlbGVnYXRlIGRvIGRvdWJsZSBlbHNlIGVudW0gZXZlbnQgZXhwbGljaXQgZXh0ZXJuIGZhbHNlIGZpbmFsbHkgZml4ZWQgZmxvYXQgZm9yIGZvcmVhY2ggZ290byBpZiBpbXBsaWNpdCBpbiBpbnQgaW50ZXJmYWNlIGludGVybmFsIGlzIGxvY2sgbG9uZyBudWxsIHdoZW4gb2JqZWN0IG9wZXJhdG9yIG91dCBvdmVycmlkZSBwYXJhbXMgcHJpdmF0ZSBwcm90ZWN0ZWQgcHVibGljIHJlYWRvbmx5IHJlZiBzYnl0ZSBzZWFsZWQgc2hvcnQgc2l6ZW9mIHN0YWNrYWxsb2Mgc3RhdGljIHN0cmluZyBzdHJ1Y3Qgc3dpdGNoIHRoaXMgdHJ1ZSB0cnkgdHlwZW9mIHVpbnQgdWxvbmcgdW5jaGVja2VkIHVuc2FmZSB1c2hvcnQgdXNpbmcgdmlydHVhbCB2b2xhdGlsZSB2b2lkIHdoaWxlIGFzeW5jIHByb3RlY3RlZCBwdWJsaWMgcHJpdmF0ZSBpbnRlcm5hbCBhc2NlbmRpbmcgZGVzY2VuZGluZyBmcm9tIGdldCBncm91cCBpbnRvIGpvaW4gbGV0IG9yZGVyYnkgcGFydGlhbCBzZWxlY3Qgc2V0IHZhbHVlIHZhciB3aGVyZSB5aWVsZFwiLHI9ZS5JUitcIig8XCIrZS5JUitcIj4pP1wiO3JldHVybnthbGlhc2VzOltcImNzaGFycFwiXSxrOnQsaTovOjovLGM6W2UuQyhcIi8vL1wiLFwiJFwiLHtyQjohMCxjOlt7Y046XCJ4bWxEb2NUYWdcIix2Olt7YjpcIi8vL1wiLHI6MH0se2I6XCI8IS0tfC0tPlwifSx7YjpcIjwvP1wiLGU6XCI+XCJ9XX1dfSksZS5DTENNLGUuQ0JDTSx7Y046XCJwcmVwcm9jZXNzb3JcIixiOlwiI1wiLGU6XCIkXCIsazpcImlmIGVsc2UgZWxpZiBlbmRpZiBkZWZpbmUgdW5kZWYgd2FybmluZyBlcnJvciBsaW5lIHJlZ2lvbiBlbmRyZWdpb24gcHJhZ21hIGNoZWNrc3VtXCJ9LHtjTjpcInN0cmluZ1wiLGI6J0BcIicsZTonXCInLGM6W3tiOidcIlwiJ31dfSxlLkFTTSxlLlFTTSxlLkNOTSx7Yks6XCJjbGFzcyBpbnRlcmZhY2VcIixlOi9bezs9XS8saTovW15cXHM6XS8sYzpbZS5UTSxlLkNMQ00sZS5DQkNNXX0se2JLOlwibmFtZXNwYWNlXCIsZTovW3s7PV0vLGk6L1teXFxzOl0vLGM6W3tjTjpcInRpdGxlXCIsYjpcIlthLXpBLVpdKFxcXFwuP1xcXFx3KSpcIixyOjB9LGUuQ0xDTSxlLkNCQ01dfSx7Yks6XCJuZXcgcmV0dXJuIHRocm93IGF3YWl0XCIscjowfSx7Y046XCJmdW5jdGlvblwiLGI6XCIoXCIrcitcIlxcXFxzKykrXCIrZS5JUitcIlxcXFxzKlxcXFwoXCIsckI6ITAsZTovW3s7PV0vLGVFOiEwLGs6dCxjOlt7YjplLklSK1wiXFxcXHMqXFxcXChcIixyQjohMCxjOltlLlRNXSxyOjB9LHtjTjpcInBhcmFtc1wiLGI6L1xcKC8sZTovXFwpLyxlQjohMCxlRTohMCxrOnQscjowLGM6W2UuQVNNLGUuUVNNLGUuQ05NLGUuQ0JDTV19LGUuQ0xDTSxlLkNCQ01dfV19fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwiY3NzXCIsZnVuY3Rpb24oZSl7dmFyIHQ9XCJbYS16QS1aLV1bYS16QS1aMC05Xy1dKlwiLHI9e2NOOlwiZnVuY3Rpb25cIixiOnQrXCJcXFxcKFwiLHJCOiEwLGVFOiEwLGU6XCJcXFxcKFwifSxhPXtjTjpcInJ1bGVcIixiOi9bQS1aXFxfXFwuXFwtXStcXHMqOi8sckI6ITAsZTpcIjtcIixlVzohMCxjOlt7Y046XCJhdHRyaWJ1dGVcIixiOi9cXFMvLGU6XCI6XCIsZUU6ITAsc3RhcnRzOntjTjpcInZhbHVlXCIsZVc6ITAsZUU6ITAsYzpbcixlLkNTU05NLGUuUVNNLGUuQVNNLGUuQ0JDTSx7Y046XCJoZXhjb2xvclwiLGI6XCIjWzAtOUEtRmEtZl0rXCJ9LHtjTjpcImltcG9ydGFudFwiLGI6XCIhaW1wb3J0YW50XCJ9XX19XX07cmV0dXJue2NJOiEwLGk6L1s9XFwvfCdcXCRdLyxjOltlLkNCQ00se2NOOlwiaWRcIixiOi9cXCNbQS1aYS16MC05Xy1dKy99LHtjTjpcImNsYXNzXCIsYjovXFwuW0EtWmEtejAtOV8tXSsvfSx7Y046XCJhdHRyX3NlbGVjdG9yXCIsYjovXFxbLyxlOi9cXF0vLGk6XCIkXCJ9LHtjTjpcInBzZXVkb1wiLGI6LzooOik/W2EtekEtWjAtOVxcX1xcLVxcK1xcKFxcKVwiJ10rL30se2NOOlwiYXRfcnVsZVwiLGI6XCJAKGZvbnQtZmFjZXxwYWdlKVwiLGw6XCJbYS16LV0rXCIsazpcImZvbnQtZmFjZSBwYWdlXCJ9LHtjTjpcImF0X3J1bGVcIixiOlwiQFwiLGU6XCJbeztdXCIsYzpbe2NOOlwia2V5d29yZFwiLGI6L1xcUysvfSx7YjovXFxzLyxlVzohMCxlRTohMCxyOjAsYzpbcixlLkFTTSxlLlFTTSxlLkNTU05NXX1dfSx7Y046XCJ0YWdcIixiOnQscjowfSx7Y046XCJydWxlc1wiLGI6XCJ7XCIsZTpcIn1cIixpOi9cXFMvLGM6W2UuQ0JDTSxhXX1dfX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcImRpZmZcIixmdW5jdGlvbihlKXtyZXR1cm57YWxpYXNlczpbXCJwYXRjaFwiXSxjOlt7Y046XCJjaHVua1wiLHI6MTAsdjpbe2I6L15AQCArXFwtXFxkKyxcXGQrICtcXCtcXGQrLFxcZCsgK0BAJC99LHtiOi9eXFwqXFwqXFwqICtcXGQrLFxcZCsgK1xcKlxcKlxcKlxcKiQvfSx7YjovXlxcLVxcLVxcLSArXFxkKyxcXGQrICtcXC1cXC1cXC1cXC0kL31dfSx7Y046XCJoZWFkZXJcIix2Olt7YjovSW5kZXg6IC8sZTovJC99LHtiOi89PT09PS8sZTovPT09PT0kL30se2I6L15cXC1cXC1cXC0vLGU6LyQvfSx7YjovXlxcKnszfSAvLGU6LyQvfSx7YjovXlxcK1xcK1xcKy8sZTovJC99LHtiOi9cXCp7NX0vLGU6L1xcKns1fSQvfV19LHtjTjpcImFkZGl0aW9uXCIsYjpcIl5cXFxcK1wiLGU6XCIkXCJ9LHtjTjpcImRlbGV0aW9uXCIsYjpcIl5cXFxcLVwiLGU6XCIkXCJ9LHtjTjpcImNoYW5nZVwiLGI6XCJeXFxcXCFcIixlOlwiJFwifV19fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwiaHR0cFwiLGZ1bmN0aW9uKGUpe3JldHVybnthbGlhc2VzOltcImh0dHBzXCJdLGk6XCJcXFxcU1wiLGM6W3tjTjpcInN0YXR1c1wiLGI6XCJeSFRUUC9bMC05XFxcXC5dK1wiLGU6XCIkXCIsYzpbe2NOOlwibnVtYmVyXCIsYjpcIlxcXFxiXFxcXGR7M31cXFxcYlwifV19LHtjTjpcInJlcXVlc3RcIixiOlwiXltBLVpdKyAoLio/KSBIVFRQL1swLTlcXFxcLl0rJFwiLHJCOiEwLGU6XCIkXCIsYzpbe2NOOlwic3RyaW5nXCIsYjpcIiBcIixlOlwiIFwiLGVCOiEwLGVFOiEwfV19LHtjTjpcImF0dHJpYnV0ZVwiLGI6XCJeXFxcXHdcIixlOlwiOiBcIixlRTohMCxpOlwiXFxcXG58XFxcXHN8PVwiLHN0YXJ0czp7Y046XCJzdHJpbmdcIixlOlwiJFwifX0se2I6XCJcXFxcblxcXFxuXCIsc3RhcnRzOntzTDpbXSxlVzohMH19XX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJpbmlcIixmdW5jdGlvbihlKXt2YXIgdD17Y046XCJzdHJpbmdcIixjOltlLkJFXSx2Olt7YjpcIicnJ1wiLGU6XCInJydcIixyOjEwfSx7YjonXCJcIlwiJyxlOidcIlwiXCInLHI6MTB9LHtiOidcIicsZTonXCInfSx7YjpcIidcIixlOlwiJ1wifV19O3JldHVybnthbGlhc2VzOltcInRvbWxcIl0sY0k6ITAsaTovXFxTLyxjOltlLkMoXCI7XCIsXCIkXCIpLGUuSENNLHtjTjpcInRpdGxlXCIsYjovXlxccypcXFsrLyxlOi9cXF0rL30se2NOOlwic2V0dGluZ1wiLGI6L15bYS16MC05XFxbXFxdXy1dK1xccyo9XFxzKi8sZTpcIiRcIixjOlt7Y046XCJ2YWx1ZVwiLGVXOiEwLGs6XCJvbiBvZmYgdHJ1ZSBmYWxzZSB5ZXMgbm9cIixjOlt7Y046XCJ2YXJpYWJsZVwiLHY6W3tiOi9cXCRbXFx3XFxkXCJdW1xcd1xcZF9dKi99LHtiOi9cXCRcXHsoLio/KX0vfV19LHQse2NOOlwibnVtYmVyXCIsYjovKFtcXCtcXC1dKyk/W1xcZF0rX1tcXGRfXSsvfSxlLk5NXSxyOjB9XX1dfX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcImphdmFcIixmdW5jdGlvbihlKXt2YXIgdD1lLlVJUitcIig8XCIrZS5VSVIrXCI+KT9cIixyPVwiZmFsc2Ugc3luY2hyb25pemVkIGludCBhYnN0cmFjdCBmbG9hdCBwcml2YXRlIGNoYXIgYm9vbGVhbiBzdGF0aWMgbnVsbCBpZiBjb25zdCBmb3IgdHJ1ZSB3aGlsZSBsb25nIHN0cmljdGZwIGZpbmFsbHkgcHJvdGVjdGVkIGltcG9ydCBuYXRpdmUgZmluYWwgdm9pZCBlbnVtIGVsc2UgYnJlYWsgdHJhbnNpZW50IGNhdGNoIGluc3RhbmNlb2YgYnl0ZSBzdXBlciB2b2xhdGlsZSBjYXNlIGFzc2VydCBzaG9ydCBwYWNrYWdlIGRlZmF1bHQgZG91YmxlIHB1YmxpYyB0cnkgdGhpcyBzd2l0Y2ggY29udGludWUgdGhyb3dzIHByb3RlY3RlZCBwdWJsaWMgcHJpdmF0ZVwiLGE9XCJcXFxcYigwW2JCXShbMDFdK1swMV9dK1swMV0rfFswMV0rKXwwW3hYXShbYS1mQS1GMC05XStbYS1mQS1GMC05X10rW2EtZkEtRjAtOV0rfFthLWZBLUYwLTldKyl8KChbXFxcXGRdK1tcXFxcZF9dK1tcXFxcZF0rfFtcXFxcZF0rKShcXFxcLihbXFxcXGRdK1tcXFxcZF9dK1tcXFxcZF0rfFtcXFxcZF0rKSk/fFxcXFwuKFtcXFxcZF0rW1xcXFxkX10rW1xcXFxkXSt8W1xcXFxkXSspKShbZUVdWy0rXT9cXFxcZCspPylbbExmRl0/XCIsbj17Y046XCJudW1iZXJcIixiOmEscjowfTtyZXR1cm57YWxpYXNlczpbXCJqc3BcIl0sazpyLGk6LzxcXC98Iy8sYzpbZS5DKFwiL1xcXFwqXFxcXCpcIixcIlxcXFwqL1wiLHtyOjAsYzpbe2NOOlwiZG9jdGFnXCIsYjpcIkBbQS1aYS16XStcIn1dfSksZS5DTENNLGUuQ0JDTSxlLkFTTSxlLlFTTSx7Y046XCJjbGFzc1wiLGJLOlwiY2xhc3MgaW50ZXJmYWNlXCIsZTovW3s7PV0vLGVFOiEwLGs6XCJjbGFzcyBpbnRlcmZhY2VcIixpOi9bOlwiXFxbXFxdXS8sYzpbe2JLOlwiZXh0ZW5kcyBpbXBsZW1lbnRzXCJ9LGUuVVRNXX0se2JLOlwibmV3IHRocm93IHJldHVybiBlbHNlXCIscjowfSx7Y046XCJmdW5jdGlvblwiLGI6XCIoXCIrdCtcIlxcXFxzKykrXCIrZS5VSVIrXCJcXFxccypcXFxcKFwiLHJCOiEwLGU6L1t7Oz1dLyxlRTohMCxrOnIsYzpbe2I6ZS5VSVIrXCJcXFxccypcXFxcKFwiLHJCOiEwLHI6MCxjOltlLlVUTV19LHtjTjpcInBhcmFtc1wiLGI6L1xcKC8sZTovXFwpLyxrOnIscjowLGM6W2UuQVNNLGUuUVNNLGUuQ05NLGUuQ0JDTV19LGUuQ0xDTSxlLkNCQ01dfSxuLHtjTjpcImFubm90YXRpb25cIixiOlwiQFtBLVphLXpdK1wifV19fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwiamF2YXNjcmlwdFwiLGZ1bmN0aW9uKGUpe3JldHVybnthbGlhc2VzOltcImpzXCJdLGs6e2tleXdvcmQ6XCJpbiBvZiBpZiBmb3Igd2hpbGUgZmluYWxseSB2YXIgbmV3IGZ1bmN0aW9uIGRvIHJldHVybiB2b2lkIGVsc2UgYnJlYWsgY2F0Y2ggaW5zdGFuY2VvZiB3aXRoIHRocm93IGNhc2UgZGVmYXVsdCB0cnkgdGhpcyBzd2l0Y2ggY29udGludWUgdHlwZW9mIGRlbGV0ZSBsZXQgeWllbGQgY29uc3QgZXhwb3J0IHN1cGVyIGRlYnVnZ2VyIGFzIGFzeW5jIGF3YWl0XCIsbGl0ZXJhbDpcInRydWUgZmFsc2UgbnVsbCB1bmRlZmluZWQgTmFOIEluZmluaXR5XCIsYnVpbHRfaW46XCJldmFsIGlzRmluaXRlIGlzTmFOIHBhcnNlRmxvYXQgcGFyc2VJbnQgZGVjb2RlVVJJIGRlY29kZVVSSUNvbXBvbmVudCBlbmNvZGVVUkkgZW5jb2RlVVJJQ29tcG9uZW50IGVzY2FwZSB1bmVzY2FwZSBPYmplY3QgRnVuY3Rpb24gQm9vbGVhbiBFcnJvciBFdmFsRXJyb3IgSW50ZXJuYWxFcnJvciBSYW5nZUVycm9yIFJlZmVyZW5jZUVycm9yIFN0b3BJdGVyYXRpb24gU3ludGF4RXJyb3IgVHlwZUVycm9yIFVSSUVycm9yIE51bWJlciBNYXRoIERhdGUgU3RyaW5nIFJlZ0V4cCBBcnJheSBGbG9hdDMyQXJyYXkgRmxvYXQ2NEFycmF5IEludDE2QXJyYXkgSW50MzJBcnJheSBJbnQ4QXJyYXkgVWludDE2QXJyYXkgVWludDMyQXJyYXkgVWludDhBcnJheSBVaW50OENsYW1wZWRBcnJheSBBcnJheUJ1ZmZlciBEYXRhVmlldyBKU09OIEludGwgYXJndW1lbnRzIHJlcXVpcmUgbW9kdWxlIGNvbnNvbGUgd2luZG93IGRvY3VtZW50IFN5bWJvbCBTZXQgTWFwIFdlYWtTZXQgV2Vha01hcCBQcm94eSBSZWZsZWN0IFByb21pc2VcIn0sYzpbe2NOOlwicGlcIixyOjEwLGI6L15cXHMqWydcIl11c2UgKHN0cmljdHxhc20pWydcIl0vfSxlLkFTTSxlLlFTTSx7Y046XCJzdHJpbmdcIixiOlwiYFwiLGU6XCJgXCIsYzpbZS5CRSx7Y046XCJzdWJzdFwiLGI6XCJcXFxcJFxcXFx7XCIsZTpcIlxcXFx9XCJ9XX0sZS5DTENNLGUuQ0JDTSx7Y046XCJudW1iZXJcIix2Olt7YjpcIlxcXFxiKDBbYkJdWzAxXSspXCJ9LHtiOlwiXFxcXGIoMFtvT11bMC03XSspXCJ9LHtiOmUuQ05SfV0scjowfSx7YjpcIihcIitlLlJTUitcInxcXFxcYihjYXNlfHJldHVybnx0aHJvdylcXFxcYilcXFxccypcIixrOlwicmV0dXJuIHRocm93IGNhc2VcIixjOltlLkNMQ00sZS5DQkNNLGUuUk0se2I6LzwvLGU6Lz5cXHMqWyk7XFxdXS8scjowLHNMOlwieG1sXCJ9XSxyOjB9LHtjTjpcImZ1bmN0aW9uXCIsYks6XCJmdW5jdGlvblwiLGU6L1xcey8sZUU6ITAsYzpbZS5pbmhlcml0KGUuVE0se2I6L1tBLVphLXokX11bMC05QS1aYS16JF9dKi99KSx7Y046XCJwYXJhbXNcIixiOi9cXCgvLGU6L1xcKS8sZUI6ITAsZUU6ITAsYzpbZS5DTENNLGUuQ0JDTV19XSxpOi9cXFt8JS99LHtiOi9cXCRbKC5dL30se2I6XCJcXFxcLlwiK2UuSVIscjowfSx7Yks6XCJpbXBvcnRcIixlOlwiWzskXVwiLGs6XCJpbXBvcnQgZnJvbSBhc1wiLGM6W2UuQVNNLGUuUVNNXX0se2NOOlwiY2xhc3NcIixiSzpcImNsYXNzXCIsZTovW3s7PV0vLGVFOiEwLGk6L1s6XCJcXFtcXF1dLyxjOlt7Yks6XCJleHRlbmRzXCJ9LGUuVVRNXX1dLGk6LyMvfX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcImpzb25cIixmdW5jdGlvbihlKXt2YXIgdD17bGl0ZXJhbDpcInRydWUgZmFsc2UgbnVsbFwifSxyPVtlLlFTTSxlLkNOTV0sYT17Y046XCJ2YWx1ZVwiLGU6XCIsXCIsZVc6ITAsZUU6ITAsYzpyLGs6dH0sbj17YjpcIntcIixlOlwifVwiLGM6W3tjTjpcImF0dHJpYnV0ZVwiLGI6J1xcXFxzKlwiJyxlOidcIlxcXFxzKjpcXFxccyonLGVCOiEwLGVFOiEwLGM6W2UuQkVdLGk6XCJcXFxcblwiLHN0YXJ0czphfV0saTpcIlxcXFxTXCJ9LGk9e2I6XCJcXFxcW1wiLGU6XCJcXFxcXVwiLGM6W2UuaW5oZXJpdChhLHtjTjpudWxsfSldLGk6XCJcXFxcU1wifTtyZXR1cm4gci5zcGxpY2Uoci5sZW5ndGgsMCxuLGkpLHtjOnIsazp0LGk6XCJcXFxcU1wifX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcIm1ha2VmaWxlXCIsZnVuY3Rpb24oZSl7dmFyIHQ9e2NOOlwidmFyaWFibGVcIixiOi9cXCRcXCgvLGU6L1xcKS8sYzpbZS5CRV19O3JldHVybnthbGlhc2VzOltcIm1rXCIsXCJtYWtcIl0sYzpbZS5IQ00se2I6L15cXHcrXFxzKlxcVyo9LyxyQjohMCxyOjAsc3RhcnRzOntjTjpcImNvbnN0YW50XCIsZTovXFxzKlxcVyo9LyxlRTohMCxzdGFydHM6e2U6LyQvLHI6MCxjOlt0XX19fSx7Y046XCJ0aXRsZVwiLGI6L15bXFx3XSs6XFxzKiQvfSx7Y046XCJwaG9ueVwiLGI6L15cXC5QSE9OWTovLGU6LyQvLGs6XCIuUEhPTllcIixsOi9bXFwuXFx3XSsvfSx7YjovXlxcdCsvLGU6LyQvLHI6MCxjOltlLlFTTSx0XX1dfX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcInhtbFwiLGZ1bmN0aW9uKGUpe3ZhciB0PVwiW0EtWmEtejAtOVxcXFwuXzotXStcIixyPXtiOi88XFw/KHBocCk/KD8hXFx3KS8sZTovXFw/Pi8sc0w6XCJwaHBcIn0sYT17ZVc6ITAsaTovPC8scjowLGM6W3Ise2NOOlwiYXR0cmlidXRlXCIsYjp0LHI6MH0se2I6XCI9XCIscjowLGM6W3tjTjpcInZhbHVlXCIsYzpbcl0sdjpbe2I6L1wiLyxlOi9cIi99LHtiOi8nLyxlOi8nL30se2I6L1teXFxzXFwvPl0rL31dfV19XX07cmV0dXJue2FsaWFzZXM6W1wiaHRtbFwiLFwieGh0bWxcIixcInJzc1wiLFwiYXRvbVwiLFwieHNsXCIsXCJwbGlzdFwiXSxjSTohMCxjOlt7Y046XCJkb2N0eXBlXCIsYjpcIjwhRE9DVFlQRVwiLGU6XCI+XCIscjoxMCxjOlt7YjpcIlxcXFxbXCIsZTpcIlxcXFxdXCJ9XX0sZS5DKFwiPCEtLVwiLFwiLS0+XCIse3I6MTB9KSx7Y046XCJjZGF0YVwiLGI6XCI8XFxcXCFcXFxcW0NEQVRBXFxcXFtcIixlOlwiXFxcXF1cXFxcXT5cIixyOjEwfSx7Y046XCJ0YWdcIixiOlwiPHN0eWxlKD89XFxcXHN8PnwkKVwiLGU6XCI+XCIsazp7dGl0bGU6XCJzdHlsZVwifSxjOlthXSxzdGFydHM6e2U6XCI8L3N0eWxlPlwiLHJFOiEwLHNMOlwiY3NzXCJ9fSx7Y046XCJ0YWdcIixiOlwiPHNjcmlwdCg/PVxcXFxzfD58JClcIixlOlwiPlwiLGs6e3RpdGxlOlwic2NyaXB0XCJ9LGM6W2FdLHN0YXJ0czp7ZTpcIjwvc2NyaXB0PlwiLHJFOiEwLHNMOltcImFjdGlvbnNjcmlwdFwiLFwiamF2YXNjcmlwdFwiLFwiaGFuZGxlYmFyc1wiXX19LHIse2NOOlwicGlcIixiOi88XFw/XFx3Ky8sZTovXFw/Pi8scjoxMH0se2NOOlwidGFnXCIsYjpcIjwvP1wiLGU6XCIvPz5cIixjOlt7Y046XCJ0aXRsZVwiLGI6L1teIFxcLz48XFxuXFx0XSsvLHI6MH0sYV19XX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJtYXJrZG93blwiLGZ1bmN0aW9uKGUpe3JldHVybnthbGlhc2VzOltcIm1kXCIsXCJta2Rvd25cIixcIm1rZFwiXSxjOlt7Y046XCJoZWFkZXJcIix2Olt7YjpcIl4jezEsNn1cIixlOlwiJFwifSx7YjpcIl4uKz9cXFxcbls9LV17Mix9JFwifV19LHtiOlwiPFwiLGU6XCI+XCIsc0w6XCJ4bWxcIixyOjB9LHtjTjpcImJ1bGxldFwiLGI6XCJeKFsqKy1dfChcXFxcZCtcXFxcLikpXFxcXHMrXCJ9LHtjTjpcInN0cm9uZ1wiLGI6XCJbKl9dezJ9Lis/WypfXXsyfVwifSx7Y046XCJlbXBoYXNpc1wiLHY6W3tiOlwiXFxcXCouKz9cXFxcKlwifSx7YjpcIl8uKz9fXCIscjowfV19LHtjTjpcImJsb2NrcXVvdGVcIixiOlwiXj5cXFxccytcIixlOlwiJFwifSx7Y046XCJjb2RlXCIsdjpbe2I6XCJgLis/YFwifSx7YjpcIl4oIHs0fXxcdClcIixlOlwiJFwiLHI6MH1dfSx7Y046XCJob3Jpem9udGFsX3J1bGVcIixiOlwiXlstXFxcXCpdezMsfVwiLGU6XCIkXCJ9LHtiOlwiXFxcXFsuKz9cXFxcXVtcXFxcKFxcXFxbXS4qP1tcXFxcKVxcXFxdXVwiLHJCOiEwLGM6W3tjTjpcImxpbmtfbGFiZWxcIixiOlwiXFxcXFtcIixlOlwiXFxcXF1cIixlQjohMCxyRTohMCxyOjB9LHtjTjpcImxpbmtfdXJsXCIsYjpcIlxcXFxdXFxcXChcIixlOlwiXFxcXClcIixlQjohMCxlRTohMH0se2NOOlwibGlua19yZWZlcmVuY2VcIixiOlwiXFxcXF1cXFxcW1wiLGU6XCJcXFxcXVwiLGVCOiEwLGVFOiEwfV0scjoxMH0se2I6XCJeXFxcXFsuK1xcXFxdOlwiLHJCOiEwLGM6W3tjTjpcImxpbmtfcmVmZXJlbmNlXCIsYjpcIlxcXFxbXCIsZTpcIlxcXFxdOlwiLGVCOiEwLGVFOiEwLHN0YXJ0czp7Y046XCJsaW5rX3VybFwiLGU6XCIkXCJ9fV19XX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJuZ2lueFwiLGZ1bmN0aW9uKGUpe3ZhciB0PXtjTjpcInZhcmlhYmxlXCIsdjpbe2I6L1xcJFxcZCsvfSx7YjovXFwkXFx7LyxlOi99L30se2I6XCJbXFxcXCRcXFxcQF1cIitlLlVJUn1dfSxyPXtlVzohMCxsOlwiW2Etei9fXStcIixrOntidWlsdF9pbjpcIm9uIG9mZiB5ZXMgbm8gdHJ1ZSBmYWxzZSBub25lIGJsb2NrZWQgZGVidWcgaW5mbyBub3RpY2Ugd2FybiBlcnJvciBjcml0IHNlbGVjdCBicmVhayBsYXN0IHBlcm1hbmVudCByZWRpcmVjdCBrcXVldWUgcnRzaWcgZXBvbGwgcG9sbCAvZGV2L3BvbGxcIn0scjowLGk6XCI9PlwiLGM6W2UuSENNLHtjTjpcInN0cmluZ1wiLGM6W2UuQkUsdF0sdjpbe2I6L1wiLyxlOi9cIi99LHtiOi8nLyxlOi8nL31dfSx7Y046XCJ1cmxcIixiOlwiKFthLXpdKyk6L1wiLGU6XCJcXFxcc1wiLGVXOiEwLGVFOiEwLGM6W3RdfSx7Y046XCJyZWdleHBcIixjOltlLkJFLHRdLHY6W3tiOlwiXFxcXHNcXFxcXlwiLGU6XCJcXFxcc3x7fDtcIixyRTohMH0se2I6XCJ+XFxcXCo/XFxcXHMrXCIsZTpcIlxcXFxzfHt8O1wiLHJFOiEwfSx7YjpcIlxcXFwqKFxcXFwuW2EtelxcXFwtXSspK1wifSx7YjpcIihbYS16XFxcXC1dK1xcXFwuKStcXFxcKlwifV19LHtjTjpcIm51bWJlclwiLGI6XCJcXFxcYlxcXFxkezEsM31cXFxcLlxcXFxkezEsM31cXFxcLlxcXFxkezEsM31cXFxcLlxcXFxkezEsM30oOlxcXFxkezEsNX0pP1xcXFxiXCJ9LHtjTjpcIm51bWJlclwiLGI6XCJcXFxcYlxcXFxkK1trS21NZ0dkc2hkd3ldKlxcXFxiXCIscjowfSx0XX07cmV0dXJue2FsaWFzZXM6W1wibmdpbnhjb25mXCJdLGM6W2UuSENNLHtiOmUuVUlSK1wiXFxcXHNcIixlOlwiO3x7XCIsckI6ITAsYzpbe2NOOlwidGl0bGVcIixiOmUuVUlSLHN0YXJ0czpyfV0scjowfV0saTpcIlteXFxcXHNcXFxcfV1cIn19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJvYmplY3RpdmVjXCIsZnVuY3Rpb24oZSl7dmFyIHQ9e2NOOlwiYnVpbHRfaW5cIixiOlwiKEFWfENBfENGfENHfENJfE1LfE1QfE5TfFVJKVxcXFx3K1wifSxyPXtrZXl3b3JkOlwiaW50IGZsb2F0IHdoaWxlIGNoYXIgZXhwb3J0IHNpemVvZiB0eXBlZGVmIGNvbnN0IHN0cnVjdCBmb3IgdW5pb24gdW5zaWduZWQgbG9uZyB2b2xhdGlsZSBzdGF0aWMgYm9vbCBtdXRhYmxlIGlmIGRvIHJldHVybiBnb3RvIHZvaWQgZW51bSBlbHNlIGJyZWFrIGV4dGVybiBhc20gY2FzZSBzaG9ydCBkZWZhdWx0IGRvdWJsZSByZWdpc3RlciBleHBsaWNpdCBzaWduZWQgdHlwZW5hbWUgdGhpcyBzd2l0Y2ggY29udGludWUgd2NoYXJfdCBpbmxpbmUgcmVhZG9ubHkgYXNzaWduIHJlYWR3cml0ZSBzZWxmIEBzeW5jaHJvbml6ZWQgaWQgdHlwZW9mIG5vbmF0b21pYyBzdXBlciB1bmljaGFyIElCT3V0bGV0IElCQWN0aW9uIHN0cm9uZyB3ZWFrIGNvcHkgaW4gb3V0IGlub3V0IGJ5Y29weSBieXJlZiBvbmV3YXkgX19zdHJvbmcgX193ZWFrIF9fYmxvY2sgX19hdXRvcmVsZWFzaW5nIEBwcml2YXRlIEBwcm90ZWN0ZWQgQHB1YmxpYyBAdHJ5IEBwcm9wZXJ0eSBAZW5kIEB0aHJvdyBAY2F0Y2ggQGZpbmFsbHkgQGF1dG9yZWxlYXNlcG9vbCBAc3ludGhlc2l6ZSBAZHluYW1pYyBAc2VsZWN0b3IgQG9wdGlvbmFsIEByZXF1aXJlZFwiLGxpdGVyYWw6XCJmYWxzZSB0cnVlIEZBTFNFIFRSVUUgbmlsIFlFUyBOTyBOVUxMXCIsYnVpbHRfaW46XCJCT09MIGRpc3BhdGNoX29uY2VfdCBkaXNwYXRjaF9xdWV1ZV90IGRpc3BhdGNoX3N5bmMgZGlzcGF0Y2hfYXN5bmMgZGlzcGF0Y2hfb25jZVwifSxhPS9bYS16QS1aQF1bYS16QS1aMC05X10qLyxuPVwiQGludGVyZmFjZSBAY2xhc3MgQHByb3RvY29sIEBpbXBsZW1lbnRhdGlvblwiO3JldHVybnthbGlhc2VzOltcIm1tXCIsXCJvYmpjXCIsXCJvYmotY1wiXSxrOnIsbDphLGk6XCI8L1wiLGM6W3QsZS5DTENNLGUuQ0JDTSxlLkNOTSxlLlFTTSx7Y046XCJzdHJpbmdcIix2Olt7YjonQFwiJyxlOidcIicsaTpcIlxcXFxuXCIsYzpbZS5CRV19LHtiOlwiJ1wiLGU6XCJbXlxcXFxcXFxcXSdcIixpOlwiW15cXFxcXFxcXF1bXiddXCJ9XX0se2NOOlwicHJlcHJvY2Vzc29yXCIsYjpcIiNcIixlOlwiJFwiLGM6W3tjTjpcInRpdGxlXCIsdjpbe2I6J1wiJyxlOidcIid9LHtiOlwiPFwiLGU6XCI+XCJ9XX1dfSx7Y046XCJjbGFzc1wiLGI6XCIoXCIrbi5zcGxpdChcIiBcIikuam9pbihcInxcIikrXCIpXFxcXGJcIixlOlwiKHt8JClcIixlRTohMCxrOm4sbDphLGM6W2UuVVRNXX0se2NOOlwidmFyaWFibGVcIixiOlwiXFxcXC5cIitlLlVJUixyOjB9XX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJwZXJsXCIsZnVuY3Rpb24oZSl7dmFyIHQ9XCJnZXRwd2VudCBnZXRzZXJ2ZW50IHF1b3RlbWV0YSBtc2dyY3Ygc2NhbGFyIGtpbGwgZGJtY2xvc2UgdW5kZWYgbGMgbWEgc3lzd3JpdGUgdHIgc2VuZCB1bWFzayBzeXNvcGVuIHNobXdyaXRlIHZlYyBxeCB1dGltZSBsb2NhbCBvY3Qgc2VtY3RsIGxvY2FsdGltZSByZWFkcGlwZSBkbyByZXR1cm4gZm9ybWF0IHJlYWQgc3ByaW50ZiBkYm1vcGVuIHBvcCBnZXRwZ3JwIG5vdCBnZXRwd25hbSByZXdpbmRkaXIgcXFmaWxlbm8gcXcgZW5kcHJvdG9lbnQgd2FpdCBzZXRob3N0ZW50IGJsZXNzIHN8MCBvcGVuZGlyIGNvbnRpbnVlIGVhY2ggc2xlZXAgZW5kZ3JlbnQgc2h1dGRvd24gZHVtcCBjaG9tcCBjb25uZWN0IGdldHNvY2tuYW1lIGRpZSBzb2NrZXRwYWlyIGNsb3NlIGZsb2NrIGV4aXN0cyBpbmRleCBzaG1nZXRzdWIgZm9yIGVuZHB3ZW50IHJlZG8gbHN0YXQgbXNnY3RsIHNldHBncnAgYWJzIGV4aXQgc2VsZWN0IHByaW50IHJlZiBnZXRob3N0YnlhZGRyIHVuc2hpZnQgZmNudGwgc3lzY2FsbCBnb3RvIGdldG5ldGJ5YWRkciBqb2luIGdtdGltZSBzeW1saW5rIHNlbWdldCBzcGxpY2UgeHwwIGdldHBlZXJuYW1lIHJlY3YgbG9nIHNldHNvY2tvcHQgY29zIGxhc3QgcmV2ZXJzZSBnZXRob3N0YnluYW1lIGdldGdybmFtIHN0dWR5IGZvcm1saW5lIGVuZGhvc3RlbnQgdGltZXMgY2hvcCBsZW5ndGggZ2V0aG9zdGVudCBnZXRuZXRlbnQgcGFjayBnZXRwcm90b2VudCBnZXRzZXJ2YnluYW1lIHJhbmQgbWtkaXIgcG9zIGNobW9kIHl8MCBzdWJzdHIgZW5kbmV0ZW50IHByaW50ZiBuZXh0IG9wZW4gbXNnc25kIHJlYWRkaXIgdXNlIHVubGluayBnZXRzb2Nrb3B0IGdldHByaW9yaXR5IHJpbmRleCB3YW50YXJyYXkgaGV4IHN5c3RlbSBnZXRzZXJ2Ynlwb3J0IGVuZHNlcnZlbnQgaW50IGNociB1bnRpZSBybWRpciBwcm90b3R5cGUgdGVsbCBsaXN0ZW4gZm9yayBzaG1yZWFkIHVjZmlyc3Qgc2V0cHJvdG9lbnQgZWxzZSBzeXNzZWVrIGxpbmsgZ2V0Z3JnaWQgc2htY3RsIHdhaXRwaWQgdW5wYWNrIGdldG5ldGJ5bmFtZSByZXNldCBjaGRpciBncmVwIHNwbGl0IHJlcXVpcmUgY2FsbGVyIGxjZmlyc3QgdW50aWwgd2FybiB3aGlsZSB2YWx1ZXMgc2hpZnQgdGVsbGRpciBnZXRwd3VpZCBteSBnZXRwcm90b2J5bnVtYmVyIGRlbGV0ZSBhbmQgc29ydCB1YyBkZWZpbmVkIHNyYW5kIGFjY2VwdCBwYWNrYWdlIHNlZWtkaXIgZ2V0cHJvdG9ieW5hbWUgc2Vtb3Agb3VyIHJlbmFtZSBzZWVrIGlmIHF8MCBjaHJvb3Qgc3lzcmVhZCBzZXRwd2VudCBubyBjcnlwdCBnZXRjIGNob3duIHNxcnQgd3JpdGUgc2V0bmV0ZW50IHNldHByaW9yaXR5IGZvcmVhY2ggdGllIHNpbiBtc2dnZXQgbWFwIHN0YXQgZ2V0bG9naW4gdW5sZXNzIGVsc2lmIHRydW5jYXRlIGV4ZWMga2V5cyBnbG9iIHRpZWQgY2xvc2VkaXJpb2N0bCBzb2NrZXQgcmVhZGxpbmsgZXZhbCB4b3IgcmVhZGxpbmUgYmlubW9kZSBzZXRzZXJ2ZW50IGVvZiBvcmQgYmluZCBhbGFybSBwaXBlIGF0YW4yIGdldGdyZW50IGV4cCB0aW1lIHB1c2ggc2V0Z3JlbnQgZ3QgbHQgb3IgbmUgbXwwIGJyZWFrIGdpdmVuIHNheSBzdGF0ZSB3aGVuXCIscj17Y046XCJzdWJzdFwiLGI6XCJbJEBdXFxcXHtcIixlOlwiXFxcXH1cIixrOnR9LGE9e2I6XCItPntcIixlOlwifVwifSxuPXtjTjpcInZhcmlhYmxlXCIsdjpbe2I6L1xcJFxcZC99LHtiOi9bXFwkJUBdKFxcXlxcd1xcYnwjXFx3Kyg6OlxcdyspKnx7XFx3K318XFx3Kyg6OlxcdyopKikvfSx7YjovW1xcJCVAXVteXFxzXFx3e10vLHI6MH1dfSxpPVtlLkJFLHIsbl0scz1bbixlLkhDTSxlLkMoXCJeXFxcXD1cXFxcd1wiLFwiXFxcXD1jdXRcIix7ZVc6ITB9KSxhLHtjTjpcInN0cmluZ1wiLGM6aSx2Olt7YjpcInFbcXd4cl0/XFxcXHMqXFxcXChcIixlOlwiXFxcXClcIixyOjV9LHtiOlwicVtxd3hyXT9cXFxccypcXFxcW1wiLGU6XCJcXFxcXVwiLHI6NX0se2I6XCJxW3F3eHJdP1xcXFxzKlxcXFx7XCIsZTpcIlxcXFx9XCIscjo1fSx7YjpcInFbcXd4cl0/XFxcXHMqXFxcXHxcIixlOlwiXFxcXHxcIixyOjV9LHtiOlwicVtxd3hyXT9cXFxccypcXFxcPFwiLGU6XCJcXFxcPlwiLHI6NX0se2I6XCJxd1xcXFxzK3FcIixlOlwicVwiLHI6NX0se2I6XCInXCIsZTpcIidcIixjOltlLkJFXX0se2I6J1wiJyxlOidcIid9LHtiOlwiYFwiLGU6XCJgXCIsYzpbZS5CRV19LHtiOlwie1xcXFx3K31cIixjOltdLHI6MH0se2I6XCItP1xcXFx3K1xcXFxzKlxcXFw9XFxcXD5cIixjOltdLHI6MH1dfSx7Y046XCJudW1iZXJcIixiOlwiKFxcXFxiMFswLTdfXSspfChcXFxcYjB4WzAtOWEtZkEtRl9dKyl8KFxcXFxiWzEtOV1bMC05X10qKFxcXFwuWzAtOV9dKyk/KXxbMF9dXFxcXGJcIixyOjB9LHtiOlwiKFxcXFwvXFxcXC98XCIrZS5SU1IrXCJ8XFxcXGIoc3BsaXR8cmV0dXJufHByaW50fHJldmVyc2V8Z3JlcClcXFxcYilcXFxccypcIixrOlwic3BsaXQgcmV0dXJuIHByaW50IHJldmVyc2UgZ3JlcFwiLHI6MCxjOltlLkhDTSx7Y046XCJyZWdleHBcIixiOlwiKHN8dHJ8eSkvKFxcXFxcXFxcLnxbXi9dKSovKFxcXFxcXFxcLnxbXi9dKSovW2Etel0qXCIscjoxMH0se2NOOlwicmVnZXhwXCIsYjpcIihtfHFyKT8vXCIsZTpcIi9bYS16XSpcIixjOltlLkJFXSxyOjB9XX0se2NOOlwic3ViXCIsYks6XCJzdWJcIixlOlwiKFxcXFxzKlxcXFwoLio/XFxcXCkpP1s7e11cIixyOjV9LHtjTjpcIm9wZXJhdG9yXCIsYjpcIi1cXFxcd1xcXFxiXCIscjowfSx7YjpcIl5fX0RBVEFfXyRcIixlOlwiXl9fRU5EX18kXCIsc0w6XCJtb2pvbGljaW91c1wiLGM6W3tiOlwiXkBALipcIixlOlwiJFwiLGNOOlwiY29tbWVudFwifV19XTtyZXR1cm4gci5jPXMsYS5jPXMse2FsaWFzZXM6W1wicGxcIl0sazp0LGM6c319KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJwaHBcIixmdW5jdGlvbihlKXt2YXIgdD17Y046XCJ2YXJpYWJsZVwiLGI6XCJcXFxcJCtbYS16QS1aX38tw79dW2EtekEtWjAtOV9/LcO/XSpcIn0scj17Y046XCJwcmVwcm9jZXNzb3JcIixiOi88XFw/KHBocCk/fFxcPz4vfSxhPXtjTjpcInN0cmluZ1wiLGM6W2UuQkUscl0sdjpbe2I6J2JcIicsZTonXCInfSx7YjpcImInXCIsZTpcIidcIn0sZS5pbmhlcml0KGUuQVNNLHtpOm51bGx9KSxlLmluaGVyaXQoZS5RU00se2k6bnVsbH0pXX0sbj17djpbZS5CTk0sZS5DTk1dfTtyZXR1cm57YWxpYXNlczpbXCJwaHAzXCIsXCJwaHA0XCIsXCJwaHA1XCIsXCJwaHA2XCJdLGNJOiEwLGs6XCJhbmQgaW5jbHVkZV9vbmNlIGxpc3QgYWJzdHJhY3QgZ2xvYmFsIHByaXZhdGUgZWNobyBpbnRlcmZhY2UgYXMgc3RhdGljIGVuZHN3aXRjaCBhcnJheSBudWxsIGlmIGVuZHdoaWxlIG9yIGNvbnN0IGZvciBlbmRmb3JlYWNoIHNlbGYgdmFyIHdoaWxlIGlzc2V0IHB1YmxpYyBwcm90ZWN0ZWQgZXhpdCBmb3JlYWNoIHRocm93IGVsc2VpZiBpbmNsdWRlIF9fRklMRV9fIGVtcHR5IHJlcXVpcmVfb25jZSBkbyB4b3IgcmV0dXJuIHBhcmVudCBjbG9uZSB1c2UgX19DTEFTU19fIF9fTElORV9fIGVsc2UgYnJlYWsgcHJpbnQgZXZhbCBuZXcgY2F0Y2ggX19NRVRIT0RfXyBjYXNlIGV4Y2VwdGlvbiBkZWZhdWx0IGRpZSByZXF1aXJlIF9fRlVOQ1RJT05fXyBlbmRkZWNsYXJlIGZpbmFsIHRyeSBzd2l0Y2ggY29udGludWUgZW5kZm9yIGVuZGlmIGRlY2xhcmUgdW5zZXQgdHJ1ZSBmYWxzZSB0cmFpdCBnb3RvIGluc3RhbmNlb2YgaW5zdGVhZG9mIF9fRElSX18gX19OQU1FU1BBQ0VfXyB5aWVsZCBmaW5hbGx5XCIsYzpbZS5DTENNLGUuSENNLGUuQyhcIi9cXFxcKlwiLFwiXFxcXCovXCIse2M6W3tjTjpcImRvY3RhZ1wiLGI6XCJAW0EtWmEtel0rXCJ9LHJdfSksZS5DKFwiX19oYWx0X2NvbXBpbGVyLis/O1wiLCExLHtlVzohMCxrOlwiX19oYWx0X2NvbXBpbGVyXCIsbDplLlVJUn0pLHtjTjpcInN0cmluZ1wiLGI6Lzw8PFsnXCJdP1xcdytbJ1wiXT8kLyxlOi9eXFx3Kzs/JC8sYzpbZS5CRSx7Y046XCJzdWJzdFwiLHY6W3tiOi9cXCRcXHcrL30se2I6L1xce1xcJC8sZTovXFx9L31dfV19LHIsdCx7YjovKDo6fC0+KStbYS16QS1aX1xceDdmLVxceGZmXVthLXpBLVowLTlfXFx4N2YtXFx4ZmZdKi99LHtjTjpcImZ1bmN0aW9uXCIsYks6XCJmdW5jdGlvblwiLGU6L1s7e10vLGVFOiEwLGk6XCJcXFxcJHxcXFxcW3wlXCIsYzpbZS5VVE0se2NOOlwicGFyYW1zXCIsYjpcIlxcXFwoXCIsZTpcIlxcXFwpXCIsYzpbXCJzZWxmXCIsdCxlLkNCQ00sYSxuXX1dfSx7Y046XCJjbGFzc1wiLGJLOlwiY2xhc3MgaW50ZXJmYWNlXCIsZTpcIntcIixlRTohMCxpOi9bOlxcKFxcJFwiXS8sYzpbe2JLOlwiZXh0ZW5kcyBpbXBsZW1lbnRzXCJ9LGUuVVRNXX0se2JLOlwibmFtZXNwYWNlXCIsZTpcIjtcIixpOi9bXFwuJ10vLGM6W2UuVVRNXX0se2JLOlwidXNlXCIsZTpcIjtcIixjOltlLlVUTV19LHtiOlwiPT5cIn0sYSxuXX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJweXRob25cIixmdW5jdGlvbihlKXt2YXIgdD17Y046XCJwcm9tcHRcIixiOi9eKD4+PnxcXC5cXC5cXC4pIC99LHI9e2NOOlwic3RyaW5nXCIsYzpbZS5CRV0sdjpbe2I6Lyh1fGIpP3I/JycnLyxlOi8nJycvLGM6W3RdLHI6MTB9LHtiOi8odXxiKT9yP1wiXCJcIi8sZTovXCJcIlwiLyxjOlt0XSxyOjEwfSx7YjovKHV8cnx1ciknLyxlOi8nLyxyOjEwfSx7YjovKHV8cnx1cilcIi8sZTovXCIvLHI6MTB9LHtiOi8oYnxiciknLyxlOi8nL30se2I6LyhifGJyKVwiLyxlOi9cIi99LGUuQVNNLGUuUVNNXX0sYT17Y046XCJudW1iZXJcIixyOjAsdjpbe2I6ZS5CTlIrXCJbbExqSl0/XCJ9LHtiOlwiXFxcXGIoMG9bMC03XSspW2xMakpdP1wifSx7YjplLkNOUitcIltsTGpKXT9cIn1dfSxuPXtjTjpcInBhcmFtc1wiLGI6L1xcKC8sZTovXFwpLyxjOltcInNlbGZcIix0LGEscl19O3JldHVybnthbGlhc2VzOltcInB5XCIsXCJneXBcIl0sazp7a2V5d29yZDpcImFuZCBlbGlmIGlzIGdsb2JhbCBhcyBpbiBpZiBmcm9tIHJhaXNlIGZvciBleGNlcHQgZmluYWxseSBwcmludCBpbXBvcnQgcGFzcyByZXR1cm4gZXhlYyBlbHNlIGJyZWFrIG5vdCB3aXRoIGNsYXNzIGFzc2VydCB5aWVsZCB0cnkgd2hpbGUgY29udGludWUgZGVsIG9yIGRlZiBsYW1iZGEgYXN5bmMgYXdhaXQgbm9ubG9jYWx8MTAgTm9uZSBUcnVlIEZhbHNlXCIsYnVpbHRfaW46XCJFbGxpcHNpcyBOb3RJbXBsZW1lbnRlZFwifSxpOi8oPFxcL3wtPnxcXD8pLyxjOlt0LGEscixlLkhDTSx7djpbe2NOOlwiZnVuY3Rpb25cIixiSzpcImRlZlwiLHI6MTB9LHtjTjpcImNsYXNzXCIsYks6XCJjbGFzc1wifV0sZTovOi8saTovWyR7PTtcXG4sXS8sYzpbZS5VVE0sbl19LHtjTjpcImRlY29yYXRvclwiLGI6L15bXFx0IF0qQC8sZTovJC99LHtiOi9cXGIocHJpbnR8ZXhlYylcXCgvfV19fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwicnVieVwiLGZ1bmN0aW9uKGUpe3ZhciB0PVwiW2EtekEtWl9dXFxcXHcqWyE/PV0/fFstK35dXFxcXEB8PDx8Pj58PX58PT09P3w8PT58Wzw+XT0/fFxcXFwqXFxcXCp8Wy0vKyVeJip+YHxdfFxcXFxbXFxcXF09P1wiLHI9XCJhbmQgZmFsc2UgdGhlbiBkZWZpbmVkIG1vZHVsZSBpbiByZXR1cm4gcmVkbyBpZiBCRUdJTiByZXRyeSBlbmQgZm9yIHRydWUgc2VsZiB3aGVuIG5leHQgdW50aWwgZG8gYmVnaW4gdW5sZXNzIEVORCByZXNjdWUgbmlsIGVsc2UgYnJlYWsgdW5kZWYgbm90IHN1cGVyIGNsYXNzIGNhc2UgcmVxdWlyZSB5aWVsZCBhbGlhcyB3aGlsZSBlbnN1cmUgZWxzaWYgb3IgaW5jbHVkZSBhdHRyX3JlYWRlciBhdHRyX3dyaXRlciBhdHRyX2FjY2Vzc29yXCIsYT17Y046XCJkb2N0YWdcIixiOlwiQFtBLVphLXpdK1wifSxuPXtjTjpcInZhbHVlXCIsYjpcIiM8XCIsZTpcIj5cIn0saT1bZS5DKFwiI1wiLFwiJFwiLHtjOlthXX0pLGUuQyhcIl5cXFxcPWJlZ2luXCIsXCJeXFxcXD1lbmRcIix7YzpbYV0scjoxMH0pLGUuQyhcIl5fX0VORF9fXCIsXCJcXFxcbiRcIildLHM9e2NOOlwic3Vic3RcIixiOlwiI1xcXFx7XCIsZTpcIn1cIixrOnJ9LGM9e2NOOlwic3RyaW5nXCIsYzpbZS5CRSxzXSx2Olt7YjovJy8sZTovJy99LHtiOi9cIi8sZTovXCIvfSx7YjovYC8sZTovYC99LHtiOlwiJVtxUXdXeF0/XFxcXChcIixlOlwiXFxcXClcIn0se2I6XCIlW3FRd1d4XT9cXFxcW1wiLGU6XCJcXFxcXVwifSx7YjpcIiVbcVF3V3hdP3tcIixlOlwifVwifSx7YjpcIiVbcVF3V3hdPzxcIixlOlwiPlwifSx7YjpcIiVbcVF3V3hdPy9cIixlOlwiL1wifSx7YjpcIiVbcVF3V3hdPyVcIixlOlwiJVwifSx7YjpcIiVbcVF3V3hdPy1cIixlOlwiLVwifSx7YjpcIiVbcVF3V3hdP1xcXFx8XCIsZTpcIlxcXFx8XCJ9LHtiOi9cXEJcXD8oXFxcXFxcZHsxLDN9fFxcXFx4W0EtRmEtZjAtOV17MSwyfXxcXFxcdVtBLUZhLWYwLTldezR9fFxcXFw/XFxTKVxcYi99XX0sbz17Y046XCJwYXJhbXNcIixiOlwiXFxcXChcIixlOlwiXFxcXClcIixrOnJ9LGw9W2Msbix7Y046XCJjbGFzc1wiLGJLOlwiY2xhc3MgbW9kdWxlXCIsZTpcIiR8O1wiLGk6Lz0vLGM6W2UuaW5oZXJpdChlLlRNLHtiOlwiW0EtWmEtel9dXFxcXHcqKDo6XFxcXHcrKSooXFxcXD98XFxcXCEpP1wifSkse2NOOlwiaW5oZXJpdGFuY2VcIixiOlwiPFxcXFxzKlwiLGM6W3tjTjpcInBhcmVudFwiLGI6XCIoXCIrZS5JUitcIjo6KT9cIitlLklSfV19XS5jb25jYXQoaSl9LHtjTjpcImZ1bmN0aW9uXCIsYks6XCJkZWZcIixlOlwiJHw7XCIsYzpbZS5pbmhlcml0KGUuVE0se2I6dH0pLG9dLmNvbmNhdChpKX0se2NOOlwiY29uc3RhbnRcIixiOlwiKDo6KT8oXFxcXGJbQS1aXVxcXFx3Kig6Oik/KStcIixyOjB9LHtjTjpcInN5bWJvbFwiLGI6ZS5VSVIrXCIoXFxcXCF8XFxcXD8pPzpcIixyOjB9LHtjTjpcInN5bWJvbFwiLGI6XCI6XCIsYzpbYyx7Yjp0fV0scjowfSx7Y046XCJudW1iZXJcIixiOlwiKFxcXFxiMFswLTdfXSspfChcXFxcYjB4WzAtOWEtZkEtRl9dKyl8KFxcXFxiWzEtOV1bMC05X10qKFxcXFwuWzAtOV9dKyk/KXxbMF9dXFxcXGJcIixyOjB9LHtjTjpcInZhcmlhYmxlXCIsYjpcIihcXFxcJFxcXFxXKXwoKFxcXFwkfFxcXFxAXFxcXEA/KShcXFxcdyspKVwifSx7YjpcIihcIitlLlJTUitcIilcXFxccypcIixjOltuLHtjTjpcInJlZ2V4cFwiLGM6W2UuQkUsc10saTovXFxuLyx2Olt7YjpcIi9cIixlOlwiL1thLXpdKlwifSx7YjpcIiVye1wiLGU6XCJ9W2Etel0qXCJ9LHtiOlwiJXJcXFxcKFwiLGU6XCJcXFxcKVthLXpdKlwifSx7YjpcIiVyIVwiLGU6XCIhW2Etel0qXCJ9LHtiOlwiJXJcXFxcW1wiLGU6XCJcXFxcXVthLXpdKlwifV19XS5jb25jYXQoaSkscjowfV0uY29uY2F0KGkpO3MuYz1sLG8uYz1sO3ZhciB1PVwiWz4/XT5cIixkPVwiW1xcXFx3I10rXFxcXChcXFxcdytcXFxcKTpcXFxcZCs6XFxcXGQrPlwiLGI9XCIoXFxcXHcrLSk/XFxcXGQrXFxcXC5cXFxcZCtcXFxcLlxcXFxkKHBcXFxcZCspP1tePl0rPlwiLHA9W3tiOi9eXFxzKj0+LyxjTjpcInN0YXR1c1wiLHN0YXJ0czp7ZTpcIiRcIixjOmx9fSx7Y046XCJwcm9tcHRcIixiOlwiXihcIit1K1wifFwiK2QrXCJ8XCIrYitcIilcIixzdGFydHM6e2U6XCIkXCIsYzpsfX1dO3JldHVybnthbGlhc2VzOltcInJiXCIsXCJnZW1zcGVjXCIsXCJwb2RzcGVjXCIsXCJ0aG9yXCIsXCJpcmJcIl0sazpyLGk6L1xcL1xcKi8sYzppLmNvbmNhdChwKS5jb25jYXQobCl9fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwic3FsXCIsZnVuY3Rpb24oZSl7dmFyIHQ9ZS5DKFwiLS1cIixcIiRcIik7cmV0dXJue2NJOiEwLGk6L1s8Pnt9Kl0vLGM6W3tjTjpcIm9wZXJhdG9yXCIsYks6XCJiZWdpbiBlbmQgc3RhcnQgY29tbWl0IHJvbGxiYWNrIHNhdmVwb2ludCBsb2NrIGFsdGVyIGNyZWF0ZSBkcm9wIHJlbmFtZSBjYWxsIGRlbGV0ZSBkbyBoYW5kbGVyIGluc2VydCBsb2FkIHJlcGxhY2Ugc2VsZWN0IHRydW5jYXRlIHVwZGF0ZSBzZXQgc2hvdyBwcmFnbWEgZ3JhbnQgbWVyZ2UgZGVzY3JpYmUgdXNlIGV4cGxhaW4gaGVscCBkZWNsYXJlIHByZXBhcmUgZXhlY3V0ZSBkZWFsbG9jYXRlIHJlbGVhc2UgdW5sb2NrIHB1cmdlIHJlc2V0IGNoYW5nZSBzdG9wIGFuYWx5emUgY2FjaGUgZmx1c2ggb3B0aW1pemUgcmVwYWlyIGtpbGwgaW5zdGFsbCB1bmluc3RhbGwgY2hlY2tzdW0gcmVzdG9yZSBjaGVjayBiYWNrdXAgcmV2b2tlXCIsZTovOy8sZVc6ITAsazp7a2V5d29yZDpcImFib3J0IGFicyBhYnNvbHV0ZSBhY2MgYWNjZSBhY2NlcCBhY2NlcHQgYWNjZXNzIGFjY2Vzc2VkIGFjY2Vzc2libGUgYWNjb3VudCBhY29zIGFjdGlvbiBhY3RpdmF0ZSBhZGQgYWRkdGltZSBhZG1pbiBhZG1pbmlzdGVyIGFkdmFuY2VkIGFkdmlzZSBhZXNfZGVjcnlwdCBhZXNfZW5jcnlwdCBhZnRlciBhZ2VudCBhZ2dyZWdhdGUgYWxpIGFsaWEgYWxpYXMgYWxsb2NhdGUgYWxsb3cgYWx0ZXIgYWx3YXlzIGFuYWx5emUgYW5jaWxsYXJ5IGFuZCBhbnkgYW55ZGF0YSBhbnlkYXRhc2V0IGFueXNjaGVtYSBhbnl0eXBlIGFwcGx5IGFyY2hpdmUgYXJjaGl2ZWQgYXJjaGl2ZWxvZyBhcmUgYXMgYXNjIGFzY2lpIGFzaW4gYXNzZW1ibHkgYXNzZXJ0aW9uIGFzc29jaWF0ZSBhc3luY2hyb25vdXMgYXQgYXRhbiBhdG4yIGF0dHIgYXR0cmkgYXR0cmliIGF0dHJpYnUgYXR0cmlidXQgYXR0cmlidXRlIGF0dHJpYnV0ZXMgYXVkaXQgYXV0aGVudGljYXRlZCBhdXRoZW50aWNhdGlvbiBhdXRoaWQgYXV0aG9ycyBhdXRvIGF1dG9hbGxvY2F0ZSBhdXRvZGJsaW5rIGF1dG9leHRlbmQgYXV0b21hdGljIGF2YWlsYWJpbGl0eSBhdmcgYmFja3VwIGJhZGZpbGUgYmFzaWNmaWxlIGJlZm9yZSBiZWdpbiBiZWdpbm5pbmcgYmVuY2htYXJrIGJldHdlZW4gYmZpbGUgYmZpbGVfYmFzZSBiaWcgYmlnZmlsZSBiaW4gYmluYXJ5X2RvdWJsZSBiaW5hcnlfZmxvYXQgYmlubG9nIGJpdF9hbmQgYml0X2NvdW50IGJpdF9sZW5ndGggYml0X29yIGJpdF94b3IgYml0bWFwIGJsb2JfYmFzZSBibG9jayBibG9ja3NpemUgYm9keSBib3RoIGJvdW5kIGJ1ZmZlcl9jYWNoZSBidWZmZXJfcG9vbCBidWlsZCBidWxrIGJ5IGJ5dGUgYnl0ZW9yZGVybWFyayBieXRlcyBjIGNhY2hlIGNhY2hpbmcgY2FsbCBjYWxsaW5nIGNhbmNlbCBjYXBhY2l0eSBjYXNjYWRlIGNhc2NhZGVkIGNhc2UgY2FzdCBjYXRhbG9nIGNhdGVnb3J5IGNlaWwgY2VpbGluZyBjaGFpbiBjaGFuZ2UgY2hhbmdlZCBjaGFyX2Jhc2UgY2hhcl9sZW5ndGggY2hhcmFjdGVyX2xlbmd0aCBjaGFyYWN0ZXJzIGNoYXJhY3RlcnNldCBjaGFyaW5kZXggY2hhcnNldCBjaGFyc2V0Zm9ybSBjaGFyc2V0aWQgY2hlY2sgY2hlY2tzdW0gY2hlY2tzdW1fYWdnIGNoaWxkIGNob29zZSBjaHIgY2h1bmsgY2xhc3MgY2xlYW51cCBjbGVhciBjbGllbnQgY2xvYiBjbG9iX2Jhc2UgY2xvbmUgY2xvc2UgY2x1c3Rlcl9pZCBjbHVzdGVyX3Byb2JhYmlsaXR5IGNsdXN0ZXJfc2V0IGNsdXN0ZXJpbmcgY29hbGVzY2UgY29lcmNpYmlsaXR5IGNvbCBjb2xsYXRlIGNvbGxhdGlvbiBjb2xsZWN0IGNvbHUgY29sdW0gY29sdW1uIGNvbHVtbl92YWx1ZSBjb2x1bW5zIGNvbHVtbnNfdXBkYXRlZCBjb21tZW50IGNvbW1pdCBjb21wYWN0IGNvbXBhdGliaWxpdHkgY29tcGlsZWQgY29tcGxldGUgY29tcG9zaXRlX2xpbWl0IGNvbXBvdW5kIGNvbXByZXNzIGNvbXB1dGUgY29uY2F0IGNvbmNhdF93cyBjb25jdXJyZW50IGNvbmZpcm0gY29ubiBjb25uZWMgY29ubmVjdCBjb25uZWN0X2J5X2lzY3ljbGUgY29ubmVjdF9ieV9pc2xlYWYgY29ubmVjdF9ieV9yb290IGNvbm5lY3RfdGltZSBjb25uZWN0aW9uIGNvbnNpZGVyIGNvbnNpc3RlbnQgY29uc3RhbnQgY29uc3RyYWludCBjb25zdHJhaW50cyBjb25zdHJ1Y3RvciBjb250YWluZXIgY29udGVudCBjb250ZW50cyBjb250ZXh0IGNvbnRyaWJ1dG9ycyBjb250cm9sZmlsZSBjb252IGNvbnZlcnQgY29udmVydF90eiBjb3JyIGNvcnJfayBjb3JyX3MgY29ycmVzcG9uZGluZyBjb3JydXB0aW9uIGNvcyBjb3N0IGNvdW50IGNvdW50X2JpZyBjb3VudGVkIGNvdmFyX3BvcCBjb3Zhcl9zYW1wIGNwdV9wZXJfY2FsbCBjcHVfcGVyX3Nlc3Npb24gY3JjMzIgY3JlYXRlIGNyZWF0aW9uIGNyaXRpY2FsIGNyb3NzIGN1YmUgY3VtZV9kaXN0IGN1cmRhdGUgY3VycmVudCBjdXJyZW50X2RhdGUgY3VycmVudF90aW1lIGN1cnJlbnRfdGltZXN0YW1wIGN1cnJlbnRfdXNlciBjdXJzb3IgY3VydGltZSBjdXN0b21kYXR1bSBjeWNsZSBkIGRhdGEgZGF0YWJhc2UgZGF0YWJhc2VzIGRhdGFmaWxlIGRhdGFmaWxlcyBkYXRhbGVuZ3RoIGRhdGVfYWRkIGRhdGVfY2FjaGUgZGF0ZV9mb3JtYXQgZGF0ZV9zdWIgZGF0ZWFkZCBkYXRlZGlmZiBkYXRlZnJvbXBhcnRzIGRhdGVuYW1lIGRhdGVwYXJ0IGRhdGV0aW1lMmZyb21wYXJ0cyBkYXkgZGF5X3RvX3NlY29uZCBkYXluYW1lIGRheW9mbW9udGggZGF5b2Z3ZWVrIGRheW9meWVhciBkYXlzIGRiX3JvbGVfY2hhbmdlIGRidGltZXpvbmUgZGRsIGRlYWxsb2NhdGUgZGVjbGFyZSBkZWNvZGUgZGVjb21wb3NlIGRlY3JlbWVudCBkZWNyeXB0IGRlZHVwbGljYXRlIGRlZiBkZWZhIGRlZmF1IGRlZmF1bCBkZWZhdWx0IGRlZmF1bHRzIGRlZmVycmVkIGRlZmkgZGVmaW4gZGVmaW5lIGRlZ3JlZXMgZGVsYXllZCBkZWxlZ2F0ZSBkZWxldGUgZGVsZXRlX2FsbCBkZWxpbWl0ZWQgZGVtYW5kIGRlbnNlX3JhbmsgZGVwdGggZGVxdWV1ZSBkZXNfZGVjcnlwdCBkZXNfZW5jcnlwdCBkZXNfa2V5X2ZpbGUgZGVzYyBkZXNjciBkZXNjcmkgZGVzY3JpYiBkZXNjcmliZSBkZXNjcmlwdG9yIGRldGVybWluaXN0aWMgZGlhZ25vc3RpY3MgZGlmZmVyZW5jZSBkaW1lbnNpb24gZGlyZWN0X2xvYWQgZGlyZWN0b3J5IGRpc2FibGUgZGlzYWJsZV9hbGwgZGlzYWxsb3cgZGlzYXNzb2NpYXRlIGRpc2NhcmRmaWxlIGRpc2Nvbm5lY3QgZGlza2dyb3VwIGRpc3RpbmN0IGRpc3RpbmN0cm93IGRpc3RyaWJ1dGUgZGlzdHJpYnV0ZWQgZGl2IGRvIGRvY3VtZW50IGRvbWFpbiBkb3RuZXQgZG91YmxlIGRvd25ncmFkZSBkcm9wIGR1bXBmaWxlIGR1cGxpY2F0ZSBkdXJhdGlvbiBlIGVhY2ggZWRpdGlvbiBlZGl0aW9uYWJsZSBlZGl0aW9ucyBlbGVtZW50IGVsbGlwc2lzIGVsc2UgZWxzaWYgZWx0IGVtcHR5IGVuYWJsZSBlbmFibGVfYWxsIGVuY2xvc2VkIGVuY29kZSBlbmNvZGluZyBlbmNyeXB0IGVuZCBlbmQtZXhlYyBlbmRpYW4gZW5mb3JjZWQgZW5naW5lIGVuZ2luZXMgZW5xdWV1ZSBlbnRlcnByaXNlIGVudGl0eWVzY2FwaW5nIGVvbW9udGggZXJyb3IgZXJyb3JzIGVzY2FwZWQgZXZhbG5hbWUgZXZhbHVhdGUgZXZlbnQgZXZlbnRkYXRhIGV2ZW50cyBleGNlcHQgZXhjZXB0aW9uIGV4Y2VwdGlvbnMgZXhjaGFuZ2UgZXhjbHVkZSBleGNsdWRpbmcgZXhlY3UgZXhlY3V0IGV4ZWN1dGUgZXhlbXB0IGV4aXN0cyBleGl0IGV4cCBleHBpcmUgZXhwbGFpbiBleHBvcnQgZXhwb3J0X3NldCBleHRlbmRlZCBleHRlbnQgZXh0ZXJuYWwgZXh0ZXJuYWxfMSBleHRlcm5hbF8yIGV4dGVybmFsbHkgZXh0cmFjdCBmIGZhaWxlZCBmYWlsZWRfbG9naW5fYXR0ZW1wdHMgZmFpbG92ZXIgZmFpbHVyZSBmYXIgZmFzdCBmZWF0dXJlX3NldCBmZWF0dXJlX3ZhbHVlIGZldGNoIGZpZWxkIGZpZWxkcyBmaWxlIGZpbGVfbmFtZV9jb252ZXJ0IGZpbGVzeXN0ZW1fbGlrZV9sb2dnaW5nIGZpbmFsIGZpbmlzaCBmaXJzdCBmaXJzdF92YWx1ZSBmaXhlZCBmbGFzaF9jYWNoZSBmbGFzaGJhY2sgZmxvb3IgZmx1c2ggZm9sbG93aW5nIGZvbGxvd3MgZm9yIGZvcmFsbCBmb3JjZSBmb3JtIGZvcm1hIGZvcm1hdCBmb3VuZCBmb3VuZF9yb3dzIGZyZWVsaXN0IGZyZWVsaXN0cyBmcmVlcG9vbHMgZnJlc2ggZnJvbSBmcm9tX2Jhc2U2NCBmcm9tX2RheXMgZnRwIGZ1bGwgZnVuY3Rpb24gZyBnZW5lcmFsIGdlbmVyYXRlZCBnZXQgZ2V0X2Zvcm1hdCBnZXRfbG9jayBnZXRkYXRlIGdldHV0Y2RhdGUgZ2xvYmFsIGdsb2JhbF9uYW1lIGdsb2JhbGx5IGdvIGdvdG8gZ3JhbnQgZ3JhbnRzIGdyZWF0ZXN0IGdyb3VwIGdyb3VwX2NvbmNhdCBncm91cF9pZCBncm91cGluZyBncm91cGluZ19pZCBncm91cHMgZ3RpZF9zdWJ0cmFjdCBndWFyYW50ZWUgZ3VhcmQgaGFuZGxlciBoYXNoIGhhc2hrZXlzIGhhdmluZyBoZWEgaGVhZCBoZWFkaSBoZWFkaW4gaGVhZGluZyBoZWFwIGhlbHAgaGV4IGhpZXJhcmNoeSBoaWdoIGhpZ2hfcHJpb3JpdHkgaG9zdHMgaG91ciBodHRwIGkgaWQgaWRlbnRfY3VycmVudCBpZGVudF9pbmNyIGlkZW50X3NlZWQgaWRlbnRpZmllZCBpZGVudGl0eSBpZGxlX3RpbWUgaWYgaWZudWxsIGlnbm9yZSBpaWYgaWxpa2UgaWxtIGltbWVkaWF0ZSBpbXBvcnQgaW4gaW5jbHVkZSBpbmNsdWRpbmcgaW5jcmVtZW50IGluZGV4IGluZGV4ZXMgaW5kZXhpbmcgaW5kZXh0eXBlIGluZGljYXRvciBpbmRpY2VzIGluZXQ2X2F0b24gaW5ldDZfbnRvYSBpbmV0X2F0b24gaW5ldF9udG9hIGluZmlsZSBpbml0aWFsIGluaXRpYWxpemVkIGluaXRpYWxseSBpbml0cmFucyBpbm1lbW9yeSBpbm5lciBpbm5vZGIgaW5wdXQgaW5zZXJ0IGluc3RhbGwgaW5zdGFuY2UgaW5zdGFudGlhYmxlIGluc3RyIGludGVyZmFjZSBpbnRlcmxlYXZlZCBpbnRlcnNlY3QgaW50byBpbnZhbGlkYXRlIGludmlzaWJsZSBpcyBpc19mcmVlX2xvY2sgaXNfaXB2NCBpc19pcHY0X2NvbXBhdCBpc19ub3QgaXNfbm90X251bGwgaXNfdXNlZF9sb2NrIGlzZGF0ZSBpc251bGwgaXNvbGF0aW9uIGl0ZXJhdGUgamF2YSBqb2luIGpzb24ganNvbl9leGlzdHMgayBrZWVwIGtlZXBfZHVwbGljYXRlcyBrZXkga2V5cyBraWxsIGwgbGFuZ3VhZ2UgbGFyZ2UgbGFzdCBsYXN0X2RheSBsYXN0X2luc2VydF9pZCBsYXN0X3ZhbHVlIGxheCBsY2FzZSBsZWFkIGxlYWRpbmcgbGVhc3QgbGVhdmVzIGxlZnQgbGVuIGxlbmdodCBsZW5ndGggbGVzcyBsZXZlbCBsZXZlbHMgbGlicmFyeSBsaWtlIGxpa2UyIGxpa2U0IGxpa2VjIGxpbWl0IGxpbmVzIGxpbmsgbGlzdCBsaXN0YWdnIGxpdHRsZSBsbiBsb2FkIGxvYWRfZmlsZSBsb2IgbG9icyBsb2NhbCBsb2NhbHRpbWUgbG9jYWx0aW1lc3RhbXAgbG9jYXRlIGxvY2F0b3IgbG9jayBsb2NrZWQgbG9nIGxvZzEwIGxvZzIgbG9nZmlsZSBsb2dmaWxlcyBsb2dnaW5nIGxvZ2ljYWwgbG9naWNhbF9yZWFkc19wZXJfY2FsbCBsb2dvZmYgbG9nb24gbG9ncyBsb25nIGxvb3AgbG93IGxvd19wcmlvcml0eSBsb3dlciBscGFkIGxydHJpbSBsdHJpbSBtIG1haW4gbWFrZV9zZXQgbWFrZWRhdGUgbWFrZXRpbWUgbWFuYWdlZCBtYW5hZ2VtZW50IG1hbnVhbCBtYXAgbWFwcGluZyBtYXNrIG1hc3RlciBtYXN0ZXJfcG9zX3dhaXQgbWF0Y2ggbWF0Y2hlZCBtYXRlcmlhbGl6ZWQgbWF4IG1heGV4dGVudHMgbWF4aW1pemUgbWF4aW5zdGFuY2VzIG1heGxlbiBtYXhsb2dmaWxlcyBtYXhsb2doaXN0b3J5IG1heGxvZ21lbWJlcnMgbWF4c2l6ZSBtYXh0cmFucyBtZDUgbWVhc3VyZXMgbWVkaWFuIG1lZGl1bSBtZW1iZXIgbWVtY29tcHJlc3MgbWVtb3J5IG1lcmdlIG1pY3Jvc2Vjb25kIG1pZCBtaWdyYXRpb24gbWluIG1pbmV4dGVudHMgbWluaW11bSBtaW5pbmcgbWludXMgbWludXRlIG1pbnZhbHVlIG1pc3NpbmcgbW9kIG1vZGUgbW9kZWwgbW9kaWZpY2F0aW9uIG1vZGlmeSBtb2R1bGUgbW9uaXRvcmluZyBtb250aCBtb250aHMgbW91bnQgbW92ZSBtb3ZlbWVudCBtdWx0aXNldCBtdXRleCBuIG5hbWUgbmFtZV9jb25zdCBuYW1lcyBuYW4gbmF0aW9uYWwgbmF0aXZlIG5hdHVyYWwgbmF2IG5jaGFyIG5jbG9iIG5lc3RlZCBuZXZlciBuZXcgbmV3bGluZSBuZXh0IG5leHR2YWwgbm8gbm9fd3JpdGVfdG9fYmlubG9nIG5vYXJjaGl2ZWxvZyBub2F1ZGl0IG5vYmFkZmlsZSBub2NoZWNrIG5vY29tcHJlc3Mgbm9jb3B5IG5vY3ljbGUgbm9kZWxheSBub2Rpc2NhcmRmaWxlIG5vZW50aXR5ZXNjYXBpbmcgbm9ndWFyYW50ZWUgbm9rZWVwIG5vbG9nZmlsZSBub21hcHBpbmcgbm9tYXh2YWx1ZSBub21pbmltaXplIG5vbWludmFsdWUgbm9tb25pdG9yaW5nIG5vbmUgbm9uZWRpdGlvbmFibGUgbm9uc2NoZW1hIG5vb3JkZXIgbm9wciBub3BybyBub3Byb20gbm9wcm9tcCBub3Byb21wdCBub3JlbHkgbm9yZXNldGxvZ3Mgbm9yZXZlcnNlIG5vcm1hbCBub3Jvd2RlcGVuZGVuY2llcyBub3NjaGVtYWNoZWNrIG5vc3dpdGNoIG5vdCBub3RoaW5nIG5vdGljZSBub3RyaW0gbm92YWxpZGF0ZSBub3cgbm93YWl0IG50aF92YWx1ZSBudWxsaWYgbnVsbHMgbnVtIG51bWIgbnVtYmUgbnZhcmNoYXIgbnZhcmNoYXIyIG9iamVjdCBvY2ljb2xsIG9jaWRhdGUgb2NpZGF0ZXRpbWUgb2NpZHVyYXRpb24gb2NpaW50ZXJ2YWwgb2NpbG9ibG9jYXRvciBvY2ludW1iZXIgb2NpcmVmIG9jaXJlZmN1cnNvciBvY2lyb3dpZCBvY2lzdHJpbmcgb2NpdHlwZSBvY3Qgb2N0ZXRfbGVuZ3RoIG9mIG9mZiBvZmZsaW5lIG9mZnNldCBvaWQgb2lkaW5kZXggb2xkIG9uIG9ubGluZSBvbmx5IG9wYXF1ZSBvcGVuIG9wZXJhdGlvbnMgb3BlcmF0b3Igb3B0aW1hbCBvcHRpbWl6ZSBvcHRpb24gb3B0aW9uYWxseSBvciBvcmFjbGUgb3JhY2xlX2RhdGUgb3JhZGF0YSBvcmQgb3JkYXVkaW8gb3JkZGljb20gb3JkZG9jIG9yZGVyIG9yZGltYWdlIG9yZGluYWxpdHkgb3JkdmlkZW8gb3JnYW5pemF0aW9uIG9ybGFueSBvcmx2YXJ5IG91dCBvdXRlciBvdXRmaWxlIG91dGxpbmUgb3V0cHV0IG92ZXIgb3ZlcmZsb3cgb3ZlcnJpZGluZyBwIHBhY2thZ2UgcGFkIHBhcmFsbGVsIHBhcmFsbGVsX2VuYWJsZSBwYXJhbWV0ZXJzIHBhcmVudCBwYXJzZSBwYXJ0aWFsIHBhcnRpdGlvbiBwYXJ0aXRpb25zIHBhc2NhbCBwYXNzaW5nIHBhc3N3b3JkIHBhc3N3b3JkX2dyYWNlX3RpbWUgcGFzc3dvcmRfbG9ja190aW1lIHBhc3N3b3JkX3JldXNlX21heCBwYXNzd29yZF9yZXVzZV90aW1lIHBhc3N3b3JkX3ZlcmlmeV9mdW5jdGlvbiBwYXRjaCBwYXRoIHBhdGluZGV4IHBjdGluY3JlYXNlIHBjdHRocmVzaG9sZCBwY3R1c2VkIHBjdHZlcnNpb24gcGVyY2VudCBwZXJjZW50X3JhbmsgcGVyY2VudGlsZV9jb250IHBlcmNlbnRpbGVfZGlzYyBwZXJmb3JtYW5jZSBwZXJpb2QgcGVyaW9kX2FkZCBwZXJpb2RfZGlmZiBwZXJtYW5lbnQgcGh5c2ljYWwgcGkgcGlwZSBwaXBlbGluZWQgcGl2b3QgcGx1Z2dhYmxlIHBsdWdpbiBwb2xpY3kgcG9zaXRpb24gcG9zdF90cmFuc2FjdGlvbiBwb3cgcG93ZXIgcHJhZ21hIHByZWJ1aWx0IHByZWNlZGVzIHByZWNlZGluZyBwcmVjaXNpb24gcHJlZGljdGlvbiBwcmVkaWN0aW9uX2Nvc3QgcHJlZGljdGlvbl9kZXRhaWxzIHByZWRpY3Rpb25fcHJvYmFiaWxpdHkgcHJlZGljdGlvbl9zZXQgcHJlcGFyZSBwcmVzZW50IHByZXNlcnZlIHByaW9yIHByaW9yaXR5IHByaXZhdGUgcHJpdmF0ZV9zZ2EgcHJpdmlsZWdlcyBwcm9jZWR1cmFsIHByb2NlZHVyZSBwcm9jZWR1cmVfYW5hbHl6ZSBwcm9jZXNzbGlzdCBwcm9maWxlcyBwcm9qZWN0IHByb21wdCBwcm90ZWN0aW9uIHB1YmxpYyBwdWJsaXNoaW5nc2VydmVybmFtZSBwdXJnZSBxdWFydGVyIHF1ZXJ5IHF1aWNrIHF1aWVzY2UgcXVvdGEgcXVvdGVuYW1lIHJhZGlhbnMgcmFpc2UgcmFuZCByYW5nZSByYW5rIHJhdyByZWFkIHJlYWRzIHJlYWRzaXplIHJlYnVpbGQgcmVjb3JkIHJlY29yZHMgcmVjb3ZlciByZWNvdmVyeSByZWN1cnNpdmUgcmVjeWNsZSByZWRvIHJlZHVjZWQgcmVmIHJlZmVyZW5jZSByZWZlcmVuY2VkIHJlZmVyZW5jZXMgcmVmZXJlbmNpbmcgcmVmcmVzaCByZWdleHBfbGlrZSByZWdpc3RlciByZWdyX2F2Z3ggcmVncl9hdmd5IHJlZ3JfY291bnQgcmVncl9pbnRlcmNlcHQgcmVncl9yMiByZWdyX3Nsb3BlIHJlZ3Jfc3h4IHJlZ3Jfc3h5IHJlamVjdCByZWtleSByZWxhdGlvbmFsIHJlbGF0aXZlIHJlbGF5bG9nIHJlbGVhc2UgcmVsZWFzZV9sb2NrIHJlbGllc19vbiByZWxvY2F0ZSByZWx5IHJlbSByZW1haW5kZXIgcmVuYW1lIHJlcGFpciByZXBlYXQgcmVwbGFjZSByZXBsaWNhdGUgcmVwbGljYXRpb24gcmVxdWlyZWQgcmVzZXQgcmVzZXRsb2dzIHJlc2l6ZSByZXNvdXJjZSByZXNwZWN0IHJlc3RvcmUgcmVzdHJpY3RlZCByZXN1bHQgcmVzdWx0X2NhY2hlIHJlc3VtYWJsZSByZXN1bWUgcmV0ZW50aW9uIHJldHVybiByZXR1cm5pbmcgcmV0dXJucyByZXVzZSByZXZlcnNlIHJldm9rZSByaWdodCBybGlrZSByb2xlIHJvbGVzIHJvbGxiYWNrIHJvbGxpbmcgcm9sbHVwIHJvdW5kIHJvdyByb3dfY291bnQgcm93ZGVwZW5kZW5jaWVzIHJvd2lkIHJvd251bSByb3dzIHJ0cmltIHJ1bGVzIHNhZmUgc2FsdCBzYW1wbGUgc2F2ZSBzYXZlcG9pbnQgc2IxIHNiMiBzYjQgc2NhbiBzY2hlbWEgc2NoZW1hY2hlY2sgc2NuIHNjb3BlIHNjcm9sbCBzZG9fZ2VvcmFzdGVyIHNkb190b3BvX2dlb21ldHJ5IHNlYXJjaCBzZWNfdG9fdGltZSBzZWNvbmQgc2VjdGlvbiBzZWN1cmVmaWxlIHNlY3VyaXR5IHNlZWQgc2VnbWVudCBzZWxlY3Qgc2VsZiBzZXF1ZW5jZSBzZXF1ZW50aWFsIHNlcmlhbGl6YWJsZSBzZXJ2ZXIgc2VydmVyZXJyb3Igc2Vzc2lvbiBzZXNzaW9uX3VzZXIgc2Vzc2lvbnNfcGVyX3VzZXIgc2V0IHNldHMgc2V0dGluZ3Mgc2hhIHNoYTEgc2hhMiBzaGFyZSBzaGFyZWQgc2hhcmVkX3Bvb2wgc2hvcnQgc2hvdyBzaHJpbmsgc2h1dGRvd24gc2lfYXZlcmFnZWNvbG9yIHNpX2NvbG9yaGlzdG9ncmFtIHNpX2ZlYXR1cmVsaXN0IHNpX3Bvc2l0aW9uYWxjb2xvciBzaV9zdGlsbGltYWdlIHNpX3RleHR1cmUgc2libGluZ3Mgc2lkIHNpZ24gc2luIHNpemUgc2l6ZV90IHNpemVzIHNraXAgc2xhdmUgc2xlZXAgc21hbGxkYXRldGltZWZyb21wYXJ0cyBzbWFsbGZpbGUgc25hcHNob3Qgc29tZSBzb25hbWUgc29ydCBzb3VuZGV4IHNvdXJjZSBzcGFjZSBzcGFyc2Ugc3BmaWxlIHNwbGl0IHNxbCBzcWxfYmlnX3Jlc3VsdCBzcWxfYnVmZmVyX3Jlc3VsdCBzcWxfY2FjaGUgc3FsX2NhbGNfZm91bmRfcm93cyBzcWxfc21hbGxfcmVzdWx0IHNxbF92YXJpYW50X3Byb3BlcnR5IHNxbGNvZGUgc3FsZGF0YSBzcWxlcnJvciBzcWxuYW1lIHNxbHN0YXRlIHNxcnQgc3F1YXJlIHN0YW5kYWxvbmUgc3RhbmRieSBzdGFydCBzdGFydGluZyBzdGFydHVwIHN0YXRlbWVudCBzdGF0aWMgc3RhdGlzdGljcyBzdGF0c19iaW5vbWlhbF90ZXN0IHN0YXRzX2Nyb3NzdGFiIHN0YXRzX2tzX3Rlc3Qgc3RhdHNfbW9kZSBzdGF0c19td190ZXN0IHN0YXRzX29uZV93YXlfYW5vdmEgc3RhdHNfdF90ZXN0XyBzdGF0c190X3Rlc3RfaW5kZXAgc3RhdHNfdF90ZXN0X29uZSBzdGF0c190X3Rlc3RfcGFpcmVkIHN0YXRzX3dzcl90ZXN0IHN0YXR1cyBzdGQgc3RkZGV2IHN0ZGRldl9wb3Agc3RkZGV2X3NhbXAgc3RkZXYgc3RvcCBzdG9yYWdlIHN0b3JlIHN0b3JlZCBzdHIgc3RyX3RvX2RhdGUgc3RyYWlnaHRfam9pbiBzdHJjbXAgc3RyaWN0IHN0cmluZyBzdHJ1Y3Qgc3R1ZmYgc3R5bGUgc3ViZGF0ZSBzdWJwYXJ0aXRpb24gc3VicGFydGl0aW9ucyBzdWJzdGl0dXRhYmxlIHN1YnN0ciBzdWJzdHJpbmcgc3VidGltZSBzdWJ0cmluZ19pbmRleCBzdWJ0eXBlIHN1Y2Nlc3Mgc3VtIHN1c3BlbmQgc3dpdGNoIHN3aXRjaG9mZnNldCBzd2l0Y2hvdmVyIHN5bmMgc3luY2hyb25vdXMgc3lub255bSBzeXMgc3lzX3htbGFnZyBzeXNhc20gc3lzYXV4IHN5c2RhdGUgc3lzZGF0ZXRpbWVvZmZzZXQgc3lzZGJhIHN5c29wZXIgc3lzdGVtIHN5c3RlbV91c2VyIHN5c3V0Y2RhdGV0aW1lIHQgdGFibGUgdGFibGVzIHRhYmxlc3BhY2UgdGFuIHRkbyB0ZW1wbGF0ZSB0ZW1wb3JhcnkgdGVybWluYXRlZCB0ZXJ0aWFyeV93ZWlnaHRzIHRlc3QgdGhhbiB0aGVuIHRocmVhZCB0aHJvdWdoIHRpZXIgdGllcyB0aW1lIHRpbWVfZm9ybWF0IHRpbWVfem9uZSB0aW1lZGlmZiB0aW1lZnJvbXBhcnRzIHRpbWVvdXQgdGltZXN0YW1wIHRpbWVzdGFtcGFkZCB0aW1lc3RhbXBkaWZmIHRpbWV6b25lX2FiYnIgdGltZXpvbmVfbWludXRlIHRpbWV6b25lX3JlZ2lvbiB0byB0b19iYXNlNjQgdG9fZGF0ZSB0b19kYXlzIHRvX3NlY29uZHMgdG9kYXRldGltZW9mZnNldCB0cmFjZSB0cmFja2luZyB0cmFuc2FjdGlvbiB0cmFuc2FjdGlvbmFsIHRyYW5zbGF0ZSB0cmFuc2xhdGlvbiB0cmVhdCB0cmlnZ2VyIHRyaWdnZXJfbmVzdGxldmVsIHRyaWdnZXJzIHRyaW0gdHJ1bmNhdGUgdHJ5X2Nhc3QgdHJ5X2NvbnZlcnQgdHJ5X3BhcnNlIHR5cGUgdWIxIHViMiB1YjQgdWNhc2UgdW5hcmNoaXZlZCB1bmJvdW5kZWQgdW5jb21wcmVzcyB1bmRlciB1bmRvIHVuaGV4IHVuaWNvZGUgdW5pZm9ybSB1bmluc3RhbGwgdW5pb24gdW5pcXVlIHVuaXhfdGltZXN0YW1wIHVua25vd24gdW5saW1pdGVkIHVubG9jayB1bnBpdm90IHVucmVjb3ZlcmFibGUgdW5zYWZlIHVuc2lnbmVkIHVudGlsIHVudHJ1c3RlZCB1bnVzYWJsZSB1bnVzZWQgdXBkYXRlIHVwZGF0ZWQgdXBncmFkZSB1cHBlZCB1cHBlciB1cHNlcnQgdXJsIHVyb3dpZCB1c2FibGUgdXNhZ2UgdXNlIHVzZV9zdG9yZWRfb3V0bGluZXMgdXNlciB1c2VyX2RhdGEgdXNlcl9yZXNvdXJjZXMgdXNlcnMgdXNpbmcgdXRjX2RhdGUgdXRjX3RpbWVzdGFtcCB1dWlkIHV1aWRfc2hvcnQgdmFsaWRhdGUgdmFsaWRhdGVfcGFzc3dvcmRfc3RyZW5ndGggdmFsaWRhdGlvbiB2YWxpc3QgdmFsdWUgdmFsdWVzIHZhciB2YXJfc2FtcCB2YXJjaGFyYyB2YXJpIHZhcmlhIHZhcmlhYiB2YXJpYWJsIHZhcmlhYmxlIHZhcmlhYmxlcyB2YXJpYW5jZSB2YXJwIHZhcnJhdyB2YXJyYXdjIHZhcnJheSB2ZXJpZnkgdmVyc2lvbiB2ZXJzaW9ucyB2aWV3IHZpcnR1YWwgdmlzaWJsZSB2b2lkIHdhaXQgd2FsbGV0IHdhcm5pbmcgd2FybmluZ3Mgd2VlayB3ZWVrZGF5IHdlZWtvZnllYXIgd2VsbGZvcm1lZCB3aGVuIHdoZW5lIHdoZW5ldiB3aGVuZXZlIHdoZW5ldmVyIHdoZXJlIHdoaWxlIHdoaXRlc3BhY2Ugd2l0aCB3aXRoaW4gd2l0aG91dCB3b3JrIHdyYXBwZWQgeGRiIHhtbCB4bWxhZ2cgeG1sYXR0cmlidXRlcyB4bWxjYXN0IHhtbGNvbGF0dHZhbCB4bWxlbGVtZW50IHhtbGV4aXN0cyB4bWxmb3Jlc3QgeG1saW5kZXggeG1sbmFtZXNwYWNlcyB4bWxwaSB4bWxxdWVyeSB4bWxyb290IHhtbHNjaGVtYSB4bWxzZXJpYWxpemUgeG1sdGFibGUgeG1sdHlwZSB4b3IgeWVhciB5ZWFyX3RvX21vbnRoIHllYXJzIHllYXJ3ZWVrXCIsXG5saXRlcmFsOlwidHJ1ZSBmYWxzZSBudWxsXCIsYnVpbHRfaW46XCJhcnJheSBiaWdpbnQgYmluYXJ5IGJpdCBibG9iIGJvb2xlYW4gY2hhciBjaGFyYWN0ZXIgZGF0ZSBkZWMgZGVjaW1hbCBmbG9hdCBpbnQgaW50OCBpbnRlZ2VyIGludGVydmFsIG51bWJlciBudW1lcmljIHJlYWwgcmVjb3JkIHNlcmlhbCBzZXJpYWw4IHNtYWxsaW50IHRleHQgdmFyY2hhciB2YXJ5aW5nIHZvaWRcIn0sYzpbe2NOOlwic3RyaW5nXCIsYjpcIidcIixlOlwiJ1wiLGM6W2UuQkUse2I6XCInJ1wifV19LHtjTjpcInN0cmluZ1wiLGI6J1wiJyxlOidcIicsYzpbZS5CRSx7YjonXCJcIid9XX0se2NOOlwic3RyaW5nXCIsYjpcImBcIixlOlwiYFwiLGM6W2UuQkVdfSxlLkNOTSxlLkNCQ00sdF19LGUuQ0JDTSx0XX19KSxlfSk7IiwiLyohXG4gKiBWaWV3ZXIgdjAuMS4xXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZmVuZ3l1YW5jaGVuL3ZpZXdlclxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNSBGZW5neXVhbiBDaGVuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqXG4gKiBEYXRlOiAyMDE1LTEwLTA3VDA2OjM0OjMxLjkxN1pcbiAqL1xuXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgaWYgKGZhbHNlICYmIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoJ3ZpZXdlcicsIFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKGZhbHNlICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGUgLyBDb21tb25KU1xuICAgIFxuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscy5cbiAgICBmYWN0b3J5KGpRdWVyeSk7XG4gIH1cbn0pKGZ1bmN0aW9uICgkKSB7XG5cbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuICB2YXIgJGRvY3VtZW50ID0gJChkb2N1bWVudCk7XG5cbiAgLy8gQ29uc3RhbnRzXG4gIHZhciBOQU1FU1BBQ0UgPSAndmlld2VyJztcbiAgdmFyIEVMRU1FTlRfVklFV0VSID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChOQU1FU1BBQ0UpO1xuXG4gIC8vIENsYXNzZXNcbiAgdmFyIENMQVNTX1RPR0dMRSA9ICd2aWV3ZXItdG9nZ2xlJztcbiAgdmFyIENMQVNTX0ZJWEVEID0gJ3ZpZXdlci1maXhlZCc7XG4gIHZhciBDTEFTU19PUEVOID0gJ3ZpZXdlci1vcGVuJztcbiAgdmFyIENMQVNTX1NIT1cgPSAndmlld2VyLXNob3cnO1xuICB2YXIgQ0xBU1NfSElERSA9ICd2aWV3ZXItaGlkZSc7XG4gIHZhciBDTEFTU19GQURFID0gJ3ZpZXdlci1mYWRlJztcbiAgdmFyIENMQVNTX0lOID0gJ3ZpZXdlci1pbic7XG4gIHZhciBDTEFTU19NT1ZFID0gJ3ZpZXdlci1tb3ZlJztcbiAgdmFyIENMQVNTX0FDVElWRSA9ICd2aWV3ZXItYWN0aXZlJztcbiAgdmFyIENMQVNTX0lOVklTSUJMRSA9ICd2aWV3ZXItaW52aXNpYmxlJztcbiAgdmFyIENMQVNTX1RSQU5TSVRJT04gPSAndmlld2VyLXRyYW5zaXRpb24nO1xuICB2YXIgQ0xBU1NfRlVMTFNDUkVFTiA9ICd2aWV3ZXItZnVsbHNjcmVlbic7XG4gIHZhciBDTEFTU19GVUxMU0NSRUVOX0VYSVQgPSAndmlld2VyLWZ1bGxzY3JlZW4tZXhpdCc7XG4gIHZhciBDTEFTU19DTE9TRSA9ICd2aWV3ZXItY2xvc2UnO1xuXG4gIC8vIFNlbGVjdG9yc1xuICB2YXIgU0VMRUNUT1JfSU1HID0gJ2ltZyc7XG5cbiAgLy8gRXZlbnRzXG4gIHZhciBFVkVOVF9NT1VTRURPV04gPSAnbW91c2Vkb3duIHRvdWNoc3RhcnQgcG9pbnRlcmRvd24gTVNQb2ludGVyRG93bic7XG4gIHZhciBFVkVOVF9NT1VTRU1PVkUgPSAnbW91c2Vtb3ZlIHRvdWNobW92ZSBwb2ludGVybW92ZSBNU1BvaW50ZXJNb3ZlJztcbiAgdmFyIEVWRU5UX01PVVNFVVAgPSAnbW91c2V1cCB0b3VjaGVuZCB0b3VjaGNhbmNlbCBwb2ludGVydXAgcG9pbnRlcmNhbmNlbCBNU1BvaW50ZXJVcCBNU1BvaW50ZXJDYW5jZWwnO1xuICB2YXIgRVZFTlRfV0hFRUwgPSAnd2hlZWwgbW91c2V3aGVlbCBET01Nb3VzZVNjcm9sbCc7XG4gIHZhciBFVkVOVF9UUkFOU0lUSU9ORU5EID0gJ3RyYW5zaXRpb25lbmQnO1xuICB2YXIgRVZFTlRfTE9BRCA9ICdsb2FkLicgKyBOQU1FU1BBQ0U7XG4gIHZhciBFVkVOVF9LRVlET1dOID0gJ2tleWRvd24uJyArIE5BTUVTUEFDRTtcbiAgdmFyIEVWRU5UX0NMSUNLID0gJ2NsaWNrLicgKyBOQU1FU1BBQ0U7XG4gIHZhciBFVkVOVF9SRVNJWkUgPSAncmVzaXplLicgKyBOQU1FU1BBQ0U7XG4gIHZhciBFVkVOVF9CVUlMRCA9ICdidWlsZC4nICsgTkFNRVNQQUNFO1xuICB2YXIgRVZFTlRfQlVJTFQgPSAnYnVpbHQuJyArIE5BTUVTUEFDRTtcbiAgdmFyIEVWRU5UX1NIT1cgPSAnc2hvdy4nICsgTkFNRVNQQUNFO1xuICB2YXIgRVZFTlRfU0hPV04gPSAnc2hvd24uJyArIE5BTUVTUEFDRTtcbiAgdmFyIEVWRU5UX0hJREUgPSAnaGlkZS4nICsgTkFNRVNQQUNFO1xuICB2YXIgRVZFTlRfSElEREVOID0gJ2hpZGRlbi4nICsgTkFNRVNQQUNFO1xuICB2YXIgRVZFTlRfVklFVyA9ICd2aWV3LicgKyBOQU1FU1BBQ0U7XG4gIHZhciBFVkVOVF9WSUVXRUQgPSAndmlld2VkLicgKyBOQU1FU1BBQ0U7XG5cbiAgLy8gU3VwcG9ydHNcbiAgdmFyIFNVUFBPUlRfVFJBTlNJVElPTiA9IHR5cGVvZiBFTEVNRU5UX1ZJRVdFUi5zdHlsZS50cmFuc2l0aW9uICE9PSAndW5kZWZpbmVkJztcblxuICAvLyBPdGhlcnNcbiAgdmFyIHJvdW5kID0gTWF0aC5yb3VuZDtcbiAgdmFyIHNxcnQgPSBNYXRoLnNxcnQ7XG4gIHZhciBhYnMgPSBNYXRoLmFicztcbiAgdmFyIG1pbiA9IE1hdGgubWluO1xuICB2YXIgbWF4ID0gTWF0aC5tYXg7XG4gIHZhciBudW0gPSBwYXJzZUZsb2F0O1xuXG4gIC8vIFByb3RvdHlwZVxuICB2YXIgcHJvdG90eXBlID0ge307XG5cbiAgZnVuY3Rpb24gaXNTdHJpbmcocykge1xuICAgIHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZyc7XG4gIH1cblxuICBmdW5jdGlvbiBpc051bWJlcihuKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBuID09PSAnbnVtYmVyJyAmJiAhaXNOYU4obik7XG4gIH1cblxuICBmdW5jdGlvbiBpc1VuZGVmaW5lZCh1KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB1ID09PSAndW5kZWZpbmVkJztcbiAgfVxuXG4gIGZ1bmN0aW9uIHRvQXJyYXkob2JqLCBvZmZzZXQpIHtcbiAgICB2YXIgYXJncyA9IFtdO1xuXG4gICAgaWYgKGlzTnVtYmVyKG9mZnNldCkpIHsgLy8gSXQncyBuZWNlc3NhcnkgZm9yIElFOFxuICAgICAgYXJncy5wdXNoKG9mZnNldCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZ3Muc2xpY2UuYXBwbHkob2JqLCBhcmdzKTtcbiAgfVxuXG4gIC8vIEN1c3RvbSBwcm94eSB0byBhdm9pZCBqUXVlcnkncyBndWlkXG4gIGZ1bmN0aW9uIHByb3h5KGZuLCBjb250ZXh0KSB7XG4gICAgdmFyIGFyZ3MgPSB0b0FycmF5KGFyZ3VtZW50cywgMik7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KHRvQXJyYXkoYXJndW1lbnRzKSkpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBnZXRUcmFuc2Zvcm0ob3B0aW9ucykge1xuICAgIHZhciB0cmFuc2Zvcm1zID0gW107XG4gICAgdmFyIHJvdGF0ZSA9IG9wdGlvbnMucm90YXRlO1xuICAgIHZhciBzY2FsZVggPSBvcHRpb25zLnNjYWxlWDtcbiAgICB2YXIgc2NhbGVZID0gb3B0aW9ucy5zY2FsZVk7XG5cbiAgICBpZiAoaXNOdW1iZXIocm90YXRlKSkge1xuICAgICAgdHJhbnNmb3Jtcy5wdXNoKCdyb3RhdGUoJyArIHJvdGF0ZSArICdkZWcpJyk7XG4gICAgfVxuXG4gICAgaWYgKGlzTnVtYmVyKHNjYWxlWCkgJiYgaXNOdW1iZXIoc2NhbGVZKSkge1xuICAgICAgdHJhbnNmb3Jtcy5wdXNoKCdzY2FsZSgnICsgc2NhbGVYICsgJywnICsgc2NhbGVZICsgJyknKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJhbnNmb3Jtcy5sZW5ndGggPyB0cmFuc2Zvcm1zLmpvaW4oJyAnKSA6ICdub25lJztcbiAgfVxuXG4gIC8vIGUuZy46IGh0dHA6Ly9kb21haW4uY29tL3BhdGgvdG8vcGljdHVyZS5qcGc/c2l6ZT0xMjgww5c5NjAgLT4gcGljdHVyZS5qcGdcbiAgZnVuY3Rpb24gZ2V0SW1hZ2VOYW1lKHVybCkge1xuICAgIHJldHVybiBpc1N0cmluZyh1cmwpID8gdXJsLnJlcGxhY2UoL14uKlxcLy8sICcnKS5yZXBsYWNlKC9bXFw/JiNdLiokLywgJycpIDogJyc7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRJbWFnZVNpemUoaW1hZ2UsIGNhbGxiYWNrKSB7XG4gICAgdmFyIG5ld0ltYWdlO1xuXG4gICAgLy8gTW9kZXJuIGJyb3dzZXJzXG4gICAgaWYgKGltYWdlLm5hdHVyYWxXaWR0aCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGltYWdlLm5hdHVyYWxXaWR0aCwgaW1hZ2UubmF0dXJhbEhlaWdodCk7XG4gICAgfVxuXG4gICAgLy8gSUU4OiBEb24ndCB1c2UgYG5ldyBJbWFnZSgpYCBoZXJlXG4gICAgbmV3SW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgIG5ld0ltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNhbGxiYWNrKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB9O1xuXG4gICAgbmV3SW1hZ2Uuc3JjID0gaW1hZ2Uuc3JjO1xuICB9XG5cbiAgZnVuY3Rpb24gVmlld2VyKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgVmlld2VyLkRFRkFVTFRTLCAkLmlzUGxhaW5PYmplY3Qob3B0aW9ucykgJiYgb3B0aW9ucyk7XG4gICAgdGhpcy5pc0ltZyA9IGZhbHNlO1xuICAgIHRoaXMuaXNCdWlsdCA9IGZhbHNlO1xuICAgIHRoaXMuaXNTaG93biA9IGZhbHNlO1xuICAgIHRoaXMuaXNWaWV3ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmlzRnVsbGVkID0gZmFsc2U7XG4gICAgdGhpcy5pc1BsYXllZCA9IGZhbHNlO1xuICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgIHRoaXMuZmFkaW5nID0gZmFsc2U7XG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gZmFsc2U7XG4gICAgdGhpcy5hY3Rpb24gPSBmYWxzZTtcbiAgICB0aGlzLnRhcmdldCA9IGZhbHNlO1xuICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gICQuZXh0ZW5kKHByb3RvdHlwZSwge1xuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICR0aGlzID0gdGhpcy4kZWxlbWVudDtcbiAgICAgIHZhciBpc0ltZyA9ICR0aGlzLmlzKFNFTEVDVE9SX0lNRyk7XG4gICAgICB2YXIgJGltYWdlcyA9IGlzSW1nID8gJHRoaXMgOiAkdGhpcy5maW5kKFNFTEVDVE9SX0lNRyk7XG4gICAgICBcbiAgICAgIHZhciBsZW5ndGggPSAkaW1hZ2VzLmxlbmd0aDtcbiAgICAgIHZhciByZWFkeSA9ICQucHJveHkodGhpcy5yZWFkeSwgdGhpcyk7XG5cbiAgICAgIGlmICghbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLmJ1aWxkKSkge1xuICAgICAgICAkdGhpcy5vbmUoRVZFTlRfQlVJTEQsIG9wdGlvbnMuYnVpbGQpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy50cmlnZ2VyKEVWRU5UX0JVSUxEKS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIE92ZXJyaWRlIGB0cmFuc2l0b25gIG9wdGlvbiBpZiBpdCBpcyBub3Qgc3VwcG9ydGVkXG4gICAgICBpZiAoIVNVUFBPUlRfVFJBTlNJVElPTikge1xuICAgICAgICBvcHRpb25zLnRyYW5zaXRpb24gPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pc0ltZyA9IGlzSW1nO1xuICAgICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgICB0aGlzLmNvdW50ID0gMDtcbiAgICAgIHRoaXMuJGltYWdlcyA9ICRpbWFnZXM7XG4gICAgICB0aGlzLiRib2R5ID0gJCgnYm9keScpO1xuXG4gICAgICBpZiAob3B0aW9ucy5pbmxpbmUpIHtcbiAgICAgICAgJHRoaXMub25lKEVWRU5UX0JVSUxULCAkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLnZpZXcoKTtcbiAgICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAgICRpbWFnZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuY29tcGxldGUpIHtcbiAgICAgICAgICAgIHJlYWR5KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQodGhpcykub25lKEVWRU5UX0xPQUQsIHJlYWR5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJGltYWdlcy5hZGRDbGFzcyhDTEFTU19UT0dHTEUpO1xuICAgICAgICAkdGhpcy5vbihFVkVOVF9DTElDSywgJC5wcm94eSh0aGlzLnN0YXJ0LCB0aGlzKSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlYWR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNvdW50Kys7XG5cbiAgICAgIGlmICh0aGlzLmNvdW50ID09PSB0aGlzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmJ1aWxkKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAkLmV4dGVuZChwcm90b3R5cGUsIHtcbiAgICBidWlsZDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJHRoaXMgPSB0aGlzLiRlbGVtZW50O1xuICAgICAgdmFyICRwYXJlbnQ7XG4gICAgICB2YXIgJHZpZXdlcjtcbiAgICAgIHZhciAkYnV0dG9uO1xuICAgICAgdmFyICR0b29sYmFyO1xuXG4gICAgICBpZiAodGhpcy5pc0J1aWx0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCEkcGFyZW50IHx8ICEkcGFyZW50Lmxlbmd0aCkge1xuICAgICAgICAkcGFyZW50ID0gJHRoaXMucGFyZW50KCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJHBhcmVudCA9ICRwYXJlbnQ7XG4gICAgICB0aGlzLiR2aWV3ZXIgPSAkdmlld2VyID0gJChWaWV3ZXIuVEVNUExBVEUpO1xuICAgICAgdGhpcy4kY2FudmFzID0gJHZpZXdlci5maW5kKCcudmlld2VyLWNhbnZhcycpO1xuICAgICAgdGhpcy4kZm9vdGVyID0gJHZpZXdlci5maW5kKCcudmlld2VyLWZvb3RlcicpO1xuICAgICAgdGhpcy4kdGl0bGUgPSAkdmlld2VyLmZpbmQoJy52aWV3ZXItdGl0bGUnKS50b2dnbGVDbGFzcyhDTEFTU19ISURFLCAhb3B0aW9ucy50aXRsZSk7XG4gICAgICB0aGlzLiR0b29sYmFyID0gJHRvb2xiYXIgPSAkdmlld2VyLmZpbmQoJy52aWV3ZXItdG9vbGJhcicpLnRvZ2dsZUNsYXNzKENMQVNTX0hJREUsICFvcHRpb25zLnRvb2xiYXIpO1xuICAgICAgdGhpcy4kbmF2YmFyID0gJHZpZXdlci5maW5kKCcudmlld2VyLW5hdmJhcicpLnRvZ2dsZUNsYXNzKENMQVNTX0hJREUsICFvcHRpb25zLm5hdmJhcik7XG4gICAgICB0aGlzLiRidXR0b24gPSAkYnV0dG9uID0gJHZpZXdlci5maW5kKCcudmlld2VyLWJ1dHRvbicpLnRvZ2dsZUNsYXNzKENMQVNTX0hJREUsICFvcHRpb25zLmJ1dHRvbik7XG4gICAgICB0aGlzLiR0b29sdGlwID0gJHZpZXdlci5maW5kKCcudmlld2VyLXRvb2x0aXAnKTtcbiAgICAgIHRoaXMuJHBsYXllciA9ICR2aWV3ZXIuZmluZCgnLnZpZXdlci1wbGF5ZXInKTtcbiAgICAgIHRoaXMuJGxpc3QgPSAkdmlld2VyLmZpbmQoJy52aWV3ZXItbGlzdCcpO1xuXG4gICAgICAkdG9vbGJhci5maW5kKCdsaVtjbGFzcyo9em9vbV0nKS50b2dnbGVDbGFzcyhDTEFTU19JTlZJU0lCTEUsICFvcHRpb25zLnpvb21hYmxlKTtcbiAgICAgICR0b29sYmFyLmZpbmQoJ2xpW2NsYXNzKj1mbGlwXScpLnRvZ2dsZUNsYXNzKENMQVNTX0lOVklTSUJMRSwgIW9wdGlvbnMuc2NhbGFibGUpO1xuXG4gICAgICBpZiAoIW9wdGlvbnMucm90YXRhYmxlKSB7XG4gICAgICAgICR0b29sYmFyLmZpbmQoJ2xpW2NsYXNzKj1yb3RhdGVdJykuYWRkQ2xhc3MoQ0xBU1NfSU5WSVNJQkxFKS5hcHBlbmRUbygkdG9vbGJhcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmlubGluZSkge1xuICAgICAgICAkYnV0dG9uLmFkZENsYXNzKENMQVNTX0ZVTExTQ1JFRU4pO1xuICAgICAgICAkdmlld2VyLmNzcygnei1pbmRleCcsIG9wdGlvbnMuekluZGV4SW5saW5lKTtcblxuICAgICAgICBpZiAoJHBhcmVudC5jc3MoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgJHBhcmVudC5jc3MoJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRidXR0b24uYWRkQ2xhc3MoQ0xBU1NfQ0xPU0UpO1xuICAgICAgICAkdmlld2VyLlxuICAgICAgICAgIGNzcygnei1pbmRleCcsIG9wdGlvbnMuekluZGV4KS5cbiAgICAgICAgICBhZGRDbGFzcyhbQ0xBU1NfRklYRUQsIENMQVNTX0ZBREUsIENMQVNTX0hJREVdLmpvaW4oJyAnKSk7XG4gICAgICB9XG5cbiAgICAgICR0aGlzLmFmdGVyKCR2aWV3ZXIpO1xuXG4gICAgICBpZiAob3B0aW9ucy5pbmxpbmUpIHtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgdGhpcy5iaW5kKCk7XG4gICAgICAgIHRoaXMuaXNTaG93biA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXNCdWlsdCA9IHRydWU7XG5cbiAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5idWlsdCkpIHtcbiAgICAgICAgJHRoaXMub25lKEVWRU5UX0JVSUxULCBvcHRpb25zLmJ1aWx0KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50cmlnZ2VyKEVWRU5UX0JVSUxUKTtcbiAgICB9LFxuXG4gICAgdW5idWlsZDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJHRoaXMgPSB0aGlzLiRlbGVtZW50O1xuXG4gICAgICBpZiAoIXRoaXMuaXNCdWlsdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmlubGluZSAmJiAhb3B0aW9ucy5jb250YWluZXIpIHtcbiAgICAgICAgJHRoaXMucmVtb3ZlQ2xhc3MoQ0xBU1NfSElERSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJHZpZXdlci5yZW1vdmUoKTtcbiAgICB9XG4gIH0pO1xuXG4gICQuZXh0ZW5kKHByb3RvdHlwZSwge1xuICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuJHZpZXdlci5cbiAgICAgICAgb24oRVZFTlRfQ0xJQ0ssICQucHJveHkodGhpcy5jbGljaywgdGhpcykpLlxuICAgICAgICBvbihFVkVOVF9XSEVFTCwgJC5wcm94eSh0aGlzLndoZWVsLCB0aGlzKSk7XG5cbiAgICAgIHRoaXMuJGNhbnZhcy5vbihFVkVOVF9NT1VTRURPV04sICQucHJveHkodGhpcy5tb3VzZWRvd24sIHRoaXMpKTtcblxuICAgICAgJGRvY3VtZW50LlxuICAgICAgICBvbihFVkVOVF9NT1VTRU1PVkUsICh0aGlzLl9tb3VzZW1vdmUgPSBwcm94eSh0aGlzLm1vdXNlbW92ZSwgdGhpcykpKS5cbiAgICAgICAgb24oRVZFTlRfTU9VU0VVUCwgKHRoaXMuX21vdXNldXAgPSBwcm94eSh0aGlzLm1vdXNldXAsIHRoaXMpKSkuXG4gICAgICAgIG9uKEVWRU5UX0tFWURPV04sICh0aGlzLl9rZXlkb3duID0gcHJveHkodGhpcy5rZXlkb3duLCB0aGlzKSkpO1xuXG4gICAgICAkd2luZG93Lm9uKEVWRU5UX1JFU0laRSwgKHRoaXMuX3Jlc2l6ZSA9IHByb3h5KHRoaXMucmVzaXplLCB0aGlzKSkpO1xuICAgIH0sXG5cbiAgICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuJHZpZXdlci5cbiAgICAgICAgb2ZmKEVWRU5UX0NMSUNLLCB0aGlzLmNsaWNrKS5cbiAgICAgICAgb2ZmKEVWRU5UX1dIRUVMLCB0aGlzLndoZWVsKTtcblxuICAgICAgdGhpcy4kY2FudmFzLm9mZihFVkVOVF9NT1VTRURPV04sIHRoaXMubW91c2Vkb3duKTtcblxuICAgICAgJGRvY3VtZW50LlxuICAgICAgICBvZmYoRVZFTlRfTU9VU0VNT1ZFLCB0aGlzLl9tb3VzZW1vdmUpLlxuICAgICAgICBvZmYoRVZFTlRfTU9VU0VVUCwgdGhpcy5fbW91c2V1cCkuXG4gICAgICAgIG9mZihFVkVOVF9LRVlET1dOLCB0aGlzLl9rZXlkb3duKTtcblxuICAgICAgJHdpbmRvdy5vZmYoRVZFTlRfUkVTSVpFLCB0aGlzLl9yZXNpemUpO1xuICAgIH1cbiAgfSk7XG5cbiAgJC5leHRlbmQocHJvdG90eXBlLCB7XG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmluaXRDb250YWluZXIoKTtcbiAgICAgIHRoaXMuaW5pdFZpZXdlcigpO1xuICAgICAgdGhpcy5pbml0TGlzdCgpO1xuICAgICAgdGhpcy5yZW5kZXJWaWV3ZXIoKTtcbiAgICB9LFxuXG4gICAgaW5pdENvbnRhaW5lcjogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jb250YWluZXIgPSB7XG4gICAgICAgIHdpZHRoOiAkd2luZG93LmlubmVyV2lkdGgoKSxcbiAgICAgICAgaGVpZ2h0OiAkd2luZG93LmlubmVySGVpZ2h0KClcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGluaXRWaWV3ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICRwYXJlbnQgPSB0aGlzLiRwYXJlbnQ7XG4gICAgICB2YXIgdmlld2VyO1xuXG4gICAgICBpZiAob3B0aW9ucy5pbmxpbmUpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSB2aWV3ZXIgPSB7XG4gICAgICAgICAgd2lkdGg6IG1heCgkcGFyZW50LndpZHRoKCksIG9wdGlvbnMubWluV2lkdGgpLFxuICAgICAgICAgIGhlaWdodDogbWF4KCRwYXJlbnQuaGVpZ2h0KCksIG9wdGlvbnMubWluSGVpZ2h0KVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc0Z1bGxlZCB8fCAhdmlld2VyKSB7XG4gICAgICAgIHZpZXdlciA9IHRoaXMuY29udGFpbmVyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnZpZXdlciA9ICQuZXh0ZW5kKHt9LCB2aWV3ZXIpO1xuICAgIH0sXG5cbiAgICByZW5kZXJWaWV3ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuaW5saW5lICYmICF0aGlzLmlzRnVsbGVkKSB7XG4gICAgICAgIHRoaXMuJHZpZXdlci5jc3ModGhpcy52aWV3ZXIpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBpbml0TGlzdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJHRoaXMgPSB0aGlzLiRlbGVtZW50O1xuICAgICAgdmFyICRsaXN0ID0gdGhpcy4kbGlzdDtcbiAgICAgIHZhciBsaXN0ID0gW107XG5cbiAgICAgIHRoaXMuJGltYWdlcy5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHZhciBzcmMgPSB0aGlzLnNyYztcbiAgICAgICAgdmFyIGFsdCA9IHRoaXMuYWx0IHx8IGdldEltYWdlTmFtZShzcmMpO1xuICAgICAgICB2YXIgdXJsID0gb3B0aW9ucy51cmw7XG5cbiAgICAgICAgaWYgKCFzcmMpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNTdHJpbmcodXJsKSkge1xuICAgICAgICAgIHVybCA9IHRoaXMuZ2V0QXR0cmlidXRlKHVybCk7XG4gICAgICAgIH0gZWxzZSBpZiAoJC5pc0Z1bmN0aW9uKHVybCkpIHtcbiAgICAgICAgICB1cmwgPSB1cmwuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3QucHVzaChcbiAgICAgICAgICAnPGxpPicgK1xuICAgICAgICAgICAgJzxpbWcnICtcbiAgICAgICAgICAgICAgJyBzcmM9XCInICsgc3JjICsgJ1wiJyArXG4gICAgICAgICAgICAgICcgZGF0YS1hY3Rpb249XCJ2aWV3XCInICtcbiAgICAgICAgICAgICAgJyBkYXRhLWluZGV4PVwiJyArICBpICsgJ1wiJyArXG4gICAgICAgICAgICAgICcgZGF0YS1vcmlnaW5hbC11cmw9XCInICsgICh1cmwgfHwgc3JjKSArICdcIicgK1xuICAgICAgICAgICAgICAnIGFsdD1cIicgKyAgYWx0ICsgJ1wiJyArXG4gICAgICAgICAgICAnPicgK1xuICAgICAgICAgICc8L2xpPidcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuXG4gICAgICAkbGlzdC5odG1sKGxpc3Quam9pbignJykpLmZpbmQoU0VMRUNUT1JfSU1HKS5vbmUoRVZFTlRfTE9BRCwge1xuICAgICAgICBmaWxsZWQ6IHRydWVcbiAgICAgIH0sICQucHJveHkodGhpcy5sb2FkSW1hZ2UsIHRoaXMpKTtcblxuICAgICAgdGhpcy4kaXRlbXMgPSAkbGlzdC5jaGlsZHJlbigpO1xuXG4gICAgICBpZiAob3B0aW9ucy50cmFuc2l0aW9uKSB7XG4gICAgICAgICR0aGlzLm9uZShFVkVOVF9WSUVXRUQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkbGlzdC5hZGRDbGFzcyhDTEFTU19UUkFOU0lUSU9OKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlckxpc3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgdmFyIGkgPSBpbmRleCB8fCB0aGlzLmluZGV4O1xuICAgICAgdmFyIHdpZHRoID0gdGhpcy4kaXRlbXMuZXEoaSkud2lkdGgoKTtcbiAgICAgIHZhciBvdXRlcldpZHRoID0gd2lkdGggKyAxOyAvLyAxIHBpeGVsIG9mIGBtYXJnaW4tbGVmdGAgd2lkdGhcblxuICAgICAgLy8gUGxhY2UgdGhlIGFjdGl2ZSBpdGVtIGluIHRoZSBjZW50ZXIgb2YgdGhlIHNjcmVlblxuICAgICAgdGhpcy4kbGlzdC5jc3Moe1xuICAgICAgICB3aWR0aDogb3V0ZXJXaWR0aCAqIHRoaXMubGVuZ3RoLFxuICAgICAgICBtYXJnaW5MZWZ0OiAodGhpcy52aWV3ZXIud2lkdGggLSB3aWR0aCkgLyAyIC0gb3V0ZXJXaWR0aCAqIGlcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZXNldExpc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuJGxpc3QuZW1wdHkoKS5yZW1vdmVDbGFzcyhDTEFTU19UUkFOU0lUSU9OKS5jc3MoJ21hcmdpbi1sZWZ0JywgMCk7XG4gICAgfSxcblxuICAgIGluaXRJbWFnZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkaW1hZ2UgPSB0aGlzLiRpbWFnZTtcbiAgICAgIHZhciB2aWV3ZXIgPSB0aGlzLnZpZXdlcjtcbiAgICAgIHZhciBmb290ZXJIZWlnaHQgPSB0aGlzLiRmb290ZXIuaGVpZ2h0KCk7XG4gICAgICB2YXIgdmlld2VyV2lkdGggPSB2aWV3ZXIud2lkdGg7XG4gICAgICB2YXIgdmlld2VySGVpZ2h0ID0gbWF4KHZpZXdlci5oZWlnaHQgLSBmb290ZXJIZWlnaHQsIGZvb3RlckhlaWdodCk7XG4gICAgICB2YXIgb2xkSW1hZ2UgPSB0aGlzLmltYWdlIHx8IHt9O1xuXG4gICAgICBnZXRJbWFnZVNpemUoJGltYWdlWzBdLCAkLnByb3h5KGZ1bmN0aW9uIChuYXR1cmFsV2lkdGgsIG5hdHVyYWxIZWlnaHQpIHtcbiAgICAgICAgdmFyIGFzcGVjdFJhdGlvID0gbmF0dXJhbFdpZHRoIC8gbmF0dXJhbEhlaWdodDtcbiAgICAgICAgdmFyIHdpZHRoID0gdmlld2VyV2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQgPSB2aWV3ZXJIZWlnaHQ7XG4gICAgICAgIHZhciBpbml0aWFsSW1hZ2U7XG4gICAgICAgIHZhciBpbWFnZTtcblxuICAgICAgICBpZiAodmlld2VySGVpZ2h0ICogYXNwZWN0UmF0aW8gPiB2aWV3ZXJXaWR0aCkge1xuICAgICAgICAgIGhlaWdodCA9IHZpZXdlcldpZHRoIC8gYXNwZWN0UmF0aW87XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2lkdGggPSB2aWV3ZXJIZWlnaHQgKiBhc3BlY3RSYXRpbztcbiAgICAgICAgfVxuXG4gICAgICAgIHdpZHRoID0gbWluKHdpZHRoICogMC45LCBuYXR1cmFsV2lkdGgpO1xuICAgICAgICBoZWlnaHQgPSBtaW4oaGVpZ2h0ICogMC45LCBuYXR1cmFsSGVpZ2h0KTtcblxuICAgICAgICBpbWFnZSA9IHtcbiAgICAgICAgICBuYXR1cmFsV2lkdGg6IG5hdHVyYWxXaWR0aCxcbiAgICAgICAgICBuYXR1cmFsSGVpZ2h0OiBuYXR1cmFsSGVpZ2h0LFxuICAgICAgICAgIGFzcGVjdFJhdGlvOiBhc3BlY3RSYXRpbyxcbiAgICAgICAgICByYXRpbzogd2lkdGggLyBuYXR1cmFsV2lkdGgsXG4gICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgIGxlZnQ6ICh2aWV3ZXJXaWR0aCAtIHdpZHRoKSAvIDIsXG4gICAgICAgICAgdG9wOiAodmlld2VySGVpZ2h0IC0gaGVpZ2h0KSAvIDJcbiAgICAgICAgfTtcblxuICAgICAgICBpbml0aWFsSW1hZ2UgPSAkLmV4dGVuZCh7fSwgaW1hZ2UpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnJvdGF0YWJsZSkge1xuICAgICAgICAgIGltYWdlLnJvdGF0ZSA9IG9sZEltYWdlLnJvdGF0ZSB8fCAwO1xuICAgICAgICAgIGluaXRpYWxJbWFnZS5yb3RhdGUgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuc2NhbGFibGUpIHtcbiAgICAgICAgICBpbWFnZS5zY2FsZVggPSBvbGRJbWFnZS5zY2FsZVggfHwgMTtcbiAgICAgICAgICBpbWFnZS5zY2FsZVkgPSBvbGRJbWFnZS5zY2FsZVkgfHwgMTtcbiAgICAgICAgICBpbml0aWFsSW1hZ2Uuc2NhbGVYID0gMTtcbiAgICAgICAgICBpbml0aWFsSW1hZ2Uuc2NhbGVZID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgdGhpcy5pbml0aWFsSW1hZ2UgPSBpbml0aWFsSW1hZ2U7XG5cbiAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIHJlbmRlckltYWdlOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG4gICAgICB2YXIgJGltYWdlID0gdGhpcy4kaW1hZ2U7XG5cbiAgICAgICRpbWFnZS5jc3Moe1xuICAgICAgICB3aWR0aDogaW1hZ2Uud2lkdGgsXG4gICAgICAgIGhlaWdodDogaW1hZ2UuaGVpZ2h0LFxuICAgICAgICBtYXJnaW5MZWZ0OiBpbWFnZS5sZWZ0LFxuICAgICAgICBtYXJnaW5Ub3A6IGltYWdlLnRvcCxcbiAgICAgICAgdHJhbnNmb3JtOiBnZXRUcmFuc2Zvcm0oaW1hZ2UpXG4gICAgICB9KTtcblxuICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50cmFuc2l0aW9uKSB7XG4gICAgICAgICAgJGltYWdlLm9uZShFVkVOVF9UUkFOU0lUSU9ORU5ELCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICByZXNldEltYWdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLiRpbWFnZS5yZW1vdmUoKTtcbiAgICAgIHRoaXMuJGltYWdlID0gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gICQuZXh0ZW5kKHByb3RvdHlwZSwge1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0O1xuXG4gICAgICBpZiAoJCh0YXJnZXQpLmhhc0NsYXNzKENMQVNTX1RPR0dMRSkpIHtcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjbGljazogZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XG4gICAgICB2YXIgYWN0aW9uID0gJHRhcmdldC5kYXRhKCdhY3Rpb24nKTtcbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG4gICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICBjYXNlICdtaXgnOlxuICAgICAgICAgIGlmICh0aGlzLmlzUGxheWVkKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbmxpbmUpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuaXNGdWxsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4aXQoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZ1bGwoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndmlldyc6XG4gICAgICAgICAgdGhpcy52aWV3KCR0YXJnZXQuZGF0YSgnaW5kZXgnKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnem9vbS1pbic6XG4gICAgICAgICAgdGhpcy56b29tKDAuMSwgdHJ1ZSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnem9vbS1vdXQnOlxuICAgICAgICAgIHRoaXMuem9vbSgtMC4xLCB0cnVlKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdvbmUtdG8tb25lJzpcbiAgICAgICAgICBpZiAodGhpcy5pbWFnZS5yYXRpbyA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy56b29tVG8odGhpcy5pbml0aWFsSW1hZ2UucmF0aW8pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnpvb21UbygxKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdyZXNldCc6XG4gICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3ByZXYnOlxuICAgICAgICAgIHRoaXMucHJldigpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3BsYXknOlxuICAgICAgICAgIHRoaXMucGxheSgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25leHQnOlxuICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3JvdGF0ZS1sZWZ0JzpcbiAgICAgICAgICB0aGlzLnJvdGF0ZSgtOTApO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3JvdGF0ZS1yaWdodCc6XG4gICAgICAgICAgdGhpcy5yb3RhdGUoOTApO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2ZsaXAtaG9yaXpvbnRhbCc6XG4gICAgICAgICAgdGhpcy5zY2FsZSgtaW1hZ2Uuc2NhbGVYIHx8IC0xLCBpbWFnZS5zY2FsZVkgfHwgMSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnZmxpcC12ZXJ0aWNhbCc6XG4gICAgICAgICAgdGhpcy5zY2FsZShpbWFnZS5zY2FsZVggfHwgMSwgLWltYWdlLnNjYWxlWSB8fCAtMSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAodGhpcy5pc1BsYXllZCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBsb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmluaXRJbWFnZSgkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZSgkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLmlzVmlld2VkID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnRyaWdnZXIoRVZFTlRfVklFV0VEKTtcbiAgICAgICAgfSwgdGhpcykpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICBsb2FkSW1hZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgaW1hZ2UgPSBlLnRhcmdldDtcbiAgICAgIHZhciAkaW1hZ2UgPSAkKGltYWdlKTtcbiAgICAgIHZhciAkcGFyZW50ID0gJGltYWdlLnBhcmVudCgpO1xuICAgICAgdmFyIHBhcmVudFdpZHRoID0gJHBhcmVudC53aWR0aCgpO1xuICAgICAgdmFyIHBhcmVudEhlaWdodCA9ICRwYXJlbnQuaGVpZ2h0KCk7XG4gICAgICB2YXIgZmlsbGVkID0gZS5kYXRhICYmIGUuZGF0YS5maWxsZWQ7XG5cbiAgICAgIGdldEltYWdlU2l6ZShpbWFnZSwgJC5wcm94eShmdW5jdGlvbiAobmF0dXJhbFdpZHRoLCBuYXR1cmFsSGVpZ2h0KSB7XG4gICAgICAgIHZhciBhc3BlY3RSYXRpbyA9IG5hdHVyYWxXaWR0aCAvIG5hdHVyYWxIZWlnaHQ7XG4gICAgICAgIHZhciB3aWR0aCA9IHBhcmVudFdpZHRoO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gcGFyZW50SGVpZ2h0O1xuXG4gICAgICAgIGlmIChwYXJlbnRIZWlnaHQgKiBhc3BlY3RSYXRpbyA+IHBhcmVudFdpZHRoKSB7XG4gICAgICAgICAgaWYgKGZpbGxlZCkge1xuICAgICAgICAgICAgd2lkdGggPSBwYXJlbnRIZWlnaHQgKiBhc3BlY3RSYXRpbztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGVpZ2h0ID0gcGFyZW50V2lkdGggLyBhc3BlY3RSYXRpbztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGZpbGxlZCkge1xuICAgICAgICAgICAgaGVpZ2h0ID0gcGFyZW50V2lkdGggLyBhc3BlY3RSYXRpbztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2lkdGggPSBwYXJlbnRIZWlnaHQgKiBhc3BlY3RSYXRpbztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkaW1hZ2UuY3NzKHtcbiAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgbWFyZ2luTGVmdDogKHBhcmVudFdpZHRoIC0gd2lkdGgpIC8gMixcbiAgICAgICAgICBtYXJnaW5Ub3A6IChwYXJlbnRIZWlnaHQgLSBoZWlnaHQpIC8gMlxuICAgICAgICB9KTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgcmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmluaXRDb250YWluZXIoKTtcbiAgICAgIHRoaXMuaW5pdFZpZXdlcigpO1xuICAgICAgdGhpcy5yZW5kZXJWaWV3ZXIoKTtcbiAgICAgIHRoaXMucmVuZGVyTGlzdCgpO1xuICAgICAgdGhpcy5pbml0SW1hZ2UoJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoKTtcbiAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgaWYgKHRoaXMuaXNQbGF5ZWQpIHtcbiAgICAgICAgdGhpcy4kcGxheWVyLlxuICAgICAgICAgIGZpbmQoU0VMRUNUT1JfSU1HKS5cbiAgICAgICAgICBvbmUoRVZFTlRfTE9BRCwgJC5wcm94eSh0aGlzLmxvYWRJbWFnZSwgdGhpcykpLlxuICAgICAgICAgIHRyaWdnZXIoRVZFTlRfTE9BRCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHdoZWVsOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBlID0gZXZlbnQub3JpZ2luYWxFdmVudDtcbiAgICAgIHZhciByYXRpbyA9IG51bSh0aGlzLm9wdGlvbnMuem9vbVJhdGlvKSB8fCAwLjE7XG4gICAgICB2YXIgZGVsdGEgPSAxO1xuXG4gICAgICBpZiAoIXRoaXMuaXNWaWV3ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAoZS5kZWx0YVkpIHtcbiAgICAgICAgZGVsdGEgPSBlLmRlbHRhWSA+IDAgPyAxIDogLTE7XG4gICAgICB9IGVsc2UgaWYgKGUud2hlZWxEZWx0YSkge1xuICAgICAgICBkZWx0YSA9IC1lLndoZWVsRGVsdGEgLyAxMjA7XG4gICAgICB9IGVsc2UgaWYgKGUuZGV0YWlsKSB7XG4gICAgICAgIGRlbHRhID0gZS5kZXRhaWwgPiAwID8gMSA6IC0xO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnpvb20oLWRlbHRhICogcmF0aW8sIHRydWUpO1xuICAgIH0sXG5cbiAgICBrZXlkb3duOiBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgd2hpY2ggPSBlLndoaWNoO1xuXG4gICAgICBpZiAoIXRoaXMuaXNGdWxsZWQgfHwgIW9wdGlvbnMua2V5Ym9hcmQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKHdoaWNoKSB7XG5cbiAgICAgICAgLy8gKEtleTogRXNjKVxuICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgIGlmICh0aGlzLmlzUGxheWVkKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuaW5saW5lKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmlzRnVsbGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5leGl0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIFZpZXcgcHJldmlvdXMgKEtleTog4oaQKVxuICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgIHRoaXMucHJldigpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIFpvb20gaW4gKEtleTog4oaRKVxuICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgIHRoaXMuem9vbShvcHRpb25zLnpvb21SYXRpbywgdHJ1ZSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy8gVmlldyBuZXh0IChLZXk6IOKGkilcbiAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBab29tIG91dCAoS2V5OiDihpMpXG4gICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgdGhpcy56b29tKC1vcHRpb25zLnpvb21SYXRpbywgdHJ1ZSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy8gWm9vbSBvdXQgdG8gaW5pdGlhbCBzaXplIChLZXk6IEN0cmwgKyAwKVxuICAgICAgICBjYXNlIDQ4OlxuICAgICAgICAgIC8vIEdvIHRvIG5leHRcblxuICAgICAgICAvLyBab29tIGluIHRvIG5hdHVyYWwgc2l6ZSAoS2V5OiBDdHJsICsgMSlcbiAgICAgICAgY2FzZSA0OTpcbiAgICAgICAgICBpZiAoZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2UucmF0aW8gPT09IDEpIHtcbiAgICAgICAgICAgICAgdGhpcy56b29tVG8odGhpcy5pbml0aWFsSW1hZ2UucmF0aW8pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy56b29tVG8oMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy8gTm8gZGVmYXVsdFxuICAgICAgfVxuICAgIH0sXG5cbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgb3JpZ2luYWxFdmVudCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XG4gICAgICB2YXIgdG91Y2hlcyA9IG9yaWdpbmFsRXZlbnQgJiYgb3JpZ2luYWxFdmVudC50b3VjaGVzO1xuICAgICAgdmFyIGUgPSBldmVudDtcbiAgICAgIHZhciBhY3Rpb24gPSBvcHRpb25zLm1vdmFibGUgPyAnbW92ZScgOiBmYWxzZTtcbiAgICAgIHZhciB0b3VjaGVzTGVuZ3RoO1xuXG4gICAgICBpZiAoIXRoaXMuaXNWaWV3ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodG91Y2hlcykge1xuICAgICAgICB0b3VjaGVzTGVuZ3RoID0gdG91Y2hlcy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKHRvdWNoZXNMZW5ndGggPiAxKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMuem9vbWFibGUgJiYgdG91Y2hlc0xlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgZSA9IHRvdWNoZXNbMV07XG4gICAgICAgICAgICB0aGlzLnN0YXJ0WDIgPSBlLnBhZ2VYO1xuICAgICAgICAgICAgdGhpcy5zdGFydFkyID0gZS5wYWdlWTtcbiAgICAgICAgICAgIGFjdGlvbiA9ICd6b29tJztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5pc1N3aXRjaGFibGUoKSkge1xuICAgICAgICAgICAgYWN0aW9uID0gJ3N3aXRjaCc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZSA9IHRvdWNoZXNbMF07XG4gICAgICB9XG5cbiAgICAgIGlmIChhY3Rpb24pIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5hY3Rpb24gPSBhY3Rpb247XG5cbiAgICAgICAgLy8gSUU4ICBoYXMgYGV2ZW50LnBhZ2VYL1lgLCBidXQgbm90IGBldmVudC5vcmlnaW5hbEV2ZW50LnBhZ2VYL1lgXG4gICAgICAgIC8vIElFMTAgaGFzIGBldmVudC5vcmlnaW5hbEV2ZW50LnBhZ2VYL1lgLCBidXQgbm90IGBldmVudC5wYWdlWC9ZYFxuICAgICAgICB0aGlzLnN0YXJ0WCA9IGUucGFnZVggfHwgb3JpZ2luYWxFdmVudCAmJiBvcmlnaW5hbEV2ZW50LnBhZ2VYO1xuICAgICAgICB0aGlzLnN0YXJ0WSA9IGUucGFnZVkgfHwgb3JpZ2luYWxFdmVudCAmJiBvcmlnaW5hbEV2ZW50LnBhZ2VZO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBtb3VzZW1vdmU6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgYWN0aW9uID0gdGhpcy5hY3Rpb247XG4gICAgICB2YXIgJGltYWdlID0gdGhpcy4kaW1hZ2U7XG4gICAgICB2YXIgb3JpZ2luYWxFdmVudCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XG4gICAgICB2YXIgdG91Y2hlcyA9IG9yaWdpbmFsRXZlbnQgJiYgb3JpZ2luYWxFdmVudC50b3VjaGVzO1xuICAgICAgdmFyIGUgPSBldmVudDtcbiAgICAgIHZhciB0b3VjaGVzTGVuZ3RoO1xuXG4gICAgICBpZiAoIXRoaXMuaXNWaWV3ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodG91Y2hlcykge1xuICAgICAgICB0b3VjaGVzTGVuZ3RoID0gdG91Y2hlcy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKHRvdWNoZXNMZW5ndGggPiAxKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMuem9vbWFibGUgJiYgdG91Y2hlc0xlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgZSA9IHRvdWNoZXNbMV07XG4gICAgICAgICAgICB0aGlzLmVuZFgyID0gZS5wYWdlWDtcbiAgICAgICAgICAgIHRoaXMuZW5kWTIgPSBlLnBhZ2VZO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZSA9IHRvdWNoZXNbMF07XG4gICAgICB9XG5cbiAgICAgIGlmIChhY3Rpb24pIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoYWN0aW9uID09PSAnbW92ZScgJiYgb3B0aW9ucy50cmFuc2l0aW9uICYmICRpbWFnZS5oYXNDbGFzcyhDTEFTU19UUkFOU0lUSU9OKSkge1xuICAgICAgICAgICRpbWFnZS5yZW1vdmVDbGFzcyhDTEFTU19UUkFOU0lUSU9OKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW5kWCA9IGUucGFnZVggfHwgb3JpZ2luYWxFdmVudCAmJiBvcmlnaW5hbEV2ZW50LnBhZ2VYO1xuICAgICAgICB0aGlzLmVuZFkgPSBlLnBhZ2VZIHx8IG9yaWdpbmFsRXZlbnQgJiYgb3JpZ2luYWxFdmVudC5wYWdlWTtcblxuICAgICAgICB0aGlzLmNoYW5nZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBtb3VzZXVwOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHZhciBhY3Rpb24gPSB0aGlzLmFjdGlvbjtcblxuICAgICAgaWYgKGFjdGlvbikge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmIChhY3Rpb24gPT09ICdtb3ZlJyAmJiB0aGlzLm9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgICAgIHRoaXMuJGltYWdlLmFkZENsYXNzKENMQVNTX1RSQU5TSVRJT04pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3Rpb24gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gICQuZXh0ZW5kKHByb3RvdHlwZSwge1xuXG4gICAgLy8gU2hvdyB0aGUgdmlld2VyIChvbmx5IGF2YWlsYWJsZSBpbiBtb2RhbCBtb2RlKVxuICAgIHNob3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICR2aWV3ZXI7XG5cbiAgICAgIGlmIChvcHRpb25zLmlubGluZSB8fCB0aGlzLnRyYW5zaXRpb25pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaXNCdWlsdCkge1xuICAgICAgICB0aGlzLmJ1aWxkKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5zaG93KSkge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uZShFVkVOVF9TSE9XLCBvcHRpb25zLnNob3cpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy50cmlnZ2VyKEVWRU5UX1NIT1cpLmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy4kYm9keS5hZGRDbGFzcyhDTEFTU19PUEVOKTtcbiAgICAgICR2aWV3ZXIgPSB0aGlzLiR2aWV3ZXIucmVtb3ZlQ2xhc3MoQ0xBU1NfSElERSk7XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQub25lKEVWRU5UX1NIT1dOLCAkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy52aWV3KCh0aGlzLnRhcmdldCA/IHRoaXMuJGltYWdlcy5pbmRleCh0aGlzLnRhcmdldCkgOiAwKSB8fCB0aGlzLmluZGV4KTtcbiAgICAgICAgdGhpcy50YXJnZXQgPSBmYWxzZTtcbiAgICAgIH0sIHRoaXMpKTtcblxuICAgICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSB0cnVlO1xuXG4gICAgICAgIC8qIGpzaGludCBleHByOnRydWUgKi9cbiAgICAgICAgJHZpZXdlci5hZGRDbGFzcyhDTEFTU19UUkFOU0lUSU9OKS5nZXQoMCkub2Zmc2V0V2lkdGg7XG4gICAgICAgICR2aWV3ZXIub25lKEVWRU5UX1RSQU5TSVRJT05FTkQsICQucHJveHkodGhpcy5zaG93biwgdGhpcykpLmFkZENsYXNzKENMQVNTX0lOKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICR2aWV3ZXIuYWRkQ2xhc3MoQ0xBU1NfSU4pO1xuICAgICAgICB0aGlzLnNob3duKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIEhpZGUgdGhlIHZpZXdlciAob25seSBhdmFpbGFibGUgaW4gbW9kYWwgbW9kZSlcbiAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkdmlld2VyID0gdGhpcy4kdmlld2VyO1xuXG4gICAgICBpZiAob3B0aW9ucy5pbmxpbmUgfHwgdGhpcy50cmFuc2l0aW9uaW5nIHx8ICF0aGlzLmlzU2hvd24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMuaGlkZSkpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRVZFTlRfSElERSwgb3B0aW9ucy5oaWRlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudHJpZ2dlcihFVkVOVF9ISURFKS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlzVmlld2VkICYmIG9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLiRpbWFnZS5vbmUoRVZFTlRfVFJBTlNJVElPTkVORCwgJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJHZpZXdlci5vbmUoRVZFTlRfVFJBTlNJVElPTkVORCwgJC5wcm94eSh0aGlzLmhpZGRlbiwgdGhpcykpLnJlbW92ZUNsYXNzKENMQVNTX0lOKTtcbiAgICAgICAgfSwgdGhpcykpO1xuICAgICAgICB0aGlzLnpvb21UbygwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkdmlld2VyLnJlbW92ZUNsYXNzKENMQVNTX0lOKTtcbiAgICAgICAgdGhpcy5oaWRkZW4oKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVmlldyBvbmUgb2YgdGhlIGltYWdlcyB3aXRoIGltYWdlJ3MgaW5kZXhcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgICAqL1xuICAgIHZpZXc6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgdmlld2VyID0gdGhpcy52aWV3ZXI7XG4gICAgICB2YXIgJHRpdGxlID0gdGhpcy4kdGl0bGU7XG4gICAgICB2YXIgJGltYWdlO1xuICAgICAgdmFyICRpdGVtO1xuICAgICAgdmFyICRpbWc7XG4gICAgICB2YXIgdXJsO1xuICAgICAgdmFyIGFsdDtcblxuICAgICAgaW5kZXggPSBOdW1iZXIoaW5kZXgpIHx8IDA7XG5cbiAgICAgIGlmICghdGhpcy5pc1Nob3duIHx8IHRoaXMuaXNQbGF5ZWQgfHwgaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMubGVuZ3RoIHx8XG4gICAgICAgIHRoaXMuaXNWaWV3ZWQgJiYgaW5kZXggPT09IHRoaXMuaW5kZXgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy50cmlnZ2VyKEVWRU5UX1ZJRVcpLmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgJGl0ZW0gPSB0aGlzLiRpdGVtcy5lcShpbmRleCk7XG4gICAgICAkaW1nID0gJGl0ZW0uZmluZChTRUxFQ1RPUl9JTUcpO1xuICAgICAgdXJsID0gJGltZy5kYXRhKCdvcmlnaW5hbFVybCcpO1xuICAgICAgYWx0ID0gJGltZy5hdHRyKCdhbHQnKTtcblxuICAgICAgdGhpcy4kaW1hZ2UgPSAkaW1hZ2UgPSAkKCc8aW1nIHNyYz1cIicgKyB1cmwgKyAnXCIgYWx0PVwiJyArIGFsdCArICdcIj4nKTtcblxuICAgICAgJGltYWdlLlxuICAgICAgICB0b2dnbGVDbGFzcyhDTEFTU19UUkFOU0lUSU9OLCBvcHRpb25zLnRyYW5zaXRpb24pLlxuICAgICAgICB0b2dnbGVDbGFzcyhDTEFTU19NT1ZFLCBvcHRpb25zLm1vdmFibGUpLlxuICAgICAgICBjc3Moe1xuICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgICBtYXJnaW5MZWZ0OiB2aWV3ZXIud2lkdGggLyAyLFxuICAgICAgICAgIG1hcmdpblRvcDogdmlld2VyLmhlaWdodCAvIDJcbiAgICAgICAgfSk7XG5cbiAgICAgIHRoaXMuJGl0ZW1zLmVxKHRoaXMuaW5kZXgpLnJlbW92ZUNsYXNzKENMQVNTX0FDVElWRSk7XG4gICAgICAkaXRlbS5hZGRDbGFzcyhDTEFTU19BQ1RJVkUpO1xuXG4gICAgICB0aGlzLmlzVmlld2VkID0gZmFsc2U7XG4gICAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gICAgICB0aGlzLmltYWdlID0gbnVsbDtcbiAgICAgICRpbWFnZS5vbmUoRVZFTlRfTE9BRCwgJC5wcm94eSh0aGlzLmxvYWQsIHRoaXMpKTtcbiAgICAgIHRoaXMuJGNhbnZhcy5odG1sKCRpbWFnZSk7XG4gICAgICAkdGl0bGUuZW1wdHkoKTtcblxuICAgICAgLy8gQ2VudGVyIGN1cnJlbnQgaXRlbVxuICAgICAgdGhpcy5yZW5kZXJMaXN0KCk7XG5cbiAgICAgIC8vIFNob3cgdGl0bGUgd2hlbiB2aWV3ZWRcbiAgICAgIHRoaXMuJGVsZW1lbnQub25lKEVWRU5UX1ZJRVdFRCwgJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG4gICAgICAgIHZhciB3aWR0aCA9IGltYWdlLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgdmFyIGhlaWdodCA9IGltYWdlLm5hdHVyYWxIZWlnaHQ7XG5cbiAgICAgICAgJHRpdGxlLmh0bWwoYWx0ICsgJyAoJyArIHdpZHRoICsgJyAmdGltZXM7ICcgKyBoZWlnaHQgKyAnKScpO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBWaWV3IHRoZSBwcmV2aW91cyBpbWFnZVxuICAgIHByZXY6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMudmlldyhtYXgodGhpcy5pbmRleCAtIDEsIDApKTtcbiAgICB9LFxuXG4gICAgLy8gVmlldyB0aGUgbmV4dCBpbWFnZVxuICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMudmlldyhtaW4odGhpcy5pbmRleCArIDEsIHRoaXMubGVuZ3RoIC0gMSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRoZSBpbWFnZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldFhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0WSAob3B0aW9uYWwpXG4gICAgICovXG4gICAgbW92ZTogZnVuY3Rpb24gKG9mZnNldFgsIG9mZnNldFkpIHtcbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG5cbiAgICAgIC8vIElmIFwib2Zmc2V0WVwiIGlzIG5vdCBwcmVzZW50LCBpdHMgZGVmYXVsdCB2YWx1ZSBpcyBcIm9mZnNldFhcIlxuICAgICAgaWYgKGlzVW5kZWZpbmVkKG9mZnNldFkpKSB7XG4gICAgICAgIG9mZnNldFkgPSBvZmZzZXRYO1xuICAgICAgfVxuXG4gICAgICBvZmZzZXRYID0gbnVtKG9mZnNldFgpO1xuICAgICAgb2Zmc2V0WSA9IG51bShvZmZzZXRZKTtcblxuICAgICAgaWYgKHRoaXMuaXNTaG93biAmJiAhdGhpcy5pc1BsYXllZCAmJiB0aGlzLm9wdGlvbnMubW92YWJsZSkge1xuICAgICAgICBpbWFnZS5sZWZ0ICs9IGlzTnVtYmVyKG9mZnNldFgpID8gb2Zmc2V0WCA6IDA7XG4gICAgICAgIGltYWdlLnRvcCArPSBpc051bWJlcihvZmZzZXRZKSA/IG9mZnNldFkgOiAwO1xuICAgICAgICB0aGlzLnJlbmRlckltYWdlKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFpvb20gdGhlIGltYWdlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcmF0aW9cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGhhc1Rvb2x0aXAgKG9wdGlvbmFsKVxuICAgICAqL1xuICAgIHpvb206IGZ1bmN0aW9uIChyYXRpbywgaGFzVG9vbHRpcCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgbWluWm9vbVJhdGlvID0gbWF4KDAuMDEsIG9wdGlvbnMubWluWm9vbVJhdGlvKTtcbiAgICAgIHZhciBtYXhab29tUmF0aW8gPSBtaW4oMTAwLCBvcHRpb25zLm1heFpvb21SYXRpbyk7XG4gICAgICB2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgICAgdmFyIHdpZHRoO1xuICAgICAgdmFyIGhlaWdodDtcblxuICAgICAgcmF0aW8gPSBudW0ocmF0aW8pO1xuXG4gICAgICBpZiAoaXNOdW1iZXIocmF0aW8pICYmIHRoaXMuaXNTaG93biAmJiAhdGhpcy5pc1BsYXllZCAmJiBvcHRpb25zLnpvb21hYmxlKSB7XG4gICAgICAgIGlmIChyYXRpbyA8IDApIHtcbiAgICAgICAgICByYXRpbyA9ICAxIC8gKDEgLSByYXRpbyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmF0aW8gPSAxICsgcmF0aW87XG4gICAgICAgIH1cblxuICAgICAgICB3aWR0aCA9IGltYWdlLndpZHRoICogcmF0aW87XG4gICAgICAgIGhlaWdodCA9IGltYWdlLmhlaWdodCAqIHJhdGlvO1xuICAgICAgICByYXRpbyA9IHdpZHRoIC8gaW1hZ2UubmF0dXJhbFdpZHRoO1xuICAgICAgICByYXRpbyA9IG1pbihtYXgocmF0aW8sIG1pblpvb21SYXRpbyksIG1heFpvb21SYXRpbyk7XG5cbiAgICAgICAgaWYgKHJhdGlvID4gMC45NSAmJiByYXRpbyA8IDEuMDUpIHtcbiAgICAgICAgICByYXRpbyA9IDE7XG4gICAgICAgICAgd2lkdGggPSBpbWFnZS5uYXR1cmFsV2lkdGg7XG4gICAgICAgICAgaGVpZ2h0ID0gaW1hZ2UubmF0dXJhbEhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIGltYWdlLmxlZnQgLT0gKHdpZHRoIC0gaW1hZ2Uud2lkdGgpIC8gMjtcbiAgICAgICAgaW1hZ2UudG9wIC09IChoZWlnaHQgLSBpbWFnZS5oZWlnaHQpIC8gMjtcbiAgICAgICAgaW1hZ2Uud2lkdGggPSB3aWR0aDtcbiAgICAgICAgaW1hZ2UuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBpbWFnZS5yYXRpbyA9IHJhdGlvO1xuICAgICAgICB0aGlzLnJlbmRlckltYWdlKCk7XG5cbiAgICAgICAgaWYgKGhhc1Rvb2x0aXApIHtcbiAgICAgICAgICB0aGlzLnRvb2x0aXAoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBab29tIHRoZSBpbWFnZSB0byBhIHNwZWNpYWwgcmF0aW9cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByYXRpb1xuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaGFzVG9vbHRpcCAob3B0aW9uYWwpXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBfem9vbWFibGUgKHByaXZhdGUpXG4gICAgICovXG4gICAgem9vbVRvOiBmdW5jdGlvbiAocmF0aW8sIGhhc1Rvb2x0aXAsIF96b29tYWJsZSkge1xuICAgICAgdmFyIGltYWdlID0gdGhpcy5pbWFnZTtcbiAgICAgIHZhciB3aWR0aDtcbiAgICAgIHZhciBoZWlnaHQ7XG5cbiAgICAgIHJhdGlvID0gbWF4KHJhdGlvLCAwKTtcblxuICAgICAgaWYgKGlzTnVtYmVyKHJhdGlvKSAmJiB0aGlzLmlzU2hvd24gJiYgIXRoaXMuaXNQbGF5ZWQgJiYgKF96b29tYWJsZSB8fCB0aGlzLm9wdGlvbnMuem9vbWFibGUpKSB7XG4gICAgICAgIHdpZHRoID0gaW1hZ2UubmF0dXJhbFdpZHRoICogcmF0aW87XG4gICAgICAgIGhlaWdodCA9IGltYWdlLm5hdHVyYWxIZWlnaHQgKiByYXRpbztcbiAgICAgICAgaW1hZ2UubGVmdCAtPSAod2lkdGggLSBpbWFnZS53aWR0aCkgLyAyO1xuICAgICAgICBpbWFnZS50b3AgLT0gKGhlaWdodCAtIGltYWdlLmhlaWdodCkgLyAyO1xuICAgICAgICBpbWFnZS53aWR0aCA9IHdpZHRoO1xuICAgICAgICBpbWFnZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGltYWdlLnJhdGlvID0gcmF0aW87XG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoKTtcblxuICAgICAgICBpZiAoaGFzVG9vbHRpcCkge1xuICAgICAgICAgIHRoaXMudG9vbHRpcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZSB0aGUgaW1hZ2VcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvdHJhbnNmb3JtLWZ1bmN0aW9uI3JvdGF0ZSgpXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZGVncmVlc1xuICAgICAqL1xuICAgIHJvdGF0ZTogZnVuY3Rpb24gKGRlZ3JlZXMpIHtcbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG5cbiAgICAgIGRlZ3JlZXMgPSBudW0oZGVncmVlcyk7XG5cbiAgICAgIGlmIChpc051bWJlcihkZWdyZWVzKSAmJiB0aGlzLmlzU2hvd24gJiYgIXRoaXMuaXNQbGF5ZWQgJiYgdGhpcy5vcHRpb25zLnJvdGF0YWJsZSkge1xuICAgICAgICBpbWFnZS5yb3RhdGUgPSAoKGltYWdlLnJvdGF0ZSB8fCAwKSArIGRlZ3JlZXMpO1xuICAgICAgICB0aGlzLnJlbmRlckltYWdlKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJvdGF0ZSB0aGUgaW1hZ2UgdG8gYSBzcGVjaWFsIGFuZ2xlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZGVncmVlc1xuICAgICAqL1xuICAgIHJvdGF0ZVRvOiBmdW5jdGlvbiAoZGVncmVlcykge1xuICAgICAgdmFyIGltYWdlID0gdGhpcy5pbWFnZTtcblxuICAgICAgZGVncmVlcyA9IG51bShkZWdyZWVzKTtcblxuICAgICAgaWYgKGlzTnVtYmVyKGRlZ3JlZXMpICYmIHRoaXMuaXNTaG93biAmJiAhdGhpcy5pc1BsYXllZCAmJiB0aGlzLm9wdGlvbnMucm90YXRhYmxlKSB7XG4gICAgICAgIGltYWdlLnJvdGF0ZSA9IGRlZ3JlZXM7XG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2NhbGUgdGhlIGltYWdlXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL3RyYW5zZm9ybS1mdW5jdGlvbiNzY2FsZSgpXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gc2NhbGVYXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlWSAob3B0aW9uYWwpXG4gICAgICovXG4gICAgc2NhbGU6IGZ1bmN0aW9uIChzY2FsZVgsIHNjYWxlWSkge1xuICAgICAgdmFyIGltYWdlID0gdGhpcy5pbWFnZTtcblxuICAgICAgLy8gSWYgXCJzY2FsZVlcIiBpcyBub3QgcHJlc2VudCwgaXRzIGRlZmF1bHQgdmFsdWUgaXMgXCJzY2FsZVhcIlxuICAgICAgaWYgKGlzVW5kZWZpbmVkKHNjYWxlWSkpIHtcbiAgICAgICAgc2NhbGVZID0gc2NhbGVYO1xuICAgICAgfVxuXG4gICAgICBzY2FsZVggPSBudW0oc2NhbGVYKTtcbiAgICAgIHNjYWxlWSA9IG51bShzY2FsZVkpO1xuXG4gICAgICBpZiAodGhpcy5pc1Nob3duICYmICF0aGlzLmlzUGxheWVkICYmIHRoaXMub3B0aW9ucy5zY2FsYWJsZSkge1xuICAgICAgICBpbWFnZS5zY2FsZVggPSBpc051bWJlcihzY2FsZVgpID8gc2NhbGVYIDogMTtcbiAgICAgICAgaW1hZ2Uuc2NhbGVZID0gaXNOdW1iZXIoc2NhbGVZKSA/IHNjYWxlWSA6IDE7XG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2NhbGUgdGhlIGFic2Npc3NhIG9mIHRoZSBpbWFnZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlWFxuICAgICAqL1xuICAgIHNjYWxlWDogZnVuY3Rpb24gKHNjYWxlWCkge1xuICAgICAgdGhpcy5zY2FsZShzY2FsZVgsIHRoaXMuaW1hZ2Uuc2NhbGVZKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2NhbGUgdGhlIG9yZGluYXRlIG9mIHRoZSBpbWFnZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlWVxuICAgICAqL1xuICAgIHNjYWxlWTogZnVuY3Rpb24gKHNjYWxlWSkge1xuICAgICAgdGhpcy5zY2FsZSh0aGlzLmltYWdlLnNjYWxlWCwgc2NhbGVZKTtcbiAgICB9LFxuXG4gICAgLy8gUGxheSB0aGUgaW1hZ2VzXG4gICAgcGxheTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJHBsYXllciA9IHRoaXMuJHBsYXllcjtcbiAgICAgIHZhciBsb2FkID0gJC5wcm94eSh0aGlzLmxvYWRJbWFnZSwgdGhpcyk7XG4gICAgICB2YXIgbGlzdCA9IFtdO1xuICAgICAgdmFyIHRvdGFsID0gMDtcbiAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICB2YXIgcGxheWluZztcblxuICAgICAgaWYgKCF0aGlzLmlzU2hvd24gfHwgdGhpcy5pc1BsYXllZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmZ1bGxzY3JlZW4pIHtcbiAgICAgICAgdGhpcy5mdWxsc2NyZWVuKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXNQbGF5ZWQgPSB0cnVlO1xuICAgICAgJHBsYXllci5hZGRDbGFzcyhDTEFTU19TSE9XKTtcblxuICAgICAgdGhpcy4kaXRlbXMuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICB2YXIgJGltZyA9ICR0aGlzLmZpbmQoU0VMRUNUT1JfSU1HKTtcbiAgICAgICAgdmFyICRpbWFnZSA9ICQoJzxpbWcgc3JjPVwiJyArICRpbWcuZGF0YSgnb3JpZ2luYWxVcmwnKSArICdcIiBhbHQ9XCInICsgJGltZy5hdHRyKCdhbHQnKSArICdcIj4nKTtcblxuICAgICAgICB0b3RhbCsrO1xuXG4gICAgICAgICRpbWFnZS5hZGRDbGFzcyhDTEFTU19GQURFKS50b2dnbGVDbGFzcyhDTEFTU19UUkFOU0lUSU9OLCBvcHRpb25zLnRyYW5zaXRpb24pO1xuXG4gICAgICAgIGlmICgkdGhpcy5oYXNDbGFzcyhDTEFTU19BQ1RJVkUpKSB7XG4gICAgICAgICAgJGltYWdlLmFkZENsYXNzKENMQVNTX0lOKTtcbiAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0LnB1c2goJGltYWdlKTtcbiAgICAgICAgJGltYWdlLm9uZShFVkVOVF9MT0FELCB7XG4gICAgICAgICAgZmlsbGVkOiBmYWxzZVxuICAgICAgICB9LCBsb2FkKTtcbiAgICAgICAgJHBsYXllci5hcHBlbmQoJGltYWdlKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoaXNOdW1iZXIob3B0aW9ucy5pbnRlcnZhbCkgJiYgb3B0aW9ucy5pbnRlcnZhbCA+IDApIHtcbiAgICAgICAgcGxheWluZyA9ICQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMucGxheWluZyA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGlzdFtpbmRleF0ucmVtb3ZlQ2xhc3MoQ0xBU1NfSU4pO1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIGluZGV4ID0gaW5kZXggPCB0b3RhbCA/IGluZGV4IDogMDtcbiAgICAgICAgICAgIGxpc3RbaW5kZXhdLmFkZENsYXNzKENMQVNTX0lOKTtcblxuICAgICAgICAgICAgcGxheWluZygpO1xuICAgICAgICAgIH0sIG9wdGlvbnMuaW50ZXJ2YWwpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAodG90YWwgPiAxKSB7XG4gICAgICAgICAgcGxheWluZygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIFN0b3AgcGxheVxuICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghdGhpcy5pc1BsYXllZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXNQbGF5ZWQgPSBmYWxzZTtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnBsYXlpbmcpO1xuICAgICAgdGhpcy4kcGxheWVyLnJlbW92ZUNsYXNzKENMQVNTX1NIT1cpLmVtcHR5KCk7XG4gICAgfSxcblxuICAgIC8vIEVudGVyIG1vZGFsIG1vZGUgKG9ubHkgYXZhaWxhYmxlIGluIGlubGluZSBtb2RlKVxuICAgIGZ1bGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICRpbWFnZSA9IHRoaXMuJGltYWdlO1xuICAgICAgdmFyICRsaXN0ID0gdGhpcy4kbGlzdDtcblxuICAgICAgaWYgKCF0aGlzLmlzU2hvd24gfHwgdGhpcy5pc1BsYXllZCB8fCB0aGlzLmlzRnVsbGVkIHx8ICFvcHRpb25zLmlubGluZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXNGdWxsZWQgPSB0cnVlO1xuICAgICAgdGhpcy4kYm9keS5hZGRDbGFzcyhDTEFTU19PUEVOKTtcbiAgICAgIHRoaXMuJGJ1dHRvbi5hZGRDbGFzcyhDTEFTU19GVUxMU0NSRUVOX0VYSVQpO1xuXG4gICAgICBpZiAob3B0aW9ucy50cmFuc2l0aW9uKSB7XG4gICAgICAgICRpbWFnZS5yZW1vdmVDbGFzcyhDTEFTU19UUkFOU0lUSU9OKTtcbiAgICAgICAgJGxpc3QucmVtb3ZlQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJHZpZXdlci5hZGRDbGFzcyhDTEFTU19GSVhFRCkucmVtb3ZlQXR0cignc3R5bGUnKS5jc3MoJ3otaW5kZXgnLCBvcHRpb25zLnpJbmRleCk7XG4gICAgICB0aGlzLmluaXRDb250YWluZXIoKTtcbiAgICAgIHRoaXMudmlld2VyID0gJC5leHRlbmQoe30sIHRoaXMuY29udGFpbmVyKTtcbiAgICAgIHRoaXMucmVuZGVyTGlzdCgpO1xuICAgICAgdGhpcy5pbml0SW1hZ2UoJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChvcHRpb25zLnRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkaW1hZ2UuYWRkQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTik7XG4gICAgICAgICAgICAgICRsaXN0LmFkZENsYXNzKENMQVNTX1RSQU5TSVRJT04pO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gRXhpdCBtb2RhbCBtb2RlIChvbmx5IGF2YWlsYWJsZSBpbiBpbmxpbmUgbW9kZSlcbiAgICBleGl0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkaW1hZ2UgPSB0aGlzLiRpbWFnZTtcbiAgICAgIHZhciAkbGlzdCA9IHRoaXMuJGxpc3Q7XG5cbiAgICAgIGlmICghdGhpcy5pc0Z1bGxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXNGdWxsZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuJGJvZHkucmVtb3ZlQ2xhc3MoQ0xBU1NfT1BFTik7XG4gICAgICB0aGlzLiRidXR0b24ucmVtb3ZlQ2xhc3MoQ0xBU1NfRlVMTFNDUkVFTl9FWElUKTtcblxuICAgICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgICAkaW1hZ2UucmVtb3ZlQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTik7XG4gICAgICAgICRsaXN0LnJlbW92ZUNsYXNzKENMQVNTX1RSQU5TSVRJT04pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiR2aWV3ZXIucmVtb3ZlQ2xhc3MoQ0xBU1NfRklYRUQpLmNzcygnei1pbmRleCcsIG9wdGlvbnMuekluZGV4SW5saW5lKTtcbiAgICAgIHRoaXMudmlld2VyID0gJC5leHRlbmQoe30sIHRoaXMucGFyZW50KTtcbiAgICAgIHRoaXMucmVuZGVyVmlld2VyKCk7XG4gICAgICB0aGlzLnJlbmRlckxpc3QoKTtcbiAgICAgIHRoaXMuaW5pdEltYWdlKCQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlbmRlckltYWdlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy50cmFuc2l0aW9uKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJGltYWdlLmFkZENsYXNzKENMQVNTX1RSQU5TSVRJT04pO1xuICAgICAgICAgICAgICAkbGlzdC5hZGRDbGFzcyhDTEFTU19UUkFOU0lUSU9OKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIFNob3cgdGhlIGN1cnJlbnQgcmF0aW8gb2YgdGhlIGltYWdlIHdpdGggcGVyY2VudGFnZVxuICAgIHRvb2x0aXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICR0b29sdGlwID0gdGhpcy4kdG9vbHRpcDtcbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG4gICAgICB2YXIgY2xhc3NlcyA9IFtcbiAgICAgICAgICAgIENMQVNTX1NIT1csXG4gICAgICAgICAgICBDTEFTU19GQURFLFxuICAgICAgICAgICAgQ0xBU1NfVFJBTlNJVElPTlxuICAgICAgICAgIF0uam9pbignICcpO1xuXG4gICAgICBpZiAoIXRoaXMuaXNTaG93biB8fCB0aGlzLmlzUGxheWVkIHx8ICFvcHRpb25zLnRvb2x0aXApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAkdG9vbHRpcC50ZXh0KHJvdW5kKGltYWdlLnJhdGlvICogMTAwKSArICclJyk7XG5cbiAgICAgIGlmICghdGhpcy5mYWRpbmcpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvbikge1xuXG4gICAgICAgICAgLyoganNoaW50IGV4cHI6dHJ1ZSAqL1xuICAgICAgICAgICR0b29sdGlwLmFkZENsYXNzKGNsYXNzZXMpLmdldCgwKS5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAkdG9vbHRpcC5hZGRDbGFzcyhDTEFTU19JTik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHRvb2x0aXAuYWRkQ2xhc3MoQ0xBU1NfU0hPVyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmZhZGluZyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZmFkaW5nID0gc2V0VGltZW91dCgkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgICAgICR0b29sdGlwLm9uZShFVkVOVF9UUkFOU0lUSU9ORU5ELCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkdG9vbHRpcC5yZW1vdmVDbGFzcyhjbGFzc2VzKTtcbiAgICAgICAgICB9KS5yZW1vdmVDbGFzcyhDTEFTU19JTik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHRvb2x0aXAucmVtb3ZlQ2xhc3MoQ0xBU1NfU0hPVyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZhZGluZyA9IGZhbHNlO1xuICAgICAgfSwgdGhpcyksIDEwMDApO1xuICAgIH0sXG5cbiAgICAvLyBUb2dnbGUgdGhlIGltYWdlIHNpemUgYmV0d2VlbiBpdHMgbmF0dXJhbCBzaXplIGFuZCBpbml0aWFsIHNpemUuXG4gICAgdG9nZ2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5pbWFnZS5yYXRpbyA9PT0gMSkge1xuICAgICAgICB0aGlzLnpvb21Ubyh0aGlzLmluaXRpYWxJbWFnZS5yYXRpbyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnpvb21UbygxKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUmVzZXQgdGhlIGltYWdlIHRvIGl0cyBpbml0aWFsIHN0YXRlLlxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5pc1Nob3duICYmICF0aGlzLmlzUGxheWVkKSB7XG4gICAgICAgIHRoaXMuaW1hZ2UgPSAkLmV4dGVuZCh7fSwgdGhpcy5pbml0aWFsSW1hZ2UpO1xuICAgICAgICB0aGlzLnJlbmRlckltYWdlKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIERlc3Ryb3kgdGhlIHZpZXdlclxuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9IHRoaXMuJGVsZW1lbnQ7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuaW5saW5lKSB7XG4gICAgICAgIHRoaXMudW5iaW5kKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5pc1Nob3duKSB7XG4gICAgICAgICAgdGhpcy51bmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQGRlYnVnXG4gICAgICAgICAqIEBDbG91ZFxuICAgICAgICAgKiBGaXggbm8taW1hZ2VzIGJ1ZywgYWRkIGxlbmd0aCBpbnNwZWN0OlxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy4kaW1hZ2VzID8gdGhpcy4kaW1hZ2VzLnJlbW92ZUNsYXNzKENMQVNTX1RPR0dMRSkgOiAnJztcblxuICAgICAgICAkdGhpcy5vZmYoRVZFTlRfQ0xJQ0ssIHRoaXMuc3RhcnQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnVuYnVpbGQoKTtcbiAgICAgICR0aGlzLnJlbW92ZURhdGEoTkFNRVNQQUNFKTtcbiAgICB9XG4gIH0pO1xuXG4gICQuZXh0ZW5kKHByb3RvdHlwZSwge1xuXG4gICAgLy8gQSBzaG9ydGN1dCBmb3IgdHJpZ2dlcmluZyBjdXN0b20gZXZlbnRzXG4gICAgdHJpZ2dlcjogZnVuY3Rpb24gKHR5cGUsIGRhdGEpIHtcbiAgICAgIHZhciBlID0gJC5FdmVudCh0eXBlLCBkYXRhKTtcblxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpO1xuXG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgc2hvd246IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNGdWxsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5pc1Nob3duID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNWaXNpYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICB0aGlzLmJpbmQoKTtcblxuICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLnNob3duKSkge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uZShFVkVOVF9TSE9XTiwgb3B0aW9ucy5zaG93bik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudHJpZ2dlcihFVkVOVF9TSE9XTik7XG4gICAgfSxcblxuICAgIGhpZGRlbjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5pc1ZpZXdlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5pc0Z1bGxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5pc1Nob3duID0gZmFsc2U7XG4gICAgICB0aGlzLmlzVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdGhpcy51bmJpbmQoKTtcbiAgICAgIHRoaXMuJGJvZHkucmVtb3ZlQ2xhc3MoQ0xBU1NfT1BFTik7XG4gICAgICB0aGlzLiR2aWV3ZXIuYWRkQ2xhc3MoQ0xBU1NfSElERSk7XG4gICAgICB0aGlzLnJlc2V0TGlzdCgpO1xuICAgICAgdGhpcy5yZXNldEltYWdlKCk7XG5cbiAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5oaWRkZW4pKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub25lKEVWRU5UX0hJRERFTiwgb3B0aW9ucy5oaWRkZW4pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRyaWdnZXIoRVZFTlRfSElEREVOKTtcbiAgICB9LFxuXG4gICAgZnVsbHNjcmVlbjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuICAgICAgaWYgKHRoaXMuaXNGdWxsZWQgJiYgIWRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50ICYmICFkb2N1bWVudC5tb3pGdWxsU2NyZWVuRWxlbWVudCAmJlxuICAgICAgICAhZG9jdW1lbnQud2Via2l0RnVsbHNjcmVlbkVsZW1lbnQgJiYgIWRvY3VtZW50Lm1zRnVsbHNjcmVlbkVsZW1lbnQpIHtcblxuICAgICAgICBpZiAoZG9jdW1lbnRFbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuKSB7XG4gICAgICAgICAgZG9jdW1lbnRFbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnRFbGVtZW50Lm1zUmVxdWVzdEZ1bGxzY3JlZW4pIHtcbiAgICAgICAgICBkb2N1bWVudEVsZW1lbnQubXNSZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50RWxlbWVudC5tb3pSZXF1ZXN0RnVsbFNjcmVlbikge1xuICAgICAgICAgIGRvY3VtZW50RWxlbWVudC5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpO1xuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50RWxlbWVudC53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbikge1xuICAgICAgICAgIGRvY3VtZW50RWxlbWVudC53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbihFbGVtZW50LkFMTE9XX0tFWUJPQVJEX0lOUFVUKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvZmZzZXRYID0gdGhpcy5lbmRYIC0gdGhpcy5zdGFydFg7XG4gICAgICB2YXIgb2Zmc2V0WSA9IHRoaXMuZW5kWSAtIHRoaXMuc3RhcnRZO1xuXG4gICAgICBzd2l0Y2ggKHRoaXMuYWN0aW9uKSB7XG5cbiAgICAgICAgLy8gTW92ZSB0aGUgY3VycmVudCBpbWFnZVxuICAgICAgICBjYXNlICdtb3ZlJzpcbiAgICAgICAgICB0aGlzLm1vdmUob2Zmc2V0WCwgb2Zmc2V0WSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy8gWm9vbSB0aGUgY3VycmVudCBpbWFnZVxuICAgICAgICBjYXNlICd6b29tJzpcbiAgICAgICAgICB0aGlzLnpvb20oZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgICAgICAgICB2YXIgejEgPSBzcXJ0KHgxICogeDEgKyB5MSAqIHkxKTtcbiAgICAgICAgICAgIHZhciB6MiA9IHNxcnQoeDIgKiB4MiArIHkyICogeTIpO1xuXG4gICAgICAgICAgICByZXR1cm4gKHoyIC0gejEpIC8gejE7XG4gICAgICAgICAgfShcbiAgICAgICAgICAgIGFicyh0aGlzLnN0YXJ0WCAtIHRoaXMuc3RhcnRYMiksXG4gICAgICAgICAgICBhYnModGhpcy5zdGFydFkgLSB0aGlzLnN0YXJ0WTIpLFxuICAgICAgICAgICAgYWJzKHRoaXMuZW5kWCAtIHRoaXMuZW5kWDIpLFxuICAgICAgICAgICAgYWJzKHRoaXMuZW5kWSAtIHRoaXMuZW5kWTIpXG4gICAgICAgICAgKSk7XG5cbiAgICAgICAgICB0aGlzLnN0YXJ0WDIgPSB0aGlzLmVuZFgyO1xuICAgICAgICAgIHRoaXMuc3RhcnRZMiA9IHRoaXMuZW5kWTI7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnc3dpdGNoJzpcbiAgICAgICAgICB0aGlzLmFjdGlvbiA9ICdzd2l0Y2hlZCc7XG5cbiAgICAgICAgICBpZiAob2Zmc2V0WCA+IDEpIHtcbiAgICAgICAgICAgIHRoaXMucHJldigpO1xuICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0WCA8IC0xKSB7XG4gICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBObyBkZWZhdWx0XG4gICAgICB9XG5cbiAgICAgIC8vIE92ZXJyaWRlXG4gICAgICB0aGlzLnN0YXJ0WCA9IHRoaXMuZW5kWDtcbiAgICAgIHRoaXMuc3RhcnRZID0gdGhpcy5lbmRZO1xuICAgIH0sXG5cbiAgICBpc1N3aXRjaGFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG4gICAgICB2YXIgdmlld2VyID0gdGhpcy52aWV3ZXI7XG5cbiAgICAgIHJldHVybiAoaW1hZ2UubGVmdCA+PSAwICYmIGltYWdlLnRvcCA+PSAwICYmIGltYWdlLndpZHRoIDw9IHZpZXdlci53aWR0aCAmJlxuICAgICAgICBpbWFnZS5oZWlnaHQgPD0gdmlld2VyLmhlaWdodCk7XG4gICAgfVxuICB9KTtcblxuICAkLmV4dGVuZChWaWV3ZXIucHJvdG90eXBlLCBwcm90b3R5cGUpO1xuXG4gIFZpZXdlci5ERUZBVUxUUyA9IHtcbiAgICAvLyBFbmFibGUgaW5saW5lIG1vZGVcbiAgICBpbmxpbmU6IGZhbHNlLFxuXG4gICAgLy8gU2hvdyB0aGUgYnV0dG9uIG9uIHRoZSB0b3AtcmlnaHQgb2YgdGhlIHZpZXdlclxuICAgIGJ1dHRvbjogdHJ1ZSxcblxuICAgIC8vIFNob3cgdGhlIG5hdmJhclxuICAgIG5hdmJhcjogdHJ1ZSxcblxuICAgIC8vIFNob3cgdGhlIHRpdGxlXG4gICAgdGl0bGU6IHRydWUsXG5cbiAgICAvLyBTaG93IHRoZSB0b29sYmFyXG4gICAgdG9vbGJhcjogdHJ1ZSxcblxuICAgIC8vIFNob3cgdGhlIHRvb2x0aXAgd2l0aCBpbWFnZSByYXRpbyAocGVyY2VudGFnZSkgd2hlbiB6b29tIGluIG9yIHpvb20gb3V0XG4gICAgdG9vbHRpcDogdHJ1ZSxcblxuICAgIC8vIEVuYWJsZSB0byBtb3ZlIHRoZSBpbWFnZVxuICAgIG1vdmFibGU6IHRydWUsXG5cbiAgICAvLyBFbmFibGUgdG8gem9vbSB0aGUgaW1hZ2VcbiAgICB6b29tYWJsZTogdHJ1ZSxcblxuICAgIC8vIEVuYWJsZSB0byByb3RhdGUgdGhlIGltYWdlXG4gICAgcm90YXRhYmxlOiB0cnVlLFxuXG4gICAgLy8gRW5hYmxlIHRvIHNjYWxlIHRoZSBpbWFnZVxuICAgIHNjYWxhYmxlOiB0cnVlLFxuXG4gICAgLy8gRW5hYmxlIENTUzMgVHJhbnNpdGlvbiBmb3Igc29tZSBzcGVjaWFsIGVsZW1lbnRzXG4gICAgdHJhbnNpdGlvbjogdHJ1ZSxcblxuICAgIC8vIEVuYWJsZSB0byByZXF1ZXN0IGZ1bGxzY3JlZW4gd2hlbiBwbGF5XG4gICAgZnVsbHNjcmVlbjogdHJ1ZSxcblxuICAgIC8vIEVuYWJsZSBrZXlib2FyZCBzdXBwb3J0XG4gICAga2V5Ym9hcmQ6IHRydWUsXG5cbiAgICAvLyBEZWZpbmUgaW50ZXJ2YWwgb2YgZWFjaCBpbWFnZSB3aGVuIHBsYXlpbmdcbiAgICBpbnRlcnZhbDogNTAwMCxcblxuICAgIC8vIE1pbiB3aWR0aCBvZiB0aGUgdmlld2VyIGluIGlubGluZSBtb2RlXG4gICAgbWluV2lkdGg6IDIwMCxcblxuICAgIC8vIE1pbiBoZWlnaHQgb2YgdGhlIHZpZXdlciBpbiBpbmxpbmUgbW9kZVxuICAgIG1pbkhlaWdodDogMTAwLFxuXG4gICAgLy8gRGVmaW5lIHRoZSByYXRpbyB3aGVuIHpvb20gdGhlIGltYWdlIGJ5IHdoZWVsaW5nIG1vdXNlXG4gICAgem9vbVJhdGlvOiAwLjEsXG5cbiAgICAvLyBEZWZpbmUgdGhlIG1pbiByYXRpbyBvZiB0aGUgaW1hZ2Ugd2hlbiB6b29tIG91dFxuICAgIG1pblpvb21SYXRpbzogMC4wMSxcblxuICAgIC8vIERlZmluZSB0aGUgbWF4IHJhdGlvIG9mIHRoZSBpbWFnZSB3aGVuIHpvb20gaW5cbiAgICBtYXhab29tUmF0aW86IDEwMCxcblxuICAgIC8vIERlZmluZSB0aGUgQ1NTIGB6LWluZGV4YCB2YWx1ZSBvZiB2aWV3ZXIgaW4gbW9kYWwgbW9kZS5cbiAgICB6SW5kZXg6IDIwMTUsXG5cbiAgICAvLyBEZWZpbmUgdGhlIENTUyBgei1pbmRleGAgdmFsdWUgb2Ygdmlld2VyIGluIGlubGluZSBtb2RlLlxuICAgIHpJbmRleElubGluZTogMCxcblxuICAgIC8vIERlZmluZSB3aGVyZSB0byBnZXQgdGhlIG9yaWdpbmFsIGltYWdlIFVSTCBmb3Igdmlld2luZ1xuICAgIC8vIFR5cGU6IFN0cmluZyAoYW4gaW1hZ2UgYXR0cmlidXRlKSBvciBGdW5jdGlvbiAoc2hvdWxkIHJldHVybiBhbiBpbWFnZSBVUkwpXG4gICAgdXJsOiAnc3JjJyxcblxuICAgIC8vIEV2ZW50IHNob3J0Y3V0c1xuICAgIGJ1aWxkOiBudWxsLFxuICAgIGJ1aWx0OiBudWxsLFxuICAgIHNob3c6IG51bGwsXG4gICAgc2hvd246IG51bGwsXG4gICAgaGlkZTogbnVsbCxcbiAgICBoaWRkZW46IG51bGxcbiAgfTtcblxuICBWaWV3ZXIuVEVNUExBVEUgPSAoXG4gICAgJzxkaXYgY2xhc3M9XCJ2aWV3ZXItY29udGFpbmVyXCI+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInZpZXdlci1jYW52YXNcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwidmlld2VyLWZvb3RlclwiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cInZpZXdlci10aXRsZVwiPjwvZGl2PicgK1xuICAgICAgICAnPHVsIGNsYXNzPVwidmlld2VyLXRvb2xiYXJcIj4nICtcbiAgICAgICAgICAnPGxpIGNsYXNzPVwidmlld2VyLXpvb20taW5cIiBkYXRhLWFjdGlvbj1cInpvb20taW5cIj48L2xpPicgK1xuICAgICAgICAgICc8bGkgY2xhc3M9XCJ2aWV3ZXItem9vbS1vdXRcIiBkYXRhLWFjdGlvbj1cInpvb20tb3V0XCI+PC9saT4nICtcbiAgICAgICAgICAnPGxpIGNsYXNzPVwidmlld2VyLW9uZS10by1vbmVcIiBkYXRhLWFjdGlvbj1cIm9uZS10by1vbmVcIj48L2xpPicgK1xuICAgICAgICAgICc8bGkgY2xhc3M9XCJ2aWV3ZXItcmVzZXRcIiBkYXRhLWFjdGlvbj1cInJlc2V0XCI+PC9saT4nICtcbiAgICAgICAgICAnPGxpIGNsYXNzPVwidmlld2VyLXByZXZcIiBkYXRhLWFjdGlvbj1cInByZXZcIj48L2xpPicgK1xuICAgICAgICAgICc8bGkgY2xhc3M9XCJ2aWV3ZXItcGxheVwiIGRhdGEtYWN0aW9uPVwicGxheVwiPjwvbGk+JyArXG4gICAgICAgICAgJzxsaSBjbGFzcz1cInZpZXdlci1uZXh0XCIgZGF0YS1hY3Rpb249XCJuZXh0XCI+PC9saT4nICtcbiAgICAgICAgICAnPGxpIGNsYXNzPVwidmlld2VyLXJvdGF0ZS1sZWZ0XCIgZGF0YS1hY3Rpb249XCJyb3RhdGUtbGVmdFwiPjwvbGk+JyArXG4gICAgICAgICAgJzxsaSBjbGFzcz1cInZpZXdlci1yb3RhdGUtcmlnaHRcIiBkYXRhLWFjdGlvbj1cInJvdGF0ZS1yaWdodFwiPjwvbGk+JyArXG4gICAgICAgICAgJzxsaSBjbGFzcz1cInZpZXdlci1mbGlwLWhvcml6b250YWxcIiBkYXRhLWFjdGlvbj1cImZsaXAtaG9yaXpvbnRhbFwiPjwvbGk+JyArXG4gICAgICAgICAgJzxsaSBjbGFzcz1cInZpZXdlci1mbGlwLXZlcnRpY2FsXCIgZGF0YS1hY3Rpb249XCJmbGlwLXZlcnRpY2FsXCI+PC9saT4nICtcbiAgICAgICAgJzwvdWw+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwidmlld2VyLW5hdmJhclwiPicgK1xuICAgICAgICAgICc8dWwgY2xhc3M9XCJ2aWV3ZXItbGlzdFwiPjwvdWw+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICc8L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwidmlld2VyLXRvb2x0aXBcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwidmlld2VyLWJ1dHRvblwiIGRhdGEtYWN0aW9uPVwibWl4XCI+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cInZpZXdlci1wbGF5ZXJcIj48L2Rpdj4nICtcbiAgICAnPC9kaXY+J1xuICApO1xuXG4gIC8vIFNhdmUgdGhlIG90aGVyIHZpZXdlclxuICBWaWV3ZXIub3RoZXIgPSAkLmZuLnZpZXdlcjtcblxuICAvLyBSZWdpc3RlciBhcyBqUXVlcnkgcGx1Z2luXG4gICQuZm4udmlld2VyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB2YXIgYXJncyA9IHRvQXJyYXkoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgcmVzdWx0O1xuXG4gICAgdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICB2YXIgZGF0YSA9ICR0aGlzLmRhdGEoTkFNRVNQQUNFKTtcbiAgICAgIHZhciBmbjtcblxuICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIGlmICgvZGVzdHJveXxoaWRlfGV4aXR8c3RvcHxyZXNldC8udGVzdChvcHRpb25zKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICR0aGlzLmRhdGEoTkFNRVNQQUNFLCAoZGF0YSA9IG5ldyBWaWV3ZXIodGhpcywgb3B0aW9ucykpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzU3RyaW5nKG9wdGlvbnMpICYmICQuaXNGdW5jdGlvbihmbiA9IGRhdGFbb3B0aW9uc10pKSB7XG4gICAgICAgIHJlc3VsdCA9IGZuLmFwcGx5KGRhdGEsIGFyZ3MpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGlzVW5kZWZpbmVkKHJlc3VsdCkgPyB0aGlzIDogcmVzdWx0O1xuICB9O1xuXG4gICQuZm4udmlld2VyLkNvbnN0cnVjdG9yID0gVmlld2VyO1xuICAkLmZuLnZpZXdlci5zZXREZWZhdWx0cyA9IFZpZXdlci5zZXREZWZhdWx0cztcblxuICAvLyBObyBjb25mbGljdFxuICAkLmZuLnZpZXdlci5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4udmlld2VyID0gVmlld2VyLm90aGVyO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG59KTtcbiJdfQ==
