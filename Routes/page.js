import {Router} from 'express'
import {page,auth,doctor,patient,callback,login_details,signup_details,signup,login,welcome,help,username} from "../controllers/usercontrollers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";




const router=Router()


router.get('/',welcome)
// router.get('/signup',signup)
// router.get('/login',login)
// router.get('/doctor',doctor)
// router.get('/patient',patient)
// router.post('/login_details',login_details)
// router.post('/signup_details',signup_details)
// router.get('/chat',page)
// router.get('/username',verifyJWT,username)
// router.get('/Home',welcome)
// router.get('/help',help)
// router.get('/auth/google',auth)
// router.get('/auth/google/callback',callback)

export default router