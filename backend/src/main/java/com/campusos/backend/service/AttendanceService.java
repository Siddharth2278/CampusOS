package com.campusos.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campusos.backend.dto.AttendanceItem;
import com.campusos.backend.dto.AttendanceRequest;
import com.campusos.backend.entity.Attendance;
import com.campusos.backend.entity.Student;
import com.campusos.backend.entity.Subject;
import com.campusos.backend.entity.Teacher;
import com.campusos.backend.enums.AttendanceStatus;
import com.campusos.backend.repository.AttendanceRepository;
import com.campusos.backend.repository.StudentRepository;
import com.campusos.backend.repository.SubjectRepository;
import com.campusos.backend.repository.TeacherRepository;
import com.campusos.backend.repository.FacultyAssignmentRepository;
import com.campusos.backend.entity.User;
import com.campusos.backend.repository.UserRepository;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final FacultyAssignmentRepository facultyAssignmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            StudentRepository studentRepository,
            SubjectRepository subjectRepository,
            TeacherRepository teacherRepository, FacultyAssignmentRepository facultyAssignmentRepository, UserRepository userRepository, NotificationService notificationService) {

        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.notificationService = notificationService;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
        this.facultyAssignmentRepository = facultyAssignmentRepository;
        this.userRepository = userRepository;
    }

    // Save Attendance
    public String saveAttendance(AttendanceRequest request, String email) {

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        User actor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Teacher actorTeacher = teacherRepository.findByUser(actor)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (!teacher.getId().equals(actorTeacher.getId())) {
            throw new RuntimeException("You can mark attendance only as your own teacher account.");
        }
        if (subject.getDepartment() == null || teacher.getDepartment() == null ||
                !subject.getDepartment().getId().equals(teacher.getDepartment().getId()) ||
                !facultyAssignmentRepository.existsByTeacherAndSubject(teacher, subject)) {
            throw new RuntimeException("This subject is not assigned to you by the HOD.");
        }

        int savedCount = 0;

        for (AttendanceItem item : request.getAttendanceItems()) {

            Student student = studentRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            boolean exists = attendanceRepository
                    .existsByStudentIdAndSubjectIdAndAttendanceDateAndLectureNumber(
                            item.getStudentId(),
                            request.getSubjectId(),
                            request.getAttendanceDate(),
                            request.getLectureNumber());

            if (exists) {
                continue;
            }

            Attendance attendance = new Attendance();

            attendance.setStudent(student);
            attendance.setSubject(subject);
            attendance.setTeacher(teacher);
            attendance.setAttendanceDate(request.getAttendanceDate());
            attendance.setLectureNumber(request.getLectureNumber());
            attendance.setStatus(
                    AttendanceStatus.valueOf(item.getStatus().toUpperCase()));

            attendanceRepository.save(attendance);

            notificationService.createNotification(
                    student.getUser().getId(),
                    "Attendance recorded",
                    "You were marked " + attendance.getStatus() + " for " + subject.getName()
                            + " (Lecture " + request.getLectureNumber() + ", "
                            + request.getAttendanceDate() + ").",
                    "ATTENDANCE");

            savedCount++;
        }

        if (savedCount == 0) {
            return "Attendance already marked.";
        }

        return savedCount + " attendance record(s) saved successfully.";
    }

    // Student subject-wise attendance history
    public List<Attendance> getStudentSubjectAttendance(
            Long studentId,
            Long subjectId) {

        return attendanceRepository
                .findByStudentIdAndSubjectIdOrderByAttendanceDateDesc(
                        studentId,
                        subjectId);
    }

    // Student today's attendance
    public List<Attendance> getTodayAttendance(Long studentId) {

        return attendanceRepository.findByStudentIdAndAttendanceDate(
                studentId,
                LocalDate.now());
    }

    // Teacher attendance sheet
    public List<Attendance> getAttendanceBySubject(
            Long subjectId,
            LocalDate date) {

        return attendanceRepository.findBySubjectIdAndAttendanceDate(
                subjectId,
                date);
    }

    // Complete attendance of one student
    public List<Attendance> getStudentAttendance(Long studentId) {

        return attendanceRepository.findByStudentId(studentId);
    }

    // Filterable attendance report for download
    public List<Attendance> getAttendanceReport(Long subjectId, LocalDate fromDate, LocalDate toDate) {
        return attendanceRepository
                .findBySubjectIdAndAttendanceDateBetweenOrderByAttendanceDateAscStudentRollNumberAsc(
                        subjectId, fromDate, toDate);
    }

    // Overall Attendance Percentage
public Double getOverallAttendancePercentage(Long studentId) {

    long totalLectures = attendanceRepository.countByStudentId(studentId);

    if (totalLectures == 0) {
        return 0.0;
    }

    long presentLectures = attendanceRepository.countByStudentIdAndStatus(
            studentId,
            AttendanceStatus.PRESENT);

    return Math.round((presentLectures * 10000.0 / totalLectures)) / 100.0;
}
}