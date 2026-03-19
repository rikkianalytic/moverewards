
import React from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';

// Shared Pages
import SettingsPage from './pages/Settings';
import NoteHub from './pages/shared/NoteHub';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Employees from './pages/admin/Employees';
import PointsManager from './pages/admin/Points';
import RewardsManager from './pages/admin/Rewards';
import RedemptionsApprovals from './pages/admin/Redemptions';
import ContestsManager from './pages/admin/Contests';
import Reports from './pages/admin/Reports';
import AdminLeaderboard from './pages/admin/Leaderboard';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import PointsHistory from './pages/employee/History';
import RewardsStore from './pages/employee/RewardsStore';
import MyRedemptions from './pages/employee/MyRedemptions';
import Leaderboard from './pages/employee/Leaderboard';
import ActiveContests from './pages/employee/ActiveContests';

const PrivateRoute: React.FC<{ children: React.ReactNode; role?: 'admin' | 'employee' }> = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/employee'} replace />;
  }
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/employees" element={<PrivateRoute role="admin"><Employees /></PrivateRoute>} />
          <Route path="/admin/leaderboard" element={<PrivateRoute role="admin"><AdminLeaderboard /></PrivateRoute>} />
          <Route path="/admin/notes" element={<PrivateRoute role="admin"><NoteHub /></PrivateRoute>} />
          <Route path="/admin/points" element={<PrivateRoute role="admin"><PointsManager /></PrivateRoute>} />
          <Route path="/admin/rewards" element={<PrivateRoute role="admin"><RewardsManager /></PrivateRoute>} />
          <Route path="/admin/redemptions" element={<PrivateRoute role="admin"><RedemptionsApprovals /></PrivateRoute>} />
          <Route path="/admin/contests" element={<PrivateRoute role="admin"><ContestsManager /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute role="admin"><Reports /></PrivateRoute>} />

          {/* Employee Routes */}
          <Route path="/employee" element={<PrivateRoute role="employee"><EmployeeDashboard /></PrivateRoute>} />
          <Route path="/employee/history" element={<PrivateRoute role="employee"><PointsHistory /></PrivateRoute>} />
          <Route path="/employee/notes" element={<PrivateRoute role="employee"><NoteHub /></PrivateRoute>} />
          <Route path="/employee/rewards" element={<PrivateRoute role="employee"><RewardsStore /></PrivateRoute>} />
          <Route path="/employee/redemptions" element={<PrivateRoute role="employee"><MyRedemptions /></PrivateRoute>} />
          <Route path="/employee/leaderboard" element={<PrivateRoute role="employee"><Leaderboard /></PrivateRoute>} />
          <Route path="/employee/contests" element={<PrivateRoute role="employee"><ActiveContests /></PrivateRoute>} />

          {/* Shared Private Routes */}
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/employee'} replace />;
};

export default App;
