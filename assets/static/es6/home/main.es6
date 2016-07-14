/**
 * FOR HomeController
 */

import 'viewer-master/dist/viewer'
import 'highlight/src/highlight.min'

import { locate } from 'header'
import { scrollToBodyTop } from 'ui'

/**
 * FOR COMMENT 
 */

import * as comment from 'comment'

/**
 * FOR BANNER SVG FLY ANIMATION
 */
// import * as fly from './fly'
// import 'shifter/shape-shifter'
// import * as MO from 'mo'

//test for email redicct
/*
location.href="https://itunes.apple.com/us/app/app-annie/id660004961?ls=1&mt=8"
*/
/**
 * init photo view
 */

function initViewer($ctn){
    $ctn.viewer()
}

function destroyViewer($ctn){
    $ctn.viewer('destroy')
}

/**
 * init code highlight
 */

function initHighlight($code){
    $code.each((i, eCode)=>{
        hljs.highlightBlock(eCode)
    })
}


/**
 * init click events for card
 */

function initEvent (argument) {
    let $card = $('.content > .card')
    let $sidebar = $('.wrap > .sidebar')
    // let $banner = $('.wrap > .banner')
    let $content = $('.wrap > .content')
    let $pagination = $('.wrap > .content > .pagination')

    $('.content').on('click.card', '.card .read-more', function(evt){
        evt.stopPropagation()
 
        let $readBtn = $(this)
        let $thisCard = $readBtn.parents('.card')
        let $full = $thisCard.find('.full')

        /*if($readBtn.hasClass('frozen')){
            return false
        }else {
            $readBtn.addClass('frozen')
        }*/
        
        // let $thisFull = $thisCard.find('.excerpt > .full')

        /**
         * DISABLE ANIMATION, FOR THE BUG OF Chrome
         */
        // let c_height = $thisFull.height()
        // let c_height = 'auto'

        //maybe exist spaces
        let btnText = $readBtn.html().trim()

        let aid = $readBtn.data('article')
        let url = $readBtn.attr('href')
        let title = $readBtn.data('title')

        function _setScrollTop(){
            document.body.scrollTop = $thisCard.offset().top - 40
        }

        // let _scrollTopPos = document.body.scrollTop

        function setHomeState(_d){
            // console.log(_d)

            comment.destroyComment()

            $card.removeClass('card_hide')
            $content.removeClass('content_full')
            // $thisFull.css({'height': 'auto'})            

            $pagination.removeClass('hide')

            $readBtn.html('阅读全文')
            let nav = $readBtn.data('nav')
            locate(nav)
            
            $readBtn.data('nav', $readBtn.data('type'))
            
            destroyViewer($full)

            //restore scrollTop
            // document.body.scrollTop = _scrollTopPos
        }
 
        function setArticleState(){
            /**
             * @debug
             * Chrome定位BUG， 重复第二次操作，第二次点击[阅读全文]，js设置容器高度后，scrollTop会无故变动，
             * Safari正常
             * 解决方式：先操作高度，再操作scrollTop，并且禁止height动画
             */
            
            $card.not($thisCard).addClass('card_hide')
            // document.body.scrollTop = 320

            //set height 
            $content.addClass('content_full')
            // $thisFull.css({'height': 0})

            // setTimeout(()=>{

                // $thisFull.css({'height': c_height})

                $pagination.addClass('hide')

                $readBtn.html('返回上层')

                 //set nav active menu
                let nav = $readBtn.data('nav')
                // locate(nav)
                locate('ARTICLE')

                $readBtn.data('nav', 'home')
                //set viewer
                initViewer($full)

                initHighlight($full.find('pre code'))

                comment.loadComment(_setScrollTop)

                $full.find("img")
                .one('load', _setScrollTop)
                .one('error', _setScrollTop)

                /**
                 * 如果要设置 scrollTop, 确保这个操作DOM回流
                 * 或变化之后执行, 比如此处loadComment在之前执行的
                 * 会导致后期DOM变化，
                 * 结果在Chrome中， body.scrollTop的数值变化了。
                 * Safari不变化，不影响body.scrollTop的数值
                 *
                 * 所以上面，添加到回调函数中，确保scrollTop的值在DOM完成之后执行
                 * 同时，对于文章中有图片的，由于img load也是异步的，所以也会
                 * 导致同样问题
                 */
                // document.body.scrollTop = $thisCard.offset().top - 40
                /*alert('scrollTop Set: '+document.body.scrollTop)
                debugger;
                setTimeout(()=>{
                    alert(document.body.scrollTop)
                }, 1000)*/
                

            // })

        }


        if(btnText == '阅读全文') {
            //以下只进行一次 初始化历史堆栈，是错误的
            /*_stateInited ? 
                '' : 
                (
                    MO.state('/', document.title, setHomeState), 
                    _stateInited = true
                )*/
            //如果此时，不重新replaceState,那么浏览器堆栈，保存的还是第一次的操作和数据，没有更新，因为pop出来的，总是第一次的
            
            /**
             * @debug
             * 获取一个初始状态
             * 如果不获取初始状态，那么history.back()的时候，
             * 只能获得state为undefined,那么你不知道如果去恢复现场，
             * 所以每次操作前replaceState，能够保存操作前的一些数据，
             * 从而back的时候能还原
             * null位置是传给setHomeState的data，
             * 如果不传或者传入undefined，那么不缓存，touch还会发起请求
             */   
            // MO.state('/', document.title, setHomeState, null)
            MO.state(location.pathname, document.title, setHomeState)
            /*.then(res=>{
                setHomeState(res)
            })*/


            /**
             * 其实此时的pushState,是对下个当前状态的保存，不是对之前状态的修改。也就是操作之后的状态，同步给浏览器的history.state
             * !!!所以，从上个状态，back的时候，是去现在的状态，也就是pushState之前的state状态！！！而这个状态，是从第一次点击的时候产生的，如果不更新replaceState,那么永远是第一次的数据，setArticleState的变量也是第一次的，readBtn还是第一次点击的文章的按钮！！所以每次点击阅读全文，都更新一下
             */

            // try{
            MO.touch(url, title, (res)=>{
                let $fragment_card = $(res)
                $full.html($fragment_card.find('.full').html())
                setArticleState()
            })
            // }catch(err){console.error(err)}
            /*.then((res)=>{
                let $fragment_card = $(res)
                $full.html($fragment_card.find('.full').html())
                setArticleState()
            })
            .catch(err=>{
                console.log(err)
            })*/
            //这种方式有个问题，无法保存传入then的函数到mo_events来缓存起来，这样导致调用touch后，当其popevent发生时，无法触发前进、后退的时间
            


        }else if(btnText == '返回上层'){

            history.back()

            return false
        }else {

            throw Error('Unknow Button Text: '+btnText)
        }

        //stop propagation and default behavior
        return false
       
    })
} 


/**
 * Banner Animation
 * @return {[type]} [description]
 */

/*function flyAnimation(){
    setTimeout(() =>{
        fly.start()
    }, 1000)
}*/



$(() => { 
    initEvent()
    comment.initComment()
    // flyAnimation()
})
