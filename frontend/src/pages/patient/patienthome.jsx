import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { PatientContext } from "./patientcontext";
import PopularDoctorCard from "./PopularDoctorCard";
import FeaturedDoctorCard from "./FeaturedDoctorCard";
import CategoryCard from "./CategoryCard";
import "../../css/patienthome.css";
import Logo from "../logo";

// Dummy testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Patient",
    rating: 5,
    text: "HelloDr made it incredibly easy to find a specialist for my condition. The online consultation saved me hours of travel time, and the doctor was professional and attentive.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Patient",
    rating: 5,
    text: "I was skeptical about online consultations at first, but HelloDr changed my mind completely. The video quality was excellent and my doctor provided comprehensive care from the comfort of my home.",
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Patient",
    rating: 5,
    text: "Booking appointments has never been easier! I can see doctor availability in real-time and choose what works best for me. The platform truly bridges the gap between patients and doctors.",
  },
  {
    id: 4,
    name: "David Williams",
    role: "Patient",
    rating: 5,
    text: "As someone with a busy schedule, HelloDr's chat consultation feature is a lifesaver. I got quick medical advice without disrupting my workday. Highly recommended!",
  },
  {
    id: 5,
    name: "Aisha Patel",
    role: "Patient",
    rating: 4,
    text: "The platform is user-friendly and secure. I appreciate being able to access my medical history and prescriptions all in one place. It's modern healthcare done right.",
  },
];

export default function PatientHome() {
  const { doctors } = useContext(PatientContext) || [];
  const [text, setText] = useState("");
  const [showing, setShowing] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setFilteredDoctors(doctors);
  }, [doctors]);

  // Auto-slide testimonials every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // derive featured & popular whenever doctors change
  const [popularDoctors, setPopularDoctors] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);

  useEffect(() => {
    if (!doctors || doctors.length === 0) {
      setPopularDoctors([]);
      setFeaturedDoctors([]);
      return;
    }

    let featured = doctors.filter(
      (doc) => (doc.rating >= 3.5 && doc.rating < 4.5 && doc.experience > 5)
    );
    if (featured.length === 0) featured = doctors.filter((d) => d.rating >= 4 && d.rating <= 5);

    let popular = doctors.filter((doc) => doc.rating >= 4.5 && doc.rating <= 5 && doc.experience >= 10);
    if (popular.length === 0) popular = doctors.filter((d) => d.rating >= 4 && d.experience >= 5);

    setPopularDoctors(popular.slice(0, 6));
    setFeaturedDoctors(featured.slice(0, 12));
  }, [doctors]);

  function onSearch(e) {
    const q = e.target.value.toLowerCase();
    setText(q);
    if (!q.trim()) {
      setShowing(false);
      setFilteredDoctors(doctors);
      return;
    }

    setShowing(true);
    const res = doctors.filter((doc) => {
      const name = (doc.name || "").toLowerCase();
      const spec = (doc.speciality || doc.speciality || "").toLowerCase();
      const hospital = (doc.hospital || "").toLowerCase();
      return name.includes(q) || spec.includes(q) || hospital.includes(q);
    });
    setFilteredDoctors(res);
  }

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="ph-page">
      {/* HERO */}
      <section className="ph-hero">
        <div className="ph-hero-inner">
          <div className="ph-hero-left">
            <h1 className="ph-title">Find trusted doctors near you</h1>
            <p className="ph-sub">
              Book video or in-person consults, view profiles and choose top-rated specialists effortlessly.
            </p>

            <div className="ph-search">
              <FiSearch className="ph-search-icon" />
              <input
                className="ph-search-input"
                value={text}
                onChange={onSearch}
                placeholder="Search doctors, specialties, hospitals..."
                aria-label="Search doctors"
              />
            </div>

            <div className="ph-quick-links">
              <Link to="/patient/getdoctors?video=true" className="ph-chip">Video Consult</Link>
              <Link to="/patient/getdoctors?experience=10" className="ph-chip">Top Experienced</Link>
              <Link to="/patient/getdoctors?insurance=true" className="ph-chip">Accepts Insurance</Link>
            </div>
          </div>

          <div className="ph-hero-right" aria-hidden>
            <div className="ph-gradient-card">
              <img
                src="/24.jpg"
                alt=""
                className="ph-hero-img"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="ph-badges">
                <div className="ph-badge">24/7 Support</div>
                <div className="ph-badge">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {!showing && (
        <section className="ph-section ph-categories-section">
          <div className="ph-section-header">
            <h2>Categories</h2>
            <Link className="ph-seeall" to="/patient/getdoctors">See all</Link>
          </div>

          <div className="ph-categories-row">
            <CategoryCard title="Dentist" image="/dentist.jpg" />
            <CategoryCard title="Lungs" image="/lungs.jpg" />
            <CategoryCard title="Eye" image="/eye.jpg" />
            <CategoryCard title="Orthopedic" image="/orthopedic.jpg" />
            <CategoryCard title="Neurology" image="/neruo.jpg" />
            <CategoryCard title="Cardiology" image="/cardio.jpg" />
            <CategoryCard title="General" image="/general.jpg" />
            <CategoryCard title="Genetics" image="/genetics.jpg" />
          </div>
        </section>
      )}

      {/* POPULAR */}
      {!showing && (
        <section className="ph-section">
          <div className="ph-section-header">
            <h2>Popular Doctors</h2>
            <Link className="ph-seeall" to="/patient/getdoctors?popular=true">See all <FiChevronRight /></Link>
          </div>

          <div className="ph-horizontal-scroll">
            {popularDoctors.length === 0 ? (
              <div className="ph-empty">No popular doctors yet</div>
            ) : (
              popularDoctors.map((d) => (
                <PopularDoctorCard key={d._id} {...d} />
              ))
            )}
          </div>
        </section>
      )}

      {/* FEATURED */}
      {!showing && (
        <section className="ph-section">
          <div className="ph-section-header">
            <h2>Featured Specialists</h2>
          </div>

          <div className="ph-grid">
            {featuredDoctors.length === 0 ? (
              <div className="ph-empty">No featured doctors</div>
            ) : (
              featuredDoctors.map((d) => <FeaturedDoctorCard key={d._id} {...d} />)
            )}
          </div>
        </section>
      )}

      {/* SEARCHED RESULTS */}
      {showing && (
        <section className="ph-section">
          <div className="ph-section-header">
            <h2>Search Results</h2>
            <span className="ph-muted">{filteredDoctors.length} results</span>
          </div>

          <div className="ph-grid search-grid">
            {filteredDoctors.length === 0 ? (
              <div className="ph-empty">No doctors match your search. Try fewer words.</div>
            ) : (
              filteredDoctors.map((d) => <FeaturedDoctorCard key={d._id} {...d} />)
            )}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {!showing && (
        <section className="ph-section testimonial-section">
          <div className="ph-section-header">
            <h2>What Patients Say About Us</h2>
          </div>

          <div className="testimonial-container">
            <button 
              className="testimonial-nav testimonial-prev" 
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <FiChevronLeft />
            </button>

            <div className="testimonial-slider">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`testimonial-card ${index === currentTestimonial ? 'active' : ''}`}
                  style={{
                    transform: `translateX(${(index - currentTestimonial) * 100}%)`,
                  }}
                >
                  <div className="testimonial-quote">"</div>
                  <p className="testimonial-text">{testimonial.text}</p>
                  
                  <div className="testimonial-rating">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`star ${i < testimonial.rating ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <div className="testimonial-author">
                    <div className="testimonial-avatar">
                      <div className="avatar-placeholder">
                        {testimonial.name.charAt(0)}
                      </div>
                    </div>
                    <div className="testimonial-info">
                      <h4 className="testimonial-name">{testimonial.name}</h4>
                      <p className="testimonial-role">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="testimonial-nav testimonial-next" 
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <FiChevronRight />
            </button>
          </div>

          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div>
                <Logo size="40"/>
              </div>
              <h3 className="logo-footer">Hello Dr</h3>
            </div>
            <p className="footer-text">
              Connecting patients with healthcare professionals for better outcomes.
            </p>
          </div>

          <div>
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><button onClick={() => console.log("Navigate to help center")}>Help Center</button></li>
              <li><button onClick={() => console.log("Navigate to privacy policy")}>Privacy Policy</button></li>
              <li><button onClick={() => console.log("Navigate to terms")}>Terms of Service</button></li>
              <li><button onClick={() => console.log("Navigate to contact")}>Contact Us</button></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}