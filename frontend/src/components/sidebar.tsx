'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
    Building2,
    CalendarDays,
    ClipboardList,
    FileText,
    LayoutDashboard,
    LogOut,
    Pill,
    ReceiptText,
    Stethoscope,
    UserCog,
    UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    iconClass: string;
    iconBgClass: string;
};

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        iconClass: 'text-blue-600',
        iconBgClass: 'bg-blue-50 border-blue-100',
    },
    {
        label: 'Patients',
        href: '/patients',
        icon: UsersRound,
        iconClass: 'text-emerald-600',
        iconBgClass: 'bg-emerald-50 border-emerald-100',
    },
    {
        label: 'Appointments',
        href: '/appointments',
        icon: CalendarDays,
        iconClass: 'text-purple-600',
        iconBgClass: 'bg-purple-50 border-purple-100',
    },
    {
        label: 'OPD',
        href: '/opd',
        icon: Stethoscope,
        iconClass: 'text-teal-600',
        iconBgClass: 'bg-teal-50 border-teal-100',
    },
    {
        label: 'Reports',
        href: '/reports',
        icon: FileText,
        iconClass: 'text-cyan-600',
        iconBgClass: 'bg-cyan-50 border-cyan-100',
    },
    {
        label: 'Billing',
        href: '/billing',
        icon: ReceiptText,
        iconClass: 'text-amber-700',
        iconBgClass: 'bg-amber-50 border-amber-100',
    },
    {
        label: 'Pharmacy',
        href: '/pharmacy',
        icon: Pill,
        iconClass: 'text-rose-600',
        iconBgClass: 'bg-rose-50 border-rose-100',
    },
    {
        label: 'Pharmacy Billing',
        href: '/pharmacy/billing',
        icon: ClipboardList,
        iconClass: 'text-orange-600',
        iconBgClass: 'bg-orange-50 border-orange-100',
    },
];

const hospitalNavItem: NavItem = {
    label: 'Hospitals',
    href: '/hospitals',
    icon: Building2,
    iconClass: 'text-blue-700',
    iconBgClass: 'bg-blue-50 border-blue-100',
};

const staffNavItem: NavItem = {
    label: 'Staff',
    href: '/users',
    icon: UserCog,
    iconClass: 'text-pink-600',
    iconBgClass: 'bg-pink-50 border-pink-100',
};

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const renderNavLink = (item: NavItem) => {
        const Icon = item.icon;

        // Collect all potential routes (including conditional ones to be safe, or just the main ones)
        // Ideally we only check against *active* links, but checking against all valid routes is safer for consistency.
        const allItems = [
            hospitalNavItem,
            staffNavItem,
            ...navItems
        ];

        const isMatch = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

        // Check if there is a more specific match
        const isSuperseded = allItems.some(other =>
            other.href !== item.href &&
            other.href.length > item.href.length &&
            (pathname === other.href || (other.href !== '/dashboard' && pathname.startsWith(other.href + '/')))
        );

        const isActive = isMatch && !isSuperseded;

        return (
            <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
            >
                <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${item.iconBgClass} ${isActive ? 'shadow-sm' : ''}`}>
                    <Icon className={`h-5 w-5 ${item.iconClass}`} strokeWidth={2} />
                </span>
                {item.label}
            </Link>
        );
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200/80 flex flex-col z-40">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-teal-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 text-lg leading-tight">HealthSync</h1>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Hospital Mgmt</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {/* Hospitals link — SUPER_ADMIN only */}
                {user?.role === 'SUPER_ADMIN' && renderNavLink(hospitalNavItem)}

                {/* Staff link — ADMIN and SUPER_ADMIN */}
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && renderNavLink(staffNavItem)}

                {navItems.map((item) => renderNavLink(item))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-xs font-bold text-teal-700 border border-teal-100">
                        {user?.firstName?.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-400 truncate capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-4 w-4" strokeWidth={2} />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
