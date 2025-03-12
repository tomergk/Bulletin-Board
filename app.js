const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
require('dotenv').config();
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const path = require("path");

// === LiveReload Setup ===
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "public")); // watches public assets (css, js)
liveReloadServer.watch(path.join(__dirname, "views"));  // watches EJS templates

const app = express();

// GLOBALS
let port = 3000;
app.use(connectLivereload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// ============== UPDATED: Use a new Mongoose Schema ==============
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  time: {
    type: Date,
    default: Date.now,
    // This field becomes a TTL index, auto-removing docs after 14 days
    expires: '14d'
  }
});

const Post = mongoose.model("Post", postSchema);

// ============== SERVER REQUESTS ==============
app.route('/')
  .get(function (req, res) {
    Post.find({}, function (err, posts) {
      if (!err) {
        res.render("home", {
          posts: posts
        });
      }
    });
  })
  .post(async (req, res) => {
    try {
      let titleName = req.body.titleName;
      console.log(`(3) ${titleName}`);
      Post.find(
        { title: { $regex: `^${titleName}`, $options: "i" } },
        function (err, posts) {
          console.log('The posts before sending to the client side: ', posts);
          res.send({ posts: posts });
        }
      );
    }
    catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

// ============== COMPOSE REQUESTS ==============
app.route('/compose')
  .get(function (req, res) {
    res.render("compose");
  })
  .post(function (req, res) {
    let post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody,
      author: req.body.postAuthor
    });

    post.save(function (err) {
      if (!err) {
        res.redirect("/");
      }
    });
  });

// ============== POST PAGE ==============
app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    if (!err && post) {
      res.render("post", {
        title: post.title,
        content: post.content,
        author: post.author
      });
    } else {
      // handle if not found or error
      res.redirect("/");
    }
  });
});

// ============== START SERVER ==============
app.listen(port, function () {
  console.log("Server started on port " + port);
});

// ============== LIVE RELOAD ==============
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});
