import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../pages/device.css";

function Device() {
  const [devices, setDevices] = useState([]);
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [devicename, setDevicename] = useState("");
  const [devicetype, setDevicetype] = useState("");
  const [devicestatus, setDevicestatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
      localStorage.removeItem("token");
      navigate("/login"); 
  };
  
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:1337/api/devices");
      console.log(response);
      if (response.data && Array.isArray(response.data.data)) {
        setDevices(response.data.data);
      } else {
        throw new Error("Unexpected data format from the server");
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      setError("Failed to load devices: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const existingDeviceResponse = await axios.get(
        `http://localhost:1337/api/devices?devicename=${devicename}`
      );
      if (existingDeviceResponse.data.length > 0) {
        alert("A device with this name already exists");
        return;
      }

      const response = await axios.post("http://localhost:1337/api/devices", {
        devicename,
        devicetype,
        devicestatus,
      });

      if (response.data && response.data.status === "ok") {
        setDevices((prevDevices) => [
          ...prevDevices,
          { ...response.data.data, _id: response.data.id },
        ]);
        setDevicename("");
        setDevicetype("");
        setDevicestatus(false);
        alert("Device added successfully!");
      } else {
        throw new Error(
          response.data.error || "Failed to add device due to unknown error"
        );
      }
    } catch (error) {
      alert(`Failed to add device: ${error.message}`);
    }
  };

  const deleteDevice = async (deviceId) => {
    try {
      const response = await axios.delete(
        `http://localhost:1337/api/devices/${deviceId}`
      );
      if (response.status === 200) {
        setDevices((prevDevices) =>
          prevDevices.filter((device) => device._id !== deviceId)
        );
        alert("Device deleted successfully!");
      } else {
        throw new Error("Failed to delete device.");
      }
    } catch (error) {
      alert(
        `Error deleting device: ${error.message || error.response.statusText}`
      );
    }
  };

  const handleUpdate = async (event, deviceId) => {
    event.preventDefault();
    const updatedDetails = {
      devicename,
      devicetype,
      devicestatus,
    };
    try {
      const response = await axios.patch(
        `http://localhost:1337/api/devices/update/${deviceId}`,
        updatedDetails
      );
      if (
        response.data &&
        response.data.message === "Device updated successfully"
      ) {
        setDevices((currentDevices) =>
          currentDevices.map((device) =>
            device._id === deviceId ? { ...device, ...updatedDetails } : device
          )
        );
        setEditingDeviceId(null);
        alert("Device updated successfully!");
      } else {
        throw new Error(
          response.data.error || "Failed to update device due to unknown error"
        );
      }
    } catch (error) {
      alert(
        `Error updating device: ${
          error.response ? error.response.data.error : error.message
        }`
      );
    }
  };


  return (
    <div className="body">
      <div className="device-header">
        <div className="device-navigation">
          <Link to="/home">Home</Link>
          <Link to="/device">Devices</Link>
          <Link to="/voice">Voice</Link>
          <label className="device-popup">
            <input type="checkbox" />
            <div className="device-burger" tabIndex="0">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <nav className="device-popup-window">
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
      <div className="device_container">
        <h1>Device Management</h1>
        {loading ? (
          <p>Loading devices...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : (
          <ul>
            {devices.map((device) => (
              <li key={device._id}>
                {editingDeviceId === device._id ? (
                  <form onSubmit={(e) => handleUpdate(e, device._id)}>
                    <input
                      type="text"
                      value={devicename}
                      onChange={(e) => setDevicename(e.target.value)}
                      placeholder="Device Name"
                      required
                    />
                    <input
                      type="text"
                      value={devicetype}
                      onChange={(e) => setDevicetype(e.target.value)}
                      placeholder="Device Type"
                      required
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={devicestatus}
                        onChange={(e) => setDevicestatus(e.target.checked)}
                      />
                      Active
                    </label>
                    <div className="button-container">
                      <button type="submit">Save Changes</button>
                      <button
                        type="button"
                        onClick={() => setEditingDeviceId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {`${device.devicename} - Status: ${
                      device.devicestatus ? "Active" : "Inactive"
                    }`}
                    <button
                      onClick={() => {
                        setEditingDeviceId(device._id);
                        setDevicename(device.devicename);
                        setDevicetype(device.devicetype);
                        setDevicestatus(device.devicestatus);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteDevice(device._id)}>
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={devicename}
            onChange={(e) => setDevicename(e.target.value)}
            placeholder="Device Name"
            required
          />
          <input
            type="text"
            value={devicetype}
            onChange={(e) => setDevicetype(e.target.value)}
            placeholder="Device Type"
            required
          />
          <label>
            <input
              type="checkbox"
              checked={devicestatus}
              onChange={(e) => setDevicestatus(e.target.checked)}
            />
            Active
          </label>
          <button type="submit" >Add Device</button>
        </form>
      </div>
    </div>
  );
}

export default Device;
