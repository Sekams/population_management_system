'use strict'

const request = require('supertest');
const chai = require('chai');
const User = require('../models/user');
const app = require('../app');
const expect = chai.expect;
const { generateToken } = require('../utilities/authentication_helper');
const { USER_BASE_URL } = require('../utilities/constants');

let token, user, newUser;

describe('Tests for the Place Management User Routes', () => {
  beforeEach(done => {
    user = {
      firstName: 'some-first-name',
      lastName: 'some-last-name',
      username: 'some-username',
      password: '1234'
    };

    newUser = {
      firstName: 'new-first-name',
      lastName: 'new-last-name',
      username: 'new-username',
      password: '1234'
    };

    done();
  });

  afterEach(done => {
    User.deleteMany({}, () => { });
    done();
  });

  describe(`MODELS /user`, () => {
    it('should update user', () => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        userSaved.update({ '_id': userSaved._id }, { firstName: 'another-first-name' }, (error, updatedMeta) => {
          expect(updatedMeta.nModified).to.equal(1);
        });
      });
    });
  });

  describe(`POST ${USER_BASE_URL}/signup`, () => {
    it('should create a new user', done => {
      request(app)
        .post(`${USER_BASE_URL}/signup`)
        .send(newUser)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(201)
          expect(response.body.token.length).to.be.greaterThan(100);
          done()
        });
    });

    it('should not create a duplicate user', done => {
      const userToSave = new User(newUser);
      userToSave.save((error, userSaved) => {
        request(app)
          .post(`${USER_BASE_URL}/signup`)
          .send(newUser)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(409)
            expect(response.body.error.message).to.equal('User already exists');
            done()
          });
      });
    });

    it('should not create a user with missing parameters', done => {
      delete newUser.firstName;
      request(app)
        .post(`${USER_BASE_URL}/signup`)
        .send(newUser)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(422)
          expect(response.body.error.message).to.equal('Parameter(s) missing');
          done()
        });
    });

    it('should not create a user with empty parameters', done => {
      newUser.username = '';
      request(app)
        .post(`${USER_BASE_URL}/signup`)
        .send(newUser)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(500)
          expect(response.body.error.message).to.equal('user validation failed: username: Path `username` is required.');
          done()
        });
    });

    it('should not create a user with invalid parameters', done => {
      newUser.username = Error();
      request(app)
        .post(`${USER_BASE_URL}/signup`)
        .send(newUser)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(500)
          expect(response.body.error.message).to.equal('Cast to string failed for value "{}" at path "username" for model "user"');
          done()
        });
    });

  });

  describe(`POST ${USER_BASE_URL}/signin`, () => {
    it('should log user in', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        request(app)
          .post(`${USER_BASE_URL}/signin`)
          .send(user)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(200)
            expect(response.body.token.length).to.be.greaterThan(100);
            done()
          });
      });
    });

    it('should not log user in with wrong password', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        user.password = 'password';
        request(app)
          .post(`${USER_BASE_URL}/signin`)
          .send(user)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(401)
            expect(response.body.error.message).to.equal('Invalid username or password');
            done()
          });
      });
    });

    it('should not log a user in with missing parameters', done => {
      delete user.username;
      request(app)
        .post(`${USER_BASE_URL}/signin`)
        .send(user)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(422)
          expect(response.body.error.message).to.equal('Parameter(s) missing');
          done()
        });
    });

    it('should not log a user in with invalid username', done => {
      user.username = Error();
      request(app)
        .post(`${USER_BASE_URL}/signin`)
        .send(user)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(500)
          expect(response.body.error.message).to.equal('Cast to string failed for value "{}" at path "username" for model "user"');
          done()
        });
    });

    it('should not log a user in with invalid password', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        user.password = Error();
        request(app)
          .post(`${USER_BASE_URL}/signin`)
          .send(user)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(500)
            expect(response.body.error.message).to.equal('data and hash must be strings');
            done()
          });
      });
    });

    it('should not log a user in that does not exist', done => {
      request(app)
        .post(`${USER_BASE_URL}/signin`)
        .send(newUser)
        .set('Accept', 'application/json')
        .end((error, response) => {
          expect(response.statusCode).to.equal(401)
          expect(response.body.error.message).to.equal('Invalid username or password');
          done()
        });
    });

  });

  describe(`DELETE ${USER_BASE_URL}/:userId`, () => {
    it('should delete user', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        const userId = userSaved._id;
        token = generateToken(userId);
        request(app)
          .delete(`${USER_BASE_URL}/${userId}`)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(200)
            expect(response.body.message).to.equal('User was deleted');
            done()
          });
      });
    });

    it('should not delete user if no valid user is logged in', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        const userId = userSaved._id;
        token = generateToken('5c0a45ad2a3e5b19169d2c0b');
        request(app)
          .delete(`${USER_BASE_URL}/${userId}`)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(404)
            expect(response.body.error.message).to.equal('User not found');
            done()
          });
      });
    });

    it('should not delete user if token is malformed', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        const userId = userSaved._id;
        token = 'wmrfmoernewnemwofeorfmeomowemr'
        request(app)
          .delete(`${USER_BASE_URL}/${userId}`)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(500)
            expect(response.body.error.message).to.equal('jwt malformed');
            done()
          });
      });
    });

    it('should not delete user with malformed id', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        const userId = userSaved._id;
        token = generateToken(userId)
        request(app)
          .delete(`${USER_BASE_URL}/randomId`)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(500)
            expect(response.body.error.message).to.equal('Cast to ObjectId failed for value "randomId" at path "_id" for model "user"');
            done()
          });
      });
    });

    it('should not delete user that does not exist', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        const userId = userSaved._id;
        token = generateToken(userId)
        request(app)
          .delete(`${USER_BASE_URL}/5c0a45ad2a3e5b19169d2c0b`)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(404)
            expect(response.body.error.message).to.equal('User not found');
            done()
          });
      });
    });

  });

});
