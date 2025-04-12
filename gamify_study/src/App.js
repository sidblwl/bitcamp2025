import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import WebcamDetector from './components/WebcamDetector';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const webcamRef = useRef(null);

  const [theme, setTheme] = useState('dark');
  const [studyMode, setStudyMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.body.className = saved;
  }, []);

  useEffect(() => {
    let interval;
    if (studyMode && !isPaused) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [studyMode, isPaused]);

  const formatTime = () => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartStudy = () => {
    setStudyMode(true);
    setIsPaused(false);
  };

  const handleEndStudy = () => {
    setStudyMode(false);
    setSeconds(0);
    setIsPaused(false);
  };

  return (
    <>
      <ThemeToggle theme={theme} setTheme={setTheme} />

      {studyMode && (
        <div className="timer-control">
          Study Timer: {formatTime()}
          <span
            style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.3rem' }}
            onClick={() => setIsPaused((p) => !p)}
          >
            {isPaused ? '▶' : '||'}
          </span>
        </div>
      )}

      {studyMode && (
        <button className="end-btn" onClick={handleEndStudy}>
          End Study Sesh
        </button>
      )}

      <div className="container">
        <WebcamDetector webcamRef={webcamRef} isFullscreen={studyMode} />

        {!studyMode && (
          <button className="ready-btn" onClick={handleStartStudy}>
            Ready to Study?
          </button>
        )}
      </div>
    </>
  );
}

export default App;
