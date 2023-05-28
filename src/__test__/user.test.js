const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const User = require('../models/user.models');
const app = require('../app');

describe('/users', () => {
    let token = '';
    let token2 = '';
    beforeAll(async () => {
        await connect();
        await User.create({
            email: 'user@test.com',
            password: 'password123',
            name: 'test name',
            surname: 'test surname',
            role: 'user',
            active: true,
        });
        await User.create({
            email: 'user2@test.com',
            password: 'password123',
            name: 'test name',
            surname: 'test surname',
            role: 'user',
            active: true,
        });
    });
    afterEach(async () => {
        // await clearDatabase();
    });
    afterAll(async () => {
        await clearDatabase();
        await closeDatabase();
    });

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

        it('should return 400 error as body is empty', done => {
            request(app)
                .post('/api/v1/users/signup')
                .type('json')
                .set('Accept', 'application/json')
                .send({
                    name: 'test name',
                    surname: 'test surname',
                    email: 'test@test.com',
                    password: 'password123',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
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

        it('should return 400 error as passwords are not the same', done => {
            request(app)
                .post('/api/v1/users/signup')
                .type('json')
                .set('Accept', 'application/json')
                .send({
                    name: 'test name',
                    surname: 'test surname',
                    email: 'test@test.com',
                    password: 'password123',
                    passwordConfirm: 'password',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual(
                        'Passwords are not the same. Please provide correct passwords'
                    );
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
                    email: 'test1@test.com',
                    password: 'password123',
                    passwordConfirm: 'password123',
                })
                .expect('Content-Type', /json/)
                .expect(201)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'Account was successfully created. Check your email to activate it.'
                    );
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });
    });
    describe('/login route', () => {
        it('should return 400 error as there are not valid fields in body', done => {
            request(app)
                .post('/api/v1/users/login')
                .type('json')
                .set('Accept', 'application/json')
                .send({})
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
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
        it('should return 401 error as password was incorrect', done => {
            request(app)
                .post('/api/v1/users/login')
                .type('json')
                .set('Accept', 'application.json')
                .send({
                    email: 'test@test.com',
                    password: 'password1',
                })
                .expect('Content-Type', /json/)
                .expect(401)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'Incorrect email or password'
                    );
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });

        it('should return 200 status after successful logging in', done => {
            request
                .agent(app)
                .post('/api/v1/users/login')
                .type('json')
                .set('Accept', 'application.json')
                .send({
                    email: 'user@test.com',
                    password: 'password123',
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'You was sign in successfully'
                    );
                    token = res.body.token;
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });

            request
                .agent(app)
                .post('/api/v1/users/login')
                .type('json')
                .set('Accept', 'application.json')
                .send({
                    email: 'user2@test.com',
                    password: 'password123',
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'You was sign in successfully'
                    );
                    token2 = res.body.token;
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });
    });
    describe('/activate route', () => {
        it('should return 400 code as activate token was incorrect', done => {
            request(app)
                .get(`/api/v1/users/activate/123`)
                .type('json')
                .set('Content-Type', 'application/json')
                .send()
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toBe('Token verification failed');
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });
    });
    describe('/deactivate route', () => {
        it('should return 400 code as there is no access to this route unless you are logged in', done => {
            request(app)
                .get(`/api/v1/users/deactivate`)
                .type('json')
                .set('Content-Type', 'application/json')
                .send()
                .expect('Content-Type', /json/)
                .expect(401)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'Sign in before trying to access this route'
                    );
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });
        it('should return 400 code as password is empty', done => {
            request(app)
                .post(`/api/v1/users/deactivate`)
                .type('json')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .send({})
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
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
        it('should return 401 code as password is incorrect', done => {
            request(app)
                .post(`/api/v1/users/deactivate`)
                .type('json')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .send({
                    email: 'user@test.com',
                    password: 'password12',
                })
                .expect('Content-Type', /json/)
                .expect(401)
                .expect(res => {
                    expect(res.body.message).toBe('Wrong password');
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });
        it('should successfully deactivate account', done => {
            request(app)
                .post('/api/v1/users/deactivate')
                .type('json')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .send({
                    email: 'user@test.com',
                    password: 'password123',
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'Your account was deactivated successfully'
                    );
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });
    });
    describe('/reactivate route', () => {
        it('should return 401 as email is empty', done => {
            request(app)
                .post('/api/v1/users/reactivate')
                .type('json')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .send({
                    email: '',
                    password: '',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'email' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
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

        it('should return 401 as password is empty', done => {
            request(app)
                .post('/api/v1/users/reactivate')
                .type('json')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .send({
                    email: 'user@test.com',
                    password: '',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
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

        it("should return 401 as passwords don't match", done => {
            request(app)
                .post('/api/v1/users/reactivate')
                .type('json')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .send({
                    email: 'user@test.com',
                    password: 'password',
                })
                .expect('Content-Type', /json/)
                .expect(401)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'Incorrect email or password'
                    );
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });

        it('should return 400 as account is activated already', done => {
            request(app)
                .post('/api/v1/users/reactivate')
                .type('json')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .send({
                    email: 'user2@test.com',
                    password: 'password123',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toBe('Your account is active');
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });

        it('should return 200', done => {
            request(app)
                .post('/api/v1/users/reactivate')
                .type('json')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .send({
                    email: 'user@test.com',
                    password: 'password123',
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'We sent token to your email.'
                    );
                })
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
