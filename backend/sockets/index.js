import doctorSocket from "./doctor.sockets.js";
import patientSocket from "./patient.sockets.js";
import registerRedisListener from "./redisListener.js";

export default function socketMain(io, redisSub) {
  const userConnections = new Map();
  const subscribedChannels = new Set();

  registerRedisListener(redisSub, userConnections);

  io.on("connection", async (socket) => {
    const { id, role } = socket.handshake.query;
    console.log("✅ Socket:", id, role);

    if (!id) return socket.disconnect();

    // Subscribe once for each user
    const channel = `user:${id}`;
    if (!subscribedChannels.has(channel)) {
      await redisSub.subscribe(channel);
      subscribedChannels.add(channel);
      console.log(`✅ Redis subscribed to ${channel}`);
    }

    if (role === "doctor") {
      doctorSocket(io, socket, id, userConnections);
    } else {
      patientSocket(io, socket, id, userConnections);
    }
  });
}
