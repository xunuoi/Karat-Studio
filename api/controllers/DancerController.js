/**
 * DancerController
 * 2015-08-25 09:08:43
 * 
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import { queried } from './QueryController'


export default {
    index (req, res, next, page=1) {

        return queried(page, Gallery, {
        	title: '几组街拍和人像摄影',
        }, data => {
            res.auto('dancer/dancer', data)
        }, false, 2)
        
    },

    page (req, res, next){
        let page = parseInt(req.params['id'])
        this.index(req, res, next, page)
    }

}

