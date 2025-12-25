
import React, { useState, useCallback, useRef } from 'react';
import CameraView from './components/CameraView';
import { analyzeQuestionImage } from './services/geminiService';

interface Result {
  identifiedQuestion: string;
  officialAnswer: string;
}

const App: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState<string>("Align Question");

  // Track last found question to prevent flickering if OCR output changes slightly
  const lastQuestionRef = useRef<string | null>(null);

  const handleCapture = useCallback(async (base64: string) => {
    setIsProcessing(true);
    setStatus("Reading...");
    try {
      const analysis = await analyzeQuestionImage(base64);
      if (analysis) {
        if (analysis.identifiedQuestion !== lastQuestionRef.current) {
          setResult(analysis);
          lastQuestionRef.current = analysis.identifiedQuestion;
        }
        setStatus("Match Found");
      } else {
        setStatus("Scanning...");
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-slate-100 flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-emerald-500 tracking-widest uppercase">{status}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-1">
          TRIVIA<span className="text-emerald-500">BOLT</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">Instant Football Trivia Recognition</p>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto w-full space-y-6">

        {/* Camera Display */}
        <div className="relative">
          <div className="absolute -inset-2 bg-emerald-500/5 rounded-[2.5rem] blur-xl"></div>
          <div className="relative bg-slate-900/30 rounded-3xl p-2 border border-slate-800/40 backdrop-blur-md">
            <CameraView onCapture={handleCapture} isProcessing={isProcessing} />
          </div>
        </div>

        {/* Real-time Result Area */}
        <div className="min-h-[140px] flex flex-col items-center justify-center">
          {!result ? (
            <div className="flex flex-col items-center gap-4 text-slate-600 animate-pulse">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Waiting for text in region</p>
            </div>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-900/60 border-l-4 border-emerald-500 rounded-r-2xl p-6 shadow-xl flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Detected Question</h4>
                  <p className="text-base md:text-lg font-bold text-slate-200 leading-tight">
                    {result.identifiedQuestion}
                  </p>
                </div>
                <div className="bg-emerald-600 text-white px-8 py-4 rounded-xl shadow-lg shadow-emerald-500/20 text-center">
                  <span className="block text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Answer</span>
                  <span className="text-2xl font-black">{result.officialAnswer}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto py-6 border-t border-slate-900/50 flex flex-col items-center gap-2">
        <div className="flex gap-4 text-[10px] font-mono text-slate-700 uppercase tracking-widest">
          <span>OCR: Active</span>
          <span>Buffer: Off</span>
          <span>Latency: Low</span>
        </div>
        <p className="text-slate-800 text-[10px]">LOCAL DATABASE SCANNER // REAL-TIME</p>
      </footer>
    </div>
  );
};

export default App;
