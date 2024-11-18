const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		value: {
			type: String,
			required: true,
		},
		created_date: {
			type: Date,
			default: Date.now,
		},
		subject: {
			type: String,
			required: true,
		},
		text: {
			type: String,
			required: true,
		},
	},
	{
		collection: 'contacts',
	}
);

module.exports = mongoose.model('Contact', contactSchema);
