import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const WIDTH = 144; // 1.5 inches * 96 DPI
const HEIGHT = 182; // 1.9 inches * 96 DPI

const CameraCapture = () => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);

  const capturePhoto = () => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot({ width: WIDTH, height: HEIGHT });
      setImageSrc(image);
    }
  };

  return (
    <div className="container">
      <div className="camera-container">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/png"
          videoConstraints={{ width: WIDTH, height: HEIGHT }}
          className="camera-preview"
        />
        {imageSrc && (
          <img src={imageSrc} alt="Captured" className="captured-image" />
        )}
      </div>
      <button onClick={capturePhoto} className="capture-button">Take Photo</button>
      {imageSrc && (
        <a href={imageSrc} download="captured-image.png" className="download-button">Download</a>
      )}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
        }
        .camera-container {
          display: flex;
          border: 2px solid black;
        }
        .camera-preview, .captured-image {
          width: ${WIDTH}px;
          height: ${HEIGHT}px;
          object-fit: cover;
        }
        .capture-button, .download-button {
          margin-top: 10px;
          padding: 8px 12px;
          background-color: blue;
          color: white;
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }
        .capture-button:hover, .download-button:hover {
          background-color: darkblue;
        }
      `}</style>
    </div>
  );
};

export default CameraCapture;
