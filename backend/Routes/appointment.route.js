import express,{Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { book_appointment,showqr,verifyqr,update_inprogress,gettransactions,getsession, update_appointment_status,get_appiontment} from "../controllers/appointment.controllers.js"

const appointment=Router()

appointment.post('/book',verifyJWT('patient'),book_appointment)
appointment.post('/verifyqr',verifyJWT('doctor'),verifyqr)
appointment.put('/changestatus',verifyJWT('doctor'),update_appointment_status)
appointment.post('/getsession',verifyJWT('patient'),getsession)
appointment.get('/transactions',verifyJWT('patient'),gettransactions)
appointment.get('/showqr',showqr);
appointment.put('/in_progress',verifyJWT('patient'),update_inprogress)
appointment.get('/:appointmentID',get_appiontment)



export default appointment