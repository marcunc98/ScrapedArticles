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

var PORT = 7000;

// Initialize Express
var app = express();

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
  res.render("home");
});


app.get("/saved", function(req, res) {
  res.render("saved");
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
        console.log(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        return res.json(err);
      });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");

    console.log(results);
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
