const request = require('supertest');
const { connect, clearDatabase, closeDatabase } = require('./db');
const { redisConnect, redisDisconnect } = require('../db/redis.js');
const User = require('../models/user.models');
const ActivateToken = require('../models/activateToken.models');
const app = require('../app');
const makeRequest = require('./makeRequest');

describe('/users', () => {
    let token = '';
    let token2 = '';
    beforeAll(async () => {
        await connect();
        await redisConnect();
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
    afterAll(async () => {
        await clearDatabase();
        await closeDatabase();
        await redisDisconnect();
    });

    describe('/signup route', () => {
        it('should return 400 as body is empty', done => {
            makeRequest('post', '/api/v1/users/signup', {}, 400, done, [
                "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
                "Invalid value. Field 'name' with value '' doesn't pass validation. Please provide correct data",
                "Invalid value. Field 'surname' with value '' doesn't pass validation. Please provide correct data",
                "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
                "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
            ]);
        });
        it('should return 400 as body is empty', done => {
            makeRequest(
                'post',
                '/api/v1/users/signup',
                { name: 'test name' },
                400,
                done,
                [
                    "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
                    "Invalid value. Field 'surname' with value '' doesn't pass validation. Please provide correct data",
                    "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
                    "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
                ]
            );
        });
        it('should return 400 as body is empty', done => {
            makeRequest(
                'post',
                '/api/v1/users/signup',
                {
                    name: 'test name',
                    surname: 'test surname',
                },
                400,
                done,
                [
                    "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
                    "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
                    "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
                ]
            );
        });
        it('should return 400 as body is empty', done => {
            makeRequest(
                'post',
                '/api/v1/users/signup',
                {
                    name: 'test name',
                    surname: 'test surname',
                    email: 'test@test.com',
                },
                400,
                done,
                [
                    "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
                    "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
                ]
            );
        });
        it('should return 400 as body is empty', done => {
            makeRequest(
                'post',
                '/api/v1/users/signup',
                {
                    name: 'test name',
                    surname: 'test surname',
                    email: 'test@test.com',
                    password: 'password123',
                },
                400,
                done,
                [
                    "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
                ]
            );
        });
        it('should return 400 as passwords are not the same', done => {
            makeRequest(
                'post',
                '/api/v1/users/signup',
                {
                    name: 'test name',
                    surname: 'test surname',
                    email: 'test@test.com',
                    password: 'password123',
                    passwordConfirm: 'password',
                },
                400,
                done,
                'Passwords are not the same. Please provide correct passwords'
            );
        });
        it('should successfully register a new account', done => {
            makeRequest(
                'post',
                '/api/v1/users/signup',
                {
                    name: 'test name',
                    surname: 'test surname',
                    email: 'test@test.com',
                    password: 'password123',
                    passwordConfirm: 'password123',
                },
                201,
                done,
                'Account was successfully created. Check your email to activate it.'
            );
        });
        it('should return an error as email is already in use', done => {
            makeRequest(
                'post',
                '/api/v1/users/signup',
                {
                    name: 'test name',
                    surname: 'test surname',
                    email: 'test@test.com',
                    password: 'password123',
                    passwordConfirm: 'password123',
                },
                400,
                done,
                'Email address is already in use'
            );
        });
    });
    describe.skip('/login route', () => {
        it('should return 400 as there are not valid fields in body', done => {
            makeRequest('post', '/api/v1/users/login', {}, 400, done, [
                "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
                "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
            ]);
        });
        it('should return 401 as password was incorrect', done => {
            makeRequest(
                'post',
                '/api/v1/users/login',
                {
                    email: 'test@test.com',
                    password: 'password1',
                },
                401,
                done,
                'Incorrect email or password'
            );
        });

        it('should return 200 after successful logging in', done => {
            makeRequest(
                'post',
                '/api/v1/users/login',
                {
                    email: 'user@test.com',
                    password: 'password123',
                },
                200,
                done,
                'You was sign in successfully',
                value => (token = value)
            );
            makeRequest(
                'post',
                '/api/v1/users/login',
                {
                    email: 'user2@test.com',
                    password: 'password123',
                },
                200,
                done,
                'You was sign in successfully',
                value => (token = value)
            );
        });
    });
    describe('/activate route', () => {
        it('should return 400 as activate token was incorrect', done => {
            makeRequest(
                'get',
                '/api/v1/users/activate/123',
                {},
                400,
                done,
                'Token verification failed'
            );
        });
        it('should return 200 as activate token was incorrect', done => {
            User.findOne({ email: 'test@test.com' }).then(user => {
                ActivateToken.findOne({
                    userId: user._id,
                }).then(activateToken => {
                    makeRequest(
                        'get',
                        `/api/v1/users/activate/${activateToken.token}`,
                        {},
                        200,
                        done,
                        'Your account was activated successfully'
                    );
                });
            });
        });
    });
    describe.skip('/deactivate route', () => {
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
    describe.skip('/reactivate route', () => {
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
                .set('Authorization', `Bearer ${token2}`)
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
    describe.skip('/update-password route', () => {
        it('should return 400 as there are incorrect fields', done => {
            request(app)
                .patch('/api/v1/users/update-password')
                .type('json')
                .set('Authorization', `Bearer ${token2}`)
                .set('Content-Type', 'application/json')
                .send({})
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'newPassword' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'newPasswordConfirm' with value '' doesn't pass validation. Please provide correct data",
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
        it('should return 401 as password is wrong', done => {
            request(app)
                .patch('/api/v1/users/update-password')
                .type('json')
                .set('Authorization', `Bearer ${token2}`)
                .set('Content-Type', 'application/json')
                .send({
                    password: 'password',
                    newPassword: 'password1',
                    newPasswordConfirm: 'password1',
                })
                .expect('Content-Type', /json/)
                .expect(401)
                .expect(res => {
                    expect(res.body.message).toEqual('Incorrect password');
                })
                .end((err, res) => {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
                });
        });
        it('should return 400 as new password and confirm are not the same', done => {
            request(app)
                .patch('/api/v1/users/update-password')
                .type('json')
                .set('Authorization', `Bearer ${token2}`)
                .set('Content-Type', 'application/json')
                .send({
                    password: 'password123',
                    newPassword: 'password1',
                    newPasswordConfirm: 'password12',
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
        it('should return 200 as new password and confirm are not the same', done => {
            request(app)
                .patch('/api/v1/users/update-password')
                .type('json')
                .set('Authorization', `Bearer ${token2}`)
                .set('Content-Type', 'application/json')
                .send({
                    password: 'password123',
                    newPassword: 'password1',
                    newPasswordConfirm: 'password1',
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body.message).toEqual(
                        'Password was updated successfully'
                    );
                    expect(res.body.token).toBeTruthy();
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
    describe.skip('/forget-password route', () => {
        it('should return 400 with invalid data', done => {
            request(app)
                .post('/api/v1/users/forget-password')
                .type('json')
                .set('Content-Type', 'application/json')
                .send({
                    email: 'email123',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'email' with value 'email123' doesn't pass validation. Please provide correct data",
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
        it('should return 404 as there are no such email', done => {
            request(app)
                .post('/api/v1/users/forget-password')
                .type('json')
                .set('Content-Type', 'application/json')
                .send({
                    email: 'test123@test.com',
                })
                .expect('Content-Type', /json/)
                .expect(404)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'There is no user with such email'
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
        it('should return 200 as there is such email', done => {
            request(app)
                .post('/api/v1/users/forget-password')
                .type('json')
                .set('Content-Type', 'application/json')
                .send({
                    email: 'test1@test.com',
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'Your reset token was sent on your email'
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
    describe.skip('/reset-password route', () => {
        it('should return 400 with invalid data', done => {
            request(app)
                .patch('/api/v1/users/reset-password/123')
                .type('json')
                .set('Content-Type', 'application/json')
                .send()
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message.length).toBe(2);
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'newPassword' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'newPasswordConfirm' with value '' doesn't pass validation. Please provide correct data",
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
        it('should return 400 as token is invalid', done => {
            request(app)
                .patch('/api/v1/users/reset-password/123')
                .type('json')
                .set('Content-Type', 'application/json')
                .send({
                    newPassword: 'password',
                    newPasswordConfirm: 'password',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'Token is invalid or has expired'
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
    describe.skip('/me route', () => {
        it('should return 200', done => {
            request(app)
                .get('/api/v1/users/me')
                .type('json')
                .set('Authorization', `Bearer ${token2}`)
                .set('Content-Type', 'application/json')
                .send()
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'You was sign in successfully'
                    );
                    const user = res.body.data.user;
                    expect(user.name).toBe('test name');
                    expect(user.surname).toBe('test surname');
                    expect(user.email).toBe('user2@test.com');
                    expect(user.role).toBe('user');
                    expect(user.active).toBe(true);
                    expect(user.isBlocked).toBe(false);
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
    describe.skip('/update-me route', () => {
        it('should return 400 as fields are incorrect', done => {
            request(app)
                .patch('/api/v1/users/update-me')
                .type('json')
                .set('Authorization', `Bearer ${token2}`)
                .set('Content-Type', 'application/json')
                .send({
                    name: '',
                    surname: '',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toEqual([
                        "Invalid value. Field 'name' with value '' doesn't pass validation. Please provide correct data",
                        "Invalid value. Field 'surname' with value '' doesn't pass validation. Please provide correct data",
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
        it("should return 400 as fields haven't changed", done => {
            request(app)
                .patch('/api/v1/users/update-me')
                .type('json')
                .set('Authorization', `Bearer ${token2}`)
                .set('Content-Type', 'application/json')
                .send({
                    name: 'test name',
                    surname: 'test surname',
                })
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'Please change at least one field to access this route'
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
        it('should return 200', done => {
            request(app)
                .patch('/api/v1/users/update-me')
                .type('json')
                .set('Authorization', `Bearer ${token2}`)
                .set('Content-Type', 'application/json')
                .send({
                    name: 'new test name',
                    surname: 'new test surname',
                })
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(res => {
                    expect(res.body.message).toBe(
                        'Your data was updated successfully'
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
    describe.skip('/delete route', () => {
        it('should return 400 as field is incorrect', done => {
            request(app)
                .delete('/api/v1/users/delete')
                .type('json')
                .set('Authorization', `Bearer ${token2}`)
                .set('Content-Type', 'application/json')
                .send({
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

        it('should return 401 as password is incorrect', done => {
            request(app)
                .delete('/api/v1/users/delete')
                .type('json')
                .set('Authorization', `Bearer ${token2}`)
                .set('Content-Type', 'application/json')
                .send({
                    password: 'password3',
                })
                .expect('Content-Type', /json/)
                .expect(401)
                .expect(res => {
                    expect(res.body.message).toBe('Incorrect password');
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
                .delete('/api/v1/users/delete')
                .type('json')
                .set('Authorization', `Bearer ${token2}`)
                .set('Content-Type', 'application/json')
                .send({
                    password: 'password1',
                })
                .expect(204)
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
