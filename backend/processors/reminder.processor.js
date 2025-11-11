// workers/reminder.processor.js

import { Appointment } from "../models/appointment.js";
import { redisPub } from "../db/redisconnect.js";
import { Notification } from "../models/notification.js";
import { Patient } from "../models/patient.js";
import { Doctor } from "../models/doctor.js";
import { TimeSlot } from "../models/timeslot.js";

import { sendWhatsApp } from "../utils/sendWhatsApp.js";
import { sendSMS } from "../utils/sendSMS.js";
import { sendEmail } from "../utils/sendEmail.js";

function getId(ref) {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  if (ref._id) return String(ref._id);
  return String(ref);
}

export async function reminderProcessor(job) {
  console.log("⏰ Reminder Job RUN:", job.id, job.data);

  try {
    const { appointmentId, doctorId, patientId, recipient } = job.data;

    const appt = await Appointment.findById(appointmentId)
      .populate("TimeSlot")
      .lean();

    if (!appt) return console.log(`⚠️ Appointment not found → skip`);
    if (appt.status !== "accepted")
      return console.log(`⚠️ Appointment no longer accepted → skip`);

    // Load users
    const patient = await Patient.findById(patientId).lean();
    const doctor = await Doctor.findById(doctorId).lean();
    if (!patient || !doctor) {
      console.log("⚠️ doctor/patient missing → skip");
      return;
    }

    // Choose prefs based on recipient
    const recipientUser = recipient === "doctor" ? doctor : patient;
    const prefs = recipientUser?.preferences ?? {};
    const channels = Array.isArray(prefs.channels) ? prefs.channels : [];

    if (!channels.length) {
      console.log(`⚠️ ${recipient} has no channels → skip`);
      return;
    }

    
    const date = new Date(appt.date);
    const dateStr = date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const timeStr = appt?.TimeSlot?.StartTime ?? "";

    
    const appointmentUrl = `https://hellodr.com/appointment/${appointmentId}`;

  
    let message =
      recipient === "doctor"
        ? `Reminder: You have a consultation scheduled on ${dateStr} at ${timeStr} with ${patient.name}.`
        : `Reminder: Your consultation with Dr. ${doctor.name} is scheduled on ${dateStr} at ${timeStr}.`;

    message += `\nView appointment: ${appointmentUrl}`;

    // Contact details (recipient-based)
    const contact = {
      whatsapp:
        prefs.whatsappNumber ||
        recipientUser.whatsappNumber ||
        recipientUser.phone,
      sms: prefs.smsNumber || recipientUser.phone,
      email: prefs.email || recipientUser.email,
    };

  
     //const targetUserId = recipient === "doctor" ? doctorId : patientId;

    // // ✅ Publish to Redis
    // await redisPub.publish(
    //   `user:${targetUserId}`,
    //   JSON.stringify({
    //     type: "reminder",
    //     data: {
    //       appointmentid: appointmentId,
    //       doctorid: doctorId,
    //       patientid: patientId,
    //       message,
    //       isappointment: true,
    //       from: "system",
    //       to: recipient,
    //     },
    //   })
    // );

    // ✅ Process channels
    for (let ch of channels) {
      ch = ch.toLowerCase();

      if (ch === "whatsapp" && contact.whatsapp) {
        await sendWhatsApp(contact.whatsapp, message);
        console.log(`📨 WhatsApp sent → ${recipient}`);
      }

      if (ch === "sms" && contact.sms) {
        await sendSMS(contact.sms, message);
        console.log(`📨 SMS sent → ${recipient}`);
      }

      if (ch === "email" && contact.email) {
        await sendEmail(contact.email, "Appointment Reminder", message);
        console.log(`📨 Email sent → ${recipient}`);
      }
    }

    console.log(
      `✅ Reminder processed for appointment ${appointmentId} → ${recipient}`
    );
  } catch (err) {
    console.error("❌ Reminder worker error:", err);
    throw err;
  }
}
