import express,{Router} from "express"
import {doc_login,doc_signup} from "../controllers/usercontrollers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const doctor=Router()


doctor.post('/signdata',doc_signup)
doctor.post('/logindata',doc_login)
export default doctor