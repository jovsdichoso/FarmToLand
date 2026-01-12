import { useState, useEffect } from 'react';

// --- ICONS ---
const IconInfo = () => <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconFile = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;

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

export default function Step2ScoringModal({ isOpen, onClose, project, onSubmitScore }) {
    const [scores, setScores] = useState({});
    const [remarks, setRemarks] = useState({});
    const [totalScore, setTotalScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const total = Object.values(scores).reduce((acc, curr) => acc + (curr || 0), 0);
        setTotalScore(total);
    }, [scores]);

    if (!isOpen || !project) return null;

    const handleScoreChange = (criteriaId, val) => {
        setScores(prev => ({ ...prev, [criteriaId]: parseInt(val) }));
    };

    const handleRemarkChange = (criteriaId, text) => {
        setRemarks(prev => ({ ...prev, [criteriaId]: text }));
    };

    const handleSubmit = () => {
        const allCriteriaIds = Object.values(SCORING_CRITERIA).flatMap(c => c.items.map(i => i.id));
        const missingScores = allCriteriaIds.filter(id => scores[id] === undefined);

        if (missingScores.length > 0) {
            alert(`Please score all items. Missing: ${missingScores.join(', ')}`);
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            onSubmitScore(project.id, { scores, remarks, totalScore });
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    // --- SUB-COMPONENTS ---
    const DataField = ({ label, value, highlight }) => (
        <div className="mb-3">
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">{label}</label>
            <div className={`text-sm ${highlight ? 'font-bold text-blue-900' : 'text-gray-800'}`}>
                {value || '---'}
            </div>
        </div>
    );

    const AttachmentView = ({ label }) => (
        <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-xs mb-2">
            <span className="text-gray-600 truncate max-w-[150px]">{label}</span>
            <button className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                <IconFile /> View
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            {/* MAIN CONTAINER */}
            <div className="bg-white w-full h-full max-w-[1600px] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

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
                            <AttachmentView label="Location Map / GIS" />
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
                            <p className="text-xs text-gray-500">Manual scoring based on guidelines.</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Total Score</div>
                            <div className={`text-3xl font-bold ${totalScore >= 60 ? 'text-green-600' : 'text-gray-400'}`}>
                                {totalScore}<span className="text-sm text-gray-400 font-normal">/100</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
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
                                                            <button key={opt.val} onClick={() => handleScoreChange(item.id, opt.val)}
                                                                className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${scores[item.id] === opt.val ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'}`}>
                                                                <span className="font-bold mr-1">{opt.val} pts</span> - {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <textarea placeholder={`Justification for ${item.label}...`} value={remarks[item.id] || ''} onChange={(e) => handleRemarkChange(item.id, e.target.value)} className="w-full text-xs p-2 border border-gray-200 rounded h-16 bg-gray-50 focus:bg-white resize-none focus:outline-none focus:border-blue-500" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                        <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-white">Cancel</button>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-2 bg-blue-700 text-white rounded text-sm font-bold hover:bg-blue-800 shadow-lg disabled:opacity-50">{isSubmitting ? 'Submitting...' : 'Submit Final Score'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}