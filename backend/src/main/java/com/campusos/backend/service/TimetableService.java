package com.campusos.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.campusos.backend.dto.TimetableRequest;
import com.campusos.backend.dto.TimetableResponse;
import com.campusos.backend.entity.Department;
import com.campusos.backend.entity.Subject;
import com.campusos.backend.entity.Teacher;
import com.campusos.backend.entity.Timetable;
import com.campusos.backend.repository.DepartmentRepository;
import com.campusos.backend.repository.SubjectRepository;
import com.campusos.backend.repository.TeacherRepository;
import com.campusos.backend.repository.TimetableRepository;
import com.campusos.backend.repository.FacultyAssignmentRepository;
import com.campusos.backend.repository.UserRepository;

@Service
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final FacultyAssignmentRepository facultyAssignmentRepository;
    private final UserRepository userRepository;

    public TimetableService(
            TimetableRepository timetableRepository,
            DepartmentRepository departmentRepository,
            SubjectRepository subjectRepository,
            TeacherRepository teacherRepository, FacultyAssignmentRepository facultyAssignmentRepository, UserRepository userRepository) {

        this.timetableRepository = timetableRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
        this.facultyAssignmentRepository = facultyAssignmentRepository;
        this.userRepository = userRepository;
    }

    // Create Timetable
    public String createTimetable(TimetableRequest request,String email) {

        var actor=userRepository.findByEmail(email).orElseThrow(); var hod=teacherRepository.findByUser(actor).orElseThrow(); if(!Boolean.TRUE.equals(hod.getHod()) || hod.getDepartment()==null || !hod.getDepartment().getId().equals(request.getDepartmentId())) throw new RuntimeException("Only the HOD of this department can edit its timetable");

        boolean exists = timetableRepository
                .existsByDepartmentIdAndSemesterAndDayAndLectureNumber(
                        request.getDepartmentId(),
                        request.getSemester(),
                        request.getDay(),
                        request.getLectureNumber());

        if (exists) {
            return "Timetable already exists for this lecture.";
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (subject.getDepartment() == null || teacher.getDepartment() == null ||
                !hod.getDepartment().getId().equals(subject.getDepartment().getId()) ||
                !hod.getDepartment().getId().equals(teacher.getDepartment().getId()) ||
                !subject.getSemester().equals(request.getSemester())) {
            throw new RuntimeException("Timetable subject and teacher must belong to your department and the selected semester.");
        }
        if (!facultyAssignmentRepository.existsByTeacherAndSubject(teacher, subject)) {
            throw new RuntimeException("This subject is not assigned to this teacher by the HOD.");
        }

        if (subject.getDepartment() == null || teacher.getDepartment() == null ||
                !hod.getDepartment().getId().equals(subject.getDepartment().getId()) ||
                !hod.getDepartment().getId().equals(teacher.getDepartment().getId()) ||
                !subject.getSemester().equals(request.getSemester())) {
            throw new RuntimeException("Timetable subject and teacher must belong to your department and the selected semester.");
        }
        if (!facultyAssignmentRepository.existsByTeacherAndSubject(teacher, subject)) {
            throw new RuntimeException("This subject is not assigned to this teacher by the HOD.");
        }
        boolean teacherBusy = timetableRepository
        .existsByTeacherIdAndDayAndStartTimeLessThanAndEndTimeGreaterThan(
                request.getTeacherId(),
                request.getDay(),
                request.getEndTime(),
                request.getStartTime());

if (teacherBusy) {
    return "Teacher is already assigned during this time.";
}

        Timetable timetable = new Timetable();

        timetable.setDepartment(department);
        timetable.setSemester(request.getSemester());
        timetable.setDay(request.getDay());
        timetable.setLectureNumber(request.getLectureNumber());
        timetable.setSessionType(request.getSessionType());
        timetable.setSubject(subject);
        timetable.setTeacher(teacher);
        timetable.setStartTime(request.getStartTime());
        timetable.setEndTime(request.getEndTime());

        timetableRepository.save(timetable);

        return "Timetable created successfully.";
    }
    // Update Timetable
public String updateTimetable(Long id, TimetableRequest request,String email) {

    Timetable timetable = timetableRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Timetable not found"));
        var actor=userRepository.findByEmail(email).orElseThrow();
        var hod=teacherRepository.findByUser(actor).orElseThrow();
        if(!Boolean.TRUE.equals(hod.getHod()) || hod.getDepartment()==null || !hod.getDepartment().getId().equals(timetable.getDepartment().getId())) throw new RuntimeException("Only the HOD of this department can edit its timetable");

    Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new RuntimeException("Department not found"));

    Subject subject = subjectRepository.findById(request.getSubjectId())
            .orElseThrow(() -> new RuntimeException("Subject not found"));

    Teacher teacher = teacherRepository.findById(request.getTeacherId())
            .orElseThrow(() -> new RuntimeException("Teacher not found"));

    timetable.setDepartment(department);
    timetable.setSemester(request.getSemester());
    timetable.setDay(request.getDay());
    timetable.setLectureNumber(request.getLectureNumber());
    timetable.setSessionType(request.getSessionType());
    timetable.setSubject(subject);
    timetable.setTeacher(teacher);
    timetable.setStartTime(request.getStartTime());
    timetable.setEndTime(request.getEndTime());

    timetableRepository.save(timetable);

    return "Timetable updated successfully.";
}
        // Delete Timetable
public String deleteTimetable(Long id,String email) {

    Timetable timetable = timetableRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Timetable not found"));
    var actor=userRepository.findByEmail(email).orElseThrow(); var hod=teacherRepository.findByUser(actor).orElseThrow(); if(!Boolean.TRUE.equals(hod.getHod()) || hod.getDepartment()==null || !hod.getDepartment().getId().equals(timetable.getDepartment().getId())) throw new RuntimeException("Only the HOD of this department can edit its timetable");

    timetableRepository.delete(timetable);

    return "Timetable deleted successfully.";
}
// Weekly Timetable
public List<TimetableResponse> getWeeklyTimetable(Integer semester) {

    return timetableRepository
            .findBySemesterOrderByDayAscStartTimeAsc(semester)
            .stream()
            .map(this::mapToResponse)
            .toList();
}
    // Student Timetable
    public List<TimetableResponse> getSemesterTimetable(Integer semester) {

        return timetableRepository
                .findBySemesterOrderByDayAscLectureNumberAsc(semester)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TimetableResponse> getDepartmentSemesterTimetable(Long departmentId, Integer semester) {
        return timetableRepository
                .findByDepartmentIdAndSemesterOrderByDayAscLectureNumberAsc(departmentId, semester)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
        public List<TimetableResponse> getTodayTimetable(Long departmentId, Integer semester) {
        java.time.DayOfWeek dow = java.time.LocalDate.now().getDayOfWeek();
        if (dow == java.time.DayOfWeek.SUNDAY) {
            return java.util.List.of();
        }
        com.campusos.backend.enums.WeekDay today =
                com.campusos.backend.enums.WeekDay.valueOf(dow.name());
        return timetableRepository
                .findByDepartmentIdAndSemesterAndDayOrderByLectureNumberAsc(departmentId, semester, today)
                .stream().map(this::mapToResponse).toList();
    }
    public List<TimetableResponse> getTodayDepartmentTimetable(Long departmentId) {
        java.time.DayOfWeek dow = java.time.LocalDate.now().getDayOfWeek();
        if (dow == java.time.DayOfWeek.SUNDAY) {
            return java.util.List.of();
        }
        com.campusos.backend.enums.WeekDay today =
                com.campusos.backend.enums.WeekDay.valueOf(dow.name());
        return timetableRepository.findAll().stream()
                .filter(t -> t.getDepartment().getId().equals(departmentId))
                .filter(t -> t.getDay() == today)
                .map(this::mapToResponse).toList();
    }

    // Teacher Timetable
    public List<TimetableResponse> getTeacherTimetable(Long teacherId) {

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
            

        return timetableRepository
                .findByTeacherOrderByDayAscLectureNumberAsc(teacher)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TimetableResponse mapToResponse(Timetable timetable) {

        return new TimetableResponse(
                timetable.getId(),
                timetable.getDepartment().getName(),
                timetable.getSemester(),
                timetable.getDay(),
                timetable.getLectureNumber(),
                timetable.getSessionType(),
                timetable.getSubject().getName(),
                timetable.getTeacher().getFirstName() + " " + timetable.getTeacher().getLastName(),
                timetable.getStartTime(),
                timetable.getEndTime());
    }
}