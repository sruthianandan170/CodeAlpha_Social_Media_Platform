const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const User = require("../models/user");
const upload=require("../middleware/upload");

// ================= REGISTER =================

// Register Page
router.get("/register", (req, res) => {
    res.render("register");
});

// Register User
router.post("/register",upload.single("profileImage"),async(req,res)=>{
    try {
        let image="public/images/default-avatar.png";

        if(req.file){

            image="/uploads/"+req.file.filename;

        }
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.send("Email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user=new User({

              name,

              email,

              password:hashedPassword,

              profileImage:image

        });

        await user.save();

        res.redirect("/login");

    } catch (err) {

        console.log(err);
        res.send("Registration Failed");

    }

});

// ================= LOGIN =================

// Login Page
router.get("/login", (req, res) => {
    res.render("login");
});

// Login User
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send("User Not Found");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("Incorrect Password");
        }

        req.session.user = user;

        res.redirect("/home");

    } catch (err) {

        console.log(err);
        res.send("Login Failed");

    }

});

// ================= LOGOUT =================

router.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            console.log(err);
        }

        res.redirect("/login");

    });

});

module.exports = router;