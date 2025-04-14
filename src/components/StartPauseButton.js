import React from 'react';

function StartPauseButton({ isRunning, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '12px 24px',
        fontSize: '1.1rem',
        borderRadius: '8px',
        backgroundColor: isRunning ? '#f87171' : '#4ade80',
        color: '#fff',
        border: 'none',
        margin: '1rem 0',
        cursor: 'pointer',
      }}
    >
      {isRunning ? 'Pause ⏸️' : 'Start ▶️'}
    </button>
  );
}

export default StartPauseButton;
