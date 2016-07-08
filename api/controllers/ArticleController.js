/**
 * ArticleController
 * 2015-09-02 11:09:51
 * 
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {queryHot, queryHotTag} from './QueryController'
import {articlePVCount, tagPVCount} from './PVController'


export default {

    //config the blueprint
    _config: {
        actions: true,
        shortcuts: false,
        rest: false
    },

    fragment(req, res, next){

    },


    //view the single article by id
    index (req, res, next) {
        
        (async function() {

            try {

                let article_id = req.param('id')

                let hotArticleList = await queryHot()
                let hotTagList = await queryHotTag()

                Article.findOne({'id': article_id})
                .exec((err, at) => {
                    if(!at) return res.notFound('文章走丢了，或许她从未存在过...')
                    
                    /**
                     * PV 异步统计
                     */
                    //后台统计PV,async...
                    articlePVCount(at)
                    //tag pv async
                    tagPVCount(at)
                    //set relative time
                    // at.createdAt = moment(at.createdAt).fromNow()

                    if(req.method == 'GET'){
                        // console.log(at['type'])
                        return res.auto('article/article', {
                            'article': at,
                            'hotTagList': hotTagList,
                            'hotArticleList': hotArticleList
                        })
                    //for mo.touch fragment
                    }else if(req.method == 'POST'){
                        return res.auto('article/article_fragment', {
                            'article': at,
                            // 'hotArticleList': hotArticleList
                        })
                    }else {
                        return res.serverError()
                    }
                })
            }catch(e){

                console.log(e)
                return res.serverError()

            } 

        })()

    }


}
