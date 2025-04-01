import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const PassportPhotoApp = () => {
  const webcamRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      setIsModelLoaded(true);
    };
    loadModels();
  }, []);

  const handleCapture = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    processImage(imageSrc);
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      processImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageSrc) => {
    setImageUrl(imageSrc);
    setCroppedImage(null);

    const img = document.createElement("img");
    img.src = imageSrc;
    img.onload = async () => {
      const detections = await faceapi.detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();

      setDetections(detections);

      if (detections.length > 0) {
        const cropped = cropFace(img, detections[0]);
        setCroppedImage(cropped);
      }
    };
  };

  const cropFace = (img, detection) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const { x, y, width, height } = detection.detection.box;

    // ✅ Add dynamic padding and ensure head is not cut off
    const paddingX = width * 0.5; // Add space on sides
    const paddingTop = height * 0.8; // Add more space above the head
    const paddingBottom = height * 1.5; // Add space below the chin for better framing

    // Ensure we don't crop too much from the edges
    const cropX = Math.max(0, x - paddingX);
    const cropY = Math.max(0, y - paddingTop);
    const cropWidth = Math.min(img.width, width + 2 * paddingX);
    const cropHeight = Math.min(img.height, height + paddingTop + paddingBottom);

    // ✅ Correct Aspect Ratio: 1.5 x 1.9 inches
    const targetWidth = 144; // 1.5 inches at 96 DPI
    const targetHeight = 182; // 1.9 inches at 96 DPI

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // ✅ Zoom in or out to fill the space without cutting the head
    const scale = Math.max(targetWidth / cropWidth, targetHeight / cropHeight);
    const scaledWidth = cropWidth * scale;
    const scaledHeight = cropHeight * scale;

    // Make sure we don't scale too much and cut off important parts
    const offsetX = Math.max(0, (targetWidth - scaledWidth) / 2);
    const offsetY = Math.max(0, (targetHeight - scaledHeight) / 2);

    ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, offsetX, offsetY, scaledWidth, scaledHeight);

    return canvas.toDataURL("image/jpeg");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>📸 Passport Photo Cutter</h1>

      {isModelLoaded ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            style={{ border: "2px solid black", borderRadius: "10px" }}
          />
          <br />
          <button onClick={handleCapture} style={{ padding: "10px", marginTop: "10px", cursor: "pointer" }}>
            Capture from Webcam
          </button>

          <br />
          <h3>OR</h3>

          <input type="file" accept="image/*" onChange={handleUpload} style={{ marginBottom: "10px" }} />

          {imageUrl && (
            <div>
              <h3>✅ Detected Face</h3>
              <img src={imageUrl} alt="Selected" width="50%" style={{ border: "2px solid blue" }} />
            </div>
          )}

          {croppedImage && (
            <div>
              <h3>🖼️ Cropped Passport Size Image</h3>
              <a href={croppedImage} download="passport-photo.jpg">
                <img
                  src={croppedImage}
                  alt="Cropped"
                  style={{ border: "2px solid green" }}
                />
              </a>
              <br />
              <p>⬇️ Click the image to download as JPG</p>
            </div>
          )}
        </>
      ) : (
        <p>⏳ Loading models...</p>
      )}
    </div>
  );
};

export default PassportPhotoApp;
