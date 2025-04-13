import React, { useState, useEffect} from 'react';
import { Link, useLocation} from 'react-router-dom';
import '../App.css'; // assuming shared styles live here
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function Dashboard() {
  const location = useLocation();
  const { dailyTotal = 0, dailyXP = 0} = location.state || {};
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [overallTime, setOverallTime] = useState(0); // in seconds

  // Mock data: 7 days of study time in hours
  const weeklyData = [1, 2, 1.5, 3, 0, 2.5, 4];

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filterImages = [
    { name: "Santa Hat", src: "/filters/santahat.png", requiredXP: 100 },
    { name: "Sunglasses", src: "filters/sunglasses.png", requiredXP: 150 },
    { name: "Diamond Helmet", src: "/filters/helmet.png", requiredXP: 200 },
    { name: "Clown Nose", src: "/filters/clownNose.png", requiredXP: 250 },
    { name: "Gojo Glasses", src: "/filters/gojoglasses.png", requiredXP: 200 },
    { name: "Top Hat", src: "/filters/hat.png", requiredXP: 250 },
  ];

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <div className="dashboard-top">
        <Link to="/" className=""><button className="blue-btn dashboard-btn">Home
          </button></Link>
        <h1 className="dashboard-title">Dashboard</h1>
        <button onClick={toggleTheme} className="purple-btn light-mode-btn">
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>

      {/* Totals + Graph */}
      <div className="dashboard-main">
        <div className="dashboard-stats">
          <h1 className="big-header">Daily Total: {formatTime(dailyTotal)}</h1>
          <p>Overall Total: {formatTime(overallTime)}</p>
        </div>

        <div className="dashboard-graph">
          <h2>Study Time This Week</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { day: 'M', hours: 1 },
              { day: 'T', hours: 2 },
              { day: 'W', hours: 1.5 },
              { day: 'Th', hours: 3 },
              { day: 'F', hours: 0 },
              { day: 'S', hours: 2.5 },
              { day: 'Su', hours: 4 }
            ]} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="hours" fill="#63b3ed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter Gallery */}
      <div className="dashboard-gallery">
        <h2>Unlocked Filters</h2>
        <div className="filter-gallery">
          {filterImages.map((filter, idx) => (
            <div className="filter-item" key={idx}>
              <img src={filter.src} alt={filter.name} />
              <p>{filter.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
