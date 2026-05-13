'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface SearchableOption {
    value: string;
    label: string;
    sublabel?: string;
    tags?: string[]; // Additional searchable text (phone, MRN, etc.)
}

interface SearchableSelectProps {
    options: SearchableOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    /** When set, calls this function on input change to allow server-side filtering */
    onSearch?: (query: string) => void;
    /** Show a loading indicator */
    isLoading?: boolean;
    noResultsText?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Search...',
    required = false,
    disabled = false,
    className = '',
    onSearch,
    isLoading = false,
    noResultsText = 'No results found',
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Find the currently selected option
    const selectedOption = options.find((o) => o.value === value);

    // Filter options locally (if no server-side search provided)
    const filteredOptions = onSearch
        ? options
        : options.filter((opt) => {
              if (!query) return true;
              const q = query.toLowerCase();
              if (opt.label.toLowerCase().includes(q)) return true;
              if (opt.sublabel?.toLowerCase().includes(q)) return true;
              if (opt.tags?.some((t) => t.toLowerCase().includes(q))) return true;
              return false;
          });

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightIndex] as HTMLElement;
            if (item) {
                item.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightIndex]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setQuery(val);
            setHighlightIndex(-1);
            if (!isOpen) setIsOpen(true);
            if (onSearch) onSearch(val);
        },
        [isOpen, onSearch],
    );

    const handleSelect = useCallback(
        (optValue: string) => {
            onChange(optValue);
            setQuery('');
            setIsOpen(false);
        },
        [onChange],
    );

    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange('');
            setQuery('');
            if (inputRef.current) inputRef.current.focus();
        },
        [onChange],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!isOpen) {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                    e.preventDefault();
                    setIsOpen(true);
                }
                return;
            }

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightIndex((prev) => Math.max(prev - 1, 0));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (highlightIndex >= 0 && filteredOptions[highlightIndex]) {
                        handleSelect(filteredOptions[highlightIndex].value);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    setIsOpen(false);
                    break;
            }
        },
        [isOpen, highlightIndex, filteredOptions, handleSelect],
    );

    const handleOpen = () => {
        if (disabled) return;
        setIsOpen(true);
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const inputClass =
        'w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all';

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Hidden input for form required validation */}
            {required && (
                <input
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ opacity: 0, height: 0, position: 'absolute', pointerEvents: 'none' }}
                    value={value}
                    onChange={() => {}}
                    required
                />
            )}

            {/* Trigger / display */}
            {!isOpen ? (
                <button
                    type="button"
                    onClick={handleOpen}
                    disabled={disabled}
                    className={`${inputClass} text-left flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {selectedOption ? (
                        <div className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-gray-900">{selectedOption.label}</span>
                            {selectedOption.sublabel && (
                                <span className="block text-xs text-gray-400 truncate">{selectedOption.sublabel}</span>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                        {value && (
                            <span
                                onClick={handleClear}
                                className="p-0.5 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </span>
                        )}
                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    </div>
                </button>
            ) : (
                <div className="relative">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className={`${inputClass} pl-9`}
                        placeholder={`Search by name, phone, MRN...`}
                        autoComplete="off"
                    />
                </div>
            )}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl shadow-gray-200/50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Searching...
                        </div>
                    ) : filteredOptions.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-400">
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            {noResultsText}
                        </div>
                    ) : (
                        <ul ref={listRef} className="max-h-60 overflow-y-auto py-1 overscroll-contain">
                            {filteredOptions.map((opt, idx) => {
                                const isHighlighted = idx === highlightIndex;
                                const isSelected = opt.value === value;
                                return (
                                    <li
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                                            isHighlighted
                                                ? 'bg-teal-50'
                                                : isSelected
                                                  ? 'bg-gray-50'
                                                  : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-sm truncate ${
                                                        isSelected ? 'font-semibold text-teal-700' : 'font-medium text-gray-900'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </span>
                                            </div>
                                            {opt.sublabel && (
                                                <p className="text-xs text-gray-400 mt-0.5 truncate">{opt.sublabel}</p>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <svg className="w-4 h-4 text-teal-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
