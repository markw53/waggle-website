import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import Dashboard from './components/Dashboard';
import RequireAuth from './routes/RequireAuth';
import RedirectIfAuth from './routes/RedirectIfAuth';
import DogSearch from './components/DogSearch';
import { Toaster } from 'react-hot-toast';
import './App.css';

const App: React.FC = () => (
  <div className="main-bg">
    <BrowserRouter>
      <Navbar />
      <div className="center-content">
        <Routes>
          <Route
            path="/"
            element={
              <RedirectIfAuth>
                <LoginForm />
              </RedirectIfAuth>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfAuth>
                <RegisterForm />
              </RedirectIfAuth>
            }
          />
          <Route
            path="/reset-password"
            element={
              <RedirectIfAuth>
                <ResetPasswordForm />
              </RedirectIfAuth>
            }
          />

          <Route
            path="/dogs"
            element={
              <RequireAuth>
                <DogSearch />
              </RequireAuth>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />

          {/* Optionally, redirect /dashboard and / to /dogs if logged in */}
          <Route path="*" element={<Navigate to="/dogs" />} />
        </Routes>
      </div>
      <Footer />
      <Toaster position="top-center" />
    </BrowserRouter>
  </div>
);

export default App;