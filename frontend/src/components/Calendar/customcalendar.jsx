import React, { useState } from "react";
import "./customcalendar.css"; // <- Make sure this path is correct

const CustomCalendar = ({ value, onChange }) => {
  const [current, setCurrent] = useState(new Date(value));

  const monthName = current.toLocaleString("default", { month: "long" });
  const year = current.getFullYear();

  // Move to previous month
  const prevMonth = () => {
    const newDate = new Date(current);
    newDate.setMonth(current.getMonth() - 1);
    setCurrent(newDate);
  };

  // Move to next month
  const nextMonth = () => {
    const newDate = new Date(current);
    newDate.setMonth(current.getMonth() + 1);
    setCurrent(newDate);
  };

  // Generate calendar days
  const generateCalendar = () => {
    const firstDay = new Date(current.getFullYear(), current.getMonth(), 1);
    const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    const days = [];
    const starting = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    // Add empty slots before day 1
    for (let i = 0; i < starting; i++) days.push(null);

    // Add all actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(current.getFullYear(), current.getMonth(), i));
    }

    return days;
  };

  const isSameDay = (d1, d2) =>
    d1 &&
    d2 &&
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  return (
    <div className="cal-container">
      <div className="cal-header">
        <button onClick={prevMonth}>‹</button>
        <span className="month-label">
          {monthName} {year}
        </span>
        <button onClick={nextMonth}>›</button>
      </div>

      <div className="cal-weekdays">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="cal-grid">
        {generateCalendar().map((day, index) =>
          day ? (
            <div
              key={index}
              className={`cal-day ${isSameDay(day, value) ? "selected" : ""}`}
              onClick={() => onChange(day)}
            >
              {day.getDate()}
            </div>
          ) : (
            <div key={index} className="cal-empty"></div>
          )
        )}
      </div>
    </div>
  );
};

export default CustomCalendar;
