import mongoose from "mongoose"

const medicinesc = new mongoose.Schema({
    drug_name:String ,
    medical_condition:String,
    medical_condition_description:String,
    activity:String,
    rx_otc:String,
    pregnancy_category:String,
    csa:String,
    rating:Number,
    no_of_reviews:Number,
    medical_condition_url:String,
    drug_link:String,
    src:String,
    })
export const Medicine=mongoose.model("medicine",medicinesc)
