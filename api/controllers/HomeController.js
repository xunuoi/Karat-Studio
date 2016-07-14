/**
 * HomeController
 * 2015-08-21 02:08:38
 * 
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {queried, queryHot, queryHotTag} from './QueryController'


export default {


    index (req, res, next, page=1){
        return res.location('https://itunes.apple.com/us/app/app-annie/id660004961?ls=1&mt=8')
        (async function() {
            try {

                let hotArticleList = await queryHot()
                let hotTagList = await queryHotTag()
                queried(page, Article, {}, (data) => {
                    //添加热度数据
                    data['hotArticleList'] = hotArticleList
                    data['hotTagList'] = hotTagList
                    res.auto('home/home', data)
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

