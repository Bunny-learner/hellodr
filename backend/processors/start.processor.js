import { Appointment } from "../models/appointment.js";
import { redisPub } from "../db/redisconnect.js";
import { roomPresence } from "../sockets/index.js";
import {Doctor} from  "../models/doctor.js"

export async function startProcessor(job) {
  try {
    const { appointmentId, doctorId, patientId } = job.data;

    console.log(`\n[startProcessor] → Running job for appointment: ${appointmentId}`);

    /* ------------------------------------------------------------------
     * 1) Fetch Appointment
     * ------------------------------------------------------------------ */
    const appt = await Appointment.findById(appointmentId);
    if (!appt) {
      console.log(`[startProcessor] ❌ Appointment not found → skip`);
      return;
    }

    const currentStatus = (appt.status || "").toLowerCase();

    /* ------------------------------------------------------------------
     * 2) Only "accepted" appointment should trigger
     * ------------------------------------------------------------------ */
    if (currentStatus !== "accepted") {
      console.log(`[startProcessor] ⏭ Not eligible (status = ${currentStatus}) → skip`);
      return;
    }

    console.log(`[startProcessor] 🔄 Moving appointment → next_up`);
    appt.status = "next_up";
    await appt.save();

    /* ------------------------------------------------------------------
     * 3) Fetch doctor + room
     * ------------------------------------------------------------------ */
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.roomid) {
      console.log("[startProcessor] ❌ Doctor not found or roomid missing");
      return;
    }

    const roomId = doctor.roomid;
    const roomState = roomPresence?.[roomId] || null;

    /* ------------------------------------------------------------------
     * 4) If doctor is already inside room → send delay
     * ------------------------------------------------------------------ */
    if (roomState?.doctor === true) {
      console.log(`[startProcessor] ⏳ Doctor already inside room → send delay`);
      
      const doctorPayload = {
        type: "delay",
        data: {
          doctorid: doctorId,
          patientid: patientId,
          message: "Next patient is waiting, please end current consultation soon.",
          appointmentid: appointmentId,
          isappointment: true,
          from: "system",
          to: "doctor",
        },
      };

      const patientPayload = {
        type: "delay",
        data: {
          message:
            "The doctor is currently busy with another consultation. Please wait, you will be notified soon.",
          doctorid: doctorId,
          patientid: patientId,
          appointmentid: appointmentId,
          isappointment: true,
          from: "system",
          to: "patient",
        },
      };

      await redisPub.publish(`user:${patientId}`, JSON.stringify(patientPayload));
      await redisPub.publish(`user:${doctorId}`, JSON.stringify(doctorPayload));
      return;
    }

    /* ------------------------------------------------------------------
     * 5) Check DB — another appointment in progress?
     * ------------------------------------------------------------------ */
    const startDay = new Date(appt.date);
    startDay.setHours(0, 0, 0, 0);

    const nextDay = new Date(startDay);
    nextDay.setDate(startDay.getDate() + 1);

    const busyAppt = await Appointment.findOne({
      _id: { $ne: appointmentId },
      doctor: doctorId,
      status: "in_progress",
      date: { $gte: startDay, $lt: nextDay },
    });

    if (busyAppt) {
      console.log(
        `[startProcessor] ⏳ Doctor is busy with (${busyAppt._id}) → Delay`
      );

      const doctorPayload = {
        type: "delay",
        data: {
          doctorid: doctorId,
          patientid: patientId,
          message:
            "Next patient is waiting, please close the ongoing consultation soon.",
          appointmentid: appointmentId,
          isappointment: true,
          from: "system",
          to: "doctor",
        },
      };

      const patientPayload = {
        type: "delay",
        data: {
          message:
            "The doctor is busy with another appointment now. Please wait for your turn.",
          doctorid: doctorId,
          patientid: patientId,
          appointmentid: appointmentId,
          isappointment: true,
          from: "system",
          to: "patient",
        },
      };

      await redisPub.publish(`user:${patientId}`, JSON.stringify(patientPayload));
      await redisPub.publish(`user:${doctorId}`, JSON.stringify(doctorPayload));
      return;
    }

    /* ------------------------------------------------------------------
     * 6) Doctor is FREE → Send START notification to both
     * ------------------------------------------------------------------ */
    console.log(`[startProcessor] 🚀 Doctor is free → sending START notification`);

    const doctorStartPayload = {
      type: "start",
      data: {
        doctorid: doctorId,
        patientid: patientId,
        appointmentid: appointmentId,
        message: "The next patient is ready. Please start the consultation.",
        isappointment: true,
        from: "system",
        to: "doctor",
      },
    };

    const patientStartPayload = {
      type: "start",
      data: {
        doctorid: doctorId,
        patientid: patientId,
        appointmentid: appointmentId,
        message: "Your appointment time has come. Please be ready to join.",
        isappointment: true,
        from: "system",
        to: "patient",
      },
    };

    await redisPub.publish(`user:${patientId}`, JSON.stringify(patientStartPayload));
    await redisPub.publish(`user:${doctorId}`, JSON.stringify(doctorStartPayload));

    console.log(`[startProcessor] 📩 START notification sent to both doctor & patient`);

  } catch (err) {
    console.error(`[startProcessor] ❌ ERROR:`, err);
  }
}
