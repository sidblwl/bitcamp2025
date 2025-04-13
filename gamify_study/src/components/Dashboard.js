import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Dashboard = () => {

  const [theme, setTheme] = useState('dark');
  const [dailyTotal, setDailyTotal] = useState(0);

  function toggleTheme(){
    if(theme === 'light'){
        setTheme('dark')
    } else{
        setTheme('light')
    }
  }

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
      <Link to="/">
      <button className="red-btn dashboard-btn">
          Home
      </button>
      </Link>
      <h1 className="title">dashboard</h1>
      <button className="purple-btn light-mode-btn" onClick={() => {toggleTheme()}}>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>
      <button className="cyan-btn dailyTotal-btn" >
          Daily Total: {formatTimeFromSeconds(dailyTotal)}
      </button>
      <button className="blue-btn totalXP-btn" >
          Daily Total: {formatTimeFromSeconds(dailyTotal)}
      </button>
    </>
  );
};

export default Dashboard;