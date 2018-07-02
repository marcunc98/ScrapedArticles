var mongoose = require("mongoose");

//Save a reference to the Schema constructor
var Schema = mongoose.Schema;

//Using the Schema constructor, create a new NoteSchema object (which will be a collection in our db)
var NoteSchema = new Schema({
  title: String,

  body: String
});

var Note = mongoose.model("Note", NoteSchema)

module.exports = Note;