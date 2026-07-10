// Import Packages
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const checkAuth = require("./middleware/auth");

// Initialize Express
const app = express();

// =======================
// Middleware
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static Folder
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =======================
// Session
// =======================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "codealpha123",
    resave: false,
    saveUninitialized: false,
  })
);

// =======================
// MongoDB Connection
// =======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error");
    console.log(err);
  });

// =======================
// Routes
// =======================
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");

console.log("auth.js loaded");
console.log("post.js loaded");
console.log("user.js loaded");

app.use("/", authRoutes);
app.use("/", postRoutes);
app.use("/", userRoutes); // <-- profile, edit-profile, users all handled here now

// =======================
// Home Page
// =======================
app.get("/", (req, res) => {
  res.send("Welcome to CodeAlpha Social Media Platform");
});

// Test Route
app.get("/test", (req, res) => {
  res.json({
    message: "Server is Working Successfully",
  });
});

app.get("/home", checkAuth, async (req, res) => {
  const User = require("./models/user");
  const user = await User.findById(req.session.user._id);
  res.render("home", { user });
});

// ❌ REMOVED duplicate /profile route — handled in user.js
// ❌ REMOVED duplicate /edit-profile route — handled in user.js

// 404 Page
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("==================================");
  console.log(`🚀 Server Running Successfully`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log("==================================");
});