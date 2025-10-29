import { useMemo, useCallback } from 'react';
import type { Note, ScaleType, Chord, RelatedChord, ChordQuality, ModulationTarget } from '../types';
import { HarmonicRelation } from '../types';
import { ALL_NOTES, SCALE_FORMULAS, DIATONIC_CHORD_QUALITIES, DEGREE_ROMAN, FIFTHS_ORDER, SCALE_CATEGORIES } from '../constants/music';

const getNoteFromIndex = (index: number): Note => ALL_NOTES[index % 12];

export const getScaleNotes = (rootNote: Note, scaleType: ScaleType): Note[] => {
  const rootIndex = ALL_NOTES.indexOf(rootNote);
  if (rootIndex === -1) return [];
  const formula = SCALE_FORMULAS[scaleType];
  return formula.map(interval => getNoteFromIndex(rootIndex + interval));
};

const getChord = (rootNote: Note, quality: ChordQuality): { name: string; notes: Note[] } => {
    const rootIndex = ALL_NOTES.indexOf(rootNote);
    let intervals: number[] = [];
    let name = rootNote;

    switch (quality) {
        case '': // Major
            intervals = [0, 4, 7];
            break;
        case 'm': // Minor
            intervals = [0, 3, 7];
            name += 'm';
            break;
        case 'dim': // Diminished
            intervals = [0, 3, 6];
            name += '°';
            break;
        case 'aug': // Augmented
            intervals = [0, 4, 8];
            name += '+';
            break;
        case '7': // Dominant 7th (simplified for blues)
            intervals = [0, 4, 7, 10];
            name += '7';
            break;
    }

    const notes = intervals.map(i => getNoteFromIndex(rootIndex + i));
    return { name, notes };
};

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


const calculateRelationship = (chord1Notes: Note[], chord2Notes: Note[]): HarmonicRelation => {
    const set1 = new Set(chord1Notes);
    const commonNotes = chord2Notes.filter(note => set1.has(note)).length;

    if (commonNotes >= 2) return HarmonicRelation.Close;
    if (commonNotes === 1) return HarmonicRelation.Intermediate;
    return HarmonicRelation.Distant;
};


export const useMusicTheory = (rootNote: Note, scaleType: ScaleType) => {
    const scaleNotes = useMemo(() => getScaleNotes(rootNote, scaleType), [rootNote, scaleType]);
    
    const diatonicChords = useMemo(() => getDiatonicChordsForScale(rootNote, scaleType), [rootNote, scaleType]);

    const getRelatedChords = useCallback((currentChord: Chord): RelatedChord[] => {
        if (!currentChord) return [];

        const allPossibleChords: Chord[] = [];
        ALL_NOTES.forEach(note => {
            (['', 'm', 'dim'] as ChordQuality[]).forEach(quality => {
                const chordInfo = getChord(note, quality);
                if (currentChord.name === chordInfo.name) return;
                
                allPossibleChords.push({ ...chordInfo, degree: '', quality });
            });
        });
        
        return allPossibleChords.map(c => {
                const relation = calculateRelationship(currentChord.notes, c.notes);
                return { ...c, relation };
            }).filter(c => c.relation !== HarmonicRelation.Distant); // Show Close and Intermediate chords
    }, []);

    const getModulationTargets = useCallback((currentChord: Chord): ModulationTarget[] => {
        if (!currentChord) return [];
        const targets: ModulationTarget[] = [];
        
        // Only check for modulations from major or minor chords
        if (currentChord.quality !== '' && currentChord.quality !== 'm') {
            return [];
        }

        ALL_NOTES.forEach(newRoot => {
            (['major', 'natural_minor'] as ScaleType[]).forEach(newScaleType => {
                if (newRoot === rootNote && newScaleType === scaleType) return; // Skip current key

                const newKeyChords = getDiatonicChordsForScale(newRoot, newScaleType);
                const foundChord = newKeyChords.find(c => c.name === currentChord.name);

                if (foundChord) {
                    const scaleLabel = SCALE_CATEGORIES.flatMap(c => c.scales).find(s => s.value === newScaleType)?.label || newScaleType;
                    targets.push({
                        rootNote: newRoot,
                        scaleType: newScaleType,
                        label: `${newRoot} ${scaleLabel} (as ${foundChord.degree})`
                    });
                }
            });
        });
        return targets;
    }, [rootNote, scaleType]);
    
    const orderedDiatonicChords = useMemo(() => {
       if (diatonicChords.length < 7 && diatonicChords.length > 0) {
           return diatonicChords;
       }
       if (diatonicChords.length === 0) return [];
       return FIFTHS_ORDER.filter(i => i < diatonicChords.length).map(i => diatonicChords[i]);
    }, [diatonicChords]);

    return { scaleNotes, diatonicChords, getRelatedChords, orderedDiatonicChords, getModulationTargets };
};
