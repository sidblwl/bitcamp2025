import React from 'react';

function XPDisplay({ xp }) {
  return (
    <div className="card">
      <h2>XP Earned</h2>
      <p style={{ fontSize: '2rem', color: '#4ade80' }}>{xp} XP</p>
    </div>
  );
}

export default XPDisplay;
