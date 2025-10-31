import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700 py-6 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="text-lg font-bold text-[#573a1c] dark:text-amber-200">
              Waggle 🐕
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connecting dog breeders since {new Date().getFullYear()}
            </p>
            <a 
              href="https://www.devonsdigitalsolutions.co.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#8c5628] dark:hover:text-amber-400 transition-colors inline-block mt-1"
            >
              Built by Devon's Digital Solutions
            </a>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link 
              to="/privacy" 
              className="text-gray-600 dark:text-gray-400 hover:text-[#8c5628] dark:hover:text-amber-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="text-gray-600 dark:text-gray-400 hover:text-[#8c5628] dark:hover:text-amber-400 transition-colors"
            >
              Terms of Service
            </Link>
            <a 
              href="https://www.devonsdigitalsolutions.co.uk" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-[#8c5628] dark:hover:text-amber-400 transition-colors"
            >
              Contact Us
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Waggle
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;