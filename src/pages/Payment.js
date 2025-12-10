import React, { useState } from "react";
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
// PAYMENT FORM COMPONENT
// -------------------------
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://time-for-hire-backend.onrender.com/api/payments/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseInt(amount) * 100
          })
        }
      );

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
      } else {
        if (result.paymentIntent.status === "succeeded") {
          setSuccess(true);
        }
      }
    } catch (err) {
      setError("Payment failed");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ padding: 30 }}>
        ✅ Payment Successful!
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} style={{ padding: 30 }}>
      <h2>Test Payment</h2>

      <input
        type="number"
        placeholder="Amount (CAD)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <div style={{ marginTop: 20 }}>
        <CardElement />
      </div>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <button disabled={loading} style={{ marginTop: 20 }}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
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
