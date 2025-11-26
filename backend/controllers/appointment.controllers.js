import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import Stripe from "stripe";
import { Appointment } from "../models/appointment.js"
import { Doctor } from "../models/doctor.js"
import { TimeSlot } from "../models/timeslot.js"
import { Transaction } from "../models/transactions.js"
import mongoose from "mongoose"
import { loadTemplate } from "../utils/emailTemplate.js";
import { redisPub } from '../db/redisconnect.js';
import { Patient } from "../models/patient.js"
import doctorSocketHandler from "../sockets/doctor.sockets.js";
import { scheduleJobsForAppointment } from "../scheduling/schedule_appointment.js"
import { scheduleRemindersForAppointment } from "../scheduling/schedule_reminder.js";
import { scheduleTimeoutJobs } from "../scheduling/schedule_timeout.js";
import { removeAppointmentJobs } from "../scheduling/remove_job.js";
import { userConnections } from "../sockets/index.js";
import { Notification } from "../models/notification.js";
import { sendEmail } from "../utils/sendEmail.js";

const API = process.env.WEB_URL;
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


const itime = async (appointment) => {
  const utcDate = new Date(appointment.date);

  const indiaTime = utcDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  return indiaTime
}
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


  if (mode.toLowerCase() === "offline") {

    const lastToken = await Appointment.findOne({
      doctor: doctorId,
      date: appointmentDate,
      mode: "offline",
      token_number: { $ne: null }
    })
      .sort({ token_number: -1 })
      .select("token_number");

    appointment.token_number = lastToken ? lastToken.token_number + 1 : 1;
  }



  await appointment.save();


  timeslot.booked += 1;


  if (timeslot.booked >= timeslot.limit) {
    timeslot.status = "full";
  }

  await timeslot.save();


  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate("TimeSlot");


  let indiaTime = await itime(appointment)

  let notif = new Notification({

    message: `Patient ${appointment.name} (${gender}, ${age} years old) has booked an ${mode.toLowerCase()} appointment on ${indiaTime}.`,
    doctorid: appointment.doctor,
    patientid: appointment.patient,
    appointmentid: appointment.id,
    isappointment: true,
    from: "patient",
    to: "doctor"
  })
  await notif.save()

  //sending live notification to doctor
  let did = appointment.doctor.toString()
  const doctorsocket = userConnections.get(did);

  if (doctorsocket) {
    doctorsocket.emit("doctornotification", { msg: "got notified" });
  } else {
    console.log("⚠️ Doctor not online, cannot send socket event");
  }




  console.log("booking done")
  res.status(201).json({
    sucess: true,
    appointment: populatedAppointment,
  });
});



const get_all_appointments = asynchandler(async (req, res) => {
  const userID = req.user.id;
  const userType = req.userType;
  let { status, date } = req.query;

  const query = { [userType]: userID };

  if (status && status.toLowerCase() !== "all") {
    status = status.toLowerCase();

    if (status === "livequeue") {
      // LIVE QUEUE = accepted + next_up + in_progress
      query["status"] = {
        $in: ["accepted", "next_up", "in_progress"]
      };
    }

    else if (status === "rejected") {
      query["status"] = { $in: ["rejected", "cancelled"] };
    }

    else {
      query["status"] = status;
    }
  }
  //date filter handling
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const next = new Date(d);
    next.setDate(d.getDate() + 1);

    query["date"] = { $gte: d, $lte: next };
  }

  const appointments = await Appointment.find(query)
    .populate("doctor", "name speciality fee profilePic address roomid")
    .populate("TimeSlot");

  return res
    .status(200)
    .json(new ApiResponse("Appointments fetched successfully", appointments));
});





const update_appointment_status = asynchandler(async (req, res) => {
  const { appointmentID, status } = req.body;
  const { info } = req.query;

  if (!status) {
    res.status(400);
    throw new ApiError("Status is required");
  }

  // Good: You are populating the TimeSlot here.
  const appointment = await Appointment.findById(appointmentID)
    .populate("TimeSlot")
    .populate("patient")
    .populate("doctor");



  if (!appointment) {
    res.status(404);
    throw new ApiError("Appointment not found");
  }

  appointment.status = status;
  await appointment.save();


  let indiaTime = await itime(appointment)





  let notif = new Notification({
    message: `Your doctor appointment status is ${status} for the slot  ${appointment.TimeSlot.StartTime}-${appointment.TimeSlot.EndTime} booked on ${indiaTime} `,
    doctorid: appointment.doctor,
    patientid: appointment.patient,
    appointmentid: appointment.id,
    isappointment: true,
    from: "doctor",
    to: "patient"
  })
  await notif.save();

  //sending live  notification to patient about the status of appointment

  const patientId =
    appointment.patient?._id?.toString() ??
    appointment.patient.toString();
  const patientsocket = userConnections.get(patientId);

  if (patientsocket) {
    patientsocket.emit("patientnotification", { msg: "got notified" });
  } else {
    console.log("⚠️ Patient offline, cannot send notification");
  }



  //Accepted
  if (status.toLowerCase() === "accepted") {

    await scheduleJobsForAppointment(appointment)
    await scheduleRemindersForAppointment(appointment)
    await scheduleTimeoutJobs(appointment)

    if (appointment.mode === "offline" && appointment.token_number) {

    const body = loadTemplate("token_accepted.html", {
  patientName: appointment.patient.name,
  tokenNumber: appointment.token_number,
  doctorName: appointment.doctor.name,
  startTime: appointment.TimeSlot.StartTime,
  endTime: appointment.TimeSlot.EndTime,
  appointmentDate: indiaTime
});

    sendEmail(appointment.patient.email, "Appointment Accepted", body);
  }

  }

  //Cancelled
  else if (status.toLowerCase() === "cancelled") {
    try {

      const slot = await TimeSlot.findById(appointment.TimeSlot._id);

      if (slot) {
        slot.booked = Math.max(0, slot.booked - 1);

        if (slot.booked < slot.limit) {
          slot.status = "available";
        }

        await slot.save();

        //removing the jobs from the scheduler also removing the timeoutjob

        await removeAppointmentJobs(appointmentID)


        const patient = appointment.patient;
        const mode = appointment.mode;
        const age = appointment.age;   // you stored age above
        const gender = patient.gender || "N/A";

        redisPub.publish(
          `user:${patient._id}`,
          JSON.stringify({
            type: "cancelled",
            data: {
              message: `Dear ${patient.name.toLowerCase()}, your ${mode.toLowerCase()} appointment has been cancelled due to doctor unavailability.`,
              appointment,
              doctorid: appointment.doctor,
              patientid: appointment.patient._id,
              appointmentid: appointment._id,
              isappointment: true,
              from: "doctor",
              to: "patient",
            },
          })
        );
        console.log(
          `Slot ${slot._id} updated: booked=${slot.booked}, status=${slot.status}`
        );

      } else {
        console.warn(`TimeSlot not found for appointment ${appointmentID}`);
      }
    } catch (err) {
      console.error("Error updating timeslot after cancellation:", err);
    }
  }

  if (info) {
    const transaction = await Transaction.findOne({
      appointment: appointmentID,
      paymentStatus: "authorized",
    });

    if (transaction && transaction.stripePaymentIntentId) {
      try {
        let stripeResult = "";

        if (info === "proceed") {
          stripeResult = await stripe.paymentIntents.capture(transaction.stripePaymentIntentId);
          transaction.paymentStatus = "paid";
          await transaction.save();
          console.log("Stripe processed:", stripeResult);


          //sending notification to the patient to add review
          const tempo = await Doctor.findById(appointment.doctor)
          const notif = new Notification({
            patientid: appointment.patient,
            doctorid: appointment.doctor,
            appointmentid: appointment.id,
            from: "doctor",
            to: "patient",
            message: `Please leave a review ${tempo.name} for your reviews are helpful in improving your experience.`,
            isappointment: true
          })

          await notif.save()



          //sending live notification
          const pid =
            appointment?.patient?._id?.toString() ??
            appointment.patient.toString();

          const patientsocket = userConnections.get(pid);

          if (patientsocket) {
            patientsocket.emit("patientnotification", { msg: "got notified" });
          } else {
            console.log("⚠️ Patient not connected");
          }


          //decrease the bookings by 1 for that appointment

          const slot = appointment.TimeSlot;

          if (!slot || !slot._id) {
            console.log("⚠️ Timeslot missing in appointment");
          } else {

            const ts = await TimeSlot.findById(slot._id);

            if (ts) {
              ts.booked = Math.max(0, ts.booked - 1);

              if (ts.booked < ts.limit) {
                ts.status = "available";
              }

              await ts.save();
              console.log(`✔️ Updated timeslot: booked=${ts.booked}, status=${ts.status}`);
            } else {
              console.log(`❌ Timeslot not found for ID: ${slot._id}`);
            }
          }



          //promoting the other cards to next_up


          const current = await Appointment.find({ "status": "next_up" })
          if (current.length == 0) {
            res.status(201).json({
              message: "Appointment status updated successfully",
              appointment,
            });
          }

          else {
            const upcoming = await Appointment.findOne({
              status: 'accepted',
              doctor: userID
            }).sort({ time: 1 });

            if (upcoming) {
              upcoming.status = 'next_up';
              await upcoming.save();
            }

          }


        } else if (info === "cancel") {
          stripeResult = await stripe.paymentIntents.cancel(transaction.stripePaymentIntentId);
          transaction.paymentStatus = "failed";
          await transaction.save();
          console.log("Stripe processed:", stripeResult);

        }
        else
          console.log("stripe processing is being skipped ")




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
      success_url: `${API}/patient/payments?alert=Payment is Successful`,
      cancel_url: `${API}/patient/failure`,
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

  const { role, userId } = req

  let user = {}
  if (role == "patient")
    user = await Patient.findById(userId)
  else
    user = await Doctor.findById(userId)

  res.status(200).json({ message: "User is authenticated", role: role, id: userId, user: user })
})



const update_inprogress = asynchandler(async (req, res) => {
  const { appointmentID, status } = req.body;

  if (!status) {
    res.status(400);
    throw new ApiError("Status is required");
  }


  const appointment = await Appointment.findById(appointmentID)
    .populate("TimeSlot")
    .populate("patient");

  if (!appointment) {
    res.status(404);
    throw new ApiError("Appointment not found");
  }

  appointment.status = status;
  await appointment.save();

  res.status(200).json({
    success: true
  });


})
export { book_appointment, update_inprogress, authorize, gettransactions, getsession, get_all_appointments, update_appointment_status, get_appiontment }