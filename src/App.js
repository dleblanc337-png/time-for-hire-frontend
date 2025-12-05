import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";

import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerHome from "./pages/CustomerHome";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerBookings from "./pages/CustomerBookings";
import CustomerMessages from "./pages/CustomerMessages";

function App() {
  return (
    <Router>
      <Switch>
        {/* Public Pages */}
        <Route exact path="/" component={HomePage} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />

        {/* Customer Dashboard */}
        <Route exact path="/customer-dashboard" component={CustomerDashboard} />
        <Route exact path="/customer-home" component={CustomerHome} />
        <Route exact path="/customer-profile" component={CustomerProfile} />
        <Route exact path="/customer-bookings" component={CustomerBookings} />
        <Route exact path="/customer-messages" component={CustomerMessages} />
      </Switch>
    </Router>
  );
}

export default App;
