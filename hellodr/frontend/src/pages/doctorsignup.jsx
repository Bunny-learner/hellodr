import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import '../css/signup.css';

export default function Doctorsignup() {

  const { register, handleSubmit, formState: { errors } } = useForm();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const back = () => {
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
        <div className="dregistration-card">
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



          <form onSubmit={handleSubmit(onSubmit)} className="form-body" noValidate>

            <h3>Personal Information</h3>
            <div className="personal-info">


              <div className="input-group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>

                <input
                  type="text"
                  placeholder="Name"
                  className={`dform-input ${errors.name ? 'input-error' : ''}`}
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
                  className={`dform-input ${errors.email ? 'input-error' : ''}`}
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
</svg>

                <input
                  type="text"
                  placeholder="Address"
                  className={`dform-input ${errors.name ? 'input-error' : ''}`}
                  {...register("address", { required: "Address is required" })}
                />
                {errors.name && <p className="error-message">{errors.name.message}</p>}
              </div>


              <div className="input-group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
</svg>

                <input
                  type="text"
                  placeholder="Phone-no"
                  className={`dform-input ${errors.name ? 'input-error' : ''}`}
                  {...register("Phone-no", { required: "Phone-no is required" })}
                />
                {errors.name && <p className="error-message">{errors.name.message}</p>}
              </div>
              <div className="input-group">
                <select
                  className={`dform-input ${errors.gender ? 'input-error' : ''}`}
                  {...register("gender", { required: "Gender is required" })}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="error-message">{errors.gender.message}</p>}
              </div>
              <div className="input-group">
                <input
                  type="date"
                  className={`dform-input ${errors.dob ? 'input-error' : ''}`}
                  {...register("dob", { required: "Date of birth is required" })}
                />
                {errors.dob && <p className="error-message">{errors.dob.message}</p>}
              </div>

            </div>


            <h3>Professional Information</h3>

            <div className="professional-info">

              <div className="input-group">
                <select
                  className={`dform-input custom-select ${errors.gender ? 'input-error' : ''}`}
                  {...register("gender", { required: "Gender is required" })}
                >
                  <option value="">Select Specialty</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="gastroenterology">Gastroenterology</option>
                  <option value="ophthalmology">Ophthalmology</option>
                  <option value="endocrinology">Endocrinology</option>
                  <option value="pulmonology">Pulmonology</option>
                  <option value="nephrology">Nephrology</option>
                  <option value="urology">Urology</option>
                  <option value="rheumatology">Rheumatology</option>
                  <option value="oncology">Oncology</option>
                  <option value="gynecology">Gynecology</option>

                </select>
                {errors.gender && <p className="error-message">{errors.gender.message}</p>}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="Medical License No"
                  className={`dform-input ${errors.name ? 'input-error' : ''}`}
                  {...register("Medical License No", { required: "Medical License No is required" })}
                />
                {errors.name && <p className="error-message">{errors.name.message}</p>}
              </div>

              <div className="input-group">
                <select name="experience" className='dform-input'>
                  <option value="">Years of Experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-3">2-3 years</option>
                  <option value="4-5">4-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="11-15">10+ years</option>
                </select>
                {errors.name && <p className="error-message">{errors.name.message}</p>}
              </div>
            </div>


<h3>Practice Information</h3>
<div className="practice-info">
 <div className="input-group">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
</svg>

                <input
                  type="text"
                  placeholder="Organisation Name"
                  className={`dform-input ${errors.name ? 'input-error' : ''}`}
                  {...register("Organisation Name", { required: "organisation Name is required" })}
                />
                {errors.name && <p className="error-message">{errors.name.message}</p>}
              </div>

<div className="input-group">
  <input
    type="number"
    placeholder="Consultation Fee"
    className={`dform-input ${errors.consultationFee ? 'input-error' : ''}`}
    {...register("Consultation Fee", { required: "Consultation Fee is required" })}
  />
  {errors.consultationFee && <p className="error-message">{errors.consultationFee.message}</p>}
</div>


<div className="input-group">
  <input
    type="text"
    placeholder="Practice Address"
    className={`dform-input ${errors.practiceAddress ? 'input-error' : ''}`}
    {...register("Practice Address", { required: "Practice Address is required" })}
  />
  {errors.practiceAddress && <p className="error-message">{errors.practiceAddress.message}</p>}
</div>
</div>

<h3>Qualifications and affliations</h3>
<div className="qualify-info">
<div className="file-upload">
  <label className="file-label" htmlFor="qualifications">
    Upload Qualifications
  </label>
  <input
    id="qualifications"
    type="file"
    accept=".pdf, image/*"
    {...register("Qualifications", { required: "Qualifications file is required" })}
  />
  {errors.qualifications && <p className="error-message">{errors.qualifications.message}</p>}
</div>

<div className="file-upload">
  <label className="file-label" htmlFor="affiliations">
    Upload Affiliations
  </label>
  <input
    id="affiliations"
    type="file"
    accept=".pdf, image/*"
    {...register("Affiliations", { required: "Affiliations file is required" })}
  />
  {errors.affiliations && <p className="error-message">{errors.affiliations.message}</p>}
</div>
</div>

<h3>Set Password</h3>
            <div className="input-group">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder="New Password"
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

            <div className="input-group">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Confirm Password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                {...register("confirm password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must have at least 8 characters"
                  }
                })}
              />
        
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
            <Link to="/doctor/login">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}

