/**
 * TechController
 * 2015-08-28 06:08:55
 * 
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {query, queried, queryHot} from './QueryController'

 
export default {
    index (req, res, next, page=1){
        (async function() {

            try {

                let hotArticleList = await queryHot()
                // console.log(hotArticle)

                queried(page, Article, 
                {
                    'type': 'tech'
                }, 
                (data) => {

                    data['hotArticleList'] = hotArticleList

                    res.auto('tech/tech', data)
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

