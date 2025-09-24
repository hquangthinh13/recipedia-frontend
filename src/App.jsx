import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";

import LogInPage from "./pages/LogInPage";

import SignUpPage from "./pages/SignUpPage";
import CreateRecipePage from "./pages/CreateRecipePage";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/create" element={<CreateRecipePage />} />
      </Routes>
    </div>
  );
};

export default App;
