const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
require('dotenv').config();

const app = express();

// GLOBALS
let port = 3000;

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

const postSchema = {
  title: String,
  content: String,
  author: String,
  time: {
    type: Date,
    default: Date.now, // Set the default value to the current time
    get: (val) => val.toLocaleString("en-US", { timeZoneName: "short" }) // Format the time
  }
};

const Post = mongoose.model("Post", postSchema);

// ============== SERVER REQUESTS ==============

app.route('/')

  .get(function (req, res) {
    Post.find(
      {},
      function (err, posts) {
        res.render("home", {
          posts: posts
        });
      }
    );
  })

  /* Within the Header.ejs file, the user requests a post by typing its title. 
  This title value is then sent here to check if it exists in the database. 
  If a match is found, we return a response with the value 'true' 
  allowing the user to select and view the post.*/
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
      // Handlling errors by sending them as a response
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
      if (!err)
        res.redirect("/");
    });
  });

// Allowing users to specify their desired post by adding /posts/postId to the URL
app.get("/posts/:postId", function (req, res) {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    if (!err) {
      res.render("post", {
        title: post.title,
        content: post.content,
        author: post.author
      });
    }
  });
});


app.listen(port, function () {
  console.log("Server started on port 3000");
});
