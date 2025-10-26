import express from "express";
import Stripe from "stripe";
import {authorize} from "../controllers/stripecontrollers.js"


const hooker = express.Router();



hooker.post("/webhook",express.raw({ type: "application/json" }),authorize);

export default hooker;


