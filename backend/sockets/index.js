import doctorSocket from "./doctor.sockets.js";
import patientSocket from "./patient.sockets.js";
import registerRedisListener from "./redisListener.js";


export const roomPresence = {};
export const userConnections = new Map();

export default function socketMain(io, redisSub) {
  
  const subscribedChannels = new Set();

  registerRedisListener(redisSub, userConnections);

  io.on("connection", async (socket) => {
    const { id, role } = socket.handshake.query;
    console.log("✅ Socket:", id, role);

    if (!id) return socket.disconnect();

    // --- Redis Logic (This is fine) ---
    const channel = `user:${id}`;
    if (!subscribedChannels.has(channel)) {
      await redisSub.subscribe(channel);
      subscribedChannels.add(channel);
      console.log(`✅ Redis subscribed to ${channel}`);
    }


    socket.on("join_room", ({ roomid, role }) => {
      if (!roomid || !role) {
        console.warn(`Invalid join attempt: roomid=${roomid}, role=${role}`);
        return;
      }

      if (!roomPresence[roomid]) {
        roomPresence[roomid] = { patient: false, doctor: false };
      }

      roomPresence[roomid][role] = true;
      socket.join(roomid);


      socket.roomid = roomid;
      socket.role = role;


      socket.emit("room_presence", roomPresence[roomid]);

      socket.to(roomid).emit("presence_change", { role: role, present: true });

      console.log(`[JOIN] ${role} joined ${roomid}. Presence:`, roomPresence[roomid]);
    });


    socket.on("leave_room", ({ roomid, role }) => {
      if (!roomid || !role || !roomPresence[roomid]) return;

      roomPresence[roomid][role] = false;
      socket.leave(roomid);

      socket.to(roomid).emit("presence_change", { role: role, present: false });

      console.log(`[LEAVE] ${role} left ${roomid}. Presence:`, roomPresence[roomid]);

      if (!roomPresence[roomid].patient && !roomPresence[roomid].doctor) {
        delete roomPresence[roomid];
        console.log(`[CLEANUP] Removed empty room ${roomid}`);
      }
    });

  
    socket.on("disconnect", () => {
      const { roomid, role } = socket;

      if (!roomid || !role || !roomPresence[roomid]) {
        console.log(`User ${id} disconnected (was not in a room).`);
        return; // This socket wasn't in a chat room
      }

      roomPresence[roomid][role] = false;

      
      socket.to(roomid).emit("presence_change", { role: role, present: false });

      console.log(`[DISCONNECT] ${role} left ${roomid}. Presence:`, roomPresence[roomid]);

      if (!roomPresence[roomid].patient && !roomPresence[roomid].doctor) {
        delete roomPresence[roomid];
        console.log(`[CLEANUP] Removed empty room ${roomid}`);
      }
    });

    if (role === "doctor") {
      doctorSocket(io, socket, id, userConnections);
    } else {
      patientSocket(io, socket, id, userConnections);
    }
  });
}