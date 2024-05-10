import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../pages/home.css";
function Home() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:1337/api/devices");
        console.log(response);
        if (response.data && response.data.data) {
          setDevices(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
        setError("Failed to load devices");
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  return (
    <div className="homepage">
      <div className="home-header">
        <div className="home-navigation">
          <Link to="/home">Home</Link>
          <Link to="/device">Devices</Link>
          <Link to="/voice">Voice</Link>
          <label className="home-popup">
            <input type="checkbox" />
            <div className="home-burger" tabIndex="0">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <nav className="home-popup-window">
              <ul>
                <li>
                  <button onClick={handleLogoutClick}>
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </label>
        </div>
      </div>
      <div className="dashboard">
        <div className="dashboard__content">
          <div className="dashboard__title__container">
            <h1 className="dashboard__title">
              Welcome to Smart Home Automation Dashboard
            </h1>
          </div>
          <div className="body_text">
            <h2>Registered devices</h2>
          </div>
          <div className="device-grid">
            {error && <p className="error-message">{error}</p>}
            {loading ? (
              <p>Loading devices...</p>
            ) : (
              devices.map((device) => (
                <div
                  className="device-card"
                  key={device._id || device.devicetype}
                >
                  <h2>{device.devicename}</h2>
                  <p>Status: {device.devicestatus ? "Active" : "Inactive"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
