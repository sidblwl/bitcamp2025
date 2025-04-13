import React from 'react';
import { Link } from 'react-router-dom';

function Top({theme, setTheme, dailyTotal, dailyXP}) {

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

    function toggleTheme(){
        if(theme === 'light'){
            setTheme('dark')
        } else{
            setTheme('light')
        }
    }

  return (
    <>
        <Link to="/dashboard">
        <button className="red-btn dashboard-btn">
            Dashboard
        </button>
        </Link>
        <h1 className={theme === 'light' ? "title" : "title-dark"}>cram.cam</h1>
        <button className="purple-btn light-mode-btn" onClick={() => {toggleTheme()}}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
        <button className="cyan-btn dailyTotal-btn" >
            Daily Total: {formatTimeFromSeconds(dailyTotal)}
        </button>
        <button className="blue-btn totalXP-btn" >
            Total XP: {dailyXP}
        </button>
    </>
  );
}

export default Top;
