import React, { useState } from 'react';
import { AnalysisResult, RiskLevel } from '../types';
import { RiskBadge } from './RiskBadge';
import { AlertOctagon, Info, HeartPulse, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultsViewProps {
  result: AnalysisResult;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold text-slate-900">Analysis Summary</h2>
          <RiskBadge level={result.riskLevel} />
        </div>
        <p className="text-slate-600 leading-relaxed">{result.summary}</p>
        
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{result.disclaimer}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Interaction Details */}
        <div className="lg:col-span-2 space-y-4">
           <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-teal-600" />
            Detected Interactions
          </h3>
          {result.interactions.length === 0 ? (
            <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
              No specific drug-drug interactions detected.
            </div>
          ) : (
            result.interactions.map((interaction, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap justify-between items-center gap-2">
                    <div className="font-medium text-slate-900 flex items-center gap-2">
                        {interaction.drugsInvolved.join(" + ")}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                        interaction.severity === RiskLevel.SEVERE ? 'bg-red-100 text-red-700' :
                        interaction.severity === RiskLevel.HIGH ? 'bg-orange-100 text-orange-700' :
                        interaction.severity === RiskLevel.MODERATE ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                        {interaction.severity}
                    </span>
                </div>
                <div className="p-4 space-y-3">
                    <p className="text-slate-700">{interaction.description}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Mechanism: {interaction.mechanism}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Combined Side Effects & Solutions */}
        <div className="lg:col-span-2">
             <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Combined Side Effects & Solutions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.combinedSideEffects.map((effect, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-full">
                        <h4 className="font-bold text-slate-900 mb-2">{effect.symptom}</h4>
                        <p className="text-sm text-slate-600 mb-4 flex-grow">{effect.description}</p>
                        
                        <div className="mt-auto bg-teal-50 rounded-lg p-3">
                            <span className="text-xs font-bold text-teal-800 uppercase block mb-2">Management Tips</span>
                            <ul className="list-disc pl-4 space-y-1">
                                {effect.managementTips.map((tip, tIdx) => (
                                    <li key={tIdx} className="text-sm text-teal-900">{tip}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Individual Drug Breakdown */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-teal-600" />
                Individual Drug Profiles
            </h3>
            {result.individualAnalyses.map((drug, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <button 
                        onClick={() => toggleSection(drug.drugName)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    >
                        <div>
                            <span className="font-semibold text-slate-900 block">{drug.drugName}</span>
                            <span className="text-xs text-slate-500">{drug.usageSummary}</span>
                        </div>
                        {openSection === drug.drugName ? <ChevronUp className="w-5 h-5 text-slate-400"/> : <ChevronDown className="w-5 h-5 text-slate-400"/>}
                    </button>
                    
                    {openSection === drug.drugName && (
                        <div className="p-4 border-t border-slate-200">
                             <h5 className="text-sm font-semibold text-slate-700 mb-2">Common Side Effects</h5>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {drug.commonSideEffects.map((se, sIdx) => (
                                    <div key={sIdx} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                                        <span className="text-slate-800">{se.symptom}</span>
                                        <div className="flex gap-2 text-xs">
                                            <span className="text-slate-500">{se.frequency}</span>
                                            <span className={`px-1.5 py-0.5 rounded ${
                                                se.severity === 'Severe' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                                            }`}>{se.severity}</span>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};
