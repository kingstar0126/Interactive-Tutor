import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Forgetpassword from "./Pages/Forgetpassword";
import Changepassword from "./Pages/Changepassword";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="resetpassword" element={<Forgetpassword />} />
        <Route path="changepassword" element={<Changepassword />} />
      </Routes>
    </>
  );
}

export default App;
