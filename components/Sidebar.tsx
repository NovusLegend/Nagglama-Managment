import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  FileSpreadsheet, 
  Settings,
  LogOut,
  Trophy,
  Activity
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, role }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'academics', label: 'Academics & Marks', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'discipline', label: 'Discipline Log', icon: Activity },
    { id: 'houses', label: 'House System', icon: Trophy },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 shadow-xl">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-slate-900">SJ</div>
        <div>
          <h1 className="font-bold text-lg">Naggalama Portal</h1>
          <p className="text-xs text-slate-400">Admin & Teacher</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'bg-yellow-500 text-slate-900 font-semibold' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center space-x-3 px-4 py-3 w-full text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;