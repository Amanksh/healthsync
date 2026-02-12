'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { patientApi, appointmentApi, invoiceApi } from '@/lib/api-client';
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
    SCHEDULED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    COMPLETED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    CANCELLED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    NO_SHOW: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

export default function DashboardPage() {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const chartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!token) return;
        loadStats();
    }, [token]);

    useEffect(() => {
        if (stats && chartRef.current) {
            drawChart();
        }
    }, [stats]);

    async function loadStats() {
        try {
            const [patientsRes, appointmentsRes, invoicesRes] = await Promise.all([
                patientApi.getAll('limit=1', token!) as Promise<{ data: unknown[]; meta: { total: number } }>,
                appointmentApi.getAll('limit=100', token!) as Promise<{ data: Array<{ status: string; appointmentDate: string; reason: string; id: string; patient: { firstName: string; lastName: string }; provider: { firstName: string; lastName: string } }>; meta: { total: number } }>,
                invoiceApi.getAll('limit=100', token!) as Promise<{ data: Array<{ paymentStatus: string; totalCents: number }>; meta: { total: number } }>,
            ]);

            const appointments = appointmentsRes.data || [];
            const invoices = invoicesRes.data || [];

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
                totalPatients: patientsRes.meta?.total || 0,
                todayAppointments: upcomingAppointments,
                pendingInvoices,
                totalRevenue,
                appointmentsByStatus: statusCounts,
                recentAppointments: appointments.slice(0, 5),
            });
        } catch (err) {
            console.error('Failed to load dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    }

    function drawChart() {
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
        const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];
        const values = statuses.map((s) => stats.appointmentsByStatus[s] || 0);
        const maxVal = Math.max(...values, 1);

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const barWidth = chartWidth / statuses.length * 0.6;
        const gap = chartWidth / statuses.length;

        // Y-axis grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            ctx.fillStyle = '#64748b';
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
            gradient.addColorStop(1, colors[i] + '40');
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
                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 13px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(String(val), x + barWidth / 2, y - 8);
            }

            // Label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], x + barWidth / 2, height - 10);
        });
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Loading overview...</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-900/80 border border-slate-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">Hospital management overview</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={stats?.totalPatients || 0}
                    color="blue"
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
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    color="cyan"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    }
                    trend="Total collected"
                />
            </div>

            {/* Charts + Recent Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Appointments by Status</h2>
                    <canvas ref={chartRef} className="w-full" style={{ height: '220px' }} />
                </div>

                {/* Recent Appointments */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Appointments</h2>
                    <div className="space-y-3">
                        {stats?.recentAppointments.length === 0 && (
                            <p className="text-slate-500 text-sm">No appointments yet.</p>
                        )}
                        {stats?.recentAppointments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {apt.patient.firstName} {apt.patient.lastName}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Dr. {apt.provider.lastName} • {formatDateTime(apt.appointmentDate)}
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
        </div>
    );
}
