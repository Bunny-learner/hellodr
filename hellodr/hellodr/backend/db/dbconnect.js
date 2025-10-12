import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let db; 

const dbconnection = async () => {
    try {
        db = await mongoose.connect(process.env.database_url);
        console.log("Successfully connected to MongoDB!");
    } catch (error) {
        console.error("Connection failed to MongoDB!!", error);
        process.exit(1); 
    }
};

export { dbconnection, db };
