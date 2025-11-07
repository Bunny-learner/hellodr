export default function emailTemplate({ title, message, appointmentId, doctor, patient }) {
  const logo =
    process.env.HELLODR_LOGO_URL ||
    "https://res.cloudinary.com/decmqqc9n/image/upload/v1761322083/ui3dj3ejv2ij71xuvj9s.png";
    
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f5f7fa;
          margin: 0;
          padding: 0;
        }
        .container {
          background: #ffffff;
          max-width: 600px;
          margin: 30px auto;
          padding: 25px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .logo {
          display: block;
          width: 140px;
          margin: 0 auto 20px;
        }
        h2 {
          margin: 0 0 15px;
          font-size: 22px;
          color: #1e293b;
          text-align: center;
        }
        p {
          font-size: 15px;
          color: #475569;
          line-height: 1.6;
        }
        .card {
          background: #f1f5f9;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          font-size: 14px;
        }
        .footer {
          margin-top: 25px;
          font-size: 13px;
          color: #94a3b8;
          text-align: center;
        }
        .btn {
          display: inline-block;
          background: #2563eb;
          color: #fff !important;
          padding: 10px 16px;
          border-radius: 6px;
          margin-top: 20px;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>

    <body>
      <div class="container">

        <img src="${logo}" alt="HelloDr" class="logo" />

        <h2>${title}</h2>

        <p>${message}</p>

        ${
          doctor || patient
            ? `
        <div class="card">
          ${doctor ? `<p><strong>Doctor:</strong> ${doctor?.name}</p>` : ""}
          ${patient ? `<p><strong>Patient:</strong> ${patient?.name}</p>` : ""}
          ${
            appointmentId
              ? `<p><strong>Appointment ID:</strong> ${appointmentId}</p>`
              : ""
          }
        </div>
        `
            : ""
        }

        <p>If you have any questions, please contact us.</p>

        <a class="btn" href="${process.env.WEB_URL || "#"}">
          Go to Dashboard
        </a>

        <div class="footer">
          <p>Thank you for using HelloDr</p>
          <p>© ${new Date().getFullYear()} HelloDr. All rights reserved.</p>
        </div>

      </div>
    </body>
  </html>
`;
}
