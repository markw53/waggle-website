// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ROUTES } from '@/config/routes';
import 'leaflet/dist/leaflet.css';
import CookieConsentBanner from './components/CookieConsentBanner';

// Layout Components
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import ResponsiveIndicator from '@/components/ResponsiveIndicator';

// Auth Components
import LoginForm from '@components/LoginForm';
import RegisterForm from '@components/RegisterForm';
import ResetPasswordForm from '@components/ResetPasswordForm';
import VerifyEmail from './pages/VerifyEmail';

// Route Guards
import RequireAuth from '@/routes/RequireAuth';
import RedirectIfAuth from '@/routes/RedirectIfAuth';

// Main Pages
import Dashboard from '@components/Dashboard';
import Profile from './pages/Profile';
import UserProfilePage from '@/pages/UserProfilePage';
import GettingStarted from '@/pages/GettingStarted';
import NotFound from './pages/NotFound';
import BreedingCalendarPage from '@/pages/BreedingCalendarPage';

// Dog Pages
import DogSearch from '@/pages/DogSearch';
import DogProfile from '@/pages/DogProfile';
import AddDog from '@pages/AddDog';
import MyDogs from './pages/MyDogs';
import DogsMapPage from './pages/DogsMapPage';
import EditDog from '@/pages/EditDog';

// Breed Pages
import BreedDirectory from './pages/BreedDirectory';
import BreedProfile from './pages/BreedProfile';

// Match Pages
import AddMatch from '@pages/AddMatch';
import MatchesList from '@pages/MatchesList';

// Messaging
import Messages from '@/pages/Messages';
import ConversationPage from '@/pages/Conversation';

// Analytics & Admin
import Analytics from '@/pages/Analytics';
import AdminDashboard from '@/pages/AdminDashboard';

// Legal
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import { ThemeDebug } from './components/ThemeDebug';

const App: React.FC = () => (
  <div className="min-h-screen w-full bg-cover bg-center bg-fixed bg-[url('/waggle-background.png')] dark:bg-zinc-900 flex flex-col">
    <BrowserRouter>
      <Navbar />
      <EmailVerificationBanner />
      
      <main className="flex-1 flex justify-center items-center w-full px-4">
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
          <Route path={ROUTES.GETTING_STARTED} element={<GettingStarted />} />
          <Route path={ROUTES.PRIVACY} element={<PrivacyPolicy />} />
          <Route path={ROUTES.TERMS} element={<TermsOfService />} />
          <Route path={ROUTES.USER_PROFILE} element={<UserProfilePage />} />

          {/* ==================== AUTH ROUTES (Redirect if logged in) ==================== */}
          <Route path={ROUTES.HOME} element={<RedirectIfAuth><LoginForm /></RedirectIfAuth>} />
          <Route path={ROUTES.REGISTER} element={<RedirectIfAuth><RegisterForm /></RedirectIfAuth>} />
          <Route path={ROUTES.RESET_PASSWORD} element={<RedirectIfAuth><ResetPasswordForm /></RedirectIfAuth>} />

          {/* ==================== PROTECTED ROUTES (Require login) ==================== */}
          {/* Dashboard & Profile */}
          <Route path={ROUTES.DASHBOARD} element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path={ROUTES.PROFILE} element={<RequireAuth><Profile /></RequireAuth>} />

          {/* Dog Management */}
          <Route path={ROUTES.DOGS} element={<RequireAuth><DogSearch /></RequireAuth>} />
          <Route path={ROUTES.DOG_PROFILE} element={<RequireAuth><DogProfile /></RequireAuth>} />
          <Route path={ROUTES.ADD_DOG} element={<RequireAuth><AddDog /></RequireAuth>} />
          <Route path={ROUTES.MY_DOGS} element={<RequireAuth><MyDogs /></RequireAuth>} />
          <Route path={ROUTES.DOGS_MAP} element={<RequireAuth><DogsMapPage /></RequireAuth>} />
          <Route path={ROUTES.EDIT_DOG} element={<RequireAuth><EditDog /></RequireAuth>} />

          {/* Breed Information */}
          <Route path={ROUTES.BREEDS} element={<RequireAuth><BreedDirectory /></RequireAuth>} />
          <Route path={ROUTES.BREED_PROFILE} element={<RequireAuth><BreedProfile /></RequireAuth>} />

          {/* Breeding Calendar */}
          <Route path={ROUTES.BREEDING_CALENDAR} element={<RequireAuth><BreedingCalendarPage /></RequireAuth>} />
          
          {/* Match Management */}
          <Route path={ROUTES.ADD_MATCH} element={<RequireAuth><AddMatch /></RequireAuth>} />
          <Route path={ROUTES.MATCHES} element={<RequireAuth><MatchesList /></RequireAuth>} />

          {/* Messaging */}
          <Route path={ROUTES.MESSAGES} element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path={ROUTES.CONVERSATION} element={<RequireAuth><ConversationPage /></RequireAuth>} />

          {/* Analytics */}
          <Route path={ROUTES.ANALYTICS} element={<RequireAuth><Analytics /></RequireAuth>} />

          {/* ==================== ADMIN ROUTES ==================== */}
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<RequireAuth><AdminDashboard /></RequireAuth>} />

          {/* ==================== 404 FALLBACK ==================== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ThemeDebug />
      </main>

      <Footer />
      <Toaster position="top-center" />
    </BrowserRouter>
    <ResponsiveIndicator />
    <CookieConsentBanner />
  </div>
);

export default App;