import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import CreateProposalModal from '../components/CreateProposalModal';
import ViewProjectModal from '../components/ViewProjectModal';
import ReviewProjectModal from '../components/ReviewProjectModal';

export default function DashboardScreen({ projects, onLogout, userRole }) {
    const [activeTab, setActiveTab] = useState(userRole === 'ro' ? 'dashboard' : 'queue');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectsList, setProjectsList] = useState(projects);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Sorting states
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleCreateProject = (newProject) => {
        setProjectsList([newProject, ...projectsList]);
        setCurrentPage(1);
    };

    const handleViewProject = (project) => {
        setSelectedProject(project);
        setIsViewModalOpen(true);
    };

    const handleReviewProject = (project) => {
        setSelectedProject(project);
        setIsReviewModalOpen(true);
    };

    const handleValidatorDecision = (projectId, decision) => {
        setProjectsList(prevProjects =>
            prevProjects.map(proj => {
                if (proj.id !== projectId) return proj;

                if (decision.action === 'clear') {
                    return {
                        ...proj,
                        status: 'CLEARED',
                        priority: decision.priority,
                        validatorNotes: decision.notes,
                        clearedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                    };
                } else if (decision.action === 'return') {
                    return {
                        ...proj,
                        status: 'RETURNED',
                        deficiencies: decision.deficiencies,
                        validatorNotes: decision.notes,
                        returnedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                    };
                } else if (decision.action === 'hold') {
                    return {
                        ...proj,
                        status: 'ON_HOLD',
                        validatorNotes: decision.notes,
                        holdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                    };
                }
                return proj;
            })
        );
    };

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

    // Helper function to parse date string
    const parseProjectDate = (dateString) => {
        return new Date(dateString);
    };

    // Helper function to parse cost
    const parseCost = (costString) => {
        return parseFloat(costString.replace(/[₱,]/g, ''));
    };

    // Filter by search term
    const filteredProjects = projectsList.filter(proj => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            proj.id.toLowerCase().includes(searchLower) ||
            proj.name.toLowerCase().includes(searchLower) ||
            proj.location.toLowerCase().includes(searchLower) ||
            proj.status.toLowerCase().includes(searchLower)
        );
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

    // Reset to page 1 when search changes
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

    // Generate page numbers to display
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

    // Calculations
    const pendingCount = projectsList.filter(p => p.status === 'PENDING_REVIEW').length;
    const returnedCount = projectsList.filter(p => p.status === 'RETURNED').length;
    const clearedCount = projectsList.filter(p => p.status === 'CLEARED').length;
    const onHoldCount = projectsList.filter(p => p.status === 'ON_HOLD').length;

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

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">

            {/* SIDEBAR */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                userRole={userRole}
            />

            {/* MAIN CONTENT */}
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">

                {/* HEADER */}
                <header className="mb-6 sm:mb-8 mt-12 lg:mt-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {userRole === 'ro' ? 'My Project Submissions' : 'Step 1 Validation Queue'}
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-gray-600">
                                {userRole === 'ro'
                                    ? 'Create and submit project proposals for validation'
                                    : 'Review and validate project proposals for pipeline eligibility'}
                            </p>
                        </div>

                        {/* CREATE BUTTON - ONLY FOR RO */}
                        {userRole === 'ro' && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded text-sm font-semibold transition-colors whitespace-nowrap"
                            >
                                + Create Project
                            </button>
                        )}
                    </div>
                </header>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <StatCard title="Pending Review" count={pendingCount} colorClass="text-yellow-600" />
                    <StatCard title="Returned" count={returnedCount} colorClass="text-red-600" />
                    <StatCard title="Cleared Step 1" count={clearedCount} colorClass="text-green-600" />
                    <StatCard title="On Hold" count={onHoldCount} colorClass="text-gray-600" />
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                                {userRole === 'ro' ? 'My Submissions' : 'Projects Awaiting Validation'}
                            </h3>

                            {/* SEARCH INPUT */}
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {/* Search Icon */}
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {/* Clear Button */}
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
                                        : 'No projects pending validation.'}
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
                                            <p className="text-xs text-gray-500">Cost: <span className="font-medium text-gray-900">{proj.cost}</span></p>
                                            <p className="text-xs text-gray-500">Date: <span className="font-medium text-gray-900">{proj.date}</span></p>
                                        </div>
                                        <button
                                            onClick={() => userRole === 'ro' ? handleViewProject(proj) : handleReviewProject(proj)}
                                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${userRole === 'ro'
                                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                : 'bg-blue-700 hover:bg-blue-800 text-white'
                                                }`}
                                        >
                                            {userRole === 'ro' ? 'View' : 'Review'}
                                        </button>
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
                                    <th
                                        onClick={() => handleSort('id')}
                                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    >
                                        <div className="flex items-center">
                                            Project ID
                                            <SortIcon field="id" />
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('name')}
                                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    >
                                        <div className="flex items-center">
                                            Project Name
                                            <SortIcon field="name" />
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('location')}
                                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    >
                                        <div className="flex items-center">
                                            Location
                                            <SortIcon field="location" />
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('cost')}
                                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    >
                                        <div className="flex items-center">
                                            Est. Cost
                                            <SortIcon field="cost" />
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('date')}
                                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    >
                                        <div className="flex items-center">
                                            Submitted Date
                                            <SortIcon field="date" />
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('status')}
                                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    >
                                        <div className="flex items-center">
                                            Status
                                            <SortIcon field="status" />
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                        Action
                                    </th>
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
                                                    : 'No projects pending validation.'}
                                        </td>
                                    </tr>
                                ) : (
                                    currentProjects.map((proj) => (
                                        <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{proj.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{proj.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{proj.location}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{proj.cost}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{proj.date}</td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={proj.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => userRole === 'ro' ? handleViewProject(proj) : handleReviewProject(proj)}
                                                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${userRole === 'ro'
                                                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        : 'bg-blue-700 hover:bg-blue-800 text-white'
                                                        }`}
                                                >
                                                    {userRole === 'ro' ? 'View' : 'Review'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {sortedProjects.length > 0 && (
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                            {/* Results info */}
                            <div className="text-xs sm:text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(endIndex, sortedProjects.length)} of {sortedProjects.length}
                                {searchTerm && ` filtered`} projects
                            </div>

                            {/* Pagination controls */}
                            <div className="flex items-center gap-2">
                                {/* Previous button */}
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>

                                {/* Page numbers */}
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

                                {/* Mobile page indicator */}
                                <div className="sm:hidden text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </div>

                                {/* Next button */}
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
            </main>

            {/* MODALS */}

            {/* Create Modal - ONLY FOR RO */}
            {userRole === 'ro' && (
                <CreateProposalModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateProject}
                />
            )}

            {/* View Modal - FOR RO */}
            {userRole === 'ro' && (
                <ViewProjectModal
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedProject(null);
                    }}
                    project={selectedProject}
                />
            )}

            {/* Review Modal - FOR VALIDATOR */}
            {userRole === 'validator' && (
                <ReviewProjectModal
                    isOpen={isReviewModalOpen}
                    onClose={() => {
                        setIsReviewModalOpen(false);
                        setSelectedProject(null);
                    }}
                    project={selectedProject}
                    onDecision={handleValidatorDecision}
                />
            )}
        </div>
    );
}