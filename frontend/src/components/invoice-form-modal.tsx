'use client';

import React, { useState } from 'react';
import Modal from './modal';

interface LineItem {
    description: string;
    category: string;
    unitPrice: string;
    quantity: string;
}

interface InvoiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => Promise<void>;
    appointments: Array<{ id: string; appointmentDate: string; patient: { id: string; firstName: string; lastName: string } }>;
    title?: string;
}

const categories = ['CONSULTATION', 'LAB_TEST', 'MEDICATION', 'PROCEDURE', 'OTHER'];

export default function InvoiceFormModal({
    isOpen,
    onClose,
    onSubmit,
    appointments,
    title = 'Create Invoice',
}: InvoiceFormModalProps) {
    const [appointmentId, setAppointmentId] = useState('');
    const [taxRate, setTaxRate] = useState('18');
    const [discount, setDiscount] = useState('0');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<LineItem[]>([
        { description: '', category: 'CONSULTATION', unitPrice: '', quantity: '1' },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addItem = () => {
        setItems([...items, { description: '', category: 'OTHER', unitPrice: '', quantity: '1' }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof LineItem, value: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };

    const subtotal = items.reduce((sum, item) => {
        const price = parseInt(item.unitPrice) || 0;
        const qty = parseInt(item.quantity) || 0;
        return sum + price * qty;
    }, 0);

    const taxAmount = Math.round(subtotal * (parseFloat(taxRate) / 100));
    const discountAmount = parseInt(discount) || 0;
    const total = subtotal + taxAmount - discountAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const selectedApt = appointments.find((a) => a.id === appointmentId);
        if (!selectedApt) {
            setError('Please select an appointment');
            setLoading(false);
            return;
        }

        try {
            await onSubmit({
                appointmentId,
                patientId: selectedApt.patient.id,
                taxRate: parseFloat(taxRate) / 100,
                discountCents: discountAmount,
                notes: notes || undefined,
                items: items.map((item) => ({
                    description: item.description,
                    category: item.category,
                    unitPriceCents: parseInt(item.unitPrice) || 0,
                    quantity: parseInt(item.quantity) || 1,
                })),
            });
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create invoice');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Appointment *</label>
                        <select required value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} className={inputClass}>
                            <option value="">Select appointment...</option>
                            {appointments.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.patient.firstName} {a.patient.lastName} — {new Date(a.appointmentDate).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Tax Rate (%)</label>
                            <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className={inputClass} step="0.01" />
                        </div>
                        <div>
                            <label className={labelClass}>Discount (₹)</label>
                            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">Line Items</label>
                        <button type="button" onClick={addItem} className="text-xs text-teal-600 hover:text-teal-500 font-medium transition-colors">
                            + Add Item
                        </button>
                    </div>
                    <div className="space-y-3">
                        {items.map((item, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-4">
                                    {i === 0 && <label className="block text-xs text-gray-400 mb-1">Description</label>}
                                    <input
                                        required
                                        value={item.description}
                                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                                        className={inputClass}
                                        placeholder="Item description"
                                    />
                                </div>
                                <div className="col-span-3">
                                    {i === 0 && <label className="block text-xs text-gray-400 mb-1">Category</label>}
                                    <select value={item.category} onChange={(e) => updateItem(i, 'category', e.target.value)} className={inputClass}>
                                        {categories.map((c) => (
                                            <option key={c} value={c}>{c.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    {i === 0 && <label className="block text-xs text-gray-400 mb-1">Price (₹)</label>}
                                    <input
                                        type="number"
                                        required
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                                        className={inputClass}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="col-span-2">
                                    {i === 0 && <label className="block text-xs text-gray-400 mb-1">Qty</label>}
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="col-span-1">
                                    {items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(i)} className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={2} placeholder="Invoice notes..." />
                </div>

                {/* Totals */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span><span>{formatAmount(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Tax ({taxRate}%)</span><span>{formatAmount(taxAmount)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                            <span>Discount</span><span>-{formatAmount(discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total</span><span>{formatAmount(total)}</span>
                    </div>
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
                        {loading ? 'Creating...' : 'Create Invoice'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
