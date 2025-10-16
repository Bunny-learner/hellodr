import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
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
    Remark: {
        type: String
    },
    Stars: {
        type: Number
    },
}, { timestamps: true });

export const Review=mongoose.model('Review', ReviewSchema);
