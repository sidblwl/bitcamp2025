import React, { useEffect, useRef, useState } from 'react';
import '../App.css';

import WebcamDetector from './WebcamDetector';
import ThemeToggle from './ThemeToggle';
import Top from './Top'

function MainPage() {
  const webcamRef = useRef(null);

  const [theme, setTheme] = useState('light');
  const [studyMode, setStudyMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatHovered, setChatHovered] = useState(false);
  const [dailyTotal, setDailyTotal] = useState(0);
  const chatRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.body.className = saved;
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    let interval;
    if (studyMode && !isPaused) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [studyMode, isPaused]);

  // 🔥 NEW: Poll Flask backend every 3s for pause state
// Polling effect in App.js (partial snippet)
  useEffect(() => {
    const pollPauseState = async () => {
      try {
        const res = await fetch('http://localhost:5001/get-pause-state');
        const data = await res.json();

        // Only update frontend pause state if it differs
        if (data.paused && !isPaused) {
          console.log("📴 Pause triggered by backend!");
          setIsPaused(true);
          setChatMessages(prev => [
            ...prev,
            { from: "system", text: "Caught slacking! Back to work, champ 💪" }
          ]);
        }
        
        if (!data.paused && isPaused && data.pauseReason !== "manual") {
          console.log("▶️ Resume triggered by backend!");
          setIsPaused(false);
          setChatMessages(prev => [
            ...prev,
            { from: "system", text: "Alright, you're back in focus. Let’s get it!" }
          ]);
        }

      } catch (err) {
        console.error('Error polling pause state:', err);
      }
    };

    const intervalId = setInterval(() => {
      if (studyMode) {
        pollPauseState(); // Always poll during study mode
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [studyMode, isPaused]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
  
    // Always scroll to bottom after messages change or after re-hovering
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 0);
  }, [chatMessages, chatHovered]);  

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

  function toggleTheme(){
    if(theme === 'light'){
        setTheme('dark')
    } else{
        setTheme('light')
    }
}

  return (
    <>
      {studyMode && (
        <>
          <div className="timer-control">
            Study Timer: {formatTime()}
            <span
              style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '100px' }}
              onClick={async () => {
                const newPaused = !isPaused;
                setIsPaused(newPaused);

                try {
                  await fetch(`http://localhost:5001/${newPaused ? 'pause-timer' : 'reset-pause-state'}`, {
                    method: 'POST'
                  });
                  console.log(newPaused ? "⏸️ Manually paused" : "▶️ Manually resumed");
                } catch (err) {
                  console.error("❌ Error syncing pause state with backend:", err);
                }
              }}
            >
            </span>
          </div>
          {/* <button className="purple-btn light-mode-btn" onClick={() => {toggleTheme()}}>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button> */}
        </>
      )}

      {studyMode && (
        <>
          <button className="end-btn stickyNotes" onClick={handleEndStudy}>
            End Sesh
          </button>
          <button className="play-btn stickyNotes" onClick={handleEndStudy}>
            Play
          </button>
        </>
      )}

      <div className="container">
        {!studyMode && (
          <Top theme={theme} setTheme={setTheme} dailyTotal={dailyTotal}></Top>
        )}

      <WebcamDetector
        webcamRef={webcamRef}
        isFullscreen={studyMode}
        studyMode={studyMode}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        setChatMessages={setChatMessages}
      />

        {!studyMode && (
          <button className="green-btn ready-btn" onClick={handleStartStudy}>
            Ready to Study?
          </button>
        )}
      </div>
      {studyMode && (
        <div className="chat-box">
          <h3 className="chat-title">📣 Study Chat</h3>
          <div
            className="chat-messages"
            ref={chatRef}
            onMouseEnter={() => setChatHovered(true)}
            onMouseLeave={() => setChatHovered(false)}
          >
            {chatMessages.map((msg, i) => {
              const isFaded = !chatHovered && i < chatMessages.length - 1;
              const sender = msg.from || 'system';

              return (
                <div
                  key={i}
                  className={`chat-message ${sender} ${isFaded ? 'faded' : ''}`}
                >
                  {msg.text}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isPaused && <div className="pause-overlay" />}
    </>
  );
}

export default MainPage;
