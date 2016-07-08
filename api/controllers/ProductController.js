/**
 * ProductController
 * 2015-08-28 07:08:15
 * 
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 
export default {
    index (req, res) {

        res.auto('product/product')
        
    }
}

