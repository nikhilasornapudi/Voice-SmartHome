import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../pages/login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  async function loginUser(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:1337/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();
      if (data.user) {
        localStorage.setItem("token", data.user);
        navigate("/home");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
      alert("Failed to communicate with the server");
    }
  }

  return (
    <div className="login-body">
      <h1 className="login-heading">Voice Generated Smart Home Automation</h1>
      <div className="login-box">
        <p>Login</p>
        <form onSubmit={loginUser}>
          <div className="user-box">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              id="email"
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="user-box">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
            />
            <label htmlFor="password">Password</label>
          </div>
          <a href="#" onClick={loginUser}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Submit
          </a>
        </form>
        <p>
          Do not have an account?{" "}
          <a href="/register" className="a2">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
