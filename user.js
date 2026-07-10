const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const User = require("../models/user");


// ===============================
// Multer Configuration
// ===============================

const storage = multer.diskStorage({

    destination: function(req, file, cb){

        cb(null, "public/uploads");

    },


    filename: function(req, file, cb){

        cb(null, Date.now() + path.extname(file.originalname));

    }

});


const upload = multer({

    storage: storage

});



// ===============================
// Profile Page
// ===============================

router.get("/profile", async(req,res)=>{

    try{

        const user = await User.findById(req.session.user._id);


        res.render("profile",{

            user

        });


    }
    catch(err){

        console.log(err);

        res.send("Profile Loading Failed");

    }

});




// ===============================
// Edit Profile Page
// ===============================

router.get("/edit-profile", async(req,res)=>{


    const user = await User.findById(req.session.user._id);


    res.render("editProfile",{

        user

    });


});




// ===============================
// Update Profile
// ===============================

router.post("/edit-profile", async (req, res) => {

    try {

        const user = await User.findById(req.session.user._id);

        user.name = req.body.name;
        user.bio = req.body.bio;

        // Profile image is not changed

        await user.save();

        // Update session
        req.session.user = user;

        res.redirect("/profile");

    } catch (err) {

        console.log(err);
        res.send("Profile Update Failed");

    }

});



// ===============================
// View Other Users
// ===============================

router.get("/users", async(req,res)=>{


try{


const users = await User.find();


res.render("users",{

users

});


}
catch(err){

console.log(err);

res.send("Users Loading Failed");

}


});



module.exports = router;