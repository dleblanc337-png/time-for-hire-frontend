import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

function CustomerProfile() {
  const [user, setUser] = useState(null);
  const [helperProfile, setHelperProfile] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        // If this user is a helper, load helperProfile from localStorage
        if (parsed.role === "helper") {
          const hp = localStorage.getItem("helperProfile");
          if (hp) {
            setHelperProfile(JSON.parse(hp));
          }
        }
      }
    } catch (e) {
      console.error("Error reading profile from localStorage", e);
    }
  }, []);

  if (!user) {
    return (
      <DashboardLayout>
        <h1>My Profile</h1>
        <p>Not logged in.</p>
      </DashboardLayout>
    );
  }

  const isHelper = user.role === "helper";

  return (
    <DashboardLayout>
      <h1>My Profile</h1>

      {/* BASIC ACCOUNT INFO */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #ddd",
          marginBottom: "20px",
          maxWidth: "500px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Account</h3>
        <p>
          <strong>Name:</strong>{" "}
          {user.name || user.displayName || "Not specified"}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>

      {/* HELPER PROFILE SECTION, IF APPLICABLE */}
      {isHelper && (
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            maxWidth: "700px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Helper Profile (Public View)</h3>

          {!helperProfile && (
            <p style={{ fontSize: "13px" }}>
              You have not completed your Helper Profile yet. Go to{" "}
              <strong>Helper Profile</strong> in the left menu to set it up.
            </p>
          )}

          {helperProfile && (
            <div style={{ display: "flex", gap: "16px" }}>
              <div>
                {helperProfile.photoUrl ? (
                  <img
                    src={helperProfile.photoUrl}
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
                  {helperProfile.displayName || "Your Name Here"}
                </h4>
                <p
                  style={{
                    margin: "4px 0",
                    fontSize: "13px",
                    color: "#555",
                  }}
                >
                  {helperProfile.city || "City / Area"}
                </p>

                {helperProfile.hourlyRate && (
                  <p style={{ margin: "4px 0", fontSize: "13px" }}>
                    <strong>Approx. ${helperProfile.hourlyRate}/hr</strong>
                  </p>
                )}

                {helperProfile.bio && (
                  <p style={{ fontSize: "13px", marginTop: "8px" }}>
                    {helperProfile.bio}
                  </p>
                )}

                {helperProfile.services && (
                  <p
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      color: "#003f63",
                    }}
                  >
                    <strong>Services:</strong> {helperProfile.services}
                  </p>
                )}

                {helperProfile.availability && (
                  <p
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      color: "#444",
                    }}
                  >
                    <strong>Availability:</strong>{" "}
                    {helperProfile.availability}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default CustomerProfile;
