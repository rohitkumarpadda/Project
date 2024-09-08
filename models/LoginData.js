const mongoose = require("mongoose");

const loginDataSchema = new mongoose.Schema({
  firstname: { type: String, required: true, unique: true },
  lastname: { type: String, required: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const LoginData = mongoose.model("LoginData", loginDataSchema);

module.exports = LoginData;
