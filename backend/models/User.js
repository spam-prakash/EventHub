const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true // allows some users to not have googleId
    },
    username: {
        type: String,
        required: false,
        unique: true,
        sparse: true // allows Google users to not have it at first
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    phone: {
        type: Number,
        unique: true,
        sparse: true
    },
    accountType: {
        type: String
    },
    location: {
        type: String,
        required: false // make optional for Google users initially
    },
    date: {
        type: Date,
        default: Date.now
    },
    actions: {
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
        rsvp: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
        pastEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }]
    }
});

module.exports = mongoose.model('User', UserSchema);
