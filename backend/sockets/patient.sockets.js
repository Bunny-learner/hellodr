export default function patientSocketHandler(io, socket) {
  console.log(`🧑‍🤝‍🧑 Patient connected: ${socket.id}`);

  socket.on("joinPatientRoom", (patientId) => {
    socket.join(`patient_${patientId}`);
    console.log(`Patient ${patientId} joined their room`);
  });

  socket.on("sendMessageToDoctor", (data) => {
    console.log("Patient sent:", data);
    // Send message to the doctor’s room
    io.to(`doctor_${data.doctorId}`).emit("doctorMessage", data);
  });

  
}
