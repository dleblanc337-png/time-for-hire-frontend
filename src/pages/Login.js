const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/login`,
            { email, password }
        );

        // Save token + user
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Redirect dynamically based on role
        if (response.data.user.role === "helper") {
            navigate("/helper-dashboard");
        } else {
            navigate("/customer-dashboard");
        }
    } catch (err) {
        setError("Invalid email or password.");
    }
};
