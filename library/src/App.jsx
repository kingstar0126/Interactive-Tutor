import React from "react";
import DashBoard from "./components/DashBoard";
import Header from "./components/Header";
import ItemDescription from "./components/ItemDescription";
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
