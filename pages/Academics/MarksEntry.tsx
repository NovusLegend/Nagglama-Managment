import React, { useState } from 'react';
import { Save, Wand2, CheckCircle } from 'lucide-react';
import { generateStudentReportComment } from '../../services/geminiService';

// Mock Data
const MOCK_STUDENTS = [
  { id: '1', name: 'Nassozi Jane', id_human: 'SJN/23/045', mark: 85 },
  { id: '2', name: 'Opio David', id_human: 'SJN/23/112', mark: 62 },
  { id: '3', name: 'Kato John', id_human: 'SJN/23/008', mark: 91 },
  { id: '4', name: 'Akers Patricia', id_human: 'SJN/23/099', mark: 45 },
];

const MarksEntry: React.FC = () => {
  const [marks, setMarks] = useState<{ [key: string]: number }>(
    MOCK_STUDENTS.reduce((acc, s) => ({ ...acc, [s.id]: s.mark }), {})
  );
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleMarkChange = (id: string, val: string) => {
    setMarks({ ...marks, [id]: Number(val) });
  };

  const generateComment = async (student: any) => {
    setLoadingAi(true);
    setAiComment(null);
    const comment = await generateStudentReportComment(
      student.name, 
      marks[student.id], 
      'Mathematics', 
      'History', 
      'improving'
    );
    setAiComment(comment);
    setLoadingAi(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Marks Entry</h2>
          <p className="text-sm text-gray-500">Mathematics • S.3 North • Term 2</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b">
              <th className="p-4 font-semibold">Student ID</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold w-32">Mark (%)</th>
              <th className="p-4 font-semibold">Grade</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_STUDENTS.map((student) => {
              const mark = marks[student.id] || 0;
              let grade = 'F9';
              if (mark >= 80) grade = 'D1';
              else if (mark >= 70) grade = 'D2';
              else if (mark >= 60) grade = 'C3';
              else if (mark >= 50) grade = 'C4';
              else if (mark >= 45) grade = 'P7';
              
              return (
                <tr key={student.id} className="hover:bg-blue-50 transition-colors">
                  <td className="p-4 text-gray-600 font-mono text-sm">{student.id_human}</td>
                  <td className="p-4 font-medium text-gray-800">{student.name}</td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      max="100"
                      min="0"
                      value={marks[student.id]}
                      onChange={(e) => handleMarkChange(student.id, e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      grade === 'D1' ? 'bg-green-100 text-green-700' : 
                      grade === 'F9' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {grade}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => generateComment(student)}
                      className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1 ml-auto"
                    >
                      <Wand2 size={16} />
                      AI Comment
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Modal Preview (Simplified) */}
      {aiComment && (
        <div className="p-4 bg-purple-50 border-t border-purple-100 flex gap-3 items-start animate-fade-in">
           <div className="bg-purple-200 p-2 rounded-full text-purple-700">
             <Wand2 size={20} />
           </div>
           <div className="flex-1">
             <h4 className="font-bold text-purple-900 text-sm mb-1">Generated Comment Suggestion</h4>
             <p className="text-gray-700 text-sm italic">"{aiComment}"</p>
           </div>
           <button onClick={() => setAiComment(null)} className="text-gray-400 hover:text-gray-600">
             &times;
           </button>
        </div>
      )}
      
      {loadingAi && (
        <div className="p-4 bg-gray-50 text-center text-sm text-gray-500 italic">
          Consulting Gemini...
        </div>
      )}
    </div>
  );
};

export default MarksEntry;