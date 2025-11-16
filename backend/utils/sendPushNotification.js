import webpush from "web-push";
import dotenv from "dotenv"
dotenv.config({ quiet: true })

webpush.setVapidDetails(
  "mailto:cs23bt045@iitdh.ac.in",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * @param {object} subscription 
 * @param {string} payload 
 */

export async function sendPushNotification(subscription, payload) {
  if (!subscription || !subscription.endpoint) {
    throw new Error("Invalid push subscription object.");
  }

  try {
    await webpush.sendNotification(subscription, payload);

  } catch (err) {
    // If status code is 410 (Gone) or 404, the subscription is expired.
    // You should catch this error in your processor and remove
    // the subscription from your database.
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.warn("Subscription expired or invalid, should be removed.");
      throw err;
    } else {
      console.error("Error sending push notification:", err.stack);
      throw err;
    }
  }
}