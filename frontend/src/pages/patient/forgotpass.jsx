import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import "../../css/signup.css";
import Timer from './timer';
import toast, { Toaster } from 'react-hot-toast';
import { LinearProgress, Button } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [process, setProcess] = useState("Send Code")
  const [endpoint, setEndpoint] = useState("sendcode")
  const [loading,setLoading]=useState(false)
  const [ms, setMs] = useState(0);
  const navigate = useNavigate()

  let bodyData = {};

  const timer = () => {
    let count = 0;
    setMs(count);

    const interval = setInterval(() => {
      count += 1;
      setMs(count);

      if (count >= 30) clearInterval(interval); // stop after 30 seconds
    }, 1000);
  };


  const reset = async () => {
    //resending new verification code
    await fetch("http://localhost:8000/patient/resendcode", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: sessionStorage.getItem("email") })
    })
      .then(res => {
        toast.success("New Verification Code has been sent.")
        console.log(res.message)
        setMs(0)
        timer()
      })
      .catch(err => console.log(err))

  }

  const onSubmit = async (data) => {
    const ele=document.querySelector('.form-body')
    const btn=ele.getElementsByTagName('button')[0]
    btn.disabled=true;
    btn.backgroundColor="darkgreen"
    setLoading(true)
    if (endpoint === 'sendcode') bodyData = { email: data.email };
    else if (endpoint === 'verifycode') bodyData = { email: data.email, code: data.code };


    await fetch(`http://localhost:8000/patient/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData)
    })
      .then(async (res) => {

        const msg = await res.json()

        if (res.status === 201 && msg.message === "valid email") {
          sessionStorage.setItem("email", data.email)
          setProcess("Verify")
          setEndpoint("verifycode")
          setLoading(false)
          btn.disabled=false
          toast.success("Verification code sent to your email!");
          timer();
        }
        else if (res.status === 202) {

          toast.error(msg.message)
        }
        else if (res.status === 201 && msg.message == "verified") {
          toast.success("Successfully verified, please reset your password")
          navigate('/patient/reset')
        }
        else
          toast.error("This Mail is not registered , Please SignUp.");


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
        <div className="forgot-form-header">
          <div className="header-content">
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

            <h1>Forgot Password</h1>
          </div>
          {process == "Send Code" ? (<p className="montserrat-bold">Enter your email so that we send you verification code</p>) : (<p className="montserrat-bold">Enter the verification code sent to mail</p>)}
        </div>


        <form onSubmit={handleSubmit(onSubmit)} className="form-body" noValidate>
          {process === "Send Code" &&
            <div className="input-group">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm13.5-.5H2.5l5.5 3.5 5.5-3.5z" />
              </svg>

              <input
                type="email"
                placeholder="Enter your email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email format",
                  },
                })}
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>}
          {process === "Verify" && <>
            <div className="input-group">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M3.5 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-9zm1 2h7v10h-7V3z" />
              </svg>

              <input
                type="text"
                placeholder="Verification code"
                name="code"
                className={`form-input ${errors.code ? "input-error" : ""}`}
                {...register("code", {
                  required: "Verification code is required",
                })}
              />
              {errors.code && (
                <p className="error-message">{errors.code.message}</p>
              )}
            </div>
            <Timer ms={ms} />
            <button className="resend" onClick={reset}>Resend code?</button></>}


          <button type="submit" className="signup-btn">
            {process}
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
