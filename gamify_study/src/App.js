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

  // Set theme from local storage on initial render
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.body.className = saved;
  }, []);

  // Increment the timer each second if study mode is active and not paused
  useEffect(() => {
    let interval;
    if (studyMode && !isPaused) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [studyMode, isPaused]);

  // Poll the Flask backend every 3 seconds for pause state updates.
  // This effect checks if an extension-triggered pause has been set on the backend.
  useEffect(() => {
    const pollPauseState = async () => {
      try {
        const res = await fetch('http://localhost:5000/get-pause-state');
        const data = await res.json();

        if (data.paused) {
          console.log("📴 Pause triggered by extension!");
          setIsPaused(true);

          // Reset the backend pause state so that future detections can trigger a new pause
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
          <span>Study Timer: {formatTime()}</span>
          <span
            style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1.3rem', marginLeft: '1rem' }}
            onClick={() => setIsPaused((p) => !p)}
          >
            {isPaused ? '▶' : '||'}
          </span>
        </div>
      )}

      {studyMode && isPaused && (
        <div style={{ color: 'red', margin: '1rem 0' }}>
          Paused due to distraction!
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
