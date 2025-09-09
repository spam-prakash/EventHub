const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: false
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
    phone:{
        type: Number,
        unique:true
    },
    accountType: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    actions: {
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }], //stores event id
        rsvp: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    }
})

module.exports = mongoose.model('User', UserSchema)
