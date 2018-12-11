'use scrict';

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Define place schema
const PlaceSchema = new Schema({
    parentPlaceId: { type: String, required: false },
    name: { type: String, required: true },
    male: { type: Number, required: true },
    female: { type: Number, required: true },
    total: { type: Number, required: false },
    createdBy: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: String, required: false },
    updatedAt: { type: Date, default: Date.now }
});

PlaceSchema.pre("save", function (next) {
  const place = this;
  // only compute total if it has been modified (or is new)
  if (!place.isModified('total')) return next();

  // compute total
  if (place.total != (place.male + place.female)) {
    place.total = place.male + place.female;
  }
  next();
});


//Add update method to the place Schema
PlaceSchema.method("update", function (updates, callback) {
    Object.assign(this, updates, { updatedAt: new Date() });
    this.save(callback);
});

//Get place model from schema
const place = mongoose.model("place", PlaceSchema);

//Export place model
module.exports = place;
