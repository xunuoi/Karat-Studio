/**
 * [For Article Query by Pagination]
 * @param  {[type]}   req  [description]
 */

let ObjectID = require('sails-mongo/node_modules/mongodb').ObjectID;

function articlePVCount(article){

    var oid = new ObjectID(article.id)
    Article.addPVCount({
        '_id': oid
    }, (err, at) => {
        if(err) return console.log(`PV Count Error: ${err}`)
        
        // console.log('add article PVCOUNT Succeed!', at)

    })


}

function tagPVCount(article){
    if(article.tag) Tag.addPVCount({
        'name': {
                '$in': article.tag
            }
        }, (err, rs)=>{
        if(err) return console.log('tagPVCount Error: ', err)

        // console.log('Tag pv count succeed', article.tag)

    })
}   


export {
    articlePVCount,
    tagPVCount
}

