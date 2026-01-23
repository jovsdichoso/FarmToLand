import { useState } from 'react';

// --- ICONS ---
const IconCheck = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconDoc = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export default function ViewProjectModal({ isOpen, onClose, project }) {
    if (!isOpen || !project) return null;

    // --- PROGRESS LOGIC ---
    const getProgressStep = (status) => {
        switch (status) {
            case 'PENDING_REVIEW': return 1;
            case 'SCORED': return 2;
            case 'step3_pending':
            case 'step4_bidding': return 3;
            case 'IMPLEMENTATION': return 4;
            case 'COMPLETED': return 5;
            default: return 0;
        }
    };

    const currentStep = getProgressStep(project.status);
    const steps = [
        { label: 'Draft', index: 0 },
        { label: 'Review', index: 1 },
        { label: 'Scoring', index: 2 },
        { label: 'Bidding', index: 3 },
        { label: 'Implementation', index: 4 }
    ];

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount || 0);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            {/* MATCHING LAYOUT: Split Screen like Step2ScoringModal */}
            <div className="bg-white w-full h-full max-w-[1400px] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

                {/* === LEFT PANEL: STATIC DATA === */}
                <div className="w-full md:w-4/12 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
                    {/* Header */}
                    <div className="px-6 py-5 bg-white border-b border-gray-200">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 mb-2">
                            PROJECT OVERVIEW
                        </span>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{project.name}</h2>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 font-mono">
                            <span>{project.id}</span>
                            <span>•</span>
                            <span>{project.date}</span>
                        </div>
                    </div>

                    {/* Scrollable Data */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Location</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <DataField label="Region" value={project.regionName} />
                                <DataField label="Province" value={project.provinceName} />
                                <DataField label="Specific Location" value={project.location} />
                            </div>
                        </section>

                        <div className="border-t border-gray-200 my-2"></div>

                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Technical Specs</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DataField label="Length" value={`${project.roadLength} km`} />
                                <DataField label="Width" value={`${project.roadWidth} m`} />
                                <DataField label="Surface" value={project.surfaceType} />
                                <DataField label="ROW Status" value={project.rowStatus} />
                            </div>
                        </section>

                        <div className="border-t border-gray-200 my-2"></div>

                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Documents</h3>
                            <div className="space-y-2">
                                {project.attachments && Object.entries(project.attachments).map(([key, name]) => (
                                    <div key={key} className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 border rounded">
                                        <IconDoc />
                                        <div className="flex flex-col truncate">
                                            <span className="text-[10px] uppercase font-bold text-gray-400">{key}</span>
                                            <span className="truncate w-40">{name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {/* === RIGHT PANEL: STATUS & PROGRESS === */}
                <div className="w-full md:w-8/12 bg-white flex flex-col h-full">

                    {/* Header: Progress Bar */}
                    <div className="px-8 py-6 border-b border-gray-200 bg-white">
                        <h3 className="text-sm font-bold text-gray-900 mb-6">Current Progress</h3>
                        <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                            {/* Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2"></div>
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 -translate-y-1/2 transition-all duration-1000"
                                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            ></div>

                            {/* Steps */}
                            {steps.map((step) => {
                                const isCompleted = currentStep >= step.index;
                                const isCurrent = currentStep === step.index;
                                return (
                                    <div key={step.index} className="flex flex-col items-center gap-2 bg-white px-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                                            ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-300'}
                                            ${isCurrent ? 'ring-4 ring-green-100' : ''}
                                        `}>
                                            {isCompleted ? <IconCheck /> : <span className="text-xs font-bold">{step.index + 1}</span>}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${isCompleted ? 'text-green-600' : 'text-gray-300'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content: Status Details */}
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">

                        {/* 1. FINANCIAL SUMMARY */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <label className="text-xs font-bold text-gray-400 uppercase">Indicative Cost</label>
                                <div className="text-2xl font-bold text-gray-900 font-mono mt-1">
                                    {formatMoney(project.cost)}
                                </div>
                            </div>
                            <div className={`p-5 rounded-xl border shadow-sm ${project.validated_abc ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-100 border-gray-200'}`}>
                                <label className="text-xs font-bold text-gray-500 uppercase">Approved Budget (ABC)</label>
                                <div className={`text-2xl font-bold font-mono mt-1 ${project.validated_abc ? 'text-indigo-700' : 'text-gray-400'}`}>
                                    {project.validated_abc ? formatMoney(project.validated_abc) : '---'}
                                </div>
                            </div>
                        </div>

                        {/* 2. CONTRACT CARD (Only if Implementation) */}
                        {project.status === 'IMPLEMENTATION' && project.step4_data && (
                            <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden mb-6">
                                <div className="bg-green-50 px-4 py-2 border-b border-green-100 flex justify-between items-center">
                                    <span className="text-xs font-bold text-green-800 uppercase flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Contract Awarded
                                    </span>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Contractor</label>
                                            <div className="text-lg font-bold text-gray-900">{project.step4_data.contractor}</div>
                                        </div>
                                        <div className="text-right">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Bid Amount</label>
                                            <div className="text-lg font-bold text-green-700 font-mono">
                                                {formatMoney(project.step4_data.bid_amount)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                                        <IconDoc />
                                        Notice of Award: <span className="font-mono text-gray-700">{project.step4_data.notice_file}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. SCORING SUMMARY (If available) */}
                        {project.score_data && (
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Evaluation Results</h4>
                                <div className="flex items-center gap-4">
                                    <div className={`text-3xl font-bold ${project.score_data.passing ? 'text-green-600' : 'text-red-600'}`}>
                                        {project.score_data.totalScore}
                                        <span className="text-sm text-gray-400 font-normal">/100</span>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-500">Status</span>
                                        <span className={`text-sm font-bold uppercase ${project.score_data.passing ? 'text-green-600' : 'text-red-600'}`}>
                                            {project.score_data.passing ? 'Passed' : 'Failed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                        <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 shadow-sm">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper
const DataField = ({ label, value }) => (
    <div className="mb-2">
        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">{label}</label>
        <div className="text-sm font-medium text-gray-800 break-words">{value || '---'}</div>
    </div>
);