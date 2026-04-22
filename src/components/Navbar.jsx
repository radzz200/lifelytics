import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-sm border-b border-border-light/10 dark:border-border-dark/10 px-4 py-3 flex justify-between items-center transition-colors duration-300">
      {/* Logo at extreme left */}
      <div className="cursor-pointer" onClick={() => navigate('/')}>
        <Logo />
      </div>

      <div className="flex items-center gap-6">
        {/* Navigation Links (optional, adding for usability) */}
        {location.pathname !== '/' && (
          <button 
            onClick={() => navigate('/')}
            className="text-base font-black text-slate-900 dark:text-gray-200 hover:text-teal transition-colors uppercase tracking-wider"
          >
            Home
          </button>
        )}
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-background-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:border-teal transition-all duration-300"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
