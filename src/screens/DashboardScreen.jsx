import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatsGrid from '../components/StatsGrid';
import ProjectsTable from '../components/ProjectsTable';
import CreateProposalModal from '../components/modals/CreateProposalModal';
import ViewProjectModal from '../components/modals/ViewProjectModal';
import EditProposalModal from '../components/modals/EditProposalModal';

// --- REVIEW & PROCESS MODALS ---
import ReviewProjectModal from '../components/modals/ReviewProjectModal'; // Step 1
import Step2ScoringModal from '../components/modals/Step2ScoringModal';   // Step 2
import Step3UploadModal from '../components/modals/Step3UploadModal';     // Step 3 (RO Upload) <--- NEW
import Step3ValidationModal from '../components/modals/Step3ValidationModal'; // Step 3 (BAFE Validate)
import Step4BiddingModal from '../components/modals/Step4BiddingModal';   // Step 4 (Procurement)

export default function DashboardScreen({ projects, onCreate, onUpdate, onLogout, userRole }) {
    const [activeTab, setActiveTab] = useState(userRole === 'ro' ? 'dashboard' : 'queue');

    // --- MODAL STATES ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Process Modals
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false);
    const [isStep3UploadOpen, setIsStep3UploadOpen] = useState(false); // <--- NEW STATE

    const [selectedProject, setSelectedProject] = useState(null);
    const [projectsList, setProjectsList] = useState([]);

    useEffect(() => { setProjectsList(projects); }, [projects]);

    // --- HANDLERS ---
    const handleCreateProject = (data) => { onCreate(data); setIsCreateModalOpen(false); };
    const handleEditSubmit = (data) => { onUpdate(data); setIsEditModalOpen(false); setSelectedProject(null); };

    // Generic decision handler
    const handleDecisionSubmit = (data) => {
        onUpdate(data);
        setIsReviewModalOpen(false);
        setIsBiddingModalOpen(false);
        setIsStep3UploadOpen(false); // Close upload modal if open
        setSelectedProject(null);
    };

    // --- CLICK LOGIC ---
    const handleProjectClick = (project) => {
        setSelectedProject(project);

        if (userRole === 'ro') {
            // FIX: Allow Upload Modal for SCORED and NEP-INCLUDED too
            // This aligns with your Table's "Submit Detailed Engineering" button
            if (['GAA-INCLUDED', 'SCORED', 'NEP-INCLUDED'].includes(project.status)) {
                setIsStep3UploadOpen(true);
            }
            // Handle Returned Projects (Step 1 or Step 3 corrections)
            else if (project.status === 'step3_pending' || project.status === 'RETURNED') {
                setIsEditModalOpen(true);
            }
            // IF IN STEP 4 -> OPEN BIDDING MANAGEMENT
            else if (project.status === 'step4_bidding' || (project.status && project.status.startsWith('STEP4_'))) {
                setIsBiddingModalOpen(true);
            }
            else {
                setIsViewModalOpen(true);
            }
        }
        else if (userRole === 'bafe') {
            // STEP 4 GATES or VALIDATION
            if (project.status === 'step4_bidding' || project.status.startsWith('STEP4_')) {
                setIsBiddingModalOpen(true);
            } else {
                setIsReviewModalOpen(true);
            }
        }
        else {
            setIsReviewModalOpen(true);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} userRole={userRole} />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{activeTab === 'dashboard' ? 'Project Dashboard' : 'Review Queue'}</h1>
                        <p className="text-gray-500 text-sm mt-1">{userRole === 'ro' ? 'Manage proposals' : 'Pending items'}</p>
                    </div>
                    {userRole === 'ro' && <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium">New Proposal</button>}
                </header>

                <StatsGrid projects={projectsList} userRole={userRole} />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                    <ProjectsTable
                        projects={projectsList}
                        userRole={userRole}
                        onViewProject={handleProjectClick}
                        onReviewProject={handleProjectClick}
                        onUpdateProject={onUpdate}
                    />
                </div>
            </main>

            {/* --- MODALS --- */}
            {userRole === 'ro' && (
                <>
                    <CreateProposalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateProject} />
                    <ViewProjectModal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedProject(null); }} project={selectedProject} />
                    <EditProposalModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedProject(null); }} project={selectedProject} onSubmit={handleEditSubmit} />
                    {/* NEW: Step 3 Upload */}
                    <Step3UploadModal isOpen={isStep3UploadOpen} onClose={() => { setIsStep3UploadOpen(false); setSelectedProject(null); }} project={selectedProject} onSubmit={handleDecisionSubmit} />
                    {/* RO also accesses Step 4 to manage bidding */}
                    <Step4BiddingModal isOpen={isBiddingModalOpen} onClose={() => { setIsBiddingModalOpen(false); setSelectedProject(null); }} project={selectedProject} onAward={handleDecisionSubmit} />
                </>
            )}

            {userRole === 'validator' && <ReviewProjectModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} project={selectedProject} onDecision={handleDecisionSubmit} />}
            {userRole === 'scorer' && <Step2ScoringModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} project={selectedProject} onSubmitScore={handleDecisionSubmit} />}

            {userRole === 'bafe' && (
                <>
                    <Step3ValidationModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} project={selectedProject} onValidate={handleDecisionSubmit} />
                    <Step4BiddingModal isOpen={isBiddingModalOpen} onClose={() => setIsBiddingModalOpen(false)} project={selectedProject} onAward={handleDecisionSubmit} />
                </>
            )}
        </div>
    );
}