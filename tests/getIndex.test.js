const app = require("../app");
const sqlAccess = require("../src/data/SQLAccess");
const redisAccess = require("../src/data/RedisAccess");
const request = require('supertest');

describe('Test GET Index', () => {
    beforeAll(done => {
        done();
    });

    test('Response is http code 200', done => {
        request(app)
            .get('/')
            .then(response => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });

    test('redis works', done => {
        redisAccess.setex('test', 1800, 'test case works');
        redisAccess.get('test', (err, data) => {
            expect(data).toBe("test case works");
            done();
        });
    })

    afterAll(done => {
        redisAccess.end();
        sqlAccess.end();
        done();
    })
});
