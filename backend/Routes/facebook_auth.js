import { Router } from "express";
import {face_back} from "../controllers/patientcontrollers.js"
import passport from "passport";
const face_auth = Router()



face_auth.get('/', (req, res, next) => {
    const type = req.query.type || 'login'; // 'login' or 'signup'
    

    const authenticator = passport.authenticate('facebook', {
        scope: ['profile', 'email'],
        state: type 
    });

    // Execute the authenticator
    authenticator(req, res, next);
});
face_auth.get('/callback', passport.authenticate('facebook', { failureRedirect: '/patient/login' }),face_back);

export default face_auth;
