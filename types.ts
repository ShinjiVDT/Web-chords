export type Note = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type ScaleType =
  | 'major'
  | 'natural_minor'
  | 'harmonic_minor'
  | 'melodic_minor'
  | 'major_pentatonic'
  | 'minor_pentatonic'
  | 'blues'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'locrian';

export type ChordQuality = '' | 'm' | 'dim' | 'aug' | '7';

export enum HarmonicRelation {
  Diatonic = 'Diatonic',
  Close = 'Close',
  Intermediate = 'Intermediate',
  Distant = 'Distant',
}

export interface Chord {
  name: string;
  notes: Note[];
  degree: string;
  quality: ChordQuality;
}

export interface RelatedChord extends Chord {
  relation: HarmonicRelation;
}

export interface ModulationTarget {
  rootNote: Note;
  scaleType: ScaleType;
  label: string;
}

export interface ExplorationStep {
  centerChord: Chord;
  relatedChords: RelatedChord[];
  modulationTargets: ModulationTarget[];
}

export interface GeminiSuggestion {
  sequence: string;
  explanation: string;
}

export interface SavedPath {
  id: string;
  name: string;
  createdAt: string;
  path: Chord[];
  rootNote: Note;
  scaleType: ScaleType;
}
