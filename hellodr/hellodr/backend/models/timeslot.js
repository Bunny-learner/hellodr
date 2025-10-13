import mongoose from 'mongoose';

const TimeSlotSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    Day: {
        type: String,
        required: true
    },
    StartTime: {
        type: String,
        required: true
    },
    EndTime: {
        type: String,
        required: true
    },
    isavailable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
}, { timestamps: true });


export const Appointment=mongoose.model('TimeSlot', TimeSlotSchema);
