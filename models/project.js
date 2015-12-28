// setup Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var findOrCreate = require('mongoose-findorcreate')

var User = require('./user.js');

// Project schema
var projectSchema = new Schema({
    user: {type: ObjectId, ref: 'users'},
    owner_name: String,
    proj_num: String,
    address: String,
    carrier: String,
    job_type: String,
    start_date: String,
    end_date: String,
    claim: String,
    user2: String,
    user3: String,
    // start: {type: Date, default: Date.now},
    // end: {type: Date, default: Date.now}
});

projectSchema.methods.setTitle=function(title){
  this.title=title;
};

// ensure schemas use virtual IDs
projectSchema.set('toJSON', {
    virtuals: true
});

// add findorCreate
projectSchema.plugin(findOrCreate);

// create item
var Project = mongoose.model('projects', projectSchema);

module.exports = Project;
