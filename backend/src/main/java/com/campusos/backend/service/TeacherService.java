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
        // Only show approved teachers; pending/rejected registrations stay hidden everywhere.
        return teacherRepository.findAll().stream()
                .filter(t -> t.getUser() != null && t.getUser().getStatus() == UserStatus.APPROVED)
                .toList();
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
        // Single institution: fixed 8 semesters
        if (semester == null || semester < 1 || semester > 8) {
            throw new RuntimeException("Invalid semester. Must be between 1 and 8.");
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

    public Teacher removeHod(Long departmentId, String principalEmail) {
        User principal = userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (principal.getRole() != Role.PRINCIPAL) throw new RuntimeException("Only Principal can remove HOD.");
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found."));
        Teacher hod = department.getHod();
        if (hod == null) throw new RuntimeException("Department has no HOD to remove.");
        hod.setHod(false);
        if (hod.getUser() != null) {
            hod.getUser().setRole(Role.TEACHER);
            userRepository.save(hod.getUser());
        }
        department.setHod(null);
        departmentRepository.save(department);
        return teacherRepository.save(hod);
    }

    public Teacher updateTeacher(Long id, Teacher dto, String email) {
        User actor = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found."));
        Teacher target = teacherRepository.findById(id).orElseThrow(() -> new RuntimeException("Teacher not found."));
        boolean isPrincipal = actor.getRole() == Role.PRINCIPAL;
        boolean isHod = false;
        if (actor.getRole() == Role.HOD) {
            Teacher hodTeacher = teacherRepository.findByUser(actor).orElse(null);
            isHod = hodTeacher != null && Boolean.TRUE.equals(hodTeacher.getHod()) && hodTeacher.getDepartment() != null && target.getDepartment() != null && hodTeacher.getDepartment().getId().equals(target.getDepartment().getId());
        }
        if (!isPrincipal && !isHod) throw new RuntimeException("You don't have permission to edit this teacher.");
        if (dto.getFirstName() != null && !dto.getFirstName().isBlank()) target.setFirstName(dto.getFirstName().trim());
        if (dto.getLastName() != null && !dto.getLastName().isBlank()) target.setLastName(dto.getLastName().trim());
        if (dto.getPhone() != null) target.setPhone(dto.getPhone().trim());
        if (dto.getDepartment() != null && dto.getDepartment().getId() != null && isPrincipal) {
            Department newDept = departmentRepository.findById(dto.getDepartment().getId()).orElseThrow(() -> new RuntimeException("Department not found."));
            target.setDepartment(newDept);
        }
        if (target.getUser() != null) {
            target.getUser().setFirstName(target.getFirstName());
            target.getUser().setLastName(target.getLastName());
            if (target.getPhone() != null) target.getUser().setPhone(target.getPhone());
            userRepository.save(target.getUser());
        }
        return teacherRepository.save(target);
    }

    public void deleteTeacher(Long id, String email) {
        User actor = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found."));
        if (actor.getRole() != Role.PRINCIPAL) throw new RuntimeException("Only Principal can delete teachers.");
        Teacher target = teacherRepository.findById(id).orElseThrow(() -> new RuntimeException("Teacher not found."));
        if (Boolean.TRUE.equals(target.getHod())) throw new RuntimeException("Remove HOD assignment before deleting teacher.");
        if (Boolean.TRUE.equals(target.getClassTeacher())) throw new RuntimeException("Remove Class Teacher assignment before deleting teacher.");
        User u = target.getUser();
        teacherRepository.delete(target);
        if (u != null) userRepository.delete(u);
    }

    public Teacher removeClassTeacher(Long teacherId, String email) {
        User actorUser = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found."));
        Teacher actor = teacherRepository.findByUser(actorUser).orElseThrow(() -> new RuntimeException("Teacher profile not found."));
        if (!Boolean.TRUE.equals(actor.getHod()) || actor.getDepartment() == null) throw new RuntimeException("Only HOD can remove Class Teacher.");
        Teacher target = teacherRepository.findById(teacherId).orElseThrow(() -> new RuntimeException("Teacher not found."));
        if (target.getDepartment() == null || !actor.getDepartment().getId().equals(target.getDepartment().getId()))
            throw new RuntimeException("You can manage only your department.");
        target.setClassTeacher(false);
        target.setClassTeacherSemester(null);
        return teacherRepository.save(target);
    }
}
