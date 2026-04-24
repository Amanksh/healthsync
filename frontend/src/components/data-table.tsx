'use client';

import React from 'react';

export interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    accessor?: keyof T;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    keyExtractor?: (item: T) => string;
}

export default function DataTable<T extends { id?: string }>({
    columns,
    data,
    isLoading = false,
    page = 1,
    totalPages = 1,
    onPageChange,
    emptyMessage = 'No data available',
    onRowClick,
    keyExtractor,
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-50 border-b border-gray-100" />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="flex-1 h-4 bg-gray-100 rounded" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-gray-400">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/80 border-b border-gray-100">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={col.key || index}
                                    className={`px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((item, index) => {
                            const rowKey = keyExtractor ? keyExtractor(item) : (item.id || index.toString());
                            return (
                                <tr
                                    key={rowKey}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    className={`transition-colors duration-150 ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50/50'}`}
                                >
                                    {columns.map((col, colIndex) => (
                                        <td key={`${rowKey}-${colIndex}`} className={`px-6 py-4 text-gray-600 whitespace-nowrap ${col.className || ''}`}>
                                            {col.render
                                                ? col.render(item)
                                                : (col.accessor
                                                    ? (item[col.accessor] as React.ReactNode)
                                                    : ((item as Record<string, unknown>)[col.key] as React.ReactNode))
                                            }
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {(totalPages > 1 && onPageChange) && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                    <span className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
