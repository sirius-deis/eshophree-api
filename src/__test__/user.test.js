const { connect, clearDatabase, closeDatabase } = require('./db');
const { redisConnect, redisDisconnect } = require('../db/redis');
const User = require('../models/user.models');
const ActivateToken = require('../models/activateToken.models');
const ResetToken = require('../models/resetToken.models');
const makeRequest = require('./makeRequest');

describe('/users', () => {
  let token = '';
  let token2 = '';
  let token3 = '';
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
  });
  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
    await redisDisconnect();
  });

  describe('/signup route', () => {
    it('should return 400 as body is empty', (done) => {
      makeRequest({
        route: 'users/signup',
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
        ],
      });
    });

    it('should return 400 as body is empty', (done) => {
      makeRequest({
        route: 'users/signup',
        body: { name: 'test name' },
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
        ],
      });
    });

    it('should return 400 as body is empty', (done) => {
      makeRequest({
        route: 'users/signup',
        body: { name: 'test name', surname: 'test surname' },
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
        ],
      });
    });

    it('should return 400 as body is empty', (done) => {
      makeRequest({
        route: 'users/signup',
        body: {
          name: 'test name',
          surname: 'test surname',
          email: 'test@test.com',
        },

        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'passwordConfirm' with value '' doesn't pass validation. Please provide correct data",
        ],
      });
    });

    it('should return 400 as passwords are not the same', (done) => {
      makeRequest({
        route: 'users/signup',
        body: {
          name: 'test name',
          surname: 'test surname',
          email: 'test@test.com',
          password: 'password123',
          passwordConfirm: 'password',
        },
        statusCode: 400,
        done,
        expectedResult: 'Passwords are not the same. Please provide correct passwords',
      });
    });

    it('should successfully register a new account', (done) => {
      makeRequest({
        route: 'users/signup',
        body: {
          name: 'test name',
          surname: 'test surname',
          email: 'test@test.com',
          password: 'password123',
          passwordConfirm: 'password123',
        },
        statusCode: 201,
        done,
        expectedResult: 'Account was successfully created. Check your email to activate it.',
      });
    });

    it('should return an error as email is already in use', (done) => {
      makeRequest({
        route: 'users/signup',
        body: {
          name: 'test name',
          surname: 'test surname',
          email: 'test@test.com',
          password: 'password123',
          passwordConfirm: 'password123',
        },
        statusCode: 400,
        done,
        expectedResult: 'Email address is already in use',
      });
    });

    it('should successfully register second account for addition tests purpose', (done) => {
      makeRequest({
        route: 'users/signup',
        body: {
          name: 'test name',
          surname: 'test surname',
          email: 'test2@test.com',
          password: 'password123',
          passwordConfirm: 'password123',
        },
        statusCode: 201,
        done,
        expectedResult: 'Account was successfully created. Check your email to activate it.',
      });
    });
  });
  describe('/activate route', () => {
    it('should return 400 as activate token was incorrect', (done) => {
      makeRequest({
        method: 'get',
        route: 'users/activate/123',
        statusCode: 400,
        done,
        expectedResult: 'Token verification failed',
      });
    });

    it('should return 200', (done) => {
      User.findOne({ email: 'test@test.com' }).then((user) => {
        ActivateToken.findOne({
          userId: user._id,
        }).then((activateToken) => {
          makeRequest({
            method: 'get',
            route: `users/activate/${activateToken.token}`,
            statusCode: 200,
            done,
            expectedResult: 'Your account was activated successfully',
          });
        });
      });
    });

    it('should return 200 after activating', (done) => {
      User.findOne({ email: 'test2@test.com' }).then((user) => {
        ActivateToken.findOne({
          userId: user._id,
        }).then((activateToken) => {
          makeRequest({
            method: 'get',
            route: `users/activate/${activateToken.token}`,
            statusCode: 200,
            done,
            expectedResult: 'Your account was activated successfully',
          });
        });
      });
    });
  });
  describe('/login route', () => {
    it('should return 400 as there are not valid fields in body', (done) => {
      makeRequest({
        route: 'users/login',
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'email' with value 'undefined' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
        ],
      });
    });

    it('should return 401 as password was incorrect', (done) => {
      makeRequest({
        route: 'users/login',
        statusCode: 401,
        body: {
          email: 'test@test.com',
          password: 'password1',
        },
        done,
        expectedResult: 'Incorrect email or password',
      });
    });

    it('should return 200 after successful logging in', (done) => {
      makeRequest({
        route: 'users/login',
        statusCode: 200,
        body: {
          email: 'test@test.com',
          password: 'password123',
        },
        done,
        expectedResult: 'You was sign in successfully',
        saveToken: (value) => (token = value),
      });
    });

    it('should return 200 after successful logging in', (done) => {
      makeRequest({
        route: 'users/login',
        statusCode: 200,
        body: {
          email: 'test2@test.com',
          password: 'password123',
        },
        done,
        expectedResult: 'You was sign in successfully',
        saveToken: (value) => (token2 = value),
      });
    });
    it('should return 200 after successful logging in', (done) => {
      makeRequest({
        route: 'users/login',
        statusCode: 200,
        body: {
          email: 'user@test.com',
          password: 'password123',
        },
        done,
        expectedResult: 'You was sign in successfully',
        saveToken: (value) => (token3 = value),
      });
    });
  });
  describe('/deactivate route', () => {
    it('should return 401 code as there is no access to this route unless you are logged in', (done) => {
      makeRequest({
        route: 'users/deactivate',
        statusCode: 401,
        done,
        expectedResult: 'Sign in before trying to access this route',
      });
    });

    it('should return 400 code as password is empty', (done) => {
      makeRequest({
        route: 'users/deactivate',
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
        ],
        token,
      });
    });

    it('should return 401 code as password is incorrect', (done) => {
      makeRequest({
        route: 'users/deactivate',
        statusCode: 401,
        body: {
          password: 'password12',
        },
        done,
        expectedResult: 'Incorrect password',
        token,
      });
    });

    it('Should successfully deactivate account', (done) => {
      makeRequest({
        route: 'users/deactivate',
        statusCode: 200,
        body: {
          password: 'password123',
        },
        done,
        expectedResult: 'Your account was deactivated successfully',
        token: token2,
      });
    });
  });
  describe('/reactivate route', () => {
    it('should return 401 as email is empty', (done) => {
      makeRequest({
        route: 'users/reactivate',
        body: {
          email: '',
        },
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'email' with value '' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
        ],
      });
    });

    it('should return 401 as password is empty', (done) => {
      makeRequest({
        route: 'users/reactivate',
        body: {
          email: 'test@test.com',
          password: '',
        },
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
        ],
      });
    });

    it("should return 401 as passwords don't match", (done) => {
      makeRequest({
        route: 'users/reactivate',
        body: {
          email: 'test@test.com',
          password: 'password',
        },
        statusCode: 401,
        done,
        expectedResult: 'Incorrect email or password',
      });
    });

    it('should return 400 as account is activated already', (done) => {
      makeRequest({
        route: 'users/reactivate',
        body: {
          email: 'test@test.com',
          password: 'password123',
        },
        statusCode: 400,
        done,
        expectedResult: 'Your account is already active.',
      });
    });

    it('should return 200  ', (done) => {
      makeRequest({
        route: 'users/reactivate',
        body: {
          email: 'test2@test.com',
          password: 'password123',
        },
        statusCode: 200,
        done,
        expectedResult: 'We sent token to your email.',
      });
    });
  });
  describe('/update-password route', () => {
    it('should return 400 as there are incorrect fields', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/update-password',
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'newPassword' with value '' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'newPasswordConfirm' with value '' doesn't pass validation. Please provide correct data",
        ],
        token: token,
      });
    });

    it('should return 401 as password is wrong', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/update-password',
        body: {
          password: 'password',
          newPassword: 'password1',
          newPasswordConfirm: 'password1',
        },
        statusCode: 401,
        done,
        expectedResult: 'Incorrect password',
        token: token,
      });
    });

    it('should return 400 as new password and confirm password are not the same', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/update-password',
        body: {
          password: 'password123',
          newPassword: 'password12',
          newPasswordConfirm: 'password1',
        },
        statusCode: 400,
        done,
        expectedResult: 'Passwords are not the same. Please provide correct passwords',
        token: token,
      });
    });

    it('should return 200', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/update-password',
        body: {
          password: 'password123',
          newPassword: 'password',
          newPasswordConfirm: 'password',
        },
        statusCode: 200,
        done,
        expectedResult: 'Password was updated successfully',
        saveToken: (value) => (token = value),
        token: token,
      });
    });
  });
  describe('/forget-password route', () => {
    it('should return 400 with invalid data', (done) => {
      makeRequest({
        route: 'users/forget-password',
        body: {
          email: 'email123',
        },
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'email' with value 'email123' doesn't pass validation. Please provide correct data",
        ],
      });
    });

    it('should return 404 as there is no such email', (done) => {
      makeRequest({
        route: 'users/forget-password',
        body: {
          email: 'test123@test.com',
        },
        statusCode: 404,
        done,
        expectedResult: 'There is no user with such email',
      });
    });

    it('should return 200 as there is such email', (done) => {
      makeRequest({
        route: 'users/forget-password',
        body: {
          email: 'test@test.com',
        },
        statusCode: 200,
        done,
        expectedResult: 'Your reset token was sent on your email',
      });
    });
  });
  describe('/reset-password route', () => {
    it('should return 400 with invalid data', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/reset-password/123',
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'newPassword' with value '' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'newPasswordConfirm' with value '' doesn't pass validation. Please provide correct data",
        ],
      });
    });
    it('should return 400 as token is invalid', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/reset-password/123',
        statusCode: 400,
        body: {
          newPassword: 'password',
          newPasswordConfirm: 'password',
        },
        done,
        expectedResult: 'Token is invalid or has expired',
      });
    });

    it('Should return 400 as password is the same as previous one', (done) => {
      User.findOne({ email: 'test@test.com' }).then((user) => {
        ResetToken.findOne({ userId: user._id }).then((resetToken) => {
          makeRequest({
            method: 'patch',
            route: `users/reset-password/${resetToken.token}`,
            body: {
              newPassword: 'password',
              newPasswordConfirm: 'password',
            },
            statusCode: 400,
            done,
            expectedResult: "New password can't be the same as the previous one",
          });
        });
      });
    });

    it('Should return 400 as passwords are not the same', (done) => {
      User.findOne({ email: 'test@test.com' }).then((user) => {
        ResetToken.findOne({ userId: user._id }).then((resetToken) => {
          makeRequest({
            method: 'patch',
            route: `users/reset-password/${resetToken.token}`,
            body: {
              newPassword: 'password',
              newPasswordConfirm: 'password1',
            },
            statusCode: 400,
            done,
            expectedResult: 'Passwords are not the same. Please provide correct passwords',
          });
        });
      });
    });

    it('Should return 200', (done) => {
      User.findOne({ email: 'test@test.com' }).then((user) => {
        ResetToken.findOne({ userId: user._id }).then((resetToken) => {
          makeRequest({
            method: 'patch',
            route: `users/reset-password/${resetToken.token}`,
            body: {
              newPassword: 'password123',
              newPasswordConfirm: 'password123',
            },
            statusCode: 200,
            done,
            expectedResult: 'Password was changed successfully',
          });
        });
      });
    });
  });
  describe('/me route', () => {
    it('should return 200', (done) => {
      makeRequest({
        method: 'get',
        route: 'users/me',
        statusCode: 200,
        done,
        expectedResult: 'You were sign in successfully',
        token: token3,
      });
    });
  });
  describe('/update-me route', () => {
    it('should return 400 as fields are incorrect', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/update-me',
        body: {
          name: '',
          surname: '',
        },
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'name' with value '' doesn't pass validation. Please provide correct data",
          "Invalid value. Field 'surname' with value '' doesn't pass validation. Please provide correct data",
        ],
        token: token3,
      });
    });

    it("should return 400 as fields haven't changed", (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/update-me',
        body: {
          name: 'test name',
          surname: 'test surname',
        },
        statusCode: 400,
        done,
        expectedResult: 'Please change at least one field to access this route',
        token: token3,
      });
    });

    it('should return 200', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/update-me',
        body: {
          name: 'new test name',
          surname: 'new test surname',
        },
        statusCode: 200,
        done,
        expectedResult: 'Your data was updated successfully',
        token: token3,
      });
    });
  });
  describe('/update-info', () => {
    it('should return 400', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/update-info',
        statusCode: 400,
        body: {},
        token: token3,
        expectedResult: 'Please provide information',
        done,
      });
    });
    it('should return 200', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/update-info',
        statusCode: 200,
        body: {
          addressStreet: 'Some address in London',
          city: 'London',
        },
        token: token3,
        expectedResult: 'You information was successfully updated',
        done,
      });
    });
  });
  describe('/update-payment', () => {
    it('should return 400', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/update-payment',
        statusCode: 400,
        body: {},
        token: token3,
        expectedResult: 'Please provide information',
        done,
      });
    });
    it('should return 200', (done) => {
      makeRequest({
        method: 'patch',
        route: 'users/update-payment',
        statusCode: 200,
        body: {
          paymentType: 'check',
          provider: 'Some provider',
        },
        token: token3,
        expectedResult: 'You information was successfully updated',
        done,
      });
    });
  });
  describe('/delete route', () => {
    it('should return 400 as field is incorrect', (done) => {
      makeRequest({
        method: 'delete',
        route: 'users/delete',
        body: {
          password: '',
        },
        statusCode: 400,
        done,
        expectedResult: [
          "Invalid value. Field 'password' with value '' doesn't pass validation. Please provide correct data",
        ],
        token: token3,
      });
    });

    it('should return 401 as password is incorrect', (done) => {
      makeRequest({
        method: 'delete',
        route: 'users/delete',
        body: {
          password: 'password3',
        },
        statusCode: 401,
        done,
        expectedResult: 'Incorrect password',
        token: token3,
      });
    });

    it('should return 204', (done) => {
      makeRequest({
        method: 'delete',
        route: 'users/delete',
        body: {
          password: 'password123',
        },
        isContentTypePresent: false,
        statusCode: 204,
        done,
        expectedResult: undefined,
        token: token3,
      });
    });
  });
});

describe('/all routes', () => {
  it('should return 404 error as there is no route with such path', (done) => {
    makeRequest({
      done,
      isContentTypePresent: false,
      expectedResult: "Can't find /api/v1/wrong-route on this server",
    });
  });
});
