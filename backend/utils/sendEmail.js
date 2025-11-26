import nodemailer from "nodemailer";
import emailTemplate from "./emailtemplate.js"

export async function sendEmail(toEmail, subject, body, meta = {}) {
  try {
    if (!toEmail) {
      console.warn("❗ sendEmail called without recipient email");
      return { ok: false, meta: "Missing recipient" };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = emailTemplate({
      title: subject,
      message: body,
      ...meta,
    });

    const text = body;

    const info = await transporter.sendMail({
      from: `"HelloDr" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      text,
      html,
    });

    console.log(" Email sent:", info.messageId);

    return { ok: true, meta: info };
  } catch (err) {
    console.error(" sendEmail error:", err);
    return { ok: false, meta: err };
  }
}
