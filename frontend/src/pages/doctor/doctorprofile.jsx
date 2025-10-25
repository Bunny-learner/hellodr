import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import {
    FaCamera, FaUser, FaPhoneAlt, FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt,
    FaRegBookmark, FaChevronDown, FaEnvelope, FaStethoscope, FaAward, FaDollarSign,
    FaLanguage, FaStar, FaInfoCircle
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { IoMdSettings, IoMdHelpCircleOutline } from 'react-icons/io';
import "../../css/patientprofile.css";
import Bubbles from '../../components/Loaders/bubbles';

export default function DoctorProfile() {
    const [profile, setProfile] = useState(null);
    const [languageInput, setLanguageInput] = useState("");
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("http://localhost:8000/doctor/profile", {
                    method: 'GET',
                    credentials: 'include'
                });
                const response = await res.json();
                if (res.status === 200) {
                    setProfile(response.profile);
                    setUrl(response.profile.profilePic || null);
                    setLanguageInput(response.profile.languages?.join(', ') || "");
                }
            } catch (err) {
                console.log(err);
            }
        }
        fetchProfile();
    }, []);

    const handleButtonClick = () => fileInputRef.current.click();

    const saveFileToDb = async (fileUrl) => {
        if (fileUrl) {
            try {
                await fetch('http://localhost:8000/doctor/uploadimg', {
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
        try {
            const res = await fetch("http://localhost:8000/doctor/logout", {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (res.status === 200)
                navigate('/doctor/login?alert=Logged Out Successfully')
            else
                toast.error("Please try logging out again")
        } catch (err) {
            console.log(err);
        }
    };

    const fileUpload = async (event) => {
        const file = event.target.files[0];
        setLoading(true);
        if (!file) {
            toast.error("Please select a file");
            setLoading(false);
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
            setProfile(prev => ({ ...prev, languages: value.split(',').map(l => l.trim()).filter(l => l) }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const saveProfile = async () => {
        const updatedProfile = {
            ...profile,
            languages: languageInput.split(',').map(l => l.trim()).filter(l => l)
        };
        setProfile(updatedProfile);

        try {
            const res = await fetch('http://localhost:8000/doctor/updateprofile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updatedProfile)
            });
            const data = await res.json();
            if (res.status === 200) {
                toast.success('Profile updated successfully');
                setEditMode(false);
            } else {
                toast.error(data.message || 'Failed to update profile');
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

                    <h1 className="profile-sidebar-title montserrat-regular">Hello Dr. {profile.name}</h1>
                    <p className="profile-sidebar-desc">
                        Update your profile to connect with <strong>patients</strong> with a better impression
                    </p>

                    <nav className="profile-sidebar-nav">
                        <Link to="/doctor/home" className="sidebar-home-link">
                            <FaArrowLeft /> <span>Back to Home</span>
                        </Link>
                        <Link to="#settings">
                            <IoMdSettings />
                            <span>Settings</span>
                        </Link>
                        <Link to="#help">
                            <IoMdHelpCircleOutline />
                            <span>Help center</span>
                        </Link>
                        <button className='logout' onClick={logout}>
                            <span>Log out</span>
                        </button>
                    </nav>
                </div>

                <div className="profile-main-content">
                    <form onSubmit={(e) => e.preventDefault()} className="profile-form">

                        {/* Personal Information */}
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
                                    <FaEnvelope className="profile-input-icon" />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        name="email"
                                        value={profile.email}
                                        readOnly
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
                                        <option value="">Gender</option>
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
                                    />
                                </div>
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            {!editMode && (
                                <button
                                    type="button"
                                    className="profile-save-btn"
                                    onClick={() => setEditMode(true)}
                                >
                                    Edit
                                </button>
                            )}
                            {editMode && (
                                <button
                                    type="button"
                                    className="profile-save-btn"
                                    onClick={saveProfile}
                                >
                                    Save <FaRegBookmark />
                                </button>
                            )}
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
