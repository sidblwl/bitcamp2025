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
  const [pauseReason, setPauseReason] = useState("user");
  const [seconds, setSeconds] = useState(0);
  const [xp, setXP] = useState(0);
  const [distracted, setDistracted] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatHovered, setChatHovered] = useState(false);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [dailyXP, setDailyXP] = useState(0);
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

    if (studyMode) {
      if (!isPaused) {
        interval = setInterval(() => {
          setSeconds((s) => s + 1);
        }, 1000);
      } else {
        interval = setInterval(() => {
          if (pauseReason !== "user") {
            setDistracted((d) => d + 1);
          }
        }, 1000);
    }}

    return () => clearInterval(interval);
  }, [studyMode, isPaused]); 

  useEffect(() => {
    if (studyMode && !isPaused && seconds > 0 && seconds % 60 === 0) {
      setXP((xp) => xp + 10);
    }
  }, [seconds, studyMode, isPaused]);

  useEffect(() => {
    if (studyMode && isPaused && distracted > 0 && distracted % 60 === 0) {
      setXP((xp) => Math.max(0, xp - 15));
    }
  }, [distracted, studyMode, isPaused]);

  const pauseMessages = {"user": "You paused the timer, hopefully a well earned break",
    "site": "Caught you on a distracting site! Back to work, you got this!",
    "face": "Where’d you go? Your goals are waiting 🎯"
  }

  const resumeMessages = {"user": "Feeling recharged? Let’s keep the momentum going!",
    "site": "Glad you made it back—now let’s stay locked in 🔒",
    "face": "We missed you! Let’s pick up where you left off."
  }

  // 🔥 NEW: Poll Flask backend every 3s for pause state
// Polling effect in App.js (partial snippet)
  useEffect(() => {
    const pollPauseState = async () => {
      console.log("checking pause state")
      try {
        const res = await fetch('http://localhost:5001/get-pause-state');
        const data = await res.json();

        console.log(data)
        console.log("data.paused: " + data.paused)
        console.log("data.pause_reason: " + data.pause_reason)

        setPauseReason(data.pause_reason)

        console.log("msgString: " + pauseMessages[data.pause_reason])

        // Only update frontend pause state if it differs
        if (data.paused && !isPaused && data.pause_reason == "site") {
          console.log("📴 Pause triggered by backend!");
          setIsPaused(true);
          let siteName = data.site
          setChatMessages(prev => [
            ...prev,
            { from: "system", text: siteName + " is tempting, but your goals are more important 💪 You’ve got this! Block it here if it helps: " + data.url}
          ]);
        }
        
        if (!data.paused && isPaused && data.pause_reason == "site") {
          console.log("▶️ Resume triggered by backend!");
          setIsPaused(false);
          setChatMessages(prev => [
            ...prev,
            { from: "system", text: resumeMessages[data.pause_reason]}
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
    const m = String(Math.floor(Math.floor(seconds) / 60)).padStart(2, '0');
    const s = String(Math.floor(seconds) % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatDistractedTime = () => {
    const m = String(Math.floor(Math.floor(distracted) / 60)).padStart(2, '0');
    const s = String(Math.floor(distracted) % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartStudy = () => {
    setStudyMode(true);
    setIsPaused(false);
  };

  // const handleEndStudy = () => {
  //   setStudyMode(false);
  //   setSeconds(0);
  //   setIsPaused(false);
  // };

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
          </div>
          <div className="subInfo">
            <h1>Distracted: {formatDistractedTime()}</h1>
            <h1>XP: {Math.floor(xp)}</h1>
          </div>
        </>
      )}

      {studyMode && (
        <>
          <button className="end-btn stickyNotes" onClick={async () => {
                setStudyMode(false);
                setDailyTotal(dailyTotal + Math.floor(seconds))
                setDailyXP(dailyXP + Math.floor(xp));
                setSeconds(0);
                setXP(0);
                setIsPaused(false);

                try {
                  await fetch("http://localhost:5001/reset-pause-state", {
                    method: 'POST'
                  });
                } catch (err) {
                  console.error("❌ Error syncing pause state with backend:", err);
                }
              }}>
            End Sesh
          </button>
          <button className="play-btn stickyNotes" onClick={async () => {
                const newPaused = !isPaused;
                setIsPaused(newPaused);
                setPauseReason("user")

                try {
                  await fetch(`http://localhost:5001/${newPaused ? 'pause-timer' : 'reset-pause-state'}`, {
                    method: 'POST'
                  });
                  console.log(newPaused ? "⏸️ Manually paused" : "▶️ Manually resumed");
                } catch (err) {
                  console.error("❌ Error syncing pause state with backend:", err);
                }
              }}>
            {isPaused ? '▶' : '| |'}
          </button>
        </>
      )}

      <div className="container">
        {!studyMode && (
          <Top theme={theme} setTheme={setTheme} dailyTotal={dailyTotal} dailyXP={dailyXP}></Top>
        )}

      <WebcamDetector
        webcamRef={webcamRef}
        isFullscreen={studyMode}
        studyMode={studyMode}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        setChatMessages={setChatMessages}
        pauseMessages={pauseMessages}
        pauseReason={pauseReason}
      />

        {!studyMode && (
          <button className="green-btn ready-btn" onClick={async () => {
            setStudyMode(true);
            setIsPaused(false);
            try {
              await fetch("http://localhost:5001/reset-pause-state", {
                method: 'POST'
              });
              console.log("reset backend and started study mode");
            } catch (err) {
              console.error("❌ Error syncing pause state with backend:", err);
            }
          }}>
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

              return (
                <div
                  key={i}
                  className={`chat-message ${isFaded ? 'faded' : ''}`}
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
