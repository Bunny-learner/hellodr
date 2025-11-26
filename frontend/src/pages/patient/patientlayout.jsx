import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "../../components/Navbar/navbar";
import { Toaster,toast } from "react-hot-toast";
import Bubbles from "../../components/Loaders/bubbles";
import { PatientContext } from "./patientcontext"
import "../../css/patienthome.css"
import { useSocket } from "../../pages/SocketContext.jsx";
import Footer from "../Footer.jsx";



export default function PatientLayout() {
  const { socket, socketId } = useSocket();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const navigate=useNavigate()
  const API = import.meta.env.VITE_API_URL;



  

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get('alert');
    if (msg) toast.success(msg);
  }, [location.search]);


  


  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch(`${API}/patient/getdoctors`, {
          method: "GET",
          credentials: "include",
        });
        const response = await res.json();
        if (res.status === 200) {
          setDoctors(response.doctors || []);
        } 
        // else if(res.status==401)
          
          
        //   navigate('/patient/login?alert=Session expired please login again !')
        else {
          console.log("Failed to fetch doctors");
        }
      } catch (err) {
        console.log(err);
      }
    };

    async function fetchProfile() {
      try {
        const res = await fetch(`${API}/patient/profile`, {
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
    fetchDoctors();
  }, []);

  if (loading) return <Bubbles />;

  return (
    <PatientContext.Provider value={{ profile, doctors }}>
      <main className="main-content">
        <Toaster position="top-center" toastOptions={{ className: "my-toast" }} />
        <header className="main-header">
          <NavBar id="navbar" src={profile?.profilePic} usertype="patient" />
        </header>
        <Outlet />
      </main>
      <Footer/>
    </PatientContext.Provider>
  );
}
