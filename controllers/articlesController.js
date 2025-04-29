const articles = require("../db/data/test-data/articles");
const {
  fetchArticleByArticleId,
  fetchArticles,
  updateArticleVotes,
  retrieveArticles,
} = require("../models/articlesModel");

function getArticleByArticleId(req, res, next) {
  const { article_id } = req.params;
  const comment_count = req.query.comment_count === "true";
  fetchArticleByArticleId(article_id, comment_count)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function getArticles(req, res, next) {
  const { sort_by, order, topic, limit, page } = req.query;

  const queries = {
    sort_by,
    order,
    topic,
    limit: limit ? Number(limit) : undefined,
    page: page ? Number(page) : undefined,
  };

  fetchArticles(queries)
    .then(({ articles, total_count }) => {
      res.status(200).send({ articles, total_count });
    })
    .catch((err) => {
      next(err);
    });
}
function patchArticleVotes(req, res, next) {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticleVotes(article_id, inc_votes)
    .then((updatedArticle) => {
      res.status(200).send({ article: updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
}

const collectAllArticles = (req, res, next) => {
  const { sort_by, order } = req.query;

  retrieveArticles(sort_by, order)
    .then((articles) => {
      res.status(200).json({ articles });
    })
    .catch(next);
};

module.exports = {
  getArticleByArticleId,
  getArticles,
  patchArticleVotes,
  collectAllArticles,
};
