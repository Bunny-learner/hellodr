import React from "react";
import { useNavigate } from "react-router-dom";
import "../../css/patienthome.css";

const specialityMap = {
  Dentist: "Dentist",
  Lungs: "Pulmonologist",
  Eye: "Ophthalmologist",
  Orthopedic: "Orthopedic",
  Neurology: "Neurologist",
  Cardiology: "Cardiologist",
  Genetics: "Geneticist",
  Hematology: "Hematologist",
  General: "General",
  Pediatrics: "Pediatrician",
  ENT: "ENT",
  Surgery: "Surgeon",
};

export default function CategoryCard({ icon, title }) {
  const navigate = useNavigate();

  const goto = () => {
    const specialityValue = specialityMap[title] || title;
    const path = `/patient/getdoctors?speciality=${specialityValue}`;
    navigate(path);
  };

  return (
    <div className="category-card" onClick={goto}>
      <span className="category-icon">{icon}</span>
      <p className="category-title">{title}</p>
    </div>
  );
}
