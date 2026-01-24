import { useState } from 'react';

// --- ICONS ---
const IconDoc = () => <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconCheck = () => <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>;
const IconData = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>;

export default function ReviewProjectModal({ isOpen, onClose, project, onDecision }) {
    if (!isOpen || !project) return null;

    const [leftMode, setLeftMode] = useState('data'); // 'data' or 'pdf'
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [decision, setDecision] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isReadOnly = project.status !== 'PENDING_REVIEW';

    // Checklist State
    const [checklist, setChecklist] = useState({
        endorsementComplete: false, mapSketchClear: false, gpsAccurate: false, roadLengthReasonable: false,
        problemStatementClear: false, rightOfWayAssessed: false, environmentalChecked: false, photosProvided: false
    });
    const [masterplanVerified, setMasterplanVerified] = useState(false);

    const checklistCount = Object.values(checklist).filter(Boolean).length;
    const totalItems = Object.keys(checklist).length;
    const isReadyToClear = checklistCount === totalItems && masterplanVerified;

    const handleSubmit = () => {
        setIsSubmitting(true);
        const newStatus = decision === 'clear' ? 'FOR_SCORING' : 'RETURNED';
        const updatedProject = {
            ...project, status: newStatus, last_updated: new Date().toISOString(),
            validator_data: { notes: remarks, checklist, masterplanVerified }
        };
        setTimeout(() => { onDecision(updatedProject); setIsSubmitting(false); onClose(); }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 backdrop-blur-md">
            <div className="bg-white rounded-2xl w-full max-w-[98vw] h-[95vh] flex overflow-hidden shadow-2xl border border-gray-300">

                {/* ==========================================
                    LEFT PANEL: DATA REVIEW & PDF VIEWER
                ========================================== */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">

                    {/* Header: Controls for Left Side */}
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center px-6 shrink-0">
                        <div className="flex bg-gray-200 p-1 rounded-xl gap-1">
                            <button
                                onClick={() => setLeftMode('data')}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${leftMode === 'data' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <IconData /> Project Data
                            </button>
                            <button
                                onClick={() => {
                                    setLeftMode('pdf');
                                    if (!selectedDoc && project.attachments) setSelectedDoc(Object.values(project.attachments)[0]);
                                }}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${leftMode === 'pdf' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <IconDoc /> PDF Preview
                            </button>
                        </div>
                        <div className="text-right">
                            <h2 className="text-sm font-black text-gray-900 truncate max-w-[300px] uppercase">{project.name}</h2>
                            <p className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-widest">{project.id}</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative bg-gray-100">

                        {/* MODE 1: ALL PROJECT DATA (SCROLLABLE) */}
                        {leftMode === 'data' && (
                            <div className="absolute inset-0 overflow-y-auto p-8 animate-fadeIn space-y-8 pb-20">

                                {/* --- NEW HEADER BLOCK (Fixes the missing Reviewer issue) --- */}
                                <PDFHeaderBlock project={project} />

                                {/* Section A: Location */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> A. Project Identification & Location
                                    </h3>
                                    <div className="grid grid-cols-3 gap-6">
                                        <InfoBox label="Region" value={project.regionName} />
                                        <InfoBox label="Province" value={project.provinceName} />
                                        <InfoBox label="Submitted Date" value={project.date} />
                                        <div className="col-span-3 border-t border-gray-50 pt-4">
                                            <InfoBox label="Full Location Path" value={project.location} />
                                        </div>
                                        <InfoBox label="GPS Start" value={project.gpsStart} />
                                        <InfoBox label="GPS End" value={project.gpsEnd} />
                                    </div>
                                </div>

                                {/* Section B: Technical & Cost */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> B. Technical Specifications & Cost
                                    </h3>
                                    <div className="grid grid-cols-4 gap-6">
                                        <InfoBox label="Road Length" value={`${project.roadLength} km`} highlight />
                                        <InfoBox label="Road Width" value={`${project.roadWidth} m`} />
                                        <InfoBox label="Surface Type" value={project.surfaceType} />
                                        <InfoBox label="ROW Status" value={project.rowStatus} highlight />
                                        <div className="col-span-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <InfoBox label="Indicative Cost (PHP)" value={new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.cost)} highlight />
                                        </div>
                                    </div>
                                </div>

                                {/* Section C: Impact & Others */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> C. Impact & Connectivity
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <InfoBox label="Connectivity Function" value={project.connectivityFunction} />
                                        <InfoBox label="Direct Beneficiaries" value={project.directBeneficiaries} highlight />
                                        <InfoBox label="Priority Commodities" value={project.commodities?.join(', ')} />
                                        <InfoBox label="Priority Tag" value={project.priorityTag} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MODE 2: PDF PREVIEW */}
                        {leftMode === 'pdf' && (
                            <div className="absolute inset-0 flex animate-fadeIn">
                                <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-tighter">Documents to Review</p>
                                    {project.attachments && Object.entries(project.attachments).map(([key, file]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedDoc(file)}
                                            className={`w-full p-3 rounded-xl text-left transition-all border ${selectedDoc?.url === file.url ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-200'}`}
                                        >
                                            <div className="uppercase text-[9px] font-black opacity-60 mb-1">{key.replace(/([A-Z])/g, ' $1')}</div>
                                            <div className="text-xs font-bold truncate">{file.name}</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex-1 bg-gray-300 relative">
                                    {selectedDoc ? (
                                        <iframe
                                            src={`${selectedDoc.url}#toolbar=0&view=FitH`}
                                            className="w-full h-full border-none"
                                            title="Validator Preview"
                                        />
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

                {/* ==========================================
                    RIGHT PANEL: CHECKLIST & DECISION (FIXED)
                ========================================== */}
                <div className="w-[480px] bg-gray-50 flex flex-col shrink-0 shadow-2xl z-10 border-l border-gray-200">
                    <div className="p-6 border-b bg-white flex justify-between items-center">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase">Verification Panel</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Step 1 Validation</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black border ${checklistCount === totalItems ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-600'}`}>
                            Progress: {checklistCount}/{totalItems}
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-8 scrollbar-thin">
                        {/* Checklist Section */}
                        <div className="space-y-3">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Required Checks</p>
                            {Object.entries({
                                endorsementComplete: "Endorsement Complete",
                                mapSketchClear: "Map Sketch Clear",
                                gpsAccurate: "GPS Accurate",
                                roadLengthReasonable: "Road Length Reasonable",
                                problemStatementClear: "Problem Statement Clear",
                                rightOfWayAssessed: "Right of Way Assessed",
                                environmentalChecked: "Environmental Checked",
                                photosProvided: "Photos Provided"
                            }).map(([key, label]) => (
                                <label key={key} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${checklist[key] ? 'bg-white border-blue-600 shadow-lg' : 'bg-white border-transparent grayscale opacity-60 hover:opacity-100 hover:grayscale-0'}`}>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={checklist[key]}
                                            onChange={() => !isReadOnly && setChecklist(p => ({ ...p, [key]: !p[key] }))}
                                            className="peer sr-only"
                                        />
                                        <div className="w-6 h-6 rounded-lg border-2 border-gray-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                                        <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100"><IconCheck /></div>
                                    </div>
                                    <span className={`text-sm font-black tracking-tight ${checklist[key] ? 'text-blue-900' : 'text-gray-400'}`}>{label}</span>
                                </label>
                            ))}
                        </div>

                        {/* Masterplan Toggle */}
                        <div className={`p-5 rounded-2xl border-2 transition-all ${masterplanVerified ? 'bg-green-50 border-green-600 shadow-lg' : 'bg-white border-dashed border-gray-300'}`}>
                            <label className="flex items-center gap-4 cursor-pointer">
                                <input type="checkbox" checked={masterplanVerified} onChange={() => !isReadOnly && setMasterplanVerified(!masterplanVerified)} className="w-6 h-6 text-green-600 rounded-lg" />
                                <div>
                                    <div className="font-black text-gray-900 text-sm uppercase">Masterplan Verification</div>
                                    <p className="text-[10px] text-gray-500 font-medium">Aligns with official FMR Roadmap</p>
                                </div>
                            </label>
                        </div>

                        {/* Remarks */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Validator Remarks</label>
                            <textarea
                                className="w-full h-32 p-4 rounded-2xl border border-gray-200 bg-white text-sm font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                                placeholder="Type your findings or correction notes..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-white border-t space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setDecision('return')}
                                disabled={isReadOnly}
                                className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${decision === 'return' ? 'bg-orange-600 border-orange-600 text-white shadow-xl scale-105' : 'bg-white text-orange-600 border-orange-100 hover:bg-orange-50'}`}
                            >
                                Return
                            </button>
                            <button
                                onClick={() => setDecision('clear')}
                                disabled={isReadOnly}
                                className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${decision === 'clear' ? 'bg-green-600 border-green-600 text-white shadow-xl scale-105' : 'bg-white text-green-600 border-green-100 hover:bg-green-50'}`}
                            >
                                Pass
                            </button>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!decision || !isReadyToClear || isSubmitting || isReadOnly}
                            className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-800 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Decision'}
                        </button>
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

const InfoBox = ({ label, value, highlight }) => (
    <div className={`p-4 rounded-2xl border transition-all ${highlight ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</div>
        <div className={`text-sm font-bold ${highlight ? 'text-blue-800' : 'text-gray-800'} break-words leading-snug`}>{value || '---'}</div>
    </div>
);