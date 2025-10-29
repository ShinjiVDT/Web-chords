import React from 'react';
import type { Chord, GeminiSuggestion, Note } from '../types';

interface ChordDetailsProps {
  currentChord: Chord | null;
  scaleNotes: Note[];
  suggestions: GeminiSuggestion[];
  onGetSuggestions: () => void;
  isLoading: boolean;
  error: string | null;
}

const SuggestionCard: React.FC<{ suggestion: GeminiSuggestion, index: number }> = ({ suggestion, index }) => (
    <div className="bg-gray-700/50 p-3 rounded-lg">
        <p className="font-bold text-sky-400 mb-1">
           <span className="text-gray-400 font-normal">Suggestion {index + 1}: </span> 
           {suggestion.sequence}
        </p>
        <p className="text-sm text-gray-300">{suggestion.explanation}</p>
    </div>
);

export const ChordDetails: React.FC<ChordDetailsProps> = ({ currentChord, scaleNotes, suggestions, onGetSuggestions, isLoading, error }) => {
  if (!currentChord) {
    return <div className="text-center text-gray-500 p-8">Select a diatonic chord from the map to start exploring its harmonic possibilities.</div>;
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Current Focus</h2>
          <div className="mt-2 p-4 bg-gray-900/50 rounded-lg">
              <p className="text-3xl font-bold text-sky-400">{currentChord.name}</p>
              {currentChord.degree && <p className="text-lg text-gray-400">{currentChord.degree}</p>}
          </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-white">Scale Notes</h3>
             <div className="mt-2 flex flex-wrap gap-2">
                {scaleNotes.map(note => (
                    <div key={note} className={`w-10 h-10 flex items-center justify-center rounded-full font-mono font-bold transition-colors ${currentChord.notes.includes(note) ? 'bg-sky-600 text-white' : 'bg-gray-700/50'}`}>
                        {note}
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      <div className="flex-grow space-y-3 overflow-y-auto mt-4 pt-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white">Gemini Suggestions</h3>
        <button 
          onClick={onGetSuggestions}
          disabled={isLoading || !currentChord}
          className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Thinking...' : `Get Progressions from ${currentChord.name}`}
        </button>
        {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}
        {suggestions.length > 0 && (
            <div className="space-y-3 pb-4">
                {suggestions.map((s, i) => (
                    <SuggestionCard key={i} suggestion={s} index={i} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};