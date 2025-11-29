import React, { useState, useEffect } from 'react';
import { Save, Wand2, Loader2, RefreshCw } from 'lucide-react';
import { generateStudentReportComment } from '../../services/geminiService';
import { supabase } from '../../lib/supabaseClient';
import { Student, Mark, TeacherAllocation } from '../../types';

const MarksEntry: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [selectedAllocationId, setSelectedAllocationId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<{ [key: string]: number }>({});
  const [existingMarkIds, setExistingMarkIds] = useState<{ [key: string]: string }>({}); // student_id -> mark_id
  
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch Teacher Allocations (Classes assigned to the teacher)
  useEffect(() => {
    const fetchAllocations = async () => {
      // In a real app, filtering by the logged-in user ID would happen here.
      // For now, we fetch all allocations to allow testing.
      const { data, error } = await supabase
        .from('teacher_allocations')
        .select(`
          id,
          stream_id,
          subject_id,
          academic_year_id,
          subjects (name, code),
          streams (name, class_id),
          academic_years (name)
        `)
        .limit(10);

      if (error) console.error('Error fetching allocations:', error);
      else if (data) {
        setAllocations(data);
        if (data.length > 0) setSelectedAllocationId(data[0].id);
      }
      setLoading(false);
    };

    fetchAllocations();
  }, []);

  // Fetch Students and Marks when allocation changes
  useEffect(() => {
    if (!selectedAllocationId) return;
    fetchClassData();

    // Subscribe to Realtime Marks Updates
    const subscription = supabase
      .channel(`marks-entry-${selectedAllocationId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'marks',
          filter: `teacher_allocation_id=eq.${selectedAllocationId}`
        },
        (payload) => {
          console.log('Realtime update:', payload);
          // If update came from another client, refresh data
          // Ideally we optimize this to only update specific state
          fetchClassData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedAllocationId]);

  const fetchClassData = async () => {
    setLoading(true);
    const allocation = allocations.find(a => a.id === selectedAllocationId);
    if (!allocation) return;

    // 1. Fetch Students in the stream
    const { data: studentsData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('current_stream_id', allocation.stream_id)
      .eq('is_active', true)
      .order('full_name');

    if (studentError) {
      console.error('Error fetching students:', studentError);
      return;
    }

    // 2. Fetch Existing Marks for this allocation
    const { data: marksData, error: marksError } = await supabase
      .from('marks')
      .select('*')
      .eq('teacher_allocation_id', selectedAllocationId);

    if (marksError) {
      console.error('Error fetching marks:', marksError);
      return;
    }

    // Map data to state
    const marksMap: { [key: string]: number } = {};
    const markIdsMap: { [key: string]: string } = {};

    marksData?.forEach((m: any) => {
      marksMap[m.student_id] = m.score;
      markIdsMap[m.student_id] = m.id;
    });

    setStudents(studentsData || []);
    setMarks(marksMap);
    setExistingMarkIds(markIdsMap);
    setLoading(false);
  };

  const handleMarkChange = (studentId: string, val: string) => {
    setMarks(prev => ({ ...prev, [studentId]: Number(val) }));
  };

  const saveMark = async (studentId: string) => {
    setSaving(true);
    const allocation = allocations.find(a => a.id === selectedAllocationId);
    const score = marks[studentId];
    const markId = existingMarkIds[studentId];

    if (!allocation) return;

    const markData = {
      student_id: studentId,
      teacher_allocation_id: selectedAllocationId,
      score: score,
      assessment_type: 'BOT', // Hardcoded for demo, normally selected
      term_id: 'term-id-placeholder' // Would come from current active term
      // Note: In a full implementation, we fetch the current Term ID
    };

    let error;
    if (markId) {
      // Update
      const { error: err } = await supabase
        .from('marks')
        .update({ score })
        .eq('id', markId);
      error = err;
    } else {
      // Insert
      const { data, error: err } = await supabase
        .from('marks')
        .insert([markData])
        .select();
      
      if (data && data[0]) {
        setExistingMarkIds(prev => ({ ...prev, [studentId]: data[0].id }));
      }
      error = err;
    }

    setSaving(false);
    if (error) console.error("Error saving mark:", error);
  };

  // Bulk save function
  const handleBulkSave = async () => {
    setSaving(true);
    const promises = students.map(s => {
      if (marks[s.id] !== undefined) {
        return saveMark(s.id);
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
    setSaving(false);
  };

  const generateComment = async (student: any) => {
    setLoadingAi(true);
    setAiComment(null);
    const allocation = allocations.find(a => a.id === selectedAllocationId);
    const subjectName = allocation?.subjects?.name || 'Subject';
    
    const comment = await generateStudentReportComment(
      student.full_name, 
      marks[student.id] || 0, 
      subjectName, 
      'N/A', // We'd need more data for weakest subject
      'steady' // We'd need historical data for trend
    );
    setAiComment(comment);
    setLoadingAi(false);
  };

  const calculateGrade = (mark: number) => {
    if (!mark && mark !== 0) return '-';
    if (mark >= 80) return 'D1';
    if (mark >= 75) return 'D2';
    if (mark >= 70) return 'C3';
    if (mark >= 65) return 'C4';
    if (mark >= 60) return 'C5';
    if (mark >= 55) return 'C6';
    if (mark >= 50) return 'P7';
    if (mark >= 45) return 'P8';
    return 'F9';
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'D1' || grade === 'D2') return 'bg-green-100 text-green-700';
    if (grade === 'F9') return 'bg-red-100 text-red-700';
    if (grade === '-') return 'bg-gray-50 text-gray-400';
    return 'bg-blue-50 text-blue-700';
  };

  if (loading && allocations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading Academic Data...
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">No Classes Assigned</h3>
        <p className="text-gray-500 mt-2">You have not been allocated any streams or subjects yet.</p>
        <p className="text-sm text-gray-400 mt-1">Please contact the Director of Studies.</p>
      </div>
    );
  }

  const currentAllocation = allocations.find(a => a.id === selectedAllocationId);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Header Controls */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Marks Entry</h2>
          <div className="flex items-center gap-2 mt-1">
             <select 
                value={selectedAllocationId}
                onChange={(e) => setSelectedAllocationId(e.target.value)}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1 bg-white border"
             >
                {allocations.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.subjects?.name} - {a.streams?.name}
                  </option>
                ))}
             </select>
             <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-200 rounded-full">
               {currentAllocation?.academic_years?.name || 'Current Term'}
             </span>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={fetchClassData}
             className="flex items-center gap-2 text-gray-600 bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
             title="Refresh Data"
           >
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
           </button>
           <button 
             onClick={handleBulkSave}
             disabled={saving}
             className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
           >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{saving ? 'Saving...' : 'Save All'}</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
            <tr className="text-gray-500 text-sm border-b">
              <th className="p-4 font-semibold w-24">ID</th>
              <th className="p-4 font-semibold">Student Name</th>
              <th className="p-4 font-semibold w-32 text-center">Score / 100</th>
              <th className="p-4 font-semibold w-24 text-center">Grade</th>
              <th className="p-4 font-semibold text-right">AI Tools</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                  No students found in this stream.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const mark = marks[student.id];
                const grade = calculateGrade(mark);
                
                return (
                  <tr key={student.id} className="hover:bg-blue-50 transition-colors group">
                    <td className="p-4 text-gray-500 font-mono text-xs">{student.student_id_human}</td>
                    <td className="p-4 font-medium text-gray-800">{student.full_name}</td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        max="100"
                        min="0"
                        placeholder="-"
                        value={mark ?? ''}
                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                        onBlur={() => saveMark(student.id)} // Auto-save on blur
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${getGradeColor(grade)}`}>
                        {grade}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => generateComment(student)}
                        className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-3 py-1.5 rounded-md text-sm inline-flex items-center gap-1.5 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Wand2 size={16} />
                        <span>Comment</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* AI Modal Preview */}
      {aiComment && (
        <div className="p-4 bg-purple-50 border-t border-purple-100 flex gap-4 items-start animate-in slide-in-from-bottom-2 duration-300">
           <div className="bg-purple-200 p-2 rounded-full text-purple-700 mt-1">
             <Wand2 size={20} />
           </div>
           <div className="flex-1">
             <div className="flex justify-between items-start">
                <h4 className="font-bold text-purple-900 text-sm mb-1">Gemini Suggestion</h4>
                <button onClick={() => setAiComment(null)} className="text-gray-400 hover:text-gray-600">
                   &times;
                </button>
             </div>
             <p className="text-gray-800 text-sm leading-relaxed">"{aiComment}"</p>
             <div className="mt-2 flex gap-2">
                <button className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition">Copy to Clipboard</button>
                <button className="text-xs text-purple-700 hover:underline px-2" onClick={() => generateComment(students[0])}>Regenerate</button>
             </div>
           </div>
        </div>
      )}
      
      {loadingAi && (
        <div className="p-3 bg-purple-50 text-center text-sm text-purple-600 italic border-t border-purple-100">
          <Loader2 className="animate-spin inline mr-2 w-4 h-4" />
          Analyzing student performance...
        </div>
      )}
    </div>
  );
};

export default MarksEntry;