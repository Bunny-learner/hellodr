// Settings.jsx
import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiBell, FiMail, FiMessageSquare, FiLoader, FiCheck, FiXCircle } from "react-icons/fi";
import { useAuth } from "./AuthContext";
import "../css/settings.css"; // We will use the new CSS
import toast from "react-hot-toast";
import Circle1 from "../components/Loaders/circle1";
import { useNavigate } from "react-router-dom";


const VAPID_PUBLIC_KEY ="BDKWrqxWwM1Jl86sVi_gcE5f0HJ3h9_eX5NDvFaDRye45P-gAgt9avAjwpVMTdw9dHjwufbuc-8vkgiZmtwzUAs";

// Helper function to convert the VAPID key
function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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

  // --- NEW STATE for Push Notification Permission ---
  const [pushPermission, setPushPermission] = useState(Notification.permission);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const [loading, setLoading] = useState(false);

  const reminderOptions = [
    { label: "1 min", value: 1 * 60 * 1000 },
    { label: "5 min", value: 5 * 60 * 1000 },
    { label: "10 min", value: 10 * 60 * 1000 },
    { label: "30 min", value: 30 * 60 * 1000 },
    { label: "1 hr", value: 60 * 60 * 1000 },
    { label: "2 hr", value: 2 * 60 * 60 * 1000 },
  ];


  const navigate=useNavigate()
  // Load preferences into state
  useEffect(() => {
    if (!user) return;

    setChannels({
      push: preferences.channels?.includes("push") ?? false,
      email: preferences.channels?.includes("email") ?? false,
      sms: preferences.channels?.includes("sms") ?? false,
      whatsapp: preferences.channels?.includes("whatsapp") ?? false,
    });
    
    // Update push permission status on load
    setPushPermission(Notification.permission);

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

  // --- NEW: Subscribe User to Push Notifications ---
  const handleSubscribePush = async () => {
    if (VAPID_PUBLIC_KEY === "YOUR_VAPID_PUBLIC_KEY_GOES_HERE") {
      toast.error("VAPID Key is not set in Settings.jsx");
      return;
    }
    
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Push messaging is not supported by this browser.");
      return;
    }

    setIsSubscribing(true);
    try {
      // 1. Register the service worker
      const swRegistration = await navigator.serviceWorker.register('/service-worker.js');
      
      // 2. Request permission (this shows the browser popup)
      const permission = await Notification.requestPermission();
      setPushPermission(permission); // Update state with the user's choice

      if (permission !== "granted") {
        toast.error("Notification permission was not granted.");
        setIsSubscribing(false);
        return;
      }

      // 3. Subscribe the user
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Send the subscription to your backend
      await fetch("http://localhost:8000/settings/subscribe", {
        method: "POST",
        body: JSON.stringify({ subscription }),
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
      });

     
      setChannels((prev) => ({ ...prev, push: true }));
      toast.success("Push notifications enabled!");

    } catch (error) {
      console.error("Failed to subscribe user:", error);
      toast.error("Failed to enable notifications.");
    } finally {
      setIsSubscribing(false);
    }
  };

  
  const handleUnsubscribePush = () => {
    setChannels((prev) => ({ ...prev, push: false }));
    toast.success("Push channel disabled. Don't forget to save.");
  };

  // ✅ SAVE (Unchanged)
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
      <div className="backbutton">
      <button class="back-button" onClick={()=>{navigate(-1)}}>← Back</button>
      </div>
      <form onSubmit={handleSubmit} className="settings-card">
        
        <h2 className="settings-title">Settings</h2>

        {/* Account */}
        <section className="settings-section">
          <h3 className="section-title">Account</h3>
          <div className="row-item">
            <p className="label">Email</p>
            <p className="value">{user?.email ?? "N/A"}</p>
          </div>
          <div className="row-item">
            <p className="label">Phone</p>
            <p className="value">{user?.phone ?? "N/A"}</p>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-section">
          <h3 className="section-title">Notifications</h3>
          <p className="section-description">
            Choose how you'd like to be notified about appointments and reminders.
          </p>
          
          <div className="channel-list">
            
            {/* --- NEW PUSH NOTIFICATION TOGGLE --- */}
            <div className="channel-toggle">
              <div className="channel-icon push">
                <FiBell />
              </div>
              <div className="channel-info">
                <label>Push Notifications</label>
                <span>For browser and mobile alerts.</span>
              </div>
              <div className="channel-action">
                {pushPermission === 'granted' ? (
                  <label className="toggle-switch">
                    <input type="checkbox" checked={channels.push} onChange={(e) => {
                      if (e.target.checked) {
                        setChannels((p) => ({ ...p, push: true }));
                      } else {
                        handleUnsubscribePush();
                      }
                    }} />
                    <span className="slider"></span>
                  </label>
                ) : pushPermission === 'denied' ? (
                  <span className="permission-denied"><FiXCircle /> Blocked</span>
                ) : (
                  <button 
                    type="button" 
                    className="btn-enable" 
                    onClick={handleSubscribePush}
                    disabled={isSubscribing}
                  >
                    {isSubscribing ? <FiLoader /> : "Enable"}
                  </button>
                )}
              </div>
            </div>

            {/* --- Email Toggle --- */}
            <div className="channel-toggle">
              <div className="channel-icon email">
                <FiMail />
              </div>
              <div className="channel-info">
                <label htmlFor="email-toggle">Email</label>
                <span>For receipts and critical alerts.</span>
              </div>
              <div className="channel-action">
                <label className="toggle-switch">
                  <input id="email-toggle" type="checkbox" name="email" checked={channels.email} onChange={handleChannelChange} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            {/* --- SMS Toggle --- */}
            <div className="channel-toggle">
              <div className="channel-icon sms">
                <FiMessageSquare />
              </div>
              <div className="channel-info">
                <label htmlFor="sms-toggle">SMS</label>
                <span>For reminders to your phone.</span>
              </div>
              <div className="channel-action">
                <label className="toggle-switch">
                  <input id="sms-toggle" type="checkbox" name="sms" checked={channels.sms} onChange={handleChannelChange} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            {/* --- WhatsApp Toggle --- */}
            <div className="channel-toggle">
              <div className="channel-icon whatsapp">
                <FaWhatsapp />
              </div>
              <div className="channel-info">
                <label htmlFor="whatsapp-toggle">WhatsApp</label>
                <span>For convenience and reminders.</span>
              </div>
              <div className="channel-action">
                <label className="toggle-switch">
                  <input id="whatsapp-toggle" type="checkbox" name="whatsapp" checked={channels.whatsapp} onChange={handleChannelChange} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Reminders */}
        <section className={`settings-section ${!isAnyChannelSelected ? "disabled-section" : ""}`}>
          <h3 className="section-title">Reminders</h3>
          <p className="section-description">
            Remind me before my appointment. (Requires at least one channel to be active)
          </p>
          <div className="option-group">
            {reminderOptions.map((opt) => (
              <label key={opt.value} className="radio-button">
                <input
                  type="radio"
                  name="remindertime"
                  value={opt.value}
                  checked={selectedReminder === opt.value}
                  onChange={() => setSelectedReminder(opt.value)}
                  disabled={!isAnyChannelSelected}
                />
                <span className="radio-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="settings-footer">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <FiLoader /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}