// eslint-disable-next-line node/no-unpublished-require
const request = require('supertest');
const app = require('../app');

module.exports = ({
    method = 'post',
    route = '/api/v1/wrong-route',
    body = {},
    statusCode = 404,
    done,
    expectedResult,
    isContentTypePresent = true,
    saveToken,
    token,
}) => {
    let partial = request(app)[method](route).type('json');

    if (token) {
        partial = partial.set('Authorization', `Bearer ${token}`);
    }

    partial.set('Accept', 'application/json').send(body);

    if (isContentTypePresent) {
        partial = partial.expect('Content-Type', /json/);
    }

    partial
        .expect(statusCode)
        .expect(res => {
            // eslint-disable-next-line no-undef
            expect(res.body.message).toEqual(expectedResult);
            // eslint-disable-next-line no-undef
            saveToken && expect(res.body.token).toBeTruthy();
            saveToken && saveToken(res.body.token);
        })
        .end(done);
};
