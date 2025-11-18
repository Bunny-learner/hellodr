import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiChevronRight } from "react-icons/fi";
import { PatientContext } from "./patientcontext";
import PopularDoctorCard from "./PopularDoctorCard";
import FeaturedDoctorCard from "./FeaturedDoctorCard";
import CategoryCard from "./CategoryCard";
import "../../css/patienthome.css";
import Logo from "../logo"

export default function PatientHome() {
  const { doctors } = useContext(PatientContext) || [];
  const [text, setText] = useState("");
  const [showing, setShowing] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);

  useEffect(() => {
    setFilteredDoctors(doctors);
  }, [doctors]);

  const mylocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Latitude:", position.coords.latitude);
          console.log("Longitude:", position.coords.longitude);
        },
        (error) => {
          console.log("Error getting location:", error);
        }
      );
    } else {
      console.log("Geolocation not supported");
    }
  }

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

  return (
    <div className="ph-page">
      {/* HERO */}
      <section className="ph-hero">
        <div className="ph-hero-inner">
          <div className="ph-hero-left">
            {/* Updated Commercial Text */}
            <h1 className="ph-title">Seamless Access to World-Class Healthcare</h1>
            <p className="ph-sub">
              Experience a new standard of medical excellence. Connect with top-tier specialists and manage your health journey with confidence and ease.
            </p>

            {/* Search bar removed here */}

            <div className="ph-quick-links">
              <Link to="/patient/getdoctors?video=true" className="ph-chip">Video Consult</Link>
              <Link to="/patient/getdoctors?experience=10" className="ph-chip">Top Experienced</Link>
              <Link to="/patient/getdoctors?insurance=true" className="ph-chip">Accepts Insurance</Link>
              {/* Added Location Option */}
              <Link to="/patient/getdoctors" className="ph-chip">
                 Doctors Near Me
              </Link>
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
            <CategoryCard title="ENT" image="/ear.jpg" />
            <CategoryCard title="Pediatrician" image="/pedia.jpg" />
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

      <footer className="footer">
        <div className="footer-inner">

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div >
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
              <li><button onClick={() => navigate("/help-center")}>Help Center</button></li>
              <li><button onClick={() => navigate("/privacy-policy")}>Privacy Policy</button></li>
              <li><button onClick={() => navigate("/coming-soon")}>Terms of Service</button></li>
              <li><button onClick={() => navigate("/coming-soon")}>Contact Us</button></li>
            </ul>
          </div>

        </div>
      </footer>
    </div>
  );
}