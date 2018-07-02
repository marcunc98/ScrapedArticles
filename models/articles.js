var mongoose = require("mongoose");

// Save a reference to the schema costructor
var Schema = mongoose.Schema;

//Creating a Schema constructor that will create a new UserSchema object

var ArticleSchema = new Schema ({
    
 //requiring our headline   
    headline: {
        type: String,
        // required: true
    },

// requiring an article link
    link: {
        type: String,
        // required: true
    },

    // requiring a summary data
    summary: {
        type: String,
        // required: true
    },
    
    //note is an object that stores a Note id
    // The ref property links the ObjectId to the Note model
    // This allows us to populate the Article with an associated Note
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model("Article", ArticleSchema);

//Export the Article model
module.exports = Article;
