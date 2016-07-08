/**
 * Gallery Model
 */

module.exports = {

  tableName: 'gallery',

  attributes: {
    // Primitive attributes
    'title': {
      type: 'string',
      required: true
    },
    'description': 'text',

    'article_id': {
      type: 'string',
      required: true
    },

    /**
     * FOR MULTI SIZE IMG
     */
    'img': {
      //default is /img/large size, not /img raw size
      type: 'array',
      // required: true
    },
    'thumb': {
      type: 'array',
      // required: true
    },
    'mid': {
      type: 'array',
      // required: true
    },
    'raw': {
      //raw size...
      type: 'array',
      // required: true
    },

    'enable': 'boolean',
    'author': 'string'
  }
};