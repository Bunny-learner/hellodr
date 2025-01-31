import dotenv from "dotenv"
dotenv.config()
import path from "path"
import { verifyJWT } from "./middlewares/auth.middleware.js";
import { createServer } from 'node:http';
import cookieParser from "cookie-parser";
import express from "express"
import mongoose from "mongoose"
import { dbconnection } from "./db/dbconnect.js"
import cors from "cors"
import { Server } from 'socket.io';
import passport from "passport"
import router from "./Routes/page.js"
import router1 from "./Routes/doctor.js"
import router2 from "./Routes/patient.js"
import { patient } from "./models/patient.model.js";
import { doctor } from "./models/doctor.model.js";

const app = express()
app.set('viewengine', 'ejs')


app.use(passport.initialize());



const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
})


// io.on('connection', (socket) => {
//     console.log(socket.id)
//     socket.on('chat message', (msg) => {
//       conseole.log(msg)
//       io.emit('chat message', msg);
//     });
//   });





io.on('connection', (socket) => {





  const users = {}//people are in chat room
  let patientsockets = {}

  const common = "9063993270"

  socket.on('register', async (who) => {

    socket.join(common)
    console.log(`${who.email} has joined the common room and his socketid is :${socket.id}`)


    if (who.name == "doctor") {
      const doc = await doctor.findOne({ email: who.email })
      if (doc) {
      
      socket.to(common).emit('online', {
        docname: doc.Username,
        status: "online"

      })
      console.log(doc)
      doc.socketid = socket.id
      await doc.save()
      console.log("saved doctor details in db")
      }
    else {
      console.log("doctor not found")

    }
  }
      
    
    
    else {
      const pat = await patient.findOne({ email: who.email })
      if(pat) {
        pat.socketid = socket.id
        await pat.save()
        console.log("saved patient details")
      }
      else {
        console.log("patient not found")
      }
    }

  })

  let chatrooms = {}//mapping doctors to their roomids
  socket.on('Roomregister', (msg) => {
  
    socket.join(msg.roomid)
    console.log(`${msg.who} has completed roomregistration`)
  }
  )
  
  //broadcast the message to with senders name
  socket.on('sendMessage', (data) => {
   
      socket.to(data.roomid).emit('newMessage', {
            sender: data.sender,
              message: data.message,
              files:data.files
    });
  
    
  
          console.log(`Message sent to room ${data.roomid} from ${data.sender}: ${data.message}`);
  })

socket.on('consult', (doctordetails) => {
  if (!doctordetails || !doctordetails.did || !doctordetails.patientname) {
    console.log("Invalid doctordetails received:", doctordetails);
    return;
  }

  console.log("doctordetails:", doctordetails);
  socket.to(doctordetails.did).emit('patient', {
    pname: doctordetails.patientname,
    pid: socket.id,
    condition: doctordetails.condition
  });
});


socket.on('reject', (rejection) => {
  console.log("rejection")
  socket.to(rejection.pid).emit('rejected', {
    message: "I am busy with other patient please kindly try again after sometime!!",
    did: rejection.did
  })
})


socket.on('room', (roomdetails, callback) => {
  socket.join(roomdetails.roomid)//doctor has joined the room
  console.log("doctor joined room")
  console.log("room event listener")
  setTimeout(() => {
    callback("doctor joined")
  }, 5000)


  patientsockets[roomdetails.pid] = socket
  console.log(patientsockets[roomdetails.pid])

  patientsockets[roomdetails.pid].join(roomdetails.roomid)//patient has joined the room
  console.log("patient joined room", roomdetails.roomid, roomdetails.pid)

  var roomids=roomdetails.roomid
  socket.to(roomdetails.pid).emit('patientjoined', {
    message: "succesfully,joined the room",
    did: socket.id,
    roomid: roomids
  })
})
socket.on('disconnect', () => {
  const username = users[socket.id]
  delete users[socket.id]

  console.log(`${username}:has been disconnected `)
})
})

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST'],
  credentials: true
}))

app.use(express.static('public'))//assests such as files that can be accessed by anyone
app.use(express.urlencoded({ extended: true }))
app.use(express.json())//req.body that holds data sent in the body of a POST, PUT, PATCH, or DELETE request. This data might include form submissions, JSON payloads, or other formats and it converts json to jsobj


app.use(cookieParser())

app.use('/', router)
app.use('/doctor', router1)
app.use('/patient', router2)

app.get('/room/:any', verifyJWT, (req, res) => {
  const name = req.user.Username
  let who;
  if (!req.user.specality)
    who = "patient"
  else
    who = "doctor"
  res.render("roompage.ejs", { name: name, who: who })
})
app.get('/help', (req, res) => {
  res.json({
    name: process.env.CLOUDINARY_CLOUD_NAME,
  })
})
export default server

// app.listen only handles http requests from the app
//whereas server.listen handles http requests from the app and anyother like websocket.io etc..