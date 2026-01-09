import { useState, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen'; 
import DashboardScreen from './screens/DashboardScreen';

const MOCK_PROJECTS = [
  { id: "PROJ-2026-001", name: "Concreting of Brgy. Kapuy Farm Road", location: "Ilocos Sur", cost: "P 15,000,000", date: "Jan 08, 2026", status: "PENDING_REVIEW", step: 1 },
  { id: "PROJ-2026-002", name: "Slope Protection for Bridge A", location: "Vigan City", cost: "P 45,200,000", date: "Jan 05, 2026", status: "RETURNED", step: 1 },
  { id: "PROJ-2026-003", name: "Multi-Purpose Building Construction", location: "Candon City", cost: "P 22,500,000", date: "Dec 20, 2025", status: "CLEARED", step: 2 },
  { id: "PROJ-2026-004", name: "Widening of National Highway (km 400)", location: "Santa Maria", cost: "P 120,000,000", date: "Jan 09, 2026", status: "ON_HOLD", step: 1 }
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [projects] = useState(MOCK_PROJECTS);

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

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <DashboardScreen 
      projects={projects} 
      onLogout={handleLogout}
      userRole={userRole}
    />
  );
}

export default App;
