var express = require('express'),
    app = express(),
    _ = require('underscore'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

// require express-session for authentication (stores current user)
var session = require('express-session');

// configure session
app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: 'SuperSecretCookie',
  cookie: { maxAge: 60000 }
}));

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/pickup');
var Line = require('./line');
var User = require('./user');

// OPEN THE API TO REQUESTS FROM ANY DOMAIN
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname));


// MIDDLEWARE
// custom middleware to manage our sessions
app.use('/', function (req, res, next) {
  // saves userId in session for logged-in user
  req.login = function (user) {
    req.session.userId = user._id; 
    console.log("login: user id " + req.session.userId )
  };

  // finds user currently logged in based on `session.userId`
  req.currentUser = function (callback) {
    User.findOne({_id: req.session.userId}, function (err, user) {
      console.log("finding current user from session ", req.session);
      if (!user){
        callback("could not find user", null);
      } else {  
        req.user = user;
        console.log("found current user: ", user);
        callback(null, user);
      }
    });
  };

  // destroy `session.userId` to log out user
  req.logout = function () {
    req.session.userId = null;
    req.user = null;
  };

  next();  // required for middleware
});

app.get('/', function(req, res) {
  var index = __dirname + "/index.html";
  res.sendFile(index);
});


// @AUTH
// USER#CREATE
// create new user with secure password and log user in automatically
app.post('/api/users', function (req, res) {
  console.log("server received signup form data: ", req.body.user);
  var newUser = req.body.user;
  User.createSecure(newUser, function (err, user) {
    // log user in automatically when created
    req.login(user);
    //res.json(user); // can send user json to test...
    res.redirect('/'); // but for real, want to redirect to home page
  });
});

// @AUTH
// authenticate user and set session
app.post('/login', function (req, res) {
    // from client:
    // var userData = {
    //   email: $("#login-user-email").val(),
    //   password: $("#login-user-password").val()
    // };
  console.log("server received login form data: ", 
    req.body.email, req.body.password);

  User.authenticate(req.body.email, req.body.password, function (err, user) {
    if (user){
      req.login(user);
      console.log("authenticated user: ", user);

      //res.redirect('/profile');  // <- ideally redirect to a profile view
      res.json(user);
    } else {
      // send the client
      // whatever error came from the authentication code
      res.status(500).send(err);
    }
  });
});


// @AUTH
// see who the current user is 
app.get('/currentuser', function (req, res) {
  // check for current (logged-in) user
  // @BUG during demo, Brianna was using req.login here  :(
  req.currentUser(function(err, user) {
    // once the user is found in the db, send it back
    res.json(user);
  });
});

// once we can tell who current user is:
// - change the front end based on looking it up
// - add stuff / delete stuff only if the user is logged in




// LINES#QUERY
app.get('/api/lines', function(req, res) {
  //console.log(Line);
  Line.find().sort('-_id').exec(function(err, lines) {
    //console.log(lines);
    res.json(lines);
  });
});

// LINES#CREATE
app.post('/api/lines', function(req, res) {
  // make new line
  var line = new Line({
    text: req.body.text
  });
  // save line to db
  line.save(function(err, line) {
    // once saved, send back the line
    res.json(line);
  });
});

// @RELATIONSHIP
// add an existing line to a user's line list
// using PUT because we know exactly what the url will be
app.put('/api/users/:userid/lines/:lineid', function (req, res){
  // look up the user
  User.findOne({_id: req.params.userid}, function (err, foundUser){
    if (foundUser){
      // look up the line
      Line.findOne({_id: req.params.lineid}, function(err, foundLineResult){
        if (foundLine){
          // have user and line! can add
          foundUser.lines.push(foundLine);
          // don't forget to save the user changes to db
          foundUser.save();
          // send response for success
          res.json(foundUser);
        } else {
          // didn't find the line
          res.status(500).send("database error: no line found with id ", req.params.lineid);
        }
      });
    } else {
      // didn't find the user
      res.status(500).send("database error: no user found with id ", req.params.userid);
    }
  })
});


// @RELATIONSHIP  @AUTHORIZATION (NOT MINIMUM)
// this time we'll add an existing line to a user's line list
// ONLY if the userid matches the current user
// going to mess with the route a little to distinguish from prevoius
// but in real world would use the same url as simpler version above
app.put('/api/users/:userid/lines/:lineid/AUTHORIZED', function (req, res){
  // check if there is a user logged in
  req.currentUser(function (err, current){
    if (current && current._id === req.params.userid){
    // someone is logged in, and it's the same person who's list we're changing
    // do the same thing as we did above
      // look up the user
      User.findOne({_id: req.params.userid}, function (err, foundUser){
        if (foundUser){
          // look up the line
          Line.findOne({_id: req.params.lineid}, function(err, foundLineResult){
            if (foundLine){
              // have user and line! can add
              foundUser.lines.push(foundLine);
              // don't forget to save the user changes to db
              foundUser.save();
              // send response for success
              res.json(foundUser);
            } else {
              // didn't find the line
              res.status(500).send("database error: no line found with id ", req.params.lineid);
            }
          });
        } else {
          // didn't find the user
          res.status(500).send("database error: no user found with id ", req.params.userid);
        }
      });
    } else {
      // there was no current user
      res.status(500).send("must be logged in to add line to user");
    }
  });
});


app.listen(process.env.PORT || 3000);
