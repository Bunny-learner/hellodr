import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import Stripe from "stripe";
import { Appointment } from "../models/appointment.js"
import { Doctor } from "../models/doctor.js"
import { TimeSlot } from "../models/timeslot.js"
import { Transaction } from "../models/transactions.js"
import mongoose from "mongoose"
import { redisPub } from '../db/redisconnect.js';
import doctorSocketHandler from "../sockets/doctor.sockets.js";
import {scheduleJobsForAppointment} from "../scheduling/schedule_appointment.ts"



/**
 
 * @param {string} dateString - The date string in "DD-MM-YYYY" format.
 * @returns {Date} 
 */
const parseDMY = (dateString) => {

  const [day, month, year] = dateString.replace(/\//g, '-').split('-').map(Number);
  if (!day || !month || !year) {
    throw new Error(`Invalid date format: ${dateString}`);
  }

  return new Date(year, month - 1, day);
};

const book_appointment = asynchandler(async (req, res) => {
  const {
    doctorId,
    date, // "27-10-2025"
    dayName,
    timeSlot,
    patientName,
    age, // "19" (string)
    gender,
    fee,
    email,
    phoneNumber,
    symptoms,
    mode
  } = req.body;





  const patientID = req.user._id;
  const patientEmail = req.user.email;



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


  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    res.status(404);
    throw new ApiError("Doctor not found");
  }


  const timeslot = await TimeSlot.findOne({
    doctor: doctorId,
    Day: dayName,
    fee: fee,
    StartTime: timeSlot,
  });
  console.log("🧩 Found timeslot:", timeslot);
  if (!timeslot) {
    res.status(400);
    throw new ApiError("Time slot not found for this doctor and day.");
  }


  if (timeslot.status !== "available") {
    res.status(400);
    throw new ApiError("This time slot is no longer available");
  }

  if (typeof timeslot.booked !== "number") timeslot.booked = 0;
  if (typeof timeslot.limit !== "number") timeslot.limit = 1;

  if (timeslot.booked >= timeslot.limit) {
    timeslot.status = "full";
    await timeslot.save();
    res.status(400);
    throw new ApiError("This time slot is fully booked");
  }


  const appointmentDate = parseDMY(date);

  const appointment = new Appointment({
    doctor: doctorId,
    patient: patientID,
    name: patientName,
    age: Number(age),
    gender,
    phone: phoneNumber,
    email: email || patientEmail,
    date: appointmentDate,
    TimeSlot: timeslot._id,
    symptoms: symptoms || "Not specified",
    mode: mode.toLowerCase()
  });


  await appointment.save();
  timeslot.booked += 1;


  if (timeslot.booked >= timeslot.limit) {
    timeslot.status = "full";
  }

  await timeslot.save();


  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate("TimeSlot");



   

   redisPub.publish(`user:${appointment.doctor}`, JSON.stringify({
            data: {
             message :`Patient ${appointment.name} (${gender}, ${age} years old) has booked an ${mode.toLowerCase()} appointment on ${appointmentDate} at ${timeslot._id}.`,
             doctorid: appointment.doctor,
            appointmentid: appointment.id,
               isappointment: true,
              from: "doctor",
            }
          }));
  res.status(201).json({
    sucess:true,
    appointment: populatedAppointment,
  });
});




const get_all_appointments = asynchandler(async (req, res) => {
  const userID = req.user.id;
  const userType = req.userType;


  const appointments = await Appointment.find({ [userType]: userID })
    .populate('doctor', 'name speciality fee profilePic address roomid') // get doctor info
    .populate('TimeSlot'); // populate the timeslot details

  res.status(200).json(new ApiResponse("Appointments fetched successfully", appointments));
});




const update_appointment_status = asynchandler(async (req, res) => {
  const { appointmentID, status } = req.body;
  const { info } = req.query;

  if (!status) {
    res.status(400);
    throw new ApiError("Status is required");
  }

  // Good: You are populating the TimeSlot here.
  const appointment = await Appointment.findById(appointmentID).populate("TimeSlot");
  console.log(appointment)
  if (!appointment) {
    res.status(404);
    throw new ApiError("Appointment not found");
  }

  appointment.status = status;
  await appointment.save();

  

   redisPub.publish(`user:${appointment.patient}`, JSON.stringify({
            data: {
              message: `Your doctor appointment status is ${status}`,
              doctorid: appointment.doctor,
              appointmentid: appointment.id,
              isappointment: true,
              from: "doctor",
            }
          }));

  if (status.toLowerCase() === "accepted") {

    await scheduleJobsForAppointment(appointment)
    
  }

  // ... (rest of your logic for Stripe) ...
  if (info) {
    const transaction = await Transaction.findOne({
      appointment: appointmentID,
      paymentStatus: "authorized",
    });

    if (transaction && transaction.stripePaymentIntentId) {
      try {
        let stripeResult;

        if (info === "proceed") {
          stripeResult = await stripe.paymentIntents.capture(transaction.stripePaymentIntentId);
          transaction.paymentStatus = "paid";
        } else if (info === "cancel") {
          stripeResult = await stripe.paymentIntents.cancel(transaction.stripePaymentIntentId);
          transaction.paymentStatus = "failed";
        }

        await transaction.save();
        console.log("Stripe processed:", stripeResult);
      } catch (err) {
        console.error("Stripe processing error:", err);
      }
    }
  }

  // ... (rest of your logic for cancellation) ...
  if (status.toLowerCase() === "cancelled") {
    try {
      // Use the populated ID directly
      const slot = await TimeSlot.findById(appointment.TimeSlot._id);

      if (slot) {
        slot.booked = Math.max(0, slot.booked - 1);

        if (slot.booked < slot.limit) {
          slot.status = "available";
        }

        await slot.save();
        console.log(`Slot ${slot._id} updated: booked=${slot.booked}, status=${slot.status}`);
      } else {
        console.warn(`TimeSlot not found for appointment ${appointmentID}`);
      }
    } catch (err) {
      console.error("Error updating timeslot after cancellation:", err);
    }
  }

  res.status(201).json({
    message: "Appointment status updated successfully",
    appointment,
  });
});





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





// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getsession = asynchandler(async (req, res) => {
  try {
    const { amount, currency, appointmentId, customerEmail } = req.body;

    if (!Number.isInteger(amount)) {
      return res.status(400).json({ error: "Amount must be an integer in paise" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      payment_intent_data: {
        capture_method: "manual",
      },
      line_items: [
        {
          price_data: {
            currency: (currency || "inr").toLowerCase(),
            product_data: {
              name: "Appointment Payment",
              description: `Payment for appointment ID: ${appointmentId}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: customerEmail,
      success_url: `http://localhost:5173/patient/payments?alert=Payment is Successful`,
      cancel_url: `http://localhost:5173/patient/failure`,
    });

    let transaction = await Transaction.findOne({
      appointment: appointmentId,
      patient: appointment.patient,
      paymentStatus: "pending",
    });

    if (!transaction) {
      transaction = new Transaction({
        type: "appointment",
        appointment: appointmentId,
        patient: appointment.patient,
        doctor: appointment.doctor,
        amount,
        currency: (currency || "inr").toLowerCase(),
        paymentStatus: "pending",
        stripeCheckoutSessionId: session.id,
      });
      await transaction.save();
    }

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong creating session" });
  }
});



const gettransactions = asynchandler(async (req, res) => {
  const patientId = req.user._id;
  console.log("patientID")
  console.log("inside the get transactions handler")
  const transactions = await Transaction.find({ patient: patientId })
    .populate("appointment", "date TimeSlot")
    .populate("doctor", "name speciality");

  if (!transactions || transactions.length === 0) {
    return res.status(200).json(new ApiResponse("No transactions found", []));
  }

  res.status(200).json(
    new ApiResponse("Transactions fetched successfully", transactions)
  );
});


const authorize = asynchandler(async (req, res) => {
  console.log("inside the authorize handler------->::::::")
  res.status(200).json({ message: "User is authenticated", role: req.role, id: req.userId })
})

export { book_appointment, authorize, gettransactions, getsession, get_all_appointments, update_appointment_status, get_appiontment }