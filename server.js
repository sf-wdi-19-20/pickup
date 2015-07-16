var express = require('express'),
    app = express(),
    _ = require('underscore'),
    cors = require('cors'),
    mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/pickup')
var Line = require('./line')

// OPEN THE API TO REQUESTS FROM ANY DOMAIN
app.use(cors())

app.use(express.static(__dirname))

app.get('/', function(req, res) {
  var index = __dirname + "/index.html"
  res.sendFile(index)
})

// LINES#QUERY
app.get('/api/lines', function(req, res) {
  console.log(Line)
  Line.find().exec(function(err, lines) {
    console.log(lines)
    res.json(lines)
  })
})

app.listen(3000)
