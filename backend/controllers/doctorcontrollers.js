import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import dotenv from 'dotenv'
import { Patient } from "../models/patient.js"
import { Doctor } from "../models/doctor.js"
import { TimeSlot } from "../models/timeslot.js"
import { Appointment } from "../models/appointment.js"
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
        res.cookie("refreshtoken", refreshtoken, getCookieOptions(15 * 24 * 60 * 60 * 1000));
        res.cookie("accesstoken", accesstoken, getCookieOptions(60 * 60 * 1000))
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
        .clearCookie("accesstoken", options)
        .clearCookie("refreshtoken", options)
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
  const { prescriptionData, patientData, consultationId, roomid, doctorId } = req.body;

 
  try {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);

      try {
        
        const uploadResult = await uploadBufferToCloudinary(pdfBuffer);
console.log(uploadResult.secure_url)
        // 2. Create the chat message object
        const msg = {
          id: `msg_${Date.now()}`,
          senderId: doctorId,
          text: "Here is your prescription.",
          timestamp: new Date().toISOString(),
          files: [
            {
              url: uploadResult.secure_url, 
              name: 'prescription.pdf',
              type: 'application/pdf',
            },
          ],
        };




    
        let payload={msg,isSystem:true}
        io.to(roomid).emit('sending',payload);//io.to sends to everyone in room just like
        //socket.to(roomid)but socket.broadcast.to(roomid) does not send to its own socket
        
        
    

        // 7. Respond to the original HTTP request
        res.status(200).json({ success: true, message: 'Prescription sent.' });

      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        res.status(500).json({ message: 'Failed to upload PDF.' });
      }
    });

    
    // --- PDF Drawing Logic (Unchanged) ---
    const pageWidth = doc.page.width;
    const marginLeft = 40;
    let y = 40;

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text(prescriptionData.clinicName || "Clinic / Hospital Name", marginLeft, y);
    doc.fontSize(12).font('Helvetica').text(`Address: ${prescriptionData.clinicAddress || "____________________________"}`, marginLeft, y + 25);
    doc.text(`Phone: ${prescriptionData.clinicPhone || "______________________________"}`, marginLeft, y + 45);
    y += 100;

    // Line Separator
    doc.strokeColor("#cccccc").lineWidth(1).moveTo(marginLeft, y).lineTo(pageWidth - marginLeft, y).stroke();
    y += 25;

    // Patient & Doctor Info
    doc.fontSize(14).font('Helvetica-Bold').text("Patient Details", marginLeft, y);
    y += 20;
    doc.fontSize(12).font('Helvetica');
    doc.text(`Name: ${patientData.name}`, marginLeft, y); y += 18;
    doc.text(`Age / Gender: ${patientData.age} / ${patientData.gender}`, marginLeft, y); y += 18;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, marginLeft, y); y += 25;

    doc.fontSize(14).font('Helvetica-Bold').text("Doctor Details", marginLeft, y);
    y += 20;
    doc.fontSize(12).font('Helvetica');
    doc.text(`Doctor: ${prescriptionData.doctorName}`, marginLeft, y); y += 18;
    y += 30;

    // Diagnosis
    doc.fontSize(14).font('Helvetica-Bold').text("Diagnosis", marginLeft, y);
    y += 18;
    doc.fontSize(12).font('Helvetica');
    doc.text(prescriptionData.diagnosis || "-", { width: pageWidth - (marginLeft * 2) });
    y = doc.y + 40; // Update y to current position

    // Medications
    doc.fontSize(14).font('Helvetica-Bold').text("Medications (Rx)", marginLeft, y);
    y += 22;
    doc.fontSize(12).font('Helvetica');

    if (!prescriptionData.medications || prescriptionData.medications.length === 0) {
      doc.text("- No medications prescribed -", marginLeft, y);
      y += 20;
    } else {
      // Draw a table header
      doc.font('Helvetica-Bold');
      doc.text("Medicine", marginLeft, y);
      doc.text("Dose", marginLeft + 200, y);
      doc.text("Quantity", marginLeft + 300, y);
      doc.text("Notes", marginLeft + 400, y);
      doc.font('Helvetica');
      y += 20;

      prescriptionData.medications.forEach((m) => {
        const startY = y;
        doc.text(m.name || 'N/A', marginLeft, y, { width: 180 });
        doc.text(m.dose || 'N/A', marginLeft + 200, y, { width: 80 });
        doc.text(m.qty || 'N/A', marginLeft + 300, y, { width: 80 });
        doc.text(m.notes || '-', marginLeft + 400, y, { width: 150 });
        
        // Calculate max height of the row to draw line correctly
        const endY = Math.max(doc.y, startY + 20); // Ensure at least 20px height
        y = endY + 10;
        
        // Add line separator for row
        doc.strokeColor("#eeeeee").lineWidth(1).moveTo(marginLeft, y - 5).lineTo(pageWidth - marginLeft, y - 5).stroke();
      });
      y += 10;
    }

    // Notes
    doc.fontSize(14).font('Helvetica-Bold').text("Doctor's Notes", marginLeft, y);
    y += 20;
    doc.fontSize(12).font('Helvetica');
    doc.text(prescriptionData.notes || "-", { width: pageWidth - (marginLeft * 2) });
    y = doc.y + 40;
    
    // Footer
    y = doc.page.height - 100;
    doc.strokeColor("#cccccc").lineWidth(1).moveTo(marginLeft, y).lineTo(pageWidth - marginLeft, y).stroke();
    y += 20;
    doc.fontSize(12).font('Helvetica-Bold').text("Consultation completed via HelloDr", marginLeft, y);
    doc.fontSize(10).font('Helvetica').text(prescriptionData.doctorSignature || `Dr. ${prescriptionData.doctorName}`, marginLeft, y + 20);


    // This finalizes the PDF and triggers the 'end' event
    doc.end();

  } catch (error) {
    console.error('Error in generatePrescriptionController:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export { doc_signup, generatePrescription ,profile,logout, uploadimg,doc_login, add_timeslot, get_timeslots, change_timeslot_status,updateDoctorProfile,doctor_dashboard_details }





