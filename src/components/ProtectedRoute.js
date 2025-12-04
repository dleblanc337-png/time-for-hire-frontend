import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowed }) {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) return <Navigate to="/login" replace />;

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
