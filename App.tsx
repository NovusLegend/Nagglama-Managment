import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MarksEntry from './pages/Academics/MarksEntry';
import { Menu } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Simple View Router
  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'academics': return <MarksEntry />;
      // Placeholders for other views
      default: return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Menu size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-600">Module Under Construction</h3>
          <p>This academic feature is coming in the next sprint.</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar - Desktop */}
      <div className={`hidden md:block ${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300`}>
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} role="teacher" />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="text-gray-500 hover:text-gray-700 md:hidden"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 capitalize">
              {currentView.replace('-', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-gray-800">Tr. Okello Patrick</p>
               <p className="text-xs text-gray-500">Mathematics Dept.</p>
             </div>
             <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        {/* View Container */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;