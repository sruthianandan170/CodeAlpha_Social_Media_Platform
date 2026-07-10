const express=require("express");
const router=express.Router();
const multer=require("multer");
const path=require("path");
const User = require("../models/user");
const Post=require("../models/post");
const Comment=require("../models/comment");

const storage=multer.diskStorage({

destination:function(req,file,cb){

cb(null,"public/uploads");

},

filename:function(req,file,cb){

cb(null,Date.now()+path.extname(file.originalname));

}

});

const upload=multer({storage});

// Create Page

router.get("/create-post",(req,res)=>{

res.render("createPost");

});

// Save Post

router.post("/create-post",upload.single("image"),async(req,res)=>{

try{

const post=new Post({

user:req.session.user._id,

caption:req.body.caption,

image:req.file?"/uploads/"+req.file.filename:""

});

await post.save();

res.redirect("/my-posts");

}

catch(err){

console.log(err);

res.send("Post Creation Failed");

}

});

// Show Posts

router.get("/my-posts",async(req,res)=>{

const posts=await Post.find({

user:req.session.user._id

}).sort({

createdAt:-1

});

const comments=await Comment.find()

.populate("user");

res.render("myPosts",{

posts,

comments

});

});

router.get("/like/:id", async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        const userId = req.session.user._id.toString();

        const alreadyLiked = post.likes.some(
            like => like.toString() === userId
        );

        if (alreadyLiked) {

            post.likes.pull(userId);

        } else {

            post.likes.push(userId);

        }

        await post.save();

        res.redirect("/feed");

    } catch (err) {

        console.log(err);

        res.send("Like Error");

    }

});

router.get("/delete-post/:id",async(req,res)=>{

await Post.findByIdAndDelete(req.params.id);

await Comment.deleteMany({

post:req.params.id

});

res.redirect("/my-posts");

});

router.post("/comment/:id",async(req,res)=>{

const comment=new Comment({

post:req.params.id,

user:req.session.user._id,

text:req.body.text

});

await comment.save();

res.redirect("/my-posts");

});

router.get("/feed", async (req, res) => {

    try {

        const posts = await Post.find()
            .populate("user")
            .sort({ createdAt: -1 });

        res.render("feed", {

            posts,
            currentUser: req.session.user

        });

    } catch (err) {

        console.log(err);
        res.send("Feed Error");

    }

});
router.get("/follow/:id", async (req, res) => {

    const currentUser = await User.findById(req.session.user._id);

    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {

        return res.send("User not found");

    }

    if (currentUser._id.toString() === targetUser._id.toString()) {

        return res.redirect("/feed");

    }

    if (!currentUser.following.includes(targetUser._id)) {

        currentUser.following.push(targetUser._id);

        targetUser.followers.push(currentUser._id);

    }

    await currentUser.save();

    await targetUser.save();

    res.redirect("/feed");

});

router.get("/unfollow/:id", async (req, res) => {

    const currentUser = await User.findById(req.session.user._id);

    const targetUser = await User.findById(req.params.id);

    currentUser.following.pull(targetUser._id);

    targetUser.followers.pull(currentUser._id);

    await currentUser.save();

    await targetUser.save();

    res.redirect("/feed");

});

console.log("post.js routes loaded");

module.exports=router;