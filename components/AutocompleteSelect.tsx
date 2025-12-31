
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  sublabel?: string;
}

interface AutocompleteSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const AutocompleteSelect: React.FC<AutocompleteSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Rechercher...",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border border-slate-300 rounded-lg px-3 py-2 bg-white text-left focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:border-slate-400'}`}
      >
        <span className={`block truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-900 font-medium'}`}>
          {selectedOption ? selectedOption.label : placeholder}
          {selectedOption?.sublabel && <span className="ml-2 text-xs text-slate-400 font-normal">({selectedOption.sublabel})</span>}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              className="w-full bg-transparent border-none outline-none text-sm py-1"
              placeholder="Filtrer la liste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-indigo-50 transition-colors ${value === opt.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'}`}
                >
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    {opt.sublabel && <span className="text-[10px] opacity-60 uppercase font-black">{opt.sublabel}</span>}
                  </div>
                  {value === opt.id && <Check size={14} className="text-indigo-600" />}
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center text-sm text-slate-400 italic">Aucun résultat trouvé</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AutocompleteSelect;
