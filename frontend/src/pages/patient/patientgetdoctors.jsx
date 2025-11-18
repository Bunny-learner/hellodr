import React, { useState, useContext, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Added useLocation
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiSearch, FiMapPin, FiStar } from 'react-icons/fi'; 
import "../../css/patientgetdoctors.css"; 
import Bubbles from '../../components/Loaders/bubbles';
import DoctorFilters from './doctorfilters';
import { PatientContext } from './patientcontext';
import Logo from '../logo';



export default function PatientGetDoctors() { 
  const { doctors } = useContext(PatientContext);
  const location = useLocation(); // Added missing hook
  const [filterdoctors, setfilterDoctors] = useState(doctors);
  const [filtereddoctors, setfilteredDoctors] = useState(doctors);
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

  // --- NEW STATE FOR PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Set how many doctors to show per page

  const toggleFilter = () => setshowfilter((prev) => !prev);

  // Your existing function (unchanged)
  function changing() {
    showfilter ? setshowfilter(false) : setshowfilter(true);
  }

  // Your existing function (unchanged)
  const applyfilters = useCallback((newFilters) => {
    console.log("filters are being applied")
    console.log(newFilters)
    setFilters(newFilters);
  }, [])
function searching(event) {
  const samp = event.target.value.toLowerCase();
  setText(samp);
  setCurrentPage(1);

  const base = filterdoctors; // always use the latest filtered data

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

      const res = await fetch("http://10.125.182.180:8000/patient/filterdoctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          filters: finalFilters,   
          text 
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

 
  // 1. Determine the correct list to use
  const sourceDoctors = !showresults ? filterdoctors : filtereddoctors;
  // 2. Calculate pagination variables
  const indexOfLastDoctor = currentPage * itemsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - itemsPerPage;
  // 3. Slice the list to get only doctors for the current page
  const currentDoctors = sourceDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  // 4. Get the total number of pages
  const totalPages = Math.ceil(sourceDoctors.length / itemsPerPage);

  // 5. Handler for changing pages
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  return (
    <>
      <section className="content-section">
        {/* --- Your existing search bar (unchanged) --- */}
        <div className="navbar-center">
          <div className="navbar-search">
            {/* <svg
              className="filter"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24"
              strokeWidth="1.5"
             
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
              />
            </svg> */}
            <svg xmlns="http://www.w3.org/2000/svg" id='filter' width="30" fill="none" viewBox="0 0 24 24" stroke-width="1.5"  stroke={showfilter ? "#f44336" : "#349ce3"}
              onClick={toggleFilter} class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
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

      {!showfilter ? (
        <>
          <section className="content-section pagebg">
            <div className="section-header">
              {/* Updated header to show results count */}
              <h3>{sourceDoctors.length} Doctors Found</h3>
            </div>
            
            {/* --- NEW: List view for rectangle cards --- */}
            <div className='doctor-list-view'>
              {currentDoctors.length > 0 ? (
                currentDoctors.map(doc => (
                  // --- NEW: Rectangle Card Structure ---
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
              />
            )}

          </section>
        </>
      ) : (
        <DoctorFilters apply={applyfilters} globalfilters={filters} close={() => setshowfilter(false)}   />
      )}
    </>
  )
}


const Pagination = ({ totalPages, currentPage, onPageChange }) => {
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
    // Default case for a page in the middle
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pageNumbers = getPageNumbers();

  return (<>
    <div className="pagination-container">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        &larr; Prev
      </button>

      {/* Page Number Buttons */}
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

      {/* Next Button */}
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

</>
  );
};