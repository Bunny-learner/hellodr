import dotenv from "dotenv"
dotenv.config({ quiet: true })
import path from "path"
import cookieParser from "cookie-parser";
import express from "express"
import mongoose from "mongoose"
import session from "express-session";
import {createServer} from "http"
import { dbconnection } from "./db/dbconnect.js"
import cors from "cors"
import { Server } from 'socket.io';
import router from "./Routes/doctor.js"
import hooker from "./Routes/webhook.js";
import passport from "./middlewares/auth.google.js"



const app = express()


app.use(cookieParser())

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));



app.use(express.static('public'));
app.use(express.urlencoded({extended:true,limit:'100mb'}))
app.use('/stripe',hooker)
app.use(express.json({limit:'100mb'}));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true if using https
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());




const server=createServer(app)

import doctor from "./Routes/doctor.js"
import patient from "./Routes/patient.js"
import google_auth from "./Routes/google_auth.js"
import face_auth from "./Routes/facebook_auth.js"
import appointment from "./Routes/appointment.route.js"
import authorizer from "./Routes/authorizer.js";
import  doctorSocketHandler  from "./sockets/doctor.sockets.js";
import  patientSocketHandler  from "./sockets/patient.sockets.js";


app.use('/doctor',doctor);
app.use('/patient',patient);
app.use('/auth/google',google_auth)
app.use('/auth/faceboook',face_auth)
app.use('/appointment',appointment)
app.use('/verify',authorizer)


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("✅ New socket connected:", socket.id);
  const { role } = socket.handshake.query; 

  if (role === "doctor") {
    doctorSocketHandler(io, socket);
  } else if (role === "patient") {
    patientSocketHandler(io, socket);
  } else {
    console.log("❌ Unknown role. Disconnecting...");
    socket.disconnect();
  }

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});


export default server;

