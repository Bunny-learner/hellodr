import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import '../../css/signup.css';

export default function BookingForm() {
  const navigate = useNavigate();

  // Get existing appointment from localStorage
  const savedAppointment = JSON.parse(localStorage.getItem('appointment')) || {};

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      patientName: savedAppointment.name || '',
      age: savedAppointment.age || '',
      gender: savedAppointment.gender || '',
      email: savedAppointment.email || '',
      phoneNumber: savedAppointment.phone || '',
      dob: savedAppointment.dob || '',
      symptoms: savedAppointment.symptoms || ''
    }
  });

  useEffect(() => {
    if (savedAppointment) {
      Object.keys(savedAppointment).forEach(key => {
        if (key === 'name') setValue('patientName', savedAppointment[key]);
        else if (key === 'phone') setValue('phoneNumber', savedAppointment[key]);
        else setValue(key, savedAppointment[key]);
      });
    }
  }, [savedAppointment, setValue]);

  const back = () => navigate(-1);

  const onSubmit = (data) => {
    // Merge form data into existing appointment object
    const updatedAppointment = { ...savedAppointment, ...data };
    localStorage.setItem('appointment', JSON.stringify(updatedAppointment));
    navigate('/patient/appointment/review');
  };

  return (
    <div className="booking-form">
      <div className='back'>
        <svg onClick={back} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="#044141ff" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
      </div>

      <div className="book-card">
        <div className="form-header">
          <h1>Patient Booking</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="form-body" noValidate>
          <h3>Patient Information</h3>
          <div className="personal-info">

            <div className="input-group">
              <input
                type="text"
                placeholder="Full Name"
                className={`dform-input ${errors.patientName ? 'input-error' : ''}`}
                {...register("patientName", { required: "Patient name is required" })}
              />
              {errors.patientName && <p className="error-message">{errors.patientName.message}</p>}
            </div>

            <div className="input-group">
              <input
                type="date"
                className={`dform-input ${errors.dob ? 'input-error' : ''}`}
                {...register("dob")}
              />
            </div>

            <div className="input-group">
              <input
                type="number"
                placeholder="Age"
                className={`dform-input ${errors.age ? 'input-error' : ''}`}
                {...register("age", { 
                  required: "Age is required",
                  min: { value: 0, message: "Age cannot be negative" },
                  max: { value: 120, message: "Age seems invalid" }
                })}
              />
              {errors.age && <p className="error-message">{errors.age.message}</p>}
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                className={`dform-input ${errors.email ? 'input-error' : ''}`}
                {...register("email", { 
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
                })}
              />
              {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            <div className="input-group">
              <input
                type="tel"
                placeholder="Phone Number"
                className={`dform-input ${errors.phoneNumber ? 'input-error' : ''}`}
                {...register("phoneNumber", { required: "Phone number is required" })}
              />
              {errors.phoneNumber && <p className="error-message">{errors.phoneNumber.message}</p>}
            </div>

            <div className="input-group">
              <select
                className={`dform-input ${errors.gender ? 'input-error' : ''}`}
                {...register("gender", { required: "Gender is required" })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="error-message">{errors.gender.message}</p>}
            </div>

          </div>

          <h3>Symptoms</h3>
          <div className="profile-input-group profile-textarea-group">
            <textarea
              rows="5"
              placeholder="Mention your symptoms .."
              className={`dform-input ${errors.symptoms ? 'input-error' : ''}`}
              {...register("symptoms")}
            />
            {errors.symptoms && <p className="error-message">{errors.symptoms.message}</p>}
          </div>

<div className='backnext'>
   <button onClick={()=>{navigate(-1)}} className="sbtn">Back</button>
   <button type="submit" className="sbtn">Next</button>
</div>
         
        </form>
      </div>
    </div>
  );
}
