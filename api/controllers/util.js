import ccap from 'ccap'

// var captcha = ccap()

// var captcha = ccap(100, 50, 0)

function captcha (genFn) {

    return ccap({

        width:96,//set width,default is 256

        height:34,//set height,default is 60

        offset:22,//set text spacing,default is 40

        quality: 50,//set pic quality,default is 50

        fontsize:32,//set font size,default is 57

        generate: genFn

    })
}


function guid (){//create the GUID
    var curGUID = 'xxxxxxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function(c){
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);})
        .toUpperCase()
              
    return curGUID;
}
                


export {
    captcha,
    guid
}