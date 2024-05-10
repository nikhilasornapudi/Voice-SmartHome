import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import VoiceControl from './VoiceControl.jsx'
import Device from './pages/Device.jsx'
import Home from './pages/Home.jsx'
import Loading from './pages/Loading.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'


function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/device" element={<Device />} />
          <Route path="/voice" element={<VoiceControl />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
