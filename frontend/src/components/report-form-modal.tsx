'use client';

import { useState } from 'react';
import Modal from './modal';
import { ReportType } from '@/lib/api-client';

interface PatientOption {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
    phone: string;
}

interface ReportFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    patients: PatientOption[];
}

const reportTypeOptions: Array<{ value: ReportType; label: string }> = [
    { value: 'BLOOD_REPORT', label: 'Blood report' },
    { value: 'ECG', label: 'ECG' },
    { value: 'ULTRASOUND', label: 'Ultrasound' },
    { value: 'XRAY', label: 'X-ray' },
    { value: 'OTHER', label: 'Other' },
];

export default function ReportFormModal({ isOpen, onClose, onSubmit, patients }: ReportFormModalProps) {
    const [patientId, setPatientId] = useState('');
    const [title, setTitle] = useState('');
    const [type, setType] = useState<ReportType>('BLOOD_REPORT');
    const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const reset = () => {
        setPatientId('');
        setTitle('');
        setType('BLOOD_REPORT');
        setReportDate(new Date().toISOString().slice(0, 10));
        setNotes('');
        setFile(null);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!file) {
            setError('Please attach the report file.');
            return;
        }

        const data = new FormData();
        data.append('patientId', patientId);
        data.append('title', title);
        data.append('type', type);
        data.append('reportDate', reportDate);
        data.append('notes', notes);
        data.append('file', file);

        setSubmitting(true);
        try {
            await onSubmit(data);
            reset();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save report');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Medical Report" size="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className={labelClass}>Patient *</label>
                    <select
                        required
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Select patient</option>
                        {patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                                {patient.firstName} {patient.lastName} ({patient.mrn})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Report type *</label>
                        <select
                            required
                            value={type}
                            onChange={(e) => setType(e.target.value as ReportType)}
                            className={inputClass}
                        >
                            {reportTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Report date *</label>
                        <input
                            type="date"
                            required
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Title *</label>
                    <input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={inputClass}
                        placeholder="CBC report, ECG, ultrasound abdomen..."
                    />
                </div>

                <div>
                    <label className={labelClass}>Report file *</label>
                    <input
                        type="file"
                        required
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={`${inputClass} min-h-24 resize-none`}
                        placeholder="Optional clinical notes"
                    />
                </div>

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
                        className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors disabled:opacity-50 shadow-sm shadow-teal-200"
                    >
                        {submitting ? 'Saving...' : 'Save Report'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
