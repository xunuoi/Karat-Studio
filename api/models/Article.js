/**
 * Article Model
 */

module.exports = {

  tableName: 'article',

  attributes: {
    // Primitive attributes
    'title': {
      type: 'string',
      required: true,
      defaultsTo: '无标题'
    },
    'type': 'string',

    'en_gallery': {
      type: 'boolean',
      defaultsTo: true
    },
    'enable': {
      type: 'boolean',
      defaultsTo: true
    },

    //摘录，简要
    // 'excerpt': 'string',
    //主要内容
    'content': {
      type: 'text',
      required: true
    },

    'author': 'string',

    'link': 'string',
    
    'pv_count': 'integer',

    /**
     * IMG GALLERY MULTI SIZE,keep same with Gallery model
     */
    'img': {
      type: 'array',
    },
    'thumb': {
      type: 'array',
    },
    'mid': {
      type: 'array',
    },
    
    // Associations (aka relational attributes)
    /*'author': { 
      collection: 'Review',
      via: 'movie_id'
    },*/

    'tag': {
      type: 'array'
    },

    //comments
    'comment': {
      type: 'array'
    },

    'excerpt': 'text',
    // Attribute methods
    getExcerpt: function(){

      return this.excerpt
    },

  },

  'addPVCount': function (condition, cb) {
    this.native( (err, collection)=>{
      if(err) return console.log('Use Native Collection Error: ', err)

      collection.update( condition,
        {
            '$inc': {
                'pv_count': 1
            }
        },
        {
          'multi': false,
          'upsert': false
        },

        function (err, rs) {
          if(err) return console.log('addPVCount Error: ', err)

          cb ? cb(err, rs) : ''
          // console.log(rs)
        }
      )
      

    })

  },

  //add comment
  'addComment': function (condition, comment, cb) {
    this.native( (err, collection)=>{
      if(err) return console.log('Use Native Collection Error: ', err)

      collection.update( condition,
        {
            '$push': {
                'comment': comment
            }
        },
        {
          // 'multi': false,
          'upsert': false
        },

        function (err, rs) {
          if(err) return console.log('addComment Error: ', err)

          cb ? cb(err, rs) : ''
          // console.log(rs)
        }
      )
      

    })

  }
  
};