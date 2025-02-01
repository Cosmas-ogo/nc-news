const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const { convertISOToTimestamp } = require("../db/seeds/utils");

const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(testData);
});
afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("should respond with an array of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((res) => {
        const topicsArray = res.body.topics;

        expect(topicsArray.length).toBe(3);
        topicsArray.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("404", () => {
  test('should respond with 404 and a message of "Endpoint not found"', () => {
    return request(app)
      .get("/api/invalidendpoint")
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe("Endpoint not found");
      });
  });
});

describe("GET/api/articles/:article_id", () => {
  test("GET 200: get articles by id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        const transformedArticle = convertISOToTimestamp(article);
        expect(transformedArticle).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: 1594325460000,
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("404 article not found", () => {
    return request(app)
      .get("/api/articles/200")
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe("Not found");
      });
  });
  test("400 id not a number", () => {
    return request(app)
      .get("/api/articles/climatechange")
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles", () => {
  test("should respond with an array of articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(typeof article.title).toBe("string");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.author).toBe("string");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.comment_count).toBe("string");
          expect(typeof article.created_at).toBe("string");
        });
      });
  });
  test("should be able to order by date in decending order", () => {
    return request(app)
      .get("/api/articles?&sort_by=created_at&order=desc")
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.articles.length).toBe(13);
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("should return an array of articles with correct properties", () => {
    return request(app)
      .get("/api/articles?&sort_by=created_at&order=desc")
      .expect(200)
      .then((response) => {
        const body = response.body;
        body.articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
          expect(article).not.toHaveProperty("body");
        });
      });
  });

  test("should return 400 for invalid sort_by value", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid_column")
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("invalid sort_by query");
      });
  });
  test("should return 400 for invalid order value", () => {
    return request(app)
      .get("/api/articles?order=invalid_order")
      .then((response) => {
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("invalid order query");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("should return an array of comments with correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(Array.isArray(body.comments)).toBe(true);

        body.comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("article_id");
        });
      });
  });
  test("should return comments sorted by most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const body = response.body;
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("should return 404 if article does not exist", () => {
    return request(app)
      .get("/api/articles/88888/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe("Article not found");
      });
  });
  test("should return 400 for invalid article_id", () => {
    return request(app)
      .get("/api/articles/invalid/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe("Invalid article_id");
      });
  });
  test("should return an empty array if article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toEqual([]);
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("should add a comment and return the created comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then((response) => {
        expect(response.body.comment).toHaveProperty("comment_id");
        expect(response.body.comment).toHaveProperty("votes");
        expect(response.body.comment).toHaveProperty("created_at");
        expect(response.body.comment).toHaveProperty("author", "butter_bridge");
        expect(response.body.comment).toHaveProperty(
          "body",
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
        );
        expect(response.body.comment).toHaveProperty("article_id", 1);
      });
  });
  test("should return 400 if username is missing", () => {
    const newComment = {
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe("Missing required fields");
      });
  });

  test("should return 400 if body is missing", () => {
    const newComment = { username: "butter_bridge" };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe("Missing required fields");
      });
  });

  test("should return 400 if article_id is invalid", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
    };

    return request(app)
      .post("/api/articles/invalid/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe("Invalid article_id");
      });
  });

  test("should return 404 if article does not exist", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
    };
    return request(app)
      .post("/api/articles/9999/comments")
      .send(newComment)
      .expect(404)
      .then((response) => {
        expect(response.body.error).toBe("Article not found");
      });
  });
  test("should return 400 if username does not exist", () => {
    const newComment = { username: "Mr No Name", body: "User does not exist" };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe("Invalid username");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("should update an article's votes and return the updated article", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 5 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toHaveProperty("article_id", 1);
        expect(body.article).toHaveProperty("votes", expect.any(Number));
        expect(body.article.votes).toBeGreaterThan(0);
      });
  });
  test("should return 400 when inc_votes is not a number", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "ten" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid vote value");
      });
  });
  test("should return 400 when inc_votes is missing", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid vote value");
      });
  });

  test("should return 404 when article_id does not exist", () => {
    return request(app)
      .patch("/api/articles/741943")
      .send({ inc_votes: 5 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
  test("should return 400 when article_id is invalid", () => {
    return request(app)
      .patch("/api/articles/not-an-id")
      .send({ inc_votes: 5 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid vote value");
      });
  });
});
describe("DELETE /api/comments/:comment_id", () => {
  test("204: should delete a comment and respond with no content", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });

  test("404: should return an error if comment_id does not exist", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.error).toBe("Not found");
      });
  });

  test("400: should return an error if comment_id is invalid", () => {
    return request(app)
      .delete("/api/comments/not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.error).toBe("Invalid comment ID");
      });
  });
});

describe("GET /api/users", () => {
  test("200: should return an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toBeInstanceOf(Array);
        expect(body.users.length).toBeGreaterThan(0);
        body.users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });

  test("404: should return error for an incorrect route", () => {
    return request(app)
      .get("/api/nonexistent")
      .expect(404)
      .then(({ body }) => {
        expect(body.error).toBe("Endpoint not found");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: returns an array of articles sorted by default (created_at, desc)", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBeGreaterThan(0);
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("200: sorts articles by a valid column when sort_by is specified", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("title", { descending: true });
      });
  });

  test("200: sorts articles in ascending order when order=asc is provided", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("article_id", { ascending: true });
      });
  });

  test("400: responds with an error when sort_by is invalid", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid_column")
      .expect(400)
      .then(({ body }) => {
        expect(body.error).toBe("invalid sort_by query");
      });
  });

  test("400: responds with an error when order is invalid", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=wrong")
      .expect(400)
      .then(({ body }) => {
        expect(body.error).toBe("invalid order query");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with all articles when no topic query is provided", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles.length).toBeGreaterThan(0);
      });
  });

  test("200: Responds with filtered articles when topic query is provided", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeInstanceOf(Array);
        expect(
          body.articles.every((article) => article.topic === "mitch")
        ).toBe(true);
      });
  });
  test("200: Responds with an empty array when a valid topic exists but has no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([]);
      });
  });

  test("404: Responds with error if topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=climate")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic not found");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: returns an article with comment_count", () => {
    return request(app)
      .get("/api/articles/1?comment_count=true")
      .expect(200)
      .then((response) => {
        const article = response.body.article;
        expect(article).toHaveProperty("article_id", 1);
        expect(article).toHaveProperty("comment_count");
        expect(typeof article.comment_count).toBe("string");
      });
  });

  test("404: responds with 'article not found' when given an invalid article_id", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.error).toBe("Not found");
      });
  });
});
