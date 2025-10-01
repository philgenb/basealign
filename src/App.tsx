import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/pages/LandingPage";
import ResultPage from "./components/pages/ResultPage";
import {MobileBlocker} from "./components/pages/MobileLockScreenPage";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Mobile-Only */}
      <div className="block md:hidden bg-white">
        <MobileBlocker />
      </div>

      {/* Desktop-Only */}
      <div className="hidden md:block">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/results" element={<ResultPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
};

export default App;
