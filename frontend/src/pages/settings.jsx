import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import '../css/settings.css';

export default function SettingsPage() {
  const user = {
    role: 'patient',
    email: 'patient.zero@example.com',
    phone: '+1 555-765-4321',
  };

  const [theme, setTheme] = useState('system');
  const [textSize, setTextSize] = useState('medium');
  // Number-based reminders
  const [reminders, setReminders] = useState({ days: 1, hours: 1, minutes: 10 });
  const [channels, setChannels] = useState({ push: true, email: true, sms: false, whatsapp: false });

  const [notificationTypes, setNotificationTypes] = useState({
    chat: true,
    accepted: true,
    cancelled: true,
    newRequest: true,
    patientCancelled: true,
  });

  const [availability, setAvailability] = useState({ status: 'online', acceptingBookings: true });

  const handleChannelChange = (e) => {
    setChannels(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleReminderChange = (e) => {
    const { name, value } = e.target;
    const num = Math.max(0, parseInt(value || '0', 10));
    setReminders(prev => ({ ...prev, [name]: num }));
  };

  const handleAvailabilityChange = (e) => {
    setAvailability(prev => ({
      ...prev,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));
  };

  const isAnyChannelSelected = Object.values(channels).some(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAnyChannelSelected) {
      alert('Select at least one notification channel to receive reminders.');
      return;
    }
    const settingsData = {
      theme,
      textSize,
      reminders,
      channels,
      notificationTypes,
      availability,
    };
    console.log('Saving settings:', settingsData);
  };

  return (
    <div className="settings-container">
      <form onSubmit={handleSubmit} className="settings-card">
        {/* Account */}
        <section className="section-block">
          <h3 className="section-title">Account</h3>
          <div className="row-item">
            <div>
              <p className="label">Email</p>
              <p className="value">{user.email}</p>
            </div>
            <button type="button" className="btn-secondary">Change</button>
          </div>
          <div className="row-item">
            <div>
              <p className="label">Phone</p>
              <p className="value">{user.phone}</p>
            </div>
            <button type="button" className="btn-secondary">Change</button>
          </div>
        </section>

        {/* Appearance */}
        <section className="section-block">
          <h3 className="section-title">Appearance</h3>
          <div className="setting-group">
            <p className="label">Theme</p>
            <div className="option-group">
              {['light','dark','system'].map(v => (
                <label key={v}>
                  <input type="radio" name="theme" value={v} checked={theme===v} onChange={(e)=>setTheme(e.target.value)} /> {v}
                </label>
              ))}
            </div>
          </div>
          <div className="setting-group">
            <p className="label">Text Size</p>
            <div className="option-group">
              {['small','medium','large'].map(v => (
                <label key={v} className="capitalize">
                  <input type="radio" name="textSize" value={v} checked={textSize===v} onChange={(e)=>setTextSize(e.target.value)} /> {v}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="section-block">
          <h3 className="section-title">Notifications & Reminders</h3>

          {/* Channels */}
          <div className="setting-group">
            <p className="label">Channels <span className="hint">(Select at least one)</span></p>
            <div className="checkbox-group">
              <label><input type="checkbox" name="push" checked={channels.push} onChange={handleChannelChange} /> Push</label>
              <label><input type="checkbox" name="email" checked={channels.email} onChange={handleChannelChange} /> Email</label>
              <label><input type="checkbox" name="sms" checked={channels.sms} onChange={handleChannelChange} /> SMS</label>
              <label className="whatsapp-label">
                <input type="checkbox" name="whatsapp" checked={channels.whatsapp} onChange={handleChannelChange} />
                <FaWhatsapp className="whatsapp-icon" /> WhatsApp
              </label>
            </div>
          </div>

          {/* Number-based reminder offsets */}
          <div className={`setting-group ${!isAnyChannelSelected ? 'disabled-block' : ''}`}>
            <p className="label">Appointment Reminders</p>
            <p className="hint">We will send a reminder at: <strong>{reminders.hours}</strong> hour(s), <strong>{reminders.minutes}</strong> minute(s) before the appointment.</p>
            <div className="number-group">
              <label className="num-field">
                <span>Hours</span>
                <input type="number" name="hours" min="0" max="72" value={reminders.hours} onChange={handleReminderChange} />
              </label>
              <label className="num-field">
                <span>Minutes</span>
                <input type="number" name="minutes" min="0" max="1440" step="5" value={reminders.minutes} onChange={handleReminderChange} />
              </label>
            </div>
          </div>
        </section>

        {/* (Optional) Doctor block retained for completeness */}
        {user.role === 'doctor' && (
          <section className="section-block">
            <h3 className="section-title">Doctor Availability</h3>
            <div className="setting-group">
              <p className="label">Status</p>
              <div className="option-group">
                <label><input type="radio" name="status" value="online" checked={availability.status==='online'} onChange={handleAvailabilityChange} /> Online</label>
                <label><input type="radio" name="status" value="offline" checked={availability.status==='offline'} onChange={handleAvailabilityChange} /> Offline</label>
              </div>
            </div>
            <div className="row-item">
              <label className="label" htmlFor="acceptingBookings">Accepting New Bookings</label>
              <label className="switch">
                <input id="acceptingBookings" type="checkbox" name="acceptingBookings" checked={availability.acceptingBookings} onChange={handleAvailabilityChange} />
                <span className="slider" />
              </label>
            </div>
          </section>
        )}

        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
  );
}