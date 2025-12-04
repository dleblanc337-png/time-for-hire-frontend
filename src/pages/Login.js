const handleLogin = async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Save token + role + logged-in state
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("isLoggedIn", "true");

    // Redirect based on role
    if (data.user.role === "helper") {
      navigate("/helper-dashboard");
    } else {
      navigate("/customer-dashboard");
    }

  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong");
  }
};
