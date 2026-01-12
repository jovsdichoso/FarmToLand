import { useState, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import LoadingScreen from './screens/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // --- DATABASE STATE (Initialized from Local Storage) ---
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('infra-projects-db');
    // If nothing in storage, start with EMPTY array [] instead of Mock Data
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  // --- PERSISTENCE EFFECT ---
  // Any time 'projects' changes, save it to Local Storage
  useEffect(() => {
    localStorage.setItem('infra-projects-db', JSON.stringify(projects));
  }, [projects]);

  // --- AUTH EFFECTS ---
  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    const savedUserRole = localStorage.getItem('userRole');

    if (savedLoginState === 'true' && savedUserRole) {
      setIsLoggedIn(true);
      setUserRole(savedUserRole);
    }
  }, []);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // --- DATABASE OPERATIONS ---

  // 1. CREATE
  const handleAddProject = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
  };

  // 2. UPDATE (Used by Validator & Scorer)
  const handleUpdateProject = (updatedProject) => {
    setProjects(prev =>
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
  };

  // --- RENDER ---

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <DashboardScreen
      userRole={userRole}
      onLogout={handleLogout}

      // Pass Data & DB Functions
      projects={projects}
      onCreate={handleAddProject}
      onUpdate={handleUpdateProject}
    />
  );
}

export default App;