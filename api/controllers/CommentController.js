/**
 * CommentController
 * 2015-11-02 09:11:17
 * 
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


let ObjectID = require('sails-mongo/node_modules/mongodb').ObjectID;


export default {

    _config: {
        actions: true,
        shortcuts: false,
        rest: false
    },

    /*index (req, res, next) {

        res.auto('comment/comment')
        
    }*/

    get(req, res, next){
        let article_id = req.param('id')

        Comment.find({'article_id': article_id})
        .sort({'createdAt': -1})
        .exec((err, rs)=>{
            if(err) return res.serverError(err)

            /*for (let c of rs){
                c.createdAt = moment(c.createdAt).fromNow()
            }*/

            res.auto('comment/comment', {
                'comment_list': rs
            })
        })
        
        
    },

    //submit new comment
    add(req, res, next){
        let comment = req.body
        let article_id = req.param('id')

        let rel_commentId = req.param('rel_comment')

        // console.log(req.session.verification)
        if(comment.verification.toLowerCase() !== req.session.verification.toLowerCase()){

            res.status(400)

            return res.json({
                'status': 'failed',
                'code': 1,
                'message': 'verification code is wrong'
            })
        }


        if(!rel_commentId){           
            Comment.create(comment)
            .exec((err, rs)=>{
                if(err) {
                    res.status(400)

                    return res.json({
                        'status': 'failed',
                        'error': err,
                        'message': 'add comment failed'
                    })
                }

                res.auto('comment/comment_unit',{
                    'comment': rs
                })
            })
        }else {
            // console.log(rel_commentId, comment)
            var cid = new ObjectID(rel_commentId)

            comment.createdAt = (new Date()).getTime()
            comment.id = article_id
            //rel list 
            Comment.updateComment(
                {
                    '_id': cid
                },

                {
                    '$push': {
                        'rel_list': comment
                    }
                },

                {
                  'multi': false,
                  'upsert': false
                },

                function (err, rs) {
                    if(err) return console.log('addComment Error: ', err)

                    // console.log('result:', rs)

                    res.auto('comment/res_unit',{
                        'rc_comment': comment
                    })

                }
            )
        }
    }
}

