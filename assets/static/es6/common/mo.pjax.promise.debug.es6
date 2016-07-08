/**
 * FOR MO.touch
 */


import * as _api from 'mo.api'


let _mo_events = {}
let _mo_cache = {}

//init the _mo_cache
_api._init(_mo_cache)


/**
 * INIT EVENTS
 */
window.addEventListener('popstate', (e) => {
    console.log('*on popstate: ', e)
    
    if (history.state){
        let state = e.state;

        let apiUrl = state['url']
        let onpopFn = _mo_events[apiUrl]
        // console.log(state)
        _execute(state)
        .then(onpopFn)
    }

}, false)


/**
 * CORE PJAX CODE
 * @type {Object}
 */

function _execute(stateObj, dataType){

    //trigger events
    return _trigger(stateObj, dataType)

   //sent async ajax request
    // return _api['fetch'](apiUrl, dataType) 
    
}

function _register(apiUrl, fn){
    //update events fn
    delete _mo_events[apiUrl]

    _mo_events[apiUrl] = fn
}


function _trigger(stateObj, dataType){

    return new Promise((resolve, reject)=>{

        let apiUrl = stateObj['url']
        let title = stateObj['title']

        console.log(`*trigger: ${apiUrl}`)

        return _api
        .fetch(apiUrl, dataType)
        .success((res)=>{
            document.title = title
            resolve(res)
        })
        .fail(err=>{
            reject(err)
        })

    })
}


function touch(apiUrl, title){
        // _register(apiUrl, onpopFn)

        let state = {
            'url': apiUrl,
            'title': title
        }

        /**
         * 此时push的是下个当前状态，不是上个状态。
         * 上个状态，在操作之前的时候就确定了
         */ 
        history.pushState(state, document.title, apiUrl)

        return _execute(state, 'html')
   
}



function state(url, title, onpopFn, data){
    _register(url, onpopFn)
    //if data is null, it will be also cached!
    _mo_cache[url] = data === undefined ? undefined : data

    history.replaceState({
        'url': url,
        'title': title,
    }, title, '')

    // return

}


export {
    touch,
    state
}
