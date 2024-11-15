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
		DL_Address: { type: String, required: true },
		state: { type: String },
		vehicleType: { type: String },
		userId: { type: String, required: true, unique: true },
	},
	{
		collection: 'shipperData',
	}
);

const LoginData = mongoose.model('shipperData', loginDataSchema);

module.exports = LoginData;
