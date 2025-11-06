import mongoose,{Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const notificationSchema = new Schema({
  patientid: {
    type: Schema.Types.ObjectId,
    ref: 'Patient'
  },
  doctorid: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor' 
  },
  appointmentid: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  orderid: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
 from:{
  type:String,
  required:true
 },
 to:{
  type:String,
  required:true
 },
  message: {
    type: String,
    required: true
  },
  isread: {
    type: Boolean,
    default: false
  },
  sentat: {
    type: Date,
    default: Date.now
  },
  isappointment: { 
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema);