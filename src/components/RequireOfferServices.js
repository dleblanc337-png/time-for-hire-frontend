import { Navigate } from "react-router-dom";

export default function RequireOfferServices({ children }) {
  let helperProfile = null;
  try {
    helperProfile = JSON.parse(localStorage.getItem("helperProfile") || "null");
  } catch {
    helperProfile = null;
  }

  const enabled = !!helperProfile?.offerServices;
  const hasServices = (helperProfile?.services || "").trim().length > 0;
  const hasCity = (helperProfile?.city || "").trim().length > 0;

  // You can tighten/loosen these rules anytime.
  const complete = enabled && hasServices && hasCity;

  if (!complete) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
