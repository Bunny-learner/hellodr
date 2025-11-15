// ChatPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiSend,
  FiPaperclip,
  FiMoreVertical,
  FiVideo,
  FiPhone,
  FiFileText,
  FiHeart,
  FiCalendar,
  FiX,
  FiFile,
  FiLoader
} from "react-icons/fi";
import toast from "react-hot-toast";
import "../css/chatpage.css";
import Message from "../components/Loaders/message.jsx";
import { useSocket } from "./SocketContext.jsx";
import { jsPDF } from "jspdf";

const formatChatTimestamp = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const CLOUDINARY_CLOUD_NAME = "decmqqc9n";
const CLOUDINARY_UPLOAD_PRESET = "hellodr";

export default function ChatPage() {
  const { socket, isConnected } = useSocket();
  const params = new URLSearchParams(window.location.search);
  const role = params.get("user"); // "patient" or "doctor"
  const consultationId = params.get("consultationId");
  const { roomid } = useParams();
  const navigate = useNavigate();
  const currentUserID = params.get("user");

  /* ========= PATIENT DETAILS (from localStorage 'current') ========= */
  const [patientInfo] = useState(() => {
    const stored = localStorage.getItem("current");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        console.error("Error reading user data");
      }
    }
    return {
      _id: "",
      name: "",
      gender: "Male",
      age: "",
      bloodGroup: "",
      allergies: "",
      lastAppointment: "",
      avatarUrl: "",
    };
  });

  /* ========= CHAT STATE ========= */
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimer = useRef(null);

  const [roomPresence, setRoomPresence] = useState({ doctor: false, patient: false });
  const [otherPresent, setOtherPresent] = useState(false);

  /* ========= TIMER ========= */
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  /* ========= PRESCRIPTION OVERLAY ========= */
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  /* SCROLL DOWN ON NEW MESSAGE */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  /* LOAD OR INITIALIZE TIMER (persists across reloads) */
  useEffect(() => {
    const key = "consult_start_" + roomid;
    const savedStart = localStorage.getItem(key);
    if (savedStart) {
      startTimerFromSaved(parseInt(savedStart, 10));
    }

    // Prevent back navigation away from chat during consultation
    const pushBack = () => window.history.pushState(null, "", window.location.href);
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", pushBack);

    // Prevent refresh/navigation
    const beforeUnload = (e) => {
      // show confirmation only if consult active
      if (localStorage.getItem(key)) {
        e.preventDefault();
        e.returnValue = "Consultation is in progress. Reloading will lose unsaved data.";
        return "Consultation is in progress. Reloading will lose unsaved data.";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("popstate", pushBack);
      window.removeEventListener("beforeunload", beforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimerFresh = () => {
    const startTime = Date.now();
    localStorage.setItem("consult_start_" + roomid, String(startTime));
    startTimerFromSaved(startTime);
  };

  const startTimerFromSaved = (startTime) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const endTimer = () => {
    stopTimer();
    localStorage.removeItem("consult_start_" + roomid);
  };

  const formatTimer = (secs) => {
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  /* SOCKET HANDLERS: join room, receive messages, presence, typing, consultation end */
  useEffect(() => {
    if (!socket || !isConnected || !roomid || !role) return;

    socket.emit("join_room", { roomid, role });

    // ensure start time exists
    const key = "consult_start_" + roomid;
    if (!localStorage.getItem(key)) {
      startTimerFresh();
    }

    const handleReceiveMessage = (data) => {
      setMessages((p) => [...p, data]);
    };

    const handleTyping = () => {
      setIsOtherTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        setIsOtherTyping(false);
      }, 2000);
    };

    const handleRoomPresence = (presence) => {
      // presence: { doctor: bool, patient: bool }
      setRoomPresence(presence);
      if (role === "patient") setOtherPresent(presence.doctor);
      else setOtherPresent(presence.patient);

      // stop timer only when both have left
      if (!presence.doctor && !presence.patient) {
        endTimer();
      } else {
        // ensure timer is running if someone present
        const savedStart = localStorage.getItem(key);
        if (savedStart) startTimerFromSaved(parseInt(savedStart, 10));
      }
    };

    const handleConsultationOver = () => {
      toast("Consultation ended");
      endTimer();
      if (role === "patient") navigate("/patient/home");
      else navigate("/doctor/appointments");
    };

    socket.on("send_topat", handleReceiveMessage);
    socket.on("send_todoc", handleReceiveMessage);
    socket.on("pat_types", handleTyping);
    socket.on("doc_types", handleTyping);
    socket.on("room_presence", handleRoomPresence);
    socket.on("consultation_over", handleConsultationOver);

    return () => {
      socket.emit("leave_room", { roomid, role });
      socket.off("send_topat", handleReceiveMessage);
      socket.off("send_todoc", handleReceiveMessage);
      socket.off("pat_types", handleTyping);
      socket.off("doc_types", handleTyping);
      socket.off("room_presence", handleRoomPresence);
      socket.off("consultation_over", handleConsultationOver);
    };
  }, [socket, isConnected, roomid, role, navigate]);

  /* FILE PREVIEW REMOVE */
  const handleRemoveFile = (previewKey) => {
    setFilesToUpload((prev) => {
      const f = prev.find((x) => x.previewKey === previewKey);
      if (f) URL.revokeObjectURL(f.objectUrl);
      return prev.filter((x) => x.previewKey !== previewKey);
    });
  };

  /* END CONSULTATION (doctor) -> call backend, emit socket, stop timer, navigate */
  const handleEndConsultation = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/appointment/changestatus?info=proceed`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            appointmentID: consultationId,
            status: "completed",
          }),
        }
      );

      if (!res.ok) throw new Error("Failed");
      socket.emit("remove_patient", {
        roomid,
        appointmentId: consultationId,
        doctorId: currentUserID,
        patientId: patientInfo._id,
      });

      endTimer();
      toast.success("Consultation Completed");
      navigate("/doctor/appointments");
    } catch (err) {
      console.error(err);
      toast.error("Error completing consultation");
    }
  };

  /* SEND MESSAGE (with Cloudinary uploads) */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && filesToUpload.length === 0) return;

    setIsUploading(true);
    try {
      const uploadFile = async (fileObj) => {
        const form = new FormData();
        form.append("file", fileObj.file);
        form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        let resourceType = "image";
        if (fileObj.file.type.startsWith("video/")) resourceType = "video";
        else if (
          fileObj.file.type === "application/pdf" ||
          fileObj.file.type.includes("officedocument") ||
          fileObj.file.type.includes("msword") ||
          fileObj.file.type.includes("sheet")
        ) resourceType = "raw";

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
        const r = await fetch(uploadUrl, { method: "POST", body: form });
        const data = await r.json();
        return {
          url: data.secure_url,
          name: fileObj.file.name,
          type: fileObj.file.type,
        };
      };

      const uploaded = await Promise.all(filesToUpload.map(uploadFile));
      const newMsg = {
        id: `msg_${Date.now()}`,
        senderId: currentUserID,
        text: newMessage,
        timestamp: new Date().toISOString(),
        files: uploaded,
      };

      if (role === "patient") socket.emit("msg_frompat", { msg: newMsg, roomid });
      else socket.emit("msg_fromdoc", { msg: newMsg, roomid });

      setMessages((p) => [...p, newMsg]);
      setNewMessage("");
      filesToUpload.forEach((f) => URL.revokeObjectURL(f.objectUrl));
      setFilesToUpload([]);
    } catch (err) {
      console.error("send message error", err);
      toast.error("Failed to send message");
    } finally {
      setIsUploading(false);
    }
  };

  /* ========== Prescription handling (opened from right sidebar) ========== */
  const [prescription, setPrescription] = useState({
    doctorName: "",
    clinicName: "",
    diagnosis: "",
    medications: [],
    notes: "",
  });

  const addMedication = () => {
    setPrescription((p) => ({ ...p, medications: [...p.medications, { name: "", dose: "", qty: "" }] }));
  };
  const updateMedication = (idx, field, val) => {
    setPrescription((p) => {
      const meds = [...p.medications];
      meds[idx] = { ...meds[idx], [field]: val };
      return { ...p, medications: meds };
    });
  };
  const removeMedication = (idx) => {
    setPrescription((p) => ({ ...p, medications: p.medications.filter((_, i) => i !== idx) }));
  };

 const generateAndSendPDF = async () => {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    let y = 40;
    doc.setFontSize(18);
    doc.text(prescription.clinicName || "Clinic / Hospital", 40, y);
    y += 28;

    doc.setFontSize(12);
    doc.text(`Doctor: ${prescription.doctorName}`, 40, y); y += 18;
    doc.text(`Patient: ${patientInfo.name}`, 40, y); y += 18;
    doc.text(`Age/Gender: ${patientInfo.age} / ${patientInfo.gender}`, 40, y); y += 22;

    doc.text("Diagnosis:", 40, y); y += 16;
    doc.setFontSize(10);
    doc.text(prescription.diagnosis || "-", 40, y); 
    y += 18;

    doc.setFontSize(12);
    doc.text("Medications:", 40, y); 
    y += 16;

    if (prescription.medications.length === 0) {
      doc.setFontSize(10);
      doc.text("- None -", 40, y);
      y += 18;
    } else {
      prescription.medications.forEach((m, i) => {
        doc.setFontSize(10);
        doc.text(
          `${i + 1}. ${m.name} — Dose/day: ${m.dose}, Qty: ${m.qty}`,
          40,
          y
        );
        y += 16;
      });
    }

    doc.setFontSize(12);
    doc.text("Notes:", 40, y);
    y += 16;
    doc.setFontSize(10);
    doc.text(prescription.notes || "-", 40, y);

    // ---- Convert PDF to Blob ----
    const pdfBlob = doc.output("blob");

    // ---- Upload to Cloudinary as RAW file ----
    const formData = new FormData();
    formData.append("file", pdfBlob, "prescription.pdf");
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`;

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: formData
    });

    const uploadData = await uploadRes.json();

    if (!uploadData.secure_url) {
      toast.error("PDF upload failed");
      return;
    }

    // ---- Create chat message for the PDF ----
    const pdfMsg = {
      id: `msg_${Date.now()}`,
      senderId: currentUserID,
      text: "Prescription PDF",
      timestamp: new Date().toISOString(),
      files: [
        {
          url: uploadData.secure_url,
          name: "prescription.pdf",
          type: "application/pdf"
        }
      ]
    };

    // ---- Emit to chat room ----
    if (role === "doctor") {
      socket.emit("msg_fromdoc", { msg: pdfMsg, roomid });
    }

    // ---- Add to UI ----
    setMessages(prev => [...prev, pdfMsg]);

    toast.success("Prescription sent in chat");
    setPrescriptionOpen(false);

  } catch (err) {
    console.error(err);
    toast.error("Error sending prescription PDF");
  }
};


  /* ========= RENDER ========== */
  return (
    <div className="pro-chat-layout">
      <div className="chat-conversation-area">

        {/* HEADER */}
        <div className="chat-header">
          <div className="patient-info">
            <div className="info-text">
              <span className="patient-name">Consultation with {patientInfo.name}</span>
              <span className="patient-status">
                <span className={`status-dot ${otherPresent ? "online" : "offline"}`} />
                {otherPresent ? "Active Now" : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="chat-actions">
            <div className="timer-badge">
              <strong>{formatTimer(timerSeconds)}</strong>
              <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>Consultation</div>
            </div>

            <button className="action-btn"><FiPhone /> Call</button>
            <button className="action-btn btn-video"><FiVideo /> Video</button>

            {role === "doctor" && <button className="action-btn btn-end" onClick={handleEndConsultation}>End</button>}

            <button className="action-btn-icon"><FiMoreVertical /></button>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="chat-messages-area">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isSender={msg.senderId === currentUserID}
              timestamp={formatChatTimestamp(msg.timestamp)}
            />
          ))}

          {isOtherTyping && <Message />}

          <div ref={messagesEndRef} />
        </div>

        {/* FILE PREVIEW */}
        {filesToUpload.length > 0 && <FilePreviewArea files={filesToUpload} onRemove={handleRemoveFile} />}

        {/* INPUT */}
        <ChatInputArea
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          setFilesToUpload={setFilesToUpload}
          isUploading={isUploading}
          role={role}
          socket={socket}
          roomid={roomid}
        />
      </div>

      {/* RIGHT SIDEBAR (contains Write Prescription button) */}
      {role === "doctor" && (
        <PatientInfoSidebar
          patient={patientInfo}
          onWritePrescription={() => setPrescriptionOpen(true)}
        />
      )}

      {/* PRESCRIPTION OVERLAY */}
      {prescriptionOpen && (
        <div className="prescription-overlay">
          <div className="prescription-card">
            <div className="prescription-header">
              <h3>Write Prescription</h3>
              <button className="close-btn" onClick={() => setPrescriptionOpen(false)}><FiX /></button>
            </div>

            <div className="prescription-body">
              <label>Doctor Name</label>
              <input value={prescription.doctorName} onChange={(e) => setPrescription({...prescription, doctorName: e.target.value})} />

              <label>Clinic Name</label>
              <input value={prescription.clinicName} onChange={(e) => setPrescription({...prescription, clinicName: e.target.value})} />

              <label>Diagnosis</label>
              <textarea value={prescription.diagnosis} onChange={(e) => setPrescription({...prescription, diagnosis: e.target.value})} />

              <div className="med-section">
                <h4>Medications</h4>
                <button className="add-med-btn" onClick={addMedication}>+ Add</button>
              </div>

              {prescription.medications.map((m, idx) => (
                <div className="med-row" key={idx}>
                  <input placeholder="Medicine name" value={m.name} onChange={(e) => updateMedication(idx, "name", e.target.value)} />
                  <input placeholder="Dose (per day)" value={m.dose} onChange={(e) => updateMedication(idx, "dose", e.target.value)} />
                  <input placeholder="Quantity" value={m.qty} onChange={(e) => updateMedication(idx, "qty", e.target.value)} />
                  <button className="remove-med-btn" onClick={() => removeMedication(idx)}><FiX /></button>
                </div>
              ))}

              <label>Additional Notes</label>
              <textarea value={prescription.notes} onChange={(e) => setPrescription({...prescription, notes: e.target.value})} />

              <div style={{ display: "flex", gap: 8 }}>
                <button className="generate-btn" onClick={generateAndSendPDF}>Generate & Send PDF</button>
                <button className="action-btn" onClick={() => setPrescriptionOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- File rendering components ----------------- */

const FileRenderer = ({ file }) => {
  if (!file) return null;
  if (file.type?.startsWith("image/")) {
    return <a href={file.url} target="_blank" rel="noreferrer"><img src={file.url} className="chat-image" alt={file.name} /></a>;
  }
  if (file.type?.startsWith("video/")) {
    return <a href={file.url} target="_blank" rel="noreferrer"><video src={file.url} controls className="chat-video" /></a>;
  }
  return <a href={file.url} target="_blank" rel="noreferrer" className="chat-file-link"><FiFileText /> {file.name}</a>;
};

const ChatMessage = ({ message, isSender, timestamp }) => (
  <div className={`message-wrapper ${isSender ? "sent" : "received"}`}>
    <div className="message-bubble">
      {message.files?.length > 0 && (
        <div className="chat-files-container">
          {message.files.map((f, i) => <FileRenderer key={i} file={f} />)}
        </div>
      )}
      {message.text && <p className="message-text">{message.text}</p>}
      <span className="message-timestamp">{timestamp}</span>
    </div>
  </div>
);

/* ----------------- Input area ----------------- */

const ChatInputArea = ({ newMessage, setNewMessage, onSendMessage, setFilesToUpload, isUploading, role, socket, roomid }) => {
  const fileRef = useRef(null);

  const handleChangeFiles = (e) => {
    const arr = Array.from(e.target.files || []);
    const tagged = arr.map((file) => ({ file, previewKey: Math.random() + "_p", objectUrl: URL.createObjectURL(file) }));
    setFilesToUpload((p) => [...p, ...tagged]);
    e.target.value = null;
  };

  return (
    <form className="chat-input-area" onSubmit={onSendMessage}>
      <input ref={fileRef} type="file" multiple accept="image/*,video/*,application/pdf,.doc,.docx" style={{ display: "none" }} onChange={handleChangeFiles} />
      <button type="button" className="action-btn-icon" onClick={() => fileRef.current.click()}><FiPaperclip /></button>
      <input className="message-input" placeholder="Type your message..." value={newMessage} onChange={(e) => {
        setNewMessage(e.target.value);
        if (socket) socket.emit(role === "patient" ? "patient_typing" : "doctor_typing", { roomid });
      }} />
      <button className="send-button" type="submit" disabled={isUploading}>{isUploading ? <FiLoader /> : <FiSend />} {isUploading ? "Sending" : "Send"}</button>
    </form>
  );
};

/* ----------------- File preview ----------------- */

const FilePreviewItem = ({ file, onRemove }) => {
  const isImage = file.file.type.startsWith("image/");
  return (
    <div className="file-preview-item" title={file.file.name}>
      <button className="remove-file-btn" type="button" onClick={() => onRemove(file.previewKey)}><FiX size={14} /></button>
      {isImage ? <div className="file-preview-image-bg" style={{ backgroundImage: `url(${file.objectUrl})` }} /> : <div className="file-preview-icon-bg"><FiFile size={28} /></div>}
    </div>
  );
};
const FilePreviewArea = ({ files, onRemove }) => (<div className="file-preview-area"><div className="file-preview-list">{files.map(f => <FilePreviewItem key={f.previewKey} file={f} onRemove={onRemove} />)}</div></div>);

/* ----------------- Right Sidebar ----------------- */

const PatientInfoSidebar = ({ patient, onWritePrescription }) => (
  <div className="patient-info-sidebar">
    <div className="patient-profile-header">
      <div className="patient-avatar-large">{patient.avatarUrl ? <img src={patient.avatarUrl} alt="avatar" /> : <FiUser size={40} />}</div>
      <h3>{patient.name}</h3>
      <p>{patient.gender}, {patient.age} years</p>
      <button className="action-btn btn-full-profile"><FiFileText /> View Full Profile</button>
    </div>

    <div className="patient-details-body">
      <h4>Key Information</h4>
      <div className="info-grid">
        <div className="info-item"><label className="info-label">Blood Group</label><span className="info-value">{patient.bloodGroup}</span></div>
        <div className="info-item"><label className="info-label">Allergies</label><span className="info-value allergy">{patient.allergies}</span></div>
        <div className="info-item"><label className="info-label">Last Visit</label><span className="info-value">{patient.lastAppointment}</span></div>
      </div>

      <h4>Consultation Tools</h4>
      <button className="tool-btn" onClick={onWritePrescription}><FiHeart /> Write Prescription</button>
      <button className="tool-btn"><FiCalendar /> Book Follow-up</button>
    </div>
  </div>
);
