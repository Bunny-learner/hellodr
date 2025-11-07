import { asynchandler } from "../utils/asynchandler.js"
import dotenv from 'dotenv'
import { cloudinary } from "../utils/cloudinary.js"
import { Patient } from "../models/patient.js"
import { Doctor } from "../models/doctor.js"
import nodemailer from "nodemailer"
import { TimeSlot } from "../models/timeslot.js"
import {Review} from "../models/review.js"
import bcrypt from "bcrypt"
dotenv.config({ quiet: true })
import { generate } from "./generate_tokens.js"


// const getCookieOptions = (maxAge) => ({
//     httpOnly: true,
//     maxAge,
//     secure: false,
//     sameSite: "none", // <-- This is correct
//     path: "/"

// });

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

        // console.log("New User has been added to the patients list")
        const { accesstoken, refreshtoken } = await generate(newuser._id, "patient")
        console.log(accesstoken, refreshtoken)
        // res.cookie("refreshtoken", refreshtoken, getCookieOptions(15 * 24 * 60 * 60 * 1000));
        // res.cookie("accesstoken", accesstoken, getCookieOptions(60 * 60 * 1000));
        res.cookie("refreshtoken", refreshtoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 15 * 24 * 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
            .cookie("accesstoken", accesstoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
        res.status(202).json({ "message": "success" })
    }
    else {
        // console.log(user)
        // console.log("User already exists redirecting him to login page")
        res.status(201).json({"message":"success"})
    }
})

const pat_login = asynchandler(async (req, res) => {

    let { password, email } = req.body;
    email=email.toLowerCase();

    console.log(password,email)

    const user = await Patient.findOne({ email: email })
    console.log(user)
    
    if (!user)
        res.status(201).json({ "message": " Redirect to signup " })

    const check = await user.isPasswordCorrect(password)

    if (!check)
        res.status(201).json({ "message": "password incorrect " })
    else {
        console.log("User exists redirecting him to Home page")
        const { accesstoken, refreshtoken } = await generate(user._id, "patient")
        res.status(202)
            .cookie("refreshtoken", refreshtoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 15 * 24 * 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
            .cookie("accesstoken", accesstoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
            .json({ "success": true,user:req.user});

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
            <a href="http://localhost:5173/patient/reset" 
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
    // console.log(newpassword)
    user.password = newpassword

    await user.save();
    // console.log("password updated")
    res.status(201).json({ "message": "success" })


}
)

const pat_back = asynchandler(async (req, res) => {


    const { displayName, emails, photos } = req.user
    const who = req.query.state

    // console.log(req.user, emails[0]["value"], who)

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
            // console.log("New User has been added to the patients list")
            const { accesstoken, refreshtoken } = await generate(newuser._id, "patient")
           res.cookie("refreshtoken", refreshtoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 15 * 24 * 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
            .cookie("accesstoken", accesstoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
            res.status(202).redirect("http://localhost:5173/patient/home?alert=Signup was Successful")

        }
        else res.redirect("http://localhost:5173/patient/signup?alert= This Mail is already registered please login" );
    }
    else {

        if (!user) {
            return res.status(201).json({ success: true, "message": "This Mail has not been Registered Please SignUp" });
        }

        const { accesstoken, refreshtoken } = await generate(user._id, "patient")
          res.status(202)
            .cookie("refreshtoken", refreshtoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 15 * 24 * 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
            .cookie("accesstoken", accesstoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
        res.redirect("http://localhost:5173/patient/home?alert=Login was Successful");
    }







})

const face_back = asynchandler(async (req, res) => {


    const { displayName, emails, photos } = req.user
    const who = req.query.state

    // console.log(req.user, emails[0]["value"], who)

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
            // console.log("New User has been added to the patients list")
            const { accesstoken, refreshtoken } = await generate(newuser._id, "patient")
           res.cookie("refreshtoken", refreshtoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 15 * 24 * 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
            .cookie("accesstoken", accesstoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
            res.status(202).json({ "message": "success" })
        }
        else res.status(201).json({ "message": "success" })
    }
    else {

        if (!user) {
            return res.status(203).json({ "message": "success" })
        }

        const { accesstoken, refreshtoken } = await generate(user._id, "patient")
        res.cookie("refreshtoken", refreshtoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 15 * 24 * 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
            .cookie("accesstoken", accesstoken, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                maxAge: 60 * 60 * 1000,
                sameSite: IS_PRODUCTION ? "None" : "Lax"
            })
        res.status(202).json({ "message": "success" })
    }







})



const cloudcred = asynchandler(async (req, res) => {
    res.json({ "cloudname": process.env.CLOUDINARY_CLOUD_NAME })
})


const uploadimg = asynchandler(async (req, res) => {

    const { url } = req.body;

    const user = await Patient.findOne({ _id: req.user });
    if (!user)
        res.status(201).json({ "message": "failed" })
    user.profilePic = url;
    await user.save();
    console.log("Image url has been saved to user db")
    res.status(200).json({ "message": "success" })

})


const allslots = asynchandler(async (req, res) => {
    const {doctorid}= req.headers
    const timeslots = await TimeSlot.find({ doctor: doctorid })
    res.status(200).json({"message":"Time slots fetched successfully", timeslots})
})


const profile = asynchandler(async (req, res) => {


    const user = await Patient.findOne({ _id: req.user });
    if (!user)
        res.status(201).json({ "message": "failed" })
    console.log("User profile details are send to the frontend")
    console.log(user)
    res.status(200).json({ "message": "success", "profile": user })

})



const getdoctors = asynchandler(async (req, res) => {


    // const topdocs = await Doctor.find({ $and:[ {rating: { $gte: 4.0 }},{experience: { $gt: 8 }} ]});
    const docs = await Doctor.find();
    if (!docs)
        res.status(201).json({ "message": "failed" })
    console.log("doctors are send to the frontend")
    res.status(200).json({ "message": "success", "doctors": docs })

})


const updateprofile = asynchandler(async (req, res) => {



    const { name, address, gender, phone,dob,location,allergys,bloodGroup } = req.body;
    console.log("Profile details are updated succesfully")
    const user = await Patient.findOne({ _id: req.user });
    if (!user)
        res.status(201).json({ "message": "failed" })
    user.name = name
    user.gender = gender
    user.phone = phone
    user.address = address
    user.dob = dob
    user.location = location
    user.allergys = allergys
    user.bloodGroup = bloodGroup
    await user.save();
    res.status(200).json({ "message": "success" })
})



const logout = asynchandler(async (req, res) => {

    await Patient.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshtoken: 1,
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .clearCookie("accesstoken", options)
        .clearCookie("refreshtoken", options)
        .json({ "message": "success" })

})

const filterdoctors = asynchandler(async (req, res) => {
    try {
        const filters = req.body.filters || {};
        const {
            languages = [],
            fees = [],
            ratings = [],
            experiences = [],
            specialities = [],
            availability = [],
            consultation = [],
            gender = [],
            sortBy = ""
        } = filters;




        const andConditions = [];


        console.log(filters)

        if (languages.length > 0) {
            andConditions.push({ languages: { $in: languages } });
        }


        if (specialities.length > 0) {
            andConditions.push({ speciality: { $in: specialities } });
        }


        if (fees.length > 0) {
            const feeConditions = [];
            for (const feeRange of fees) {
                if (feeRange.includes("-")) {
                    const [min, max] = feeRange.split("-").map(Number);
                    feeConditions.push({ fee: { $gte: min, $lte: max } });
                } else if (feeRange === "<500") feeConditions.push({ fee: { $lt: 500 } });
                else if (feeRange === "500-1000") feeConditions.push({ fee: { $gte: 500, $lte: 1000 } });
                else if (feeRange === ">1000") feeConditions.push({ fee: { $gt: 1000 } });
            }
            if (feeConditions.length > 0) andConditions.push({ $or: feeConditions });
        }


        if (ratings.length > 0) {
            const minRating = Math.min(...ratings.map(r => parseFloat(r.replace(/[^\d.]/g, ""))));
            andConditions.push({ rating: { $gte: minRating } });
        }


        if (experiences.length > 0) {
            const minExp = Math.min(
                ...experiences.map(exp => parseInt(exp.replace(/\D/g, "")) || 0)
            );
            andConditions.push({ experience: { $gte: minExp } });
        }


        if (availability.length > 0) {
            andConditions.push({ availability: { $in: availability } });
        }


        if (consultation.length > 0) {
            andConditions.push({ consultation: { $in: consultation } });
        }


        if (gender.length > 0) {
            andConditions.push({ gender: { $in: gender } });
        }


        const query = andConditions.length > 0 ? { $and: andConditions } : {};


        let sortOption = {};
        switch (sortBy.toLowerCase()) {
            case "fee":
                sortOption = { fee: 1 }; // ascending
                break;
            case "experience":
                sortOption = { experience: -1 }; // descending
                break;
            case "rating":
                sortOption = { rating: -1 }; // descending
                break;
            default:
                sortOption = {};
        }


        const doctors = await Doctor.find(query).sort(sortOption);

        res.status(200).json({ doctors });
    } catch (err) {
        console.error(" Filter Doctors Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


const addreview = asynchandler(async (req, res) => {
  try {
    const { doctor, appointment,patient, rating, review } = req.body;

    if (!doctor || !patient || !rating) {
      return res.status(400).json({ message: 'Doctor ID, Patient ID, and rating are required' });
    }

    const newdoc = new Review({
     appointment,
      doctor,
      patient,
      rating,
      review
    });

    await newdoc.save();
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});


const getreviews = asynchandler(async (req, res) => {
  try {
    const { id} = req.params;
    const doctor=id
    
    if (!doctor) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    const reviews = await Review.find({ doctor })
      .populate('patient', 'name email profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});





export { profile, logout,addreview,getreviews, allslots,filterdoctors, uploadimg, updateprofile, getdoctors, pat_signup, cloudcred, pat_back, face_back, pat_login, pat_send, pat_verify, pat_reset }





