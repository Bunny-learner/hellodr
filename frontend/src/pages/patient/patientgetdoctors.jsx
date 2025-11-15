import React, { useState, useContext, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Added useLocation
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiSearch, FiMapPin, FiStar } from 'react-icons/fi'; 
import "../../css/patientgetdoctors.css"; 
import Bubbles from '../../components/Loaders/bubbles';
import DoctorFilters from './doctorfilters';
import { PatientContext } from './patientcontext';



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
    setCurrentPage(1); // --- NEW: Reset to page 1 on search ---

    if (samp.trim() === "") {
      setshowresults(false);
      setfilteredDoctors(filterdoctors)
    } else {
      setshowresults(true);
      const temp = filterdoctors.filter(doc =>
        doc.name.toLowerCase().includes(samp) ||
        doc.speciality.toLowerCase().includes(samp)
      );
      console.log("filtering based on search")
      setfilteredDoctors(temp);
    }
  }

  // Your existing useEffect (with one addition)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const specialityParam = searchParams.get('speciality');

    const newFilters = specialityParam ? {
      languages: [],
      fees: [],
      ratings: [],
      experiences: [],
      specialities: [specialityParam.trim()],
      sortBy: ''
    } : filters;

    const filterdoctors = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/patient/filterdoctors", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ filters: newFilters, text })
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
        setCurrentPage(1); // --- NEW: Reset to page 1 on filter ---
        toast.success("Filters have been applied successfully");
      }
    };

    filterdoctors();
  }, [location.search, filters]); // Your existing dependencies


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
            <svg
              className="filter"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24"
              strokeWidth="1.5"
              stroke={showfilter ? "#f44336" : "#349ce3"}
              onClick={toggleFilter}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
              />
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
          <section className="content-section">
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
                      <p className="doctor-card-fee">₹{doc.fee} <span>Fee</span></p>
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

            {/* --- NEW: Pagination Component --- */}
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
        <DoctorFilters apply={applyfilters} globalfilters={filters} />
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

  return (
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
  );
};