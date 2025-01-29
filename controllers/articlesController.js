const articles = require("../db/data/test-data/articles");
const {
  fetchArticleByArticleId,
  fetchArticles,
} = require("../models/articlesModel");

function getArticleByArticleId(req, res, next) {
  const { article_id } = req.params;
  fetchArticleByArticleId(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function getArticles(req, res, next) {
  const queries = req.query;
  fetchArticles(queries)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = { getArticleByArticleId, getArticles };
