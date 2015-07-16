var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var lineSchema = new Schema({
  text: { type:String, required: true }
})

var Line = mongoose.model('Line', lineSchema)

module.exports = Line