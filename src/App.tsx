// src/App.jsx
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="main-bg">
      <Navbar />
      <div className="center-content">
        <LoginForm />
      </div>
      <Footer />
    </div>
  );
}

export default App;