/**
 * Article Model
 */

module.exports = {

  tableName: 'comment',

  attributes: {
    // Primitive attributes
    'content': {
      type: 'string',
      required: true
    },

    'article_id': {
      type: 'string',
      required: true
    },

    'mail': {
      type: 'email'
      // required: true
    },

    'nickname': {
      type: 'string',
      required: true
    },

    'author': 'string',
    
    'avatar': {
      type: 'string',
      defaultsTo: '/static/img/common/avatar/2.png'
    },

    'status': {
      type: 'string',
      defaultsTo: 'unread'
    },

    'rel_list': 'array'
    /*[
      {
        'nickname',
        'content',
        'createtime'

      }
    ]*/

  },

  //add comment
  'updateComment': function (c, ...y) {
    this.native( (err, collection)=>{

        if(err) return console.log('Use Native Collection Error: ', err)

        collection.update(c, ...y)
    })

  }
  
};