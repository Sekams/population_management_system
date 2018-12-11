'use strict';

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Place = require("../models/place");
const GeneralUtilities = require("../utilities/general_utilities");
const AuthTokenHelper = require("../utilities/authentication_helper");

const savePlace = (req, res, next, parentUpdateResult = {}) => {
  const place = new Place(req.body);
  place.save((error, place) => {
    if (error) return next(error);
    res.status(201);
    res.json({
      message: "Place created successfully",
      data: place,
      parentUpdateResult
    });
  });
}

const cascadeUpdateParent = (req, res, next, placeUpdate = {}) => {
  Place.findById(req.body.parentPlaceId, (error, parentPlace) => {
    if (error) return next(error);
    if (!parentPlace) {
      error = new Error("Parent place not found");
      error.status = 404;
      return next(error);
    }
    const newMale = parentPlace.male + req.body.male;
    const newFemale = parentPlace.female + req.body.female;
    const newTotal = newMale + newFemale;
    const parentUpdate = {
      male: newMale,
      female: newFemale,
      total: newTotal,
      updatedBy: req.loggedInUser._id
    }
    parentPlace.update(parentUpdate, (error, response) => {
      if (error) return next(error);
      if (placeUpdate.response) {
        res.json({
          message: "Place updated successfully",
          data: placeUpdate.response,
          parentUpdateResult: response
        });
      } else {
        savePlace(req, res, next, response);
      }
    });
  })
}

//Handle all requests with the placeId parameter
router.param("placeId", (req, res, next, placeId) => {
  Place.findById(placeId, (error, place) => {
    if (error) return next(error);
    if (!place) {
      error = new Error("Place not found");
      error.status = 404;
      return next(error);
    }
    req.place = place;
    return next();
  });
});

//GET /places
//Route for placeList collection
router.get("/", AuthTokenHelper.verifyToken, (req, res, next) => {
  Place.find({})
    .sort({ createdAt: -1 })
    .exec((error, placeList) => {
      if (error) return next(error);
      res.json({
        message: "Places fetched successfully",
        data: placeList
      });
    });
});

//POST /places
//Route for creating placeList
router.post("/", AuthTokenHelper.verifyToken, (req, res, next) => {
  if (GeneralUtilities.validateParams(req, ["male", "female", "name"])) {
    const { male, female } = req.body;
    req.body.createdBy = req.loggedInUser._id;
    req.body.updatedBy = req.loggedInUser._id;
    req.body.male = parseInt(male);
    req.body.female = parseInt(female);
    req.body.total = req.body.male + req.body.female;
    if (req.body.parentPlaceId) {
      cascadeUpdateParent(req, res, next);
    } else {
      savePlace(req, res, next);
    }
  } else {
    const error = new Error("Parameter(s) missing");
    error.status = 422;
    return next(error);
  }
});

//GET /places/:placeId
//Route for specific place reading
router.get("/:placeId", AuthTokenHelper.verifyToken, (req, res) => {
  res.json({
    message: "Place fetched successfully",
    data: req.place
  });
});

//PUT /places/:placeId
//Route for specific place updating
router.put("/:placeId", AuthTokenHelper.verifyToken, (req, res, next) => {
  const { parentPlaceId } = req.body;
  req.body.updatedBy = req.loggedInUser._id;
  req.place.update(req.body, (error, response) => {
    if (error) return next(error);
    if (response.parentPlaceId) {
      const { male, female } = response;
      req.body.male = parseInt(male);
      req.body.female = parseInt(female);
      if (!parentPlaceId) req.body.parentPlaceId = response.parentPlaceId;
      cascadeUpdateParent(req, res, next, { response });
    } else {
      res.json({
        message: "Place updated successfully",
        data: response
      });
    }
  });
});

//DELETE /places/:placeId
//Route for specific place deleting
router.delete("/:placeId", AuthTokenHelper.verifyToken, (req, res, next) => {
  const placeId = req.place._id;
  req.place.remove((error) => {
    if (error) return next(error);
    Place.updateMany({ parentPlaceId: placeId }, { parentPlaceId: "Deleted", updatedBy: req.loggedInUser._id }, (error, response) => {
      if (error) return next(error);
      res.json({
        message: "Place was deleted",
        updatedPlace: response
      });
    });
  });
});

module.exports = router;