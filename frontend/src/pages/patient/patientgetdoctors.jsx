import React, { useState, useContext, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiSearch, FiMapPin, FiStar, FiNavigation, FiCalendar, FiClock, FiShield, FiHeart } from 'react-icons/fi';
import "../../css/patientgetdoctors.css";
import Bubbles from '../../components/Loaders/bubbles';
import DoctorFilters from './doctorfilters';
import { PatientContext } from './patientcontext';
import Logo from '../logo';
import FindDoctorIntro from './finddoctorintro';




export default function PatientGetDoctors() {
  const { doctors } = useContext(PatientContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [filterdoctors, setfilterDoctors] = useState(doctors);
  const [filtereddoctors, setfilteredDoctors] = useState(doctors);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [currentLocation, setcurrentLocation] = useState(JSON.parse(localStorage.getItem("ul")).city|| "");
  const [filters, setFilters] = useState({
    languages: [],
    fees: [],
    ratings: [],
    experiences: [],
    specialities: [],
    sortBy: ''
  });
  const [loading, setLoading] = useState(false);
  const [showfilter, setshowfilter] = useState(false);
  const [text, setText] = useState("");
  const [showresults, setshowresults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const toggleFilter = () => setshowfilter((prev) => !prev);

  const applyfilters = useCallback((newFilters) => {
    console.log("filters are being applied")
    console.log(newFilters)
    setFilters(newFilters);
  }, [])

  function searching(event) {
    const samp = event.target.value.toLowerCase();
    setText(samp);
    setCurrentPage(1);

    const base = filterdoctors;

    if (!samp.trim()) {
      setshowresults(false);
      setfilteredDoctors(base);
      return;
    }

    const filtered = base.filter(doc =>
      doc.name.toLowerCase().includes(samp) ||
      doc.speciality.toLowerCase().includes(samp)
    );

    setshowresults(true);
    setfilteredDoctors(filtered);
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const specialityParam = searchParams.get('speciality');

    const mergedSpecialities = [
      ...(filters.specialities || []),
      ...(specialityParam ? [specialityParam.trim()] : [])
    ];

    const finalFilters = {
      ...filters,
      specialities: mergedSpecialities
    };

    const filterDoctors = async () => {
      try {
        setLoading(true);
        const locationData = JSON.parse(localStorage.getItem("ul") || "{}");

        const res = await fetch("http://localhost:8000/patient/filterdoctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filters: finalFilters,
            text,
            locationData
          }),
        });

        const response = await res.json();
        if (res.status === 200) {
          setfilteredDoctors(response.doctors || []);
          setfilterDoctors(response.doctors || []);
        }

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
        setCurrentPage(1);
      }
    };

    filterDoctors();
  }, [location.search, filters]);

  if (loading) return <Bubbles />

  const sourceDoctors = !showresults ? filterdoctors : filtereddoctors;
  const indexOfLastDoctor = currentPage * itemsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - itemsPerPage;
  const currentDoctors = sourceDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(sourceDoctors.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const fetchDoctorsByLocation = async () => {
    try {
      setLoading(true);

      const locationData = JSON.parse(localStorage.getItem("ul") || "{}");

      const res = await fetch("http://localhost:8000/patient/filterdoctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters,
          text,
          locationData
        })
      });

      const response = await res.json();

      if (res.status === 200) {
        setfilteredDoctors(response.doctors || []);
        setfilterDoctors(response.doctors || []);
      }

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  const setpinloc = async (lat, lon) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    );

    const data = await res.json();

    const area =
      data.address.suburb ||
      data.address.neighbourhood ||
      data.address.city_district ||
      data.address.industrial ||
      data.address.village ||
      data.address.town ||
      "";

    const city = data.address.city || data.address.town || data.address.village || "";
    const pincode = data.address.postcode || "";

    setcurrentLocation(city);

    localStorage.setItem(
      "ul",
      JSON.stringify({
        area,
        city,
        pincode
      })
    );

    await fetchDoctorsByLocation()
      .then((res) => { console.log("sucess") })
      .catch((err) => console.log(err))
  }

  const handleUseMyLocation = () => {
    const toastId = toast.loading("Detecting location...");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          toast.dismiss(toastId);

          let lon = pos.coords.longitude
          let lat = pos.coords.latitude
          await setpinloc(lat, lon, "");

          toast.success("Location detected!");
        },
        (err) => {
          toast.dismiss(toastId);
          toast.error("Location access denied");
          console.log(err);
        }
      );
    } else {
      toast.dismiss(toastId);
      toast.error("Geolocation not supported");
    }

    setShowLocationMenu(false);
  };

  const handleSelectCity = async (city) => {
    setcurrentLocation(city);

    let oldData = JSON.parse(localStorage.getItem("ul") || "{}");

    const updated = {
      ...oldData,
      city: city,
      area: "",
      pincode: ""
    };

    localStorage.setItem("ul", JSON.stringify(updated));

    setShowLocationMenu(false);

    try {
      await fetchDoctorsByLocation();
      console.log("success");
    } catch (err) {
      console.log(err);
    }
  };

  // NEW: Check if location is selected
  const hasLocation = currentLocation && currentLocation.trim() !== "";

  return (
    <>
      <section className="content-section">
        <div className="navbar-center">
          <div className="navbar-search">
            <div className="location-btn-wrapper">
              <button
                className="location-btn"
                onClick={() => setShowLocationMenu((prev) => !prev)}
              >
                <FiMapPin size={20} /><b>{currentLocation || "Select Location"}</b>
              </button>

              {showLocationMenu && (
                <div className="location-menu">
                  <button onClick={handleUseMyLocation}> <FiNavigation />Use My Location</button>
                  <button onClick={() => handleSelectCity("Bangalore")}>Bangalore</button>
                  <button onClick={() => handleSelectCity("Hyderabad")}>Hyderabad</button>
                  <button onClick={() => handleSelectCity("Chennai")}>Chennai</button>
                  <button onClick={() => handleSelectCity("Mumbai")}>Mumbai</button>
                </div>
              )}
            </div>

            <svg xmlns="http://www.w3.org/2000/svg" id='filter' width="30" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke={showfilter ? "#f44336" : "#349ce3"}
              onClick={toggleFilter} className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>

            <input
              type="text"
              value={text}
              onChange={searching}
              placeholder="Search doctors, specialties..."
            />
            <FiSearch className="search-icon" />
          </div>
        </div>
      </section>

    
      {!hasLocation ? (
        <FindDoctorIntro onSelectLocation={() => setShowLocationMenu(true)} />
      ) : (
        <>
          {!showfilter ? (
            <>
              <section className="content-section pagebg">
                <div className="section-header">
                  <h3>{sourceDoctors.length} Doctors Found</h3>
                </div>

                <div className='doctor-list-view'>
                  {currentDoctors.length > 0 ? (
                    currentDoctors.map(doc => (
                      <div key={doc._id} className="doctor-list-card">
                        <img src={doc.profilePic} alt={doc.name} className="doctor-card-image" />
                        <div className="doctor-card-details">
                          <h3 className="doctor-card-name">Dr. {doc.name}</h3>
                          <p className="doctor-card-speciality">{doc.speciality}</p>
                          <div className="doctor-card-stats">
                            <span><FiStar /> {doc.rating || 'N/A'}</span>
                            <span>{doc.experience} yrs experience</span>
                          </div>
                          <p className="doctor-card-location">
                            <FiMapPin /> {doc.hospital || 'Location not specified'}
                          </p>
                        </div>
                        <div className="doctor-card-action">
                          <p className="doctor-card-fee"> ₹{doc.fee} Consultation Fee</p>
                          <Link to={`/patient/${doc._id}`} className="doctor-card-btn-profile">
                            View Profile
                          </Link>
                          <Link to={`/patient/appointment/${doc._id}`} className="doctor-card-btn-book">
                            Book Now
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-doctors-found">No doctors match your criteria.</p>
                  )}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    navigate={navigate}
                  />
                )}

              </section>
            </>
          ) : (
            <DoctorFilters apply={applyfilters} globalfilters={filters} close={() => setshowfilter(false)} />
          )}
        </>
      )}
    </>
  )
}

const Pagination = ({ totalPages, currentPage, onPageChange, navigate }) => {
  const pages = [...Array(totalPages).keys()].map(num => num + 1);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return pages;
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pageNumbers = getPageNumbers();

  return (<>
    <div className="pagination-container">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        &larr; Prev
      </button>

      {pageNumbers.map((page, index) =>
        page === '...' ? (
          <span key={index} className="pagination-ellipsis">...</span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Next &rarr;
      </button>
    </div>

    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div>
              <Logo size="40" />
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
  </>
  );
};