import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';
import LoginForm from '@components/LoginForm';
import RegisterForm from '@components/RegisterForm';
import ResetPasswordForm from '@components/ResetPasswordForm';
import EmailVerificationBanner from '@/components/EmailVerificationBanner'; 
import Dashboard from '@components/Dashboard';
import RequireAuth from '@/routes/RequireAuth';
import RedirectIfAuth from '@/routes/RedirectIfAuth';
import DogSearch from '@components/DogSearch';
import DogProfile from '@/pages/DogProfile';
import Profile from './pages/Profile';
import UserProfilePage from '@/pages/UserProfile';
import AddDog from '@pages/AddDog';
import AddMatch from '@pages/AddMatch';
import MatchesList from '@pages/MatchesList';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';
import VerifyEmail from './pages/VerifyEmail';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import ResponsiveIndicator from '@/components/ResponsiveIndicator';
import Messages from '@/pages/Messages';
import ConversationPage from '@/pages/Conversation';

const App: React.FC = () => (
  <div className="min-h-screen w-full bg-cover bg-center bg-fixed bg-[url('/waggle-background.png')] dark:bg-zinc-900 flex flex-col">
    <BrowserRouter>
      <Navbar />
      <EmailVerificationBanner />
      <main className="flex-1 flex justify-center items-center w-full px-4">
        <Routes>
          <Route path="/" element={<RedirectIfAuth><LoginForm /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><RegisterForm /></RedirectIfAuth>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<RedirectIfAuth><ResetPasswordForm /></RedirectIfAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/dogs" element={<RequireAuth><DogSearch /></RequireAuth>} />
          <Route path="/add-dog" element={<RequireAuth><AddDog /></RequireAuth>} />
          <Route path="/add-match" element={<RequireAuth><AddMatch /></RequireAuth>} />
          <Route path="/matches" element={<RequireAuth><MatchesList /></RequireAuth>} />
          <Route path="/dogs/:id" element={<RequireAuth><DogProfile /></RequireAuth>} />
          <Route path="/users/:id" element={<RequireAuth><UserProfilePage /></RequireAuth>} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<ConversationPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-center" />
    </BrowserRouter>
    <ResponsiveIndicator />
  </div>
);

export default App;
