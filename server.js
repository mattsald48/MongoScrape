var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

//axio allows promises to be used instead of wrapping functions
//cheerio is used for scrapping
var axios = require('axios');
var cheerio = require('cheerio');

//Require the models
var db = require('./models');

//Ports and Initializing express
var PORT =process.env.PORT || 3000;
var app = express();

//Morgan is a logging tool. Not necessary but useful.
//(from the morgan docs) Concise output colored by response status for development use. The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
//app.use(logger("dev"));

//bodyParser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: "application/vnd.api+json"}));

app.use(express.static('public'));

//setting up handlebars
var exphbs = require('express-handlebars');

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

// //Import routes and give the server access to them
// var routes = require("./controllers");
// app.use("/", routes);

//connect to Mongo db database
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mongoScrape",{useMongoClient: true});

//Routes
//app.get('/', (req, res) => res.render('home'));


app.get("/scrape", function(req, res) {

  axios.get("http://www.jeditemplearchives.com/").then(function(response) {

    var $ = cheerio.load(response.data);

    $("div .NewsTitleBar").each(function(i, element) {

      var result = {};


      result.title = $(this)
        .children("h2")
        .children("a")
        .text();
      result.link = $(this)
        .children("h2")
        .children("a")
        .attr("href");

      db.Article
        .create(result)
        .then(function(dbArticle) {
          // If we were able to successfully scrape and save an Article, send a message to the client
          res.send("Scrape Complete");
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          res.json(err);
        });
      });
   });
});

// Route for getting all Articles from the db
app.get("/", function(req, res) {
  db.Article
    .find({})
    .then(function(dbArticle) {

    // Test it
    //  console.log('The solution is: ', dbArticle);
    //  res.send(dbArticle);

    res.render('home', {dbArticle: dbArticle})
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {

  db.Article
    .findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//connecting
app.listen(PORT, function() {
	console.log(`App running on port ${PORT} !`)
});