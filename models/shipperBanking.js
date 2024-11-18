const mongoose = require('mongoose');

const shipperBankingSchema = new mongoose.Schema({
	shipperId: { type: String },
	accountHolderName: { type: String },
	accountNumber: { type: String },
	ifscCode: { type: String },
	bankName: { type: String },
	upiid: { type: String },
});

module.exports = mongoose.model('ShipperBanking', shipperBankingSchema);
