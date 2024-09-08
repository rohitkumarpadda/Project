require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const LoginData = require("./models/LoginData");
const ratelimit = require("express-rate-limit");

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

// Use express.urlencoded to parse URL-encoded bodies
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

function encryptpassword(password) {
  const bcrypt = require("bcrypt");
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

app.post("/SignUp", async (req, res) => {
  console.log("Sign Up route");
  try {
    const { Firstname, Lastname, Email, DOB, Password } = req.body;
    console.log(Firstname, Lastname, Email, DOB, Password);
    // Validate request body
    if (!Firstname || !Lastname || !Email || !DOB || !Password) {
      return res.status(400).send("All fields are required");
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
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/SignIn", async (req, res) => {
  console.log("Sign In route");
  console.log(req.body);
  try {
    const { Email, Password } = req.body;
    const user = await LoginData.findOne({ email: Email });
    if (user) {
      const bcrypt = require("bcrypt");
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

app.get("/RetailLogin", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/retailerlogin.html"));
});

app.listen(process.env.PORT, () => {
  console.log("Server is up and running");
});
