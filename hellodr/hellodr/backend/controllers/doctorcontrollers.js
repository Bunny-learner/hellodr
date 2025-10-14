import { asynchandler } from "../utils/asynchandler.js"
import dotenv from 'dotenv'
import { cloudinary } from "../utils/cloudinary.js"
import { Patient } from "../models/patient.js"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
dotenv.config()
import {generate} from "./generate_tokens.js"




const doc_login = asynchandler(async (req, res) => {
    res.status(400).json({ "message": "hello world" })
})
const doc_signup = asynchandler(async (req, res) => {
    res.status(400).json({ "message": "hello world" })
})


export { doc_signup,doc_login}





