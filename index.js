require("dotenv").config();
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const ratelimit = require("express-rate-limit");
const session = require("express-session");
const app = express();
const LoginData = require("./models/LoginData");

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// Helper functions

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
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Password Reset",
    text: `Your OTP for password reset is ${otp}. It is valid for 1 hour.\n\nIf you did not request this, please ignore this email.\n\nRegards,\nTeam ShipIt`,
  };

  await transporter.sendMail(mailOptions);
}

// Middleware
app.use(limiter);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/home.html"));
});

app.get("/SignIn", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/customerlogin.html"));
});

app.get("/SignUp", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/signup.html"));
});

app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/forgot-password.html"));
});

app.get("/verify-otp", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/verify-password.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/aboutus.html"));
});

// Sign Up route
app.post("/SignUp", async (req, res, next) => {
  try {
    const { Firstname, Lastname, Email, DOB, Password, Verifypassword } =
      req.body;

    if (!passwordsMatch(Password, Verifypassword)) {
      return sendAlert(
        res,
        "Passwords do not match, please try again",
        "/SignUp"
      );
    }

    const logindata = await LoginData.create({
      firstname: Firstname,
      lastname: Lastname,
      dob: DOB,
      email: Email,
      password: await encryptPassword(Password),
    });

    req.session.user = logindata;
    res.redirect("/");
  } catch (error) {
    if (error.code === 11000) {
      sendAlert(res, "User already exists, use a different email", "/SignUp");
    } else {
      next(error);
    }
  }
});

// Sign In route
app.post("/SignIn", async (req, res, next) => {
  try {
    const { Email, Password } = req.body;
    const user = await findUserByEmail(Email);

    if (user) {
      const isMatch = await bcrypt.compare(Password, user.password);
      if (isMatch) {
        req.session.user = user;
        res.redirect("/");
      } else {
        sendAlert(res, "Invalid Credentials", "/SignIn");
      }
    } else {
      sendAlert(res, "User not found", "/SignIn");
    }
  } catch (error) {
    next(error);
  }
});

// Forgot Password route
app.post("/forgotpassword", async (req, res, next) => {
  try {
    const { Email } = req.body;
    const user = await findUserByEmail(Email);

    if (!user) {
      return sendAlert(res, "User not found", "/SignIn");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    await sendOtpEmail(Email, otp);
    sendAlert(res, "OTP sent to your email", "/verify-otp");
  } catch (error) {
    next(error);
  }
});

// Verify OTP and reset password route
app.post("/verify-otp", async (req, res, next) => {
  try {
    const { Email, OTP, NewPassword } = req.body;
    const user = await findUserByEmail(Email);

    if (!user) {
      return sendAlert(res, "User not found", "/SignIn");
    }

    if (!isOtpValid(user, OTP)) {
      return sendAlert(res, "Invalid or expired OTP", "/forgot-password");
    }

    user.password = await encryptPassword(NewPassword);
    user.otp = null;
    user.otpExpiry = null;
    user.lastResetDate = new Date();
    await user.save();

    sendAlert(res, "Password has been reset successfully", "/SignIn");
  } catch (error) {
    next(error);
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/");
  });
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Server initialization
app.listen(process.env.PORT, () => {
  console.log("Server is up and running on port " + process.env.PORT);
});
