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

  // 🔥 NEW: Poll Flask backend every 3s for pause state triggered by Chrome extension
  useEffect(() => {
    const pollPauseState = async () => {
      try {
        const res = await fetch('http://localhost:5000/get-pause-state');
        const data = await res.json();

        if (data.paused) {
          console.log("📴 Pause triggered by extension!");
          setIsPaused(true);

          // Reset pause state on backend
          await fetch('http://localhost:5000/reset-pause-state', {
            method: 'POST'
          });
        }
      } catch (err) {
        console.error('Error polling pause state:', err);
      }
    };

    const intervalId = setInterval(() => {
      if (studyMode && !isPaused) {
        pollPauseState();
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [studyMode, isPaused]); // 🔥 NEW

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
