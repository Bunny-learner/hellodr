const orderSchema = new Schema({
  patientid: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  itemid: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  orderedate: {
    type: Date,
    default: Date.now
  },
  deliverydate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  paymentid: {
    type: Schema.Types.ObjectId,
    ref: 'Payment' 
  },
  totalamount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);