import { useState, useEffect } from 'react';

// --- CONFIGURATION ---
const PRIORITY_COMMODITIES = ['Rice', 'Corn', 'High Value Crops', 'Livestock', 'Fisheries'];

export default function EditProposalModal({ isOpen, onClose, project, onSubmit }) {
    if (!isOpen || !project) return null;

    // --- STATE: PRE-FILL WITH EXISTING DATA ---
    const [formData, setFormData] = useState({ ...project });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync state when project changes
    useEffect(() => {
        if (project) {
            setFormData({ ...project });
        }
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // --- THE CRITICAL FIX: RESUBMISSION LOGIC ---
        const updatedProject = {
            ...formData,
            // RESET STATUS so Validator sees it again
            status: 'GAA_INCLUDED',
            // Clear the "Returned" flags
            step3_returned: false,
            step3_return_comments: null,
            last_updated: new Date().toISOString()
        };

        setTimeout(() => {
            onSubmit(updatedProject);
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                {/* HEADER */}
                <div className="bg-orange-50 px-6 py-4 border-b border-orange-200 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 text-orange-800 mb-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <h2 className="text-lg font-bold">Edit & Resubmit Proposal</h2>
                        </div>
                        <p className="text-xs text-orange-700">
                            <strong>Validator Comments:</strong> {project.step3_data?.remarks || project.step3_return_comments || "Please review and correct deficiencies."}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* SCROLLABLE FORM BODY */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* 1. PROJECT IDENTIFICATION */}
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b pb-2">Project Identification</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Project Title</label>
                                    <input
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                                    <input
                                        name="location"
                                        value={formData.location || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. COST & SPECS */}
                        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b pb-2">Cost & Technical Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Indicative Cost (PHP)</label>
                                    <input
                                        type="number"
                                        name="cost"
                                        value={formData.cost || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm font-mono focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Road Length (km)</label>
                                    <input
                                        type="number"
                                        name="roadLength"
                                        value={formData.roadLength || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority Commodity</label>
                                    <select
                                        name="commodity"
                                        value={formData.commodity || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select...</option>
                                        {PRIORITY_COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-form"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-blue-700 text-white rounded-lg text-sm font-bold hover:bg-blue-800 shadow-lg transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Save & Resubmit'}
                    </button>
                </div>
            </div>
        </div>
    );
}