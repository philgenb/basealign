import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/pages/LandingPage";
import ResultPage from "./components/pages/ResultPage";

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-transparent">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="/results" element={<ResultPage/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;
