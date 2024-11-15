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

const app = express();
const LoginData = require('./models/LoginData');
const ShipperData = require('./models/shipperData');
const orderData = require('./models/orderData');

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

// Rate limiter
const limiter = ratelimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
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
						userId: await generateUserId(),
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
async function generateUserId() {
	return Math.random().toString(36).substring(2, 12);
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

app.get('/shipperRegistration', (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/shipperregister.html'));
});

app.get('/dashboard', isLoggedInAsShipper, (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/shipperdashbord.html'));
});

app.get('/afterlogin', isLoggedInAsuser, (req, res) => {
	res.sendFile(path.join(__dirname, 'pages/afterloginhome.html'));
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
			userId: await generateUserId(),
			address: Address ? Address : 'N/A',
		});

		req.session.user = logindata;
		res.redirect('/afterlogin');
	} catch (error) {
		if (error.code === 11000) {
			sendAlert(res, 'User already exists, use a different email', '/SignUp');
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
		const interval = 2000; // Interval between checks in milliseconds
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
					if (!task) {
						console.error('No task found in response');
						return reject(new Error('No task found in API response'));
					}

					

					// Check if the task has a "completed_at" field
					if (task.completed_at) {
						const sourceOutput = task.result?.source_output;
						if (sourceOutput) {
							// Process the sourceOutput data
							// Check if validity dates are present
							if (sourceOutput.nt_validity_from && sourceOutput.nt_validity_to) {
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

app.post('/shipperRegistration', async (req, res) => {
	const {
		Fullname,
		Email,
		PhoneNumber,
		PersonalAddress,
		CompanyAddress,
		DrivingLicense,
		VehicleRegistration,
		Password,
		VerifyPassword,
	} = req.body;
	

	if (!passwordsMatch(Password, VerifyPassword)) {
		return sendAlert(
			res,
			'Passwords do not match, please try again',
			'/shipperRegistration'
		);
	}

	try {
		const requestId = await initiateDLVerification(
			DrivingLicense,
			'2005-12-28'
		);
	
		const verificationResult = await checkDLVerificationStatus(requestId);

		if (!verificationResult.valid) {
			return sendAlert(
				res,
				'Driving License is not valid for transport use',
				'/shipperRegistration'
			);
		}

		// Save shipper data if DL is valid and transport validity exists
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
			userId: await generateUserId(),
			DL_Address: verificationResult.DL_Address,
			state: verificationResult.state,
		});

		req.session.user = shipperData;
		res.redirect('/dashboard');
	} catch (error) {
		console.error(error);
		sendAlert(
			res,
			'An error occurred during registration',
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
				status: 'Pending',
			});

			res.redirect('/afterlogin');
		} catch (error) {
			console.error('Error submitting shipment:', error);
			next(error);
		}
	}
);

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
