import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["appointment", "order"], 
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: function () { return this.type === "appointment"; },
    },
    // order: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Order", 
    // },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: function () { return this.type === "appointment"; },
    },
    amount: {
      type: Number, 
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentStatus: {
      type: String,
      enum: ["authorized","pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "other"],
      default: "card",
    },
    stripePaymentIntentId: {
      type: String,
    },
    stripeCheckoutSessionId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", TransactionSchema);
