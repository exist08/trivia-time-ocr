
import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
  onCapture: (base64: string) => void;
  isLoading: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, isLoading }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Could not access camera. Please check permissions.");
        console.error(err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Continuous Capture Logic
  useEffect(() => {
    if (isLoading || error) return;

    const captureFrame = () => {
      if (videoRef.current && canvasRef.current && !isLoading) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        // Use a smaller canvas size for faster OCR processing
        canvas.width = 640;
        canvas.height = 360;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          const base64 = dataUrl.split(',')[1];
          onCapture(base64);
        }
      }
    };

    // Auto-capture every 1.5 seconds if not busy
    const intervalId = setInterval(captureFrame, 1500);
    return () => clearInterval(intervalId);
  }, [isLoading, error, onCapture]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-900/20 border border-red-500 rounded-xl">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-2xl border-2 border-slate-700 bg-black aspect-[16/9]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover grayscale contrast-125"
      />
      
      {/* Scanning HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[85%] h-[40%] border border-emerald-500/30 rounded-lg relative">
            {/* Corners */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
            
            {/* Animated Laser Line */}
            <div className="absolute w-full h-0.5 bg-emerald-400/60 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="text-[10px] font-mono text-emerald-400/80 tracking-widest uppercase">
                {isLoading ? 'Processing' : 'Live Feed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CameraView;
