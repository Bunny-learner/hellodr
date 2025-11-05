// src/components/ChatPage.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
import {
    FiUser, FiSend, FiPaperclip, FiMoreVertical, FiVideo,
    FiPhone, FiArrowLeft, FiFileText, FiHeart, FiCalendar
} from 'react-icons/fi';
import "../css/chatpage.css"; // We will create this file

// ######################################################################
// ### MOCK DATA (With more patient details)                          ###
// ######################################################################

const CURRENT_USER_ID = "doctor_123";

const mockPatientInfo = {
    "chat_1": {
        id: "p_001",
        name: "Alice Smith",
        age: 34,
        gender: "Female",
        lastAppointment: "2025-11-01",
        bloodGroup: "O+",
        allergies: "Penicillin",
        avatarUrl: null, // Add a URL to an image if you have one
    },
    // ... other patients
};

const mockMessages = {
    "chat_1": [
        // ... same messages as before
        { id: "m1", senderId: "p_001", text: "Hello Doctor, I'm feeling a bit better.", timestamp: "2025-11-05T10:25:00Z" },
        { id: "m2", senderId: "doctor_123", text: "That's great to hear, Alice. Continue the course.", timestamp: "2025-11-05T10:26:00Z" },
        { id: "m3", senderId: "p_001", text: "Thank you, doctor! I'll follow up.", timestamp: "2025-11-05T10:30:00Z" },
        { id: "m4", senderId: "p_001", text: "Oh, one more thing. I feel a slight headache.", timestamp: "2025-11-05T11:10:00Z" },
        { id: "m5", senderId: "p_001", text: "Is that normal?", timestamp: "2025-11-05T11:10:15Z" },
    ],
};

const formatChatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// ######################################################################
// ### CHAT PAGE COMPONENT (Pro Version)                              ###
// ######################################################################

export default function ChatPage() {
    // --- FOR REAL APP: Get consultation ID from URL ---
    // const { consultationId } = useParams(); 
    // const navigate = useNavigate();
    
    // --- FOR DEMO: Hard-code the ID ---
    const consultationId = "chat_1"; 
    const navigate = () => console.log("Navigate back"); // Demo navigate

    // --- State ---
    const [messages, setMessages] = useState([]);
    const [patientInfo, setPatientInfo] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    // Load message history and patient info
    useEffect(() => {
        // --- API Call Simulation ---
        const loadedMessages = mockMessages[consultationId] || [];
        setMessages(loadedMessages);

        const loadedPatientInfo = mockPatientInfo[consultationId];
        setPatientInfo(loadedPatientInfo);
        // --- End API Call Simulation ---
    }, [consultationId]);

    // Scroll to the bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle sending a new message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === "") return;

        const newMessageObj = {
            id: `m_${Math.random()}`,
            senderId: CURRENT_USER_ID,
            text: newMessage,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMessageObj]);
        setNewMessage("");
    };

    const handleGoBack = () => {
        // navigate(-1);
        alert("Navigating back to appointments list...");
    };

    if (!patientInfo) {
        return <div className="chat-page-loading">Loading consultation...</div>;
    }

    return (
        <div className="pro-chat-layout">
            
            {/* --- 1. CHAT AREA --- */}
            <div className="chat-conversation-area">
                <ActiveChatHeader 
                    patientName={patientInfo.name}
                    onBack={handleGoBack}
                />
                <div className="chat-messages-area">
                    {messages.map(msg => (
                        <ChatMessage 
                            key={msg.id}
                            message={msg.text}
                            isSender={msg.senderId === CURRENT_USER_ID}
                            timestamp={formatChatTimestamp(msg.timestamp)}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <ChatInputArea 
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    onSendMessage={handleSendMessage}
                />
            </div>

            {/* --- 2. PATIENT CONTEXT SIDEBAR --- */}
            <PatientInfoSidebar patient={patientInfo} />

        </div>
    );
}

// ######################################################################
// ### SUB-COMPONENTS                                                 ###
// ######################################################################

/** The header of the active chat window */
const ActiveChatHeader = ({ patientName, onBack }) => (
    <div className="chat-header">
        <div className="patient-info">
            <button className="back-button" onClick={onBack} title="Back to Appointments">
                <FiArrowLeft />
            </button>
            <div className="info-text">
                <span className="patient-name">Consultation with {patientName}</span>
                <span className="patient-status">
                    <span className="status-dot"></span>
                    Active Now
                </span>
            </div>
        </div>
        <div className="chat-actions">
            <button className="action-btn" title="Start Audio Call">
                <FiPhone /> <span>Call</span>
            </button>
            <button className="action-btn btn-video" title="Start Video Call">
                <FiVideo /> <span>Video</span>
            </button>
            <button className="action-btn-icon" title="More Options">
                <FiMoreVertical />
            </button>
        </div>
    </div>
);

/** A single message bubble */
const ChatMessage = ({ message, isSender, timestamp }) => (
    <div className={`message-wrapper ${isSender ? 'sent' : 'received'}`}>
        <div className="message-bubble">
            <p className="message-text">{message}</p>
            <span className="message-timestamp">{timestamp}</span>
        </div>
    </div>
);

/** The message input form at the bottom */
const ChatInputArea = ({ newMessage, setNewMessage, onSendMessage }) => (
    <form className="chat-input-area" onSubmit={onSendMessage}>
        <button type="button" className="action-btn-icon" title="Attach File">
            <FiPaperclip />
        </button>
        <input 
            type="text" 
            placeholder="Type your message here..."
            className="message-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="send-button" title="Send Message">
            <FiSend /> <span>Send</span>
        </button>
    </form>
);

/** The new Patient Info Sidebar */
const PatientInfoSidebar = ({ patient }) => {
    return (
        <div className="patient-info-sidebar">
            <div className="patient-profile-header">
                <div className="patient-avatar-large">
                    {patient.avatarUrl ? 
                        <img src={patient.avatarUrl} alt={patient.name} /> :
                        <FiUser size={40} />
                    }
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