let _component = {
    'source': {
        'img': ['/static/abd.jpg']
    }
}

function addImg(src){
    //window add img
}

function preload(component) {
    if(component.source && component.source.img){
        if(typeof component.source.img == 'string'){
            addImg(component.source.img)
        }else {

            //component.source.img.forEach
        }
    }
}


export {
    preload
}