import React, { useState,useEffect } from 'react';
import '../../css/favouritedoctors.css';
import toast, { Toaster } from 'react-hot-toast';
import {useNavigate} from 'react-router-dom'

const FavoriteDoctors = () => {
  
const [favoriteDoctors, setFavoriteDoctors] = useState([]);
const API = import.meta.env.VITE_API_URL;
const navigate=useNavigate()


useEffect(() => {
  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API}/patient/viewfav`, {
        method: "GET",
        credentials: "include"
      });

      const data = await res.json();

      if (data.success) {
        setFavoriteDoctors(data.doctors || []);
      } else {
        setFavoriteDoctors([]);
      }

    } catch (error) {
      console.error("Error fetching favorite doctors:", error);
      setFavoriteDoctors([]);
    }
  };

  fetchFavorites();
}, []);


  const handleRemoveFavorite = async(doctorId) => {
  try {
    const res = await fetch(`${API}/patient/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doctorId,
        isLiked: false
      }),
      credentials: "include"
    });

    const data = await res.json();
    toast.success(data.message);
    setFavoriteDoctors(prev =>
      prev.filter(doctor => doctor._id !== doctorId)
    );


  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to like or unlike");
    setIsLiked(prev => !prev); 
  }



  };

  const handleViewProfile = (doctorId) => {
    // Function to navigate to doctor profile
	navigate(`/patient/${doctorId}`)
};

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <span className='hero-title'>Favorites</span>
        <p className="subtitle">{favoriteDoctors.length} doctors saved</p>
      </div>

      <div className="doctors-grid">
        {favoriteDoctors.map((doctor) => (
  <div key={doctor._id} className="doctor-card">

    <button 
      className="remove-favorite-btn"
      onClick={() => handleRemoveFavorite(doctor._id)}
      title="Remove from favorites"
    >
     <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000" >
  <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>

    </button>

    <div className="doctor-image">
      <img src={doctor.profilePic} alt={doctor.name} />
    </div>

    <div className="doctor-info">
      <h2 className="doctor-name">{doctor.name}</h2>

      <p className="doctor-hospital">{doctor.hospital}</p>

      <p className="doctor-specialty">{doctor.speciality}</p>

      <div className="doctor-stats">
        <div className="stat"><span>⭐</span> {doctor.rating || "4.5"}</div>
        <div className="stat">{doctor.experience} yrs of Experience</div>
      </div>

      <button 
        className="view-profile-btn"
        onClick={() => handleViewProfile(doctor._id)}
      >
        View Profile
      </button>
    </div>

  </div>
))}

      </div>

      {favoriteDoctors.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💙</div>
          <h2>No Favorite Doctors Yet</h2>
          <p>Start adding doctors to your favorites to see them here</p>
        </div>
      )}
    </div>
  );
};

export default FavoriteDoctors;
