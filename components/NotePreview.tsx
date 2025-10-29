import React from 'react';
import type { Note } from '../types';

interface NotePreviewProps {
    notes: Note[] | null;
}

export const NotePreview: React.FC<NotePreviewProps> = ({ notes }) => {
    return (
        <div className="h-12 transition-opacity duration-300" style={{ opacity: notes ? 1 : 0 }}>
            {notes && (
                <div className="flex justify-center items-center gap-2 p-2 bg-gray-800/30 rounded-lg">
                    <p className="text-xs text-gray-500 font-semibold mr-2">PREVIEW:</p>
                    {notes.map(note => (
                        <div key={note} className="w-8 h-8 flex items-center justify-center rounded-full font-mono font-bold text-gray-400 border-2 border-dashed border-gray-600">
                            {note}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
