/**
 * ToxicController
 * 2015-11-10 04:11:19
 * 
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {queryHot} from './QueryController'


export default {
    index (req, res, next, page=1){
        (async function() {

            try {
                let data = {}
                let hotArticleList = await queryHot()

                data['hotArticleList'] = hotArticleList
                res.auto('toxic/toxic', data)
                

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

