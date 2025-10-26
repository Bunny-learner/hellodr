import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import Stripe from "stripe";
import { Appointment } from "../models/appointment.js"
import { Doctor } from "../models/doctor.js"
import { TimeSlot } from "../models/timeslot.js"
import { Transaction } from "../models/transactions.js"
import mongoose from "mongoose"



/**
 * Helper function to parse "DD-MM-YYYY" string into a Date object.
 * new Date() does not support this format directly.
 * @param {string} dateString - The date string in "DD-MM-YYYY" format.
 * @returns {Date} 
 */

const parseDMY = (dateString) => {
  const [day, month, year] = dateString.split('-').map(Number);
  // JavaScript Date months are 0-indexed (0=Jan, 1=Feb, etc.)
  return new Date(year, month - 1, day);
};

const book_appointment = asynchandler(async (req, res) => {
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

  if (timeslot[0].status !== "available") {
    res.status(400);
    throw new ApiError("This time slot is no longer available");
  }

  const appointmentDate = parseDMY(date);

 
  const appointment = new Appointment({
    doctor: doctorId,
    patient: patientID,
    name: patientName,
    age: Number(age), 
    gender: gender, 
    phone: phoneNumber,
    email: email || patientEmail, 
    date: appointmentDate, 
    TimeSlot: timeslot[0]._id,
    symptoms: symptoms || "Not specified", 
  });

  await appointment.save();


timeslot[0].status = "scheduled";
await timeslot[0].save();

console.log(appointment)
const populatedAppointment = await Appointment.findById(appointment._id)
  .populate("TimeSlot");
console.log("populated appointment: ",populatedAppointment) 

res.status(201).json(
  new ApiResponse("Appointment booked successfully", populatedAppointment)
);
})





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
    const { appointmentID, status } = req.body;
    const { info } = req.query; // read from query string
    console.log("info:", info);

    if (!status) {
        res.status(400);
        throw new ApiError("Status is required");
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentID);
    if (!appointment) {
        res.status(404);
        throw new ApiError("Appointment not found");
    }

    // Update status normally
    appointment.status = status;
    await appointment.save();

    // Only process payment if info exists
    if (info) {
        const transaction = await Transaction.findOne({ appointment: appointmentID, paymentStatus: "authorized" });

        if (transaction && transaction.stripePaymentIntentId) {
            try {
                let stripeResult;

                if (info === "proceed") {
                  console.log("---------------------------------------------")
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

export { book_appointment,gettransactions,getsession ,get_all_appointments, update_appointment_status, get_appiontment }