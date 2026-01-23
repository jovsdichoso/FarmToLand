import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatsGrid from '../components/StatsGrid';
import ProjectsTable from '../components/ProjectsTable';
import CreateProposalModal from '../components/modals/CreateProposalModal';
import ViewProjectModal from '../components/modals/ViewProjectModal';
import EditProposalModal from '../components/modals/EditProposalModal';

// --- IMPORT ALL REVIEW MODALS ---
import ReviewProjectModal from '../components/modals/ReviewProjectModal'; // Step 1: Validator
import Step2ScoringModal from '../components/modals/Step2ScoringModal';   // Step 2: Scorer
import Step3ValidationModal from '../components/modals/Step3ValidationModal'; // Step 3: BAFE (Design)
import Step4BiddingModal from '../components/modals/Step4BiddingModal';   // Step 4: BAFE (Bidding) <--- NEW IMPORT

export default function DashboardScreen({
    projects,       // DATA from App.jsx
    onCreate,       // DB Function from App.jsx
    onUpdate,       // DB Function from App.jsx
    onLogout,
    userRole
}) {
    const [activeTab, setActiveTab] = useState(userRole === 'ro' ? 'dashboard' : 'queue');

    // --- MODAL STATES ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Review Modals
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // Used for Steps 1, 2, 3
    const [isBiddingModalOpen, setIsBiddingModalOpen] = useState(false); // Used for Step 4 <--- NEW STATE

    const [selectedProject, setSelectedProject] = useState(null);
    const [projectsList, setProjectsList] = useState([]);

    // --- SYNC WITH DB ---
    useEffect(() => {
        setProjectsList(projects);
    }, [projects]);

    // --- HANDLERS ---
    const handleCreateProject = (projectData) => {
        onCreate(projectData);
        setIsCreateModalOpen(false);
    };

    const handleEditSubmit = (updatedProject) => {
        onUpdate(updatedProject);
        setIsEditModalOpen(false);
        setSelectedProject(null);
    };

    const handleValidatorDecision = (decision) => {
        onUpdate(decision);
        setIsReviewModalOpen(false);
        setSelectedProject(null);
    };

    const handleScoreSubmit = (scoredProject) => {
        onUpdate(scoredProject);
        setIsReviewModalOpen(false);
        setSelectedProject(null);
    };

    const handleStep3Validation = (validatedProject) => {
        onUpdate(validatedProject);
        setIsReviewModalOpen(false);
        setSelectedProject(null);
    };

    // --- NEW: STEP 4 HANDLER ---
    const handleAwardSubmit = (awardedProject) => {
        onUpdate(awardedProject);
        setIsBiddingModalOpen(false);
        setSelectedProject(null);
    };

    // --- CLICK LOGIC (ROUTING TO CORRECT MODAL) ---
    const handleProjectClick = (project) => {
        setSelectedProject(project);

        if (userRole === 'ro') {
            // RO: Open Edit if Returned, otherwise View
            if (project.status === 'step3_pending' || project.status === 'RETURNED') {
                setIsEditModalOpen(true);
            } else {
                setIsViewModalOpen(true);
            }
        }
        else if (userRole === 'bafe') {
            // BAFE: Decide between Step 3 (Design) and Step 4 (Bidding)
            if (project.status === 'step4_bidding') {
                setIsBiddingModalOpen(true); // Open Step 4
            } else {
                setIsReviewModalOpen(true);  // Open Step 3 (Default)
            }
        }
        else {
            // VALIDATOR & SCORER: Always use standard review modal
            setIsReviewModalOpen(true);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                userRole={userRole}
            />

            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {activeTab === 'dashboard' ? 'Project Dashboard' : 'Review Queue'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {userRole === 'ro'
                                ? 'Manage and track your FMR proposals'
                                : `Pending items for ${userRole === 'bafe' ? 'Engineering & Bidding' : userRole === 'scorer' ? 'Scoring' : 'Validation'}`
                            }
                        </p>
                    </div>

                    {userRole === 'ro' && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Proposal
                        </button>
                    )}
                </header>

                {/* Stats Grid */}
                <StatsGrid projects={projectsList} userRole={userRole} />

                {/* Main Content Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800">
                            {activeTab === 'dashboard' ? 'All Projects' : 'Pending Tasks'}
                        </h2>
                    </div>

                    <ProjectsTable
                        projects={projectsList}
                        userRole={userRole}
                        onViewProject={handleProjectClick}
                        onReviewProject={handleProjectClick}
                    />
                </div>
            </main>

            {/* --- MODALS --- */}

            {/* 1. RO MODALS */}
            {userRole === 'ro' && (
                <>
                    <CreateProposalModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onSubmit={handleCreateProject}
                    />
                    <ViewProjectModal
                        isOpen={isViewModalOpen}
                        onClose={() => {
                            setIsViewModalOpen(false);
                            setSelectedProject(null);
                        }}
                        project={selectedProject}
                    />
                    <EditProposalModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedProject(null);
                        }}
                        project={selectedProject}
                        onSubmit={handleEditSubmit}
                    />
                </>
            )}

            {/* 2. VALIDATOR MODAL */}
            {userRole === 'validator' && (
                <ReviewProjectModal
                    isOpen={isReviewModalOpen}
                    onClose={() => {
                        setIsReviewModalOpen(false);
                        setSelectedProject(null);
                    }}
                    project={selectedProject}
                    onDecision={handleValidatorDecision}
                />
            )}

            {/* 3. SCORER MODAL */}
            {userRole === 'scorer' && (
                <Step2ScoringModal
                    isOpen={isReviewModalOpen}
                    onClose={() => {
                        setIsReviewModalOpen(false);
                        setSelectedProject(null);
                    }}
                    project={selectedProject}
                    onSubmitScore={handleScoreSubmit}
                />
            )}

            {/* 4. BAFE MODALS (Handles BOTH Step 3 & Step 4) */}
            {userRole === 'bafe' && (
                <>
                    {/* Step 3: Design Validation */}
                    <Step3ValidationModal
                        isOpen={isReviewModalOpen}
                        onClose={() => {
                            setIsReviewModalOpen(false);
                            setSelectedProject(null);
                        }}
                        project={selectedProject}
                        onValidate={handleStep3Validation}
                    />

                    {/* Step 4: Bidding & Award */}
                    <Step4BiddingModal
                        isOpen={isBiddingModalOpen}
                        onClose={() => {
                            setIsBiddingModalOpen(false);
                            setSelectedProject(null);
                        }}
                        project={selectedProject}
                        onAward={handleAwardSubmit}
                    />
                </>
            )}
        </div>
    );
}