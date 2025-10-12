import express,{Router} from "express"
import {signdata,searchresults,unseen,getdraftpost,addingnotif,getreqposts,changestatus,logindata,viewpost,posturls,allposts,users,addpost,role,logs,logout,dashdata,changerole, msgs,likeordislike, addcomment} from "../controllers/usercontrollers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router=Router()

router.post('/signdata',signdata)
router.post('/logindata',logindata)
router.post('/role',verifyJWT,role)
router.post('/logout',verifyJWT,logout)
router.get('/dashdata',verifyJWT,dashdata)
router.get('/home/users',verifyJWT,users)
router.get('/home/logs',verifyJWT,logs)
router.post('/home/role',verifyJWT,changerole)
router.post('/addpost',verifyJWT,addpost)
router.get('/allposts',verifyJWT,allposts)
router.post('/postview',verifyJWT,viewpost)
router.post('/posturls',verifyJWT,posturls)
router.get('/searchresults',verifyJWT,searchresults)
router.post('/getreqposts',verifyJWT,getreqposts)
router.post('/getdraftpost',verifyJWT,getdraftpost)
router.post('/msgs',verifyJWT,msgs)
router.post('/addingnotif',verifyJWT,addingnotif)
router.post('/changestatus',verifyJWT,changestatus)
router.post('/unseen',verifyJWT,unseen)
router.post('/upordown',verifyJWT,likeordislike)
router.post('/addcomment',verifyJWT,addcomment)
export default router