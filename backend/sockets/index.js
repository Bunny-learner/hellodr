import doctorSocket from "./doctor.sockets.js";
import patientSocket from "./patient.sockets.js";
import registerRedisListener from "./redisListener.js";

// This is your "common map," the single source of truth.
// It lives here, in the main module's scope.
const roomPresence = {};

export default function socketMain(io, redisSub) {
  const userConnections = new Map();
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

    // This listener waits for the React ChatPage to mount
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

      // Store on the socket for cleanup
      socket.roomid = roomid;
      socket.role = role;

      // Tell the JOINING user the full room status
      socket.emit("room_presence", roomPresence[roomid]);

      // Tell EVERYONE ELSE who just joined
      socket.to(roomid).emit("presence_change", { role: role, present: true });
      
      console.log(`[JOIN] ${role} joined ${roomid}. Presence:`, roomPresence[roomid]);
    });

    // This listener waits for the React ChatPage to unmount
    socket.on("leave_room", ({ roomid, role }) => {
      if (!roomid || !role || !roomPresence[roomid]) return;

      roomPresence[roomid][role] = false;
      socket.leave(roomid);

      // Tell EVERYONE ELSE who just left
      socket.to(roomid).emit("presence_change", { role: role, present: false });
      
      console.log(`[LEAVE] ${role} left ${roomid}. Presence:`, roomPresence[roomid]);

      if (!roomPresence[roomid].patient && !roomPresence[roomid].doctor) {
        delete roomPresence[roomid];
        console.log(`[CLEANUP] Removed empty room ${roomid}`);
      }
    });

    // This listener handles browser closes / network drops
    socket.on("disconnect", () => {
      // Get the room/role we saved during "join_room"
      const { roomid, role } = socket; 
      
      if (!roomid || !role || !roomPresence[roomid]) {
          console.log(`User ${id} disconnected (was not in a room).`);
          return; // This socket wasn't in a chat room
      }
      
      roomPresence[roomid][role] = false;

      // Tell EVERYONE ELSE they left
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