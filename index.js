// setup Express
var app = require('./models/express.js');

// setup mongoose
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/list');

// models
var api = require('./models/api.js');
var User = require('./models/user.js');
var Project = require('./models/project.js');
//var Comment = require('./models/comment.js');

// app.set('port', (process.env.PORT || 5000));
// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });

// start the server
 var server = app.listen(3000, function() {
 console.log("Started on port 3000");
 var host = server.address().address;
 var port = server.address().port;
 });
