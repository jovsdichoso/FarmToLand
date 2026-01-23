import { useState, useEffect } from 'react';

// --- ICONS ---
const IconFile = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const IconCheck = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconX = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconReturn = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>;
const IconMap = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;

export default function ReviewProjectModal({ isOpen, onClose, project, onDecision }) {
    if (!isOpen || !project) return null;

    // --- STATE ---
    const isReadOnly = project.status !== 'PENDING_REVIEW';

    const [remarks, setRemarks] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [decision, setDecision] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- CHECKLIST ITEMS ---
    const [checklist, setChecklist] = useState({
        endorsementComplete: false,
        mapSketchClear: false,
        gpsAccurate: false,
        roadLengthReasonable: false,
        problemStatementClear: false,
        rightOfWayAssessed: false,
        environmentalChecked: false,
        photosProvided: false
    });

    // --- MASTERPLAN LOGIC ---
    const [masterplanVerified, setMasterplanVerified] = useState(false);
    const [masterplanNotes, setMasterplanNotes] = useState('');

    // Reset or Populate state when project changes
    useEffect(() => {
        if (isOpen) {
            setDecision(null);
            setRemarks('');
            setMasterplanVerified(false);
            setMasterplanNotes('');
            setChecklist({
                endorsementComplete: false,
                mapSketchClear: false,
                gpsAccurate: false,
                roadLengthReasonable: false,
                problemStatementClear: false,
                rightOfWayAssessed: false,
                environmentalChecked: false,
                photosProvided: false
            });
        }
    }, [isOpen, project]);

    const handleCheck = (key) => {
        if (isReadOnly) return;
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const checklistCount = Object.values(checklist).filter(Boolean).length;
    const totalItems = Object.keys(checklist).length;

    const isReadyToClear = checklistCount === totalItems && masterplanVerified;

    // --- FIX IS HERE ---
    const handleSubmit = () => {
        if (isReadOnly) return;
        setIsSubmitting(true);

        // 1. Determine new Status
        let newStatus = 'PENDING_REVIEW';
        if (decision === 'clear') newStatus = 'CLEARED';
        if (decision === 'return') newStatus = 'RETURNED';

        // 2. Construct the Update Object
        const updatedProject = {
            ...project,                  // <--- CRITICAL FIX: Keep all original data!
            status: newStatus,
            last_updated: new Date().toISOString(),
            validator_data: {
                notes: remarks,
                priority: priority,
                checklist: checklist,
                masterplanData: {
                    verified: masterplanVerified,
                    notes: masterplanNotes
                }
            }
        };

        setTimeout(() => {
            onDecision(updatedProject);
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    // --- HELPER: FORMAT CURRENCY ---
    const formatMoney = (amount) => {
        if (!amount) return '₱ 0.00';
        const cleanVal = String(amount).replace(/[^0-9.]/g, '');
        const num = parseFloat(cleanVal);
        return isNaN(num) ? '₱ 0.00' : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(num);
    };

    // --- UI HELPERS ---
    const SectionHeader = ({ title }) => (
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-xs text-gray-500 uppercase tracking-wider">
            {title}
        </div>
    );

    const DataRow = ({ label, value, subtext }) => (
        <div className="mb-3">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">{label}</label>
            <div className="text-sm font-medium text-gray-900 break-words">{value || '---'}</div>
            {subtext && <div className="text-xs text-gray-500 mt-0.5">{subtext}</div>}
        </div>
    );

    const ChecklistRow = ({ id, label }) => (
        <label className={`flex items-start gap-3 p-2 rounded-lg transition-colors group ${isReadOnly ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}>
            <input
                type="checkbox"
                checked={checklist[id]}
                onChange={() => handleCheck(id)}
                disabled={isReadOnly}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className={`text-sm ${checklist[id] ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {label}
            </span>
        </label>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-6xl h-[90vh] flex overflow-hidden shadow-2xl">

                {/* ================= LEFT PANEL: PROJECT DATA VIEWER ================= */}
                <div className="flex-1 overflow-y-auto bg-white border-r border-gray-200">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 mb-2">
                            PROJECT DATA
                        </span>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{project.name}</h2>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className="font-mono">{project.id}</span>
                            <span>•</span>
                            <span>{project.date}</span>
                        </div>
                    </div>

                    <div className="p-0">
                        <SectionHeader title="A. Project Identification & Location" />
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <DataRow label="Region" value={project.regionName} />
                            <DataRow label="Province" value={project.provinceName} />
                            <div className="col-span-2">
                                <DataRow label="Municipalities" value={project.municipalities?.join(', ')} />
                            </div>
                        </div>

                        <SectionHeader title="B. Network & Connectivity" />
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <DataRow label="Connectivity Function" value={project.connectivityFunction} />
                            </div>
                            <DataRow label="Facility Accessed" value={project.facilityType} subtext={project.marketName} />
                            <DataRow label="Distance" value={`${project.distanceToFacility} km`} />
                        </div>

                        <SectionHeader title="Readiness & Cost" />
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <DataRow label="ROW Status" value={project.rowStatus} />
                                <DataRow label="Length" value={`${project.roadLength} km`} />
                                <DataRow label="Cost" value={formatMoney(project.indicativeCost)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= RIGHT PANEL: CHECKLIST & DECISION ================= */}
                <div className="w-96 bg-gray-50 flex flex-col shrink-0 border-l border-gray-200 shadow-xl z-20 relative">

                    {isReadOnly && (
                        <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 text-center max-w-xs mx-4">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Review Completed</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    This project has already been processed. Current status: <span className="font-bold text-gray-900">{project.status}</span>.
                                </p>
                                <button onClick={onClose} className="w-full py-2 bg-blue-700 text-white rounded font-bold text-sm">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="p-5 border-b border-gray-200 bg-white">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Validation Workspace</h3>
                    </div>

                    <div className="flex-1 p-5 overflow-y-auto space-y-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Requirements Check</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${checklistCount === totalItems ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {checklistCount} / {totalItems}
                                </span>
                            </div>
                            <div className="space-y-0.5">
                                <ChecklistRow id="endorsementComplete" label="Endorsement Complete" />
                                <ChecklistRow id="mapSketchClear" label="Map Sketch Clear" />
                                <ChecklistRow id="gpsAccurate" label="GPS Accurate" />
                                <ChecklistRow id="roadLengthReasonable" label="Road Length Reasonable" />
                                <ChecklistRow id="problemStatementClear" label="Problem Statement Clear" />
                                <ChecklistRow id="rightOfWayAssessed" label="Right of Way Assessed" />
                                <ChecklistRow id="environmentalChecked" label="Environmental Checked" />
                                <ChecklistRow id="photosProvided" label="Photos Provided" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Validator Remarks</label>
                            <textarea
                                disabled={isReadOnly}
                                className="w-full h-24 p-3 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:bg-gray-100"
                                placeholder="Enter comments..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>

                        <div className={`p-4 rounded-xl border transition-colors ${masterplanVerified ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                            <label className={`flex items-start gap-3 mb-2 ${isReadOnly ? '' : 'cursor-pointer'}`}>
                                <div className={`mt-0.5 p-1 rounded text-white ${masterplanVerified ? 'bg-blue-600' : 'bg-gray-300'}`}><IconMap /></div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-gray-900">Masterplan Verified</span>
                                        <input
                                            type="checkbox"
                                            disabled={isReadOnly}
                                            checked={masterplanVerified}
                                            onChange={() => setMasterplanVerified(!masterplanVerified)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Decision</label>

                            <button
                                onClick={() => setDecision('clear')}
                                disabled={!isReadyToClear || isReadOnly}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all relative overflow-hidden
                                ${decision === 'clear' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-white border-gray-200 text-gray-700 hover:border-green-400'}`}
                            >
                                <div className={`p-1.5 rounded-full ${decision === 'clear' ? 'bg-green-200' : 'bg-gray-100'}`}><IconCheck /></div>
                                <div className="text-sm font-bold">Clear / Eligible</div>
                            </button>

                            <button
                                onClick={() => setDecision('return')}
                                disabled={isReadOnly}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                                ${decision === 'return' ? 'bg-orange-50 border-orange-500 text-orange-800' : 'bg-white border-gray-200 text-gray-700 hover:border-orange-400'}`}
                            >
                                <div className={`p-1.5 rounded-full ${decision === 'return' ? 'bg-orange-200' : 'bg-gray-100'}`}><IconReturn /></div>
                                <div className="text-sm font-bold">Return for Correction</div>
                            </button>
                        </div>
                    </div>

                    <div className="p-5 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">
                                {isReadOnly ? 'Close' : 'Cancel'}
                            </button>
                            {!isReadOnly && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!decision || isSubmitting}
                                    className="flex-1 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-bold hover:bg-blue-800 shadow-lg disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Confirm'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}