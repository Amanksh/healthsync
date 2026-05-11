'use client';

import { useState, useEffect } from 'react';
import Modal from './modal';

interface WardFormData {
    name: string;
    floor: string;
    type: string;
    description: string;
    bedCount: number;
    bedPrefix: string;
}

interface WardFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    ward?: { id: string; name: string; floor?: string | null; type?: string | null; description?: string | null } | null;
}

export default function WardFormModal({ isOpen, onClose, onSubmit, ward }: WardFormModalProps) {
    const isEditing = !!ward;

    const [formData, setFormData] = useState<WardFormData>({
        name: '', floor: '', type: '', description: '', bedCount: 0, bedPrefix: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (ward) {
            setFormData({
                name: ward.name || '',
                floor: ward.floor || '',
                type: ward.type || '',
                description: ward.description || '',
                bedCount: 0,
                bedPrefix: '',
            });
        } else {
            setFormData({ name: '', floor: '', type: '', description: '', bedCount: 0, bedPrefix: '' });
        }
    }, [ward, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit({
                name: formData.name,
                floor: formData.floor || undefined,
                type: formData.type || undefined,
                description: formData.description || undefined,
                bedCount: formData.bedCount,
                bedPrefix: formData.bedPrefix || undefined,
            });
            onClose();
        } catch (err) {
            console.error('Failed to save ward:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const update = (field: keyof WardFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const inputClass = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

    const wardTypes = ['General', 'ICU', 'CCU', 'NICU', 'Maternity', 'Pediatric', 'Surgical', 'Emergency', 'Psychiatric', 'Orthopedic', 'Other'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Ward' : 'Add New Ward'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Ward Name */}
                <div>
                    <label className={labelClass}>Ward Name *</label>
                    <input
                        type="text"
                        required
                        className={inputClass}
                        placeholder="e.g. North Wing ICU"
                        value={formData.name}
                        onChange={(e) => update('name', e.target.value)}
                    />
                </div>

                {/* Floor + Type */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Floor</label>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="e.g. 4th Floor"
                            value={formData.floor}
                            onChange={(e) => update('floor', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Ward Type</label>
                        <select
                            className={inputClass}
                            value={formData.type}
                            onChange={(e) => update('type', e.target.value)}
                        >
                            <option value="">Select type...</option>
                            {wardTypes.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                        className={inputClass}
                        rows={2}
                        placeholder="Optional description of this ward..."
                        value={formData.description}
                        onChange={(e) => update('description', e.target.value)}
                    />
                </div>

                {/* Bed Generation — only on create */}
                {!isEditing && (
                    <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                            </svg>
                            Auto-Generate Beds
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">Optionally generate beds when creating the ward.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Number of Beds</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className={inputClass}
                                    placeholder="e.g. 10"
                                    value={formData.bedCount || ''}
                                    onChange={(e) => update('bedCount', parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Bed Prefix</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="e.g. NW-4"
                                    value={formData.bedPrefix}
                                    onChange={(e) => update('bedPrefix', e.target.value)}
                                />
                                <p className="text-xs text-gray-400 mt-1">Beds will be: NW-4-01, NW-4-02, ...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-200"
                    >
                        {submitting ? 'Saving...' : isEditing ? 'Update Ward' : 'Create Ward'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
