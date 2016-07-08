/**
 * FOR ARTICLE COMMENT
 */


let aid, apiUrl, $comment, $v, $nickname, $c, $mail, $status, $postBtn;


let _commentCache = {}

function loadComment(cb){

    //if comments exist
    if($('.wrap > .content.content_full > .comment').length) return console.log('Comment Block existed!') || false;

    let $cardMeta = $('.wrap > .content > .card > .excerpt .full').not(':hidden').parents('.excerpt').prev('.card-meta')

    //set article
    aid = $cardMeta.find('._article_id').eq(0).val()

    function _cb(rs){
        
        $('.content.content_full').append($(rs))
        setVars()
        // debugger;
        cb ? cb(rs) : ''
    }

    //如果缓存中有，那么从缓存中读取
    apiUrl = `/comment/get/${aid}`
    let _cachedRes = _commentCache[apiUrl]
    if(_cachedRes){

        return _cb(_cachedRes)
    }

    
    $.ajax({
        'url': apiUrl,
        'type': 'POST',
        'dataType': 'html'
    })
    .done((res)=>{
        _cb(res)
        _commentCache[apiUrl] = res
    })
    .fail((err)=>{
        cb ? cb(rs) : ''
        console.log(err)
    })
}


function setVars(){
    $comment = $('.content.content_full .comment')

    $v = $('.content_full input[name="verification"]')
    $nickname = $('.content_full input[name="nickname"]')
    $c = $('.content_full textarea[name="comment_content"]')
    $mail =  $('.content_full input[name="mail"]')

    $status = $comment.find('.dialog .dialog-status')

    $postBtn = $('.comment-panel .post_btn')
}

function refreshVerification(){

    let src = $('#verification_img').attr('src')
    // $('#verification_img').attr('src', '')
    $('#verification_img').attr('src', MO.util.addURLParam(src, 'st', (new Date).getTime()))

    $v.val('')
}


function _refreshCache(_data){
    let newData = _data || $comment.get(0).outerHTML
    _commentCache[apiUrl] = newData
}


function addComment(evt){
    var $btn = $(this)
    if($btn.is('.disabled')){
        return false;
    }else {
        $btn.addClass('disabled')
    }
    
    let content = $c.val(),
        mail = $mail.val(),
        nickname = $nickname.val(),
        verification = $v.val()

    //是否是回复某个人
    let relCommentId = $status.data('id')
    let to = $status.data('toAuthor')
    let $list = $status.data('list')

    // console.log($list)


    let is_valid = true

    if(!verification) {
        $btn.removeClass('disabled')
        return alert('请填写验证码')
    }

    if(!content || !nickname){
        $btn.removeClass('disabled')
        return alert('请填写评论内容和称呼')
    }

    if(mail && !MO.util.validate(mail, 'mail')){
        $btn.removeClass('disabled')
        return alert('请填写正确的邮箱地址')
    }
    let _rd = MO.util.randomNum(1, 14)

    let avatarUrl = `/static/img/common/avatar/${_rd}.png`

    /**
     * @debug 
     */
    // get the content with a link 
    let _$f = MO.formatter.autolink($c),
        fContent = _$f.html()


    $.ajax({
        'url': `/comment/add/${aid}`,
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
    })
    .done((rs)=>{
        if($list && $list.length){
            console.log('Response Comment List')
            $list.append($(rs))
        }else {
            $comment.find('> ul').prepend($(rs))
        }

        //add count
        increaseCommentCount()
        _refreshCache()
        
        alert('评论成功')
        resetComment()
        
    })
    .fail((err)=>{
        console.log(err)
        refreshVerification()
        alert('验证码错误，请您重新输入')
    })
    .complete((result)=>{
        $btn.removeClass('disabled')
    })
}


function increaseCommentCount(){
    let $count = $comment.find('> h3 > span')
    let count = parseInt($count.html())

    // console.log(count)
    $count.html(count+1)
}

function destroyComment(){
    // $('.wrap > .content').off('click.comment')
    $comment.remove()
}


function resSomeone(){
    let $meta = $(this).parents('.comment-meta')
    let $absoluteMeta = $(this).parents('li').find('> .comment-meta')

    let $rel_list = $(this).parents('.response-list')
    if(!$rel_list.length) $rel_list = $meta.nextAll('.response-list')

    // console.log($rel_list)

    let commentId = $absoluteMeta.data('id')

    // console.log(commentId)

    let author = $meta.find('a[data-author]').data('author')

    // console.log(commentId)

    $status.data('id', commentId)
    $status.data('toAuthor', author)
    $status.data('list', $rel_list)

    $status.html(`回复 <a href="javascript:;">@${author}</a>`)
    // $comment.find('textarea').val(`回复 @${author}: \n`)
    $postBtn.html('回复')
    openCommentDialog()
}


function openCommentDialog(evt){
    $comment.find('.dialog-content').addClass('triggered')

    var statusOffsetTop = $status.offset().top-15

    $('html,body').animate({
        'scrollTop': `${statusOffsetTop}px`

    }, 400, ()=>{
        $comment.find('textarea').focus()
    })

    // document.body.scrollTop = $status.offset().top-15

    // ui.scrollToBodyTop($status.offset().top-15)

    
}

function newComment(){

    resetComment()

    openCommentDialog()
}


function initComment(){

    $('.wrap > .content')
    .on('click.comment', '.comment-panel .post_btn', addComment)
    .on('click.comment', '.dialog-content textarea', openCommentDialog)
    .on('click.comment', '.ui-button.refresh, #verification_img', refreshVerification)
    .on('click.comment', '.comment .res_btn', resSomeone) 
    .on('click.comment', '.comment .new_comment_btn', newComment)

    

}


function fetchUrl(text){
    let replaceEls = [],
        match = null,
        lastIndex = 0,
        re = /(https?:\/\/|www\.)[\w\-\.\?&=\/#%:,@\!\+]+/ig

    while ( (match = re.exec(text)) !== null) {
        // match = re.exec(text)
        let subStr = text.substring(lastIndex, match.index)
        replaceEls.push(document.createTextNode(subStr))
        lastIndex = re.lastIndex

        let uri = /^(http(s)?:\/\/|\/)/.test(match[0]) ? match[0] : 'http://' + match[0]

        let $link = $("<a taget=\"_blank\" href=\"" + uri + "\" rel=\"nofollow\"></a>").text(match[0])

        replaceEls.push($link[0])
    }

    // console.log(replaceEls)
}


function resetComment(){
    $v.val(''), 
    $nickname.val(''), 
    $c.val(''), 
    $mail.val('')

    $status.removeData('id')
    $status.removeData('toAuthor')
    $status.removeData('list')

    $status.html('发表新评论')
    $postBtn.html('发表')
    $comment.find('textarea').val('')

    refreshVerification()
}

export{
    initComment,
    destroyComment,
    loadComment
}