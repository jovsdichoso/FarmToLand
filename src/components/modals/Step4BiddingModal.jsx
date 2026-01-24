import { useState } from 'react';

// --- ICONS ---
const IconCheck = () => <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconLock = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

// --- SUB-STEPS DEFINITION ---
const STEPS = [
    { id: 1, label: 'Bid Docs Submission', status: 'STEP4_PENDING_DOCS', requiredRole: 'ro' },
    { id: 2, label: 'Posting Clearance', status: 'STEP4_DOCS_SUBMITTED', requiredRole: 'bafe' }, // Gate 1
    { id: 3, label: 'Advertisement', status: 'STEP4_POSTING_CLEARED', requiredRole: 'ro' },
    { id: 4, label: 'Bid Opening', status: 'STEP4_BIDDING_ONGOING', requiredRole: 'ro' },
    { id: 5, label: 'Bid Evaluation', status: 'STEP4_BIDS_OPENED', requiredRole: 'ro' },
    { id: 6, label: 'Integrity Clearance', status: 'STEP4_EVALUATION_SUBMITTED', requiredRole: 'bafe' }, // Gate 2
    { id: 7, label: 'Award (NOA)', status: 'STEP4_INTEGRITY_CLEARED', requiredRole: 'ro' }
];

export default function Step4BiddingModal({ isOpen, onClose, project, onAward }) {
    if (!isOpen || !project) return null;

    // --- STATE ---
    const getCurrentStepIndex = (status) => {
        // Map legacy 'step4_bidding' to first step
        if (status === 'step4_bidding') return 0;
        const idx = STEPS.findIndex(s => s.status === status);
        return idx === -1 ? 0 : idx;
    };

    const [currentStepIndex] = useState(getCurrentStepIndex(project.status));
    const activeStep = STEPS[currentStepIndex] || STEPS[0];

    // Form Data
    const [formData, setFormData] = useState(project.step4_data || {});
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- HANDLERS ---
    const handleFileChange = (field, e) => {
        if (e.target.files[0]) {
            setFormData(prev => ({ ...prev, [field]: e.target.files[0].name }));
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAction = (action) => {
        setIsSubmitting(true);
        let nextStatus = project.status;

        // --- STATE TRANSITION LOGIC ---
        // 1. RO submits Docs -> BAFE Review
        if (activeStep.id === 1 && action === 'SUBMIT') nextStatus = 'STEP4_DOCS_SUBMITTED';

        // 2. BAFE Clears/Returns Docs
        if (activeStep.id === 2) {
            if (action === 'CLEAR') nextStatus = 'STEP4_POSTING_CLEARED';
            if (action === 'RETURN') nextStatus = 'STEP4_PENDING_DOCS';
        }

        // 3. RO Advertises -> Bidding Ongoing
        if (activeStep.id === 3 && action === 'SUBMIT') nextStatus = 'STEP4_BIDDING_ONGOING';

        // 4. RO Opens Bids -> Evaluation
        if (activeStep.id === 4 && action === 'SUBMIT') nextStatus = 'STEP4_BIDS_OPENED';

        // 5. RO Submits Eval -> Integrity Check
        if (activeStep.id === 5 && action === 'SUBMIT') nextStatus = 'STEP4_EVALUATION_SUBMITTED';

        // 6. BAFE Clears/Returns Eval
        if (activeStep.id === 6) {
            if (action === 'CLEAR') nextStatus = 'STEP4_INTEGRITY_CLEARED';
            if (action === 'RETURN') nextStatus = 'STEP4_BIDS_OPENED';
        }

        // 7. RO Awards -> Implementation
        if (activeStep.id === 7 && action === 'AWARD') nextStatus = 'IMPLEMENTATION';

        const updatedProject = {
            ...project,
            status: nextStatus,
            step4_data: { ...formData, last_remarks: remarks },
            last_updated: new Date().toISOString()
        };

        setTimeout(() => {
            onAward(updatedProject);
            setIsSubmitting(false);
            onClose();
        }, 1000);
    };

    // --- RENDERERS ---
    const renderStepContent = () => {
        switch (activeStep.id) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded border border-blue-100 text-sm text-blue-800 mb-4">
                            <strong>Step 1:</strong> Upload Bidding Documents based on the Locked Design & ABC (₱{project.validated_abc?.toLocaleString()}).
                        </div>
                        <UploadField label="Bidding Documents (BDs)" field="file_bds" />
                        <UploadField label="Draft Invitation to Bid" field="file_itb" />
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-100 text-sm text-yellow-800 mb-4">
                            <strong>Gatekeeper Check:</strong> Verify if Bidding Documents align with the Validated Step 3 Design.
                        </div>
                        <div className="p-4 border rounded bg-gray-50 text-sm">
                            <p><strong>Submitted BDs:</strong> {formData.file_bds || 'N/A'}</p>
                            <p><strong>Draft ITB:</strong> {formData.file_itb || 'N/A'}</p>
                        </div>
                        <textarea
                            className="w-full p-2 border rounded mt-2"
                            placeholder="Validator Remarks..."
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                        />
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <InputField label="PhilGEPS Reference Number" field="philgeps_ref" />
                        <InputField label="Date of Posting" field="posting_date" type="date" />
                        <UploadField label="Proof of Posting (Screenshot/PDF)" field="file_proof_posting" />
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Bid Opening Date" field="opening_date" type="date" />
                            <InputField label="Time" field="opening_time" type="time" />
                        </div>
                        <InputField label="Live Stream Link (FB/YouTube)" field="livestream_link" />
                        <UploadField label="Abstract of Bids" field="file_abstract" />
                        <UploadField label="Attendance Sheet" field="file_attendance" />
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-100 p-3 rounded text-xs text-gray-500 mb-4">
                            System Rule: All three evaluation reports must be uploaded to proceed.
                        </div>
                        <UploadField label="1. Eligibility Evaluation Results" field="file_eval_eligibility" />
                        <UploadField label="2. Technical Evaluation Results" field="file_eval_tech" />
                        <UploadField label="3. Financial/Price Evaluation" field="file_eval_price" />
                        <InputField label="Lowest Calculated Bidder (Name)" field="lcb_bidder_name" />
                        <InputField label="Bid Amount (PHP)" field="lcb_bid_amount" type="number" />
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded border border-red-100 text-sm text-red-800 mb-4 flex items-center gap-2">
                            <IconLock /> <strong>Critical Gate:</strong> Procurement Integrity Clearance. No NOA without this.
                        </div>
                        <div className="p-4 border rounded bg-gray-50 text-xs space-y-2 font-mono">
                            <p>LCB Bidder: {formData.lcb_bidder_name}</p>
                            <p>Bid Amount: ₱{parseFloat(formData.lcb_bid_amount || 0).toLocaleString()}</p>
                            <p>ABC: ₱{project.validated_abc?.toLocaleString()}</p>
                        </div>
                        <textarea
                            className="w-full p-2 border rounded mt-2"
                            placeholder="Integrity Review Findings..."
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                        />
                    </div>
                );
            case 7:
                return (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded border border-green-100 text-sm text-green-800 mb-4">
                            Clearance Issued! You may now proceed to award.
                        </div>
                        <InputField label="Notice of Award (NOA) Date" field="noa_date" type="date" />
                        <UploadField label="Signed Notice of Award" field="file_noa" />
                    </div>
                );
            default: return null;
        }
    };

    // --- HELPER FIELDS ---
    const UploadField = ({ label, field }) => (
        <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    onChange={(e) => handleFileChange(field, e)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData[field] && <IconCheck />}
            </div>
        </div>
    );

    const InputField = ({ label, field, type = 'text' }) => (
        <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">{label}</label>
            <input
                type={type}
                value={formData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex">

                {/* SIDEBAR: TIMELINE */}
                <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-black text-gray-900 uppercase">Procurement Tunnel</h2>
                        <p className="text-xs text-gray-500 mt-1">Project ID: {project.id}</p>
                        <div className="mt-2 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded inline-block">
                            ABC: ₱{project.validated_abc?.toLocaleString()} (Locked)
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {STEPS.map((step, index) => {
                            const isCompleted = index < currentStepIndex;
                            const isActive = index === currentStepIndex;
                            return (
                                <div key={step.id} className={`relative pl-8 border-l-2 ${isCompleted ? 'border-green-500' : isActive ? 'border-blue-500' : 'border-gray-200'}`}>
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-green-500 border-green-500' : isActive ? 'bg-white border-blue-500' : 'bg-gray-100 border-gray-300'}`}></div>
                                    <h3 className={`text-sm font-bold ${isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-400'}`}>{step.label}</h3>
                                    <p className="text-[10px] text-gray-500 uppercase">{step.requiredRole === 'bafe' ? 'BAFE Action' : 'RO Action'}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="w-2/3 flex flex-col">
                    <div className="p-8 border-b border-gray-100">
                        <h1 className="text-2xl font-bold text-gray-900">{activeStep.label}</h1>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto">
                        {renderStepContent()}
                    </div>

                    <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-600 hover:bg-white transition-all">Cancel</button>

                        {/* DYNAMIC BUTTONS */}
                        {activeStep.requiredRole === 'bafe' ? (
                            <>
                                <button onClick={() => handleAction('RETURN')} className="px-5 py-2.5 rounded-xl bg-red-100 text-red-700 text-sm font-bold hover:bg-red-200 transition-all">Return</button>
                                <button onClick={() => handleAction('CLEAR')} disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 shadow-lg transition-all">
                                    {isSubmitting ? 'Processing...' : 'Issue Clearance'}
                                </button>
                            </>
                        ) : (
                            <button onClick={() => handleAction(activeStep.id === 7 ? 'AWARD' : 'SUBMIT')} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-bold hover:bg-blue-800 shadow-lg transition-all">
                                {isSubmitting ? 'Uploading...' : activeStep.id === 7 ? 'Issue Notice of Award' : 'Submit & Lock'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}