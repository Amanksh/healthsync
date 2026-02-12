'use client';

import { useState, useEffect } from 'react';
import Modal from './modal';

interface UserFormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone: string;
}

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone: string | null;
}

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    user?: User | null;
}

export default function UserFormModal({ isOpen, onClose, onSubmit, user }: UserFormModalProps) {
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'DOCTOR',
        phone: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                password: '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                role: user.role || 'DOCTOR',
                phone: user.phone || '',
            });
        } else {
            setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                role: 'DOCTOR',
                phone: '',
            });
        }
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: Record<string, unknown> = { ...formData };
            if (isEditing) {
                delete payload.email;
                delete payload.password;
            }
            await onSubmit(payload);
            onClose();
        } catch (err) {
            console.error('Failed to save user:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const update = (field: keyof UserFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const inputClass =
        'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

    const roleOptions = [
        { value: 'DOCTOR', label: 'Doctor' },
        { value: 'RECEPTIONIST', label: 'Receptionist' },
        { value: 'ADMIN', label: 'Admin' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Staff Member' : 'Add Staff Member'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>First Name *</label>
                        <input
                            type="text"
                            required
                            className={inputClass}
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={(e) => update('firstName', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Last Name *</label>
                        <input
                            type="text"
                            required
                            className={inputClass}
                            placeholder="Last name"
                            value={formData.lastName}
                            onChange={(e) => update('lastName', e.target.value)}
                        />
                    </div>
                </div>

                {/* Email — only on create */}
                {!isEditing && (
                    <div>
                        <label className={labelClass}>Email *</label>
                        <input
                            type="email"
                            required
                            className={inputClass}
                            placeholder="user@hospital.com"
                            value={formData.email}
                            onChange={(e) => update('email', e.target.value)}
                        />
                    </div>
                )}

                {/* Password — only on create */}
                {!isEditing && (
                    <div>
                        <label className={labelClass}>Password *</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            className={inputClass}
                            placeholder="Minimum 8 characters"
                            value={formData.password}
                            onChange={(e) => update('password', e.target.value)}
                        />
                    </div>
                )}

                {/* Role + Phone */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Role *</label>
                        <select
                            required
                            className={inputClass}
                            value={formData.role}
                            onChange={(e) => update('role', e.target.value)}
                        >
                            {roleOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Phone</label>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="+91 9876543210"
                            value={formData.phone}
                            onChange={(e) => update('phone', e.target.value)}
                        />
                    </div>
                </div>

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
                        {submitting ? 'Saving...' : isEditing ? 'Update' : 'Create User'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
