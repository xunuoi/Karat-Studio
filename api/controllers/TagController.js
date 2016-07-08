/**
 * TagController
 * 2015-010-10 17:09:11
 * 
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {join} from 'path'
import {query, queried, queryHot} from './QueryController'


export default {

    index (req, res, next, page=1){
        let cur_tag = req.param('tag');
        // console.log(cur_tag);

        (async function() {

            try {

                let hotArticleList = await queryHot()
                // console.log(hotArticle)

                queried(page, Article, {
                    'tag': cur_tag
                }, (data) => {
                    // console.log(data['articleList'])
                    data['hotArticleList'] = hotArticleList
                    data['tag'] = cur_tag

                    res.auto('tag/tag', data)
                })

            }catch(e){
                console.log(e)
                return res.serverError(e)
            } 

        })()
    },


    page (req, res, next){

        let page = parseInt(req.params['id'])

        this.index(req, res, next, page)
    },

    deleteTag(req,res, next){
        let tag = req.params['tag']
        Tag.destroy({'name': tag})
        .exec((err, rs) => {
            if(!err) {
                return res.json({
                    'state': 'succeed'
                })
            }else {
                return res.json({
                    'state': 'failed',
                    'mes': err.toString()
                })
            }
        })
    },

    addTag (req,res, next) {
        let tag = req.params['tag']
        Tag.create({
            'name': tag,
            'pv_count': 0
        })
        .exec((err, rs) => {
            if(err) res.json({
                'state': 'failed',
                'mes': 'create new tag failed'
            })

            res.json({
                'state': 'create new tag succeed'
            })
        })
    },

    getTag (){

        return new Promise((resolve, reject) => {

            Tag.find()
            .exec((err, rs) => {
                if(err) reject(e)

                resolve(rs)
            })

        })
   
    }

}

