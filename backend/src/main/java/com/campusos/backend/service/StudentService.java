package com.campusos.backend.service;

import com.campusos.backend.entity.Student;
import com.campusos.backend.entity.Teacher;
import com.campusos.backend.entity.User;
import com.campusos.backend.enums.Role;
import com.campusos.backend.enums.UserStatus;
import com.campusos.backend.repository.StudentRepository;
import com.campusos.backend.repository.TeacherRepository;
import com.campusos.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public StudentService(
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder) {

        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }

    public List<Student> getAllStudents() {
        // Only show approved students; pending/rejected registrations stay hidden everywhere.
        return studentRepository.findAll().stream()
                .filter(s -> s.getUser() != null && s.getUser().getStatus() == UserStatus.APPROVED)
                .toList();
    }

    // Teacher creates student
    public Student createStudentByTeacher(Long teacherId, Student student) {

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (teacher.getDepartment() == null) {
            throw new RuntimeException(
                    "Teacher is not assigned to a department");
        }

        if (student.getUser() == null) {
            throw new RuntimeException("User information is required");
        }

        // Automatically use teacher's department
        student.setDepartment(teacher.getDepartment());

        // Student account
        User user = student.getUser();
        user.setRole(Role.STUDENT);
user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Save User first
        User savedUser = userRepository.save(user);

        // Attach saved User
        student.setUser(savedUser);

        // Save Student
        return studentRepository.save(student);
    }

    /**
     * Promote a student to the next semester. Only the HOD of the student's
     * department may perform this. Subjects stay the same (curriculum is per
     * department); only the semester advances. Capped at 6.
     */
    public Student promoteSemester(Long studentId, String email) {
        User actor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        Teacher hod = teacherRepository.findByUser(actor).orElse(null);
        if (hod == null || !Boolean.TRUE.equals(hod.getHod()) || hod.getDepartment() == null) {
            throw new RuntimeException("Only the HOD can promote a student's semester.");
        }
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found."));
        if (student.getDepartment() == null
                || !student.getDepartment().getId().equals(hod.getDepartment().getId())) {
            throw new RuntimeException("You can only promote students in your own department.");
        }
        if (student.getSemester() == null) {
            throw new RuntimeException("Student has no semester set.");
        }
        if (student.getSemester() >= 6) {
            throw new RuntimeException("Student is already in the final (6th) semester.");
        }
        student.setSemester(student.getSemester() + 1);
        return studentRepository.save(student);
    }

    /**
     * Remove a student's record (e.g. after completing the year / graduating).
     * Allowed for the HOD of the student's department or the Principal.
     */
    public void deleteStudent(Long studentId, String email) {
        User actor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found."));

        boolean isPrincipal = actor.getRole() == Role.PRINCIPAL;
        Teacher teacher = teacherRepository.findByUser(actor).orElse(null);
        boolean isDeptHod = teacher != null && Boolean.TRUE.equals(teacher.getHod())
                && teacher.getDepartment() != null
                && student.getDepartment() != null
                && teacher.getDepartment().getId().equals(student.getDepartment().getId());

        if (!isPrincipal && !isDeptHod) {
            throw new RuntimeException("Only the HOD of this department or the Principal can remove this student.");
        }

        // Remove the linked user account and any attendance/leave traces first.
        User user = student.getUser();
        studentRepository.delete(student);
        if (user != null) userRepository.delete(user);
    }

    /**
     * Returns students with phone numbers masked unless the viewer is allowed to
     * see them: Principal (anyone), the department HOD (anyone in their dept),
     * or the assigned Class Teacher (only their own class).
     */
    public List<Student> getStudentsVisibleTo(String email) {
        User actor = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found."));
        Teacher actorTeacher = (actor.getRole() == Role.TEACHER || actor.getRole() == Role.HOD)
                ? teacherRepository.findByUser(actor).orElse(null) : null;
        boolean isPrincipal = actor.getRole() == Role.PRINCIPAL;
        boolean isHod = actorTeacher != null && Boolean.TRUE.equals(actorTeacher.getHod());
        Long hodDept = (isHod && actorTeacher.getDepartment() != null) ? actorTeacher.getDepartment().getId() : null;
        boolean isClassTeacher = actorTeacher != null && Boolean.TRUE.equals(actorTeacher.getClassTeacher())
                && actorTeacher.getClassTeacherSemester() != null && actorTeacher.getDepartment() != null;
        Long ctDept = isClassTeacher ? actorTeacher.getDepartment().getId() : null;
        Integer ctSem = isClassTeacher ? actorTeacher.getClassTeacherSemester() : null;

        return studentRepository.findAll().stream()
                .filter(s -> s.getUser() != null && s.getUser().getStatus() == UserStatus.APPROVED)
                .map(s -> {
                    boolean canSee = isPrincipal
                            || (hodDept != null && s.getDepartment() != null && hodDept.equals(s.getDepartment().getId()))
                            || (ctDept != null && ctSem != null && s.getDepartment() != null
                                && ctDept.equals(s.getDepartment().getId()) && ctSem.equals(s.getSemester()));
                    if (!canSee) s.setPhone(null);
                    return s;
                })
                .toList();
    }

    /**
     * Edit a student's basic details. Allowed for the HOD of the student's
     * department or the Principal. Phone must be 10 digits when provided.
     */
    public Student updateStudent(Long studentId, Student dto, String email) {
        User actor = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found."));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found."));
        boolean isPrincipal = actor.getRole() == Role.PRINCIPAL;
        Teacher teacher = teacherRepository.findByUser(actor).orElse(null);
        boolean isDeptHod = teacher != null && Boolean.TRUE.equals(teacher.getHod())
                && teacher.getDepartment() != null && student.getDepartment() != null
                && teacher.getDepartment().getId().equals(student.getDepartment().getId());
        if (!isPrincipal && !isDeptHod) {
            throw new RuntimeException("Only the HOD of this department or the Principal can edit this student.");
        }

        if (dto.getFirstName() != null && !dto.getFirstName().isBlank()) student.setFirstName(dto.getFirstName().trim());
        if (dto.getLastName() != null && !dto.getLastName().isBlank()) student.setLastName(dto.getLastName().trim());
        if (dto.getPhone() != null) {
            String phone = dto.getPhone().trim();
            if (!phone.matches("\\d{10}")) throw new RuntimeException("Phone number must be exactly 10 digits.");
            student.setPhone(phone);
        }
        if (dto.getSemester() != null) {
            if (dto.getSemester() < 1 || dto.getSemester() > 8) throw new RuntimeException("Semester must be between 1 and 8.");
            student.setSemester(dto.getSemester());
        }
        Student saved = studentRepository.save(student);
        if (saved.getUser() != null) {
            User u = saved.getUser();
            u.setFirstName(saved.getFirstName());
            u.setLastName(saved.getLastName());
            if (saved.getPhone() != null) u.setPhone(saved.getPhone());
            userRepository.save(u);
        }
        return saved;
    }

    /**
     * Promote every student in a department+semester to the next semester at
     * once (e.g. when a semester completes). Only the department HOD may run
     * this. Subjects stay the same; only the semester advances. Capped at 6.
     */
    public int promoteSemesterBulk(Long departmentId, Integer semester, String email) {
        User actor = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found."));
        Teacher hod = teacherRepository.findByUser(actor).orElse(null);
        if (hod == null || !Boolean.TRUE.equals(hod.getHod()) || hod.getDepartment() == null
                || !hod.getDepartment().getId().equals(departmentId)) {
            throw new RuntimeException("Only the HOD can promote students of their department.");
        }
        if (semester == null || semester < 1 || semester > 5) {
            throw new RuntimeException("Provide a semester between 1 and 5 to promote from.");
        }
        List<Student> students = studentRepository.findByDepartmentIdAndSemester(departmentId, semester);
        int count = 0;
        for (Student s : students) {
            if (s.getSemester() != null && s.getSemester() < 6) {
                s.setSemester(s.getSemester() + 1);
                studentRepository.save(s);
                count++;
            }
        }
        return count;
    }
}