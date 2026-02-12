'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { userApi } from '@/lib/api-client';
import DataTable, { Column } from '@/components/data-table';
import UserFormModal from '@/components/user-form-modal';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone: string | null;
    isActive: boolean;
    createdAt: string;
    hospital?: { id: string; name: string } | null;
}

interface UsersResponse {
    data: User[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function UsersPage() {
    const { user, token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Only ADMIN and SUPER_ADMIN can access
    const canAccess = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const fetchUsers = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (search) params.set('search', search);
            const res = await userApi.getAll(params.toString(), token) as UsersResponse;
            setUsers(res.data);
            setTotalPages(res.meta.totalPages);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    }, [token, page, search]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleCreate = async (data: Record<string, unknown>) => {
        if (!token) return;
        await userApi.create(data, token);
        fetchUsers();
    };

    const handleUpdate = async (data: Record<string, unknown>) => {
        if (!token || !editingUser) return;
        await userApi.update(editingUser.id, data, token);
        setEditingUser(null);
        fetchUsers();
    };

    const handleToggleActive = async (id: string) => {
        if (!token) return;
        await userApi.toggleActive(id, token);
        fetchUsers();
    };

    if (!canAccess) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-400 text-lg">Access denied. Admin privileges required.</p>
            </div>
        );
    }

    const roleBadgeColors: Record<string, string> = {
        ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        DOCTOR: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        RECEPTIONIST: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };

    const columns: Column<User>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (row: User) => (
                <span className="font-medium text-white">{row.firstName} {row.lastName}</span>
            ),
        },
        { key: 'email', header: 'Email' },
        {
            key: 'role',
            header: 'Role',
            render: (row: User) => (
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${roleBadgeColors[row.role] || 'bg-slate-700 text-slate-300'}`}>
                    {row.role}
                </span>
            ),
        },
        { key: 'phone', header: 'Phone' },
        {
            key: 'isActive',
            header: 'Status',
            render: (row: User) => (
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${row.isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: User) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setEditingUser(row)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                        title="Edit"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleToggleActive(row.id)}
                        className={`p-1.5 transition-colors ${row.isActive ? 'text-slate-400 hover:text-amber-400' : 'text-slate-400 hover:text-emerald-400'}`}
                        title={row.isActive ? 'Deactivate' : 'Activate'}
                    >
                        {row.isActive ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        )}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Staff</h1>
                    <p className="text-slate-400 mt-1">Manage doctors, receptionists, and staff</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20"
                >
                    + Add Staff
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm"
                />
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={users}
                isLoading={loading}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                emptyMessage="No staff members found."
            />

            {/* Create Modal */}
            <UserFormModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreate}
            />

            {/* Edit Modal */}
            <UserFormModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                onSubmit={handleUpdate}
                user={editingUser}
            />
        </div>
    );
}
