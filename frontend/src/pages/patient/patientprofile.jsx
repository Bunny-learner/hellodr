import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import {
    FaCamera,
    FaUser,
    FaPhoneAlt,
    FaArrowLeft,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaBriefcaseMedical,
    FaRegBookmark,
    FaChevronDown,
    FaHeartbeat,
    FaPlus,
    FaTimes,
    FaEdit,
    FaCheck
} from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import { IoMdSettings, IoMdHelpCircleOutline } from 'react-icons/io';
import "../../css/patientprofile.css";
import Bubbles from "../../components/Loaders/bubbles";

const PatientProfile = () => {
    const [profile, setProfile] = useState(null);
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newAllergy, setNewAllergy] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("http://localhost:8000/patient/profile", {
                    method: 'GET',
                    credentials: 'include'
                });
                const response = await res.json();
                if (res.status === 200) {
                    setProfile(response.profile);
                    setUrl(response.profile.profilePic || null);
                } else if (!response.isToken) {
                    navigate("/patient/login?alert=Session expired please login again");
                } else {
                    console.log('Failed to fetch profile');
                }
            } catch (err) {
                console.log(err);
            }
        }
        fetchProfile();
    }, [navigate]);

    const handleButtonClick = () => fileInputRef.current.click();

    const saveFileToDb = async (fileUrl) => {
        if (fileUrl) {
            try {
                await fetch('http://localhost:8000/patient/uploadimg', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ url: fileUrl })
                });
                toast.success('Profile image updated successfully');
                setLoading(false);
                setUrl(fileUrl);
            } catch (err) {
                console.log(err);
            }
        }
    };

    const logout = async () => {
        await fetch("http://localhost:8000/patient/logout", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((res) => {
                if (res.status === 200)
                    navigate('/patient/login?alert=Logged Out Successfully');
                else toast.error("Please try logging out again");
            })
            .catch((err) => console.log(err));
    };

    const fileUpload = async (event) => {
        const file = event.target.files[0];
        setLoading(true);
        if (!file) {
            toast.error("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'g2rsi4nz');
        formData.append('quality', '100');

        try {
            const cloudRes = await fetch('http://localhost:8000/patient/cloudcred', {
                method: 'GET',
                credentials: 'include'
            });
            const cloudData = await cloudRes.json();
            const cloudName = cloudData.cloudname;

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (uploadData.secure_url) await saveFileToDb(uploadData.secure_url);
            else toast.error("Error uploading file");
        } catch (err) {
            console.log(err);
            toast.error("Error uploading file");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const addAllergy = () => {
        if (!newAllergy.trim()) return;
        setProfile(prev => ({
            ...prev,
            allergys: [...(prev.allergys || []), newAllergy.trim()]
        }));
        setNewAllergy("");
    };

    const removeAllergy = (index) => {
        setProfile(prev => ({
            ...prev,
            allergys: prev.allergys.filter((_, i) => i !== index)
        }));
    };

    const handleAllergyKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addAllergy();
        }
    };

    const saveProfile = async () => {
        try {
            const res = await fetch('http://localhost:8000/patient/updateprofile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(profile)
            });
            if (res.status === 200) {
                toast.success('Profile updated successfully');
                setEditMode(false);
            } else {
                toast.error('Failed to update profile');
            }
        } catch (err) {
            console.log(err);
            toast.error('Error updating profile');
        }
    };

    if (!profile) return <Bubbles />;

    return (
        <div className="patient-profile-wrapper">
            {loading && <LinearProgress color="primary" className="profile-progress-bar" />}
            <Toaster 
                position="top-right" 
                toastOptions={{ 
                    className: "custom-toast",
                    duration: 3000,
                    style: {
                        background: '#fff',
                        color: '#333',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderRadius: '12px',
                        padding: '16px'
                    }
                }} 
            />

            {/* Mobile Header */}
            <div className="mobile-header">
                <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div className="mobile-logo">
                    <svg width="40" height="40" viewBox="0 0 70 70" fill="none">
                        <path d="M64.9511 16.4914H53.5086V5.04886C53.5086 2.26596 51.2426 0 48.4597 0H21.5364C18.7535 0 16.4875 2.26596 16.4875 5.04886V16.4914H5.04886C2.26596 16.4914 0 18.7535 0 21.5403V48.4636C0 51.2465 2.26596 53.5125 5.04886 53.5125H16.4914V64.955C16.4914 67.7379 18.7535 70.0039 21.5403 70.0039H48.4636C51.2465 70.0039 53.5125 67.7379 53.5125 64.955V53.5125H64.955C67.7379 53.5125 70.0039 51.2465 70.0039 48.4636V21.5403C70 18.7535 67.734 16.4914 64.9511 16.4914ZM64.613 48.1255H53.5086V27.2576H48.1255V64.613H21.8745V53.5086H42.7385V48.1255H5.38312V21.8745H16.4875V42.7385H21.8706V5.38312H48.1177V16.4875H27.2615V21.8706H64.6169V48.1255H64.613Z" fill="url(#paint0_linear)"/>
                        <defs>
                            <linearGradient id="paint0_linear" x1="0" y1="0" x2="70" y2="70">
                                <stop stopColor="#0EBE7E"/>
                                <stop offset="1" stopColor="#07D9AD"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <span>Health<strong>Care</strong></span>
                </div>
            </div>

            <div className="profile-container">
                {/* Sidebar */}
                <aside className={`profile-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                    <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
                    <div className="sidebar-content">
                        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
                            <FaTimes />
                        </button>

                        <div className="profile-header">
                            <div className="profile-pic-container">
                                <div className="profile-avatar">
                                    {!url ? <FaUser /> : <img src={url} alt="Profile" />}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={fileUpload}
                                />
                                <button className="camera-btn" onClick={handleButtonClick}>
                                    <FaCamera />
                                </button>
                            </div>
                            <h2 className="profile-name">Hello, {profile.name}</h2>
                            <p className="profile-subtitle">Manage your health profile</p>
                        </div>

                        <nav className="sidebar-nav">
                            <button className="nav-item back-btn" onClick={() => navigate(-1)}>
                                <FaArrowLeft />
                                <span>Back</span>
                            </button>
                            <Link to="/patient/settings" className="nav-item">
                                <IoMdSettings />
                                <span>Settings</span>
                            </Link>
                            <Link to="/patient/help" className="nav-item">
                                <IoMdHelpCircleOutline />
                                <span>Help Center</span>
                            </Link>
                            <button className="nav-item logout-btn" onClick={logout}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm5.03 4.72a.75.75 0 0 1 0 1.06l-1.72 1.72h10.94a.75.75 0 0 1 0 1.5H10.81l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="profile-main">
                    <div className="profile-content">
                        <div className="content-header">
                            <div className="header-left">
                                <h1 className="page-title">My Profile</h1>
                                <p className="page-subtitle">Keep your information up to date</p>
                            </div>
                            <div className="header-actions">
                                {!editMode ? (
                                    <button className="btn-edit" onClick={() => setEditMode(true)}>
                                        <FaEdit /> Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button className="btn-cancel" onClick={() => setEditMode(false)}>
                                            <FaTimes /> Cancel
                                        </button>
                                        <button className="btn-save" onClick={saveProfile}>
                                            <FaCheck /> Save Changes
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Personal Information */}
                        <section className="profile-section">
                            <div className="section-header">
                                <h3 className="section-title">Personal Information</h3>
                                <div className="section-divider"></div>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <div className="input-wrapper">
                                        <FaUser className="input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Enter your full name"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleInputChange}
                                            readOnly={!editMode}
                                            className={editMode ? 'editable' : ''}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <MdEmail className="input-icon" />
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            name="email"
                                            value={profile.email || ""}
                                            onChange={handleInputChange}
                                            readOnly={!editMode}
                                            className={editMode ? 'editable' : ''}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <div className="input-wrapper">
                                        <FaPhoneAlt className="input-icon" />
                                        <input
                                            type="tel"
                                            placeholder="Enter your phone number"
                                            name="phone"
                                            value={profile.phone || ""}
                                            onChange={handleInputChange}
                                            readOnly={!editMode}
                                            className={editMode ? 'editable' : ''}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <div className="input-wrapper">
                                        <FaCalendarAlt className="input-icon" />
                                        <input
                                            type="date"
                                            name="dob"
                                            value={profile.dob ? profile.dob.slice(0, 10) : ""}
                                            onChange={handleInputChange}
                                            readOnly={!editMode}
                                            className={editMode ? 'editable' : ''}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Gender</label>
                                    <div className="input-wrapper select-wrapper">
                                        <select
                                            name="gender"
                                            value={profile.gender || ""}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className={editMode ? 'editable' : ''}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <FaChevronDown className="select-icon" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <div className="input-wrapper">
                                        <FaMapMarkerAlt className="input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Enter your location"
                                            name="location"
                                            value={profile.location || ""}
                                            onChange={handleInputChange}
                                            readOnly={!editMode}
                                            className={editMode ? 'editable' : ''}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Medical Information */}
                        <section className="profile-section">
                            <div className="section-header">
                                <h3 className="section-title">Medical Information</h3>
                                <div className="section-divider"></div>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Blood Group</label>
                                    <div className="input-wrapper select-wrapper">
                                        <select
                                            name="bloodGroup"
                                            value={profile.bloodGroup || ""}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className={editMode ? 'editable' : ''}
                                        >
                                            <option value="">Select Blood Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                        <FaHeartbeat className="select-icon" />
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label>Allergies</label>
                                    <div className="allergies-container">
                                        <div className="allergy-tags">
                                            {(profile.allergys || []).length === 0 && !editMode && (
                                                <p className="no-data">No allergies recorded</p>
                                            )}
                                            {(profile.allergys || []).map((allergy, index) => (
                                                <span key={index} className="allergy-tag">
                                                    {allergy}
                                                    {editMode && (
                                                        <button
                                                            className="remove-tag"
                                                            onClick={() => removeAllergy(index)}
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                        {editMode && (
                                            <div className="add-allergy">
                                                <input
                                                    type="text"
                                                    placeholder="Type allergy and press Enter"
                                                    value={newAllergy}
                                                    onChange={(e) => setNewAllergy(e.target.value)}
                                                    onKeyPress={handleAllergyKeyPress}
                                                />
                                                <button className="btn-add" onClick={addAllergy}>
                                                    <FaPlus />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label>Past Medical History</label>
                                    <div className="input-wrapper textarea-wrapper">
                                        <FaBriefcaseMedical className="input-icon" />
                                        <textarea
                                            rows="5"
                                            placeholder="Enter your medical history"
                                            name="medicalHistory"
                                            value={profile.medicalHistory || ""}
                                            onChange={handleInputChange}
                                            readOnly={!editMode}
                                            className={editMode ? 'editable' : ''}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PatientProfile;