import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLIC_KEY
);

// -------------------------
// CHECKOUT FORM
// -------------------------
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();

  // Data coming from CustomerBookings "Pay Now"
  const bookingId = location.state?.bookingId || null;
  const bookingAmount = location.state?.amount || "";

  const [amount, setAmount] = useState(bookingAmount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const backendUrl =
        process.env.REACT_APP_API_URL ||
        "https://time-for-hire-backend.onrender.com";

      const res = await fetch(
        `${backendUrl}/api/payments/create-payment-intent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseInt(amount) * 100
          })
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Backend error");
      }

      const data = await res.json();

      const result = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)
          }
        }
      );

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        // ✅ Pass booking info to the success page
        navigate("/payment-success", {
          state: {
            bookingId,
            amount
          }
        });
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed");
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        maxWidth: "420px",
        marginLeft: "60px",
        marginTop: "40px",
        background: "#fff",
        padding: "24px",
        borderRadius: "10px",
        border: "1px solid #ddd"
      }}
    >
      <h2 style={{ marginBottom: "14px" }}>Test Payment</h2>

      <form onSubmit={handlePayment}>
        <label>Amount (CAD)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "8px",
            marginTop: "6px",
            marginBottom: "14px"
          }}
        />

        <label>Card Details</label>
        <div style={{ marginTop: "8px", marginBottom: "14px" }}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#000",
                  "::placeholder": { color: "#555" }
                },
                invalid: { color: "red" }
              },
              hidePostalCode: false
            }}
          />
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: "12px" }}>
            {error}
          </p>
        )}

        <button
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </form>
    </div>
  );
}

// -------------------------
// PAGE WRAPPER
// -------------------------
export default function Payment() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
