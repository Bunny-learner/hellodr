import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", 
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null, 
    },
    date: {
        type: Date,
        default:Date.now 
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
