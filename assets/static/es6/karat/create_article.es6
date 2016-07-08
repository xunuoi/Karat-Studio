/**
 * FOR KARAT CREATE ARTICLE
 */
 
// import 'jquery/dist/jquery'
  
//FOR SMDITOR 
import 'simple-module/lib/module'
import 'simple-hotkeys/lib/hotkeys'
import 'simple-uploader/lib/uploader'

import 'simditor/lib/simditor'

import 'simditor-autosave/lib/simditor-autosave'
import 'simditor-emoji/lib/simditor-emoji'

//check staging
let _staging_host = false
if(location.href.search('staging') != -1){
    _staging_host = true
}

$(() => {
    
    //init editor
    let editor = new Simditor({
        textarea: $('#article_editor'),
        defaultImage: '/static/img/logo/logo.png',
        pasteImage: true,
        autosave: 'editor-content',
        emoji: {
            imagePath: '/static/lib/simditor-emoji/images/emoji/'
        },
        toolbar: [ 'emoji' ,'bold', 'italic', 'underline', 'strikethrough', '|', 'ol', 'ul', 'blockquote', 'code', '|', 'link', 'image', '|', 'indent', 'outdent'],
        upload: {
            url: '/karat/upload',
            params: null,
            fileKey: 'article_img',
            connectionCount: 5,
            leaveConfirm: 'Uploading is in progress, are you sure to leave this page?'
        }
      //optional options
    })


    //delete tag
    $("#tag_list")
    .on('click', '.del_tag', function(evt){
        let $t = $(this);
        let tagName = $t.data('tag');
 
        $.ajax({
            'url': `/tag/delete/${tagName}`,
            'type': 'POST',
            'dataType': 'json'
        })
        .success((rs) => {
            console.log(rs)
            $t.parents('span').remove()

        })
        .fail((err) => {
            console.log(err)
        })    
    })
    .on('click', '.add_tag_btn', function(evt){
        let $btn = $(this)
        let $nt = $('#tag_list .new_tag');
        let tagName = $nt.val();

        let $eTag = 
        $('<span>\
            <input value="'+tagName+'" type="checkbox" />\
            <label>'+tagName+'</label>\
            <button data-tag="'+tagName+'" class="del_tag">X</button>\
        </span>')

        $.ajax({
            'url': `/tag/add/${tagName}`,
            'type': 'POST',
            'dataType': 'json'
        })
        .success((rs) => {
            console.log(rs)

            $btn.parent('span').before($eTag)
            // alert(`add tag succeed: ${tagName}`)
            $nt.val('')

        })
        .fail((err) => {
            alert(`Add tag failed: ${tagName}`)
            console.log(err)
        })      
    })
 

    //submit post
    $('.btn_post').on('click',function (evt) {
        let $btn = $(this)
        if($btn.hasClass('disabled')){
            return false;
        }else {
            $btn.addClass('disabled')
        }

        let $attr = $('ul.article-attr')

        let aid = $attr.find('input[name="article_id"]').val()
        let $checkbox_tag = $('#tag_list input[type=checkbox]')
        let tag_list = []

        $checkbox_tag.each((i, c)=>{
            let $c = $(c)
            $c.is(':checked') ? tag_list.push($c.val()) : ''
        })
        if($attr.find('input[name="title"]').val() == ''){
            return alert('Title can not be empty')
        }

        let postContent = editor.getValue()
        let $content = $(postContent)

        let excerpt = $content.text()
        .trim()
        .replace(/\n+/g, '')
        .substring(0, 280)

        let $gallery = $content.find('img')
        let gList = []
        // alert('ddd')
        // console.log([for ($g of $gallery) $g.attr('src')]); 
        $gallery.each(function(){
            let imgUrl = $(this).attr('src')
            //filter the emoji
            !imgUrl.match('simditor-emoji/images/emoji/') ? 
                gList.push(imgUrl) :
                'pass'
            
        })
        function resetForm(){
            $attr.find('input[name="title"]').val('无标题')
            editor.setValue('')
        }
        let subData = {
            'content': postContent,
            'excerpt': excerpt,
            'img': gList,//just gallery
            'title': $attr.find('input[name="title"]').val(),
            'author': $attr.find('input[name="author"]').val(),
            'type': $attr.find('select[name="type"]').val(),
            'en_gallery': $attr.find('input[name="en_gallery"]').is(':checked') ? true : false,
            'enable': $attr.find('input[name="enable"]').is(':checked') ? true : false,
            'tag': tag_list
        }
        //如果是编辑，那么将aid传回到后台
        if(aid) subData['article_id'] = aid;

        $.ajax({
            'url': '/karat/article_update',
            'type': 'POST',
            'dataType': 'json',
            'data': subData

        })
        .success((rs) => {
            console.log(rs) 
            if(rs['state'] == 'succeed'){
                alert('Submit Succeed! ')

                if(!aid && !_staging_host){
                    //如果是新建文章，那么完成后重置
                    resetForm()
                    
                }
                // location.reload()
            }
        })
        .fail((err) => {
            console.log(err)
        })
        .complete( rs => {
            $btn.removeClass('disabled')
        })


    })
})
