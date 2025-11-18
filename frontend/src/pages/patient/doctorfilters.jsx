import React, { useState } from 'react';
import '../../css/doctorfilters.css';

export default function DoctorFilters({ apply, globalfilters,close }) {
  const [localFilters, setLocalFilters] = useState({
    languages: globalfilters.languages || [],
    fees: globalfilters.fees || [],
    ratings: globalfilters.ratings || [],
    experiences: globalfilters.experiences || [],
    specialities: globalfilters.specialities || [],
    availability: globalfilters.availability || [],
    consultation: globalfilters.consultation || [],
    gender: globalfilters.gender || [],
    sortBy: globalfilters.sortBy || '',
    insurance: globalfilters.insurance || [],
    hospital: globalfilters.hospital || [],
  });

  // Toggle multi-select filter
  const toggleFilter = (category, value) => {
    setLocalFilters(prev => {
      const list = prev[category] || [];
      const updated = list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value];
      return { ...prev, [category]: updated };
    });
  };

  // Single-select filter
  const selectSingleFilter = (category, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: prev[category][0] === value ? [] : [value],
    }));
  };

  const handleSortChange = e => {
    setLocalFilters(prev => ({ ...prev, sortBy: e.target.value }));
  };

  const handleApply = () => {
  apply(localFilters); 
  close() 

};


  const handleReset = () => {
    const reset = {
      languages: [],
      fees: [],
      ratings: [],
      experiences: [],
      specialities: [],
      availability: [],
      consultation: [],
      gender: [],
      sortBy: '',
      insurance: [],
      hospital: [],
    };
    setLocalFilters(reset);
    apply(reset);
  };

  const filterChips = (category, options, singleSelect = false) => (
    <div className="filter-chip-group">
      {options.map(opt => {
        const isActive = localFilters[category].includes(opt);
        return (
          <button
            key={opt}
            className={`filter-chip ${isActive ? 'active' : ''}`}
            onClick={() =>
              singleSelect
                ? selectSingleFilter(category, opt)
                : toggleFilter(category, opt)
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  return (
    <section className="doctor-filters-modern">
      <div className="filters-header-row">
        <h4>Filter Doctors</h4>

        <div className="filter-buttons-top">
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
          <button className="apply-btn" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>

      {/* Languages */}
      <div className="filter-section">
        <label>Languages:</label>
        {filterChips('languages', [
          'English','Hindi','Telugu','Tamil','Kannada',
          'Bengali','Marathi','Punjabi','Malayalam'
        ])}
      </div>

      {/* Fees */}
      <div className="filter-section">
        <label>Fee:</label>
        {filterChips('fees', ['<500','500-1000','1000-2000','>2000'], true)}
      </div>

      {/* Ratings */}
      <div className="filter-section">
        <label>Rating:</label>
        {filterChips('ratings', ['>=3','>=4','>=4.5','5'], true)}
      </div>

      {/* Experience */}
      <div className="filter-section">
        <label>Experience:</label>
        {filterChips('experiences', ['0-1 yr','1-5 yrs','5-10 yrs','>10 yrs'], true)}
      </div>

      {/* Specialities */}
      <div className="filter-section">
        <label>Speciality:</label>
        {filterChips('specialities', [
          'General Physician','Dentist','Cardiology','Neurology','Pediatrician',
          'Dermatology','Orthopedic','Gynecology','ENT','Ophthalmologist',
          'Psychiatrist','Gastroenterologist','Urologist','Endocrinologist',
          'Pulmonologist','Nephrologist'
        ])}
      </div>

      {/* Availability */}
      <div className="filter-section">
        <label>Availability:</label>
        {filterChips('availability', ['Today','Tomorrow','Morning','Afternoon','Evening','Weekends'], true)}
      </div>

      {/* Gender */}
      <div className="filter-section">
        <label>Gender:</label>
        {filterChips('gender', ['Male','Female'], true)}
      </div>

      {/* Sort */}
      <div className="filter-section">
        <label>Sort By:</label>
        <select value={localFilters.sortBy} onChange={handleSortChange} className="sort-dropdown">
          <option value="">Select</option>
          <option value="experience">Experience</option>
          <option value="fee">Fee</option>
          <option value="rating">Rating</option>
        </select>
      </div>
    </section>
  );
}
