import { asynchandler } from "../utils/asynchandler.js"
import dotenv from 'dotenv'
import { cloudinary } from "../utils/cloudinary.js"
import { Patient } from "../models/patient.js"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
dotenv.config()


const pat_signup = asynchandler(async (req, res) => {

    const { name, password, email, phone, gender, dob } = req.body;

    const user = await Patient.find({ email: email })

    if (user.length == 0) {

        const newuser = Patient.create({
            name: name,
            email: email,
            password: password,
            phone: phone,
            gender: gender,
            dob: dob
        })

        console.log("New User has been added to the patients list")
        res.status(201).json({ "message": "success" })
    }
    else {
        console.log(user)
        console.log("User already exists redirecting him to login page")

        res.status(202).json({ "message": "redirect to login" })
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
        res.status(202).json({ "message": "redirect to login" })
    }

})


const doc_login = asynchandler(async (req, res) => {
    res.status(400).json({ "message": "hello world" })
})
const doc_signup = asynchandler(async (req, res) => {
    res.status(400).json({ "message": "hello world" })
})


const sendingcode = async (user, res) => {

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = Date.now() +  60 * 1000;
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
        subject: "Password Reset Code",
        text: `Your verification code is ${code}. It will expire in 5 minutes.`,
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

  const { email,code } = req.body;
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

const pat_reset=asynchandler(async(req,res)=>{

const {email,newpassword}=req.body;

const user = await Patient.findOne({ email });

if(!user)
    res.status(203).json({"message":"user not found"})
console.log(newpassword)
user.password=newpassword

await user.save();
console.log("password updated")
res.status(201).json({"message":"success"})


}
)


export { pat_signup, pat_login,doc_signup,doc_login, pat_send, pat_verify,pat_reset }





