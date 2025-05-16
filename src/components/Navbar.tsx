// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-title">Welcome to Waggle</span>
      <Link className='navbar-home' to="/dashboard">
       Home
      </Link>
    </nav>
  );
}