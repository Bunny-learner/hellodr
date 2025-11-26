import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Bubbles from "./components/Loaders/bubbles";
import './App.css';

import Welcome from './pages/patient/welcome';
import Doctorsignup from './pages/doctor/doctorsignup';
import Patientsignup from './pages/patient/patientsignup';
import Patientlogin from './pages/patient/patientlogin';
import ForgotPassword from './pages/patient/forgotpass';
import Resetpassword from './pages/patient/resetpass';
import Doctorlogin from './pages/doctor/doctorlogin';
import PatientLayout from './pages/patient/patientlayout';
import DoctorLayout from './pages/doctor/doctorlayout'
import Notification from './pages/notifications';
import ChatPage from './pages/chatpage';
import WaitingRoom from './pages/WaitingRoom'
import Welcome1 from "./pages/patient/welcome1"
import RoleSelection from './pages/role-selection';
import Home from "./pages/patient/home.jsx"

const AppointmentReview =lazy(()=>import('./pages/patient/appointmentreview'))
const AboutDoctor = lazy(() => import('./pages/patient/viewdoctorprofile'));
const DoctorHome = lazy(() => import('./pages/doctor/doctorhome'));
const BookingForm= lazy(() => import('./pages/patient/bookingform'));
const Payments= lazy(() => import('./pages/patient/payments'));
const DoctorProfile = lazy(() => import('./pages/doctor/doctorprofile'));
const DoctorTimeSlots = lazy(() => import('./pages/doctor/doctortimeslots'));
const Patienthome = lazy(() => import('./pages/patient/patienthome'));
const Patientgetdoctors=lazy(() => import('./pages/patient/patientgetdoctors'));
const Patientappointments = lazy(() => import('./pages/patient/patientappointments'));
const DoctorAppointments = lazy(() => import('./pages/doctor/doctorappointments'));
const SlotBooking = lazy(() => import('./pages/patient/slotbooking'));
const PatientProfile = lazy(() => import('./pages/patient/patientprofile'));
const Settings = lazy(() => import('./pages/settings'));
const FavouriteDoctors=lazy(()=>import("./pages/patient/favourite_doctors"))
function App() {
  return (
    <Suspense fallback={<Bubbles />}>
      <Routes>
        <Route path="/" element={<Welcome1 />} />
        <Route path="/patient/signup" element={<Patientsignup />} />
        <Route path="/patient/login" element={<Patientlogin />} />
        <Route path="/patient/forgot" element={<ForgotPassword />} />
        <Route path="/patient/reset" element={<Resetpassword />} />
        <Route path="/doctor/signup" element={<Doctorsignup />} />
        <Route path="/doctor/login" element={<Doctorlogin />} />
        <Route path="/waiting-room/:roomid" element={<WaitingRoom />}
  />
        <Route path="/chat/:roomid" element={<ChatPage />} />
        

        

        <Route element={<DoctorLayout />}>
        <Route path="/doctor/home" element={<DoctorHome />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path='/doctor/timeslots' element={<DoctorTimeSlots/>}/>
        <Route path='/doctor/settings' element={<Settings/>}/>
        <Route path="/doctor/notifications" element={<Notification/>}/>
        </Route>

        <Route path="/doctor/profile" element={<DoctorProfile />} />

        <Route element={<PatientLayout />}>
          <Route path="/patient/home" element={<Patienthome />} />
          <Route path="/patient/getdoctors" element={<Patientgetdoctors />} />
          <Route path="/patient/appointments" element={<Patientappointments />} />
          <Route path="/patient/appointment/:id" element={<SlotBooking />} />
          <Route path="/patient/payments" element={<Payments/>}/>
          <Route path="/patient/:id" element={<AboutDoctor />} />
          <Route path='/patient/settings' element={<Settings/>}/>
          <Route path="/patient/notifications" element={<Notification/>}/>
          <Route path="/patient/favourites" element={<FavouriteDoctors/>}/>
        </Route>

         <Route path="/patient/appointment/form" element={<BookingForm/>} />
         <Route path="/patient/appointment/review" element={<AppointmentReview/>} />

        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/role-selection" element={<RoleSelection/>}/>
        <Route path="/home" element={<Home/>}/>
      </Routes>
    </Suspense>
  );
}

export default App;
