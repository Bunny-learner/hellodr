import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import '../../css/bookingform.css'; // Changed to a new CSS file

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
      dob: savedAppointment.dob ? new Date(savedAppointment.dob).toISOString().split('T')[0] : '', // Format for date input
      symptoms: savedAppointment.symptoms || ''
    }
  });

  // useEffect is fine, but the defaultValues in useForm is the preferred way
  // This useEffect is still good as a fallback
  useEffect(() => {
    if (savedAppointment) {
      Object.keys(savedAppointment).forEach(key => {
        if (key === 'name') setValue('patientName', savedAppointment[key]);
        else if (key === 'phone') setValue('phoneNumber', savedAppointment[key]);
        else if (key === 'dob') setValue('dob', savedAppointment[key] ? new Date(savedAppointment[key]).toISOString().split('T')[0] : '');
        else setValue(key, savedAppointment[key]);
      });
    }
  }, [savedAppointment, setValue]);


  const back = () => {const appointment = JSON.parse(localStorage.getItem("appointment"));

navigate(`/patient/${appointment.doctorId}`)}



  const onSubmit = (data) => {
    // Merge form data into existing appointment object
    const updatedAppointment = { ...savedAppointment, ...data };
    localStorage.setItem('appointment', JSON.stringify(updatedAppointment));
    navigate('/patient/appointment/review');
  };

  return (
    <div className="booking-form-page">
      <div className="book-card">
        
        <div className="form-header">
          <h1>Patient Details</h1>
          <p>Please fill in your information to confirm the booking.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="form-body" noValidate>
          
          <h2 className="form-section-title">Patient Information</h2>
          
          {/* --- NEW 2-COLUMN GRID --- */}
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="patientName">Full Name</label>
              <input
                id="patientName"
                type="text"
                placeholder="e.g., John Doe"
                className={`dform-input ${errors.patientName ? 'input-error' : ''}`}
                {...register("patientName", { required: "Patient name is required" })}
              />
              {errors.patientName && <p className="error-message">{errors.patientName.message}</p>}
            </div>

            <div className="input-group">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                placeholder="e.g., 35"
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
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
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

            <div className="input-group">
              <label htmlFor="dob">Date of Birth (Optional)</label>
              <input
                id="dob"
                type="date"
                className={`dform-input ${errors.dob ? 'input-error' : ''}`}
                {...register("dob")}
              />
            </div>

          </div>

          <h2 className="form-section-title">Contact Details</h2>

          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="e.g., you@example.com"
                className={`dform-input ${errors.email ? 'input-error' : ''}`}
                {...register("email", { 
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
                })}
              />
              {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            <div className="input-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="e.g., 9876543210"
                className={`dform-input ${errors.phoneNumber ? 'input-error' : ''}`}
                {...register("phoneNumber", { 
                    required: "Phone number is required",
                    pattern: { value: /^\d{10}$/, message: "Must be 10 digits" }
                })}
              />
              {errors.phoneNumber && <p className="error-message">{errors.phoneNumber.message}</p>}
            </div>
          </div>


          <h2 className="form-section-title">Reason for Visit</h2>
          
          <div className="input-group full-width-input">
            <label htmlFor="symptoms">Symptoms (Optional)</label>
            <textarea
              id="symptoms"
              rows="4"
              placeholder="Briefly describe your symptoms..."
              className={`dform-input ${errors.symptoms ? 'input-error' : ''}`}
              {...register("symptoms")}
            />
            {errors.symptoms && <p className="error-message">{errors.symptoms.message}</p>}
          </div>

          {/* --- NEW BUTTON CONTAINER --- */}
          <div className='form-navigation-buttons'>
            <button type="button" onClick={back} className="sbtn sbtn-secondary">
              Back
            </button>
            <button type="submit" className="sbtn sbtn-primary">
              Next: Review
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}