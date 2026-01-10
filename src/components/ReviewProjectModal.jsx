import { useState } from 'react';
import { 
  documentTextOutline, 
  locationOutline, 
  checkmarkCircleOutline, 
  closeCircleOutline, 
  pauseCircleOutline,
  documentAttachOutline
} from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

export default function ReviewProjectModalSplitScreen({ isOpen, onClose, project, onDecision }) {
    const [checklist, setChecklist] = useState({
        endorsementComplete: false,
        mapSketchClear: false,
        gpsAccurate: false,
        roadLengthReasonable: false,
        problemStatementClear: false,
        rightOfWayAssessed: false,
        environmentalChecked: false,
        photosProvided: false
    });

    // NEW: State for the Masterplan verification
    const [masterplanVerified, setMasterplanVerified] = useState(false);

    const [action, setAction] = useState(null);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !project) return null;

    const checklistComplete = Object.values(checklist).every(v => v === true);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        onDecision(project.id, { 
            action, 
            notes, 
            checklist,
            masterplanVerified 
        });
        setIsSubmitting(false);

        // Reset state and close
        setAction(null);
        setNotes('');
        setMasterplanVerified(false);
        setChecklist({
            endorsementComplete: false,
            mapSketchClear: false,
            gpsAccurate: false,
            roadLengthReasonable: false,
            problemStatementClear: false,
            rightOfWayAssessed: false,
            environmentalChecked: false,
            photosProvided: false
        });
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                onClick={isSubmitting ? undefined : onClose}
            />

            {/* Full-Screen Split Modal */}
            <div className="fixed inset-0 z-50 flex p-4 pointer-events-none">
                <div className="bg-white rounded-lg w-full h-full overflow-hidden pointer-events-auto shadow-2xl flex">

                    {/* LEFT SIDE: Documents & Map Preview */}
                    <div className="w-1/2 border-r border-gray-300 overflow-y-auto bg-gray-50">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                            <div className="flex items-center gap-2">
                                <IonIcon icon={documentTextOutline} className="text-xl text-blue-600" />
                                <h3 className="text-lg font-bold text-gray-900">Documents & Details</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{project.id}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Project Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-bold text-blue-900 mb-2">{project.name}</h4>
                                <p className="text-sm text-blue-800">Location: {project.location}</p>
                                <p className="text-sm text-blue-800">Length: {project.roadLength} km</p>
                                <p className="text-sm text-blue-800">Submitted: {project.date}</p>
                            </div>

                            {/* Google Map Preview */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <IonIcon icon={locationOutline} className="text-lg text-red-500" />
                                    <h4 className="text-sm font-bold text-gray-900">Location Map</h4>
                                </div>
                                <div className="border border-gray-300 rounded-lg overflow-hidden h-64 bg-white">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${project.gpsStart}`}
                                        allowFullScreen
                                    />
                                </div>
                            </div>

                            {/* Documents List */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <IonIcon icon={documentAttachOutline} className="text-lg text-purple-600" />
                                    <h4 className="text-sm font-bold text-gray-900">Uploaded Documents</h4>
                                </div>
                                <div className="space-y-2">
                                    {project.step1?.documents?.map((doc) => (
                                        <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                                                <p className="text-xs text-gray-500">Uploaded: {doc.uploadedDate}</p>
                                            </div>
                                            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium">
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Project Details */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Project Information</h4>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium text-gray-700">Problem:</span> {project.problemStatement}</p>
                                    <p><span className="font-medium text-gray-700">Beneficiary:</span> {project.beneficiaryArea}</p>
                                    <p><span className="font-medium text-gray-700">Commodity:</span> {project.commodity}</p>
                                    <p><span className="font-medium text-gray-700">Connection:</span> {project.connectionNodes}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Validation Checklist & Actions */}
                    <div className="w-1/2 overflow-y-auto bg-white">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10 flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <IonIcon icon={checkmarkCircleOutline} className="text-xl text-green-600" />
                                    <h3 className="text-lg font-bold text-gray-900">Validation Checklist</h3>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Review all items before decision</p>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-light disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Checklist */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-4">Document Completeness Check</h4>
                                <div className="space-y-3">
                                    {Object.entries({
                                        endorsementComplete: 'LGU Endorsement Letter is complete and signed',
                                        mapSketchClear: 'Map sketch clearly shows the road location',
                                        gpsAccurate: 'GPS coordinates are accurate and verified',
                                        roadLengthReasonable: 'Road length estimate is reasonable',
                                        problemStatementClear: 'Problem statement is clear and justified',
                                        rightOfWayAssessed: 'Right-of-way constraints properly assessed',
                                        environmentalChecked: 'Environmental constraints addressed',
                                        photosProvided: 'Site photos are clear and relevant'
                                    }).map(([key, label]) => (
                                        <label key={key} className="flex items-start gap-3 p-2 hover:bg-white rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={checklist[key]}
                                                onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                                                disabled={isSubmitting}
                                                className="mt-1 w-4 h-4 text-blue-600 disabled:opacity-50"
                                            />
                                            <span className="text-sm text-gray-900">{label}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* Checklist Status */}
                                <div className="mt-4 pt-4 border-t border-gray-300">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Checklist Progress:</span>
                                        <span className={`text-sm font-bold ${checklistComplete ? 'text-green-600' : 'text-orange-600'}`}>
                                            {Object.values(checklist).filter(Boolean).length} / {Object.keys(checklist).length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Validator Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Validator Notes / Comments</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    disabled={isSubmitting}
                                    rows="4"
                                    placeholder="Add your observations, concerns, or recommendations..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                                />
                            </div>

                            {/* NEW: Masterplan Justification Checkbox (After Notes) */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={masterplanVerified}
                                        onChange={(e) => setMasterplanVerified(e.target.checked)}
                                        disabled={isSubmitting}
                                        className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            The proposed road is network-justified per the FMR Masterplan.
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            By checking this, you certify that this proposal aligns with the local development plan.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Decision Buttons */}
                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4">Validation Decision</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {/* Clear Button */}
                                    <button
                                        onClick={() => setAction('clear')}
                                        // Update: Requires both the Checklist AND the Masterplan Verification
                                        disabled={!checklistComplete || !masterplanVerified || isSubmitting}
                                        className={`group relative overflow-hidden px-6 py-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                            action === 'clear'
                                                ? 'bg-green-600 text-white shadow-lg scale-[1.02]'
                                                : 'bg-white border-2 border-green-600 text-green-700 hover:bg-green-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                                    action === 'clear' ? 'bg-white/20' : 'bg-green-100'
                                                }`}>
                                                    <IonIcon 
                                                        icon={checkmarkCircleOutline} 
                                                        className={`text-2xl ${action === 'clear' ? 'text-white' : 'text-green-600'}`}
                                                    />
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold text-sm">Clear & Proceed to Step 2</div>
                                                    <div className={`text-xs mt-0.5 ${action === 'clear' ? 'text-green-100' : 'text-green-600'}`}>
                                                        All requirements met
                                                    </div>
                                                </div>
                                            </div>
                                            {action === 'clear' && (
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>

                                    {/* Return Button */}
                                    <button
                                        onClick={() => setAction('return')}
                                        disabled={isSubmitting}
                                        className={`group relative overflow-hidden px-6 py-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                            action === 'return'
                                                ? 'bg-red-600 text-white shadow-lg scale-[1.02]'
                                                : 'bg-white border-2 border-red-600 text-red-700 hover:bg-red-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                                    action === 'return' ? 'bg-white/20' : 'bg-red-100'
                                                }`}>
                                                    <IonIcon 
                                                        icon={closeCircleOutline} 
                                                        className={`text-2xl ${action === 'return' ? 'text-white' : 'text-red-600'}`}
                                                    />
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold text-sm">Return to RO</div>
                                                    <div className={`text-xs mt-0.5 ${action === 'return' ? 'text-red-100' : 'text-red-600'}`}>
                                                        Needs revision/completion
                                                    </div>
                                                </div>
                                            </div>
                                            {action === 'return' && (
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>

                                    {/* Hold Button */}
                                    <button
                                        onClick={() => setAction('hold')}
                                        disabled={isSubmitting}
                                        className={`group relative overflow-hidden px-6 py-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                            action === 'hold'
                                                ? 'bg-yellow-600 text-white shadow-lg scale-[1.02]'
                                                : 'bg-white border-2 border-yellow-600 text-yellow-700 hover:bg-yellow-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                                    action === 'hold' ? 'bg-white/20' : 'bg-yellow-100'
                                                }`}>
                                                    <IonIcon 
                                                        icon={pauseCircleOutline} 
                                                        className={`text-2xl ${action === 'hold' ? 'text-white' : 'text-yellow-600'}`}
                                                    />
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold text-sm">Put On Hold</div>
                                                    <div className={`text-xs mt-0.5 ${action === 'hold' ? 'text-yellow-100' : 'text-yellow-600'}`}>
                                                        Right-of-way or political issues
                                                    </div>
                                                </div>
                                            </div>
                                            {action === 'hold' && (
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Confirmation Section */}
                            {action && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-900 mb-3">
                                        Confirm your decision: <span className="font-bold">{action.toUpperCase()}</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setAction(null)}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Submitting...</span>
                                                </>
                                            ) : (
                                                'Confirm & Submit'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}