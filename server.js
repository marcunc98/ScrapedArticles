var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");
var exphbs = require("express-handlebars");

// Initialize Express
var app = express();

// Set Handlebars.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");



// Require all models
var db = require("./models");

// Define the port
var PORT = 7000;


// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Name and Connect to the Mongo DB, Guessing this is not needed due to below code
mongoose.connect("mongodb://localhost/articleScraper");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/articleScraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// db.Article.create({ headline: "Some made-up article about travel" })
//   .then(function(art) {
//     console.log(art);
//   })
//   .catch(function(err) {
//     console.log(err.message);
//     // console.log(headline);
//   });

// Routes....

app.get("/", function(req, res) {
  // db.Article.remove({});
  db.Article.find({}).then(function(results){
    // console.log("RESULTS!!!!!!!!!!!!!!!!!!!!!!!!!: ", results)
    // if button clicked = true?? or just clicked
    res.render("home", {articles: results});
  })
  
});


app.get("/saved", function(req, res) {
  res.render("saved");
});

// A GET route for scraping the travelmag website
app.get("/scrape", function(req, res) {
 
  request("http://www.thetravelmagazine.net/articles", function(
    error,
    response,
    html
  ) {
    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var results = [];

    // With cheerio, find each p-tag with the "title" class
    // (i: iterator. element: the current element)
    $(".item-details").each(function(i, element) {
      // Save the text of the element in a "title" variable
      results.headline = $(this).find("h3").children("a").text();

      // In the currently selected element, look at its child elements (i.e., its a-tags),
      // then save the values for any "href" attributes that the child elements may have
      results.link = $(this).find("h3").children("a").attr("href");

      // Save the summary data of the .td-excerpt element in a "summary" variable with regex
      // to remove white space and line indentation
      results.summary = $(this).find(".td-excerpt").text().replace(/\s\s+/g, "");

      // Save these results in an object that we'll push into the results array we defined earlier
      results.push({
        headline: results.headline,
        link: results.link,
        summary: results.summary
      });
    });

    // Create a new Article using the `result` object built from scraping
    // SAVES scraped articles to our Article collection in my articleScraper db
    db.Article.create(results)
      .then(function(dbArticle) {
        // View the added result in the console
       // console.log(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        return res.json(err);
      });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.redirect('/')
    //res.send("Scrape Complete");

    console.log(results);
  });
});

// GET Route for getting all vacation articles as JSON from our database
app.get("/articles", function(req, res) {
  //find({}) will gather all documents in our articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      //Is the request to the db is sucessful, article data will be sent back to the clien-side
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});



// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//Route for deleting an Article
app.delete("/articles/:id", function(req, res) {
  db.Article.destroy({
    where: {
      id: req.params.id
    }
  }).then(function(dbArticle) {
    res.json(dbArticle);
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
