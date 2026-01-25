import { useState } from 'react';
// --- INTEGRATION: Import your Cloudinary Utility ---
import { uploadToCloudinary } from '../../utils/cloudinary';

// --- ICONS ---
const IconCheck = () => <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const IconLock = () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const IconFile = () => <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconSpinner = () => <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// --- CHECKLIST DATA ---
const STEP4_CHECKLISTS = {
    posting_clearance: [
        { title: "A. Bid Document Completeness", items: ["Is a complete set of bid documents submitted?", "Do bid documents reference the correct FMR Project ID?", "Is the project title consistent across all documents?"] },
        { title: "B. Design and Cost Lock-In Verification", items: ["Are technical specifications identical to the cleared design?", "Are quantities identical to the approved QTO?", "Is the ABC exactly the same as the validated ABC?", "Are no manual edits made after design/ABC clearance?"] },
        { title: "C. Eligibility & Evaluation Criteria", items: ["Are eligibility requirements standard and non-tailored?", "Are experience requirements proportional to project scope?", "Are no brand-specific or supplier-linked requirements used?", "Are evaluation criteria clearly stated and measurable?"] }
    ],
    integrity_clearance: [
        { title: "A. Process Compliance Verification", items: ["Was bidding conducted under validated bid documents only?", "Were pre-bid clarifications uniformly issued?", "Was bid opening properly documented and recorded?"] },
        { title: "B. Eligibility and Evaluation Integrity", items: ["Are eligibility findings fully documented?", "Are disqualifications supported by evidence?", "Are no undocumented judgments present?"] },
        { title: "C. Bid Pattern & Red Flag Scan", items: ["Are bid prices NOT clustered abnormally?", "Is the winning bid within expected variance from ABC?", "Are bid spreads consistent with competition?", "No single bidder dominance observed?", "Winning bid is NOT consistently just below ABC?"] }
    ]
};

// --- SUB-STEPS DEFINITION ---
const STEPS = [
    { id: 1, label: 'Bid Docs Submission', status: 'STEP4_PENDING_DOCS', requiredRole: 'ro' },
    { id: 2, label: 'Posting Clearance', status: 'STEP4_DOCS_SUBMITTED', requiredRole: 'bafe' },
    { id: 3, label: 'Advertisement', status: 'STEP4_POSTING_CLEARED', requiredRole: 'ro' },
    { id: 4, label: 'Bid Opening', status: 'STEP4_BIDDING_ONGOING', requiredRole: 'ro' },
    { id: 5, label: 'Bid Evaluation', status: 'STEP4_BIDS_OPENED', requiredRole: 'ro' },
    { id: 6, label: 'Integrity Clearance', status: 'STEP4_EVALUATION_SUBMITTED', requiredRole: 'bafe' },
    { id: 7, label: 'Award (NOA)', status: 'STEP4_INTEGRITY_CLEARED', requiredRole: 'ro' }
];

// =========================================================================
// HELPER COMPONENTS (OUTSIDE TO PREVENT RE-RENDER BUGS)
// =========================================================================

const FilePreview = ({ label, fileName }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm mb-2">
        <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0"><IconFile /></div>
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</span>
                <span className="text-sm font-bold text-gray-800 truncate" title={fileName}>
                    {fileName ? (fileName.startsWith('http') ? 'File Uploaded' : fileName) : <span className="text-red-400 italic font-normal">Not uploaded</span>}
                </span>
            </div>
        </div>
        {fileName && fileName.startsWith('http') && (
            <a href={fileName} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline shrink-0 px-2">View</a>
        )}
    </div>
);

const UploadField = ({ label, field, disabled, onChange, uploading, value }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">{label}</label>
        <div className="flex items-center gap-2">
            <input
                type="file"
                onChange={(e) => onChange(field, e)}
                disabled={disabled || uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploading && <IconSpinner />}
            {!uploading && value && <IconCheck />}
        </div>
        {value && <p className="text-[10px] text-green-600 mt-1 pl-2 font-medium">File saved.</p>}
    </div>
);

const InputField = ({ label, field, type = 'text', disabled, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(field, e.target.value)}
            disabled={disabled}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed outline-none transition-all"
        />
    </div>
);

const ChecklistSection = ({ stepKey, checklistData, handleChecklistChange, disabled }) => {
    const sections = STEP4_CHECKLISTS[stepKey];
    if (!sections) return null;

    return (
        <div className="mt-6 space-y-6">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs font-bold text-blue-800 uppercase tracking-wide">
                Mandatory Validation Checklist
            </div>
            {sections.map((section, sIdx) => (
                <div key={sIdx} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-black text-gray-600 uppercase">
                        {section.title}
                    </div>
                    <div className="divide-y divide-gray-100">
                        {section.items.map((item, iIdx) => {
                            const uniqueKey = `${sIdx}-${iIdx}`;
                            const currentVal = checklistData[stepKey]?.[uniqueKey];
                            return (
                                <div key={uniqueKey} className="p-3 flex items-center justify-between bg-white hover:bg-gray-50">
                                    <span className="text-xs font-medium text-gray-700 w-2/3 pr-4">{item}</span>
                                    <div className="flex gap-2 shrink-0">
                                        {['Yes', 'No', 'N/A'].map(opt => (
                                            <label key={opt} className={`cursor-pointer px-3 py-1 rounded text-[10px] font-bold border transition-all ${currentVal === opt ? (opt === 'Yes' ? 'bg-green-600 text-white border-green-600' : opt === 'No' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-500 text-white border-gray-500') : 'bg-white text-gray-500 border-gray-200'}`}>
                                                <input 
                                                    type="radio" 
                                                    className="hidden" 
                                                    name={`${stepKey}-${uniqueKey}`} 
                                                    checked={currentVal === opt}
                                                    onChange={() => handleChecklistChange(stepKey, uniqueKey, opt)}
                                                    disabled={disabled}
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

// =========================================================================
// MAIN COMPONENT
// =========================================================================

export default function Step4BiddingModal({ isOpen, onClose, project, onAward, userRole }) {
    if (!isOpen || !project) return null;

    // --- STATE ---
    const getCurrentStepIndex = (status) => {
        if (status === 'step4_bidding') return 0;
        const idx = STEPS.findIndex(s => s.status === status);
        return idx === -1 ? 0 : idx;
    };

    const [currentStepIndex] = useState(getCurrentStepIndex(project.status));
    const activeStep = STEPS[currentStepIndex] || STEPS[0];

    // Form Data & UI State
    const [formData, setFormData] = useState(project.step4_data || {});
    const [checklistData, setChecklistData] = useState(project.step4_data?.checklists || {});
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState({});

    const canAct = userRole === activeStep.requiredRole;

    // --- HANDLERS ---

    const handleFileChange = async (field, e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingFiles(prev => ({ ...prev, [field]: true }));

        try {
            // UPLOAD to Cloudinary
            const url = await uploadToCloudinary(file);
            setFormData(prev => ({ ...prev, [field]: url }));
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed to upload file. Please try again.");
        } finally {
            setUploadingFiles(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleChecklistChange = (stepKey, itemIndex, value) => {
        setChecklistData(prev => ({
            ...prev,
            [stepKey]: {
                ...prev[stepKey],
                [itemIndex]: value
            }
        }));
    };

    // --- VALIDATION LOGIC ---
    const validateCurrentStep = () => {
        const missing = [];
        
        // Step 1: Docs Submission (RO)
        if (activeStep.id === 1) {
            if (!formData.file_bds) missing.push('Bidding Documents (File)');
            if (!formData.file_itb) missing.push('Draft ITB (File)');
        }

        // Step 3: Advertisement (RO)
        if (activeStep.id === 3) {
            if (!formData.philgeps_ref) missing.push('PhilGEPS Reference Number');
            if (!formData.posting_date) missing.push('Date of Posting');
            if (!formData.file_proof_posting) missing.push('Proof of Posting (File)');
        }

        // Step 4: Bid Opening (RO)
        if (activeStep.id === 4) {
            if (!formData.opening_date) missing.push('Bid Opening Date');
            if (!formData.opening_time) missing.push('Bid Opening Time');
            if (!formData.file_abstract) missing.push('Abstract of Bids (File)');
            if (!formData.file_attendance) missing.push('Attendance Sheet (File)');
        }

        // Step 5: Evaluation (RO)
        if (activeStep.id === 5) {
            if (!formData.file_eval_eligibility) missing.push('Eligibility Evaluation (File)');
            if (!formData.file_eval_tech) missing.push('Technical Evaluation (File)');
            if (!formData.file_eval_price) missing.push('Financial Evaluation (File)');
            if (!formData.lcb_bidder_name) missing.push('Lowest Calculated Bidder Name');
            if (!formData.lcb_bid_amount) missing.push('Bid Amount');
        }

        // Step 7: Award (RO)
        if (activeStep.id === 7) {
            if (!formData.noa_date) missing.push('NOA Date');
            if (!formData.file_noa) missing.push('Signed NOA (File)');
        }

        if (missing.length > 0) {
            alert(`Please complete the following required fields before submitting:\n\n- ${missing.join('\n- ')}`);
            return false;
        }
        return true;
    };

    const handleAction = (action) => {
        // 1. Block if uploading
        if (Object.values(uploadingFiles).some(isUploading => isUploading)) {
            alert("Please wait for files to finish uploading.");
            return;
        }

        // 2. Validate RO Inputs (If Submitting)
        if ((action === 'SUBMIT' || action === 'AWARD') && !validateCurrentStep()) {
            return; // Stop if validation fails
        }

        // 3. Validate BAFE Checklist (If Clearing)
        if (action === 'CLEAR') {
            const stepKey = activeStep.id === 2 ? 'posting_clearance' : 'integrity_clearance';
            const requiredItems = STEP4_CHECKLISTS[stepKey].reduce((acc, section) => acc + section.items.length, 0);
            const answeredItems = Object.keys(checklistData[stepKey] || {}).length;
            
            if (answeredItems < requiredItems) {
                alert(`Please complete the checklist before issuing clearance. (${answeredItems}/${requiredItems} Answered)`);
                return;
            }
        }

        setIsSubmitting(true);
        let nextStatus = project.status;

        // State Transitions
        if (activeStep.id === 1 && action === 'SUBMIT') nextStatus = 'STEP4_DOCS_SUBMITTED';
        if (activeStep.id === 2) nextStatus = action === 'CLEAR' ? 'STEP4_POSTING_CLEARED' : 'STEP4_PENDING_DOCS';
        if (activeStep.id === 3 && action === 'SUBMIT') nextStatus = 'STEP4_BIDDING_ONGOING';
        if (activeStep.id === 4 && action === 'SUBMIT') nextStatus = 'STEP4_BIDS_OPENED';
        if (activeStep.id === 5 && action === 'SUBMIT') nextStatus = 'STEP4_EVALUATION_SUBMITTED';
        if (activeStep.id === 6) nextStatus = action === 'CLEAR' ? 'STEP4_INTEGRITY_CLEARED' : 'STEP4_BIDS_OPENED';
        if (activeStep.id === 7 && action === 'AWARD') nextStatus = 'IMPLEMENTATION';

        const updatedProject = {
            ...project,
            status: nextStatus,
            step4_data: { 
                ...formData, 
                checklists: checklistData, 
                last_remarks: remarks 
            },
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
                            <strong>Step 1:</strong> Upload Bidding Documents based on the Locked Design & ABC (₱{new Intl.NumberFormat('en-PH').format(project.validated_abc || 0)}).
                        </div>
                        <UploadField label="Bidding Documents (BDs)" field="file_bds" disabled={!canAct} onChange={handleFileChange} uploading={uploadingFiles['file_bds']} value={formData.file_bds} />
                        <UploadField label="Draft Invitation to Bid" field="file_itb" disabled={!canAct} onChange={handleFileChange} uploading={uploadingFiles['file_itb']} value={formData.file_itb} />
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-100 text-sm text-yellow-800 mb-4">
                            <strong>Gatekeeper Check:</strong> Review documents and complete the checklist below.
                        </div>
                        <div className="p-4 border rounded-xl bg-gray-50 space-y-3">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Documents for Review</h4>
                            <FilePreview label="Bidding Documents" fileName={formData.file_bds} />
                            <FilePreview label="Draft Invitation to Bid" fileName={formData.file_itb} />
                        </div>
                        <ChecklistSection stepKey="posting_clearance" checklistData={checklistData} handleChecklistChange={handleChecklistChange} disabled={!canAct} />
                        <textarea className="w-full p-3 border border-gray-300 rounded-xl mt-6 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Additional Validator Remarks..." value={remarks} onChange={e => setRemarks(e.target.value)} disabled={!canAct} />
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <InputField label="PhilGEPS Reference Number" field="philgeps_ref" disabled={!canAct} value={formData.philgeps_ref} onChange={handleInputChange} />
                        <InputField label="Date of Posting" field="posting_date" type="date" disabled={!canAct} value={formData.posting_date} onChange={handleInputChange} />
                        <UploadField label="Proof of Posting (Screenshot/PDF)" field="file_proof_posting" disabled={!canAct} onChange={handleFileChange} uploading={uploadingFiles['file_proof_posting']} value={formData.file_proof_posting} />
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Bid Opening Date" field="opening_date" type="date" disabled={!canAct} value={formData.opening_date} onChange={handleInputChange} />
                            <InputField label="Time" field="opening_time" type="time" disabled={!canAct} value={formData.opening_time} onChange={handleInputChange} />
                        </div>
                        <InputField label="Live Stream Link (FB/YouTube)" field="livestream_link" disabled={!canAct} value={formData.livestream_link} onChange={handleInputChange} />
                        <UploadField label="Abstract of Bids" field="file_abstract" disabled={!canAct} onChange={handleFileChange} uploading={uploadingFiles['file_abstract']} value={formData.file_abstract} />
                        <UploadField label="Attendance Sheet" field="file_attendance" disabled={!canAct} onChange={handleFileChange} uploading={uploadingFiles['file_attendance']} value={formData.file_attendance} />
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-100 p-3 rounded text-xs text-gray-500 mb-4">System Rule: All three evaluation reports must be uploaded to proceed.</div>
                        <UploadField label="1. Eligibility Evaluation Results" field="file_eval_eligibility" disabled={!canAct} onChange={handleFileChange} uploading={uploadingFiles['file_eval_eligibility']} value={formData.file_eval_eligibility} />
                        <UploadField label="2. Technical Evaluation Results" field="file_eval_tech" disabled={!canAct} onChange={handleFileChange} uploading={uploadingFiles['file_eval_tech']} value={formData.file_eval_tech} />
                        <UploadField label="3. Financial/Price Evaluation" field="file_eval_price" disabled={!canAct} onChange={handleFileChange} uploading={uploadingFiles['file_eval_price']} value={formData.file_eval_price} />
                        <div className="border-t border-gray-200 my-4 pt-4">
                            <InputField label="Lowest Calculated Bidder (Name)" field="lcb_bidder_name" disabled={!canAct} value={formData.lcb_bidder_name} onChange={handleInputChange} />
                            <InputField label="Bid Amount (PHP)" field="lcb_bid_amount" type="number" disabled={!canAct} value={formData.lcb_bid_amount} onChange={handleInputChange} />
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded border border-red-100 text-sm text-red-800 mb-4 flex items-center gap-2">
                            <IconLock /> <strong>Critical Gate:</strong> Review Evaluation Reports and complete the Integrity Checklist.
                        </div>
                        <div className="p-4 border rounded-xl bg-gray-50 space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Evaluation Reports</h4>
                                <div className="space-y-2">
                                    <FilePreview label="Eligibility" fileName={formData.file_eval_eligibility} />
                                    <FilePreview label="Technical" fileName={formData.file_eval_tech} />
                                    <FilePreview label="Financial" fileName={formData.file_eval_price} />
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bid Summary</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="block text-[10px] text-gray-400 uppercase">LCB Bidder</span><span className="font-bold">{formData.lcb_bidder_name || '---'}</span></div>
                                    <div><span className="block text-[10px] text-gray-400 uppercase">Bid Amount</span><span className="font-bold font-mono text-blue-700">₱{parseFloat(formData.lcb_bid_amount || 0).toLocaleString()}</span></div>
                                </div>
                            </div>
                        </div>
                        <ChecklistSection stepKey="integrity_clearance" checklistData={checklistData} handleChecklistChange={handleChecklistChange} disabled={!canAct} />
                        <textarea className="w-full p-3 border border-gray-300 rounded-xl mt-6 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Integrity Review Findings / Reason for Return..." value={remarks} onChange={e => setRemarks(e.target.value)} disabled={!canAct} />
                    </div>
                );
            case 7:
                return (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded border border-green-100 text-sm text-green-800 mb-4">Clearance Issued! You may now proceed to award.</div>
                        <InputField label="Notice of Award (NOA) Date" field="noa_date" type="date" disabled={!canAct} value={formData.noa_date} onChange={handleInputChange} />
                        <UploadField label="Signed Notice of Award" field="file_noa" disabled={!canAct} onChange={handleFileChange} uploading={uploadingFiles['file_noa']} value={formData.file_noa} />
                    </div>
                );
            default: return null;
        }
    };

    // --- MAIN RENDER ---
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex">
                {/* SIDEBAR */}
                <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-black text-gray-900 uppercase">Procurement Tunnel</h2>
                        <p className="text-xs text-gray-500 mt-1">Project ID: {project.id}</p>
                        <div className="mt-2 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded inline-block">
                            ABC: ₱{new Intl.NumberFormat('en-PH').format(project.validated_abc || 0)} (Locked)
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
                        <p className="text-xs font-bold text-blue-600 uppercase mt-1">Assigned to: {activeStep.requiredRole}</p>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto scrollbar-thin">
                        {renderStepContent()}
                    </div>

                    <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div className="text-xs text-gray-400 font-bold uppercase">Your Role: <span className="text-black">{userRole}</span></div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-600 hover:bg-white transition-all">Cancel</button>
                            {!canAct ? (
                                <div className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-500 text-sm font-bold border border-gray-300 cursor-not-allowed flex items-center gap-2">
                                    <IconLock /> <span>Waiting for {activeStep.requiredRole.toUpperCase()}</span>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}