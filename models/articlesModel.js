const db = require("../db/connection");

function fetchArticleByArticleId(article_id) {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ message: "article not found" });
      } else {
        return rows[0];
      }
    });
}

function fetchArticles({ sort_by = "created_at", order = "desc" }) {
  const validSortBy = [
    "created_at",
    "title",
    "author",
    "votes",
    "article_id",
    "topics",
  ];
  const validOrder = ["asc", "desc"];

  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({ status: 400, message: "invalid sort_by query" });
  }
  if (!validOrder.includes(order)) {
    return Promise.reject({ status: 400, message: "invalid order query" });
  }

  const SQLString = `
    SELECT 
      articles.author, 
      articles.title, 
      articles.article_id, 
      articles.topic, 
      articles.created_at, 
      articles.votes, 
      articles.article_img_url, 
      COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order};`;

  return db.query(SQLString).then(({ rows }) => {
    return rows;
  });
}

module.exports = { fetchArticleByArticleId, fetchArticles };
