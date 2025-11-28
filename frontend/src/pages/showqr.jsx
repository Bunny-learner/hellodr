import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../css/showqr.css";
import Waiting from "../components/Loaders/waiting";
import Logo from "../pages/logo"; 

const API = import.meta.env.VITE_API_URL;

export default function ShowQR() {
  const [searchParams] = useSearchParams();
  const apptId = searchParams.get("appt");

  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apptId) return;

    const fetchQR = async () => {
      try {
        const res = await fetch(`${API}/appointment/showqr?appt=${apptId}`);

        if (!res.ok) throw new Error("Invalid QR or Appointment not found");

        const data = await res.json();
        setQrData(data);
      } catch (err) {
        setQrData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [apptId]);

  if (loading) {
    return (
      <div className="qr-loader">
        <div className="loader-spinner"><Waiting /></div>
        <p>Loading your QR...</p>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="qr-error">
        <h2>Invalid Appointment</h2>
        <p>The QR code link is invalid or expired.</p>
      </div>
    );
  }

  return (
    <div className="qr-wrapper">
      <div className="qr-card">

        {/* ---------- LOGO + HOSPITAL NAME ---------- */}
        <div className="qr-header">
          <Logo className="qr-logo" size={80} />
          <h1 className="hospital-name">Hello Dr</h1>
        </div>

        <h2 className="qr-title">Appointment QR Code</h2>

        <p className="qr-desc">
          Show this QR code at the clinic for verification.
        </p>

        <div className="qr-image-container">
          <img src={qrData.qrImage} alt="QR Code" className="qr-image" />
        </div>

        <div className="backup-token">
          Backup Token: <strong>{qrData.tokenNumber}</strong>
        </div>

        <div className="divider"></div>

        <div className="qr-info">
          <p><span>Patient:</span> {qrData.patientName}</p>
          <p><span>Doctor:</span> {qrData.doctorName}</p>
          <p><span>Date:</span> {new Date(qrData.date).toDateString()}</p>
          <p><span>Time:</span> {qrData.startTime} – {qrData.endTime}</p>
        </div>

        <div className="qr-actions">
          <button
            className="qr-btn"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>

          <button
            className="qr-btn qr-btn-blue"
            onClick={() => {
              const a = document.createElement("a");
              a.href = qrData.qrImage;
              a.download = "appointment-qr.png";
              a.click();
            }}
          >
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}
