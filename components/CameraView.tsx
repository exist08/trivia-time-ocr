
import React, { useRef, useEffect, useState } from 'react';

interface CameraViewProps {
  onCapture: (base64: string) => Promise<void>;
  isProcessing: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Camera access denied.");
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

  /**
   * Recursive scanning loop. 
   * Triggers the next scan as soon as the previous one finishes.
   */
  useEffect(() => {
    let active = true;

    const runScan = async () => {
      if (!active || error) return;

      if (!isProcessing && videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        // ROI (Region of Interest) calculation based on HUD box
        // We only crop the center 80% width, 40% height area to speed up Tesseract
        const cropX = video.videoWidth * 0.1;
        const cropY = video.videoHeight * 0.3;
        const cropW = video.videoWidth * 0.8;
        const cropH = video.videoHeight * 0.4;

        canvas.width = cropW;
        canvas.height = cropH;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Boost contrast and grayscale for OCR accuracy
          ctx.filter = 'grayscale(1) contrast(1.5) brightness(1.2)';
          ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          const base64 = dataUrl.split(',')[1];

          await onCapture(base64);
        }
      }

      // Short delay to prevent CPU choking, but fast enough for "instant" feel
      if (active) {
        setTimeout(runScan, 100);
      }
    };

    runScan();

    return () => {
      active = false;
    };
  }, [error, isProcessing, onCapture]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-900/20 border border-red-500 rounded-xl">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-red-600 px-4 py-2 rounded-lg">Retry</button>
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
        className="w-full h-full object-cover"
      />

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Target Box - Only text inside this box is scanned */}
          <div className="w-[85%] h-[40%] border-2 border-emerald-500/40 rounded-lg relative overflow-hidden backdrop-blur-[1px]">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400" />

            {/* Active Scanning Laser */}
            <div className="absolute w-full h-1 bg-emerald-400/80 shadow-[0_0_20px_#10b981] animate-[laser_1.5s_linear_infinite]" />

            {/* Status Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-mono text-emerald-400 tracking-[0.5em] uppercase bg-black/40 px-3 py-1 rounded">
                Scanning Region
              </span>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes laser {
          0% { top: -10%; }
          100% { top: 110%; }
        }
      `}</style>
    </div>
  );
};

export default CameraView;
