'use client';

import { useState } from 'react';
import Modal from './modal';
import type { Admission } from '@/lib/api-client';

interface DischargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { notes?: string }) => Promise<void>;
    admission: Admission | null;
}

export default function DischargeModal({ isOpen, onClose, onSubmit, admission }: DischargeModalProps) {
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit({ notes: notes || undefined });
            onClose();
            setNotes('');
        } catch (err) {
            console.error('Failed to discharge:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!admission) return null;

    const inputClass = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Discharge Patient" size="md">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Patient Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {admission.patient.firstName} {admission.patient.lastName}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">{admission.patient.mrn}</p>
                            <p className="text-xs text-gray-600 mt-1">
                                Bed: <span className="font-medium">{admission.bed.bedNumber}</span>
                                {admission.diagnosis && <> · Dx: <span className="font-medium">{admission.diagnosis}</span></>}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Admitted: {new Date(admission.admissionDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-600">
                    Are you sure you want to discharge this patient? The bed will be marked as available.
                </p>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Discharge Notes</label>
                    <textarea
                        className={inputClass}
                        rows={3}
                        placeholder="Discharge summary, instructions, follow-up..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50 shadow-sm shadow-red-200">
                        {submitting ? 'Discharging...' : 'Confirm Discharge'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
