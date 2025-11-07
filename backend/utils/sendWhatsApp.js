

export async function sendWhatsApp(toNumber, message, meta = {}) {
  try {
    console.log(`(whatsapp) → ${toNumber}: ${message}`);

    // TODO: replace with your real WhatsApp provider API here
    // Example placeholder:
    // await twilioClient.messages.create({
    //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    //   to: `whatsapp:${toNumber}`,
    //   body: message,
    // });

    return { ok: true };
  } catch (err) {
    console.error("sendWhatsApp error:", err);
    return { ok: false, meta: err };
  }
}
