import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { PatientContext } from "./patientcontext";
import PopularDoctorCard from "./populardoctorcard";
import FeaturedDoctorCard from "./featureddoctorcard";
import CategoryCard from "./categorycard";
import "../../css/patienthome.css";
import Logo from "../logo";
import Bubbles from"../../components/Loaders/bubbles"

// Dummy testimonial data
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
  },
  {
    id: 4,
    name: "David Williams",
    role: "Patient",
    rating: 5,
    text: "Chat consultations helped me get medical advice during a busy day. Very convenient!",
  },
  {
    id: 5,
    name: "Aisha Patel",
    role: "Patient",
    rating: 4,
    text: "Secure platform with easy access to medical history and prescriptions.",
  },
];

export default function PatientHome() {
  const { doctors } = useContext(PatientContext) || [];

  const [popularDoctors, setPopularDoctors] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

const [checkingRedirect, setCheckingRedirect] = useState(true);

useEffect(() => {
  const redirectUrl = localStorage.getItem("redirecturl");

  if (redirectUrl) {
    localStorage.removeItem("redirecturl");
    window.location.replace(redirectUrl);
  } else {
    setCheckingRedirect(false);
  }
}, []);



  // Auto-slide testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Set Popular and Featured doctors
  useEffect(() => {
    if (!doctors || doctors.length === 0) {
      setPopularDoctors([]);
      setFeaturedDoctors([]);
      return;
    }

    let featured = doctors.filter(
      (doc) => doc.rating >= 3.5 && doc.rating < 4.5 && doc.experience > 5
    );
    if (featured.length === 0)
      featured = doctors.filter((d) => d.rating >= 4 && d.rating <= 5);

    let popular = doctors.filter(
      (doc) => doc.rating >= 4.5 && doc.experience >= 10
    );
    if (popular.length === 0)
      popular = doctors.filter((d) => d.rating >= 4 && d.experience >= 5);

    setPopularDoctors(popular.slice(0, 6));
    setFeaturedDoctors(featured.slice(0, 12));
  }, [doctors]);

  const nextTestimonial = () =>
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);

  const prevTestimonial = () =>
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);


  if (checkingRedirect) {
  return (
    <Bubbles/>
  );
}

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
            <div className="ph-quick-links">
              <Link to="/patient/getdoctors?video=true" className="ph-chip">Video Consult</Link>
              <Link to="/patient/getdoctors?experience=10" className="ph-chip">Top Experienced</Link>
              <Link to="/patient/getdoctors?insurance=true" className="ph-chip">Accepts Insurance</Link>
              <Link to="/patient/getdoctors" className="ph-chip">Doctors Near By</Link>
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
      <section className="ph-section ph-categories-section">
        <div className="ph-section-header">
          <h2>Categories</h2>
          <Link className="ph-seeall" to="/patient/getdoctors">See all</Link>
        </div>

        <div className="ph-categories-row">
          <CategoryCard title="Dentist" image={`${import.meta.env.BASE_URL}dentist.jpg`} />
          <CategoryCard title="Opthamology" image={`${import.meta.env.BASE_URL}eye.jpg`} />
          <CategoryCard title="Orthopedic" image={`${import.meta.env.BASE_URL}orthopedic.jpg`} />
          <CategoryCard title="Neurology" image={`${import.meta.env.BASE_URL}neruo.jpg`} />
          <CategoryCard title="Cardiology" image={`${import.meta.env.BASE_URL}cardio.jpg`} />
          <CategoryCard title="General" image={`${import.meta.env.BASE_URL}general.jpg`} />
          <CategoryCard title="Genetics" image={`${import.meta.env.BASE_URL}genetics.jpg`} />
          <CategoryCard title="Pediatrics" image={`${import.meta.env.BASE_URL}pedia.jpg`} />

        </div>
      </section>

      {/* POPULAR DOCTORS */}
      <section className="ph-section">
        <div className="ph-section-header">
          <h2>Popular Doctors</h2>
          <Link className="ph-seeall" to="/patient/getdoctors?popular=true">
            See all <FiChevronRight />
          </Link>
        </div>

        <div className="ph-horizontal-scroll">
          {popularDoctors.length === 0
            ? <div className="ph-empty">No popular doctors yet</div>
            : popularDoctors.map((d) => <PopularDoctorCard key={d._id} {...d} />)}
        </div>
      </section>

      {/* FEATURED SPECIALISTS */}
      <section className="ph-section">
        <div className="ph-section-header">
          <h2>Featured Specialists</h2>
        </div>

        <div className="ph-grid">
          {featuredDoctors.length === 0
            ? <div className="ph-empty">No featured doctors</div>
            : featuredDoctors.map((d) => <FeaturedDoctorCard key={d._id} {...d} />)}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="ph-section testimonial-section">
        <div className="ph-section-header">
          <h2>What Users Say About Us</h2>
        </div>

        <div className="testimonial-container">
          <button className="testimonial-nav testimonial-prev" onClick={prevTestimonial}>
            <FiChevronLeft />
          </button>

          <div className="testimonial-slider">
            {testimonials.map((t, index) => (
              <div
                key={t.id}
                className={`testimonial-card ${index === currentTestimonial ? "active" : ""}`}
                style={{ transform: `translateX(${(index - currentTestimonial) * 100}%)` }}
              >
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">{t.text}</p>

                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < t.rating ? "filled" : ""}`}>
                      ★
                    </span>
                  ))}
                </div>

                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    <div className="avatar-placeholder">{t.name.charAt(0)}</div>
                  </div>
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{t.name}</h4>
                    <p className="testimonial-role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="testimonial-nav testimonial-next" onClick={nextTestimonial}>
            <FiChevronRight />
          </button>
        </div>

        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentTestimonial ? "active" : ""}`}
              onClick={() => setCurrentTestimonial(index)}
            />
          ))}
        </div>
      </section>


    </div>
  );
}
