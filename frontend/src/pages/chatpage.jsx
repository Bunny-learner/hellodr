import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiUser, FiSend, FiPaperclip, FiMoreVertical, FiVideo,
    FiPhone, FiArrowLeft, FiFileText, FiHeart, FiCalendar,
    FiX, FiFile, FiLoader, FiClock
} from 'react-icons/fi';
import "../css/chatpage.css";
import { useAuth } from "./AuthContext.jsx";
import { useSocket } from "./SocketContext.jsx";

// --- Timestamp Formatter ---
const formatChatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const CLOUDINARY_CLOUD_NAME = 'decmqqc9n';
const CLOUDINARY_UPLOAD_PRESET = 'hellodr';

export default function ChatPage() {
    const { socket, isConnected } = useSocket();
    const { roomid } = useParams();
    const navigate = useNavigate();
    const { role } = useAuth();
    const currentUserID = role;

    // --- Patient Info ---
    const [patientInfo, setPatientInfo] = useState(() => {
        const stored = localStorage.getItem("current");
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error("Error parsing localStorage data:", error);
            }
        }
        return {
            name: "",
            gender: "Male",
            age: "",
            bloodGroup: "",
            allergies: "",
            lastAppointment: ""
        };
    });

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0); // 🕒 timer
    const messagesEndRef = useRef(null);
    const timerRef = useRef(null);
    const isPausedRef = useRef(false);

    // --- Timer with Pause/Resume ---
    useEffect(() => {
        const startTimer = () => {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                if (!isPausedRef.current) {
                    setElapsedTime(prev => prev + 1);
                }
            }, 1000);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                isPausedRef.current = true;
            } else {
                isPausedRef.current = false;
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        startTimer();

        return () => {
            clearInterval(timerRef.current);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    const formatElapsedTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // --- Scroll to bottom ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- Socket Setup ---
    useEffect(() => {
        if (socket && isConnected && roomid) {
            console.log(`%cChatPage: Socket connected! Joining room: ${roomid}`, "color: green;");
            socket.emit("join_room", { roomid });

            const handleReceiveMessage = (data) => {
                setMessages(prev => [...prev, data]);
            };
            socket.on("send_topat", handleReceiveMessage);
            socket.on("send_todoc", handleReceiveMessage);

            return () => {
                console.log(`%cChatPage: Leaving room: ${roomid}`, "color: red;");
                socket.emit("leave_room", { roomid });
                socket.off("send_topat", handleReceiveMessage);
                socket.off("send_todoc", handleReceiveMessage);
                clearInterval(timerRef.current); // stop timer on exit
            };
        } else {
            console.log(`Waiting for socket connection...`);
        }
    }, [socket, isConnected, roomid]);

    // --- Remove file preview ---
    const handleRemoveFile = (previewKey) => {
        setFilesToUpload(prevFiles => {
            const fileToRemove = prevFiles.find(f => f.previewKey === previewKey);
            if (fileToRemove) URL.revokeObjectURL(fileToRemove.objectUrl);
            return prevFiles.filter(f => f.previewKey !== previewKey);
        });
    };

    // --- Send Message ---
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
                ) {
                    resourceType = "raw";
                }
                const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
                const response = await fetch(uploadUrl, { method: "POST", body: formData });
                const data = await response.json();
                if (data.secure_url) {
                    return { url: data.secure_url, name: fileObject.file.name, type: fileObject.file.type };
                } else {
                    throw new Error("Upload failed");
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

            if (role === "patient") socket.emit("msg_frompat", { msg: newMessageObj, roomid });
            else socket.emit("msg_fromdoc", { msg: newMessageObj, roomid });

            setMessages(prev => [...prev, newMessageObj]);
            filesToUpload.forEach(f => URL.revokeObjectURL(f.objectUrl));
            setNewMessage("");
            setFilesToUpload([]);
        } catch (err) {
            console.error("Error sending message:", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleGoBack = () => navigate(-1);

    if (!patientInfo) {
        return <div className="chat-page-loading">Loading consultation...</div>;
    }

    return (
        <div className="pro-chat-layout">
            <div className="chat-conversation-area">
                <ActiveChatHeader
                    patientName={patientInfo.name}
                    onBack={handleGoBack}
                    elapsedTime={formatElapsedTime(elapsedTime)}
                />

                <div className="chat-messages-area">
                    {messages.map(msg => (
                        <ChatMessage
                            key={msg.id}
                            message={msg}
                            isSender={msg.senderId === currentUserID}
                            timestamp={formatChatTimestamp(msg.timestamp)}
                        />
                    ))}
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
                />
            </div>

            {role === "doctor" && <PatientInfoSidebar patient={patientInfo} />}
        </div>
    );
}

// ######################################################
// ### SUB COMPONENTS BELOW ###
// ######################################################

const ActiveChatHeader = ({ patientName, onBack, elapsedTime }) => (
    <div className="chat-header">
        <div className="patient-info">
            <button className="back-button" onClick={onBack} title="Back to Appointments"><FiArrowLeft /></button>
            <div className="info-text">
                <span className="patient-name">Consultation with {patientName}</span>
                <span className="patient-status"><span className="status-dot"></span>Active Now</span>
            </div>
        </div>
        <div className="chat-actions">
            <div className="timer-display" title="Consultation Duration">
                <FiClock size={16} /> <span>{elapsedTime}</span>
            </div>
            <button className="action-btn" title="Start Audio Call"><FiPhone /> <span>Call</span></button>
            <button className="action-btn btn-video" title="Start Video Call"><FiVideo /> <span>Video</span></button>
            <button className="action-btn-icon" title="More Options"><FiMoreVertical /></button>
        </div>
    </div>
);

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
    <div className={`message-wrapper ${isSender ? 'sent' : 'received'}`}>
        <div className="message-bubble">
            {message.files && message.files.length > 0 && (
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

const ChatInputArea = ({ newMessage, setNewMessage, onSendMessage, setFilesToUpload, isUploading }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length > 0) {
            const taggedFiles = newFiles.map(file => ({
                file,
                previewKey: `preview_${Date.now()}_${Math.random()}`,
                objectUrl: URL.createObjectURL(file)
            }));
            setFilesToUpload(prev => [...prev, ...taggedFiles]);
        }
        e.target.value = null;
    };

    const handleAttachClick = () => fileInputRef.current.click();

    return (
        <form className="chat-input-area" onSubmit={onSendMessage}>
            <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx"
                disabled={isUploading}
            />
            <button type="button" className="action-btn-icon" onClick={handleAttachClick} disabled={isUploading}>
                <FiPaperclip />
            </button>
            <input
                type="text"
                placeholder={isUploading ? "Uploading files..." : "Type your message here..."}
                className="message-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isUploading}
            />
            <button type="submit" className="send-button" disabled={isUploading}>
                {isUploading ? <FiLoader className="upload-spinner" size={16} /> : <FiSend />}
                <span>{isUploading ? "Sending" : "Send"}</span>
            </button>
        </form>
    );
};

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
                <div className="file-preview-icon-bg"><FiFile size={28} /></div>
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

const PatientInfoSidebar = ({ patient }) => (
    <div className="patient-info-sidebar">
        <div className="patient-profile-header">
            <div className="patient-avatar-large">
                {patient.avatarUrl ? <img src={patient.avatarUrl} alt={patient.name} /> : <FiUser size={40} />}
            </div>
            <h3>{patient.name}</h3>
            <p>{patient.gender}, {patient.age} years old</p>
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
                <button className="tool-btn"><FiHeart /> <span>Add Vitals</span></button>
                <button className="tool-btn"><FiFileText /> <span>Write Prescription</span></button>
                <button className="tool-btn"><FiCalendar /> <span>Book Follow-up</span></button>
            </div>
        </div>
    </div>
);
