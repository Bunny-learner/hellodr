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
  const [currentLocation, setcurrentLocation] = useState(
  (JSON.parse(localStorage.getItem("ul") || "{}").city) || ""
);

const API = import.meta.env.VITE_API_URL;


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
  const [locationSearch, setLocationSearch] = useState("");
  const [showresults, setshowresults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [suggestions,setSuggestions]=useState([])

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
  const delayDebounce = setTimeout(() => {
    if (locationSearch.length < 2) {
      setSuggestions([]);
      return;
    }

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationSearch}&addressdetails=1&limit=10&countrycodes=in`)
      .then(res => res.json())
      .then(data => {
        const names = data.map(item => ({
          display: item.display_name,
          city: item.address.city ||
                item.address.town ||
                item.address.village ||
                item.address.hamlet ||
                item.address.suburb ||
                item.address.state_district ||
                item.address.state ||
                item.address.county,
          lat: item.lat,
          lon: item.lon
        }));
        setSuggestions(names);
      });
  }, 350); // debounce

  return () => clearTimeout(delayDebounce);
}, [locationSearch]);


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

        const res = await fetch(`${API}/patient/filterdoctors`, {
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

      const res = await fetch(`${API}/patient/filterdoctors`, {
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
    <>{showLocationMenu && (
  <div className="location-overlay" onClick={() => setShowLocationMenu(false)}>
    <div className="location-panel" onClick={(e) => e.stopPropagation()}>
      
      <h3>Select Location</h3>

      {/* Search location input */}
      <div className="location-search-box">
        <FiSearch size={18} />
        <input
          type="text"
          placeholder="Search city..."
          value={locationSearch || ""}
          onChange={(e) => setLocationSearch(e.target.value)}
        />
      </div>

      <button className="use-my-location" onClick={handleUseMyLocation}>
        <FiNavigation /> Use My Location
      </button>   
    {suggestions.length > 0&&locationSearch!=""? (
  <div className="suggestions-list">
    {suggestions.map((s, index) => (
      <div
  key={index}
  className="suggestion-item"
  onClick={() => {
    handleSelectCity(s.city);
    setShowLocationMenu(false);
    setLocationSearch("");
    setSuggestions([]);
  }}
>
  <div className="suggestion-main">{s.city}</div>
  <div className="suggestion-sub">{s.display}</div>
</div>

    ))}
  </div>
):(<> <h4>Popular Cities</h4>
      <div className="city-list">
        {["Bangalore", "Hyderabad", "Chennai", "Mumbai", "Pune", "Delhi", "Kolkata"].map((city) => (
          <div
            key={city}
            className="city-item"
            onClick={() => handleSelectCity(city)}
          >
            {city}
          </div>
        ))}
      </div></>)}


    </div>
  </div>
)}


      <section className="content-section">
        
      <div className="search-container">
  <div className="location-row" onClick={() => setShowLocationMenu(true)}>
    <FiMapPin size={20} />
    <span>{currentLocation || "Select Location"}</span>
  </div>

  <div className="search-bar">
    <FiSearch className="icon" />
    <input
      type="text"
      value={text}
      onChange={searching}
      placeholder="Search doctors, specialties..."
    />
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
            <div className={`filter-panel ${showfilter ? "open" : ""}`}>
  <DoctorFilters apply={applyfilters} globalfilters={filters} close={() => setshowfilter(false)} />
</div>

          )}
        </>
      )}

<div id="filter" onClick={toggleFilter}>
<svg xmlns="http://www.w3.org/2000/svg"  
  className={showfilter ? "active" : ""}   width="30"
  height="30"   viewBox="0 0 24 24" stroke-width="1.5" stroke="white" fill="none" >
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
</svg>

</div>

    
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

   
  </>
  );
};