import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

import { Appointment } from "../models/appointment.js"
import { Doctor } from "../models/doctor.js"
import { TimeSlot } from "../models/timeslot.js"
import mongoose from "mongoose"

// --- Assume you have these imports ---
// const asynchandler = require("./asynchandler");
// const { Appointment } = require("./models/Appointment.model");
// const { TimeSlot } = require("./models/TimeSlot.model");
// const { Doctor } = require("./models/Doctor.model");
// const { ApiError } = require("./ApiError");
// const { ApiResponse } = require("./ApiResponse");

/**
 * Helper function to parse "DD-MM-YYYY" string into a Date object.
 * new Date() does not support this format directly.
 * @param {string} dateString - The date string in "DD-MM-YYYY" format.
 * @returns {Date} A valid JavaScript Date object.
 */
const parseDMY = (dateString) => {
  const [day, month, year] = dateString.split('-').map(Number);
  // JavaScript Date months are 0-indexed (0=Jan, 1=Feb, etc.)
  return new Date(year, month - 1, day);
};

const book_appointment = asynchandler(async (req, res) => {
  // 1. Destructure from the new req.body structure
  const {
    doctorId,
    date, // This is "27-10-2025"
    dayName,
    timeSlot,
    patientName,
    age, // This is "19" (string)
    gender,
    email,
    phoneNumber,
    symptoms,
  } = req.body;

  // 2. Get patientID from the authenticated user
  const patientID = req.user._id;
  const patientEmail = req.user.email; // Fallback email

  // 3. Validation
  if (
    !doctorId ||
    !date ||
    !dayName ||
    !timeSlot ||
    !patientName ||
    !age ||
    !gender ||
    !phoneNumber
  ) {
    res.status(400);
    throw new ApiError("All fields are required");
  }

  // 4. Find the doctor
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    res.status(404);
    throw new ApiError("Doctor not found");
  }

  // 5. Find the time slot
  // We trust the client to send the correct dayName and timeSlot
  const timeslot = await TimeSlot.find({
    doctor: doctorId,
    Day: dayName,
    StartTime: timeSlot,
  });

  // 6. Check if the time slot is valid and available
  if (timeslot.length === 0) {
    res.status(400);
    throw new ApiError("Time slot not found for this doctor and day.");
  }

  // Use the schema's exact "avaliable" spelling
  if (timeslot[0].status !== "available") {
    res.status(400);
    throw new ApiError("This time slot is no longer available");
  }

  // --- FIX 1: Convert Date String ---
  // The 'date' field in the schema requires a valid Date object.
  const appointmentDate = parseDMY(date);

  // 7. Create the new appointment
  const appointment = new Appointment({
    doctor: doctorId,
    patient: patientID,
    name: patientName,
    age: Number(age), // --- FIX 2: Convert Age String to Number ---
    gender: gender, // 'Male' is in the enum
    phone: phoneNumber,
    email: email || patientEmail, // Use provided email, fallback to user's
    date: appointmentDate, // Use the converted Date object
    TimeSlot: timeslot[0]._id,
    symptoms: symptoms || "Not specified", // Handle optional symptoms
  });

  await appointment.save();

  // 8. Update the time slot status to prevent double booking
  // --- FIX 3: Use "Scheduled" from the TimeSlotSchema enum ---
  timeslot[0].status = "scheduled";
  await timeslot[0].save();

  // 9. Send success response
  res
    .status(201)
    .json(new ApiResponse("Appointment booked successfully", appointment));
});

// module.exports = { book_appointment };

const get_all_appointments = asynchandler(async (req, res) => {
    const userID = req.user.id;
    const userType = req.userType;

    // Populate both doctor and timeslot
    const appointments = await Appointment.find({ [userType]: userID })
        .populate('doctor', 'name speciality fee profilePic') // get doctor info
        .populate('TimeSlot'); // populate the timeslot details

    res.status(200).json(new ApiResponse("Appointments fetched successfully", appointments));
});
const update_appointment_status = asynchandler(async (req, res) => {
    const { appointmentID,status } = req.body
    if (!appointmentID || !status) {
        res.status(400)
        throw new ApiError("All fields are required")
    }
    const appointment = await Appointment.findById(appointmentID)
    if (!appointment) {
        res.status(404)
        throw new ApiError("Appointment not found")
    }
    appointment.status = status
    await appointment.save()
    res.status(200).json(new ApiResponse("Appointment status updated successfully", appointment))
})

const get_appiontment = asynchandler(async (req, res) => {
    const { appointmentID } = req.params
    if (!appointmentID) {
        res.status(400)
        throw new ApiError("Appointment ID is required")
    }
    if (!mongoose.Types.ObjectId.isValid(appointmentID)) {
        res.status(400);
        throw new ApiError("Invalid Appointment ID format");
    }
    const appointment = await Appointment.findById(appointmentID)
    if (!appointment) {
        res.status(404)
        throw new ApiError("Appointment not found")
    }
    res.status(200).json(new ApiResponse("Appointment fetched successfully", appointment))
})




export { book_appointment, get_all_appointments, update_appointment_status, get_appiontment }