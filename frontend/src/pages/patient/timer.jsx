import React from "react";
import "../../css/timer.css";

export default function Timer({ ms }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = (ms / 30) * circumference; // assuming max 30 seconds

  return (
    <div className="timer-container">
      <svg className="progress-ring" width="80" height="80">
        <circle
          className="progress-ring__background"
          stroke="#e6e6e6"
          strokeWidth="5"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
        />
        <circle
          className="progress-ring__circle"
          stroke="#07D9AD"
          strokeWidth="5"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div className="timer-text">{ms}s</div>
    </div>
  );
}
