import { asynchandler } from "../utils/asynchandler.js"
import { chat } from "../models/schema.js"
import passport from '../middlewares/auth.js'
import { cloudinary } from "../utils/cloudinary.js"
import dotenv from 'dotenv'
dotenv.config()




const generate = async (userid) => {

    try {


        const user = await chat.findById(userid)
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()

        user.refreshtoken = refreshtoken
        await user.save({ validateBeforeSave: false })
        return { accesstoken, refreshtoken }

    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Something went wrong while generating token");

    }

}

const page = asynchandler(async (req, res) => {

    res.render("roompage.ejs")
})


const patient=asynchandler(async(req,res)=>{
    res.render("phome.ejs")
})

const doctor=asynchandler(async(req,res)=>{
    res.render("dhome.ejs")
})
const login_details = asynchandler(async (req, res) => {

    const { email } = req.body
    const doesuser = await chat.findOne({ email: email })
    const id = doesuser._id

    if (doesuser) {
        const { accesstoken, refreshtoken } = await generate(id);
        console.log("accesstoken:" + accesstoken)
        console.log("refreshtoken:" + refreshtoken)
        const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(200)
            .cookie("accesstoken", accesstoken)
            .cookie("refreshtoken", refreshtoken, options)
            .redirect('/chat?alert=Successfully Logged in!!')
    }
    else {
        res.redirect('/signup?alert=Please signup account not found!!')
    }
})


const signup_details = asynchandler(async (req, res) => {

    const { email, password } = req.body

    const output = await chat.findOne({ email: email })
    console.log(output)
    if (output) {
        console.log('already there')
        res.redirect('/Home?User already Present \n Please verify Your Email address')
    }

    const newuser = new chat({
        email: email,
        password: password
    })
    await newuser.save()
    res.redirect('/login?alert=SignUp was succesfull!\n please Login')



})


const welcome = asynchandler(async (req, res) => {
    res.render('welcome.ejs')

})
const signup = asynchandler(async (req, res) => {


    res.render('signup.ejs')
})

const login = asynchandler(async (req, res) => {

    res.render('login.ejs')
})


const username = asynchandler(async (req, res) => {

    const emailname = await req.user.email.split('@')[0]
    console.log("ended verification")
    res.json({ username: emailname })
})


const help = asynchandler(async (req, res) => {

    // const timestamp=Math.floor(Date.now()/1000)
    // const signature=cloudinary.utils.api_sign_request({timestamp},process.env.CLOUDINARY_API_SECRET)
    // console.log(signature,timestamp)--->signed cloudinary upload
    res.json({
        name: process.env.CLOUDINARY_CLOUD_NAME,
    })

})




   
const auth = passport.authenticate("google", { scope: ["email", "profile"] });

const callback = (req, res, next) => {
    passport.authenticate("google", async (err, user) => {
        if (err || !user) {
            console.log("❌ Authentication Failed:", err);
            return res.redirect("/auth/google/failure");
        }

        try {
            // ✅ Ensure user is fetched properly
            const doesuser = await chat.findOne({ email: user.emails[0].value });
            if (!doesuser) {
                console.log("❌ User Not Found in Database");
                return res.redirect('/signup?alert=Please signup account not found!!')
            }

        const id = doesuser._id;

            // ✅ Generate JWT Token
        const { accesstoken, refreshtoken } = await generate(id);

        console.log("accesstoken:" + accesstoken)
        console.log("refreshtoken:" + refreshtoken)
        const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(200)
            .cookie("accesstoken", accesstoken)
            .cookie("refreshtoken", refreshtoken, options)
            .redirect('/chat?alert=Successfully Logged in!!')
        } catch (error) {
            console.log("❌ Error in Callback:", error);
            res.redirect("/auth/google/");
        }
    })(req, res, next);
};

export { page,doctor,patient,auth,callback, login_details, help, signup_details, signup, login, welcome, username }