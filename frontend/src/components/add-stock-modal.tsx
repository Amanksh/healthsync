'use client';

import { useState } from 'react';
import Modal from '@/components/modal';
import { pharmacyApi } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

interface AddStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    medicineId: string;
    medicineName: string;
}

export default function AddStockModal({ isOpen, onClose, onSuccess, medicineId, medicineName }: AddStockModalProps) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        batchNumber: '',
        expiryDate: '',
        quantity: '',
        costPrice: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setLoading(true);
        try {
            const payload = {
                batchNumber: formData.batchNumber,
                expiryDate: formData.expiryDate,
                quantity: parseInt(formData.quantity) || 0,
                costPriceCents: Math.round((parseFloat(formData.costPrice) || 0) * 100),
            };
            await pharmacyApi.addStock(medicineId, payload, token);
            onSuccess();
            onClose();
            setFormData({
                batchNumber: '',
                expiryDate: '',
                quantity: '',
                costPrice: '',
            });
        } catch (err) {
            console.error('Failed to add stock:', err);
            alert('Failed to add stock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add Stock: ${medicineName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                    <input
                        type="text"
                        name="batchNumber"
                        value={formData.batchNumber}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            min="1"
                            className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cost Price (₹)</label>
                        <input
                            type="number"
                            name="costPrice"
                            value={formData.costPrice}
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
                        {loading ? 'Adding Stock...' : 'Add Stock'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
