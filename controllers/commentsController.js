const comments = require("../db/data/test-data/comments");
const {
  fetchCommentsByArticleId,
  addComment,
  removeCommentById,
} = require("../models/commentsModel");

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

function postComment(req, res, next) {
  const { article_id } = req.params;
  const { username, body } = req.body;

  if (!username || !body) {
    return next({ status: 400, message: "Missing required fields" });
  }

  if (isNaN(article_id)) {
    return next({ status: 400, message: "Invalid article_id" });
  }

  addComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
}

function deleteComment(req, res, next) {
  const { comment_id } = req.params;
  if (!/^\d+$/.test(comment_id)) {
    return res.status(400).send({ error: "Invalid comment ID" });
  }

  removeCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
}
module.exports = { getCommentsByArticleId, postComment, deleteComment };
