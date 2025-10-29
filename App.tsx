import React, { useState, useEffect, useCallback } from 'react';
import { Controls } from './components/Controls';
import { ChordGraph } from './components/ChordGraph';
import { ChordDetails } from './components/ChordDetails';
import { PathManager } from './components/PathManager';
import { NotePreview } from './components/NotePreview';
import { useMusicTheory, getScaleNotes } from './hooks/useMusicTheory';
import { getChordSuggestions } from './services/geminiService';
// FIX: Import `ChordQuality` to resolve type errors in helper functions.
import type { Note, ScaleType, Chord, SavedPath, GeminiSuggestion, ExplorationStep, ChordQuality } from './types';

const App: React.FC = () => {
    const [rootNote, setRootNote] = useState<Note>('C');
    const [scaleType, setScaleType] = useState<ScaleType>('major');
    const [explorationPath, setExplorationPath] = useState<ExplorationStep[]>([]);
    const [suggestions, setSuggestions] = useState<GeminiSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [savedPaths, setSavedPaths] = useState<SavedPath[]>([]);
    const [hoveredNotes, setHoveredNotes] = useState<Note[] | null>(null);
    const [comparisonDiatonicChords, setComparisonDiatonicChords] = useState<Chord[]>([]);

    const { scaleNotes, diatonicChords, getRelatedChords, getModulationTargets, orderedDiatonicChords } = useMusicTheory(rootNote, scaleType);

    // Load saved paths from localStorage on initial mount
    useEffect(() => {
        const storedPaths = localStorage.getItem('chordExplorerPaths');
        if (storedPaths) {
            setSavedPaths(JSON.parse(storedPaths));
        }
    }, []);
    
    const handleSelectChord = useCallback((chord: Chord) => {
        const newStep: ExplorationStep = {
            centerChord: chord,
            relatedChords: getRelatedChords(chord),
            modulationTargets: getModulationTargets(chord)
        };
        setExplorationPath(prev => [...prev, newStep]);
        setSuggestions([]);
        setError(null);
    }, [getRelatedChords, getModulationTargets]);

    const handleGetSuggestions = async () => {
        const currentChord = explorationPath[explorationPath.length - 1]?.centerChord;
        if (!currentChord) return;

        setIsLoading(true);
        setError(null);
        setSuggestions([]);

        const result = await getChordSuggestions(rootNote, currentChord.name, scaleType);
        
        if (result.error) {
            setError(result.error);
        } else {
            setSuggestions(result.progressions || []);
        }
        setIsLoading(false);
    };

    const handleResetPath = () => {
        setExplorationPath([]);
    };
    
    const handleModulate = (targetRoot: Note, targetScale: ScaleType) => {
        const pivotChord = explorationPath[explorationPath.length - 1]?.centerChord;
        if (!pivotChord) return;

        setRootNote(targetRoot);
        setScaleType(targetScale);
        
        // Use a timeout to ensure the state update for the key has propagated
        setTimeout(() => {
            const newKeyDiatonicChords = getDiatonicChordsForScale(targetRoot, targetScale);
            const pivotInNewKey = newKeyDiatonicChords.find(c => c.name === pivotChord.name);
            const chordForNewStep = pivotInNewKey || { ...pivotChord, degree: 'N/A' };

            const newStep: ExplorationStep = {
                centerChord: chordForNewStep,
                relatedChords: getRelatedChords(chordForNewStep),
                modulationTargets: getModulationTargets(chordForNewStep)
            };
            setExplorationPath(prev => [...prev, newStep]);
        }, 0);
    };
    
    const handleGoBack = (index: number) => {
        setExplorationPath(prev => prev.slice(0, index + 1));
    };
    
    // Path Manager Logic
    const handleSavePath = () => {
        const currentPathChords = explorationPath.map(step => step.centerChord);
        if (currentPathChords.length < 1) return;

        const pathName = prompt("Enter a name for this path:", `${rootNote} ${scaleType} Progression`);
        if (pathName) {
            const newPath: SavedPath = {
                id: Date.now().toString(),
                name: pathName,
                createdAt: new Date().toLocaleDateString(),
                path: currentPathChords,
                rootNote,
                scaleType,
            };
            const updatedPaths = [...savedPaths, newPath];
            setSavedPaths(updatedPaths);
            localStorage.setItem('chordExplorerPaths', JSON.stringify(updatedPaths));
        }
    };

    const handleLoadPath = (path: SavedPath) => {
        setRootNote(path.rootNote);
        setScaleType(path.scaleType);

        setTimeout(() => { 
            const newExplorationPath = path.path.map(chord => {
                 const newStep: ExplorationStep = {
                     centerChord: chord,
                     relatedChords: getRelatedChords(chord),
                     modulationTargets: getModulationTargets(chord)
                 };
                 return newStep;
            });
            setExplorationPath(newExplorationPath);
        }, 100);
    };

    const handleDeletePath = (id: string) => {
        const updatedPaths = savedPaths.filter(p => p.id !== id);
        setSavedPaths(updatedPaths);
        localStorage.setItem('chordExplorerPaths', JSON.stringify(updatedPaths));
    };
    
    const handleSetComparison = (r: Note, s: ScaleType) => {
        setComparisonDiatonicChords(getDiatonicChordsForScale(r, s));
    }

    const handleClearComparison = () => {
        setComparisonDiatonicChords([]);
    }

    const currentChord = explorationPath.length > 0 ? explorationPath[explorationPath.length - 1].centerChord : null;
    const currentPathChords = explorationPath.map(step => step.centerChord);

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-700">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">HarmonAI</h1>
                    <p className="text-sm text-gray-400">Your AI-powered chord progression assistant</p>
                </div>
            </header>

            <main className="container mx-auto p-4">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                       <NotePreview notes={hoveredNotes} />
                       <ChordGraph
                           path={explorationPath}
                           diatonicChords={orderedDiatonicChords}
                           onSelectChord={handleSelectChord}
                           onModulate={handleModulate}
                           onGoBack={handleGoBack}
                           onHoverNode={(notes) => setHoveredNotes(notes)}
                           comparisonDiatonicChords={comparisonDiatonicChords}
                           mainDiatonicChords={diatonicChords}
                       />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <Controls 
                            rootNote={rootNote}
                            setRootNote={setRootNote}
                            scaleType={scaleType}
                            setScaleType={setScaleType}
                            onResetPath={handleResetPath}
                            onPreview={handleSetComparison}
                            onClearPreview={handleClearComparison}
                        />
                         <ChordDetails
                            currentChord={currentChord}
                            scaleNotes={scaleNotes}
                            suggestions={suggestions}
                            onGetSuggestions={handleGetSuggestions}
                            isLoading={isLoading}
                            error={error}
                        />
                        <PathManager 
                            savedPaths={savedPaths}
                            onSave={handleSavePath}
                            onLoad={handleLoadPath}
                            onDelete={handleDeletePath}
                            canSave={currentPathChords.length > 0}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};


// Helper function to be used within the App component's scope
const getDiatonicChordsForScale = (rootNote: Note, scaleType: ScaleType): Chord[] => {
    const scaleNotes = getScaleNotes(rootNote, scaleType);
    const qualities = DIATONIC_CHORD_QUALITIES[scaleType];
    const degrees = DEGREE_ROMAN[scaleType];
    if (!qualities || !degrees) return [];

    return scaleNotes.map((note, i) => {
        const quality = qualities[i % qualities.length];
        const degree = degrees[i % degrees.length];
        const chordInfo = getChord(note, quality);
        return {
            ...chordInfo,
            degree,
            quality,
        };
    });
};

const getChord = (rootNote: Note, quality: ChordQuality): { name: string; notes: Note[] } => {
    const rootIndex = ALL_NOTES.indexOf(rootNote);
    let intervals: number[] = [];
    let name = rootNote;

    switch (quality) {
        case '': 
            intervals = [0, 4, 7];
            break;
        case 'm': 
            intervals = [0, 3, 7];
            name += 'm';
            break;
        case 'dim':
            intervals = [0, 3, 6];
            name += '°';
            break;
        case 'aug':
            intervals = [0, 4, 8];
            name += '+';
            break;
        case '7': 
            intervals = [0, 4, 7, 10];
            name += '7';
            break;
    }

    const notes = intervals.map(i => ALL_NOTES[(rootIndex + i) % 12]);
    return { name, notes };
};


export default App;

// Constants need to be accessible to helper functions
const ALL_NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const DIATONIC_CHORD_QUALITIES: Record<string, ChordQuality[]> = {
  major: ['', 'm', 'm', '', '7', 'm', 'dim'],
  natural_minor: ['m', 'dim', '', 'm', 'm', '', ''],
  harmonic_minor: ['m', 'dim', 'aug', 'm', '7', '', 'dim'],
  melodic_minor: ['m', 'm', 'aug', '7', '7', 'dim', 'dim'],
  major_pentatonic: ['', 'm', '', '', 'm'], 
  minor_pentatonic: ['m', '', 'm', 'm', ''],
  blues: ['7', '', '7', 'dim', '7', ''],
  dorian: ['m', 'm', '', '7', 'm', 'dim', ''],
  phrygian: ['m', '', '7', 'm', 'dim', '', 'm'],
  lydian: ['', '7', 'm', 'dim', '', 'm', 'm'],
  mixolydian: ['7', 'm', 'dim', '', 'm', 'm', ''],
  locrian: ['dim', '', 'm', 'm', '', '', 'm'],
};
const DEGREE_ROMAN: Record<string, string[]> = {
    major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    natural_minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
    harmonic_minor: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    melodic_minor: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'],
    major_pentatonic: ['I', 'ii', 'iii', 'V', 'vi'],
    minor_pentatonic: ['i', 'III', 'iv', 'v', 'VII'],
    blues: ['I7', 'IV', 'V7', 'vii°', 'I7(2)'],
    dorian: ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
    phrygian: ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
    lydian: ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii'],
    mixolydian: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
    locrian: ['i°', 'II', 'iii', 'iv', 'v', 'VI', 'vii'],
};