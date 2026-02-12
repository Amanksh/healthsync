import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'purple' | 'rose' | 'amber' | 'green' | 'cyan' | 'teal';
    trend?: string;
}

const colorVariants = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    teal: 'bg-teal-50 text-teal-600',
};

export default function StatCard({ title, value, icon, color, trend }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                    {trend && <p className="text-xs text-gray-400">{trend}</p>}
                </div>
                <div className={`p-3 rounded-xl ${colorVariants[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
