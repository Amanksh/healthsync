'use client';

import { useState } from 'react';
import Modal from '@/components/modal';
import { pharmacyApi } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

interface AddMedicineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddMedicineModal({ isOpen, onClose, onSuccess }: AddMedicineModalProps) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        genericName: '',
        category: '',
        manufacturer: '',
        code: '',
        minStock: '10',
        unitPrice: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                genericName: formData.genericName || undefined,
                category: formData.category || undefined,
                manufacturer: formData.manufacturer || undefined,
                code: formData.code || undefined,
                minStock: parseInt(formData.minStock) || 0,
                unitPriceCents: Math.round((parseFloat(formData.unitPrice) || 0) * 100),
            };
            await pharmacyApi.createMedicine(payload, token);
            onSuccess();
            onClose();
            setFormData({
                name: '',
                genericName: '',
                category: '',
                manufacturer: '',
                code: '',
                minStock: '10',
                unitPrice: '',
            });
        } catch (err) {
            console.error('Failed to create medicine:', err);
            alert('Failed to create medicine');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Medicine">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                        <input
                            type="text"
                            name="genericName"
                            value={formData.genericName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        >
                            <option value="">Select...</option>
                            <option value="Tablet">Tablet</option>
                            <option value="Syrup">Syrup</option>
                            <option value="Injection">Injection</option>
                            <option value="Cream">Cream</option>
                            <option value="Drops">Drops</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                        <input
                            type="text"
                            name="manufacturer"
                            value={formData.manufacturer}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">SKU / Code</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Min Stock (Alert)</label>
                        <input
                            type="number"
                            name="minStock"
                            value={formData.minStock}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unit Price (₹)</label>
                        <input
                            type="number"
                            name="unitPrice"
                            value={formData.unitPrice}
                            onChange={handleChange}
                            required
                            step="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Create Medicine'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
