import React from 'react';
import type { Chord, ExplorationStep, Note, ScaleType } from '../types';
import { HarmonicRelation } from '../types';

interface ChordGraphProps {
    path: ExplorationStep[];
    diatonicChords: Chord[]; // The main scale's chords for initial display
    mainDiatonicChords: Chord[]; // The current main scale's chords for coloring
    onSelectChord: (chord: Chord) => void;
    onModulate: (rootNote: Note, scaleType: ScaleType) => void;
    onGoBack: (index: number) => void;
    onHoverNode: (notes: Note[] | null) => void;
    comparisonDiatonicChords: Chord[];
}

const RELATION_COLORS = {
    BelongsToScale: "border-teal-500 bg-teal-900/50 hover:bg-teal-800/60",
    [HarmonicRelation.Close]: "border-green-500 bg-green-900/50 hover:bg-green-800/60",
    [HarmonicRelation.Intermediate]: "border-yellow-500 bg-yellow-900/50 hover:bg-yellow-800/60",
};

const Breadcrumbs: React.FC<{ path: ExplorationStep[], onGoBack: (index: number) => void }> = ({ path, onGoBack }) => (
    <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">Path:</span>
        {path.map((step, i) => (
            <React.Fragment key={`${step.centerChord.name}-${i}`}>
                {i > 0 && <span className="text-gray-500">&rarr;</span>}
                <button
                    onClick={() => onGoBack(i)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${i === path.length - 1 ? 'bg-sky-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                >
                    {step.centerChord.name}
                </button>
            </React.Fragment>
        ))}
    </div>
);

const ExplorationView: React.FC<{
    step: ExplorationStep,
    onSelectChord: (chord: Chord) => void,
    onModulate: (rootNote: Note, scaleType: ScaleType) => void,
    onHoverNode: (notes: Note[] | null) => void,
    mainDiatonicChords: Chord[],
    comparisonDiatonicChords: Chord[],
    isGhost?: boolean
}> = ({ step, onSelectChord, onModulate, onHoverNode, mainDiatonicChords, comparisonDiatonicChords, isGhost }) => {
    const { centerChord, relatedChords, modulationTargets } = step;

    return (
        <g opacity={isGhost ? 0.2 : 1}>
            {/* Center Chord */}
            <g>
                <circle cx="0" cy="0" r="50" fill={isGhost ? "#2D3748" : "#4A5568"} stroke="#6B7280" strokeWidth="3" />
                <text x="0" y="-10" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" className="pointer-events-none">{centerChord.name}</text>
                <text x="0" y="15" textAnchor="middle" fill="#A0AEC0" fontSize="14" className="pointer-events-none">{centerChord.degree}</text>
            </g>

            {/* Satellite Chords */}
            {relatedChords.map((chord, i) => {
                const angle = (i / relatedChords.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 180;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                const isDiatonicToMain = mainDiatonicChords.some(c => c.name === chord.name);
                const colorClass = isDiatonicToMain ? RELATION_COLORS.BelongsToScale : RELATION_COLORS[chord.relation];
                
                const comparison = comparisonDiatonicChords.find(c => c.name === chord.name);
                const isHighlighted = !!comparison;
                const newDegree = comparison ? `(new: ${comparison.degree})` : undefined;

                return (
                    <g key={`${chord.name}-${i}`} transform={`translate(${x}, ${y})`} onClick={() => !isGhost && onSelectChord(chord)} onMouseEnter={() => !isGhost && onHoverNode(chord.notes)} onMouseLeave={() => !isGhost && onHoverNode(null)} className={!isGhost ? 'cursor-pointer' : ''}>
                        <circle cx="0" cy="0" r="40" className={colorClass.split(' ')[1]} stroke={colorClass.split(' ')[0].replace('border-','border-')} strokeWidth="3" />
                        {isHighlighted && <circle cx="0" cy="0" r="45" fill="none" stroke="#2DD4BF" strokeWidth="3" />}
                        <text x="0" y="-8" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{chord.name}</text>
                        <text x="0" y="12" textAnchor="middle" fill={isHighlighted ? "#2DD4BF" : "#A0AEC0"} fontSize="11" fontWeight={isHighlighted ? "bold" : "normal"}>{newDegree || chord.degree}</text>
                    </g>
                );
            })}

            {/* Modulation Targets */}
            {modulationTargets.map((target, i) => {
                 const angle = (i / modulationTargets.length) * 2 * Math.PI - Math.PI / 4;
                 const radius = 300;
                 const x = Math.cos(angle) * radius;
                 const y = Math.sin(angle) * radius;
                 return (
                     <g key={target.label} transform={`translate(${x}, ${y})`} onClick={() => !isGhost && onModulate(target.rootNote, target.scaleType)} onMouseEnter={() => !isGhost && onHoverNode(getScaleNotes(target.rootNote, target.scaleType))} onMouseLeave={() => !isGhost && onHoverNode(null)} className={!isGhost ? 'cursor-pointer' : ''}>
                        <rect x="-65" y="-18" width="130" height="36" rx="8" ry="8" className="fill-purple-800/80 hover:fill-purple-700 stroke-purple-600" strokeWidth="2" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="semibold">&rarr; {target.label}</text>
                    </g>
                 );
            })}
        </g>
    );
};


export const ChordGraph: React.FC<ChordGraphProps> = ({ path, diatonicChords, mainDiatonicChords, onSelectChord, onModulate, onGoBack, onHoverNode, comparisonDiatonicChords }) => {
    
    if (path.length === 0) {
        if (diatonicChords.length === 0) {
             return <div className="text-center p-8 bg-gray-800/50 rounded-lg min-h-[500px] flex items-center justify-center">Select a key to begin.</div>
        }
        // Initial Diatonic View
        return (
            <div className="relative flex items-center justify-center min-h-[500px] bg-gray-800/50 rounded-lg shadow-lg p-6">
                 {diatonicChords.map((chord, i) => {
                    const angle = (i / diatonicChords.length) * 2 * Math.PI - Math.PI / 2;
                    const radius = 220;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    return (
                        <div 
                            key={`${chord.name}-${i}`}
                            onClick={() => onSelectChord(chord)}
                            onMouseEnter={() => onHoverNode(chord.notes)}
                            onMouseLeave={() => onHoverNode(null)}
                            className="w-24 h-24 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 shadow-lg border-4 absolute bg-teal-900/50 hover:bg-teal-800/60 border-teal-500"
                            style={{ transform: `translate(${x}px, ${y}px)` }}
                        >
                            <span className="text-3xl font-bold">{chord.name}</span>
                            {chord.degree && <span className="text-sm text-gray-400">{chord.degree}</span>}
                        </div>
                    );
                })}
            </div>
        );
    }
    
    const currentStep = path[path.length - 1];
    const ghostStep = path.length > 1 ? path[path.length - 2] : null;
    const viewBoxSize = 800;

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg p-4 space-y-4">
            <Breadcrumbs path={path} onGoBack={onGoBack} />
             <div className="w-full overflow-hidden relative" style={{ height: '650px' }}>
                <svg viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} className="w-full h-full">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                           <polygon points="0 0, 10 3.5, 0 7" fill="rgba(107, 114, 128, 0.5)" />
                        </marker>
                    </defs>
                    
                    {ghostStep && (
                        <>
                            <line
                                x1={viewBoxSize / 2 - 200} y1={viewBoxSize / 2}
                                x2={viewBoxSize / 2 - 55} y2={viewBoxSize / 2}
                                stroke="rgba(107, 114, 128, 0.5)"
                                strokeWidth="4"
                                markerEnd="url(#arrowhead)"
                             />
                            <g transform={`translate(${viewBoxSize / 2 - 200}, ${viewBoxSize / 2}) scale(0.7)`}>
                                <ExplorationView
                                    step={ghostStep}
                                    onSelectChord={() => {}}
                                    onModulate={() => {}}
                                    onHoverNode={() => {}}
                                    mainDiatonicChords={[]}
                                    comparisonDiatonicChords={[]}
                                    isGhost={true}
                                />
                            </g>
                        </>
                    )}

                    <g transform={`translate(${viewBoxSize / 2}, ${viewBoxSize / 2})`}>
                         <ExplorationView
                            step={currentStep}
                            onSelectChord={onSelectChord}
                            onModulate={onModulate}
                            onHoverNode={onHoverNode}
                            mainDiatonicChords={mainDiatonicChords}
                            comparisonDiatonicChords={comparisonDiatonicChords}
                         />
                    </g>
                </svg>
            </div>
        </div>
    );
};

// We need getScaleNotes for modulation previews
import { SCALE_FORMULAS, ALL_NOTES } from '../constants/music';
const getScaleNotes = (rootNote: Note, scaleType: ScaleType): Note[] => {
  const rootIndex = ALL_NOTES.indexOf(rootNote);
  if (rootIndex === -1) return [];
  const formula = SCALE_FORMULAS[scaleType];
  return formula.map(interval => ALL_NOTES[(rootIndex + interval) % 12]);
};