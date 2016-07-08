/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

    tableName: 'user',

    attributes: {
        'user': {
            'type': 'string',
            'unique': true
        },
        'pwd': 'string',
        'salt': 'string',
        //priviledget ,0 means max
        'authority': 'integer',
        'description': 'text'
    }
};

