/**
 * ES6 FILE FOR ProductController 
 * 2015-08-28 07:08:15
 */


$(()=>{

MO.config({
    'type': 'GET'
})

/*MO.state(location.pathname, document.title, (_data)=>{
    console.log(_data)
    $('#ttt').html(_data)
}, 'Product Page', false, true)*/

// MO.define('#ttt', 'Product Page Define')

MO.go('.ctn a', '#ttt')

/*$(".ctn").on('click', 'a', function(evt){
    evt.stopPropagation()

    let $a = $(this),
        url = $a.attr('href'),
        title = $a.html()

    MO.touch(url, title, (res)=>{
        let $doc = $(res) 
        let t = $doc.text()

        $('#ttt').html(t)

    })


    //stop propagation
    return false

})*/



})

