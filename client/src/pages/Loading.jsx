import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/loading.css";

function LoadingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  }, [navigate]);

  return (
    <div className="loading-body">
      <div className="loading-screen">
        <div className="greeting-container">
          <h1>Welcome to,</h1>
          <h1>Smart Home Automation System</h1>
          <div className="spinner">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
