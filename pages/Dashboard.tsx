import React, { useEffect, useState } from 'react';
import { Users, BookOpen, AlertCircle, Trophy, Activity } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      <p className={`text-xs mt-2 ${sub && sub.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>
        {sub}
      </p>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    marksEntries: 0,
    disciplineCases: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Realtime subscription for students table
    const studentsSub = supabase
      .channel('dashboard-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        fetchStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marks' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(studentsSub);
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Get total students
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Get marks count (approximation of activity)
      const { count: marksCount } = await supabase
        .from('marks')
        .select('*', { count: 'exact', head: true });

      // Get discipline logs count (assuming table exists from schema)
      // Note: If table doesn't exist yet, this might fail, so we wrap in try/catch block for safety or check schema
      const { count: disciplineCount } = await supabase
        .from('discipline_logs') // Assuming this table exists based on previous prompt requirements
        .select('*', { count: 'exact', head: true });

      setStats({
        totalStudents: studentCount || 0,
        marksEntries: marksCount || 0,
        disciplineCases: disciplineCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Realtime Overview</h2>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border">
          {loading ? 'Connecting...' : 'Live Data'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Students" 
          value={loading ? '-' : stats.totalStudents} 
          sub="Active enrollment" 
          icon={Users} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Marks Recorded" 
          value={loading ? '-' : stats.marksEntries} 
          sub="Total entries" 
          icon={BookOpen} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Discipline Cases" 
          value={loading ? '-' : stats.disciplineCases} 
          sub="Reported incidents" 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
           <Activity size={48} className="mx-auto mb-4 opacity-50" />
           <p>Realtime Activity Feed is listening for updates...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;