import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import '../css/signup.css';

export default function Doctorsignup() {

  const { register, handleSubmit, formState: { errors } } = useForm();
  const [passwordVisible, setPasswordVisible] = useState(false);
const navigate=useNavigate();
  const back=()=>{
    navigate('/');
  }




  const onSubmit = (data) => {

    console.log("Form data submitted:", data);
    alert('Registration successful! Check the console for form data.');
  };


  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>

      <div className="registration-page">
        
     <div className='back'><svg onClick={back} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="#044141ff" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
</svg>
</div>
        <div className="registration-card">
          <div className="form-header">
            <svg width="70" height="70" className="logo-svg" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_495_3740)">
                <path d="M64.9511 16.4914H53.5086V5.04886C53.5086 2.26596 51.2426 0 48.4597 0H21.5364C18.7535 0 16.4875 2.26596 16.4875 5.04886V16.4914H5.04886C2.26596 16.4914 0 18.7535 0 21.5403V48.4636C0 51.2465 2.26596 53.5125 5.04886 53.5125H16.4914V64.955C16.4914 67.7379 18.7535 70.0039 21.5403 70.0039H48.4636C51.2465 70.0039 53.5125 67.7379 53.5125 64.955V53.5125H64.955C67.7379 53.5125 70.0039 51.2465 70.0039 48.4636V21.5403C70 18.7535 67.734 16.4914 64.9511 16.4914ZM64.613 48.1255H53.5086V27.2576H48.1255V64.613H21.8745V53.5086H42.7385V48.1255H5.38312V21.8745H16.4875V42.7385H21.8706V5.38312H48.1177V16.4875H27.2615V21.8706H64.6169V48.1255H64.613Z" fill="url(#paint0_linear_495_3740)" />
              </g>
              <defs>
                <linearGradient id="paint0_linear_495_3740" x1="-1.69238e-07" y1="3.58994" x2="76.3966" y2="18.4545" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#0EBE7E" />
                  <stop offset="1" stop-color="#07D9AD" />
                </linearGradient>
                <clipPath id="clip0_495_3740">
                  <rect width="70" height="70" fill="white" />
                </clipPath>
              </defs>
            </svg>

            <h1>Doctor Registration</h1>
          </div>

          <div className="social-login-buttons">
            <button className="social-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
              Google
            </button>
            <button className="social-btn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1 0-1.5.5-1.5 1.5V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" /></svg>
              Facebook
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="form-body" noValidate>
            <div className="input-group">
              <input
                type="text"
                placeholder="Name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="error-message">{errors.name.message}</p>}
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Entered value does not match email format"
                  }
                })}
              />
              {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            <div className="input-group">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must have at least 8 characters"
                  }
                })}
              />
              <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                {passwordVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" /><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" /><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z" /></svg>
                )}
              </span>
              {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>

            <div className="terms-agreement">
              <input
                type="checkbox"
                id="terms"
                {...register("terms", { required: "You must accept the terms" })}
              />
              <label htmlFor="terms">I agree with the Terms of Service & Privacy Policy</label>
            </div>
            {errors.terms && <p className="error-message" style={{ textAlign: 'left' }}>{errors.terms.message}</p>}

            <button type="submit" className="signup-btn">
              Sign Up
  
            </button>
          </form>

          <p className="login-prompt">
            Have an account?
            <a href="#login">Login</a>
          </p>
        </div>
      </div>
    </>
  );
}

