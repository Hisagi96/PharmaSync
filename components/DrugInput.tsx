import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Plus, X, Search, Loader2 } from 'lucide-react';
import { DrugEntry } from '../types';
import { searchDrugs } from '../services/drugService';

interface DrugInputProps {
  drugs: DrugEntry[];
  onAddDrug: (drug: DrugEntry) => void;
  onRemoveDrug: (id: string) => void;
  disabled?: boolean;
}

export const DrugInput: React.FC<DrugInputProps> = ({ drugs, onAddDrug, onRemoveDrug, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<DrugEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.length < 3) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const results = await searchDrugs(inputValue);
        // Filter out already selected drugs
        const available = results.filter(r => !drugs.some(d => d.name.toLowerCase() === r.name.toLowerCase()));
        setSuggestions(available);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, drugs]);

  const handleAdd = (drug?: DrugEntry) => {
    let entryToAdd = drug;

    // If no explicit drug passed (manual add via Enter or button), try to pick the best suggestion
    if (!entryToAdd && suggestions.length > 0) {
      // Pick the first suggestion
      entryToAdd = suggestions[0];
    } else if (!entryToAdd) {
        // Fallback if no suggestions: Create manual entry
        entryToAdd = {
            id: Math.random().toString(36).substr(2, 9),
            name: inputValue.trim(),
        };
    }

    if (entryToAdd.name && !drugs.some(d => d.name.toLowerCase() === entryToAdd.name.toLowerCase())) {
      onAddDrug(entryToAdd);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="w-full space-y-4" ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-base transition-shadow shadow-sm"
          placeholder="Search drug name (e.g., Aspirin, Lisinopril)..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <div className="absolute inset-y-1 right-1 flex items-center">
            {isLoading && <Loader2 className="w-5 h-5 text-teal-500 animate-spin mr-2" />}
            <button
            onClick={() => handleAdd()}
            disabled={!inputValue.trim() || disabled}
            className="px-3 py-1.5 flex items-center justify-center bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
            <Plus className="w-5 h-5" />
            </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 max-h-60 overflow-auto">
            <ul className="py-1">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  onClick={() => handleAdd(suggestion)}
                  className="px-4 py-2 hover:bg-teal-50 cursor-pointer transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{suggestion.name}</span>
                    {suggestion.genericName && (
                      <span className="text-xs text-slate-500">Generic: {suggestion.genericName}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {drugs.length === 0 && (
          <p className="text-sm text-slate-500 italic py-2">No drugs selected yet.</p>
        )}
        {drugs.map((drug) => (
          <div
            key={drug.id}
            className="inline-flex flex-col items-start px-3 py-1 rounded-lg text-sm border animate-fadeIn relative pr-8 bg-teal-50 text-teal-900 border-teal-200"
          >
            <span className="font-semibold">{drug.name}</span>
            {drug.genericName && (
                <span className="text-xs opacity-80 truncate max-w-[150px]">{drug.genericName}</span>
            )}
            <button
              onClick={() => onRemoveDrug(drug.id)}
              disabled={disabled}
              className="absolute right-1 top-1.5 p-1 rounded-full focus:outline-none transition-colors text-teal-400 hover:bg-teal-200 hover:text-teal-800"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};