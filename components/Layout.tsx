
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, PlusCircle, Gift, CheckSquare, 
  Trophy, LogOut, History, Store, Award,
  Bell, Settings, User as UserIcon, Lightbulb, ShoppingBag
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNav: NavItem[] = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { to: '/admin/employees', icon: <Users size={20} />, label: 'Team' },
    { to: '/admin/leaderboard', icon: <Trophy size={20} />, label: 'Leaderboard' },
    { to: '/admin/notes', icon: <Lightbulb size={20} />, label: 'Brainstorm' },
    { to: '/admin/points', icon: <PlusCircle size={20} />, label: 'Points' },
    { to: '/admin/redemptions', icon: <CheckSquare size={20} />, label: 'Approvals' },
    { to: '/admin/rewards', icon: <Gift size={20} />, label: 'Perks Store' },
    { to: '/admin/contests', icon: <Award size={20} />, label: 'Contests' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const employeeNav: NavItem[] = [
    { to: '/employee', icon: <LayoutDashboard size={20} />, label: 'Home' },
    { to: '/employee/history', icon: <History size={20} />, label: 'History' },
    { to: '/employee/rewards', icon: <Store size={20} />, label: 'Store' },
    { to: '/employee/redemptions', icon: <ShoppingBag size={20} />, label: 'My Vault' },
    { to: '/employee/leaderboard', icon: <Trophy size={20} />, label: 'Ranks' },
    { to: '/employee/contests', icon: <Award size={20} />, label: 'Contests' },
    { to: '/employee/notes', icon: <Lightbulb size={20} />, label: 'Brainstorm' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const currentNav = isAdmin ? adminNav : employeeNav;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#0F172A] text-white flex-col fixed h-full z-40 border-r border-slate-800">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-orange-500 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20">
              MR
            </div>
            <span className="text-xl font-extrabold tracking-tight">MoveRewards</span>
          </div>

          <nav className="space-y-1.5 overflow-y-auto no-scrollbar max-h-[calc(100vh-250px)]">
            {currentNav.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  location.pathname === item.to 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={`${location.pathname === item.to ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                  {item.icon}
                </span>
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <Link to="/settings" className="bg-slate-800/50 rounded-3xl p-4 flex items-center space-x-3 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            {user?.profilePic ? (
              <img src={user.profilePic} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="Profile" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
                {user?.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{user?.role}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all duration-200 font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:ml-72 pb-24 lg:pb-0">
        <header className="glass sticky top-0 z-30 px-6 py-4 lg:py-6 border-b border-slate-200/50 flex items-center justify-between">
          <div className="lg:hidden flex items-center space-x-3">
             <div className="bg-orange-500 w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-xs">
              MR
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900">MoveRewards</span>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Dashboard</h2>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition-colors soft-shadow">
              <Bell size={20} />
            </button>
            <Link to="/settings" className="lg:hidden overflow-hidden w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center">
               {user?.profilePic ? (
                 <img src={user.profilePic} className="w-full h-full object-cover" alt="Profile" />
               ) : (
                 <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                   {user?.name.charAt(0)}
                 </div>
               )}
            </Link>
          </div>
        </header>

        <main className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-slate-200/50 z-40 px-6 pb-safe pt-2 flex justify-between items-center shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        {currentNav.slice(0, 4).concat(currentNav.slice(-1)).map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center space-y-1.5 py-2 px-3 rounded-2xl transition-all duration-300 ${
                isActive ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
