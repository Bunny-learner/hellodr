import express,{Router} from "express"
import {doc_login,doc_signup,add_timeslot,get_timeslots} from "../controllers/doctorcontrollers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { get_doctor_appointments } from "../controllers/appointment.controllers.js"
const doctor=Router()


doctor.post('/signdata',doc_signup)
doctor.post('/logindata',doc_login)
doctor.get('/appointments',verifyJWT,get_doctor_appointments)
doctor.post('/addtimeslot',verifyJWT,add_timeslot)
doctor.get('/gettimeslots',verifyJWT,get_timeslots)

export default doctor