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
