import React, { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';

function WebcamDetector({ webcamRef, setIsStudying }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      const screenshot = webcamRef.current?.getScreenshot();

      if (!screenshot) return;

      try {
        const res = await fetch('http://localhost:5000/cv-detect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: screenshot }), // base64 JPEG
        });

        const data = await res.json();
        setIsStudying(data.isStudying);
      } catch (err) {
        console.error('CV API error:', err);
      }
    }, 3000); // check every 3 seconds

    return () => clearInterval(interval);
  }, [webcamRef, setIsStudying]);

  return (
    <Webcam
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      mirrored={false}
      style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
    />
  );
}

export default WebcamDetector;
