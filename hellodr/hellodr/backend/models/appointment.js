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
    Date: {
        type: Date,
        required: true
    },
    patientDisease: {
        type: String
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    TimeSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true
    }
}, { timestamps: true });


export const Appointment=mongoose.model('Appointment', AppointmentSchema);
