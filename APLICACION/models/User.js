const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nombre: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);