import React, { useEffect } from 'react';
import Webcam from 'react-webcam';

function WebcamDetector({ webcamRef, isFullscreen, setIsPaused, setChatMessages, studyMode, isPaused }) {
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

        if (data.isPaused && !isPaused) {
          setIsPaused(true);
          console.log("📴 Pause triggered by CV detection");

          setChatMessages(prev => [
            ...prev,
            { from: "system", text: "Caught slacking! Focus up 🧐" }
          ]);
        }

        if (!data.isPaused && isPaused) {
          setIsPaused(false);
          console.log("▶️ Back in the zone");

          setChatMessages(prev => [
            ...prev,
            { from: "system", text: "You’re locked in again. Keep going" }
          ]);
        }
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
