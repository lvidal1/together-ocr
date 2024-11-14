// src/Camera.tsx
import React, { useRef, useState , useCallback} from "react";
import Webcam from "react-webcam";
import Markdown from 'react-markdown'

const FACING_MODE_USER = "user";
const FACING_MODE_ENVIRONMENT = "environment";

const videoConstraints = {
    facingMode: FACING_MODE_USER
  };
  

const Camera: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = React.useState(FACING_MODE_USER);

  const [results, setResults] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwitch = React.useCallback(() => {
    setFacingMode(
      prevState =>
        prevState === FACING_MODE_USER
          ? FACING_MODE_ENVIRONMENT
          : FACING_MODE_USER
    );
  }, []);

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc); // Set image as a blob URL
    }
  };

  const analyze = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    if (!image) return;

    const DOMAIN = import.meta.env.VITE_SERVICE_API_URL;

    try {
      const response = await fetch(DOMAIN +"/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();
      setResults(data.markdown)
    } catch (error) {
        setError(DOMAIN + ": Failed to send image:" + error)
      console.error("Failed to send image:", error);
    } finally {
      setLoading(false)
    }
    
  },[image])

  const reset = ()=>{
    setResults(null)
    setImage(null)
    setError(null)
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Camera App</h2>

      <div>
        <button onClick={handleSwitch}>Switch</button>
      </div>
      <hr />
      <div style={{ display: "flex",  justifyContent: "center"}}>
      {image && !loading &&<div>
        <button onClick={analyze} disabled={loading}>Analyze</button>
      </div>}
      {loading && <h4>Analyzing...</h4>}
      {image && <div>
        <button onClick={reset}>Reset</button>
      </div>}
      </div>
      
      {!image && <div style={{ display: "flex", alignItems: "center", justifyContent: "center"}}>
        <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={350}
            height={500}
            videoConstraints={{
                ...videoConstraints,
                facingMode
            }}
        />
      </div>}
      {image && (
        <div>
          <h3>Captured Image:</h3>
          <img src={image} alt="Captured" />
          <br />
          Path for API request: 
          <input type="text"  value={image} />
        </div>
      )}

        {!image && <div>
        <button onClick={captureImage}>Take Picture</button>
      </div>}

    {results && (
        <div>
          <h3>Results from Image:</h3>
          <div style={{backgroundColor: "white", padding:"1rem", color:"#222", textAlign:"left"}}>
          <Markdown>{results}</Markdown>
          </div>
        </div>
      )}
      {error && <p style={{color:"red"}}>{error}</p>}
    </div>
  );
};

export default Camera;
