const request = require('supertest');
const app = require('../app');

module.exports = (path, body, status, done, expectResult) => {
    request(app)
        .post(path)
        .type('json')
        .set('Accept', 'application/json')
        .send(body)
        .expect('Content-Type', /json/)
        .expect(status)
        .expect(res => {
            expect(res.body.message).toEqual(expectResult);
        })
        .end((err, res) => {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
};
