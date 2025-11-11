import express,{Router} from "express"
import {authJWT} from "../middlewares/auth.authorize.js"

import {set_preferences} from "../controllers/settings.controllers.js"
const setter=Router()



setter.post('/setpref',authJWT,set_preferences)
export default setter