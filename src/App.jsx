import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
import CreateRecipePage from "./pages/CreateRecipePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import VerifyCodePage from "./pages/VerifyCodePage";
import VerifyResetCodePage from "./pages/VerifyResetCodePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NewPasswordPage from "./pages/NewPasswordPage";
import AvatarCustomizerPage from "./pages/AvatarCustomizerPage";
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/create" element={<CreateRecipePage />} />
        <Route path="/verify/:token" element={<EmailVerificationPage />} />
        {/* <Route path="/verify-info" element={<VerifyInfoPage />} /> */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-reset-code" element={<VerifyResetCodePage />} />
        <Route path="/reset-password" element={<NewPasswordPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/customize-avatar" element={<AvatarCustomizerPage />} />
      </Routes>
    </div>
  );
};

export default App;
