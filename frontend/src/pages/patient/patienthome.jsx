import React, { useState, useContext, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FiPlay, FiSearch } from 'react-icons/fi';
import "../../css/patienthome.css"
import PopularDoctorCard from './populardoctorcard';
import { LinearProgress, Button } from '@mui/material';
import FeaturedDoctorCard from './featureddoctorcard';
import NavBar from '../../components/Navbar/navbar';
import CategoryCard from './categorycard';
import Bubbles from '../../components/Loaders/bubbles';
import DoctorFilters from './doctorfilters';
import { PatientContext } from "./patientcontext";




export default function PatientHome() {

  const [text, setText] = useState("")
  const [showing, setshowing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { doctors } = useContext(PatientContext);
  const [popularDoctors, setPopularDoctors] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [filtereddoctors, setfilteredDoctors] = useState(doctors)




  useEffect(() => {
    if (!doctors || doctors.length === 0) return;
    let featured = doctors.filter(doc => doc.rating >= 3.5 && doc.rating < 4.5 && doc.experience > 5);
    if (featured.length === 0) {

      featured = doctors.filter(doc => doc.rating >= 4 && doc.rating <= 5);
    }


    let popular = doctors.filter(doc => doc.rating >= 4.5 && doc.rating <= 5 && doc.experience >= 10);
    if (popular.length === 0) {

      popular = doctors.filter(doc => doc.rating >= 4 && doc.rating <= 5 && doc.experience >= 5);
    }
    setPopularDoctors(popular.slice(0, 4));
    setFeaturedDoctors(featured.slice(0, 10));
  }, [doctors])








  function show(event) {
    const samp = event.target.value.toLowerCase();
    setText(samp);

    if (samp.trim() === "") {
      setshowing(false);
      setfilteredDoctors(doctors);
    } else {
      setshowing(true);

      const temp = doctors.filter(doc =>
        doc.name.toLowerCase().includes(samp) ||
        doc.speciality.toLowerCase().includes(samp)
      );

      setfilteredDoctors(temp);
    }
  }




  function getting(event) {
    const samp = event.target.value.toLowerCase();
    setText(samp);
  }






  return (


    <>


      <section className="content-section">
        <div className="navbar-center">
          <div className="navbar-search">
            <FiSearch className="search-icon" />
            <input type="text" value={text} placeholder="Search doctors, specialties..." onChange={show} />
          </div>
        </div>
      </section>



      {!showing ? <>
        <h2 className='hehe'>Categories</h2>
        <section className="categories">

          <CategoryCard icon="🦷" title="Dentist" />
          <CategoryCard icon="🫁" title="Lungs" />
          <CategoryCard icon="👁️" title="Eye" />
          <CategoryCard icon="🦴" title="Orthopedic" />
          <CategoryCard icon="🧠" title="Neurology" />
          <CategoryCard icon="❤️" title="Cardiology" />
          <CategoryCard icon="🧬" title="Genetics" />
          <CategoryCard icon="🩸" title="Hematology" />
          <CategoryCard icon="🩺" title="General" />
          <CategoryCard icon="👶" title="Pediatrics" />
          <CategoryCard icon="🦻" title="ENT" />
          <CategoryCard icon="🩹" title="Surgery" />
        </section>

        <section className="content-section">
          <div className="section-header">
            <h3>Popular Doctors</h3>
            <Link to="/patient/getdoctors?popular=true" className="see-all montserrat-bold">See all &gt;</Link>
          </div>

          <div className='popular-doctors'>
            {popularDoctors.map(doc => (
              <PopularDoctorCard
                key={doc._id}
                name={doc.name}
                speciality={doc.speciality}
                rating={doc.rating}
                experience={doc.experience}
                fee={doc.fee}
                _id={doc._id}
                hospital={doc.hospital}
                imgSrc={doc.profilePic}
              />
            ))}
          </div>

        </section>


        <section className="content-section">
          <div className="section-header">
            <h3>Featured Doctors</h3>
            <Link to="/patient/getdoctors?featured=true" className="see-all montserrat-bold">See all &gt;</Link>
          </div>
          <div className="featured-doctors">
            {featuredDoctors.map(doc => (
              <FeaturedDoctorCard
                key={doc._id}
                name={doc.name}
                speciality={doc.speciality}
                rating={doc.rating}
                experience={doc.experience}
                fee={doc.fee}
                _id={doc._id}
                hospital={doc.hospital}
                imgSrc={doc.profilePic}
              />
            ))}
          </div>

        </section>
      </> : <>
        <section className="content-section">
          <div className="section-header">
            <h3>Doctors</h3>
          </div>

          <div className='featured-doctors'>
            {filtereddoctors.map(doc => (
              <FeaturedDoctorCard
                key={doc._id}
                name={doc.name}
                speciality={doc.speciality}
                rating={doc.rating}
                experience={doc.experience}
                fee={doc.fee}
                imgSrc={doc.profilePic}
              />
            ))}
          </div>

        </section>

      </>}
    </>




  );
}



