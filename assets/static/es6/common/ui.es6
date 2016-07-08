/**
 * FOR UI
 */

function scrollToBodyTop (pos, cb, tri){

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

    let _pos = pos || 0
    let _tri = tri || 15

    function _animateScroll() {

        setTimeout(()=> {
            let _abs = Math.abs

            let unit = 5
            let unit_abs = _abs(unit)
            let st = document.body.scrollTop

            if( st > pos){
                unit = (-unit)
            }  

            //判断行为
            _abs(st - pos) < unit_abs ? 
            (
                document.body.scrollTop = pos,
                cb ? cb() : ''
            ) :
            (   
                document.body.scrollTop += unit,
                _animateScroll()
            )
            
            
        }, _tri) 
    }

    _animateScroll()

}


export {
    scrollToBodyTop
}