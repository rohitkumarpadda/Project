const mongoose = require('mongoose');
const { type } = require('mquery/lib/env');

const loginDataSchema = new mongoose.Schema(
	{
		fullname: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		phoneNumber: { type: String, required: true },
		dateofBirth: { type: Date },
		password: { type: String },
		personalAddress: { type: String },
		companyAddress: { type: String },
		otp: { type: String },
		otpExpiry: { type: Date },
		lastResetDate: { type: Date },
		lastlogin: { type: Date },
		type: { type: String, required: true },
		drLicense: { type: String, required: true },
		vehicleRegistration: { type: String, required: true },
		DL_Address: { type: String },
		state: { type: String },
		vehicleClass: { type: String },
		vehicleModel: { type: String },
		capacity: { type: String },
		userId: { type: String, required: true, unique: true },
		profilepic: { type: String },
		shipperRating: { type: Number, default: 0 },
		punctualityRating: { type: Number, default: 0 },
		professionalismRating: { type: Number, default: 0 },
		communicationRating: { type: Number, default: 0 },
		shipperRatingCount: { type: Number, default: 0 },
		shipperDelivered: { type: Number, default: 0 },
	},
	{
		collection: 'shipperData',
	}
);

const LoginData = mongoose.model('shipperData', loginDataSchema);

module.exports = LoginData;
