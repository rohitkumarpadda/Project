const mongoose = require('mongoose');

const orderDataSchema = new mongoose.Schema(
	{
		userId: { type: String, required: true },
		acceptedShipperId: { type: String },
		dimensions: {
			length: { type: Number, required: true },
			width: { type: Number, required: true },
			height: { type: Number, required: true },
			weight: { type: Number, required: true },
		},
		fromAddress: {
			houseNumber: { type: String, required: true },
			colony: { type: String, required: true },
			pinCode: { type: String, required: true },
			city: { type: String, required: true },
			state: { type: String, required: true },
		},
		toAddress: {
			houseNumber: { type: String, required: true },
			colony: { type: String, required: true },
			pinCode: { type: String, required: true },
			city: { type: String, required: true },
			state: { type: String, required: true },
		},
		description: { type: String },
		images: [{ type: String }], // Paths to uploaded images
		status: { type: String, default: 'Pending' },
		createdAt: { type: Date, default: Date.now },
		Bids: [
			{
				shipperId: { type: String },
				amount: { type: Number },
				createdAt: { type: Date, default: Date.now },
			},
		],
	},
	{
		collection: 'orderData',
	}
);

const OrderData = mongoose.model('OrderData', orderDataSchema);

module.exports = OrderData;
