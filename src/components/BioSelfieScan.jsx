import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BioSelfieScan({ onScanComplete, onCancel }) {
  const videoRef = useRef();
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoading(false);
        startVideo();
      } catch (err) {
        console.error("Failed to load face-api models:", err);
        setError("Could not load AI models. Please check your connection.");
      }
    };
    loadModels();

    return () => {
      stopVideo();
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Camera access denied. Please enable camera permissions.");
      });
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleScan = async () => {
    if (!videoRef.current) return;
    setIsScanning(true);
    
    try {
      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withAgeAndGender();
      
      if (detections) {
        const age = Math.round(detections.age);
        setResult({ age, gender: detections.gender });
        // Give a brief delay for visual effect
        setTimeout(() => {
          onScanComplete(age);
        }, 1500);
      } else {
        setError("No face detected. Please ensure your face is clearly visible.");
        setIsScanning(false);
      }
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Try again.");
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/90 backdrop-blur-md p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-md w-full p-8 flex flex-col items-center text-center"
      >
        <h2 className="text-2xl font-display font-bold mb-2">AI Bio-Selfie Scan</h2>
        <p className="text-gray-400 text-sm mb-6">Analyzing facial biomarkers to estimate your biological age.</p>

        <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden mb-6 border-2 border-border shadow-2xl">
          {isModelLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-teal">
              <Loader2 className="w-10 h-10 animate-spin mb-2" />
              <p className="text-xs font-mono">Initializing Neural Models...</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover grayscale brightness-110 contrast-125"
            />
          )}

          {isScanning && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <motion.div 
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-teal shadow-[0_0_15px_rgba(0,245,212,0.8)] z-20"
              />
              <div className="absolute inset-0 bg-teal/10 animate-pulse" />
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-teal/20 backdrop-blur-sm flex flex-col items-center justify-center z-30"
              >
                <CheckCircle className="text-teal w-16 h-16 mb-2" />
                <div className="text-4xl font-bold font-mono text-white">{result.age}</div>
                <div className="text-sm font-display uppercase tracking-widest text-teal">Estimated Age</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <div className="mb-4 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 w-full">
            {error}
          </div>
        )}

        <div className="flex gap-4 w-full">
          {!result && (
            <>
              <button 
                onClick={onCancel}
                className="flex-1 px-6 py-3 rounded-xl border border-border text-gray-400 hover:bg-white/5 transition-all"
              >
                Skip
              </button>
              <button 
                onClick={handleScan}
                disabled={isModelLoading || isScanning}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isScanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                {isScanning ? 'Analyzing...' : 'Scan Now'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
