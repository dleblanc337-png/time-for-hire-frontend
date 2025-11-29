import React from "react";

const CalendarPage = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Service Calendar (Public)</h2>
      <p>Browse availability and services based on dates.</p>

      <div style={styles.calendarBox}>
        <p>[ Calendar Component Placeholder ]</p>
        <p>This will later be replaced with a real calendar.</p>
      </div>
    </div>
  );
};

export default CalendarPage;

const styles = {
  calendarBox: {
    marginTop: "20px",
    border: "1px dashed #888",
    padding: "30px",
    borderRadius: "12px",
    background: "#f0f6ff",
  },
};
