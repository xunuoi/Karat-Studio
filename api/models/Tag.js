/**
 * Tag Model
 */

module.exports = {

  tableName: 'tag',

  attributes: {
    // Primitive attributes
    'name': { 
        type: 'string',
        required: true,
        //name必须是不可重复，集合中唯一的
        unique: true
    },
    'pv_count': {
        type: 'integer',
        defaultsTo: 1
    }
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
          'multi': true,
          'upsert': false
        },

        function (err, rs) {
          if(err) return console.log('addCount Error: ', err)

          cb ? cb(err, rs) : ''
          // console.log(rs)
        }
      )
      

    })

  }
};