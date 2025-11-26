import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import {
    FaCamera, FaUser, FaPhoneAlt, FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt,
    FaRegBookmark, FaChevronDown, FaEnvelope, FaStethoscope, FaAward, FaDollarSign,
    FaLanguage, FaStar, FaInfoCircle, FaPlus, FaEdit, FaBars, FaTimes
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { IoMdSettings, IoMdHelpCircleOutline } from 'react-icons/io';
import "../../css/doctorprofile.css";
import Bubbles from '../../components/Loaders/bubbles';
const API = import.meta.env.VITE_API_URL;

export default function DoctorProfile() {
    const [profile, setProfile] = useState(null);
    const [languageInput, setLanguageInput] = useState("");
    const [newTreatment, setNewTreatment] = useState("");
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`${API}/doctor/profile`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const response = await res.json();
                if (res.status === 200) {
                    setProfile(response.profile);
                    setUrl(response.profile.profilePic || null);
                    setLanguageInput(response.profile.languages?.join(', ') || "");
                } else if (res.status === 401) {
                    navigate('/doctor/login?alert=Session expired, please login again');
                }
            } catch (err) {
                console.log(err);
                toast.error('Failed to load profile');
            }
        }
        fetchProfile();
    }, [navigate]);

    const handleButtonClick = () => fileInputRef.current.click();

    const saveFileToDb = async (fileUrl) => {
        if (fileUrl) {
            try {
                const res = await fetch(`${API}/doctor/uploadimg`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ url: fileUrl })
                });
                
                if (res.status === 401) {
                    navigate('/doctor/login?alert=Session expired, please login again');
                    return;
                }
                
                toast.success('Profile image updated successfully');
                setLoading(false);
                setUrl(fileUrl);
            } catch (err) {
                console.log(err);
                toast.error('Failed to update profile image');
                setLoading(false);
            }
        }
    };

    const logout = async () => {
        try {
            const res = await fetch(`${API}/doctor/logout`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (res.status === 200) {
                navigate('/doctor/login?alert=Logged Out Successfully');
            } else {
                toast.error("Please try logging out again");
            }
        } catch (err) {
            console.log(err);
            toast.error("Error logging out");
        }
    };

    const fileUpload = async (event) => {
        const file = event.target.files[0];
        
        if (!file) {
            toast.error("Please select a file");
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'g2rsi4nz');
        formData.append('quality', '100');

        try {
            const cloudRes = await fetch(`${API}/patient/cloudcred`, {
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

            if (uploadData.secure_url) {
                await saveFileToDb(uploadData.secure_url);
            } else {
                toast.error("Error uploading file");
                setLoading(false);
            }
        } catch (err) {
            console.log(err);
            toast.error("Error uploading file");
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'languages') {
            setLanguageInput(value);
            setProfile(prev => ({ 
                ...prev, 
                languages: value.split(',').map(l => l.trim()).filter(l => l) 
            }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const addTreatment = () => {
        if (!newTreatment.trim()) {
            toast.error("Please enter a treatment");
            return;
        }
        setProfile(prev => ({
            ...prev,
            pasttreatments: [...(prev.pasttreatments || []), newTreatment.trim()]
        }));
        setNewTreatment("");
        toast.success("Treatment added");
    };

    const removeTreatment = (index) => {
        setProfile(prev => ({
            ...prev,
            pasttreatments: prev.pasttreatments.filter((_, i) => i !== index)
        }));
        toast.success("Treatment removed");
    };

    const handleTreatmentKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTreatment();
        }
    };

    const saveProfile = async () => {
        if (!String(profile.name || "").trim()) {
    toast.error("Name is required");
    return;
}

if (!String(profile.phone || "").trim()) {
    toast.error("Phone number is required");
    return;
}

if (!String(profile.speciality || "").trim()) {
    toast.error("Speciality is required");
    return;
}


        const updatedProfile = {
            ...profile,
            languages: languageInput.split(',').map(l => l.trim()).filter(l => l)
        };
        setProfile(updatedProfile);

        try {
            setLoading(true);
            const res = await fetch(`${API}/doctor/updateprofile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updatedProfile)
            });
            const data = await res.json();
            setLoading(false);

            if (res.status === 401) {
                navigate('/doctor/login?alert=Session expired, please login again');
                return;
            }

            if (res.status === 200) {
                toast.success('Profile updated successfully');
                setEditMode(false);
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.log(err);
            toast.error('Error updating profile');
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditMode(false);
        window.location.reload();
    };

    // Close sidebar when clicking outside on mobile
    const closeSidebar = () => setSidebarOpen(false);

    if (!profile) {
        return (
            <div className="main">
                <div className="profile-main-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Bubbles />
                </div>
            </div>
        );
    }

    return (
        <div className="main">
            {loading && <LinearProgress color="primary" className="progress" />}
            
            {/* Mobile Hamburger Button */}
            <button 
                className="mobile-hamburger-btn" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
            >
                {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="mobile-sidebar-overlay" 
                    onClick={closeSidebar}
                />
            )}

            <div className="profile-main-container">
                <Toaster position="top-right" toastOptions={{ className: "my-toast", duration: 3000 }} />

                {/* Sidebar */}
                <div className={`profile-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
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
                        <button 
                            className="profile-camera-btn" 
                            onClick={handleButtonClick}
                            title="Change profile picture"
                        >
                            <FaCamera />
                        </button>
                    </div>

                    <h1 className="profile-sidebar-title montserrat-regular">
                        Hello Dr. {profile.name}
                    </h1>
                    <p className="profile-sidebar-desc">
                        Update your profile to connect with <strong>patients</strong> with a better impression
                    </p>

                    <nav className="profile-sidebar-nav">
                        <Link to="/doctor/home" className="sidebar-home-link" onClick={closeSidebar}>
                            <FaArrowLeft /> <span>Back to Home</span>
                        </Link>
                        <Link to="/doctor/settings" onClick={closeSidebar}>
                            <IoMdSettings />
                            <span>Settings</span>
                        </Link>
                        <Link to="/doctor/help" onClick={closeSidebar}>
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
                        <svg width="55" height="55" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_495_3740)">
                                <path d="M64.9511 16.4914H53.5086V5.04886C53.5086 2.26596 51.2426 0 48.4597 0H21.5364C18.7535 0 16.4875 2.26596 16.4875 5.04886V16.4914H5.04886C2.26596 16.4914 0 18.7535 0 21.5403V48.4636C0 51.2465 2.26596 53.5125 5.04886 53.5125H16.4914V64.955C16.4914 67.7379 18.7535 70.0039 21.5403 70.0039H48.4636C51.2465 70.0039 53.5125 67.7379 53.5125 64.955V53.5125H64.955C67.7379 53.5125 70.0039 51.2465 70.0039 48.4636V21.5403C70 18.7535 67.734 16.4914 64.9511 16.4914ZM64.613 48.1255H53.5086V27.2576H48.1255V64.613H21.8745V53.5086H42.7385V48.1255H5.38312V21.8745H16.4875V42.7385H21.8706V5.38312H48.1177V16.4875H27.2615V21.8706H64.6169V48.1255H64.613Z" fill="url(#paint0_linear_495_3740)"/>
                            </g>
                            <defs>
                                <linearGradient id="paint0_linear_495_3740" x1="-1.69238e-07" y1="3.58994" x2="76.3966" y2="18.4545" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#0EBE7E"/>
                                    <stop offset="1" stopColor="#07D9AD"/>
                                </linearGradient>
                                <clipPath id="clip0_495_3740">
                                    <rect width="70" height="70" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                        HELLO <span className="profile-logo-blue">Dr.</span>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="profile-form">
                        {/* Personal Info */}
                        <section className="profile-form-section">
                            <h2>Personal Information</h2>
                            <div className="profile-form-grid">
                                <div className="profile-input-group">
                                    <FaUser className="profile-input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        name="name"
                                        value={profile.name || ""}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                    />
                                </div>

                                <div className="profile-input-group">
                                    <FaEnvelope className="profile-input-icon" />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        name="email"
                                        value={profile.email || ""}
                                        readOnly
                                        title="Email cannot be changed"
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
                                        placeholder="Address"
                                        name="address"
                                        value={profile.address || ""}
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
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <FaChevronDown className="profile-input-icon-right" />
                                </div>
                            </div>
                        </section>

                        {/* Professional Details */}
                        <section className="profile-form-section">
                            <h2>Professional Details</h2>
                            <div className="profile-form-grid">
                                <div className="profile-input-group">
                                    <FaStethoscope className="profile-input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Speciality"
                                        name="speciality"
                                        value={profile.speciality || ""}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                    />
                                </div>

                                <div className="profile-input-group">
                                    <FaAward className="profile-input-icon" />
                                    <input
                                        type="number"
                                        placeholder="Experience (in years)"
                                        name="experience"
                                        value={profile.experience || ""}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                        min="0"
                                    />
                                </div>

                                <div className="profile-input-group">
                                    <FaDollarSign className="profile-input-icon" />
                                    <input
                                        type="number"
                                        placeholder="Consultation Fee"
                                        name="fee"
                                        value={profile.fee || ""}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                        min="0"
                                    />
                                </div>

                                <div className="profile-input-group">
                                    <FaLanguage className="profile-input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Languages (comma-separated)"
                                        name="languages"
                                        value={languageInput}
                                        onChange={handleInputChange}
                                        readOnly={!editMode}
                                    />
                                </div>

                                <div className="profile-input-group">
                                    <FaStar className="profile-input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Rating"
                                        name="rating"
                                        value={profile.rating ? `${profile.rating.toFixed(1)} / 5.0` : "Not Rated"}
                                        readOnly
                                        title="Rating is based on patient reviews"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Past Treatments */}
                        <section className="profile-form-section">
                            <h2>Past Treatments</h2>
                            <div className="allergy-list-container">
                                <div className="allergy-tags">
                                    {(profile.pasttreatments || []).length === 0 && (
                                        <p className="no-allergies-text">No past treatments added yet</p>
                                    )}
                                    {(profile.pasttreatments || []).map((treatment, index) => (
                                        <div key={index} className="allergy-tag">
                                            {treatment}
                                            {editMode && (
                                                <span
                                                    className="remove-allergy"
                                                    onClick={() => removeTreatment(index)}
                                                    title="Remove treatment"
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
                                            placeholder="Type treatment and press Enter"
                                            value={newTreatment}
                                            onChange={(e) => setNewTreatment(e.target.value)}
                                            onKeyPress={handleTreatmentKeyPress}
                                        />
                                        <button
                                            type="button"
                                            onClick={addTreatment}
                                            className="add-allergy-btn"
                                        >
                                            <FaPlus /> Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Biography */}
                        <section className="profile-form-section">
                            <h2>Biography</h2>
                            <div className="profile-input-group profile-textarea-group">
                                <FaInfoCircle className="profile-input-icon" />
                                <textarea
                                    rows="5"
                                    placeholder="Write a short bio about your experience and qualifications..."
                                    name="bio"
                                    value={profile.bio || ""}
                                    onChange={handleInputChange}
                                    readOnly={!editMode}
                                />
                            </div>
                        </section>

                        {/* Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            {!editMode ? (
                                <button
                                    type="button"
                                    className="profile-save-btn"
                                    onClick={() => setEditMode(true)}
                                >
                                    <FaEdit /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="profile-save-btn"
                                        onClick={cancelEdit}
                                        style={{ background: '#6b7280' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="profile-save-btn"
                                        onClick={saveProfile}
                                        disabled={loading}
                                    >
                                        <FaRegBookmark /> Save Changes
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}