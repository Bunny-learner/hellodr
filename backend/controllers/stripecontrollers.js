import { asynchandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import Stripe from "stripe";
import { Appointment } from "../models/appointment.js"
import { Doctor } from "../models/doctor.js"
import { TimeSlot } from "../models/timeslot.js"
import { Transaction } from "../models/transactions.js"
import mongoose from "mongoose"


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const authorize=asynchandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const transaction = await Transaction.findOne({
          stripeCheckoutSessionId: session.id,
        });

        if (transaction) {
          transaction.paymentStatus = "authorized"; 
          transaction.stripePaymentIntentId = session.payment_intent;
          await transaction.save();
          console.log(`Transaction ${transaction._id} authorized (on hold).`);
        }
        break;


      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  })



  export {authorize}