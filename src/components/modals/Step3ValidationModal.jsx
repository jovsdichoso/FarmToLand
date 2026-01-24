import { useState, useEffect } from 'react';

// --- ICONS ---
const IconDoc = () => <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconData = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const IconCheck = () => <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconMissing = () => <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconInfo = () => <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconWarning = () => <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

// --- REQUIRED DOCUMENTS ---
const REQUIRED_DOCS = [
    { key: 'detailed_engineering', label: 'Detailed Engineering Design' },
    { key: 'qto', label: 'Quantity Take-Off (QTO)' },
    { key: 'specs', label: 'Technical Specifications' },
    { key: 'cost_template', label: 'Cost Estimates/ABC (Excel)' }
];

// --- CHECKLIST DATA (Complete from PDF) ---
const CHECKLIST_SECTIONS = [
    {
        id: 'design',
        label: 'Detailed Design',
        groups: [
            {
                title: 'A. General Design Completeness',
                items: [
                    { id: 'DES_A1', text: 'Are complete plan sheets submitted (cover sheet, layout, profiles, cross-sections)?' },
                    { id: 'DES_A2', text: 'Are all drawings properly titled, dated, and signed by the responsible engineer?' },
                    { id: 'DES_A3', text: 'Is the project location clearly indicated (barangay, municipality, province)?' },
                    { id: 'DES_A4', text: 'Are drawing scales indicated and consistent across sheets?' },
                    { id: 'DES_A5', text: 'Are north arrows, benchmarks, and references clearly shown?' }
                ]
            },
            {
                title: 'B. Alignment with Approved Scope',
                items: [
                    { id: 'DES_B1', text: 'Does the design match the scope approved in planning and budgeting (length, type, alignment)?' },
                    { id: 'DES_B2', text: 'Is the road classification consistent with the approved FMR type (farm-to-market, access road, etc.)?' },
                    { id: 'DES_B3', text: 'Are design features limited to those necessary for the approved scope (no scope creep)?' },
                    { id: 'DES_B4', text: 'Are ancillary works (drainage, slope protection, structures) justified by site conditions?' }
                ]
            },
            {
                title: 'C. Geometric Design & Standards Compliance',
                items: [
                    { id: 'DES_C1', text: 'Are horizontal and vertical alignments clearly shown and dimensioned?' },
                    { id: 'DES_C2', text: 'Do design speeds, widths, and clearances comply with applicable standards?' },
                    { id: 'DES_C3', text: 'Are pavement layers clearly defined with thicknesses indicated?' },
                    { id: 'DES_C4', text: 'Are cross-slopes and camber indicated and consistent?' }
                ]
            },
            {
                title: 'D. Drainage & Hydraulic Considerations',
                items: [
                    { id: 'DES_D1', text: 'Are drainage structures (ditches, culverts) shown and dimensioned?' },
                    { id: 'DES_D2', text: 'Are drainage layouts consistent with road alignment and profiles?' },
                    { id: 'DES_D3', text: 'Are flood-prone areas identified and addressed in the design?' },
                    { id: 'DES_D4', text: 'Are outlet points and flow directions clearly indicated?' }
                ]
            },
            {
                title: 'E. Structures & Special Features (If Applicable)',
                items: [
                    { id: 'DES_E1', text: 'Are retaining walls, slope protection, or bridges clearly detailed?' },
                    { id: 'DES_E2', text: 'Are structural elements supported by basic design computations or references?' },
                    { id: 'DES_E3', text: 'Are special features justified by site conditions?' }
                ]
            },
            {
                title: 'F. Constructability & Clarity',
                items: [
                    { id: 'DES_F1', text: 'Can quantities be directly derived from the drawings?' },
                    { id: 'DES_F2', text: 'Are design details clear enough to avoid interpretation by bidders?' },
                    { id: 'DES_F3', text: 'Are there no conflicting dimensions or annotations across drawings?' }
                ]
            },
            {
                title: 'G. Red Flag Indicators (Internal Use Only)',
                type: 'red_flag',
                items: [
                    { id: 'DES_G1', text: 'Unusually high level of detail for minor works' },
                    { id: 'DES_G2', text: 'Repeated use of custom or non-standard design details' },
                    { id: 'DES_G3', text: 'Design features not reflected in scope justification' },
                    { id: 'DES_G4', text: 'Drawings revised multiple times without explanation' }
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
                    { id: 'QTO_A1', text: 'Is a complete Quantity Take-Off (QTO) file submitted?' },
                    { id: 'QTO_A2', text: 'Is the QTO dated, versioned, and signed by the responsible engineer?' },
                    { id: 'QTO_A3', text: 'Are quantities presented in a clear tabular format by pay item?' },
                    { id: 'QTO_A4', text: 'Are units of measure consistent with standard pay item units?' },
                    { id: 'QTO_A5', text: 'Is the QTO file locked or protected against silent modification?' }
                ]
            },
            {
                title: 'B. Traceability to Approved Design Drawings',
                items: [
                    { id: 'QTO_B1', text: 'Are all quantities directly traceable to approved design drawings?' },
                    { id: 'QTO_B2', text: 'Are drawing sheet numbers referenced for each quantity item?' },
                    { id: 'QTO_B3', text: 'Are lengths, areas, and volumes consistent with plan dimensions?' },
                    { id: 'QTO_B4', text: 'Are typical sections correctly applied across relevant chainages?' },
                    { id: 'QTO_B5', text: 'Are assumptions (if any) explicitly stated and justified?' }
                ]
            },
            {
                title: 'C. Roadway Quantities',
                items: [
                    { id: 'QTO_C1', text: 'Do pavement quantities match the approved road length and width?' },
                    { id: 'QTO_C2', text: 'Are pavement layer thicknesses consistent with typical sections?' },
                    { id: 'QTO_C3', text: 'Are excavation and embankment quantities supported by profiles?' },
                    { id: 'QTO_C4', text: 'Are shoulder quantities correctly derived and not duplicated?' }
                ]
            },
            {
                title: 'D. Drainage & Structures Quantities',
                items: [
                    { id: 'QTO_D1', text: 'Are drainage quantities tied to shown locations and dimensions?' },
                    { id: 'QTO_D2', text: 'Are culvert quantities supported by size and count shown in plans?' },
                    { id: 'QTO_D3', text: 'Are structure quantities itemized separately (not bundled)?' },
                    { id: 'QTO_D4', text: 'Are formwork, excavation, and backfill quantities not double-counted?' }
                ]
            },
            {
                title: 'E. Duplication, Padding, and Anomaly Checks',
                items: [
                    { id: 'QTO_E1', text: 'Are there no duplicate pay items for the same work element?' },
                    { id: 'QTO_E2', text: 'Are quantities reasonable relative to project scale?' },
                    { id: 'QTO_E3', text: 'Are contingency-type quantities explicitly labeled and justified?' },
                    { id: 'QTO_E4', text: 'Are rounding practices reasonable and consistently applied?' }
                ]
            },
            {
                title: 'F. Consistency with Cost Estimates',
                items: [
                    { id: 'QTO_F1', text: 'Do QTO quantities exactly match those used in the cost estimate?' },
                    { id: 'QTO_F2', text: 'Are there no "orphan" quantities present only in the cost estimate?' },
                    { id: 'QTO_F3', text: 'Are quantity adjustments clearly documented and explained?' }
                ]
            },
            {
                title: 'G. Red Flag Indicators (Internal Use Only)',
                type: 'red_flag',
                items: [
                    { id: 'QTO_G1', text: 'Quantities significantly higher than comparable FMR projects' },
                    { id: 'QTO_G2', text: 'Multiple small quantity items that aggregate to large costs' },
                    { id: 'QTO_G3', text: 'Large quantities not visually apparent in drawings' },
                    { id: 'QTO_G4', text: 'Frequent last-minute quantity revisions' },
                    { id: 'QTO_G5', text: 'QTO prepared by a different person/entity than the designer' }
                ]
            }
        ]
    },
    {
        id: 'specs',
        label: 'Technical Specs',
        groups: [
            {
                title: 'A. Specification Set Completeness',
                items: [
                    { id: 'SPC_A1', text: 'Is a complete technical specification document submitted?' },
                    { id: 'SPC_A2', text: 'Are specifications clearly structured by work item?' },
                    { id: 'SPC_A3', text: 'Are all work items in the QTO covered by a corresponding specification?' },
                    { id: 'SPC_A4', text: 'Are there no specification items without corresponding quantities?' }
                ]
            },
            {
                title: 'B. Alignment with Standard Specifications',
                items: [
                    { id: 'SPC_B1', text: 'Do specifications reference the applicable DPWH/DA standard specs?' },
                    { id: 'SPC_B2', text: 'Are standard clauses adopted verbatim where applicable?' },
                    { id: 'SPC_B3', text: 'Are deviations from standard specs explicitly identified?' },
                    { id: 'SPC_B4', text: 'Are all deviations technically justified in writing?' }
                ]
            },
            {
                title: 'C. Prohibition of Brand or Supplier Lock-In',
                items: [
                    { id: 'SPC_C1', text: 'Do specifications avoid brand names or proprietary references?' },
                    { id: 'SPC_C2', text: 'Where performance-based specs are used, are they generic?' },
                    { id: 'SPC_C3', text: 'Are alternative materials or methods explicitly allowed?' },
                    { id: 'SPC_C4', text: 'Are product equivalency clauses present where appropriate?' }
                ]
            },
            {
                title: 'D. Technical Parameter Reasonableness',
                items: [
                    { id: 'SPC_D1', text: 'Are material strength, thickness, and quality parameters reasonable for an FMR?' },
                    { id: 'SPC_D2', text: 'Are tolerances consistent with standard rural road practice?' },
                    { id: 'SPC_D3', text: 'Are testing requirements proportionate to project scale?' },
                    { id: 'SPC_D4', text: 'Are equipment or method requirements non-exclusive?' }
                ]
            },
            {
                title: 'E. Consistency with Design Drawings',
                items: [
                    { id: 'SPC_E1', text: 'Do specifications match materials shown in design drawings?' },
                    { id: 'SPC_E2', text: 'Are dimensions and materials consistent across specs and drawings?' },
                    { id: 'SPC_E3', text: 'Are construction methods aligned with shown design details?' }
                ]
            },
            {
                title: 'F. Consistency with Quantity Take-Off and ABC',
                items: [
                    { id: 'SPC_F1', text: 'Are specified materials consistent with QTO items?' },
                    { id: 'SPC_F2', text: 'Are no higher-grade materials specified without quantity adjustment?' },
                    { id: 'SPC_F3', text: 'Do specification requirements support the approved ABC assumptions?' }
                ]
            },
            {
                title: 'G. Modification and Version Control',
                items: [
                    { id: 'SPC_G1', text: 'Are specifications versioned and dated?' },
                    { id: 'SPC_G2', text: 'Are all modifications from previous versions documented?' },
                    { id: 'SPC_G3', text: 'Are late-stage specification changes accompanied by revalidation?' }
                ]
            },
            {
                title: 'H. Red Flag Indicators (Internal Use Only)',
                type: 'red_flag',
                items: [
                    { id: 'SPC_H1', text: 'Specs tighter than national standards without justification' },
                    { id: 'SPC_H2', text: 'Unique material grades rarely used in FMRs' },
                    { id: 'SPC_H3', text: 'Specs referencing particular manufacturing processes' },
                    { id: 'SPC_H4', text: 'Last-minute spec revisions close to bidding' },
                    { id: 'SPC_H5', text: 'Specs not used in similar DA projects elsewhere' }
                ]
            }
        ]
    },
    {
        id: 'abc',
        label: 'ABC & Unit Cost',
        groups: [
            {
                title: 'A. ABC Document Completeness',
                items: [
                    { id: 'ABC_A1', text: 'Is an Approved Budget for the Contract (ABC) document submitted?' },
                    { id: 'ABC_A2', text: 'Is the ABC itemized by work item consistent with the QTO?' },
                    { id: 'ABC_A3', text: 'Are unit costs, quantities, and totals clearly shown?' },
                    { id: 'ABC_A4', text: 'Are formulas visible and not hard-coded values?' }
                ]
            },
            {
                title: 'B. Source and Reference Validation',
                items: [
                    { id: 'ABC_B1', text: 'Are unit costs supported by valid reference sources?' },
                    { id: 'ABC_B2', text: 'Are reference sources dated and within the allowable period?' },
                    { id: 'ABC_B3', text: 'Are sources allowable under DA/DPWH costing rules?' },
                    { id: 'ABC_B4', text: 'Are references consistent across similar work items?' }
                ]
            },
            {
                title: 'C. Unit Cost Reasonableness Checks (Rule-Based)',
                items: [
                    { id: 'ABC_C1', text: 'Do unit costs fall within allowable variance from benchmarks?' },
                    { id: 'ABC_C2', text: 'Are adjustments beyond thresholds justified in writing?' },
                    { id: 'ABC_C3', text: 'Are no unexplained outliers present among unit costs?' },
                    { id: 'ABC_C4', text: 'Are similar items priced consistently across the project?' }
                ]
            },
            {
                title: 'D. Quantity-Cost Consistency',
                items: [
                    { id: 'ABC_D1', text: 'Do quantities used in the ABC exactly match the approved QTO?' },
                    { id: 'ABC_D2', text: 'Are no quantities inflated relative to design drawings?' },
                    { id: 'ABC_D3', text: 'Are rounding practices consistent and rule-based?' },
                    { id: 'ABC_D4', text: 'Are lump sum items clearly justified and limited?' }
                ]
            },
            {
                title: 'E. Cost Build-Up Integrity',
                items: [
                    { id: 'ABC_E1', text: 'Are labor, materials, equipment, OCM clearly separated?' },
                    { id: 'ABC_E2', text: 'Are indirect costs applied using standard percentages?' },
                    { id: 'ABC_E3', text: 'Are profit and contingency rates within allowed limits?' },
                    { id: 'ABC_E4', text: 'Are taxes computed correctly and transparently?' }
                ]
            },
            {
                title: 'F. Cross-Project Benchmarking',
                items: [
                    { id: 'ABC_F1', text: 'Are unit costs consistent with recent DA FMR projects?' },
                    { id: 'ABC_F2', text: 'If higher than benchmarks, is justification documented?' },
                    { id: 'ABC_F3', text: 'Are no single items disproportionately driving ABC increases?' }
                ]
            },
            {
                title: 'G. Modification and Version Control',
                items: [
                    { id: 'ABC_G1', text: 'Is the ABC versioned and dated?' },
                    { id: 'ABC_G2', text: 'Are revisions from previous ABCs documented?' },
                    { id: 'ABC_G3', text: 'Were revisions triggered by approved design changes only?' }
                ]
            },
            {
                title: 'H. Red Flag Indicators (Internal Use Only)',
                type: 'red_flag',
                items: [
                    { id: 'ABC_H1', text: 'Multiple unit costs near maximum allowable variance' },
                    { id: 'ABC_H2', text: 'Significant ABC increase without scope change' },
                    { id: 'ABC_H3', text: 'Unique pricing patterns not seen in other FMRs' },
                    { id: 'ABC_H4', text: 'Cost spikes concentrated in hard-to-verify items' },
                    { id: 'ABC_H5', text: 'Late-stage ABC revisions near procurement' }
                ]
            }
        ]
    }
];

export default function Step3ValidationModal({ isOpen, onClose, project, onValidate }) {
    if (!isOpen || !project) return null;

    // --- STATE LOGIC ---
    // 1. Cleared: Project has successfully passed Step 3
    const isCleared = project.status === 'step4_bidding' || (project.status && project.status.startsWith('STEP4'));

    // 2. Pending Review: The ONLY time BAFE can actually edit/validate
    const isPendingReview = project.status === 'step3_pending';

    // 3. READ ONLY: If it's already cleared OR if it's NOT pending (e.g. Draft, Returned, etc.)
    const isReadOnly = isCleared || !isPendingReview;

    // UI States
    const [leftMode, setLeftMode] = useState('data');
    const [selectedDoc, setSelectedDoc] = useState(null);

    // Validation States
    const [activeTab, setActiveTab] = useState('design');
    const [checks, setChecks] = useState({}); // { id: 'Yes' | 'No' | 'N/A' }
    const [evidence, setEvidence] = useState({}); // { id: 'text string' }
    const [remarks, setRemarks] = useState('');
    const [validatedABC, setValidatedABC] = useState(project.cost || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize
    useEffect(() => {
        if (isOpen) {
            if (project.step3_data) {
                setChecks(project.step3_data.checks || {});
                setEvidence(project.step3_data.evidence || {});
                setRemarks(project.step3_data.remarks || '');
                setValidatedABC(project.step3_data.final_abc || project.cost || '');
            } else {
                setChecks({});
                setEvidence({});
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

    const handleEvidenceChange = (id, value) => {
        if (isReadOnly) return;
        setEvidence(prev => ({ ...prev, [id]: value }));
    };

    const handleAction = (action) => {
        if (isReadOnly) return;

        if (action === 'APPROVE') {
            if (!validatedABC || parseFloat(validatedABC) <= 0) {
                alert("Please enter a valid Final ABC amount.");
                return;
            }

            // Validation Logic
            const allItems = CHECKLIST_SECTIONS.flatMap(s => s.groups.flatMap(g => g.items.map(i => ({ ...i, type: g.type }))));
            const missingItems = allItems.filter(i => !checks[i.id]);

            if (missingItems.length > 0) {
                alert(`Cannot Issue Clearance: ${missingItems.length} items are unanswered.`);
                return;
            }

            const failedStandard = allItems.filter(i => i.type !== 'red_flag' && checks[i.id] === 'No');
            const failedRedFlags = allItems.filter(i => i.type === 'red_flag' && checks[i.id] === 'Yes');

            if (failedStandard.length > 0) {
                alert(`Cannot Issue Clearance: ${failedStandard.length} standard items are marked 'No'. Please Return or Escalate.`);
                return;
            }
            if (failedRedFlags.length > 0) {
                alert(`Warning: ${failedRedFlags.length} Red Flags are observed (marked 'Yes'). Consider Escalating instead of Clearing.`);
                return;
            }
        }

        if ((action === 'RETURN' || action === 'ESCALATE') && !remarks.trim()) {
            alert("Please provide remarks/justification for this action.");
            return;
        }

        setIsSubmitting(true);

        let newStatus = 'step3_pending';
        let statusLabel = 'PENDING';

        if (action === 'APPROVE') {
            newStatus = 'step4_bidding'; // Success! Moves to Step 4
            statusLabel = 'CLEARED';
        } else if (action === 'RETURN') {
            newStatus = 'RETURNED'; // Goes back to RO
            statusLabel = 'RETURNED';
        } else if (action === 'ESCALATE') {
            newStatus = 'step3_escalated';
            statusLabel = 'ESCALATED';
        }

        const updatedProject = {
            ...project,
            status: newStatus,
            validated_abc: parseFloat(validatedABC),
            step3_data: {
                checks,
                evidence,
                remarks,
                final_abc: validatedABC,
                decision: statusLabel,
                date_decided: new Date().toISOString()
            },
            step3_returned: action === 'RETURN',
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
                        <span className="font-bold text-xs uppercase">Status: Returned for Correction (Waiting for RO)</span>
                    </div>
                )}
                {project.status === 'step3_escalated' && (
                    <div className="absolute top-0 left-0 right-0 bg-purple-100 border-b border-purple-200 text-purple-800 px-6 py-2 z-50 flex justify-between items-center shadow-sm">
                        <span className="font-bold text-xs uppercase">Status: Escalated for Technical Review</span>
                    </div>
                )}
                {isCleared && (
                    <div className="absolute top-0 left-0 right-0 bg-green-100 border-b border-green-200 text-green-800 px-6 py-2 z-50 flex justify-between items-center shadow-sm">
                        <span className="font-bold text-xs uppercase">Status: Cleared (Locked)</span>
                    </div>
                )}
                {/* --- DRAFT BANNER (New) --- */}
                {!isCleared && !isPendingReview && project.status !== 'RETURNED' && project.status !== 'step3_escalated' && (
                    <div className="absolute top-0 left-0 right-0 bg-gray-100 border-b border-gray-200 text-gray-600 px-6 py-2 z-50 flex justify-between items-center shadow-sm">
                        <span className="font-bold text-xs uppercase">Status: Draft / Preparing (Waiting for RO Submission)</span>
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

                                {/* --- NEW HEADER BLOCK --- */}
                                <PDFHeaderBlock project={project} />

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
                <div className="w-[520px] bg-gray-50 flex flex-col shrink-0 shadow-2xl z-10 border-l border-gray-200">
                    <div className="p-6 border-b bg-white flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase">Verification Panel</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Step 3: Engineering & Cost Validation</p>
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
                            <div key={section.id} className={activeTab === section.id ? 'block' : 'hidden'}>
                                {section.groups.map((group, idx) => (
                                    <div key={idx} className={`rounded-2xl border shadow-sm overflow-hidden mb-6 ${group.type === 'red_flag' ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                                        <div className={`px-5 py-3 border-b flex justify-between items-center ${group.type === 'red_flag' ? 'bg-orange-100 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                                            <h3 className={`font-black text-xs uppercase tracking-widest ${group.type === 'red_flag' ? 'text-orange-900 flex items-center gap-2' : 'text-blue-900'}`}>
                                                {group.type === 'red_flag' && <IconWarning />}
                                                {group.title}
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {group.items.map(item => (
                                                <div key={item.id} className="p-4 hover:bg-black/5 transition-colors">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-[9px] font-mono font-bold text-gray-400 bg-gray-100 px-1.5 rounded mt-0.5 shrink-0">{item.id.split('_')[1]}</span>
                                                            <span className="text-xs font-bold text-gray-700 leading-snug">{item.text}</span>
                                                        </div>

                                                        {/* Controls Row: Options + Evidence Input */}
                                                        <div className="flex items-center gap-4 pl-8">
                                                            <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                                                                {['Yes', 'No', 'N/A'].map(opt => (
                                                                    <label key={opt} className={`cursor-pointer px-3 py-1.5 rounded-md text-[10px] font-bold transition-all
                                                                        ${checks[item.id] === opt
                                                                            ? opt === 'Yes' ? 'bg-green-500 text-white shadow-sm'
                                                                                : opt === 'No' ? 'bg-red-500 text-white shadow-sm'
                                                                                    : 'bg-gray-500 text-white shadow-sm'
                                                                            : 'text-gray-500 hover:text-gray-900'
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
                                                            {/* Evidence Input (Required by PDF) */}
                                                            <input
                                                                type="text"
                                                                placeholder="Ref: Sheet #, Page #"
                                                                value={evidence[item.id] || ''}
                                                                onChange={(e) => handleEvidenceChange(item.id, e.target.value)}
                                                                disabled={isReadOnly}
                                                                className="flex-1 min-w-0 bg-transparent border-b border-gray-300 py-1 text-[10px] text-blue-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        <div className="mt-8">
                            <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Reviewer Remarks / Justification</label>
                            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} disabled={isReadOnly} className="w-full h-32 p-4 rounded-2xl border border-gray-200 text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none disabled:bg-gray-100 outline-none shadow-sm transition-all" placeholder="Required for Return or Escalation..." />
                        </div>
                    </div>

                    <div className="p-6 bg-white border-t space-y-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                        {!isReadOnly && (
                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={() => handleAction('RETURN')} disabled={isSubmitting} className="py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-orange-100 text-orange-600 hover:bg-orange-50 bg-white transition-colors">Return</button>
                                <button onClick={() => handleAction('ESCALATE')} disabled={isSubmitting} className="py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-purple-100 text-purple-600 hover:bg-purple-50 bg-white transition-colors">Escalate</button>
                                <button onClick={() => handleAction('APPROVE')} disabled={isSubmitting} className="py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-green-100 text-green-600 hover:bg-green-50 bg-white transition-colors">Clear Project</button>
                            </div>
                        )}
                        <button onClick={onClose} className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 pt-2 transition-colors">Discard changes and exit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- HELPER COMPONENT: PDF HEADER BLOCK ---
const PDFHeaderBlock = ({ project }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
            Official Checklist Header
        </h3>
        <div className="space-y-3 font-mono text-xs text-gray-700">
            <div className="flex border-b border-gray-100 pb-1">
                <span className="w-40 font-bold text-gray-500 uppercase">Project ID:</span>
                <span className="font-black text-black">{project.id}</span>
            </div>
            <div className="flex border-b border-gray-100 pb-1">
                <span className="w-40 font-bold text-gray-500 uppercase">Project Title:</span>
                <span className="font-bold">{project.name}</span>
            </div>
            <div className="flex border-b border-gray-100 pb-1">
                <span className="w-40 font-bold text-gray-500 uppercase">Implementing Office:</span>
                <span className="font-medium">{project.implementing_office || 'LGU / DA Regional Office'}</span>
            </div>
            {/* --- ADDED REVIEWER FIELD --- */}
            <div className="flex border-b border-gray-100 pb-1">
                <span className="w-40 font-bold text-gray-500 uppercase">Reviewer:</span>
                <span className="font-medium text-blue-600">{project.reviewer || 'Current Validator User'}</span>
            </div>
            <div className="flex items-center">
                <span className="w-40 font-bold text-gray-500 uppercase">Date Reviewed:</span>
                <span className="bg-yellow-100 px-2 py-0.5 rounded text-yellow-800 font-bold">
                    {new Date().toLocaleDateString()}
                </span>
            </div>
        </div>
    </div>
);