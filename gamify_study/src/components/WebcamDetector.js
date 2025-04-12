import React from 'react';
import Webcam from 'react-webcam';

function WebcamDetector({ webcamRef, isFullscreen }) {
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
          transform: 'scaleX(-1)',
        }}
      />
    </div>
  );
}

export default WebcamDetector;
