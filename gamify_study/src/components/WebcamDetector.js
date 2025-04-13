import React, { useEffect } from 'react';
import Webcam from 'react-webcam';

function WebcamDetector({ webcamRef, isFullscreen, setIsPaused, setChatMessages, studyMode, isPaused, pauseReason}) {
  useEffect(() => {
    const sendWebcamImage = async () => {
      if (!webcamRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      try {
        const res = await fetch("http://localhost:5001/cv-detect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: imageSrc }),
        });

        const data = await res.json();

        // For auto-resume, only clear pause if the current pause reason is auto
        if (!data.isPaused && isPaused && data.pauseReason !== "user" && data.pauseReason !== "site") {
          setIsPaused(false);
          console.log("▶️ Face detected again, auto-resumed");
          setChatMessages(prev => [
            ...prev,
            { from: "system", text: "We missed you! Let’s pick up where you left off."}
          ]);
        }

        // If auto pause is triggered
        if (data.isPaused && !isPaused && data.pauseReason === "face") {
          setIsPaused(true);
          console.log("📴 Auto pause triggered by CV detection");
          setChatMessages(prev => [
            ...prev,
            { from: "system", text: "Where’d you go? Your goals are waiting 🎯" }
          ]);
        }
        // If manual pause is active, let it stay paused (don’t auto-resume).
      } catch (err) {
        console.error("❌ Error sending webcam image:", err);
      }
    };

    const interval = setInterval(() => {
      if (studyMode) sendWebcamImage();
    }, 3000);

    return () => clearInterval(interval);
  }, [webcamRef, studyMode, isPaused, setIsPaused, setChatMessages]);

  return (
    <div className={`webcam ${isFullscreen ? 'fullscreen' : 'default'}`}>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        mirrored={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)'
        }}
      />
    </div>
  );
}

export default WebcamDetector;
