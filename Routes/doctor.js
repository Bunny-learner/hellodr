import {Router} from "express"
import {lookdb,writereview,gethistory,history,reviews,uploadprofile,dbupload,profile,getemail,getsocketid,pendingrequests,login,logindata,dhome, logoutuser} from "../controllers/doctorcontrollers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router1=Router()

router1.get('/login',login)
router1.post('/logindata',logindata)
router1.get('/dhome',verifyJWT,dhome)
router1.get('/dhome/profile',verifyJWT,profile)
router1.get('/dhome/reviews',verifyJWT,reviews)
router1.get('/getemail',verifyJWT,getemail)
router1.get('/getsocketid',getsocketid)
router1.post('/logout',verifyJWT,logoutuser)
router1.post('/pendingrequests',pendingrequests)
router1.get('/uploadprofile',uploadprofile)
router1.post('/dbupload',verifyJWT,dbupload)
router1.get('/lookdb',verifyJWT,lookdb)
router1.post('/writeReviews',writereview)
router1.post('/history',verifyJWT,history)
router1.get('/dhome/history',verifyJWT,gethistory)
export default router1