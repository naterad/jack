// setup Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var findOrCreate = require('mongoose-findorcreate')

var User = require('./user.js');

// Comment schema
var commentSchema = new Schema({
    proj_id: {type: ObjectId, ref: 'project'},
    author: String,
    date: String,
    comment: String
});

// add findorCreate
commentSchema.plugin(findOrCreate);

// create item
var Comment = mongoose.model('comments', commentSchema);

module.exports = Comment;
