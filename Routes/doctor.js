import {Router} from "express"
import {doctorwelcome,reviews,profile,getemail,getsocketid,login,logindata,dhome, logoutuser} from "../controllers/doctorcontrollers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router1=Router()
router1.get('/',doctorwelcome)
router1.get('/login',login)
router1.post('/logindata',logindata)
router1.get('/dhome',dhome)
router1.get('/dhome/profile',profile)
router1.get('/dhome/reviews',reviews)
router1.get('/getemail',verifyJWT,getemail)
router1.get('/getsocketid',getsocketid)
router1.post('/logout',verifyJWT,logoutuser)
export default router1