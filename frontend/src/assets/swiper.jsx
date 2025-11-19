import React from "react";
import "../css/daytab.css"
export default function DayTabs({
  availabilityData,
  mode,
  selectedDayId,
  setSelectedDayId,
  setSelectedSlot,
  setConsultFee,
}) {
  return (
    <div className="date-tabs">
      {availabilityData
        // ✅ Filter out days with zero total slots
        .filter((day) => {
          const totalSlots =
            (day[mode]?.Morning?.length || 0) +
            (day[mode]?.Afternoon?.length || 0) +
            (day[mode]?.Evening?.length || 0);
          return totalSlots > 0;
        })
        .map((day) => {
          const count =
            (day[mode]?.Morning?.length || 0) +
            (day[mode]?.Afternoon?.length || 0) +
            (day[mode]?.Evening?.length || 0);

          return (
            <div
              key={day.id}
              className={`tab ${day.id === selectedDayId ? "selected" : ""}`}
              onClick={() => {
                setSelectedDayId(day.id);
                setSelectedSlot(null);
                setConsultFee(null);
              }}
            >
              <span className="day-date">{day.date}</span>
              <strong>{day.dayName}</strong>
              <span>{`${count} slots`}</span>
            </div>
          );
        })}
    </div>
  );
}  