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
  isdoctor: {
    type: Boolean,
    default: false
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

const Notification = mongoose.model('Notification', notificationSchema);