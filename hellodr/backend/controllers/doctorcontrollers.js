import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import dotenv from 'dotenv'
import { cloudinary } from "../utils/cloudinary.js"
import { Patient } from "../models/patient.js"
import { Doctor } from "../models/doctor.js"
import { TimeSlot } from "../models/timeslot.js"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
dotenv.config({ quiet: true })
import {generate} from "./generate_tokens.js"




const doc_login = asynchandler(async (req, res) => {
    res.status(400).json({ "message": "hello world" })
})
const doc_signup = asynchandler(async (req, res) => {
    res.status(400).json({ "message": "hello world" })
})

const add_timeslot = asynchandler(async (req, res) => {
    const { Day, StartTime, EndTime,fee } = req.body
    const doctorID = req.user.id
    if (!Day || !StartTime || !EndTime || !fee) {
        res.status(400)
        throw new ApiError("All fields are required")
    }
    const timeslot = new TimeSlot({
        doctor: doctorID,
        Day,
        StartTime,
        EndTime,
        fee
    })
    await timeslot.save()
    res.status(201).json(new ApiResponse("Time slot added successfully", timeslot))
})

const get_timeslots = asynchandler(async (req, res) => {
    const doctorID = req.user.id
    const timeslots = await TimeSlot.find({ doctor: doctorID })
    res.status(200).json(new ApiResponse("Time slots fetched successfully", timeslots))
})



export { doc_signup,doc_login, add_timeslot, get_timeslots }





