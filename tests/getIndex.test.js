const {describe, expect} = require("@jest/globals");

const app = require("../app");
const sqlAccess = require("../src/data/SQLAccess");
const redisAccess = require("../src/data/RedisAccess");
const request = require('supertest');

describe('Test GET Index', () => {
    test('Postgres db works', done => {
        request(app)
            .get('/')
            .then(response => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });

    test('redis works', async done => {
        await redisAccess.setex('test', 1800, 'test case works');
        const data = await redisAccess.get('test');
        expect(data).toBe("test case works");
        done();
    })

    afterAll(done => {
        redisAccess.end();
        sqlAccess.end();
        done();
    })
});
