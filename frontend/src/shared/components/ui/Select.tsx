import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { scaleIn } from '../../theme/animations';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string | string[]; // string for single, string[] for multi
  onChange: (value: any) => void;
  isMulti?: boolean;
  isSearchable?: boolean;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  isMulti = false,
  isSearchable = false,
  placeholder = 'Select option...',
  label,
  error,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync keyboard active index and search query focus
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(-1);
      if (isSearchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } else {
      setSearchQuery('');
    }
  }, [isOpen, isSearchable]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSelected = (val: string) => {
    if (isMulti && Array.isArray(value)) {
      return value.includes(val);
    }
    return value === val;
  };

  const handleSelectOption = (option: SelectOption) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(option.value)) {
        onChange(currentValues.filter((v) => v !== option.value));
      } else {
        onChange([...currentValues, option.value]);
      }
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  const handleRemoveValue = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      onChange(value.filter((v) => v !== val));
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[activeIndex]);
        }
        break;
      default:
        break;
    }
  };

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && optionsRef.current) {
      const activeEl = optionsRef.current.children[activeIndex + (isSearchable ? 1 : 0)] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, isSearchable]);

  // Display selected item labels
  const getDisplayValue = () => {
    if (isMulti) {
      const selectedOpts = options.filter((o) => (value as string[]).includes(o.value));
      if (selectedOpts.length === 0) return <span className="text-muted-foreground">{placeholder}</span>;
      return (
        <div className="flex flex-wrap gap-1.5 max-w-full">
          {selectedOpts.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded"
            >
              {opt.label}
              <button
                type="button"
                onClick={(e) => handleRemoveValue(e, opt.value)}
                className="hover:bg-primary-hover rounded p-0.5"
                aria-label={`Remove ${opt.label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      );
    }

    const selectedOpt = options.find((o) => o.value === value);
    if (!selectedOpt) return <span className="text-muted-foreground">{placeholder}</span>;
    return <span className="text-foreground">{selectedOpt.label}</span>;
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`w-full flex flex-col gap-1.5 ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      {label && (
        <label className="text-xs uppercase tracking-wider font-semibold font-display text-foreground/80">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`w-full flex items-center justify-between bg-secondary border text-left px-4 py-3 rounded-lg text-sm text-foreground focus:outline-none transition-all duration-200 min-h-[46px]
            ${error ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}
          `}
        >
          <div className="flex-1 overflow-hidden">{getDisplayValue()}</div>
          <ChevronDown
            size={18}
            className={`text-muted-foreground transition-transform duration-200 ml-2 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={optionsRef}
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              role="listbox"
              className="absolute w-full mt-1.5 bg-card border border-border rounded-lg shadow-xl z-50 max-h-[250px] overflow-y-auto"
            >
              {isSearchable && (
                <div className="sticky top-0 bg-card border-b border-border p-2 flex items-center gap-2 z-10">
                  <Search size={14} className="text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search options..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground focus:outline-none"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')}>
                      <X size={14} className="text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              )}

              {filteredOptions.length === 0 ? (
                <div className="p-3.5 text-sm text-muted-foreground text-center">No options found</div>
              ) : (
                filteredOptions.map((option, idx) => {
                  const selected = isSelected(option.value);
                  const active = idx === activeIndex;

                  return (
                    <div
                      key={option.value}
                      role="option"
                      aria-selected={selected}
                      onClick={() => handleSelectOption(option)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors
                        ${active ? 'bg-secondary/60 text-foreground' : ''}
                        ${selected ? 'font-semibold text-primary' : 'text-foreground/90'}
                      `}
                    >
                      <span>{option.label}</span>
                      {selected && <Check size={16} className="text-primary flex-shrink-0 ml-2" />}
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="text-xs font-medium font-sans leading-none text-danger mt-0.5">{error}</p>}
    </div>
  );
};

export default Select;
