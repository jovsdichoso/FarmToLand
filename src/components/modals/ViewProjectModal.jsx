import { useState } from 'react';
import StatusBadge from '../StatusBadge'; // Make sure to import this!

// --- ICONS ---
const IconCheck = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconDoc = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export default function ViewProjectModal({ isOpen, onClose, project }) {
    if (!isOpen || !project) return null;

    // --- PROGRESS LOGIC (FIXED) ---
    const getProgressStep = (status) => {
        if (!status) return 1;

        // Step 4: Procurement
        if (status === 'step4_bidding' || status.startsWith('STEP4_') || status === 'AWARDED') return 4;

        // Step 3: Detailed Engineering
        // GAA-INCLUDED means funding is secured, so they are NOW working on Step 3
        if (['GAA-INCLUDED', 'step3_pending', 'step3_escalated', 'step3_validated'].includes(status)) return 3;

        // Step 2: Scoring & Funding
        if (['SCORED', 'NEP-INCLUDED'].includes(status)) return 2;

        // Step 1: Proposal
        return 1;
    };

    const currentStep = getProgressStep(project.status);

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">

                {/* Header with Progress Bar */}
                <div className="bg-white border-b border-gray-100 p-6 pb-0">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{project.name}</h2>
                            <p className="text-xs font-bold text-gray-400 font-mono mt-1">{project.id}</p>
                        </div>
                        {/* Use the shared StatusBadge for consistency */}
                        <StatusBadge status={project.status} />
                    </div>

                    {/* Progress Stepper */}
                    <div className="flex items-center justify-between relative pb-6 px-2">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -mt-3"></div>

                        {[
                            { id: 1, label: 'Proposal' },
                            { id: 2, label: 'Scoring' },
                            { id: 3, label: 'Engineering' }, // GAA-INCLUDED lands here
                            { id: 4, label: 'Procurement' }
                        ].map((step) => {
                            const isCompleted = currentStep > step.id;
                            const isCurrent = currentStep === step.id;

                            return (
                                <div key={step.id} className="flex flex-col items-center bg-white px-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all mb-2
                                        ${isCompleted ? 'bg-green-600 border-green-600 text-white' :
                                            isCurrent ? 'bg-white border-blue-600 text-blue-600 shadow-md scale-110' :
                                                'bg-white border-gray-200 text-gray-300'}`}>
                                        {isCompleted ? <IconCheck /> : step.id}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${isCurrent ? 'text-blue-700' : 'text-gray-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 space-y-8">
                    {/* Section 1: Basic Info */}
                    <section>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Project Identification
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                            <DataField label="Region" value={project.regionName} />
                            <DataField label="Province" value={project.provinceName} />
                            <DataField label="Location" value={project.location} />
                            <DataField label="Road Length" value={`${project.roadLength} km`} />
                            <DataField label="Road Width" value={`${project.roadWidth} m`} />
                            <DataField label="Surface Type" value={project.surfaceType} />
                        </div>
                    </section>

                    {/* Section 2: Financials */}
                    <section className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Financial Status
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Indicative Cost</label>
                                <div className="text-lg font-mono font-bold text-gray-900">
                                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.cost)}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Validation Status</label>
                                <div className="text-sm font-bold text-gray-700">
                                    {project.validated_abc
                                        ? `Validated: ${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.validated_abc)}`
                                        : 'Pending Engineering Validation'}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Evaluation Score (If available) */}
                    {project.score_data && project.score_data.totalScore !== undefined && (
                        <section className="border-t border-gray-100 pt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Evaluation Score</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col text-right">
                                        <span className="text-xs font-bold text-gray-500">Total Score</span>
                                        <span className={`text-2xl font-black ${project.score_data.passing ? 'text-green-600' : 'text-red-600'}`}>
                                            {project.score_data.totalScore}
                                        </span>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-500">Result</span>
                                        <span className={`text-sm font-bold uppercase ${project.score_data.passing ? 'text-green-600' : 'text-red-600'}`}>
                                            {project.score_data.passing ? 'Passed' : 'Failed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Section 4: Attachments Preview */}
                    {project.attachments && Object.keys(project.attachments).length > 0 && (
                        <section className="border-t border-gray-100 pt-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Attached Documents</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(project.attachments).map(([key, file]) => {
                                    const fileName = file?.name || file || 'Unknown File';
                                    return (
                                        <div key={key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><IconDoc /></div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{key.replace(/_/g, ' ')}</p>
                                                <p className="text-xs font-bold text-gray-800 truncate">{fileName}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 shadow-sm transition-all active:scale-95">
                        Close
                    </button>
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