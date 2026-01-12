// Skeleton for Stats Cards
export function StatsSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
            ))}
        </div>
    );
}

// Skeleton for Table
export function TableSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded w-full sm:w-64 animate-pulse"></div>
                </div>
            </div>

            {/* Desktop Table Skeleton */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <th key={i} className="px-6 py-3">
                                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((row) => (
                            <tr key={row} className="animate-pulse">
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card Skeleton */}
            <div className="block lg:hidden divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                                <div className="h-4 bg-gray-300 rounded w-48 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                                <div className="h-3 bg-gray-200 rounded w-28"></div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
