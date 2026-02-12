import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'purple' | 'rose' | 'amber' | 'green' | 'cyan';
    trend?: string;
}

const colorVariants = {
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    rose: 'bg-rose-500/10 text-rose-400',
    amber: 'bg-amber-500/10 text-amber-400',
    green: 'bg-emerald-500/10 text-emerald-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
};

export default function StatCard({ title, value, icon, color, trend }: StatCardProps) {
    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
                    {trend && <p className="text-xs text-slate-500">{trend}</p>}
                </div>
                <div className={`p-3 rounded-lg ${colorVariants[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
