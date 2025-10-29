import React from 'react';
import type { Note, ScaleType } from '../types';
import { ALL_NOTES, SCALE_CATEGORIES } from '../constants/music';
import { CustomSelect } from './CustomSelect';

interface ControlsProps {
  rootNote: Note;
  setRootNote: (note: Note) => void;
  scaleType: ScaleType;
  setScaleType: (scale: ScaleType) => void;
  onResetPath: () => void;
  onPreview: (rootNote: Note, scaleType: ScaleType) => void;
  onClearPreview: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ rootNote, setRootNote, scaleType, setScaleType, onResetPath, onPreview, onClearPreview }) => {
  const noteOptions = ALL_NOTES.map(note => ({ value: note, label: note }));
  const scaleOptions = SCALE_CATEGORIES.map(category => ({
      label: category.label,
      options: category.scales,
  }));
  
  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg p-4 space-y-4">
        <h2 className="font-bold text-xl">Key Signature</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomSelect
                label="Root Note"
                options={noteOptions}
                value={rootNote}
                onChange={(val) => setRootNote(val as Note)}
                onPreview={(val) => onPreview(val as Note, scaleType)}
                onClearPreview={onClearPreview}
            />
            <CustomSelect
                label="Scale / Mode"
                options={scaleOptions}
                value={scaleType}
                onChange={(val) => setScaleType(val as ScaleType)}
                onPreview={(val) => onPreview(rootNote, val as ScaleType)}
                onClearPreview={onClearPreview}
            />
        </div>
         <button 
          onClick={onResetPath}
          className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Reset Current Path
        </button>
    </div>
  );
};