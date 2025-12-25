
import React, { useState, useCallback } from 'react';
import CameraView from './components/CameraView';
import { analyzeQuestionImage } from './services/geminiService';

interface Result {
  identifiedQuestion: string;
  officialAnswer: string;
}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [lastScanEmpty, setLastScanEmpty] = useState(false);

  const handleCapture = useCallback(async (base64: string) => {
    setIsLoading(true);
    try {
      const analysis = await analyzeQuestionImage(base64);
      if (analysis) {
        setResult(analysis);
        setLastScanEmpty(false);
      } else {
        setLastScanEmpty(true);
      }
    } catch (err) {
      console.error("Auto-scan error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-emerald-500 uppercase">Live Detection Active</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-1">
          Instant<span className="text-emerald-500">Trivia</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base font-medium">
          Detection engine automatically identifying football history.
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto w-full space-y-6">
        
        {/* Camera Section */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 rounded-3xl p-3 md:p-4 border border-slate-800/50 backdrop-blur-sm overflow-hidden">
            <CameraView onCapture={handleCapture} isLoading={isLoading} />
          </div>
        </section>

        {/* Results Section - Persistent Area */}
        <section className="min-h-[160px] flex flex-col items-center justify-center">
          {!result ? (
            <div className="text-center space-y-3 animate-pulse">
              <div className="p-4 rounded-full bg-slate-900/50 border border-slate-800 inline-block">
                <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">
                {lastScanEmpty ? "Adjusting Focus..." : "Align Question to Scan"}
              </p>
            </div>
          ) : (
            <div className="w-full animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                   </svg>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Detected Question</h3>
                    <p className="text-lg md:text-xl font-semibold text-slate-200 leading-tight">
                      {result.identifiedQuestion}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Verified Answer</h3>
                    <div className="bg-emerald-600 text-white px-8 py-3 rounded-xl text-2xl font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] border-t border-emerald-400/30">
                      {result.officialAnswer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-auto py-8 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800/50 text-[10px] text-slate-500 font-mono uppercase tracking-widest">
          <span>Engine: Local Tesseract v5</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span>Status: Autonomous</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
