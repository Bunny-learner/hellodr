import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let db; // Declare `db` at the top so it can be used globally

const dbconnection = async () => {
    try {
        db = await mongoose.connect(process.env.database_url);
        console.log("Successfully connected to MongoDB!");
    } catch (error) {
        console.error("Connection failed to MongoDB!!", error);
        process.exit(1); // Exit the process with a failure code
    }
};

export { dbconnection, db };
