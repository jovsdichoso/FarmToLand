import { useState, useEffect } from 'react';

// --- ICONS ---
const IconInfo = () => <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- SCORING CRITERIA DATA ---
const SCORING_CRITERIA = {
    A: {
        title: "Category A: Geographic & Equity Priority (25 pts)",
        items: [
            { id: 'A1', label: 'GIDA Status', max: 10, options: [{ val: 0, label: 'Not GIDA' }, { val: 5, label: 'Partially GIDA' }, { val: 10, label: 'Entirely GIDA' }] },
            { id: 'A2', label: 'Poverty Incidence', max: 15, options: [{ val: 0, label: 'Below National Avg' }, { val: 5, label: 'At/Above National Avg' }, { val: 10, label: 'Top 25% Poorest' }, { val: 15, label: 'Top 10% Poorest' }] }
        ]
    },
    B: {
        title: "Category B: Beneficiaries & Impact (25 pts)",
        items: [
            { id: 'B1', label: 'Direct Beneficiaries', max: 15, options: [{ val: 0, label: '< 100' }, { val: 5, label: '100 - 499' }, { val: 10, label: '500 - 1,499' }, { val: 15, label: '≥ 1,500' }] },
            { id: 'B2', label: 'Commodity Importance', max: 10, options: [{ val: 0, label: 'No Priority' }, { val: 5, label: 'Regional Priority' }, { val: 10, label: 'National Priority' }] }
        ]
    },
    C: {
        title: "Category C: Connectivity & Network (20 pts)",
        items: [
            { id: 'C1', label: 'Connectivity Function', max: 10, options: [{ val: 0, label: 'Dead-end / Local access only' }, { val: 5, label: 'Connects to Brgy Road' }, { val: 10, label: 'Connects to Muni/Prov/Natl Road' }] },
            { id: 'C2', label: 'Market Access', max: 10, options: [{ val: 0, label: 'No access < 10km' }, { val: 5, label: 'Local Market / Basic Facility' }, { val: 10, label: 'Major Trading Post / Port / Hub' }] }
        ]
    },
    D: {
        title: "Category D: Disaster Risk & Resilience (15 pts)",
        items: [
            { id: 'D1', label: 'Disaster Vulnerability', max: 10, options: [{ val: 0, label: 'Low Risk' }, { val: 5, label: 'Moderate Risk' }, { val: 10, label: 'High Risk' }] },
            { id: 'D2', label: 'Resilience Function', max: 5, options: [{ val: 0, label: 'None' }, { val: 5, label: 'Serves as Evacuation/Access' }] }
        ]
    },
    E: {
        title: "Category E: Project Readiness (15 pts)",
        items: [
            { id: 'E1', label: 'ROW Status', max: 5, options: [{ val: 0, label: 'Unresolved / Not Cleared' }, { val: 5, label: 'Cleared / Not Required' }] },
            { id: 'E2', label: 'Cost & Scope Clarity', max: 5, options: [{ val: 0, label: 'Missing / Inconsistent' }, { val: 5, label: 'Provided & Consistent' }] },
            { id: 'E3', label: 'LGU Commitment', max: 5, options: [{ val: 0, label: 'None' }, { val: 5, label: 'Endorsement + Support' }] }
        ]
    }
};

// --- LOGIC: PASSING SCORE THRESHOLD ---
const PASSING_SCORE = 60;

export default function Step2ScoringModal({ isOpen, onClose, project, onSubmitScore }) {
    if (!isOpen || !project) return null;

    // --- STATE ---
    const isLocked = project.status === 'SCORED' || project.status === 'step3_pending' || project.status === 'REJECTED';

    const [scores, setScores] = useState({});
    const [remarks, setRemarks] = useState({});
    const [totalScore, setTotalScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Calculate total whenever scores change
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
        const allCriteriaIds = Object.values(SCORING_CRITERIA).flatMap(c => c.items.map(i => i.id));
        const missingScores = allCriteriaIds.filter(id => scores[id] === undefined);

        if (missingScores.length > 0) {
            alert(`Please score all items. Missing: ${missingScores.join(', ')}`);
            return;
        }

        setIsSubmitting(true);

        // --- NEW: LOGIC TO SET GAA STATUS BASED ON SCORE ---
        // If score >= 60, we tag it as GAA_INCLUDED. Otherwise, it's REJECTED or ON_HOLD.
        const isPassing = totalScore >= PASSING_SCORE;
        const finalStatus = isPassing ? 'SCORED' : 'REJECTED';
        const gaaTag = isPassing ? 'GAA_INCLUDED' : 'GAA_EXCLUDED';

        const resultPayload = {
            ...project,                // <--- CRITICAL FIX: Keep all original data!
            status: finalStatus,       // Update workflow status
            gaa_status: gaaTag,        // Explicitly set GAA status for Step 3
            score_data: {
                scores,
                remarks,
                totalScore,
                passing: isPassing
            },
            last_updated: new Date().toISOString()
        };

        setTimeout(() => {
            onSubmitScore(resultPayload);
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    // --- HELPER COMPONENT ---
    const DataField = ({ label, value, highlight }) => (
        <div className="mb-3">
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">{label}</label>
            <div className={`text-sm ${highlight ? 'font-bold text-blue-900' : 'text-gray-800'}`}>
                {value || '---'}
            </div>
        </div>
    );

    // --- STATUS PREVIEW HELPER ---
    const getStatusPreview = () => {
        if (totalScore >= PASSING_SCORE) {
            return (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded border border-green-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm font-bold">Recommended for GAA Inclusion</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-1 rounded border border-red-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm font-bold">Below Passing Threshold (Not Fundable)</span>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white w-full h-full max-w-[1600px] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

                {/* LOCKED/SCORED BANNER OVERLAY */}
                {isLocked && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-100 border border-green-300 text-green-800 px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span className="font-bold text-sm">Project Already Scored</span>
                    </div>
                )}

                {/* === LEFT PANEL: STEP 1 VIEWER === */}
                <div className="w-full md:w-5/12 lg:w-4/12 bg-gray-50/50 border-r border-gray-200 flex flex-col h-full">
                    <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase rounded border border-yellow-200">Step 1 Viewer</span>
                            <span className="text-xs font-mono text-gray-400">{project.id}</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{project.name}</h2>
                        <div className="text-xs text-gray-500 mt-1">{project.location}</div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <section>
                            <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-200 pb-1 mb-3">A. Identification</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DataField label="Region" value={project.regionName} />
                                <DataField label="Province" value={project.provinceName} />
                            </div>
                        </section>
                        <section>
                            <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-200 pb-1 mb-3">B. Connectivity</h3>
                            <DataField label="Function" value={project.connectivityFunction} highlight />
                        </section>
                        <section>
                            <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-200 pb-1 mb-3">C. Geo & Equity</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-2 bg-blue-50 border border-blue-100 rounded"><DataField label="GIDA" value={project.gidaClassification} highlight /></div>
                                <div className="p-2 bg-blue-50 border border-blue-100 rounded"><DataField label="Poverty" value={project.povertyIncidence} highlight /></div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* === RIGHT PANEL: SCORING === */}
                <div className="w-full md:w-7/12 lg:w-8/12 bg-white flex flex-col h-full">
                    <div className="px-8 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Step 2A: Scoring</h2>
                            <p className="text-xs text-gray-500">
                                {isLocked ? 'View existing scores.' : 'Manual scoring based on guidelines.'}
                            </p>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Total Score</div>
                            <div className={`text-3xl font-bold ${totalScore >= PASSING_SCORE ? 'text-green-600' : 'text-gray-400'}`}>
                                {totalScore}<span className="text-sm text-gray-400 font-normal">/100</span>
                            </div>
                        </div>
                    </div>

                    <div className={`flex-1 overflow-y-auto p-8 space-y-8 ${isLocked ? 'opacity-90 grayscale-[30%]' : ''}`}>
                        {Object.entries(SCORING_CRITERIA).map(([key, category]) => (
                            <div key={key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="font-bold text-sm text-gray-800">{category.title}</h3>
                                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                                        Subtotal: {category.items.reduce((acc, item) => acc + (scores[item.id] || 0), 0)} pts
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {category.items.map((item) => (
                                        <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="sm:w-1/3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-mono font-bold text-gray-400">{item.id}</span>
                                                        <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                                        <div className="group relative">
                                                            <IconInfo />
                                                            <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-48 bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-10">Max: {item.max}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="sm:w-2/3 space-y-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.options.map((opt) => (
                                                            <button
                                                                key={opt.val}
                                                                onClick={() => handleScoreChange(item.id, opt.val)}
                                                                disabled={isLocked}
                                                                className={`px-3 py-1.5 rounded text-xs font-medium border transition-all 
                                                                    ${scores[item.id] === opt.val
                                                                        ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200'
                                                                        : isLocked
                                                                            ? 'bg-gray-100 text-gray-400 border-gray-200'
                                                                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                                                                    }`}
                                                            >
                                                                <span className="font-bold mr-1">{opt.val} pts</span> - {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <textarea
                                                        disabled={isLocked}
                                                        placeholder={isLocked ? "No remarks." : `Justification for ${item.label}...`}
                                                        value={remarks[item.id] || ''}
                                                        onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                                                        className="w-full text-xs p-2 border border-gray-200 rounded h-16 bg-gray-50 focus:bg-white resize-none focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
                        {/* LEFT: STATUS PREVIEW */}
                        {!isLocked && getStatusPreview()}
                        {isLocked && <div></div>} {/* Spacer */}

                        {/* RIGHT: ACTION BUTTONS */}
                        <div className="flex gap-2">
                            <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-white">
                                {isLocked ? 'Close' : 'Cancel'}
                            </button>
                            {!isLocked && (
                                <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-2 bg-blue-700 text-white rounded text-sm font-bold hover:bg-blue-800 shadow-lg disabled:opacity-50">
                                    {isSubmitting ? 'Submitting...' : 'Submit Final Score'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}