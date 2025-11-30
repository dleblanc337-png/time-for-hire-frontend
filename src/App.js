// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";

// OPTIONAL: add these later if needed
// import Contact from "./pages/Contact";
// import Services from "./pages/Services";

function App() {
  return (
    <Router>
      <Header />   {/* ALWAYS AT TOP */}
<Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 404 fallback */}
        <Route path="*" element={<div style={{ padding: "20px" }}>Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
