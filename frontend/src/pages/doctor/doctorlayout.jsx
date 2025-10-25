import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../../components/Navbar/navbar";
import { Toaster } from "react-hot-toast";
import Bubbles from "../../components/Loaders/bubbles";
import { DoctorContext } from "./doctorcontext"
import "../../css/doctorhome.css"

export default function PatientLayout() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
   

    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:8000/doctor/profile", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.status === 200) {
          setProfile(data.profile);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) return <Bubbles />;

  return (
    <DoctorContext.Provider value={{ profile, doctors }}>
      <main className="main-content">
        <Toaster position="top-left" toastOptions={{ className: "my-toast" }} />
        <header className="main-header">
          <NavBar src={profile?.profilePic} usertype="doctor" />
        </header>
        <Outlet />
      </main>
    </DoctorContext.Provider>
  );
}
