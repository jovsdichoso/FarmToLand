import MapPreview from './MapPreview';

export default function ViewProjectModal({ isOpen, onClose, project }) {
    if (!isOpen || !project) return null;

    const hasDeficiencies = project.status === 'RETURNED' && project.deficiencies;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                style={{
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 pointer-events-none">
                <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl">

                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-start sm:items-center rounded-t-lg z-10">
                        <div className="flex-1">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Project Details</h2>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">{project.id}</p>
                        </div>
                        <button
                            onClick={onClose}
                            type="button"
                            className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl font-light leading-none ml-2"
                        >
                            ×
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 space-y-6">

                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            <StatusBadge status={project.status} />
                        </div>

                        {/* Deficiency List (if returned) */}
                        {hasDeficiencies && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h3 className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    Deficiencies Found - Please Address:
                                </h3>
                                <ul className="space-y-2">
                                    {project.deficiencies.map((item, idx) => (
                                        <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                                            <span className="text-red-600 mt-0.5">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                {project.validatorNotes && (
                                    <div className="mt-3 pt-3 border-t border-red-200">
                                        <p className="text-xs font-semibold text-red-900 mb-1">Validator Notes:</p>
                                        <p className="text-sm text-red-800">{project.validatorNotes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Project Information */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 uppercase">Project Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoField label="Project Name" value={project.name} />
                                <InfoField label="Region" value={project.region} />
                                <InfoField label="Province" value={project.province} />
                                <InfoField label="Municipality" value={project.municipality} />
                                <InfoField label="Barangay" value={project.barangay} />
                                <InfoField label="Road Length" value={`${project.roadLength} km`} />
                            </div>
                        </div>

                        {/* GPS & Map */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 uppercase">Location</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <InfoField label="GPS Start" value={project.gpsStart || 'Not provided'} />
                                <InfoField label="GPS End" value={project.gpsEnd || 'Not provided'} />
                            </div>
                            {project.gpsStart && project.gpsEnd && (
                                <MapPreview startCoords={project.gpsStart} endCoords={project.gpsEnd} />
                            )}
                        </div>

                        {/* Project Details */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 uppercase">Project Details</h3>
                            <div className="space-y-4">
                                <InfoField label="Beneficiary Area/Commodity" value={project.beneficiaryArea} />
                                <InfoField label="Primary Commodity" value={project.commodity || 'Not specified'} />
                                <InfoField label="Problem Statement" value={project.problemStatement} fullWidth />
                                <InfoField label="Connection Nodes" value={project.connectionNodes} fullWidth />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InfoField label="Right-of-Way Constraints" value={project.rightOfWay} />
                                    <InfoField label="Environmental Constraints" value={project.environmentalConstraint} />
                                </div>
                            </div>
                        </div>

                        {/* Attachments */}
                        {project.attachments && (
                            <div>
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 uppercase">Attachments</h3>
                                <div className="space-y-2">
                                    {project.attachments.endorsementLetter && (
                                        <AttachmentItem label="LGU Endorsement Letter" file={project.attachments.endorsementLetter} />
                                    )}
                                    {project.attachments.mapSketch && (
                                        <AttachmentItem label="Map Sketch" file={project.attachments.mapSketch} />
                                    )}
                                    {project.attachments.photos && (
                                        <AttachmentItem label="Site Photos" file={project.attachments.photos} />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={onClose}
                                className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            {(project.status === 'DRAFT' || project.status === 'RETURNED') && (
                                <button
                                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs sm:text-sm font-semibold transition-colors"
                                >
                                    Edit & Resubmit
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Helper Components
function InfoField({ label, value, fullWidth }) {
    return (
        <div className={fullWidth ? 'col-span-full' : ''}>
            <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
            <p className="text-sm text-gray-900">{value}</p>
        </div>
    );
}

function AttachmentItem({ label, file }) {
    return (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-700 flex-1">{label}</span>
            <span className="text-xs text-gray-500">{file.name}</span>
        </div>
    );
}

function StatusBadge({ status }) {
    const config = {
        CLEARED: { style: 'bg-green-50 text-green-700 border-green-200', label: 'Cleared' },
        RETURNED: { style: 'bg-red-50 text-red-700 border-red-200', label: 'Returned' },
        PENDING_REVIEW: { style: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending Review' },
        ON_HOLD: { style: 'bg-gray-50 text-gray-700 border-gray-200', label: 'On Hold' },
        DRAFT: { style: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Draft' }
    };
    const { style, label } = config[status] || config.DRAFT;

    return (
        <span className={`px-3 py-1 rounded text-xs font-semibold border ${style}`}>
            {label}
        </span>
    );
}
