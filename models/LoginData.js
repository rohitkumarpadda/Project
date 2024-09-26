const mongoose = require("mongoose");

const loginDataSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  dob: { type: Date },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  oauthProvider: { type: String },
  oauthId: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },
  lastResetDate: { type: Date },
});

const LoginData = mongoose.model("LoginData", loginDataSchema);

module.exports = LoginData;
