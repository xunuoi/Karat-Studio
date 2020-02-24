/**
 * ES6 FILE FOR DancerController 
 * 2015-08-25 09:08:43
 */
 
import { RainyDay } from 'rainyday'

  
let rainList, canvas, dancer


class Dancer {

    constructor (){
        this.cacheEle();
        this.initNavMenu();
        this.initRain();

    }

    initRain () {
        function runRain() {
            var engine = new RainyDay({
                id: 'myDancer',
                element: img_dancer,
                // image: img_dancer,
                imageSlides: [img_dancer, img_dancer_1],
                parentElement: dance_ctn,
                blur: 10,
                opacity: 1,
                zIndex: -1,
                fps: 30
            });

            engine.rain([ [3, 3, 0.88], [5, 5, 0.9], [6, 2, 1] ], 100);

            return [engine];
        }

        window.onload = function(){
            rainList = runRain();
            canvas = rainList[0].canvas;
            // dancer.slideDancer(rainList);
        }
    }


    initNavMenu (){
        this.$navMenu.on('click', function(event){
            dancer.$navMenu.removeClass('active');
            $(this).addClass('active');
        });
    }


    // transEnd (tar, cbfn, isOnce) {
    //     var $tar = $(tar);
    //     var END_NAMES = {
    //         "Moz" : "transitionEnd",
    //         "webkit" : "webkitTransitionEnd",
    //         "ms" : "MSTransitionEnd",
    //         "O" : "oTransitionEnd"
    //     };

    //     if(!isOnce){
    //         _bind($tar);
    //     }else {
    //         _onceBind($tar);
    //     }

    //     function _bind ($target){
    //        $.each(END_NAMES, function (k, v) {
    //             $target.on(v, function(event){
    //                 cbfn();
    //             });
    //         }); 
    //     }
    //     function  _onceBind ($target) {
    //         $.each(END_NAMES, function (k, v) {
    //             $target.one(v, function(event){
    //                 cbfn();
    //                 $target.unbind(v, cbfn);
    //                 // $tar.get(0).removeEventListener(cbfn);
    //             });
    //         });
    //     }
    // }


    // refreshImg (){
    //     var $can = $(canvas);
    //     this.transEnd($can, function(){
    //         rain.refreshImg('/static/cloud/img/index/1.jpg', function(event){
    //             $can.css('opacity', 1);

    //         });
            
    //     }, true);
        
    //     $can.css('opacity', 0.6);
    // }


    // slideDancer (){
    //     let $can = $(rainList[0].canvas),
    //         $can1 = $(rainList[1].canvas);

    //     $can1.addClass('opacity_0');

    //     function _cycle (){
    //         setTimeout(function(){
    //             $can.toggleClass('opacity_0');
    //             $can1.toggleClass('opacity_0');

    //             _cycle();
                
    //         }, 6000);
    //     }

    //     _cycle();

    // }


    cacheEle (){
        this.$nav = $('.main-nav');
        this.$navMenu = this.$nav.find('a');

    }

}

$(() => {
    dancer = new  Dancer()
})


export {
    Dancer
}
