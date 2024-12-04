require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const ratelimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const https = require('https');
const multer = require('multer');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const app = express();
const LoginData = require('./models/LoginData');
const ShipperData = require('./models/shipperData');
const orderData = require('./models/orderData');
const ReviewData = require('./models/reviewData.js');
const Contact = require('./models/contactModel.js');
const ShipperBank = require('./models/shipperBanking.js');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Middleware: session handling
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 30 },
	})
);

//Rate limiter
const limiter = ratelimit({
	windowMs: 1000 * 60 * 1000, // 10 minutes
	max: 100,
	message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Passport serialize/deserialize for session persistence
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Google OAuth strategy
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: 'http://localhost:5000/auth/google/callback',
			scope: ['openid', 'profile', 'email'],
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				let user = await LoginData.findOne({ email: profile.emails[0].value });
				if (!user) {
					user = await LoginData.create({
						firstname: profile.name.givenName,
						lastname: profile.name.familyName,
						email: profile.emails[0].value,
						dob: profile.birthday || null,
						password: await encryptPassword(profile.id),
						oauthProvider: 'Google',
						oauthId: profile.id,
						lastlogin: new Date(),
						type: 'user',
						userId: await generateID(),
						address: 'N/A',
					});
				}
				return done(null, user);
			} catch (error) {
				return done(error);
			}
		}
	)
);

// Google OAuth routes
app.get(
	'/auth/google',
	passport.authenticate('google', { scope: ['openid', 'profile', 'email'] })
);
// Updated scopes
app.get(
	'/auth/google/callback',
	passport.authenticate('google', { failureRedirect: '/SignIn' }),
	(req, res) => {
		req.session.user = req.user;
		res.redirect('/afterlogin');
	}
);

// Password encryption
async function encryptPassword(password) {
	const saltRounds = 10;
	return await bcrypt.hash(password, saltRounds);
}

// Find user by email
async function findUserByEmail(email) {
	return await LoginData.findOne({ email: { $eq: email } });
}

// Reusable alert with redirection
function sendAlert(res, message, redirectUrl) {
	res.send(`
    <script>
      alert('${message}');
      window.location.href = '${redirectUrl}';
    </script>
  `);
}

// Password matching validation
function passwordsMatch(password, verifyPassword) {
	return password === verifyPassword;
}

// OTP validation
function isOtpValid(user, otp) {
	return user.otp === otp && Date.now() <= user.otpExpiry;
}

// Send OTP email
async function sendOtpEmail(email, otp) {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Your OTP for Password Reset',
		text: `Your OTP for password reset is ${otp}. It is valid for 1 hour.\n\nIf you did not request this, please ignore this email.\n\nRegards,\nTeam ShipIt`,
	};

	await transporter.sendMail(mailOptions);
}

//Generate UserId(of 10 characters)
async function generateID() {
	return crypto.randomBytes(5).toString('hex');
}

// Multer for image uploads
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/'); // Ensure this directory exists
	},
	filename: function (req, file, cb) {
		// Get the userId from session
		const userId = req.session.user.userId;
		// Get the original file extension
		const ext = path.extname(file.originalname);
		// Generate a unique filename
		const filename = `${userId}_${Date.now()}${ext}`;
		cb(null, filename);
	},
});

const upload = multer({ storage: storage });

// Middleware to check if user is logged in
async function isLoggedInAsuser(req, res, next) {
	if (req.session.user && req.session.user.type === 'user') {
		next();
	} else {
		res.redirect('/SignIn');
	}
}

// Middleware to check if shipper is logged in
async function isLoggedInAsShipper(req, res, next) {
	if (req.session.user && req.session.user.type === 'shipper') {
		next();
	} else {
		res.redirect('/SignIn');
	}
}

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/home.html'));
});

app.get('/user', (req, res) => {
	if (req.session.user) {
		res.send(req.session.user);
	} else {
		res.send({ firstname: '' });
	}
});

app.get('/SignIn', (req, res) => {
	res.send(`
    <script>
      window.location.href = '/#formdiv';
    </script>
  `);
});

app.get('/SignUp', (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/signup.html'));
});

app.get('/forgot-password', (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/forgot-password.html'));
});

app.get('/verify-otp', (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/verify-password.html'));
});

app.get('/about', (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/about.html'));
});

app.get('/contact', (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/contact.html'));
});

app.post('/shipperSignIn', async (req, res) => {
	const { Email, Password } = req.body;
	console.log(req.body);
	const shipper = await ShipperData.findOne({ email: Email });
	if (!shipper) {
		return sendAlert(res, 'User not found', '/shipperSignIn');
	}
	const isMatch = await bcrypt.compare(Password, shipper.password);
	if (isMatch) {
		shipper.lastlogin = new Date();
		req.session.user = shipper;
		res.redirect('/dashboard?userId=' + shipper.userId);
	} else {
		sendAlert(res, 'Invalid Credentials', '/shipperSignIn');
	}
});

app.get('/shipperRegistration', (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/shipperregister.html'));
});

app.get('/showOrders', isLoggedInAsuser, async (req, res) => {
	const userId = req.session.user.userId;

	const orders = await orderData.find({ userId: userId }).lean();
	res.json(orders);
});

app.get('/dashboard', isLoggedInAsShipper, (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/shipperdashbord.html'));
});

app.get('/showShipperDetails', isLoggedInAsShipper, async (req, res) => {
	const userId = req.session.user.userId;
	const shipper = await ShipperData.findOne({ userId: userId }).lean();

	res.json(shipper);
});

app.get('/afterlogin', isLoggedInAsuser, (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/afterloginhome.html'));
});

app.get('/showUserDetails', isLoggedInAsuser, async (req, res) => {
	const userId = req.session.user.userId;
	const user = await LoginData.findOne({ userId: userId }).lean();

	res.json(user);
});

app.get('/orderBids', isLoggedInAsShipper, async (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/biddingarea.html'));
});

app.get('/selectOrder', isLoggedInAsShipper, async (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/shipperfilter.html'));
});

app.get('/filterOrders', isLoggedInAsShipper, async (req, res) => {
	const { weight } = req.query;
	if (weight) {
		const orders = await orderData
			.find({ 'dimensions.weight': { $lte: weight } })
			.lean();
		res.json(orders);
	} else {
		const orders = await orderData
			.find({ 'dimensions.weight': { $lte: 500 } })
			.lean();
		res.json(orders);
	}
});

// Fetch order details
app.get('/bidDetails', async (req, res) => {
	const orderId = req.query.orderId;
	if (!orderId) {
		return res.status(400).send('orderId is required');
	}
	try {
		const order = await orderData.findById(orderId).lean();
		if (!order) {
			return res.status(404).send('Order not found');
		}
		order.Bids = order.Bids.sort((a, b) => a.amount - b.amount);
		res.json(order);
	} catch (error) {
		console.error('Error fetching order details:', error);
		res.status(500).send('Internal Server Error');
	}
});

app.get('/orderStatus', isLoggedInAsuser, async (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/deliveryprogress.html'));
});

app.get('/completed', isLoggedInAsuser, async (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/deliverycomplete.html'));
});

app.get('/orderDetailsComplete', async (req, res) => {
	const orderId = req.query.orderId;
	if (!orderId) {
		return res.status(400).json({ error: 'Order ID is required' });
	}

	try {
		const order = await orderData.findById(orderId).lean();
		if (!order) {
			return res.status(404).json({ error: 'Order not found' });
		}
		res.json(order);
	} catch (error) {
		console.error('Error fetching order details:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.get('/shipperDetailsComplete', async (req, res) => {
	const shipperId = req.query.shipperId;
	if (!shipperId) {
		return res.status(400).json({ error: 'Shipper ID is required' });
	}

	try {
		const shipper = await ShipperData.findOne({ userId: shipperId }).lean();
		if (!shipper) {
			return res.status(404).json({ error: 'Shipper not found' });
		}
		res.json(shipper);
	} catch (error) {
		console.error('Error fetching shipper details:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Place a bid
app.post('/placeBid', isLoggedInAsShipper, async (req, res) => {
	const { orderId, amount } = req.body;
	const shipperId = req.session.user.userId;
	const shipperName = req.session.user.fullname;

	if (!orderId || !amount) {
		return res.json({ success: false, message: 'Missing required fields' });
	}
	try {
		const order = await orderData.findOne({ _id: { $eq: orderId } });
		if (!order) {
			return res.json({ success: false, message: 'Order not found' });
		}

		// Add the bid
		order.Bids.push({
			shipperId: shipperId,
			shipperName: shipperName,
			amount: amount,
			createdAt: new Date(),
		});
		order.Bids.sort((a, b) => a.amount - b.amount);

		await order.save();

		res.json({ success: true });
	} catch (error) {
		console.error('Error placing bid:', error);
		res.json({ success: false, message: 'Server error' });
	}
});

// Sign Up route
app.post('/SignUp', async (req, res, next) => {
	try {
		const {
			Firstname,
			Lastname,
			Email,
			DOB,
			Password,
			Verifypassword,
			Address,
		} = req.body;

		if (!passwordsMatch(Password, Verifypassword)) {
			return sendAlert(
				res,
				'Passwords do not match, please try again',
				'/SignUp'
			);
		}

		const logindata = await LoginData.create({
			firstname: Firstname,
			lastname: Lastname,
			dob: DOB,
			email: Email,
			password: await encryptPassword(Password),
			lastlogin: new Date(),
			type: 'user',
			userId: await generateID(),
			address: Address ? Address : 'N/A',
		});

		req.session.user = logindata;
		res.redirect('/afterlogin');
	} catch (error) {
		if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
			sendAlert(res, 'User with this Email already exists', '/SignUp');
		} else {
			next(error);
		}
	}
});

// Sign In route
app.post('/SignIn', async (req, res, next) => {
	try {
		const { Email, Password } = req.body;
		const user = await findUserByEmail(Email);

		if (user) {
			const isMatch = await bcrypt.compare(Password, user.password);
			if (isMatch) {
				user.lastlogin = new Date();
				req.session.user = user;
				res.redirect('/afterlogin');
			} else {
				sendAlert(res, 'Invalid Credentials', '/SignIn');
			}
		} else {
			sendAlert(res, 'User not found', '/SignIn');
		}
	} catch (error) {
		next(error);
	}
});

// Forgot Password route
app.post('/forgotpassword', async (req, res, next) => {
	try {
		const { Email } = req.body;
		const user = await findUserByEmail(Email);

		if (!user) {
			return sendAlert(res, 'User not found', '/SignIn');
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		user.otp = otp;
		user.otpExpiry = Date.now() + 3600000; // 1 hour expiry
		await user.save();

		await sendOtpEmail(Email, otp);
		sendAlert(res, 'OTP sent to your email', '/verify-otp');
	} catch (error) {
		next(error);
	}
});

// Verify OTP and reset password route
app.post('/verify-otp', async (req, res, next) => {
	try {
		const { Email, OTP, NewPassword } = req.body;
		const user = await findUserByEmail(Email);

		if (!user) {
			return sendAlert(res, 'User not found', '/SignIn');
		}

		if (!isOtpValid(user, OTP)) {
			return sendAlert(res, 'Invalid or expired OTP', '/forgot-password');
		}

		user.password = await encryptPassword(NewPassword);
		user.otp = null;
		user.otpExpiry = null;
		user.lastResetDate = new Date();
		await user.save();

		sendAlert(res, 'Password has been reset successfully', '/SignIn');
	} catch (error) {
		next(error);
	}
});

async function initiateDLVerification(idNumber, dateOfBirth) {
	return new Promise((resolve, reject) => {
		const options = {
			method: 'POST',
			hostname: 'eve.idfy.com',
			path: '/v3/tasks/async/verify_with_source/ind_driving_license',
			headers: {
				'Content-Type': 'application/json',
				'account-id': process.env.IDFY_ACCOUNT_ID,
				'api-key': process.env.IDFY_API_KEY,
			},
			maxRedirects: 20,
		};

		const req = https.request(options, (res) => {
			let chunks = [];
			res.on('data', (chunk) => chunks.push(chunk));
			res.on('end', () => {
				const body = JSON.parse(Buffer.concat(chunks).toString());
				resolve(body.request_id); // Obtain the request ID
			});
			res.on('error', (error) => reject(error));
		});

		const postData = JSON.stringify({
			task_id: process.env.DRIVING_LICENSE_TASK_ID,
			group_id: process.env.DRIVING_LICENSE_GROUP_ID,
			data: {
				id_number: idNumber,
				date_of_birth: dateOfBirth,
				advanced_details: {
					state_info: true,
					age_info: true,
				},
			},
		});

		req.write(postData);
		req.end();
	});
}

async function checkDLVerificationStatus(requestId) {
	return new Promise((resolve, reject) => {
		const interval = 5000; // Interval between checks in milliseconds
		const timeout = 60000; // Maximum time to wait before timing out
		let elapsedTime = 0;

		const poll = () => {
			const options = {
				method: 'GET',
				hostname: 'eve.idfy.com',
				path: `/v3/tasks?request_id=${requestId}`,
				headers: {
					'api-key': process.env.IDFY_API_KEY,
					'Content-Type': 'application/json',
					'account-id': process.env.IDFY_ACCOUNT_ID,
				},
				maxRedirects: 20,
			};

			const req = https.request(options, (res) => {
				let chunks = [];
				res.on('data', (chunk) => chunks.push(chunk));
				res.on('end', () => {
					const responseString = Buffer.concat(chunks).toString();

					let body;
					try {
						body = JSON.parse(responseString);
					} catch (error) {
						console.error('Error parsing JSON:', error);
						return reject(error);
					}

					// Access the first task in the response array
					const task = body[0];
					console.log('Task:Driving license \n', task);

					// Check if the task has a "completed_at" field
					if (task.completed_at) {
						const sourceOutput = task.result?.source_output;
						if (sourceOutput) {
							// Process the sourceOutput data
							// Check if validity dates are present
							if (
								sourceOutput.nt_validity_from &&
								sourceOutput.nt_validity_to
							) {
								const validityFrom = new Date(sourceOutput.nt_validity_from);
								const validityTo = new Date(sourceOutput.nt_validity_to);
								const currentDate = new Date();

								// Check if current date is within validity period
								if (currentDate >= validityFrom && currentDate <= validityTo) {
									return resolve({
										valid: true,
										DL_Address: sourceOutput.address, // Save address as DL_Address
										state: sourceOutput.state,
									});
								} else {
									return resolve({ valid: false });
								}
							} else {
								console.error('Validity dates not found in source_output');
								return resolve({ valid: false });
							}
						} else {
							console.error('No source_output found in task result');
							return reject(new Error('No source_output in task result'));
						}
					} else if (task.status === 'failed') {
						console.error('Verification task failed');
						return reject(new Error('Verification task failed'));
					} else if (task.status === 'in_progress') {
						// Wait and poll again
						if (elapsedTime < timeout) {
							elapsedTime += interval;
							console.log(
								`Verification in progress... Retrying in ${
									interval / 1000
								} seconds.`
							);
							setTimeout(poll, interval);
						} else {
							console.error('Verification timed out');
							return reject(new Error('Verification timed out'));
						}
					} else {
						console.error(`Unknown task status: ${task.status}`);
						return reject(new Error(`Unknown task status: ${task.status}`));
					}
				});
				res.on('error', (error) => {
					console.error('Request Error:', error);
					reject(error);
				});
			});

			req.on('error', (error) => {
				console.error('Request Error:', error);
				reject(error);
			});

			req.end();
		};

		// Start polling
		poll();
	});
}

async function initiateVehicleVerification(rcNumber) {
	return new Promise((resolve, reject) => {
		const options = {
			method: 'POST',
			hostname: 'eve.idfy.com',
			path: '/v3/tasks/async/verify_with_source/ind_rc_basic',
			headers: {
				'Content-Type': 'application/json',
				'account-id': process.env.IDFY_ACCOUNT_ID,
				'api-key': process.env.IDFY_API_KEY,
			},
			maxRedirects: 20,
		};

		const req = https.request(options, (res) => {
			let chunks = [];
			res.on('data', (chunk) => chunks.push(chunk));
			res.on('end', () => {
				const body = JSON.parse(Buffer.concat(chunks).toString());
				resolve(body.request_id);
			});
			res.on('error', (error) => reject(error));
		});

		const postData = JSON.stringify({
			task_id: process.env.VEHICLE_TASK_ID,
			group_id: process.env.VEHICLE_GROUP_ID,
			data: {
				rc_number: rcNumber,
			},
		});

		req.write(postData);
		req.end();
	});
}

async function checkVehicleVerificationStatus(requestId) {
	return new Promise((resolve, reject) => {
		const interval = 5000; // Interval between checks in milliseconds
		const timeout = 60000; // Maximum time to wait before timing out
		let elapsedTime = 0;

		const poll = () => {
			const options = {
				method: 'GET',
				hostname: 'eve.idfy.com',
				path: `/v3/tasks?request_id=${requestId}`,
				headers: {
					'api-key': process.env.IDFY_API_KEY,
					'Content-Type': 'application/json',
					'account-id': process.env.IDFY_ACCOUNT_ID,
				},
				maxRedirects: 20,
			};

			const req = https.request(options, (res) => {
				let chunks = [];
				res.on('data', (chunk) => chunks.push(chunk));
				res.on('end', () => {
					const responseString = Buffer.concat(chunks).toString();
					let body;

					try {
						body = JSON.parse(responseString);
					} catch (error) {
						return reject(error);
					}

					const task = body[0];
					console.log('Task:Vehicle Registration \n', task);

					if (task.completed_at) {
						const extractionOutput = task.result?.extraction_output;
						if (extractionOutput) {
							if (new Date(extractionOutput.fitness_upto) > new Date()) {
								return resolve({
									valid: true,
									vehicleClass: extractionOutput.vehicle_class,
									registrationNumber: extractionOutput.registration_number,
									maker_model: extractionOutput.maker_model,
									avg_gross_vehicle_weight:
										extractionOutput.avg_gross_vehicle_weight,
									unladen_weight: extractionOutput.unladen_weight,
								});
							} else {
								return resolve({ valid: false });
							}
						} else {
							return reject(new Error('No extraction_output in task result'));
						}
					} else if (task.status === 'failed') {
						return reject(new Error('Verification task failed'));
					} else if (task.status === 'in_progress') {
						if (elapsedTime < timeout) {
							elapsedTime += interval;
							setTimeout(poll, interval);
						} else {
							return reject(new Error('Verification timed out'));
						}
					} else {
						return reject(new Error(`Unknown task status: ${task.status}`));
					}
				});
				res.on('error', (error) => reject(error));
			});

			req.on('error', (error) => reject(error));
			req.end();
		};

		poll();
	});
}

app.post('/shipperRegistration', async (req, res) => {
	let {
		Fullname,
		Email,
		PhoneNumber,
		PersonalAddress,
		CompanyAddress,
		DrivingLicense,
		VehicleRegistration,
		Password,
		VerifyPassword,
		DateOfBirth,
	} = req.body;

	if (!passwordsMatch(Password, VerifyPassword)) {
		return sendAlert(
			res,
			'Passwords do not match, please try again',
			'/shipperRegistration'
		);
	}
	console.log(DateOfBirth);
	try {
		// Initiate Driving License Verification
		const dlRequestId = await initiateDLVerification(
			DrivingLicense,
			DateOfBirth
		);
		const dlVerificationResult = await checkDLVerificationStatus(dlRequestId);

		if (!dlVerificationResult.valid) {
			return sendAlert(
				res,
				'Driving License is not valid for transport use',
				'/shipperRegistration'
			);
		}
		if (dlVerificationResult.valid) {
			console.log('Driving License Verification Successfull');
		}

		//Initiate Vehicle Registration Verification
		const vehicleRequestId = await initiateVehicleVerification(
			VehicleRegistration
		);
		const vehicleVerificationResult = await checkVehicleVerificationStatus(
			vehicleRequestId
		);

		// Handle failed vehicle registration validation
		if (!vehicleVerificationResult.valid) {
			return sendAlert(
				res,
				'Vehicle registration number is invalid or fitness has expired. Please check and try again.',
				'/shipperRegistration'
			);
		}
		if (!vehicleVerificationResult.valid) {
			console.log('Vehicle Registration Verification Successfull');
		}
		let Capacity =
			vehicleVerificationResult.avg_gross_vehicle_weight -
			vehicleVerificationResult.unladen_weight;

		// Save shipper data if both validations are successful
		const shipperData = await ShipperData.create({
			fullname: Fullname,
			email: Email,
			phoneNumber: PhoneNumber,
			password: await encryptPassword(Password),
			type: 'shipper',
			drLicense: DrivingLicense,
			vehicleRegistration: VehicleRegistration,
			personalAddress: PersonalAddress,
			companyAddress: CompanyAddress,
			lastlogin: new Date(),
			userId: await generateID(),
			DL_Address: dlVerificationResult.DL_Address,
			state: dlVerificationResult.state,
			vehicleClass: vehicleVerificationResult.vehicleClass,
			vehicleModel: vehicleVerificationResult.maker_model,
			capacity: Capacity,
		});

		req.session.user = shipperData;
		res.redirect('/dashboard');
	} catch (error) {
		if (error.message && error.message.includes('BAD_REQUEST')) {
			sendAlert(
				res,
				'Vehicle registration number is invalid. Please enter a valid RC number.',
				'/shipperRegistration'
			);
		}
		if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
			return sendAlert(
				res,
				'User with this email already exists. Please use a different email.',
				'/shipperRegistration'
			);
		}

		console.error(error);
		sendAlert(
			res,
			'An error occurred during registration. Please try again later.',
			'/shipperRegistration'
		);
	}
});

app.post(
	'/submit-shipment',
	isLoggedInAsuser,
	upload.array('Images'),
	async (req, res, next) => {
		try {
			const {
				Length,
				Width,
				Height,
				Weight,
				HouseNumber,
				Colony,
				PinCode,
				City,
				State,
				HousenumberTo,
				ColonyTo,
				PinCodeTo,
				CityTo,
				StateTo,
				Description,
				PickupDate,
				DeliveryDate,
			} = req.body;

			// Process uploaded images
			const imagePaths = req.files.map((file) => file.path);

			// Create a new shipment order
			const newOrder = await orderData.create({
				userId: req.session.user.userId,
				dimensions: {
					length: parseFloat(Length),
					width: parseFloat(Width),
					height: parseFloat(Height),
					weight: parseFloat(Weight),
				},
				fromAddress: {
					houseNumber: HouseNumber,
					colony: Colony,
					pinCode: PinCode,
					city: City,
					state: State,
				},
				toAddress: {
					houseNumber: HousenumberTo,
					colony: ColonyTo,
					pinCode: PinCodeTo,
					city: CityTo,
					state: StateTo,
				},
				description: Description,
				images: imagePaths,
				status: 'In Auction',
				pickupDate: new Date(PickupDate),
				deliveryDate: new Date(DeliveryDate),
			});

			res.redirect('/afterlogin');
		} catch (error) {
			console.error('Error submitting shipment:', error);
			next(error);
		}
	}
);

app.post('/submitReview', isLoggedInAsuser, async (req, res) => {
	const {
		orderId,
		overallRating,
		punctualityRating,
		professionalismRating,
		communicationRating,
		review,
	} = req.body;
	const userId = req.session.user.userId;

	if (
		!orderId ||
		!overallRating ||
		!punctualityRating ||
		!professionalismRating ||
		!communicationRating ||
		!review
	) {
		return res.json({ success: false, error: 'Missing required fields' });
	}

	try {
		// Check if the review for this order by this user already exists
		const existingReview = await ReviewData.findOne({ orderId, userId });
		if (existingReview) {
			return res.json({
				success: false,
				error: 'You have already reviewed this order.',
			});
		}

		// Get the order details to verify the shipperId
		const order = await orderData.findById(orderId);
		if (!order) {
			return res.json({ success: false, error: 'Order not found' });
		}

		const shipperId = order.acceptedShipperId;
		if (!shipperId) {
			return res.json({
				success: false,
				error: 'Order has no assigned shipper',
			});
		}

		// Create a new review
		const newReview = new ReviewData({
			orderId,
			shipperId,
			userId,
			overallRating,
			punctualityRating,
			professionalismRating,
			communicationRating,
			review,
		});

		await newReview.save();

		const reviews = await ReviewData.find({ shipperId });

		const totalOverallRating = reviews.reduce(
			(sum, r) => sum + r.overallRating,
			0
		);
		const totalPunctualityRating = reviews.reduce(
			(sum, r) => sum + r.punctualityRating,
			0
		);
		const totalProfessionalismRating = reviews.reduce(
			(sum, r) => sum + r.professionalismRating,
			0
		);
		const totalCommunicationRating = reviews.reduce(
			(sum, r) => sum + r.communicationRating,
			0
		);

		const reviewCount = reviews.length;

		const averageOverallRating = totalOverallRating / reviewCount;
		const averagePunctualityRating = totalPunctualityRating / reviewCount;
		const averageProfessionalismRating =
			totalProfessionalismRating / reviewCount;
		const averageCommunicationRating = totalCommunicationRating / reviewCount;

		// Update shipper data
		await ShipperData.updateOne(
			{ userId: shipperId },
			{
				shipperRating: averageOverallRating,
				punctualityRating: averagePunctualityRating,
				professionalismRating: averageProfessionalismRating,
				communicationRating: averageCommunicationRating,
				shipperRatingCount: reviewCount,
			}
		);

		res.json({ success: true });
	} catch (error) {
		console.error('Error submitting review:', error);
		res.json({ success: false, error: 'Internal server error' });
	}
});

app.get('/getShipperReviews', isLoggedInAsShipper, async (req, res) => {
	const shipperId = req.session.user.userId;

	try {
		const reviews = await ReviewData.find({ shipperId }).lean();
		res.json(reviews);
	} catch (error) {
		console.error('Error fetching shipper reviews:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.post('/contact', async (req, res) => {
	const { Name, Email, Phno, Value, Subject, Textbox } = req.body;

	try {
		const contact = await Contact.create({
			name: Name,
			email: Email,
			phone: Phno,
			value: Value,
			subject: Subject,
			text: Textbox,
		});
		return sendAlert(res, 'Message sent successfully', '/contact');
	} catch (error) {
		console.error('Error sending message:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.get('/orderDetailsProgress', async (req, res) => {
	const orderId = req.query.orderId;
	if (!orderId) {
		return res.status(400).json({ error: 'Order ID is required' });
	}
	try {
		const order = await orderData.findById(orderId).lean();
		if (!order) {
			return res.status(404).json({ error: 'Order not found' });
		}
		res.json(order);
	} catch (error) {
		console.error('Error fetching order details:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.post('/acceptBid', async (req, res) => {
	const { orderId, shipperId, amount } = req.body;
	if (!orderId || !shipperId || amount == null) {
		return res
			.status(400)
			.json({ success: false, message: 'Missing required fields' });
	}
	try {
		const order = await orderData.findOne({ _id: { $eq: orderId } });
		if (!order) {
			return res
				.status(404)
				.json({ success: false, message: 'Order not found' });
		}
		order.status = 'In Transit';
		order.acceptedShipperId = shipperId;
		order.acceptedBidAmount = amount; // Store accepted bid amount
		await order.save();
		res.json({ success: true });
	} catch (error) {
		console.error('Error accepting bid:', error);
		res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
});

// Fetch shipper details
app.get('/shipperDetailsProgress', async (req, res) => {
	const shipperId = req.query.shipperId;
	if (!shipperId) {
		return res.status(400).json({ error: 'Shipper ID is required' });
	}
	try {
		const shipper = await ShipperData.findOne({
			userId: { $eq: shipperId },
		}).lean();
		if (!shipper) {
			return res.status(404).json({ error: 'Shipper not found' });
		}
		res.json(shipper);
	} catch (error) {
		console.error('Error fetching shipper details:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.post('/saveBanking', isLoggedInAsShipper, async (req, res) => {
	const { AccountHolder, AccountNumber, IFSC, BankName, UPI } = req.body;
	if (ShipperBank.findOne({ shipperId: req.session.user.userId })) {
		ShipperBank.updateOne(
			{ shipperId: req.session.user.userId },
			{
				accountHolderName: AccountHolder,
				accountNumber: AccountNumber,
				ifscCode: IFSC,
				bankName: BankName,
				upiid: UPI,
			}
		);
	}
	const user = await ShipperBank.create({
		shipperId: req.session.user.userId,
		accountHolderName: AccountHolder,
		accountNumber: AccountNumber,
		ifscCode: IFSC,
		bankName: BankName,
		upiid: UPI,
	});
	res.redirect('/dashboard');
});

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to create a Razorpay order
app.post('/createOrder', async (req, res) => {
	const { amount, orderId } = req.body;

	const options = {
		amount: amount, // Amount in paisa
		currency: 'INR',
		receipt: `receipt_order_${orderId}`,
	};

	try {
		const order = await razorpay.orders.create(options);
		res.json({
			success: true,
			order,
			keyId: process.env.RAZORPAY_KEY_ID,
		});
	} catch (error) {
		console.error('Error creating Razorpay order:', error);
		res
			.status(500)
			.json({ success: false, message: 'Error creating Razorpay order' });
	}
});

// Route to verify payment
app.post('/verifyPayment', async (req, res) => {
	const { paymentData, orderId } = req.body;

	const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
		paymentData;

	const computed_signature = crypto
		.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
		.update(`${razorpay_order_id}|${razorpay_payment_id}`)
		.digest('hex');

	if (computed_signature === razorpay_signature) {
		try {
			// Update order payment status
			await orderData.findByIdAndUpdate(orderId, { paymentStatus: 'Paid' });
			res.json({ success: true });
		} catch (error) {
			console.error('Error updating payment status:', error);
			res
				.status(500)
				.json({ success: false, message: 'Error updating payment status' });
		}
	} else {
		res
			.status(400)
			.json({ success: false, message: 'Invalid payment signature' });
	}
});

app.get('/mybids', isLoggedInAsShipper, async (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/mybids.html'));
});

app.get('/payout', isLoggedInAsShipper, async (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/payoutpage.html'));
});

app.get('/api/shipments/in-transit', isLoggedInAsShipper, async (req, res) => {
	const shipperId = req.session.user.userId;

	try {
		const shipments = await orderData
			.find({
				acceptedShipperId: shipperId,
				status: 'In Transit',
			})
			.lean();
		console.log(shipments);
		res.json(shipments);
	} catch (error) {
		console.error('Error fetching in-transit shipments:', error);
		res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
});

app.get('/api/order/details', isLoggedInAsShipper, async (req, res) => {
	const { orderId } = req.query;

	if (!orderId) {
		return res
			.status(400)
			.json({ success: false, message: 'Order ID is required' });
	}

	try {
		const order = await orderData.findById({ _id: { $eq: orderId } }).lean();
		if (!order) {
			return res
				.status(404)
				.json({ success: false, message: 'Order not found' });
		}

		res.json({ success: true, order });
	} catch (error) {
		console.error('Error fetching order details:', error);
		res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
});

app.get(
	'/api/shipper/bankingDetails',
	isLoggedInAsShipper,
	async (req, res) => {
		const { shipperId } = req.query;

		if (!shipperId) {
			return res
				.status(400)
				.json({ success: false, message: 'Shipper ID is required' });
		}

		try {
			const bankingDetails = await ShipperBank.findOne({
				shipperId: { $eq: shipperId },
			}).lean();
			if (!bankingDetails) {
				return res
					.status(404)
					.json({ success: false, message: 'Banking details not found' });
			}

			res.json({ success: true, bankingDetails });
		} catch (error) {
			console.error('Error fetching banking details:', error);
			res
				.status(500)
				.json({ success: false, message: 'Internal Server Error' });
		}
	}
);

app.post('/api/payout/initiate', isLoggedInAsShipper, async (req, res) => {
	const { orderId } = req.body;
	const shipperId = req.session.user.userId;

	if (!orderId) {
		return res
			.status(400)
			.json({ success: false, message: 'Order ID is required' });
	}

	try {
		const order = await OrderData.findById(orderId);
		if (!order) {
			return res
				.status(404)
				.json({ success: false, message: 'Order not found' });
		}

		if (order.acceptedShipperId !== shipperId) {
			return res.status(403).json({ success: false, message: 'Unauthorized' });
		}

		if (order.paymentStatus === 'Paid') {
			return res.status(400).json({
				success: false,
				message: 'Payment already processed for this order.',
			});
		}

		// Fetch the shipper's banking details
		const bankingDetails = await ShipperBank.findOne({ shipperId });
		if (!bankingDetails) {
			return res
				.status(404)
				.json({ success: false, message: 'Banking details not found' });
		}

		// Initialize Razorpay Payouts
		const razorpayPayout = new Razorpay({
			key_id: process.env.RAZORPAY_KEY_ID,
			key_secret: process.env.RAZORPAY_KEY_SECRET,
		});

		let payoutOptions;
		if (bankingDetails.upiid) {
			// Prefer UPI payout
			payoutOptions = {
				account_number: bankingDetails.upiid, // Assuming UPI ID as account_number for demonstration
				amount: order.acceptedBidAmount * 100, // Amount in paise
				currency: 'INR',
				mode: 'upi',
			};
		} else {
			// Else, bank transfer
			payoutOptions = {
				account_number: bankingDetails.accountNumber,
				amount: order.acceptedBidAmount * 100, // Amount in paise
				currency: 'INR',
				mode: 'bank_transfer',
				ifsc: bankingDetails.ifscCode,
				name: bankingDetails.accountHolderName,
			};
		}

		try {
			const payout = await razorpayPayout.payouts.create(payoutOptions);

			// Update order payment status
			order.paymentStatus = 'Paid';
			await order.save();

			res.json({
				success: true,
				message: 'Payout initiated successfully.',
				payout,
			});
		} catch (payoutError) {
			console.error('Error initiating payout:', payoutError);
			res
				.status(500)
				.json({ success: false, message: 'Error initiating payout.' });
		}
	} catch (error) {
		console.error('Error initiating payout:', error);
		res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
});

// In index.js

app.get('/api/mybids', isLoggedInAsShipper, async (req, res) => {
	try {
		const shipperId = req.session.user.userId;

		// Find all orders where the shipper has placed a bid
		const orders = await orderData.find({ 'Bids.shipperId': shipperId }).lean();

		// Filter bids in each order to include only the bids by this shipper
		const ordersWithMyBids = orders.map((order) => {
			const myBids = order.Bids.filter((bid) => bid.shipperId === shipperId);
			return {
				...order,
				Bids: myBids,
			};
		});

		res.json({ success: true, orders: ordersWithMyBids });
	} catch (error) {
		console.error('Error fetching my bids:', error);
		res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
});

// Logout route
app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			return res.status(500).send('Internal Server Error');
		}
		res.redirect('/');
	});
});

// Centralized error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something went wrong!');
});

// Server initialization
app.listen(process.env.PORT, () => {
	console.log('Server is up and running on port ' + process.env.PORT);
});
