import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: (Option | { label: string; options: Option[] })[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  onPreview?: (value: string) => void;
  onClearPreview?: () => void;
}

export const CustomSelect: React.FC<SelectProps> = ({ options, value, onChange, label, onPreview, onClearPreview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options
    .flatMap(opt => ('options' in opt ? opt.options : opt))
    .find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  return (
    <div className="relative w-full" ref={ref} onMouseLeave={() => onClearPreview && onClearPreview()}>
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
      >
        <span className="block truncate text-white">{selectedOption?.label}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="absolute mt-1 w-full rounded-md bg-gray-800 shadow-lg z-10 max-h-60 overflow-auto">
          <ul className="py-1">
            {options.map((option) =>
              'options' in option ? (
                <li key={option.label}>
                  <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">{option.label}</div>
                  {option.options.map(subOption => (
                    <li
                      key={subOption.value}
                      onClick={() => {
                        onChange(subOption.value);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => onPreview && onPreview(subOption.value)}
                      className="text-white cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-sky-600"
                    >
                      <span className="font-normal block truncate">{subOption.label}</span>
                    </li>
                  ))}
                </li>
              ) : (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => onPreview && onPreview(option.value)}
                  className="text-white cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-sky-600"
                >
                  <span className="font-normal block truncate">{option.label}</span>
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};