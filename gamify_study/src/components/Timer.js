import React from 'react';

function Timer({ seconds }) {
  const formatTime = () => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="card">
      <h2>Study Time</h2>
      <p style={{ fontSize: '2rem' }}>{formatTime()}</p>
    </div>
  );
}

export default Timer;
