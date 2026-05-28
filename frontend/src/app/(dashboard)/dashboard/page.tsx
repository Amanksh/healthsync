'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { patientApi, appointmentApi, invoiceApi, pharmacyApi, wardApi } from '@/lib/api-client';
import type { Medicine, WardSummary } from '@/lib/api-client';
import StatCard from '@/components/stat-card';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface DashboardStats {
    totalPatients: number;
    todayAppointments: number;
    pendingInvoices: number;
    totalRevenue: number;
    appointmentsByStatus: Record<string, number>;
    recentAppointments: Array<{
        id: string;
        appointmentDate: string;
        status: string;
        reason: string;
        patient: { firstName: string; lastName: string };
        provider: { firstName: string; lastName: string };
    }>;
}

const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    NO_SHOW: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function DashboardPage() {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const revenueChartRef = useRef<HTMLCanvasElement>(null);
    const [wardSummary, setWardSummary] = useState<WardSummary | null>(null);
    const [lowStockMeds, setLowStockMeds] = useState<Medicine[]>([]);

    const loadStats = useCallback(async () => {
        if (!token) return;
        try {
            // Use allSettled so a 403 on one endpoint doesn't break the whole dashboard
            const [patientsResult, appointmentsResult, invoicesResult] = await Promise.allSettled([
                patientApi.getAll('limit=1', token) as Promise<{ data: unknown[]; meta: { total: number } }>,
                appointmentApi.getAll('limit=100', token) as Promise<{ data: Array<{ status: string; appointmentDate: string; reason: string; id: string; patient: { firstName: string; lastName: string }; provider: { firstName: string; lastName: string } }>; meta: { total: number } }>,
                invoiceApi.getAll('limit=100', token) as Promise<{ data: Array<{ paymentStatus: string; totalCents: number }>; meta: { total: number } }>,
            ]);

            const patientsRes = patientsResult.status === 'fulfilled' ? patientsResult.value : null;
            const appointmentsRes = appointmentsResult.status === 'fulfilled' ? appointmentsResult.value : null;
            const invoicesRes = invoicesResult.status === 'fulfilled' ? invoicesResult.value : null;

            const appointments = appointmentsRes?.data || [];
            const invoices = invoicesRes?.data || [];

            // Count upcoming appointments (today and future)
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const upcomingAppointments = appointments.filter(
                (a) => new Date(a.appointmentDate) >= now && a.status === 'SCHEDULED'
            ).length;

            const statusCounts: Record<string, number> = {};
            appointments.forEach((a) => {
                statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
            });

            const pendingInvoices = invoices.filter((inv) => inv.paymentStatus === 'PENDING').length;
            const totalRevenue = invoices
                .filter((inv) => inv.paymentStatus === 'PAID')
                .reduce((sum, inv) => sum + inv.totalCents, 0);

            setStats({
                totalPatients: patientsRes?.meta?.total || 0,
                todayAppointments: upcomingAppointments,
                pendingInvoices,
                totalRevenue,
                appointmentsByStatus: statusCounts,
                recentAppointments: appointments.slice(0, 5),
            });

            // Load additional data for new widgets (non-blocking)
            Promise.allSettled([
                wardApi.getSummary(token),
                pharmacyApi.getLowStock(token),
            ]).then(([wardResult, stockResult]) => {
                if (wardResult.status === 'fulfilled') setWardSummary(wardResult.value);
                if (stockResult.status === 'fulfilled') setLowStockMeds(stockResult.value);
            });
        } catch (err) {
            console.error('Failed to load dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const drawChart = useCallback(() => {
        const canvas = chartRef.current;
        if (!canvas || !stats) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 20, right: 20, bottom: 40, left: 50 };

        ctx.clearRect(0, 0, width, height);

        const statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
        const labels = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];
        const colors = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b'];
        const values = statuses.map((s) => stats.appointmentsByStatus[s] || 0);
        const maxVal = Math.max(...values, 1);

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const barWidth = chartWidth / statuses.length * 0.6;
        const gap = chartWidth / statuses.length;

        // Y-axis grid
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(
                String(Math.round(maxVal - (maxVal / 4) * i)),
                padding.left - 8,
                y + 4
            );
        }

        // Bars
        values.forEach((val, i) => {
            const barHeight = (val / maxVal) * chartHeight;
            const x = padding.left + gap * i + (gap - barWidth) / 2;
            const y = padding.top + chartHeight - barHeight;

            // Bar with gradient
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, colors[i]);
            gradient.addColorStop(1, colors[i] + '60');
            ctx.fillStyle = gradient;

            // Rounded top
            const radius = 6;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + barWidth - radius, y);
            ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
            ctx.lineTo(x + barWidth, y + barHeight);
            ctx.lineTo(x, y + barHeight);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.fill();

            // Value on top
            if (val > 0) {
                ctx.fillStyle = '#1e293b';
                ctx.font = 'bold 13px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(String(val), x + barWidth / 2, y - 8);
            }

            // Label
            ctx.fillStyle = '#64748b';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], x + barWidth / 2, height - 10);
        });
    }, [stats]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        if (stats && chartRef.current) {
            drawChart();
        }
    }, [stats, drawChart]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Loading overview...</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-white border border-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Hospital management overview</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats?.totalPatients || 0}
                    color="teal"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                    }
                    trend="All registered patients"
                />
                <StatCard
                    title="Upcoming Appointments"
                    value={stats?.todayAppointments || 0}
                    color="green"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                    }
                    trend="Scheduled upcoming"
                />
                <StatCard
                    title="Pending Invoices"
                    value={stats?.pendingInvoices || 0}
                    color="amber"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    }
                    trend="Awaiting payment"
                />
                <StatCard
                    title="Revenue (Paid)"
                    value={formatCurrency((stats?.totalRevenue || 0) / 100)}
                    color="cyan"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    }
                    trend="Total collected"
                />
            </div>

            {/* Bed Occupancy + Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bed Occupancy */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Bed Occupancy</h2>
                        {wardSummary && (
                            <span className="text-sm font-medium text-teal-600">
                                {wardSummary.occupancyRate.toFixed(0)}% occupied
                            </span>
                        )}
                    </div>
                    {!wardSummary ? (
                        <p className="text-gray-400 text-sm">No ward data available.</p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                    <span>{wardSummary.occupiedBeds} occupied</span>
                                    <span>{wardSummary.availableBeds} available</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                                    <div
                                        className="bg-teal-500 transition-all duration-700"
                                        style={{ width: `${wardSummary.totalBeds ? (wardSummary.occupiedBeds / wardSummary.totalBeds) * 100 : 0}%` }}
                                    />
                                    <div
                                        className="bg-amber-400 transition-all duration-700"
                                        style={{ width: `${wardSummary.totalBeds ? (wardSummary.maintenanceBeds / wardSummary.totalBeds) * 100 : 0}%` }}
                                    />
                                </div>
                                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> Occupied</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Maintenance</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block" /> Available</span>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {wardSummary.wardBreakdown.map((w) => (
                                    <div key={w.wardId} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50">
                                        <div className="min-w-0">
                                            <span className="font-medium text-gray-800 truncate">{w.wardName}</span>
                                            {w.floor && <span className="text-xs text-gray-400 ml-1.5">· {w.floor}</span>}
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap ml-2">
                                            {w.occupied}/{w.total} beds
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
                        {lowStockMeds.length > 0 && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-600">
                                {lowStockMeds.length}
                            </span>
                        )}
                    </div>
                    {lowStockMeds.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-2 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <p className="text-sm">All medicines adequately stocked.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto">
                            {lowStockMeds.map((med) => {
                                const pct = med.minStock > 0 ? Math.min((med.totalStock / med.minStock) * 100, 100) : 0;
                                const isOut = med.totalStock === 0;
                                return (
                                    <div key={med.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-medium text-gray-800 truncate">{med.name}</span>
                                            <span className={`text-xs font-bold ${isOut ? 'text-rose-600' : 'text-amber-600'}`}>
                                                {isOut ? 'OUT OF STOCK' : `${med.totalStock} left`}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isOut ? 'bg-rose-500' : pct < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">Min required: {med.minStock}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Charts + Recent Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointments by Status</h2>
                    <canvas ref={chartRef} className="w-full" style={{ height: '220px' }} />
                </div>

                {/* Recent Appointments */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h2>
                    <div className="space-y-3">
                        {stats?.recentAppointments.length === 0 && (
                            <p className="text-gray-400 text-sm">No appointments yet.</p>
                        )}
                        {stats?.recentAppointments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {apt.patient.firstName} {apt.patient.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Dr. {apt.provider.lastName} &middot; {formatDateTime(apt.appointmentDate)}
                                    </p>
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[apt.status] || ''}`}>
                                    {apt.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 4: Revenue Breakdown + Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Breakdown */}
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {(() => {
                            const paid = stats?.totalRevenue || 0;
                            const invoices = stats ? Object.keys(stats.appointmentsByStatus).length : 0;
                            return (
                                <>
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <p className="text-xs text-emerald-600 font-medium mb-1">Collected</p>
                                        <p className="text-xl font-bold text-emerald-700">{formatCurrency(paid / 100)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                                        <p className="text-xs text-amber-600 font-medium mb-1">Pending</p>
                                        <p className="text-xl font-bold text-amber-700">{stats?.pendingInvoices || 0} invoices</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                                        <p className="text-xs text-blue-600 font-medium mb-1">Appointments</p>
                                        <p className="text-xl font-bold text-blue-700">{invoices > 0 ? Object.values(stats!.appointmentsByStatus).reduce((a, b) => a + b, 0) : 0}</p>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                    {/* Invoice status distribution bar */}
                    {stats && (
                        <div className="mt-5">
                            <p className="text-xs text-gray-500 mb-2">Appointment Status Distribution</p>
                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                                {(() => {
                                    const total = Object.values(stats.appointmentsByStatus).reduce((a, b) => a + b, 0) || 1;
                                    const segments = [
                                        { key: 'COMPLETED', color: 'bg-emerald-500' },
                                        { key: 'SCHEDULED', color: 'bg-blue-500' },
                                        { key: 'CANCELLED', color: 'bg-rose-400' },
                                        { key: 'NO_SHOW', color: 'bg-amber-400' },
                                    ];
                                    return segments.map(({ key, color }) => {
                                        const count = stats.appointmentsByStatus[key] || 0;
                                        return (
                                            <div
                                                key={key}
                                                className={`${color} transition-all duration-700`}
                                                style={{ width: `${(count / total) * 100}%` }}
                                                title={`${key}: ${count}`}
                                            />
                                        );
                                    });
                                })()}
                            </div>
                            <div className="flex gap-4 mt-2 text-[10px] text-gray-400">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Completed</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Scheduled</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Cancelled</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> No Show</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Summary Panel */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Quick Summary</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 border border-teal-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15" />
                                    </svg>
                                </div>
                                <span className="text-sm text-gray-700">Total Wards</span>
                            </div>
                            <span className="text-lg font-bold text-teal-700">{wardSummary?.totalWards || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
                                    </svg>
                                </div>
                                <span className="text-sm text-gray-700">Total Beds</span>
                            </div>
                            <span className="text-lg font-bold text-blue-700">{wardSummary?.totalBeds || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                    </svg>
                                </div>
                                <span className="text-sm text-gray-700">Low Stock Items</span>
                            </div>
                            <span className={`text-lg font-bold ${lowStockMeds.length > 0 ? 'text-rose-600' : 'text-purple-700'}`}>{lowStockMeds.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                    </svg>
                                </div>
                                <span className="text-sm text-gray-700">Completion Rate</span>
                            </div>
                            <span className="text-lg font-bold text-cyan-700">
                                {stats ? (() => {
                                    const total = Object.values(stats.appointmentsByStatus).reduce((a, b) => a + b, 0);
                                    const completed = stats.appointmentsByStatus['COMPLETED'] || 0;
                                    return total > 0 ? `${((completed / total) * 100).toFixed(0)}%` : '—';
                                })() : '—'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
