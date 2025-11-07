import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import icon from "../../assets/icon.png";
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
    FaPlus
} from 'react-icons/fa';
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

    // ---- Allergies ----
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
        <div className="main">
            {loading && <LinearProgress color="primary" className="progress" />}
            <div className="profile-main-container">
                <Toaster position="top-left" toastOptions={{ className: "my-toast" }} />

                {/* Sidebar */}
                <div className="profile-sidebar">
                    <div className="profile-pic-wrapper">
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
                        <button className="profile-camera-btn" onClick={handleButtonClick}>
                            <FaCamera />
                        </button>
                    </div>

                    <h1 className="profile-sidebar-title montserrat-regular">Hello {profile.name}</h1>
                    <p className="profile-sidebar-desc">
                        Update your profile to connect with doctors with a better impression
                    </p>

                    <nav className="profile-sidebar-nav">
                        <Link to="/patient/home" className="sidebar-home-link">
                            <FaArrowLeft /> <span>Back to Home</span>
                        </Link>
                        <Link to="/patient/settings">
                            <IoMdSettings />
                            <span>Settings</span>
                        </Link>
                        <Link to="/patient/help">
                            <IoMdHelpCircleOutline />
                            <span>Help center</span>
                        </Link>
                        <button className='logout' onClick={logout}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                                <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm5.03 4.72a.75.75 0 0 1 0 1.06l-1.72 1.72h10.94a.75.75 0 0 1 0 1.5H10.81l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                            </svg>
                            <span>Log out</span>
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="profile-main-content">
                    <div className="profile-logo">
                         <img src={icon} alt="App Icon" style={{ width: "60px", height: "60px" }} />
                        HELLO <span className="profile-logo-blue">Dr.</span>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="profile-form">
                        {/* Personal Info */}
                        <section className="profile-form-section">
                            <h2>Personal information</h2>
                            <div className="profile-form-grid">
                                <div className="profile-input-group">
                                    <FaUser className="profile-input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                    />
                                </div>

                                <div className="profile-input-group">
                                    <FaPhoneAlt className="profile-input-icon" />
                                    <input
                                        type="tel"
                                        placeholder="Contact Number"
                                        name="phone"
                                        value={profile.phone || ""}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                    />
                                </div>

                                <div className="profile-input-group">
                                    <FaCalendarAlt className="profile-input-icon" />
                                    <input
                                        type="date"
                                        name="dob"
                                        value={profile.dob ? profile.dob.slice(0, 10) : ""}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                    />
                                </div>

                                <div className="profile-input-group">
                                    <FaMapMarkerAlt className="profile-input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Location"
                                        name="location"
                                        value={profile.location || ""}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                    />
                                </div>

                                <div className="profile-input-group profile-select-group">
                                    <select
                                        name="gender"
                                        value={profile.gender || ""}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                    >
                                        <option value="">Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <FaChevronDown className="profile-input-icon-right" />
                                </div>

                                <div className="profile-input-group profile-select-group">
                                    <select
                                        name="bloodGroup"
                                        value={profile.bloodGroup || ""}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                    >
                                        <option value="">Blood Group</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                    <FaHeartbeat className="profile-input-icon-right" />
                                </div>
                            </div>
                        </section>

                        {/* Allergies */}
                        <section className="profile-form-section">
                            <h2>Allergies</h2>
                            <div className="allergy-list-container">
                                <div className="allergy-tags">
                                    {(profile.allergys || []).length === 0 && (
                                        <p className="no-allergies-text">No allergies added yet</p>
                                    )}
                                    {(profile.allergys || []).map((allergy, index) => (
                                        <div key={index} className="allergy-tag">
                                            {allergy}
                                            {editMode && (
                                                <span
                                                    className="remove-allergy"
                                                    onClick={() => removeAllergy(index)}
                                                >
                                                    ×
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {editMode && (
                                    <div className="add-allergy-input">
                                        <input
                                            type="text"
                                            placeholder="Type allergy and press Enter"
                                            value={newAllergy}
                                            onChange={(e) => setNewAllergy(e.target.value)}
                                            onKeyPress={handleAllergyKeyPress}
                                        />
                                        <button type="button" onClick={addAllergy} className="add-allergy-btn">
                                            <FaPlus /> Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Past Medical History */}
                        <section className="profile-form-section">
                            <h2>Past medical history</h2>
                            <div className="profile-input-group profile-textarea-group">
                                <FaBriefcaseMedical className="profile-input-icon" />
                                <textarea
                                    rows="5"
                                    name="medicalHistory"
                                    value={profile.medicalHistory || ""}
                                    onChange={handleInputChange}
                                    readOnly={!editMode}
                                />
                            </div>
                        </section>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            {!editMode && (
                                <button type="button" className="profile-save-btn" onClick={() => setEditMode(true)}>
                                    Edit
                                </button>
                            )}
                            {editMode && (
                                <button type="button" className="profile-save-btn" onClick={saveProfile}>
                                    Save <FaRegBookmark />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
