const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const app = require('../app');

describe('/users', () => {
    beforeAll(async () => {
        await connect();
    });
    afterEach(async () => {
        await clearDatabase();
    });
    afterAll(async () => {
        await closeDatabase();
    });

    "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
        "Invalid value. Field 'name' with value '' doesn't pass validation. Please provide correct data",
        "Invalid value. Field 'surname' with value '' doesn't pass validation. Please provide correct data",
        "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
        "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data";
    describe('/signup route', () => {
        it('should return 400 error as body is empty', done => {
            request(app)
                .post('/api/v1/users/signup')
                .type('json')
                .set('Accept', 'application/json')
                .send()
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'name' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'surname' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
                    ]);
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });

        it('should return 400 error as body is empty', done => {
            request(app)
                .post('/api/v1/users/signup')
                .type('json')
                .set('Accept', 'application/json')
                .send({
                    name: 'test name',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'surname' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
                    ]);
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });

        it('should return 400 error as body is empty', done => {
            request(app)
                .post('/api/v1/users/signup')
                .type('json')
                .set('Accept', 'application/json')
                .send({
                    name: 'test name',
                    surname: 'test surname',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
                    ]);
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });

        it('should return 400 error as body is empty', done => {
            request(app)
                .post('/api/v1/users/signup')
                .type('json')
                .set('Accept', 'application/json')
                .send({
                    name: 'test name',
                    surname: 'test surname',
                    email: 'test@test.com',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
                    ]);
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });

        it('should successfully register a new account', done => {
            request(app)
                .post('/api/v1/users/signup')
                .type('json')
                .set('Accept', 'application/json')
                .send({
                    name: 'test name',
                    surname: 'test surname',
                    email: 'test@test.com',
                    password: 'password123',
                    passwordConfirm: 'password123',
                })
                .expect('Content-Type', /json/)
                .expect(201)
                .expect(res => {})
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });
    });
});

describe('/all routes', () => {
    it('should return 404 error as there is no route with such path', done => {
        request(app)
            .post('/api/v1/wrong-route')
            .send()
            .expect(404)
            .end((err, res) => {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });
});
