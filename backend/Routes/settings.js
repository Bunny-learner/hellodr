import express,{Router} from "express"
import {authJWT} from "../middlewares/auth.authorize.js"

import {set_preferences,subscribe_push} from "../controllers/settings.controllers.js"
const setter=Router()



setter.post('/setpref',authJWT,set_preferences)
setter.post('/subscribe',authJWT,subscribe_push)
export default setter