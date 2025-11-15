import { Patient } from "../models/patient.js";


export const patientConnections = new Map();

export default async function patientSocket(
  io,
  socket,
  id,
  userConnections
) {
  console.log(`👤 Patient connected: ${socket.id} (User ID: ${id})`);

  userConnections.set(id, socket.id);

  try {
    const pat = await Patient.findById(id);
    if (pat) {
      pat.socketid = socket.id;
      await pat.save();
      console.log(`✅ Saved socket for patient: ${id}`);
    } else {
      console.log("❌ Patient not found in DB");
    }
  } catch (err) {
    console.log("❌ Failed to store patient socket ID", err);
  }


  // socket.on("join_room", ({ roomid }) => {
  //   const role = "patient";      

  //   socket.join(roomid);

  //   patientConnections.set(id, {
  //     socket,
  //     inRoom: true,
  //     roomId: roomid,
  //   });

  //   if (!roomPresence[roomid]) {
  //     roomPresence[roomid] = { patient: false, doctor: false };
  //   }

  //   roomPresence[roomid].patient = true;   // ✅ enforce

  //   socket.to(roomid).emit("presence_change", {
  //     who: "patient",
  //     present: true
  //   });

  //   socket.emit("room_presence", roomPresence[roomid]);

  //   console.log("roomPresence:", roomPresence);
  // });



  // socket.on("leave_room", ({ roomid }) => {
  //   if (roomPresence[roomid]) {
  //     roomPresence[roomid].patient = false;
  //   }

  //   socket.to(roomid).emit("presence_change", {
  //     who: "patient",
  //     present: false
  //   });

  //   socket.leave(roomid);

  //   const old = patientConnections.get(id);
  //   if (old) old.inRoom = false;

  //   console.log(`🚪 patient left room ${roomid}`);
  // });



  socket.on("msg_frompat", ({ msg, roomid }) => {
    console.log(`💬 Patient says to room(${roomid}):`, msg);
    socket.to(roomid).emit("send_todoc", msg);
  });


  socket.on("patient_typing", ({ roomid }) => {
    socket.to(roomid).emit("pat_types", "patient is typing");
  });


  socket.on("disconnect", () => {
    console.log(`❌ Patient ${id} disconnected: ${socket.id}`);

    const old = patientConnections.get(id);
    if (old && old.roomId) {
      roomPresence[old.roomId].patient = false;
      socket.to(old.roomId).emit("presence_change", {
        who: "patient",
        present: false
      });
    }

    patientConnections.delete(id);
    userConnections.delete(id);
  });
}
