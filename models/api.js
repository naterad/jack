var app = require('./express.js');
var User = require('./user.js');
var Project = require('./project.js');
var Comment = require('./comments.js');

// setup body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//
// API
//

// register a user
app.post('/api/users/register', function (req, res) {
  // find or create the user with the given email
  User.findOrCreate({email: req.body.email}, function(err, user, created) {
    if (created) {
      // if this email is not taken, then create a user record
      //user.first = req.body.first;
      //user.last = req.body.last;
      user.setFirst(req.body.first);
      user.setLast(req.body.last);
      user.set_password(req.body.password);
      user.save(function(err) {
        if (err) {
          res.sendStatus("403");
          return;
        }
        // create a token
        var token = User.generateToken(user.email);
        // return value is JSON containing the user's name and token
        res.json({first: user.first_name, last:user.last_name,token: token});
      });
    } else {
      // return an error if the email is taken
      res.sendStatus("403");
    }
  });
});

// login a user
app.post('/api/users/login', function (req, res) {
  // find the user with the given email
  User.findOne({email: req.body.email}, function(err,user) {
    if (err) {
      res.sendStatus(403);
      return;
    }
    // validate the user exists and the password is correct
    if (user && user.checkPassword(req.body.password)) {
      // create a token
      var token = User.generateToken(user.email);
      // return value is JSON containing user's name and token
      res.json({first: user.first_name,last:user.last_name, token: token});
    } else {
      res.sendStatus(403);
    }
  });
});

// get all projects for the user
app.get('/api/projects', function (req,res) {
  // validate the supplied token
  user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      // if the token is valid, find all the user's projects and return them
      Project.find({$or:[{user:user.id},{user2:user.email},{user3:user.email}]}, function(err, projects) {
        if (err) {
          res.sendStatus(403);
          return;
        }
        // return value is the list of projects as JSON
        res.json({projects: projects});
      });
    } else {
      res.sendStatus(403);
    }
  });
});

// add a project
app.post('/api/projects', function (req,res) {
  // validate the supplied token
  // get indexes
  console.log("inside the add function");
  user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      // if the token is valid, create the project for the user
      Project.create({user:user.id, owner_name: req.body.owner_name, proj_num:req.body.proj_num, address:req.body.address, carrier:req.body.carrier, job_type:req.body.job_type, start_date:req.body.start_date, end_date:req.body.end_date, claim:req.body.claim, user2:req.body.user2, user3:req.body.user3 }, function(err,project) {

        if (err) {
          res.sendStatus(403);
          return;
        }
        res.json({project:project});
      });
    } else {
      res.sendStatus(403);
    }
  });
});

// get a project
app.get('/api/projects/:project_id', function (req,res) {
  // validate the supplied token
  user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      console.log(req.params.project_id);
      // if the token is valid, then find the requested project
      Project.findById(req.params.project_id, function(err, project) {
        if (err) {
          res.sendStatus(403);
          return;
        }
        // get the project if it belongs to the user, otherwise return an error
        //commmented out since user2/user3 can open project
        /*if (project.user != user) {
          res.sendStatus(403);
          return;
        }*/
        // return value is the project as JSON
        res.json({project:project});
      });
    } else {
      res.sendStatus(403);
    }
  });
});

//get comments for project
app.get('/api/comments/:project_id', function (req,res) {
  // validate the supplied token
  user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      // if the token is valid, find all the project's comments and return them
      Comment.find({proj_id:req.params.project_id}, function(err, comments) {
        if (err) {
          res.sendStatus(403);
          return;
        }
        // return value is the list of comments as JSON
        res.json({comments: comments});
      });
    } else {
      res.sendStatus(403);
    }
  });
});

//add a comment to project
app.post('/api/comments', function (req,res) {
  // validate the supplied token
  // get indexes
  console.log("inside the add function");
  user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      console.log("inside the comment if statement");
      console.log(JSON.stringify(req.body));

      Comment.create({proj_id:req.body.item.proj_id,author:user.last_name+','+user.first_name,date:req.body.item.date,comment:req.body.item.comment}, function(err,project) {

        if (err) {
          res.sendStatus(403);
          return;
        }
        res.json({project:project});
      });
    } else {
      res.sendStatus(403);
    }
  });
});

// update an project
app.put('/api/projects/:project_id', function (req,res) {
  // validate the supplied token
  user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      // if the token is valid, then find the requested project
      Project.findById(req.params.project_id, function(err,project) {
        if (err) {
          res.sendStatus(403);
          return;
        }
        // update the project if it belongs to the user, otherwise return an error
        if (project.user != user.id) {
          res.sendStatus(403);
          return;
        }
        project.title = req.body.project.title;
        project.completed = req.body.project.completed;
        project.save(function(err) {
          if (err) {
            res.sendStatus(403);
            return;
          }
          // return value is the project as JSON
          res.json({project:project});
        });
      });
    } else {
      res.sendStatus(403);
    }
  });
});

// delete an project
app.delete('/api/projects/:project_id', function (req,res) {
  // validate the supplied token
  user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      // if the token is valid, then find the requested project
      Project.findByIdAndRemove(req.params.project_id, function(err,project) {
        if (err) {
          res.sendStatus(403);
          return;
        }
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(403);
    }
  });
});
