const mongoose= require('mongoose')

const EventSchema= new mongoose.Schema({
  title:{
    type:String,
    required: True
  },
  host:{
    type:String,
    required: true
  },
  location:{
    type: String,
    required: true
  },
  time:{
    type: String,
    required: true
  },
  link:{
    type: String
  },
  desc:{
    type: String
  },
  category:{
    type: String,
    required: true
  },
  actions:{
    wishlist:[{type: mongoose.Schema.Types.ObjectId,ref: "User"}],
    rsvp:[{type: mongoose.Schema.Types.ObjectId,ref: "User"}],
    attendees:[{type: mongoose.Schema.Types.ObjectId,ref: "User"}],
  }
})


module.exports=mongoose.model('Event',EventSchema)
