import { useEffect, useState } from 'react';

export default function ViewProjectModal({ isOpen, onClose, project }) {
    if (!isOpen || !project) return null;

    // Helper for currency
    const formatMoney = (val) => {
        if (!val) return '₱ 0.00';
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
    };

    // Helper for file status
    const FileStatus = ({ label, file }) => (
        <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg bg-gray-50 mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
                <svg className={`w-4 h-4 flex-shrink-0 ${file ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className={`text-xs font-medium truncate ${file ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                    {label}
                </span>
            </div>
            {file && <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">Attached</span>}
        </div>
    );

    // Section Component
    const ViewSection = ({ letter, title, children }) => (
        <div className="mb-8 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                    {letter}
                </div>
                <h3 className="text-sm font-bold text-gray-900 uppercase">{title}</h3>
            </div>
            <div className="p-5 bg-white">
                {children}
            </div>
        </div>
    );

    const DataField = ({ label, value, highlight = false }) => (
        <div className="mb-4">
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</label>
            <div className={`text-sm break-words ${highlight ? 'font-bold text-blue-900' : 'text-gray-800'}`}>
                {value || <span className="text-gray-300 italic">Not provided</span>}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start bg-white rounded-t-xl z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                {project.status}
                            </span>
                            <span className="text-xs font-mono text-gray-500">{project.id}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">

                    {/* A. LOCATION */}
                    <ViewSection letter="A" title="Project Identification & Location">
                        <div className="grid grid-cols-2 gap-6">
                            <DataField label="Region" value={project.regionName} />
                            <DataField label="Province" value={project.provinceName} />
                            <DataField label="Municipalities" value={project.municipalities?.join(', ')} />
                            <DataField label="Barangays" value={project.barangays?.join(', ')} />
                            <div className="col-span-2 grid grid-cols-2 gap-4 bg-blue-50/50 p-3 rounded border border-blue-100">
                                <DataField label="GPS Start" value={project.gpsStart} />
                                <DataField label="GPS End" value={project.gpsEnd} />
                            </div>
                        </div>
                    </ViewSection>

                    {/* B. NETWORK */}
                    <ViewSection letter="B" title="Network & Connectivity">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <DataField label="Connectivity Function" value={project.connectivityFunction} highlight />
                            </div>
                            <DataField label="Facility Name" value={project.marketName} />
                            <DataField label="Facility Type" value={project.facilityType === 'Others' ? project.facilityTypeOther : project.facilityType} />
                            <DataField label="Distance to Facility" value={`${project.distanceToFacility} km`} />
                            <div className="col-span-2">
                                <FileStatus label="Location Map / GIS" file={project.attachments?.locationMap} />
                            </div>
                        </div>
                    </ViewSection>

                    {/* C. GEO & EQUITY */}
                    <ViewSection letter="C" title="Geographic & Equity Data">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-100 rounded border border-gray-200">
                                <DataField label="GIDA Classification" value={project.gidaClassification} highlight />
                            </div>
                            <div className="p-3 bg-gray-100 rounded border border-gray-200">
                                <DataField label="Poverty Incidence" value={project.povertyIncidence} highlight />
                            </div>
                        </div>
                    </ViewSection>

                    {/* D. BENEFICIARIES */}
                    <ViewSection letter="D" title="Beneficiaries & Impact">
                        <div className="grid grid-cols-2 gap-6">
                            <DataField label="Direct Beneficiaries" value={project.directBeneficiaries} />
                            <DataField label="Priority Tag" value={project.priorityTag} highlight />
                            <div className="col-span-2">
                                <DataField label="Commodities" value={project.commodities?.join(', ')} />
                            </div>
                            <div className="col-span-2">
                                <FileStatus label="MAO Cert / Registry" file={project.attachments?.beneficiaryCert} />
                            </div>
                        </div>
                    </ViewSection>

                    {/* E/F. READINESS */}
                    <ViewSection letter="E/F" title="Readiness & Resilience">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <DataField label="ROW Status" value={project.rowStatus} />
                            <DataField label="Surface Type" value={project.surfaceType} />
                            <DataField label="Resilience Function" value={project.resilienceFunction ? 'Yes (Evac/Access)' : 'None'} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <DataField label="Road Length" value={`${project.roadLength} km`} />
                            <DataField label="Road Width" value={`${project.roadWidth} m`} />
                        </div>
                        <div className="p-4 bg-green-50 border border-green-200 rounded flex justify-between items-center">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-green-800">Indicative Cost</label>
                                <div className="text-xl font-bold text-green-900">{formatMoney(project.indicativeCost)}</div>
                            </div>
                            <FileStatus label="Cost Template" file={project.attachments?.costTemplate} />
                        </div>
                        {project.resilienceFunction && (
                            <div className="mt-4">
                                <FileStatus label="LGU DRRM Certification" file={project.attachments?.resilienceCert} />
                            </div>
                        )}
                    </ViewSection>

                    {/* G. DOCS */}
                    <ViewSection letter="G" title="Declarations & LGU Support">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <DataField label="LGU Commitment" value={project.lguCommitment ? 'Yes, Endorsed' : 'No'} />
                                <FileStatus label="LGU Endorsement Letter" file={project.attachments?.lguEndorsement} />
                            </div>
                            <div>
                                <DataField label="Regional Certification" value={project.regionalCert ? 'Certified Complete' : 'Pending'} />
                                <DataField label="Digital Signature" value={project.digitalSignature} highlight />
                            </div>
                        </div>
                    </ViewSection>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 shadow-sm">
                        Close Viewer
                    </button>
                </div>
            </div>
        </div>
    );
}