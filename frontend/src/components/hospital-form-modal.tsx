'use client';

import { useState, useEffect } from 'react';
import Modal from './modal';

interface HospitalFormData {
    name: string;
    branch: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    managerName: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
}

interface Hospital {
    id: string;
    name: string;
    branch: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    phone: string | null;
    managerName: string | null;
}

interface HospitalFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    hospital?: Hospital | null;
}

export default function HospitalFormModal({ isOpen, onClose, onSubmit, hospital }: HospitalFormModalProps) {
    const isEditing = !!hospital;

    const [formData, setFormData] = useState<HospitalFormData>({
        name: '',
        branch: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        managerName: '',
        adminEmail: '',
        adminPassword: '',
        adminFirstName: '',
        adminLastName: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (hospital) {
            setFormData({
                name: hospital.name || '',
                branch: hospital.branch || '',
                address: hospital.address || '',
                city: hospital.city || '',
                state: hospital.state || '',
                zipCode: hospital.zipCode || '',
                phone: hospital.phone || '',
                managerName: hospital.managerName || '',
                adminEmail: '',
                adminPassword: '',
                adminFirstName: '',
                adminLastName: '',
            });
        } else {
            setFormData({
                name: '',
                branch: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                phone: '',
                managerName: '',
                adminEmail: '',
                adminPassword: '',
                adminFirstName: '',
                adminLastName: '',
            });
        }
    }, [hospital, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: Record<string, unknown> = {
                name: formData.name,
                branch: formData.branch,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                phone: formData.phone,
                managerName: formData.managerName,
            };

            // Include admin fields only on create and if email provided
            if (!isEditing && formData.adminEmail) {
                payload.adminEmail = formData.adminEmail;
                payload.adminPassword = formData.adminPassword;
                payload.adminFirstName = formData.adminFirstName;
                payload.adminLastName = formData.adminLastName;
            }

            await onSubmit(payload);
            onClose();
        } catch (err) {
            console.error('Failed to save hospital:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const update = (field: keyof HospitalFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const inputClass =
        'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Hospital' : 'Add New Hospital'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Organization Name */}
                <div>
                    <label className={labelClass}>Organization Name *</label>
                    <input
                        type="text"
                        required
                        className={inputClass}
                        placeholder="e.g. City General Hospital"
                        value={formData.name}
                        onChange={(e) => update('name', e.target.value)}
                    />
                </div>

                {/* Branch + Manager */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Branch</label>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="e.g. Main Campus"
                            value={formData.branch}
                            onChange={(e) => update('branch', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Manager</label>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="e.g. Dr. Smith"
                            value={formData.managerName}
                            onChange={(e) => update('managerName', e.target.value)}
                        />
                    </div>
                </div>

                {/* Address */}
                <div>
                    <label className={labelClass}>Address</label>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Street address"
                        value={formData.address}
                        onChange={(e) => update('address', e.target.value)}
                    />
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>City</label>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => update('city', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>State</label>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="State"
                            value={formData.state}
                            onChange={(e) => update('state', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>ZIP Code</label>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="ZIP"
                            value={formData.zipCode}
                            onChange={(e) => update('zipCode', e.target.value)}
                        />
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className={labelClass}>Phone</label>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="+91 1234567890"
                        value={formData.phone}
                        onChange={(e) => update('phone', e.target.value)}
                    />
                </div>

                {/* Admin Account — only on create */}
                {!isEditing && (
                    <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            Admin Account
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">Create an admin user who will manage this hospital.</p>
                        <div className="space-y-4">
                            {/* Admin Name */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className={inputClass}
                                        placeholder="Admin first name"
                                        value={formData.adminFirstName}
                                        onChange={(e) => update('adminFirstName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className={inputClass}
                                        placeholder="Admin last name"
                                        value={formData.adminLastName}
                                        onChange={(e) => update('adminLastName', e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* Admin Email */}
                            <div>
                                <label className={labelClass}>Admin Email *</label>
                                <input
                                    type="email"
                                    required
                                    className={inputClass}
                                    placeholder="admin@hospital.com"
                                    value={formData.adminEmail}
                                    onChange={(e) => update('adminEmail', e.target.value)}
                                />
                            </div>
                            {/* Admin Password */}
                            <div>
                                <label className={labelClass}>Admin Password *</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    className={inputClass}
                                    placeholder="Minimum 8 characters"
                                    value={formData.adminPassword}
                                    onChange={(e) => update('adminPassword', e.target.value)}
                                />
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
                        className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors disabled:opacity-50 shadow-sm shadow-teal-200"
                    >
                        {submitting ? 'Saving...' : isEditing ? 'Update Hospital' : 'Create Hospital'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
