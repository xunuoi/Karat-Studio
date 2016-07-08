/**
 * FOR HEADER 
 * @param  {[type]} ( [description]
 * @return {[type]}   [description]
 */

let $menus = null
let $header = null
 
function initHeader(){
    
    $header = $('body > header')
    .on('mouseenter', '.sub-menu', evt => {

        $(evt.currentTarget)
        .parent('.menu')
        .addClass('on')

        // return false;
    })
    .on('mouseleave', '.sub-menu', evt => {
        $(evt.currentTarget)
        .parent('.menu')
        .removeClass('on')

        return false;
    })

    //hide the sub-menu after click the sub-menu li
    /*.on('click', '.sub-menu > li', evt => {
        evt.stopPropagation()

        $(evt.currentTarget)
        .parents('.sub-menu').css('visibility': 'hidden')
    })*/


    $menus = $header.find('.menu')

    if(window._is_mobile){
        //hide sub-menu ,when click other spaces
        $('body').on('click', function(evt){
            let $area = $(this)
            if($area.not('.sub-menu, .sub-menu > li')){
                $header.find('.sub-menu')
                .removeClass('on')
            }
        })
    }

}


function locate(nav){
    var navText = nav.toLowerCase()

    for (let i in $menus){
        let $m = $menus.eq(i)
        let $a = $m.children('a')
        let aText = $a.html().toLowerCase()

        if(navText == aText){
            $menus.removeClass('active')
            $m.addClass('active')

            break;
        }
    }

}


$(() => {
    initHeader()
})


export {
    locate
}