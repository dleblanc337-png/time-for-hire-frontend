import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Marketplace() {
  const [helpers, setHelpers] = useState([]);

  useEffect(() => {
    const loadHelpers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/helpers");
        setHelpers(res.data);
      } catch (e) {
        console.error("Error loading helpers:", e);
      }
    };

    loadHelpers();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Find a Helper</h1>

      {helpers.length === 0 ? (
        <p>No helpers available.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {helpers.map((h) => (
            <div
              key={h._id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "10px",
                background: "white",
              }}
            >
              <h2>{h.name}</h2>
              <p><strong>Service:</strong> {h.serviceName || "Service not set yet"}</p>
              <p><strong>Email:</strong> {h.email}</p>

              <Link to={`/helper/${h._id}`}>
                <button
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    background: "blue",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  View Profile
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
