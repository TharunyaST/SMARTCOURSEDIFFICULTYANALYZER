import React, { useState, useEffect } from 'react';
import { Sparkles, MoonStar } from 'lucide-react';

const ThemeToggle = ({ className = "" }) => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const toggleTheme = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    return (
        <button 
            className={`notification-toggle-btn ${className}`} 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {darkMode ? (
                <span className="sun-spin" style={{ fontSize: '1.2rem', lineHeight: 1, filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.6))', display: 'inline-block' }}>☀️</span>
            ) : (
                <span className="moon-waggle" style={{ fontSize: '1.2rem', lineHeight: 1, filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.6))', display: 'inline-block' }}>🌙</span>
            )}
        </button>
    );
};

export default ThemeToggle;
