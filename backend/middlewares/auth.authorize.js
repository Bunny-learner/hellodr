import jwt from "jsonwebtoken";

export const authJWT = (req, res, next) => {
  try {
    const token = req.cookies?.accesstoken;

    console.log("accesstoken ->",token)

    if (!token) {
      return res.status(401).json({ message: "Access token missing", istoken: false });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);


    req.userId = decoded._id;
    req.role=decoded.role

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized: Invalid token." });
    } else {
      return res.status(500).json({ message: "Internal server error during token verification." });
    }
  }
};
