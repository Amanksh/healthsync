'use client';

import React, { useState } from 'react';
import Modal from './modal';

interface AppointmentFormData {
    patientId: string;
    providerId: string;
    appointmentDate: string;
    appointmentTime: string;
    durationMinutes: string;
    reason: string;
    notes: string;
}

interface AppointmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    patients: Array<{ id: string; firstName: string; lastName: string; mrn: string }>;
    providers: Array<{ id: string; firstName: string; lastName: string }>;
    initialData?: Record<string, string>;
    title?: string;
}

export default function AppointmentFormModal({
    isOpen,
    onClose,
    onSubmit,
    patients,
    providers,
    initialData,
    title = 'Book Appointment',
}: AppointmentFormModalProps) {
    const [form, setForm] = useState<AppointmentFormData>({
        patientId: initialData?.patientId || '',
        providerId: initialData?.providerId || '',
        appointmentDate: initialData?.appointmentDate || '',
        appointmentTime: initialData?.appointmentTime || '09:00',
        durationMinutes: initialData?.durationMinutes || '30',
        reason: initialData?.reason || '',
        notes: initialData?.notes || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const dateTime = new Date(`${form.appointmentDate}T${form.appointmentTime}`);
            await onSubmit({
                patientId: form.patientId,
                providerId: form.providerId,
                appointmentDate: dateTime.toISOString(),
                durationMinutes: parseInt(form.durationMinutes),
                reason: form.reason || undefined,
                notes: form.notes || undefined,
            });
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save appointment');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
                        {error}
                    </div>
                )}
                <div>
                    <label className={labelClass}>Patient *</label>
                    <select name="patientId" required value={form.patientId} onChange={handleChange} className={inputClass}>
                        <option value="">Select patient...</option>
                        {patients.map((p) => (
                            <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Doctor *</label>
                    <select name="providerId" required value={form.providerId} onChange={handleChange} className={inputClass}>
                        <option value="">Select doctor...</option>
                        {providers.map((d) => (
                            <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Date *</label>
                        <input name="appointmentDate" type="date" required value={form.appointmentDate} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Time *</label>
                        <input name="appointmentTime" type="time" required value={form.appointmentTime} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Duration (min)</label>
                        <select name="durationMinutes" value={form.durationMinutes} onChange={handleChange} className={inputClass}>
                            <option value="15">15 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Reason</label>
                    <input name="reason" value={form.reason} onChange={handleChange} className={inputClass} placeholder="Reason for visit" />
                </div>
                <div>
                    <label className={labelClass}>Notes</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} className={inputClass} rows={3} placeholder="Additional notes..." />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 transition-colors disabled:opacity-50 shadow-sm shadow-teal-200"
                    >
                        {loading ? 'Saving...' : 'Save Appointment'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
