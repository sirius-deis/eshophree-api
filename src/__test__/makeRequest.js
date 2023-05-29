// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const app = require('../app');

module.exports = (
    method,
    path,
    body,
    status,
    done,
    expectResult,
    isTypePresent = true,
    getToken
) => {
    let partial = request(app)
        [method](path)
        .type('json')
        .set('Accept', 'application/json')
        .send(body);

    if (isTypePresent) {
        partial = partial.expect('Content-Type', /json/);
    }

    partial
        .expect(status)
        .expect(res => {
            // eslint-disable-next-line no-undef
            expect(res.body.message).toEqual(expectResult);
            getToken && getToken(res.body.token);
        })
        .end(done);
};
