import {Router} from "express"
import {patientwelcome,categories ,main,getemail,login,signup, signup_details,phome,login_details, logoutuser} from "../controllers/patientcontrollers.js"
import router from "./page.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router2=Router()
router2.get('/',patientwelcome)
router2.get('/login',login)
router2.get('/signup',signup)
router2.post('/signupdetails',signup_details)
router2.post('/logindetails',login_details)
router2.get('/main',main)
router2.get('/main/consult',categories)
router2.get('/main/consult/:category',verifyJWT,phome)

// router2.get('/main/drugs',drugs)
router2.get('/getemail',verifyJWT,getemail)
router2.post('/logout',verifyJWT,logoutuser)

export default router2