import type {
  AcademicCalendarEntry,
  AcademicCalendarRequest,
  Assignment,
  AssignmentSubmission,
  AssignmentSubmissionStatus,
  AttendanceRecord,
  AttendanceRequest,
  Department,
  Exam,
  ExamRequest,
  FacultyAssignment,
  LeaveDecisionRequest,
  LeaveRequestPayload,
  LeaveResponse,
  LeaveStatistics,
  LoginResponse,
  Notice,
  Notification,
  PrincipalDashboard,
  HodDashboard,
  AuthMeResponse,
  ProfileResponse,
  RegisterRequest,
  Student,
  StudentDashboard,
  Subject,
  Teacher,
  TeacherDashboard,
  TimetableEntry,
  TimetableRequest,
} from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  form?: FormData;
  silent?: boolean;
};

function buildQuery(query?: RequestOptions["query"]) {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token, query, form, silent = false } = options;

  const headers: Record<string, string> = {};
  let authToken = token;
  if (!authToken && typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem("campusos_session");
      authToken = raw ? (JSON.parse(raw) as { token?: string }).token : undefined;
    } catch {
      authToken = undefined;
    }
  }
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let requestBody: BodyInit | undefined;
  if (form) {
    requestBody = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}${buildQuery(query)}`, {
    method,
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || `Request failed (${response.status})`, response.status);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const data = await response.json() as T;
    if (method !== "GET" && !silent && typeof window !== "undefined") window.dispatchEvent(new Event("campusos:data-changed"));
    return data;
  }

  const text = await response.text();
  if (method !== "GET" && !silent && typeof window !== "undefined") {
    window.dispatchEvent(new Event("campusos:data-changed"));
  }
  return text as T;
}

export const api = {
  // ---------- Auth ----------
  login: (body: { email: string; password: string }) =>
    apiRequest<LoginResponse>("/api/auth/login", { method: "POST", body }),
  me: () => apiRequest<AuthMeResponse>("/api/auth/me"),
  getLastRoute: (token?: string) =>
    apiRequest<{ route: string | null }>("/api/auth/last-route", { token }),
  saveLastRoute: (route: string, token?: string) =>
    apiRequest<string>("/api/auth/last-route", {
      method: "PUT",
      body: { route },
      token,
      silent: true,
    }),

  registerStudent: (body: RegisterRequest) =>
    apiRequest<string>("/api/auth/register/student", { method: "POST", body }),

  registerTeacher: (body: RegisterRequest) =>
    apiRequest<string>("/api/auth/register/teacher", { method: "POST", body }),

  registerPrincipal: (body: RegisterRequest) =>
    apiRequest<string>("/api/auth/register/principal", { method: "POST", body }),
  principalExists: () => apiRequest<boolean>("/api/auth/principal-exists"),
  deleteOwnAccount: () => apiRequest<string>("/api/auth/me", { method: "DELETE" }),

  // ---------- Profile ----------
  getProfile: () => apiRequest<ProfileResponse>("/api/profile"),
  updateProfile: (body: { firstName: string; lastName: string; email: string; phone?: string }) =>
    apiRequest<ProfileResponse>("/api/profile", { method: "PUT", body }),
  uploadProfilePhoto: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest<ProfileResponse>("/api/profile/photo", { method: "POST", form });
  },
  removeProfilePhoto: () =>
    apiRequest<ProfileResponse>("/api/profile/photo", { method: "DELETE" }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiRequest<string>("/api/auth/change-password", { method: "POST", body }),

  requestPasswordOtp: (email: string) =>
    apiRequest<{ message: string }>("/api/auth/forgot-password/request-otp", {
      method: "POST",
      body: { email },
    }),
  verifyPasswordOtp: (email: string, otp: string) =>
    apiRequest<{ message: string }>("/api/auth/forgot-password/verify-otp", {
      method: "POST",
      body: { email, otp },
    }),
  resetPassword: (body: { email: string; otp: string; newPassword: string }) =>
    apiRequest<{ message: string }>("/api/auth/forgot-password/reset", {
      method: "POST",
      body,
    }),

  // ---------- Directory (single institution) ----------
  getDepartments: () => apiRequest<Department[]>("/api/departments"),
  createDepartment: (body: { name: string; code: string; description?: string }) =>
    apiRequest<Department>("/api/departments", { method: "POST", body }),
  updateDepartment: (id: number, body: { name: string; code: string; description?: string }) =>
    apiRequest<Department>(`/api/departments/${id}`, { method: "PUT", body }),
  deleteDepartment: (id: number) =>
    apiRequest<string>(`/api/departments/${id}`, { method: "DELETE" }),

  getSubjects: () => apiRequest<Subject[]>("/api/subjects"),
  createSubject: (body: {
    name: string;
    code: string;
    department: { id: number };
    semester: number;
    academicYear: string;
  }) => apiRequest<Subject>("/api/subjects", { method: "POST", body }),

  getStudents: () => apiRequest<Student[]>("/api/students"),

  getTeachers: () => apiRequest<Teacher[]>("/api/teachers"),
  getHodCandidates: (departmentId: number) =>
    apiRequest<Teacher[]>("/api/teachers/hod-candidates", { query: { departmentId } }),
  makeHod: (teacherId: number) =>
    apiRequest<Teacher>(`/api/teachers/${teacherId}/make-hod`, { method: "PUT" }),
  removeHod: (departmentId: number) =>
    apiRequest<Teacher>(`/api/teachers/hod/${departmentId}`, { method: "DELETE" }),
  updateTeacher: (teacherId: number, body: { firstName?: string; lastName?: string; phone?: string; department?: { id: number } }) =>
    apiRequest<Teacher>(`/api/teachers/${teacherId}`, { method: "PUT", body }),
  deleteTeacher: (teacherId: number) =>
    apiRequest<string>(`/api/teachers/${teacherId}`, { method: "DELETE" }),
  assignClassTeacher: (teacherId: number, semester: number) =>
    apiRequest<Teacher>(`/api/teachers/${teacherId}/class-teacher`, {
      method: "PUT",
      query: { semester },
    }),
  removeClassTeacher: (teacherId: number) =>
    apiRequest<Teacher>(`/api/teachers/${teacherId}/class-teacher`, { method: "DELETE" }),

  // ---------- Approvals ----------
  pendingTeachers: () => apiRequest<Teacher[]>("/api/approvals/teachers"),
  approveTeacher: (id: number, approved: boolean) =>
    apiRequest<string>(`/api/approvals/teachers/${id}`, { method: "PUT", body: { approved } }),
  pendingStudents: () => apiRequest<Student[]>("/api/approvals/students"),
  approveStudent: (id: number, approved: boolean) =>
    apiRequest<string>(`/api/approvals/students/${id}`, { method: "PUT", body: { approved } }),

  getFacultyAssignments: () =>
    apiRequest<FacultyAssignment[]>("/api/faculty-assignments"),
  getMyFacultyAssignments: () =>
    apiRequest<FacultyAssignment[]>("/api/faculty-assignments/mine"),
  createFacultyAssignment: (body: { teacher: { id: number }; subject: { id: number } }) =>
    apiRequest<FacultyAssignment>("/api/faculty-assignments", { method: "POST", body }),
  updateFacultyAssignment: (id: number, body: { teacher: { id: number }; subject: { id: number } }) =>
    apiRequest<FacultyAssignment>(`/api/faculty-assignments/${id}`, { method: "PUT", body }),
  deleteFacultyAssignment: (id: number) =>
    apiRequest<string>(`/api/faculty-assignments/${id}`, { method: "DELETE" }),

  // ---------- Dashboards ----------
  getStudentDashboard: () =>
    apiRequest<StudentDashboard>("/api/dashboard/student"),

  getTeacherDashboard: () =>
    apiRequest<TeacherDashboard>("/api/dashboard/teacher"),

  getHodDashboard: () => apiRequest<HodDashboard>("/api/dashboard/hod"),
  getPrincipalDashboard: () =>
    apiRequest<PrincipalDashboard>("/api/dashboard/principal"),

  // ---------- Notices ----------
  getNotices: () => apiRequest<Notice[]>("/api/notices"),
  createNotice: (form: FormData) =>
    apiRequest<string>("/api/notices", { method: "POST", form }),
  updateNotice: (id: number, form: FormData) =>
    apiRequest<string>(`/api/notices/${id}`, { method: "PUT", form }),
  deleteNotice: (id: number) =>
    apiRequest<string>(`/api/notices/${id}`, { method: "DELETE" }),

  // ---------- Notifications ----------
  getNotifications: (userId: number) =>
    apiRequest<Notification[]>(`/api/notifications/user/${userId}`),
  getUnreadCount: (userId: number) =>
    apiRequest<number>(`/api/notifications/user/${userId}/unread-count`),
  markNotificationRead: (notificationId: number) =>
    apiRequest<Notification>(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
    }),
  markAllNotificationsRead: (userId: number) =>
    apiRequest<number>(`/api/notifications/user/${userId}/read-all`, {
      method: "PUT",
    }),
  deleteNotification: (notificationId: number) =>
    apiRequest<string>(`/api/notifications/${notificationId}`, { method: "DELETE" }),

  // ---------- Academic calendar ----------
  getAllCalendar: () => apiRequest<AcademicCalendarEntry[]>("/api/academic-calendar"),
  getStudentCalendar: (departmentId: number, semester: number) =>
    apiRequest<AcademicCalendarEntry[]>("/api/academic-calendar/student", {
      query: { departmentId, semester },
    }),
  getHodCalendar: (departmentId:number) => apiRequest<AcademicCalendarEntry[]>(`/api/academic-calendar/hod`, { query:{departmentId} }),
  getTeacherCalendar: (departmentId: number) =>
    apiRequest<AcademicCalendarEntry[]>("/api/academic-calendar/teacher", {
      query: { departmentId },
    }),
  createCalendarEvent: (body: AcademicCalendarRequest) =>
    apiRequest<string>("/api/academic-calendar", { method: "POST", body }),

  // ---------- Attendance ----------
  markAttendance: (body: AttendanceRequest) =>
    apiRequest<string>("/api/attendance", { method: "POST", body }),
  getStudentAttendance: (studentId: number) =>
    apiRequest<AttendanceRecord[]>(`/api/attendance/student/${studentId}`),
  getStudentSubjectAttendance: (studentId: number, subjectId: number) =>
    apiRequest<AttendanceRecord[]>(
      `/api/attendance/student/${studentId}/subject/${subjectId}`,
    ),
  getTodayAttendance: (studentId: number) =>
    apiRequest<AttendanceRecord[]>(`/api/attendance/student/${studentId}/today`),
  getAttendanceBySubject: (subjectId: number, date: string) =>
    apiRequest<AttendanceRecord[]>(`/api/attendance/subject/${subjectId}`, {
      query: { date },
    }),

  // ---------- Assignments ----------
  createAssignment: (form: FormData) =>
    apiRequest<Assignment>("/api/assignments", { method: "POST", form }),
  getTeacherAssignments: (teacherId: number) =>
    apiRequest<Assignment[]>(`/api/assignments/teacher/${teacherId}`),
  getSubjectAssignments: (subjectId: number) =>
    apiRequest<Assignment[]>(`/api/assignments/subject/${subjectId}`),

  // ---------- Assignment submissions ----------
  createSubmission: (assignmentId: number, studentId: number) =>
    apiRequest<AssignmentSubmission>("/api/assignment-submissions", {
      method: "POST",
      query: { assignmentId, studentId },
    }),
  getAssignmentSubmissions: (assignmentId: number) =>
    apiRequest<AssignmentSubmission[]>(
      `/api/assignment-submissions/assignment/${assignmentId}`,
    ),
  getStudentSubmissions: (studentId: number) =>
    apiRequest<AssignmentSubmission[]>(
      `/api/assignment-submissions/student/${studentId}`,
    ),
  updateSubmissionStatus: (
    submissionId: number,
    status: AssignmentSubmissionStatus,
    remarks?: string,
  ) =>
    apiRequest<AssignmentSubmission>(
      `/api/assignment-submissions/${submissionId}/status`,
      { method: "PUT", query: { status, remarks } },
    ),

  // ---------- Exams ----------
  createExam: (body: ExamRequest) =>
    apiRequest<Exam>("/api/exams", { method: "POST", body }),
  updateExam: (examId: number, body: ExamRequest) =>
    apiRequest<Exam>(`/api/exams/${examId}`, { method: "PUT", body }),
  deleteExam: (examId: number) =>
    apiRequest<string>(`/api/exams/${examId}`, { method: "DELETE" }),
  getDepartmentSemesterExams: (departmentId: number, semester: number) =>
    apiRequest<Exam[]>(`/api/exams/department/${departmentId}/semester/${semester}`),
  getStudentExamSchedule: (departmentId: number, semester: number) =>
    apiRequest<Exam[]>(`/api/exams/student/${departmentId}/${semester}`),
  getSubjectExams: (subjectId: number) =>
    apiRequest<Exam[]>(`/api/exams/subject/${subjectId}`),

  // ---------- Leaves ----------
  applyLeave: (body: LeaveRequestPayload) =>
    apiRequest<string>("/api/leaves", { method: "POST", body }),
  getMyLeaves: (userId: number) =>
    apiRequest<LeaveResponse[]>(`/api/leaves/my/${userId}`),
  getLeaveStatistics: (userId: number) =>
    apiRequest<LeaveStatistics>(`/api/leaves/statistics/${userId}`),
  decideLeave: (leaveId: number, body: LeaveDecisionRequest) =>
    apiRequest<string>(`/api/leaves/${leaveId}/decision`, { method: "PUT", body }),
  getClassTeacherPendingLeaves: () =>
    apiRequest<LeaveResponse[]>("/api/leaves/class-teacher/pending"),
  getHodPendingLeaves: () => apiRequest<LeaveResponse[]>("/api/leaves/hod/pending"),
  getPrincipalPendingLeaves: () =>
    apiRequest<LeaveResponse[]>("/api/leaves/principal/pending"),

  // ---------- Timetable ----------
  createTimetableEntry: (body: TimetableRequest) =>
    apiRequest<string>("/api/timetable", { method: "POST", body }),
  updateTimetableEntry: (id: number, body: TimetableRequest) =>
    apiRequest<string>(`/api/timetable/${id}`, { method: "PUT", body }),
  deleteTimetableEntry: (id: number) =>
    apiRequest<string>(`/api/timetable/${id}`, { method: "DELETE" }),
  getSemesterTimetable: (semester: number) =>
    apiRequest<TimetableEntry[]>(`/api/timetable/semester/${semester}`),
  getWeeklyTimetable: (semester: number) =>
    apiRequest<TimetableEntry[]>(`/api/timetable/weekly/${semester}`),
  getTeacherTimetable: (teacherId: number) =>
    apiRequest<TimetableEntry[]>(`/api/timetable/teacher/${teacherId}`),

  // ---------- Semester Upgrade ----------
  upgradeSemester: (departmentId: number, fromSemester: number) =>
    apiRequest<string>(`/api/students/upgrade-semester`, {
      method: "PUT",
      query: { departmentId, fromSemester },
    }),
};
