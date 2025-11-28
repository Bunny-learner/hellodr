// middleware/verifyJWT.js
import jwt from "jsonwebtoken";
import { Patient } from "../models/patient.js"
import { Doctor } from "../models/doctor.js";


export const verifyJWT = (userType) => {
  return async (req, res, next) => {
    try {
      
      const token = req.cookies["_host_AUTH"];
      

      if (!token) {
        return res.status(401).json({ message: "Access token missing" ,istoken:false});
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      let user;
      
      if (userType === "doctor") {
          user = await Doctor.findById(decoded._id);
      } else if (userType === "patient") {
        user = await Patient.findById(decoded._id);

      } else {
        return res.status(400).json({ message: "Invalid user type" });
      }
     
      if (!user) {
        console.log(decoded._id)
        return res.status(404).json({ message: `${userType} not found`,'accesstoken':token });
      }

      req.user = user;
      req.userType = userType;
      next();
    } catch (error) {
    
        if (error.name === 'TokenExpiredError') {
            console.error("JWT Error: Token Expired");
            // You might handle refresh token here, but for now, just unauthorized
            return res.status(401).json({ message: "Unauthorized: Token expired." });
        } else if (error.name === 'JsonWebTokenError') {
            console.error("JWT Error: Invalid Token", error.message);
            return res.status(401).json({ message: "Unauthorized: Invalid token." });
        } else {
            console.error("Unknown verification error:", error);
            return res.status(500).json({ message: "Internal server error during token verification." });
        }
    }
    console.log("---------- verifyJwt middleware finished ----------");
  };
};