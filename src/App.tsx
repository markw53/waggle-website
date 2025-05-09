// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import './App.css';

const App: React.FC = () => (
  <div className="main-bg">
    <BrowserRouter>
      <Navbar />
      <div className="center-content">
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/" element={<LoginForm />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  </div>
);

export default App;