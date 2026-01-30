# 🛍️ FOREVER – Full-Stack MERN E-commerce Platform

A modern, scalable full-stack E-commerce web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js).
The platform supports secure authentication, product browsing, cart management, order placement, and multiple payment methods, along with a dedicated Admin Panel for product and order management.

🌐 Live Demo: https://updatedforever-frontend.netlify.app

🛠️ Admin Panel: https://forever-updatedadmin.netlify.app

## 🔧 Tech Stack
**Frontend"**

* React.js (Vite)
* Tailwind CSS
* React Router DOM
* Axios
* React Toastify
* Context API (Global State)

**Backend:**

* Node.js
* Express.js
* MongoDB (Mongoose ODM)
* JWT Authentication
* Bcrypt (Password Hashing)
* Stripe Payment Gateway
* Razorpay Payment Gateway
* Cloudinary & Multer (Image Uploads)


---


## Deployment & Tools

* Netlify (Frontend & Admin)
* Render / Railway (Backend)
* MongoDB Atlas
* GitHub
* Postman


---


## ✨ Key Features

* 👤 User Features
* 🔐 Secure JWT-based Authentication
* 🛒 Add to Cart & Remove from Cart
* 📦 Place Orders with Address Details
* 💳 Multiple Payment Options: Stripe, Razorpay, Cash on Delivery
* 📄 Order History & Order Status Tracking
* 📱 Fully Responsive UI (Mobile + Desktop)
* 🧑‍💼 Admin Features
* 🧾 Admin Authentication
* ➕ Add / Update / Delete Products
* 🖼️ Image Upload with Cloudinary
* 📦 Manage Orders & Order Status
* 📊 View All User Orders


---


## 🧠 Application Flow

* User signs up / logs in using JWT authentication
* Products are fetched dynamically from MongoDB
* User adds items to cart (size-based support)
* Checkout with delivery information
* Payment via Stripe / Razorpay or COD
* Order stored securely in database
* Admin manages products & orders from admin panel

## 🚀 Getting Started

```bash
git clone https://github.com/surazzzj/forever_fullStack.git
cd forever_fullStack

### Prerequisites

- Node.js
- MongoDB Atlas or local instance
- Stripe / Razorpay account (for payments)

### 📁 Folder Structure

├── frontend/        # User-facing React app
├── admin/           # Admin dashboard (React)
├── backend/         # Node.js + Express API
├── .env             # Environment variables
├── netlify.toml     # Netlify configuration
├── README.md

