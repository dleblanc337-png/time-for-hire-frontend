// frontend/src/components/Header.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../assets/logo.png";

const [isLoggedIn, setIsLoggedIn] = useState(false);
const [role, setRole] = useState(null);

useEffect(() => {
  const token = localStorage.getItem("token");
  const savedRole = localStorage.getItem("role");

  if (token) {
    setIsLoggedIn(true);
    setRole(savedRole);
  }
}, []);
function Header({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <header className="tfh-header">
      <div className="tfh-header-left">
        <img src={logo} alt="Time For Hire Logo" className="tfh-logo-image" />
        <div className="tfh-title-group">
          <span className="tfh-title">Time For Hire</span>
          <span className="tfh-slogan">MAKE IT WORK</span>
        </div>
      </div>

      <nav className="tfh-header-right">
        <Link to="/" className="tfh-nav-link">Home</Link>

        {/* NOT LOGGED IN */}
{!isLoggedIn && (
  <>
    <Link to="/login" className="tfh-nav-link">Login</Link>
    <Link to="/register" className="tfh-nav-link">Create Account</Link>
  </>
)}

{/* LOGGED IN AS CUSTOMER */}
{isLoggedIn && role === "customer" && (
  <>
    <Link to="/customer-dashboard" className="tfh-nav-link">My Dashboard</Link>
    <button
      className="tfh-logout-btn"
      onClick={() => {
        localStorage.clear();
        navigate("/");
        window.location.reload();
      }}
    >
      Logout
    </button>
  </>
)}
{/* LOGGED IN AS HELPER */}
{isLoggedIn && role === "helper" && (
  <>
    <Link to="/helper-dashboard" className="tfh-nav-link">Helper Dashboard</Link>
    <button
      className="tfh-logout-btn"
      onClick={() => {
        localStorage.clear();
        navigate("/");
        window.location.reload();
      }}
    >
      Logout
    </button>
  </>
)}
      </nav>
    </header>
  );
}

export default Header;
