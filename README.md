# 🚚 ShipIt — Freight Bidding & Logistics Platform

ShipIt is a full-stack logistics marketplace that connects **customers** (retailers/individuals who need goods shipped) with **shippers** (verified truck/vehicle owners). Customers post shipment orders and shippers compete by placing live bids; the customer accepts the best bid, tracks delivery progress, and pays securely — all within the platform.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Data Models](#-data-models)
- [API Routes](#-api-routes)
- [How It Works](#-how-it-works)
- [Third-Party Integrations](#-third-party-integrations)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)

---

## ✨ Features

### For Customers
- **Sign Up / Sign In** — Email/password registration or Google OAuth 2.0
- **Forgot Password** — OTP-based password reset via email
- **Post Shipment Orders** — Specify package dimensions, weight, pickup/drop addresses, dates, and upload photos
- **Live Bidding View** — See all bids sorted by amount in real time
- **Accept a Bid** — Choose the best shipper and lock in the order
- **Track Delivery** — Monitor order status from "In Auction" → "In Transit" → "Delivered"
- **Make Payment** — Integrated Razorpay checkout for secure INR payments
- **Submit Reviews** — Rate shippers on overall quality, punctuality, professionalism, and communication

### For Shippers
- **Verified Registration** — Driving License (DL) and Vehicle Registration Certificate (RC) validated via the iDfy API before account creation
- **Dashboard** — View profile, vehicle details, ratings, and active shipments
- **Browse Orders** — Filter available shipment orders by package weight
- **Place & Update Bids** — Bid on any open order; update existing bids to stay competitive
- **Email Notifications** — Automatically notified when outbid or when a bid is accepted
- **My Bids** — Track all personal bids across all orders
- **Banking / Payout** — Save bank account or UPI details; initiate payouts via Razorpay after delivery

### Platform-wide
- **Rate Limiting** — 100 requests per IP per ~16 hours to prevent abuse
- **Session-based Auth** — Secure, HTTP-only sessions with 30-minute expiry
- **Email Notifications** — Automated transactional emails on signup, bid events, order updates, and contact form submissions
- **Contact Form** — Users can reach out via a contact page; submissions saved to DB and acknowledged by email

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Web Framework** | Express.js v4 |
| **Database** | MongoDB (via Mongoose ODM) |
| **Authentication** | express-session · bcrypt (password hashing) · Passport.js + Google OAuth 2.0 |
| **Email** | Nodemailer (Gmail SMTP) |
| **File Uploads** | Multer (disk storage) |
| **Payments** | Razorpay (checkout + payouts) |
| **Document Verification** | iDfy API (Driving License & Vehicle RC verification) |
| **Rate Limiting** | express-rate-limit |
| **Crypto** | Node.js built-in `crypto` (OTP generation, HMAC signature verification) |
| **Frontend** | Vanilla HTML, CSS, JavaScript (MPA — Multi-Page Application) |
| **Dev Server** | Nodemon |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│   HTML Pages  ←→  Vanilla JS (fetch/XHR)  ←→  CSS      │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP
┌────────────────────────────▼────────────────────────────┐
│                  Express.js Server (index.js)            │
│                                                          │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐ │
│  │  Middleware  │  │   Routes   │  │  Business Logic  │ │
│  │  - Sessions  │  │  - Auth    │  │  - DL/RC verify  │ │
│  │  - Rate Limit│  │  - Orders  │  │  - Bidding       │ │
│  │  - Passport  │  │  - Bids    │  │  - Email sending │ │
│  │  - Multer    │  │  - Payment │  │  - OTP handling  │ │
│  └──────────────┘  └────────────┘  └──────────────────┘ │
└────────────────────────────┬────────────────────────────┘
                             │ Mongoose ODM
┌────────────────────────────▼────────────────────────────┐
│                        MongoDB                          │
│  Collections: LoginData · shipperData · orderData       │
│               reviewData · ShipperBanking               │
└─────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼───────────────────┐
        ▼                    ▼                   ▼
   iDfy API           Razorpay API         Gmail SMTP
 (DL & RC verify)  (Payments & Payouts)  (Transactional Email)
```

The application is a classic **server-rendered MPA** (Multi-Page Application). The Node/Express backend handles all routing, auth, and business logic. Each page is a static HTML file served from the `pages/` directory, and the browser-side JavaScript in `public/js/` makes `fetch` calls to the Express API endpoints to load and display dynamic data.

---

## 📁 Project Structure

```
Project/
├── index.js                  # Main server — all routes & middleware
├── package.json
│
├── models/                   # Mongoose data schemas
│   ├── LoginData.js          # Customer user schema
│   ├── shipperData.js        # Shipper profile schema
│   ├── orderData.js          # Shipment order + bids schema
│   ├── reviewData.js         # Customer review schema
│   ├── shipperBanking.js     # Shipper bank/UPI details schema
│   └── contactModel.js       # Contact form submission schema
│
├── pages/                    # Server-rendered HTML pages
│   ├── home.html             # Public landing page (with sign-in form)
│   ├── signup.html           # Customer registration
│   ├── afterloginhome.html   # Customer dashboard (post-login)
│   ├── shipperregister.html  # Shipper registration with DL/RC fields
│   ├── shipperdashbord.html  # Shipper dashboard
│   ├── shipperfilter.html    # Browse & filter open orders (shipper)
│   ├── biddingarea.html      # Live bid view for a specific order
│   ├── mybids.html           # Shipper's personal bid history
│   ├── deliveryprogress.html # Order tracking (customer)
│   ├── deliverycomplete.html # Post-delivery review page
│   ├── payoutpage.html       # Shipper payout initiation
│   ├── about.html            # About page
│   ├── contact.html          # Contact form
│   ├── forgot-password.html  # Forgot password (request OTP)
│   └── verify-password.html  # OTP verification & password reset
│
└── public/                   # Static assets served to the browser
    ├── css/                  # Per-page stylesheets
    ├── js/                   # Per-page client-side JavaScript
    └── assets/               # Images and other static assets
```

---

## 🗄️ Data Models

### `LoginData` — Customer Users
| Field | Type | Notes |
|---|---|---|
| `firstname`, `lastname` | String | Required |
| `email` | String | Unique, required |
| `password` | String | bcrypt hashed |
| `oauthProvider`, `oauthId` | String | Populated for Google sign-ins |
| `userId` | String | 10-char hex ID (unique) |
| `otp`, `otpExpiry` | String / Date | For password reset flow |
| `address`, `dob`, `profilePic`, `phoneNumber` | Various | Optional profile fields |

### `shipperData` — Verified Shippers
| Field | Type | Notes |
|---|---|---|
| `fullname`, `email`, `phoneNumber` | String | Required |
| `drLicense`, `vehicleRegistration` | String | Verified via iDfy |
| `vehicleClass`, `vehicleModel`, `capacity` | String | Extracted from RC verification |
| `DL_Address`, `state` | String | Extracted from DL verification |
| `shipperRating`, `punctualityRating`, etc. | Number | Aggregated from reviews |
| `shipperDelivered` | Number | Completed delivery count |

### `orderData` — Shipment Orders
| Field | Type | Notes |
|---|---|---|
| `userId` | String | The customer who posted the order |
| `dimensions` | Object | `length`, `width`, `height`, `weight` (Numbers) |
| `fromAddress`, `toAddress` | Object | `houseNumber`, `colony`, `pinCode`, `city`, `state` |
| `pickupDate`, `deliveryDate` | Date | Required |
| `images` | [String] | File paths to uploaded package photos |
| `status` | String | `"In Auction"` → `"In Transit"` → `"Delivered"` |
| `Bids` | [Object] | Array of `{ shipperId, shipperName, amount, createdAt }` |
| `acceptedShipperId`, `acceptedBidAmount` | String / Number | Set when customer accepts a bid |
| `paymentStatus` | String | `"Pending"` or `"Paid"` |

### `reviewData` — Customer Reviews
| Field | Type |
|---|---|
| `orderId`, `userId`, `shipperId` | String |
| `overallRating`, `punctualityRating`, `professionalismRating`, `communicationRating` | Number |
| `review` | String |

### `ShipperBanking` — Payout Details
| Field | Type |
|---|---|
| `shipperId` | String |
| `accountHolderName`, `accountNumber`, `ifscCode`, `bankName` | String |
| `upiid` | String |

---

## 🔌 API Routes

### Public Routes
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Landing page |
| `GET` | `/SignUp` | Customer registration page |
| `POST` | `/SignUp` | Create customer account |
| `POST` | `/SignIn` | Customer login |
| `GET` | `/auth/google` | Initiate Google OAuth |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `GET` | `/about` | About page |
| `GET` | `/contact` | Contact page |
| `POST` | `/contact` | Submit contact form |
| `POST` | `/forgotpassword` | Request OTP for password reset |
| `POST` | `/verify-otp` | Verify OTP and reset password |
| `GET` | `/shipperRegistration` | Shipper registration page |
| `POST` | `/shipperRegistration` | Create & verify shipper account |
| `POST` | `/shipperSignIn` | Shipper login |
| `GET` | `/logout` | Destroy session and redirect |

### Customer Routes (Auth required: `type === 'user'`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/afterlogin` | Customer dashboard |
| `GET` | `/showOrders` | Fetch customer's own orders |
| `GET` | `/showUserDetails` | Fetch logged-in customer profile |
| `POST` | `/submit-shipment` | Create a new shipment order (with image upload) |
| `GET` | `/orderStatus` | Order tracking page |
| `GET` | `/completed` | Delivery complete / review page |
| `POST` | `/acceptBid` | Accept a shipper's bid |
| `POST` | `/submitReview` | Submit a post-delivery review |
| `POST` | `/createOrder` | Create Razorpay payment order |
| `POST` | `/verifyPayment` | Verify Razorpay payment signature |

### Shipper Routes (Auth required: `type === 'shipper'`)
| Method | Path | Description |
|---|---|---|
| `GET` | `/dashboard` | Shipper dashboard |
| `GET` | `/showShipperDetails` | Fetch logged-in shipper profile |
| `GET` | `/selectOrder` | Browse available orders (filter page) |
| `GET` | `/filterOrders` | Filter orders by package weight |
| `GET` | `/orderBids` | Bidding area for a specific order |
| `POST` | `/placeBid` | Place or update a bid on an order |
| `GET` | `/mybids` | My bids page |
| `GET` | `/api/mybids` | Fetch all orders where shipper placed bids |
| `GET` | `/api/shipments/in-transit` | Fetch in-transit shipments for the shipper |
| `GET` | `/payout` | Payout page |
| `POST` | `/saveBanking` | Save bank/UPI payout details |
| `GET` | `/api/shipper/bankingDetails` | Fetch shipper's saved banking details |
| `POST` | `/api/payout/initiate` | Initiate payout to shipper via Razorpay |
| `GET` | `/getShipperReviews` | Fetch all reviews for the logged-in shipper |

---

## 🔄 How It Works

### 1. Customer Signup & Login
- Customers register with name, email, DOB, address, and password. Passwords are hashed with **bcrypt** (10 salt rounds) before storage.
- Alternatively, customers can sign in with **Google OAuth 2.0**. New Google users are auto-created in the database.
- A welcome email is sent via **Nodemailer** on successful registration.
- Sessions are maintained using **express-session** with a 30-minute cookie.

### 2. Shipper Registration with Document Verification
- Shippers provide their Driving License number, Vehicle RC number, date of birth, and other details.
- The server calls the **iDfy API** to asynchronously verify both documents:
  - **DL Verification**: Confirms the license is valid for transport use (NT category) and within validity dates.
  - **RC Verification**: Confirms vehicle fitness has not expired and extracts `vehicle_class`, `maker_model`, gross weight, and unladen weight.
- Vehicle **carrying capacity** is computed as `avg_gross_vehicle_weight − unladen_weight` and stored automatically.
- Only after both verifications pass is the shipper account created.

### 3. Posting a Shipment Order (Customer)
- The customer fills in package dimensions, weight, pickup/drop addresses, dates, item description, and can upload multiple package photos.
- Images are stored on disk via **Multer** and file paths are saved in the order document.
- The order is created with `status: "In Auction"` and the customer receives a confirmation email.

### 4. Bidding System (Shipper)
- Shippers browse open orders and can filter by max package weight.
- Clicking an order opens the **bidding area**, where bids are displayed sorted by amount (lowest first).
- A shipper can place a new bid or update their existing bid on any order.
- When a shipper underbids all others, **outbid emails** are sent to all affected shippers.
- Every new bid also triggers an **email notification** to the customer.

### 5. Accepting a Bid & Payment (Customer)
- The customer views all bids on their order, sorted from lowest to highest, and accepts the best one.
- Accepting a bid sets `order.status = "In Transit"`, stores `acceptedShipperId` and `acceptedBidAmount`, and sends an acceptance email to the winning shipper.
- The customer is redirected to a **Razorpay checkout** to pay the accepted bid amount. Payment signature is verified server-side using **HMAC-SHA256** before marking the order as `paymentStatus: "Paid"`.

### 6. Delivery & Review
- The customer can track their order's progress on the delivery progress page.
- Once delivered, the customer is prompted to submit a multi-dimensional review (overall, punctuality, professionalism, communication).
- The review is stored and a notification email is sent to the shipper.

### 7. Shipper Payout
- After a delivery is confirmed and paid, the shipper navigates to the payout page, saves their bank account or UPI details, and initiates a payout.
- The server uses **Razorpay Payouts API** to transfer the funds — preferring UPI if available, otherwise doing a bank transfer.

### 8. Password Reset (OTP Flow)
- User requests a reset → server generates a 6-digit OTP, stores it with a 1-hour expiry, and emails it.
- User enters the OTP + new password → server validates OTP freshness and updates the hashed password.

---

## 🔗 Third-Party Integrations

| Service | Purpose |
|---|---|
| **Google OAuth 2.0** (`passport-google-oauth20`) | Social login for customers |
| **iDfy API** (`eve.idfy.com`) | Real-time Driving License & Vehicle RC verification for India |
| **Razorpay** | Payment gateway for customer checkout & shipper payouts |
| **Gmail SMTP via Nodemailer** | Transactional emails (welcome, OTP, bid events, reviews) |

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following keys:

```env
# Server
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname

# Session
SESSION_SECRET=your_session_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (Gmail SMTP)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# iDfy Document Verification
IDFY_ACCOUNT_ID=your_idfy_account_id
IDFY_API_KEY=your_idfy_api_key
DRIVING_LICENSE_TASK_ID=your_dl_task_id
DRIVING_LICENSE_GROUP_ID=your_dl_group_id
VEHICLE_TASK_ID=your_vehicle_task_id
VEHICLE_GROUP_ID=your_vehicle_group_id

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm**
- A running **MongoDB** instance (local or Atlas)
- Accounts/API keys for Google OAuth, iDfy, Razorpay, and a Gmail account

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd Project

# 2. Install dependencies
npm install

# 3. Create and configure .env file (see above)
cp .env.example .env

# 4. Create the uploads directory for image storage
mkdir uploads

# 5. Start the development server (with auto-reload via nodemon)
npm start
```

The server will start on the port defined in your `.env` (default: `5000`).
Open http://localhost:5000 in your browser.

---

## 👤 Author

**Rohit Kumar**

---

> **Note:** This project is built for educational/academic purposes. Ensure all API keys and secrets are kept private and never committed to version control.
