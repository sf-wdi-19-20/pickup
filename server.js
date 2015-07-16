var express = require('express'),
    app = express(),
    _ = require('underscore'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/pickup');
var Line = require('./line');

// OPEN THE API TO REQUESTS FROM ANY DOMAIN
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.get('/', function(req, res) {
  var index = __dirname + "/index.html";
  res.sendFile(index);
});

// LINES#QUERY
app.get('/api/lines', function(req, res) {
  console.log(Line);
  Line.find().sort('-_id').exec(function(err, lines) {
    console.log(lines);
    res.json(lines);
  });
});

// LINES#CREATE
app.post('/api/lines', function(req, res) {
  // SAVE LINE TO DB
  var line = new Line({
    text: req.body.text
  });

  line.save(function(err, line) {
    res.json(line);
  });
});


app.listen(process.env.PORT || 3000);
