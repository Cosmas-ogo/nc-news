const db = require("../db/connection");
const format = require("pg-format");
function fetchCommentsByArticleId(article_id) {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
    })
    .then(() => {
      return db.query(
        `SELECT comment_id, votes, created_at, author, body, article_id
           FROM comments
           WHERE article_id = $1
           ORDER BY created_at DESC;`,
        [article_id]
      );
    })
    .then(({ rows }) => rows);
}

function addComment(article_id, username, body) {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
    })
    .then(() => {
      return db.query("SELECT * FROM users WHERE username = $1", [username]);
    })
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 400, message: "Invalid username" });
      }
    })
    .then(() => {
      const sql = format(
        `INSERT INTO comments (article_id, author, body) VALUES (%L) 
           RETURNING *;`,
        [article_id, username, body]
      );

      return db.query(sql).then(({ rows }) => {
        return rows[0];
      });
    });
}

module.exports = { fetchCommentsByArticleId, addComment };
