import jwt from "jsonwebtoken";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { doctor } from "../models/doctor.model.js";
import { patient } from "../models/patient.model.js";

export const verifyJWT = asynchandler(async (req, res, next) => {
    console.log("Verifying token...");

    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "");
       
        let who = req.cookies.who;
        if(req.header.who=="doctor")
            who=req.header.who
        console.log(who)
        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }
        if (!who || (who !== "patient" && who !== "doctor")) {
            throw new ApiError(400, "Invalid 'who' header. Must be 'patient' or 'doctor'");
        }

        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decodedtoken)
        const userModel = who === "patient" ? patient : doctor;
        const user = await userModel.findById(decodedtoken._id).select("-password -refreshtoken");
        console.log("do you know")
        if (!user) {
            throw new ApiError(401, "User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid or expired token");
    }
});
