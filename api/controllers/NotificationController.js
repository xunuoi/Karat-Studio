/**
 * NotificationController
 *
 * @description :: Server-side logic for managing Notifications
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {queried} from './QueryController'


export function index(req, res, next, page=1) {
    /*Comment.find()
    .sort({'createdAt': -1})
    .exec((err, rs) => {
        if(err) throw Error(err)

        let articleList = rs
        // console.log(articleList)

        res.render('karat/article_list', {
            'articleList': articleList
        })
    })*/
    return queried(page, Comment, {}, data => {
        res.auto('karat/notification', data)
    }, true)
}


export function remove(req, res, next, page=1) {
    let commentId = req.param('id')
    Comment.destroy({'id': commentId})
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
}


export function read(req, res, next, page=1) {
    // console.log(req.params);
    let commentId = req.param('id')
    let commentStatus = 'read'

    Comment.update({'id': commentId}, {'status': commentStatus})
    .exec((err, dataList) => {
        if(err) res.json({
            'state': 'failed'
        })

        res.json({
            'state': 'succeed',
            'mes': 'update a article'
        })

        
    })
}

