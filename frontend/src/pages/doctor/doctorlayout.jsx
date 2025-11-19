import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "../../components/Navbar/navbar";
import { toast,Toaster } from "react-hot-toast";
import Bubbles from "../../components/Loaders/bubbles";
import { DoctorContext } from "./doctorcontext"
import "../../css/doctorhome.css"
import { useSocket } from "../../pages/SocketContext.jsx";
import Footer from "../Footer.jsx"

export default function PatientLayout() {
  const {socket, socketId} = useSocket();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const navigate=useNavigate()
 
 
 
  useEffect(() => {
   

    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:8000/doctor/profile", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if(res.status==401)
                    navigate("/doctor/login?Session has expired please login again")
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
        <Toaster position="top-center" toastOptions={{ className: "my-toast" }} />
        <header className="main-header">
          <NavBar src={profile?.profilePic} usertype="doctor" />
        </header>
        <Outlet />
      </main>
      <Footer/>
    </DoctorContext.Provider>
  );
}
