import React from 'react';
import { Users, BookOpen, AlertCircle, Trophy } from 'lucide-react';

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      <p className={`text-xs mt-2 ${sub.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>
        {sub}
      </p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border">Term 2, 2024</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value="1,240" 
          sub="+12 this term" 
          icon={Users} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Pending Marks" 
          value="15%" 
          sub="Deadline: Friday" 
          icon={BookOpen} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Discipline Cases" 
          value="8" 
          sub="3 Major incidents" 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
        <StatCard 
          title="Leading House" 
          value="Blue House" 
          sub="450 points ahead" 
          icon={Trophy} 
          color="bg-purple-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Academic Performance (Termly Trend)</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            [D3.js / Recharts Graph Placeholder]
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="text-sm text-gray-800 font-medium">Mr. Okello uploaded marks</p>
                  <p className="text-xs text-gray-500">S.3 Math • 2 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;