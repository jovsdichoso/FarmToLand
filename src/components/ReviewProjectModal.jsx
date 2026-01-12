import { useState, useEffect } from 'react';

// --- ICONS ---
const IconFile = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const IconCheck = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconX = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconReturn = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>;
const IconMap = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;

export default function ReviewProjectModal({ isOpen, onClose, project, onDecision }) {
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

    // Reset state when project changes
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
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const checklistCount = Object.values(checklist).filter(Boolean).length;
    const totalItems = Object.keys(checklist).length;

    // Masterplan is only "ready" if checked AND (optionally) has a note if required
    const isReadyToClear = checklistCount === totalItems && masterplanVerified;

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            onDecision(project.id, {
                action: decision,
                notes: remarks,
                priority: priority,
                checklist: checklist,
                masterplanData: {
                    verified: masterplanVerified,
                    notes: masterplanNotes
                }
            });
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    // --- HELPER: FORMAT CURRENCY ---
    const formatMoney = (amount) => {
        if (!amount) return '₱ 0.00';
        const cleanVal = String(amount).replace(/[^0-9.]/g, '');
        const num = parseFloat(cleanVal);
        if (isNaN(num)) return '₱ 0.00';

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(num);
    };

    if (!isOpen || !project) return null;

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

    const AttachmentBtn = ({ label, file }) => (
        <div className="flex items-center justify-between p-2 border border-gray-200 rounded bg-white hover:bg-gray-50 transition-colors group">
            <div className="flex items-center gap-2 overflow-hidden">
                <div className={`p-1.5 rounded ${file ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-500'}`}>
                    <IconFile />
                </div>
                <span className={`text-xs font-medium truncate ${file ? 'text-gray-700' : 'text-red-400 italic'}`}>
                    {label}
                </span>
            </div>
            {file && (
                <button className="text-[10px] font-bold text-blue-700 hover:underline">VIEW</button>
            )}
        </div>
    );

    const ChecklistRow = ({ id, label }) => (
        <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
            <input
                type="checkbox"
                checked={checklist[id]}
                onChange={() => handleCheck(id)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
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
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 mb-2">
                                    STEP 1 SUBMISSION
                                </span>
                                <h2 className="text-lg font-bold text-gray-900 leading-tight">{project.name}</h2>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                    <span className="font-mono">{project.id}</span>
                                    <span>•</span>
                                    <span>{project.date}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-0">
                        {/* A. LOCATION */}
                        <SectionHeader title="A. Project Identification & Location" />
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <DataRow label="Region" value={project.regionName} />
                            <DataRow label="Province" value={project.provinceName} />
                            <div className="col-span-2">
                                <DataRow label="Municipalities" value={project.municipalities?.join(', ')} />
                            </div>
                            <div className="col-span-2">
                                <DataRow label="Barangays" value={project.barangays?.join(', ')} />
                            </div>
                            <div className="col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                                <DataRow label="GPS Start" value={project.gpsStart} />
                                <DataRow label="GPS End" value={project.gpsEnd} />
                            </div>
                        </div>

                        {/* B. NETWORK */}
                        <SectionHeader title="B. Network & Connectivity" />
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <DataRow label="Connectivity Function" value={project.connectivityFunction} />
                            </div>
                            <DataRow label="Facility Accessed" value={project.facilityType} subtext={project.marketName} />
                            <DataRow label="Distance" value={`${project.distanceToFacility} km`} />
                            <div className="col-span-2">
                                <AttachmentBtn label="Location Map / GIS Screenshot" file={project.attachments?.locationMap} />
                            </div>
                        </div>

                        {/* C/D. BENEFICIARIES */}
                        <SectionHeader title="C/D. Beneficiaries & Tags" />
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <DataRow label="Direct Beneficiaries" value={project.directBeneficiaries} />
                                <DataRow label="Priority Tag" value={project.priorityTag} />
                            </div>
                            <DataRow label="Commodities" value={project.commodities?.join(', ')} />
                            <AttachmentBtn label="Beneficiary Registry / MAO Cert" file={project.attachments?.beneficiaryCert} />
                        </div>

                        {/* E/F. READINESS */}
                        <SectionHeader title="E/F. Readiness & Resilience" />
                        <div className="p-6 space-y-4">
                            {project.resilienceFunction && (
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded">
                                    <div className="text-xs font-bold text-blue-800">Disaster Resilience Function</div>
                                    <div className="text-[10px] text-blue-600 mb-2">Road serves disaster response/evacuation</div>
                                    <AttachmentBtn label="LGU DRRM Cert" file={project.attachments?.resilienceCert} />
                                </div>
                            )}
                            <div className="grid grid-cols-3 gap-4">
                                <DataRow label="ROW Status" value={project.rowStatus} />
                                <DataRow label="Surface" value={project.surfaceType} />
                                <DataRow label="Length" value={`${project.roadLength} km`} />
                            </div>
                            <div className="p-4 bg-green-50 border border-green-100 rounded flex items-center justify-between">
                                <div>
                                    <label className="block text-[10px] font-bold text-green-700 uppercase">Indicative Cost</label>

                                    {/* --- MONEY FORMAT FIX --- */}
                                    <div className="text-lg font-bold text-green-900">
                                        {formatMoney(project.indicativeCost)}
                                    </div>

                                </div>
                                <div className="w-1/3">
                                    <AttachmentBtn label="Cost Template" file={project.attachments?.costTemplate} />
                                </div>
                            </div>
                        </div>

                        {/* G. FINAL DOCS */}
                        <SectionHeader title="G. Documents" />
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <AttachmentBtn label="LGU Endorsement" file={project.attachments?.lguEndorsement} />
                            <div className="p-2 border border-gray-200 rounded bg-gray-50 text-xs">
                                <span className="font-bold text-gray-700">Digital Signature:</span><br />
                                <span className="font-mono text-gray-600">{project.digitalSignature || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= RIGHT PANEL: CHECKLIST & DECISION ================= */}
                <div className="w-96 bg-gray-50 flex flex-col shrink-0 border-l border-gray-200 shadow-xl z-20">
                    <div className="p-5 border-b border-gray-200 bg-white">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Validation Workspace</h3>
                    </div>

                    <div className="flex-1 p-5 overflow-y-auto space-y-6">

                        {/* 1. THE CHECKLIST (Top Priority) */}
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

                        {/* 2. REMARKS (General) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Validator Remarks / Notes
                            </label>
                            <textarea
                                className="w-full h-24 p-3 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                placeholder="Enter comments or missing details..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>

                        {/* 3. MASTERPLAN CHECK (Placement: After Remarks) */}
                        <div className={`p-4 rounded-xl border transition-colors ${masterplanVerified ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                            <label className="flex items-start gap-3 cursor-pointer mb-2">
                                <div className={`mt-0.5 p-1 rounded text-white ${masterplanVerified ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                    <IconMap />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-gray-900">Masterplan Verified</span>
                                        <input
                                            type="checkbox"
                                            checked={masterplanVerified}
                                            onChange={() => setMasterplanVerified(!masterplanVerified)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Confirm road aligns with network plan.</p>
                                </div>
                            </label>

                            {/* Conditional Notes Input */}
                            {masterplanVerified && (
                                <textarea
                                    className="w-full text-xs p-2 border border-blue-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 mt-2 animate-fadeIn"
                                    placeholder="Enter network plan reference or notes..."
                                    rows="2"
                                    value={masterplanNotes}
                                    onChange={(e) => setMasterplanNotes(e.target.value)}
                                />
                            )}
                        </div>

                        {/* 4. DECISION BUTTONS */}
                        <div className="space-y-3 pt-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Decision</label>

                            {/* CLEAR */}
                            <button
                                onClick={() => setDecision('clear')}
                                disabled={!isReadyToClear}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all relative overflow-hidden
                                ${decision === 'clear'
                                        ? 'bg-green-50 border-green-500 text-green-800 ring-1 ring-green-500'
                                        : isReadyToClear
                                            ? 'bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:shadow-md'
                                            : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-full ${decision === 'clear' ? 'bg-green-200' : 'bg-gray-100'}`}><IconCheck /></div>
                                <div>
                                    <div className="text-sm font-bold">Clear / Eligible</div>
                                    <div className="text-[10px] opacity-80">Pass to Step 2 Scoring</div>
                                </div>
                            </button>

                            {/* RETURN */}
                            <button
                                onClick={() => setDecision('return')}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                                ${decision === 'return' ? 'bg-orange-50 border-orange-500 text-orange-800 ring-1 ring-orange-500' : 'bg-white border-gray-200 text-gray-700 hover:border-orange-400 hover:shadow-md'}`}
                            >
                                <div className={`p-1.5 rounded-full ${decision === 'return' ? 'bg-orange-200' : 'bg-gray-100'}`}><IconReturn /></div>
                                <div>
                                    <div className="text-sm font-bold">Return for Correction</div>
                                    <div className="text-[10px] opacity-80">Send back to RO</div>
                                </div>
                            </button>

                            {/* HOLD */}
                            <button
                                onClick={() => setDecision('hold')}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                                ${decision === 'hold' ? 'bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500' : 'bg-white border-gray-200 text-gray-700 hover:border-red-400 hover:shadow-md'}`}
                            >
                                <div className={`p-1.5 rounded-full ${decision === 'hold' ? 'bg-red-200' : 'bg-gray-100'}`}><IconX /></div>
                                <div>
                                    <div className="text-sm font-bold">Ineligible / Hold</div>
                                    <div className="text-[10px] opacity-80">Stop processing</div>
                                </div>
                            </button>
                        </div>

                        {/* PRIORITY (Shows only if Cleared) */}
                        {decision === 'clear' && (
                            <div className="animate-fadeIn p-3 bg-green-50 rounded-lg border border-green-100">
                                <label className="block text-xs font-bold text-green-800 uppercase mb-2">Assign Initial Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full p-2 text-sm border border-green-300 rounded focus:ring-2 focus:ring-green-500 bg-white"
                                >
                                    <option value="High">High Priority</option>
                                    <option value="Medium">Medium Priority</option>
                                    <option value="Low">Low Priority</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!decision || isSubmitting}
                                className="flex-1 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-bold hover:bg-blue-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? 'Saving...' : 'Confirm Decision'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}