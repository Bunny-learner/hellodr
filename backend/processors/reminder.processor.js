// workers/reminder.processor.js

import { Worker } from "bullmq";
import redisConnection, { redisPub } from "../db/redisconnect.js";
import { Appointment } from "../models/appointment.js";
import { Notification } from "../models/notification.js";
import Patient from "../models/patient.js";
import Doctor from "../models/doctor.js";


import { sendWhatsApp } from "../utils/sendWhatsApp.js";
import { sendSMS } from "../utils/sendSMS.js";
import { sendEmail } from "../utils/sendEmail.js";

export async function reminderProcessor(job) {
  console.log("⏰ Reminder Job RUN:", job.id, job.data);

  try {
    const { appointmentId, doctorId, patientId, message } = job.data;

    const appt = await Appointment.findById(appointmentId).lean();
    if (!appt) return console.log(`⚠️ Not found appointment → skip`);

    if (appt.status !== "accepted")
      return console.log(`⚠️ Status changed → skip reminder`);

    const patient = await Patient.findById(patientId).lean();
    if (!patient) return console.log(`⚠️ No patient → skip`);

    const channels = patient.channels;
    if (channels.length == 0)
      return;

    //saving to db if needed 

    const contact = {
      whatsapp: prefs.whatsappNumber || patient.whatsappNumber || patient.phone,
      sms: prefs.phone || patient.phone,
      email: prefs.email || patient.email,
    };

    for (let ch of channels) {

      ch=ch.lowerCase()

      if (ch === "whatsapp") {
        if (!contact.whatsapp) continue;
        await sendWhatsApp(contact.whatsapp, message);
        console.log("📨 sent → whatsapp");
      }

      if (ch === "sms") {
        if (!contact.sms) continue;
        await sendSMS(contact.sms, message);
        console.log("📨 sent → sms");
      }

      if (ch === "email") {
        if (!contact.email) continue;
        await sendEmail(contact.email, "Appointment Reminder", message);
        console.log("📨 sent → email");
      }
    }

    console.log(`✅ Reminder processed for appointment ${appointmentId}`);
  } catch (err) {
    console.error("❌ Reminder worker error:", err);
    throw err;
  }
}

