import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LinearProgress, Button } from '@mui/material';
import {
    FaCamera,
    FaUser,
    FaPhoneAlt,
    FaArrowLeft,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaBriefcaseMedical,
    FaRegBookmark,
    FaChevronDown
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { IoMdSettings, IoMdHelpCircleOutline } from 'react-icons/io';
import "../../css/patientprofile.css"
import Bubbles from "../../components/Loaders/bubbles"

const PatientProfile = () => {
    const [profile, setProfile] = useState(null);
    const [url, setUrl] = useState(null);
    const [loading,setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
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
                console.log(response);
                if (res.status === 200) {
                    setProfile(response.profile);
                    setUrl(response.profile.profilePic || null);
                } 
                else if(!response.isToken)
                    navigate("/patient/login?alert=Session expired please login again")
                else {
                    console.log('Failed to fetch profile');
                }
            } catch (err) {
                console.log(err);
            }
        }

        fetchProfile();
    }, []);

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

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
                setLoading(false)
                setUrl(fileUrl);
            } catch (err) {
                console.log(err);
            }
        }
    };

    const logout=async()=>{

        await fetch("http://localhost:8000/patient/logout",{
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
        })
        .then((res)=>{
            if(res.status==200)
                navigate('/patient/login?alert=Logged Out Successfully')
            else
                toast.error("Please try logging out again")
        })
        .catch((err)=>console.log(err))
    }

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

            if (uploadData.secure_url) {
                await saveFileToDb(uploadData.secure_url);
            } else {
                toast.error("Error uploading file");
            }
        } catch (err) {
            console.log(err);
            toast.error("Error uploading file");
        }
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const saveProfile = async () => {
        try {
            const res = await fetch('http://localhost:8000/patient/updateprofile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(profile)
            });
            const data = await res.json();
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

    if (!profile) return <Bubbles/>

    return (
        <div className="main">
            {loading && (
                <LinearProgress color="primary" className="progress" />
            )}
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
                        <button className='logout' onClick={logout} >
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm5.03 4.72a.75.75 0 0 1 0 1.06l-1.72 1.72h10.94a.75.75 0 0 1 0 1.5H10.81l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
</svg>

                            <span >Log out</span>
                        </button>
                    </nav>
                </div>

                <div className="profile-main-content">

                    <div className="profile-logo">
                        <svg width="60" height="60" className="logo-svg" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M64.9511 16.4914H53.5086V5.04886C53.5086 2.26596 51.2426 0 48.4597 0H21.5364C18.7535 0 16.4875 2.26596 16.4875 5.04886V16.4914H5.04886C2.26596 16.4914 0 18.7535 0 21.5403V48.4636C0 51.2465 2.26596 53.5125 5.04886 53.5125H16.4914V64.955C16.4914 67.7379 18.7535 70.0039 21.5403 70.0039H48.4636C51.2465 70.0039 53.5125 67.7379 53.5125 64.955V53.5125H64.955C67.7379 53.5125 70.0039 51.2465 70.0039 48.4636V21.5403C70 18.7535 67.734 16.4914 64.9511 16.4914ZM64.613 48.1255H53.5086V27.2576H48.1255V64.613H21.8745V53.5086H42.7385V48.1255H5.38312V21.8745H16.4875V42.7385H21.8706V5.38312H48.1177V16.4875H27.2615V21.8706H64.6169V48.1255H64.613Z"
                              fill="url(#paint0_linear_495_3740)"
                            />
                            <defs>
                              <linearGradient id="paint0_linear_495_3740" x1="-1.69238e-07" y1="3.58994" x2="76.3966" y2="18.4545" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#0EBE7E" />
                                <stop offset="1" stopColor="#07D9AD" />
                              </linearGradient>
                            </defs>
                        </svg>
                        HELLO <span className="profile-logo-blue">Dr.</span>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="profile-form">
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
                            </div>
                        </section>

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
};
export default PatientProfile; 