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
        console.info(data);
        res.auto('karat/notification', data)
    }, true)
}

