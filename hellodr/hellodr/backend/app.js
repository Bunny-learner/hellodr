import dotenv from "dotenv"
dotenv.config()
import path from "path"
import cookieParser from "cookie-parser";
import express from "express"
import mongoose from "mongoose"
import {createServer} from "http"
import { dbconnection } from "./db/dbconnect.js"
import cors from "cors"
import { Server } from 'socket.io';
import router from "./Routes/doctor.js"
const app = express()






app.use(cors({
  origin:"*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(express.static('public'));
app.use(cookieParser())
app.use(express.urlencoded({extended:true,limit:'100mb'}))
app.use(express.json({limit:'100mb'}))



const server=createServer(app)

import doctor from "./Routes/doctor.js"
import patient from "./Routes/patient.js"

app.use('/doctor',doctor);
app.use('/patient',patient);
export default server;;

