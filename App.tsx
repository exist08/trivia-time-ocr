
import React, { useState } from 'react';
import CameraView from './components/CameraView';
import { analyzeQuestionImage } from './services/geminiService';

interface Result {
  identifiedQuestion: string;
  officialAnswer: string;
}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (base64: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const analysis = await analyzeQuestionImage(base64);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Failed to identify question. Ensure the text is clear.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 mb-4 bg-emerald-600/20 rounded-2xl border border-emerald-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
          Trivia<span className="text-emerald-500">Scanner</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Fast local question recognition. No AI API used.
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Camera Section */}
        <section className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800 shadow-xl">
          <CameraView onCapture={handleCapture} isLoading={isLoading} />
          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Local Engine Ready
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              Offline Match Enabled
            </span>
          </div>
        </section>

        {/* Results Section */}
        {(result || error) && (
          <section 
            className={`
              rounded-3xl p-8 border animate-in fade-in zoom-in duration-300
              ${error ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-900 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]'}
            `}
          >
            {error && (
              <div className="text-center py-2">
                <p className="text-red-400 font-medium">Scan Error: {error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Question Identified</h3>
                  <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-200">
                    {result.identifiedQuestion}
                  </p>
                </div>
                
                <div className="pt-6 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Database Answer</h3>
                  <div className="bg-emerald-600 text-white inline-block px-6 py-3 rounded-2xl text-2xl font-black shadow-lg shadow-emerald-500/20">
                    {result.officialAnswer}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Instructions */}
        {!result && !error && !isLoading && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
              <div className="text-emerald-500 font-black mb-1">LOCAL SCAN</div>
              <p className="text-sm text-slate-400">Processing is done entirely on your device using a fast character recognition engine.</p>
            </div>
            <div className="flex-1 p-5 bg-slate-900/40 rounded-2xl border border-slate-800/50">
              <div className="text-emerald-500 font-black mb-1">KEYWORD MATCH</div>
              <p className="text-sm text-slate-400">Finds the closest match from the official football trivia dataset provided.</p>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto pt-12 pb-8 text-center text-slate-700 text-xs font-mono uppercase tracking-[0.2em]">
        <p>Private Local Scanning Engine // v1.0.0</p>
      </footer>
    </div>
  );
};

export default App;
