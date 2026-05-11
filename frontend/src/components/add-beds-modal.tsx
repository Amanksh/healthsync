'use client';

import { useState } from 'react';
import Modal from './modal';

interface AddBedsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (beds: { bedNumber: string; notes?: string }[]) => Promise<void>;
    wardName: string;
}

export default function AddBedsModal({ isOpen, onClose, onSubmit, wardName }: AddBedsModalProps) {
    const [mode, setMode] = useState<'bulk' | 'manual'>('bulk');
    const [bedCount, setBedCount] = useState(1);
    const [prefix, setPrefix] = useState('');
    const [startNum, setStartNum] = useState(1);
    const [manualBeds, setManualBeds] = useState([{ bedNumber: '', notes: '' }]);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let beds: { bedNumber: string; notes?: string }[];
            if (mode === 'bulk') {
                beds = Array.from({ length: bedCount }, (_, i) => ({
                    bedNumber: `${prefix}${String(startNum + i).padStart(2, '0')}`,
                }));
            } else {
                beds = manualBeds.filter((b) => b.bedNumber.trim());
            }
            if (beds.length === 0) return;
            await onSubmit(beds);
            onClose();
            setBedCount(1);
            setPrefix('');
            setStartNum(1);
            setManualBeds([{ bedNumber: '', notes: '' }]);
        } catch (err) {
            console.error('Failed to add beds:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const addManualRow = () => setManualBeds([...manualBeds, { bedNumber: '', notes: '' }]);
    const removeManualRow = (i: number) => setManualBeds(manualBeds.filter((_, idx) => idx !== i));
    const updateManualRow = (i: number, field: 'bedNumber' | 'notes', value: string) => {
        const updated = [...manualBeds];
        updated[i][field] = value;
        setManualBeds(updated);
    };

    const inputClass = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add Beds to ${wardName}`} size="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Mode Toggle */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setMode('bulk')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'bulk' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Bulk Generate
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('manual')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Manual Entry
                    </button>
                </div>

                {mode === 'bulk' ? (
                    <>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Prefix *</label>
                                <input type="text" required className={inputClass} placeholder="e.g. NW-" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Start #</label>
                                <input type="number" min="1" className={inputClass} value={startNum} onChange={(e) => setStartNum(parseInt(e.target.value) || 1)} />
                            </div>
                            <div>
                                <label className={labelClass}>Count *</label>
                                <input type="number" required min="1" max="50" className={inputClass} value={bedCount} onChange={(e) => setBedCount(parseInt(e.target.value) || 1)} />
                            </div>
                        </div>
                        {/* Preview */}
                        {bedCount > 0 && prefix && (
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                <p className="text-xs font-medium text-gray-500 mb-2">Preview:</p>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: Math.min(bedCount, 12) }, (_, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-mono text-gray-700">
                                            {prefix}{String(startNum + i).padStart(2, '0')}
                                        </span>
                                    ))}
                                    {bedCount > 12 && <span className="px-2.5 py-1 text-xs text-gray-400">+{bedCount - 12} more</span>}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-3">
                        {manualBeds.map((bed, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="flex-1">
                                    <input type="text" className={inputClass} placeholder="Bed number" value={bed.bedNumber} onChange={(e) => updateManualRow(i, 'bedNumber', e.target.value)} />
                                </div>
                                <div className="flex-1">
                                    <input type="text" className={inputClass} placeholder="Notes (optional)" value={bed.notes} onChange={(e) => updateManualRow(i, 'notes', e.target.value)} />
                                </div>
                                {manualBeds.length > 1 && (
                                    <button type="button" onClick={() => removeManualRow(i)} className="mt-2 text-gray-400 hover:text-red-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addManualRow} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add another bed
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-200">
                        {submitting ? 'Adding...' : `Add Beds`}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
