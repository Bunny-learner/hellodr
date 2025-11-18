import React from "react";
import { useNavigate } from "react-router-dom";
import "../../css/patienthome.css";

export default function CategoryCard({ title, image }) {
  const navigate = useNavigate();

  const goto = () => {
    navigate(`/patient/getdoctors?speciality=${encodeURIComponent(title)}`);
  };

  return (
    <div className="category-card-rect" onClick={goto}>
      <img src={image} alt={title} className="category-img-rect" />
      <div className="category-text">{title}</div>
    </div>
  );
}
