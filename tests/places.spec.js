'use strict'

const request = require('supertest');
const chai = require('chai');
const Place = require('../models/place');
const User = require('../models/user');
const app = require('../app');
const expect = chai.expect;
const { generateToken, verifyToken } = require('../utilities/authentication_helper');
const { USER_BASE_URL, PLACE_BASE_URL } = require('../utilities/constants');

let token, user, user1, place;

describe('Tests for the Place Management Place Routes', () => {
  beforeEach(done => {
    user = {
      firstName: 'some-first-name',
      lastName: 'some-last-name',
      username: 'some-username',
      password: '1234'
    };

    user1 = {
      firstName: 'other-first-name',
      lastName: 'other-last-name',
      username: 'other-username',
      password: '1234'
    };

    place = {
      male: 30,
      female: 60,
      total: 100,
      name: 'some-place',
    };

    done();
  });

  afterEach(done => {
    Place.deleteMany({}, () => { });
    User.deleteMany({}, () => { });
    done();
  });

  describe(`MODELS /place`, () => {
    it('should update place total residents', () => {
      const placeToSave = new Place(place);
      placeToSave.save((error, placeSaved) => {
        expect(placeSaved.total).to.equal(90);
      });
    });

    it('should not update place total residents', () => {
      place.total = 90;
      const placeToSave = new Place(place);
      placeToSave.save((error, placeSaved) => {
        expect(placeSaved.total).to.equal(90);
      });
    });

  });

  describe(`GET ${PLACE_BASE_URL}`, () => {
    it('should fail to list places without token', done => {
      request(app)
        .get(`${PLACE_BASE_URL}/`)
        .end((error, response) => {
          expect(response.statusCode).to.equal(401)
          expect(response.body.error.message).to.equal('No access token');
          done()
        });
    });

    it('should list places', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        token = generateToken(userSaved._id)
        const placeToSave = {
          male: 10,
          female: 20,
          name: 'Kamapala'
        }
        request(app)
          .post(`${PLACE_BASE_URL}/`)
          .send(placeToSave)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response1) => {
            expect(response1.statusCode).to.equal(201)
            request(app)
              .get(`${PLACE_BASE_URL}/`)
              .set('x-access-token', token)
              .end((error, response2) => {
                expect(response2.statusCode).to.equal(200)
                expect(response2.body.data[0].female).to.equal(20);
                done()
              });
          });
      });
    });

  });

  describe(`POST ${PLACE_BASE_URL}/`, () => {
    it('should not post place with missing gender demographic', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        token = generateToken(userSaved._id)
        const placeToSave = {
          male: 100
        }
        request(app)
          .post(`${PLACE_BASE_URL}/`)
          .send(placeToSave)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(422);
            expect(response.body.error.message).to.equal('Parameter(s) missing');
            done();
          });
      });
    });

    it('should not post place with invalid name', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        token = generateToken(userSaved._id)
        const placeToSave = {
          male: 250,
          female: 300,
          name: Error()
        }
        request(app)
          .post(`${PLACE_BASE_URL}/`)
          .send(placeToSave)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(500);
            expect(response.body.error.message).to.equal('place validation failed: name: Cast to String failed for value "{}" at path "name"');
            done();
          });
      });
    });

    it('should post place with parentPlaceId', done => {
      const userToSave = new User(user);
      const parentPlace = new Place({
        male: 1000,
        female: 1200,
        name: "Kampala"
      })
      userToSave.save((error, userSaved) => {
        parentPlace.save((error, savedParentPlace) => {
          token = generateToken(userSaved._id)
          const placeToSave = {
            male: 250,
            female: 300,
            name: "Kamwokya",
            parentPlaceId: savedParentPlace._id
          }
          request(app)
            .post(`${PLACE_BASE_URL}/`)
            .send(placeToSave)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .end((error, response) => {
              expect(response.statusCode).to.equal(201);
              expect(response.body.message).to.equal('Place created successfully');
              expect(response.body.parentUpdateResult.total).to.equal(2750);
              done();
            });
        });
      });
    });

    it('should not post place with invalid parentPlaceId', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        token = generateToken(userSaved._id)
        const placeToSave = {
          male: 250,
          female: 300,
          name: "Kamwokya",
          parentPlaceId: '5c0a45ad2a3e5b19169d2c0b'
        }
        request(app)
          .post(`${PLACE_BASE_URL}/`)
          .send(placeToSave)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(404);
            expect(response.body.error.message).to.equal('Parent place not found');
            done();
          });
      });
    });

    it('should not post place with malformed parentPlaceId', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        token = generateToken(userSaved._id)
        const placeToSave = {
          male: 250,
          female: 300,
          name: "Kamwokya",
          parentPlaceId: 'invalidId'
        }
        request(app)
          .post(`${PLACE_BASE_URL}/`)
          .send(placeToSave)
          .set('x-access-token', token)
          .set('Accept', 'application/json')
          .end((error, response) => {
            expect(response.statusCode).to.equal(500);
            expect(response.body.error.message).to.equal('Cast to ObjectId failed for value "invalidId" at path "_id" for model "place"');
            done();
          });
      });
    });

  });

  describe(`GET ${PLACE_BASE_URL}/:placeId`, () => {
    it('should fetch place', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        token = generateToken(userSaved._id)
        const placeToSave = {
          male: 60,
          female: 100,
          name: "Lagos"
        };
        const savedPlace = new Place(placeToSave);
        savedPlace.save((error, placeSaved) => {
          request(app)
            .get(`${PLACE_BASE_URL}/${placeSaved._id}`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .end((error, response) => {
              expect(response.statusCode).to.equal(200)
              expect(response.body.data.male).to.equal(60);
              done()
            });
        });
      });
    });

  });

  describe(`PUT ${PLACE_BASE_URL}/:placeId`, () => {
    it('should edit place', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        token = generateToken(userSaved._id)
        const placeToSave = {
          male: 78,
          female: 88,
          name: "Mbarara"
        };
        const savedPlace = new Place(placeToSave);
        savedPlace.save((error, placeSaved) => {
          request(app)
            .put(`${PLACE_BASE_URL}/${placeSaved._id}`)
            .send({ male: 100 })
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .end((error, response) => {
              expect(response.statusCode).to.equal(200)
              expect(response.body.data.male).to.equal(100);
              done()
            });
        });
      });
    });

    it('should edit place with parentPlaceId', done => {
      const userToSave = new User(user);
      const parentPlace = new Place({
        male: 1000000,
        female: 1200000,
        name: "Uganda"
      })
      userToSave.save((error, userSaved) => {
        parentPlace.save((error, savedParentPlace) => {
          token = generateToken(userSaved._id)
          const placeToSave = {
            male: 78,
            female: 88,
            name: "Mbarara",
          };
          const savedPlace = new Place(placeToSave);
          savedPlace.save((error, placeSaved) => {
            request(app)
              .put(`${PLACE_BASE_URL}/${placeSaved._id}`)
              .send({ male: 100, parentPlaceId: savedParentPlace._id })
              .set('x-access-token', token)
              .set('Accept', 'application/json')
              .end((error, response) => {
                expect(response.statusCode).to.equal(200)
                expect(response.body.data.male).to.equal(100);
                expect(response.body.parentUpdateResult.male).to.equal(1000100);
                done()
              });
          });
        });
      });
    });

    it('should fail to edit place with malformed id', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        token = generateToken(userSaved._id)
        const placeToSave = {
          male: 60,
          female: 60,
          name: "Kitgum"
        };
        const savedPlace = new Place(placeToSave);
        savedPlace.save((error, placeSaved) => {
          request(app)
            .put(`${PLACE_BASE_URL}/invalidId`)
            .send({ female: 100 })
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .end((error, response) => {
              expect(response.statusCode).to.equal(500);
              expect(response.body.error.message).to.equal('Cast to ObjectId failed for value "invalidId" at path "_id" for model "place"');
              done()
            });
        });
      });
    });

    it('should fail to edit place with invalid id', done => {
      const userToSave = new User(user);
      const userToSave1 = new User(user1);
      userToSave.save((error, userSaved) => {
        token = generateToken(userSaved._id)
        userToSave1.save((error1, userSaved1) => {
          const placeToSave = {
            male: 11,
            female: 50,
            name: "Pader"
          };
          const savedPlace = new Place(placeToSave);
          savedPlace.save((error, placeSaved) => {
            request(app)
              .put(`${PLACE_BASE_URL}/5c0a45ad2a3e5b19169d2c0b`)
              .send({ male: 200 })
              .set('x-access-token', token)
              .set('Accept', 'application/json')
              .end((error, response) => {
                expect(response.statusCode).to.equal(404);
                expect(response.body.error.message).to.equal('Place not found');
                done()
              });
          });
        });
      });
    });

    it('should fail to edit place with invalid gender demographic', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        token = generateToken(userSaved._id)
        const placeToSave = {
          male: 12,
          female: 30,
          name: "London"
        };
        const savedPlace = new Place(placeToSave);
        savedPlace.save((error, placeSaved) => {
          request(app)
            .put(`${PLACE_BASE_URL}/${placeSaved._id}`)
            .send({ name: Error() })
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .end((error, response) => {
              expect(response.statusCode).to.equal(500);
              expect(response.body.error.message).to.equal('place validation failed: name: Cast to String failed for value "{}" at path "name"');
              done()
            });
        });
      });
    });

  });

  describe(`DELETE ${PLACE_BASE_URL}/:placeId`, () => {
    it('should delete place', done => {
      const userToSave = new User(user);
      userToSave.save((error, userSaved) => {
        token = generateToken(userSaved._id)
        const placeToSave = {
          male: 48,
          female: 68,
          name: 'Mityana'
        };
        const savedPlace = new Place(placeToSave);
        savedPlace.save((error, placeSaved) => {
          request(app)
            .delete(`${PLACE_BASE_URL}/${placeSaved._id}`)
            .set('x-access-token', token)
            .set('Accept', 'application/json')
            .end((error, response) => {
              expect(response.statusCode).to.equal(200)
              expect(response.body.message).to.equal('Place was deleted');
              done()
            });
        });
      });
    });

  });

});
