const db = require("../db/connection");
const format = require("pg-format");

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
}

function fetchArticles({
  sort_by = "created_at",
  order = "desc",
  topic,
  limit = 10,
  page = 1,
}) {
  const validSortBy = [
    "created_at",
    "title",
    "author",
    "votes",
    "article_id",
    "topic",
    "comment_count",
  ];
  const validOrder = ["asc", "desc"];

  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({ status: 400, message: "invalid sort_by query" });
  }
  if (!validOrder.includes(order)) {
    return Promise.reject({ status: 400, message: "invalid order query" });
  }

  if (isNaN(limit) || limit <= 0) {
    return Promise.reject({ status: 400, message: "invalid limit query" });
  }

  if (isNaN(page) || page <= 0) {
    return Promise.reject({ status: 400, message: "invalid page query" });
  }

  const offset = (page - 1) * limit;

  let baseSQL = `
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

  let countSQL = `
    SELECT COUNT(*)::INT AS total_count
    FROM articles
  `;

  const args = [];

  if (topic) {
    return db
      .query(`SELECT * FROM topics WHERE slug = $1`, [topic])
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: "Topic not found" });
        }

        baseSQL += ` WHERE articles.topic = $1`;
        countSQL += ` WHERE articles.topic = $1`;
        args.push(topic);

        baseSQL += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order} LIMIT $2 OFFSET $3;`;

        const articleQuery = db.query(baseSQL, [topic, limit, offset]);
        const countQuery = db.query(countSQL, [topic]);

        return Promise.all([articleQuery, countQuery]).then(
          ([articleResult, countResult]) => {
            return {
              articles: articleResult.rows,
              total_count: countResult.rows[0].total_count,
            };
          }
        );
      });
  }

  baseSQL += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order} LIMIT $1 OFFSET $2;`;
  const articleQuery = db.query(baseSQL, [limit, offset]);
  const countQuery = db.query(countSQL, []);

  return Promise.all([articleQuery, countQuery]).then(
    ([articleResult, countResult]) => {
      return {
        articles: articleResult.rows,
        total_count: countResult.rows[0].total_count,
      };
    }
  );
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
