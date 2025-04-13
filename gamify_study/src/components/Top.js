import React from 'react';
import { Link } from 'react-router-dom';

function Top({theme, toggleTheme, dailyTotal}) {

    function formatTimeFromSeconds(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return [
            String(hours).padStart(2, '0'),
            String(minutes).padStart(2, '0'),
            String(seconds).padStart(2, '0')
        ].join(':');
    }

  return (
    <>
        <Link to="/dashboard">
        <button className="dashboard-btn">
            Dashboard
        </button>
        </Link>
        <h1 className="title">Stay Focused</h1>
        <button className="dailyTotal" onClick={toggleTheme}>
            Daily Total: {formatTimeFromSeconds(dailyTotal)}
        </button>
        <button className="light-mode-btn" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
    </>
  );
}

export default Top;
