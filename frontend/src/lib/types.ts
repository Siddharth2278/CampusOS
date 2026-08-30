export type Role = "STUDENT" | "TEACHER" | "HOD" | "PRINCIPAL";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthMeResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  profileId?: number;
  departmentId?: number;
  semester?: number;
  photoUrl?: string | null;
}

export interface LoginResponse {
  token: string;
  role: Role;
  message: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  enrollmentNumber?: string;
  rollNumber?: number;
  semester?: number;
  admissionYear?: number;
  departmentId?: number;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  hod?: Teacher;
}

export interface Student {
  id: number;
  enrollmentNumber: string;
  rollNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  semester: number;
  admissionYear: number;
  department?: Department;
  user?: { id: number };
}

export interface Teacher {
  id: number;
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: Department;
  classTeacher?: boolean;
  classTeacherSemester?: number;
  hod?: boolean;
  user?: { id: number };
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  department?: Department;
  semester: number;
  academicYear: string;
}

export interface FacultyAssignment {
  id: number;
  teacher: Teacher;
  subject: Subject;
}

export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export type SessionType = "LECTURE" | "PRACTICAL";

export interface TimetableEntry {
  id: number;
  department: string;
  semester: number;
  day: WeekDay;
  lectureNumber: number;
  sessionType: SessionType;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
}

export interface TimetableRequest {
  departmentId: number;
  semester: number;
  day: WeekDay;
  lectureNumber: number;
  sessionType: SessionType;
  subjectId: number;
  teacherId: number;
  startTime: string;
  endTime: string;
}

export type AttendanceStatus = "PRESENT" | "ABSENT";

export interface AttendanceRecord {
  id: number;
  student: Student;
  subject: Subject;
  teacher: Teacher;
  attendanceDate: string;
  lectureNumber: number;
  status: AttendanceStatus;
}

export interface AttendanceItem {
  studentId: number;
  status: AttendanceStatus;
}

export interface AttendanceRequest {
  teacherId: number;
  subjectId: number;
  attendanceDate: string;
  lectureNumber: number;
  attendanceItems: AttendanceItem[];
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  createdAt: string;
}

export type AssignmentSubmissionStatus = "NOT_SUBMITTED" | "SUBMITTED" | "LATE";

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  studentId: number;
  studentName: string;
  status: AssignmentSubmissionStatus;
  submittedAt: string;
  remarks?: string;
}

export interface Exam {
  id: number;
  examName: string;
  examType: string;
  subjectId: number;
  subjectName: string;
  departmentId: number;
  departmentName: string;
  semester: number;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  academicYear: string;
  createdByUserId: number;
  createdByName: string;
}

export interface ExamRequest {
  examName: string;
  examType: string;
  subjectId: number;
  departmentId: number;
  semester: number;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  academicYear: string;
  createdByUserId: number;
}

export type LeaveRole = "STUDENT" | "TEACHER" | "HOD";
export type LeaveType =
  | "SICK"
  | "MEDICAL"
  | "CASUAL"
  | "PERSONAL"
  | "DUTY"
  | "SPORTS"
  | "FAMILY_FUNCTION"
  | "OTHER";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";

export interface LeaveRequestPayload {
  userId: number;
  leaveRole: LeaveRole;
  leaveType: LeaveType;
  reason: string;
  startDate: string;
  endDate: string;
}

export interface LeaveResponse {
  id: number;
  userName: string;
  leaveRole: LeaveRole;
  leaveType: LeaveType;
  reason: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface LeaveDecisionRequest {
  approvedByUserId: number;
  status: LeaveStatus;
  remarks?: string;
}

export interface LeaveStatistics {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export type CalendarType =
  | "EVENT"
  | "EXAM"
  | "HOLIDAY"
  | "WORKSHOP"
  | "SEMINAR"
  | "PLACEMENT"
  | "DEADLINE";
export type EventAudience = "ALL" | "HOD" | "TEACHER" | "STUDENT";

export interface AcademicCalendarEntry {
  id: number;
  title: string;
  description: string;
  type: CalendarType;
  audience: EventAudience;
  department?: string;
  semester?: number;
  venue: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  createdBy: string;
}

export interface AcademicCalendarRequest {
  title: string;
  description: string;
  type: CalendarType;
  audience: EventAudience;
  departmentId?: number;
  semester?: number;
  venue: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  createdByUserId: number;
}

export type NoticePriority = "NORMAL" | "IMPORTANT" | "URGENT";
export type ReceiverRole = "ALL" | "HOD" | "TEACHER" | "STUDENT";

export interface Notice {
  id: number;
  title: string;
  description: string;
  receiverRole: ReceiverRole;
  priority: NoticePriority;
  department?: string;
  semester?: number;
  targetUserName?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  createdByUserId?: number;
  createdBy: string;
  createdAt: string;
  expiryDate?: string;
}

export interface NoticeRequest {
  title: string;
  description: string;
  receiverRole: ReceiverRole;
  priority: NoticePriority;
  departmentId?: number;
  semester?: number;
  targetUserId?: number;
  createdByUserId: number;
  expiryDate?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  userId: number;
  createdAt: string;
}

export interface StudentDashboard {
  studentName: string;
  overallAttendance: number;
  todayTimetable: TimetableEntry[];
  academicCalendar: AcademicCalendarEntry[];
  leaveStatistics: LeaveStatistics;
  semester: number;
  departmentName: string;
}

export interface TeacherDashboard {
  teacherName: string;
  todaySchedule: TimetableEntry[];
  pendingStudentLeaves: number;
  academicCalendar: AcademicCalendarEntry[];
}

export interface PrincipalDashboard {
  totalDepartments: number;
  totalStudents: number;
  totalTeachers: number;
  pendingLeaveApprovals: number;
  totalNotices: number;
}

export interface HodDashboard {
  hodName: string;
  departmentName: string;
  totalStudents: number;
  totalTeachers: number;
  pendingLeaves: number;
  classesToday: number;
  activeSubjects: number;
}

export interface AuthSession {
  token: string;
  role: Role;
  email: string;
  profileId?: number;
  userId?: number;
  departmentId?: number;
  semester?: number;
  displayName?: string;
  photoUrl?: string | null;
}

export interface ProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: Role;
  departmentId: number | null;
  semester: number | null;
  photoUrl: string | null;
}
