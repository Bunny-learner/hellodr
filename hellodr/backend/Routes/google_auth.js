import { Router } from "express";
import {pat_back} from "../controllers/patientcontrollers.js"
import passport from "passport";
const google_auth = Router()



google_auth.get('/', (req, res, next) => {
    const type = req.query.type || 'login'; // 'login' or 'signup'
    

    const authenticator = passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: type 
    });

    // Execute the authenticator
    authenticator(req, res, next);
});
google_auth.get('/callback', passport.authenticate('google', { failureRedirect: '/patient/login' }),pat_back);

export default google_auth;
