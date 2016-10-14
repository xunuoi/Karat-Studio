/**
 * [For Article Query by Pagination]
 * @param  {[type]}   req  [description]
 */


let enableCondition = {
    'enable': {
        '$ne': false
    }
} 

function queryHot(){
    return new Promise((resolve, reject) => {
        Article.find(enableCondition).limit(10)
        .sort({'pv_count': -1})
        .exec((err, rs) => {
            resolve(rs)
        })
    })
}

function queryHotTag(){
    return new Promise((resolve, reject) => {
        Tag.find().limit(14)
        .sort({'pv_count': -1})
        .exec((err, rs) => {
            resolve(rs)
        })
    })
}


function findOneGallery(condition){
    return new Promise((resolve, reject) => {
        Gallery.findOne(condition)
        .exec((err, rs) => {
            resolve(rs)
        })
    })
}

function queried(page=1, QueryModel=Article, condition={}, onComplete, isAdminQuery=false, pageLimit=7){
    // fix page parameter
    if(typeof page !== 'number') {
        page = 1
    }
    //add filter condition
    if(isAdminQuery) {
        pageLimit = 15
    }else {
        condition['enable'] = {
            '$ne': false
        }
    }
    let skipCount = (page-1) * pageLimit

    function getCount() {
        return new Promise((resolve, reject) => {
            QueryModel.count(condition)
            .exec((err, rs) => {
                if(err) reject(err)

                resolve(rs)
            })
        })
    }


    function getArticle(){
        
        return new Promise((resolve) => {
            QueryModel.find(condition)
            .sort({'createdAt': -1})
            .limit(pageLimit)
            .skip(skipCount)
            .exec((err, rs) => {
                if(err) reject(e)

                resolve(rs)
            })
        })
    }


    function renderView(count, articleList){
        let allPages = Math.ceil(count/pageLimit)

        //使用let来声明变量会出现语法错误？？可能是bug
        const prevPage = page > 1 ? (page-1) : false ;
        const nextPage = pageLimit*page < count ? (page+1) : false;
        
        // console.log(prevPage, nextPage)
        onComplete({
            'articleList': articleList,
            'prevPage': prevPage,
            'nextPage': nextPage,
            'allPages': allPages,
            'currentPage': page
        })

    }


    (async function() {

        try {

            let count = await getCount()
            let articleList = await getArticle()

            renderView(count, articleList)

        }catch(e){
            console.log(e)
            return res.serverError(e)
        } 

    })()

}


export {
    queried,
    queryHot,
    queryHotTag,
    findOneGallery
}

