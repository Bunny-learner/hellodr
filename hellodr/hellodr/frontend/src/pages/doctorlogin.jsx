import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate,Link } from 'react-router-dom';
import '../css/signup.css';

export default function Doctorlogin() {

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

            <h1>Doctor Login</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="form-body" noValidate>

            <div className="input-group">
               <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>

              <input
                type="text"
                placeholder="Name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="error-message">{errors.name.message}</p>}
            </div>

            <div className="input-group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
</svg>

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
              <span className="password-toggle-icon" style={{margin:"0px",padding:"0px"}}onClick={togglePasswordVisibility}>
                {passwordVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg"  fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" /><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg"  fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" /><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z" /></svg>
                )}
              </span>
              {errors.password && <p className="error-message">{errors.password.message}</p>}
            </div>
            <button type="submit" className="signup-btn">
              Login 
            </button>
          </form>

          <p className="login-prompt">
            Do not Have an account?
            <Link to="/doctor/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
}

