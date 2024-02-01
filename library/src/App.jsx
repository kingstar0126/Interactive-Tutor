import React from "react";
import DashBoard from "./Components/DashBoard";
import Header from "./Components/Header";
import ItemDescription from "./Components/ItemDescription";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <Header />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<DashBoard />} />
            <Route path="/itemdescription" element={<ItemDescription />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
