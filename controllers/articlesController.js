const { fetchArticleByArticleId } = require("../models/articlesModel");

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

module.exports = { getArticleByArticleId };
