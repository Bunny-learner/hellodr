import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import dotenv from 'dotenv'
import { cloudinary } from "../utils/cloudinary.js"
import { Patient } from "../models/patient.js"
import { Doctor } from "../models/doctor.js"
import { TimeSlot } from "../models/timeslot.js"
import { Appointment } from "../models/appointment.js"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
dotenv.config({ quiet: true })
import { generate } from "./generate_tokens.js"

const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // <-- This is correct
    path: "/",
    maxAge
});


const doc_login = asynchandler(async (req, res) => {
    const { email, password } = req.body
    console.log(email,password)
    if (!email || !password) {
        res.status(400)
        throw new ApiError(400, "Email and password are required")
    }
    const doctor = await Doctor.findOne({ email })
    if (!doctor) {
        res.status(401)
        throw new ApiError(401, "Invalid email Try again or signup")
    }
    const check = password === doctor.password
    if (!check)
        throw new ApiError(401, "Invalid password Try again")
    else {
        const { accesstoken, refreshtoken } = await generate(doctor._id, "doctor")
        res.cookie("refreshtoken", refreshtoken, getCookieOptions(15 * 24 * 60 * 60 * 1000));
        res.cookie("accesstoken", accesstoken, getCookieOptions(60 * 60 * 1000))
        res.status(202).json({ "message": "Redirect to Home","accesstoken":accesstoken })
    }
})


const doc_signup = asynchandler(async (req, res) => {
    res.status(400).json({ "message": "hello world" })
})

const add_timeslot = asynchandler(async (req, res) => {
    const { Day, StartTime, EndTime, fee } = req.body
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
    const doctorID=req.user._id
    const timeslots = await TimeSlot.find({ doctor: doctorID })
    res.status(200).json(new ApiResponse("Time slots fetched successfully", timeslots))
})

const change_timeslot_status = asynchandler(async (req, res) => {
    const { timeslotID, status } = req.body
    if (!timeslotID || !status) {
        res.status(400)
        throw new ApiError("All fields are required")
    }
    const timeslot = await TimeSlot.findById(timeslotID)
    if (!timeslot) {
        res.status(404)
        throw new ApiError("Time slot not found")
    }
    timeslot.status = status
    await timeslot.save()
    res.status(200).json(new ApiResponse("Time slot status updated successfully", timeslot))
})


const updateDoctorProfile = asynchandler(async (req, res) => {
    const { 
        name, 
        phone, 
        gender, 
        dob, 
        address, 
        speciality, 
        experience, 
        fee, 
        bio, 
        languages 
    } = req.body;

    const user = await Doctor.findOne({ _id: req.user });

    if (!user) {
        return res.status(404).json({ "message": "Doctor profile not found" });
    }

    user.name = name;
    user.phone = phone;
    user.gender = gender;
    user.dob = dob;
    user.address = address;
    user.speciality = speciality;
    user.experience = experience;
    user.fee = fee;
    user.bio = bio;
    user.languages = languages; 
    await user.save();

    console.log("Doctor profile details were updated successfully");
    res.status(200).json({ "message": "success" });
});


const doctor_dashboard_details = asynchandler(async (req, res) => {
    // Ensure doctorID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        return res.status(400).json({ message: 'Invalid doctor ID' });
    }
    
    const doctorID = new mongoose.Types.ObjectId(req.user.id);

    // --- Date Ranges ---
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // --- 1. Appointment Status Counts (Your Original + 'accepted') ---
    const totalAppointments = await Appointment.countDocuments({ doctor: doctorID });
    const completedAppointments = await Appointment.countDocuments({ doctor: doctorID, status: 'Completed' });
    const pendingAppointments = await Appointment.countDocuments({ doctor: doctorID, status: 'Pending' });
    const rejectedAppointments = await Appointment.countDocuments({ doctor: doctorID, status: 'rejected' }); // Use 'rejected' to match your schema
    const acceptedAppointments = await Appointment.countDocuments({ doctor: doctorID, status: 'accepted' });

    // --- 2. Today's Snapshot ---
    const todayAcceptedAppointments = await Appointment.countDocuments({ 
        doctor: doctorID, 
        status: 'accepted', 
        date: { $gte: startOfToday, $lte: endOfToday } 
    });
    
    const todayPendingAppointments = await Appointment.countDocuments({ 
        doctor: doctorID, 
        status: 'Pending', 
        date: { $gte: startOfToday, $lte: endOfToday } 
    });

   
    // Total Earnings
    const totalEarningsData = await Appointment.aggregate([
        { $match: { doctor: doctorID, status: 'Completed' } },
        { $group: { _id: null, total: { $sum: "$fee" } } }
    ]);
    const totalEarnings = totalEarningsData.length > 0 ? totalEarningsData[0].total : 0;

    // Monthly Earnings
    const monthlyEarningsData = await Appointment.aggregate([
        { $match: { 
            doctor: doctorID, 
            status: 'Completed', 
            date: { $gte: startOfMonth } 
        }},
        { $group: { _id: null, total: { $sum: "$fee" } } }
    ]);
    const monthlyEarnings = monthlyEarningsData.length > 0 ? monthlyEarningsData[0].total : 0;

    // --- 4. Patient Metrics ---
    // Count of unique patients
    const totalPatients = await Appointment.distinct("patient", { doctor: doctorID });
    const totalPatientCount = totalPatients.length;

    // --- 5. Actionable Lists (for the UI) ---
    
    // Next 5 upcoming appointments
    const upcomingAppointmentsList = await Appointment.find({ 
        doctor: doctorID, 
        status: 'accepted', 
        date: { $gte: new Date() } // From now onwards
    })
    .sort({ date: 'asc' })
    .limit(5)
    .populate('patient', 'name'); // Assuming 'patient' is a ref to your Patient model

    // 5 most recent pending appointments
    const pendingAppointmentsList = await Appointment.find({ 
        doctor: doctorID, 
        status: 'Pending' 
    })
    .sort({ createdAt: 'desc' })
    .limit(5)
    .populate('patient', 'name');

    // --- Send all details in the response ---
    res.status(200).json({
        // Status Counts
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        rejectedAppointments,
        acceptedAppointments,
        
        // Today's Snapshot
        todayAcceptedAppointments,
        todayPendingAppointments,

        // Financials
        totalEarnings,
        monthlyEarnings,

        // Patient Metrics
        totalPatientCount,

        // Actionable Lists
        upcomingAppointmentsList,
        pendingAppointmentsList
    });
});


const profile = asynchandler(async (req, res) => {


    const user = await Doctor.findOne({ _id: req.user });
    if (!user)
        res.status(201).json({ "message": "failed" })
    console.log("User profile details are send to the frontend")
    console.log(user)
    res.status(200).json({ "message": "success", "profile": user })

})


const uploadimg = asynchandler(async (req, res) => {

    const { url } = req.body;

    const user = await Doctor.findOne({ _id: req.user });
    if (!user)
        res.status(201).json({ "message": "failed" })
    user.profilePic = url;
    await user.save();
    console.log("Image url has been saved to user db")
    res.status(200).json({ "message": "success" })

})




const logout = asynchandler(async (req, res) => {

    await Doctor.findByIdAndUpdate(
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



export { doc_signup,profile,logout, uploadimg,doc_login, add_timeslot, get_timeslots, change_timeslot_status,updateDoctorProfile,doctor_dashboard_details }





