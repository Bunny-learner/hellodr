import { asynchandler } from "../utils/asynchandler.js"
import dotenv from 'dotenv'
import { cloudinary } from "../utils/cloudinary.js"
import { Patient } from "../models/patient.js"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
dotenv.config({ quiet: true })
import { generate } from "./generate_tokens.js"

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const pat_signup = asynchandler(async (req, res) => {

    const { name, password, email, phone, gender, dob } = req.body;

    const user = await Patient.find({ email: email })

    if (user.length == 0) {

        const newuser = await Patient.create({
            name: name,
            email: email,
            password: password,
            phone: phone,
            gender: gender,
            dob: dob
        })

        console.log("New User has been added to the patients list")
        const { accesstoken, refreshtoken } = await generate(newuser._id, "patient")
        console.log(accesstoken,refreshtoken)
        res.cookie("refreshtoken", refreshtoken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            maxAge: 15 * 24 * 60 * 60 * 1000,
            sameSite: IS_PRODUCTION ? "None" : "Lax"

        })
        res.cookie("accesstoken", accesstoken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            maxAge: 60 * 60 * 1000,
            sameSite: IS_PRODUCTION ? "None" : "Lax"
        })
        res.status(202).json({"message":"success"})
    }
    else {
        console.log(user)
        console.log("User already exists redirecting him to login page")
        res.status(201).json({"message":"success"})
    }
})

const pat_login = asynchandler(async (req, res) => {

    const { password, email } = req.body;

    const user = await Patient.findOne({ email: email })

    if (!user)
        res.status(201).json({ "message": " Redirect to signup " })

    const check = await user.isPasswordCorrect(password)

    if (!check)
        res.status(201).json({ "message": " Redirect to signup " })
    else {
        console.log("User exists redirecting him to Home page")

        const { accesstoken, refreshtoken } = await generate(user._id, "patient")
        res.cookie("refreshtoken", refreshtoken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            maxAge: 15 * 24 * 60 * 60 * 1000,
            sameSite: IS_PRODUCTION ? "None" : "Lax"

        })
        res.cookie("accesstoken", accesstoken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            maxAge: 60 * 60 * 1000,
            sameSite: IS_PRODUCTION ? "None" : "Lax"
        })
        res.status(202).json({ "message": "Redirect to Home" })
    }

})

const sendingcode = async (user, res) => {

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "HelloDr Password Reset Request",
        html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #007c7c; padding: 20px; text-align: center; color: white;">
            <img src="https://res.cloudinary.com/decmqqc9n/image/upload/v1760422169/Screenshot_2025-10-14_113645_zmypcv.png" alt="HelloDr Logo" style="width: 120px; margin-bottom: 10px;">
            <h1 style="margin: 0; font-size: 24px;">HelloDr</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px; text-align: center;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #555; font-size: 16px;">
                We received a request to reset the password for your HelloDr account.
            </p>
            
            <!-- Verification Code -->
            <p style="font-size: 20px; font-weight: bold; color: #007c7c; margin: 20px 0;">
                ${code}
            </p>

            <p style="color: #555; font-size: 16px;">
                This code is valid for <strong>1 minute</strong>. Please do not share it with anyone.
            </p>

            <!-- Reset Button -->
            <a href="http://localhost:8000/patient/reset" 
               style="display: inline-block; margin-top: 20px; padding: 12px 25px; background-color: #007c7c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Reset Password
            </a>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #999;">
            <p>If you did not request a password reset, please ignore this email or contact support.</p>
            <p>HelloDr &copy; 2025. All rights reserved.</p>
        </div>

    </div>
    `,
    });


    res.status(201).json({ "message": "valid email" })
}

const pat_send = asynchandler(async (req, res) => {

    const { email } = req.body;
    const user = await Patient.findOne({ email: email })
    if (!user)
        res.status(202).json({ "message": "invalid email" })
    else {
        sendingcode(user, res)
    }
})

const pat_verify = asynchandler(async (req, res) => {

    const { email, code } = req.body;
    const user = await Patient.findOne({ email });

    if (!user || !user.resetCode || !user.resetCodeExpires)
        return res.status(202).json({ message: "No reset request found" });

    if (user.resetCodeExpires < Date.now())
        return res.status(202).json({ message: "Code expired" });

    if (user.resetCode !== code)
        return res.status(202).json({ message: "Invalid code" });

    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.status(201).json({ message: "verified" });
});

const pat_reset = asynchandler(async (req, res) => {

    const { email, newpassword } = req.body;

    const user = await Patient.findOne({ email });

    if (!user)
        res.status(203).json({ "message": "user not found" })
    console.log(newpassword)
    user.password = newpassword

    await user.save();
    console.log("password updated")
    res.status(201).json({ "message": "success" })


}
)

const pat_back = asynchandler(async (req, res) => {


    const { displayName, emails, photos } = req.user
    const who = req.query.state

    console.log(req.user, emails[0]["value"], who)

    const user = await Patient.findOne({ email: emails[0]["value"] })

    if (who === "signup") {
        if (!user) {
            const pass = Math.floor(10000000 + Math.random() * 900000).toString();

            const newuser = await Patient.create({
                name: displayName,
                email: emails[0].value,
                password: pass,
                profilePic: photos[0].value
            })
            console.log("New User has been added to the patients list")
            const { accesstoken, refreshtoken } = await generate(newuser._id, "patient")
            res.cookie("refreshtoken", refreshtoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 15 * 24 * 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"

            })
            res.cookie("accesstoken", accesstoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
            res.redirect('https://hello-dr.onrender.com/patient/home?alert=Login was Successful')
        }
        else res.redirect('http://localhost:5173/patient/login?alert= This Mail Has already been Registered, Please Login')
    }
    else {

        if (!user) {
            return res.redirect('http://localhost:5173/patient/signup?alert= This Mail has not been Registered Please SignUp');
        }

        const { accesstoken, refreshtoken } = await generate(user._id, "patient")
        res.cookie("refreshtoken", refreshtoken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            maxAge: 15 * 24 * 60 * 60 * 1000,
            sameSite: IS_PRODUCTION ? "None" : "Lax"

        })
        res.cookie("accesstoken", accesstoken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            maxAge: 60 * 60 * 1000,
            sameSite: IS_PRODUCTION ? "None" : "Lax"
        })
        res.redirect('https://hello-dr.onrender.com/patient/home?alert=Login was Successful')
    }







})

const face_back = asynchandler(async (req, res) => {


    const { displayName, emails, photos } = req.user
    const who = req.query.state

    console.log(req.user, emails[0]["value"], who)

    const user = await Patient.findOne({ email: emails[0]["value"] })

    if (who === "signup") {
        if (!user) {
            const pass = Math.floor(10000000 + Math.random() * 900000).toString();

            const newuser = await Patient.create({
                name: displayName,
                email: emails[0].value,
                password: pass,
                profilePic: photos[0].value
            })
            console.log("New User has been added to the patients list")
            const { accesstoken, refreshtoken } = await generate(newuser._id, "patient")
            res.cookie("refreshtoken", refreshtoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 15 * 24 * 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"

            })
            res.cookie("accesstoken", accesstoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
            res.redirect('https://hello-dr.onrender.com/patient/home?alert=Login was Successful')
        }
        else res.redirect('https://hello-dr.onrender.com/patient/login')
    }
    else {

        if (!user) {
            return res.redirect('https://hello-dr.onrender.com/patient/signup');
        }

        const { accesstoken, refreshtoken } = await generate(user._id, "patient")
        res.cookie("refreshtoken", refreshtoken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            maxAge: 15 * 24 * 60 * 60 * 1000,
            sameSite: IS_PRODUCTION ? "None" : "Lax"

        })
        res.cookie("accesstoken", accesstoken, {
            httpOnly: true,
            secure: IS_PRODUCTION,
            maxAge: 60 * 60 * 1000,
            sameSite: IS_PRODUCTION ? "None" : "Lax"
        })
        res.redirect('https://hello-dr.onrender.com/patient/home?alert=Login was Successful')
    }







})








export { pat_signup, pat_back, face_back, pat_login, pat_send, pat_verify, pat_reset }





