import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

function HelperProfile() {
  const [profile, setProfile] = useState({
    displayName: "",
    city: "",
    photoUrl: "",
    bio: "",
    services: "",
    hourlyRate: "",
    availability: "",
  });

  const [savedMessage, setSavedMessage] = useState("");

  // Load existing profile from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("helperProfile");
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading helperProfile from localStorage", e);
    }
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSave(e) {
    e.preventDefault();

    // Prepare tags from services string (for future search)
    const rawServices = profile.services || "";
    const tags = rawServices
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const toSave = {
      ...profile,
      serviceTags: tags, // e.g. ["carpenter","cleaning","yard work"]
    };

    try {
      localStorage.setItem("helperProfile", JSON.stringify(toSave));
      setSavedMessage("Profile saved successfully.");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (e) {
      console.error("Error saving helperProfile", e);
      setSavedMessage("Error saving profile.");
    }
  }

  return (
    <DashboardLayout>
      <h1>Helper Profile</h1>
      <p>
        This is how customers will see you when they browse helpers on Time For Hire.
      </p>

      <div
        style={{
          display: "flex",
          gap: "30px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT: FORM */}
        <form
          onSubmit={handleSave}
          style={{
            flex: "1 1 320px",
            maxWidth: "420px",
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Edit Profile</h3>

          <label style={labelStyle}>Display Name</label>
          <input
            type="text"
            name="displayName"
            value={profile.displayName}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Example: Test H. - Housekeeping"
            required
          />

          <label style={labelStyle}>City / Area</label>
          <input
            type="text"
            name="city"
            value={profile.city}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Victoria, BC"
          />

          <label style={labelStyle}>Profile Photo URL</label>
          <input
            type="text"
            name="photoUrl"
            value={profile.photoUrl}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Paste an image link (optional)"
          />

          <label style={labelStyle}>Short Bio</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            style={{ ...inputStyle, height: "80px", resize: "vertical" }}
            placeholder="Tell customers who you are, your experience, and what you can help with."
          />

          <label style={labelStyle}>Services / Keywords</label>
          <input
            type="text"
            name="services"
            value={profile.services}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Example: carpenter, cleaning, yard work, grocery runs"
          />
          <p style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
            Separate services with commas. Later, customers searching &quot;carpenter&quot; will
            match helpers who list &quot;carpenter&quot; here.
          </p>

          <label style={labelStyle}>Hourly Rate (approx.)</label>
          <input
            type="number"
            name="hourlyRate"
            value={profile.hourlyRate}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Example: 25"
            min="0"
          />

          <label style={labelStyle}>Availability / Schedule</label>
          <textarea
            name="availability"
            value={profile.availability}
            onChange={handleChange}
            style={{ ...inputStyle, height: "70px", resize: "vertical" }}
            placeholder="Example: Weeknights after 5PM, weekends, or specific days."
          />

          {savedMessage && (
            <p style={{ color: "green", marginTop: "10px" }}>{savedMessage}</p>
          )}

          <button
            type="submit"
            style={{
              marginTop: "16px",
              padding: "10px 16px",
              background: "#003f63",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Save Profile
          </button>
        </form>

        {/* RIGHT: PREVIEW */}
        <div
          style={{
            flex: "1 1 280px",
            maxWidth: "380px",
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Preview</h3>
          <p style={{ fontSize: "13px", color: "#555" }}>
            This is an example of how your profile might appear to customers.
          </p>

          <div
            style={{
              marginTop: "14px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            <div>
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt="Helper"
                  style={{
                    width: "90px",
                    height: "90px",
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
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    background: "#eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px",
                    color: "#999",
                  }}
                >
                  ?
                </div>
              )}
            </div>

            <div>
              <h4 style={{ margin: 0 }}>
                {profile.displayName || "Your Name Here"}
              </h4>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "#555" }}>
                {profile.city || "City / Area"}
              </p>
              {profile.hourlyRate && (
                <p style={{ margin: "4px 0", fontSize: "13px" }}>
                  <strong>Approx. ${profile.hourlyRate}/hr</strong>
                </p>
              )}
              <p style={{ fontSize: "13px", marginTop: "8px" }}>
                {profile.bio ||
                  "Write a short description about yourself and your experience."}
              </p>
              {profile.services && (
                <p
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "#003f63",
                  }}
                >
                  <strong>Services:</strong> {profile.services}
                </p>
              )}
              {profile.availability && (
                <p
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "#444",
                  }}
                >
                  <strong>Availability:</strong> {profile.availability}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const labelStyle = {
  display: "block",
  marginTop: "10px",
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

export default HelperProfile;
