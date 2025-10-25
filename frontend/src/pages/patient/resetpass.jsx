import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../../css/signup.css";
import { LinearProgress, Button } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { Link,useNavigate } from "react-router-dom";

export default function ResetPass() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading,setLoading]=useState(false)
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const navigate=useNavigate()
  const onSubmit = async(data) => {
  const ele=document.querySelector('.form-body')
    const btn=ele.getElementsByTagName('button')[0]
    btn.disabled=true;
    btn.backgroundColor="darkgreen"
    setLoading(true)
    await fetch("http://localhost:8000/patient/reset",{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:sessionStorage.getItem('email'),
        newpassword:data.newpassword
      })
    })
      .then(async (res) => {

        const msg = await res.json()

        if (res.status === 201) {
          setLoading(false)
          toast.success("Password has been successfully reset!");
          navigate('/patient/login')
        }
        else {
          setLoading(false)
          toast.error(msg.message);}
        
      })
      .catch((err) => console.log(err))
    
  };

  return (
    <div className="main">
    {loading && (
                  <LinearProgress
                    color="primary"
                    className="progress"
                  />
                )}
    <div className="forgot-page">
      <Toaster position="top-left" toastOptions={{className:"my-toast"}} reverseOrder={false} />
      <div className="forgot-card">
        {/* Header */}
        <div className="form-header">
          <svg
            width="70"
            height="70"
            className="logo-svg"
            viewBox="0 0 70 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M64.9511 16.4914H53.5086V5.04886C53.5086 2.26596 51.2426 0 48.4597 0H21.5364C18.7535 0 16.4875 2.26596 16.4875 5.04886V16.4914H5.04886C2.26596 16.4914 0 18.7535 0 21.5403V48.4636C0 51.2465 2.26596 53.5125 5.04886 53.5125H16.4914V64.955C16.4914 67.7379 18.7535 70.0039 21.5403 70.0039H48.4636C51.2465 70.0039 53.5125 67.7379 53.5125 64.955V53.5125H64.955C67.7379 53.5125 70.0039 51.2465 70.0039 48.4636V21.5403C70 18.7535 67.734 16.4914 64.9511 16.4914ZM64.613 48.1255H53.5086V27.2576H48.1255V64.613H21.8745V53.5086H42.7385V48.1255H5.38312V21.8745H16.4875V42.7385H21.8706V5.38312H48.1177V16.4875H27.2615V21.8706H64.6169V48.1255H64.613Z"
              fill="url(#paint0_linear_495_3740)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_495_3740"
                x1="-1.69238e-07"
                y1="3.58994"
                x2="76.3966"
                y2="18.4545"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0EBE7E" />
                <stop offset="1" stopColor="#07D9AD" />
              </linearGradient>
            </defs>
          </svg>

          <h1>Reset Password</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="form-body" noValidate>
          {/* New Password */}
          <div className="input-group">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              placeholder="New Password"
              className={`form-input ${errors.newpassword ? "input-error" : ""}`}
              {...register("newpassword", {
                required: "New password is required",
                minLength: { value: 8, message: "Password must have at least 8 characters" }
              })}
            />
            <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
              {passwordVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                  <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" />
                  <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z" />
                </svg>
              )}
            </span>
            {errors.newpassword && (
              <p className="error-message">{errors.newpassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              className={`form-input ${errors.confirmpassword ? "input-error" : ""}`}
              {...register("confirmpassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === watch("newpassword") || "Passwords do not match"
              })}
            />
           {watch("confirmpassword") && watch("confirmpassword") !== watch("newpassword") && (
  <p className="error-message">Passwords do not match</p>
)}

          </div>

          <button type="submit" className="signup-btn">
            Reset
          </button>
        </form>

        <p className="login-prompt">
          Don’t have an account? <Link to="#">Join us</Link>
        </p>
      </div>
    </div>
    </div>
  );
}
