let mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  },
  userName:{
      type:String,
      required: true,
      match:/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
  },
  userImage: {
    type: String,
    required: true,
    unique:true
  },
  summary:{
    type:String,
    default: "Ask me plz"
  },

  passWord: {
    type: String,
    required: true
  },
  joined: {
    type: Date,
    default: Date.now()
  },
  city:{
type:String,
required: true
  },
  country: {
    type:String,
    required: true
  },
  messages:{
    type: Array,
    required: false

  } 
});
module.exports = mongoose.model("User", userSchema);
