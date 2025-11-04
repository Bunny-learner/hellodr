export default function doctorSocketHandler(io, socket) {
  console.log(`👨‍⚕️ Doctor connected: ${socket.id}`);

  // Example: doctor joins a room for their consultations
  socket.on("joinDoctorRoom", (doctorId) => {
    socket.join(`doctor_${doctorId}`);
    console.log(`Doctor ${doctorId} joined their room`);
  });

  // Example: receive message from patient
  socket.on("receivePatientMessage", (data) => {
    console.log("Message for doctor:", data);
    // Notify doctor in their room
    io.to(`doctor_${data.doctorId}`).emit("doctorMessage", data);
  });


  //flexible using redis backed scheduling(layer2)

  //when doctor 10min is out its late so we notify the patient and also doctor (next patient is waiting) 
  //notifying happens through pub/sub messenger model (for scalability)


  //whenever the patient books ticket then doctor we delete the exisiting jobs in the job scheduler and add the latest first upcoming  slot into redis job scheduler 
  //and we notify using the same pub/sub model here too when the time comes
  //this is layer1 which then succeeds with layer2 later 
}
