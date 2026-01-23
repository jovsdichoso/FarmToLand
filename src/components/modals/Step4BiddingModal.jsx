import { useState, useEffect } from 'react';

export default function Step4BiddingModal({ isOpen, onClose, project, onAward }) {
    if (!isOpen || !project) return null;

    // --- STATE ---
    // Read Only if status is already IMPLEMENTATION or beyond
    const isReadOnly = project.status !== 'step4_bidding';

    const [contractor, setContractor] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [noticeFile, setNoticeFile] = useState(null); // We will store the filename string
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize Data
    useEffect(() => {
        if (isOpen) {
            if (project.step4_data) {
                setContractor(project.step4_data.contractor || '');
                setBidAmount(project.step4_data.bid_amount || '');
                setNoticeFile(project.step4_data.notice_file || null);
            } else {
                setContractor('');
                setBidAmount('');
                setNoticeFile(null);
            }
        }
    }, [isOpen, project]);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            // For now, we just save the name to simulate upload
            setNoticeFile(e.target.files[0].name);
        }
    };

    const handleSubmit = () => {
        if (isReadOnly) return;

        if (!contractor || !bidAmount || !noticeFile) {
            alert("Please fill in all fields and upload the Notice of Award.");
            return;
        }

        const bidValue = parseFloat(bidAmount);
        if (isNaN(bidValue) || bidValue <= 0) {
            alert("Please enter a valid Bid Amount.");
            return;
        }

        // Logic: Bid cannot be higher than the Approved Budget (ABC) from Step 3
        if (project.validated_abc && bidValue > project.validated_abc) {
            alert(`Bid Amount (₱${bidValue}) cannot exceed the Approved Budget (₱${project.validated_abc}).`);
            return;
        }

        setIsSubmitting(true);

        const updatedProject = {
            ...project,
            status: 'IMPLEMENTATION', // Moves to Step 5
            step4_data: {
                contractor,
                bid_amount: bidValue,
                notice_file: noticeFile,
                awarded_date: new Date().toISOString()
            },
            last_updated: new Date().toISOString()
        };

        setTimeout(() => {
            onAward(updatedProject);
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-purple-50 px-6 py-4 border-b border-purple-200 flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-1 rounded border border-purple-200">Step 4: Bidding</span>
                        <h2 className="text-xl font-bold text-gray-900 mt-1">Award Contract</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6 overflow-y-auto">

                    {/* Project Context */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Project ID:</span>
                            <span className="font-mono font-bold">{project.id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Approved Budget (ABC):</span>
                            <span className="font-mono font-bold text-indigo-700">
                                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(project.validated_abc || 0)}
                            </span>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Winning Contractor Name</label>
                        <input
                            type="text"
                            disabled={isReadOnly}
                            value={contractor}
                            onChange={(e) => setContractor(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                            placeholder="e.g. ABC Construction Corp."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Final Bid Amount (PHP)</label>
                        <input
                            type="number"
                            disabled={isReadOnly}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                            placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be lower than or equal to ABC.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Notice of Award (PDF)</label>
                        {isReadOnly ? (
                            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span>{noticeFile || 'No file attached'}</span>
                            </div>
                        ) : (
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-white">
                        Cancel
                    </button>
                    {!isReadOnly && (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-bold shadow-lg disabled:opacity-50"
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Award'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}