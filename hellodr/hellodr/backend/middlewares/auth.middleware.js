import jwt from "jsonwebtoken";
import { user } from "../models/schema.js"; // Make sure this path is correct

export const verifyJWT = async (req, res, next) => {

    console.log("---------- verifyJwt middleware started ----------");

    // 1. Check if req.cookies object exists and contains accesstoken
    console.log("req.cookies:", req.cookies); // Verify cookies are parsed by cookie-parser
    const accessToken = req.cookies?.accesstoken; // Use optional chaining for safety

    if (!accessToken) {
        console.log("Access token missing in req.cookies.");
        return res.json({istoken: false, message: "Access token is missing." }); 
    }
    console.log("Access token found:", accessToken);

    // 2. Verify the token
    try {
        // Make sure process.env.ACCESS_TOKEN_SECRET is correctly loaded and matches the secret used to GENERATE the token
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log("Token decoded successfully:", decodedToken);

        // 3. Find the user
        const u = await user.findById(decodedToken._id).select("-password -refreshtoken"); // Adjust fields as needed
        if (!u) {
            console.log("User not found from token payload.");
            return res.status(401).json({ message: "User not found." });
        }
        console.log("User found:", u.username);

        // 4. Attach user to request
        req.user = u;
        console.log("req.user populated.");

        // 5. Proceed to next middleware/route handler
        next();

    } catch (error) {
        // Log specific JWT errors
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