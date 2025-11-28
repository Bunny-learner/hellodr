import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import dotenv from 'dotenv'
import { Patient } from "../models/patient.js"
import { Doctor } from "../models/doctor.js"
import { TimeSlot } from "../models/timeslot.js"
import { Appointment } from "../models/appointment.js"
import { Prescription } from "../models/prescription.js"
import { createPrescriptionPDF } from "../utils/generatePrescriptionPDF.js"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
dotenv.config({ quiet: true })
import { generate } from "./generate_tokens.js"
import PDFDocument from 'pdfkit';
import {userConnections} from "../sockets/index.js"
import {io} from "../app.js"




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
        res.cookie("_host_REPAIR", refreshtoken, getCookieOptions(15 * 24 * 60 * 60 * 1000));
        res.cookie("_host_AUTH", accesstoken, getCookieOptions(60 * 60 * 1000))
        res.status(202).json({ "message": "Redirect to Home",user:req.user })
    }
})


const doc_signup = asynchandler(async (req, res) => {
    res.status(400).json({ "message": "hello world" })
})

const add_timeslot = asynchandler(async (req, res) => {
    const { Day, StartTime, EndTime, fee,mode,limit } = req.body
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
        fee,
        mode,
        limit:mode.toLowerCase()=="online"?1:limit
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
    const { timeslotID, status,mode } = req.body
    if (!timeslotID || (!status && !mode)) {
        res.status(400)
        throw new ApiError("fields are missing")
    }
    const timeslot = await TimeSlot.findById(timeslotID)
    if (!timeslot) {
        res.status(404)
        throw new ApiError("Time slot not found")
    }
    console.log(status)
    if(status)timeslot.status = status
    if(mode)timeslot.mode = mode
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
        languages,
        pasttreatments 
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
    user.pasttreatments = pasttreatments;
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
        .clearCookie("_host_AUTH", options)
        .clearCookie("_host_REPAIR", options)
        .json({ "message": "success" })

})





import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "prescriptions", // Optional: organize in a folder
        resource_type: "raw",     // IMPORTANT: Use 'raw' for non-image files like PDF
        format: "pdf"
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    
    // Write the buffer to the stream and end it to initiate the upload
    uploadStream.end(buffer);
  });
};

const generatePrescription = asynchandler(async (req, res) => {
  const { prescriptionData, patientData, roomid, doctorId } = req.body;
  console.log(patientData)

  try {
    // Generate PDF Buffer using helper
    const pdfBuffer = await createPrescriptionPDF(prescriptionData, patientData);

    // Upload PDF to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(pdfBuffer);
    const pdfUrl = uploadResult.secure_url;

    // Emit chat message
    const msg = {
      id: `msg_${Date.now()}`,
      senderId: doctorId,
      text: "Here is your prescription.",
      timestamp: new Date().toISOString(),
      files: [{ url: pdfUrl, name: "prescription.pdf", type: "application/pdf" }],
    };

    io.to(roomid).emit("sending", { msg, isSystem: true });

    // Save to DB
    
    const savedPrescription = await Prescription.create({
      patient: patientData.patientid,
      doctor: doctorId,
      medications: [pdfUrl],
    });

    res.status(200).json({
      success: true,
      message: "Prescription generated, uploaded & saved.",
      pdfUrl,
      prescription: savedPrescription,
    });

  } catch (error) {
    console.error("Prescription error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


export { doc_signup, generatePrescription ,profile,logout, uploadimg,doc_login, add_timeslot, get_timeslots, change_timeslot_status,updateDoctorProfile,doctor_dashboard_details }





