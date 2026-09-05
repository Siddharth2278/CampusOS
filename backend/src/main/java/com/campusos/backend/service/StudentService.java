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
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll().stream()
                .filter(s -> s.getUser() != null && s.getUser().getStatus() == UserStatus.APPROVED)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Student> getStudentsByDepartment(Long departmentId) {
        return studentRepository.findByDepartmentIdAndUser_Status(departmentId, UserStatus.APPROVED);
    }

    @Transactional(readOnly = true)
    public List<Student> getStudentsByDepartmentAndSemester(Long departmentId, Integer semester) {
        return studentRepository.findByDepartmentIdAndSemesterAndUser_Status(departmentId, semester, UserStatus.APPROVED);
    }

    @Transactional
    public int upgradeSemester(Long departmentId, Integer fromSemester) {
        if (fromSemester >= 6) {
            throw new RuntimeException("Students in the final semester (6) cannot be upgraded.");
        }
        List<Student> students = studentRepository.findByDepartmentIdAndSemesterAndUser_Status(
                departmentId, fromSemester, UserStatus.APPROVED);
        int count = 0;
        for (Student s : students) {
            s.setSemester(fromSemester + 1);
            studentRepository.save(s);
            count++;
        }
        return count;
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

        student.setDepartment(teacher.getDepartment());

        User user = student.getUser();
        user.setRole(Role.STUDENT);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        student.setUser(savedUser);

        return studentRepository.save(student);
    }
}