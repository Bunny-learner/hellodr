import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    name:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    gender:{
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    symptoms: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending','accepted','cancelled','completed'],
        default: 'pending'
    },
    TimeSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true
    }
}, { timestamps: true });


export const Appointment=mongoose.model('Appointment', AppointmentSchema);
