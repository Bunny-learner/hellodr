import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import Welcome from './pages/welcome';
import Doctorsignup from './pages/doctorsignup';
import Patienthome from './pages/patienthome';

const Patientsignup = lazy(() => import('./pages/patientsignup'));
import Patientlogin from './pages/patientlogin';
import './App.css';
import PageSkeleton from '../components/LoadingSkeleton/PageSkeleton';
import ForgotPassword from './pages/forgotpass';
import Resetpassword from './pages/resetpass'
import Payment from './pages/payment';
import Doctorlogin from './pages/doctorlogin';
import Timer from './pages/timer';

function App() {
  return (
    <Suspense fallback={<PageSkeleton/>}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/doctor/signup" element={<Doctorsignup />} />
        <Route path="/patient/signup" element={<Patientsignup />} />
         <Route path="/patient/login" element={<Patientlogin />} />
         <Route path="/patient/forgot" element={<ForgotPassword />} />
         <Route path="/patient/reset" element={<Resetpassword />} />
         <Route path="/pay" element={<Payment />} />
         <Route path="/doctor/login" element={<Doctorlogin />} />
         <Route path="/patient/home" element={<Patienthome />} />
      </Routes>
    </Suspense>
      
    
  );
}

export default App;
