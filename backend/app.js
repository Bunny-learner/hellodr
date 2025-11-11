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
 // <-- Moved to top

// Routes and Handlers
import { redisSub } from './db/redisconnect.js';
import setter from "./Routes/settings.js"
import hooker from "./Routes/webhook.js";
import doctor from "./Routes/doctor.js"
import patient from "./Routes/patient.js"
import google_auth from "./Routes/google_auth.js"
import face_auth from "./Routes/facebook_auth.js"
import appointment from "./Routes/appointment.route.js"
import authorizer from "./Routes/authorizer.js";
import notify from "./Routes/notification.js";
import socketMain from "./sockets/index.js";
import {  reminderQueue } from "./queues/reminder.queue.js";
import { startQueue } from "./queues/start.queue.js";
import { hydratorQueue } from "./queues/hydrator.queue.js";


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
serverAdapter.setBasePath("/admin/queues"); 
createBullBoard({
  queues: [new BullMQAdapter(startQueue),new BullMQAdapter(hydratorQueue),new BullMQAdapter(reminderQueue)],
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
app.use("/settings",setter)



const server = createServer(app)


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
});




redisSub.on('error', (err) => {
    console.error('[RedisSub Error]', err);
});


socketMain(io,redisSub)

export default server;
