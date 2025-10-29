import type { Note, ScaleType, ChordQuality } from '../types';

export const ALL_NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALE_FORMULAS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  natural_minor: [0, 2, 3, 5, 7, 8, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11],
  major_pentatonic: [0, 2, 4, 7, 9],
  minor_pentatonic: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

export const DIATONIC_CHORD_QUALITIES: Record<string, ChordQuality[]> = {
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

export const DEGREE_ROMAN: Record<string, string[]> = {
    major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    natural_minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
    harmonic_minor: ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    melodic_minor: ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'],
    major_pentatonic: ['I', 'ii', 'iii', 'V', 'vi'],
    minor_pentatonic: ['i', 'III', 'iv', 'v', 'VII'],
    blues: ['I7', 'IV', 'V7', 'vii°', 'I7(2)'], // Highly variable
    dorian: ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
    phrygian: ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
    lydian: ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii'],
    mixolydian: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
    locrian: ['i°', 'II', 'iii', 'iv', 'v', 'VI', 'vii'],
};

export const FIFTHS_ORDER = [0, 4, 1, 5, 2, 6, 3]; // I - V - ii - vi - iii - vii° - IV

export const SCALE_CATEGORIES = [
    {
        label: 'Major & Minor',
        scales: [
            { value: 'major', label: 'Major' },
            { value: 'natural_minor', label: 'Natural Minor' },
            { value: 'harmonic_minor', label: 'Harmonic Minor' },
            { value: 'melodic_minor', label: 'Melodic Minor' },
        ],
    },
    {
        label: 'Pentatonic',
        scales: [
            { value: 'major_pentatonic', label: 'Major Pentatonic' },
            { value: 'minor_pentatonic', label: 'Minor Pentatonic' },
            { value: 'blues', label: 'Blues' },
        ],
    },
    {
        label: 'Modes',
        scales: [
            { value: 'dorian', label: 'Dorian' },
            { value: 'phrygian', label: 'Phrygian' },
            { value: 'lydian', label: 'Lydian' },
            { value: 'mixolydian', label: 'Mixolydian' },
            { value: 'locrian', label: 'Locrian' },
        ],
    },
];
