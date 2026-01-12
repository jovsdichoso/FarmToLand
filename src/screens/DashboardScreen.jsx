import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StatsGrid from '../components/StatsGrid';
import ProjectsTable from '../components/ProjectsTable';
import CreateProposalModal from '../components/CreateProposalModal';
import ViewProjectModal from '../components/ViewProjectModal';

// --- IMPORT BOTH REVIEW MODALS ---
import ReviewProjectModal from '../components/ReviewProjectModal'; // Step 1: Validator
import Step2ScoringModal from '../components/Step2ScoringModal';   // Step 2: Scorer

export default function DashboardScreen({
    projects,       // DATA from App.jsx
    onCreate,       // DB Function from App.jsx
    onUpdate,       // DB Function from App.jsx
    onLogout,
    userRole
}) {
    const [activeTab, setActiveTab] = useState(userRole === 'ro' ? 'dashboard' : 'queue');

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const [selectedProject, setSelectedProject] = useState(null);
    const [projectsList, setProjectsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- SYNC WITH DB (App.jsx) ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            // Simulate network delay for realism (optional)
            await new Promise(resolve => setTimeout(resolve, 600));
            setProjectsList(projects);
            setIsLoading(false);
        };
        loadData();
    }, [projects]);

    // --- HANDLERS ---

    const handleCreateProject = (newProject) => {
        // Call DB function
        onCreate(newProject);
    };

    const handleViewProject = (project) => {
        setSelectedProject(project);
        setIsViewModalOpen(true);
    };

    const handleReviewProject = (project) => {
        setSelectedProject(project);
        setIsReviewModalOpen(true);
    };

    // --- LOGIC: STEP 1 VALIDATOR ---
    const handleValidatorDecision = (projectId, decision) => {
        // Find the project locally to modify it
        const projectToUpdate = projectsList.find(p => p.id === projectId);
        if (!projectToUpdate) return;

        let updatedProject = { ...projectToUpdate };

        if (decision.action === 'clear') {
            updatedProject = {
                ...updatedProject,
                status: 'CLEARED',
                step: 2,
                priority: decision.priority,
                validatorNotes: decision.notes,
                clearedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
            };
        } else if (decision.action === 'return') {
            updatedProject = {
                ...updatedProject,
                status: 'RETURNED',
                deficiencies: decision.deficiencies,
                validatorNotes: decision.notes,
                returnedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
            };
        } else if (decision.action === 'hold') {
            updatedProject = {
                ...updatedProject,
                status: 'ON_HOLD',
                validatorNotes: decision.notes,
                holdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
            };
        }

        // Save to DB
        onUpdate(updatedProject);
    };

    // --- LOGIC: STEP 2 SCORER ---
    const handleScoreSubmit = (projectId, scoreData) => {
        const projectToUpdate = projectsList.find(p => p.id === projectId);
        if (!projectToUpdate) return;

        const updatedProject = {
            ...projectToUpdate,
            status: 'SCORED',
            step: 2,
            scoringData: {
                totalScore: scoreData.totalScore,
                breakdown: scoreData.scores,
                remarks: scoreData.remarks
            },
            scoredDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        };

        // Save to DB
        onUpdate(updatedProject);
    };

    return (
        <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
            {/* SIDEBAR */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                userRole={userRole}
            />

            {/* MAIN CONTENT */}
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">
                {/* HEADER */}
                <header className="mb-6 sm:mb-8 mt-12 lg:mt-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                {userRole === 'ro' ? 'My Project Submissions' :
                                    userRole === 'scorer' ? 'Step 2 Scoring Queue' :
                                        'Step 1 Validation Queue'}
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-gray-600">
                                {userRole === 'ro'
                                    ? 'Create and submit project proposals for validation'
                                    : userRole === 'scorer'
                                        ? 'Evaluate and score cleared projects for prioritization'
                                        : 'Review and validate project proposals for pipeline eligibility'}
                            </p>
                        </div>

                        {/* CREATE BUTTON - ONLY FOR RO */}
                        {userRole === 'ro' && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded text-sm font-semibold transition-colors whitespace-nowrap shadow-lg flex items-center gap-2"
                            >
                                + Create Project
                            </button>
                        )}
                    </div>
                </header>

                {/* STATS GRID */}
                <StatsGrid projects={projectsList} isLoading={isLoading} userRole={userRole} />

                {/* PROJECTS TABLE */}
                <ProjectsTable
                    projects={projectsList}
                    userRole={userRole}
                    onViewProject={handleViewProject}
                    onReviewProject={handleReviewProject}
                    isLoading={isLoading}
                />
            </main>

            {/* --- MODALS SECTION --- */}

            {/* 1. RO: CREATE & VIEW MODALS */}
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
                </>
            )}

            {/* 2. VALIDATOR: STEP 1 CHECKLIST MODAL */}
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

            {/* 3. SCORER: STEP 2 SPLIT-SCREEN MODAL */}
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
        </div>
    );
}