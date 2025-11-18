import mongoose from "mongoose";
const prescriptionSchema = new mongoose.Schema({
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
    medications: [{
        type: String}]
    }, { timestamps: true });

export const Prescription = mongoose.model('prescription', prescriptionSchema);