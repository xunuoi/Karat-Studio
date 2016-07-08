/**
 * GalleryController
 * 2015-08-28 06:08:59
 * 
 * @description :: Serve
 * r-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 
export default {
    index (req, res) {
        Gallery.find({
            'enable': true
        })
        .sort({'createdAt': -1})
        .exec((err, data) =>{
            
            res.auto('gallery/gallery', {
                'gallery_list': data
            })

        })    
        
    }

}

