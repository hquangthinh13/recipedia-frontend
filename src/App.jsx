import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import HomePage from './pages/HomePage';

import FeedPage from './pages/FeedPage';
import CreateRecipePage from './pages/CreateRecipePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CreateRemixPage from './pages/CreateRemixPage';

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

import ScrollToTopButton from '@/components/scroll-to-top-button';
import Navbar from '@/components/navbar';
import { MusicPlayerHorizontal } from './components/music-player-horizontal';
const App = () => {
  const location = useLocation();
  const path = location.pathname;
  const hideNavbar =
    path === '/login' ||
    path === '/signup' ||
    path === '/change-password' ||
    path === '/verify-reset-code' ||
    path === '/reset-password' ||
    path.startsWith('/recipes/') ||
    path.startsWith('/verify');

  const hideMP =
    path === '/login' ||
    path === '/signup' ||
    path === '/change-password' ||
    path === '/verify-reset-code' ||
    path === '/reset-password' ||
    path.startsWith('/verify');
  return (
    <div>
      {!hideNavbar && <Navbar />}
      {!hideMP && <MusicPlayerHorizontal />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipes" element={<FeedPage />} />
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

      <ScrollToTopButton />
    </div>
  );
};

export default App;
