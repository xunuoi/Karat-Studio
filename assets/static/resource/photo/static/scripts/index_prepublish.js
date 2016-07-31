/**
 * FOR B612 index.js
 * @author Cloud
 * @Email: xunuoi@163.com
 */


(function(){
'use strict';


//define vars
var flipbook,
    listWrap,
    listWrapUl,
    listWrapUlWidth,
    albmuLi,
    listContentFn,
    subMenuWrap,
    subMenuWrapLi,
    subMenu,
    isSourceLoaded = false,
    isMagzineInited = false,
    menu,
    prev,
    next,
    close,
    n=0,
    length,
    ceil,
    //是否浏览大图
    isGalleryNow = false,
    _galleryPage = null,
    $gallery,
    $viewer,
    // $mImg,
    $mr,
    loadingUrl = '../static/images/loader.gif',
    //页面刚打开的title
    _oTitle = document.title,
    //是否有一个book是打开的，所定状态
    _isOpen = false;


//初始化变量
function initVar(){
    listWrap=$('.list-wrap'),
    flipbook = $('#magazine_ctn'),
    listContentFn=doT.template($('#list-content').html()),
    subMenuWrap=$('.sub-menu-wrap'),
    subMenu=doT.template($('#sub-menu').html()),
    menu=$('.menu'),
    prev=$('.prev'),
    next=$('.next'),

    $gallery = $('#max_viewer'),
    $viewer = $gallery.children('.img_viewer'),

    // $mImg = $gallery.find('img'),
    $mr = $('.magazine-radius')

}


function isEven(num){
    return num%2 == 0 ? true : false
}

function makeDataEven(list){
    if(!isEven(list.length)){
        list.push(list[list.length-1])
    }
}


function setAlbumStyle(data){
    if(data.data && data.data.length<4){
        next.hide()
    }else {
        next.show()
    }
}

//默认相册
function getAlbum(param){
    $.ajax({
        url: 'http://120.24.220.14/b612/index.php?r=site/sets',
        type: 'get',
        data: param
    })
    .success(function(data) {
        var datas = JSON.parse(data);
        if (datas.status == "success") {
            
            setAlbumStyle(datas)

            listWrap.html(listContentFn(datas.data));

            albmuLi=listWrap.find('ul li');
            listWrapUl=listWrap.find('ul');
            listWrapUlWidth=listWrap.width();
            length=datas.data.length;
            ceil=Math.ceil(length/4);
            listWrapUl.width(listWrapUlWidth * ceil+100);

            albmuLi.click(function(){
                var albumid=$(this).attr('album-id');
                var albumName=$(this).attr('album-name');

                setTitle(albumName)

                Hash.go('album/'+albumid+'/page/2').update();
                initApp(albumid, albumName)
            })
        }
    })
}

//初始化子菜单
function subMenuInit(){
    close.click(function(){
        subMenuWrap.removeClass('show')
    });
    subMenuWrapLi.click(function(){
        var $li = $(this);
        var $lis = $li.parent('ul').find('li')


        var param=$li.attr('groupid')
        $lis.removeClass('active')
        $li.addClass('active')

        // console.log(param)
        getAlbum(param)
        n=0;
        subMenuWrap.removeClass('show')
    })
}


function getMenu(){
    //获取菜单列表
    $.ajax({
        url: 'http://120.24.220.14/b612/index.php?r=site/groups',
        type: 'get',
        data: null
    })
    .success(function(data){
        var datas=JSON.parse(data);
        if(datas.status=="success"){
            subMenuWrap.html(subMenu(datas.data));
            close=subMenuWrap.find('.close');
            subMenuWrapLi=subMenuWrap.find('li');
            subMenuWrapLi.eq(0).addClass('active')
            subMenuInit();
        }
    })
}

function closeFlipbook(event){
    $('#canvas').fadeOut(300, function(){
        resetFlipBook();
    });

    if(flipbook.turn('is')) {
        flipbook.turn('destroy');
        flipbook.data('booklist', null)
        _isOpen = false;
    }

    Hash.go('');
    document.title = _oTitle
}


function initEvents(){
    //init max view
    initGallery()

    //========关闭flipbook,canvas，并销毁
    $('.open-close').click(closeFlipbook)

    menu.click(function(){
        subMenuWrap.addClass('show')
    })


    next.click(function(){
        n++;
        if(n>=ceil-1){
            $(this).hide()
        }
        if(n>=ceil){
            n=ceil-1;
        }
        prev.show()
        listWrapUl.stop().animate({marginLeft : -n*listWrapUlWidth+'px'},500);
    });

    prev.click(function(){
        n--;
        if(n<=0){
            n=0;
            $(this).hide();
        }
        next.show()
        listWrapUl.stop().animate({marginLeft : -n*listWrapUlWidth+'px'},500)
    })

    //==================
    
    // Zoom icon
    /*$('.zoom-icon').on('mouseover', function() {

        if ($(this).hasClass('zoom-icon-in'))
            $(this).addClass('zoom-icon-in-hover');

        if ($(this).hasClass('zoom-icon-out'))
            $(this).addClass('zoom-icon-out-hover');

    }).on('mouseout', function() {

        if ($(this).hasClass('zoom-icon-in'))
            $(this).removeClass('zoom-icon-in-hover');

        if ($(this).hasClass('zoom-icon-out'))
            $(this).removeClass('zoom-icon-out-hover');

    }).on('click', function() {

        if ($(this).hasClass('zoom-icon-in'))
            $('.magazine-viewport').zoom('zoomIn');
        else if ($(this).hasClass('zoom-icon-out'))
            $('.magazine-viewport').zoom('zoomOut');

    });*/

    // $('#canvas').hide();
    //bind weibo share
    $('body').on('click', '.cloned_share_panel .weibo_btn', function(evt){
        var $lWrap = $(this).parents('.l-img-wrap')
        var $img =  $lWrap.find('> .img-wrap > img')

        var descTxt = $lWrap.find('.desc').html().trim()
        // console.log(descTxt)
        shareWeibo($img, descTxt)
    }).on('click', '.cloned_share_panel .wechat_btn', function(evt){
        shareWechat()
    })
}

function initApp(albumId){
    $.ajax({
        url: 'http://120.24.220.14/b612/index.php?r=site/set',
        type: 'get',
        data: {'id':albumId}
    })
    .success(function(data){
        var DATA=JSON.parse(data);

        //传递albumid
        DATA.albumId = albumId
        $('#canvas').fadeIn(300);

        if(isSourceLoaded == true){
            return loadApp(DATA);
        }else {
            yepnope({
                test : Modernizr.csstransforms,
                yep: ['../static/scripts/lib/turn.js'],
                nope: ['../static/scripts/lib/turn.html4.min.js'],
                both: ['../static/styles/css/jquery.ui.css'],

                complete: function(){
                    isSourceLoaded = true;

                    loadApp(DATA);
                }
            })
        }
    })
}


/*function setGallerySize($img, $galleryImg){
    var $b = $(document.body);

    var imgW = $img.width(),
        imgH = $img.height(),
        rate = parseFloat(imgW)/parseFloat(imgH),
        bW = $b.width(),
        bH = $b.height()

    // alert(imgW+'---'+ imgH)
    //如果图片是长方形
    if(imgW >imgH){

        if(bW > bH){
            //如果屏幕是长方形
            

        }else {
            //如果屏幕是竖形
            var _w = bW*0.96,
                _h = _w/rate

            $galleryImg.css({
                'width': _w,
                'height': _h
            }) 
        }

        
    }else {
        //竖着的长方形
        var _h = bH*0.96,
            _w = _h*rate

        $galleryImg.css({
            'width': _w,
            'height': _h
        })
    }
}*/



/**
 * Gallery 大图浏览
 */

function initGallery(){

    $('#magazine_ctn').on('click', '.img-wrap > img', function(evt){
        evt.preventDefault();
        

        var $img = $(this)
        var imgUrl = $img.attr('src')

        var curPage = parseInt($img.parents('.page-wrapper').attr('page'))
        if(curPage == 1 || curPage == flipbook.turn('pages')){
            return;
        }

        openGallery(imgUrl,null, null, curPage)
        
        /*$mImg.on('load', function(){
            setGallerySize($img, $mImg)
            $gallery.removeClass('hide')
            $mImg.off('load')
        })
        $mImg.attr('src', imgUrl)*/

        return false;
        
    });

    $gallery.on('click', function(evt){
        hideGallery()
    })
}


/**
 * 打开大图浏览模式
 * @param  {[type]} imgUrl         [description]
 */

function openGallery(imgUrl, text, gallery_styles, curPage){
    //设置Gallery打开标识
    isGalleryNow = true

    if(curPage){
        _galleryPage = curPage
    }


    $viewer.css({
        'background-image': 'url('+imgUrl+')'
    })

    text ? $viewer.html(text) : '';

    gallery_styles ? $viewer.css(gallery_styles) : ''
    $gallery.removeClass('hide')

}


/**
 * HIde gallery
 * @return {[type]} [description]
 */
function hideGallery(){
    
    $gallery.addClass('hide')
    isGalleryNow = false
    $viewer.html('')
    $viewer.css({
        'background-image': 'url('+loadingUrl+')',
        'background-position': 'center',
        'background-size': 'contain'
    })

    _galleryPage = null

}


function nextGallery(isPrev){
    var _pages = flipbook.turn("pages");

    if(!_galleryPage ||
        !isPrev ? _galleryPage >= (_pages-1) : _galleryPage <= 2
    ) return false;

    // console.log(_pages, _galleryPage)

    var nextPage = !isPrev ? ++_galleryPage : --_galleryPage

    var booklist = flipbook.data('booklist')
    var nextSrc = booklist[nextPage-1]['url']

    /*var $nextImg = $('.page-wrapper .page.p'+nextPage).find('.img-wrap img')

    var nextSrc = $nextImg.attr('src')*/

    openGallery(nextSrc)

    // !isPrev ? flipbook.turn('next') : flipbook.turn('previous')

}



/**
 * SHARE WEIBO
 */

function shareWeibo($img ,desc ){

    var imgUrl = $img.attr('src');

    (function(s, d, e, r, l, p, t, z, c) {
        var f = 'http://v.t.sina.com.cn/share/share.php?appkey=真实的appkey',
            u = z || d.location,
            p = ['&url=', e(u), '&title=', e(t || d.title), '&source=', e(r), '&sourceUrl=', e(l), '&content=', c || 'gb2312', '&pic=', e(p || '')].join('');

        function a() {
            if (!window.open([f, p].join(''), 'mb', ['toolbar=0,status=0,resizable=1,width=440,height=430,left=', (s.width - 440) / 2, ',top=', (s.height - 430) / 2].join(''))) u.href = [f, p].join('');
        };

        if (/Firefox/.test(navigator.userAgent)) setTimeout(a, 0);
        else a();
    })(screen, document, encodeURIComponent, '', '', imgUrl, desc, location.href, 'utf-8')

}


/**
 * SHARE WECHAT
 */

function shareWechat(){
    var imgUrl = genQRCode(document.URL)
    var text = '微信扫一扫，轻松分享'
    openGallery(imgUrl, text, {
        'background-position': 'center 150px',
        'background-size': '180px'
    })
}

/**
 * 产生二维码
 */

function genQRCode(url){
    var _p = encodeURIComponent(url)
    var s = 'http://tool.oschina.net/action/qrcode/generate?data='+_p+'%0D%0A&output=image%2Fgif&error=L&type=0&margin=10&size=4'

    return s;
}


/**
 * 重置border
 */

function resetFlipBook(){
    flipbook.addClass('border')
}


/**
 * 是否需要重新检测页面页数状态，
 *
 *因为每次imgload 完成，都会重新更新状态，可能会导致问题
*/

var needCheck = true;
function checkSpecialPage(){
    if(!needCheck) return

    var pages = flipbook.turn('pages')
    var $last = $('.page.p'+pages)
    if($last.length){
        $last.addClass('special_page');
        needCheck = false;
    }
}

/**
 * Once 函数  ， ====LOAD APP
 */
var _onceDict = {},
    _oncePoint = 1;
function once(fn){
    fn._onceId = _oncePoint++;

    return function(a,b,c,d){
        if(_onceDict[fn._onceId]){
            //pass
        }else {
            fn(a,b,c,d);
            _onceDict[fn._onceId] = true;
        }
    }
    
}


//初始化页面的函数，设置页面状态
var onceD = once(function(i_page, _pages, album_id){
    
    //pages
    disableControls(i_page)
    $('.page-wrapper[page="'+_pages+'"] .p'+_pages)
    .addClass('special_page')

    //title
    album_id ? setTitle(album_id) : ''

})


function getSeries(){
    var $c = $('.sub-menu-wrap li.active');
    return $c.html().trim() || 'B612'
}


function setTitle(album){
    var seriesName = getSeries()
    document.title = seriesName+'-'+album;
}

function loadApp(data) {
    var album_id = data.albumId;
    // console.log('loadApp>>data: ', data)
    if(_isOpen) return 'Only One Book Can be opend'
    $('#canvas').fadeIn(300);

    if (flipbook.width()==0 || flipbook.height()==0) {
        setTimeout(function(){
            loadApp(data)
        }, 20);
        return;
    }

    //make it to even length
    makeDataEven(data.data)
    flipbook.data('booklist', data.data)

    var initalizePage = Hash.read('page') || 2;
    var magazineW = 960;
    var magazineH = 560;
    
    // Create the flipbook
    $mr.css({
        'width': magazineW,
        'height': magazineH
    });

    var _pages = data.data.length;

    //打开一本书此时
    _isOpen = true;

    flipbook.turn({
        acceleration: !isChrome(),
        // Magazine width

        width: magazineW,
        //default initalizePage page num
        page: initalizePage,

        // Magazine height

        height: magazineH,

        // Duration in millisecond

        duration: 1000,

        // Enables gradients

        // gradients: true,

        // Auto center this flipbook

        autoCenter: true,

        // Elevation from the edge of the flipbook when turning a page

        elevation: 50,

        // The number of pages

        pages: _pages,

        // Events

        when: {
            turning: function(event, page, view) {
                //当每一页翻书动画进行的时候
                var book = $(this),
                    currentPage = book.turn('page'),
                    pages = book.turn('pages');

                // Update the current URI
                var albumId = Hash.read('album')

                Hash.go('album/'+albumId+'/page/'+page).update();

                /*var $curPage = book.find('.page-wrapper[page="'+currentPage+'"] .page.p'+currentPage)

                $curPage.find('.gradien.border').removeClass("border")
                console.log(event ,page, view)*/

                // Show and hide navigation buttons
                // console.log('loadApp>> page: ', page)

                disableControls(page);

            },

            start: function(e, pageObj) {
                //当每一页翻书动画开始的时候

            },

            turned: function(event, page, view) {
                //当每一页翻书动画结束的时候,此处添加，是img load 后触发的，这样可以操作页面状态
                disableControls(page);
                var _pages = flipbook.turn('pages')
                // console.log(event, page, view)

                $(this).turn('center');

                $('#slider').slider('value', getViewNumber($(this), page));

                //显示封面，卷边提示（卷起一角，br代表bottom right）
                if (page == 1) {
                    $(this).turn('peel', 'br');
                }else if(page == _pages){
                    $(this).turn('peel', 'bl');
                }else {
                    //对于普通页面，更新gallery
                    // refreshGallery(page)
                }

                checkSpecialPage();
            },

            missing: function (event, pages) {
                //Add pages that aren't in the magazine                
                for (var i = 0; i < pages.length; i++){
                    addPage(pages[i], $(this),data);
                }

            }
        }

    })
    
    //提前设置书页状态
    onceD(initalizePage, _pages, album_id)

    resizeViewport()

    $mr.css({
        opacity: 1
    })
    
     
    initMagazineEvents()

    // Init Slider By new flipbook;
    $( "#slider" ).slider({
        min: 1,
        max: numberOfViews(flipbook),

        start: function(event, ui) {

            if (!window._thumbPreview) {
                window._thumbPreview = $('<div />', {'class': 'thumbnail'}).html('<div></div>');
                setPreview(ui.value);
                _thumbPreview.appendTo($(ui.handle));
            } else
                setPreview(ui.value);

            moveBar(false);

        },

        slide: function(event, ui) {

            setPreview(ui.value);

        },

        stop: function() {
            if (window._thumbPreview)
                _thumbPreview.removeClass('show');

            $('.magazine').turn('page', Math.max(1, $(this).slider('value')*2 - 2));

        }
    })

    // resizeViewport();
    $('.magazine').addClass('animated');

}


function initMagazineEvents(){
    if(isMagzineInited) return false;


    // Zoom.js
    /*$('.magazine-viewport').zoom({

        flipbook: $('.magazine'),

        max: function() {

            return largeMagazineWidth()/$('.magazine').width();

        },

        when: {
            swipeLeft: function() {

                $(this).zoom('flipbook').turn('next');

            },

            swipeRight: function() {

                $(this).zoom('flipbook').turn('previous');

            },

            resize: function(event, scale, page, pageElement) {

                if (scale==1)
                    loadSmallPage(page, pageElement,data);
                else
                    loadLargePage(page, pageElement,data);

            },

            zoomIn: function () {
                // return false;

                $('#slider-bar').hide();
                $('.made').hide();
                $('.magazine').removeClass('animated').addClass('zoom-in');
                $('.zoom-icon').removeClass('zoom-icon-in').addClass('zoom-icon-out');

                if (!window.escTip && !$.isTouch) {
                    window.escTip = true;

                    $('<div />', {'class': 'exit-message'}).
                        html('<div>Press ESC to exit</div>').
                        appendTo($('body')).
                        delay(2000).
                        animate({opacity:0}, 500, function() {
                            $(this).remove();
                        });
                }
            },

            zoomOut: function () {
                // return false;

                $('#slider-bar').fadeIn();
                $('.exit-message').hide();
                $('.made').fadeIn();
                $('.zoom-icon').removeClass('zoom-icon-out').addClass('zoom-icon-in');

                setTimeout(function(){
                    $('.magazine').addClass('animated').removeClass('zoom-in');
                    resizeViewport();
                }, 0);

            }
        }
    })*/

    // Using arrow keys to turn the page
    $(document).keydown(function(e){

        var previous = 37, next = 39, esc = 27;
        var _isFlip = $('.magazine').turn('is');

        switch (e.keyCode) {
            case previous:

                // left arrow
                !isGalleryNow ? 
                    (_isFlip ? $('.magazine').turn('previous') : '') : 
                    nextGallery(true);

                e.preventDefault();

                break;
            case next:
                //right arrow
                !isGalleryNow ? 
                    (_isFlip ? $('.magazine').turn('next') : '') : 
                    nextGallery()
                e.preventDefault();

                break;
            case esc:
                isGalleryNow ? hideGallery() : closeFlipbook()
                // $('.magazine-viewport').zoom('zoomOut')
                e.preventDefault();

                break;
        }
    });

    // URIs - Format #/page/1
    // var album=Hash.read('album');
    // var reg=new RegExp('^album\/'+album+'\/page\/([0-9]*)$')
    // var rg = /^album\/\d+\/page\/\d+$/g;

    /*Hash.on(rg, {
        yep: function(path, parts) {
            alert('yep')
            var page = parts[1];
            // console.log('parts page'+page);
            if (page!==undefined) {
                if ($('.magazine').turn('is'))
                    $('.magazine').turn('page', page);
            }

        },
        nop: function(path) {
            if(Hash.fragment() == ''){
                //hide magazine
            }else {
                var initalizePage = Hash.read('page') || 2;

                if ($('.magazine').turn('is')) $('.magazine').turn('page', initalizePage);
            }

        }
    })*/


    //尺寸改变，或者横竖屏切换
    $(window).resize(function(evt) {
        resizeViewport(evt);
    }).bind('orientationchange', function(evt) {
        resizeViewport(evt);
    });

    // Regions
    
    // Zoom event
    /*if ($.isTouch)
        $('.magazine-viewport').bind('zoom.doubleTap', zoomTo);
    else
        $('.magazine-viewport').bind('zoom.tap', zoomTo);*/

    /*if ($.isTouch) {
        $('.magazine').bind('touchstart', regionClick);
    } else {
        $('.magazine').click(regionClick);
    }*/

    // Events for the next button

    $('.next-button').bind($.mouseEvents.over, function() {

        $(this).addClass('next-button-hover');

    }).bind($.mouseEvents.out, function() {

        $(this).removeClass('next-button-hover');

    }).bind($.mouseEvents.down, function() {

        $(this).addClass('next-button-down');

    }).bind($.mouseEvents.up, function() {

        $(this).removeClass('next-button-down');

    }).click(function() {

        $('.magazine').turn('next');
    });

    // Events for the next button

    $('.previous-button').bind($.mouseEvents.over, function() {

        $(this).addClass('previous-button-hover');

    }).bind($.mouseEvents.out, function() {

        $(this).removeClass('previous-button-hover');

    }).bind($.mouseEvents.down, function() {

        $(this).addClass('previous-button-down');

    }).bind($.mouseEvents.up, function() {

        $(this).removeClass('previous-button-down');

    }).click(function() {

        $('.magazine').turn('previous');

    });

    isMagzineInited = true;

}



function initSite(){
    //初始化变量
    initVar()
    //获取菜单
    getMenu()

    //get album
    getAlbum(null)

    initEvents()

    var hashData = Hash.hashParam()
    if(hashData.album){
        initApp(hashData.album)
    }
    

}


$(function(){
    initSite()
})

})()
