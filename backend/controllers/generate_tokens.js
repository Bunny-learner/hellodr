import { asynchandler } from "../utils/asynchandler.js"
import dotenv from 'dotenv'
import { Patient } from "../models/patient.js"
import { Doctor } from "../models/doctor.js"
import { cloudinary } from "../utils/cloudinary.js"

dotenv.config({ quiet: true })

const generate = async (userid,role) => {
  try {
   
    const Model = role === "doctor" ? Doctor : Patient

    
    const user = await Model.findById(userid)
    console.log(user)
    if (!user) throw new Error("User not found")

    const accesstoken = user.generateAccessToken()
    const refreshtoken = user.generateRefreshToken()

    // save refresh token
    user.refreshtoken = refreshtoken
    await user.save({ validateBeforeSave: false })
  console.log("inside generate :",accesstoken )
    return { accesstoken, refreshtoken }

  } catch (error) {
    console.error("Access token generation failed:", error.message)
    return null
  }
}

export { generate }
