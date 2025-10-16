import { asynchandler } from "../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

import {Appointment} from "../models/appointment.js"
import {Doctor} from "../models/doctor.js"
import {TimeSlot} from "../models/timeslot.js"


const book_appointment=asynchandler(async(req,res)=>{

    const {doctorID,date,symptoms,name,age,gender,phone,email}=req.body
    const patientID=req.user.id

    if(!doctorID || !date || !symptoms || !name || !age || !gender || !phone){
        res.status(400)
        throw new ApiError("All fields are required")
    }
    if(!email){
        email=req.user.email
    }

    const doctor=await Doctor.findById(doctorID)
    if(!doctor){
        res.status(404)
        throw new ApiError("Doctor not found")
    }

    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });

    const timeslot=await TimeSlot.find({doctor:doctorID, Day:dayName, StartTime:time})
    if(timeslot.length===0 || timeslot[0].status !== 'avaliable'){
        res.status(400)
        throw new ApiError("Time slot is not available")
    }

    const appointment=new Appointment({
        doctorID,
        patientID,
        name,
        age,
        gender,
        phone,
        email,
        date,
        TimeSlot:timeslot[0]._id,
        symptoms
    })
    await appointment.save()

    timeslot[0].isavailable=false
    await timeslot[0].save()
    res.status(201).json(new ApiResponse("Appointment booked successfully",appointment))
})

const get_patient_appointments=asynchandler(async(req,res)=>{
    const patientID=req.user.id
    const appointments=await Appointment.find({patient:patientID})
    res.status(200).json(new ApiResponse("Appointments fetched successfully",appointments))
})

const get_doctor_appointments=asynchandler(async(req,res)=>{
    const doctorID=req.user.id
    const appointments=await Appointment.find({doctor:doctorID})
    res.status(200).json(new ApiResponse("Appointments fetched successfully",appointments))
})

const update_appointment_status=asynchandler(async(req,res)=>{
    const {appointmentID,status}=req.body
    if(!appointmentID || !status){
        res.status(400)
        throw new ApiError("All fields are required")
    }
    const appointment=await Appointment.findById(appointmentID)
    if(!appointment){
        res.status(404)
        throw new ApiError("Appointment not found")
    }
    appointment.status=status
    await appointment.save()
    res.status(200).json(new ApiResponse("Appointment status updated successfully",appointment))
})

const get_appiontment=asynchandler(async(req,res)=>{
    const {appointmentID}=req.params
    if(!appointmentID){
        res.status(400)
        throw new ApiError("Appointment ID is required")
    }
    const appointment=await Appointment.findById(appointmentID)
    if(!appointment){
        res.status(404)
        throw new ApiError("Appointment not found")
    }
    res.status(200).json(new ApiResponse("Appointment fetched successfully",appointment))
})




export {book_appointment,get_patient_appointments,get_doctor_appointments,update_appointment_status,get_appiontment}