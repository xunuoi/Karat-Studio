/**
 * FOR MO.api
 */


let _mo_cache


export default {
    _init (_cache){
        _mo_cache = _cache
    },

    'fetch': function(url, dataType){
        /*let prefix = '/api'

        if(url == '/'){
            prefix = ''
        }*/

        //null and false is OK!
        if(_mo_cache[url] !== undefined){
            return {
                    'done': function(onDone){
                        onDone ? onDone(_mo_cache[url]) : ''
                    }
            }

        }else {
            return $.ajax({
                'url': url,
                'type': 'POST',
                // 'headers': {
                //     'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                //     'Content-Type': 'text/html; charset=utf-8'
                // },

                'dataType': dataType || 'json'
            })
            .fail((err) => {
                console.log(`fetch error: ${url}`,  err)
            })
            .done((data)=>{
                //if succeed, cache the res data
                _mo_cache[url] = data
            })
            .complete((rs)=>{
                // console.log(`fetch complete: ${url}`,  rs)
            })
        }
        
    }
}