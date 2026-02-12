'use client';

import React, { useState } from 'react';
import Modal from './modal';

interface PatientFormData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    bloodGroup: string;
    allergies: string;
}

interface PatientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PatientFormData) => Promise<void>;
    initialData?: Partial<PatientFormData>;
    title?: string;
}

const genderOptions = ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title = 'New Patient',
}: PatientFormModalProps) {
    const [form, setForm] = useState<PatientFormData>({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        dateOfBirth: initialData?.dateOfBirth || '',
        gender: initialData?.gender || 'MALE',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        address: initialData?.address || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        zipCode: initialData?.zipCode || '',
        bloodGroup: initialData?.bloodGroup || '',
        allergies: initialData?.allergies || '',
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
            await onSubmit(form);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save patient');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>First Name *</label>
                        <input name="firstName" required value={form.firstName} onChange={handleChange} className={inputClass} placeholder="First name" />
                    </div>
                    <div>
                        <label className={labelClass}>Last Name *</label>
                        <input name="lastName" required value={form.lastName} onChange={handleChange} className={inputClass} placeholder="Last name" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Date of Birth *</label>
                        <input name="dateOfBirth" type="date" required value={form.dateOfBirth} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Gender *</label>
                        <select name="gender" required value={form.gender} onChange={handleChange} className={inputClass}>
                            {genderOptions.map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="patient@email.com" />
                    </div>
                    <div>
                        <label className={labelClass}>Phone *</label>
                        <input name="phone" required value={form.phone} onChange={handleChange} className={inputClass} placeholder="+91..." />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Address</label>
                    <input name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder="Street address" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>City</label>
                        <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="City" />
                    </div>
                    <div>
                        <label className={labelClass}>State</label>
                        <input name="state" value={form.state} onChange={handleChange} className={inputClass} placeholder="State" />
                    </div>
                    <div>
                        <label className={labelClass}>Zip Code</label>
                        <input name="zipCode" value={form.zipCode} onChange={handleChange} className={inputClass} placeholder="Zip" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Blood Group</label>
                        <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={inputClass}>
                            <option value="">Select</option>
                            {bloodGroups.map((bg) => (
                                <option key={bg} value={bg}>{bg}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Allergies</label>
                        <input name="allergies" value={form.allergies} onChange={handleChange} className={inputClass} placeholder="Known allergies" />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-teal-200"
                    >
                        {loading ? 'Saving...' : 'Save Patient'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
