/**
 * GalleryController
 * 2015-08-28 06:08:59
 * 
 * @description :: Serve
 * r-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

import {queried} from './QueryController'

 
export default {
    index (req, res, next, page=1) {
        /*Gallery.find({
            'enable': true
        })
        .sort({'createdAt': -1})
        .exec((err, data) =>{
            
            res.auto('gallery/gallery', {
                'gallery_list': data
            })

        })*/
        return queried(page, Gallery, {}, data => {
            res.auto('gallery/gallery', data)
        }, false, 4)
        
    },

    page (req, res, next){
        let page = parseInt(req.params['id'])
        this.index(req, res, next, page)
    }

}

