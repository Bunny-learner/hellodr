import express,{Router} from "express"
import { authJWT } from "../middlewares/auth.authorize.js"
import { get_notifications,markallread } from "../controllers/notification.controllers.js"
const notify=Router()


notify.get('/getnotify',authJWT,get_notifications)
notify.post('/markallread',authJWT,markallread)


export default notify