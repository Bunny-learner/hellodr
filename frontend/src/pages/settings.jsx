import React, { useState } from 'react';
import '../css/settings.css'; // This will import the new scoped CSS

// Example user prop:
// const doctorUser = {
//   role: 'doctor',
//   email: 'dr.house@example.com',
//   phone: '+1 555-123-4567',
// };


export default function SettingsPage() {
  // Use user's saved settings, or defaults
  const user = {
  role: 'patient',
  email: 'patient.zero@example.com',
  phone: '+1 555-765-4321',
};
  const [theme, setTheme] = useState('system');
  const [textSize, setTextSize] = useState('medium');
  const [reminders, setReminders] = useState({
    dayBefore: true,
    hourBefore: true,
    tenMinBefore: false,
  });
  const [channels, setChannels] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [notificationTypes, setNotificationTypes] = useState({
    chat: true,
    accepted: true,
    cancelled: true,
    newRequest: true, // Doctor-specific
    patientCancelled: true, // Doctor-specific
  });
  const [availability, setAvailability] = useState({
    status: 'online',
    acceptingBookings: true,
  });

  // --- Handlers ---
  
  const handleReminderChange = (e) => {
    setReminders({ ...reminders, [e.target.name]: e.target.checked });
  };
  
  const handleChannelChange = (e) => {
    setChannels({ ...channels, [e.target.name]: e.target.checked });
  };
  
  const handleTypeChange = (e) => {
    setNotificationTypes({ ...notificationTypes, [e.target.name]: e.target.checked });
  };
  
  const handleAvailabilityChange = (e) => {
     setAvailability({ ...availability, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Consolidate all state and send to your backend API
    const settingsData = {
      theme,
      textSize,
      reminders,
      channels,
      notificationTypes,
      availability
    };
    console.log('Saving settings:', settingsData);
    // api.saveSettings(settingsData);
    // toast.success('Settings saved!');
  };

  return (
    // This is the parent class that scopes all the CSS
    <div className="settings-page"> 
      <form onSubmit={handleSubmit}>
        
        {/* --- Account Section --- */}
        <section className="settings-section">
          <h3>👤 Account</h3>
          <div className="setting-item">
            <label className="setting-label">Email Address</label>
            <div className="setting-value">{user.email}</div>
            <button type="button" className="btn-secondary">Change</button>
          </div>
          <div className="setting-item">
            <label className="setting-label">Phone Number</label>
            <div className="setting-value">{user.phone}</div>
            <button type="button" className="btn-secondary">Change</button>
          </div>
          <div className="setting-item">
            <label className="setting-label">Password</label>
            <div className="setting-value">********</div>
            <button type="button" className="btn-secondary">Change Password</button>
          </div>
        </section>

        {/* --- Appearance Section --- */}
        <section className="settings-section">
          <h3>🎨 Appearance</h3>
          <div className="setting-item-col">
            <label className="setting-label">Theme</label>
            <div className="radio-group">
              <label><input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={(e) => setTheme(e.target.value)} /> Light</label>
              <label><input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={(e) => setTheme(e.target.value)} /> Dark</label>
              <label><input type="radio" name="theme" value="system" checked={theme === 'system'} onChange={(e) => setTheme(e.target.value)} /> System</label>
            </div>
          </div>
          <div className="setting-item-col">
            <label className="setting-label">Text Size</label>
            <div className="radio-group">
              <label><input type="radio" name="text-size" value="small" checked={textSize === 'small'} onChange={(e) => setTextSize(e.target.value)} /> Small</label>
              <label><input type="radio" name="text-size" value="medium" checked={textSize === 'medium'} onChange={(e) => setTextSize(e.target.value)} /> Medium</label>
              <label><input type="radio" name="text-size" value="large" checked={textSize === 'large'} onChange={(e) => setTextSize(e.target.value)} /> Large</label>
            </div>
          </div>
        </section>

        {/* --- Notifications Section --- */}
        <section className="settings-section">
          <h3>🔔 Notifications & Reminders</h3>
          <div className="setting-item-col">
            <label className="setting-label">Appointment Reminders</label>
            <p>Send me a reminder before my appointment:</p>
            <div className="checkbox-group">
              <label><input type="checkbox" name="dayBefore" checked={reminders.dayBefore} onChange={handleReminderChange} /> 1 Day before</label>
              <label><input type="checkbox" name="hourBefore" checked={reminders.hourBefore} onChange={handleReminderChange} /> 1 Hour before</label>
              <label><input type="checkbox" name="tenMinBefore" checked={reminders.tenMinBefore} onChange={handleReminderChange} /> 10 Minutes before</label>
            </div>
          </div>
          <div className="setting-item-col">
            <label className="setting-label">Notification Channels</label>
            <p>Send my notifications and reminders via:</p>
            <div className="checkbox-group">
              <label><input type="checkbox" name="push" checked={channels.push} onChange={handleChannelChange} /> Push Notification</label>
              <label><input type="checkbox" name="email" checked={channels.email} onChange={handleChannelChange} /> Email</label>
              <label><input type="checkbox" name="sms" checked={channels.sms} onChange={handleChannelChange} /> SMS (Text Message)</label>
            </div>
          </div>
          <div className="setting-item-col">
            <label className="setting-label">Notification Types</label>
            <p>Notify me when:</p>
            <div className="checkbox-group">
              <label><input type="checkbox" name="chat" checked={notificationTypes.chat} onChange={handleTypeChange} /> I receive a new chat message</label>
              <label><input type="checkbox" name="accepted" checked={notificationTypes.accepted} onChange={handleTypeChange} /> An appointment is confirmed</label>
              <label><input type="checkbox" name="cancelled" checked={notificationTypes.cancelled} onChange={handleTypeChange} /> An appointment is cancelled</label>
              
              {/* Doctor-only settings */}
              {user.role === 'doctor' && (
                <>
                  <label><input type="checkbox" name="newRequest" checked={notificationTypes.newRequest} onChange={handleTypeChange} /> A patient sends a new booking request</label>
                  <label><input type="checkbox" name="patientCancelled" checked={notificationTypes.patientCancelled} onChange={handleTypeChange} /> A patient cancels an appointment</label>
                </>
              )}
            </div>
          </div>
        </section>
        
        {/* --- Doctor Availability (Conditional) --- */}
        {user.role === 'doctor' && (
          <section className="settings-section">
            <h3>🩺 Doctor Availability</h3>
            <div className="setting-item-col">
              <label className="setting-label">Online Status</label>
              <p>Set your current status for patients.</p>
              <div className="radio-group">
                <label><input type="radio" name="status" value="online" checked={availability.status === 'online'} onChange={handleAvailabilityChange} /> Online</label>
                <label><input type="radio" name="status" value="offline" checked={availability.status === 'offline'} onChange={handleAvailabilityChange} /> Offline</label>
              </div>
            </div>
            <div className="setting-item">
              <label className="setting-label" htmlFor="acceptingBookings">Accepting New Bookings</label>
              <div className="toggle-switch">
                <input type="checkbox" id="acceptingBookings" name="acceptingBookings" checked={availability.acceptingBookings} onChange={handleAvailabilityChange} />
                <label htmlFor="acceptingBookings"></label>
              </div>
            </div>
          </section>
        )}

        {/* --- Account Management Section --- */}
        <section className="settings-section">
          <h3>🔒 Account Management</h3>
          <div className="setting-item-col-danger">
            <button type="button" className="btn-secondary btn-full">Log Out</button>
            <button type="button" className="btn-danger btn-full">Deactivate Account</button>
          </div>
        </section>

        {/* --- Save Button --- */}
        <div className="settings-footer">
          <button type="submit" className="btn-primary">Save Changes</button>
        </div>

      </form>
    </div>
  );
}