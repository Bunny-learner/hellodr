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
    fee: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available','scheduled', 'cancelled'],
        default: 'available'
    },
}, { timestamps: true });


export const TimeSlot=mongoose.model('TimeSlot', TimeSlotSchema);
