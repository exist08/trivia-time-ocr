
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

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      }
    }
  };

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
    <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-2xl border-2 border-gray-700 bg-black aspect-[16/9]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* Scanning HUD */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 h-1/3 border-2 border-blue-500/50 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400" />
            
            {/* Animated Scanning Line */}
            <div className="absolute w-full h-0.5 bg-blue-400/80 shadow-[0_0_15px_rgba(96,165,250,0.8)] animate-[scan_2s_linear_infinite]" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4">
        <button
          onClick={handleCapture}
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all
            ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'}
          `}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Solve Question
            </>
          )}
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100px); }
        }
      `}</style>
    </div>
  );
};

export default CameraView;
