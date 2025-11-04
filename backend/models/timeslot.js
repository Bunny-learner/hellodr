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
    mode: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
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
    limit:{
        type:Number,
        default:10
    },
    booked:{
        type:Number,
        default:0
    },
    status: {
        type: String,
        enum: ['available', 'full','cancelled'],
        default: 'available'
    },
}, { timestamps: true });


export const TimeSlot=mongoose.model('TimeSlot', TimeSlotSchema);
