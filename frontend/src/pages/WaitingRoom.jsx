// src/pages/WaitingRoom.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useSocket } from "./SocketContext.jsx";
import "../css/waitingroom.css";
import SoftAnimatedBackground from "../components/Loaders/softbackground.jsx";

const WAIT_SECONDS = 60; 

export default function WaitingRoom() {
  const { socket, isConnected } = useSocket();
  const { roomid } = useParams();
  const params = new URLSearchParams(window.location.search);

  const role = params.get("user");          // "doctor" | "patient"
  const consultationId = params.get("consultationId");

  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);
  const [otherPresent, setOtherPresent] = useState(false);

  /* =========  JOIN ROOM + TRACK PRESENCE ========= */
  useEffect(() => {
    if (!socket || !isConnected || !roomid) return;

    socket.emit("join_room", { roomid, role });

    const handlePresence = (presence) => {
      // presence = { doctor: bool, patient: bool }
      if (role === "doctor") {
        setOtherPresent(presence.patient);
      } else {
        setOtherPresent(presence.doctor);
      }
    };

    const handlePresenceChange = ({ role: who, present }) => {
      if (role === "doctor" && who === "patient") {
        setOtherPresent(present);
      } 
      if (role === "patient" && who === "doctor") {
        setOtherPresent(present);
      }
    };

    socket.on("room_presence", handlePresence);
    socket.on("presence_change", handlePresenceChange);

    return () => {
      socket.off("room_presence", handlePresence);
      socket.off("presence_change", handlePresenceChange);
    };
  }, [socket, isConnected, roomid, role]);


  /* =========  TIMER LOGIC ========= */
  useEffect(() => {
    /* ✅ If other person joined — go to chat */
    if (otherPresent) {
      toast.success(
        role === "doctor" ? "Patient joined!" : "Doctor joined!"
      );

      navigate(`/chat/${roomid}?consultationId=${consultationId}&user=${role}`);
      return;
    }

    /* ✅ Timer finished — handle based on role */
    if (secondsLeft <= 0) {
      if (role === "doctor") {
        // Doctor sees Skip button → user manually clicks
        return;
      } else {
        // Patient runs out of time → redirect home
        toast.error("Doctor did not join. Try again later.");
        navigate("/patient/home");
      }
    }

    /* countdown */
    const t = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [secondsLeft, otherPresent, role]);


  /* ========= DOCTOR ONLY — SKIP PATIENT ========= */
  const handleSkip = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/appointment/changestatus?info=skip`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            appointmentID: consultationId,
            status: "skipped",
          }),
        }
      );

      if (!res.ok) throw new Error("Failed");

      toast.success("Patient skipped");
      navigate("/doctor/appointments");
    } catch (e) {
      toast.error("Error skipping");
    }
  };


  return (
    <SoftAnimatedBackground>
      <div className="wr-container">
        <div className="wr-card">
          <h2 className="wr-title">
            Waiting for {role === "doctor" ? "Patient" : "Doctor"}
          </h2>

          {!otherPresent && (
            <>
              <p className="wr-subtitle">
                Please wait while we connect you to the consultation.
              </p>

              <div className="wr-timer-circle">
                <span className="wr-timer-text">{secondsLeft}s</span>
              </div>
            </>
          )}

          {otherPresent && (
            <p className="wr-joining">
              ✅ Connected — Opening consultation...
            </p>
          )}

          {/** Doctor-only Skip Button when time is over */}
          {role === "doctor" && !otherPresent && secondsLeft <= 0 && (
            <button onClick={handleSkip} className="wr-skip-btn">
              Skip Patient
            </button>
          )}
        </div>
      </div>
    </SoftAnimatedBackground>
  );
}
