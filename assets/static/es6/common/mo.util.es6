/**
 * FOR MO.util
 */

export default {

    getEvent: function(event){
        return event ? event : window.event; // or default e
    }, 
    getTarget: function(event) {//currentTarget是处理事件的调用者，如果document.body.onclick = function(event){}中event.currentTarget ===this===document.body  target是目标
        return event.target || event.srcElement;
    },
    preventDefault: function(event){
        if (event.preventDefault != undefined) {event.preventDefault();}
        else {event.returnValue = false;}//for IE
    },
    stopPropagation: function(event){
        if(event.stopPropagation != undefined) {event.stopPropagation();}
        else {  event.cancelBubble = true;} 
    },  
    killEvent: function(event){
        if(typeof event == 'object' && this.getTarget(event) != undefined){
            this.stopPropagation(event);
            this.preventDefault(event);
            return false;
        }else {
            return false;
        }
    },
    getClientSize: function(){
        var winWidth, winHeight
        if (window.innerWidth)
        winWidth = window.innerWidth;
        else if ((document.body) && (document.body.clientWidth))
        winWidth = document.body.clientWidth;
        // 获取窗口高度
        if (window.innerHeight)
        winHeight = window.innerHeight;
        else if ((document.body) && (document.body.clientHeight))
        winHeight = document.body.clientHeight;
        // 通过深入 Document 内部对 body 进行检测，获取窗口大小
        if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
        {
        winHeight = document.documentElement.clientHeight;
        winWidth = document.documentElement.clientWidth;
        }
        return {
            'width': winWidth,
            'height': winHeight
        }
    },
    
    addURLParam: function(url, name, value) { //put the parameters into url
        url += (url.indexOf('?') == -1 ? '?': '&');
        url += encodeURIComponent(name) + '=' + encodeURIComponent(value);

        return url;
    },

    '_guidBase': {},
    getGUID: function(forWhat){//create the GUID
        var curGUID = 'xxxxxxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
            function(c){
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);})
            .toUpperCase()

        if(typeof forWhat == 'string') {
            this['_guidBase'][forWhat] = curGUID;
        }   
                             
        return curGUID;
    },

    randomNum: function (min, max){ 
      min = parseInt(min)  
      max = parseInt(max)
      var range = max - min;   
      var rand = Math.random();   
      return(min + Math.round(rand * range));   
    },
    
    validate: function(tar, type){
        //stone.typeCheck([[type, 'string'], [tar, 'string'] ]);
        
        switch(type) {

            case 'number':
                return _number_pt = /^\d+(\.\d+)?$/.test(tar);
            case 'integer':
                var _integer_pt = /^(-|\+)?\d+$/ ;
                return _integer_pt.test(tar);

            case 'mail':
                //MAIL : "^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$",
                var _email_pt = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
                return _email_pt.test(tar);

            case 'tel':
                //TEL : "^0(10|2[0-5789]|\\d{3})-\\d{7,8}$",
                var _tel_pt = /^[0-9]{3,4}(\-|\s)[0-9]{7,8}$/;
                return _tel_pt.test(tar);
            case 'mobile':
                var _mobile_pt = new RegExp('^1(3[0-9]|5[0-35-9]|8[0235-9])\\d{8}$');
                return _mobile_pt.test(tar);
            case 'url' :
                var _url_pt = new RegExp('^http[s]?://[\\w\\.\\-]+$');
                return _url_pt.test(tar);
            case 'idcard':
                var _id_pt = new RegExp('((11|12|13|14|15|21|22|23|31|32|33|34|35|36|37|41|42|43|44|45|46|50|51|52|53|54|61|62|63|64|65|71|81|82|91)\\d{4})((((19|20)(([02468][048])|([13579][26]))0229))|((20[0-9][0-9])|(19[0-9][0-9]))((((0[1-9])|(1[0-2]))((0[1-9])|(1\\d)|(2[0-8])))|((((0[1,3-9])|(1[0-2]))(29|30))|(((0[13578])|(1[02]))31))))((\\d{3}(x|X))|(\\d{4}))');        
                return _id_pt.test(tar);
            case 'ip':
                var _ip_pt = new RegExp('^((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]|[*])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]|[*])$');
                return _ip_pt.test(tar);
            case 'chinese':
                var _ch_pt = new RegExp('^([\u4E00-\uFA29]|[\uE7C7-\uE7F3])*$');
                return _ch_pt.test(tar);

            // default ==========================================================
            default: 
                this.throwError('TypeError', 'No Type Matched: ' + type );

        }

        return false;
    }
}