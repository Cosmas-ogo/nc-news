const express = require("express");

const app = express();
const { getTopics } = require("./controllers/topicsController");
const { getEndpoints } = require("./controllers/apiController");
const {
  getArticleByArticleId,
  getArticles,
} = require("./controllers/articlesController");
const {
  getCommentsByArticleId,
  postComment,
} = require("./controllers/commentsController");

app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleByArticleId);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.all("*", (req, res) => {
  res.status(404).send({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502") {
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
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = app;
