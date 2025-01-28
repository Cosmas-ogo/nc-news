const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");

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
