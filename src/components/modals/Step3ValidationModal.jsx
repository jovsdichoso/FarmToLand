import { useState, useEffect } from 'react';

// --- ICONS ---
const IconDoc = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

// --- CHECKLIST DATA ---
const CHECKLIST_SECTIONS = [
    {
        id: 'design',
        label: 'Detailed Design',
        groups: [
            {
                title: 'A. General Design Completeness',
                items: [
                    { id: 'A1', text: 'Complete plan sheets submitted (cover, layout, profiles)?' },
                    { id: 'A2', text: 'Drawings titled, dated, and signed by engineer?' },
                    { id: 'A3', text: 'Project location clearly indicated?' },
                    { id: 'A4', text: 'Drawing scales indicated and consistent?' }
                ]
            },
            {
                title: 'B. Alignment with Scope',
                items: [
                    { id: 'B1', text: 'Design matches approved planning scope (length/type)?' },
                    { id: 'B2', text: 'Road classification consistent with FMR type?' },
                    { id: 'B3', text: 'No scope creep (features limited to necessity)?' }
                ]
            },
            {
                title: 'C. Geometric & Standards',
                items: [
                    { id: 'C1', text: 'Horizontal/Vertical alignments dimensioned?' },
                    { id: 'C2', text: 'Speeds, widths, clearances comply with standards?' },
                    { id: 'C3', text: 'Pavement layers defined with thicknesses?' }
                ]
            }
        ]
    },
    {
        id: 'qto',
        label: 'Quantity Take-Off',
        groups: [
            {
                title: 'A. Documentation',
                items: [
                    { id: 'QA1', text: 'Complete QTO file submitted?' },
                    { id: 'QA2', text: 'QTO dated, versioned, and signed?' },
                    { id: 'QA3', text: 'Quantities presented in clear tabular format?' }
                ]
            },
            {
                title: 'B. Traceability',
                items: [
                    { id: 'QB1', text: 'Quantities traceable to design drawings?' },
                    { id: 'QB2', text: 'Lengths/Areas consistent with plan dimensions?' },
                    { id: 'QB3', text: 'No "orphan" quantities (not in drawings)?' }
                ]
            }
        ]
    },
    {
        id: 'specs',
        label: 'Tech Specs',
        groups: [
            {
                title: 'Compliance',
                items: [
                    { id: 'SA1', text: 'Complete technical specs document submitted?' },
                    { id: 'SA2', text: 'References applicable DPWH/DA standards?' },
                    { id: 'SA3', text: 'No brand names or supplier lock-ins?' }
                ]
            }
        ]
    },
    {
        id: 'abc',
        label: 'ABC & Cost',
        groups: [
            {
                title: 'A. ABC Completeness',
                items: [
                    { id: 'AA1', text: 'ABC document submitted and itemized?' },
                    { id: 'AA2', text: 'Unit costs/quantities clearly shown?' },
                    { id: 'AA3', text: 'Formulas visible (not hard-coded)?' }
                ]
            },
            {
                title: 'B. Unit Cost Validation',
                items: [
                    { id: 'AB1', text: 'Unit costs within allowable variance?' },
                    { id: 'AB2', text: 'Labor/Material/Equipment breakdown clear?' },
                    { id: 'AB3', text: 'Indirect costs (OCM/Profit) use standard %?' }
                ]
            }
        ]
    }
];

export default function Step3ValidationModal({ isOpen, onClose, project, onValidate }) {
    if (!isOpen || !project) return null;

    // --- STATE LOGIC ---
    const isReturned = project.status === 'step3_pending';
    const isCleared = project.status === 'step4_bidding';
    const isReadOnly = isReturned || isCleared;

    const [activeTab, setActiveTab] = useState('design');
    const [checks, setChecks] = useState({});
    const [remarks, setRemarks] = useState('');
    const [validatedABC, setValidatedABC] = useState(project.cost || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize checks if empty
    useEffect(() => {
        if (isOpen) {
            // Load existing data if available
            if (project.step3_data) {
                setChecks(project.step3_data.checks || {});
                setRemarks(project.step3_data.remarks || '');
                setValidatedABC(project.step3_data.final_abc || project.cost || '');
            } else {
                setChecks({});
                setValidatedABC(project.cost || '');
                setRemarks('');
            }
        }
    }, [isOpen, project]);

    // --- HANDLERS ---
    const toggleCheck = (id) => {
        if (isReadOnly) return;
        setChecks(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleAction = (action) => {
        if (isReadOnly) return;

        if (action === 'APPROVE') {
            if (!validatedABC || parseFloat(validatedABC) <= 0) {
                alert("Please enter a valid Final ABC amount.");
                return;
            }

            // STRICT VALIDATION: Check ALL items
            const allRequiredIds = CHECKLIST_SECTIONS.flatMap(section =>
                section.groups.flatMap(group => group.items.map(item => item.id))
            );
            const missingItems = allRequiredIds.filter(id => !checks[id]);

            if (missingItems.length > 0) {
                alert(`Cannot Issue Clearance: ${missingItems.length} checklist items are unchecked. All items must be verified.`);
                return;
            }
        }

        if (action === 'RETURN' && !remarks.trim()) {
            alert("Please provide remarks/instructions for correction.");
            return;
        }

        setIsSubmitting(true);

        const newStatus = action === 'APPROVE' ? 'step4_bidding' : 'step3_pending';
        const isReturnedAction = action === 'RETURN';

        // Keep all existing data, just update status and validation info
        const updatedProject = {
            ...project,
            status: newStatus,
            validated_abc: parseFloat(validatedABC),
            step3_data: {
                checks,
                remarks,
                final_abc: validatedABC
            },
            step3_returned: isReturnedAction,
            last_updated: new Date().toISOString()
        };

        setTimeout(() => {
            onValidate(updatedProject);
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    // Helper: Progress calculation
    const countChecked = (sectionId) => {
        const section = CHECKLIST_SECTIONS.find(s => s.id === sectionId);
        if (!section) return 0;
        const ids = section.groups.flatMap(g => g.items.map(i => i.id));
        return ids.filter(id => checks[id]).length;
    };

    const countTotal = (sectionId) => {
        const section = CHECKLIST_SECTIONS.find(s => s.id === sectionId);
        if (!section) return 0;
        return section.groups.flatMap(g => g.items).length;
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white w-full h-full max-w-[1600px] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

                {/* --- STATUS BANNER --- */}
                {isReturned && (
                    <div className="absolute top-0 left-0 right-0 bg-orange-100 border-b border-orange-200 text-orange-800 px-6 py-3 z-50 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-bold text-sm">Status: Returned to Proponent</span>
                            <span className="text-sm opacity-75">- Waiting for correction and re-submission.</span>
                        </div>
                        <span className="text-xs bg-white/50 px-2 py-1 rounded font-mono">READ ONLY</span>
                    </div>
                )}
                {isCleared && (
                    <div className="absolute top-0 left-0 right-0 bg-green-100 border-b border-green-200 text-green-800 px-6 py-3 z-50 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-bold text-sm">Status: Cleared for Bidding</span>
                        </div>
                        <span className="text-xs bg-white/50 px-2 py-1 rounded font-mono">READ ONLY</span>
                    </div>
                )}

                {/* === LEFT PANEL: PROJECT INFO (Read Only) === */}
                <div className={`w-full md:w-4/12 bg-gray-50 border-r border-gray-200 flex flex-col ${isReturned || isCleared ? 'mt-12' : ''}`}>
                    <div className="p-6 border-b border-gray-200 bg-white">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 mb-2">
                            STEP 3 VALIDATION
                        </span>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{project.name}</h2>
                        <div className="text-xs text-gray-500 mt-2 flex flex-col gap-1">
                            <span>ID: <span className="font-mono text-gray-700">{project.id}</span></span>
                            <span>Loc: {project.location}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* --- THIS IS THE NEW PART THAT READS FROM DATABASE --- */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Submitted Documents (Filenames)</h3>
                            <div className="space-y-2">
                                {project.attachments && Object.keys(project.attachments).length > 0 ? (
                                    Object.entries(project.attachments).map(([key, fileName], i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-gray-700 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                            <div className="mt-0.5"><IconDoc /></div>
                                            <div className="flex flex-col overflow-hidden">
                                                {/* Readable Label (e.g., locationMap -> Location Map) */}
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                {/* The Actual Filename from DB */}
                                                <span className="font-mono text-xs text-blue-600 truncate" title={fileName}>
                                                    {fileName}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-400 italic p-2 text-center bg-gray-50 rounded">No documents attached.</div>
                                )}
                            </div>
                        </div>
                        {/* --------------------------------------------------- */}

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">Cost Validation</h3>
                            <label className="block text-xs text-blue-600 mb-1">Proponent's Indicative Cost</label>
                            <div className="text-lg font-mono font-bold text-gray-900 mb-4">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.cost || 0)}
                            </div>

                            <label className="block text-xs font-bold text-gray-700 mb-1">Final Validated ABC (PHP)</label>
                            <input
                                type="number"
                                value={validatedABC}
                                onChange={(e) => setValidatedABC(e.target.value)}
                                disabled={isReadOnly}
                                className="w-full p-2 border border-gray-300 rounded font-mono text-sm focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder="Enter Approved Budget..."
                            />
                            <p className="text-[10px] text-gray-500 mt-1">This amount will be locked for bidding.</p>
                        </div>
                    </div>
                </div>

                {/* === RIGHT PANEL: CHECKLIST TABS === */}
                <div className={`w-full md:w-8/12 bg-white flex flex-col ${isReturned || isCleared ? 'mt-12' : ''}`}>

                    {/* TABS HEADER */}
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        {CHECKLIST_SECTIONS.map(section => {
                            const count = countChecked(section.id);
                            const total = countTotal(section.id);
                            const isDone = count === total && total > 0;

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveTab(section.id)}
                                    className={`flex-1 py-4 px-2 text-sm font-bold border-b-2 transition-colors flex flex-col items-center gap-1
                                        ${activeTab === section.id
                                            ? 'border-indigo-600 text-indigo-700 bg-white'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <span>{section.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full 
                                        ${isDone ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {count}/{total}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* CHECKLIST CONTENT */}
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                        {CHECKLIST_SECTIONS.map(section => (
                            <div key={section.id} className={activeTab === section.id ? 'block' : 'hidden'}>
                                {section.groups.map((group, idx) => (
                                    <div key={idx} className="mb-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                            <h3 className="font-bold text-sm text-gray-800">{group.title}</h3>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {group.items.map(item => (
                                                <label key={item.id} className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors ${isReadOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                                                    <div className="mt-0.5 relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!checks[item.id]}
                                                            onChange={() => toggleCheck(item.id)}
                                                            disabled={isReadOnly}
                                                            className="w-5 h-5 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-mono font-bold text-gray-400 mr-2">{item.id}</span>
                                                        <span className="text-sm text-gray-700 font-medium">{item.text}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Remarks Section */}
                        <div className="mt-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Validator Remarks / Instructions</label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                disabled={isReadOnly}
                                className="w-full h-24 p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 resize-none disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder="Enter specific instructions for the Proponent if returning, or general notes if approving..."
                            />
                        </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">
                            Close
                        </button>
                        {!isReadOnly && (
                            <>
                                <button
                                    onClick={() => handleAction('RETURN')}
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 border border-red-300 bg-red-50 text-red-700 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                                >
                                    Return for Correction
                                </button>
                                <button
                                    onClick={() => handleAction('APPROVE')}
                                    disabled={isSubmitting}
                                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-lg transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Processing...' : 'Issue Clearance & Lock'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}