import { useState, useEffect } from 'react';

// --- ICONS ---
const IconDoc = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconData = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const IconCheck = () => <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconMissing = () => <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconInfo = () => <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- REQUIRED DOCUMENTS ---
const REQUIRED_DOCS = [
    { key: 'detailed_engineering', label: 'Detailed Engineering Design' },
    { key: 'qto', label: 'Quantity Take-Off (QTO)' },
    { key: 'specs', label: 'Technical Specifications' },
    { key: 'cost_template', label: 'Cost Estimates (Excel)' }
];

// --- CHECKLIST DATA (Full Content from DOCX) ---
const CHECKLIST_SECTIONS = [
    {
        id: 'design',
        label: 'Detailed Design',
        groups: [
            {
                title: 'A. General Design Completeness',
                items: [
                    { id: 'A1', text: 'Are complete plan sheets submitted (cover sheet, layout, profiles, cross-sections)?' },
                    { id: 'A2', text: 'Are all drawings properly titled, dated, and signed by the responsible engineer?' },
                    { id: 'A3', text: 'Is the project location clearly indicated (barangay, municipality, province)?' },
                    { id: 'A4', text: 'Are drawing scales indicated and consistent across sheets?' },
                    { id: 'A5', text: 'Are north arrows, benchmarks, and references clearly shown?' }
                ]
            },
            {
                title: 'B. Alignment with Approved Scope',
                items: [
                    { id: 'B1', text: 'Does the design match the scope approved in planning and budgeting (length, type, alignment)?' },
                    { id: 'B2', text: 'Is the road classification consistent with the approved FMR type?' },
                    { id: 'B3', text: 'Are design features limited to those necessary for the approved scope (no scope creep)?' },
                    { id: 'B4', text: 'Are ancillary works (drainage, slope protection, structures) justified by site conditions?' }
                ]
            },
            {
                title: 'C. Geometric Design & Standards',
                items: [
                    { id: 'C1', text: 'Are horizontal and vertical alignments clearly shown and dimensioned?' },
                    { id: 'C2', text: 'Do design speeds, widths, and clearances comply with applicable standards?' },
                    { id: 'C3', text: 'Are pavement layers clearly defined with thicknesses indicated?' },
                    { id: 'C4', text: 'Are cross-slopes and camber indicated and consistent?' }
                ]
            },
            {
                title: 'D. Drainage & Hydraulic Considerations',
                items: [
                    { id: 'D1', text: 'Are drainage structures (ditches, culverts) shown and dimensioned?' },
                    { id: 'D2', text: 'Are drainage layouts consistent with road alignment and profiles?' },
                    { id: 'D3', text: 'Are flood-prone areas identified and addressed in the design?' },
                    { id: 'D4', text: 'Are outlet points and flow directions clearly indicated?' }
                ]
            },
            {
                title: 'E. Structures & Special Features',
                items: [
                    { id: 'E1', text: 'Are retaining walls, slope protection, or bridges clearly detailed?' },
                    { id: 'E2', text: 'Are structural elements supported by basic design computations or references?' },
                    { id: 'E3', text: 'Are special features justified by site conditions?' }
                ]
            },
            {
                title: 'F. Constructability & Clarity',
                items: [
                    { id: 'F1', text: 'Can quantities be directly derived from the drawings?' },
                    { id: 'F2', text: 'Are design details clear enough to avoid interpretation by bidders?' },
                    { id: 'F3', text: 'Are there no conflicting dimensions or annotations across drawings?' }
                ]
            }
        ]
    },
    {
        id: 'qto',
        label: 'Quantity Take-Off',
        groups: [
            {
                title: 'A. General QTO Documentation',
                items: [
                    { id: 'QA1', text: 'Is a complete Quantity Take-Off (QTO) file submitted?' },
                    { id: 'QA2', text: 'Is the QTO dated, versioned, and signed by the responsible engineer?' },
                    { id: 'QA3', text: 'Are quantities presented in a clear tabular format by pay item?' },
                    { id: 'QA4', text: 'Are units of measure consistent with standard pay item units?' },
                    { id: 'QA5', text: 'Is the QTO file locked or protected against silent modification?' }
                ]
            },
            {
                title: 'B. Traceability to Approved Design',
                items: [
                    { id: 'QB1', text: 'Are all quantities directly traceable to approved design drawings?' },
                    { id: 'QB2', text: 'Are drawing sheet numbers referenced for each quantity item?' },
                    { id: 'QB3', text: 'Are lengths, areas, and volumes consistent with plan dimensions?' },
                    { id: 'QB4', text: 'Are typical sections correctly applied across relevant chainages?' },
                    { id: 'QB5', text: 'Are assumptions (if any) explicitly stated and justified?' }
                ]
            },
            {
                title: 'C. Roadway Quantities',
                items: [
                    { id: 'QC1', text: 'Do pavement quantities match the approved road length and width?' },
                    { id: 'QC2', text: 'Are pavement layer thicknesses consistent with typical sections?' },
                    { id: 'QC3', text: 'Are excavation and embankment quantities supported by profiles?' },
                    { id: 'QC4', text: 'Are shoulder quantities correctly derived and not duplicated?' }
                ]
            },
            {
                title: 'D. Drainage & Structures Quantities',
                items: [
                    { id: 'QD1', text: 'Are drainage quantities tied to shown locations and dimensions?' },
                    { id: 'QD2', text: 'Are culvert quantities supported by size and count shown in plans?' },
                    { id: 'QD3', text: 'Are structure quantities itemized separately (not bundled)?' },
                    { id: 'QD4', text: 'Are formwork, excavation, and backfill quantities not double-counted?' }
                ]
            },
            {
                title: 'E. Duplication & Anomalies',
                items: [
                    { id: 'QE1', text: 'Are there no duplicate pay items for the same work element?' },
                    { id: 'QE2', text: 'Are quantities reasonable relative to project scale?' },
                    { id: 'QE3', text: 'Are contingency-type quantities explicitly labeled and justified?' },
                    { id: 'QE4', text: 'Are rounding practices reasonable and consistently applied?' }
                ]
            },
            {
                title: 'F. Consistency with Cost',
                items: [
                    { id: 'QF1', text: 'Do QTO quantities exactly match those used in the cost estimate?' },
                    { id: 'QF2', text: 'Are there no “orphan” quantities present only in the cost estimate?' },
                    { id: 'QF3', text: 'Are quantity adjustments clearly documented and explained?' }
                ]
            }
        ]
    },
    {
        id: 'specs',
        label: 'Tech Specs',
        groups: [
            {
                title: 'A. Specification Completeness',
                items: [
                    { id: 'SA1', text: 'Is a complete technical specification document submitted?' },
                    { id: 'SA2', text: 'Are specifications clearly structured by work item?' },
                    { id: 'SA3', text: 'Are all work items in the QTO covered by a corresponding specification?' },
                    { id: 'SA4', text: 'Are there no specification items without corresponding quantities?' }
                ]
            },
            {
                title: 'B. Alignment & Standards',
                items: [
                    { id: 'SB1', text: 'Do specifications reference the applicable DPWH/DA standard specs?' },
                    { id: 'SB2', text: 'Are standard clauses adopted verbatim where applicable?' },
                    { id: 'SB3', text: 'Are deviations from standard specs explicitly identified?' },
                    { id: 'SB4', text: 'Are all deviations technically justified in writing?' }
                ]
            },
            {
                title: 'C. Prohibition of Brand Lock-In',
                items: [
                    { id: 'SC1', text: 'Do specifications avoid brand names or proprietary references?' },
                    { id: 'SC2', text: 'Where performance-based specs are used, are they generic?' },
                    { id: 'SC3', text: 'Are alternative materials or methods explicitly allowed?' },
                    { id: 'SC4', text: 'Are product equivalency clauses present where appropriate?' }
                ]
            },
            {
                title: 'D. Technical Parameters',
                items: [
                    { id: 'SD1', text: 'Are material strength, thickness, and quality parameters reasonable for an FMR?' },
                    { id: 'SD2', text: 'Are tolerances consistent with standard rural road practice?' },
                    { id: 'SD3', text: 'Are testing requirements proportionate to project scale?' },
                    { id: 'SD4', text: 'Are equipment or method requirements non-exclusive?' }
                ]
            },
            {
                title: 'E. Consistency with Design',
                items: [
                    { id: 'SE1', text: 'Do specifications match materials shown in design drawings?' },
                    { id: 'SE2', text: 'Are dimensions and materials consistent across specs and drawings?' },
                    { id: 'SE3', text: 'Are construction methods aligned with shown design details?' }
                ]
            },
            {
                title: 'F. Consistency with QTO & ABC',
                items: [
                    { id: 'SF1', text: 'Are specified materials consistent with QTO items?' },
                    { id: 'SF2', text: 'Are no higher-grade materials specified without quantity adjustment?' },
                    { id: 'SF3', text: 'Do specification requirements support the approved ABC assumptions?' }
                ]
            },
            {
                title: 'G. Modification Control',
                items: [
                    { id: 'SG1', text: 'Are specifications versioned and dated?' },
                    { id: 'SG2', text: 'Are all modifications from previous versions documented?' },
                    { id: 'SG3', text: 'Are late-stage specification changes accompanied by revalidation?' }
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
                    { id: 'AA1', text: 'Is an Approved Budget for the Contract (ABC) document submitted?' },
                    { id: 'AA2', text: 'Is the ABC itemized by work item consistent with the QTO?' },
                    { id: 'AA3', text: 'Are unit costs, quantities, and totals clearly shown?' },
                    { id: 'AA4', text: 'Are formulas visible and not hard-coded values?' }
                ]
            },
            {
                title: 'B. Source & Reference Validation',
                items: [
                    { id: 'AB1', text: 'Are unit costs supported by valid reference sources?' },
                    { id: 'AB2', text: 'Are reference sources dated and within the allowable period?' },
                    { id: 'AB3', text: 'Are sources allowable under DA/DPWH costing rules?' },
                    { id: 'AB4', text: 'Are references consistent across similar work items?' }
                ]
            },
            {
                title: 'C. Unit Cost Reasonableness',
                items: [
                    { id: 'AC1', text: 'Do unit costs fall within allowable variance from benchmarks?' },
                    { id: 'AC2', text: 'Are adjustments beyond thresholds justified in writing?' },
                    { id: 'AC3', text: 'Are no unexplained outliers present among unit costs?' },
                    { id: 'AC4', text: 'Are similar items priced consistently across the project?' }
                ]
            },
            {
                title: 'D. Quantity–Cost Consistency',
                items: [
                    { id: 'AD1', text: 'Do quantities used in the ABC exactly match the approved QTO?' },
                    { id: 'AD2', text: 'Are no quantities inflated relative to design drawings?' },
                    { id: 'AD3', text: 'Are rounding practices consistent and rule-based?' },
                    { id: 'AD4', text: 'Are lump sum items clearly justified and limited?' }
                ]
            },
            {
                title: 'E. Cost Build-Up Integrity',
                items: [
                    { id: 'AE1', text: 'Are labor, materials, equipment, OCM clearly separated?' },
                    { id: 'AE2', text: 'Are indirect costs applied using standard percentages?' },
                    { id: 'AE3', text: 'Are profit and contingency rates within allowed limits?' },
                    { id: 'AE4', text: 'Are taxes computed correctly and transparently?' }
                ]
            },
            {
                title: 'F. Cross-Project Benchmarking',
                items: [
                    { id: 'AF1', text: 'Are unit costs consistent with recent DA FMR projects?' },
                    { id: 'AF2', text: 'If higher than benchmarks, is justification documented?' },
                    { id: 'AF3', text: 'Are no single items disproportionately driving ABC increases?' }
                ]
            },
            {
                title: 'G. Modification Control',
                items: [
                    { id: 'AG1', text: 'Is the ABC versioned and dated?' },
                    { id: 'AG2', text: 'Are revisions from previous ABCs documented?' },
                    { id: 'AG3', text: 'Were revisions triggered by approved design changes only?' }
                ]
            }
        ]
    }
];

export default function Step3ValidationModal({ isOpen, onClose, project, onValidate }) {
    if (!isOpen || !project) return null;

    // --- STATE LOGIC ---
    const isReturned = project.status === 'step3_pending';
    const isCleared = project.status === 'step4_bidding' || (project.status && project.status.startsWith('STEP4'));
    const isReadOnly = isCleared;

    // UI States
    const [leftMode, setLeftMode] = useState('data');
    const [selectedDoc, setSelectedDoc] = useState(null);

    // Validation States
    const [activeTab, setActiveTab] = useState('design');
    const [checks, setChecks] = useState({}); // Stores { id: 'Yes' | 'No' | 'N/A' }
    const [remarks, setRemarks] = useState('');
    const [validatedABC, setValidatedABC] = useState(project.cost || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize
    useEffect(() => {
        if (isOpen) {
            if (project.step3_data) {
                setChecks(project.step3_data.checks || {});
                setRemarks(project.step3_data.remarks || '');
                setValidatedABC(project.step3_data.final_abc || project.cost || '');
            } else {
                setChecks({});
                setValidatedABC(project.cost || '');
                setRemarks('');
            }
            if (project.attachments && project.attachments.detailed_engineering) {
                const file = project.attachments.detailed_engineering;
                setSelectedDoc(typeof file === 'object' ? file : { name: file, url: null });
            }
        }
    }, [isOpen, project]);

    // --- HANDLERS ---
    const handleCheckChange = (id, value) => {
        if (isReadOnly) return;
        setChecks(prev => ({ ...prev, [id]: value }));
    };

    const handleAction = (action) => {
        if (isReadOnly) return;

        if (action === 'APPROVE') {
            if (!validatedABC || parseFloat(validatedABC) <= 0) {
                alert("Please enter a valid Final ABC amount.");
                return;
            }
            // Strict check: ALL items must be answered (Yes, No, or N/A)
            // AND there must be NO "No" answers.
            const allRequiredIds = CHECKLIST_SECTIONS.flatMap(s => s.groups.flatMap(g => g.items.map(i => i.id)));
            const missingItems = allRequiredIds.filter(id => !checks[id]);
            const failedItems = allRequiredIds.filter(id => checks[id] === 'No');

            if (missingItems.length > 0) {
                alert(`Cannot Issue Clearance: ${missingItems.length} items are unanswered.`);
                return;
            }
            if (failedItems.length > 0) {
                alert(`Cannot Issue Clearance: ${failedItems.length} items are marked 'No'. Please Return for Correction.`);
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

        const updatedProject = {
            ...project,
            status: isReturnedAction ? 'RETURNED' : newStatus,
            validated_abc: parseFloat(validatedABC),
            step3_data: { checks, remarks, final_abc: validatedABC },
            step3_returned: isReturnedAction,
            last_updated: new Date().toISOString()
        };

        setTimeout(() => {
            onValidate(updatedProject);
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    // Helper counts
    const countAnswered = (sid) => {
        const s = CHECKLIST_SECTIONS.find(x => x.id === sid);
        if (!s) return 0;
        return s.groups.flatMap(g => g.items.map(i => i.id)).filter(id => checks[id]).length;
    };
    const countTotal = (sid) => {
        const s = CHECKLIST_SECTIONS.find(x => x.id === sid);
        if (!s) return 0;
        return s.groups.flatMap(g => g.items).length;
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 backdrop-blur-md">
            <div className="bg-white rounded-2xl w-full max-w-[98vw] h-[95vh] flex overflow-hidden shadow-2xl border border-gray-300 relative">

                {/* --- STATUS BANNERS --- */}
                {project.status === 'RETURNED' && (
                    <div className="absolute top-0 left-0 right-0 bg-orange-100 border-b border-orange-200 text-orange-800 px-6 py-2 z-50 flex justify-between items-center shadow-sm">
                        <span className="font-bold text-xs uppercase">Status: Returned</span>
                    </div>
                )}
                {isCleared && (
                    <div className="absolute top-0 left-0 right-0 bg-green-100 border-b border-green-200 text-green-800 px-6 py-2 z-50 flex justify-between items-center shadow-sm">
                        <span className="font-bold text-xs uppercase">Status: Cleared (Locked)</span>
                    </div>
                )}

                {/* LEFT PANEL */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-gray-200">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center px-6 shrink-0">
                        <div className="flex bg-gray-200 p-1 rounded-xl gap-1">
                            <button onClick={() => setLeftMode('data')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${leftMode === 'data' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <IconData /> Project Data
                            </button>
                            <button onClick={() => setLeftMode('pdf')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${leftMode === 'pdf' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <IconDoc /> PDF Preview
                            </button>
                        </div>
                        <div className="text-right">
                            <h2 className="text-sm font-black text-gray-900 truncate max-w-[300px] uppercase">{project.name}</h2>
                            <p className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-widest">{project.id}</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative bg-gray-100">
                        {leftMode === 'data' && (
                            <div className="absolute inset-0 overflow-y-auto p-8 space-y-6">
                                <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> Submitted Documents
                                    </h3>
                                    <div className="space-y-3">
                                        {REQUIRED_DOCS.map((doc, i) => {
                                            const fileData = project.attachments?.[doc.key];
                                            const fileName = typeof fileData === 'object' && fileData !== null ? fileData.name : fileData;
                                            const isPresent = !!fileName;
                                            return (
                                                <div key={i} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={`p-1.5 rounded-lg ${isPresent ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}><IconDoc /></div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{doc.label}</span>
                                                            {isPresent ? <span className="font-mono text-xs text-blue-700 font-medium truncate max-w-[300px]">{fileName}</span> : <span className="text-[10px] text-red-400 italic font-medium">Missing</span>}
                                                        </div>
                                                    </div>
                                                    <div className="ml-2">{isPresent ? <IconCheck /> : <IconMissing />}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                                <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2"><IconInfo /> ABC Validation</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1">Indicative Cost</label>
                                            <div className="text-2xl font-mono font-black text-gray-700">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.cost || 0)}</div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Final Validated ABC (PHP)</label>
                                            <input type="number" value={validatedABC} onChange={(e) => setValidatedABC(e.target.value)} disabled={isReadOnly} className="w-full p-3 border border-blue-200 rounded-xl font-mono text-lg font-bold text-blue-900 focus:ring-4 focus:ring-blue-100 outline-none disabled:bg-blue-50/50" placeholder="0.00" />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                        {leftMode === 'pdf' && (
                            <div className="absolute inset-0 flex animate-fadeIn">
                                <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-2 shrink-0">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-tighter">Documents to Review</p>
                                    {REQUIRED_DOCS.map((doc) => {
                                        const fileData = project.attachments?.[doc.key];
                                        const fileName = typeof fileData === 'object' && fileData !== null ? fileData.name : fileData;
                                        if (!fileName) return null;
                                        return (
                                            <button key={doc.key} onClick={() => setSelectedDoc(typeof fileData === 'object' ? fileData : { name: fileData, url: null })} className={`w-full p-3 rounded-xl text-left border transition-all flex flex-col gap-1 ${selectedDoc?.name === fileName ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200'}`}>
                                                <span className="text-[9px] font-black opacity-60 uppercase tracking-wide">{doc.label}</span>
                                                <span className="text-xs font-bold truncate">{fileName}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex-1 bg-gray-300 relative">
                                    {selectedDoc && selectedDoc.url && selectedDoc.url !== '#' ? (
                                        <iframe src={`${selectedDoc.url}#toolbar=0&view=FitH`} className="w-full h-full border-none" title="Validator Preview" />
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 italic">
                                            <IconDoc />
                                            <p className="mt-2 text-sm">Select a file from the sidebar to preview</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL (FIXED WIDTH) */}
                <div className="w-[480px] bg-gray-50 flex flex-col shrink-0 shadow-2xl z-10 border-l border-gray-200">
                    <div className="p-6 border-b bg-white flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase">Verification Panel</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Step 3: Validation</p>
                        </div>
                    </div>
                    <div className="bg-white border-b border-gray-200 flex">
                        {CHECKLIST_SECTIONS.map(section => {
                            const count = countAnswered(section.id);
                            const total = countTotal(section.id);
                            const isDone = count === total && total > 0;
                            const isActive = activeTab === section.id;
                            return (
                                <button key={section.id} onClick={() => setActiveTab(section.id)} className={`flex-1 py-4 px-1 text-[10px] font-black uppercase tracking-tight border-b-2 transition-all flex flex-col items-center gap-1 ${isActive ? 'border-blue-600 text-blue-900 bg-blue-50/30' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                                    <span>{section.label}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{count}/{total}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* SCROLLABLE CHECKLIST AREA */}
                    <div className={`flex-1 overflow-y-auto p-6 bg-gray-50 ${isReadOnly ? 'grayscale-[50%] opacity-80' : ''}`}>
                        {CHECKLIST_SECTIONS.map(section => (
                            <div key={section.id} className={activeTab === section.id ? 'block space-y-6' : 'hidden'}>
                                {section.groups.map((group, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                                            <h3 className="font-black text-xs text-blue-900 uppercase tracking-widest">{group.title}</h3>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {group.items.map(item => (
                                                <div key={item.id} className="p-4 hover:bg-blue-50/20 transition-colors">
                                                    <div className="flex items-start gap-2 mb-3">
                                                        <span className="text-[9px] font-mono font-bold text-gray-400 bg-gray-100 px-1.5 rounded mt-0.5">{item.id}</span>
                                                        <span className="text-xs font-bold text-gray-700 leading-snug">{item.text}</span>
                                                    </div>

                                                    {/* YES / NO / NA RADIO GROUP */}
                                                    <div className="flex gap-2 ml-8">
                                                        {['Yes', 'No', 'N/A'].map(opt => (
                                                            <label key={opt} className={`flex-1 cursor-pointer flex items-center justify-center py-1.5 rounded border text-[10px] font-bold transition-all
                                                                ${checks[item.id] === opt
                                                                    ? opt === 'Yes' ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                                                        : opt === 'No' ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                                                            : 'bg-gray-600 text-white border-gray-600 shadow-sm'
                                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400'
                                                                } ${isReadOnly ? 'cursor-not-allowed opacity-70' : ''}
                                                            `}>
                                                                <input
                                                                    type="radio"
                                                                    name={item.id}
                                                                    value={opt}
                                                                    checked={checks[item.id] === opt}
                                                                    onChange={() => handleCheckChange(item.id, opt)}
                                                                    disabled={isReadOnly}
                                                                    className="hidden"
                                                                />
                                                                {opt}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        <div className="mt-8">
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Validator Remarks</label>
                            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={isReadOnly} className="w-full h-32 p-4 rounded-2xl border border-gray-200 text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none disabled:bg-gray-100 outline-none shadow-sm transition-all" placeholder="Enter remarks..." />
                        </div>
                    </div>

                    <div className="p-6 bg-white border-t space-y-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                        {!isReadOnly && (
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handleAction('RETURN')} disabled={isSubmitting} className="py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-orange-100 text-orange-600 hover:bg-orange-50 bg-white">Return</button>
                                <button onClick={() => handleAction('APPROVE')} disabled={isSubmitting} className="py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-green-100 text-green-600 hover:bg-green-50 bg-white">Pass</button>
                            </div>
                        )}
                        <button onClick={onClose} className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 pt-2 transition-colors">Discard changes and exit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}