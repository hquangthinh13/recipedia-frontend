import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';

import CreateRecipePage from './pages/CreateRecipePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CreateRemixPage from '@/pages/CreateRemixPage';

import AvatarCustomizerPage from './pages/AvatarCustomizerPage';
import ProfilePage from './pages/ProfilePage';
import UserDashboard from './pages/UserDashboard';

import LogInPage from './pages/authentication/LogInPage';
import SignUpPage from './pages/authentication/SignUpPage';
import EmailVerificationPage from './pages/authentication/EmailVerificationPage';
import VerifyCodePage from './pages/authentication/VerifyCodePage';
import VerifyResetCodePage from './pages/authentication/VerifyResetCodePage';
import ForgotPasswordPage from './pages/authentication/ForgotPasswordPage';
import NewPasswordPage from './pages/authentication/NewPasswordPage';
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/recipes/:id/remix" element={<CreateRemixPage />} />

        <Route path="/login" element={<LogInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/create" element={<CreateRecipePage />} />
        <Route path="/verify/:token" element={<EmailVerificationPage />} />
        <Route path="/change-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-reset-code" element={<VerifyResetCodePage />} />
        <Route path="/reset-password" element={<NewPasswordPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/customize-avatar" element={<AvatarCustomizerPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/analytics" element={<UserDashboard />} />
      </Routes>
    </div>
  );
};

export default App;
