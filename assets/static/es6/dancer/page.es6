/**
 * For page switch
 */


const initNavagator = () => {
    const $photoWrapper = $('.content-wrapper');
    $('.main-nav a').on('click', evt => {
        evt.preventDefault();
       
        $photoWrapper.is(':hidden') ? $photoWrapper.fadeIn() : $photoWrapper.fadeOut();
        
    });
}



const initPage = () => {
    initNavagator();

};

$(initPage);