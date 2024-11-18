// models/reviewData.js

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
	{
		orderId: { type: String, required: true },
		shipperId: { type: String, required: true },
		userId: { type: String, required: true },
		overallRating: { type: Number, required: true },
		punctualityRating: { type: Number, required: true },
		professionalismRating: { type: Number, required: true },
		communicationRating: { type: Number, required: true },
		review: { type: String, required: true },
		date: { type: Date, default: Date.now },
	},
	{
		collection: 'reviewData',
	}
);

const ReviewData = mongoose.model('reviewData', reviewSchema);

module.exports = ReviewData;
