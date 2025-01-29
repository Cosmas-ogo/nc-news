const comments = require("../db/data/test-data/comments");
const { fetchCommentsByArticleId } = require("../models/commentsModel");

function getCommentsByArticleId(req, res, next) {
  const { article_id } = req.params;

  if (isNaN(article_id)) {
    return next({ status: 400, message: "Invalid article_id" });
  }

  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
}

module.exports = { getCommentsByArticleId };
