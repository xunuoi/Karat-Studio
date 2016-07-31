/**
 * FOR B612 Magazine.js
 * @author Cloud
 * @Email: xunuoi@163.com
 */


function addPage(page,book,data) {
	var id, pages = book.turn('pages');

	// Create a new element for this page
	var element = $('<div><div/>', {});

	// Add the page to the flipbook
	if (book.turn('addPage', element, page)) {

		// Add the initial HTML
		// It will contain a loader indicator and a gradient
		element.html('<div class="gradient"></div><div class="loader"></div>');


		// Load the page
		loadPage(page, element,data, pages);
	}
}

function loadPage(page, pageElement,data, pages) {
	// console.log('lodPage>> ', page,'--', pages)
	var imgUrl = data.data[page-1]['url'];

	// console.log(pageElement)
	if(pageElement.is('p1') || pageElement.is('p'+pages)) pageElement.addClass('special_page')

	// Create an image element

	var img = $('<img />');
	var imgWrap=$('<div class="img-wrap" style="background-image: url('+imgUrl+');"></div>')

	var divWrap=$('<div class="l-img-wrap"></div>');
	var lDesc=$('<p class="desc"></p>')

	var sharePanel=$('#share_panel').clone(true,true)
	sharePanel.removeAttr('id').addClass('cloned_share_panel')

	img.mousedown(function(e) {
		e.preventDefault();
	});

	//debug
	//修复标签透明度bug,,如果$('.tag-wrap').clone,会越来越多
	//胶布标签容器
	$('#tag_wrap_tpl').clone(true)
	.removeAttr('id')
	.addClass('tag-wrap')
	.appendTo(imgWrap);

	img.load(function() {

		// Set the size
		/*if(page==1 || page==data.data.length){
			$(this).css({width: '100%', height: '100%'});
		}
		else{
			alert('sss')
		}*/
		// Add the image to the page after loaded
		/**
		 * 不能移除图片，所以可以设置hiden;
		 */
		// $(this).css('visibility', 'hidden')
		sharePanel.appendTo(divWrap)
		$(this).appendTo(imgWrap);


		/*//标签只做一个，不要重复添加
		if(!imgWrap.has('.tag-wrap')){
			$('.tag-wrap').clone(true).appendTo(imgWrap);
		}*/
		

		/**
		 * @debug for background size
		 */
		imgWrap.appendTo(divWrap);
		lDesc.appendTo(divWrap);
		
		divWrap.appendTo(pageElement);
		// Remove the loader indicator

		pageElement.find('.loader').remove()
		// alert('ddd')
		//因为图片载入后,才会将shareapanel等，加入dom中，所以如果第一次打开就是第一页，那么disalbeController就无效了，因为此时没有sharepanel和tag-wrap等


	});

	// Load the page
	img.attr('src', imgUrl);
	lDesc.html(data.data[page-1]['desc'])

	//load Regions(page, pageElement);
}

// Zoom in / Zoom out

/*function zoomTo(event) {

		setTimeout(function() {
			if ($('.magazine-viewport').data().regionClicked) {
				$('.magazine-viewport').data().regionClicked = false;
			} else {
				if ($('.magazine-viewport').zoom('value')==1) {
					$('.magazine-viewport').zoom('zoomIn', event);
				} else {
					$('.magazine-viewport').zoom('zoomOut');
				}
			}
		}, 1);

}*/



// Load regions

/*function loadRegions(page, element) {

	$.getJSON('pages/'+page+'-regions.json').
		done(function(data) {

			$.each(data, function(key, region) {
				addRegion(region, element);
			});
		});
}*/

// Add region

/*function addRegion(region, pageElement) {

	var reg = $('<div />', {'class': 'region  ' + region['class']}),
		options = $('.magazine').turn('options'),
		pageWidth = options.width/2,
		pageHeight = options.height;

	reg.css({
		top: Math.round(region.y/pageHeight*100)+'%',
		left: Math.round(region.x/pageWidth*100)+'%',
		width: Math.round(region.width/pageWidth*100)+'%',
		height: Math.round(region.height/pageHeight*100)+'%'
	}).attr('region-data', $.param(region.data||''));


	reg.appendTo(pageElement);
}*/

// Process click on a region

/*function regionClick(event) {

	var region = $(event.target);

	if (region.hasClass('region')) {

		$('.magazine-viewport').data().regionClicked = true;

		setTimeout(function() {
			$('.magazine-viewport').data().regionClicked = false;
		}, 100);

		var regionType = $.trim(region.attr('class').replace('region', ''));

		return processRegion(region, regionType);

	}

}*/

// Process the data of every region

/*function processRegion(region, regionType) {

	data = decodeParams(region.attr('region-data'));

	switch (regionType) {
		case 'link' :

			window.open(data.url);

		break;
		case 'zoom' :

			var regionOffset = region.offset(),
				viewportOffset = $('.magazine-viewport').offset(),
				pos = {
					x: regionOffset.left-viewportOffset.left,
					y: regionOffset.top-viewportOffset.top
				};

			$('.magazine-viewport').zoom('zoomIn', pos);

		break;
		case 'to-page' :

			$('.magazine').turn('page', data.page);

		break;
	}

}*/

// Load large page

function loadLargePage(page, pageElement,data) {
	var imgUrl = data.data[page-1]['url']
	var img = $('<img />');

	img.load(function() {

		var prevImg = pageElement.find('img');
		$(this).css({width: '100%', height: '100%'});
		$(this).appendTo(pageElement);
		prevImg.remove();

	});

	// Loadnew page
	img.attr('src', imgUrl);
}

// Load small page

function loadSmallPage(page, pageElement,data) {
	var imgUrl = data.data[page-1]['url']
	var img = pageElement.find('img');

	img.css({width: '100%', height: '100%'});

	img.unbind('load');
	// Loadnew page

	img.attr('src', imgUrl);
}

// http://code.google.com/p/chromium/issues/detail?id=128488

function isChrome() {

	return navigator.userAgent.indexOf('Chrome')!=-1;

}

/**
 * 这个函数，设定特定状态，但是是图片加载完之后
 * @param  {[type]} page [description]
 * @return {[type]}      [description]
 */
function disableControls(page) {
	// console.log('use diableControls, page: ', page)
	/*if(!flipEvent[page] && 
		(page == 1 || 
		page==$('.magazine').turn('pages'))){

		flipEvent[page] = {
			status: 'unload',
			fn: function(){
				console.log('**call fn in disableControls')
				disableControls(page)
			}
		}
	}*/
	//如果是第一页
	if (page==1){
		// console.log(1);
		$('.page-wrapper .cloned_share_panel').hide();
		$('.desc').hide();
		$('.l-img-wrap .img-wrap').css({
			width: '100%', 
			height: '114.5%', 
			top: '-14.5%'
		});

		$('.previous-button').hide();
		$('.next-button').show();
		$('.tag-wrap').hide();
		// $('.mask-logo').hide()

		$('#magazine_ctn').removeClass("border")
		// $('.magazine .gradient').removeClass('border')
		
		// debugger;
	}else{
		$('#magazine_ctn').addClass("border")

		$('.previous-button').show();
		$('.tag-wrap').show();
		$('.page-wrapper .cloned_share_panel').show();
		// $('.mask-logo').show();
		$('.desc').show();
		$('.l-img-wrap .img-wrap').css({
			width: '80%', 
			height: '70%', 
			top: 0
		});

	}

	//如果是最后一页
	if (page==$('.magazine').turn('pages')){
		$('#magazine_ctn').removeClass("border")

		$('.page-wrapper .cloned_share_panel').hide();
		$('.desc').hide();
		$('.l-img-wrap .img-wrap').css({width: '100%', height: '114.5%', top: '-14.5%'});
		$('.next-button').show();
		$('.next-button').hide();
		$('.tag-wrap').hide();
		// $('.mask-logo').hide();
		
	}
	else{
		// console.log(4);
		$('.next-button').show();
		//$('.magazine .gradient').addClass('border')
	}
}

// Set the width and height for the viewport

function resizeViewport() {

	var width = $(window).width(),
		height = $(window).height(),
		options = $('.magazine').turn('options');

	// console.log(options)
	$('.magazine').removeClass('animated');

	$('.magazine-viewport').css({
		width: width,
		height: height
	})
	//@debug
	// .zoom('resize');


	if ($('.magazine').turn('zoom')==1) {
		var bound = calculateBound({
			width: options.width,
			height: options.height,
			boundWidth: Math.min(options.width, width),
			boundHeight: Math.min(options.height, height)
		});

		if (bound.width%2!==0)
			bound.width-=1;


		if (bound.width!=$('.magazine').width() || bound.height!=$('.magazine').height()) {

			$('.magazine').turn('size', bound.width, bound.height);

			if ($('.magazine').turn('page')==1)
				$('.magazine').turn('peel', 'br');

			var buttonHeight = bound.height-25;
			var btnPosY = (bound.height/2-32/2)-20

			$('.next-button').css({height: buttonHeight, backgroundPosition: '-42px '+btnPosY+'px'});
			$('.previous-button').css({height: buttonHeight, backgroundPosition: '0 '+btnPosY+'px'});
		}
		$('.magazine-radius').css({top: -bound.height/2, left: -bound.width/2});
		/**
		 * @debug cloud
		 * @type {Number}
		 */
		$('.magazine').css({top: 0, left: 0});
		/*$('.magazine').css({top: -bound.height/2, left: -bound.width/2});*/
	}

	var magazineOffset = $('.magazine').offset(),
		boundH = height - magazineOffset.top - $('.magazine').height(),
		marginTop = (boundH - $('.thumbnails > div').height()) / 2;

	if (marginTop<0) {
		$('.thumbnails').css({height:1});
	} else {
		$('.thumbnails').css({height: boundH});
		$('.thumbnails > div').css({marginTop: marginTop});
	}

	if (magazineOffset.top<$('.made').height())
		$('.made').hide();
	else
		$('.made').show();

	$('.magazine').addClass('animated');

}


// Number of views in a flipbook

function numberOfViews(book) {
	return book.turn('pages') / 2 + 1;
}

// Current view in a flipbook

function getViewNumber(book, page) {
	return parseInt((page || book.turn('page'))/2 + 1, 10);
}

function moveBar(yes) {
	if (Modernizr && Modernizr.csstransforms) {
		$('#slider .ui-slider-handle').css({zIndex: yes ? -1 : 10000});
	}
}

function setPreview(view) {

	var previewWidth = 112,
		previewHeight = 73,
		previewSrc = 'pages/preview.jpg',
		preview = $(_thumbPreview.children(':first')),
		numPages = (view==1 || view==$('#slider').slider('option', 'max')) ? 1 : 2,
		width = (numPages==1) ? previewWidth/2 : previewWidth;

	_thumbPreview.
		addClass('no-transition').
		css({width: width + 15,
			height: previewHeight + 15,
			top: -previewHeight - 30,
			left: ($($('#slider').children(':first')).width() - width - 15)/2
		});

	preview.css({
		width: width,
		height: previewHeight
	});

	if (preview.css('background-image')==='' ||
		preview.css('background-image')=='none') {

		preview.css({backgroundImage: 'url(' + previewSrc + ')'});

		setTimeout(function(){
			_thumbPreview.removeClass('no-transition');
		}, 0);

	}

	preview.css({backgroundPosition:
		'0px -'+((view-1)*previewHeight)+'px'
	});
}

// Width of the flipbook when zoomed in

function largeMagazineWidth() {

	return 2214;

}

// decode URL Parameters

function decodeParams(data) {

	var parts = data.split('&'), d, obj = {};

	for (var i =0; i<parts.length; i++) {
		d = parts[i].split('=');
		obj[decodeURIComponent(d[0])] = decodeURIComponent(d[1]);
	}

	return obj;
}

// Calculate the width and height of a square within another square

function calculateBound(d) {

	var bound = {width: d.width, height: d.height};

	if (bound.width>d.boundWidth || bound.height>d.boundHeight) {

		var rel = bound.width/bound.height;

		if (d.boundWidth/rel>d.boundHeight && d.boundHeight*rel<=d.boundWidth) {

			bound.width = Math.round(d.boundHeight*rel);
			bound.height = d.boundHeight;

		} else {

			bound.width = d.boundWidth;
			bound.height = Math.round(d.boundWidth/rel);

		}
	}

	return bound;
}