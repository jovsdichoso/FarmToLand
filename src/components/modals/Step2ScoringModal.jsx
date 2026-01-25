import { useState, useEffect } from 'react';

// --- ICONS ---
const IconDoc = () => <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconData = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>;

// --- SCORING CRITERIA DATA ---
const SCORING_CRITERIA = {
    A: {
        title: "A. Geographic & Equity (25 pts)",
        items: [
            { id: 'A1', label: 'GIDA Status', max: 10, options: [{ val: 0, label: 'Not GIDA' }, { val: 5, label: 'Partially GIDA' }, { val: 10, label: 'Entirely GIDA' }] },
            { id: 'A2', label: 'Poverty Incidence', max: 15, options: [{ val: 0, label: 'Below Avg' }, { val: 5, label: 'At Avg' }, { val: 10, label: 'Top 25%' }, { val: 15, label: 'Top 10%' }] }
        ]
    },
    B: {
        title: "B. Beneficiaries & Impact (25 pts)",
        items: [
            { id: 'B1', label: 'Direct Beneficiaries', max: 15, options: [{ val: 0, label: '< 100' }, { val: 5, label: '100-499' }, { val: 10, label: '500-1499' }, { val: 15, label: '≥ 1500' }] },

            // FIX: Updated Labels for Commodity Priority
            {
                id: 'B2', label: 'Commodity Priority', max: 10, options: [
                    { val: 0, label: 'Non-Priority' },
                    { val: 5, label: 'Regional Priority' },
                    { val: 10, label: 'National Priority' }
                ]
            }
        ]
    },
    C: {
        title: "C. Connectivity (20 pts)",
        items: [
            // FIX: Updated Labels & Hierarchy for Connectivity Function
            {
                id: 'C1', label: 'Connectivity Function', max: 10, options: [
                    { val: 0, label: 'Internal / None' },
                    { val: 3, label: 'To Barangay Road' },
                    { val: 7, label: 'To Mun/Prov Road' },
                    { val: 10, label: 'To National Road' }
                ]
            },
            { id: 'C2', label: 'Market Access', max: 10, options: [{ val: 0, label: 'None <10km' }, { val: 5, label: 'Local Market' }, { val: 10, label: 'Major Hub' }] }
        ]
    },
    D: {
        title: "D. Disaster Risk & Resilience (15 pts)",
        items: [
            { id: 'D1', label: 'Disaster Vulnerability', max: 10, options: [{ val: 0, label: 'Low' }, { val: 5, label: 'Moderate' }, { val: 10, label: 'High' }] },
            { id: 'D2', label: 'Resilience Function', max: 5, options: [{ val: 0, label: 'None' }, { val: 5, label: 'Evac Route' }] }
        ]
    },
    E: {
        title: "E. Project Readiness (15 pts)",
        items: [
            { id: 'E1', label: 'ROW Status', max: 5, options: [{ val: 0, label: 'Not Cleared' }, { val: 5, label: 'Cleared' }] },
            { id: 'E2', label: 'Cost/Scope Clarity', max: 5, options: [{ val: 0, label: 'Inconsistent' }, { val: 5, label: 'Consistent' }] },
            { id: 'E3', label: 'LGU Commitment', max: 5, options: [{ val: 0, label: 'None' }, { val: 5, label: 'Endorsed' }] }
        ]
    }
};

const PASSING_SCORE = 60;

export default function Step2ScoringModal({ isOpen, onClose, project, onSubmitScore }) {
    if (!isOpen || !project) return null;

    // --- STATE ---
    // Locked if score exists or status implies later stage
    const isLocked = project.score_data?.totalScore !== undefined || ['SCORED', 'NEP-INCLUDED'].includes(project.status);

    const [leftMode, setLeftMode] = useState('data');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [scores, setScores] = useState(project.score_data?.scores || {});
    const [remarks, setRemarks] = useState(project.score_data?.remarks || {});
    const [totalScore, setTotalScore] = useState(project.score_data?.totalScore || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const total = Object.values(scores).reduce((acc, curr) => acc + (curr || 0), 0);
        setTotalScore(total);
    }, [scores]);

    const handleScoreChange = (criteriaId, val) => {
        if (isLocked) return;
        setScores(prev => ({ ...prev, [criteriaId]: parseInt(val) }));
    };

    const handleRemarkChange = (criteriaId, text) => {
        if (isLocked) return;
        setRemarks(prev => ({ ...prev, [criteriaId]: text }));
    };

    const handleSubmit = () => {
        if (isLocked) return;

        // Check for missing scores
        const allCriteriaIds = Object.values(SCORING_CRITERIA).flatMap(c => c.items.map(i => i.id));
        const missingScores = allCriteriaIds.filter(id => scores[id] === undefined);

        if (missingScores.length > 0) {
            alert(`Please score all items. Missing: ${missingScores.join(', ')}`);
            return;
        }

        setIsSubmitting(true);

        const resultPayload = {
            ...project,
            status: 'SCORED', // Status becomes SCORED so it shows up for Tagging in the table
            score_data: {
                scores,
                remarks,
                totalScore,
                passing: totalScore >= PASSING_SCORE
            },
            last_updated: new Date().toISOString()
        };

        setTimeout(() => {
            onSubmitScore(resultPayload);
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 backdrop-blur-md">
            <div className="bg-white rounded-2xl w-full max-w-[98vw] h-[95vh] flex overflow-hidden shadow-2xl border border-gray-300">

                {/* ==========================================
                    LEFT PANEL: COMPLETE PROJECT DATA
                ========================================== */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center px-6 shrink-0">
                        <div className="flex bg-gray-200 p-1 rounded-xl gap-1">
                            <button onClick={() => setLeftMode('data')} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${leftMode === 'data' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <IconData /> Project Data
                            </button>
                            <button onClick={() => { setLeftMode('pdf'); if (!selectedDoc && project.attachments) setSelectedDoc(Object.values(project.attachments)[0]); }} className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${leftMode === 'pdf' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                <IconDoc /> PDF Preview
                            </button>
                        </div>
                        <div className="text-right">
                            <h2 className="text-sm font-black text-gray-900 truncate max-w-[300px] uppercase">{project.name}</h2>
                            <p className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-widest">{project.id}</p>
                        </div>
                    </div>

                    {/* Content View */}
                    <div className="flex-1 overflow-hidden relative bg-gray-100">
                        {leftMode === 'data' && (
                            <div className="absolute inset-0 overflow-y-auto p-8 space-y-8 pb-20">

                                {/* --- NEW HEADER BLOCK (Fixes the missing Reviewer issue) --- */}
                                <PDFHeaderBlock project={project} />

                                {/* Section 1: Identification */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> A. Project Identification
                                    </h3>
                                    <div className="grid grid-cols-3 gap-6">
                                        <InfoBox label="Region" value={project.regionName} />
                                        <InfoBox label="Province" value={project.provinceName} />
                                        <InfoBox label="Date Submitted" value={project.date} />
                                        <div className="col-span-3 border-t border-gray-50 pt-4">
                                            <InfoBox label="Full Location Path" value={project.location} />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Technical */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> B. Technical Specs & Cost
                                    </h3>
                                    <div className="grid grid-cols-4 gap-6">
                                        <InfoBox label="Road Length" value={`${project.roadLength} km`} highlight />
                                        <InfoBox label="Road Width" value={`${project.roadWidth} m`} />
                                        <InfoBox label="Surface Type" value={project.surfaceType} />
                                        <InfoBox label="ROW Status" value={project.rowStatus} highlight />
                                        <div className="col-span-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <InfoBox label="Estimated Cost (PHP)" value={new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.cost)} highlight />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Impact */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> C. Beneficiaries & Impact
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <InfoBox label="Direct Beneficiaries" value={project.directBeneficiaries} highlight />
                                        <InfoBox label="Poverty Incidence" value={project.povertyIncidence} />
                                        <InfoBox label="GIDA Classification" value={project.gidaClassification} />
                                        <InfoBox label="Priority Commodities" value={project.commodities?.join(', ')} />
                                    </div>
                                </div>

                                {/* Section 4: Connectivity & Resilience */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div> D. Connectivity & Resilience
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Matches 'connectivityFunction' in JSON */}
                                        <InfoBox label="Connectivity Function" value={project.connectivityFunction} />

                                        {/* FIXED: mapped 'disasterRisk' -> 'disasterExposure' */}
                                        <InfoBox label="Disaster Vulnerability" value={project.disasterExposure} />

                                        {/* FIXED: constructed Market Access from 'facilityType' + 'distance' */}
                                        <InfoBox
                                            label="Market Access"
                                            value={project.facilityType ? `${project.facilityType} (${project.distanceToFacility || '?'} m)` : '---'}
                                        />

                                        {/* NOTE: 'networkRole' is missing in your JSON. Checking 'resilienceFunction' instead or leaving blank */}
                                        <InfoBox
                                            label="Resilience/Network"
                                            value={project.networkRole || (project.resilienceFunction ? "Resilience Function Active" : "---")}
                                        />
                                    </div>
                                </div>

                            </div>
                        )}
                        {leftMode === 'pdf' && (
                            <div className="absolute inset-0 flex animate-fadeIn">
                                <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-tighter">Documents</p>
                                    {project.attachments && Object.values(project.attachments).map((file, i) => (
                                        <button key={i} onClick={() => setSelectedDoc(file)} className={`w-full p-3 rounded-xl text-left border text-xs font-bold truncate hover:bg-blue-50 transition-all ${selectedDoc?.url === file.url ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white text-gray-600'}`}>
                                            {file.name}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex-1 bg-gray-300 relative">
                                    {/* Only render iframe if we have a URL and it's NOT a hashtag */}
                                    {selectedDoc && selectedDoc.url && selectedDoc.url !== '#' ? (
                                        <iframe
                                            src={`${selectedDoc.url}#toolbar=0&view=FitH`}
                                            className="w-full h-full border-none"
                                            title="PDF Preview"
                                        />
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                            <IconDoc />
                                            <p className="mt-2 text-sm font-bold">No Preview Available</p>
                                            <p className="text-xs">The file URL is missing or invalid.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ==========================================
                    RIGHT PANEL: SCORING (No Tagging Here)
                ========================================== */}
                <div className="w-[480px] bg-gray-50 flex flex-col shrink-0 shadow-2xl z-10 border-l border-gray-200">
                    <div className="p-6 border-b bg-white flex justify-between items-center shadow-sm z-20">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase">Evaluation Panel</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Step 2: Scoring</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Total</div>
                            <div className={`text-3xl font-black ${totalScore >= PASSING_SCORE ? 'text-green-600' : 'text-gray-400'}`}>{totalScore}</div>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin pb-40">
                        {Object.entries(SCORING_CRITERIA).map(([key, category]) => (
                            <div key={key} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                                <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">{category.title}</h4>
                                <div className="space-y-4">
                                    {category.items.map((item) => (
                                        <div key={item.id} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <label className="text-xs font-bold text-gray-700">{item.label}</label>
                                                <span className="text-[10px] text-gray-400 font-mono">{scores[item.id] !== undefined ? `${scores[item.id]} pts` : '-'}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {item.options.map((opt) => (
                                                    <button
                                                        key={opt.val}
                                                        onClick={() => handleScoreChange(item.id, opt.val)}
                                                        disabled={isLocked}
                                                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold border transition-all truncate
                                                            ${scores[item.id] === opt.val
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                                            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {opt.label} ({opt.val})
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={remarks[item.id] || ''}
                                                onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                                                disabled={isLocked}
                                                placeholder="Remarks (optional)..."
                                                className="w-full text-[10px] p-2 bg-gray-50 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none h-10 resize-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-30">
                        {!isLocked ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-2xl bg-blue-700 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-blue-800 transition-all active:scale-95"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Score'}
                            </button>
                        ) : (
                            <button disabled className="w-full py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-widest cursor-not-allowed">
                                Score Locked
                            </button>
                        )}
                        <button onClick={onClose} className="w-full mt-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                            Cancel
                        </button>
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