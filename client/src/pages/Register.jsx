import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/register.css";

function Register() {

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function registerUser(e) {
    e.preventDefault();
    const response = await fetch("http://localhost:1337/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        username,
        password,
      }),
    })

    const data = await response.json();
    if (data.status === "ok") {
      navigate("/login");
    }
    else {
      alert(data.error || 'Failed to register');
    }
  }

  return (
    <>
      <div className="register-body">
        <h1 className="register-heading">
          Voice Generated Smart Home Automation
        </h1>
        <div className="register-box">
          <p>Register</p>
          <form onSubmit={registerUser}>
            <div className="user-box">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="name"
              />
              <label htmlFor="name">Name</label>
            </div>
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
            <a href="#" onClick={registerUser}>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              Submit
            </a>
          </form>
          <p>
            Have have an account?{" "}
            <a href="/login" className="a2">
              Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
