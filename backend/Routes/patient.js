import express,{Router} from "express"
import {pat_login,getreviews,addreview,logout,allslots,updateprofile,profile,getdoctors,cloudcred,filterdoctors,uploadimg,pat_signup,pat_reset,pat_verify,pat_send} from "../controllers/patientcontrollers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { get_all_appointments } from "../controllers/appointment.controllers.js"
const patient=Router()



patient.post('/signdata',pat_signup)
patient.post('/logindata',pat_login)
patient.post('/verifycode',pat_verify)
patient.post('/resendcode',pat_send)
patient.post('/sendcode',pat_send)
patient.post('/reset',pat_reset)
patient.post('/filterdoctors',filterdoctors)
patient.post('/updateprofile',verifyJWT('patient'),updateprofile)
patient.get('/cloudcred',cloudcred)
patient.get('/allslots',allslots)
patient.get('/getdoctors',getdoctors)
patient.get('/profile',verifyJWT('patient'),profile)
patient.post('/uploadimg',verifyJWT('patient'),uploadimg)
patient.get('/appointments',verifyJWT('patient'),get_all_appointments)
patient.get('/logout',verifyJWT('patient'),logout)
patient.post('/addreview',verifyJWT('patient'),addreview)
patient.get('/reviews/:id',getreviews)




export default patient