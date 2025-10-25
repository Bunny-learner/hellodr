import React, { useState, useContext,useCallback,useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FiPlay, FiSearch } from 'react-icons/fi';
import "../../css/patienthome.css";
import PopularDoctorCard from './populardoctorcard';
import { LinearProgress, Button } from '@mui/material';
import FeaturedDoctorCard from './featureddoctorcard';
import NavBar from '../../components/Navbar/navbar';
import CategoryCard from './categorycard';
import Bubbles from '../../components/Loaders/bubbles';
import DoctorFilters from './doctorfilters';
import { PatientContext } from './patientcontext';


export default function patientgetdoctors() {
 const {doctors}=useContext(PatientContext)
 const [filterdoctors,setfilterDoctors]=useState(doctors)
 const [filtereddoctors,setfilteredDoctors]=useState(doctors)
 const [filters, setFilters] = useState( {languages: [],
    fees: [],
    ratings: [],
    experiences: [],
    specialities: [],
    sortBy: ''});
  const [loading,setLoading]=useState(false)
  const [showfilter,setshowfilter]=useState(false)
  const [text,setText]=useState("")
  const [showresults,setshowresults]=useState(false)





const toggleFilter = () => setshowfilter((prev) => !prev);

  function changing(){
  
  showfilter?setshowfilter(false):setshowfilter(true);

  }

    const applyfilters = useCallback((newFilters) => {
      console.log("filters are being applied")
      console.log(newFilters)
      setFilters(newFilters);
    },[])
  
  
 function searching(event) {
    const samp = event.target.value.toLowerCase();
    setText(samp);


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
      toast.success("Filters have been applied successfully");
    }
  };

  filterdoctors();
}, [location.search, filters]);


if(loading)return <Bubbles/>
  return (
      <>
           
               <section className="content-section">
                 <div className="navbar-center">
                   <div className="navbar-search">
          <svg
           className="filter"
           xmlns="http://www.w3.org/2000/svg"
           fill="none"
           viewBox="0 0 24 24"
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
   
         {!showfilter?(
          
          
          <>
              <section className="content-section">
                 <div className="section-header">
                   <h3>Doctors</h3>
                 </div>
   {!showresults?
                 <div className='featured-doctors alldoctors'>
                   {filterdoctors.map(doc => (
                     <FeaturedDoctorCard
                       key={doc._id}
                       name={doc.name}
                       speciality={doc.speciality}
                       rating={doc.rating}
                       experience={doc.experience}
                       fee={doc.fee}
                       _id={doc._id}
                       imgSrc={doc.profilePic}
                     />
                   ))}
                 </div>
                 :
                  <div className='featured-doctors alldoctors'>
                   {filtereddoctors.map(doc => (
                     <FeaturedDoctorCard
                       key={doc._id}
                       name={doc.name}
                       speciality={doc.speciality}
                       rating={doc.rating}
                       experience={doc.experience}
                       fee={doc.fee}
                       _id={doc._id}
                       imgSrc={doc.profilePic}
                     />
                   ))}
                 </div>}
   
               </section>
   
   
   
             </>
            
            
            ):(<div className="shadow"><DoctorFilters apply={applyfilters} globalfilters={filters} /></div>)}
                     
       
       
    </>
  )
}
