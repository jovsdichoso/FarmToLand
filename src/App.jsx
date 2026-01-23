import { useState, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import LoadingScreen from './screens/LoadingScreen'; // <--- RESTORED IMPORT

// --- FIREBASE IMPORTS ---
import { db, auth } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [projects, setProjects] = useState([]);

  // Loading Logic: Wait for Data AND Animation
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  const [appError, setAppError] = useState(null);

  // --- 1. AUTH LISTENER ---
  useEffect(() => {
    try {
      const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          // Set role based on email prefix (e.g., "ro@fmr.com" -> "ro")
          if (currentUser.email) {
            setUserRole(currentUser.email.split('@')[0]);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      });
      return () => unsubscribeAuth();
    } catch (err) {
      console.error("Auth Error:", err);
      setAppError("Auth Error: " + err.message);
    }
  }, []);

  // --- 2. DATA LISTENER ---
  useEffect(() => {
    if (!user) {
      setProjects([]);
      return;
    }

    try {
      const unsubscribeData = onSnapshot(collection(db, "projects"), (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setProjects(projectsData);
        setIsDataLoaded(true); // <--- Data is ready
      }, (error) => {
        console.error("Data Error:", error);
        // Even if error, we stop loading so user isn't stuck
        setIsDataLoaded(true);
      });

      return () => unsubscribeData();
    } catch (err) {
      setAppError("Snapshot failed: " + err.message);
    }
  }, [user]);

  // --- HANDLERS ---
  const handleLogin = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsDataLoaded(false);
    setIsSplashComplete(false); // Reset splash on logout if desired
  };

  const handleAddProject = async (newProject) => {
    // This writes to Firestore using the custom ID (e.g., FMR-2026-123)
    await setDoc(doc(db, "projects", newProject.id), newProject);
  };

  const handleUpdateProject = async (updatedProject) => {
    const projectRef = doc(db, "projects", updatedProject.id);
    await updateDoc(projectRef, updatedProject);
  };

  // --- RENDER ---

  // 1. Show Error if App Crashed
  if (appError) {
    return (
      <div className="p-10 text-red-600">
        <h1 className="text-2xl font-bold">System Error</h1>
        <p>{appError}</p>
      </div>
    );
  }

  // 2. Show Loading Screen until Animation finishes
  // We keep showing this until the timer inside LoadingScreen calls the callback
  if (!isSplashComplete) {
    return <LoadingScreen onLoadingComplete={() => setIsSplashComplete(true)} />;
  }

  // 3. Show Login if not authenticated
  if (!user || !userRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 4. Show Dashboard
  return (
    <DashboardScreen
      userRole={userRole}
      onLogout={handleLogout}
      projects={projects}
      onCreate={handleAddProject}
      onUpdate={handleUpdateProject}
    />
  );
}

export default App;