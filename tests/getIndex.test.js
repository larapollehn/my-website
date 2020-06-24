const app = require("../app");
const pool = require("../src/data/DataAccess");
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

    afterAll(done => {
        pool.end();
        done();
    })
});
