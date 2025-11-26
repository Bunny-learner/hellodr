import React, { useState, useEffect } from "react";
import { FiChevronRight, FiChevronLeft, FiCalendar, FiClock, FiMapPin, FiVideo, FiAward, FiShield } from "react-icons/fi";
import "../../css/home.css";

const events = [
  {
    id: 1,
    title: "Free Health Checkup Camp",
    date: "Dec 15, 2024",
    time: "9:00 AM - 5:00 PM",
    location: "City Hospital, Chennai",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)"
  },
  {
    id: 2,
    title: "Mental Health Awareness Week",
    date: "Dec 20-25, 2024",
    time: "Online Sessions",
    location: "Virtual Event",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)"
  },
  {
    id: 3,
    title: "Diabetes Management Workshop",
    date: "Jan 5, 2025",
    time: "10:00 AM - 2:00 PM",
    location: "Community Center",
    gradient: "linear-gradient(135deg, #34d399 0%, #14b8a6 100%)"
  }
];

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Patient",
    rating: 5,
    text: "HelloDr made it incredibly easy to find a specialist. Saved me hours of travel time!",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Patient",
    rating: 5,
    text: "Amazing online consultation experience. The doctor was extremely professional.",
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Patient",
    rating: 5,
    text: "Real-time doctor availability is a game changer! Booking is so easy.",
  }
];

const categories = [
  { title: "Dentist", icon: "🦷" },
  { title: "Ophthalmology", icon: "👁️" },
  { title: "Orthopedic", icon: "🦴" },
  { title: "Neurology", icon: "🧠" },
  { title: "Cardiology", icon: "❤️" },
  { title: "General", icon: "⚕️" },
  { title: "Genetics", icon: "🧬" },
  { title: "Pediatrics", icon: "👶" }
];

const doctors = [
  { id: 1, name: "Dr. Anjali Kumar", specialty: "Cardiologist", rating: 4.8, experience: 12 },
  { id: 2, name: "Dr. Rajesh Menon", specialty: "Neurologist", rating: 4.9, experience: 15 },
  { id: 3, name: "Dr. Priya Nair", specialty: "Pediatrician", rating: 4.7, experience: 10 },
  { id: 4, name: "Dr. Vikram Singh", specialty: "Orthopedic", rating: 4.6, experience: 8 }
];

export default function Home() {
  const [currentEvent, setCurrentEvent] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const eventTimer = setInterval(() => {
      setCurrentEvent((prev) => (prev + 1) % events.length);
    }, 4000);

    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      clearInterval(eventTimer);
      clearInterval(testimonialTimer);
    };
  }, []);

  return (
    <div className="ph-redesign">
      {/* Hero Section */}
      <section className="ph-hero-new">
        <div className="ph-container">
          <div className="ph-hero-grid">
            <div className="ph-hero-content">
              <div className="ph-welcome-badge">Welcome back! 👋</div>
              <h1 className="ph-hero-title">
                Find trusted <span className="ph-highlight">doctors</span> near you
              </h1>
              <p className="ph-hero-subtitle">
                Book video or in-person consults, view profiles and choose top-rated specialists effortlessly.
              </p>
              
              <div className="ph-hero-buttons">
                <button className="ph-btn ph-btn-primary">
                  <FiVideo /> Video Consult
                </button>
                <button className="ph-btn ph-btn-secondary">
                  Find Doctors
                </button>
              </div>

              <div className="ph-stats">
                <div className="ph-stat">
                  <div className="ph-stat-number">500+</div>
                  <div className="ph-stat-label">Expert Doctors</div>
                </div>
                <div className="ph-stat">
                  <div className="ph-stat-number">50k+</div>
                  <div className="ph-stat-label">Happy Patients</div>
                </div>
                <div className="ph-stat">
                  <div className="ph-stat-number">24/7</div>
                  <div className="ph-stat-label">Support</div>
                </div>
              </div>
            </div>

            <div className="ph-hero-image-wrapper">
              <div className="ph-hero-image-bg"></div>
              <div className="ph-hero-image">
                <img src="/api/placeholder/600/700" alt="Healthcare" />
                <div className="ph-hero-badges">
                  <div className="ph-badge-item">
                    <FiShield className="badge-icon" />
                    <span>Secure Platform</span>
                  </div>
                  <div className="ph-badge-item">
                    <FiAward className="badge-icon" />
                    <span>Verified Doctors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Banner Section */}
      <section className="ph-events-section">
        <div className="ph-container">
          <div className="ph-section-header-row">
            <h2 className="ph-section-title-white">Upcoming Health Events</h2>
            <div className="ph-nav-buttons">
              <button 
                onClick={() => setCurrentEvent((prev) => (prev - 1 + events.length) % events.length)}
                className="ph-nav-btn"
              >
                <FiChevronLeft />
              </button>
              <button 
                onClick={() => setCurrentEvent((prev) => (prev + 1) % events.length)}
                className="ph-nav-btn"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>

          <div className="ph-events-slider">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={`ph-event-card ${index === currentEvent ? 'active' : ''}`}
                style={{ 
                  transform: `translateX(${(index - currentEvent) * 100}%)`,
                  background: event.gradient
                }}
              >
                <div className="ph-event-content">
                  <h3 className="ph-event-title">{event.title}</h3>
                  <div className="ph-event-details">
                    <div className="ph-event-detail">
                      <FiCalendar />
                      <span>{event.date}</span>
                    </div>
                    <div className="ph-event-detail">
                      <FiClock />
                      <span>{event.time}</span>
                    </div>
                    <div className="ph-event-detail">
                      <FiMapPin />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <button className="ph-event-btn">Register Now</button>
                </div>
              </div>
            ))}
          </div>

          <div className="ph-dots">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentEvent(index)}
                className={`ph-dot ${index === currentEvent ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="ph-categories-new">
        <div className="ph-container">
          <div className="ph-section-header-row">
            <h2 className="ph-section-title">Browse by Specialty</h2>
            <button className="ph-view-all">
              View all <FiChevronRight />
            </button>
          </div>

          <div className="ph-categories-grid">
            {categories.map((cat) => (
              <button key={cat.title} className="ph-category-card">
                <div className="ph-category-icon">{cat.icon}</div>
                <div className="ph-category-title">{cat.title}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Doctors Section */}
      <section className="ph-doctors-section">
        <div className="ph-container">
          <div className="ph-section-header-row">
            <h2 className="ph-section-title">Popular Doctors</h2>
            <button className="ph-view-all">
              View all <FiChevronRight />
            </button>
          </div>

          <div className="ph-doctors-grid">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="ph-doctor-card">
                <div className="ph-doctor-avatar">
                  <img src="/api/placeholder/100/100" alt={doctor.name} />
                  <div className="ph-online-indicator"></div>
                </div>
                <h3 className="ph-doctor-name">{doctor.name}</h3>
                <p className="ph-doctor-specialty">{doctor.specialty}</p>
                <div className="ph-doctor-info">
                  <div className="ph-doctor-rating">
                    <span className="ph-star">★</span>
                    <span>{doctor.rating}</span>
                  </div>
                  <div className="ph-doctor-exp">{doctor.experience} years exp</div>
                </div>
                <button className="ph-doctor-btn">Book Now</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="ph-testimonials-section">
        <div className="ph-container">
          <h2 className="ph-section-title-center">What Our Patients Say</h2>

          <div className="ph-testimonials-slider">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`ph-testimonial-card ${index === currentTestimonial ? 'active' : ''}`}
                style={{ transform: `translateX(${(index - currentTestimonial) * 100}%)` }}
              >
                <div className="ph-quote-mark">"</div>
                <p className="ph-testimonial-text">{testimonial.text}</p>
                <div className="ph-testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`ph-star ${i < testimonial.rating ? 'filled' : ''}`}>
                      ★
                    </span>
                  ))}
                </div>
                <div className="ph-testimonial-author">
                  <div className="ph-testimonial-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="ph-testimonial-name">{testimonial.name}</h4>
                    <p className="ph-testimonial-role">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ph-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`ph-dot ${index === currentTestimonial ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ph-cta-section">
        <div className="ph-container">
          <div className="ph-cta-content">
            <h2 className="ph-cta-title">Ready to get started?</h2>
            <p className="ph-cta-subtitle">Join thousands of patients who trust HelloDr for their healthcare needs</p>
            <div className="ph-cta-buttons">
              <button className="ph-btn ph-btn-white">Find a Doctor</button>
              <button className="ph-btn ph-btn-outline">Learn More</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}