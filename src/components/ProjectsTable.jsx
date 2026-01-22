import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { TableSkeleton } from './SkeletonLoader';

export default function ProjectsTable({
    projects,
    userRole,
    onViewProject,
    onReviewProject,
    isLoading
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Show skeleton if loading
    if (isLoading) {
        return <TableSkeleton />;
    }

    // Sorting handler
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    // --- HELPER FUNCTIONS ---
    const parseProjectDate = (dateString) => new Date(dateString);

    // 1. IMPROVED: Safe parsing for sorting (handles strings, numbers, or null)
    const parseCost = (costInput) => {
        if (!costInput) return 0;
        // Convert to string, remove currency symbols/commas/spaces
        const cleanString = String(costInput).replace(/[₱P, ]/g, '');
        return parseFloat(cleanString) || 0;
    };

    // 2. NEW: Formatter for Display (e.g. 10000 -> ₱10,000.00)
    const formatCurrency = (amount) => {
        const value = parseCost(amount);
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(value);
    };

    // Filter by search term
    const filteredProjects = projects.filter(proj => {
        const searchLower = searchTerm.toLowerCase();

        // Basic Search
        const matchesSearch = (
            proj.id.toLowerCase().includes(searchLower) ||
            proj.name.toLowerCase().includes(searchLower) ||
            proj.location.toLowerCase().includes(searchLower) ||
            proj.status.toLowerCase().includes(searchLower)
        );

        if (!matchesSearch) return false;

        // Role-based filtering (Optional: Hide non-cleared projects from Scorers)
        if (userRole === 'scorer') {
            // Scorers usually only work on projects that passed Step 1
            return ['CLEARED', 'SCORED', 'FOR_SCORING'].includes(proj.status);
        }

        return true;
    });

    // Sorting logic
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (!sortField) return 0;

        let aValue, bValue;

        switch (sortField) {
            case 'id':
                aValue = a.id.toLowerCase();
                bValue = b.id.toLowerCase();
                break;
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'location':
                aValue = a.location.toLowerCase();
                bValue = b.location.toLowerCase();
                break;
            case 'cost':
                aValue = parseCost(a.cost);
                bValue = parseCost(b.cost);
                break;
            case 'date':
                aValue = parseProjectDate(a.date).getTime();
                bValue = parseProjectDate(b.date).getTime();
                break;
            case 'status':
                aValue = a.status.toLowerCase();
                bValue = b.status.toLowerCase();
                break;
            default:
                return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProjects = sortedProjects.slice(startIndex, endIndex);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    // Sort icon component
    const SortIcon = ({ field }) => {
        if (sortField !== field) {
            return (
                <span className="ml-1 inline-flex flex-col text-gray-400">
                    <svg className="w-3 h-3 -mb-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                    </svg>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" />
                    </svg>
                </span>
            );
        }

        return (
            <span className="ml-1 inline-flex flex-col text-blue-600">
                {sortDirection === 'asc' ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" />
                    </svg>
                )}
            </span>
        );
    };

    // --- HELPER: GET BUTTON TEXT & STYLE ---
    const getActionButton = (role) => {
        if (role === 'ro') {
            return {
                label: 'View',
                className: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            };
        }
        if (role === 'scorer') {
            return {
                label: 'Score',
                className: 'bg-green-600 hover:bg-green-700 text-white border border-green-600'
            };
        }
        // Validator (Default)
        return {
            label: 'Review',
            className: 'bg-blue-700 hover:bg-blue-800 text-white'
        };
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Header with Search */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                        {userRole === 'ro' ? 'My Submissions' :
                            userRole === 'scorer' ? 'Projects Ready for Scoring' :
                                'Projects Awaiting Validation'}
                    </h3>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block lg:hidden divide-y divide-gray-200">
                {currentProjects.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                        {sortedProjects.length === 0 && searchTerm
                            ? `No projects found matching "${searchTerm}"`
                            : userRole === 'ro'
                                ? 'No projects submitted yet. Click "Create Project" to add one.'
                                : 'No projects found.'}
                    </div>
                ) : (
                    currentProjects.map((proj) => (
                        <div key={proj.id} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-gray-500 mb-1">{proj.id}</p>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{proj.name}</h4>
                                    <p className="text-xs text-gray-600">{proj.location}</p>
                                </div>
                                <StatusBadge status={proj.status} />
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                <div>
                                    {/* APPLIED FORMATTER */}
                                    <p className="text-xs text-gray-500">Cost: <span className="font-medium text-gray-900">{formatCurrency(proj.cost)}</span></p>
                                    <p className="text-xs text-gray-500">Date: <span className="font-medium text-gray-900">{proj.date}</span></p>
                                </div>

                                {/* DYNAMIC BUTTON START */}
                                <button
                                    onClick={() => userRole === 'ro' ? onViewProject(proj) : onReviewProject(proj)}
                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${getActionButton(userRole).className}`}
                                >
                                    {getActionButton(userRole).label}
                                </button>
                                {/* DYNAMIC BUTTON END */}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th onClick={() => handleSort('id')} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none">
                                <div className="flex items-center">Project ID<SortIcon field="id" /></div>
                            </th>
                            <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none">
                                <div className="flex items-center">Project Name<SortIcon field="name" /></div>
                            </th>
                            <th onClick={() => handleSort('location')} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none">
                                <div className="flex items-center">Location<SortIcon field="location" /></div>
                            </th>
                            <th onClick={() => handleSort('cost')} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none">
                                <div className="flex items-center">Est. Cost<SortIcon field="cost" /></div>
                            </th>
                            <th onClick={() => handleSort('date')} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none">
                                <div className="flex items-center">Submitted Date<SortIcon field="date" /></div>
                            </th>
                            <th onClick={() => handleSort('status')} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none">
                                <div className="flex items-center">Status<SortIcon field="status" /></div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentProjects.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                                    {sortedProjects.length === 0 && searchTerm
                                        ? `No projects found matching "${searchTerm}"`
                                        : userRole === 'ro'
                                            ? 'No projects submitted yet. Click "Create New Project" to add one.'
                                            : 'No projects found.'}
                                </td>
                            </tr>
                        ) : (
                            currentProjects.map((proj) => (
                                <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{proj.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{proj.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{proj.location}</td>
                                    {/* APPLIED FORMATTER & FONT-MONO */}
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{formatCurrency(proj.cost)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{proj.date}</td>
                                    <td className="px-6 py-4"><StatusBadge status={proj.status} /></td>
                                    <td className="px-6 py-4">

                                        {/* DYNAMIC BUTTON START */}
                                        <button
                                            onClick={() => userRole === 'ro' ? onViewProject(proj) : onReviewProject(proj)}
                                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${getActionButton(userRole).className}`}
                                        >
                                            {getActionButton(userRole).label}
                                        </button>
                                        {/* DYNAMIC BUTTON END */}

                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {sortedProjects.length > 0 && (
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, sortedProjects.length)} of {sortedProjects.length}
                        {searchTerm && ` filtered`} projects
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        <div className="hidden sm:flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => handlePageClick(page)}
                                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${currentPage === page
                                                ? 'bg-blue-700 text-white'
                                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                        </div>

                        <div className="sm:hidden text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </div>

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}