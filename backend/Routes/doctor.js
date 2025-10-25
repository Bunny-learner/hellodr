import express,{Router} from "express"
import {doc_login,doc_signup,logout,uploadimg,profile,add_timeslot,get_timeslots,change_timeslot_status, updateDoctorProfile,doctor_dashboard_details} from "../controllers/doctorcontrollers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { get_all_appointments } from "../controllers/appointment.controllers.js"
const doctor=Router()


doctor.post('/signdata',doc_signup)
doctor.post('/logindata',doc_login)
doctor.get('/appointments',verifyJWT('doctor'),get_all_appointments)
doctor.post('/addtimeslot',verifyJWT('doctor'),add_timeslot)
doctor.get('/gettimeslots',verifyJWT('doctor'),get_timeslots)
doctor.put('/changestatus',verifyJWT('doctor'),change_timeslot_status)
doctor.get('/dashboarddetails',verifyJWT('doctor'),doctor_dashboard_details)
doctor.get('/profile',verifyJWT('doctor'),profile)
doctor.get('/logout',verifyJWT('doctor'),logout)
doctor.post('/uploadimg',verifyJWT('doctor'),uploadimg)
doctor.put('/updateprofile',verifyJWT('doctor'),updateDoctorProfile)

export default doctor