import express,{Router} from "express"
import {pat_login,pat_signup,pat_reset,pat_verify,pat_send} from "../controllers/patientcontrollers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { get_patient_appointments,get_appiontment } from "../controllers/appointment.controllers.js"
const patient=Router()



patient.post('/signdata',pat_signup)
patient.post('/logindata',pat_login)
patient.post('/verifycode',pat_verify)
patient.post('/resendcode',pat_send)
patient.post('/sendcode',pat_send)
patient.post('/reset',pat_reset)
patient.get('/appointments',verifyJWT,get_patient_appointments)



export default patient