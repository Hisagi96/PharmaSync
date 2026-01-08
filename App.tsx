import React, { useState } from 'react';
import { Header } from './components/Header';
import { DrugInput } from './components/DrugInput';
import { ResultsView } from './components/ResultsView';
import { analyzeDrugInteractions } from './services/geminiService';
import { AnalysisResult, DrugEntry } from './types';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [drugs, setDrugs] = useState<DrugEntry[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddDrug = (drug: DrugEntry) => {
    // Avoid duplicates based on ID or name
    if (!drugs.some(d => d.id === drug.id || d.name.toLowerCase() === drug.name.toLowerCase())) {
        setDrugs(prev => [...prev, drug]);
        // Reset results when inputs change to encourage re-analysis
        if (result) setResult(null);
    }
  };

  const handleRemoveDrug = (drugId: string) => {
    setDrugs(prev => prev.filter(d => d.id !== drugId));
    if (result) setResult(null);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeDrugInteractions(drugs);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDrugs([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero / Input Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Check Drug Interactions</h1>
            <p className="text-slate-600">
              Enter medications to instantly analyze potential interactions, side effects, and management strategies using AI.
            </p>
          </div>

          <div className="max-w-xl mx-auto space-y-6">
            <DrugInput 
              drugs={drugs} 
              onAddDrug={handleAddDrug} 
              onRemoveDrug={handleRemoveDrug}
              disabled={loading}
            />

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAnalyze}
                disabled={drugs.length === 0 || loading}
                className="flex-1 bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-teal-600/20 hover:bg-teal-700 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Analyze Interactions
                  </>
                )}
              </button>
              
              {drugs.length > 0 && (
                <button
                  onClick={handleClear}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            
            <p className="text-xs text-center text-slate-400">
                Powered by Google Gemini. Not a substitute for professional medical advice.
            </p>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-800 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <section className="max-w-4xl mx-auto">
            <ResultsView result={result} />
          </section>
        )}
      </main>
    </div>
  );
};

export default App;