const db = require("../db/connection");
const format = require("pg-format");
const topics = require("../db/data/test-data/topics");

function fetchArticleByArticleId(article_id, comment_count = false) {
  let SQLString;
  if (comment_count) {
    SQLString = `
      SELECT articles.*, 
             COUNT(comments.comment_id) AS comment_count
      FROM articles
      LEFT JOIN comments ON comments.article_id = articles.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id;
    `;
  } else {
    SQLString = `
      SELECT * FROM articles WHERE article_id = $1;
    `;
  }
  return db.query(SQLString, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ message: "Not found", status: 404 });
    } else {
      return rows[0];
    }
  });
  // return db
  //   .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
  //   .then(({ rows }) => {
  //     if (rows.length === 0) {
  //       return Promise.reject({ message: "article not found" });
  //     } else {
  //       return rows[0];
  //     }
  //   });
}

function fetchArticles({ sort_by = "created_at", order = "desc", topic }) {
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

  let SQLString = `
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
    LEFT JOIN comments ON articles.article_id = comments.article_id`;

  const args = [];

  if (topic) {
    SQLString += " WHERE topic = $1";
    args.push(topic);
  }

  SQLString += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order};`;

  return db.query(SQLString, args).then(({ rows }) => {
    return rows;
  });
}

function updateArticleVotes(article_id, inc_votes) {
  if (!inc_votes || typeof inc_votes !== "number") {
    return Promise.reject({ status: 400, msg: "Invalid vote value" });
  }

  const queryStr = format(
    `UPDATE articles SET votes = votes + %L WHERE article_id = %L RETURNING *;`,
    inc_votes,
    article_id
  );

  return db.query(queryStr).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return rows[0];
  });
}

function retrieveArticles(sort_by = "created_at", order = "desc") {
  const validColumns = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
  ];
  const validOrders = ["asc", "desc"];

  if (!validColumns.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "invalid sort_by column" });
  }

  if (!validOrders.includes(order.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "invalid order query" });
  }

  const queryStr = `
    SELECT * 
    FROM articles 
    ORDER BY ${sort_by} ${order.toUpperCase()};
  `;

  return db.query(queryStr).then((result) => result.rows);
}

module.exports = {
  fetchArticleByArticleId,
  fetchArticles,
  updateArticleVotes,
  retrieveArticles,
};
