// import React from 'react'
import "../signup/signup.css"
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Reset error state

        const userDetails = { name, email, password };

        try {
            const response = await fetch("http://localhost:8000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userDetails),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token); // Store token
                navigate("/"); // Redirect to Login
            } else {
                const errorData = await response.json();
                setError(errorData.detail || "Signup failed!");
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="addUser">
            <h3>Sign Up</h3>
            <form className="addUserForm" onSubmit={handleSubmit}>
                <div className="inputGroup">
                    <label htmlFor="name">Name: </label>
                    <input
                        type="text"
                        id="name"
                        autoComplete="off"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <label htmlFor="email">Email: </label>
                    <input
                        type="email"
                        id="email"
                        autoComplete="off"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor="password">Password: </label>
                    <input
                        type="password"
                        id="password"
                        autoComplete="off"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="btn btn-success">Sign Up</button>
                </div>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>} {/* Show error message */}

            <div className="login">
                <p>Already have an account?</p>
                <Link to="/" className="btn btn-primary">Login</Link>
            </div>
        </div>
    );
};

export default Signup;
