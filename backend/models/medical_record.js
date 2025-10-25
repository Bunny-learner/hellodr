import mongoose from 'mongoose';

const RecordSchema = new mongoose.Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointment: {
        type:Schema.Types.ObjectId,
        ref:'Appointment',
        required:true
    },
    type: {
        type: String,
        enum: ['Prescription', 'LabReport', 'Invoice', 'Other'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    Date: {
        type: Date,
        required: true
    }
}, { timestamps: true });

export const MedicalRecord=mongoose.model('Review', RecordSchema);
