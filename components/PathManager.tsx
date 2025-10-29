import React, { useState } from 'react';
import type { SavedPath } from '../types';

interface PathManagerProps {
    savedPaths: SavedPath[];
    onSave: () => void;
    onLoad: (path: SavedPath) => void;
    onDelete: (id: string) => void;
    canSave: boolean;
}

const PathItem: React.FC<{path: SavedPath; onLoad: (path: SavedPath) => void; onDelete: (id: string) => void;}> = ({ path, onLoad, onDelete }) => (
    <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md hover:bg-gray-700 transition-colors">
        <div className="flex-grow mr-2">
            <p className="text-sm font-semibold truncate" title={path.name}>{path.name}</p>
            <p className="text-xs text-gray-400">{path.createdAt}</p>
        </div>
        <div className="flex-shrink-0 space-x-1">
             <button onClick={() => onLoad(path)} className="px-2 py-1 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded">Load</button>
             <button onClick={() => onDelete(path.id)} className="px-2 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded">Del</button>
        </div>
    </div>
);


export const PathManager: React.FC<PathManagerProps> = ({ savedPaths, onSave, onLoad, onDelete, canSave }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-gray-800/50 rounded-lg shadow-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-4 font-bold text-xl flex justify-between items-center">
                <h2>My Paths</h2>
                <span>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
                <div className="p-4 pt-0 space-y-3">
                    <button
                        onClick={onSave}
                        disabled={!canSave}
                        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Save Current Path
                    </button>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {savedPaths.length === 0 ? (
                             <p className="text-center text-gray-500 text-sm py-4">No saved paths yet. Explore a progression and save it!</p>
                        ) : (
                           [...savedPaths].reverse().map(path => (
                                <PathItem key={path.id} path={path} onLoad={onLoad} onDelete={onDelete} />
                           ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
