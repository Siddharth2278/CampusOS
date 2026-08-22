package com.campusos.backend.service;

import com.campusos.backend.entity.Student;
import com.campusos.backend.entity.Teacher;
import com.campusos.backend.entity.User;
import com.campusos.backend.enums.Role;
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
        return studentRepository.findAll();
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
}