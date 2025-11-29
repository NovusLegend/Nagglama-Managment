export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'alumni';
export type Gender = 'M' | 'F';
export type AssessmentType = 'BOT' | 'MOT' | 'EOT' | 'Assignment';
export type TermName = 'Term 1' | 'Term 2' | 'Term 3';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  email?: string;
  avatar_url?: string;
  // Alumni specific
  year_of_completion?: number;
  current_profession?: string;
  is_public_profile?: boolean;
}

export interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
}

export interface Term {
  id: string;
  name: TermName;
  is_current: boolean;
}

export interface ClassLevel {
  id: string;
  name: string;
  level: number;
}

export interface Stream {
  id: string;
  name: string;
  class_id: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  level: 'O-Level' | 'A-Level';
  is_compulsory: boolean;
}

export interface Student {
  id: string; // Linked to profile
  student_id_human: string;
  full_name: string; // Joined from profile
  current_stream_id: string;
  gender: Gender;
  house_id?: string;
}

export interface TeacherAllocation {
  id: string;
  teacher_id: string;
  subject_id: string;
  stream_id: string;
  academic_year_id: string;
  // Joined fields for UI
  subject_name?: string;
  stream_name?: string;
  class_name?: string;
}

export interface Mark {
  id: string;
  student_id: string;
  teacher_allocation_id: string;
  term_id: string;
  assessment_type: AssessmentType;
  score: number;
  comments?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  audience: 'all' | 'students' | 'alumni' | 'staff';
  location?: string;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  change?: string;
}
