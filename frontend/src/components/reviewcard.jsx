import React from "react";
import "./ReviewCard.css";

const ReviewCard = ({ reviews }) => {
  return (
    <div className="review-container">
      <div className="review-list">
        {reviews.map((review) => {
          const formattedDate = new Date(review.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <div key={review._id} className="review-card">
              <div className="review-left">
                <img
                  src={review.patient.profilePic || "https://via.placeholder.com/60"}
                  alt={review.patient.email}
                  className="review-avatar"
                />
              </div>
              <div className="review-right">
                <div className="review-header">
                  <h3 className="review-name">{review.patient.name || review.patient.email}</h3>
                  <span className="review-email">{review.patient.email}</span>
                </div>
                <span className="review-date">{formattedDate}</span> {/* date displayed */}
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`star ${i < review.rating ? "filled" : ""}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="review-message">{review.review}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewCard;
