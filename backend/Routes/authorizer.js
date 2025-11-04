import express,{Router} from "express"
import { authJWT } from "../middlewares/auth.authorize.js"
import {authorize} from "../controllers/appointment.controllers.js"

const authorizer=Router()

authorizer.get('/auth',authJWT,authorize)


export default authorizer