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
    const navigate = useNavigate();
    const currentUserID = params.get("user");

    const [patientInfo] = useState(() => {
        const stored = localStorage.getItem("current");
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                console.error("Error parsing localStorage data");
            }
        }
        return {
            name: "",
            gender: "Male",
            age: "",
            bloodGroup: "",
            allergies: "",
            lastAppointment: "",
        };
    });

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);

    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const typingTimer = useRef(null);
    const [otherPresent, setOtherPresent] = useState(false);

    /* ===== Scroll to latest msg ===== */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
/* ===== Socket Join + Handlers ===== */
useEffect(() => {
    if (!socket || !isConnected || !roomid || !role) return;

    socket.emit("join_room", { roomid, role });

    const handleReceiveMessage = (data) => {
        setMessages((prev) => [...prev, data]);
    };

    const handleTyping = () => {
        setIsOtherTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
            setIsOtherTyping(false);
        }, 2000);
    };

    const handlePresenceChange = ({ role: who, present }) => {
        if (role === "patient") {
            setOtherPresent(who === "doctor" ? present : otherPresent);
        } else {
            setOtherPresent(who === "patient" ? present : otherPresent);
        }
    };

    const handleRoomPresence = (presence) => {
        if (role === "patient") {
            setOtherPresent(presence.doctor);
        } else {
            setOtherPresent(presence.patient);
        }
    };

    
    const handleConsultationOver = () => {
        if (role === "patient") {
            toast("Consultation ended");
            navigate("/patient/home");   
        }
    };

    socket.on("send_topat", handleReceiveMessage);
    socket.on("send_todoc", handleReceiveMessage);
    socket.on("pat_types", handleTyping);
    socket.on("doc_types", handleTyping);
    socket.on("presence_change", handlePresenceChange);
    socket.on("room_presence", handleRoomPresence);


    socket.on("consultation_over", handleConsultationOver);

    return () => {
        socket.emit("leave_room", { roomid, role });
        socket.off("send_topat", handleReceiveMessage);
        socket.off("send_todoc", handleReceiveMessage);
        socket.off("pat_types", handleTyping);
        socket.off("doc_types", handleTyping);
        socket.off("presence_change", handlePresenceChange);
        socket.off("room_presence", handleRoomPresence);

        // ✅ cleanup
        socket.off("consultation_over", handleConsultationOver);
    };
}, [socket, isConnected, roomid, role]);

    /* ===== Remove file preview ===== */
    const handleRemoveFile = (previewKey) => {
        setFilesToUpload((prevFiles) => {
            const fileToRemove = prevFiles.find((f) => f.previewKey === previewKey);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.objectUrl);
            }
            return prevFiles.filter((f) => f.previewKey !== previewKey);
        });
    };

    /* ===== End Consultation ===== */
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

            toast.success("Consultation Completed");
            navigate("/doctor/appointments");
        } catch (err) {
            console.error(err);
            toast.error("Error completing consultation");
        }
    };

    /* ===== Send message ===== */
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && filesToUpload.length === 0) return;

        setIsUploading(true);

        try {
            const uploadFile = async (fileObject) => {
                const formData = new FormData();
                formData.append("file", fileObject.file);
                formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

                let resourceType = "image";
                if (fileObject.file.type.startsWith("video/")) resourceType = "video";
                else if (
                    fileObject.file.type === "application/pdf" ||
                    fileObject.file.type.includes("officedocument") ||
                    fileObject.file.type.includes("msword") ||
                    fileObject.file.type.includes("sheet") ||
                    fileObject.file.type.includes("spreadsheet")
                )
                    resourceType = "raw";

                const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

                const response = await fetch(uploadUrl, {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                if (data.secure_url) {
                    return {
                        url: data.secure_url,
                        name: fileObject.file.name,
                        type: fileObject.file.type,
                    };
                } else {
                    throw new Error("Cloudinary upload failed");
                }
            };

            const uploadPromises = filesToUpload.map(uploadFile);
            const finalFilePayloads = (await Promise.all(uploadPromises)).filter(Boolean);

            const newMessageObj = {
                id: `m_${Date.now()}_${Math.random()}`,
                senderId: currentUserID,
                text: newMessage,
                timestamp: new Date().toISOString(),
                files: finalFilePayloads,
            };

            if (role === "patient") {
                socket.emit("msg_frompat", { msg: newMessageObj, roomid });
            } else {
                socket.emit("msg_fromdoc", { msg: newMessageObj, roomid });
            }

            setMessages((prev) => [...prev, newMessageObj]);

            filesToUpload.forEach((f) => URL.revokeObjectURL(f.objectUrl));
            setNewMessage("");
            setFilesToUpload([]);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="pro-chat-layout">
            <div className="chat-conversation-area">

                <ActiveChatHeader
                    patientName={patientInfo.name}
                    otherPresent={otherPresent}
                    role={role}
                    handleEndConsultation={handleEndConsultation}
                />

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

                {filesToUpload.length > 0 && (
                    <FilePreviewArea files={filesToUpload} onRemove={handleRemoveFile} />
                )}

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

            {role === "doctor" && <PatientInfoSidebar patient={patientInfo} />}
        </div>
    );
}


/* ========= Header ========= */

const ActiveChatHeader = ({ patientName, otherPresent, role, handleEndConsultation }) => (
    <div className="chat-header">
        <div className="patient-info">
            <div className="info-text">
                <span className="patient-name">
                    Consultation with {patientName}
                </span>

                <span className="patient-status">
                    <span className={`status-dot ${otherPresent ? "online" : "offline"}`} />
                    {otherPresent ? "Active Now" : "Disconnected"}
                </span>
            </div>
        </div>

        <div className="chat-actions">
            <button className="action-btn">
                <FiPhone /> <span>Call</span>
            </button>

            <button className="action-btn btn-video">
                <FiVideo /> <span>Video</span>
            </button>

            {role === "doctor" && (
                <button className="action-btn btn-end" onClick={handleEndConsultation}>
                    End
                </button>
            )}

            <button className="action-btn-icon">
                <FiMoreVertical />
            </button>
        </div>
    </div>
);


/* ========= Chat Bubble ========= */

const FileRenderer = ({ file }) => {
    const fileUrl = file.url;
    const fileName = file.name;

    if (file.type.startsWith("image/")) {
        return (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <img src={fileUrl} alt={fileName} className="chat-image" />
            </a>
        );
    }

    if (file.type.startsWith("video/")) {
        return (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <video src={fileUrl} controls className="chat-video" />
            </a>
        );
    }

    return (
        <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer" className="chat-file-link">
            <FiFileText size={24} />
            <span>{fileName}</span>
        </a>
    );
};


const ChatMessage = ({ message, isSender, timestamp }) => (
    <div className={`message-wrapper ${isSender ? "sent" : "received"}`}>
        <div className="message-bubble">
            {message.files?.length > 0 && (
                <div className="chat-files-container">
                    {message.files.map((file, index) => (
                        <FileRenderer key={index} file={file} />
                    ))}
                </div>
            )}

            {message.text && <p className="message-text">{message.text}</p>}

            <span className="message-timestamp">{timestamp}</span>
        </div>
    </div>
);


/* ========= Input ========= */

const ChatInputArea = ({
    newMessage,
    setNewMessage,
    onSendMessage,
    setFilesToUpload,
    isUploading,
    role,
    socket,
    roomid
}) => {

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length > 0) {
            const taggedFiles = newFiles.map((file) => ({
                file: file,
                previewKey: `preview_${Date.now()}_${Math.random()}`,
                objectUrl: URL.createObjectURL(file),
            }));
            setFilesToUpload((prev) => [...prev, ...taggedFiles]);
        }
        e.target.value = null;
    };

    const handleAttachClick = () => {
        fileInputRef.current.click();
    };

    return (
        <form className="chat-input-area" onSubmit={onSendMessage}>
            <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
                accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx"
                disabled={isUploading}
            />

            <button
                type="button"
                className="action-btn-icon"
                title="Attach File"
                onClick={handleAttachClick}
                disabled={isUploading}
            >
                <FiPaperclip />
            </button>

            <input
                type="text"
                placeholder={isUploading ? "Uploading files..." : "Type your message..."}
                className="message-input"
                value={newMessage}
                onChange={(e) => {
                    setNewMessage(e.target.value);

                    if (role === "patient") {
                        socket.emit("patient_typing", { roomid });
                    } else {
                        socket.emit("doctor_typing", { roomid });
                    }
                }}
                disabled={isUploading}
            />

            <button type="submit" className="send-button" title="Send Message" disabled={isUploading}>
                {isUploading ? (
                    <FiLoader className="upload-spinner" size={16} />
                ) : (
                    <FiSend />
                )}
                <span>{isUploading ? "Sending" : "Send"}</span>
            </button>
        </form>
    );
};


/* ===== File Preview ===== */

const FilePreviewItem = ({ file, onRemove }) => {
    const isImage = file.file.type.startsWith("image/");

    return (
        <div className="file-preview-item" title={file.file.name}>
            <button type="button" className="remove-file-btn" onClick={() => onRemove(file.previewKey)}>
                <FiX size={14} />
            </button>

            {isImage ? (
                <div className="file-preview-image-bg" style={{ backgroundImage: `url(${file.objectUrl})` }} />
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
            {files.map((file) => (
                <FilePreviewItem key={file.previewKey} file={file} onRemove={onRemove} />
            ))}
        </div>
    </div>
);


/* ========= Right Sidebar ========= */

const PatientInfoSidebar = ({ patient }) => {
    return (
        <div className="patient-info-sidebar">
            <div className="patient-profile-header">
                <div className="patient-avatar-large">
                    {patient.avatarUrl ? (
                        <img src={patient.avatarUrl} alt={patient.name} />
                    ) : (
                        <FiUser size={40} />
                    )}
                </div>

                <h3>{patient.name}</h3>
                <p>
                    {patient.gender}, {patient.age} years old
                </p>

                <button className="action-btn btn-full-profile">
                    <FiFileText /> View Full Profile
                </button>
            </div>

            <div className="patient-details-body">
                <h4>Key Information</h4>

                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Blood Group</span>
                        <span className="info-value">{patient.bloodGroup}</span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Allergies</span>
                        <span className="info-value allergy">{patient.allergies}</span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Last Visit</span>
                        <span className="info-value">{patient.lastAppointment}</span>
                    </div>
                </div>

                <h4>Consultation Tools</h4>

                <div className="tool-buttons">
                    <button className="tool-btn">
                        <FiHeart /> <span>Add Vitals</span>
                    </button>

                    <button className="tool-btn">
                        <FiFileText /> <span>Write Prescription</span>
                    </button>

                    <button className="tool-btn">
                        <FiCalendar /> <span>Book Follow-up</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
