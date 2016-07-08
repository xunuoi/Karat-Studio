/**
 * ES6 FILE FOR ArticleController 
 * 2015-09-02 11:09:51
 */

// import 'jquery/dist/jquery'
import 'viewer-master/dist/viewer'
import 'highlight/src/highlight.min'
import 'header'

import * as comment from 'comment'

function initHighlight(){
    hljs.initHighlightingOnLoad()
}

function initViewer(){
    /*$('.card .full img').on('click', function(){
        alert('click evt')
    })*/
    $('.card .full').viewer();
    // console.log('init viewer')
}





$(() => {
    $('.card .read-more').on('click', function(evt) {
        evt.stopPropagation();
        location.pathname = '/article'
        //返回上层，固定位/article
        // location.pathname = '/' + $(this).data('type') || ''

        return false
    })
    initViewer()
    initHighlight()
    comment.initComment()
    comment.loadComment()
})
