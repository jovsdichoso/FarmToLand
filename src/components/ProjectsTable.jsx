import { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import { TableSkeleton } from './SkeletonLoader';

const IconSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SortIcon = ({ field, currentSort, direction }) => (
    <span className="ml-1 text-gray-400">
        {currentSort === field ? (direction === 'asc' ? '▲' : '▼') : '↕'}
    </span>
);

export default function ProjectsTable({ projects, userRole, onViewProject, onReviewProject, onUpdateProject, isLoading }) {
    const [localProjects, setLocalProjects] = useState([]);
    const [modifiedRows, setModifiedRows] = useState({});
    const [savingRows, setSavingRows] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => { setLocalProjects(projects || []); }, [projects]);

    if (isLoading) return <TableSkeleton />;

    // --- HANDLERS ---
    const handleTagChange = (project, field, newValue) => {
        const pid = project.id;
        const currentDraft = modifiedRows[pid] || project;
        const updatedDraft = { ...currentDraft, [field]: newValue };
        if (field === 'nep_tag' && newValue !== 'NEP-INCLUDED') updatedDraft.gaa_tag = 'GAA-CONSIDERED';
        if (field === 'nep_tag') updatedDraft.status = newValue;
        if (field === 'gaa_tag' && newValue === 'GAA-INCLUDED') updatedDraft.status = 'GAA-INCLUDED';
        setModifiedRows(prev => ({ ...prev, [pid]: updatedDraft }));
    };

    const handleSaveRow = async (projectId) => {
        const draftData = modifiedRows[projectId];
        if (!draftData) return;
        setSavingRows(prev => new Set(prev).add(projectId));
        try {
            if (onUpdateProject) await onUpdateProject(draftData);
            setLocalProjects(prev => prev.map(p => p.id === projectId ? draftData : p));
            setModifiedRows(prev => { const newState = { ...prev }; delete newState[projectId]; return newState; });
        } catch (error) { alert("Failed to save changes."); }
        finally { setSavingRows(prev => { const newSet = new Set(prev); newSet.delete(projectId); return newSet; }); }
    };

    const handleSort = (field) => {
        if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDirection('asc'); }
        setCurrentPage(1);
    };

    const formatCurrency = (amount) => {
        const val = parseFloat(String(amount).replace(/[₱P, ]/g, '')) || 0;
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(val);
    };

    // --- FILTER & SORT ---
    const filteredProjects = localProjects.filter(proj => {
        const s = searchTerm.toLowerCase();
        return proj.id.toLowerCase().includes(s) || proj.name.toLowerCase().includes(s) || proj.location.toLowerCase().includes(s) || String(proj.status).toLowerCase().includes(s);
    });

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        if (!sortField) return 0;
        let aVal = a[sortField], bVal = b[sortField];
        if (sortField === 'cost') { aVal = parseFloat(String(a.cost).replace(/[₱P, ]/g, '')) || 0; bVal = parseFloat(String(b.cost).replace(/[₱P, ]/g, '')) || 0; }
        else if (sortField === 'score') { aVal = a.score_data?.totalScore || 0; bVal = b.score_data?.totalScore || 0; }
        else { aVal = String(aVal || '').toLowerCase(); bVal = String(bVal || '').toLowerCase(); }
        return aVal < bVal ? (sortDirection === 'asc' ? -1 : 1) : (sortDirection === 'asc' ? 1 : -1);
    });

    const currentProjects = sortedProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);

    // --- DYNAMIC ACTION UI ---
    const getActionUI = (role, project) => {
        const pid = project.id;
        const isModified = !!modifiedRows[pid];
        const isSaving = savingRows.has(pid);
        const status = project.status;
        const hasScore = project.score_data?.totalScore !== undefined;

        if (isModified) return { label: isSaving ? 'Saving...' : 'Save Changes', icon: isSaving ? <IconSpinner /> : null, className: 'bg-blue-600 text-white hover:bg-blue-700 w-36 justify-center', onClick: () => handleSaveRow(pid), disabled: isSaving };

        if (role === 'scorer') {
            if (!hasScore && (status === 'FOR_SCORING' || status === 'CLEARED')) return { label: 'Evaluate', className: 'bg-green-600 text-white hover:bg-green-700', onClick: () => onReviewProject(project) };
            return { label: 'View Score', className: 'bg-white border-gray-300 text-gray-700', onClick: () => onReviewProject(project) };
        }

        if (role === 'validator' && status === 'PENDING_REVIEW') return { label: 'Validate', className: 'bg-blue-700 text-white hover:bg-blue-800', onClick: () => onReviewProject(project) };

        // --- BAFE ROLE ---
        if (role === 'bafe') {
            // Standard Validation
            if (status === 'step3_pending') return { label: 'Validate Design', className: 'bg-indigo-600 text-white hover:bg-indigo-700', onClick: () => onReviewProject(project) };

            // NEW: Handle Escalated Status explicitly
            if (status === 'step3_escalated') return { label: 'View Escalation', className: 'bg-purple-100 text-purple-700 border-purple-200', onClick: () => onReviewProject(project) };

            // Block BAFE from acting if RO hasn't submitted yet (Strict Compliance)
            if (status === 'GAA-INCLUDED' || status === 'SCORED' || status === 'NEP-INCLUDED') return { label: 'Waiting for Sub', className: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed', disabled: true };

            // Step 4 Gates
            if (status === 'STEP4_DOCS_SUBMITTED' || status === 'STEP4_EVALUATION_SUBMITTED') return { label: 'Procurement Action', className: 'bg-red-600 text-white hover:bg-red-700 animate-pulse', onClick: () => onReviewProject(project) };
            if (status.startsWith('STEP4_') || status === 'step4_bidding') return { label: 'Monitor Bidding', className: 'bg-white border-gray-300 text-gray-700', onClick: () => onReviewProject(project) };
        }

        // --- RO ROLE ---
        if (role === 'ro') {
            const isEditable = ['GAA-INCLUDED', 'RETURNED'].includes(status);

            if (isEditable) {
                return {
                    label: status === 'RETURNED' ? 'Resubmit Engineering' : 'Submit Detailed Engineering',
                    className: status === 'RETURNED' ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-indigo-600 text-white hover:bg-indigo-700',
                    onClick: () => onViewProject(project)
                };
            }

            // If Pending or Escalated -> View Only (Read-Only Mode)
            if (status === 'step3_pending' || status === 'step3_escalated') {
                return { label: 'View Status', className: 'bg-white border-gray-300 text-gray-700', onClick: () => onViewProject(project) };
            }

            // Step 4 Trigger
            if (status === 'step4_bidding' || (status && status.startsWith('STEP4_'))) {
                return { label: 'Manage Procurement', className: 'bg-purple-600 text-white hover:bg-purple-700', onClick: () => onReviewProject(project) };
            }
        }

        return { label: 'View', className: 'bg-white border-gray-300 text-gray-700', onClick: () => onViewProject(project) };
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-base font-bold text-gray-900 uppercase">Project Master List</h3>
                <div className="relative w-full sm:w-64">
                    <input type="text" placeholder="Search projects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {['id', 'name', 'location', 'cost', 'date'].map(f => (
                                <th key={f} onClick={() => handleSort(f)} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                                    {f} <SortIcon field={f} currentSort={sortField} direction={sortDirection} />
                                </th>
                            ))}
                            {userRole === 'scorer' && <th onClick={() => handleSort('score')} className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100">Score <SortIcon field="score" currentSort={sortField} direction={sortDirection} /></th>}
                            {userRole === 'scorer' && <><th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase bg-blue-50/50">NEP</th><th className="px-4 py-3 text-left text-xs font-bold text-blue-700 uppercase bg-blue-50/50">GAA</th></>}
                            {userRole !== 'scorer' && <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>}
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentProjects.map(proj => {
                            const displayData = modifiedRows[proj.id] || proj;
                            const actionUI = getActionUI(userRole, displayData);
                            const isScored = displayData.score_data?.totalScore !== undefined;
                            return (
                                <tr key={proj.id} className={`transition-colors ${modifiedRows[proj.id] ? 'bg-blue-50/40' : 'hover:bg-blue-50/30'}`}>
                                    <td className="px-4 py-3 text-xs font-bold text-gray-500 font-mono">{displayData.id}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 truncate max-w-[200px]" title={displayData.name}>{displayData.name}</td>
                                    <td className="px-4 py-3 text-xs text-gray-600 truncate max-w-[150px]">{displayData.location}</td>
                                    <td className="px-4 py-3 text-xs text-gray-900 font-mono font-bold">{formatCurrency(displayData.cost)}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{displayData.date}</td>
                                    {userRole === 'scorer' && <td className="px-4 py-3 text-center font-black text-sm">{isScored ? <span className={displayData.score_data.totalScore >= 60 ? 'text-green-600' : 'text-red-500'}>{displayData.score_data.totalScore}</span> : <span className="text-gray-300">-</span>}</td>}
                                    {userRole === 'scorer' && (
                                        <>
                                            <td className="px-4 py-3"><select value={displayData.nep_tag || 'SCORED'} onChange={e => handleTagChange(proj, 'nep_tag', e.target.value)} className="w-full text-xs font-bold p-2 rounded border border-gray-300"><option value="SCORED">Scored</option><option value="NEP-INCLUDED">NEP-INCLUDED</option><option value="NEP-EXCLUDED">NEP-EXCLUDED</option><option value="NEP-DEFERRED">NEP-DEFERRED</option></select></td>
                                            <td className="px-4 py-3"><select value={displayData.gaa_tag || 'GAA-CONSIDERED'} onChange={e => handleTagChange(proj, 'gaa_tag', e.target.value)} disabled={displayData.nep_tag !== 'NEP-INCLUDED'} className={`w-full text-xs font-bold p-2 rounded border ${displayData.nep_tag === 'NEP-INCLUDED' ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-400'}`}><option value="GAA-CONSIDERED">GAA-Considered</option><option value="GAA-INCLUDED">GAA-INCLUDED</option><option value="GAA-MODIFIED">GAA-MODIFIED</option><option value="GAA-EXCLUDED">GAA-EXCLUDED</option></select></td>
                                        </>
                                    )}
                                    {userRole !== 'scorer' && <td className="px-4 py-3"><StatusBadge status={displayData.status} /></td>}
                                    <td className="px-4 py-3 text-right"><button onClick={actionUI.onClick} disabled={actionUI.disabled} className={`flex items-center px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all active:scale-95 border ${actionUI.className}`}>{actionUI.icon}{actionUI.label}</button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 text-xs text-gray-500">
                <span>Page {currentPage} of {totalPages}</span>
                <div className="space-x-2"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded bg-white disabled:opacity-50">Prev</button><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded bg-white disabled:opacity-50">Next</button></div>
            </div>
        </div>
    );
}