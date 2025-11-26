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
  FiLoader,
  FiMenu,
  FiArrowLeft
} from "react-icons/fi";
import toast from "react-hot-toast";
import "../css/chatpage.css";
import Message from "../components/Loaders/message.jsx";
import { useSocket } from "./SocketContext.jsx";
import { useAuth } from "./AuthContext.jsx";
import Circle1 from "../components/Loaders/circle1.jsx"
const API = import.meta.env.VITE_API_URL;

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
  const role = params.get("user");
  const consultationId = params.get("consultationId");
  const { roomid } = useParams();
  const { userID: currentUserID } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ========= PATIENT DETAILS ========= */
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
  const [generating, setGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimer = useRef(null);

  const [roomPresence, setRoomPresence] = useState({ doctor: false, patient: false });
  const [otherPresent, setOtherPresent] = useState(false);

  /* ========= TIMER ========= */
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  /* Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  /* Timer setup */
  useEffect(() => {
    const key = "consult_start_" + roomid;
    const savedStart = localStorage.getItem(key);
    if (savedStart) startTimerFromSaved(parseInt(savedStart, 10));

    const pushBack = () => window.history.pushState(null, "", window.location.href);
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", pushBack);

    const beforeUnload = (e) => {
      if (localStorage.getItem(key)) {
        e.preventDefault();
        e.returnValue = "Consultation is in progress.";
        return "Consultation is in progress.";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("popstate", pushBack);
      window.removeEventListener("beforeunload", beforeUnload);
    };
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

  useEffect(() => {
    if (!socket || !isConnected || !roomid || !role) return;

    socket.emit("join_room", { roomid, role });

    const key = "consult_start_" + roomid;
    if (!localStorage.getItem(key)) startTimerFresh();

    const handleReceiveMessage = (payload) => {
      if (payload.isSystem) {
        const msgData = payload.msg || payload;
        setMessages(prev => [...prev, msgData]);
        return;
      }
      if (payload.senderRole == role) return;
      const data = payload.msg ? payload.msg : payload;
      setMessages((p) => [...p, data]);
    };

    const handleTyping = () => {
      setIsOtherTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setIsOtherTyping(false), 2000);
    };

    socket.on("sending", handleReceiveMessage);
    socket.on("pat_types", handleTyping);
    socket.on("doc_types", handleTyping);

    const handleRoomPresence = (presence) => {
      setRoomPresence(presence);
      setOtherPresent(role === "patient" ? presence.doctor : presence.patient);
      if (!presence.doctor && !presence.patient) endTimer();
    };

    socket.on("room_presence", handleRoomPresence);

    socket.on("consultation_over", () => {
      endTimer();
      navigate(role === "patient" ? "/patient/home" : "/doctor/appointments");
    });

    return () => {
      socket.emit("leave_room", { roomid, role });
      socket.off("sending", handleReceiveMessage);
      socket.off("pat_types", handleTyping);
      socket.off("doc_types", handleTyping);
      socket.off("room_presence", handleRoomPresence);
      socket.off("consultation_over");
    };
  }, [socket, isConnected, roomid, role, navigate]);

  const handleRemoveFile = (previewKey) => {
    setFilesToUpload((prev) => {
      const f = prev.find((x) => x.previewKey === previewKey);
      if (f) URL.revokeObjectURL(f.objectUrl);
      return prev.filter((x) => x.previewKey !== previewKey);
    });
  };

  const handleEndConsultation = async () => {
    try {
      await fetch(`${API}/appointment/changestatus?info=proceed`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          appointmentID: consultationId,
          status: "completed",
        }),
      });

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
      toast.error("Error completing consultation");
    }
  };

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

      socket.emit(
        role === "patient" ? "msg_frompat" : "msg_fromdoc",
        { msg: newMsg, roomid }
      );

      setMessages((p) => [...p, newMsg]);
      setNewMessage("");
      filesToUpload.forEach((f) => URL.revokeObjectURL(f.objectUrl));
      setFilesToUpload([]);
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsUploading(false);
    }
  };

  /* PRESCRIPTION HANDLING */
  const [prescription, setPrescription] = useState({
    doctorName: "",
    clinicName: "",
    diagnosis: "",
    medications: [],
    notes: "",
  });

  const addMedication = () => {
    setPrescription((p) => ({
      ...p,
      medications: [...p.medications, { name: "", dose: "", qty: "" }],
    }));
  };

  const updateMedication = (idx, field, val) => {
    setPrescription((p) => {
      const meds = [...p.medications];
      meds[idx] = { ...meds[idx], [field]: val };
      return { ...p, medications: meds };
    });
  };

  const removeMedication = (idx) => {
    setPrescription((p) => ({
      ...p,
      medications: p.medications.filter((_, i) => i !== idx),
    }));
  };

  const generateAndSendPDF = async (e) => {
    setGenerating(true)
    e.target.disabled = true;
    try {
      const payload = {
        prescriptionData: prescription,
        patientData: patientInfo,
        consultationId: consultationId,
        roomid: roomid,
        doctorId: currentUserID,
      };

      if (!payload.doctorId || payload.doctorId === "doctor") {
        throw new Error("Invalid Doctor ID");
      }

      const res = await fetch(
        `${API}/doctor/generate-prescription`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Backend failed");
      setGenerating(false)
      e.target.disabled = false;
      toast.success("Prescription sent!");
      setPrescriptionOpen(false);
    } catch (err) {
      toast.error(`Failed: ${err.message}`);
      setGenerating(false);
      e.target.disabled = false;
    }
  };

  /* ===================== UI RENDER ===================== */
  return (
    <div className="pro-chat-layout">
      <div className="chat-conversation-area">
        {/* HEADER */}
        <div className="chat-header">
          <div className="chat-header-left">
            <button className="back-button mobile-only" onClick={() => navigate(-1)}>
              <FiArrowLeft size={20} />
            </button>
            <div className="patient-info">
              <div className="info-text">
                <span className="patient-name">
                  {patientInfo.name}
                </span>
                <span className="patient-status">
                  <span
                    className={`status-dot ${otherPresent ? "online" : "offline"}`}
                  />
                  {otherPresent ? "Active Now" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>

          <div className="chat-actions">
            <div className="timer-badge">
              <strong>{formatTimer(timerSeconds)}</strong>
              <div className="timer-label">Time</div>
            </div>

            <button className="action-btn desktop-only">
              <FiPhone /> Call
            </button>
            <button className="action-btn btn-video desktop-only">
              <FiVideo /> Video
            </button>

            {role === "doctor" && (
              <>
                <button className="action-btn btn-end desktop-only" onClick={handleEndConsultation}>
                  End
                </button>
                <button className="action-btn-icon mobile-only sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                  <FiMenu />
                </button>
              </>
            )}

            <button className="action-btn-icon desktop-only">
              <FiMoreVertical />
            </button>
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
        {filesToUpload.length > 0 && (
          <FilePreviewArea files={filesToUpload} onRemove={handleRemoveFile} />
        )}

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

      {/* RIGHT SIDEBAR */}
      {role === "doctor" && (
        <>
          <div
            className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          />
          <div className={`patient-info-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <button className="close-sidebar mobile-only" onClick={() => setSidebarOpen(false)}>
              <FiX size={24} />
            </button>
            <PatientInfoSidebar
              patient={patientInfo}
              onWritePrescription={() => {
                setPrescriptionOpen(true);
                setSidebarOpen(false);
              }}

              onEndConsultation={() => {
                setSidebarOpen(false);
                handleEndConsultation();
              }}
            />
          </div>
        </>
      )}

      {/* PRESCRIPTION OVERLAY */}
      {prescriptionOpen && (
        <div className="prescription-overlay">
          <div className="prescription-card">
            <div className="prescription-header">
              <h3>Write Prescription</h3>
              <button className="close-btn" onClick={() => setPrescriptionOpen(false)}>
                <FiX />
              </button>
            </div>

            <div className="prescription-body">
              <label>Doctor Name</label>
              <input
                value={prescription.doctorName}
                onChange={(e) =>
                  setPrescription({ ...prescription, doctorName: e.target.value })
                }
              />

              <label>Clinic Name</label>
              <input
                value={prescription.clinicName}
                onChange={(e) =>
                  setPrescription({ ...prescription, clinicName: e.target.value })
                }
              />

              <label>Diagnosis</label>
              <textarea
                value={prescription.diagnosis}
                onChange={(e) =>
                  setPrescription({ ...prescription, diagnosis: e.target.value })
                }
              />

              <div className="med-section">
                <h4>Medications</h4>
                <button className="add-med-btn" onClick={addMedication}>
                  + Add
                </button>
              </div>

              {prescription.medications.map((m, idx) => (
                <div className="med-row" key={idx}>
                  <input
                    placeholder="Medicine name"
                    value={m.name}
                    onChange={(e) => updateMedication(idx, "name", e.target.value)}
                  />
                  <input
                    placeholder="Dose (per day)"
                    value={m.dose}
                    onChange={(e) => updateMedication(idx, "dose", e.target.value)}
                  />
                  <input
                    placeholder="Quantity"
                    value={m.qty}
                    onChange={(e) => updateMedication(idx, "qty", e.target.value)}
                  />
                  <button
                    className="remove-med-btn"
                    onClick={() => removeMedication(idx)}
                  >
                    <FiX />
                  </button>
                </div>
              ))}

              <label>Additional Notes</label>
              <textarea
                value={prescription.notes}
                onChange={(e) =>
                  setPrescription({ ...prescription, notes: e.target.value })
                }
              />

              <div style={{ display: "flex", gap: 8 }}>
                <button className="generate-btn" onClick={generateAndSendPDF}>
                  {!generating ? <>Generate & Send PDF</> : <Circle1 />}
                </button>
                <button className="action-btn" onClick={() => setPrescriptionOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* FILE RENDERING */
const FileRenderer = ({ file }) => {
  if (!file) return null;
  if (file.type?.startsWith("image/"))
    return (
      <a href={file.url} target="_blank" rel="noreferrer">
        <img src={file.url} className="chat-image" alt={file.name} />
      </a>
    );

  if (file.type?.startsWith("video/"))
    return (
      <a href={file.url} target="_blank" rel="noreferrer">
        <video src={file.url} controls className="chat-video" />
      </a>
    );

  return (
    <a href={file.url} target="_blank" rel="noreferrer" className="chat-file-link">
      <FiFileText /> {file.name}
    </a>
  );
};

const ChatMessage = ({ message, isSender, timestamp }) => (
  <div className={`message-wrapper ${isSender ? "sent" : "received"}`}>
    <div className="message-bubble">
      {message.files?.length > 0 && (
        <div className="chat-files-container">
          {message.files.map((f, i) => (
            <FileRenderer key={i} file={f} />
          ))}
        </div>
      )}
      {message.text && <p className="message-text">{message.text}</p>}
      <span className="message-timestamp">{timestamp}</span>
    </div>
  </div>
);

/* INPUT BOX */
const ChatInputArea = ({
  newMessage,
  setNewMessage,
  onSendMessage,
  setFilesToUpload,
  isUploading,
  role,
  socket,
  roomid,
}) => {
  const fileRef = useRef(null);

  const handleChangeFiles = (e) => {
    const arr = Array.from(e.target.files || []);
    const tagged = arr.map((file) => ({
      file,
      previewKey: Math.random() + "_p",
      objectUrl: URL.createObjectURL(file),
    }));
    setFilesToUpload((p) => [...p, ...tagged]);
    e.target.value = null;
  };

  return (
    <form className="chat-input-area" onSubmit={onSendMessage}>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf,.doc,.docx"
        style={{ display: "none" }}
        onChange={handleChangeFiles}
      />

      <button type="button" className="action-btn-icon" onClick={() => fileRef.current.click()}>
        <FiPaperclip />
      </button>

      <input
        className="message-input"
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => {
          setNewMessage(e.target.value);
          if (socket)
            socket.emit(role === "patient" ? "patient_typing" : "doctor_typing", { roomid });
        }}
      />

      <button className="send-button" type="submit" disabled={isUploading}>
        {isUploading ? <FiLoader /> : <FiSend />}
        <span className="send-text">{isUploading ? "Sending" : "Send"}</span>
      </button>
    </form>
  );
};

/* FILE PREVIEW BOX */
const FilePreviewItem = ({ file, onRemove }) => {
  const isImage = file.file.type.startsWith("image/");
  return (
    <div className="file-preview-item" title={file.file.name}>
      <button className="remove-file-btn" type="button" onClick={() => onRemove(file.previewKey)}>
        <FiX size={14} />
      </button>

      {isImage ? (
        <div
          className="file-preview-image-bg"
          style={{ backgroundImage: `url(${file.objectUrl})` }}
        />
      ) : (
        <div className="file-preview-icon-bg">
          <FiFile size={28} />
        </div>
      )}
    </div>
  );
};

const FilePreviewArea = ({ files, onRemove }) => (
  <div className="file-preview-area">
    <div className="file-preview-list">
      {files.map((f) => (
        <FilePreviewItem key={f.previewKey} file={f} onRemove={onRemove} />
      ))}
    </div>
  </div>
);

/* RIGHT SIDEBAR */
const PatientInfoSidebar = ({ patient, onWritePrescription, onEndConsultation }) => (
  <>
    <div className="patient-profile-header">
      <div className="patient-avatar-large">
        {patient.avatarUrl ? <img src={patient.avatarUrl} alt="avatar" /> : <FiUser size={40} />}
      </div>
      <h3>{patient.name}</h3>
      <p>
        {patient.gender}, {patient.age} years
      </p>
      <button className="action-btn btn-full-profile">
        <FiFileText /> View Full Profile
      </button>
    </div>

    <div className="patient-details-body">
      <h4>Key Information</h4>

      <div className="info-grid">
        <div className="info-item">
          <label className="info-label">Blood Group</label>
          <span className="info-value">{patient.bloodGroup}</span>
        </div>

        <div className="info-item">
          <label className="info-label">Allergies</label>
          <span className="info-value allergy">{patient.allergies}</span>
        </div>

        <div className="info-item">
          <label className="info-label">Last Visit</label>
          <span className="info-value">{patient.lastAppointment}</span>
        </div>
      </div>

      <h4>Consultation Tools</h4>

      <button className="tool-btn" onClick={onWritePrescription}>
        <FiHeart /> Write Prescription
      </button>

      <button className="tool-btn">
        <FiCalendar /> Book Follow-up
      </button>
      <button className="tool-btn end-btn-mobile" onClick={onEndConsultation}>
        <FiX /> End Consultation
      </button>
    </div>
  </>
);