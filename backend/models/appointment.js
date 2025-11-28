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
    mode: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
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
        enum: ['pending', 'accepted', 'cancelled', 'completed', 'in_progress', 'next_up', 'skipped', 'no_show'],
        default: 'pending'
    },
    patientjoinenabled: {
        type: Boolean,
        default: false
    },
    token_number: {
        type: Number,
        default: null
    },
    TimeSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true
    },
    verifyToken: {
        type: String,
        default: null
    },

    qrPayload: {
        type: String,
        default: null
    },

    qrImage: {
        type: String,  
        default: null
    },

    completedVerified: {
        type: Boolean,
        default: false
    },

    checkedInAt: {
        type: Date,
        default: null
    },

}, { timestamps: true });


export const Appointment = mongoose.model('Appointment', AppointmentSchema);
