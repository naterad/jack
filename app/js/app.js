var Router = ReactRouter.Router;
var Link = ReactRouter.Link;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.Route;
var History = ReactRouter.History;

var App = React.createClass({
    mixins: [ History ],
  // context so the componevnt can access the router
  contextTypes: {
    router: React.PropTypes.func
  },

  // initial state
  getInitialState: function() {
    return {
      // the user is logged in
      loggedIn: auth.loggedIn()
    };
  },

  // callback when user is logged in
  setStateOnAuth: function(loggedIn) {
    this.state.loggedIn = loggedIn;
  },

  // when the component loads, setup the callback
  componentWillMount: function() {
    auth.onChange = this.setStateOnAuth;
  },

  // logout the user and redirect to home page
  logout: function(event) {
    auth.logout();
    //this.context.router.replaceWith('/');
    this.history.pushState(null, '/');
  },
  render: function() {
    return (
      <div>
      <div className="hidden">
      <nav className="navbar navbar-default" role="navigation">
      <div className="container">
      <div className="navbar-header">
      <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
      <span className="sr-only">Toggle navigation</span>
      <span className="icon-bar"></span>
      <span className="icon-bar"></span>
      <span className="icon-bar"></span>
      </button>
      <a className="navbar-brand" href="/">Jack</a>
      </div>
      <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul className="nav navbar-nav">
      <li><Link to="page">Page</Link></li>
      </ul>
      </div>
      </div>
      </nav>
      </div>


      <div className="container">
      {this.props.children || <Login/>}
      </div>
      </div>
    );
  }
});

var Login = React.createClass({
  mixins: [ History ],
  getInitialState: function() {
    return {
      // there was an error on logging in
      error: false
    };

  },
  login: function(event) {

    // get data from form
    var email = this.refs.email.value;
    var password = this.refs.password.value;
    if (!email || !password) {
      return;
    }
    // login via API
    auth.login(email, password, function(loggedIn) {
      // login callback
      if (!loggedIn)
      return this.setState({
        error: true
      });
      console.log('logged in');
      this.history.pushState(null, '/listpage');
    }.bind(this));
  },
  render: function() {
    return (
      <div className="login">

      <form className="form">
      <input type="text" placeholder="Email" ref="email" autoFocus={true} />
      <br/>
      <input type="password" placeholder="Password" ref="password"/>
      <br/>
      <br/>
      <input className="btn" type="submit"  onClick={this.login} value="Login" />
      {this.state.error ? (
        <div className="alert">Invalid email or password.</div>
      ) : null}
      </form>
      

      <Link to="signup"><input className="btn" type="button" value="Signup"/></Link>

      </div>
    );
  }
});

var ListPage = React.createClass({
  mixins: [ History ],
  getInitialState: function() {
    return {projects: []};
  },
  componentWillMount:function(){
    console.log('first?');
    var url = "/api/projects";
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'GET',
      headers: {'Authorization': localStorage.token},
      data: {
      },
      // on success, store a login token
      success: function(res) {
        console.log("it worked");
        console.log(JSON.stringify(res));
        localStorage.projects=res.projects;
        this.setState({projects: res.projects});
        //if (cb)
        //cb(true);
        //this.onChange(true);
      }.bind(this),
      error: function(xhr, status, err) {
        // if there is an error, remove any login token
        console.log("didn't worked");
        // delete localStorage.token;
        // if (cb)
        // cb(false);
        // this.onChange(false);
      }.bind(this)
    });
  },
  handleClick:function(proj_id){
    console.log("should go to "+proj_id);
    localStorage.proj_id=proj_id;
    this.history.pushState(null, '/projectpage/'+localStorage.proj_id);
  },
  render: function() {
    console.log('after?');
    //var results=localStorage.projects;
    var results=this.state.projects;

    var list=results.map(function(result) {
      //var boundClick = this.handleClick.bind(this,{result._id});
      return (
        <div key={result._id} id={result._id} onClick={this.handleClick.bind(this, result._id)} /*onClick={boundClick}*/ className="list_item"><table className="table"><tbody><tr><td>{result.owner_name}</td><td>{result.proj_num}</td><td>{result.address}</td><td>{result.job_type}</td><td>{result.carrier}</td></tr></tbody></table></div>
      );
    }, this);
    //console.log('before:'+JSON.stringify(results[0]));
    return (
      <div>
      <Header/>
      <div className="body_div">
      <div className="align_add">
      <h1>Project List</h1>
      <div className="add"><Link to="addproject">add project</Link></div>
      </div>
      {list}

      </div>
      </div>
    );
  }
});

var ProjectPage = React.createClass({
  addComment: function(event) {
    // prevent default browser submit
    event.preventDefault();
    // get data from form
    var comment = this.refs.comment.value;
    if (!comment) {
      return;
    }
    // call API to add comment, and reload once added
    apiCall.addComment(comment, this.props.reload);
    this.refs.comment.value = '';
    this.refs['comment_section'].componentWillMount();
  },
  getInitialState: function() {
    return {project: {}};
  },
  componentWillMount:function(){
    console.log('first?');
    var url = "/api/projects/"+localStorage.proj_id;
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'GET',
      headers: {'Authorization': localStorage.token},
      data: {
      },
      // on success, store a login token
      success: function(res) {
        console.log("it worked");
        console.log(JSON.stringify(res));
        this.setState({project:res.project});
        console.log(localStorage.owner_name);
        //if (cb)
        //cb(true);
        //this.onChange(true);
      }.bind(this),
      error: function(xhr, status, err) {
        // if there is an error, remove any login token
        console.log("didn't worked");
        // delete localStorage.token;
        // if (cb)
        // cb(false);
        // this.onChange(false);
      }.bind(this)
    });
  },
  render: function() {

    return (
      <div>

      <Header/>
      <div className="body_div">
      <h1>{this.state.project.proj_num}</h1>
      <div className="proj_body">
      <div className="left_right_container">
      <div className="proj_body_left">
      <p>Name: {this.state.project.owner_name}</p>
      <p>Address: {this.state.project.address}</p>
      <p>Start Date: {this.state.project.start_date}</p>
      <p>Est. End Date: {this.state.project.end_date}</p>
      <p>Project #: {this.state.project.proj_num}</p>
      </div>
      <div className="proj_body_right">
      <p>Claim #: {this.state.project.claim}</p>
      <p>Job Type: {this.state.project.job_type}</p>
      <p>Carrier: {this.state.project.carrier}</p>
      <p>User 1: {this.state.project.user2}</p>
      <p>User 2: {this.state.project.user3}</p>
      </div>
      </div>
      </div>
      <br />
      <p>Comments</p>


      <div className="add_comment_container">
      <form id="item-form" name="itemForm" onSubmit={this.addComment}>
      <input  className="comment_text" type="text" id="new-comment" ref="comment" placeholder="Add comment" autoFocus={true}/>
      </form>
      </div>

      <Comment ref='comment_section'/>

      </div>
      </div>
    );
  }
});

var Comment = React.createClass({
  getInitialState: function() {
    return {comments: []};
  },
  componentWillMount:function(){
    console.log('first?');
    var url = "/api/comments/"+localStorage.proj_id;
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'GET',
      headers: {'Authorization': localStorage.token},
      data: {
      },
      // on success, store a login token
      success: function(res) {
        console.log("it worked");
        console.log(JSON.stringify(res));
        localStorage.comments=res.comments;
        this.setState({comments: res.comments});

        //if (cb)
        //cb(true);
        //this.onChange(true);
      }.bind(this),
      error: function(xhr, status, err) {
        // if there is an error, remove any login token
        console.log("didn't worked");
        // delete localStorage.token;
        // if (cb)
        // cb(false);
        // this.onChange(false);
      }.bind(this)
    });
  },
  render: function() {
    var results=this.state.comments;
    results.reverse();
    var list=results.map(function(result) {
      //var boundClick = this.handleClick.bind(this,{result._id});
      return (
        <div key={result._id} className="comment"><p className="comment_details">{result.author}, {result.date}</p><p>{result.comment}</p></div>
      );
    }, this);
    return (
      <div className="comment_section">
      {list}

      </div>
    );
  }
});

var Profile = React.createClass({
  render: function() {
    return (
      <div>

      <Header/>
      <div className="body_div">
      <h1>Profile</h1>
      <Link to="login">back to login page</Link>
      </div>
      </div>
    );
  }
});

var AddProject = React.createClass({
  mixins: [ History ],
  // initial state
  getInitialState: function() {
    return {
      // there was an error registering
      error: false
    };
  },

  // handle regiser button submit
  addnewproject: function(event) {
    //debugger;
    // prevent default browser submit
    event.preventDefault();
    // get data from form
    var owner_name = this.refs.owner_name.value;
    var project_num = this.refs.project_num.value;
    var address = this.refs.address.value;
    var carrier = this.refs.carrier.value;
    var job_type = this.refs.job_type.value;
    var start_date = this.refs.start_date.value;
    var end_date = this.refs.end_date.value;
    var claim = this.refs.claim.value;
    var user2 = this.refs.user2.value;
    var user3 = this.refs.user3.value;
    if (owner_name && project_num && address && carrier && job_type && start_date && end_date && claim ) {

      // register via the API
      //project.addNew(owner_name,project_name, address, carrier, start_date, end_date, claim, function(loggedIn) {
      project.addNew(owner_name, project_num, address, carrier, job_type, start_date, end_date, claim, user2, user3, function(loggedIn) {
        // register callback
        if (!loggedIn)
        return this.setState({
          error: true
        });
        //this.context.router.transitionTo('/list');
        this.history.pushState(null, '/projectpage/'+localStorage.proj_id);
      }.bind(this));
    }
  },

  render: function() {
    return (
      <div>

      <Header/>
      <div className="body_div">
      <h1>New Project</h1>

      <div className="newproject">
      <form className="form">
      <input type="text" title="Home owner name" placeholder="Home owner name" ref="owner_name"/>
      <input type="text" title="Project number" placeholder="Project number" ref="project_num"/>
      <input type="text" title="Address" placeholder="Address" ref="address"/>
      <input type="text" title="Carrier" placeholder="Carrier" ref="carrier"/>
      <input type="text" title="Job type" placeholder="Job type" ref="job_type"/>
      <input type="text" title="Start date" placeholder="Start date" ref="start_date"/>
      <input type="text" title="Estimated end date" placeholder="Estimated end date" ref="end_date"/>
      <input type="text" title="Claim number" placeholder="Claim number" ref="claim"/>
      <br />
      <div>Additional Users</div>
      <input type="text" title="Email" placeholder="Email" ref="user2"/>
      <input type="text" title="Email" placeholder="Email" ref="user3"/>
      <br />
      <br />
      <input className="btn addsubmit" onClick={this.addnewproject} type="submit" value="Submit"/>
      {this.state.error ? (
        <div className="alert">Invalid input.</div>
      ) : null }
      </form>
      </div>
      </div>
      </div>
    );
  }
});
var Signup=React.createClass({
  mixins: [ History ],
  // initial state
  getInitialState: function() {
    return {
      // there was an error registering
      error: false
    };
  },

  // handle regiser button submit
  register: function(event) {
    //debugger;
    // prevent default browser submit
    event.preventDefault();
    // get data from form
    var first = this.refs.first.value;
    var last = this.refs.last.value;
    var email = this.refs.email.value;
    var password = this.refs.password.value;
    var confirm = this.refs.confirm.value;
    if (!first || !last || !password||!email||!confirm||(confirm!=password)) {
      return;
    }
    // register via the API
    auth.register(first,last, email, password, function(loggedIn) {
      // register callback
      if (!loggedIn)
      return this.setState({
        error: true
      });
      console.log('registered');
      //this.context.router.transitionTo('/list');
      this.history.pushState(null, '/listpage');
    }.bind(this));
  },
  render: function(){
    return(
      <div className="signup" onSubmit={this.register}>
      <form className="form">
      <input type="text" placeholder="First name" ref="first"/>
      <br />
      <input type="text" placeholder="Last name" ref="last"/>
      <br />
      <input type="text" placeholder="Email" ref="email"/>
      <br />
      <input type="password" placeholder="Password" ref="password"/>
      <br />
      <input type="password" placeholder="Confirm Password" ref="confirm"/>
      <br />
      <input type="submit" className="btn" value="Register"/>
      {this.state.error ? (
        <div className="alert">Invalid email or passwords do not match.</div>
      ) : null }
      </form>
      </div>
    );
  }
});

var Header = React.createClass({
  render: function() {
    return (
      <div className="header">
      <div className="brand">Jack</div>
      <div className="navbar">

      <span className="navbar_p"><Link to="addproject">Add Project</Link></span>
      <span className="navbar_p"><Link to="listpage">Project List</Link></span>
      <span className="navbar_p"><Link to="profile">Profile</Link></span>
      <span className="navbar_p"><Link to="login">Logout</Link></span>

      </div>
      </div>
    );
  }
});
var project = {
  addNew: function(owner_name, proj_num, address, carrier, job_type, start_date, end_date, claim, user2, user3, cb) {
    console.log("in the addNew");
    //console.log(cb);
    // submit request to server, call the callback when complete
    var url = '/api/projects';
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'POST',
      headers: {'Authorization': localStorage.token},
      data: {
        owner_name: owner_name,
        proj_num: proj_num,
        address: address,
        carrier: carrier,
        job_type: job_type,
        start_date: start_date,
        end_date: end_date,
        claim: claim,
        user2: user2,
        user3: user3
      },
      // on success, store a login token
      success: function(res) {
        console.log("success"+res.project._id);
        localStorage.proj_id=res.project._id;
        //localStorage.owner_name = res.owner_name;
        //localStorage.email = res.email;
        //localStorage.email = res.email;

        if (cb)
        cb(true);
        //this.onChange(true);
      }.bind(this),
      error: function(xhr, status, err) {
        console.log("error with adding a new project");
        console.log(err);
        // if there is an error, remove any login token
        // delete localStorage.token;
        // if (cb)
        //     cb(false);
        // this.onChange(false);
      }.bind(this)
    });
  }

};
var apiCall = {
  // add an item, call the callback when complete
  addComment: function(comment, cb) {
    var url = "/api/comments";
    var dt=new Date();
    var timestamp=(dt.getMonth()+1)+'/'+dt.getDate()+'/'+dt.getFullYear()+' '+dt.getHours()+':';
    if(dt.getMinutes()<10)
    timestamp+='0';
    timestamp+=dt.getMinutes()
    $.ajax({
      url: url,
      contentType: 'application/json',
      data: JSON.stringify({
        item: {
          'comment': comment,
          'proj_id':localStorage.proj_id,
          'date': timestamp
        }
      }),
      type: 'POST',
      headers: {'Authorization': localStorage.token},
      success: function(res) {
        if (cb)
        cb(true, res);
      },
      error: function(xhr, status, err) {
        // if there is an error, remove the login token
        delete localStorage.token;
        if (cb)
        cb(false, status);
      }
    });

  }
};
// authentication object
var auth = {
  register: function(first,last, email, password, cb) {
    // submit request to server, call the callback when complete
    var url = "/api/users/register";
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'POST',
      data: {
        first: first,
        last: last,
        email: email,
        password: password
      },
      // on success, store a login token
      success: function(res) {
        localStorage.token = res.token;
        console.log(email);
        console.log(res.token);
        localStorage.first=res.first;
        localStorage.last=res.last;
        localStorage.email = email;
        if (cb)
        cb(true);
        this.onChange(true);
      }.bind(this),
      error: function(xhr, status, err) {
        // if there is an error, remove any login token
        delete localStorage.token;
        if (cb)
        cb(false);
        this.onChange(false);
      }.bind(this)
    });
  },
  // login the user
  login: function(email, password, cb) {
    delete localStorage.token;
    // submit login request to server, call callback when complete
    cb = arguments[arguments.length - 1];
    // submit request to server
    var url = "/api/users/login";
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'POST',
      data: {
        email: email,
        password: password
      },
      success: function(res) {
        console.log('res>>'+JSON.stringify(res));
        // on success, store a login token
        localStorage.token = res.token;
        localStorage.email = email;
        localStorage.first=res.first;
        localStorage.last=res.last;
        if (cb)
        cb(true);
        this.onChange(true);
      }.bind(this),
      error: function(xhr, status, err) {
        console.log('error!');
        // if there is an error, remove any login token
        delete localStorage.token;
        if (cb)
        cb(false);
        this.onChange(false);
      }.bind(this)
    });
  },
  // get the token from local storage
  getToken: function() {
    return localStorage.token;
  },
  // get the email from local storage
  getEmail: function() {
    return localStorage.email;
  },
  // logout the user, call the callback when complete
  logout: function(cb) {
    delete localStorage.token;
    if (cb) cb();
    this.onChange(false);
  },
  // check if user is logged in
  loggedIn: function() {
    console.log(!!localStorage.token);
    return !!localStorage.token;
  },
  // default onChange function
  onChange: function() {},
};
// Run the routes
var routes = (
  <Router>
  <Route name="app" path="/" component={App}>
  <Route name="listpage" path="/listpage" component={ListPage} />
  <Route name="login" path="/login" component={Login} />
  <Route name="addproject" path="/addproject" component={AddProject} />
  <Route name="signup" path="/signup" component={Signup} />
  <Route name="projectpage" path="/projectpage/:id" component={ProjectPage} />
  <Route name="profile" path="/profile" component={Profile} />
  </Route>
  </Router>
);

ReactDOM.render(routes, document.getElementById('content'));
