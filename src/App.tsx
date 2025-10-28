console.log('App is rendering');

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';
import LoginForm from '@components/LoginForm';
import RegisterForm from '@components/RegisterForm';
import ResetPasswordForm from '@components/ResetPasswordForm';
import Dashboard from '@components/Dashboard';
import RequireAuth from '@/routes/RequireAuth';
import RedirectIfAuth from '@/routes/RedirectIfAuth';
import DogSearch from '@components/DogSearch';
import DogProfile from '@/pages/DogProfile';
import AddDog from '@pages/AddDog';
import AddMatch from '@pages/AddMatch';
import MatchesList from '@pages/MatchesList';
import { Toaster } from 'react-hot-toast';
import '@styles/globals.css';

const App: React.FC = () => (
  <div className="min-h-screen w-full bg-cover bg-center bg-fixed bg-[url('/waggle-background.png')] dark:bg-zinc-900 flex flex-col">
    <BrowserRouter>
      <Navbar />
      <main className="flex-1 flex justify-center items-center w-full px-4">
        <Routes>
          <Route path="/" element={<RedirectIfAuth><LoginForm /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><RegisterForm /></RedirectIfAuth>} />
          <Route path="/reset-password" element={<RedirectIfAuth><ResetPasswordForm /></RedirectIfAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/dogs" element={<RequireAuth><DogSearch /></RequireAuth>} />
          <Route path="/add-dog" element={<RequireAuth><AddDog /></RequireAuth>} />
          <Route path="/add-match" element={<RequireAuth><AddMatch /></RequireAuth>} />
          <Route path="/matches" element={<RequireAuth><MatchesList /></RequireAuth>} />
          <Route path="/dogs/:id" element={<RequireAuth><DogProfile /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/dogs" />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-center" />
    </BrowserRouter>
  </div>
);

export default App;
