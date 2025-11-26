import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import dotenv from "dotenv";
dotenv.config();
const API = process.env.backend_URL;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));


passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${API}/auth/facebook/callback`,
      profileFields: ["id", "displayName", "email", "picture.type(large)"], // request email & picture
    },
    (accessToken, refreshToken, profile, done) => {
      
      return done(null, profile);
    }
  )
);

export default passport;
