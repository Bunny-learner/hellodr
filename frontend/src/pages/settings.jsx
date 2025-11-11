// ✅ WORKING Settings.jsx
import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "./AuthContext";
import "../css/settings.css";
import toast from "react-hot-toast";
import Circle1 from "../components/Loaders/circle1";

export default function Settings() {
  const { user, role, setUser } = useAuth();

  const defaultPrefs = {
    reminderoffset: null,
    channels: [],
    whatsappNumber: null,
    smsNumber: null,
    email: user?.email ?? null,
  };

  const preferences = user?.preferences ?? defaultPrefs;

  const [selectedReminder, setSelectedReminder] = useState(null);
  const [channels, setChannels] = useState({
    push: false,
    email: false,
    sms: false,
    whatsapp: false,
  });

  const [loading, setLoading] = useState(false);

  const reminderOptions = [
    { label: "1 min", value: 1 * 60 * 1000 },
    { label: "5 min", value: 5 * 60 * 1000 },
    { label: "10 min", value: 10 * 60 * 1000 },
    { label: "30 min", value: 30 * 60 * 1000 },
    { label: "1 hr", value: 60 * 60 * 1000 },
    { label: "2 hr", value: 2 * 60 * 60 * 1000 },
  ];

  // ✅ Load preferences into state
  useEffect(() => {
    if (!user) return;

    setChannels({
      push: preferences.channels?.includes("push") ?? false,
      email: preferences.channels?.includes("email") ?? false,
      sms: preferences.channels?.includes("sms") ?? false,
      whatsapp: preferences.channels?.includes("whatsapp") ?? false,
    });

    // ✅ Support both reminderoffset & remindertime
    const reminder =
      preferences.reminderoffset ?? preferences.remindertime ?? null;

    if (reminder != null) {
      setSelectedReminder(Number(reminder));
    }
  }, [user]);

  const handleChannelChange = (e) => {
    setChannels((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const isAnyChannelSelected = Object.values(channels).some(Boolean);

  // ✅ SAVE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAnyChannelSelected) {
      toast.error("Select at least one notification channel.");
      return;
    }

    const activeChannels = Object.keys(channels).filter((c) => channels[c]);

    const payload = {
      channels: activeChannels,
      reminderoffset: selectedReminder, 
    };

    console.log("📤 Sending payload:", payload);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/settings/setpref", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        toast.error(data.message || "Error updating preferences");
        return;
      }

      toast.success("Preferences saved ✅");

      if (data.preferences) {
        setUser((prev) => ({
          ...prev,
          preferences: data.preferences,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="settings-container">
        <Circle1 />
      </div>
    );

  return (
    <div className="settings-container">
      <form onSubmit={handleSubmit} className="settings-card">
        {/* Account */}
        <section className="section-block">
          <h3 className="section-title">Account</h3>
          <div className="row-item">
            <div>
              <p className="label">Email</p>
              <p className="value">{user?.email ?? "N/A"}</p>
            </div>
          </div>

          <div className="row-item">
            <div>
              <p className="label">Phone</p>
              <p className="value">{user?.phone ?? "N/A"}</p>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="section-block">
          <h3 className="section-title">Notifications & Reminders</h3>

          {/* Channels */}
          <div className="setting-group">
            <p className="label">Channels</p>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="push"
                  checked={channels.push}
                  onChange={handleChannelChange}
                />
                Push
              </label>

              <label>
                <input
                  type="checkbox"
                  name="email"
                  checked={channels.email}
                  onChange={handleChannelChange}
                />
                Email
              </label>

              <label>
                <input
                  type="checkbox"
                  name="sms"
                  checked={channels.sms}
                  onChange={handleChannelChange}
                />
                SMS
              </label>

              <label className="whatsapp-label">
                <input
                  type="checkbox"
                  name="whatsapp"
                  checked={channels.whatsapp}
                  onChange={handleChannelChange}
                />
                <FaWhatsapp className="whatsapp-icon" /> WhatsApp
              </label>
            </div>
          </div>

          {/* Fixed Reminder Presets */}
          <div
            className={`setting-group ${
              !isAnyChannelSelected ? "disabled-block" : ""
            }`}
          >
            <p className="label">Reminder Before Appointment</p>

            <div className="option-group">
              {reminderOptions.map((opt) => (
                <label key={opt.value}>
                  <input
                    type="radio"
                    name="remindertime"
                    value={opt.value}
                    checked={selectedReminder === opt.value}
                    onChange={() => setSelectedReminder(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </section>

        <button type="submit" className="btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
}
