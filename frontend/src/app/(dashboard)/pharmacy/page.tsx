'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { pharmacyApi } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function PharmacyDashboard() {
    const { token } = useAuth();
    const [lowStockMedicines, setLowStockMedicines] = useState<any[]>([]);
    const [recentMedicines, setRecentMedicines] = useState<any[]>([]);
    const [totalMedicines, setTotalMedicines] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        const loadDashboard = async () => {
            try {
                // Fetch Low Stock Alerts
                const alerts = await pharmacyApi.getLowStock(token);
                setLowStockMedicines(alerts || []);

                const medicinesRes = await pharmacyApi.getAllMedicines('limit=20', token);
                setTotalMedicines(medicinesRes.meta.total);
                setRecentMedicines(medicinesRes.data);

            } catch (err) {
                console.error('Failed to load pharmacy dashboard:', err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [token]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Pharmacy Dashboard</h1>
                <div className="space-x-4">
                    <Link
                        href="/pharmacy/inventory"
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                        Manage Inventory
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Low Stock Alerts</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{lowStockMedicines.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Medicines</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                        {loading ? '-' : totalMedicines}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Expiring Soon</h3>
                    <p className="text-3xl font-bold text-orange-600 mt-2">-</p>
                </div>
            </div>

            {/* Low Stock Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Critical Low Stock</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">Medicine Name</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Category</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Current Stock</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Min. Level</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : lowStockMedicines.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No low stock alerts</td></tr>
                            ) : (
                                lowStockMedicines.map((med) => (
                                    <tr key={med.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{med.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{med.category || '-'}</td>
                                        <td className="px-6 py-4 text-red-600 font-bold">{med.totalStock}</td>
                                        <td className="px-6 py-4 text-gray-600">{med.minStock}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                                                Low Stock
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Medicines List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Medicines</h2>
                    <Link href="/pharmacy/inventory" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Generic Name</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Category</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Price</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : recentMedicines.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No medicines found</td></tr>
                            ) : (
                                recentMedicines.map((med) => (
                                    <tr key={med.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{med.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{med.genericName || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{med.category || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatCurrency(med.unitPriceCents / 100)}</td>
                                        <td className={`px-6 py-4 font-medium ${med.totalStock <= med.minStock ? 'text-red-600' : 'text-gray-900'}`}>
                                            {med.totalStock}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
