import dotenv from "dotenv"
dotenv.config()
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
const app = express()
import passport from "./middlewares/auth.google.js"




app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(express.static('public'));
app.use(cookieParser())
app.use(express.urlencoded({extended:true,limit:'100mb'}))
app.use(express.json({limit:'100mb'}))

app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false,httpOnly:true,sameSite:"lax"}
}));

app.use(passport.initialize());
app.use(passport.session());




const server=createServer(app)

import doctor from "./Routes/doctor.js"
import patient from "./Routes/patient.js"
import google_auth from "./Routes/google_auth.js"
import face_auth from "./Routes/facebook_auth.js"
app.use('/doctor',doctor);
app.use('/patient',patient);
app.use('/auth/google',google_auth)
app.use('/auth/faceboook',face_auth)

export default server;

