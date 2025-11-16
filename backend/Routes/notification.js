import express,{Router} from "express"
import { authJWT } from "../middlewares/auth.authorize.js"
import { get_allnotifications, mark_read,get_notifications,delete_notification,markallread } from "../controllers/notification.controllers.js"
const notify=Router()


notify.get('/getnotify',authJWT,get_notifications)
notify.post('/markallread',authJWT,markallread)
notify.get('/getallnotify',authJWT,get_allnotifications)
notify.delete('/deletenotify/:notificationId',authJWT,delete_notification)
notify.get('/markread/:notificationId',authJWT,mark_read)
export default notify