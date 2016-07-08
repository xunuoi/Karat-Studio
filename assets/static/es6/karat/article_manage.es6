/**
 * FOR KARAT CREATE ARTICLE
 */

// import 'jquery/dist/jquery'


function deleteArticle(id, $li){
    $.ajax({
        'url': `/karat/article_delete/${id}`,
        'type': 'POST',
        'dataType': 'json'
    })
    .success((res) => {
        console.log(res)
        if(res['state'] == 'succeed'){
            alert('删除成功')
            $li.remove()
        }
    })
    .fail((err) => {
        throw Error(err)
    })
}

function initEvents (argument) {
    $(".article-list").on('click', '.del_btn', function(evt){

        if (confirm('Are you sure to Delete it ? ')){

            let $btn = $(this)
            let $li = $btn.parents('li')
            let article_id = $li.data('article')
            deleteArticle(article_id, $li)
        }
    })

    $(".article-list").on('.edit_btn', 'click', function(evt){
        $btn = $(this)
        $li = $btn.parents('li')
        article_id = $li.data('article')
        editArticle(article_id)
    })

}
  
$(() => {

    initEvents()
})
