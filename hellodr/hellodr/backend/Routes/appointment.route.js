import express,{Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { book_appointment, update_appointment_status,get_appiontment } from "../controllers/appointment.controllers.js"

const appointment=Router()

appointment.post('/book',verifyJWT,book_appointment)
appointment.put('/changestatus',verifyJWT,update_appointment_status)
appointment.get('/appointment/:appointmentID',verifyJWT,get_appiontment)




export default appointment