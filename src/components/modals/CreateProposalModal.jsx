import { useState, useEffect } from 'react';
import MapPreview from '../MapPreview';
import { uploadToCloudinary } from '../../utils/cloudinary'; // <--- INTEGRATION 1: Import

// --- CONFIGURATION ---
const API_BASE_URL = 'https://psgc.gitlab.io/api';
const PRIORITY_COMMODITIES = ['Rice', 'Corn', 'High Value Crops', 'Livestock', 'Fisheries'];

export default function CreateProposalModal({ isOpen, onClose, onSubmit }) {
    // --- STATE ---
    const [sysInfo] = useState({
        fmrId: `FMR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        timestamp: new Date().toLocaleString(),
    });

    const [formData, setFormData] = useState({
        // A. ID & Location
        projectName: '',
        regionCode: '', regionName: '',
        provinceCode: '', provinceName: '',
        municipalityCodes: [], municipalities: [],
        barangayCodes: [], barangays: [],
        gpsStart: '', gpsEnd: '',

        // B. Network
        connectivityFunction: '',
        marketName: '',
        facilityType: '',
        facilityTypeOther: '',
        distanceToFacility: '',

        // C. Geo (Read Only)
        gidaClassification: 'Partial',
        povertyIncidence: '',

        // D. Beneficiaries
        directBeneficiaries: '',
        commodities: [],
        priorityTag: 'Non-priority',

        // E. Resilience
        disasterExposure: 'Not identified',
        resilienceFunction: false,

        // F. Readiness
        rowStatus: '',
        roadLength: '',
        roadWidth: '',
        surfaceType: '',
        indicativeCost: '',

        // G/H. LGU & Certs
        lguCommitment: false,
        regionalCert: false,
        digitalSignature: ''
    });

    const [locationOptions, setLocationOptions] = useState({
        regions: [], provinces: [], municipalities: [], barangays: []
    });

    const [isLoading, setIsLoading] = useState({
        regions: false, provinces: false, munis: false, barangays: false
    });

    const [displayCost, setDisplayCost] = useState('');
    const [attachments, setAttachments] = useState({});

    // --- INTEGRATION 2: Upload State ---
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState({});

    // --- STYLES HELPER ---
    const getInputClass = (fieldName) => {
        const baseClass = "w-full px-4 py-2 border rounded text-sm focus:outline-none focus:ring-2 transition-colors";
        if (errors[fieldName]) {
            return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50`;
        }
        return `${baseClass} border-gray-300 focus:ring-blue-700 focus:border-blue-700`;
    };

    const getFileClass = (fieldName, isGreen = false) => {
        const baseBorder = isGreen ? "border-green-300" : "border-gray-300";
        const errorBorder = "border-red-500 bg-red-50";
        const buttonColor = isGreen ? "file:bg-green-700" : "file:bg-blue-700";

        return `block w-full text-sm text-gray-500 border rounded-lg cursor-pointer focus:outline-none focus:ring-1 
        ${errors[fieldName] ? errorBorder : `${baseBorder} ${isGreen ? 'bg-white' : 'bg-gray-50'}`}
        file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold 
        ${buttonColor} file:text-white hover:file:opacity-90 transition-colors`;
    };

    const getPriorityColor = (tag) => {
        if (tag === 'National Priority') return 'bg-green-50 border-green-200 text-green-700';
        if (tag === 'Regional Priority') return 'bg-blue-50 border-blue-200 text-blue-700';
        return 'bg-gray-50 border-gray-200 text-gray-500';
    };

    // --- API EFFECTS ---
    useEffect(() => {
        if (isOpen) fetchLocations('regions', `${API_BASE_URL}/regions`);
    }, [isOpen]);

    useEffect(() => {
        if (formData.regionCode) {
            setLocationOptions(prev => ({ ...prev, provinces: [], municipalities: [], barangays: [] }));
            setFormData(prev => ({ ...prev, provinceCode: '', municipalityCodes: [], municipalities: [], barangayCodes: [], barangays: [] }));
            fetchLocations('provinces', `${API_BASE_URL}/regions/${formData.regionCode}/provinces`);
        }
    }, [formData.regionCode]);

    useEffect(() => {
        if (formData.provinceCode) {
            setLocationOptions(prev => ({ ...prev, municipalities: [], barangays: [] }));
            setFormData(prev => ({ ...prev, municipalityCodes: [], municipalities: [], barangayCodes: [], barangays: [] }));
            fetchLocations('munis', `${API_BASE_URL}/provinces/${formData.provinceCode}/cities-municipalities`);

            const mockPovertyDB = { '056200000': 'High', '050500000': 'Medium' };
            setFormData(prev => ({
                ...prev,
                povertyIncidence: mockPovertyDB[formData.provinceCode] || 'Medium'
            }));
        }
    }, [formData.provinceCode]);

    useEffect(() => {
        const fetchBarangaysForSelection = async () => {
            if (formData.municipalityCodes.length === 0) {
                setLocationOptions(prev => ({ ...prev, barangays: [] }));
                return;
            }
            setIsLoading(prev => ({ ...prev, barangays: true }));
            try {
                const promises = formData.municipalityCodes.map(code =>
                    fetch(`${API_BASE_URL}/cities-municipalities/${code}/barangays`).then(res => res.json())
                );
                const results = await Promise.all(promises);
                const allBarangays = results.flat().sort((a, b) => a.name.localeCompare(b.name));
                setLocationOptions(prev => ({ ...prev, barangays: allBarangays }));
            } catch (error) {
                console.error("Failed to fetch barangays", error);
            } finally {
                setIsLoading(prev => ({ ...prev, barangays: false }));
            }
        };
        fetchBarangaysForSelection();
    }, [formData.municipalityCodes]);

    // --- HANDLERS ---
    const fetchLocations = async (type, url) => {
        setIsLoading(prev => ({ ...prev, [type]: true }));
        try {
            const res = await fetch(url);
            const data = await res.json();
            const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
            if (type === 'munis') setLocationOptions(prev => ({ ...prev, municipalities: sorted }));
            else if (type === 'provinces') setLocationOptions(prev => ({ ...prev, provinces: sorted }));
            else if (type === 'regions') setLocationOptions(prev => ({ ...prev, regions: sorted }));
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
        } finally {
            setIsLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));

        if (e.target.tagName === 'SELECT') {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const text = selectedOption.text;
            if (name === 'regionCode') {
                setFormData(prev => ({ ...prev, regionCode: value, regionName: text }));
                return;
            }
            if (name === 'provinceCode') {
                setFormData(prev => ({ ...prev, provinceCode: value, provinceName: text }));
                return;
            }
        }
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const toggleLocation = (type, code, name) => {
        const codeKey = type === 'municipality' ? 'municipalityCodes' : 'barangayCodes';
        if (errors[codeKey]) setErrors(prev => ({ ...prev, [codeKey]: false }));

        setFormData(prev => {
            const nameKey = type === 'municipality' ? 'municipalities' : 'barangays';
            const currentCodes = prev[codeKey];
            const currentNames = prev[nameKey];

            if (currentCodes.includes(code)) {
                return {
                    ...prev,
                    [codeKey]: currentCodes.filter(c => c !== code),
                    [nameKey]: currentNames.filter(n => n !== name)
                };
            } else {
                return {
                    ...prev,
                    [codeKey]: [...currentCodes, code],
                    [nameKey]: [...currentNames, name]
                };
            }
        });
    };

    const toggleCommodity = (value) => {
        if (errors.commodities) setErrors(prev => ({ ...prev, commodities: false }));
        setFormData(prev => {
            const current = prev.commodities;
            if (current.includes(value)) {
                return { ...prev, commodities: current.filter(c => c !== value) };
            } else {
                return { ...prev, commodities: [...current, value] };
            }
        });
    };

    useEffect(() => {
        if (formData.commodities.length > 0) {
            const isNational = formData.commodities.some(c => ['Rice', 'Corn'].includes(c));
            setFormData(prev => ({
                ...prev,
                priorityTag: isNational ? 'National Priority' : 'Regional Priority'
            }));
        } else {
            setFormData(prev => ({ ...prev, priorityTag: 'Non-priority' }));
        }
    }, [formData.commodities]);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files.length > 0) {
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));
            setAttachments({ ...attachments, [name]: files[0] });
        }
    };

    const handleCostChange = (e) => {
        const val = e.target.value.replace(/[^\d.]/g, '');
        if (errors.indicativeCost) setErrors(prev => ({ ...prev, indicativeCost: false }));
        setFormData({ ...formData, indicativeCost: val });
        setDisplayCost(val);
    };

    const handleCostBlur = () => {
        if (formData.indicativeCost) {
            setDisplayCost(new Intl.NumberFormat('en-PH', {
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(parseFloat(formData.indicativeCost)));
        }
    };

    // --- VALIDATION FUNCTION ---
    const validateForm = () => {
        const newErrors = {};
        if (!formData.projectName) newErrors.projectName = true;
        if (!formData.regionCode) newErrors.regionCode = true;
        if (!formData.provinceCode) newErrors.provinceCode = true;
        if (formData.municipalityCodes.length === 0) newErrors.municipalityCodes = true;
        if (formData.barangayCodes.length === 0) newErrors.barangayCodes = true;
        if (!formData.connectivityFunction) newErrors.connectivityFunction = true;
        if (!formData.marketName) newErrors.marketName = true;
        if (!formData.facilityType) newErrors.facilityType = true;
        if (formData.facilityType === 'Others' && !formData.facilityTypeOther) newErrors.facilityTypeOther = true;
        if (!formData.distanceToFacility) newErrors.distanceToFacility = true;
        if (!formData.directBeneficiaries) newErrors.directBeneficiaries = true;
        if (formData.commodities.length === 0) newErrors.commodities = true;
        if (!formData.rowStatus) newErrors.rowStatus = true;
        if (!formData.surfaceType) newErrors.surfaceType = true;
        if (!formData.roadLength) newErrors.roadLength = true;
        if (!formData.roadWidth) newErrors.roadWidth = true;
        if (!formData.indicativeCost) newErrors.indicativeCost = true;
        if (!formData.lguCommitment) newErrors.lguCommitment = true;
        if (!formData.regionalCert) newErrors.regionalCert = true;
        if (!formData.digitalSignature) newErrors.digitalSignature = true;

        if (!attachments.locationMap) newErrors.locationMap = true;
        if (!attachments.beneficiaryCert) newErrors.beneficiaryCert = true;
        if (!attachments.costTemplate) newErrors.costTemplate = true;
        if (!attachments.lguEndorsement) newErrors.lguEndorsement = true;
        if (formData.resilienceFunction && !attachments.resilienceCert) newErrors.resilienceCert = true;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- INTEGRATION 3: UPDATED SUBMIT HANDLER ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert("Please fill in all required fields marked in red.");
            return;
        }

        // START UPLOAD PROCESS
        setIsUploading(true);

        try {
            // 1. Upload files to Cloudinary in parallel
            const uploadedAttachments = {};
            const uploadPromises = Object.entries(attachments).map(async ([key, file]) => {
                if (file) {
                    try {
                        const result = await uploadToCloudinary(file);
                        // Save object with name AND url
                        uploadedAttachments[key] = {
                            name: result.name,
                            url: result.url
                        };
                    } catch (err) {
                        console.error(`Failed to upload ${key}`, err);
                        // Fallback: save just name if upload fails, or throw error
                        throw new Error(`Failed to upload ${key}: ${err.message}`);
                    }
                }
            });

            await Promise.all(uploadPromises);

            // 2. Create Project Object with Cloudinary URLs
            const newProject = {
                id: sysInfo.fmrId,
                name: formData.projectName,
                location: `${formData.municipalities.join(', ')}, ${formData.provinceName}`,
                cost: formData.indicativeCost,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                status: 'PENDING_REVIEW', // Default Status

                // Add Scorer Defaults
                nep_status: 'Scored',
                gaa_status: 'GAA-Considered',

                ...formData,
                attachments: uploadedAttachments // <--- Contains { name, url }
            };

            // 3. Save to Database
            onSubmit(newProject);
            onClose();

        } catch (error) {
            alert("Error submitting proposal: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />

            {/* --- INTEGRATION 4: UPLOAD OVERLAY --- */}
            {isUploading && (
                <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold text-blue-900">Uploading Documents...</h3>
                    <p className="text-sm text-gray-600">Please wait while we secure your files to the cloud.</p>
                </div>
            )}

            <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 pointer-events-none">
                <div className="bg-gray-50 rounded-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto pointer-events-auto shadow-2xl relative">

                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center z-20 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Create New Project Proposal</h2>
                            <p className="text-sm text-gray-500 mt-1">Step 1: Intake & Eligibility Data Capture</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project ID</div>
                            <div className="text-lg font-mono font-bold text-blue-700">{sysInfo.fmrId}</div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-8">

                        {/* SECTION A */}
                        <SectionCard letter="A" title="Project Identification & Location">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title <span className="text-red-600">*</span></label>
                                <input type="text" name="projectName" value={formData.projectName} onChange={handleChange}
                                    placeholder="e.g., Concreting of Brgy. Kapuy Farm Road"
                                    className={getInputClass('projectName')} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Region <span className="text-red-600">*</span> {isLoading.regions && <span className="ml-2 text-xs text-blue-600">Loading...</span>}</label>
                                    <select name="regionCode" value={formData.regionCode} onChange={handleChange}
                                        className={getInputClass('regionCode')}>
                                        <option value="">Select Region</option>
                                        {locationOptions.regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Province <span className="text-red-600">*</span> {isLoading.provinces && <span className="ml-2 text-xs text-blue-600">Loading...</span>}</label>
                                    <select name="provinceCode" value={formData.provinceCode} onChange={handleChange} disabled={!formData.regionCode}
                                        className={getInputClass('provinceCode')}>
                                        <option value="">Select Province</option>
                                        {locationOptions.provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Municipality List */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Municipality (Select Multiple) <span className="text-red-600">*</span>
                                        {isLoading.munis && <span className="ml-2 text-xs text-blue-600">Loading...</span>}
                                    </label>
                                    <div className={`w-full border rounded-lg p-2 h-40 overflow-y-auto ${errors.municipalityCodes ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}>
                                        {!formData.provinceCode ? (
                                            <p className="text-xs text-gray-400 p-2">Select a province first</p>
                                        ) : (
                                            <div className="space-y-1">
                                                {locationOptions.municipalities.map(m => (
                                                    <label key={m.code} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                                        <input type="checkbox"
                                                            checked={formData.municipalityCodes.includes(m.code)}
                                                            onChange={() => toggleLocation('municipality', m.code, m.name)}
                                                            className="w-4 h-4 text-blue-700 border-gray-300 rounded focus:ring-blue-700" />
                                                        <span className="text-sm text-gray-700">{m.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5 font-medium">{formData.municipalities.length} municipality(ies) selected</p>
                                </div>

                                {/* Barangay List */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Barangay (Select Multiple) <span className="text-red-600">*</span>
                                        {isLoading.barangays && <span className="ml-2 text-xs text-blue-600">Loading...</span>}
                                    </label>
                                    <div className={`w-full border rounded-lg p-2 h-40 overflow-y-auto ${errors.barangayCodes ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}>
                                        {formData.municipalityCodes.length === 0 ? (
                                            <p className="text-xs text-gray-400 p-2">Select a municipality first</p>
                                        ) : (
                                            <div className="space-y-1">
                                                {locationOptions.barangays.map(b => (
                                                    <label key={b.code} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                                        <input type="checkbox"
                                                            checked={formData.barangayCodes.includes(b.code)}
                                                            onChange={() => toggleLocation('barangay', b.code, b.name)}
                                                            className="w-4 h-4 text-blue-700 border-gray-300 rounded focus:ring-blue-700" />
                                                        <span className="text-sm text-gray-700">{b.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5 font-medium">{formData.barangays.length} barangay(s) selected</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GPS Start Point</label>
                                    <input type="text" name="gpsStart" value={formData.gpsStart} onChange={handleChange} placeholder="Lat, Long" className={getInputClass('gpsStart')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GPS End Point</label>
                                    <input type="text" name="gpsEnd" value={formData.gpsEnd} onChange={handleChange} placeholder="Lat, Long" className={getInputClass('gpsEnd')} />
                                </div>
                            </div>
                            <MapPreview startCoords={formData.gpsStart} endCoords={formData.gpsEnd} />
                        </SectionCard>


                        {/* SECTION B */}
                        <SectionCard letter="B" title="Network & Connectivity Data">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Connectivity Function <span className="text-red-600">*</span></label>
                                <select name="connectivityFunction" value={formData.connectivityFunction} onChange={handleChange}
                                    className={getInputClass('connectivityFunction')}>
                                    <option value="">Select Function</option>
                                    <option value="Dead-end access road">Dead-end access road</option>
                                    <option value="Connects to barangay road">Connects to barangay road</option>
                                    <option value="Connects to municipal road">Connects to municipal road</option>
                                    <option value="Connects to provincial road">Connects to provincial road</option>
                                    <option value="Connects to national highway">Connects to national highway</option>
                                </select>
                            </div>
                            <div className={`p-4 rounded-lg border ${errors.locationMap ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Required Upload: Location Map / GIS Screenshot <span className="text-red-600">*</span></label>
                                <input type="file" name="locationMap" onChange={handleFileChange} accept="image/*,.pdf"
                                    className={getFileClass('locationMap')} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nearest Facility Name</label>
                                    <input type="text" name="marketName" value={formData.marketName} onChange={handleChange} className={getInputClass('marketName')} />
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
                                    <select name="facilityType" value={formData.facilityType} onChange={handleChange} className={getInputClass('facilityType')}>
                                        <option value="">Select...</option>
                                        <option value="Trading Post">Trading Post</option>
                                        <option value="Consolidation Center">Consolidation Center</option>
                                        <option value="Farm Gate">Farm Gate</option>
                                        <option value="Port / Fish Landing">Port / Fish Landing</option>
                                        <option value="Processing Facility">Processing Facility</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    {formData.facilityType === 'Others' && (
                                        <input type="text" name="facilityTypeOther" value={formData.facilityTypeOther} onChange={handleChange} placeholder="Please specify..."
                                            className={`${getInputClass('facilityTypeOther')} mt-2 animate-fadeIn`} />
                                    )}
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                                    <input type="number" name="distanceToFacility" value={formData.distanceToFacility} onChange={handleChange} className={getInputClass('distanceToFacility')} />
                                </div>
                            </div>
                        </SectionCard>


                        {/* SECTION C */}
                        <SectionCard letter="C" title="Geographic & Equity (System-Generated)">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">C1. GIDA Classification</label>
                                    <input type="text" readOnly value={formData.gidaClassification} className="bg-transparent font-medium text-gray-900 text-base focus:outline-none w-full" />
                                </div>
                                <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">C2. Poverty Incidence</label>
                                    <input type="text" readOnly value={formData.povertyIncidence || '---'} className={`bg-transparent font-bold text-base focus:outline-none w-full ${formData.povertyIncidence === 'High' ? 'text-red-600' : 'text-gray-900'}`} />
                                    <p className="text-[10px] text-gray-500 mt-1">Based on PSA Data for selected Province</p>
                                </div>
                            </div>
                        </SectionCard>


                        {/* SECTION D */}
                        <SectionCard letter="D" title="Beneficiaries & Impact">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Direct Beneficiaries (Count) <span className="text-red-600">*</span></label>
                                    <input type="number" name="directBeneficiaries" value={formData.directBeneficiaries} onChange={handleChange} className={getInputClass('directBeneficiaries')} />
                                </div>

                                {/* Commodity List */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Commodities (Select all that apply) <span className="text-red-600">*</span></label>
                                    <div className={`w-full border rounded-lg p-2 h-32 overflow-y-auto ${errors.commodities ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}>
                                        <div className="space-y-1">
                                            {PRIORITY_COMMODITIES.map(c => (
                                                <label key={c} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                                    <input type="checkbox"
                                                        checked={formData.commodities.includes(c)}
                                                        onChange={() => toggleCommodity(c)}
                                                        className="w-4 h-4 text-blue-700 border-gray-300 rounded focus:ring-blue-700" />
                                                    <span className="text-sm text-gray-700">{c}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5 font-medium">{formData.commodities.length} selected</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Required: MAO Cert / Registry Extract <span className="text-red-600">*</span></label>
                                    <input type="file" name="beneficiaryCert" onChange={handleFileChange} className={getFileClass('beneficiaryCert')} />
                                </div>
                                <div className={`p-4 rounded-lg border w-full sm:w-auto min-w-[200px] ${getPriorityColor(formData.priorityTag)}`}>
                                    <label className="block text-xs font-bold opacity-70 mb-1 uppercase">System Tag</label>
                                    <span className="font-bold text-lg">{formData.priorityTag}</span>
                                </div>
                            </div>
                        </SectionCard>


                        {/* SECTION E/F */}
                        <SectionCard letter="E/F" title="Project Readiness & Resilience">
                            <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-lg mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <input type="checkbox" name="resilienceFunction" id="resilience" checked={formData.resilienceFunction} onChange={handleChange} className="w-5 h-5 text-blue-700 border-gray-300 rounded focus:ring-blue-700" />
                                    <label htmlFor="resilience" className="text-sm font-bold text-gray-900 cursor-pointer">Road serves disaster response / evacuation / access continuity</label>
                                </div>
                                {formData.resilienceFunction && (
                                    <div className="ml-8 mt-3 animate-fadeIn">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Required: LGU DRRM Certification <span className="text-red-600">*</span></label>
                                        <input type="file" name="resilienceCert" onChange={handleFileChange} className={getFileClass('resilienceCert')} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ROW Status <span className="text-red-600">*</span></label>
                                    <select name="rowStatus" value={formData.rowStatus} onChange={handleChange} className={getInputClass('rowStatus')}>
                                        <option value="">Select Status</option>
                                        <option value="No ROW required">No ROW required</option>
                                        <option value="ROW fully cleared">ROW fully cleared</option>
                                        <option value="ROW partially cleared">ROW partially cleared</option>
                                        <option value="ROW not cleared">ROW not cleared</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Surface Type <span className="text-red-600">*</span></label>
                                    <select name="surfaceType" value={formData.surfaceType} onChange={handleChange} className={getInputClass('surfaceType')}>
                                        <option value="">Select Surface</option>
                                        <option value="Concrete">Concrete</option>
                                        <option value="Asphalt">Asphalt</option>
                                        <option value="Gravel">Gravel</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Road Length (km) <span className="text-red-600">*</span></label>
                                    <input type="number" name="roadLength" value={formData.roadLength} onChange={handleChange} className={getInputClass('roadLength')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Road Width (m) <span className="text-red-600">*</span></label>
                                    <input type="number" name="roadWidth" value={formData.roadWidth} onChange={handleChange} className={getInputClass('roadWidth')} />
                                </div>
                            </div>

                            <div className={`p-5 border rounded-lg mt-6 ${errors.indicativeCost || errors.costTemplate ? 'bg-red-50 border-red-200' : 'bg-green-50/80 border-green-200'}`}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block text-sm font-bold mb-1 ${errors.indicativeCost ? 'text-red-800' : 'text-green-900'}`}>Indicative Cost (PHP) <span className="text-red-600">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-sm text-gray-600 font-bold">₱</span>
                                            <input type="text" name="indicativeCost" value={displayCost} onChange={handleCostChange} onBlur={handleCostBlur}
                                                className={`w-full pl-8 px-4 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${errors.indicativeCost ? 'border-red-500 focus:ring-red-500' : 'border-green-300 focus:ring-green-600'}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-bold mb-1 ${errors.costTemplate ? 'text-red-800' : 'text-green-900'}`}>Required: Cost Template (Excel/PDF) <span className="text-red-600">*</span></label>
                                        <input type="file" name="costTemplate" onChange={handleFileChange} className={getFileClass('costTemplate', true)} />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>


                        {/* SECTION G */}
                        <SectionCard letter="G" title="Declarations & Certification">
                            <div className="space-y-6">
                                <div className={`flex items-start gap-4 p-4 border rounded-lg ${errors.lguCommitment || errors.lguEndorsement ? 'bg-red-50 border-red-200' : 'bg-gray-50/50 border-gray-200'}`}>
                                    <input type="checkbox" name="lguCommitment" id="lguCom" checked={formData.lguCommitment} onChange={handleChange}
                                        className={`w-5 h-5 mt-1 border-gray-300 rounded focus:ring-blue-700 ${errors.lguCommitment ? 'ring-2 ring-red-500' : 'text-blue-700'}`} />
                                    <div className="w-full">
                                        <label htmlFor="lguCom" className={`text-base font-bold ${errors.lguCommitment ? 'text-red-700' : 'text-gray-900'}`}>LGU Endorsement & Commitment</label>
                                        <p className="text-sm text-gray-600 mb-4">The LGU commits to implementation coordination (non-financial).</p>
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Required: Council Resolution or Endorsement <span className="text-red-600">*</span></label>
                                        <input type="file" name="lguEndorsement" onChange={handleFileChange} className={getFileClass('lguEndorsement')} />
                                    </div>
                                </div>

                                <div className={`flex items-start gap-4 p-6 border rounded-lg ${errors.regionalCert || errors.digitalSignature ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                                    <input type="checkbox" name="regionalCert" id="regCert" checked={formData.regionalCert} onChange={handleChange}
                                        className={`w-5 h-5 mt-1 border-gray-300 rounded focus:ring-blue-700 ${errors.regionalCert ? 'ring-2 ring-red-500' : 'text-blue-700'}`} />
                                    <div className="w-full">
                                        <label htmlFor="regCert" className={`text-base font-bold ${errors.regionalCert ? 'text-red-700' : 'text-gray-900'}`}>Regional Certification</label>
                                        <p className="text-sm text-gray-600 italic mb-4">"Data submitted is complete and accurate to the best of our knowledge."</p>
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Digital Signature</label>
                                        <input type="text" name="digitalSignature" value={formData.digitalSignature} onChange={handleChange} placeholder="Type Full Name of RO Head/Representative"
                                            className={getInputClass('digitalSignature')} />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Footer */}
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 sticky bottom-0 bg-white pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                            <button type="button" onClick={onClose} disabled={isUploading} className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button type="submit" disabled={isUploading} className="w-full sm:w-auto px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-700/20 disabled:opacity-50 disabled:cursor-wait">
                                {isUploading ? 'Uploading & Saving...' : 'Submit Proposal'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

// --- OUTSIDE COMPONENT ---
const SectionCard = ({ letter, title, children }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-sm shadow-sm">
                {letter}
            </div>
            <h3 className="text-gray-900 font-bold text-base uppercase tracking-tight">{title}</h3>
        </div>
        <div className="p-6 space-y-6">
            {children}
        </div>
    </div>
);