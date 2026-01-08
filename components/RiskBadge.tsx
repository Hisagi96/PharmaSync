import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  switch (level) {
    case RiskLevel.SEVERE:
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg border border-red-200">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-bold uppercase tracking-wide">Severe Risk</span>
        </div>
      );
    case RiskLevel.HIGH:
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg border border-orange-200">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold uppercase tracking-wide">High Risk</span>
        </div>
      );
    case RiskLevel.MODERATE:
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold uppercase tracking-wide">Moderate Risk</span>
        </div>
      );
    case RiskLevel.LOW:
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200">
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold uppercase tracking-wide">Low Risk</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold uppercase tracking-wide">Unknown</span>
        </div>
      );
  }
};
