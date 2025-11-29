import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const HelperProfile = () => {
  const { helperId } = useParams();

  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);

  const [price, setPrice] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceMessage, setPriceMessage] = useState("");

  useEffect(() => {
    const fetchHelper = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/helpers/${helperId}`
        );
        const data = await res.json();
        setHelper(data);
        setPrice(data.price || "");
      } catch (err) {
        console.error("Error fetching helper:", err);
      }
      setLoading(false);
    };

    fetchHelper();
  }, [helperId]);

  const handleSavePrice = async () => {
    if (!price) return;

    try {
      setSavingPrice(true);

      const res = await fetch(
        `http://localhost:5000/helpers/${helperId}/update-price`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price }),
        }
      );

      const data = await res.json();

      setPriceMessage(
        data.success
          ? "Price updated successfully!"
          : "Error updating price."
      );
    } catch (err) {
      console.error(err);
      setPriceMessage("Server error.");
    }

    setSavingPrice(false);
    setTimeout(() => setPriceMessage(""), 2500);
  };

  if (loading) return <div>Loading...</div>;
  if (!helper) return <div>Helper not found.</div>;

  return (
    <>
      {/* MAIN PROFILE */}
      <div style={styles.container}>
        <h2>{helper.name}</h2>

        <p>
          <strong>Email:</strong> {helper.email}
        </p>

        <p>
          <strong>Overall Rating:</strong>{" "}
          {helper.averageRating || "No reviews yet"}
        </p>

        <hr />

        <Link to="/helpers" style={styles.backLink}>
          ← Back to helpers
        </Link>
      </div>

      {/* PRICE SECTION — this MUST be inside the fragment wrapper */}
      <div style={styles.priceBox}>
        <h3>Set Your Hourly Price</h3>

        <label>Price per hour ($):</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Ex: 35"
          style={styles.input}
        />

        <button
          onClick={handleSavePrice}
          disabled={savingPrice}
          style={styles.button}
        >
          {savingPrice ? "Saving..." : "Save Price"}
        </button>

        {priceMessage && <div style={styles.msg}>{priceMessage}</div>}
      </div>
    </>
  );
};

export default HelperProfile;

const styles = {
  container: {
    padding: "20px",
  },
  priceBox: {
    marginTop: "30px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    width: "300px",
  },
  input: {
    width: "100%",
    marginTop: "10px",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #aaa",
  },
  button: {
    marginTop: "15px",
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#0066cc",
    color: "white",
    cursor: "pointer",
  },
  msg: {
    marginTop: "10px",
    fontWeight: "bold",
  },
  backLink: {
    color: "#0066cc",
    textDecoration: "none",
  },
};
