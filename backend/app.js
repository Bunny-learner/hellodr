import dotenv from "dotenv"
dotenv.config({ quiet: true })
import path from "path"
import cookieParser from "cookie-parser";
import express from "express"
import mongoose from "mongoose"
import session from "express-session";
import { createServer } from "http"
import { dbconnection } from "./db/dbconnect.js"
import cors from "cors"
import { Server } from 'socket.io';
import passport from "./middlewares/auth.google.js"

// Bull Board
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import notificationQueue from "./queue/notification.queue.js"; // <-- Moved to top

// Routes and Handlers
import { redisSub } from './db/redisconnect.js';
import hooker from "./Routes/webhook.js";
import doctor from "./Routes/doctor.js"
import patient from "./Routes/patient.js"
import google_auth from "./Routes/google_auth.js"
import face_auth from "./Routes/facebook_auth.js"
import appointment from "./Routes/appointment.route.js"
import authorizer from "./Routes/authorizer.js";
import doctorSocketHandler from "./sockets/doctor.sockets.js";
import notify from "./Routes/notification.js";
import patientSocketHandler from "./sockets/patient.sockets.js";


const app = express()

// Core Middleware
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));
app.use(express.static('public'));
app.use(express.urlencoded({extended:true,limit:'100mb'}))
app.use('/stripe',hooker) // Webhook before express.json()
app.use(express.json({limit:'100mb'}));

// Bull Board Setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues"); // <-- Path
createBullBoard({
  queues: [new BullMQAdapter(notificationQueue)],
  serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter()); 

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

// API Routes
app.use('/',notify)
app.use('/doctor',doctor);
app.use('/patient',patient);
app.use('/auth/google',google_auth)
app.use('/auth/faceboook',face_auth)
app.use('/appointment',appointment)
app.use('/verify',authorizer)



const server = createServer(app)


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

const userConnections = new Map();


redisSub.on('error', (err) => {
    console.error('[RedisSub Error]', err);
});


redisSub.on('message', (channel, message) => {
    console.log(`[Redis] Message on channel ${channel}:`, message);
    const userId = channel.split(':')[1];
    const socket = userConnections.get(userId);

    if (socket) {
        try {
            socket.emit('notifications', JSON.parse(message));
            console.log(`[Socket.io] Forwarded message to ${userId}`);
        } catch (err) {
            console.error('Error parsing or sending message:', err);
        }
    } else {
        console.log(`[Socket.io] No live socket for ${userId}.`);
    }
});

// Socket Connection Handler (This is correct)
io.on("connection", (socket) => {
  console.log("✅ New socket connected:", socket.id);
  const { role, id } = socket.handshake.query;

  if (!id) {
    return socket.disconnect();
  }

  if (role === "doctor") {
    doctorSocketHandler(io, socket, id, userConnections, redisSub);
  } else if (role === "patient") {
    patientSocketHandler(io, socket, id, userConnections, redisSub);
  } else {
    socket.disconnect();
  }
});


export default server;