'use strict';

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Place = require("../models/place");
const GeneralUtilities = require("../utilities/general_utilities");
const AuthTokenHelper = require("../utilities/authentication_helper");

//Handle all requests with the userId parameter
router.param("userId", (req, res, next, userId) => {
  User.findById(userId, (error, user) => {
    if (error) return next(error);
    if (!user) {
      error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
    req.user = user;
    return next();
  });
});

//POST /users/signup
//Route for creating users
router.post("/signup", (req, res, next) => {
  if (GeneralUtilities.validateParams(req, ["firstName", "lastName", "username", "password"])) {
    User.find({ username: req.body.username }, (error, exstingUser) => {
      if (error) return next(error);
      if (exstingUser.length > 0) {
        error = new Error("User already exists");
        error.status = 409;
        return next(error);
      } else {
        const user = new User(req.body);
        user.username = req.body.username;
        user.save((error, user) => {
          if (error) return next(error);
          res.status(201);
          res.json({
            message: "Signup successful",
            token: AuthTokenHelper.generateToken(user.id)
          });
        });
      }
    });
  } else {
    const error = new Error("Parameter(s) missing");
    error.status = 422;
    return next(error);
  }
});

//POST /users/signin
//Route for users to login
router.post("/signin", (req, res, next) => {
  if (GeneralUtilities.validateParams(req, ["username", "password"])) {
    User.findOne({ username: req.body.username }, (error, user) => {
      if (error) return next(error);
      if (user) {
        user.comparePassword(req.body.password, (error, isMatching) => {
          if (error) return next(error);
          if (isMatching) {
            res.status = 200;
            res.json({
              message: "Signin successful",
              token: AuthTokenHelper.generateToken(user.id)
            });
          } else {
            error = new Error("Invalid username or password");
            error.status = 401;
            return next(error);
          }
        });
      } else {
        error = new Error("Invalid username or password");
        error.status = 401;
        return next(error);
      }
    });
  } else {
    const error = new Error("Parameter(s) missing");
    error.status = 422;
    return next(error);
  }
});

//DELETE /users/:userId
//Route for specific user deleting
router.delete("/:userId", AuthTokenHelper.verifyToken, (req, res, next) => {
  const userId = req.user._id;
  req.user.remove(function (error) {
    if (error) return next(error);
    Place.updateMany({ createdBy: userId }, { createdBy: "Deleted" }, (error, response) => {
      if (error) return next(error);
      Place.updateMany({ updatedBy: userId }, { updatedBy: "Deleted" }, (error, response1) => {
        if (error) return next(error);
        res.json({
          message: "User was deleted",
          updatedPlaceCreations: response,
          updatedPlaceUpdates: response1
        });
      });
    });
  });
});

module.exports = router;
