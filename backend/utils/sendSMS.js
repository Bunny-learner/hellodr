// helpers/sendSMS.js

export async function sendSMS(toNumber, message, meta = {}) {
  try {
    console.log(`(sms) → ${toNumber}: ${message}`);

    // TODO: replace with SMS provider logic (Twilio, Vonage, etc.)
    // Example:
    // await twilioClient.messages.create({
    //   from: process.env.TWILIO_SMS_NUMBER,
    //   to: toNumber,
    //   body: message,
    // });

    return { ok: true };
  } catch (err) {
    console.error("sendSMS error:", err);
    return { ok: false, meta: err };
  }
}
