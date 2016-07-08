/**
 * EssayController
 * 2015-08-28 06:08:50
 * 
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {queried, queryHot, queryHotTag} from './QueryController'

 
export default {

    index (req, res, next, page=1){

        (async function() {

            try {

                let hotArticleList = await queryHot()
                let hotTagList = await queryHotTag()
                // console.log(hotArticle)

                queried(page, Article, 
                {
                    // 'type': 'essay'
                }, 
                (data) => {
                    data['hotTagList'] = hotTagList
                    data['hotArticleList'] = hotArticleList

                    res.auto('essay/essay', data)
                })

            }catch(e){
                console.log(e)
                return res.serverError(e)
            } 

        })()
    },


    page (req, res, next){
        // console.log(req.params)

        let page = parseInt(req.params['id'])

        this.index(req, res, next, page)
    }
}

