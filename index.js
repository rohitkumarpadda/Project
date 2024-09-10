require("dotenv").config();
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const ratelimit = require("express-rate-limit");
const app = express();
const LoginData = require("./models/LoginData");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

function encryptpassword(password) {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

app.post("/SignUp", async (req, res) => {
  console.log("Sign Up route");
  try {
    const { Firstname, Lastname, Email, DOB, Password, Verifypassword } =
      req.body;
    if (Password !== Verifypassword) {
      return res.send(`
        <script>
          alert('Passwords do not match, please try again');
          window.location.href = '/SignUp';
        </script>
      `);
    }

    const logindata = await LoginData.create({
      firstname: Firstname,
      lastname: Lastname,
      dob: DOB,
      email: Email,
      password: encryptpassword(Password),
    });

    res.redirect("/");
  } catch (error) {
    if (error.code === 11000) {
      res.send(`
        <script>
          alert('User already exists, Use a different email');
          window.location.href = '/SignUp';
        </script>
      `);
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
});

app.post("/SignIn", async (req, res) => {
  console.log("Sign In route");
  try {
    const { Email, Password } = req.body;
    const user = await LoginData.findOne({ email: { $eq: Email } });
    if (user) {
      const isMatch = await bcrypt.compare(Password, user.password);
      if (isMatch) {
        res.redirect("/");
      } else {
        res.send(`
          <script>
            alert('Invalid Credentials');
            window.location.href = '/SignIn';
          </script>
        `);
      }
    } else {
      res.send(`
        <script>
          alert('User not found');
          window.location.href = '/SignIn';
        </script>
      `);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/forgotpassword", async (req, res) => {
  const { Email } = req.body;
  try {
    const user = await LoginData.findOne({ email: { $eq: Email } });
    if (!user) {
      return res.send(`
        <script>
          alert('User not found');
          window.location.href = '/SignIn';
        </script>
      `);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Email,
      subject: "Your OTP for Password Reset",
      text: `Your OTP for password reset is ${otp}. It is valid for 1 hour. \n\nIf you did not request this, please ignore this email.\n\nRegards,\nTeam ShipIt`,
    };

    await transporter.sendMail(mailOptions);

    res.send(`
      <script>
        alert('OTP sent to your email');
        window.location.href = '/verify-otp';
      </script>
    `);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/verify-otp", async (req, res) => {
  const { Email, OTP, NewPassword } = req.body;
  try {
    const user = await LoginData.findOne({ email: { $eq: Email } });
    if (!user) {
      return res.send(`
        <script>
          alert('User not found');
          window.location.href = '/SignIn';
        </script>
      `);
    }

    if (user.otp !== OTP || Date.now() > user.otpExpiry) {
      return res.send(`
        <script>
          alert('Invalid or expired OTP');
          window.location.href = '/forgot-password';
        </script>
      `);
    }

    const encryptedPassword = encryptpassword(NewPassword);

    user.password = encryptedPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.lastResetDate = new Date();
    await user.save();

    res.send(`
      <script>
        alert('Password has been reset successfully');
        window.location.href = '/SignIn';
      </script>
    `);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server is up and running on port " + process.env.PORT);
});
