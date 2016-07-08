(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * ES6 FILE FOR ArticleController 
 * 2015-09-02 11:09:51
 */

// import 'jquery/dist/jquery'
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

require('viewer-master/dist/viewer');

require('highlight/src/highlight.min');

require('header');

var _comment = require('comment');

var comment = _interopRequireWildcard(_comment);

function initHighlight() {
    hljs.initHighlightingOnLoad();
}

function initViewer() {
    /*$('.card .full img').on('click', function(){
        alert('click evt')
    })*/
    $('.card .full').viewer();
    // console.log('init viewer')
}

function _ref(evt) {
    evt.stopPropagation();
    location.pathname = '/article';
    //返回上层，固定位/article
    // location.pathname = '/' + $(this).data('type') || ''

    return false;
}

$(function () {
    $('.card .read-more').on('click', _ref);
    initViewer();
    initHighlight();
    comment.initComment();
    comment.loadComment();
});
},{"comment":2,"header":3,"highlight/src/highlight.min":4,"viewer-master/dist/viewer":5}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
!function(e){false?e(exports):(window.hljs=e({}),false&&define.amd&&define("hljs",[],function(){return window.hljs}))}(function(e){function t(e){return e.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function r(e){return e.nodeName.toLowerCase()}function a(e,t){var r=e&&e.exec(t);return r&&0==r.index}function n(e){return/^(no-?highlight|plain|text)$/i.test(e)}function i(e){var t,r,a,i=e.className+" ";if(i+=e.parentNode?e.parentNode.className:"",r=/\blang(?:uage)?-([\w-]+)\b/i.exec(i))return y(r[1])?r[1]:"no-highlight";for(i=i.split(/\s+/),t=0,a=i.length;a>t;t++)if(y(i[t])||n(i[t]))return i[t]}function s(e,t){var r,a={};for(r in e)a[r]=e[r];if(t)for(r in t)a[r]=t[r];return a}function c(e){var t=[];return function a(e,n){for(var i=e.firstChild;i;i=i.nextSibling)3==i.nodeType?n+=i.nodeValue.length:1==i.nodeType&&(t.push({event:"start",offset:n,node:i}),n=a(i,n),r(i).match(/br|hr|img|input/)||t.push({event:"stop",offset:n,node:i}));return n}(e,0),t}function o(e,a,n){function i(){return e.length&&a.length?e[0].offset!=a[0].offset?e[0].offset<a[0].offset?e:a:"start"==a[0].event?e:a:e.length?e:a}function s(e){function a(e){return" "+e.nodeName+'="'+t(e.value)+'"'}u+="<"+r(e)+Array.prototype.map.call(e.attributes,a).join("")+">"}function c(e){u+="</"+r(e)+">"}function o(e){("start"==e.event?s:c)(e.node)}for(var l=0,u="",d=[];e.length||a.length;){var b=i();if(u+=t(n.substr(l,b[0].offset-l)),l=b[0].offset,b==e){d.reverse().forEach(c);do o(b.splice(0,1)[0]),b=i();while(b==e&&b.length&&b[0].offset==l);d.reverse().forEach(s)}else"start"==b[0].event?d.push(b[0].node):d.pop(),o(b.splice(0,1)[0])}return u+t(n.substr(l))}function l(e){function t(e){return e&&e.source||e}function r(r,a){return new RegExp(t(r),"m"+(e.cI?"i":"")+(a?"g":""))}function a(n,i){if(!n.compiled){if(n.compiled=!0,n.k=n.k||n.bK,n.k){var c={},o=function(t,r){e.cI&&(r=r.toLowerCase()),r.split(" ").forEach(function(e){var r=e.split("|");c[r[0]]=[t,r[1]?Number(r[1]):1]})};"string"==typeof n.k?o("keyword",n.k):Object.keys(n.k).forEach(function(e){o(e,n.k[e])}),n.k=c}n.lR=r(n.l||/\b\w+\b/,!0),i&&(n.bK&&(n.b="\\b("+n.bK.split(" ").join("|")+")\\b"),n.b||(n.b=/\B|\b/),n.bR=r(n.b),n.e||n.eW||(n.e=/\B|\b/),n.e&&(n.eR=r(n.e)),n.tE=t(n.e)||"",n.eW&&i.tE&&(n.tE+=(n.e?"|":"")+i.tE)),n.i&&(n.iR=r(n.i)),void 0===n.r&&(n.r=1),n.c||(n.c=[]);var l=[];n.c.forEach(function(e){e.v?e.v.forEach(function(t){l.push(s(e,t))}):l.push("self"==e?n:e)}),n.c=l,n.c.forEach(function(e){a(e,n)}),n.starts&&a(n.starts,i);var u=n.c.map(function(e){return e.bK?"\\.?("+e.b+")\\.?":e.b}).concat([n.tE,n.i]).map(t).filter(Boolean);n.t=u.length?r(u.join("|"),!0):{exec:function(){return null}}}}a(e)}function u(e,r,n,i){function s(e,t){for(var r=0;r<t.c.length;r++)if(a(t.c[r].bR,e))return t.c[r]}function c(e,t){if(a(e.eR,t)){for(;e.endsParent&&e.parent;)e=e.parent;return e}return e.eW?c(e.parent,t):void 0}function o(e,t){return!n&&a(t.iR,e)}function b(e,t){var r=v.cI?t[0].toLowerCase():t[0];return e.k.hasOwnProperty(r)&&e.k[r]}function p(e,t,r,a){var n=a?"":w.classPrefix,i='<span class="'+n,s=r?"":"</span>";return i+=e+'">',i+t+s}function m(){if(!x.k)return t(E);var e="",r=0;x.lR.lastIndex=0;for(var a=x.lR.exec(E);a;){e+=t(E.substr(r,a.index-r));var n=b(x,a);n?(B+=n[1],e+=p(n[0],t(a[0]))):e+=t(a[0]),r=x.lR.lastIndex,a=x.lR.exec(E)}return e+t(E.substr(r))}function f(){var e="string"==typeof x.sL;if(e&&!N[x.sL])return t(E);var r=e?u(x.sL,E,!0,C[x.sL]):d(E,x.sL.length?x.sL:void 0);return x.r>0&&(B+=r.r),e&&(C[x.sL]=r.top),p(r.language,r.value,!1,!0)}function g(){return void 0!==x.sL?f():m()}function h(e,r){var a=e.cN?p(e.cN,"",!0):"";e.rB?(M+=a,E=""):e.eB?(M+=t(r)+a,E=""):(M+=a,E=r),x=Object.create(e,{parent:{value:x}})}function _(e,r){if(E+=e,void 0===r)return M+=g(),0;var a=s(r,x);if(a)return M+=g(),h(a,r),a.rB?0:r.length;var n=c(x,r);if(n){var i=x;i.rE||i.eE||(E+=r),M+=g();do x.cN&&(M+="</span>"),B+=x.r,x=x.parent;while(x!=n.parent);return i.eE&&(M+=t(r)),E="",n.starts&&h(n.starts,""),i.rE?0:r.length}if(o(r,x))throw new Error('Illegal lexeme "'+r+'" for mode "'+(x.cN||"<unnamed>")+'"');return E+=r,r.length||1}var v=y(e);if(!v)throw new Error('Unknown language: "'+e+'"');l(v);var k,x=i||v,C={},M="";for(k=x;k!=v;k=k.parent)k.cN&&(M=p(k.cN,"",!0)+M);var E="",B=0;try{for(var $,z,L=0;;){if(x.t.lastIndex=L,$=x.t.exec(r),!$)break;z=_(r.substr(L,$.index-L),$[0]),L=$.index+z}for(_(r.substr(L)),k=x;k.parent;k=k.parent)k.cN&&(M+="</span>");return{r:B,value:M,language:e,top:x}}catch(q){if(-1!=q.message.indexOf("Illegal"))return{r:0,value:t(r)};throw q}}function d(e,r){r=r||w.languages||Object.keys(N);var a={r:0,value:t(e)},n=a;return r.forEach(function(t){if(y(t)){var r=u(t,e,!1);r.language=t,r.r>n.r&&(n=r),r.r>a.r&&(n=a,a=r)}}),n.language&&(a.second_best=n),a}function b(e){return w.tabReplace&&(e=e.replace(/^((<[^>]+>|\t)+)/gm,function(e,t){return t.replace(/\t/g,w.tabReplace)})),w.useBR&&(e=e.replace(/\n/g,"<br>")),e}function p(e,t,r){var a=t?k[t]:r,n=[e.trim()];return e.match(/\bhljs\b/)||n.push("hljs"),-1===e.indexOf(a)&&n.push(a),n.join(" ").trim()}function m(e){var t=i(e);if(!n(t)){var r;w.useBR?(r=document.createElementNS("http://www.w3.org/1999/xhtml","div"),r.innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):r=e;var a=r.textContent,s=t?u(t,a,!0):d(a),l=c(r);if(l.length){var m=document.createElementNS("http://www.w3.org/1999/xhtml","div");m.innerHTML=s.value,s.value=o(l,c(m),a)}s.value=b(s.value),e.innerHTML=s.value,e.className=p(e.className,t,s.language),e.result={language:s.language,re:s.r},s.second_best&&(e.second_best={language:s.second_best.language,re:s.second_best.r})}}function f(e){w=s(w,e)}function g(){if(!g.called){g.called=!0;var e=document.querySelectorAll("pre code");Array.prototype.forEach.call(e,m)}}function h(){addEventListener("DOMContentLoaded",g,!1),addEventListener("load",g,!1)}function _(t,r){var a=N[t]=r(e);a.aliases&&a.aliases.forEach(function(e){k[e]=t})}function v(){return Object.keys(N)}function y(e){return e=(e||"").toLowerCase(),N[e]||N[k[e]]}var w={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0},N={},k={};return e.highlight=u,e.highlightAuto=d,e.fixMarkup=b,e.highlightBlock=m,e.configure=f,e.initHighlighting=g,e.initHighlightingOnLoad=h,e.registerLanguage=_,e.listLanguages=v,e.getLanguage=y,e.inherit=s,e.IR="[a-zA-Z]\\w*",e.UIR="[a-zA-Z_]\\w*",e.NR="\\b\\d+(\\.\\d+)?",e.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",e.BNR="\\b(0b[01]+)",e.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",e.BE={b:"\\\\[\\s\\S]",r:0},e.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[e.BE]},e.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[e.BE]},e.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|like)\b/},e.C=function(t,r,a){var n=e.inherit({cN:"comment",b:t,e:r,c:[]},a||{});return n.c.push(e.PWM),n.c.push({cN:"doctag",b:"(?:TODO|FIXME|NOTE|BUG|XXX):",r:0}),n},e.CLCM=e.C("//","$"),e.CBCM=e.C("/\\*","\\*/"),e.HCM=e.C("#","$"),e.NM={cN:"number",b:e.NR,r:0},e.CNM={cN:"number",b:e.CNR,r:0},e.BNM={cN:"number",b:e.BNR,r:0},e.CSSNM={cN:"number",b:e.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},e.RM={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[e.BE,{b:/\[/,e:/\]/,r:0,c:[e.BE]}]},e.TM={cN:"title",b:e.IR,r:0},e.UTM={cN:"title",b:e.UIR,r:0},e.registerLanguage("apache",function(e){var t={cN:"number",b:"[\\$%]\\d+"};return{aliases:["apacheconf"],cI:!0,c:[e.HCM,{cN:"tag",b:"</?",e:">"},{cN:"keyword",b:/\w+/,r:0,k:{common:"order deny allow setenv rewriterule rewriteengine rewritecond documentroot sethandler errordocument loadmodule options header listen serverroot servername"},starts:{e:/$/,r:0,k:{literal:"on off all"},c:[{cN:"sqbracket",b:"\\s\\[",e:"\\]$"},{cN:"cbracket",b:"[\\$%]\\{",e:"\\}",c:["self",t]},t,e.QSM]}}],i:/\S/}}),e.registerLanguage("bash",function(e){var t={cN:"variable",v:[{b:/\$[\w\d#@][\w\d_]*/},{b:/\$\{(.*?)}/}]},r={cN:"string",b:/"/,e:/"/,c:[e.BE,t,{cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]}]},a={cN:"string",b:/'/,e:/'/};return{aliases:["sh","zsh"],l:/-?[a-z\.]+/,k:{keyword:"if then else elif fi for while in do done case esac function",literal:"true false",built_in:"break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",operator:"-ne -eq -lt -gt -f -d -e -s -l -a"},c:[{cN:"shebang",b:/^#![^\n]+sh\s*$/,r:10},{cN:"function",b:/\w[\w\d_]*\s*\(\s*\)\s*\{/,rB:!0,c:[e.inherit(e.TM,{b:/\w[\w\d_]*/})],r:0},e.HCM,e.NM,r,a,t]}}),e.registerLanguage("coffeescript",function(e){var t={keyword:"in if for while finally new do return else break catch instanceof throw try this switch continue typeof delete debugger super then unless until loop of by when and or is isnt not",literal:"true false null undefined yes no on off",built_in:"npm require console print module global window document"},r="[A-Za-z$_][0-9A-Za-z$_]*",a={cN:"subst",b:/#\{/,e:/}/,k:t},n=[e.BNM,e.inherit(e.CNM,{starts:{e:"(\\s*/)?",r:0}}),{cN:"string",v:[{b:/'''/,e:/'''/,c:[e.BE]},{b:/'/,e:/'/,c:[e.BE]},{b:/"""/,e:/"""/,c:[e.BE,a]},{b:/"/,e:/"/,c:[e.BE,a]}]},{cN:"regexp",v:[{b:"///",e:"///",c:[a,e.HCM]},{b:"//[gim]*",r:0},{b:/\/(?![ *])(\\\/|.)*?\/[gim]*(?=\W|$)/}]},{cN:"property",b:"@"+r},{b:"`",e:"`",eB:!0,eE:!0,sL:"javascript"}];a.c=n;var i=e.inherit(e.TM,{b:r}),s="(\\(.*\\))?\\s*\\B[-=]>",c={cN:"params",b:"\\([^\\(]",rB:!0,c:[{b:/\(/,e:/\)/,k:t,c:["self"].concat(n)}]};return{aliases:["coffee","cson","iced"],k:t,i:/\/\*/,c:n.concat([e.C("###","###"),e.HCM,{cN:"function",b:"^\\s*"+r+"\\s*=\\s*"+s,e:"[-=]>",rB:!0,c:[i,c]},{b:/[:\(,=]\s*/,r:0,c:[{cN:"function",b:s,e:"[-=]>",rB:!0,c:[c]}]},{cN:"class",bK:"class",e:"$",i:/[:="\[\]]/,c:[{bK:"extends",eW:!0,i:/[:="\[\]]/,c:[i]},i]},{cN:"attribute",b:r+":",e:":",rB:!0,rE:!0,r:0}])}}),e.registerLanguage("cpp",function(e){var t={cN:"keyword",b:"\\b[a-z\\d_]*_t\\b"},r={cN:"string",v:[e.inherit(e.QSM,{b:'((u8?|U)|L)?"'}),{b:'(u8?|U)?R"',e:'"',c:[e.BE]},{b:"'\\\\?.",e:"'",i:"."}]},a={cN:"number",v:[{b:"\\b(\\d+(\\.\\d*)?|\\.\\d+)(u|U|l|L|ul|UL|f|F)"},{b:e.CNR}]},n={cN:"preprocessor",b:"#",e:"$",k:"if else elif endif define undef warning error line pragma ifdef ifndef",c:[{b:/\\\n/,r:0},{bK:"include",e:"$",c:[r,{cN:"string",b:"<",e:">",i:"\\n"}]},r,a,e.CLCM,e.CBCM]},i=e.IR+"\\s*\\(",s={keyword:"int float while private char catch export virtual operator sizeof dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace unsigned long volatile static protected bool template mutable if public friend do goto auto void enum else break extern using class asm case typeid short reinterpret_cast|10 default double register explicit signed typename try this switch continue inline delete alignof constexpr decltype noexcept static_assert thread_local restrict _Bool complex _Complex _Imaginary atomic_bool atomic_char atomic_schar atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong atomic_ullong",built_in:"std string cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf",literal:"true false nullptr NULL"};return{aliases:["c","cc","h","c++","h++","hpp"],k:s,i:"</",c:[t,e.CLCM,e.CBCM,a,r,n,{b:"\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<",e:">",k:s,c:["self",t]},{b:e.IR+"::",k:s},{bK:"new throw return else",r:0},{cN:"function",b:"("+e.IR+"[\\*&\\s]+)+"+i,rB:!0,e:/[{;=]/,eE:!0,k:s,i:/[^\w\s\*&]/,c:[{b:i,rB:!0,c:[e.TM],r:0},{cN:"params",b:/\(/,e:/\)/,k:s,r:0,c:[e.CLCM,e.CBCM,r,a]},e.CLCM,e.CBCM,n]}]}}),e.registerLanguage("cs",function(e){var t="abstract as base bool break byte case catch char checked const continue decimal dynamic default delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long null when object operator out override params private protected public readonly ref sbyte sealed short sizeof stackalloc static string struct switch this true try typeof uint ulong unchecked unsafe ushort using virtual volatile void while async protected public private internal ascending descending from get group into join let orderby partial select set value var where yield",r=e.IR+"(<"+e.IR+">)?";return{aliases:["csharp"],k:t,i:/::/,c:[e.C("///","$",{rB:!0,c:[{cN:"xmlDocTag",v:[{b:"///",r:0},{b:"<!--|-->"},{b:"</?",e:">"}]}]}),e.CLCM,e.CBCM,{cN:"preprocessor",b:"#",e:"$",k:"if else elif endif define undef warning error line region endregion pragma checksum"},{cN:"string",b:'@"',e:'"',c:[{b:'""'}]},e.ASM,e.QSM,e.CNM,{bK:"class interface",e:/[{;=]/,i:/[^\s:]/,c:[e.TM,e.CLCM,e.CBCM]},{bK:"namespace",e:/[{;=]/,i:/[^\s:]/,c:[{cN:"title",b:"[a-zA-Z](\\.?\\w)*",r:0},e.CLCM,e.CBCM]},{bK:"new return throw await",r:0},{cN:"function",b:"("+r+"\\s+)+"+e.IR+"\\s*\\(",rB:!0,e:/[{;=]/,eE:!0,k:t,c:[{b:e.IR+"\\s*\\(",rB:!0,c:[e.TM],r:0},{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,k:t,r:0,c:[e.ASM,e.QSM,e.CNM,e.CBCM]},e.CLCM,e.CBCM]}]}}),e.registerLanguage("css",function(e){var t="[a-zA-Z-][a-zA-Z0-9_-]*",r={cN:"function",b:t+"\\(",rB:!0,eE:!0,e:"\\("},a={cN:"rule",b:/[A-Z\_\.\-]+\s*:/,rB:!0,e:";",eW:!0,c:[{cN:"attribute",b:/\S/,e:":",eE:!0,starts:{cN:"value",eW:!0,eE:!0,c:[r,e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"hexcolor",b:"#[0-9A-Fa-f]+"},{cN:"important",b:"!important"}]}}]};return{cI:!0,i:/[=\/|'\$]/,c:[e.CBCM,{cN:"id",b:/\#[A-Za-z0-9_-]+/},{cN:"class",b:/\.[A-Za-z0-9_-]+/},{cN:"attr_selector",b:/\[/,e:/\]/,i:"$"},{cN:"pseudo",b:/:(:)?[a-zA-Z0-9\_\-\+\(\)"']+/},{cN:"at_rule",b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{cN:"at_rule",b:"@",e:"[{;]",c:[{cN:"keyword",b:/\S+/},{b:/\s/,eW:!0,eE:!0,r:0,c:[r,e.ASM,e.QSM,e.CSSNM]}]},{cN:"tag",b:t,r:0},{cN:"rules",b:"{",e:"}",i:/\S/,c:[e.CBCM,a]}]}}),e.registerLanguage("diff",function(e){return{aliases:["patch"],c:[{cN:"chunk",r:10,v:[{b:/^@@ +\-\d+,\d+ +\+\d+,\d+ +@@$/},{b:/^\*\*\* +\d+,\d+ +\*\*\*\*$/},{b:/^\-\-\- +\d+,\d+ +\-\-\-\-$/}]},{cN:"header",v:[{b:/Index: /,e:/$/},{b:/=====/,e:/=====$/},{b:/^\-\-\-/,e:/$/},{b:/^\*{3} /,e:/$/},{b:/^\+\+\+/,e:/$/},{b:/\*{5}/,e:/\*{5}$/}]},{cN:"addition",b:"^\\+",e:"$"},{cN:"deletion",b:"^\\-",e:"$"},{cN:"change",b:"^\\!",e:"$"}]}}),e.registerLanguage("http",function(e){return{aliases:["https"],i:"\\S",c:[{cN:"status",b:"^HTTP/[0-9\\.]+",e:"$",c:[{cN:"number",b:"\\b\\d{3}\\b"}]},{cN:"request",b:"^[A-Z]+ (.*?) HTTP/[0-9\\.]+$",rB:!0,e:"$",c:[{cN:"string",b:" ",e:" ",eB:!0,eE:!0}]},{cN:"attribute",b:"^\\w",e:": ",eE:!0,i:"\\n|\\s|=",starts:{cN:"string",e:"$"}},{b:"\\n\\n",starts:{sL:[],eW:!0}}]}}),e.registerLanguage("ini",function(e){var t={cN:"string",c:[e.BE],v:[{b:"'''",e:"'''",r:10},{b:'"""',e:'"""',r:10},{b:'"',e:'"'},{b:"'",e:"'"}]};return{aliases:["toml"],cI:!0,i:/\S/,c:[e.C(";","$"),e.HCM,{cN:"title",b:/^\s*\[+/,e:/\]+/},{cN:"setting",b:/^[a-z0-9\[\]_-]+\s*=\s*/,e:"$",c:[{cN:"value",eW:!0,k:"on off true false yes no",c:[{cN:"variable",v:[{b:/\$[\w\d"][\w\d_]*/},{b:/\$\{(.*?)}/}]},t,{cN:"number",b:/([\+\-]+)?[\d]+_[\d_]+/},e.NM],r:0}]}]}}),e.registerLanguage("java",function(e){var t=e.UIR+"(<"+e.UIR+">)?",r="false synchronized int abstract float private char boolean static null if const for true while long strictfp finally protected import native final void enum else break transient catch instanceof byte super volatile case assert short package default double public try this switch continue throws protected public private",a="\\b(0[bB]([01]+[01_]+[01]+|[01]+)|0[xX]([a-fA-F0-9]+[a-fA-F0-9_]+[a-fA-F0-9]+|[a-fA-F0-9]+)|(([\\d]+[\\d_]+[\\d]+|[\\d]+)(\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))?|\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))([eE][-+]?\\d+)?)[lLfF]?",n={cN:"number",b:a,r:0};return{aliases:["jsp"],k:r,i:/<\/|#/,c:[e.C("/\\*\\*","\\*/",{r:0,c:[{cN:"doctag",b:"@[A-Za-z]+"}]}),e.CLCM,e.CBCM,e.ASM,e.QSM,{cN:"class",bK:"class interface",e:/[{;=]/,eE:!0,k:"class interface",i:/[:"\[\]]/,c:[{bK:"extends implements"},e.UTM]},{bK:"new throw return else",r:0},{cN:"function",b:"("+t+"\\s+)+"+e.UIR+"\\s*\\(",rB:!0,e:/[{;=]/,eE:!0,k:r,c:[{b:e.UIR+"\\s*\\(",rB:!0,r:0,c:[e.UTM]},{cN:"params",b:/\(/,e:/\)/,k:r,r:0,c:[e.ASM,e.QSM,e.CNM,e.CBCM]},e.CLCM,e.CBCM]},n,{cN:"annotation",b:"@[A-Za-z]+"}]}}),e.registerLanguage("javascript",function(e){return{aliases:["js"],k:{keyword:"in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"},c:[{cN:"pi",r:10,b:/^\s*['"]use (strict|asm)['"]/},e.ASM,e.QSM,{cN:"string",b:"`",e:"`",c:[e.BE,{cN:"subst",b:"\\$\\{",e:"\\}"}]},e.CLCM,e.CBCM,{cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{b:/</,e:/>\s*[);\]]/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[e.inherit(e.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,c:[e.CLCM,e.CBCM]}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+e.IR,r:0},{bK:"import",e:"[;$]",k:"import from as",c:[e.ASM,e.QSM]},{cN:"class",bK:"class",e:/[{;=]/,eE:!0,i:/[:"\[\]]/,c:[{bK:"extends"},e.UTM]}],i:/#/}}),e.registerLanguage("json",function(e){var t={literal:"true false null"},r=[e.QSM,e.CNM],a={cN:"value",e:",",eW:!0,eE:!0,c:r,k:t},n={b:"{",e:"}",c:[{cN:"attribute",b:'\\s*"',e:'"\\s*:\\s*',eB:!0,eE:!0,c:[e.BE],i:"\\n",starts:a}],i:"\\S"},i={b:"\\[",e:"\\]",c:[e.inherit(a,{cN:null})],i:"\\S"};return r.splice(r.length,0,n,i),{c:r,k:t,i:"\\S"}}),e.registerLanguage("makefile",function(e){var t={cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]};return{aliases:["mk","mak"],c:[e.HCM,{b:/^\w+\s*\W*=/,rB:!0,r:0,starts:{cN:"constant",e:/\s*\W*=/,eE:!0,starts:{e:/$/,r:0,c:[t]}}},{cN:"title",b:/^[\w]+:\s*$/},{cN:"phony",b:/^\.PHONY:/,e:/$/,k:".PHONY",l:/[\.\w]+/},{b:/^\t+/,e:/$/,r:0,c:[e.QSM,t]}]}}),e.registerLanguage("xml",function(e){var t="[A-Za-z0-9\\._:-]+",r={b:/<\?(php)?(?!\w)/,e:/\?>/,sL:"php"},a={eW:!0,i:/</,r:0,c:[r,{cN:"attribute",b:t,r:0},{b:"=",r:0,c:[{cN:"value",c:[r],v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s\/>]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xsl","plist"],cI:!0,c:[{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},e.C("<!--","-->",{r:10}),{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[a],starts:{e:"</style>",rE:!0,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[a],starts:{e:"</script>",rE:!0,sL:["actionscript","javascript","handlebars"]}},r,{cN:"pi",b:/<\?\w+/,e:/\?>/,r:10},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:/[^ \/><\n\t]+/,r:0},a]}]}}),e.registerLanguage("markdown",function(e){return{aliases:["md","mkdown","mkd"],c:[{cN:"header",v:[{b:"^#{1,6}",e:"$"},{b:"^.+?\\n[=-]{2,}$"}]},{b:"<",e:">",sL:"xml",r:0},{cN:"bullet",b:"^([*+-]|(\\d+\\.))\\s+"},{cN:"strong",b:"[*_]{2}.+?[*_]{2}"},{cN:"emphasis",v:[{b:"\\*.+?\\*"},{b:"_.+?_",r:0}]},{cN:"blockquote",b:"^>\\s+",e:"$"},{cN:"code",v:[{b:"`.+?`"},{b:"^( {4}|	)",e:"$",r:0}]},{cN:"horizontal_rule",b:"^[-\\*]{3,}",e:"$"},{b:"\\[.+?\\][\\(\\[].*?[\\)\\]]",rB:!0,c:[{cN:"link_label",b:"\\[",e:"\\]",eB:!0,rE:!0,r:0},{cN:"link_url",b:"\\]\\(",e:"\\)",eB:!0,eE:!0},{cN:"link_reference",b:"\\]\\[",e:"\\]",eB:!0,eE:!0}],r:10},{b:"^\\[.+\\]:",rB:!0,c:[{cN:"link_reference",b:"\\[",e:"\\]:",eB:!0,eE:!0,starts:{cN:"link_url",e:"$"}}]}]}}),e.registerLanguage("nginx",function(e){var t={cN:"variable",v:[{b:/\$\d+/},{b:/\$\{/,e:/}/},{b:"[\\$\\@]"+e.UIR}]},r={eW:!0,l:"[a-z/_]+",k:{built_in:"on off yes no true false none blocked debug info notice warn error crit select break last permanent redirect kqueue rtsig epoll poll /dev/poll"},r:0,i:"=>",c:[e.HCM,{cN:"string",c:[e.BE,t],v:[{b:/"/,e:/"/},{b:/'/,e:/'/}]},{cN:"url",b:"([a-z]+):/",e:"\\s",eW:!0,eE:!0,c:[t]},{cN:"regexp",c:[e.BE,t],v:[{b:"\\s\\^",e:"\\s|{|;",rE:!0},{b:"~\\*?\\s+",e:"\\s|{|;",rE:!0},{b:"\\*(\\.[a-z\\-]+)+"},{b:"([a-z\\-]+\\.)+\\*"}]},{cN:"number",b:"\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"},{cN:"number",b:"\\b\\d+[kKmMgGdshdwy]*\\b",r:0},t]};return{aliases:["nginxconf"],c:[e.HCM,{b:e.UIR+"\\s",e:";|{",rB:!0,c:[{cN:"title",b:e.UIR,starts:r}],r:0}],i:"[^\\s\\}]"}}),e.registerLanguage("objectivec",function(e){var t={cN:"built_in",b:"(AV|CA|CF|CG|CI|MK|MP|NS|UI)\\w+"},r={keyword:"int float while char export sizeof typedef const struct for union unsigned long volatile static bool mutable if do return goto void enum else break extern asm case short default double register explicit signed typename this switch continue wchar_t inline readonly assign readwrite self @synchronized id typeof nonatomic super unichar IBOutlet IBAction strong weak copy in out inout bycopy byref oneway __strong __weak __block __autoreleasing @private @protected @public @try @property @end @throw @catch @finally @autoreleasepool @synthesize @dynamic @selector @optional @required",literal:"false true FALSE TRUE nil YES NO NULL",built_in:"BOOL dispatch_once_t dispatch_queue_t dispatch_sync dispatch_async dispatch_once"},a=/[a-zA-Z@][a-zA-Z0-9_]*/,n="@interface @class @protocol @implementation";return{aliases:["mm","objc","obj-c"],k:r,l:a,i:"</",c:[t,e.CLCM,e.CBCM,e.CNM,e.QSM,{cN:"string",v:[{b:'@"',e:'"',i:"\\n",c:[e.BE]},{b:"'",e:"[^\\\\]'",i:"[^\\\\][^']"}]},{cN:"preprocessor",b:"#",e:"$",c:[{cN:"title",v:[{b:'"',e:'"'},{b:"<",e:">"}]}]},{cN:"class",b:"("+n.split(" ").join("|")+")\\b",e:"({|$)",eE:!0,k:n,l:a,c:[e.UTM]},{cN:"variable",b:"\\."+e.UIR,r:0}]}}),e.registerLanguage("perl",function(e){var t="getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qqfileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent shutdown dump chomp connect getsockname die socketpair close flock exists index shmgetsub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedirioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when",r={cN:"subst",b:"[$@]\\{",e:"\\}",k:t},a={b:"->{",e:"}"},n={cN:"variable",v:[{b:/\$\d/},{b:/[\$%@](\^\w\b|#\w+(::\w+)*|{\w+}|\w+(::\w*)*)/},{b:/[\$%@][^\s\w{]/,r:0}]},i=[e.BE,r,n],s=[n,e.HCM,e.C("^\\=\\w","\\=cut",{eW:!0}),a,{cN:"string",c:i,v:[{b:"q[qwxr]?\\s*\\(",e:"\\)",r:5},{b:"q[qwxr]?\\s*\\[",e:"\\]",r:5},{b:"q[qwxr]?\\s*\\{",e:"\\}",r:5},{b:"q[qwxr]?\\s*\\|",e:"\\|",r:5},{b:"q[qwxr]?\\s*\\<",e:"\\>",r:5},{b:"qw\\s+q",e:"q",r:5},{b:"'",e:"'",c:[e.BE]},{b:'"',e:'"'},{b:"`",e:"`",c:[e.BE]},{b:"{\\w+}",c:[],r:0},{b:"-?\\w+\\s*\\=\\>",c:[],r:0}]},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{b:"(\\/\\/|"+e.RSR+"|\\b(split|return|print|reverse|grep)\\b)\\s*",k:"split return print reverse grep",r:0,c:[e.HCM,{cN:"regexp",b:"(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*",r:10},{cN:"regexp",b:"(m|qr)?/",e:"/[a-z]*",c:[e.BE],r:0}]},{cN:"sub",bK:"sub",e:"(\\s*\\(.*?\\))?[;{]",r:5},{cN:"operator",b:"-\\w\\b",r:0},{b:"^__DATA__$",e:"^__END__$",sL:"mojolicious",c:[{b:"^@@.*",e:"$",cN:"comment"}]}];return r.c=s,a.c=s,{aliases:["pl"],k:t,c:s}}),e.registerLanguage("php",function(e){var t={cN:"variable",b:"\\$+[a-zA-Z_-ÿ][a-zA-Z0-9_-ÿ]*"},r={cN:"preprocessor",b:/<\?(php)?|\?>/},a={cN:"string",c:[e.BE,r],v:[{b:'b"',e:'"'},{b:"b'",e:"'"},e.inherit(e.ASM,{i:null}),e.inherit(e.QSM,{i:null})]},n={v:[e.BNM,e.CNM]};return{aliases:["php3","php4","php5","php6"],cI:!0,k:"and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception default die require __FUNCTION__ enddeclare final try switch continue endfor endif declare unset true false trait goto instanceof insteadof __DIR__ __NAMESPACE__ yield finally",c:[e.CLCM,e.HCM,e.C("/\\*","\\*/",{c:[{cN:"doctag",b:"@[A-Za-z]+"},r]}),e.C("__halt_compiler.+?;",!1,{eW:!0,k:"__halt_compiler",l:e.UIR}),{cN:"string",b:/<<<['"]?\w+['"]?$/,e:/^\w+;?$/,c:[e.BE,{cN:"subst",v:[{b:/\$\w+/},{b:/\{\$/,e:/\}/}]}]},r,t,{b:/(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/},{cN:"function",bK:"function",e:/[;{]/,eE:!0,i:"\\$|\\[|%",c:[e.UTM,{cN:"params",b:"\\(",e:"\\)",c:["self",t,e.CBCM,a,n]}]},{cN:"class",bK:"class interface",e:"{",eE:!0,i:/[:\(\$"]/,c:[{bK:"extends implements"},e.UTM]},{bK:"namespace",e:";",i:/[\.']/,c:[e.UTM]},{bK:"use",e:";",c:[e.UTM]},{b:"=>"},a,n]}}),e.registerLanguage("python",function(e){var t={cN:"prompt",b:/^(>>>|\.\.\.) /},r={cN:"string",c:[e.BE],v:[{b:/(u|b)?r?'''/,e:/'''/,c:[t],r:10},{b:/(u|b)?r?"""/,e:/"""/,c:[t],r:10},{b:/(u|r|ur)'/,e:/'/,r:10},{b:/(u|r|ur)"/,e:/"/,r:10},{b:/(b|br)'/,e:/'/},{b:/(b|br)"/,e:/"/},e.ASM,e.QSM]},a={cN:"number",r:0,v:[{b:e.BNR+"[lLjJ]?"},{b:"\\b(0o[0-7]+)[lLjJ]?"},{b:e.CNR+"[lLjJ]?"}]},n={cN:"params",b:/\(/,e:/\)/,c:["self",t,a,r]};return{aliases:["py","gyp"],k:{keyword:"and elif is global as in if from raise for except finally print import pass return exec else break not with class assert yield try while continue del or def lambda async await nonlocal|10 None True False",built_in:"Ellipsis NotImplemented"},i:/(<\/|->|\?)/,c:[t,a,r,e.HCM,{v:[{cN:"function",bK:"def",r:10},{cN:"class",bK:"class"}],e:/:/,i:/[${=;\n,]/,c:[e.UTM,n]},{cN:"decorator",b:/^[\t ]*@/,e:/$/},{b:/\b(print|exec)\(/}]}}),e.registerLanguage("ruby",function(e){var t="[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?",r="and false then defined module in return redo if BEGIN retry end for true self when next until do begin unless END rescue nil else break undef not super class case require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor",a={cN:"doctag",b:"@[A-Za-z]+"},n={cN:"value",b:"#<",e:">"},i=[e.C("#","$",{c:[a]}),e.C("^\\=begin","^\\=end",{c:[a],r:10}),e.C("^__END__","\\n$")],s={cN:"subst",b:"#\\{",e:"}",k:r},c={cN:"string",c:[e.BE,s],v:[{b:/'/,e:/'/},{b:/"/,e:/"/},{b:/`/,e:/`/},{b:"%[qQwWx]?\\(",e:"\\)"},{b:"%[qQwWx]?\\[",e:"\\]"},{b:"%[qQwWx]?{",e:"}"},{b:"%[qQwWx]?<",e:">"},{b:"%[qQwWx]?/",e:"/"},{b:"%[qQwWx]?%",e:"%"},{b:"%[qQwWx]?-",e:"-"},{b:"%[qQwWx]?\\|",e:"\\|"},{b:/\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/}]},o={cN:"params",b:"\\(",e:"\\)",k:r},l=[c,n,{cN:"class",bK:"class module",e:"$|;",i:/=/,c:[e.inherit(e.TM,{b:"[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?"}),{cN:"inheritance",b:"<\\s*",c:[{cN:"parent",b:"("+e.IR+"::)?"+e.IR}]}].concat(i)},{cN:"function",bK:"def",e:"$|;",c:[e.inherit(e.TM,{b:t}),o].concat(i)},{cN:"constant",b:"(::)?(\\b[A-Z]\\w*(::)?)+",r:0},{cN:"symbol",b:e.UIR+"(\\!|\\?)?:",r:0},{cN:"symbol",b:":",c:[c,{b:t}],r:0},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{cN:"variable",b:"(\\$\\W)|((\\$|\\@\\@?)(\\w+))"},{b:"("+e.RSR+")\\s*",c:[n,{cN:"regexp",c:[e.BE,s],i:/\n/,v:[{b:"/",e:"/[a-z]*"},{b:"%r{",e:"}[a-z]*"},{b:"%r\\(",e:"\\)[a-z]*"},{b:"%r!",e:"![a-z]*"},{b:"%r\\[",e:"\\][a-z]*"}]}].concat(i),r:0}].concat(i);s.c=l,o.c=l;var u="[>?]>",d="[\\w#]+\\(\\w+\\):\\d+:\\d+>",b="(\\w+-)?\\d+\\.\\d+\\.\\d(p\\d+)?[^>]+>",p=[{b:/^\s*=>/,cN:"status",starts:{e:"$",c:l}},{cN:"prompt",b:"^("+u+"|"+d+"|"+b+")",starts:{e:"$",c:l}}];return{aliases:["rb","gemspec","podspec","thor","irb"],k:r,i:/\/\*/,c:i.concat(p).concat(l)}}),e.registerLanguage("sql",function(e){var t=e.C("--","$");return{cI:!0,i:/[<>{}*]/,c:[{cN:"operator",bK:"begin end start commit rollback savepoint lock alter create drop rename call delete do handler insert load replace select truncate update set show pragma grant merge describe use explain help declare prepare execute deallocate release unlock purge reset change stop analyze cache flush optimize repair kill install uninstall checksum restore check backup revoke",e:/;/,eW:!0,k:{keyword:"abort abs absolute acc acce accep accept access accessed accessible account acos action activate add addtime admin administer advanced advise aes_decrypt aes_encrypt after agent aggregate ali alia alias allocate allow alter always analyze ancillary and any anydata anydataset anyschema anytype apply archive archived archivelog are as asc ascii asin assembly assertion associate asynchronous at atan atn2 attr attri attrib attribu attribut attribute attributes audit authenticated authentication authid authors auto autoallocate autodblink autoextend automatic availability avg backup badfile basicfile before begin beginning benchmark between bfile bfile_base big bigfile bin binary_double binary_float binlog bit_and bit_count bit_length bit_or bit_xor bitmap blob_base block blocksize body both bound buffer_cache buffer_pool build bulk by byte byteordermark bytes c cache caching call calling cancel capacity cascade cascaded case cast catalog category ceil ceiling chain change changed char_base char_length character_length characters characterset charindex charset charsetform charsetid check checksum checksum_agg child choose chr chunk class cleanup clear client clob clob_base clone close cluster_id cluster_probability cluster_set clustering coalesce coercibility col collate collation collect colu colum column column_value columns columns_updated comment commit compact compatibility compiled complete composite_limit compound compress compute concat concat_ws concurrent confirm conn connec connect connect_by_iscycle connect_by_isleaf connect_by_root connect_time connection consider consistent constant constraint constraints constructor container content contents context contributors controlfile conv convert convert_tz corr corr_k corr_s corresponding corruption cos cost count count_big counted covar_pop covar_samp cpu_per_call cpu_per_session crc32 create creation critical cross cube cume_dist curdate current current_date current_time current_timestamp current_user cursor curtime customdatum cycle d data database databases datafile datafiles datalength date_add date_cache date_format date_sub dateadd datediff datefromparts datename datepart datetime2fromparts day day_to_second dayname dayofmonth dayofweek dayofyear days db_role_change dbtimezone ddl deallocate declare decode decompose decrement decrypt deduplicate def defa defau defaul default defaults deferred defi defin define degrees delayed delegate delete delete_all delimited demand dense_rank depth dequeue des_decrypt des_encrypt des_key_file desc descr descri describ describe descriptor deterministic diagnostics difference dimension direct_load directory disable disable_all disallow disassociate discardfile disconnect diskgroup distinct distinctrow distribute distributed div do document domain dotnet double downgrade drop dumpfile duplicate duration e each edition editionable editions element ellipsis else elsif elt empty enable enable_all enclosed encode encoding encrypt end end-exec endian enforced engine engines enqueue enterprise entityescaping eomonth error errors escaped evalname evaluate event eventdata events except exception exceptions exchange exclude excluding execu execut execute exempt exists exit exp expire explain export export_set extended extent external external_1 external_2 externally extract f failed failed_login_attempts failover failure far fast feature_set feature_value fetch field fields file file_name_convert filesystem_like_logging final finish first first_value fixed flash_cache flashback floor flush following follows for forall force form forma format found found_rows freelist freelists freepools fresh from from_base64 from_days ftp full function g general generated get get_format get_lock getdate getutcdate global global_name globally go goto grant grants greatest group group_concat group_id grouping grouping_id groups gtid_subtract guarantee guard handler hash hashkeys having hea head headi headin heading heap help hex hierarchy high high_priority hosts hour http i id ident_current ident_incr ident_seed identified identity idle_time if ifnull ignore iif ilike ilm immediate import in include including increment index indexes indexing indextype indicator indices inet6_aton inet6_ntoa inet_aton inet_ntoa infile initial initialized initially initrans inmemory inner innodb input insert install instance instantiable instr interface interleaved intersect into invalidate invisible is is_free_lock is_ipv4 is_ipv4_compat is_not is_not_null is_used_lock isdate isnull isolation iterate java join json json_exists k keep keep_duplicates key keys kill l language large last last_day last_insert_id last_value lax lcase lead leading least leaves left len lenght length less level levels library like like2 like4 likec limit lines link list listagg little ln load load_file lob lobs local localtime localtimestamp locate locator lock locked log log10 log2 logfile logfiles logging logical logical_reads_per_call logoff logon logs long loop low low_priority lower lpad lrtrim ltrim m main make_set makedate maketime managed management manual map mapping mask master master_pos_wait match matched materialized max maxextents maximize maxinstances maxlen maxlogfiles maxloghistory maxlogmembers maxsize maxtrans md5 measures median medium member memcompress memory merge microsecond mid migration min minextents minimum mining minus minute minvalue missing mod mode model modification modify module monitoring month months mount move movement multiset mutex n name name_const names nan national native natural nav nchar nclob nested never new newline next nextval no no_write_to_binlog noarchivelog noaudit nobadfile nocheck nocompress nocopy nocycle nodelay nodiscardfile noentityescaping noguarantee nokeep nologfile nomapping nomaxvalue nominimize nominvalue nomonitoring none noneditionable nonschema noorder nopr nopro noprom nopromp noprompt norely noresetlogs noreverse normal norowdependencies noschemacheck noswitch not nothing notice notrim novalidate now nowait nth_value nullif nulls num numb numbe nvarchar nvarchar2 object ocicoll ocidate ocidatetime ociduration ociinterval ociloblocator ocinumber ociref ocirefcursor ocirowid ocistring ocitype oct octet_length of off offline offset oid oidindex old on online only opaque open operations operator optimal optimize option optionally or oracle oracle_date oradata ord ordaudio orddicom orddoc order ordimage ordinality ordvideo organization orlany orlvary out outer outfile outline output over overflow overriding p package pad parallel parallel_enable parameters parent parse partial partition partitions pascal passing password password_grace_time password_lock_time password_reuse_max password_reuse_time password_verify_function patch path patindex pctincrease pctthreshold pctused pctversion percent percent_rank percentile_cont percentile_disc performance period period_add period_diff permanent physical pi pipe pipelined pivot pluggable plugin policy position post_transaction pow power pragma prebuilt precedes preceding precision prediction prediction_cost prediction_details prediction_probability prediction_set prepare present preserve prior priority private private_sga privileges procedural procedure procedure_analyze processlist profiles project prompt protection public publishingservername purge quarter query quick quiesce quota quotename radians raise rand range rank raw read reads readsize rebuild record records recover recovery recursive recycle redo reduced ref reference referenced references referencing refresh regexp_like register regr_avgx regr_avgy regr_count regr_intercept regr_r2 regr_slope regr_sxx regr_sxy reject rekey relational relative relaylog release release_lock relies_on relocate rely rem remainder rename repair repeat replace replicate replication required reset resetlogs resize resource respect restore restricted result result_cache resumable resume retention return returning returns reuse reverse revoke right rlike role roles rollback rolling rollup round row row_count rowdependencies rowid rownum rows rtrim rules safe salt sample save savepoint sb1 sb2 sb4 scan schema schemacheck scn scope scroll sdo_georaster sdo_topo_geometry search sec_to_time second section securefile security seed segment select self sequence sequential serializable server servererror session session_user sessions_per_user set sets settings sha sha1 sha2 share shared shared_pool short show shrink shutdown si_averagecolor si_colorhistogram si_featurelist si_positionalcolor si_stillimage si_texture siblings sid sign sin size size_t sizes skip slave sleep smalldatetimefromparts smallfile snapshot some soname sort soundex source space sparse spfile split sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_small_result sql_variant_property sqlcode sqldata sqlerror sqlname sqlstate sqrt square standalone standby start starting startup statement static statistics stats_binomial_test stats_crosstab stats_ks_test stats_mode stats_mw_test stats_one_way_anova stats_t_test_ stats_t_test_indep stats_t_test_one stats_t_test_paired stats_wsr_test status std stddev stddev_pop stddev_samp stdev stop storage store stored str str_to_date straight_join strcmp strict string struct stuff style subdate subpartition subpartitions substitutable substr substring subtime subtring_index subtype success sum suspend switch switchoffset switchover sync synchronous synonym sys sys_xmlagg sysasm sysaux sysdate sysdatetimeoffset sysdba sysoper system system_user sysutcdatetime t table tables tablespace tan tdo template temporary terminated tertiary_weights test than then thread through tier ties time time_format time_zone timediff timefromparts timeout timestamp timestampadd timestampdiff timezone_abbr timezone_minute timezone_region to to_base64 to_date to_days to_seconds todatetimeoffset trace tracking transaction transactional translate translation treat trigger trigger_nestlevel triggers trim truncate try_cast try_convert try_parse type ub1 ub2 ub4 ucase unarchived unbounded uncompress under undo unhex unicode uniform uninstall union unique unix_timestamp unknown unlimited unlock unpivot unrecoverable unsafe unsigned until untrusted unusable unused update updated upgrade upped upper upsert url urowid usable usage use use_stored_outlines user user_data user_resources users using utc_date utc_timestamp uuid uuid_short validate validate_password_strength validation valist value values var var_samp varcharc vari varia variab variabl variable variables variance varp varraw varrawc varray verify version versions view virtual visible void wait wallet warning warnings week weekday weekofyear wellformed when whene whenev wheneve whenever where while whitespace with within without work wrapped xdb xml xmlagg xmlattributes xmlcast xmlcolattval xmlelement xmlexists xmlforest xmlindex xmlnamespaces xmlpi xmlquery xmlroot xmlschema xmlserialize xmltable xmltype xor year year_to_month years yearweek",
literal:"true false null",built_in:"array bigint binary bit blob boolean char character date dec decimal float int int8 integer interval number numeric real record serial serial8 smallint text varchar varying void"},c:[{cN:"string",b:"'",e:"'",c:[e.BE,{b:"''"}]},{cN:"string",b:'"',e:'"',c:[e.BE,{b:'""'}]},{cN:"string",b:"`",e:"`",c:[e.BE]},e.CNM,e.CBCM,t]},e.CBCM,t]}}),e});
},{}],5:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzdGF0aWMvLnRtcC9hcnRpY2xlL21haW4uanMiLCJzdGF0aWMvLnRtcC9jb21tb24vY29tbWVudC5qcyIsInN0YXRpYy8udG1wL2NvbW1vbi9oZWFkZXIuanMiLCJzdGF0aWMvbGliL2hpZ2hsaWdodC9zcmMvaGlnaGxpZ2h0Lm1pbi5qcyIsInN0YXRpYy9saWIvdmlld2VyLW1hc3Rlci9kaXN0L3ZpZXdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEVTNiBGSUxFIEZPUiBBcnRpY2xlQ29udHJvbGxlciBcbiAqIDIwMTUtMDktMDIgMTE6MDk6NTFcbiAqL1xuXG4vLyBpbXBvcnQgJ2pxdWVyeS9kaXN0L2pxdWVyeSdcbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7IGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHsgcmV0dXJuIG9iajsgfSBlbHNlIHsgdmFyIG5ld09iaiA9IHt9OyBpZiAob2JqICE9IG51bGwpIHsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTsgfSB9IG5ld09ialsnZGVmYXVsdCddID0gb2JqOyByZXR1cm4gbmV3T2JqOyB9IH1cblxucmVxdWlyZSgndmlld2VyLW1hc3Rlci9kaXN0L3ZpZXdlcicpO1xuXG5yZXF1aXJlKCdoaWdobGlnaHQvc3JjL2hpZ2hsaWdodC5taW4nKTtcblxucmVxdWlyZSgnaGVhZGVyJyk7XG5cbnZhciBfY29tbWVudCA9IHJlcXVpcmUoJ2NvbW1lbnQnKTtcblxudmFyIGNvbW1lbnQgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChfY29tbWVudCk7XG5cbmZ1bmN0aW9uIGluaXRIaWdobGlnaHQoKSB7XG4gICAgaGxqcy5pbml0SGlnaGxpZ2h0aW5nT25Mb2FkKCk7XG59XG5cbmZ1bmN0aW9uIGluaXRWaWV3ZXIoKSB7XG4gICAgLyokKCcuY2FyZCAuZnVsbCBpbWcnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICBhbGVydCgnY2xpY2sgZXZ0JylcbiAgICB9KSovXG4gICAgJCgnLmNhcmQgLmZ1bGwnKS52aWV3ZXIoKTtcbiAgICAvLyBjb25zb2xlLmxvZygnaW5pdCB2aWV3ZXInKVxufVxuXG5mdW5jdGlvbiBfcmVmKGV2dCkge1xuICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBsb2NhdGlvbi5wYXRobmFtZSA9ICcvYXJ0aWNsZSc7XG4gICAgLy/ov5Tlm57kuIrlsYLvvIzlm7rlrprkvY0vYXJ0aWNsZVxuICAgIC8vIGxvY2F0aW9uLnBhdGhuYW1lID0gJy8nICsgJCh0aGlzKS5kYXRhKCd0eXBlJykgfHwgJydcblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuJChmdW5jdGlvbiAoKSB7XG4gICAgJCgnLmNhcmQgLnJlYWQtbW9yZScpLm9uKCdjbGljaycsIF9yZWYpO1xuICAgIGluaXRWaWV3ZXIoKTtcbiAgICBpbml0SGlnaGxpZ2h0KCk7XG4gICAgY29tbWVudC5pbml0Q29tbWVudCgpO1xuICAgIGNvbW1lbnQubG9hZENvbW1lbnQoKTtcbn0pOyIsIi8qKlxuICogRk9SIEFSVElDTEUgQ09NTUVOVFxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbnZhciBhaWQgPSB1bmRlZmluZWQsXG4gICAgYXBpVXJsID0gdW5kZWZpbmVkLFxuICAgICRjb21tZW50ID0gdW5kZWZpbmVkLFxuICAgICR2ID0gdW5kZWZpbmVkLFxuICAgICRuaWNrbmFtZSA9IHVuZGVmaW5lZCxcbiAgICAkYyA9IHVuZGVmaW5lZCxcbiAgICAkbWFpbCA9IHVuZGVmaW5lZCxcbiAgICAkc3RhdHVzID0gdW5kZWZpbmVkLFxuICAgICRwb3N0QnRuID0gdW5kZWZpbmVkO1xuXG52YXIgX2NvbW1lbnRDYWNoZSA9IHt9O1xuXG5mdW5jdGlvbiBsb2FkQ29tbWVudChjYikge1xuXG4gICAgLy9pZiBjb21tZW50cyBleGlzdFxuICAgIGlmICgkKCcud3JhcCA+IC5jb250ZW50LmNvbnRlbnRfZnVsbCA+IC5jb21tZW50JykubGVuZ3RoKSByZXR1cm4gY29uc29sZS5sb2coJ0NvbW1lbnQgQmxvY2sgZXhpc3RlZCEnKSB8fCBmYWxzZTtcblxuICAgIHZhciAkY2FyZE1ldGEgPSAkKCcud3JhcCA+IC5jb250ZW50ID4gLmNhcmQgPiAuZXhjZXJwdCAuZnVsbCcpLm5vdCgnOmhpZGRlbicpLnBhcmVudHMoJy5leGNlcnB0JykucHJldignLmNhcmQtbWV0YScpO1xuXG4gICAgLy9zZXQgYXJ0aWNsZVxuICAgIGFpZCA9ICRjYXJkTWV0YS5maW5kKCcuX2FydGljbGVfaWQnKS5lcSgwKS52YWwoKTtcblxuICAgIGZ1bmN0aW9uIF9jYihycykge1xuXG4gICAgICAgICQoJy5jb250ZW50LmNvbnRlbnRfZnVsbCcpLmFwcGVuZCgkKHJzKSk7XG4gICAgICAgIHNldFZhcnMoKTtcbiAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgIGNiID8gY2IocnMpIDogJyc7XG4gICAgfVxuXG4gICAgLy/lpoLmnpznvJPlrZjkuK3mnInvvIzpgqPkuYjku47nvJPlrZjkuK3or7vlj5ZcbiAgICBhcGlVcmwgPSAnL2NvbW1lbnQvZ2V0LycgKyBhaWQ7XG4gICAgdmFyIF9jYWNoZWRSZXMgPSBfY29tbWVudENhY2hlW2FwaVVybF07XG4gICAgaWYgKF9jYWNoZWRSZXMpIHtcblxuICAgICAgICByZXR1cm4gX2NiKF9jYWNoZWRSZXMpO1xuICAgIH1cblxuICAgICQuYWpheCh7XG4gICAgICAgICd1cmwnOiBhcGlVcmwsXG4gICAgICAgICd0eXBlJzogJ1BPU1QnLFxuICAgICAgICAnZGF0YVR5cGUnOiAnaHRtbCdcbiAgICB9KS5kb25lKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgX2NiKHJlcyk7XG4gICAgICAgIF9jb21tZW50Q2FjaGVbYXBpVXJsXSA9IHJlcztcbiAgICB9KS5mYWlsKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgY2IgPyBjYihycykgOiAnJztcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2V0VmFycygpIHtcbiAgICAkY29tbWVudCA9ICQoJy5jb250ZW50LmNvbnRlbnRfZnVsbCAuY29tbWVudCcpO1xuXG4gICAgJHYgPSAkKCcuY29udGVudF9mdWxsIGlucHV0W25hbWU9XCJ2ZXJpZmljYXRpb25cIl0nKTtcbiAgICAkbmlja25hbWUgPSAkKCcuY29udGVudF9mdWxsIGlucHV0W25hbWU9XCJuaWNrbmFtZVwiXScpO1xuICAgICRjID0gJCgnLmNvbnRlbnRfZnVsbCB0ZXh0YXJlYVtuYW1lPVwiY29tbWVudF9jb250ZW50XCJdJyk7XG4gICAgJG1haWwgPSAkKCcuY29udGVudF9mdWxsIGlucHV0W25hbWU9XCJtYWlsXCJdJyk7XG5cbiAgICAkc3RhdHVzID0gJGNvbW1lbnQuZmluZCgnLmRpYWxvZyAuZGlhbG9nLXN0YXR1cycpO1xuXG4gICAgJHBvc3RCdG4gPSAkKCcuY29tbWVudC1wYW5lbCAucG9zdF9idG4nKTtcbn1cblxuZnVuY3Rpb24gcmVmcmVzaFZlcmlmaWNhdGlvbigpIHtcblxuICAgIHZhciBzcmMgPSAkKCcjdmVyaWZpY2F0aW9uX2ltZycpLmF0dHIoJ3NyYycpO1xuICAgIC8vICQoJyN2ZXJpZmljYXRpb25faW1nJykuYXR0cignc3JjJywgJycpXG4gICAgJCgnI3ZlcmlmaWNhdGlvbl9pbWcnKS5hdHRyKCdzcmMnLCBNTy51dGlsLmFkZFVSTFBhcmFtKHNyYywgJ3N0JywgbmV3IERhdGUoKS5nZXRUaW1lKCkpKTtcblxuICAgICR2LnZhbCgnJyk7XG59XG5cbmZ1bmN0aW9uIF9yZWZyZXNoQ2FjaGUoX2RhdGEpIHtcbiAgICB2YXIgbmV3RGF0YSA9IF9kYXRhIHx8ICRjb21tZW50LmdldCgwKS5vdXRlckhUTUw7XG4gICAgX2NvbW1lbnRDYWNoZVthcGlVcmxdID0gbmV3RGF0YTtcbn1cblxuZnVuY3Rpb24gX3JlZihlcnIpIHtcbiAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIHJlZnJlc2hWZXJpZmljYXRpb24oKTtcbiAgICBhbGVydCgn6aqM6K+B56CB6ZSZ6K+v77yM6K+35oKo6YeN5paw6L6T5YWlJyk7XG59XG5cbmZ1bmN0aW9uIGFkZENvbW1lbnQoZXZ0KSB7XG4gICAgdmFyICRidG4gPSAkKHRoaXMpO1xuICAgIGlmICgkYnRuLmlzKCcuZGlzYWJsZWQnKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgJGJ0bi5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICB9XG5cbiAgICB2YXIgY29udGVudCA9ICRjLnZhbCgpLFxuICAgICAgICBtYWlsID0gJG1haWwudmFsKCksXG4gICAgICAgIG5pY2tuYW1lID0gJG5pY2tuYW1lLnZhbCgpLFxuICAgICAgICB2ZXJpZmljYXRpb24gPSAkdi52YWwoKTtcblxuICAgIC8v5piv5ZCm5piv5Zue5aSN5p+Q5Liq5Lq6XG4gICAgdmFyIHJlbENvbW1lbnRJZCA9ICRzdGF0dXMuZGF0YSgnaWQnKTtcbiAgICB2YXIgdG8gPSAkc3RhdHVzLmRhdGEoJ3RvQXV0aG9yJyk7XG4gICAgdmFyICRsaXN0ID0gJHN0YXR1cy5kYXRhKCdsaXN0Jyk7XG5cbiAgICAvLyBjb25zb2xlLmxvZygkbGlzdClcblxuICAgIHZhciBpc192YWxpZCA9IHRydWU7XG5cbiAgICBpZiAoIXZlcmlmaWNhdGlvbikge1xuICAgICAgICAkYnRuLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgICByZXR1cm4gYWxlcnQoJ+ivt+Whq+WGmemqjOivgeeggScpO1xuICAgIH1cblxuICAgIGlmICghY29udGVudCB8fCAhbmlja25hbWUpIHtcbiAgICAgICAgJGJ0bi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgICAgcmV0dXJuIGFsZXJ0KCfor7floavlhpnor4TorrrlhoXlrrnlkoznp7DlkbwnKTtcbiAgICB9XG5cbiAgICBpZiAobWFpbCAmJiAhTU8udXRpbC52YWxpZGF0ZShtYWlsLCAnbWFpbCcpKSB7XG4gICAgICAgICRidG4ucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICAgIHJldHVybiBhbGVydCgn6K+35aGr5YaZ5q2j56Gu55qE6YKu566x5Zyw5Z2AJyk7XG4gICAgfVxuICAgIHZhciBfcmQgPSBNTy51dGlsLnJhbmRvbU51bSgxLCAxNCk7XG5cbiAgICB2YXIgYXZhdGFyVXJsID0gJy9zdGF0aWMvaW1nL2NvbW1vbi9hdmF0YXIvJyArIF9yZCArICcucG5nJztcblxuICAgIC8qKlxuICAgICAqIEBkZWJ1ZyBcbiAgICAgKi9cbiAgICAvLyBnZXQgdGhlIGNvbnRlbnQgd2l0aCBhIGxpbmtcbiAgICB2YXIgXyRmID0gTU8uZm9ybWF0dGVyLmF1dG9saW5rKCRjKSxcbiAgICAgICAgZkNvbnRlbnQgPSBfJGYuaHRtbCgpO1xuXG4gICAgJC5hamF4KHtcbiAgICAgICAgJ3VybCc6ICcvY29tbWVudC9hZGQvJyArIGFpZCxcbiAgICAgICAgJ3R5cGUnOiAnUE9TVCcsXG4gICAgICAgICdkYXRhVHlwZSc6ICdodG1sJyxcbiAgICAgICAgJ2RhdGEnOiB7XG4gICAgICAgICAgICAnYXJ0aWNsZV9pZCc6IGFpZCxcbiAgICAgICAgICAgICdjb250ZW50JzogZkNvbnRlbnQsXG4gICAgICAgICAgICAnYXZhdGFyJzogYXZhdGFyVXJsLFxuICAgICAgICAgICAgJ3JlbF9jb21tZW50JzogcmVsQ29tbWVudElkLFxuICAgICAgICAgICAgJ3RvQXV0aG9yJzogdG8sXG4gICAgICAgICAgICAnbWFpbCc6IG1haWwsXG4gICAgICAgICAgICAnbmlja25hbWUnOiBuaWNrbmFtZSxcbiAgICAgICAgICAgICd2ZXJpZmljYXRpb24nOiB2ZXJpZmljYXRpb25cbiAgICAgICAgfVxuICAgIH0pLmRvbmUoZnVuY3Rpb24gKHJzKSB7XG4gICAgICAgIGlmICgkbGlzdCAmJiAkbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZXNwb25zZSBDb21tZW50IExpc3QnKTtcbiAgICAgICAgICAgICRsaXN0LmFwcGVuZCgkKHJzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkY29tbWVudC5maW5kKCc+IHVsJykucHJlcGVuZCgkKHJzKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2FkZCBjb3VudFxuICAgICAgICBpbmNyZWFzZUNvbW1lbnRDb3VudCgpO1xuICAgICAgICBfcmVmcmVzaENhY2hlKCk7XG5cbiAgICAgICAgYWxlcnQoJ+ivhOiuuuaIkOWKnycpO1xuICAgICAgICByZXNldENvbW1lbnQoKTtcbiAgICB9KS5mYWlsKF9yZWYpLmNvbXBsZXRlKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgJGJ0bi5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gaW5jcmVhc2VDb21tZW50Q291bnQoKSB7XG4gICAgdmFyICRjb3VudCA9ICRjb21tZW50LmZpbmQoJz4gaDMgPiBzcGFuJyk7XG4gICAgdmFyIGNvdW50ID0gcGFyc2VJbnQoJGNvdW50Lmh0bWwoKSk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhjb3VudClcbiAgICAkY291bnQuaHRtbChjb3VudCArIDEpO1xufVxuXG5mdW5jdGlvbiBkZXN0cm95Q29tbWVudCgpIHtcbiAgICAvLyAkKCcud3JhcCA+IC5jb250ZW50Jykub2ZmKCdjbGljay5jb21tZW50JylcbiAgICAkY29tbWVudC5yZW1vdmUoKTtcbn1cblxuZnVuY3Rpb24gcmVzU29tZW9uZSgpIHtcbiAgICB2YXIgJG1ldGEgPSAkKHRoaXMpLnBhcmVudHMoJy5jb21tZW50LW1ldGEnKTtcbiAgICB2YXIgJGFic29sdXRlTWV0YSA9ICQodGhpcykucGFyZW50cygnbGknKS5maW5kKCc+IC5jb21tZW50LW1ldGEnKTtcblxuICAgIHZhciAkcmVsX2xpc3QgPSAkKHRoaXMpLnBhcmVudHMoJy5yZXNwb25zZS1saXN0Jyk7XG4gICAgaWYgKCEkcmVsX2xpc3QubGVuZ3RoKSAkcmVsX2xpc3QgPSAkbWV0YS5uZXh0QWxsKCcucmVzcG9uc2UtbGlzdCcpO1xuXG4gICAgLy8gY29uc29sZS5sb2coJHJlbF9saXN0KVxuXG4gICAgdmFyIGNvbW1lbnRJZCA9ICRhYnNvbHV0ZU1ldGEuZGF0YSgnaWQnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKGNvbW1lbnRJZClcblxuICAgIHZhciBhdXRob3IgPSAkbWV0YS5maW5kKCdhW2RhdGEtYXV0aG9yXScpLmRhdGEoJ2F1dGhvcicpO1xuXG4gICAgLy8gY29uc29sZS5sb2coY29tbWVudElkKVxuXG4gICAgJHN0YXR1cy5kYXRhKCdpZCcsIGNvbW1lbnRJZCk7XG4gICAgJHN0YXR1cy5kYXRhKCd0b0F1dGhvcicsIGF1dGhvcik7XG4gICAgJHN0YXR1cy5kYXRhKCdsaXN0JywgJHJlbF9saXN0KTtcblxuICAgICRzdGF0dXMuaHRtbCgn5Zue5aSNIDxhIGhyZWY9XCJqYXZhc2NyaXB0OjtcIj5AJyArIGF1dGhvciArICc8L2E+Jyk7XG4gICAgLy8gJGNvbW1lbnQuZmluZCgndGV4dGFyZWEnKS52YWwoYOWbnuWkjSBAJHthdXRob3J9OiBcXG5gKVxuICAgICRwb3N0QnRuLmh0bWwoJ+WbnuWkjScpO1xuICAgIG9wZW5Db21tZW50RGlhbG9nKCk7XG59XG5cbmZ1bmN0aW9uIG9wZW5Db21tZW50RGlhbG9nKGV2dCkge1xuICAgICRjb21tZW50LmZpbmQoJy5kaWFsb2ctY29udGVudCcpLmFkZENsYXNzKCd0cmlnZ2VyZWQnKTtcblxuICAgIHZhciBzdGF0dXNPZmZzZXRUb3AgPSAkc3RhdHVzLm9mZnNldCgpLnRvcCAtIDE1O1xuXG4gICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICdzY3JvbGxUb3AnOiBzdGF0dXNPZmZzZXRUb3AgKyAncHgnXG5cbiAgICB9LCA0MDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJGNvbW1lbnQuZmluZCgndGV4dGFyZWEnKS5mb2N1cygpO1xuICAgIH0pO1xuXG4gICAgLy8gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgPSAkc3RhdHVzLm9mZnNldCgpLnRvcC0xNVxuXG4gICAgLy8gdWkuc2Nyb2xsVG9Cb2R5VG9wKCRzdGF0dXMub2Zmc2V0KCkudG9wLTE1KVxufVxuXG5mdW5jdGlvbiBuZXdDb21tZW50KCkge1xuXG4gICAgcmVzZXRDb21tZW50KCk7XG5cbiAgICBvcGVuQ29tbWVudERpYWxvZygpO1xufVxuXG5mdW5jdGlvbiBpbml0Q29tbWVudCgpIHtcblxuICAgICQoJy53cmFwID4gLmNvbnRlbnQnKS5vbignY2xpY2suY29tbWVudCcsICcuY29tbWVudC1wYW5lbCAucG9zdF9idG4nLCBhZGRDb21tZW50KS5vbignY2xpY2suY29tbWVudCcsICcuZGlhbG9nLWNvbnRlbnQgdGV4dGFyZWEnLCBvcGVuQ29tbWVudERpYWxvZykub24oJ2NsaWNrLmNvbW1lbnQnLCAnLnVpLWJ1dHRvbi5yZWZyZXNoLCAjdmVyaWZpY2F0aW9uX2ltZycsIHJlZnJlc2hWZXJpZmljYXRpb24pLm9uKCdjbGljay5jb21tZW50JywgJy5jb21tZW50IC5yZXNfYnRuJywgcmVzU29tZW9uZSkub24oJ2NsaWNrLmNvbW1lbnQnLCAnLmNvbW1lbnQgLm5ld19jb21tZW50X2J0bicsIG5ld0NvbW1lbnQpO1xufVxuXG5mdW5jdGlvbiBmZXRjaFVybCh0ZXh0KSB7XG4gICAgdmFyIHJlcGxhY2VFbHMgPSBbXSxcbiAgICAgICAgbWF0Y2ggPSBudWxsLFxuICAgICAgICBsYXN0SW5kZXggPSAwLFxuICAgICAgICByZSA9IC8oaHR0cHM/OlxcL1xcL3x3d3dcXC4pW1xcd1xcLVxcLlxcPyY9XFwvIyU6LEBcXCFcXCtdKy9pZztcblxuICAgIHdoaWxlICgobWF0Y2ggPSByZS5leGVjKHRleHQpKSAhPT0gbnVsbCkge1xuICAgICAgICAvLyBtYXRjaCA9IHJlLmV4ZWModGV4dClcbiAgICAgICAgdmFyIHN1YlN0ciA9IHRleHQuc3Vic3RyaW5nKGxhc3RJbmRleCwgbWF0Y2guaW5kZXgpO1xuICAgICAgICByZXBsYWNlRWxzLnB1c2goZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3ViU3RyKSk7XG4gICAgICAgIGxhc3RJbmRleCA9IHJlLmxhc3RJbmRleDtcblxuICAgICAgICB2YXIgdXJpID0gL14oaHR0cChzKT86XFwvXFwvfFxcLykvLnRlc3QobWF0Y2hbMF0pID8gbWF0Y2hbMF0gOiAnaHR0cDovLycgKyBtYXRjaFswXTtcblxuICAgICAgICB2YXIgJGxpbmsgPSAkKFwiPGEgdGFnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCIgKyB1cmkgKyBcIlxcXCIgcmVsPVxcXCJub2ZvbGxvd1xcXCI+PC9hPlwiKS50ZXh0KG1hdGNoWzBdKTtcblxuICAgICAgICByZXBsYWNlRWxzLnB1c2goJGxpbmtbMF0pO1xuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKHJlcGxhY2VFbHMpXG59XG5cbmZ1bmN0aW9uIHJlc2V0Q29tbWVudCgpIHtcbiAgICAkdi52YWwoJycpLCAkbmlja25hbWUudmFsKCcnKSwgJGMudmFsKCcnKSwgJG1haWwudmFsKCcnKTtcblxuICAgICRzdGF0dXMucmVtb3ZlRGF0YSgnaWQnKTtcbiAgICAkc3RhdHVzLnJlbW92ZURhdGEoJ3RvQXV0aG9yJyk7XG4gICAgJHN0YXR1cy5yZW1vdmVEYXRhKCdsaXN0Jyk7XG5cbiAgICAkc3RhdHVzLmh0bWwoJ+WPkeihqOaWsOivhOiuuicpO1xuICAgICRwb3N0QnRuLmh0bWwoJ+WPkeihqCcpO1xuICAgICRjb21tZW50LmZpbmQoJ3RleHRhcmVhJykudmFsKCcnKTtcblxuICAgIHJlZnJlc2hWZXJpZmljYXRpb24oKTtcbn1cblxuZXhwb3J0cy5pbml0Q29tbWVudCA9IGluaXRDb21tZW50O1xuZXhwb3J0cy5kZXN0cm95Q29tbWVudCA9IGRlc3Ryb3lDb21tZW50O1xuZXhwb3J0cy5sb2FkQ29tbWVudCA9IGxvYWRDb21tZW50OyIsIi8qKlxuICogRk9SIEhFQURFUiBcbiAqIEBwYXJhbSAge1t0eXBlXX0gKCBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgW2Rlc2NyaXB0aW9uXVxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbnZhciAkbWVudXMgPSBudWxsO1xudmFyICRoZWFkZXIgPSBudWxsO1xuXG5mdW5jdGlvbiBfcmVmKGV2dCkge1xuXG4gICAgJChldnQuY3VycmVudFRhcmdldCkucGFyZW50KCcubWVudScpLmFkZENsYXNzKCdvbicpO1xuXG4gICAgLy8gcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBfcmVmMihldnQpIHtcbiAgICAkKGV2dC5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoJy5tZW51JykucmVtb3ZlQ2xhc3MoJ29uJyk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGluaXRIZWFkZXIoKSB7XG5cbiAgICAkaGVhZGVyID0gJCgnYm9keSA+IGhlYWRlcicpLm9uKCdtb3VzZWVudGVyJywgJy5zdWItbWVudScsIF9yZWYpLm9uKCdtb3VzZWxlYXZlJywgJy5zdWItbWVudScsIF9yZWYyKTtcblxuICAgIC8vaGlkZSB0aGUgc3ViLW1lbnUgYWZ0ZXIgY2xpY2sgdGhlIHN1Yi1tZW51IGxpXG4gICAgLyoub24oJ2NsaWNrJywgJy5zdWItbWVudSA+IGxpJywgZXZ0ID0+IHtcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAkKGV2dC5jdXJyZW50VGFyZ2V0KVxuICAgICAgICAucGFyZW50cygnLnN1Yi1tZW51JykuY3NzKCd2aXNpYmlsaXR5JzogJ2hpZGRlbicpXG4gICAgfSkqL1xuXG4gICAgJG1lbnVzID0gJGhlYWRlci5maW5kKCcubWVudScpO1xuXG4gICAgaWYgKHdpbmRvdy5faXNfbW9iaWxlKSB7XG4gICAgICAgIC8vaGlkZSBzdWItbWVudSAsd2hlbiBjbGljayBvdGhlciBzcGFjZXNcbiAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAgIHZhciAkYXJlYSA9ICQodGhpcyk7XG4gICAgICAgICAgICBpZiAoJGFyZWEubm90KCcuc3ViLW1lbnUsIC5zdWItbWVudSA+IGxpJykpIHtcbiAgICAgICAgICAgICAgICAkaGVhZGVyLmZpbmQoJy5zdWItbWVudScpLnJlbW92ZUNsYXNzKCdvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGxvY2F0ZShuYXYpIHtcbiAgICB2YXIgbmF2VGV4dCA9IG5hdi50b0xvd2VyQ2FzZSgpO1xuXG4gICAgZm9yICh2YXIgaSBpbiAkbWVudXMpIHtcbiAgICAgICAgdmFyICRtID0gJG1lbnVzLmVxKGkpO1xuICAgICAgICB2YXIgJGEgPSAkbS5jaGlsZHJlbignYScpO1xuICAgICAgICB2YXIgYVRleHQgPSAkYS5odG1sKCkudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBpZiAobmF2VGV4dCA9PSBhVGV4dCkge1xuICAgICAgICAgICAgJG1lbnVzLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICRtLmFkZENsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIGluaXRIZWFkZXIoKTtcbn0pO1xuXG5leHBvcnRzLmxvY2F0ZSA9IGxvY2F0ZTsiLCIhZnVuY3Rpb24oZSl7ZmFsc2U/ZShleHBvcnRzKTood2luZG93LmhsanM9ZSh7fSksZmFsc2UmJmRlZmluZS5hbWQmJmRlZmluZShcImhsanNcIixbXSxmdW5jdGlvbigpe3JldHVybiB3aW5kb3cuaGxqc30pKX0oZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdChlKXtyZXR1cm4gZS5yZXBsYWNlKC8mL2dtLFwiJmFtcDtcIikucmVwbGFjZSgvPC9nbSxcIiZsdDtcIikucmVwbGFjZSgvPi9nbSxcIiZndDtcIil9ZnVuY3Rpb24gcihlKXtyZXR1cm4gZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpfWZ1bmN0aW9uIGEoZSx0KXt2YXIgcj1lJiZlLmV4ZWModCk7cmV0dXJuIHImJjA9PXIuaW5kZXh9ZnVuY3Rpb24gbihlKXtyZXR1cm4vXihuby0/aGlnaGxpZ2h0fHBsYWlufHRleHQpJC9pLnRlc3QoZSl9ZnVuY3Rpb24gaShlKXt2YXIgdCxyLGEsaT1lLmNsYXNzTmFtZStcIiBcIjtpZihpKz1lLnBhcmVudE5vZGU/ZS5wYXJlbnROb2RlLmNsYXNzTmFtZTpcIlwiLHI9L1xcYmxhbmcoPzp1YWdlKT8tKFtcXHctXSspXFxiL2kuZXhlYyhpKSlyZXR1cm4geShyWzFdKT9yWzFdOlwibm8taGlnaGxpZ2h0XCI7Zm9yKGk9aS5zcGxpdCgvXFxzKy8pLHQ9MCxhPWkubGVuZ3RoO2E+dDt0KyspaWYoeShpW3RdKXx8bihpW3RdKSlyZXR1cm4gaVt0XX1mdW5jdGlvbiBzKGUsdCl7dmFyIHIsYT17fTtmb3IociBpbiBlKWFbcl09ZVtyXTtpZih0KWZvcihyIGluIHQpYVtyXT10W3JdO3JldHVybiBhfWZ1bmN0aW9uIGMoZSl7dmFyIHQ9W107cmV0dXJuIGZ1bmN0aW9uIGEoZSxuKXtmb3IodmFyIGk9ZS5maXJzdENoaWxkO2k7aT1pLm5leHRTaWJsaW5nKTM9PWkubm9kZVR5cGU/bis9aS5ub2RlVmFsdWUubGVuZ3RoOjE9PWkubm9kZVR5cGUmJih0LnB1c2goe2V2ZW50Olwic3RhcnRcIixvZmZzZXQ6bixub2RlOml9KSxuPWEoaSxuKSxyKGkpLm1hdGNoKC9icnxocnxpbWd8aW5wdXQvKXx8dC5wdXNoKHtldmVudDpcInN0b3BcIixvZmZzZXQ6bixub2RlOml9KSk7cmV0dXJuIG59KGUsMCksdH1mdW5jdGlvbiBvKGUsYSxuKXtmdW5jdGlvbiBpKCl7cmV0dXJuIGUubGVuZ3RoJiZhLmxlbmd0aD9lWzBdLm9mZnNldCE9YVswXS5vZmZzZXQ/ZVswXS5vZmZzZXQ8YVswXS5vZmZzZXQ/ZTphOlwic3RhcnRcIj09YVswXS5ldmVudD9lOmE6ZS5sZW5ndGg/ZTphfWZ1bmN0aW9uIHMoZSl7ZnVuY3Rpb24gYShlKXtyZXR1cm5cIiBcIitlLm5vZGVOYW1lKyc9XCInK3QoZS52YWx1ZSkrJ1wiJ311Kz1cIjxcIityKGUpK0FycmF5LnByb3RvdHlwZS5tYXAuY2FsbChlLmF0dHJpYnV0ZXMsYSkuam9pbihcIlwiKStcIj5cIn1mdW5jdGlvbiBjKGUpe3UrPVwiPC9cIityKGUpK1wiPlwifWZ1bmN0aW9uIG8oZSl7KFwic3RhcnRcIj09ZS5ldmVudD9zOmMpKGUubm9kZSl9Zm9yKHZhciBsPTAsdT1cIlwiLGQ9W107ZS5sZW5ndGh8fGEubGVuZ3RoOyl7dmFyIGI9aSgpO2lmKHUrPXQobi5zdWJzdHIobCxiWzBdLm9mZnNldC1sKSksbD1iWzBdLm9mZnNldCxiPT1lKXtkLnJldmVyc2UoKS5mb3JFYWNoKGMpO2RvIG8oYi5zcGxpY2UoMCwxKVswXSksYj1pKCk7d2hpbGUoYj09ZSYmYi5sZW5ndGgmJmJbMF0ub2Zmc2V0PT1sKTtkLnJldmVyc2UoKS5mb3JFYWNoKHMpfWVsc2VcInN0YXJ0XCI9PWJbMF0uZXZlbnQ/ZC5wdXNoKGJbMF0ubm9kZSk6ZC5wb3AoKSxvKGIuc3BsaWNlKDAsMSlbMF0pfXJldHVybiB1K3Qobi5zdWJzdHIobCkpfWZ1bmN0aW9uIGwoZSl7ZnVuY3Rpb24gdChlKXtyZXR1cm4gZSYmZS5zb3VyY2V8fGV9ZnVuY3Rpb24gcihyLGEpe3JldHVybiBuZXcgUmVnRXhwKHQociksXCJtXCIrKGUuY0k/XCJpXCI6XCJcIikrKGE/XCJnXCI6XCJcIikpfWZ1bmN0aW9uIGEobixpKXtpZighbi5jb21waWxlZCl7aWYobi5jb21waWxlZD0hMCxuLms9bi5rfHxuLmJLLG4uayl7dmFyIGM9e30sbz1mdW5jdGlvbih0LHIpe2UuY0kmJihyPXIudG9Mb3dlckNhc2UoKSksci5zcGxpdChcIiBcIikuZm9yRWFjaChmdW5jdGlvbihlKXt2YXIgcj1lLnNwbGl0KFwifFwiKTtjW3JbMF1dPVt0LHJbMV0/TnVtYmVyKHJbMV0pOjFdfSl9O1wic3RyaW5nXCI9PXR5cGVvZiBuLms/byhcImtleXdvcmRcIixuLmspOk9iamVjdC5rZXlzKG4uaykuZm9yRWFjaChmdW5jdGlvbihlKXtvKGUsbi5rW2VdKX0pLG4uaz1jfW4ubFI9cihuLmx8fC9cXGJcXHcrXFxiLywhMCksaSYmKG4uYksmJihuLmI9XCJcXFxcYihcIituLmJLLnNwbGl0KFwiIFwiKS5qb2luKFwifFwiKStcIilcXFxcYlwiKSxuLmJ8fChuLmI9L1xcQnxcXGIvKSxuLmJSPXIobi5iKSxuLmV8fG4uZVd8fChuLmU9L1xcQnxcXGIvKSxuLmUmJihuLmVSPXIobi5lKSksbi50RT10KG4uZSl8fFwiXCIsbi5lVyYmaS50RSYmKG4udEUrPShuLmU/XCJ8XCI6XCJcIikraS50RSkpLG4uaSYmKG4uaVI9cihuLmkpKSx2b2lkIDA9PT1uLnImJihuLnI9MSksbi5jfHwobi5jPVtdKTt2YXIgbD1bXTtuLmMuZm9yRWFjaChmdW5jdGlvbihlKXtlLnY/ZS52LmZvckVhY2goZnVuY3Rpb24odCl7bC5wdXNoKHMoZSx0KSl9KTpsLnB1c2goXCJzZWxmXCI9PWU/bjplKX0pLG4uYz1sLG4uYy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2EoZSxuKX0pLG4uc3RhcnRzJiZhKG4uc3RhcnRzLGkpO3ZhciB1PW4uYy5tYXAoZnVuY3Rpb24oZSl7cmV0dXJuIGUuYks/XCJcXFxcLj8oXCIrZS5iK1wiKVxcXFwuP1wiOmUuYn0pLmNvbmNhdChbbi50RSxuLmldKS5tYXAodCkuZmlsdGVyKEJvb2xlYW4pO24udD11Lmxlbmd0aD9yKHUuam9pbihcInxcIiksITApOntleGVjOmZ1bmN0aW9uKCl7cmV0dXJuIG51bGx9fX19YShlKX1mdW5jdGlvbiB1KGUscixuLGkpe2Z1bmN0aW9uIHMoZSx0KXtmb3IodmFyIHI9MDtyPHQuYy5sZW5ndGg7cisrKWlmKGEodC5jW3JdLmJSLGUpKXJldHVybiB0LmNbcl19ZnVuY3Rpb24gYyhlLHQpe2lmKGEoZS5lUix0KSl7Zm9yKDtlLmVuZHNQYXJlbnQmJmUucGFyZW50OyllPWUucGFyZW50O3JldHVybiBlfXJldHVybiBlLmVXP2MoZS5wYXJlbnQsdCk6dm9pZCAwfWZ1bmN0aW9uIG8oZSx0KXtyZXR1cm4hbiYmYSh0LmlSLGUpfWZ1bmN0aW9uIGIoZSx0KXt2YXIgcj12LmNJP3RbMF0udG9Mb3dlckNhc2UoKTp0WzBdO3JldHVybiBlLmsuaGFzT3duUHJvcGVydHkocikmJmUua1tyXX1mdW5jdGlvbiBwKGUsdCxyLGEpe3ZhciBuPWE/XCJcIjp3LmNsYXNzUHJlZml4LGk9JzxzcGFuIGNsYXNzPVwiJytuLHM9cj9cIlwiOlwiPC9zcGFuPlwiO3JldHVybiBpKz1lKydcIj4nLGkrdCtzfWZ1bmN0aW9uIG0oKXtpZigheC5rKXJldHVybiB0KEUpO3ZhciBlPVwiXCIscj0wO3gubFIubGFzdEluZGV4PTA7Zm9yKHZhciBhPXgubFIuZXhlYyhFKTthOyl7ZSs9dChFLnN1YnN0cihyLGEuaW5kZXgtcikpO3ZhciBuPWIoeCxhKTtuPyhCKz1uWzFdLGUrPXAoblswXSx0KGFbMF0pKSk6ZSs9dChhWzBdKSxyPXgubFIubGFzdEluZGV4LGE9eC5sUi5leGVjKEUpfXJldHVybiBlK3QoRS5zdWJzdHIocikpfWZ1bmN0aW9uIGYoKXt2YXIgZT1cInN0cmluZ1wiPT10eXBlb2YgeC5zTDtpZihlJiYhTlt4LnNMXSlyZXR1cm4gdChFKTt2YXIgcj1lP3UoeC5zTCxFLCEwLENbeC5zTF0pOmQoRSx4LnNMLmxlbmd0aD94LnNMOnZvaWQgMCk7cmV0dXJuIHgucj4wJiYoQis9ci5yKSxlJiYoQ1t4LnNMXT1yLnRvcCkscChyLmxhbmd1YWdlLHIudmFsdWUsITEsITApfWZ1bmN0aW9uIGcoKXtyZXR1cm4gdm9pZCAwIT09eC5zTD9mKCk6bSgpfWZ1bmN0aW9uIGgoZSxyKXt2YXIgYT1lLmNOP3AoZS5jTixcIlwiLCEwKTpcIlwiO2UuckI/KE0rPWEsRT1cIlwiKTplLmVCPyhNKz10KHIpK2EsRT1cIlwiKTooTSs9YSxFPXIpLHg9T2JqZWN0LmNyZWF0ZShlLHtwYXJlbnQ6e3ZhbHVlOnh9fSl9ZnVuY3Rpb24gXyhlLHIpe2lmKEUrPWUsdm9pZCAwPT09cilyZXR1cm4gTSs9ZygpLDA7dmFyIGE9cyhyLHgpO2lmKGEpcmV0dXJuIE0rPWcoKSxoKGEsciksYS5yQj8wOnIubGVuZ3RoO3ZhciBuPWMoeCxyKTtpZihuKXt2YXIgaT14O2kuckV8fGkuZUV8fChFKz1yKSxNKz1nKCk7ZG8geC5jTiYmKE0rPVwiPC9zcGFuPlwiKSxCKz14LnIseD14LnBhcmVudDt3aGlsZSh4IT1uLnBhcmVudCk7cmV0dXJuIGkuZUUmJihNKz10KHIpKSxFPVwiXCIsbi5zdGFydHMmJmgobi5zdGFydHMsXCJcIiksaS5yRT8wOnIubGVuZ3RofWlmKG8ocix4KSl0aHJvdyBuZXcgRXJyb3IoJ0lsbGVnYWwgbGV4ZW1lIFwiJytyKydcIiBmb3IgbW9kZSBcIicrKHguY058fFwiPHVubmFtZWQ+XCIpKydcIicpO3JldHVybiBFKz1yLHIubGVuZ3RofHwxfXZhciB2PXkoZSk7aWYoIXYpdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGxhbmd1YWdlOiBcIicrZSsnXCInKTtsKHYpO3ZhciBrLHg9aXx8dixDPXt9LE09XCJcIjtmb3Ioaz14O2shPXY7az1rLnBhcmVudClrLmNOJiYoTT1wKGsuY04sXCJcIiwhMCkrTSk7dmFyIEU9XCJcIixCPTA7dHJ5e2Zvcih2YXIgJCx6LEw9MDs7KXtpZih4LnQubGFzdEluZGV4PUwsJD14LnQuZXhlYyhyKSwhJClicmVhazt6PV8oci5zdWJzdHIoTCwkLmluZGV4LUwpLCRbMF0pLEw9JC5pbmRleCt6fWZvcihfKHIuc3Vic3RyKEwpKSxrPXg7ay5wYXJlbnQ7az1rLnBhcmVudClrLmNOJiYoTSs9XCI8L3NwYW4+XCIpO3JldHVybntyOkIsdmFsdWU6TSxsYW5ndWFnZTplLHRvcDp4fX1jYXRjaChxKXtpZigtMSE9cS5tZXNzYWdlLmluZGV4T2YoXCJJbGxlZ2FsXCIpKXJldHVybntyOjAsdmFsdWU6dChyKX07dGhyb3cgcX19ZnVuY3Rpb24gZChlLHIpe3I9cnx8dy5sYW5ndWFnZXN8fE9iamVjdC5rZXlzKE4pO3ZhciBhPXtyOjAsdmFsdWU6dChlKX0sbj1hO3JldHVybiByLmZvckVhY2goZnVuY3Rpb24odCl7aWYoeSh0KSl7dmFyIHI9dSh0LGUsITEpO3IubGFuZ3VhZ2U9dCxyLnI+bi5yJiYobj1yKSxyLnI+YS5yJiYobj1hLGE9cil9fSksbi5sYW5ndWFnZSYmKGEuc2Vjb25kX2Jlc3Q9biksYX1mdW5jdGlvbiBiKGUpe3JldHVybiB3LnRhYlJlcGxhY2UmJihlPWUucmVwbGFjZSgvXigoPFtePl0rPnxcXHQpKykvZ20sZnVuY3Rpb24oZSx0KXtyZXR1cm4gdC5yZXBsYWNlKC9cXHQvZyx3LnRhYlJlcGxhY2UpfSkpLHcudXNlQlImJihlPWUucmVwbGFjZSgvXFxuL2csXCI8YnI+XCIpKSxlfWZ1bmN0aW9uIHAoZSx0LHIpe3ZhciBhPXQ/a1t0XTpyLG49W2UudHJpbSgpXTtyZXR1cm4gZS5tYXRjaCgvXFxiaGxqc1xcYi8pfHxuLnB1c2goXCJobGpzXCIpLC0xPT09ZS5pbmRleE9mKGEpJiZuLnB1c2goYSksbi5qb2luKFwiIFwiKS50cmltKCl9ZnVuY3Rpb24gbShlKXt2YXIgdD1pKGUpO2lmKCFuKHQpKXt2YXIgcjt3LnVzZUJSPyhyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIixcImRpdlwiKSxyLmlubmVySFRNTD1lLmlubmVySFRNTC5yZXBsYWNlKC9cXG4vZyxcIlwiKS5yZXBsYWNlKC88YnJbIFxcL10qPi9nLFwiXFxuXCIpKTpyPWU7dmFyIGE9ci50ZXh0Q29udGVudCxzPXQ/dSh0LGEsITApOmQoYSksbD1jKHIpO2lmKGwubGVuZ3RoKXt2YXIgbT1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXCJkaXZcIik7bS5pbm5lckhUTUw9cy52YWx1ZSxzLnZhbHVlPW8obCxjKG0pLGEpfXMudmFsdWU9YihzLnZhbHVlKSxlLmlubmVySFRNTD1zLnZhbHVlLGUuY2xhc3NOYW1lPXAoZS5jbGFzc05hbWUsdCxzLmxhbmd1YWdlKSxlLnJlc3VsdD17bGFuZ3VhZ2U6cy5sYW5ndWFnZSxyZTpzLnJ9LHMuc2Vjb25kX2Jlc3QmJihlLnNlY29uZF9iZXN0PXtsYW5ndWFnZTpzLnNlY29uZF9iZXN0Lmxhbmd1YWdlLHJlOnMuc2Vjb25kX2Jlc3Qucn0pfX1mdW5jdGlvbiBmKGUpe3c9cyh3LGUpfWZ1bmN0aW9uIGcoKXtpZighZy5jYWxsZWQpe2cuY2FsbGVkPSEwO3ZhciBlPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJwcmUgY29kZVwiKTtBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGUsbSl9fWZ1bmN0aW9uIGgoKXthZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLGcsITEpLGFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsZywhMSl9ZnVuY3Rpb24gXyh0LHIpe3ZhciBhPU5bdF09cihlKTthLmFsaWFzZXMmJmEuYWxpYXNlcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2tbZV09dH0pfWZ1bmN0aW9uIHYoKXtyZXR1cm4gT2JqZWN0LmtleXMoTil9ZnVuY3Rpb24geShlKXtyZXR1cm4gZT0oZXx8XCJcIikudG9Mb3dlckNhc2UoKSxOW2VdfHxOW2tbZV1dfXZhciB3PXtjbGFzc1ByZWZpeDpcImhsanMtXCIsdGFiUmVwbGFjZTpudWxsLHVzZUJSOiExLGxhbmd1YWdlczp2b2lkIDB9LE49e30saz17fTtyZXR1cm4gZS5oaWdobGlnaHQ9dSxlLmhpZ2hsaWdodEF1dG89ZCxlLmZpeE1hcmt1cD1iLGUuaGlnaGxpZ2h0QmxvY2s9bSxlLmNvbmZpZ3VyZT1mLGUuaW5pdEhpZ2hsaWdodGluZz1nLGUuaW5pdEhpZ2hsaWdodGluZ09uTG9hZD1oLGUucmVnaXN0ZXJMYW5ndWFnZT1fLGUubGlzdExhbmd1YWdlcz12LGUuZ2V0TGFuZ3VhZ2U9eSxlLmluaGVyaXQ9cyxlLklSPVwiW2EtekEtWl1cXFxcdypcIixlLlVJUj1cIlthLXpBLVpfXVxcXFx3KlwiLGUuTlI9XCJcXFxcYlxcXFxkKyhcXFxcLlxcXFxkKyk/XCIsZS5DTlI9XCIoXFxcXGIwW3hYXVthLWZBLUYwLTldK3woXFxcXGJcXFxcZCsoXFxcXC5cXFxcZCopP3xcXFxcLlxcXFxkKykoW2VFXVstK10/XFxcXGQrKT8pXCIsZS5CTlI9XCJcXFxcYigwYlswMV0rKVwiLGUuUlNSPVwiIXwhPXwhPT18JXwlPXwmfCYmfCY9fFxcXFwqfFxcXFwqPXxcXFxcK3xcXFxcKz18LHwtfC09fC89fC98Onw7fDw8fDw8PXw8PXw8fD09PXw9PXw9fD4+Pj18Pj49fD49fD4+Pnw+Pnw+fFxcXFw/fFxcXFxbfFxcXFx7fFxcXFwofFxcXFxefFxcXFxePXxcXFxcfHxcXFxcfD18XFxcXHxcXFxcfHx+XCIsZS5CRT17YjpcIlxcXFxcXFxcW1xcXFxzXFxcXFNdXCIscjowfSxlLkFTTT17Y046XCJzdHJpbmdcIixiOlwiJ1wiLGU6XCInXCIsaTpcIlxcXFxuXCIsYzpbZS5CRV19LGUuUVNNPXtjTjpcInN0cmluZ1wiLGI6J1wiJyxlOidcIicsaTpcIlxcXFxuXCIsYzpbZS5CRV19LGUuUFdNPXtiOi9cXGIoYXxhbnx0aGV8YXJlfEl8SSdtfGlzbid0fGRvbid0fGRvZXNuJ3R8d29uJ3R8YnV0fGp1c3R8c2hvdWxkfHByZXR0eXxzaW1wbHl8ZW5vdWdofGdvbm5hfGdvaW5nfHd0Znxzb3xzdWNofHdpbGx8eW91fHlvdXJ8bGlrZSlcXGIvfSxlLkM9ZnVuY3Rpb24odCxyLGEpe3ZhciBuPWUuaW5oZXJpdCh7Y046XCJjb21tZW50XCIsYjp0LGU6cixjOltdfSxhfHx7fSk7cmV0dXJuIG4uYy5wdXNoKGUuUFdNKSxuLmMucHVzaCh7Y046XCJkb2N0YWdcIixiOlwiKD86VE9ET3xGSVhNRXxOT1RFfEJVR3xYWFgpOlwiLHI6MH0pLG59LGUuQ0xDTT1lLkMoXCIvL1wiLFwiJFwiKSxlLkNCQ009ZS5DKFwiL1xcXFwqXCIsXCJcXFxcKi9cIiksZS5IQ009ZS5DKFwiI1wiLFwiJFwiKSxlLk5NPXtjTjpcIm51bWJlclwiLGI6ZS5OUixyOjB9LGUuQ05NPXtjTjpcIm51bWJlclwiLGI6ZS5DTlIscjowfSxlLkJOTT17Y046XCJudW1iZXJcIixiOmUuQk5SLHI6MH0sZS5DU1NOTT17Y046XCJudW1iZXJcIixiOmUuTlIrXCIoJXxlbXxleHxjaHxyZW18dnd8dmh8dm1pbnx2bWF4fGNtfG1tfGlufHB0fHBjfHB4fGRlZ3xncmFkfHJhZHx0dXJufHN8bXN8SHp8a0h6fGRwaXxkcGNtfGRwcHgpP1wiLHI6MH0sZS5STT17Y046XCJyZWdleHBcIixiOi9cXC8vLGU6L1xcL1tnaW11eV0qLyxpOi9cXG4vLGM6W2UuQkUse2I6L1xcWy8sZTovXFxdLyxyOjAsYzpbZS5CRV19XX0sZS5UTT17Y046XCJ0aXRsZVwiLGI6ZS5JUixyOjB9LGUuVVRNPXtjTjpcInRpdGxlXCIsYjplLlVJUixyOjB9LGUucmVnaXN0ZXJMYW5ndWFnZShcImFwYWNoZVwiLGZ1bmN0aW9uKGUpe3ZhciB0PXtjTjpcIm51bWJlclwiLGI6XCJbXFxcXCQlXVxcXFxkK1wifTtyZXR1cm57YWxpYXNlczpbXCJhcGFjaGVjb25mXCJdLGNJOiEwLGM6W2UuSENNLHtjTjpcInRhZ1wiLGI6XCI8Lz9cIixlOlwiPlwifSx7Y046XCJrZXl3b3JkXCIsYjovXFx3Ky8scjowLGs6e2NvbW1vbjpcIm9yZGVyIGRlbnkgYWxsb3cgc2V0ZW52IHJld3JpdGVydWxlIHJld3JpdGVlbmdpbmUgcmV3cml0ZWNvbmQgZG9jdW1lbnRyb290IHNldGhhbmRsZXIgZXJyb3Jkb2N1bWVudCBsb2FkbW9kdWxlIG9wdGlvbnMgaGVhZGVyIGxpc3RlbiBzZXJ2ZXJyb290IHNlcnZlcm5hbWVcIn0sc3RhcnRzOntlOi8kLyxyOjAsazp7bGl0ZXJhbDpcIm9uIG9mZiBhbGxcIn0sYzpbe2NOOlwic3FicmFja2V0XCIsYjpcIlxcXFxzXFxcXFtcIixlOlwiXFxcXF0kXCJ9LHtjTjpcImNicmFja2V0XCIsYjpcIltcXFxcJCVdXFxcXHtcIixlOlwiXFxcXH1cIixjOltcInNlbGZcIix0XX0sdCxlLlFTTV19fV0saTovXFxTL319KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJiYXNoXCIsZnVuY3Rpb24oZSl7dmFyIHQ9e2NOOlwidmFyaWFibGVcIix2Olt7YjovXFwkW1xcd1xcZCNAXVtcXHdcXGRfXSovfSx7YjovXFwkXFx7KC4qPyl9L31dfSxyPXtjTjpcInN0cmluZ1wiLGI6L1wiLyxlOi9cIi8sYzpbZS5CRSx0LHtjTjpcInZhcmlhYmxlXCIsYjovXFwkXFwoLyxlOi9cXCkvLGM6W2UuQkVdfV19LGE9e2NOOlwic3RyaW5nXCIsYjovJy8sZTovJy99O3JldHVybnthbGlhc2VzOltcInNoXCIsXCJ6c2hcIl0sbDovLT9bYS16XFwuXSsvLGs6e2tleXdvcmQ6XCJpZiB0aGVuIGVsc2UgZWxpZiBmaSBmb3Igd2hpbGUgaW4gZG8gZG9uZSBjYXNlIGVzYWMgZnVuY3Rpb25cIixsaXRlcmFsOlwidHJ1ZSBmYWxzZVwiLGJ1aWx0X2luOlwiYnJlYWsgY2QgY29udGludWUgZXZhbCBleGVjIGV4aXQgZXhwb3J0IGdldG9wdHMgaGFzaCBwd2QgcmVhZG9ubHkgcmV0dXJuIHNoaWZ0IHRlc3QgdGltZXMgdHJhcCB1bWFzayB1bnNldCBhbGlhcyBiaW5kIGJ1aWx0aW4gY2FsbGVyIGNvbW1hbmQgZGVjbGFyZSBlY2hvIGVuYWJsZSBoZWxwIGxldCBsb2NhbCBsb2dvdXQgbWFwZmlsZSBwcmludGYgcmVhZCByZWFkYXJyYXkgc291cmNlIHR5cGUgdHlwZXNldCB1bGltaXQgdW5hbGlhcyBzZXQgc2hvcHQgYXV0b2xvYWQgYmcgYmluZGtleSBieWUgY2FwIGNoZGlyIGNsb25lIGNvbXBhcmd1bWVudHMgY29tcGNhbGwgY29tcGN0bCBjb21wZGVzY3JpYmUgY29tcGZpbGVzIGNvbXBncm91cHMgY29tcHF1b3RlIGNvbXB0YWdzIGNvbXB0cnkgY29tcHZhbHVlcyBkaXJzIGRpc2FibGUgZGlzb3duIGVjaG90YyBlY2hvdGkgZW11bGF0ZSBmYyBmZyBmbG9hdCBmdW5jdGlvbnMgZ2V0Y2FwIGdldGxuIGhpc3RvcnkgaW50ZWdlciBqb2JzIGtpbGwgbGltaXQgbG9nIG5vZ2xvYiBwb3BkIHByaW50IHB1c2hkIHB1c2hsbiByZWhhc2ggc2NoZWQgc2V0Y2FwIHNldG9wdCBzdGF0IHN1c3BlbmQgdHR5Y3RsIHVuZnVuY3Rpb24gdW5oYXNoIHVubGltaXQgdW5zZXRvcHQgdmFyZWQgd2FpdCB3aGVuY2Ugd2hlcmUgd2hpY2ggemNvbXBpbGUgemZvcm1hdCB6ZnRwIHpsZSB6bW9kbG9hZCB6cGFyc2VvcHRzIHpwcm9mIHpwdHkgenJlZ2V4cGFyc2UgenNvY2tldCB6c3R5bGUgenRjcFwiLG9wZXJhdG9yOlwiLW5lIC1lcSAtbHQgLWd0IC1mIC1kIC1lIC1zIC1sIC1hXCJ9LGM6W3tjTjpcInNoZWJhbmdcIixiOi9eIyFbXlxcbl0rc2hcXHMqJC8scjoxMH0se2NOOlwiZnVuY3Rpb25cIixiOi9cXHdbXFx3XFxkX10qXFxzKlxcKFxccypcXClcXHMqXFx7LyxyQjohMCxjOltlLmluaGVyaXQoZS5UTSx7YjovXFx3W1xcd1xcZF9dKi99KV0scjowfSxlLkhDTSxlLk5NLHIsYSx0XX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJjb2ZmZWVzY3JpcHRcIixmdW5jdGlvbihlKXt2YXIgdD17a2V5d29yZDpcImluIGlmIGZvciB3aGlsZSBmaW5hbGx5IG5ldyBkbyByZXR1cm4gZWxzZSBicmVhayBjYXRjaCBpbnN0YW5jZW9mIHRocm93IHRyeSB0aGlzIHN3aXRjaCBjb250aW51ZSB0eXBlb2YgZGVsZXRlIGRlYnVnZ2VyIHN1cGVyIHRoZW4gdW5sZXNzIHVudGlsIGxvb3Agb2YgYnkgd2hlbiBhbmQgb3IgaXMgaXNudCBub3RcIixsaXRlcmFsOlwidHJ1ZSBmYWxzZSBudWxsIHVuZGVmaW5lZCB5ZXMgbm8gb24gb2ZmXCIsYnVpbHRfaW46XCJucG0gcmVxdWlyZSBjb25zb2xlIHByaW50IG1vZHVsZSBnbG9iYWwgd2luZG93IGRvY3VtZW50XCJ9LHI9XCJbQS1aYS16JF9dWzAtOUEtWmEteiRfXSpcIixhPXtjTjpcInN1YnN0XCIsYjovI1xcey8sZTovfS8sazp0fSxuPVtlLkJOTSxlLmluaGVyaXQoZS5DTk0se3N0YXJ0czp7ZTpcIihcXFxccyovKT9cIixyOjB9fSkse2NOOlwic3RyaW5nXCIsdjpbe2I6LycnJy8sZTovJycnLyxjOltlLkJFXX0se2I6LycvLGU6LycvLGM6W2UuQkVdfSx7YjovXCJcIlwiLyxlOi9cIlwiXCIvLGM6W2UuQkUsYV19LHtiOi9cIi8sZTovXCIvLGM6W2UuQkUsYV19XX0se2NOOlwicmVnZXhwXCIsdjpbe2I6XCIvLy9cIixlOlwiLy8vXCIsYzpbYSxlLkhDTV19LHtiOlwiLy9bZ2ltXSpcIixyOjB9LHtiOi9cXC8oPyFbICpdKShcXFxcXFwvfC4pKj9cXC9bZ2ltXSooPz1cXFd8JCkvfV19LHtjTjpcInByb3BlcnR5XCIsYjpcIkBcIityfSx7YjpcImBcIixlOlwiYFwiLGVCOiEwLGVFOiEwLHNMOlwiamF2YXNjcmlwdFwifV07YS5jPW47dmFyIGk9ZS5pbmhlcml0KGUuVE0se2I6cn0pLHM9XCIoXFxcXCguKlxcXFwpKT9cXFxccypcXFxcQlstPV0+XCIsYz17Y046XCJwYXJhbXNcIixiOlwiXFxcXChbXlxcXFwoXVwiLHJCOiEwLGM6W3tiOi9cXCgvLGU6L1xcKS8sazp0LGM6W1wic2VsZlwiXS5jb25jYXQobil9XX07cmV0dXJue2FsaWFzZXM6W1wiY29mZmVlXCIsXCJjc29uXCIsXCJpY2VkXCJdLGs6dCxpOi9cXC9cXCovLGM6bi5jb25jYXQoW2UuQyhcIiMjI1wiLFwiIyMjXCIpLGUuSENNLHtjTjpcImZ1bmN0aW9uXCIsYjpcIl5cXFxccypcIityK1wiXFxcXHMqPVxcXFxzKlwiK3MsZTpcIlstPV0+XCIsckI6ITAsYzpbaSxjXX0se2I6L1s6XFwoLD1dXFxzKi8scjowLGM6W3tjTjpcImZ1bmN0aW9uXCIsYjpzLGU6XCJbLT1dPlwiLHJCOiEwLGM6W2NdfV19LHtjTjpcImNsYXNzXCIsYks6XCJjbGFzc1wiLGU6XCIkXCIsaTovWzo9XCJcXFtcXF1dLyxjOlt7Yks6XCJleHRlbmRzXCIsZVc6ITAsaTovWzo9XCJcXFtcXF1dLyxjOltpXX0saV19LHtjTjpcImF0dHJpYnV0ZVwiLGI6citcIjpcIixlOlwiOlwiLHJCOiEwLHJFOiEwLHI6MH1dKX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJjcHBcIixmdW5jdGlvbihlKXt2YXIgdD17Y046XCJrZXl3b3JkXCIsYjpcIlxcXFxiW2EtelxcXFxkX10qX3RcXFxcYlwifSxyPXtjTjpcInN0cmluZ1wiLHY6W2UuaW5oZXJpdChlLlFTTSx7YjonKCh1OD98VSl8TCk/XCInfSkse2I6Jyh1OD98VSk/UlwiJyxlOidcIicsYzpbZS5CRV19LHtiOlwiJ1xcXFxcXFxcPy5cIixlOlwiJ1wiLGk6XCIuXCJ9XX0sYT17Y046XCJudW1iZXJcIix2Olt7YjpcIlxcXFxiKFxcXFxkKyhcXFxcLlxcXFxkKik/fFxcXFwuXFxcXGQrKSh1fFV8bHxMfHVsfFVMfGZ8RilcIn0se2I6ZS5DTlJ9XX0sbj17Y046XCJwcmVwcm9jZXNzb3JcIixiOlwiI1wiLGU6XCIkXCIsazpcImlmIGVsc2UgZWxpZiBlbmRpZiBkZWZpbmUgdW5kZWYgd2FybmluZyBlcnJvciBsaW5lIHByYWdtYSBpZmRlZiBpZm5kZWZcIixjOlt7YjovXFxcXFxcbi8scjowfSx7Yks6XCJpbmNsdWRlXCIsZTpcIiRcIixjOltyLHtjTjpcInN0cmluZ1wiLGI6XCI8XCIsZTpcIj5cIixpOlwiXFxcXG5cIn1dfSxyLGEsZS5DTENNLGUuQ0JDTV19LGk9ZS5JUitcIlxcXFxzKlxcXFwoXCIscz17a2V5d29yZDpcImludCBmbG9hdCB3aGlsZSBwcml2YXRlIGNoYXIgY2F0Y2ggZXhwb3J0IHZpcnR1YWwgb3BlcmF0b3Igc2l6ZW9mIGR5bmFtaWNfY2FzdHwxMCB0eXBlZGVmIGNvbnN0X2Nhc3R8MTAgY29uc3Qgc3RydWN0IGZvciBzdGF0aWNfY2FzdHwxMCB1bmlvbiBuYW1lc3BhY2UgdW5zaWduZWQgbG9uZyB2b2xhdGlsZSBzdGF0aWMgcHJvdGVjdGVkIGJvb2wgdGVtcGxhdGUgbXV0YWJsZSBpZiBwdWJsaWMgZnJpZW5kIGRvIGdvdG8gYXV0byB2b2lkIGVudW0gZWxzZSBicmVhayBleHRlcm4gdXNpbmcgY2xhc3MgYXNtIGNhc2UgdHlwZWlkIHNob3J0IHJlaW50ZXJwcmV0X2Nhc3R8MTAgZGVmYXVsdCBkb3VibGUgcmVnaXN0ZXIgZXhwbGljaXQgc2lnbmVkIHR5cGVuYW1lIHRyeSB0aGlzIHN3aXRjaCBjb250aW51ZSBpbmxpbmUgZGVsZXRlIGFsaWdub2YgY29uc3RleHByIGRlY2x0eXBlIG5vZXhjZXB0IHN0YXRpY19hc3NlcnQgdGhyZWFkX2xvY2FsIHJlc3RyaWN0IF9Cb29sIGNvbXBsZXggX0NvbXBsZXggX0ltYWdpbmFyeSBhdG9taWNfYm9vbCBhdG9taWNfY2hhciBhdG9taWNfc2NoYXIgYXRvbWljX3VjaGFyIGF0b21pY19zaG9ydCBhdG9taWNfdXNob3J0IGF0b21pY19pbnQgYXRvbWljX3VpbnQgYXRvbWljX2xvbmcgYXRvbWljX3Vsb25nIGF0b21pY19sbG9uZyBhdG9taWNfdWxsb25nXCIsYnVpbHRfaW46XCJzdGQgc3RyaW5nIGNpbiBjb3V0IGNlcnIgY2xvZyBzdGRpbiBzdGRvdXQgc3RkZXJyIHN0cmluZ3N0cmVhbSBpc3RyaW5nc3RyZWFtIG9zdHJpbmdzdHJlYW0gYXV0b19wdHIgZGVxdWUgbGlzdCBxdWV1ZSBzdGFjayB2ZWN0b3IgbWFwIHNldCBiaXRzZXQgbXVsdGlzZXQgbXVsdGltYXAgdW5vcmRlcmVkX3NldCB1bm9yZGVyZWRfbWFwIHVub3JkZXJlZF9tdWx0aXNldCB1bm9yZGVyZWRfbXVsdGltYXAgYXJyYXkgc2hhcmVkX3B0ciBhYm9ydCBhYnMgYWNvcyBhc2luIGF0YW4yIGF0YW4gY2FsbG9jIGNlaWwgY29zaCBjb3MgZXhpdCBleHAgZmFicyBmbG9vciBmbW9kIGZwcmludGYgZnB1dHMgZnJlZSBmcmV4cCBmc2NhbmYgaXNhbG51bSBpc2FscGhhIGlzY250cmwgaXNkaWdpdCBpc2dyYXBoIGlzbG93ZXIgaXNwcmludCBpc3B1bmN0IGlzc3BhY2UgaXN1cHBlciBpc3hkaWdpdCB0b2xvd2VyIHRvdXBwZXIgbGFicyBsZGV4cCBsb2cxMCBsb2cgbWFsbG9jIHJlYWxsb2MgbWVtY2hyIG1lbWNtcCBtZW1jcHkgbWVtc2V0IG1vZGYgcG93IHByaW50ZiBwdXRjaGFyIHB1dHMgc2NhbmYgc2luaCBzaW4gc25wcmludGYgc3ByaW50ZiBzcXJ0IHNzY2FuZiBzdHJjYXQgc3RyY2hyIHN0cmNtcCBzdHJjcHkgc3RyY3NwbiBzdHJsZW4gc3RybmNhdCBzdHJuY21wIHN0cm5jcHkgc3RycGJyayBzdHJyY2hyIHN0cnNwbiBzdHJzdHIgdGFuaCB0YW4gdmZwcmludGYgdnByaW50ZiB2c3ByaW50ZlwiLGxpdGVyYWw6XCJ0cnVlIGZhbHNlIG51bGxwdHIgTlVMTFwifTtyZXR1cm57YWxpYXNlczpbXCJjXCIsXCJjY1wiLFwiaFwiLFwiYysrXCIsXCJoKytcIixcImhwcFwiXSxrOnMsaTpcIjwvXCIsYzpbdCxlLkNMQ00sZS5DQkNNLGEscixuLHtiOlwiXFxcXGIoZGVxdWV8bGlzdHxxdWV1ZXxzdGFja3x2ZWN0b3J8bWFwfHNldHxiaXRzZXR8bXVsdGlzZXR8bXVsdGltYXB8dW5vcmRlcmVkX21hcHx1bm9yZGVyZWRfc2V0fHVub3JkZXJlZF9tdWx0aXNldHx1bm9yZGVyZWRfbXVsdGltYXB8YXJyYXkpXFxcXHMqPFwiLGU6XCI+XCIsazpzLGM6W1wic2VsZlwiLHRdfSx7YjplLklSK1wiOjpcIixrOnN9LHtiSzpcIm5ldyB0aHJvdyByZXR1cm4gZWxzZVwiLHI6MH0se2NOOlwiZnVuY3Rpb25cIixiOlwiKFwiK2UuSVIrXCJbXFxcXComXFxcXHNdKykrXCIraSxyQjohMCxlOi9bezs9XS8sZUU6ITAsazpzLGk6L1teXFx3XFxzXFwqJl0vLGM6W3tiOmksckI6ITAsYzpbZS5UTV0scjowfSx7Y046XCJwYXJhbXNcIixiOi9cXCgvLGU6L1xcKS8sazpzLHI6MCxjOltlLkNMQ00sZS5DQkNNLHIsYV19LGUuQ0xDTSxlLkNCQ00sbl19XX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJjc1wiLGZ1bmN0aW9uKGUpe3ZhciB0PVwiYWJzdHJhY3QgYXMgYmFzZSBib29sIGJyZWFrIGJ5dGUgY2FzZSBjYXRjaCBjaGFyIGNoZWNrZWQgY29uc3QgY29udGludWUgZGVjaW1hbCBkeW5hbWljIGRlZmF1bHQgZGVsZWdhdGUgZG8gZG91YmxlIGVsc2UgZW51bSBldmVudCBleHBsaWNpdCBleHRlcm4gZmFsc2UgZmluYWxseSBmaXhlZCBmbG9hdCBmb3IgZm9yZWFjaCBnb3RvIGlmIGltcGxpY2l0IGluIGludCBpbnRlcmZhY2UgaW50ZXJuYWwgaXMgbG9jayBsb25nIG51bGwgd2hlbiBvYmplY3Qgb3BlcmF0b3Igb3V0IG92ZXJyaWRlIHBhcmFtcyBwcml2YXRlIHByb3RlY3RlZCBwdWJsaWMgcmVhZG9ubHkgcmVmIHNieXRlIHNlYWxlZCBzaG9ydCBzaXplb2Ygc3RhY2thbGxvYyBzdGF0aWMgc3RyaW5nIHN0cnVjdCBzd2l0Y2ggdGhpcyB0cnVlIHRyeSB0eXBlb2YgdWludCB1bG9uZyB1bmNoZWNrZWQgdW5zYWZlIHVzaG9ydCB1c2luZyB2aXJ0dWFsIHZvbGF0aWxlIHZvaWQgd2hpbGUgYXN5bmMgcHJvdGVjdGVkIHB1YmxpYyBwcml2YXRlIGludGVybmFsIGFzY2VuZGluZyBkZXNjZW5kaW5nIGZyb20gZ2V0IGdyb3VwIGludG8gam9pbiBsZXQgb3JkZXJieSBwYXJ0aWFsIHNlbGVjdCBzZXQgdmFsdWUgdmFyIHdoZXJlIHlpZWxkXCIscj1lLklSK1wiKDxcIitlLklSK1wiPik/XCI7cmV0dXJue2FsaWFzZXM6W1wiY3NoYXJwXCJdLGs6dCxpOi86Oi8sYzpbZS5DKFwiLy8vXCIsXCIkXCIse3JCOiEwLGM6W3tjTjpcInhtbERvY1RhZ1wiLHY6W3tiOlwiLy8vXCIscjowfSx7YjpcIjwhLS18LS0+XCJ9LHtiOlwiPC8/XCIsZTpcIj5cIn1dfV19KSxlLkNMQ00sZS5DQkNNLHtjTjpcInByZXByb2Nlc3NvclwiLGI6XCIjXCIsZTpcIiRcIixrOlwiaWYgZWxzZSBlbGlmIGVuZGlmIGRlZmluZSB1bmRlZiB3YXJuaW5nIGVycm9yIGxpbmUgcmVnaW9uIGVuZHJlZ2lvbiBwcmFnbWEgY2hlY2tzdW1cIn0se2NOOlwic3RyaW5nXCIsYjonQFwiJyxlOidcIicsYzpbe2I6J1wiXCInfV19LGUuQVNNLGUuUVNNLGUuQ05NLHtiSzpcImNsYXNzIGludGVyZmFjZVwiLGU6L1t7Oz1dLyxpOi9bXlxcczpdLyxjOltlLlRNLGUuQ0xDTSxlLkNCQ01dfSx7Yks6XCJuYW1lc3BhY2VcIixlOi9bezs9XS8saTovW15cXHM6XS8sYzpbe2NOOlwidGl0bGVcIixiOlwiW2EtekEtWl0oXFxcXC4/XFxcXHcpKlwiLHI6MH0sZS5DTENNLGUuQ0JDTV19LHtiSzpcIm5ldyByZXR1cm4gdGhyb3cgYXdhaXRcIixyOjB9LHtjTjpcImZ1bmN0aW9uXCIsYjpcIihcIityK1wiXFxcXHMrKStcIitlLklSK1wiXFxcXHMqXFxcXChcIixyQjohMCxlOi9bezs9XS8sZUU6ITAsazp0LGM6W3tiOmUuSVIrXCJcXFxccypcXFxcKFwiLHJCOiEwLGM6W2UuVE1dLHI6MH0se2NOOlwicGFyYW1zXCIsYjovXFwoLyxlOi9cXCkvLGVCOiEwLGVFOiEwLGs6dCxyOjAsYzpbZS5BU00sZS5RU00sZS5DTk0sZS5DQkNNXX0sZS5DTENNLGUuQ0JDTV19XX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJjc3NcIixmdW5jdGlvbihlKXt2YXIgdD1cIlthLXpBLVotXVthLXpBLVowLTlfLV0qXCIscj17Y046XCJmdW5jdGlvblwiLGI6dCtcIlxcXFwoXCIsckI6ITAsZUU6ITAsZTpcIlxcXFwoXCJ9LGE9e2NOOlwicnVsZVwiLGI6L1tBLVpcXF9cXC5cXC1dK1xccyo6LyxyQjohMCxlOlwiO1wiLGVXOiEwLGM6W3tjTjpcImF0dHJpYnV0ZVwiLGI6L1xcUy8sZTpcIjpcIixlRTohMCxzdGFydHM6e2NOOlwidmFsdWVcIixlVzohMCxlRTohMCxjOltyLGUuQ1NTTk0sZS5RU00sZS5BU00sZS5DQkNNLHtjTjpcImhleGNvbG9yXCIsYjpcIiNbMC05QS1GYS1mXStcIn0se2NOOlwiaW1wb3J0YW50XCIsYjpcIiFpbXBvcnRhbnRcIn1dfX1dfTtyZXR1cm57Y0k6ITAsaTovWz1cXC98J1xcJF0vLGM6W2UuQ0JDTSx7Y046XCJpZFwiLGI6L1xcI1tBLVphLXowLTlfLV0rL30se2NOOlwiY2xhc3NcIixiOi9cXC5bQS1aYS16MC05Xy1dKy99LHtjTjpcImF0dHJfc2VsZWN0b3JcIixiOi9cXFsvLGU6L1xcXS8saTpcIiRcIn0se2NOOlwicHNldWRvXCIsYjovOig6KT9bYS16QS1aMC05XFxfXFwtXFwrXFwoXFwpXCInXSsvfSx7Y046XCJhdF9ydWxlXCIsYjpcIkAoZm9udC1mYWNlfHBhZ2UpXCIsbDpcIlthLXotXStcIixrOlwiZm9udC1mYWNlIHBhZ2VcIn0se2NOOlwiYXRfcnVsZVwiLGI6XCJAXCIsZTpcIlt7O11cIixjOlt7Y046XCJrZXl3b3JkXCIsYjovXFxTKy99LHtiOi9cXHMvLGVXOiEwLGVFOiEwLHI6MCxjOltyLGUuQVNNLGUuUVNNLGUuQ1NTTk1dfV19LHtjTjpcInRhZ1wiLGI6dCxyOjB9LHtjTjpcInJ1bGVzXCIsYjpcIntcIixlOlwifVwiLGk6L1xcUy8sYzpbZS5DQkNNLGFdfV19fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwiZGlmZlwiLGZ1bmN0aW9uKGUpe3JldHVybnthbGlhc2VzOltcInBhdGNoXCJdLGM6W3tjTjpcImNodW5rXCIscjoxMCx2Olt7YjovXkBAICtcXC1cXGQrLFxcZCsgK1xcK1xcZCssXFxkKyArQEAkL30se2I6L15cXCpcXCpcXCogK1xcZCssXFxkKyArXFwqXFwqXFwqXFwqJC99LHtiOi9eXFwtXFwtXFwtICtcXGQrLFxcZCsgK1xcLVxcLVxcLVxcLSQvfV19LHtjTjpcImhlYWRlclwiLHY6W3tiOi9JbmRleDogLyxlOi8kL30se2I6Lz09PT09LyxlOi89PT09PSQvfSx7YjovXlxcLVxcLVxcLS8sZTovJC99LHtiOi9eXFwqezN9IC8sZTovJC99LHtiOi9eXFwrXFwrXFwrLyxlOi8kL30se2I6L1xcKns1fS8sZTovXFwqezV9JC99XX0se2NOOlwiYWRkaXRpb25cIixiOlwiXlxcXFwrXCIsZTpcIiRcIn0se2NOOlwiZGVsZXRpb25cIixiOlwiXlxcXFwtXCIsZTpcIiRcIn0se2NOOlwiY2hhbmdlXCIsYjpcIl5cXFxcIVwiLGU6XCIkXCJ9XX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJodHRwXCIsZnVuY3Rpb24oZSl7cmV0dXJue2FsaWFzZXM6W1wiaHR0cHNcIl0saTpcIlxcXFxTXCIsYzpbe2NOOlwic3RhdHVzXCIsYjpcIl5IVFRQL1swLTlcXFxcLl0rXCIsZTpcIiRcIixjOlt7Y046XCJudW1iZXJcIixiOlwiXFxcXGJcXFxcZHszfVxcXFxiXCJ9XX0se2NOOlwicmVxdWVzdFwiLGI6XCJeW0EtWl0rICguKj8pIEhUVFAvWzAtOVxcXFwuXSskXCIsckI6ITAsZTpcIiRcIixjOlt7Y046XCJzdHJpbmdcIixiOlwiIFwiLGU6XCIgXCIsZUI6ITAsZUU6ITB9XX0se2NOOlwiYXR0cmlidXRlXCIsYjpcIl5cXFxcd1wiLGU6XCI6IFwiLGVFOiEwLGk6XCJcXFxcbnxcXFxcc3w9XCIsc3RhcnRzOntjTjpcInN0cmluZ1wiLGU6XCIkXCJ9fSx7YjpcIlxcXFxuXFxcXG5cIixzdGFydHM6e3NMOltdLGVXOiEwfX1dfX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcImluaVwiLGZ1bmN0aW9uKGUpe3ZhciB0PXtjTjpcInN0cmluZ1wiLGM6W2UuQkVdLHY6W3tiOlwiJycnXCIsZTpcIicnJ1wiLHI6MTB9LHtiOidcIlwiXCInLGU6J1wiXCJcIicscjoxMH0se2I6J1wiJyxlOidcIid9LHtiOlwiJ1wiLGU6XCInXCJ9XX07cmV0dXJue2FsaWFzZXM6W1widG9tbFwiXSxjSTohMCxpOi9cXFMvLGM6W2UuQyhcIjtcIixcIiRcIiksZS5IQ00se2NOOlwidGl0bGVcIixiOi9eXFxzKlxcWysvLGU6L1xcXSsvfSx7Y046XCJzZXR0aW5nXCIsYjovXlthLXowLTlcXFtcXF1fLV0rXFxzKj1cXHMqLyxlOlwiJFwiLGM6W3tjTjpcInZhbHVlXCIsZVc6ITAsazpcIm9uIG9mZiB0cnVlIGZhbHNlIHllcyBub1wiLGM6W3tjTjpcInZhcmlhYmxlXCIsdjpbe2I6L1xcJFtcXHdcXGRcIl1bXFx3XFxkX10qL30se2I6L1xcJFxceyguKj8pfS99XX0sdCx7Y046XCJudW1iZXJcIixiOi8oW1xcK1xcLV0rKT9bXFxkXStfW1xcZF9dKy99LGUuTk1dLHI6MH1dfV19fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwiamF2YVwiLGZ1bmN0aW9uKGUpe3ZhciB0PWUuVUlSK1wiKDxcIitlLlVJUitcIj4pP1wiLHI9XCJmYWxzZSBzeW5jaHJvbml6ZWQgaW50IGFic3RyYWN0IGZsb2F0IHByaXZhdGUgY2hhciBib29sZWFuIHN0YXRpYyBudWxsIGlmIGNvbnN0IGZvciB0cnVlIHdoaWxlIGxvbmcgc3RyaWN0ZnAgZmluYWxseSBwcm90ZWN0ZWQgaW1wb3J0IG5hdGl2ZSBmaW5hbCB2b2lkIGVudW0gZWxzZSBicmVhayB0cmFuc2llbnQgY2F0Y2ggaW5zdGFuY2VvZiBieXRlIHN1cGVyIHZvbGF0aWxlIGNhc2UgYXNzZXJ0IHNob3J0IHBhY2thZ2UgZGVmYXVsdCBkb3VibGUgcHVibGljIHRyeSB0aGlzIHN3aXRjaCBjb250aW51ZSB0aHJvd3MgcHJvdGVjdGVkIHB1YmxpYyBwcml2YXRlXCIsYT1cIlxcXFxiKDBbYkJdKFswMV0rWzAxX10rWzAxXSt8WzAxXSspfDBbeFhdKFthLWZBLUYwLTldK1thLWZBLUYwLTlfXStbYS1mQS1GMC05XSt8W2EtZkEtRjAtOV0rKXwoKFtcXFxcZF0rW1xcXFxkX10rW1xcXFxkXSt8W1xcXFxkXSspKFxcXFwuKFtcXFxcZF0rW1xcXFxkX10rW1xcXFxkXSt8W1xcXFxkXSspKT98XFxcXC4oW1xcXFxkXStbXFxcXGRfXStbXFxcXGRdK3xbXFxcXGRdKykpKFtlRV1bLStdP1xcXFxkKyk/KVtsTGZGXT9cIixuPXtjTjpcIm51bWJlclwiLGI6YSxyOjB9O3JldHVybnthbGlhc2VzOltcImpzcFwiXSxrOnIsaTovPFxcL3wjLyxjOltlLkMoXCIvXFxcXCpcXFxcKlwiLFwiXFxcXCovXCIse3I6MCxjOlt7Y046XCJkb2N0YWdcIixiOlwiQFtBLVphLXpdK1wifV19KSxlLkNMQ00sZS5DQkNNLGUuQVNNLGUuUVNNLHtjTjpcImNsYXNzXCIsYks6XCJjbGFzcyBpbnRlcmZhY2VcIixlOi9bezs9XS8sZUU6ITAsazpcImNsYXNzIGludGVyZmFjZVwiLGk6L1s6XCJcXFtcXF1dLyxjOlt7Yks6XCJleHRlbmRzIGltcGxlbWVudHNcIn0sZS5VVE1dfSx7Yks6XCJuZXcgdGhyb3cgcmV0dXJuIGVsc2VcIixyOjB9LHtjTjpcImZ1bmN0aW9uXCIsYjpcIihcIit0K1wiXFxcXHMrKStcIitlLlVJUitcIlxcXFxzKlxcXFwoXCIsckI6ITAsZTovW3s7PV0vLGVFOiEwLGs6cixjOlt7YjplLlVJUitcIlxcXFxzKlxcXFwoXCIsckI6ITAscjowLGM6W2UuVVRNXX0se2NOOlwicGFyYW1zXCIsYjovXFwoLyxlOi9cXCkvLGs6cixyOjAsYzpbZS5BU00sZS5RU00sZS5DTk0sZS5DQkNNXX0sZS5DTENNLGUuQ0JDTV19LG4se2NOOlwiYW5ub3RhdGlvblwiLGI6XCJAW0EtWmEtel0rXCJ9XX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJqYXZhc2NyaXB0XCIsZnVuY3Rpb24oZSl7cmV0dXJue2FsaWFzZXM6W1wianNcIl0sazp7a2V5d29yZDpcImluIG9mIGlmIGZvciB3aGlsZSBmaW5hbGx5IHZhciBuZXcgZnVuY3Rpb24gZG8gcmV0dXJuIHZvaWQgZWxzZSBicmVhayBjYXRjaCBpbnN0YW5jZW9mIHdpdGggdGhyb3cgY2FzZSBkZWZhdWx0IHRyeSB0aGlzIHN3aXRjaCBjb250aW51ZSB0eXBlb2YgZGVsZXRlIGxldCB5aWVsZCBjb25zdCBleHBvcnQgc3VwZXIgZGVidWdnZXIgYXMgYXN5bmMgYXdhaXRcIixsaXRlcmFsOlwidHJ1ZSBmYWxzZSBudWxsIHVuZGVmaW5lZCBOYU4gSW5maW5pdHlcIixidWlsdF9pbjpcImV2YWwgaXNGaW5pdGUgaXNOYU4gcGFyc2VGbG9hdCBwYXJzZUludCBkZWNvZGVVUkkgZGVjb2RlVVJJQ29tcG9uZW50IGVuY29kZVVSSSBlbmNvZGVVUklDb21wb25lbnQgZXNjYXBlIHVuZXNjYXBlIE9iamVjdCBGdW5jdGlvbiBCb29sZWFuIEVycm9yIEV2YWxFcnJvciBJbnRlcm5hbEVycm9yIFJhbmdlRXJyb3IgUmVmZXJlbmNlRXJyb3IgU3RvcEl0ZXJhdGlvbiBTeW50YXhFcnJvciBUeXBlRXJyb3IgVVJJRXJyb3IgTnVtYmVyIE1hdGggRGF0ZSBTdHJpbmcgUmVnRXhwIEFycmF5IEZsb2F0MzJBcnJheSBGbG9hdDY0QXJyYXkgSW50MTZBcnJheSBJbnQzMkFycmF5IEludDhBcnJheSBVaW50MTZBcnJheSBVaW50MzJBcnJheSBVaW50OEFycmF5IFVpbnQ4Q2xhbXBlZEFycmF5IEFycmF5QnVmZmVyIERhdGFWaWV3IEpTT04gSW50bCBhcmd1bWVudHMgcmVxdWlyZSBtb2R1bGUgY29uc29sZSB3aW5kb3cgZG9jdW1lbnQgU3ltYm9sIFNldCBNYXAgV2Vha1NldCBXZWFrTWFwIFByb3h5IFJlZmxlY3QgUHJvbWlzZVwifSxjOlt7Y046XCJwaVwiLHI6MTAsYjovXlxccypbJ1wiXXVzZSAoc3RyaWN0fGFzbSlbJ1wiXS99LGUuQVNNLGUuUVNNLHtjTjpcInN0cmluZ1wiLGI6XCJgXCIsZTpcImBcIixjOltlLkJFLHtjTjpcInN1YnN0XCIsYjpcIlxcXFwkXFxcXHtcIixlOlwiXFxcXH1cIn1dfSxlLkNMQ00sZS5DQkNNLHtjTjpcIm51bWJlclwiLHY6W3tiOlwiXFxcXGIoMFtiQl1bMDFdKylcIn0se2I6XCJcXFxcYigwW29PXVswLTddKylcIn0se2I6ZS5DTlJ9XSxyOjB9LHtiOlwiKFwiK2UuUlNSK1wifFxcXFxiKGNhc2V8cmV0dXJufHRocm93KVxcXFxiKVxcXFxzKlwiLGs6XCJyZXR1cm4gdGhyb3cgY2FzZVwiLGM6W2UuQ0xDTSxlLkNCQ00sZS5STSx7YjovPC8sZTovPlxccypbKTtcXF1dLyxyOjAsc0w6XCJ4bWxcIn1dLHI6MH0se2NOOlwiZnVuY3Rpb25cIixiSzpcImZ1bmN0aW9uXCIsZTovXFx7LyxlRTohMCxjOltlLmluaGVyaXQoZS5UTSx7YjovW0EtWmEteiRfXVswLTlBLVphLXokX10qL30pLHtjTjpcInBhcmFtc1wiLGI6L1xcKC8sZTovXFwpLyxlQjohMCxlRTohMCxjOltlLkNMQ00sZS5DQkNNXX1dLGk6L1xcW3wlL30se2I6L1xcJFsoLl0vfSx7YjpcIlxcXFwuXCIrZS5JUixyOjB9LHtiSzpcImltcG9ydFwiLGU6XCJbOyRdXCIsazpcImltcG9ydCBmcm9tIGFzXCIsYzpbZS5BU00sZS5RU01dfSx7Y046XCJjbGFzc1wiLGJLOlwiY2xhc3NcIixlOi9bezs9XS8sZUU6ITAsaTovWzpcIlxcW1xcXV0vLGM6W3tiSzpcImV4dGVuZHNcIn0sZS5VVE1dfV0saTovIy99fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwianNvblwiLGZ1bmN0aW9uKGUpe3ZhciB0PXtsaXRlcmFsOlwidHJ1ZSBmYWxzZSBudWxsXCJ9LHI9W2UuUVNNLGUuQ05NXSxhPXtjTjpcInZhbHVlXCIsZTpcIixcIixlVzohMCxlRTohMCxjOnIsazp0fSxuPXtiOlwie1wiLGU6XCJ9XCIsYzpbe2NOOlwiYXR0cmlidXRlXCIsYjonXFxcXHMqXCInLGU6J1wiXFxcXHMqOlxcXFxzKicsZUI6ITAsZUU6ITAsYzpbZS5CRV0saTpcIlxcXFxuXCIsc3RhcnRzOmF9XSxpOlwiXFxcXFNcIn0saT17YjpcIlxcXFxbXCIsZTpcIlxcXFxdXCIsYzpbZS5pbmhlcml0KGEse2NOOm51bGx9KV0saTpcIlxcXFxTXCJ9O3JldHVybiByLnNwbGljZShyLmxlbmd0aCwwLG4saSkse2M6cixrOnQsaTpcIlxcXFxTXCJ9fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwibWFrZWZpbGVcIixmdW5jdGlvbihlKXt2YXIgdD17Y046XCJ2YXJpYWJsZVwiLGI6L1xcJFxcKC8sZTovXFwpLyxjOltlLkJFXX07cmV0dXJue2FsaWFzZXM6W1wibWtcIixcIm1ha1wiXSxjOltlLkhDTSx7YjovXlxcdytcXHMqXFxXKj0vLHJCOiEwLHI6MCxzdGFydHM6e2NOOlwiY29uc3RhbnRcIixlOi9cXHMqXFxXKj0vLGVFOiEwLHN0YXJ0czp7ZTovJC8scjowLGM6W3RdfX19LHtjTjpcInRpdGxlXCIsYjovXltcXHddKzpcXHMqJC99LHtjTjpcInBob255XCIsYjovXlxcLlBIT05ZOi8sZTovJC8sazpcIi5QSE9OWVwiLGw6L1tcXC5cXHddKy99LHtiOi9eXFx0Ky8sZTovJC8scjowLGM6W2UuUVNNLHRdfV19fSksZS5yZWdpc3Rlckxhbmd1YWdlKFwieG1sXCIsZnVuY3Rpb24oZSl7dmFyIHQ9XCJbQS1aYS16MC05XFxcXC5fOi1dK1wiLHI9e2I6LzxcXD8ocGhwKT8oPyFcXHcpLyxlOi9cXD8+LyxzTDpcInBocFwifSxhPXtlVzohMCxpOi88LyxyOjAsYzpbcix7Y046XCJhdHRyaWJ1dGVcIixiOnQscjowfSx7YjpcIj1cIixyOjAsYzpbe2NOOlwidmFsdWVcIixjOltyXSx2Olt7YjovXCIvLGU6L1wiL30se2I6LycvLGU6LycvfSx7YjovW15cXHNcXC8+XSsvfV19XX1dfTtyZXR1cm57YWxpYXNlczpbXCJodG1sXCIsXCJ4aHRtbFwiLFwicnNzXCIsXCJhdG9tXCIsXCJ4c2xcIixcInBsaXN0XCJdLGNJOiEwLGM6W3tjTjpcImRvY3R5cGVcIixiOlwiPCFET0NUWVBFXCIsZTpcIj5cIixyOjEwLGM6W3tiOlwiXFxcXFtcIixlOlwiXFxcXF1cIn1dfSxlLkMoXCI8IS0tXCIsXCItLT5cIix7cjoxMH0pLHtjTjpcImNkYXRhXCIsYjpcIjxcXFxcIVxcXFxbQ0RBVEFcXFxcW1wiLGU6XCJcXFxcXVxcXFxdPlwiLHI6MTB9LHtjTjpcInRhZ1wiLGI6XCI8c3R5bGUoPz1cXFxcc3w+fCQpXCIsZTpcIj5cIixrOnt0aXRsZTpcInN0eWxlXCJ9LGM6W2FdLHN0YXJ0czp7ZTpcIjwvc3R5bGU+XCIsckU6ITAsc0w6XCJjc3NcIn19LHtjTjpcInRhZ1wiLGI6XCI8c2NyaXB0KD89XFxcXHN8PnwkKVwiLGU6XCI+XCIsazp7dGl0bGU6XCJzY3JpcHRcIn0sYzpbYV0sc3RhcnRzOntlOlwiPC9zY3JpcHQ+XCIsckU6ITAsc0w6W1wiYWN0aW9uc2NyaXB0XCIsXCJqYXZhc2NyaXB0XCIsXCJoYW5kbGViYXJzXCJdfX0scix7Y046XCJwaVwiLGI6LzxcXD9cXHcrLyxlOi9cXD8+LyxyOjEwfSx7Y046XCJ0YWdcIixiOlwiPC8/XCIsZTpcIi8/PlwiLGM6W3tjTjpcInRpdGxlXCIsYjovW14gXFwvPjxcXG5cXHRdKy8scjowfSxhXX1dfX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcIm1hcmtkb3duXCIsZnVuY3Rpb24oZSl7cmV0dXJue2FsaWFzZXM6W1wibWRcIixcIm1rZG93blwiLFwibWtkXCJdLGM6W3tjTjpcImhlYWRlclwiLHY6W3tiOlwiXiN7MSw2fVwiLGU6XCIkXCJ9LHtiOlwiXi4rP1xcXFxuWz0tXXsyLH0kXCJ9XX0se2I6XCI8XCIsZTpcIj5cIixzTDpcInhtbFwiLHI6MH0se2NOOlwiYnVsbGV0XCIsYjpcIl4oWyorLV18KFxcXFxkK1xcXFwuKSlcXFxccytcIn0se2NOOlwic3Ryb25nXCIsYjpcIlsqX117Mn0uKz9bKl9dezJ9XCJ9LHtjTjpcImVtcGhhc2lzXCIsdjpbe2I6XCJcXFxcKi4rP1xcXFwqXCJ9LHtiOlwiXy4rP19cIixyOjB9XX0se2NOOlwiYmxvY2txdW90ZVwiLGI6XCJePlxcXFxzK1wiLGU6XCIkXCJ9LHtjTjpcImNvZGVcIix2Olt7YjpcImAuKz9gXCJ9LHtiOlwiXiggezR9fFx0KVwiLGU6XCIkXCIscjowfV19LHtjTjpcImhvcml6b250YWxfcnVsZVwiLGI6XCJeWy1cXFxcKl17Myx9XCIsZTpcIiRcIn0se2I6XCJcXFxcWy4rP1xcXFxdW1xcXFwoXFxcXFtdLio/W1xcXFwpXFxcXF1dXCIsckI6ITAsYzpbe2NOOlwibGlua19sYWJlbFwiLGI6XCJcXFxcW1wiLGU6XCJcXFxcXVwiLGVCOiEwLHJFOiEwLHI6MH0se2NOOlwibGlua191cmxcIixiOlwiXFxcXF1cXFxcKFwiLGU6XCJcXFxcKVwiLGVCOiEwLGVFOiEwfSx7Y046XCJsaW5rX3JlZmVyZW5jZVwiLGI6XCJcXFxcXVxcXFxbXCIsZTpcIlxcXFxdXCIsZUI6ITAsZUU6ITB9XSxyOjEwfSx7YjpcIl5cXFxcWy4rXFxcXF06XCIsckI6ITAsYzpbe2NOOlwibGlua19yZWZlcmVuY2VcIixiOlwiXFxcXFtcIixlOlwiXFxcXF06XCIsZUI6ITAsZUU6ITAsc3RhcnRzOntjTjpcImxpbmtfdXJsXCIsZTpcIiRcIn19XX1dfX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcIm5naW54XCIsZnVuY3Rpb24oZSl7dmFyIHQ9e2NOOlwidmFyaWFibGVcIix2Olt7YjovXFwkXFxkKy99LHtiOi9cXCRcXHsvLGU6L30vfSx7YjpcIltcXFxcJFxcXFxAXVwiK2UuVUlSfV19LHI9e2VXOiEwLGw6XCJbYS16L19dK1wiLGs6e2J1aWx0X2luOlwib24gb2ZmIHllcyBubyB0cnVlIGZhbHNlIG5vbmUgYmxvY2tlZCBkZWJ1ZyBpbmZvIG5vdGljZSB3YXJuIGVycm9yIGNyaXQgc2VsZWN0IGJyZWFrIGxhc3QgcGVybWFuZW50IHJlZGlyZWN0IGtxdWV1ZSBydHNpZyBlcG9sbCBwb2xsIC9kZXYvcG9sbFwifSxyOjAsaTpcIj0+XCIsYzpbZS5IQ00se2NOOlwic3RyaW5nXCIsYzpbZS5CRSx0XSx2Olt7YjovXCIvLGU6L1wiL30se2I6LycvLGU6LycvfV19LHtjTjpcInVybFwiLGI6XCIoW2Etel0rKTovXCIsZTpcIlxcXFxzXCIsZVc6ITAsZUU6ITAsYzpbdF19LHtjTjpcInJlZ2V4cFwiLGM6W2UuQkUsdF0sdjpbe2I6XCJcXFxcc1xcXFxeXCIsZTpcIlxcXFxzfHt8O1wiLHJFOiEwfSx7YjpcIn5cXFxcKj9cXFxccytcIixlOlwiXFxcXHN8e3w7XCIsckU6ITB9LHtiOlwiXFxcXCooXFxcXC5bYS16XFxcXC1dKykrXCJ9LHtiOlwiKFthLXpcXFxcLV0rXFxcXC4pK1xcXFwqXCJ9XX0se2NOOlwibnVtYmVyXCIsYjpcIlxcXFxiXFxcXGR7MSwzfVxcXFwuXFxcXGR7MSwzfVxcXFwuXFxcXGR7MSwzfVxcXFwuXFxcXGR7MSwzfSg6XFxcXGR7MSw1fSk/XFxcXGJcIn0se2NOOlwibnVtYmVyXCIsYjpcIlxcXFxiXFxcXGQrW2tLbU1nR2RzaGR3eV0qXFxcXGJcIixyOjB9LHRdfTtyZXR1cm57YWxpYXNlczpbXCJuZ2lueGNvbmZcIl0sYzpbZS5IQ00se2I6ZS5VSVIrXCJcXFxcc1wiLGU6XCI7fHtcIixyQjohMCxjOlt7Y046XCJ0aXRsZVwiLGI6ZS5VSVIsc3RhcnRzOnJ9XSxyOjB9XSxpOlwiW15cXFxcc1xcXFx9XVwifX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcIm9iamVjdGl2ZWNcIixmdW5jdGlvbihlKXt2YXIgdD17Y046XCJidWlsdF9pblwiLGI6XCIoQVZ8Q0F8Q0Z8Q0d8Q0l8TUt8TVB8TlN8VUkpXFxcXHcrXCJ9LHI9e2tleXdvcmQ6XCJpbnQgZmxvYXQgd2hpbGUgY2hhciBleHBvcnQgc2l6ZW9mIHR5cGVkZWYgY29uc3Qgc3RydWN0IGZvciB1bmlvbiB1bnNpZ25lZCBsb25nIHZvbGF0aWxlIHN0YXRpYyBib29sIG11dGFibGUgaWYgZG8gcmV0dXJuIGdvdG8gdm9pZCBlbnVtIGVsc2UgYnJlYWsgZXh0ZXJuIGFzbSBjYXNlIHNob3J0IGRlZmF1bHQgZG91YmxlIHJlZ2lzdGVyIGV4cGxpY2l0IHNpZ25lZCB0eXBlbmFtZSB0aGlzIHN3aXRjaCBjb250aW51ZSB3Y2hhcl90IGlubGluZSByZWFkb25seSBhc3NpZ24gcmVhZHdyaXRlIHNlbGYgQHN5bmNocm9uaXplZCBpZCB0eXBlb2Ygbm9uYXRvbWljIHN1cGVyIHVuaWNoYXIgSUJPdXRsZXQgSUJBY3Rpb24gc3Ryb25nIHdlYWsgY29weSBpbiBvdXQgaW5vdXQgYnljb3B5IGJ5cmVmIG9uZXdheSBfX3N0cm9uZyBfX3dlYWsgX19ibG9jayBfX2F1dG9yZWxlYXNpbmcgQHByaXZhdGUgQHByb3RlY3RlZCBAcHVibGljIEB0cnkgQHByb3BlcnR5IEBlbmQgQHRocm93IEBjYXRjaCBAZmluYWxseSBAYXV0b3JlbGVhc2Vwb29sIEBzeW50aGVzaXplIEBkeW5hbWljIEBzZWxlY3RvciBAb3B0aW9uYWwgQHJlcXVpcmVkXCIsbGl0ZXJhbDpcImZhbHNlIHRydWUgRkFMU0UgVFJVRSBuaWwgWUVTIE5PIE5VTExcIixidWlsdF9pbjpcIkJPT0wgZGlzcGF0Y2hfb25jZV90IGRpc3BhdGNoX3F1ZXVlX3QgZGlzcGF0Y2hfc3luYyBkaXNwYXRjaF9hc3luYyBkaXNwYXRjaF9vbmNlXCJ9LGE9L1thLXpBLVpAXVthLXpBLVowLTlfXSovLG49XCJAaW50ZXJmYWNlIEBjbGFzcyBAcHJvdG9jb2wgQGltcGxlbWVudGF0aW9uXCI7cmV0dXJue2FsaWFzZXM6W1wibW1cIixcIm9iamNcIixcIm9iai1jXCJdLGs6cixsOmEsaTpcIjwvXCIsYzpbdCxlLkNMQ00sZS5DQkNNLGUuQ05NLGUuUVNNLHtjTjpcInN0cmluZ1wiLHY6W3tiOidAXCInLGU6J1wiJyxpOlwiXFxcXG5cIixjOltlLkJFXX0se2I6XCInXCIsZTpcIlteXFxcXFxcXFxdJ1wiLGk6XCJbXlxcXFxcXFxcXVteJ11cIn1dfSx7Y046XCJwcmVwcm9jZXNzb3JcIixiOlwiI1wiLGU6XCIkXCIsYzpbe2NOOlwidGl0bGVcIix2Olt7YjonXCInLGU6J1wiJ30se2I6XCI8XCIsZTpcIj5cIn1dfV19LHtjTjpcImNsYXNzXCIsYjpcIihcIituLnNwbGl0KFwiIFwiKS5qb2luKFwifFwiKStcIilcXFxcYlwiLGU6XCIoe3wkKVwiLGVFOiEwLGs6bixsOmEsYzpbZS5VVE1dfSx7Y046XCJ2YXJpYWJsZVwiLGI6XCJcXFxcLlwiK2UuVUlSLHI6MH1dfX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcInBlcmxcIixmdW5jdGlvbihlKXt2YXIgdD1cImdldHB3ZW50IGdldHNlcnZlbnQgcXVvdGVtZXRhIG1zZ3JjdiBzY2FsYXIga2lsbCBkYm1jbG9zZSB1bmRlZiBsYyBtYSBzeXN3cml0ZSB0ciBzZW5kIHVtYXNrIHN5c29wZW4gc2htd3JpdGUgdmVjIHF4IHV0aW1lIGxvY2FsIG9jdCBzZW1jdGwgbG9jYWx0aW1lIHJlYWRwaXBlIGRvIHJldHVybiBmb3JtYXQgcmVhZCBzcHJpbnRmIGRibW9wZW4gcG9wIGdldHBncnAgbm90IGdldHB3bmFtIHJld2luZGRpciBxcWZpbGVubyBxdyBlbmRwcm90b2VudCB3YWl0IHNldGhvc3RlbnQgYmxlc3Mgc3wwIG9wZW5kaXIgY29udGludWUgZWFjaCBzbGVlcCBlbmRncmVudCBzaHV0ZG93biBkdW1wIGNob21wIGNvbm5lY3QgZ2V0c29ja25hbWUgZGllIHNvY2tldHBhaXIgY2xvc2UgZmxvY2sgZXhpc3RzIGluZGV4IHNobWdldHN1YiBmb3IgZW5kcHdlbnQgcmVkbyBsc3RhdCBtc2djdGwgc2V0cGdycCBhYnMgZXhpdCBzZWxlY3QgcHJpbnQgcmVmIGdldGhvc3RieWFkZHIgdW5zaGlmdCBmY250bCBzeXNjYWxsIGdvdG8gZ2V0bmV0YnlhZGRyIGpvaW4gZ210aW1lIHN5bWxpbmsgc2VtZ2V0IHNwbGljZSB4fDAgZ2V0cGVlcm5hbWUgcmVjdiBsb2cgc2V0c29ja29wdCBjb3MgbGFzdCByZXZlcnNlIGdldGhvc3RieW5hbWUgZ2V0Z3JuYW0gc3R1ZHkgZm9ybWxpbmUgZW5kaG9zdGVudCB0aW1lcyBjaG9wIGxlbmd0aCBnZXRob3N0ZW50IGdldG5ldGVudCBwYWNrIGdldHByb3RvZW50IGdldHNlcnZieW5hbWUgcmFuZCBta2RpciBwb3MgY2htb2QgeXwwIHN1YnN0ciBlbmRuZXRlbnQgcHJpbnRmIG5leHQgb3BlbiBtc2dzbmQgcmVhZGRpciB1c2UgdW5saW5rIGdldHNvY2tvcHQgZ2V0cHJpb3JpdHkgcmluZGV4IHdhbnRhcnJheSBoZXggc3lzdGVtIGdldHNlcnZieXBvcnQgZW5kc2VydmVudCBpbnQgY2hyIHVudGllIHJtZGlyIHByb3RvdHlwZSB0ZWxsIGxpc3RlbiBmb3JrIHNobXJlYWQgdWNmaXJzdCBzZXRwcm90b2VudCBlbHNlIHN5c3NlZWsgbGluayBnZXRncmdpZCBzaG1jdGwgd2FpdHBpZCB1bnBhY2sgZ2V0bmV0YnluYW1lIHJlc2V0IGNoZGlyIGdyZXAgc3BsaXQgcmVxdWlyZSBjYWxsZXIgbGNmaXJzdCB1bnRpbCB3YXJuIHdoaWxlIHZhbHVlcyBzaGlmdCB0ZWxsZGlyIGdldHB3dWlkIG15IGdldHByb3RvYnludW1iZXIgZGVsZXRlIGFuZCBzb3J0IHVjIGRlZmluZWQgc3JhbmQgYWNjZXB0IHBhY2thZ2Ugc2Vla2RpciBnZXRwcm90b2J5bmFtZSBzZW1vcCBvdXIgcmVuYW1lIHNlZWsgaWYgcXwwIGNocm9vdCBzeXNyZWFkIHNldHB3ZW50IG5vIGNyeXB0IGdldGMgY2hvd24gc3FydCB3cml0ZSBzZXRuZXRlbnQgc2V0cHJpb3JpdHkgZm9yZWFjaCB0aWUgc2luIG1zZ2dldCBtYXAgc3RhdCBnZXRsb2dpbiB1bmxlc3MgZWxzaWYgdHJ1bmNhdGUgZXhlYyBrZXlzIGdsb2IgdGllZCBjbG9zZWRpcmlvY3RsIHNvY2tldCByZWFkbGluayBldmFsIHhvciByZWFkbGluZSBiaW5tb2RlIHNldHNlcnZlbnQgZW9mIG9yZCBiaW5kIGFsYXJtIHBpcGUgYXRhbjIgZ2V0Z3JlbnQgZXhwIHRpbWUgcHVzaCBzZXRncmVudCBndCBsdCBvciBuZSBtfDAgYnJlYWsgZ2l2ZW4gc2F5IHN0YXRlIHdoZW5cIixyPXtjTjpcInN1YnN0XCIsYjpcIlskQF1cXFxce1wiLGU6XCJcXFxcfVwiLGs6dH0sYT17YjpcIi0+e1wiLGU6XCJ9XCJ9LG49e2NOOlwidmFyaWFibGVcIix2Olt7YjovXFwkXFxkL30se2I6L1tcXCQlQF0oXFxeXFx3XFxifCNcXHcrKDo6XFx3KykqfHtcXHcrfXxcXHcrKDo6XFx3KikqKS99LHtiOi9bXFwkJUBdW15cXHNcXHd7XS8scjowfV19LGk9W2UuQkUscixuXSxzPVtuLGUuSENNLGUuQyhcIl5cXFxcPVxcXFx3XCIsXCJcXFxcPWN1dFwiLHtlVzohMH0pLGEse2NOOlwic3RyaW5nXCIsYzppLHY6W3tiOlwicVtxd3hyXT9cXFxccypcXFxcKFwiLGU6XCJcXFxcKVwiLHI6NX0se2I6XCJxW3F3eHJdP1xcXFxzKlxcXFxbXCIsZTpcIlxcXFxdXCIscjo1fSx7YjpcInFbcXd4cl0/XFxcXHMqXFxcXHtcIixlOlwiXFxcXH1cIixyOjV9LHtiOlwicVtxd3hyXT9cXFxccypcXFxcfFwiLGU6XCJcXFxcfFwiLHI6NX0se2I6XCJxW3F3eHJdP1xcXFxzKlxcXFw8XCIsZTpcIlxcXFw+XCIscjo1fSx7YjpcInF3XFxcXHMrcVwiLGU6XCJxXCIscjo1fSx7YjpcIidcIixlOlwiJ1wiLGM6W2UuQkVdfSx7YjonXCInLGU6J1wiJ30se2I6XCJgXCIsZTpcImBcIixjOltlLkJFXX0se2I6XCJ7XFxcXHcrfVwiLGM6W10scjowfSx7YjpcIi0/XFxcXHcrXFxcXHMqXFxcXD1cXFxcPlwiLGM6W10scjowfV19LHtjTjpcIm51bWJlclwiLGI6XCIoXFxcXGIwWzAtN19dKyl8KFxcXFxiMHhbMC05YS1mQS1GX10rKXwoXFxcXGJbMS05XVswLTlfXSooXFxcXC5bMC05X10rKT8pfFswX11cXFxcYlwiLHI6MH0se2I6XCIoXFxcXC9cXFxcL3xcIitlLlJTUitcInxcXFxcYihzcGxpdHxyZXR1cm58cHJpbnR8cmV2ZXJzZXxncmVwKVxcXFxiKVxcXFxzKlwiLGs6XCJzcGxpdCByZXR1cm4gcHJpbnQgcmV2ZXJzZSBncmVwXCIscjowLGM6W2UuSENNLHtjTjpcInJlZ2V4cFwiLGI6XCIoc3x0cnx5KS8oXFxcXFxcXFwufFteL10pKi8oXFxcXFxcXFwufFteL10pKi9bYS16XSpcIixyOjEwfSx7Y046XCJyZWdleHBcIixiOlwiKG18cXIpPy9cIixlOlwiL1thLXpdKlwiLGM6W2UuQkVdLHI6MH1dfSx7Y046XCJzdWJcIixiSzpcInN1YlwiLGU6XCIoXFxcXHMqXFxcXCguKj9cXFxcKSk/Wzt7XVwiLHI6NX0se2NOOlwib3BlcmF0b3JcIixiOlwiLVxcXFx3XFxcXGJcIixyOjB9LHtiOlwiXl9fREFUQV9fJFwiLGU6XCJeX19FTkRfXyRcIixzTDpcIm1vam9saWNpb3VzXCIsYzpbe2I6XCJeQEAuKlwiLGU6XCIkXCIsY046XCJjb21tZW50XCJ9XX1dO3JldHVybiByLmM9cyxhLmM9cyx7YWxpYXNlczpbXCJwbFwiXSxrOnQsYzpzfX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcInBocFwiLGZ1bmN0aW9uKGUpe3ZhciB0PXtjTjpcInZhcmlhYmxlXCIsYjpcIlxcXFwkK1thLXpBLVpffy3Dv11bYS16QS1aMC05X38tw79dKlwifSxyPXtjTjpcInByZXByb2Nlc3NvclwiLGI6LzxcXD8ocGhwKT98XFw/Pi99LGE9e2NOOlwic3RyaW5nXCIsYzpbZS5CRSxyXSx2Olt7YjonYlwiJyxlOidcIid9LHtiOlwiYidcIixlOlwiJ1wifSxlLmluaGVyaXQoZS5BU00se2k6bnVsbH0pLGUuaW5oZXJpdChlLlFTTSx7aTpudWxsfSldfSxuPXt2OltlLkJOTSxlLkNOTV19O3JldHVybnthbGlhc2VzOltcInBocDNcIixcInBocDRcIixcInBocDVcIixcInBocDZcIl0sY0k6ITAsazpcImFuZCBpbmNsdWRlX29uY2UgbGlzdCBhYnN0cmFjdCBnbG9iYWwgcHJpdmF0ZSBlY2hvIGludGVyZmFjZSBhcyBzdGF0aWMgZW5kc3dpdGNoIGFycmF5IG51bGwgaWYgZW5kd2hpbGUgb3IgY29uc3QgZm9yIGVuZGZvcmVhY2ggc2VsZiB2YXIgd2hpbGUgaXNzZXQgcHVibGljIHByb3RlY3RlZCBleGl0IGZvcmVhY2ggdGhyb3cgZWxzZWlmIGluY2x1ZGUgX19GSUxFX18gZW1wdHkgcmVxdWlyZV9vbmNlIGRvIHhvciByZXR1cm4gcGFyZW50IGNsb25lIHVzZSBfX0NMQVNTX18gX19MSU5FX18gZWxzZSBicmVhayBwcmludCBldmFsIG5ldyBjYXRjaCBfX01FVEhPRF9fIGNhc2UgZXhjZXB0aW9uIGRlZmF1bHQgZGllIHJlcXVpcmUgX19GVU5DVElPTl9fIGVuZGRlY2xhcmUgZmluYWwgdHJ5IHN3aXRjaCBjb250aW51ZSBlbmRmb3IgZW5kaWYgZGVjbGFyZSB1bnNldCB0cnVlIGZhbHNlIHRyYWl0IGdvdG8gaW5zdGFuY2VvZiBpbnN0ZWFkb2YgX19ESVJfXyBfX05BTUVTUEFDRV9fIHlpZWxkIGZpbmFsbHlcIixjOltlLkNMQ00sZS5IQ00sZS5DKFwiL1xcXFwqXCIsXCJcXFxcKi9cIix7Yzpbe2NOOlwiZG9jdGFnXCIsYjpcIkBbQS1aYS16XStcIn0scl19KSxlLkMoXCJfX2hhbHRfY29tcGlsZXIuKz87XCIsITEse2VXOiEwLGs6XCJfX2hhbHRfY29tcGlsZXJcIixsOmUuVUlSfSkse2NOOlwic3RyaW5nXCIsYjovPDw8WydcIl0/XFx3K1snXCJdPyQvLGU6L15cXHcrOz8kLyxjOltlLkJFLHtjTjpcInN1YnN0XCIsdjpbe2I6L1xcJFxcdysvfSx7YjovXFx7XFwkLyxlOi9cXH0vfV19XX0scix0LHtiOi8oOjp8LT4pK1thLXpBLVpfXFx4N2YtXFx4ZmZdW2EtekEtWjAtOV9cXHg3Zi1cXHhmZl0qL30se2NOOlwiZnVuY3Rpb25cIixiSzpcImZ1bmN0aW9uXCIsZTovWzt7XS8sZUU6ITAsaTpcIlxcXFwkfFxcXFxbfCVcIixjOltlLlVUTSx7Y046XCJwYXJhbXNcIixiOlwiXFxcXChcIixlOlwiXFxcXClcIixjOltcInNlbGZcIix0LGUuQ0JDTSxhLG5dfV19LHtjTjpcImNsYXNzXCIsYks6XCJjbGFzcyBpbnRlcmZhY2VcIixlOlwie1wiLGVFOiEwLGk6L1s6XFwoXFwkXCJdLyxjOlt7Yks6XCJleHRlbmRzIGltcGxlbWVudHNcIn0sZS5VVE1dfSx7Yks6XCJuYW1lc3BhY2VcIixlOlwiO1wiLGk6L1tcXC4nXS8sYzpbZS5VVE1dfSx7Yks6XCJ1c2VcIixlOlwiO1wiLGM6W2UuVVRNXX0se2I6XCI9PlwifSxhLG5dfX0pLGUucmVnaXN0ZXJMYW5ndWFnZShcInB5dGhvblwiLGZ1bmN0aW9uKGUpe3ZhciB0PXtjTjpcInByb21wdFwiLGI6L14oPj4+fFxcLlxcLlxcLikgL30scj17Y046XCJzdHJpbmdcIixjOltlLkJFXSx2Olt7YjovKHV8Yik/cj8nJycvLGU6LycnJy8sYzpbdF0scjoxMH0se2I6Lyh1fGIpP3I/XCJcIlwiLyxlOi9cIlwiXCIvLGM6W3RdLHI6MTB9LHtiOi8odXxyfHVyKScvLGU6LycvLHI6MTB9LHtiOi8odXxyfHVyKVwiLyxlOi9cIi8scjoxMH0se2I6LyhifGJyKScvLGU6LycvfSx7YjovKGJ8YnIpXCIvLGU6L1wiL30sZS5BU00sZS5RU01dfSxhPXtjTjpcIm51bWJlclwiLHI6MCx2Olt7YjplLkJOUitcIltsTGpKXT9cIn0se2I6XCJcXFxcYigwb1swLTddKylbbExqSl0/XCJ9LHtiOmUuQ05SK1wiW2xMakpdP1wifV19LG49e2NOOlwicGFyYW1zXCIsYjovXFwoLyxlOi9cXCkvLGM6W1wic2VsZlwiLHQsYSxyXX07cmV0dXJue2FsaWFzZXM6W1wicHlcIixcImd5cFwiXSxrOntrZXl3b3JkOlwiYW5kIGVsaWYgaXMgZ2xvYmFsIGFzIGluIGlmIGZyb20gcmFpc2UgZm9yIGV4Y2VwdCBmaW5hbGx5IHByaW50IGltcG9ydCBwYXNzIHJldHVybiBleGVjIGVsc2UgYnJlYWsgbm90IHdpdGggY2xhc3MgYXNzZXJ0IHlpZWxkIHRyeSB3aGlsZSBjb250aW51ZSBkZWwgb3IgZGVmIGxhbWJkYSBhc3luYyBhd2FpdCBub25sb2NhbHwxMCBOb25lIFRydWUgRmFsc2VcIixidWlsdF9pbjpcIkVsbGlwc2lzIE5vdEltcGxlbWVudGVkXCJ9LGk6Lyg8XFwvfC0+fFxcPykvLGM6W3QsYSxyLGUuSENNLHt2Olt7Y046XCJmdW5jdGlvblwiLGJLOlwiZGVmXCIscjoxMH0se2NOOlwiY2xhc3NcIixiSzpcImNsYXNzXCJ9XSxlOi86LyxpOi9bJHs9O1xcbixdLyxjOltlLlVUTSxuXX0se2NOOlwiZGVjb3JhdG9yXCIsYjovXltcXHQgXSpALyxlOi8kL30se2I6L1xcYihwcmludHxleGVjKVxcKC99XX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJydWJ5XCIsZnVuY3Rpb24oZSl7dmFyIHQ9XCJbYS16QS1aX11cXFxcdypbIT89XT98Wy0rfl1cXFxcQHw8PHw+Pnw9fnw9PT0/fDw9PnxbPD5dPT98XFxcXCpcXFxcKnxbLS8rJV4mKn5gfF18XFxcXFtcXFxcXT0/XCIscj1cImFuZCBmYWxzZSB0aGVuIGRlZmluZWQgbW9kdWxlIGluIHJldHVybiByZWRvIGlmIEJFR0lOIHJldHJ5IGVuZCBmb3IgdHJ1ZSBzZWxmIHdoZW4gbmV4dCB1bnRpbCBkbyBiZWdpbiB1bmxlc3MgRU5EIHJlc2N1ZSBuaWwgZWxzZSBicmVhayB1bmRlZiBub3Qgc3VwZXIgY2xhc3MgY2FzZSByZXF1aXJlIHlpZWxkIGFsaWFzIHdoaWxlIGVuc3VyZSBlbHNpZiBvciBpbmNsdWRlIGF0dHJfcmVhZGVyIGF0dHJfd3JpdGVyIGF0dHJfYWNjZXNzb3JcIixhPXtjTjpcImRvY3RhZ1wiLGI6XCJAW0EtWmEtel0rXCJ9LG49e2NOOlwidmFsdWVcIixiOlwiIzxcIixlOlwiPlwifSxpPVtlLkMoXCIjXCIsXCIkXCIse2M6W2FdfSksZS5DKFwiXlxcXFw9YmVnaW5cIixcIl5cXFxcPWVuZFwiLHtjOlthXSxyOjEwfSksZS5DKFwiXl9fRU5EX19cIixcIlxcXFxuJFwiKV0scz17Y046XCJzdWJzdFwiLGI6XCIjXFxcXHtcIixlOlwifVwiLGs6cn0sYz17Y046XCJzdHJpbmdcIixjOltlLkJFLHNdLHY6W3tiOi8nLyxlOi8nL30se2I6L1wiLyxlOi9cIi99LHtiOi9gLyxlOi9gL30se2I6XCIlW3FRd1d4XT9cXFxcKFwiLGU6XCJcXFxcKVwifSx7YjpcIiVbcVF3V3hdP1xcXFxbXCIsZTpcIlxcXFxdXCJ9LHtiOlwiJVtxUXdXeF0/e1wiLGU6XCJ9XCJ9LHtiOlwiJVtxUXdXeF0/PFwiLGU6XCI+XCJ9LHtiOlwiJVtxUXdXeF0/L1wiLGU6XCIvXCJ9LHtiOlwiJVtxUXdXeF0/JVwiLGU6XCIlXCJ9LHtiOlwiJVtxUXdXeF0/LVwiLGU6XCItXCJ9LHtiOlwiJVtxUXdXeF0/XFxcXHxcIixlOlwiXFxcXHxcIn0se2I6L1xcQlxcPyhcXFxcXFxkezEsM318XFxcXHhbQS1GYS1mMC05XXsxLDJ9fFxcXFx1W0EtRmEtZjAtOV17NH18XFxcXD9cXFMpXFxiL31dfSxvPXtjTjpcInBhcmFtc1wiLGI6XCJcXFxcKFwiLGU6XCJcXFxcKVwiLGs6cn0sbD1bYyxuLHtjTjpcImNsYXNzXCIsYks6XCJjbGFzcyBtb2R1bGVcIixlOlwiJHw7XCIsaTovPS8sYzpbZS5pbmhlcml0KGUuVE0se2I6XCJbQS1aYS16X11cXFxcdyooOjpcXFxcdyspKihcXFxcP3xcXFxcISk/XCJ9KSx7Y046XCJpbmhlcml0YW5jZVwiLGI6XCI8XFxcXHMqXCIsYzpbe2NOOlwicGFyZW50XCIsYjpcIihcIitlLklSK1wiOjopP1wiK2UuSVJ9XX1dLmNvbmNhdChpKX0se2NOOlwiZnVuY3Rpb25cIixiSzpcImRlZlwiLGU6XCIkfDtcIixjOltlLmluaGVyaXQoZS5UTSx7Yjp0fSksb10uY29uY2F0KGkpfSx7Y046XCJjb25zdGFudFwiLGI6XCIoOjopPyhcXFxcYltBLVpdXFxcXHcqKDo6KT8pK1wiLHI6MH0se2NOOlwic3ltYm9sXCIsYjplLlVJUitcIihcXFxcIXxcXFxcPyk/OlwiLHI6MH0se2NOOlwic3ltYm9sXCIsYjpcIjpcIixjOltjLHtiOnR9XSxyOjB9LHtjTjpcIm51bWJlclwiLGI6XCIoXFxcXGIwWzAtN19dKyl8KFxcXFxiMHhbMC05YS1mQS1GX10rKXwoXFxcXGJbMS05XVswLTlfXSooXFxcXC5bMC05X10rKT8pfFswX11cXFxcYlwiLHI6MH0se2NOOlwidmFyaWFibGVcIixiOlwiKFxcXFwkXFxcXFcpfCgoXFxcXCR8XFxcXEBcXFxcQD8pKFxcXFx3KykpXCJ9LHtiOlwiKFwiK2UuUlNSK1wiKVxcXFxzKlwiLGM6W24se2NOOlwicmVnZXhwXCIsYzpbZS5CRSxzXSxpOi9cXG4vLHY6W3tiOlwiL1wiLGU6XCIvW2Etel0qXCJ9LHtiOlwiJXJ7XCIsZTpcIn1bYS16XSpcIn0se2I6XCIlclxcXFwoXCIsZTpcIlxcXFwpW2Etel0qXCJ9LHtiOlwiJXIhXCIsZTpcIiFbYS16XSpcIn0se2I6XCIlclxcXFxbXCIsZTpcIlxcXFxdW2Etel0qXCJ9XX1dLmNvbmNhdChpKSxyOjB9XS5jb25jYXQoaSk7cy5jPWwsby5jPWw7dmFyIHU9XCJbPj9dPlwiLGQ9XCJbXFxcXHcjXStcXFxcKFxcXFx3K1xcXFwpOlxcXFxkKzpcXFxcZCs+XCIsYj1cIihcXFxcdystKT9cXFxcZCtcXFxcLlxcXFxkK1xcXFwuXFxcXGQocFxcXFxkKyk/W14+XSs+XCIscD1be2I6L15cXHMqPT4vLGNOOlwic3RhdHVzXCIsc3RhcnRzOntlOlwiJFwiLGM6bH19LHtjTjpcInByb21wdFwiLGI6XCJeKFwiK3UrXCJ8XCIrZCtcInxcIitiK1wiKVwiLHN0YXJ0czp7ZTpcIiRcIixjOmx9fV07cmV0dXJue2FsaWFzZXM6W1wicmJcIixcImdlbXNwZWNcIixcInBvZHNwZWNcIixcInRob3JcIixcImlyYlwiXSxrOnIsaTovXFwvXFwqLyxjOmkuY29uY2F0KHApLmNvbmNhdChsKX19KSxlLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJzcWxcIixmdW5jdGlvbihlKXt2YXIgdD1lLkMoXCItLVwiLFwiJFwiKTtyZXR1cm57Y0k6ITAsaTovWzw+e30qXS8sYzpbe2NOOlwib3BlcmF0b3JcIixiSzpcImJlZ2luIGVuZCBzdGFydCBjb21taXQgcm9sbGJhY2sgc2F2ZXBvaW50IGxvY2sgYWx0ZXIgY3JlYXRlIGRyb3AgcmVuYW1lIGNhbGwgZGVsZXRlIGRvIGhhbmRsZXIgaW5zZXJ0IGxvYWQgcmVwbGFjZSBzZWxlY3QgdHJ1bmNhdGUgdXBkYXRlIHNldCBzaG93IHByYWdtYSBncmFudCBtZXJnZSBkZXNjcmliZSB1c2UgZXhwbGFpbiBoZWxwIGRlY2xhcmUgcHJlcGFyZSBleGVjdXRlIGRlYWxsb2NhdGUgcmVsZWFzZSB1bmxvY2sgcHVyZ2UgcmVzZXQgY2hhbmdlIHN0b3AgYW5hbHl6ZSBjYWNoZSBmbHVzaCBvcHRpbWl6ZSByZXBhaXIga2lsbCBpbnN0YWxsIHVuaW5zdGFsbCBjaGVja3N1bSByZXN0b3JlIGNoZWNrIGJhY2t1cCByZXZva2VcIixlOi87LyxlVzohMCxrOntrZXl3b3JkOlwiYWJvcnQgYWJzIGFic29sdXRlIGFjYyBhY2NlIGFjY2VwIGFjY2VwdCBhY2Nlc3MgYWNjZXNzZWQgYWNjZXNzaWJsZSBhY2NvdW50IGFjb3MgYWN0aW9uIGFjdGl2YXRlIGFkZCBhZGR0aW1lIGFkbWluIGFkbWluaXN0ZXIgYWR2YW5jZWQgYWR2aXNlIGFlc19kZWNyeXB0IGFlc19lbmNyeXB0IGFmdGVyIGFnZW50IGFnZ3JlZ2F0ZSBhbGkgYWxpYSBhbGlhcyBhbGxvY2F0ZSBhbGxvdyBhbHRlciBhbHdheXMgYW5hbHl6ZSBhbmNpbGxhcnkgYW5kIGFueSBhbnlkYXRhIGFueWRhdGFzZXQgYW55c2NoZW1hIGFueXR5cGUgYXBwbHkgYXJjaGl2ZSBhcmNoaXZlZCBhcmNoaXZlbG9nIGFyZSBhcyBhc2MgYXNjaWkgYXNpbiBhc3NlbWJseSBhc3NlcnRpb24gYXNzb2NpYXRlIGFzeW5jaHJvbm91cyBhdCBhdGFuIGF0bjIgYXR0ciBhdHRyaSBhdHRyaWIgYXR0cmlidSBhdHRyaWJ1dCBhdHRyaWJ1dGUgYXR0cmlidXRlcyBhdWRpdCBhdXRoZW50aWNhdGVkIGF1dGhlbnRpY2F0aW9uIGF1dGhpZCBhdXRob3JzIGF1dG8gYXV0b2FsbG9jYXRlIGF1dG9kYmxpbmsgYXV0b2V4dGVuZCBhdXRvbWF0aWMgYXZhaWxhYmlsaXR5IGF2ZyBiYWNrdXAgYmFkZmlsZSBiYXNpY2ZpbGUgYmVmb3JlIGJlZ2luIGJlZ2lubmluZyBiZW5jaG1hcmsgYmV0d2VlbiBiZmlsZSBiZmlsZV9iYXNlIGJpZyBiaWdmaWxlIGJpbiBiaW5hcnlfZG91YmxlIGJpbmFyeV9mbG9hdCBiaW5sb2cgYml0X2FuZCBiaXRfY291bnQgYml0X2xlbmd0aCBiaXRfb3IgYml0X3hvciBiaXRtYXAgYmxvYl9iYXNlIGJsb2NrIGJsb2Nrc2l6ZSBib2R5IGJvdGggYm91bmQgYnVmZmVyX2NhY2hlIGJ1ZmZlcl9wb29sIGJ1aWxkIGJ1bGsgYnkgYnl0ZSBieXRlb3JkZXJtYXJrIGJ5dGVzIGMgY2FjaGUgY2FjaGluZyBjYWxsIGNhbGxpbmcgY2FuY2VsIGNhcGFjaXR5IGNhc2NhZGUgY2FzY2FkZWQgY2FzZSBjYXN0IGNhdGFsb2cgY2F0ZWdvcnkgY2VpbCBjZWlsaW5nIGNoYWluIGNoYW5nZSBjaGFuZ2VkIGNoYXJfYmFzZSBjaGFyX2xlbmd0aCBjaGFyYWN0ZXJfbGVuZ3RoIGNoYXJhY3RlcnMgY2hhcmFjdGVyc2V0IGNoYXJpbmRleCBjaGFyc2V0IGNoYXJzZXRmb3JtIGNoYXJzZXRpZCBjaGVjayBjaGVja3N1bSBjaGVja3N1bV9hZ2cgY2hpbGQgY2hvb3NlIGNociBjaHVuayBjbGFzcyBjbGVhbnVwIGNsZWFyIGNsaWVudCBjbG9iIGNsb2JfYmFzZSBjbG9uZSBjbG9zZSBjbHVzdGVyX2lkIGNsdXN0ZXJfcHJvYmFiaWxpdHkgY2x1c3Rlcl9zZXQgY2x1c3RlcmluZyBjb2FsZXNjZSBjb2VyY2liaWxpdHkgY29sIGNvbGxhdGUgY29sbGF0aW9uIGNvbGxlY3QgY29sdSBjb2x1bSBjb2x1bW4gY29sdW1uX3ZhbHVlIGNvbHVtbnMgY29sdW1uc191cGRhdGVkIGNvbW1lbnQgY29tbWl0IGNvbXBhY3QgY29tcGF0aWJpbGl0eSBjb21waWxlZCBjb21wbGV0ZSBjb21wb3NpdGVfbGltaXQgY29tcG91bmQgY29tcHJlc3MgY29tcHV0ZSBjb25jYXQgY29uY2F0X3dzIGNvbmN1cnJlbnQgY29uZmlybSBjb25uIGNvbm5lYyBjb25uZWN0IGNvbm5lY3RfYnlfaXNjeWNsZSBjb25uZWN0X2J5X2lzbGVhZiBjb25uZWN0X2J5X3Jvb3QgY29ubmVjdF90aW1lIGNvbm5lY3Rpb24gY29uc2lkZXIgY29uc2lzdGVudCBjb25zdGFudCBjb25zdHJhaW50IGNvbnN0cmFpbnRzIGNvbnN0cnVjdG9yIGNvbnRhaW5lciBjb250ZW50IGNvbnRlbnRzIGNvbnRleHQgY29udHJpYnV0b3JzIGNvbnRyb2xmaWxlIGNvbnYgY29udmVydCBjb252ZXJ0X3R6IGNvcnIgY29ycl9rIGNvcnJfcyBjb3JyZXNwb25kaW5nIGNvcnJ1cHRpb24gY29zIGNvc3QgY291bnQgY291bnRfYmlnIGNvdW50ZWQgY292YXJfcG9wIGNvdmFyX3NhbXAgY3B1X3Blcl9jYWxsIGNwdV9wZXJfc2Vzc2lvbiBjcmMzMiBjcmVhdGUgY3JlYXRpb24gY3JpdGljYWwgY3Jvc3MgY3ViZSBjdW1lX2Rpc3QgY3VyZGF0ZSBjdXJyZW50IGN1cnJlbnRfZGF0ZSBjdXJyZW50X3RpbWUgY3VycmVudF90aW1lc3RhbXAgY3VycmVudF91c2VyIGN1cnNvciBjdXJ0aW1lIGN1c3RvbWRhdHVtIGN5Y2xlIGQgZGF0YSBkYXRhYmFzZSBkYXRhYmFzZXMgZGF0YWZpbGUgZGF0YWZpbGVzIGRhdGFsZW5ndGggZGF0ZV9hZGQgZGF0ZV9jYWNoZSBkYXRlX2Zvcm1hdCBkYXRlX3N1YiBkYXRlYWRkIGRhdGVkaWZmIGRhdGVmcm9tcGFydHMgZGF0ZW5hbWUgZGF0ZXBhcnQgZGF0ZXRpbWUyZnJvbXBhcnRzIGRheSBkYXlfdG9fc2Vjb25kIGRheW5hbWUgZGF5b2Ztb250aCBkYXlvZndlZWsgZGF5b2Z5ZWFyIGRheXMgZGJfcm9sZV9jaGFuZ2UgZGJ0aW1lem9uZSBkZGwgZGVhbGxvY2F0ZSBkZWNsYXJlIGRlY29kZSBkZWNvbXBvc2UgZGVjcmVtZW50IGRlY3J5cHQgZGVkdXBsaWNhdGUgZGVmIGRlZmEgZGVmYXUgZGVmYXVsIGRlZmF1bHQgZGVmYXVsdHMgZGVmZXJyZWQgZGVmaSBkZWZpbiBkZWZpbmUgZGVncmVlcyBkZWxheWVkIGRlbGVnYXRlIGRlbGV0ZSBkZWxldGVfYWxsIGRlbGltaXRlZCBkZW1hbmQgZGVuc2VfcmFuayBkZXB0aCBkZXF1ZXVlIGRlc19kZWNyeXB0IGRlc19lbmNyeXB0IGRlc19rZXlfZmlsZSBkZXNjIGRlc2NyIGRlc2NyaSBkZXNjcmliIGRlc2NyaWJlIGRlc2NyaXB0b3IgZGV0ZXJtaW5pc3RpYyBkaWFnbm9zdGljcyBkaWZmZXJlbmNlIGRpbWVuc2lvbiBkaXJlY3RfbG9hZCBkaXJlY3RvcnkgZGlzYWJsZSBkaXNhYmxlX2FsbCBkaXNhbGxvdyBkaXNhc3NvY2lhdGUgZGlzY2FyZGZpbGUgZGlzY29ubmVjdCBkaXNrZ3JvdXAgZGlzdGluY3QgZGlzdGluY3Ryb3cgZGlzdHJpYnV0ZSBkaXN0cmlidXRlZCBkaXYgZG8gZG9jdW1lbnQgZG9tYWluIGRvdG5ldCBkb3VibGUgZG93bmdyYWRlIGRyb3AgZHVtcGZpbGUgZHVwbGljYXRlIGR1cmF0aW9uIGUgZWFjaCBlZGl0aW9uIGVkaXRpb25hYmxlIGVkaXRpb25zIGVsZW1lbnQgZWxsaXBzaXMgZWxzZSBlbHNpZiBlbHQgZW1wdHkgZW5hYmxlIGVuYWJsZV9hbGwgZW5jbG9zZWQgZW5jb2RlIGVuY29kaW5nIGVuY3J5cHQgZW5kIGVuZC1leGVjIGVuZGlhbiBlbmZvcmNlZCBlbmdpbmUgZW5naW5lcyBlbnF1ZXVlIGVudGVycHJpc2UgZW50aXR5ZXNjYXBpbmcgZW9tb250aCBlcnJvciBlcnJvcnMgZXNjYXBlZCBldmFsbmFtZSBldmFsdWF0ZSBldmVudCBldmVudGRhdGEgZXZlbnRzIGV4Y2VwdCBleGNlcHRpb24gZXhjZXB0aW9ucyBleGNoYW5nZSBleGNsdWRlIGV4Y2x1ZGluZyBleGVjdSBleGVjdXQgZXhlY3V0ZSBleGVtcHQgZXhpc3RzIGV4aXQgZXhwIGV4cGlyZSBleHBsYWluIGV4cG9ydCBleHBvcnRfc2V0IGV4dGVuZGVkIGV4dGVudCBleHRlcm5hbCBleHRlcm5hbF8xIGV4dGVybmFsXzIgZXh0ZXJuYWxseSBleHRyYWN0IGYgZmFpbGVkIGZhaWxlZF9sb2dpbl9hdHRlbXB0cyBmYWlsb3ZlciBmYWlsdXJlIGZhciBmYXN0IGZlYXR1cmVfc2V0IGZlYXR1cmVfdmFsdWUgZmV0Y2ggZmllbGQgZmllbGRzIGZpbGUgZmlsZV9uYW1lX2NvbnZlcnQgZmlsZXN5c3RlbV9saWtlX2xvZ2dpbmcgZmluYWwgZmluaXNoIGZpcnN0IGZpcnN0X3ZhbHVlIGZpeGVkIGZsYXNoX2NhY2hlIGZsYXNoYmFjayBmbG9vciBmbHVzaCBmb2xsb3dpbmcgZm9sbG93cyBmb3IgZm9yYWxsIGZvcmNlIGZvcm0gZm9ybWEgZm9ybWF0IGZvdW5kIGZvdW5kX3Jvd3MgZnJlZWxpc3QgZnJlZWxpc3RzIGZyZWVwb29scyBmcmVzaCBmcm9tIGZyb21fYmFzZTY0IGZyb21fZGF5cyBmdHAgZnVsbCBmdW5jdGlvbiBnIGdlbmVyYWwgZ2VuZXJhdGVkIGdldCBnZXRfZm9ybWF0IGdldF9sb2NrIGdldGRhdGUgZ2V0dXRjZGF0ZSBnbG9iYWwgZ2xvYmFsX25hbWUgZ2xvYmFsbHkgZ28gZ290byBncmFudCBncmFudHMgZ3JlYXRlc3QgZ3JvdXAgZ3JvdXBfY29uY2F0IGdyb3VwX2lkIGdyb3VwaW5nIGdyb3VwaW5nX2lkIGdyb3VwcyBndGlkX3N1YnRyYWN0IGd1YXJhbnRlZSBndWFyZCBoYW5kbGVyIGhhc2ggaGFzaGtleXMgaGF2aW5nIGhlYSBoZWFkIGhlYWRpIGhlYWRpbiBoZWFkaW5nIGhlYXAgaGVscCBoZXggaGllcmFyY2h5IGhpZ2ggaGlnaF9wcmlvcml0eSBob3N0cyBob3VyIGh0dHAgaSBpZCBpZGVudF9jdXJyZW50IGlkZW50X2luY3IgaWRlbnRfc2VlZCBpZGVudGlmaWVkIGlkZW50aXR5IGlkbGVfdGltZSBpZiBpZm51bGwgaWdub3JlIGlpZiBpbGlrZSBpbG0gaW1tZWRpYXRlIGltcG9ydCBpbiBpbmNsdWRlIGluY2x1ZGluZyBpbmNyZW1lbnQgaW5kZXggaW5kZXhlcyBpbmRleGluZyBpbmRleHR5cGUgaW5kaWNhdG9yIGluZGljZXMgaW5ldDZfYXRvbiBpbmV0Nl9udG9hIGluZXRfYXRvbiBpbmV0X250b2EgaW5maWxlIGluaXRpYWwgaW5pdGlhbGl6ZWQgaW5pdGlhbGx5IGluaXRyYW5zIGlubWVtb3J5IGlubmVyIGlubm9kYiBpbnB1dCBpbnNlcnQgaW5zdGFsbCBpbnN0YW5jZSBpbnN0YW50aWFibGUgaW5zdHIgaW50ZXJmYWNlIGludGVybGVhdmVkIGludGVyc2VjdCBpbnRvIGludmFsaWRhdGUgaW52aXNpYmxlIGlzIGlzX2ZyZWVfbG9jayBpc19pcHY0IGlzX2lwdjRfY29tcGF0IGlzX25vdCBpc19ub3RfbnVsbCBpc191c2VkX2xvY2sgaXNkYXRlIGlzbnVsbCBpc29sYXRpb24gaXRlcmF0ZSBqYXZhIGpvaW4ganNvbiBqc29uX2V4aXN0cyBrIGtlZXAga2VlcF9kdXBsaWNhdGVzIGtleSBrZXlzIGtpbGwgbCBsYW5ndWFnZSBsYXJnZSBsYXN0IGxhc3RfZGF5IGxhc3RfaW5zZXJ0X2lkIGxhc3RfdmFsdWUgbGF4IGxjYXNlIGxlYWQgbGVhZGluZyBsZWFzdCBsZWF2ZXMgbGVmdCBsZW4gbGVuZ2h0IGxlbmd0aCBsZXNzIGxldmVsIGxldmVscyBsaWJyYXJ5IGxpa2UgbGlrZTIgbGlrZTQgbGlrZWMgbGltaXQgbGluZXMgbGluayBsaXN0IGxpc3RhZ2cgbGl0dGxlIGxuIGxvYWQgbG9hZF9maWxlIGxvYiBsb2JzIGxvY2FsIGxvY2FsdGltZSBsb2NhbHRpbWVzdGFtcCBsb2NhdGUgbG9jYXRvciBsb2NrIGxvY2tlZCBsb2cgbG9nMTAgbG9nMiBsb2dmaWxlIGxvZ2ZpbGVzIGxvZ2dpbmcgbG9naWNhbCBsb2dpY2FsX3JlYWRzX3Blcl9jYWxsIGxvZ29mZiBsb2dvbiBsb2dzIGxvbmcgbG9vcCBsb3cgbG93X3ByaW9yaXR5IGxvd2VyIGxwYWQgbHJ0cmltIGx0cmltIG0gbWFpbiBtYWtlX3NldCBtYWtlZGF0ZSBtYWtldGltZSBtYW5hZ2VkIG1hbmFnZW1lbnQgbWFudWFsIG1hcCBtYXBwaW5nIG1hc2sgbWFzdGVyIG1hc3Rlcl9wb3Nfd2FpdCBtYXRjaCBtYXRjaGVkIG1hdGVyaWFsaXplZCBtYXggbWF4ZXh0ZW50cyBtYXhpbWl6ZSBtYXhpbnN0YW5jZXMgbWF4bGVuIG1heGxvZ2ZpbGVzIG1heGxvZ2hpc3RvcnkgbWF4bG9nbWVtYmVycyBtYXhzaXplIG1heHRyYW5zIG1kNSBtZWFzdXJlcyBtZWRpYW4gbWVkaXVtIG1lbWJlciBtZW1jb21wcmVzcyBtZW1vcnkgbWVyZ2UgbWljcm9zZWNvbmQgbWlkIG1pZ3JhdGlvbiBtaW4gbWluZXh0ZW50cyBtaW5pbXVtIG1pbmluZyBtaW51cyBtaW51dGUgbWludmFsdWUgbWlzc2luZyBtb2QgbW9kZSBtb2RlbCBtb2RpZmljYXRpb24gbW9kaWZ5IG1vZHVsZSBtb25pdG9yaW5nIG1vbnRoIG1vbnRocyBtb3VudCBtb3ZlIG1vdmVtZW50IG11bHRpc2V0IG11dGV4IG4gbmFtZSBuYW1lX2NvbnN0IG5hbWVzIG5hbiBuYXRpb25hbCBuYXRpdmUgbmF0dXJhbCBuYXYgbmNoYXIgbmNsb2IgbmVzdGVkIG5ldmVyIG5ldyBuZXdsaW5lIG5leHQgbmV4dHZhbCBubyBub193cml0ZV90b19iaW5sb2cgbm9hcmNoaXZlbG9nIG5vYXVkaXQgbm9iYWRmaWxlIG5vY2hlY2sgbm9jb21wcmVzcyBub2NvcHkgbm9jeWNsZSBub2RlbGF5IG5vZGlzY2FyZGZpbGUgbm9lbnRpdHllc2NhcGluZyBub2d1YXJhbnRlZSBub2tlZXAgbm9sb2dmaWxlIG5vbWFwcGluZyBub21heHZhbHVlIG5vbWluaW1pemUgbm9taW52YWx1ZSBub21vbml0b3Jpbmcgbm9uZSBub25lZGl0aW9uYWJsZSBub25zY2hlbWEgbm9vcmRlciBub3ByIG5vcHJvIG5vcHJvbSBub3Byb21wIG5vcHJvbXB0IG5vcmVseSBub3Jlc2V0bG9ncyBub3JldmVyc2Ugbm9ybWFsIG5vcm93ZGVwZW5kZW5jaWVzIG5vc2NoZW1hY2hlY2sgbm9zd2l0Y2ggbm90IG5vdGhpbmcgbm90aWNlIG5vdHJpbSBub3ZhbGlkYXRlIG5vdyBub3dhaXQgbnRoX3ZhbHVlIG51bGxpZiBudWxscyBudW0gbnVtYiBudW1iZSBudmFyY2hhciBudmFyY2hhcjIgb2JqZWN0IG9jaWNvbGwgb2NpZGF0ZSBvY2lkYXRldGltZSBvY2lkdXJhdGlvbiBvY2lpbnRlcnZhbCBvY2lsb2Jsb2NhdG9yIG9jaW51bWJlciBvY2lyZWYgb2NpcmVmY3Vyc29yIG9jaXJvd2lkIG9jaXN0cmluZyBvY2l0eXBlIG9jdCBvY3RldF9sZW5ndGggb2Ygb2ZmIG9mZmxpbmUgb2Zmc2V0IG9pZCBvaWRpbmRleCBvbGQgb24gb25saW5lIG9ubHkgb3BhcXVlIG9wZW4gb3BlcmF0aW9ucyBvcGVyYXRvciBvcHRpbWFsIG9wdGltaXplIG9wdGlvbiBvcHRpb25hbGx5IG9yIG9yYWNsZSBvcmFjbGVfZGF0ZSBvcmFkYXRhIG9yZCBvcmRhdWRpbyBvcmRkaWNvbSBvcmRkb2Mgb3JkZXIgb3JkaW1hZ2Ugb3JkaW5hbGl0eSBvcmR2aWRlbyBvcmdhbml6YXRpb24gb3JsYW55IG9ybHZhcnkgb3V0IG91dGVyIG91dGZpbGUgb3V0bGluZSBvdXRwdXQgb3ZlciBvdmVyZmxvdyBvdmVycmlkaW5nIHAgcGFja2FnZSBwYWQgcGFyYWxsZWwgcGFyYWxsZWxfZW5hYmxlIHBhcmFtZXRlcnMgcGFyZW50IHBhcnNlIHBhcnRpYWwgcGFydGl0aW9uIHBhcnRpdGlvbnMgcGFzY2FsIHBhc3NpbmcgcGFzc3dvcmQgcGFzc3dvcmRfZ3JhY2VfdGltZSBwYXNzd29yZF9sb2NrX3RpbWUgcGFzc3dvcmRfcmV1c2VfbWF4IHBhc3N3b3JkX3JldXNlX3RpbWUgcGFzc3dvcmRfdmVyaWZ5X2Z1bmN0aW9uIHBhdGNoIHBhdGggcGF0aW5kZXggcGN0aW5jcmVhc2UgcGN0dGhyZXNob2xkIHBjdHVzZWQgcGN0dmVyc2lvbiBwZXJjZW50IHBlcmNlbnRfcmFuayBwZXJjZW50aWxlX2NvbnQgcGVyY2VudGlsZV9kaXNjIHBlcmZvcm1hbmNlIHBlcmlvZCBwZXJpb2RfYWRkIHBlcmlvZF9kaWZmIHBlcm1hbmVudCBwaHlzaWNhbCBwaSBwaXBlIHBpcGVsaW5lZCBwaXZvdCBwbHVnZ2FibGUgcGx1Z2luIHBvbGljeSBwb3NpdGlvbiBwb3N0X3RyYW5zYWN0aW9uIHBvdyBwb3dlciBwcmFnbWEgcHJlYnVpbHQgcHJlY2VkZXMgcHJlY2VkaW5nIHByZWNpc2lvbiBwcmVkaWN0aW9uIHByZWRpY3Rpb25fY29zdCBwcmVkaWN0aW9uX2RldGFpbHMgcHJlZGljdGlvbl9wcm9iYWJpbGl0eSBwcmVkaWN0aW9uX3NldCBwcmVwYXJlIHByZXNlbnQgcHJlc2VydmUgcHJpb3IgcHJpb3JpdHkgcHJpdmF0ZSBwcml2YXRlX3NnYSBwcml2aWxlZ2VzIHByb2NlZHVyYWwgcHJvY2VkdXJlIHByb2NlZHVyZV9hbmFseXplIHByb2Nlc3NsaXN0IHByb2ZpbGVzIHByb2plY3QgcHJvbXB0IHByb3RlY3Rpb24gcHVibGljIHB1Ymxpc2hpbmdzZXJ2ZXJuYW1lIHB1cmdlIHF1YXJ0ZXIgcXVlcnkgcXVpY2sgcXVpZXNjZSBxdW90YSBxdW90ZW5hbWUgcmFkaWFucyByYWlzZSByYW5kIHJhbmdlIHJhbmsgcmF3IHJlYWQgcmVhZHMgcmVhZHNpemUgcmVidWlsZCByZWNvcmQgcmVjb3JkcyByZWNvdmVyIHJlY292ZXJ5IHJlY3Vyc2l2ZSByZWN5Y2xlIHJlZG8gcmVkdWNlZCByZWYgcmVmZXJlbmNlIHJlZmVyZW5jZWQgcmVmZXJlbmNlcyByZWZlcmVuY2luZyByZWZyZXNoIHJlZ2V4cF9saWtlIHJlZ2lzdGVyIHJlZ3JfYXZneCByZWdyX2F2Z3kgcmVncl9jb3VudCByZWdyX2ludGVyY2VwdCByZWdyX3IyIHJlZ3Jfc2xvcGUgcmVncl9zeHggcmVncl9zeHkgcmVqZWN0IHJla2V5IHJlbGF0aW9uYWwgcmVsYXRpdmUgcmVsYXlsb2cgcmVsZWFzZSByZWxlYXNlX2xvY2sgcmVsaWVzX29uIHJlbG9jYXRlIHJlbHkgcmVtIHJlbWFpbmRlciByZW5hbWUgcmVwYWlyIHJlcGVhdCByZXBsYWNlIHJlcGxpY2F0ZSByZXBsaWNhdGlvbiByZXF1aXJlZCByZXNldCByZXNldGxvZ3MgcmVzaXplIHJlc291cmNlIHJlc3BlY3QgcmVzdG9yZSByZXN0cmljdGVkIHJlc3VsdCByZXN1bHRfY2FjaGUgcmVzdW1hYmxlIHJlc3VtZSByZXRlbnRpb24gcmV0dXJuIHJldHVybmluZyByZXR1cm5zIHJldXNlIHJldmVyc2UgcmV2b2tlIHJpZ2h0IHJsaWtlIHJvbGUgcm9sZXMgcm9sbGJhY2sgcm9sbGluZyByb2xsdXAgcm91bmQgcm93IHJvd19jb3VudCByb3dkZXBlbmRlbmNpZXMgcm93aWQgcm93bnVtIHJvd3MgcnRyaW0gcnVsZXMgc2FmZSBzYWx0IHNhbXBsZSBzYXZlIHNhdmVwb2ludCBzYjEgc2IyIHNiNCBzY2FuIHNjaGVtYSBzY2hlbWFjaGVjayBzY24gc2NvcGUgc2Nyb2xsIHNkb19nZW9yYXN0ZXIgc2RvX3RvcG9fZ2VvbWV0cnkgc2VhcmNoIHNlY190b190aW1lIHNlY29uZCBzZWN0aW9uIHNlY3VyZWZpbGUgc2VjdXJpdHkgc2VlZCBzZWdtZW50IHNlbGVjdCBzZWxmIHNlcXVlbmNlIHNlcXVlbnRpYWwgc2VyaWFsaXphYmxlIHNlcnZlciBzZXJ2ZXJlcnJvciBzZXNzaW9uIHNlc3Npb25fdXNlciBzZXNzaW9uc19wZXJfdXNlciBzZXQgc2V0cyBzZXR0aW5ncyBzaGEgc2hhMSBzaGEyIHNoYXJlIHNoYXJlZCBzaGFyZWRfcG9vbCBzaG9ydCBzaG93IHNocmluayBzaHV0ZG93biBzaV9hdmVyYWdlY29sb3Igc2lfY29sb3JoaXN0b2dyYW0gc2lfZmVhdHVyZWxpc3Qgc2lfcG9zaXRpb25hbGNvbG9yIHNpX3N0aWxsaW1hZ2Ugc2lfdGV4dHVyZSBzaWJsaW5ncyBzaWQgc2lnbiBzaW4gc2l6ZSBzaXplX3Qgc2l6ZXMgc2tpcCBzbGF2ZSBzbGVlcCBzbWFsbGRhdGV0aW1lZnJvbXBhcnRzIHNtYWxsZmlsZSBzbmFwc2hvdCBzb21lIHNvbmFtZSBzb3J0IHNvdW5kZXggc291cmNlIHNwYWNlIHNwYXJzZSBzcGZpbGUgc3BsaXQgc3FsIHNxbF9iaWdfcmVzdWx0IHNxbF9idWZmZXJfcmVzdWx0IHNxbF9jYWNoZSBzcWxfY2FsY19mb3VuZF9yb3dzIHNxbF9zbWFsbF9yZXN1bHQgc3FsX3ZhcmlhbnRfcHJvcGVydHkgc3FsY29kZSBzcWxkYXRhIHNxbGVycm9yIHNxbG5hbWUgc3Fsc3RhdGUgc3FydCBzcXVhcmUgc3RhbmRhbG9uZSBzdGFuZGJ5IHN0YXJ0IHN0YXJ0aW5nIHN0YXJ0dXAgc3RhdGVtZW50IHN0YXRpYyBzdGF0aXN0aWNzIHN0YXRzX2Jpbm9taWFsX3Rlc3Qgc3RhdHNfY3Jvc3N0YWIgc3RhdHNfa3NfdGVzdCBzdGF0c19tb2RlIHN0YXRzX213X3Rlc3Qgc3RhdHNfb25lX3dheV9hbm92YSBzdGF0c190X3Rlc3RfIHN0YXRzX3RfdGVzdF9pbmRlcCBzdGF0c190X3Rlc3Rfb25lIHN0YXRzX3RfdGVzdF9wYWlyZWQgc3RhdHNfd3NyX3Rlc3Qgc3RhdHVzIHN0ZCBzdGRkZXYgc3RkZGV2X3BvcCBzdGRkZXZfc2FtcCBzdGRldiBzdG9wIHN0b3JhZ2Ugc3RvcmUgc3RvcmVkIHN0ciBzdHJfdG9fZGF0ZSBzdHJhaWdodF9qb2luIHN0cmNtcCBzdHJpY3Qgc3RyaW5nIHN0cnVjdCBzdHVmZiBzdHlsZSBzdWJkYXRlIHN1YnBhcnRpdGlvbiBzdWJwYXJ0aXRpb25zIHN1YnN0aXR1dGFibGUgc3Vic3RyIHN1YnN0cmluZyBzdWJ0aW1lIHN1YnRyaW5nX2luZGV4IHN1YnR5cGUgc3VjY2VzcyBzdW0gc3VzcGVuZCBzd2l0Y2ggc3dpdGNob2Zmc2V0IHN3aXRjaG92ZXIgc3luYyBzeW5jaHJvbm91cyBzeW5vbnltIHN5cyBzeXNfeG1sYWdnIHN5c2FzbSBzeXNhdXggc3lzZGF0ZSBzeXNkYXRldGltZW9mZnNldCBzeXNkYmEgc3lzb3BlciBzeXN0ZW0gc3lzdGVtX3VzZXIgc3lzdXRjZGF0ZXRpbWUgdCB0YWJsZSB0YWJsZXMgdGFibGVzcGFjZSB0YW4gdGRvIHRlbXBsYXRlIHRlbXBvcmFyeSB0ZXJtaW5hdGVkIHRlcnRpYXJ5X3dlaWdodHMgdGVzdCB0aGFuIHRoZW4gdGhyZWFkIHRocm91Z2ggdGllciB0aWVzIHRpbWUgdGltZV9mb3JtYXQgdGltZV96b25lIHRpbWVkaWZmIHRpbWVmcm9tcGFydHMgdGltZW91dCB0aW1lc3RhbXAgdGltZXN0YW1wYWRkIHRpbWVzdGFtcGRpZmYgdGltZXpvbmVfYWJiciB0aW1lem9uZV9taW51dGUgdGltZXpvbmVfcmVnaW9uIHRvIHRvX2Jhc2U2NCB0b19kYXRlIHRvX2RheXMgdG9fc2Vjb25kcyB0b2RhdGV0aW1lb2Zmc2V0IHRyYWNlIHRyYWNraW5nIHRyYW5zYWN0aW9uIHRyYW5zYWN0aW9uYWwgdHJhbnNsYXRlIHRyYW5zbGF0aW9uIHRyZWF0IHRyaWdnZXIgdHJpZ2dlcl9uZXN0bGV2ZWwgdHJpZ2dlcnMgdHJpbSB0cnVuY2F0ZSB0cnlfY2FzdCB0cnlfY29udmVydCB0cnlfcGFyc2UgdHlwZSB1YjEgdWIyIHViNCB1Y2FzZSB1bmFyY2hpdmVkIHVuYm91bmRlZCB1bmNvbXByZXNzIHVuZGVyIHVuZG8gdW5oZXggdW5pY29kZSB1bmlmb3JtIHVuaW5zdGFsbCB1bmlvbiB1bmlxdWUgdW5peF90aW1lc3RhbXAgdW5rbm93biB1bmxpbWl0ZWQgdW5sb2NrIHVucGl2b3QgdW5yZWNvdmVyYWJsZSB1bnNhZmUgdW5zaWduZWQgdW50aWwgdW50cnVzdGVkIHVudXNhYmxlIHVudXNlZCB1cGRhdGUgdXBkYXRlZCB1cGdyYWRlIHVwcGVkIHVwcGVyIHVwc2VydCB1cmwgdXJvd2lkIHVzYWJsZSB1c2FnZSB1c2UgdXNlX3N0b3JlZF9vdXRsaW5lcyB1c2VyIHVzZXJfZGF0YSB1c2VyX3Jlc291cmNlcyB1c2VycyB1c2luZyB1dGNfZGF0ZSB1dGNfdGltZXN0YW1wIHV1aWQgdXVpZF9zaG9ydCB2YWxpZGF0ZSB2YWxpZGF0ZV9wYXNzd29yZF9zdHJlbmd0aCB2YWxpZGF0aW9uIHZhbGlzdCB2YWx1ZSB2YWx1ZXMgdmFyIHZhcl9zYW1wIHZhcmNoYXJjIHZhcmkgdmFyaWEgdmFyaWFiIHZhcmlhYmwgdmFyaWFibGUgdmFyaWFibGVzIHZhcmlhbmNlIHZhcnAgdmFycmF3IHZhcnJhd2MgdmFycmF5IHZlcmlmeSB2ZXJzaW9uIHZlcnNpb25zIHZpZXcgdmlydHVhbCB2aXNpYmxlIHZvaWQgd2FpdCB3YWxsZXQgd2FybmluZyB3YXJuaW5ncyB3ZWVrIHdlZWtkYXkgd2Vla29meWVhciB3ZWxsZm9ybWVkIHdoZW4gd2hlbmUgd2hlbmV2IHdoZW5ldmUgd2hlbmV2ZXIgd2hlcmUgd2hpbGUgd2hpdGVzcGFjZSB3aXRoIHdpdGhpbiB3aXRob3V0IHdvcmsgd3JhcHBlZCB4ZGIgeG1sIHhtbGFnZyB4bWxhdHRyaWJ1dGVzIHhtbGNhc3QgeG1sY29sYXR0dmFsIHhtbGVsZW1lbnQgeG1sZXhpc3RzIHhtbGZvcmVzdCB4bWxpbmRleCB4bWxuYW1lc3BhY2VzIHhtbHBpIHhtbHF1ZXJ5IHhtbHJvb3QgeG1sc2NoZW1hIHhtbHNlcmlhbGl6ZSB4bWx0YWJsZSB4bWx0eXBlIHhvciB5ZWFyIHllYXJfdG9fbW9udGggeWVhcnMgeWVhcndlZWtcIixcbmxpdGVyYWw6XCJ0cnVlIGZhbHNlIG51bGxcIixidWlsdF9pbjpcImFycmF5IGJpZ2ludCBiaW5hcnkgYml0IGJsb2IgYm9vbGVhbiBjaGFyIGNoYXJhY3RlciBkYXRlIGRlYyBkZWNpbWFsIGZsb2F0IGludCBpbnQ4IGludGVnZXIgaW50ZXJ2YWwgbnVtYmVyIG51bWVyaWMgcmVhbCByZWNvcmQgc2VyaWFsIHNlcmlhbDggc21hbGxpbnQgdGV4dCB2YXJjaGFyIHZhcnlpbmcgdm9pZFwifSxjOlt7Y046XCJzdHJpbmdcIixiOlwiJ1wiLGU6XCInXCIsYzpbZS5CRSx7YjpcIicnXCJ9XX0se2NOOlwic3RyaW5nXCIsYjonXCInLGU6J1wiJyxjOltlLkJFLHtiOidcIlwiJ31dfSx7Y046XCJzdHJpbmdcIixiOlwiYFwiLGU6XCJgXCIsYzpbZS5CRV19LGUuQ05NLGUuQ0JDTSx0XX0sZS5DQkNNLHRdfX0pLGV9KTsiLCIvKiFcbiAqIFZpZXdlciB2MC4xLjFcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9mZW5neXVhbmNoZW4vdmlld2VyXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1IEZlbmd5dWFuIENoZW5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICpcbiAqIERhdGU6IDIwMTUtMTAtMDdUMDY6MzQ6MzEuOTE3WlxuICovXG5cbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICBpZiAoZmFsc2UgJiYgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZSgndmlld2VyJywgWydqcXVlcnknXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAoZmFsc2UgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gTm9kZSAvIENvbW1vbkpTXG4gICAgXG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzLlxuICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgfVxufSkoZnVuY3Rpb24gKCQpIHtcblxuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG4gIHZhciAkZG9jdW1lbnQgPSAkKGRvY3VtZW50KTtcblxuICAvLyBDb25zdGFudHNcbiAgdmFyIE5BTUVTUEFDRSA9ICd2aWV3ZXInO1xuICB2YXIgRUxFTUVOVF9WSUVXRVIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KE5BTUVTUEFDRSk7XG5cbiAgLy8gQ2xhc3Nlc1xuICB2YXIgQ0xBU1NfVE9HR0xFID0gJ3ZpZXdlci10b2dnbGUnO1xuICB2YXIgQ0xBU1NfRklYRUQgPSAndmlld2VyLWZpeGVkJztcbiAgdmFyIENMQVNTX09QRU4gPSAndmlld2VyLW9wZW4nO1xuICB2YXIgQ0xBU1NfU0hPVyA9ICd2aWV3ZXItc2hvdyc7XG4gIHZhciBDTEFTU19ISURFID0gJ3ZpZXdlci1oaWRlJztcbiAgdmFyIENMQVNTX0ZBREUgPSAndmlld2VyLWZhZGUnO1xuICB2YXIgQ0xBU1NfSU4gPSAndmlld2VyLWluJztcbiAgdmFyIENMQVNTX01PVkUgPSAndmlld2VyLW1vdmUnO1xuICB2YXIgQ0xBU1NfQUNUSVZFID0gJ3ZpZXdlci1hY3RpdmUnO1xuICB2YXIgQ0xBU1NfSU5WSVNJQkxFID0gJ3ZpZXdlci1pbnZpc2libGUnO1xuICB2YXIgQ0xBU1NfVFJBTlNJVElPTiA9ICd2aWV3ZXItdHJhbnNpdGlvbic7XG4gIHZhciBDTEFTU19GVUxMU0NSRUVOID0gJ3ZpZXdlci1mdWxsc2NyZWVuJztcbiAgdmFyIENMQVNTX0ZVTExTQ1JFRU5fRVhJVCA9ICd2aWV3ZXItZnVsbHNjcmVlbi1leGl0JztcbiAgdmFyIENMQVNTX0NMT1NFID0gJ3ZpZXdlci1jbG9zZSc7XG5cbiAgLy8gU2VsZWN0b3JzXG4gIHZhciBTRUxFQ1RPUl9JTUcgPSAnaW1nJztcblxuICAvLyBFdmVudHNcbiAgdmFyIEVWRU5UX01PVVNFRE9XTiA9ICdtb3VzZWRvd24gdG91Y2hzdGFydCBwb2ludGVyZG93biBNU1BvaW50ZXJEb3duJztcbiAgdmFyIEVWRU5UX01PVVNFTU9WRSA9ICdtb3VzZW1vdmUgdG91Y2htb3ZlIHBvaW50ZXJtb3ZlIE1TUG9pbnRlck1vdmUnO1xuICB2YXIgRVZFTlRfTU9VU0VVUCA9ICdtb3VzZXVwIHRvdWNoZW5kIHRvdWNoY2FuY2VsIHBvaW50ZXJ1cCBwb2ludGVyY2FuY2VsIE1TUG9pbnRlclVwIE1TUG9pbnRlckNhbmNlbCc7XG4gIHZhciBFVkVOVF9XSEVFTCA9ICd3aGVlbCBtb3VzZXdoZWVsIERPTU1vdXNlU2Nyb2xsJztcbiAgdmFyIEVWRU5UX1RSQU5TSVRJT05FTkQgPSAndHJhbnNpdGlvbmVuZCc7XG4gIHZhciBFVkVOVF9MT0FEID0gJ2xvYWQuJyArIE5BTUVTUEFDRTtcbiAgdmFyIEVWRU5UX0tFWURPV04gPSAna2V5ZG93bi4nICsgTkFNRVNQQUNFO1xuICB2YXIgRVZFTlRfQ0xJQ0sgPSAnY2xpY2suJyArIE5BTUVTUEFDRTtcbiAgdmFyIEVWRU5UX1JFU0laRSA9ICdyZXNpemUuJyArIE5BTUVTUEFDRTtcbiAgdmFyIEVWRU5UX0JVSUxEID0gJ2J1aWxkLicgKyBOQU1FU1BBQ0U7XG4gIHZhciBFVkVOVF9CVUlMVCA9ICdidWlsdC4nICsgTkFNRVNQQUNFO1xuICB2YXIgRVZFTlRfU0hPVyA9ICdzaG93LicgKyBOQU1FU1BBQ0U7XG4gIHZhciBFVkVOVF9TSE9XTiA9ICdzaG93bi4nICsgTkFNRVNQQUNFO1xuICB2YXIgRVZFTlRfSElERSA9ICdoaWRlLicgKyBOQU1FU1BBQ0U7XG4gIHZhciBFVkVOVF9ISURERU4gPSAnaGlkZGVuLicgKyBOQU1FU1BBQ0U7XG4gIHZhciBFVkVOVF9WSUVXID0gJ3ZpZXcuJyArIE5BTUVTUEFDRTtcbiAgdmFyIEVWRU5UX1ZJRVdFRCA9ICd2aWV3ZWQuJyArIE5BTUVTUEFDRTtcblxuICAvLyBTdXBwb3J0c1xuICB2YXIgU1VQUE9SVF9UUkFOU0lUSU9OID0gdHlwZW9mIEVMRU1FTlRfVklFV0VSLnN0eWxlLnRyYW5zaXRpb24gIT09ICd1bmRlZmluZWQnO1xuXG4gIC8vIE90aGVyc1xuICB2YXIgcm91bmQgPSBNYXRoLnJvdW5kO1xuICB2YXIgc3FydCA9IE1hdGguc3FydDtcbiAgdmFyIGFicyA9IE1hdGguYWJzO1xuICB2YXIgbWluID0gTWF0aC5taW47XG4gIHZhciBtYXggPSBNYXRoLm1heDtcbiAgdmFyIG51bSA9IHBhcnNlRmxvYXQ7XG5cbiAgLy8gUHJvdG90eXBlXG4gIHZhciBwcm90b3R5cGUgPSB7fTtcblxuICBmdW5jdGlvbiBpc1N0cmluZyhzKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBzID09PSAnc3RyaW5nJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTnVtYmVyKG4pIHtcbiAgICByZXR1cm4gdHlwZW9mIG4gPT09ICdudW1iZXInICYmICFpc05hTihuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzVW5kZWZpbmVkKHUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHUgPT09ICd1bmRlZmluZWQnO1xuICB9XG5cbiAgZnVuY3Rpb24gdG9BcnJheShvYmosIG9mZnNldCkge1xuICAgIHZhciBhcmdzID0gW107XG5cbiAgICBpZiAoaXNOdW1iZXIob2Zmc2V0KSkgeyAvLyBJdCdzIG5lY2Vzc2FyeSBmb3IgSUU4XG4gICAgICBhcmdzLnB1c2gob2Zmc2V0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJncy5zbGljZS5hcHBseShvYmosIGFyZ3MpO1xuICB9XG5cbiAgLy8gQ3VzdG9tIHByb3h5IHRvIGF2b2lkIGpRdWVyeSdzIGd1aWRcbiAgZnVuY3Rpb24gcHJveHkoZm4sIGNvbnRleHQpIHtcbiAgICB2YXIgYXJncyA9IHRvQXJyYXkoYXJndW1lbnRzLCAyKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJncy5jb25jYXQodG9BcnJheShhcmd1bWVudHMpKSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRyYW5zZm9ybShvcHRpb25zKSB7XG4gICAgdmFyIHRyYW5zZm9ybXMgPSBbXTtcbiAgICB2YXIgcm90YXRlID0gb3B0aW9ucy5yb3RhdGU7XG4gICAgdmFyIHNjYWxlWCA9IG9wdGlvbnMuc2NhbGVYO1xuICAgIHZhciBzY2FsZVkgPSBvcHRpb25zLnNjYWxlWTtcblxuICAgIGlmIChpc051bWJlcihyb3RhdGUpKSB7XG4gICAgICB0cmFuc2Zvcm1zLnB1c2goJ3JvdGF0ZSgnICsgcm90YXRlICsgJ2RlZyknKTtcbiAgICB9XG5cbiAgICBpZiAoaXNOdW1iZXIoc2NhbGVYKSAmJiBpc051bWJlcihzY2FsZVkpKSB7XG4gICAgICB0cmFuc2Zvcm1zLnB1c2goJ3NjYWxlKCcgKyBzY2FsZVggKyAnLCcgKyBzY2FsZVkgKyAnKScpO1xuICAgIH1cblxuICAgIHJldHVybiB0cmFuc2Zvcm1zLmxlbmd0aCA/IHRyYW5zZm9ybXMuam9pbignICcpIDogJ25vbmUnO1xuICB9XG5cbiAgLy8gZS5nLjogaHR0cDovL2RvbWFpbi5jb20vcGF0aC90by9waWN0dXJlLmpwZz9zaXplPTEyODDDlzk2MCAtPiBwaWN0dXJlLmpwZ1xuICBmdW5jdGlvbiBnZXRJbWFnZU5hbWUodXJsKSB7XG4gICAgcmV0dXJuIGlzU3RyaW5nKHVybCkgPyB1cmwucmVwbGFjZSgvXi4qXFwvLywgJycpLnJlcGxhY2UoL1tcXD8mI10uKiQvLCAnJykgOiAnJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEltYWdlU2l6ZShpbWFnZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgbmV3SW1hZ2U7XG5cbiAgICAvLyBNb2Rlcm4gYnJvd3NlcnNcbiAgICBpZiAoaW1hZ2UubmF0dXJhbFdpZHRoKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soaW1hZ2UubmF0dXJhbFdpZHRoLCBpbWFnZS5uYXR1cmFsSGVpZ2h0KTtcbiAgICB9XG5cbiAgICAvLyBJRTg6IERvbid0IHVzZSBgbmV3IEltYWdlKClgIGhlcmVcbiAgICBuZXdJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgbmV3SW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgY2FsbGJhY2sodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH07XG5cbiAgICBuZXdJbWFnZS5zcmMgPSBpbWFnZS5zcmM7XG4gIH1cblxuICBmdW5jdGlvbiBWaWV3ZXIoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBWaWV3ZXIuREVGQVVMVFMsICQuaXNQbGFpbk9iamVjdChvcHRpb25zKSAmJiBvcHRpb25zKTtcbiAgICB0aGlzLmlzSW1nID0gZmFsc2U7XG4gICAgdGhpcy5pc0J1aWx0ID0gZmFsc2U7XG4gICAgdGhpcy5pc1Nob3duID0gZmFsc2U7XG4gICAgdGhpcy5pc1ZpZXdlZCA9IGZhbHNlO1xuICAgIHRoaXMuaXNGdWxsZWQgPSBmYWxzZTtcbiAgICB0aGlzLmlzUGxheWVkID0gZmFsc2U7XG4gICAgdGhpcy5wbGF5aW5nID0gZmFsc2U7XG4gICAgdGhpcy5mYWRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSBmYWxzZTtcbiAgICB0aGlzLmFjdGlvbiA9IGZhbHNlO1xuICAgIHRoaXMudGFyZ2V0ID0gZmFsc2U7XG4gICAgdGhpcy5pbmRleCA9IDA7XG4gICAgdGhpcy5sZW5ndGggPSAwO1xuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgJC5leHRlbmQocHJvdG90eXBlLCB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJHRoaXMgPSB0aGlzLiRlbGVtZW50O1xuICAgICAgdmFyIGlzSW1nID0gJHRoaXMuaXMoU0VMRUNUT1JfSU1HKTtcbiAgICAgIHZhciAkaW1hZ2VzID0gaXNJbWcgPyAkdGhpcyA6ICR0aGlzLmZpbmQoU0VMRUNUT1JfSU1HKTtcbiAgICAgIFxuICAgICAgdmFyIGxlbmd0aCA9ICRpbWFnZXMubGVuZ3RoO1xuICAgICAgdmFyIHJlYWR5ID0gJC5wcm94eSh0aGlzLnJlYWR5LCB0aGlzKTtcblxuICAgICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMuYnVpbGQpKSB7XG4gICAgICAgICR0aGlzLm9uZShFVkVOVF9CVUlMRCwgb3B0aW9ucy5idWlsZCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnRyaWdnZXIoRVZFTlRfQlVJTEQpLmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gT3ZlcnJpZGUgYHRyYW5zaXRvbmAgb3B0aW9uIGlmIGl0IGlzIG5vdCBzdXBwb3J0ZWRcbiAgICAgIGlmICghU1VQUE9SVF9UUkFOU0lUSU9OKSB7XG4gICAgICAgIG9wdGlvbnMudHJhbnNpdGlvbiA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmlzSW1nID0gaXNJbWc7XG4gICAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbiAgICAgIHRoaXMuY291bnQgPSAwO1xuICAgICAgdGhpcy4kaW1hZ2VzID0gJGltYWdlcztcbiAgICAgIHRoaXMuJGJvZHkgPSAkKCdib2R5Jyk7XG5cbiAgICAgIGlmIChvcHRpb25zLmlubGluZSkge1xuICAgICAgICAkdGhpcy5vbmUoRVZFTlRfQlVJTFQsICQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMudmlldygpO1xuICAgICAgICB9LCB0aGlzKSk7XG5cbiAgICAgICAgJGltYWdlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAodGhpcy5jb21wbGV0ZSkge1xuICAgICAgICAgICAgcmVhZHkoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCh0aGlzKS5vbmUoRVZFTlRfTE9BRCwgcmVhZHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkaW1hZ2VzLmFkZENsYXNzKENMQVNTX1RPR0dMRSk7XG4gICAgICAgICR0aGlzLm9uKEVWRU5UX0NMSUNLLCAkLnByb3h5KHRoaXMuc3RhcnQsIHRoaXMpKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVhZHk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY291bnQrKztcblxuICAgICAgaWYgKHRoaXMuY291bnQgPT09IHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuYnVpbGQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gICQuZXh0ZW5kKHByb3RvdHlwZSwge1xuICAgIGJ1aWxkOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkdGhpcyA9IHRoaXMuJGVsZW1lbnQ7XG4gICAgICB2YXIgJHBhcmVudDtcbiAgICAgIHZhciAkdmlld2VyO1xuICAgICAgdmFyICRidXR0b247XG4gICAgICB2YXIgJHRvb2xiYXI7XG5cbiAgICAgIGlmICh0aGlzLmlzQnVpbHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoISRwYXJlbnQgfHwgISRwYXJlbnQubGVuZ3RoKSB7XG4gICAgICAgICRwYXJlbnQgPSAkdGhpcy5wYXJlbnQoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy4kcGFyZW50ID0gJHBhcmVudDtcbiAgICAgIHRoaXMuJHZpZXdlciA9ICR2aWV3ZXIgPSAkKFZpZXdlci5URU1QTEFURSk7XG4gICAgICB0aGlzLiRjYW52YXMgPSAkdmlld2VyLmZpbmQoJy52aWV3ZXItY2FudmFzJyk7XG4gICAgICB0aGlzLiRmb290ZXIgPSAkdmlld2VyLmZpbmQoJy52aWV3ZXItZm9vdGVyJyk7XG4gICAgICB0aGlzLiR0aXRsZSA9ICR2aWV3ZXIuZmluZCgnLnZpZXdlci10aXRsZScpLnRvZ2dsZUNsYXNzKENMQVNTX0hJREUsICFvcHRpb25zLnRpdGxlKTtcbiAgICAgIHRoaXMuJHRvb2xiYXIgPSAkdG9vbGJhciA9ICR2aWV3ZXIuZmluZCgnLnZpZXdlci10b29sYmFyJykudG9nZ2xlQ2xhc3MoQ0xBU1NfSElERSwgIW9wdGlvbnMudG9vbGJhcik7XG4gICAgICB0aGlzLiRuYXZiYXIgPSAkdmlld2VyLmZpbmQoJy52aWV3ZXItbmF2YmFyJykudG9nZ2xlQ2xhc3MoQ0xBU1NfSElERSwgIW9wdGlvbnMubmF2YmFyKTtcbiAgICAgIHRoaXMuJGJ1dHRvbiA9ICRidXR0b24gPSAkdmlld2VyLmZpbmQoJy52aWV3ZXItYnV0dG9uJykudG9nZ2xlQ2xhc3MoQ0xBU1NfSElERSwgIW9wdGlvbnMuYnV0dG9uKTtcbiAgICAgIHRoaXMuJHRvb2x0aXAgPSAkdmlld2VyLmZpbmQoJy52aWV3ZXItdG9vbHRpcCcpO1xuICAgICAgdGhpcy4kcGxheWVyID0gJHZpZXdlci5maW5kKCcudmlld2VyLXBsYXllcicpO1xuICAgICAgdGhpcy4kbGlzdCA9ICR2aWV3ZXIuZmluZCgnLnZpZXdlci1saXN0Jyk7XG5cbiAgICAgICR0b29sYmFyLmZpbmQoJ2xpW2NsYXNzKj16b29tXScpLnRvZ2dsZUNsYXNzKENMQVNTX0lOVklTSUJMRSwgIW9wdGlvbnMuem9vbWFibGUpO1xuICAgICAgJHRvb2xiYXIuZmluZCgnbGlbY2xhc3MqPWZsaXBdJykudG9nZ2xlQ2xhc3MoQ0xBU1NfSU5WSVNJQkxFLCAhb3B0aW9ucy5zY2FsYWJsZSk7XG5cbiAgICAgIGlmICghb3B0aW9ucy5yb3RhdGFibGUpIHtcbiAgICAgICAgJHRvb2xiYXIuZmluZCgnbGlbY2xhc3MqPXJvdGF0ZV0nKS5hZGRDbGFzcyhDTEFTU19JTlZJU0lCTEUpLmFwcGVuZFRvKCR0b29sYmFyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuaW5saW5lKSB7XG4gICAgICAgICRidXR0b24uYWRkQ2xhc3MoQ0xBU1NfRlVMTFNDUkVFTik7XG4gICAgICAgICR2aWV3ZXIuY3NzKCd6LWluZGV4Jywgb3B0aW9ucy56SW5kZXhJbmxpbmUpO1xuXG4gICAgICAgIGlmICgkcGFyZW50LmNzcygncG9zaXRpb24nKSA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgICAkcGFyZW50LmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJGJ1dHRvbi5hZGRDbGFzcyhDTEFTU19DTE9TRSk7XG4gICAgICAgICR2aWV3ZXIuXG4gICAgICAgICAgY3NzKCd6LWluZGV4Jywgb3B0aW9ucy56SW5kZXgpLlxuICAgICAgICAgIGFkZENsYXNzKFtDTEFTU19GSVhFRCwgQ0xBU1NfRkFERSwgQ0xBU1NfSElERV0uam9pbignICcpKTtcbiAgICAgIH1cblxuICAgICAgJHRoaXMuYWZ0ZXIoJHZpZXdlcik7XG5cbiAgICAgIGlmIChvcHRpb25zLmlubGluZSkge1xuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB0aGlzLmJpbmQoKTtcbiAgICAgICAgdGhpcy5pc1Nob3duID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pc0J1aWx0ID0gdHJ1ZTtcblxuICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLmJ1aWx0KSkge1xuICAgICAgICAkdGhpcy5vbmUoRVZFTlRfQlVJTFQsIG9wdGlvbnMuYnVpbHQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRyaWdnZXIoRVZFTlRfQlVJTFQpO1xuICAgIH0sXG5cbiAgICB1bmJ1aWxkOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkdGhpcyA9IHRoaXMuJGVsZW1lbnQ7XG5cbiAgICAgIGlmICghdGhpcy5pc0J1aWx0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuaW5saW5lICYmICFvcHRpb25zLmNvbnRhaW5lcikge1xuICAgICAgICAkdGhpcy5yZW1vdmVDbGFzcyhDTEFTU19ISURFKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy4kdmlld2VyLnJlbW92ZSgpO1xuICAgIH1cbiAgfSk7XG5cbiAgJC5leHRlbmQocHJvdG90eXBlLCB7XG4gICAgYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy4kdmlld2VyLlxuICAgICAgICBvbihFVkVOVF9DTElDSywgJC5wcm94eSh0aGlzLmNsaWNrLCB0aGlzKSkuXG4gICAgICAgIG9uKEVWRU5UX1dIRUVMLCAkLnByb3h5KHRoaXMud2hlZWwsIHRoaXMpKTtcblxuICAgICAgdGhpcy4kY2FudmFzLm9uKEVWRU5UX01PVVNFRE9XTiwgJC5wcm94eSh0aGlzLm1vdXNlZG93biwgdGhpcykpO1xuXG4gICAgICAkZG9jdW1lbnQuXG4gICAgICAgIG9uKEVWRU5UX01PVVNFTU9WRSwgKHRoaXMuX21vdXNlbW92ZSA9IHByb3h5KHRoaXMubW91c2Vtb3ZlLCB0aGlzKSkpLlxuICAgICAgICBvbihFVkVOVF9NT1VTRVVQLCAodGhpcy5fbW91c2V1cCA9IHByb3h5KHRoaXMubW91c2V1cCwgdGhpcykpKS5cbiAgICAgICAgb24oRVZFTlRfS0VZRE9XTiwgKHRoaXMuX2tleWRvd24gPSBwcm94eSh0aGlzLmtleWRvd24sIHRoaXMpKSk7XG5cbiAgICAgICR3aW5kb3cub24oRVZFTlRfUkVTSVpFLCAodGhpcy5fcmVzaXplID0gcHJveHkodGhpcy5yZXNpemUsIHRoaXMpKSk7XG4gICAgfSxcblxuICAgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy4kdmlld2VyLlxuICAgICAgICBvZmYoRVZFTlRfQ0xJQ0ssIHRoaXMuY2xpY2spLlxuICAgICAgICBvZmYoRVZFTlRfV0hFRUwsIHRoaXMud2hlZWwpO1xuXG4gICAgICB0aGlzLiRjYW52YXMub2ZmKEVWRU5UX01PVVNFRE9XTiwgdGhpcy5tb3VzZWRvd24pO1xuXG4gICAgICAkZG9jdW1lbnQuXG4gICAgICAgIG9mZihFVkVOVF9NT1VTRU1PVkUsIHRoaXMuX21vdXNlbW92ZSkuXG4gICAgICAgIG9mZihFVkVOVF9NT1VTRVVQLCB0aGlzLl9tb3VzZXVwKS5cbiAgICAgICAgb2ZmKEVWRU5UX0tFWURPV04sIHRoaXMuX2tleWRvd24pO1xuXG4gICAgICAkd2luZG93Lm9mZihFVkVOVF9SRVNJWkUsIHRoaXMuX3Jlc2l6ZSk7XG4gICAgfVxuICB9KTtcblxuICAkLmV4dGVuZChwcm90b3R5cGUsIHtcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuaW5pdENvbnRhaW5lcigpO1xuICAgICAgdGhpcy5pbml0Vmlld2VyKCk7XG4gICAgICB0aGlzLmluaXRMaXN0KCk7XG4gICAgICB0aGlzLnJlbmRlclZpZXdlcigpO1xuICAgIH0sXG5cbiAgICBpbml0Q29udGFpbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IHtcbiAgICAgICAgd2lkdGg6ICR3aW5kb3cuaW5uZXJXaWR0aCgpLFxuICAgICAgICBoZWlnaHQ6ICR3aW5kb3cuaW5uZXJIZWlnaHQoKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgaW5pdFZpZXdlcjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJHBhcmVudCA9IHRoaXMuJHBhcmVudDtcbiAgICAgIHZhciB2aWV3ZXI7XG5cbiAgICAgIGlmIChvcHRpb25zLmlubGluZSkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IHZpZXdlciA9IHtcbiAgICAgICAgICB3aWR0aDogbWF4KCRwYXJlbnQud2lkdGgoKSwgb3B0aW9ucy5taW5XaWR0aCksXG4gICAgICAgICAgaGVpZ2h0OiBtYXgoJHBhcmVudC5oZWlnaHQoKSwgb3B0aW9ucy5taW5IZWlnaHQpXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlzRnVsbGVkIHx8ICF2aWV3ZXIpIHtcbiAgICAgICAgdmlld2VyID0gdGhpcy5jb250YWluZXI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudmlld2VyID0gJC5leHRlbmQoe30sIHZpZXdlcik7XG4gICAgfSxcblxuICAgIHJlbmRlclZpZXdlcjogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbmxpbmUgJiYgIXRoaXMuaXNGdWxsZWQpIHtcbiAgICAgICAgdGhpcy4kdmlld2VyLmNzcyh0aGlzLnZpZXdlcik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGluaXRMaXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkdGhpcyA9IHRoaXMuJGVsZW1lbnQ7XG4gICAgICB2YXIgJGxpc3QgPSB0aGlzLiRsaXN0O1xuICAgICAgdmFyIGxpc3QgPSBbXTtcblxuICAgICAgdGhpcy4kaW1hZ2VzLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgdmFyIHNyYyA9IHRoaXMuc3JjO1xuICAgICAgICB2YXIgYWx0ID0gdGhpcy5hbHQgfHwgZ2V0SW1hZ2VOYW1lKHNyYyk7XG4gICAgICAgIHZhciB1cmwgPSBvcHRpb25zLnVybDtcblxuICAgICAgICBpZiAoIXNyYykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1N0cmluZyh1cmwpKSB7XG4gICAgICAgICAgdXJsID0gdGhpcy5nZXRBdHRyaWJ1dGUodXJsKTtcbiAgICAgICAgfSBlbHNlIGlmICgkLmlzRnVuY3Rpb24odXJsKSkge1xuICAgICAgICAgIHVybCA9IHVybC5jYWxsKHRoaXMsIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5wdXNoKFxuICAgICAgICAgICc8bGk+JyArXG4gICAgICAgICAgICAnPGltZycgK1xuICAgICAgICAgICAgICAnIHNyYz1cIicgKyBzcmMgKyAnXCInICtcbiAgICAgICAgICAgICAgJyBkYXRhLWFjdGlvbj1cInZpZXdcIicgK1xuICAgICAgICAgICAgICAnIGRhdGEtaW5kZXg9XCInICsgIGkgKyAnXCInICtcbiAgICAgICAgICAgICAgJyBkYXRhLW9yaWdpbmFsLXVybD1cIicgKyAgKHVybCB8fCBzcmMpICsgJ1wiJyArXG4gICAgICAgICAgICAgICcgYWx0PVwiJyArICBhbHQgKyAnXCInICtcbiAgICAgICAgICAgICc+JyArXG4gICAgICAgICAgJzwvbGk+J1xuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgICRsaXN0Lmh0bWwobGlzdC5qb2luKCcnKSkuZmluZChTRUxFQ1RPUl9JTUcpLm9uZShFVkVOVF9MT0FELCB7XG4gICAgICAgIGZpbGxlZDogdHJ1ZVxuICAgICAgfSwgJC5wcm94eSh0aGlzLmxvYWRJbWFnZSwgdGhpcykpO1xuXG4gICAgICB0aGlzLiRpdGVtcyA9ICRsaXN0LmNoaWxkcmVuKCk7XG5cbiAgICAgIGlmIChvcHRpb25zLnRyYW5zaXRpb24pIHtcbiAgICAgICAgJHRoaXMub25lKEVWRU5UX1ZJRVdFRCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRsaXN0LmFkZENsYXNzKENMQVNTX1RSQU5TSVRJT04pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyTGlzdDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICB2YXIgaSA9IGluZGV4IHx8IHRoaXMuaW5kZXg7XG4gICAgICB2YXIgd2lkdGggPSB0aGlzLiRpdGVtcy5lcShpKS53aWR0aCgpO1xuICAgICAgdmFyIG91dGVyV2lkdGggPSB3aWR0aCArIDE7IC8vIDEgcGl4ZWwgb2YgYG1hcmdpbi1sZWZ0YCB3aWR0aFxuXG4gICAgICAvLyBQbGFjZSB0aGUgYWN0aXZlIGl0ZW0gaW4gdGhlIGNlbnRlciBvZiB0aGUgc2NyZWVuXG4gICAgICB0aGlzLiRsaXN0LmNzcyh7XG4gICAgICAgIHdpZHRoOiBvdXRlcldpZHRoICogdGhpcy5sZW5ndGgsXG4gICAgICAgIG1hcmdpbkxlZnQ6ICh0aGlzLnZpZXdlci53aWR0aCAtIHdpZHRoKSAvIDIgLSBvdXRlcldpZHRoICogaVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlc2V0TGlzdDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy4kbGlzdC5lbXB0eSgpLnJlbW92ZUNsYXNzKENMQVNTX1RSQU5TSVRJT04pLmNzcygnbWFyZ2luLWxlZnQnLCAwKTtcbiAgICB9LFxuXG4gICAgaW5pdEltYWdlOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICRpbWFnZSA9IHRoaXMuJGltYWdlO1xuICAgICAgdmFyIHZpZXdlciA9IHRoaXMudmlld2VyO1xuICAgICAgdmFyIGZvb3RlckhlaWdodCA9IHRoaXMuJGZvb3Rlci5oZWlnaHQoKTtcbiAgICAgIHZhciB2aWV3ZXJXaWR0aCA9IHZpZXdlci53aWR0aDtcbiAgICAgIHZhciB2aWV3ZXJIZWlnaHQgPSBtYXgodmlld2VyLmhlaWdodCAtIGZvb3RlckhlaWdodCwgZm9vdGVySGVpZ2h0KTtcbiAgICAgIHZhciBvbGRJbWFnZSA9IHRoaXMuaW1hZ2UgfHwge307XG5cbiAgICAgIGdldEltYWdlU2l6ZSgkaW1hZ2VbMF0sICQucHJveHkoZnVuY3Rpb24gKG5hdHVyYWxXaWR0aCwgbmF0dXJhbEhlaWdodCkge1xuICAgICAgICB2YXIgYXNwZWN0UmF0aW8gPSBuYXR1cmFsV2lkdGggLyBuYXR1cmFsSGVpZ2h0O1xuICAgICAgICB2YXIgd2lkdGggPSB2aWV3ZXJXaWR0aDtcbiAgICAgICAgdmFyIGhlaWdodCA9IHZpZXdlckhlaWdodDtcbiAgICAgICAgdmFyIGluaXRpYWxJbWFnZTtcbiAgICAgICAgdmFyIGltYWdlO1xuXG4gICAgICAgIGlmICh2aWV3ZXJIZWlnaHQgKiBhc3BlY3RSYXRpbyA+IHZpZXdlcldpZHRoKSB7XG4gICAgICAgICAgaGVpZ2h0ID0gdmlld2VyV2lkdGggLyBhc3BlY3RSYXRpbztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3aWR0aCA9IHZpZXdlckhlaWdodCAqIGFzcGVjdFJhdGlvO1xuICAgICAgICB9XG5cbiAgICAgICAgd2lkdGggPSBtaW4od2lkdGggKiAwLjksIG5hdHVyYWxXaWR0aCk7XG4gICAgICAgIGhlaWdodCA9IG1pbihoZWlnaHQgKiAwLjksIG5hdHVyYWxIZWlnaHQpO1xuXG4gICAgICAgIGltYWdlID0ge1xuICAgICAgICAgIG5hdHVyYWxXaWR0aDogbmF0dXJhbFdpZHRoLFxuICAgICAgICAgIG5hdHVyYWxIZWlnaHQ6IG5hdHVyYWxIZWlnaHQsXG4gICAgICAgICAgYXNwZWN0UmF0aW86IGFzcGVjdFJhdGlvLFxuICAgICAgICAgIHJhdGlvOiB3aWR0aCAvIG5hdHVyYWxXaWR0aCxcbiAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgbGVmdDogKHZpZXdlcldpZHRoIC0gd2lkdGgpIC8gMixcbiAgICAgICAgICB0b3A6ICh2aWV3ZXJIZWlnaHQgLSBoZWlnaHQpIC8gMlxuICAgICAgICB9O1xuXG4gICAgICAgIGluaXRpYWxJbWFnZSA9ICQuZXh0ZW5kKHt9LCBpbWFnZSk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMucm90YXRhYmxlKSB7XG4gICAgICAgICAgaW1hZ2Uucm90YXRlID0gb2xkSW1hZ2Uucm90YXRlIHx8IDA7XG4gICAgICAgICAgaW5pdGlhbEltYWdlLnJvdGF0ZSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5zY2FsYWJsZSkge1xuICAgICAgICAgIGltYWdlLnNjYWxlWCA9IG9sZEltYWdlLnNjYWxlWCB8fCAxO1xuICAgICAgICAgIGltYWdlLnNjYWxlWSA9IG9sZEltYWdlLnNjYWxlWSB8fCAxO1xuICAgICAgICAgIGluaXRpYWxJbWFnZS5zY2FsZVggPSAxO1xuICAgICAgICAgIGluaXRpYWxJbWFnZS5zY2FsZVkgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pbWFnZSA9IGltYWdlO1xuICAgICAgICB0aGlzLmluaXRpYWxJbWFnZSA9IGluaXRpYWxJbWFnZTtcblxuICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgcmVuZGVySW1hZ2U6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgdmFyIGltYWdlID0gdGhpcy5pbWFnZTtcbiAgICAgIHZhciAkaW1hZ2UgPSB0aGlzLiRpbWFnZTtcblxuICAgICAgJGltYWdlLmNzcyh7XG4gICAgICAgIHdpZHRoOiBpbWFnZS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBpbWFnZS5oZWlnaHQsXG4gICAgICAgIG1hcmdpbkxlZnQ6IGltYWdlLmxlZnQsXG4gICAgICAgIG1hcmdpblRvcDogaW1hZ2UudG9wLFxuICAgICAgICB0cmFuc2Zvcm06IGdldFRyYW5zZm9ybShpbWFnZSlcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRyYW5zaXRpb24pIHtcbiAgICAgICAgICAkaW1hZ2Uub25lKEVWRU5UX1RSQU5TSVRJT05FTkQsIGNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHJlc2V0SW1hZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuJGltYWdlLnJlbW92ZSgpO1xuICAgICAgdGhpcy4kaW1hZ2UgPSBudWxsO1xuICAgIH1cbiAgfSk7XG5cbiAgJC5leHRlbmQocHJvdG90eXBlLCB7XG4gICAgc3RhcnQ6IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG5cbiAgICAgIGlmICgkKHRhcmdldCkuaGFzQ2xhc3MoQ0xBU1NfVE9HR0xFKSkge1xuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNsaWNrOiBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcbiAgICAgIHZhciBhY3Rpb24gPSAkdGFyZ2V0LmRhdGEoJ2FjdGlvbicpO1xuICAgICAgdmFyIGltYWdlID0gdGhpcy5pbWFnZTtcbiAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgIGNhc2UgJ21peCc6XG4gICAgICAgICAgaWYgKHRoaXMuaXNQbGF5ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmlubGluZSkge1xuICAgICAgICAgICAgICBpZiAodGhpcy5pc0Z1bGxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhpdCgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZnVsbCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd2aWV3JzpcbiAgICAgICAgICB0aGlzLnZpZXcoJHRhcmdldC5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd6b29tLWluJzpcbiAgICAgICAgICB0aGlzLnpvb20oMC4xLCB0cnVlKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd6b29tLW91dCc6XG4gICAgICAgICAgdGhpcy56b29tKC0wLjEsIHRydWUpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ29uZS10by1vbmUnOlxuICAgICAgICAgIGlmICh0aGlzLmltYWdlLnJhdGlvID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLnpvb21Ubyh0aGlzLmluaXRpYWxJbWFnZS5yYXRpbyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuem9vbVRvKDEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3Jlc2V0JzpcbiAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncHJldic6XG4gICAgICAgICAgdGhpcy5wcmV2KCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncGxheSc6XG4gICAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbmV4dCc6XG4gICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncm90YXRlLWxlZnQnOlxuICAgICAgICAgIHRoaXMucm90YXRlKC05MCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncm90YXRlLXJpZ2h0JzpcbiAgICAgICAgICB0aGlzLnJvdGF0ZSg5MCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnZmxpcC1ob3Jpem9udGFsJzpcbiAgICAgICAgICB0aGlzLnNjYWxlKC1pbWFnZS5zY2FsZVggfHwgLTEsIGltYWdlLnNjYWxlWSB8fCAxKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdmbGlwLXZlcnRpY2FsJzpcbiAgICAgICAgICB0aGlzLnNjYWxlKGltYWdlLnNjYWxlWCB8fCAxLCAtaW1hZ2Uuc2NhbGVZIHx8IC0xKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICh0aGlzLmlzUGxheWVkKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuaW5pdEltYWdlKCQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlbmRlckltYWdlKCQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuaXNWaWV3ZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMudHJpZ2dlcihFVkVOVF9WSUVXRUQpO1xuICAgICAgICB9LCB0aGlzKSk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIGxvYWRJbWFnZTogZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciBpbWFnZSA9IGUudGFyZ2V0O1xuICAgICAgdmFyICRpbWFnZSA9ICQoaW1hZ2UpO1xuICAgICAgdmFyICRwYXJlbnQgPSAkaW1hZ2UucGFyZW50KCk7XG4gICAgICB2YXIgcGFyZW50V2lkdGggPSAkcGFyZW50LndpZHRoKCk7XG4gICAgICB2YXIgcGFyZW50SGVpZ2h0ID0gJHBhcmVudC5oZWlnaHQoKTtcbiAgICAgIHZhciBmaWxsZWQgPSBlLmRhdGEgJiYgZS5kYXRhLmZpbGxlZDtcblxuICAgICAgZ2V0SW1hZ2VTaXplKGltYWdlLCAkLnByb3h5KGZ1bmN0aW9uIChuYXR1cmFsV2lkdGgsIG5hdHVyYWxIZWlnaHQpIHtcbiAgICAgICAgdmFyIGFzcGVjdFJhdGlvID0gbmF0dXJhbFdpZHRoIC8gbmF0dXJhbEhlaWdodDtcbiAgICAgICAgdmFyIHdpZHRoID0gcGFyZW50V2lkdGg7XG4gICAgICAgIHZhciBoZWlnaHQgPSBwYXJlbnRIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHBhcmVudEhlaWdodCAqIGFzcGVjdFJhdGlvID4gcGFyZW50V2lkdGgpIHtcbiAgICAgICAgICBpZiAoZmlsbGVkKSB7XG4gICAgICAgICAgICB3aWR0aCA9IHBhcmVudEhlaWdodCAqIGFzcGVjdFJhdGlvO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoZWlnaHQgPSBwYXJlbnRXaWR0aCAvIGFzcGVjdFJhdGlvO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZmlsbGVkKSB7XG4gICAgICAgICAgICBoZWlnaHQgPSBwYXJlbnRXaWR0aCAvIGFzcGVjdFJhdGlvO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aWR0aCA9IHBhcmVudEhlaWdodCAqIGFzcGVjdFJhdGlvO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRpbWFnZS5jc3Moe1xuICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICBtYXJnaW5MZWZ0OiAocGFyZW50V2lkdGggLSB3aWR0aCkgLyAyLFxuICAgICAgICAgIG1hcmdpblRvcDogKHBhcmVudEhlaWdodCAtIGhlaWdodCkgLyAyXG4gICAgICAgIH0pO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICByZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuaW5pdENvbnRhaW5lcigpO1xuICAgICAgdGhpcy5pbml0Vmlld2VyKCk7XG4gICAgICB0aGlzLnJlbmRlclZpZXdlcigpO1xuICAgICAgdGhpcy5yZW5kZXJMaXN0KCk7XG4gICAgICB0aGlzLmluaXRJbWFnZSgkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZSgpO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICBpZiAodGhpcy5pc1BsYXllZCkge1xuICAgICAgICB0aGlzLiRwbGF5ZXIuXG4gICAgICAgICAgZmluZChTRUxFQ1RPUl9JTUcpLlxuICAgICAgICAgIG9uZShFVkVOVF9MT0FELCAkLnByb3h5KHRoaXMubG9hZEltYWdlLCB0aGlzKSkuXG4gICAgICAgICAgdHJpZ2dlcihFVkVOVF9MT0FEKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgd2hlZWw6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGUgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuICAgICAgdmFyIHJhdGlvID0gbnVtKHRoaXMub3B0aW9ucy56b29tUmF0aW8pIHx8IDAuMTtcbiAgICAgIHZhciBkZWx0YSA9IDE7XG5cbiAgICAgIGlmICghdGhpcy5pc1ZpZXdlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGlmIChlLmRlbHRhWSkge1xuICAgICAgICBkZWx0YSA9IGUuZGVsdGFZID4gMCA/IDEgOiAtMTtcbiAgICAgIH0gZWxzZSBpZiAoZS53aGVlbERlbHRhKSB7XG4gICAgICAgIGRlbHRhID0gLWUud2hlZWxEZWx0YSAvIDEyMDtcbiAgICAgIH0gZWxzZSBpZiAoZS5kZXRhaWwpIHtcbiAgICAgICAgZGVsdGEgPSBlLmRldGFpbCA+IDAgPyAxIDogLTE7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuem9vbSgtZGVsdGEgKiByYXRpbywgdHJ1ZSk7XG4gICAgfSxcblxuICAgIGtleWRvd246IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciB3aGljaCA9IGUud2hpY2g7XG5cbiAgICAgIGlmICghdGhpcy5pc0Z1bGxlZCB8fCAhb3B0aW9ucy5rZXlib2FyZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAod2hpY2gpIHtcblxuICAgICAgICAvLyAoS2V5OiBFc2MpXG4gICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgaWYgKHRoaXMuaXNQbGF5ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5pbmxpbmUpIHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuaXNGdWxsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4aXQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy8gVmlldyBwcmV2aW91cyAoS2V5OiDihpApXG4gICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgdGhpcy5wcmV2KCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLy8gWm9vbSBpbiAoS2V5OiDihpEpXG4gICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgdGhpcy56b29tKG9wdGlvbnMuem9vbVJhdGlvLCB0cnVlKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBWaWV3IG5leHQgKEtleTog4oaSKVxuICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIFpvb20gb3V0IChLZXk6IOKGkylcbiAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICB0aGlzLnpvb20oLW9wdGlvbnMuem9vbVJhdGlvLCB0cnVlKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBab29tIG91dCB0byBpbml0aWFsIHNpemUgKEtleTogQ3RybCArIDApXG4gICAgICAgIGNhc2UgNDg6XG4gICAgICAgICAgLy8gR28gdG8gbmV4dFxuXG4gICAgICAgIC8vIFpvb20gaW4gdG8gbmF0dXJhbCBzaXplIChLZXk6IEN0cmwgKyAxKVxuICAgICAgICBjYXNlIDQ5OlxuICAgICAgICAgIGlmIChlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5pbWFnZS5yYXRpbyA9PT0gMSkge1xuICAgICAgICAgICAgICB0aGlzLnpvb21Ubyh0aGlzLmluaXRpYWxJbWFnZS5yYXRpbyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnpvb21UbygxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBObyBkZWZhdWx0XG4gICAgICB9XG4gICAgfSxcblxuICAgIG1vdXNlZG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciBvcmlnaW5hbEV2ZW50ID0gZXZlbnQub3JpZ2luYWxFdmVudDtcbiAgICAgIHZhciB0b3VjaGVzID0gb3JpZ2luYWxFdmVudCAmJiBvcmlnaW5hbEV2ZW50LnRvdWNoZXM7XG4gICAgICB2YXIgZSA9IGV2ZW50O1xuICAgICAgdmFyIGFjdGlvbiA9IG9wdGlvbnMubW92YWJsZSA/ICdtb3ZlJyA6IGZhbHNlO1xuICAgICAgdmFyIHRvdWNoZXNMZW5ndGg7XG5cbiAgICAgIGlmICghdGhpcy5pc1ZpZXdlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0b3VjaGVzKSB7XG4gICAgICAgIHRvdWNoZXNMZW5ndGggPSB0b3VjaGVzLmxlbmd0aDtcblxuICAgICAgICBpZiAodG91Y2hlc0xlbmd0aCA+IDEpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy56b29tYWJsZSAmJiB0b3VjaGVzTGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICBlID0gdG91Y2hlc1sxXTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRYMiA9IGUucGFnZVg7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0WTIgPSBlLnBhZ2VZO1xuICAgICAgICAgICAgYWN0aW9uID0gJ3pvb20nO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLmlzU3dpdGNoYWJsZSgpKSB7XG4gICAgICAgICAgICBhY3Rpb24gPSAnc3dpdGNoJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBlID0gdG91Y2hlc1swXTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFjdGlvbikge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmFjdGlvbiA9IGFjdGlvbjtcblxuICAgICAgICAvLyBJRTggIGhhcyBgZXZlbnQucGFnZVgvWWAsIGJ1dCBub3QgYGV2ZW50Lm9yaWdpbmFsRXZlbnQucGFnZVgvWWBcbiAgICAgICAgLy8gSUUxMCBoYXMgYGV2ZW50Lm9yaWdpbmFsRXZlbnQucGFnZVgvWWAsIGJ1dCBub3QgYGV2ZW50LnBhZ2VYL1lgXG4gICAgICAgIHRoaXMuc3RhcnRYID0gZS5wYWdlWCB8fCBvcmlnaW5hbEV2ZW50ICYmIG9yaWdpbmFsRXZlbnQucGFnZVg7XG4gICAgICAgIHRoaXMuc3RhcnRZID0gZS5wYWdlWSB8fCBvcmlnaW5hbEV2ZW50ICYmIG9yaWdpbmFsRXZlbnQucGFnZVk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciBhY3Rpb24gPSB0aGlzLmFjdGlvbjtcbiAgICAgIHZhciAkaW1hZ2UgPSB0aGlzLiRpbWFnZTtcbiAgICAgIHZhciBvcmlnaW5hbEV2ZW50ID0gZXZlbnQub3JpZ2luYWxFdmVudDtcbiAgICAgIHZhciB0b3VjaGVzID0gb3JpZ2luYWxFdmVudCAmJiBvcmlnaW5hbEV2ZW50LnRvdWNoZXM7XG4gICAgICB2YXIgZSA9IGV2ZW50O1xuICAgICAgdmFyIHRvdWNoZXNMZW5ndGg7XG5cbiAgICAgIGlmICghdGhpcy5pc1ZpZXdlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0b3VjaGVzKSB7XG4gICAgICAgIHRvdWNoZXNMZW5ndGggPSB0b3VjaGVzLmxlbmd0aDtcblxuICAgICAgICBpZiAodG91Y2hlc0xlbmd0aCA+IDEpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy56b29tYWJsZSAmJiB0b3VjaGVzTGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICBlID0gdG91Y2hlc1sxXTtcbiAgICAgICAgICAgIHRoaXMuZW5kWDIgPSBlLnBhZ2VYO1xuICAgICAgICAgICAgdGhpcy5lbmRZMiA9IGUucGFnZVk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBlID0gdG91Y2hlc1swXTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFjdGlvbikge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmIChhY3Rpb24gPT09ICdtb3ZlJyAmJiBvcHRpb25zLnRyYW5zaXRpb24gJiYgJGltYWdlLmhhc0NsYXNzKENMQVNTX1RSQU5TSVRJT04pKSB7XG4gICAgICAgICAgJGltYWdlLnJlbW92ZUNsYXNzKENMQVNTX1RSQU5TSVRJT04pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbmRYID0gZS5wYWdlWCB8fCBvcmlnaW5hbEV2ZW50ICYmIG9yaWdpbmFsRXZlbnQucGFnZVg7XG4gICAgICAgIHRoaXMuZW5kWSA9IGUucGFnZVkgfHwgb3JpZ2luYWxFdmVudCAmJiBvcmlnaW5hbEV2ZW50LnBhZ2VZO1xuXG4gICAgICAgIHRoaXMuY2hhbmdlKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG1vdXNldXA6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIGFjdGlvbiA9IHRoaXMuYWN0aW9uO1xuXG4gICAgICBpZiAoYWN0aW9uKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ21vdmUnICYmIHRoaXMub3B0aW9ucy50cmFuc2l0aW9uKSB7XG4gICAgICAgICAgdGhpcy4kaW1hZ2UuYWRkQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGlvbiA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgJC5leHRlbmQocHJvdG90eXBlLCB7XG5cbiAgICAvLyBTaG93IHRoZSB2aWV3ZXIgKG9ubHkgYXZhaWxhYmxlIGluIG1vZGFsIG1vZGUpXG4gICAgc2hvdzogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJHZpZXdlcjtcblxuICAgICAgaWYgKG9wdGlvbnMuaW5saW5lIHx8IHRoaXMudHJhbnNpdGlvbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5pc0J1aWx0KSB7XG4gICAgICAgIHRoaXMuYnVpbGQoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLnNob3cpKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub25lKEVWRU5UX1NIT1csIG9wdGlvbnMuc2hvdyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnRyaWdnZXIoRVZFTlRfU0hPVykuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRib2R5LmFkZENsYXNzKENMQVNTX09QRU4pO1xuICAgICAgJHZpZXdlciA9IHRoaXMuJHZpZXdlci5yZW1vdmVDbGFzcyhDTEFTU19ISURFKTtcblxuICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRVZFTlRfU0hPV04sICQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnZpZXcoKHRoaXMudGFyZ2V0ID8gdGhpcy4kaW1hZ2VzLmluZGV4KHRoaXMudGFyZ2V0KSA6IDApIHx8IHRoaXMuaW5kZXgpO1xuICAgICAgICB0aGlzLnRhcmdldCA9IGZhbHNlO1xuICAgICAgfSwgdGhpcykpO1xuXG4gICAgICBpZiAob3B0aW9ucy50cmFuc2l0aW9uKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IHRydWU7XG5cbiAgICAgICAgLyoganNoaW50IGV4cHI6dHJ1ZSAqL1xuICAgICAgICAkdmlld2VyLmFkZENsYXNzKENMQVNTX1RSQU5TSVRJT04pLmdldCgwKS5vZmZzZXRXaWR0aDtcbiAgICAgICAgJHZpZXdlci5vbmUoRVZFTlRfVFJBTlNJVElPTkVORCwgJC5wcm94eSh0aGlzLnNob3duLCB0aGlzKSkuYWRkQ2xhc3MoQ0xBU1NfSU4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHZpZXdlci5hZGRDbGFzcyhDTEFTU19JTik7XG4gICAgICAgIHRoaXMuc2hvd24oKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSGlkZSB0aGUgdmlld2VyIChvbmx5IGF2YWlsYWJsZSBpbiBtb2RhbCBtb2RlKVxuICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICR2aWV3ZXIgPSB0aGlzLiR2aWV3ZXI7XG5cbiAgICAgIGlmIChvcHRpb25zLmlubGluZSB8fCB0aGlzLnRyYW5zaXRpb25pbmcgfHwgIXRoaXMuaXNTaG93bikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICgkLmlzRnVuY3Rpb24ob3B0aW9ucy5oaWRlKSkge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uZShFVkVOVF9ISURFLCBvcHRpb25zLmhpZGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy50cmlnZ2VyKEVWRU5UX0hJREUpLmlzRGVmYXVsdFByZXZlbnRlZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaXNWaWV3ZWQgJiYgb3B0aW9ucy50cmFuc2l0aW9uKSB7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuJGltYWdlLm9uZShFVkVOVF9UUkFOU0lUSU9ORU5ELCAkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkdmlld2VyLm9uZShFVkVOVF9UUkFOU0lUSU9ORU5ELCAkLnByb3h5KHRoaXMuaGlkZGVuLCB0aGlzKSkucmVtb3ZlQ2xhc3MoQ0xBU1NfSU4pO1xuICAgICAgICB9LCB0aGlzKSk7XG4gICAgICAgIHRoaXMuem9vbVRvKDAsIGZhbHNlLCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICR2aWV3ZXIucmVtb3ZlQ2xhc3MoQ0xBU1NfSU4pO1xuICAgICAgICB0aGlzLmhpZGRlbigpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBWaWV3IG9uZSBvZiB0aGUgaW1hZ2VzIHdpdGggaW1hZ2UncyBpbmRleFxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAgICovXG4gICAgdmlldzogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciB2aWV3ZXIgPSB0aGlzLnZpZXdlcjtcbiAgICAgIHZhciAkdGl0bGUgPSB0aGlzLiR0aXRsZTtcbiAgICAgIHZhciAkaW1hZ2U7XG4gICAgICB2YXIgJGl0ZW07XG4gICAgICB2YXIgJGltZztcbiAgICAgIHZhciB1cmw7XG4gICAgICB2YXIgYWx0O1xuXG4gICAgICBpbmRleCA9IE51bWJlcihpbmRleCkgfHwgMDtcblxuICAgICAgaWYgKCF0aGlzLmlzU2hvd24gfHwgdGhpcy5pc1BsYXllZCB8fCBpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5sZW5ndGggfHxcbiAgICAgICAgdGhpcy5pc1ZpZXdlZCAmJiBpbmRleCA9PT0gdGhpcy5pbmRleCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnRyaWdnZXIoRVZFTlRfVklFVykuaXNEZWZhdWx0UHJldmVudGVkKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAkaXRlbSA9IHRoaXMuJGl0ZW1zLmVxKGluZGV4KTtcbiAgICAgICRpbWcgPSAkaXRlbS5maW5kKFNFTEVDVE9SX0lNRyk7XG4gICAgICB1cmwgPSAkaW1nLmRhdGEoJ29yaWdpbmFsVXJsJyk7XG4gICAgICBhbHQgPSAkaW1nLmF0dHIoJ2FsdCcpO1xuXG4gICAgICB0aGlzLiRpbWFnZSA9ICRpbWFnZSA9ICQoJzxpbWcgc3JjPVwiJyArIHVybCArICdcIiBhbHQ9XCInICsgYWx0ICsgJ1wiPicpO1xuXG4gICAgICAkaW1hZ2UuXG4gICAgICAgIHRvZ2dsZUNsYXNzKENMQVNTX1RSQU5TSVRJT04sIG9wdGlvbnMudHJhbnNpdGlvbikuXG4gICAgICAgIHRvZ2dsZUNsYXNzKENMQVNTX01PVkUsIG9wdGlvbnMubW92YWJsZSkuXG4gICAgICAgIGNzcyh7XG4gICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgaGVpZ2h0OiAwLFxuICAgICAgICAgIG1hcmdpbkxlZnQ6IHZpZXdlci53aWR0aCAvIDIsXG4gICAgICAgICAgbWFyZ2luVG9wOiB2aWV3ZXIuaGVpZ2h0IC8gMlxuICAgICAgICB9KTtcblxuICAgICAgdGhpcy4kaXRlbXMuZXEodGhpcy5pbmRleCkucmVtb3ZlQ2xhc3MoQ0xBU1NfQUNUSVZFKTtcbiAgICAgICRpdGVtLmFkZENsYXNzKENMQVNTX0FDVElWRSk7XG5cbiAgICAgIHRoaXMuaXNWaWV3ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgICAgIHRoaXMuaW1hZ2UgPSBudWxsO1xuICAgICAgJGltYWdlLm9uZShFVkVOVF9MT0FELCAkLnByb3h5KHRoaXMubG9hZCwgdGhpcykpO1xuICAgICAgdGhpcy4kY2FudmFzLmh0bWwoJGltYWdlKTtcbiAgICAgICR0aXRsZS5lbXB0eSgpO1xuXG4gICAgICAvLyBDZW50ZXIgY3VycmVudCBpdGVtXG4gICAgICB0aGlzLnJlbmRlckxpc3QoKTtcblxuICAgICAgLy8gU2hvdyB0aXRsZSB3aGVuIHZpZXdlZFxuICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRVZFTlRfVklFV0VELCAkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGltYWdlID0gdGhpcy5pbWFnZTtcbiAgICAgICAgdmFyIHdpZHRoID0gaW1hZ2UubmF0dXJhbFdpZHRoO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gaW1hZ2UubmF0dXJhbEhlaWdodDtcblxuICAgICAgICAkdGl0bGUuaHRtbChhbHQgKyAnICgnICsgd2lkdGggKyAnICZ0aW1lczsgJyArIGhlaWdodCArICcpJyk7XG4gICAgICB9LCB0aGlzKSk7XG4gICAgfSxcblxuICAgIC8vIFZpZXcgdGhlIHByZXZpb3VzIGltYWdlXG4gICAgcHJldjogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy52aWV3KG1heCh0aGlzLmluZGV4IC0gMSwgMCkpO1xuICAgIH0sXG5cbiAgICAvLyBWaWV3IHRoZSBuZXh0IGltYWdlXG4gICAgbmV4dDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy52aWV3KG1pbih0aGlzLmluZGV4ICsgMSwgdGhpcy5sZW5ndGggLSAxKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vdmUgdGhlIGltYWdlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0WFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRZIChvcHRpb25hbClcbiAgICAgKi9cbiAgICBtb3ZlOiBmdW5jdGlvbiAob2Zmc2V0WCwgb2Zmc2V0WSkge1xuICAgICAgdmFyIGltYWdlID0gdGhpcy5pbWFnZTtcblxuICAgICAgLy8gSWYgXCJvZmZzZXRZXCIgaXMgbm90IHByZXNlbnQsIGl0cyBkZWZhdWx0IHZhbHVlIGlzIFwib2Zmc2V0WFwiXG4gICAgICBpZiAoaXNVbmRlZmluZWQob2Zmc2V0WSkpIHtcbiAgICAgICAgb2Zmc2V0WSA9IG9mZnNldFg7XG4gICAgICB9XG5cbiAgICAgIG9mZnNldFggPSBudW0ob2Zmc2V0WCk7XG4gICAgICBvZmZzZXRZID0gbnVtKG9mZnNldFkpO1xuXG4gICAgICBpZiAodGhpcy5pc1Nob3duICYmICF0aGlzLmlzUGxheWVkICYmIHRoaXMub3B0aW9ucy5tb3ZhYmxlKSB7XG4gICAgICAgIGltYWdlLmxlZnQgKz0gaXNOdW1iZXIob2Zmc2V0WCkgPyBvZmZzZXRYIDogMDtcbiAgICAgICAgaW1hZ2UudG9wICs9IGlzTnVtYmVyKG9mZnNldFkpID8gb2Zmc2V0WSA6IDA7XG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogWm9vbSB0aGUgaW1hZ2VcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSByYXRpb1xuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaGFzVG9vbHRpcCAob3B0aW9uYWwpXG4gICAgICovXG4gICAgem9vbTogZnVuY3Rpb24gKHJhdGlvLCBoYXNUb29sdGlwKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciBtaW5ab29tUmF0aW8gPSBtYXgoMC4wMSwgb3B0aW9ucy5taW5ab29tUmF0aW8pO1xuICAgICAgdmFyIG1heFpvb21SYXRpbyA9IG1pbigxMDAsIG9wdGlvbnMubWF4Wm9vbVJhdGlvKTtcbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuaW1hZ2U7XG4gICAgICB2YXIgd2lkdGg7XG4gICAgICB2YXIgaGVpZ2h0O1xuXG4gICAgICByYXRpbyA9IG51bShyYXRpbyk7XG5cbiAgICAgIGlmIChpc051bWJlcihyYXRpbykgJiYgdGhpcy5pc1Nob3duICYmICF0aGlzLmlzUGxheWVkICYmIG9wdGlvbnMuem9vbWFibGUpIHtcbiAgICAgICAgaWYgKHJhdGlvIDwgMCkge1xuICAgICAgICAgIHJhdGlvID0gIDEgLyAoMSAtIHJhdGlvKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYXRpbyA9IDEgKyByYXRpbztcbiAgICAgICAgfVxuXG4gICAgICAgIHdpZHRoID0gaW1hZ2Uud2lkdGggKiByYXRpbztcbiAgICAgICAgaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0ICogcmF0aW87XG4gICAgICAgIHJhdGlvID0gd2lkdGggLyBpbWFnZS5uYXR1cmFsV2lkdGg7XG4gICAgICAgIHJhdGlvID0gbWluKG1heChyYXRpbywgbWluWm9vbVJhdGlvKSwgbWF4Wm9vbVJhdGlvKTtcblxuICAgICAgICBpZiAocmF0aW8gPiAwLjk1ICYmIHJhdGlvIDwgMS4wNSkge1xuICAgICAgICAgIHJhdGlvID0gMTtcbiAgICAgICAgICB3aWR0aCA9IGltYWdlLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgICBoZWlnaHQgPSBpbWFnZS5uYXR1cmFsSGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgaW1hZ2UubGVmdCAtPSAod2lkdGggLSBpbWFnZS53aWR0aCkgLyAyO1xuICAgICAgICBpbWFnZS50b3AgLT0gKGhlaWdodCAtIGltYWdlLmhlaWdodCkgLyAyO1xuICAgICAgICBpbWFnZS53aWR0aCA9IHdpZHRoO1xuICAgICAgICBpbWFnZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGltYWdlLnJhdGlvID0gcmF0aW87XG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoKTtcblxuICAgICAgICBpZiAoaGFzVG9vbHRpcCkge1xuICAgICAgICAgIHRoaXMudG9vbHRpcCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFpvb20gdGhlIGltYWdlIHRvIGEgc3BlY2lhbCByYXRpb1xuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJhdGlvXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBoYXNUb29sdGlwIChvcHRpb25hbClcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IF96b29tYWJsZSAocHJpdmF0ZSlcbiAgICAgKi9cbiAgICB6b29tVG86IGZ1bmN0aW9uIChyYXRpbywgaGFzVG9vbHRpcCwgX3pvb21hYmxlKSB7XG4gICAgICB2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuICAgICAgdmFyIHdpZHRoO1xuICAgICAgdmFyIGhlaWdodDtcblxuICAgICAgcmF0aW8gPSBtYXgocmF0aW8sIDApO1xuXG4gICAgICBpZiAoaXNOdW1iZXIocmF0aW8pICYmIHRoaXMuaXNTaG93biAmJiAhdGhpcy5pc1BsYXllZCAmJiAoX3pvb21hYmxlIHx8IHRoaXMub3B0aW9ucy56b29tYWJsZSkpIHtcbiAgICAgICAgd2lkdGggPSBpbWFnZS5uYXR1cmFsV2lkdGggKiByYXRpbztcbiAgICAgICAgaGVpZ2h0ID0gaW1hZ2UubmF0dXJhbEhlaWdodCAqIHJhdGlvO1xuICAgICAgICBpbWFnZS5sZWZ0IC09ICh3aWR0aCAtIGltYWdlLndpZHRoKSAvIDI7XG4gICAgICAgIGltYWdlLnRvcCAtPSAoaGVpZ2h0IC0gaW1hZ2UuaGVpZ2h0KSAvIDI7XG4gICAgICAgIGltYWdlLndpZHRoID0gd2lkdGg7XG4gICAgICAgIGltYWdlLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgaW1hZ2UucmF0aW8gPSByYXRpbztcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZSgpO1xuXG4gICAgICAgIGlmIChoYXNUb29sdGlwKSB7XG4gICAgICAgICAgdGhpcy50b29sdGlwKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIHRoZSBpbWFnZVxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy90cmFuc2Zvcm0tZnVuY3Rpb24jcm90YXRlKClcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkZWdyZWVzXG4gICAgICovXG4gICAgcm90YXRlOiBmdW5jdGlvbiAoZGVncmVlcykge1xuICAgICAgdmFyIGltYWdlID0gdGhpcy5pbWFnZTtcblxuICAgICAgZGVncmVlcyA9IG51bShkZWdyZWVzKTtcblxuICAgICAgaWYgKGlzTnVtYmVyKGRlZ3JlZXMpICYmIHRoaXMuaXNTaG93biAmJiAhdGhpcy5pc1BsYXllZCAmJiB0aGlzLm9wdGlvbnMucm90YXRhYmxlKSB7XG4gICAgICAgIGltYWdlLnJvdGF0ZSA9ICgoaW1hZ2Uucm90YXRlIHx8IDApICsgZGVncmVlcyk7XG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUm90YXRlIHRoZSBpbWFnZSB0byBhIHNwZWNpYWwgYW5nbGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBkZWdyZWVzXG4gICAgICovXG4gICAgcm90YXRlVG86IGZ1bmN0aW9uIChkZWdyZWVzKSB7XG4gICAgICB2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuXG4gICAgICBkZWdyZWVzID0gbnVtKGRlZ3JlZXMpO1xuXG4gICAgICBpZiAoaXNOdW1iZXIoZGVncmVlcykgJiYgdGhpcy5pc1Nob3duICYmICF0aGlzLmlzUGxheWVkICYmIHRoaXMub3B0aW9ucy5yb3RhdGFibGUpIHtcbiAgICAgICAgaW1hZ2Uucm90YXRlID0gZGVncmVlcztcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTY2FsZSB0aGUgaW1hZ2VcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvdHJhbnNmb3JtLWZ1bmN0aW9uI3NjYWxlKClcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZVhcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gc2NhbGVZIChvcHRpb25hbClcbiAgICAgKi9cbiAgICBzY2FsZTogZnVuY3Rpb24gKHNjYWxlWCwgc2NhbGVZKSB7XG4gICAgICB2YXIgaW1hZ2UgPSB0aGlzLmltYWdlO1xuXG4gICAgICAvLyBJZiBcInNjYWxlWVwiIGlzIG5vdCBwcmVzZW50LCBpdHMgZGVmYXVsdCB2YWx1ZSBpcyBcInNjYWxlWFwiXG4gICAgICBpZiAoaXNVbmRlZmluZWQoc2NhbGVZKSkge1xuICAgICAgICBzY2FsZVkgPSBzY2FsZVg7XG4gICAgICB9XG5cbiAgICAgIHNjYWxlWCA9IG51bShzY2FsZVgpO1xuICAgICAgc2NhbGVZID0gbnVtKHNjYWxlWSk7XG5cbiAgICAgIGlmICh0aGlzLmlzU2hvd24gJiYgIXRoaXMuaXNQbGF5ZWQgJiYgdGhpcy5vcHRpb25zLnNjYWxhYmxlKSB7XG4gICAgICAgIGltYWdlLnNjYWxlWCA9IGlzTnVtYmVyKHNjYWxlWCkgPyBzY2FsZVggOiAxO1xuICAgICAgICBpbWFnZS5zY2FsZVkgPSBpc051bWJlcihzY2FsZVkpID8gc2NhbGVZIDogMTtcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTY2FsZSB0aGUgYWJzY2lzc2Egb2YgdGhlIGltYWdlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gc2NhbGVYXG4gICAgICovXG4gICAgc2NhbGVYOiBmdW5jdGlvbiAoc2NhbGVYKSB7XG4gICAgICB0aGlzLnNjYWxlKHNjYWxlWCwgdGhpcy5pbWFnZS5zY2FsZVkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTY2FsZSB0aGUgb3JkaW5hdGUgb2YgdGhlIGltYWdlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gc2NhbGVZXG4gICAgICovXG4gICAgc2NhbGVZOiBmdW5jdGlvbiAoc2NhbGVZKSB7XG4gICAgICB0aGlzLnNjYWxlKHRoaXMuaW1hZ2Uuc2NhbGVYLCBzY2FsZVkpO1xuICAgIH0sXG5cbiAgICAvLyBQbGF5IHRoZSBpbWFnZXNcbiAgICBwbGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIHZhciAkcGxheWVyID0gdGhpcy4kcGxheWVyO1xuICAgICAgdmFyIGxvYWQgPSAkLnByb3h5KHRoaXMubG9hZEltYWdlLCB0aGlzKTtcbiAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICB2YXIgdG90YWwgPSAwO1xuICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgIHZhciBwbGF5aW5nO1xuXG4gICAgICBpZiAoIXRoaXMuaXNTaG93biB8fCB0aGlzLmlzUGxheWVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuZnVsbHNjcmVlbikge1xuICAgICAgICB0aGlzLmZ1bGxzY3JlZW4oKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pc1BsYXllZCA9IHRydWU7XG4gICAgICAkcGxheWVyLmFkZENsYXNzKENMQVNTX1NIT1cpO1xuXG4gICAgICB0aGlzLiRpdGVtcy5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIHZhciAkaW1nID0gJHRoaXMuZmluZChTRUxFQ1RPUl9JTUcpO1xuICAgICAgICB2YXIgJGltYWdlID0gJCgnPGltZyBzcmM9XCInICsgJGltZy5kYXRhKCdvcmlnaW5hbFVybCcpICsgJ1wiIGFsdD1cIicgKyAkaW1nLmF0dHIoJ2FsdCcpICsgJ1wiPicpO1xuXG4gICAgICAgIHRvdGFsKys7XG5cbiAgICAgICAgJGltYWdlLmFkZENsYXNzKENMQVNTX0ZBREUpLnRvZ2dsZUNsYXNzKENMQVNTX1RSQU5TSVRJT04sIG9wdGlvbnMudHJhbnNpdGlvbik7XG5cbiAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKENMQVNTX0FDVElWRSkpIHtcbiAgICAgICAgICAkaW1hZ2UuYWRkQ2xhc3MoQ0xBU1NfSU4pO1xuICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3QucHVzaCgkaW1hZ2UpO1xuICAgICAgICAkaW1hZ2Uub25lKEVWRU5UX0xPQUQsIHtcbiAgICAgICAgICBmaWxsZWQ6IGZhbHNlXG4gICAgICAgIH0sIGxvYWQpO1xuICAgICAgICAkcGxheWVyLmFwcGVuZCgkaW1hZ2UpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChpc051bWJlcihvcHRpb25zLmludGVydmFsKSAmJiBvcHRpb25zLmludGVydmFsID4gMCkge1xuICAgICAgICBwbGF5aW5nID0gJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5wbGF5aW5nID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsaXN0W2luZGV4XS5yZW1vdmVDbGFzcyhDTEFTU19JTik7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgaW5kZXggPSBpbmRleCA8IHRvdGFsID8gaW5kZXggOiAwO1xuICAgICAgICAgICAgbGlzdFtpbmRleF0uYWRkQ2xhc3MoQ0xBU1NfSU4pO1xuXG4gICAgICAgICAgICBwbGF5aW5nKCk7XG4gICAgICAgICAgfSwgb3B0aW9ucy5pbnRlcnZhbCk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmICh0b3RhbCA+IDEpIHtcbiAgICAgICAgICBwbGF5aW5nKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gU3RvcCBwbGF5XG4gICAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0aGlzLmlzUGxheWVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pc1BsYXllZCA9IGZhbHNlO1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucGxheWluZyk7XG4gICAgICB0aGlzLiRwbGF5ZXIucmVtb3ZlQ2xhc3MoQ0xBU1NfU0hPVykuZW1wdHkoKTtcbiAgICB9LFxuXG4gICAgLy8gRW50ZXIgbW9kYWwgbW9kZSAob25seSBhdmFpbGFibGUgaW4gaW5saW5lIG1vZGUpXG4gICAgZnVsbDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJGltYWdlID0gdGhpcy4kaW1hZ2U7XG4gICAgICB2YXIgJGxpc3QgPSB0aGlzLiRsaXN0O1xuXG4gICAgICBpZiAoIXRoaXMuaXNTaG93biB8fCB0aGlzLmlzUGxheWVkIHx8IHRoaXMuaXNGdWxsZWQgfHwgIW9wdGlvbnMuaW5saW5lKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pc0Z1bGxlZCA9IHRydWU7XG4gICAgICB0aGlzLiRib2R5LmFkZENsYXNzKENMQVNTX09QRU4pO1xuICAgICAgdGhpcy4kYnV0dG9uLmFkZENsYXNzKENMQVNTX0ZVTExTQ1JFRU5fRVhJVCk7XG5cbiAgICAgIGlmIChvcHRpb25zLnRyYW5zaXRpb24pIHtcbiAgICAgICAgJGltYWdlLnJlbW92ZUNsYXNzKENMQVNTX1RSQU5TSVRJT04pO1xuICAgICAgICAkbGlzdC5yZW1vdmVDbGFzcyhDTEFTU19UUkFOU0lUSU9OKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy4kdmlld2VyLmFkZENsYXNzKENMQVNTX0ZJWEVEKS5yZW1vdmVBdHRyKCdzdHlsZScpLmNzcygnei1pbmRleCcsIG9wdGlvbnMuekluZGV4KTtcbiAgICAgIHRoaXMuaW5pdENvbnRhaW5lcigpO1xuICAgICAgdGhpcy52aWV3ZXIgPSAkLmV4dGVuZCh7fSwgdGhpcy5jb250YWluZXIpO1xuICAgICAgdGhpcy5yZW5kZXJMaXN0KCk7XG4gICAgICB0aGlzLmluaXRJbWFnZSgkLnByb3h5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJJbWFnZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMudHJhbnNpdGlvbikge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICRpbWFnZS5hZGRDbGFzcyhDTEFTU19UUkFOU0lUSU9OKTtcbiAgICAgICAgICAgICAgJGxpc3QuYWRkQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTik7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSwgdGhpcykpO1xuICAgIH0sXG5cbiAgICAvLyBFeGl0IG1vZGFsIG1vZGUgKG9ubHkgYXZhaWxhYmxlIGluIGlubGluZSBtb2RlKVxuICAgIGV4aXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgdmFyICRpbWFnZSA9IHRoaXMuJGltYWdlO1xuICAgICAgdmFyICRsaXN0ID0gdGhpcy4kbGlzdDtcblxuICAgICAgaWYgKCF0aGlzLmlzRnVsbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pc0Z1bGxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy4kYm9keS5yZW1vdmVDbGFzcyhDTEFTU19PUEVOKTtcbiAgICAgIHRoaXMuJGJ1dHRvbi5yZW1vdmVDbGFzcyhDTEFTU19GVUxMU0NSRUVOX0VYSVQpO1xuXG4gICAgICBpZiAob3B0aW9ucy50cmFuc2l0aW9uKSB7XG4gICAgICAgICRpbWFnZS5yZW1vdmVDbGFzcyhDTEFTU19UUkFOU0lUSU9OKTtcbiAgICAgICAgJGxpc3QucmVtb3ZlQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJHZpZXdlci5yZW1vdmVDbGFzcyhDTEFTU19GSVhFRCkuY3NzKCd6LWluZGV4Jywgb3B0aW9ucy56SW5kZXhJbmxpbmUpO1xuICAgICAgdGhpcy52aWV3ZXIgPSAkLmV4dGVuZCh7fSwgdGhpcy5wYXJlbnQpO1xuICAgICAgdGhpcy5yZW5kZXJWaWV3ZXIoKTtcbiAgICAgIHRoaXMucmVuZGVyTGlzdCgpO1xuICAgICAgdGhpcy5pbml0SW1hZ2UoJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChvcHRpb25zLnRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkaW1hZ2UuYWRkQ2xhc3MoQ0xBU1NfVFJBTlNJVElPTik7XG4gICAgICAgICAgICAgICRsaXN0LmFkZENsYXNzKENMQVNTX1RSQU5TSVRJT04pO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sIHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLy8gU2hvdyB0aGUgY3VycmVudCByYXRpbyBvZiB0aGUgaW1hZ2Ugd2l0aCBwZXJjZW50YWdlXG4gICAgdG9vbHRpcDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICB2YXIgJHRvb2x0aXAgPSB0aGlzLiR0b29sdGlwO1xuICAgICAgdmFyIGltYWdlID0gdGhpcy5pbWFnZTtcbiAgICAgIHZhciBjbGFzc2VzID0gW1xuICAgICAgICAgICAgQ0xBU1NfU0hPVyxcbiAgICAgICAgICAgIENMQVNTX0ZBREUsXG4gICAgICAgICAgICBDTEFTU19UUkFOU0lUSU9OXG4gICAgICAgICAgXS5qb2luKCcgJyk7XG5cbiAgICAgIGlmICghdGhpcy5pc1Nob3duIHx8IHRoaXMuaXNQbGF5ZWQgfHwgIW9wdGlvbnMudG9vbHRpcCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgICR0b29sdGlwLnRleHQocm91bmQoaW1hZ2UucmF0aW8gKiAxMDApICsgJyUnKTtcblxuICAgICAgaWYgKCF0aGlzLmZhZGluZykge1xuICAgICAgICBpZiAob3B0aW9ucy50cmFuc2l0aW9uKSB7XG5cbiAgICAgICAgICAvKiBqc2hpbnQgZXhwcjp0cnVlICovXG4gICAgICAgICAgJHRvb2x0aXAuYWRkQ2xhc3MoY2xhc3NlcykuZ2V0KDApLm9mZnNldFdpZHRoO1xuICAgICAgICAgICR0b29sdGlwLmFkZENsYXNzKENMQVNTX0lOKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdG9vbHRpcC5hZGRDbGFzcyhDTEFTU19TSE9XKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZmFkaW5nKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5mYWRpbmcgPSBzZXRUaW1lb3V0KCQucHJveHkoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAob3B0aW9ucy50cmFuc2l0aW9uKSB7XG4gICAgICAgICAgJHRvb2x0aXAub25lKEVWRU5UX1RSQU5TSVRJT05FTkQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICR0b29sdGlwLnJlbW92ZUNsYXNzKGNsYXNzZXMpO1xuICAgICAgICAgIH0pLnJlbW92ZUNsYXNzKENMQVNTX0lOKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdG9vbHRpcC5yZW1vdmVDbGFzcyhDTEFTU19TSE9XKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZmFkaW5nID0gZmFsc2U7XG4gICAgICB9LCB0aGlzKSwgMTAwMCk7XG4gICAgfSxcblxuICAgIC8vIFRvZ2dsZSB0aGUgaW1hZ2Ugc2l6ZSBiZXR3ZWVuIGl0cyBuYXR1cmFsIHNpemUgYW5kIGluaXRpYWwgc2l6ZS5cbiAgICB0b2dnbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLmltYWdlLnJhdGlvID09PSAxKSB7XG4gICAgICAgIHRoaXMuem9vbVRvKHRoaXMuaW5pdGlhbEltYWdlLnJhdGlvKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuem9vbVRvKDEpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBSZXNldCB0aGUgaW1hZ2UgdG8gaXRzIGluaXRpYWwgc3RhdGUuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLmlzU2hvd24gJiYgIXRoaXMuaXNQbGF5ZWQpIHtcbiAgICAgICAgdGhpcy5pbWFnZSA9ICQuZXh0ZW5kKHt9LCB0aGlzLmluaXRpYWxJbWFnZSk7XG4gICAgICAgIHRoaXMucmVuZGVySW1hZ2UoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gRGVzdHJveSB0aGUgdmlld2VyXG4gICAgZGVzdHJveTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gdGhpcy4kZWxlbWVudDtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5pbmxpbmUpIHtcbiAgICAgICAgdGhpcy51bmJpbmQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmlzU2hvd24pIHtcbiAgICAgICAgICB0aGlzLnVuYmluZCgpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAZGVidWdcbiAgICAgICAgICogQENsb3VkXG4gICAgICAgICAqIEZpeCBuby1pbWFnZXMgYnVnLCBhZGQgbGVuZ3RoIGluc3BlY3Q6XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLiRpbWFnZXMgPyB0aGlzLiRpbWFnZXMucmVtb3ZlQ2xhc3MoQ0xBU1NfVE9HR0xFKSA6ICcnO1xuXG4gICAgICAgICR0aGlzLm9mZihFVkVOVF9DTElDSywgdGhpcy5zdGFydCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudW5idWlsZCgpO1xuICAgICAgJHRoaXMucmVtb3ZlRGF0YShOQU1FU1BBQ0UpO1xuICAgIH1cbiAgfSk7XG5cbiAgJC5leHRlbmQocHJvdG90eXBlLCB7XG5cbiAgICAvLyBBIHNob3J0Y3V0IGZvciB0cmlnZ2VyaW5nIGN1c3RvbSBldmVudHNcbiAgICB0cmlnZ2VyOiBmdW5jdGlvbiAodHlwZSwgZGF0YSkge1xuICAgICAgdmFyIGUgPSAkLkV2ZW50KHR5cGUsIGRhdGEpO1xuXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSk7XG5cbiAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICBzaG93bjogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5pc0Z1bGxlZCA9IHRydWU7XG4gICAgICB0aGlzLmlzU2hvd24gPSB0cnVlO1xuICAgICAgdGhpcy5pc1Zpc2libGUgPSB0cnVlO1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgIHRoaXMuYmluZCgpO1xuXG4gICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMuc2hvd24pKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub25lKEVWRU5UX1NIT1dOLCBvcHRpb25zLnNob3duKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy50cmlnZ2VyKEVWRU5UX1NIT1dOKTtcbiAgICB9LFxuXG4gICAgaGlkZGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmlzVmlld2VkID0gZmFsc2U7XG4gICAgICB0aGlzLmlzRnVsbGVkID0gZmFsc2U7XG4gICAgICB0aGlzLmlzU2hvd24gPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNWaXNpYmxlID0gZmFsc2U7XG4gICAgICB0aGlzLnVuYmluZCgpO1xuICAgICAgdGhpcy4kYm9keS5yZW1vdmVDbGFzcyhDTEFTU19PUEVOKTtcbiAgICAgIHRoaXMuJHZpZXdlci5hZGRDbGFzcyhDTEFTU19ISURFKTtcbiAgICAgIHRoaXMucmVzZXRMaXN0KCk7XG4gICAgICB0aGlzLnJlc2V0SW1hZ2UoKTtcblxuICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLmhpZGRlbikpIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbmUoRVZFTlRfSElEREVOLCBvcHRpb25zLmhpZGRlbik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudHJpZ2dlcihFVkVOVF9ISURERU4pO1xuICAgIH0sXG5cbiAgICBmdWxsc2NyZWVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZG9jdW1lbnRFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gICAgICBpZiAodGhpcy5pc0Z1bGxlZCAmJiAhZG9jdW1lbnQuZnVsbHNjcmVlbkVsZW1lbnQgJiYgIWRvY3VtZW50Lm1vekZ1bGxTY3JlZW5FbGVtZW50ICYmXG4gICAgICAgICFkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudCAmJiAhZG9jdW1lbnQubXNGdWxsc2NyZWVuRWxlbWVudCkge1xuXG4gICAgICAgIGlmIChkb2N1bWVudEVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4pIHtcbiAgICAgICAgICBkb2N1bWVudEVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudEVsZW1lbnQubXNSZXF1ZXN0RnVsbHNjcmVlbikge1xuICAgICAgICAgIGRvY3VtZW50RWxlbWVudC5tc1JlcXVlc3RGdWxsc2NyZWVuKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnRFbGVtZW50Lm1velJlcXVlc3RGdWxsU2NyZWVuKSB7XG4gICAgICAgICAgZG9jdW1lbnRFbGVtZW50Lm1velJlcXVlc3RGdWxsU2NyZWVuKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnRFbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKSB7XG4gICAgICAgICAgZG9jdW1lbnRFbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKEVsZW1lbnQuQUxMT1dfS0VZQk9BUkRfSU5QVVQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG9mZnNldFggPSB0aGlzLmVuZFggLSB0aGlzLnN0YXJ0WDtcbiAgICAgIHZhciBvZmZzZXRZID0gdGhpcy5lbmRZIC0gdGhpcy5zdGFydFk7XG5cbiAgICAgIHN3aXRjaCAodGhpcy5hY3Rpb24pIHtcblxuICAgICAgICAvLyBNb3ZlIHRoZSBjdXJyZW50IGltYWdlXG4gICAgICAgIGNhc2UgJ21vdmUnOlxuICAgICAgICAgIHRoaXMubW92ZShvZmZzZXRYLCBvZmZzZXRZKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICAvLyBab29tIHRoZSBjdXJyZW50IGltYWdlXG4gICAgICAgIGNhc2UgJ3pvb20nOlxuICAgICAgICAgIHRoaXMuem9vbShmdW5jdGlvbiAoeDEsIHkxLCB4MiwgeTIpIHtcbiAgICAgICAgICAgIHZhciB6MSA9IHNxcnQoeDEgKiB4MSArIHkxICogeTEpO1xuICAgICAgICAgICAgdmFyIHoyID0gc3FydCh4MiAqIHgyICsgeTIgKiB5Mik7XG5cbiAgICAgICAgICAgIHJldHVybiAoejIgLSB6MSkgLyB6MTtcbiAgICAgICAgICB9KFxuICAgICAgICAgICAgYWJzKHRoaXMuc3RhcnRYIC0gdGhpcy5zdGFydFgyKSxcbiAgICAgICAgICAgIGFicyh0aGlzLnN0YXJ0WSAtIHRoaXMuc3RhcnRZMiksXG4gICAgICAgICAgICBhYnModGhpcy5lbmRYIC0gdGhpcy5lbmRYMiksXG4gICAgICAgICAgICBhYnModGhpcy5lbmRZIC0gdGhpcy5lbmRZMilcbiAgICAgICAgICApKTtcblxuICAgICAgICAgIHRoaXMuc3RhcnRYMiA9IHRoaXMuZW5kWDI7XG4gICAgICAgICAgdGhpcy5zdGFydFkyID0gdGhpcy5lbmRZMjtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdzd2l0Y2gnOlxuICAgICAgICAgIHRoaXMuYWN0aW9uID0gJ3N3aXRjaGVkJztcblxuICAgICAgICAgIGlmIChvZmZzZXRYID4gMSkge1xuICAgICAgICAgICAgdGhpcy5wcmV2KCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXRYIDwgLTEpIHtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIC8vIE5vIGRlZmF1bHRcbiAgICAgIH1cblxuICAgICAgLy8gT3ZlcnJpZGVcbiAgICAgIHRoaXMuc3RhcnRYID0gdGhpcy5lbmRYO1xuICAgICAgdGhpcy5zdGFydFkgPSB0aGlzLmVuZFk7XG4gICAgfSxcblxuICAgIGlzU3dpdGNoYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGltYWdlID0gdGhpcy5pbWFnZTtcbiAgICAgIHZhciB2aWV3ZXIgPSB0aGlzLnZpZXdlcjtcblxuICAgICAgcmV0dXJuIChpbWFnZS5sZWZ0ID49IDAgJiYgaW1hZ2UudG9wID49IDAgJiYgaW1hZ2Uud2lkdGggPD0gdmlld2VyLndpZHRoICYmXG4gICAgICAgIGltYWdlLmhlaWdodCA8PSB2aWV3ZXIuaGVpZ2h0KTtcbiAgICB9XG4gIH0pO1xuXG4gICQuZXh0ZW5kKFZpZXdlci5wcm90b3R5cGUsIHByb3RvdHlwZSk7XG5cbiAgVmlld2VyLkRFRkFVTFRTID0ge1xuICAgIC8vIEVuYWJsZSBpbmxpbmUgbW9kZVxuICAgIGlubGluZTogZmFsc2UsXG5cbiAgICAvLyBTaG93IHRoZSBidXR0b24gb24gdGhlIHRvcC1yaWdodCBvZiB0aGUgdmlld2VyXG4gICAgYnV0dG9uOiB0cnVlLFxuXG4gICAgLy8gU2hvdyB0aGUgbmF2YmFyXG4gICAgbmF2YmFyOiB0cnVlLFxuXG4gICAgLy8gU2hvdyB0aGUgdGl0bGVcbiAgICB0aXRsZTogdHJ1ZSxcblxuICAgIC8vIFNob3cgdGhlIHRvb2xiYXJcbiAgICB0b29sYmFyOiB0cnVlLFxuXG4gICAgLy8gU2hvdyB0aGUgdG9vbHRpcCB3aXRoIGltYWdlIHJhdGlvIChwZXJjZW50YWdlKSB3aGVuIHpvb20gaW4gb3Igem9vbSBvdXRcbiAgICB0b29sdGlwOiB0cnVlLFxuXG4gICAgLy8gRW5hYmxlIHRvIG1vdmUgdGhlIGltYWdlXG4gICAgbW92YWJsZTogdHJ1ZSxcblxuICAgIC8vIEVuYWJsZSB0byB6b29tIHRoZSBpbWFnZVxuICAgIHpvb21hYmxlOiB0cnVlLFxuXG4gICAgLy8gRW5hYmxlIHRvIHJvdGF0ZSB0aGUgaW1hZ2VcbiAgICByb3RhdGFibGU6IHRydWUsXG5cbiAgICAvLyBFbmFibGUgdG8gc2NhbGUgdGhlIGltYWdlXG4gICAgc2NhbGFibGU6IHRydWUsXG5cbiAgICAvLyBFbmFibGUgQ1NTMyBUcmFuc2l0aW9uIGZvciBzb21lIHNwZWNpYWwgZWxlbWVudHNcbiAgICB0cmFuc2l0aW9uOiB0cnVlLFxuXG4gICAgLy8gRW5hYmxlIHRvIHJlcXVlc3QgZnVsbHNjcmVlbiB3aGVuIHBsYXlcbiAgICBmdWxsc2NyZWVuOiB0cnVlLFxuXG4gICAgLy8gRW5hYmxlIGtleWJvYXJkIHN1cHBvcnRcbiAgICBrZXlib2FyZDogdHJ1ZSxcblxuICAgIC8vIERlZmluZSBpbnRlcnZhbCBvZiBlYWNoIGltYWdlIHdoZW4gcGxheWluZ1xuICAgIGludGVydmFsOiA1MDAwLFxuXG4gICAgLy8gTWluIHdpZHRoIG9mIHRoZSB2aWV3ZXIgaW4gaW5saW5lIG1vZGVcbiAgICBtaW5XaWR0aDogMjAwLFxuXG4gICAgLy8gTWluIGhlaWdodCBvZiB0aGUgdmlld2VyIGluIGlubGluZSBtb2RlXG4gICAgbWluSGVpZ2h0OiAxMDAsXG5cbiAgICAvLyBEZWZpbmUgdGhlIHJhdGlvIHdoZW4gem9vbSB0aGUgaW1hZ2UgYnkgd2hlZWxpbmcgbW91c2VcbiAgICB6b29tUmF0aW86IDAuMSxcblxuICAgIC8vIERlZmluZSB0aGUgbWluIHJhdGlvIG9mIHRoZSBpbWFnZSB3aGVuIHpvb20gb3V0XG4gICAgbWluWm9vbVJhdGlvOiAwLjAxLFxuXG4gICAgLy8gRGVmaW5lIHRoZSBtYXggcmF0aW8gb2YgdGhlIGltYWdlIHdoZW4gem9vbSBpblxuICAgIG1heFpvb21SYXRpbzogMTAwLFxuXG4gICAgLy8gRGVmaW5lIHRoZSBDU1MgYHotaW5kZXhgIHZhbHVlIG9mIHZpZXdlciBpbiBtb2RhbCBtb2RlLlxuICAgIHpJbmRleDogMjAxNSxcblxuICAgIC8vIERlZmluZSB0aGUgQ1NTIGB6LWluZGV4YCB2YWx1ZSBvZiB2aWV3ZXIgaW4gaW5saW5lIG1vZGUuXG4gICAgekluZGV4SW5saW5lOiAwLFxuXG4gICAgLy8gRGVmaW5lIHdoZXJlIHRvIGdldCB0aGUgb3JpZ2luYWwgaW1hZ2UgVVJMIGZvciB2aWV3aW5nXG4gICAgLy8gVHlwZTogU3RyaW5nIChhbiBpbWFnZSBhdHRyaWJ1dGUpIG9yIEZ1bmN0aW9uIChzaG91bGQgcmV0dXJuIGFuIGltYWdlIFVSTClcbiAgICB1cmw6ICdzcmMnLFxuXG4gICAgLy8gRXZlbnQgc2hvcnRjdXRzXG4gICAgYnVpbGQ6IG51bGwsXG4gICAgYnVpbHQ6IG51bGwsXG4gICAgc2hvdzogbnVsbCxcbiAgICBzaG93bjogbnVsbCxcbiAgICBoaWRlOiBudWxsLFxuICAgIGhpZGRlbjogbnVsbFxuICB9O1xuXG4gIFZpZXdlci5URU1QTEFURSA9IChcbiAgICAnPGRpdiBjbGFzcz1cInZpZXdlci1jb250YWluZXJcIj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwidmlld2VyLWNhbnZhc1wiPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJ2aWV3ZXItZm9vdGVyXCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwidmlld2VyLXRpdGxlXCI+PC9kaXY+JyArXG4gICAgICAgICc8dWwgY2xhc3M9XCJ2aWV3ZXItdG9vbGJhclwiPicgK1xuICAgICAgICAgICc8bGkgY2xhc3M9XCJ2aWV3ZXItem9vbS1pblwiIGRhdGEtYWN0aW9uPVwiem9vbS1pblwiPjwvbGk+JyArXG4gICAgICAgICAgJzxsaSBjbGFzcz1cInZpZXdlci16b29tLW91dFwiIGRhdGEtYWN0aW9uPVwiem9vbS1vdXRcIj48L2xpPicgK1xuICAgICAgICAgICc8bGkgY2xhc3M9XCJ2aWV3ZXItb25lLXRvLW9uZVwiIGRhdGEtYWN0aW9uPVwib25lLXRvLW9uZVwiPjwvbGk+JyArXG4gICAgICAgICAgJzxsaSBjbGFzcz1cInZpZXdlci1yZXNldFwiIGRhdGEtYWN0aW9uPVwicmVzZXRcIj48L2xpPicgK1xuICAgICAgICAgICc8bGkgY2xhc3M9XCJ2aWV3ZXItcHJldlwiIGRhdGEtYWN0aW9uPVwicHJldlwiPjwvbGk+JyArXG4gICAgICAgICAgJzxsaSBjbGFzcz1cInZpZXdlci1wbGF5XCIgZGF0YS1hY3Rpb249XCJwbGF5XCI+PC9saT4nICtcbiAgICAgICAgICAnPGxpIGNsYXNzPVwidmlld2VyLW5leHRcIiBkYXRhLWFjdGlvbj1cIm5leHRcIj48L2xpPicgK1xuICAgICAgICAgICc8bGkgY2xhc3M9XCJ2aWV3ZXItcm90YXRlLWxlZnRcIiBkYXRhLWFjdGlvbj1cInJvdGF0ZS1sZWZ0XCI+PC9saT4nICtcbiAgICAgICAgICAnPGxpIGNsYXNzPVwidmlld2VyLXJvdGF0ZS1yaWdodFwiIGRhdGEtYWN0aW9uPVwicm90YXRlLXJpZ2h0XCI+PC9saT4nICtcbiAgICAgICAgICAnPGxpIGNsYXNzPVwidmlld2VyLWZsaXAtaG9yaXpvbnRhbFwiIGRhdGEtYWN0aW9uPVwiZmxpcC1ob3Jpem9udGFsXCI+PC9saT4nICtcbiAgICAgICAgICAnPGxpIGNsYXNzPVwidmlld2VyLWZsaXAtdmVydGljYWxcIiBkYXRhLWFjdGlvbj1cImZsaXAtdmVydGljYWxcIj48L2xpPicgK1xuICAgICAgICAnPC91bD4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJ2aWV3ZXItbmF2YmFyXCI+JyArXG4gICAgICAgICAgJzx1bCBjbGFzcz1cInZpZXdlci1saXN0XCI+PC91bD4nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgJzwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJ2aWV3ZXItdG9vbHRpcFwiPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJ2aWV3ZXItYnV0dG9uXCIgZGF0YS1hY3Rpb249XCJtaXhcIj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwidmlld2VyLXBsYXllclwiPjwvZGl2PicgK1xuICAgICc8L2Rpdj4nXG4gICk7XG5cbiAgLy8gU2F2ZSB0aGUgb3RoZXIgdmlld2VyXG4gIFZpZXdlci5vdGhlciA9ICQuZm4udmlld2VyO1xuXG4gIC8vIFJlZ2lzdGVyIGFzIGpRdWVyeSBwbHVnaW5cbiAgJC5mbi52aWV3ZXIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMsIDEpO1xuICAgIHZhciByZXN1bHQ7XG5cbiAgICB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgIHZhciBkYXRhID0gJHRoaXMuZGF0YShOQU1FU1BBQ0UpO1xuICAgICAgdmFyIGZuO1xuXG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgaWYgKC9kZXN0cm95fGhpZGV8ZXhpdHxzdG9wfHJlc2V0Ly50ZXN0KG9wdGlvbnMpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJHRoaXMuZGF0YShOQU1FU1BBQ0UsIChkYXRhID0gbmV3IFZpZXdlcih0aGlzLCBvcHRpb25zKSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNTdHJpbmcob3B0aW9ucykgJiYgJC5pc0Z1bmN0aW9uKGZuID0gZGF0YVtvcHRpb25zXSkpIHtcbiAgICAgICAgcmVzdWx0ID0gZm4uYXBwbHkoZGF0YSwgYXJncyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaXNVbmRlZmluZWQocmVzdWx0KSA/IHRoaXMgOiByZXN1bHQ7XG4gIH07XG5cbiAgJC5mbi52aWV3ZXIuQ29uc3RydWN0b3IgPSBWaWV3ZXI7XG4gICQuZm4udmlld2VyLnNldERlZmF1bHRzID0gVmlld2VyLnNldERlZmF1bHRzO1xuXG4gIC8vIE5vIGNvbmZsaWN0XG4gICQuZm4udmlld2VyLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi52aWV3ZXIgPSBWaWV3ZXIub3RoZXI7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbn0pO1xuIl19
