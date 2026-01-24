import { useState } from 'react';

// --- ICONS ---
const IconUpload = () => <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const IconFile = () => <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconCheck = () => <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;

export default function Step3UploadModal({ isOpen, onClose, project, onSubmit }) {
    if (!isOpen || !project) return null;

    const [files, setFiles] = useState({
        detailed_engineering: null,
        qto: null,
        specs: null,
        cost_template: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (key, e) => {
        if (e.target.files[0]) {
            // Store the file object locally for upload logic
            // For the mock, we will just use the name in the submit
            setFiles(prev => ({ ...prev, [key]: e.target.files[0] }));
        }
    };

    const handleSubmit = () => {
        // Validation
        const missing = Object.entries(files).filter(([_, val]) => !val).map(([k]) => k);
        if (missing.length > 0) {
            alert("All documents are required for Step 3 submission.");
            return;
        }

        setIsSubmitting(true);

        const updatedProject = {
            ...project,
            status: 'step3_pending', // Move to BAFE Validation
            attachments: {
                ...project.attachments,
                detailed_engineering: {
                    name: files.detailed_engineering.name,
                    url: URL.createObjectURL(files.detailed_engineering) // Create a temporary preview URL
                },
                qto: {
                    name: files.qto.name,
                    url: URL.createObjectURL(files.qto)
                },
                specs: {
                    name: files.specs.name,
                    url: URL.createObjectURL(files.specs)
                },
                cost_template: {
                    name: files.cost_template.name,
                    url: URL.createObjectURL(files.cost_template)
                }
            },
            step3_submitted_date: new Date().toISOString()
        };

        setTimeout(() => {
            onSubmit(updatedProject);
            setIsSubmitting(false);
            onClose();
        }, 1500);
    };

    const UploadZone = ({ label, fileKey, accept = ".pdf" }) => (
        <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 transition-colors group">
            <div className="flex justify-between items-start mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase">{label}</label>
                {files[fileKey] && <IconCheck />}
            </div>

            <div className="relative">
                <input
                    type="file"
                    accept={accept}
                    onChange={(e) => handleFileChange(fileKey, e)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all
                    ${files[fileKey] ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-300 group-hover:bg-blue-50/50'}
                `}>
                    {files[fileKey] ? (
                        <>
                            <IconFile />
                            <span className="text-xs font-bold text-blue-700 mt-2 px-2 text-center truncate w-full">
                                {files[fileKey].name}
                            </span>
                        </>
                    ) : (
                        <>
                            <IconUpload />
                            <span className="text-[10px] text-gray-400 font-bold mt-2">Click to Upload</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded border border-indigo-200">
                                Step 3 Entry
                            </span>
                            <span className="text-xs font-mono text-gray-400">{project.id}</span>
                        </div>
                        <h2 className="text-xl font-black text-gray-900">Submit Detailed Engineering</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 text-sm text-blue-800">
                        <strong>Instructions:</strong> Please upload the final, signed Detailed Engineering Design (DED) documents.
                        Once submitted, the project will be locked for <strong>BAFE Validation</strong>.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <UploadZone label="1. Detailed Plans & Profiles" fileKey="detailed_engineering" />
                        <UploadZone label="2. Quantity Take-Off (QTO)" fileKey="qto" />
                        <UploadZone label="3. Technical Specifications" fileKey="specs" />
                        <UploadZone label="4. Cost Estimates (Excel)" fileKey="cost_template" accept=".xlsx,.xls" />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-white transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? 'Uploading...' : 'Submit for Validation'}
                    </button>
                </div>
            </div>
        </div>
    );
}