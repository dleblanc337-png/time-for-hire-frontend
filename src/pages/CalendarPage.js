import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function CalendarPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [helpers, setHelpers] = useState([]);

  useEffect(() => {
    try {
      const rawHelpers = localStorage.getItem("tfh_helpers") || "[]";
      const parsed = JSON.parse(rawHelpers);
      setHelpers(parsed);
    } catch (e) {
      console.error("Error loading helpers for calendar", e);
    }
  }, []);

  const normalizedTerm = searchTerm.trim().toLowerCase();

  function helperMatches(helper) {
    const profile = helper.profile || {};
    const tags = profile.serviceTags || [];
    const slots = helper.availabilitySlots || [];

    // If no date selected, ignore availability filter (just show matching services)
    const dateFilterOn = !!selectedDate;

    // Service match: keyword appears in tags OR raw services text
    const servicesText = (profile.services || "").toLowerCase();
    const servicesMatch =
      !normalizedTerm ||
      tags.includes(normalizedTerm) ||
      servicesText.includes(normalizedTerm);

    if (!servicesMatch) return false;

    if (!dateFilterOn) return servicesMatch;

    // If date is selected, require at least one slot that day, and if a service term is given,
    // that slot should include the term
    const slotMatch = slots.some((slot) => {
      if (slot.date !== selectedDate) return false;

      if (!normalizedTerm) return true;

      const slotServices = slot.services || [];
      return (
        slotServices.includes(normalizedTerm) ||
        (slot.rawServices || "").toLowerCase().includes(normalizedTerm)
      );
    });

    return slotMatch;
  }

  const filteredHelpers = helpers.filter(helperMatches);

  return (
    <DashboardLayout>
      <h1>Find a helper</h1>
      <p>
        Search for a service and pick a date to see helpers who are available
        and match your request.
      </p>

      {/* SEARCH CONTROLS */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          margin: "20px 0",
        }}
      >
        <div style={{ flex: "1 1 260px", maxWidth: "400px" }}>
          <label style={labelStyle}>Search a service</label>
          <input
            type="text"
            placeholder="carpenter, lawn, tutor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
          <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
            Type a keyword that matches helper services: carpenter, lawn,
            cleaning, snow, tutor, dog walker, etc.
          </p>
        </div>

        <div style={{ flex: "1 1 160px", maxWidth: "220px" }}>
          <label style={labelStyle}>Selected date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={inputStyle}
          />
          <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
            Choose a date to filter by helper availability (optional).
          </p>
        </div>
      </div>

      {/* RESULTS */}
      <div style={{ marginTop: "10px" }}>
        {filteredHelpers.length === 0 ? (
          <p style={{ fontSize: "14px" }}>
            No helpers found for this search yet. Try another keyword or date.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {filteredHelpers.map((helper) => {
              const profile = helper.profile || {};
              const slots = (helper.availabilitySlots || []).filter((slot) =>
                selectedDate ? slot.date === selectedDate : true
              );

              return (
                <div
                  key={helper.id}
                  style={{
                    background: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    padding: "16px",
                    display: "flex",
                    gap: "16px",
                  }}
                >
                  {/* Avatar */}
                  <div>
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.displayName || helper.name}
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #003f63",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "70px",
                          height: "70px",
                          borderRadius: "50%",
                          background: "#eee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "28px",
                          color: "#999",
                        }}
                      >
                        ?
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>
                      {profile.displayName || helper.name || "Helper"}
                    </h3>
                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "13px",
                        color: "#555",
                      }}
                    >
                      {profile.city || "Location not specified"}
                    </p>
                    {profile.hourlyRate && (
                      <p style={{ margin: "0 0 4px 0", fontSize: "13px" }}>
                        <strong>Approx. ${profile.hourlyRate}/hr</strong>
                      </p>
                    )}
                    {profile.bio && (
                      <p
                        style={{
                          margin: "6px 0",
                          fontSize: "13px",
                          color: "#333",
                        }}
                      >
                        {profile.bio}
                      </p>
                    )}
                    {profile.services && (
                      <p
                        style={{
                          margin: "4px 0",
                          fontSize: "12px",
                          color: "#003f63",
                        }}
                      >
                        <strong>Services:</strong> {profile.services}
                      </p>
                    )}

                    {slots.length > 0 && (
                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "12px",
                          color: "#444",
                        }}
                      >
                        <strong>Availability on selected date:</strong>
                        <ul style={{ paddingLeft: "18px", margin: "4px 0" }}>
                          {slots.map((slot) => (
                            <li key={slot.id}>
                              {slot.startTime}–{slot.endTime}{" "}
                              {slot.rawServices && `(${slot.rawServices})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "4px",
  fontSize: "13px",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

export default CalendarPage;
