'use scrict';

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

//Helps protect against dictionary attacks, brute force and pre-computed rainbow table attacks
const SALT_WORK_FACTOR = 10;

//Define user schema
const UserShema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

UserShema.pre("save", function (next) {
    const user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

//Compare hashed password with that in database
UserShema.method("comparePassword", function (candidatePassword, next) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return next(err);
        next(null, isMatch);
    });
});

//Add update method to the user Schema
UserShema.method("update", function (updates, callback) {
    Object.assign(this, updates, { updatedAt: new Date() });
    this.save(callback);
});

//Get user model from schema
const user = mongoose.model("user", UserShema);

//Export user model
module.exports = user;
