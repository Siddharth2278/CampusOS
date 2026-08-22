package com.campusos.backend.service;

import com.campusos.backend.entity.Department;
import com.campusos.backend.entity.Teacher;
import com.campusos.backend.entity.User;
import com.campusos.backend.enums.Role;
import com.campusos.backend.enums.UserStatus;
import com.campusos.backend.repository.DepartmentRepository;
import com.campusos.backend.repository.TeacherRepository;
import com.campusos.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public TeacherService(TeacherRepository teacherRepository,
                          UserRepository userRepository,
                          DepartmentRepository departmentRepository) {
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public List<Teacher> getHodCandidates(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found."));
        if (department.getHod() != null) {
            throw new RuntimeException("This department already has a HOD.");
        }
        return teacherRepository.findByDepartmentId(departmentId).stream()
                .filter(t -> !Boolean.TRUE.equals(t.getHod()))
                .filter(t -> t.getUser() != null && t.getUser().getRole() == Role.TEACHER)
                .filter(t -> t.getUser().getStatus() == UserStatus.APPROVED)
                .toList();
    }

    public Teacher assignClassTeacher(Long teacherId, Integer semester, String email) {
        User actorUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        Teacher actor = teacherRepository.findByUser(actorUser)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found."));

        if (!Boolean.TRUE.equals(actor.getHod()) || actor.getDepartment() == null) {
            throw new RuntimeException("Only the HOD can assign Class Teachers.");
        }
        if (actor.getDepartment().getCollege() == null) {
            throw new RuntimeException("Your college is not set up correctly. Contact CampusOS support.");
        }
        int maxSemester = actor.getDepartment().getCollege().getTotalSemesters();
        if (semester == null || semester < 1 || semester > maxSemester) {
            throw new RuntimeException("Invalid semester. This college runs " + maxSemester + " semesters.");
        }

        Teacher target = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found."));

        if (target.getDepartment() == null ||
                !actor.getDepartment().getId().equals(target.getDepartment().getId())) {
            throw new RuntimeException("You can assign Class Teachers only in your own department.");
        }
        if (target.getUser() == null || target.getUser().getStatus() != UserStatus.APPROVED) {
            throw new RuntimeException("Only an approved teacher can be a Class Teacher.");
        }

        teacherRepository
                .findByDepartmentIdAndClassTeacherTrueAndClassTeacherSemester(
                        actor.getDepartment().getId(), semester)
                .ifPresent(old -> {
                    if (!old.getId().equals(target.getId())) {
                        old.setClassTeacher(false);
                        old.setClassTeacherSemester(null);
                        teacherRepository.save(old);
                    }
                });

        target.setClassTeacher(true);
        target.setClassTeacherSemester(semester);
        return teacherRepository.save(target);
    }

    public Teacher makeHod(Long teacherId, String principalEmail) {
        User principal = userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (principal.getRole() != Role.PRINCIPAL) {
            throw new RuntimeException("Only the Principal can assign a HOD.");
        }

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found."));
        Department department = teacher.getDepartment();

        if (department == null) {
            throw new RuntimeException("Teacher is not assigned to a department.");
        }
        if (department.getHod() != null) {
            throw new RuntimeException("This department already has a HOD. Only one HOD is allowed.");
        }
        if (teacher.getUser() == null || teacher.getUser().getStatus() != UserStatus.APPROVED) {
            throw new RuntimeException("Only an approved teacher can become HOD.");
        }
        if (teacher.getUser().getRole() != Role.TEACHER) {
            throw new RuntimeException("Only a teacher can be promoted to HOD.");
        }

        teacher.setHod(true);
        teacher.getUser().setRole(Role.HOD);
        department.setHod(teacher);

        userRepository.save(teacher.getUser());
        departmentRepository.save(department);
        return teacherRepository.save(teacher);
    }
}
