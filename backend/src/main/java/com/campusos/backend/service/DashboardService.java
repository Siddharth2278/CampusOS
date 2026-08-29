package com.campusos.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.campusos.backend.dto.AcademicCalendarResponse;
import com.campusos.backend.dto.StudentDashboardResponse;
import com.campusos.backend.dto.TeacherDashboardResponse;
import com.campusos.backend.dto.TimetableResponse;
import com.campusos.backend.entity.Student;
import com.campusos.backend.entity.Teacher;
import com.campusos.backend.entity.User;
import com.campusos.backend.enums.UserStatus;
import com.campusos.backend.repository.AssignmentRepository;
import com.campusos.backend.repository.DepartmentRepository;
import com.campusos.backend.repository.NoticeRepository;
import com.campusos.backend.repository.SubjectRepository;
import com.campusos.backend.repository.UserRepository;
import com.campusos.backend.repository.StudentRepository;
import com.campusos.backend.repository.TeacherRepository;
import com.campusos.backend.dto.PrincipalDashboardResponse;


@Service
public class DashboardService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AttendanceService attendanceService;
    private final TimetableService timetableService;
    private final LeaveService leaveService;
    private final AcademicCalendarService academicCalendarService;
        private final DepartmentRepository departmentRepository;
        private final AssignmentRepository assignmentRepository;
        private final NoticeRepository noticeRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public DashboardService(
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            AttendanceService attendanceService,
            TimetableService timetableService,
            LeaveService leaveService,
            DepartmentRepository departmentRepository,
            AssignmentRepository assignmentRepository,
            NoticeRepository noticeRepository,
            AcademicCalendarService academicCalendarService,
            SubjectRepository subjectRepository,
            UserRepository userRepository) {

        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.departmentRepository = departmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.noticeRepository = noticeRepository;               
        this.attendanceService = attendanceService;
        this.timetableService = timetableService;
        this.leaveService = leaveService;
        this.academicCalendarService = academicCalendarService;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    public StudentDashboardResponse getStudentDashboardForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        return getStudentDashboard(student.getId());
    }

    public TeacherDashboardResponse getTeacherDashboardForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));
        return getTeacherDashboard(teacher.getId());
    }

    // ================= STUDENT DASHBOARD =================

    public StudentDashboardResponse getStudentDashboard(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        StudentDashboardResponse response = new StudentDashboardResponse();

        response.setStudentName(
                student.getFirstName() + " " + student.getLastName());

        response.setSemester(student.getSemester());

        response.setDepartmentName(
                student.getDepartment().getName());

        response.setOverallAttendance(
                attendanceService.getOverallAttendancePercentage(studentId));

        List<TimetableResponse> timetable =
                timetableService.getTodayTimetable(student.getDepartment().getId(), student.getSemester());

        response.setTodayTimetable(timetable);

        List<AcademicCalendarResponse> calendar =
                academicCalendarService.getStudentCalendar(
                        student.getDepartment().getId(),
                        student.getSemester());

        response.setAcademicCalendar(calendar);

        response.setLeaveStatistics(
        leaveService.getMyStatistics(student.getUser().getId()));

        return response;
    }

    // ================= TEACHER DASHBOARD =================

    public TeacherDashboardResponse getTeacherDashboard(Long teacherId) {

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        TeacherDashboardResponse response = new TeacherDashboardResponse();

        response.setTeacherName(
                teacher.getFirstName() + " " + teacher.getLastName());

        response.setTodaySchedule(
                timetableService.getTeacherTimetable(teacherId));

        List<AcademicCalendarResponse> calendar =
                academicCalendarService.getTeacherCalendar(
                        teacher.getDepartment().getId());

        response.setAcademicCalendar(calendar);

        response.setPendingStudentLeaves(
        leaveService.getPendingStudentLeavesCount());

        return response;
    }
    
// HOD dashboard
public com.campusos.backend.dto.HodDashboardResponse getHodDashboard(String email) {
    Teacher hod = teacherRepository.findByUser(
            userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found")))
            .orElseThrow(() -> new RuntimeException("HOD profile not found"));

    if (!Boolean.TRUE.equals(hod.getHod())) {
        throw new RuntimeException("User is not an HOD");
    }

    Long departmentId = hod.getDepartment().getId();
    long students = studentRepository.findByDepartmentId(departmentId).stream()
            .filter(s -> s.getUser() != null && s.getUser().getStatus() == UserStatus.APPROVED).count();
    long teachers = teacherRepository.findByDepartmentId(departmentId).stream()
            .filter(t -> t.getUser() != null && t.getUser().getStatus() == UserStatus.APPROVED).count();
    long subjects = subjectRepository.countByDepartmentId(departmentId);
    long pendingLeaves = leaveService.getPendingForHod(email).stream().filter(l -> true).count();
    long classesToday = timetableService.getTodayDepartmentTimetable(departmentId).size();

    return new com.campusos.backend.dto.HodDashboardResponse(
            hod.getFirstName() + " " + hod.getLastName(),
            hod.getDepartment().getName(), students, teachers, pendingLeaves, classesToday, subjects);
}

// Principal dashboard: only real, currently stored campus metrics are exposed.
public PrincipalDashboardResponse getPrincipalDashboard(String email) {
    return new PrincipalDashboardResponse(
            departmentRepository.count(),
            studentRepository.countByUser_Status(UserStatus.APPROVED),
            teacherRepository.countByUser_Status(UserStatus.APPROVED),
            leaveService.getPendingForPrincipal(email).size(),
            noticeRepository.count());
}
}