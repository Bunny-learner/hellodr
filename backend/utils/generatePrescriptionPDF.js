import PDFDocument from "pdfkit";

export function createPrescriptionPDF(prescriptionData, patientData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));

      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      /* ========= PDF Content Drawing ========= */

      const pageWidth = doc.page.width;
      const marginLeft = 40;
      let y = 40;

      // Header
      doc.fontSize(20).font("Helvetica-Bold").text(prescriptionData.clinicName || "Clinic / Hospital Name", marginLeft, y);
      doc.fontSize(12).font("Helvetica").text(`Address: ${prescriptionData.clinicAddress || "__________________"}`, marginLeft, y + 25);
      doc.text(`Phone: ${prescriptionData.clinicPhone || "__________________"}`, marginLeft, y + 45);
      y += 100;

      doc.strokeColor("#cccccc").lineWidth(1).moveTo(marginLeft, y).lineTo(pageWidth - marginLeft, y).stroke();
      y += 25;

      // Patient Info
      doc.fontSize(14).font("Helvetica-Bold").text("Patient Details", marginLeft, y);
      y += 20;
      doc.fontSize(12).font("Helvetica");
      doc.text(`Name: ${patientData.name}`, marginLeft, y); y += 18;
      doc.text(`Age / Gender: ${patientData.age} / ${patientData.gender}`, marginLeft, y); y += 18;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, marginLeft, y); y += 25;

      // Doctor Info
      doc.fontSize(14).font("Helvetica-Bold").text("Doctor Details", marginLeft, y);
      y += 20;
      doc.fontSize(12).font("Helvetica");
      doc.text(`Doctor: ${prescriptionData.doctorName}`, marginLeft, y); y += 18;
      y += 30;

      // Diagnosis
      doc.fontSize(14).font("Helvetica-Bold").text("Diagnosis", marginLeft, y);
      y += 18;
      doc.fontSize(12).font("Helvetica");
      doc.text(prescriptionData.diagnosis || "-", { width: pageWidth - (marginLeft * 2) });
      y = doc.y + 40;

      // Medications
      doc.fontSize(14).font("Helvetica-Bold").text("Medications (Rx)", marginLeft, y);
      y += 22;
      doc.fontSize(12).font("Helvetica");

      if (!prescriptionData.medications || prescriptionData.medications.length === 0) {
        doc.text("- No medications prescribed -", marginLeft, y);
        y += 20;
      } else {
        doc.font("Helvetica-Bold");
        doc.text("Medicine", marginLeft, y);
        doc.text("Dose", marginLeft + 200, y);
        doc.text("Quantity", marginLeft + 300, y);
        doc.text("Notes", marginLeft + 400, y);
        doc.font("Helvetica");
        y += 20;

        prescriptionData.medications.forEach((m) => {
          const startY = y;
          doc.text(m.name || "N/A", marginLeft, y, { width: 180 });
          doc.text(m.dose || "N/A", marginLeft + 200, y, { width: 80 });
          doc.text(m.qty || "N/A", marginLeft + 300, y, { width: 80 });
          doc.text(m.notes || "-", marginLeft + 400, y, { width: 150 });

          const endY = Math.max(doc.y, startY + 20);
          y = endY + 10;

          doc.strokeColor("#eeeeee").lineWidth(1).moveTo(marginLeft, y - 5).lineTo(pageWidth - marginLeft, y - 5).stroke();
        });

        y += 10;
      }

      // Notes
      doc.fontSize(14).font("Helvetica-Bold").text("Doctor's Notes", marginLeft, y);
      y += 20;
      doc.fontSize(12).font("Helvetica");
      doc.text(prescriptionData.notes || "-", { width: pageWidth - (marginLeft * 2) });
      y = doc.y + 40;

      // Footer
      y = doc.page.height - 100;
      doc.strokeColor("#cccccc").lineWidth(1).moveTo(marginLeft, y).lineTo(pageWidth - marginLeft, y).stroke();
      y += 20;
      doc.fontSize(12).font("Helvetica-Bold").text("Consultation completed via HelloDr", marginLeft, y);
      doc.fontSize(10).font("Helvetica").text(prescriptionData.doctorSignature || `Dr. ${prescriptionData.doctorName}`, marginLeft, y + 20);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
