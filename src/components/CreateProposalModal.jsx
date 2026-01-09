import { useState } from 'react';
import MapPreview from './MapPreview';

export default function CreateProposalModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        projectName: '',
        region: '',
        province: '',
        municipality: '',
        barangay: '',
        roadLength: '',
        gpsStart: '',
        gpsEnd: '',
        beneficiaryArea: '',
        commodity: '',
        problemStatement: '',
        connectionNodes: '',
        rightOfWay: '',
        environmentalConstraint: '',
    });

    const [attachments, setAttachments] = useState({
        endorsementLetter: null,
        mapSketch: null,
        photos: null,
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setAttachments({
            ...attachments,
            [e.target.name]: e.target.files[0]
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newProject = {
            id: `PROJ-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
            name: formData.projectName,
            location: `${formData.municipality}, ${formData.province}`,
            cost: 'TBD',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            status: 'PENDING_REVIEW',
            step: 1,
            ...formData,
            attachments
        };

        onSubmit(newProject);

        setFormData({
            projectName: '',
            region: '',
            province: '',
            municipality: '',
            barangay: '',
            roadLength: '',
            gpsStart: '',
            gpsEnd: '',
            beneficiaryArea: '',
            commodity: '',
            problemStatement: '',
            connectionNodes: '',
            rightOfWay: '',
            environmentalConstraint: '',
        });
        setAttachments({
            endorsementLetter: null,
            mapSketch: null,
            photos: null,
        });
        onClose();
    };

    if (!isOpen) return null;

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

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 pointer-events-none">
                <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl">

                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-start sm:items-center rounded-t-lg z-10">
                        <div className="flex-1">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create New Project Proposal</h2>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">Step 1: Project Identification & Planning</p>
                        </div>
                        <button
                            onClick={onClose}
                            type="button"
                            className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl font-light leading-none ml-2"
                        >
                            ×
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">

                        {/* Project Information */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4 uppercase">Project Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        Project Name / Road Segment <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="projectName"
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., Concreting of Brgy. Kapuy Farm Road"
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Region <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            name="region"
                                            value={formData.region}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                        >
                                            <option value="">Select Region</option>
                                            <option value="Region I">Region I - Ilocos Region</option>
                                            <option value="Region II">Region II - Cagayan Valley</option>
                                            <option value="Region III">Region III - Central Luzon</option>
                                            <option value="Region IV-A">Region IV-A - CALABARZON</option>
                                            <option value="Region V">Region V - Bicol Region</option>
                                            <option value="NCR">NCR - National Capital Region</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Province <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="province"
                                            value={formData.province}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., Ilocos Sur"
                                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Municipality <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="municipality"
                                            value={formData.municipality}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., Vigan City"
                                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Barangay <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="barangay"
                                            value={formData.barangay}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., Kapuy"
                                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        Road Length (km) <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="roadLength"
                                        value={formData.roadLength}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., 2.5"
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* GPS Coordinates with Map Preview */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4 uppercase">GPS Coordinates & Location</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            GPS Start Point
                                        </label>
                                        <input
                                            type="text"
                                            name="gpsStart"
                                            value={formData.gpsStart}
                                            onChange={handleChange}
                                            placeholder="e.g., 17.5747, 120.3869"
                                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                        />
                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Format: latitude, longitude</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            GPS End Point
                                        </label>
                                        <input
                                            type="text"
                                            name="gpsEnd"
                                            value={formData.gpsEnd}
                                            onChange={handleChange}
                                            placeholder="e.g., 17.5850, 120.3920"
                                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                        />
                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Format: latitude, longitude</p>
                                    </div>
                                </div>

                                {/* Map Preview */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                        Location Preview
                                    </label>
                                    <MapPreview
                                        startCoords={formData.gpsStart}
                                        endCoords={formData.gpsEnd}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Project Details */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4 uppercase">Project Details</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Beneficiary Area/Commodity <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="beneficiaryArea"
                                            value={formData.beneficiaryArea}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g., Rice farming area"
                                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Primary Commodity
                                        </label>
                                        <select
                                            name="commodity"
                                            value={formData.commodity}
                                            onChange={handleChange}
                                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                        >
                                            <option value="">Select commodity</option>
                                            <option value="Rice">Rice</option>
                                            <option value="Corn">Corn</option>
                                            <option value="Vegetables">Vegetables</option>
                                            <option value="Fruits">Fruits</option>
                                            <option value="Livestock">Livestock</option>
                                            <option value="Fisheries">Fisheries</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        Problem Statement <span className="text-red-600">*</span>
                                    </label>
                                    <textarea
                                        name="problemStatement"
                                        value={formData.problemStatement}
                                        onChange={handleChange}
                                        required
                                        rows="3"
                                        placeholder="Why is this project needed? What problem does it solve?"
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        Proposed Connection Nodes <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="connectionNodes"
                                        value={formData.connectionNodes}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., Farm cluster to National Highway"
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Right-of-Way Constraints <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            name="rightOfWay"
                                            value={formData.rightOfWay}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                        >
                                            <option value="">Select</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                            <option value="unknown">Unknown</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            Environmental Constraints <span className="text-red-600">*</span>
                                        </label>
                                        <select
                                            name="environmentalConstraint"
                                            value={formData.environmentalConstraint}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                                        >
                                            <option value="">Select</option>
                                            <option value="yes">Yes</option>
                                            <option value="no">No</option>
                                            <option value="unknown">Unknown</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attachments */}
                        <div>
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4 uppercase">Required Attachments</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        LGU Endorsement Letter
                                    </label>
                                    <input
                                        type="file"
                                        name="endorsementLetter"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx"
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        Map Sketch or GIS Screenshot
                                    </label>
                                    <input
                                        type="file"
                                        name="mapSketch"
                                        onChange={handleFileChange}
                                        accept="image/*,.pdf"
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        Site Photos
                                    </label>
                                    <input
                                        type="file"
                                        name="photos"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        multiple
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-900 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs sm:text-sm font-semibold transition-colors"
                            >
                                Submit Proposal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
