const express = require("express");
const cors = require("cors");

const app = express();
const { getTopics } = require("./controllers/topicsController");
const { getEndpoints } = require("./controllers/apiController");
const {
  getArticleByArticleId,
  getArticles,
  patchArticleVotes,
  collectAllArticles,
} = require("./controllers/articlesController");
const {
  getCommentsByArticleId,
  postComment,
  deleteComment,
} = require("./controllers/commentsController");
const { getUsers } = require("./controllers/usersController");

app.use(cors());

app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleByArticleId);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.patch("/api/articles/:article_id", patchArticleVotes);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("/api/users", getUsers);

app.get("/api/articles", collectAllArticles);

app.all("*", (req, res) => {
  res.status(404).send({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});
app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    if (req.method === "PATCH") {
      res.status(400).send({ msg: "Invalid vote value" });
    } else {
      res.status(400).send({ error: "Bad Request" });
    }
  } else if (err.code === "23502") {
    res.status(400).send({ error: "Bad Request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.message === "article not found") {
    res.status(404).send({ error: "Not found" });
  } else {
    next(err);
  }
});
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ error: err.message });
  } else {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = app;
