package com.campusos.backend.service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.campusos.backend.dto.RegisterRequest;
import com.campusos.backend.entity.User;
import com.campusos.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.campusos.backend.dto.LoginRequest;
import com.campusos.backend.dto.LoginResponse;
import com.campusos.backend.security.JwtService;
import com.campusos.backend.enums.Role;
import com.campusos.backend.entity.Department;
import com.campusos.backend.entity.Student;
import com.campusos.backend.repository.DepartmentRepository;
import com.campusos.backend.repository.StudentRepository;

import java.util.Optional;
import com.campusos.backend.entity.Teacher;
import com.campusos.backend.repository.TeacherRepository;
import com.campusos.backend.dto.AuthMeResponse;
import com.campusos.backend.dto.ProfileResponse;
import com.campusos.backend.dto.ProfileUpdateRequest;
import com.campusos.backend.enums.UserStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final TeacherRepository teacherRepository;
    private final CloudinaryService cloudinaryService;

    @PersistenceContext
    private EntityManager entityManager;

public AuthService(UserRepository userRepository,
                   StudentRepository studentRepository,
                   DepartmentRepository departmentRepository,
                   TeacherRepository teacherRepository,
                   BCryptPasswordEncoder passwordEncoder,
                   JwtService jwtService,
                   CloudinaryService cloudinaryService) {

    this.userRepository = userRepository;
    this.studentRepository = studentRepository;
    this.departmentRepository = departmentRepository;
    this.teacherRepository = teacherRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.cloudinaryService = cloudinaryService;
}
public User register(RegisterRequest request, Role role) {

    if (role == Role.HOD) throw new RuntimeException("HOD accounts are not self-registered. An approved teacher is promoted by the Principal.");

    // Handle an email that is already in the system
    Optional<User> existingOpt = userRepository.findByEmail(request.getEmail());
    if (existingOpt.isPresent()) {
        User existing = existingOpt.get();
        if (existing.getStatus() == UserStatus.APPROVED) {
            throw new RuntimeException("This email is already registered. Please use the Login option.");
        }
        if (existing.getStatus() == UserStatus.PENDING) {
            throw new RuntimeException("This email is already registered and still awaiting approval.");
        }
        // REJECTED: allow re-registration only after a 3-day cooldown
        if (existing.getRejectedAt() != null
                && existing.getRejectedAt().plusDays(3).isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Your previous registration was rejected. You can register again after 3 days.");
        }
        // Older than 3 days -> clear the old rejected record so a fresh signup can proceed
        teacherRepository.findByUser(existing).ifPresent(teacherRepository::delete);
        studentRepository.findByUser(existing).ifPresent(studentRepository::delete);
        userRepository.delete(existing);
    }

    // Single institution: only one PRINCIPAL allowed
    if (role == Role.PRINCIPAL && userRepository.countByRole(Role.PRINCIPAL) > 0) {
        throw new RuntimeException("A Principal already exists. Only one Principal is allowed.");
    }

    User user = new User();

    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setRole(role);
    user.setStatus(role == Role.PRINCIPAL ? UserStatus.APPROVED : UserStatus.PENDING);

    user = userRepository.save(user);

    if (role == Role.STUDENT) {

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        if (request.getSemester() != null && (request.getSemester() < 1 || request.getSemester() > 8)) {
            throw new RuntimeException("Semester must be between 1 and 8.");
        }

        Student student = new Student();

        student.setEnrollmentNumber(request.getEnrollmentNumber());
        student.setRollNumber(request.getRollNumber());
        student.setSemester(request.getSemester());
        student.setAdmissionYear(request.getAdmissionYear());

        student.setDepartment(department);
        student.setUser(user);
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());

        studentRepository.save(student);
    }

    if (role == Role.TEACHER) {

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Teacher teacher = new Teacher();

        teacher.setTeacherId("TCH" + user.getId());
        teacher.setFirstName(request.getFirstName());
        teacher.setLastName(request.getLastName());
        teacher.setEmail(request.getEmail());
        teacher.setDepartment(department);
        teacher.setHod(false);
        teacher.setUser(user);

        teacherRepository.save(teacher);
    }

    return user;
    
}
public AuthMeResponse getCurrentUser(String email) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Long profileId = null;
    Long departmentId = null;
    Integer semester = null;

    if (user.getRole() == Role.STUDENT) {
        Optional<Student> student = studentRepository.findByUser(user);
        if (student.isPresent()) {
            profileId = student.get().getId();
            departmentId = student.get().getDepartment() != null ? student.get().getDepartment().getId() : null;
            semester = student.get().getSemester();
        }
    } else if (user.getRole() == Role.TEACHER || user.getRole() == Role.HOD) {
        Optional<Teacher> teacher = teacherRepository.findByUser(user);
        if (teacher.isPresent()) {
            profileId = teacher.get().getId();
            departmentId = teacher.get().getDepartment() != null ? teacher.get().getDepartment().getId() : null;
        }
    }

    return new AuthMeResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
            user.getRole(), profileId, departmentId, semester, user.getPhotoUrl());
}

public LoginResponse login(LoginRequest request) {

    Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

    if (optionalUser.isEmpty()) {
        throw new RuntimeException("No account found with this email. Check the address, or create an account.");
    }

    User user = optionalUser.get();

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new RuntimeException("Invalid Password");
    }

    if (user.getStatus() == UserStatus.PENDING) {
        throw new RuntimeException("Your account is registered but still awaiting approval.");
    }
    if (user.getStatus() == UserStatus.REJECTED) {
        throw new RuntimeException("Your registration request was rejected. Please contact your administrator.");
    }

    String token = jwtService.generateToken(user.getEmail(), user.getRole());

   return new LoginResponse(
    token,
    user.getRole().name(),
    "Login Successful"
);
}

public void changePassword(String email, String currentPassword, String newPassword) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found."));
    if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
        throw new RuntimeException("Current password is incorrect.");
    }
    if (newPassword == null || newPassword.length() < 6) {
        throw new RuntimeException("New password must contain at least 6 characters.");
    }
    if (passwordEncoder.matches(newPassword, user.getPassword())) {
        throw new RuntimeException("New password must be different from the current password.");
    }
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);
}


public ProfileResponse getProfile(String email) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found."));
    Long departmentId = null;
    Integer semester = null;
    if (user.getRole() == Role.STUDENT) {
        Optional<Student> student = studentRepository.findByUser(user);
        if (student.isPresent()) {
            departmentId = student.get().getDepartment() != null ? student.get().getDepartment().getId() : null;
            semester = student.get().getSemester();
        }
    } else if (user.getRole() == Role.TEACHER || user.getRole() == Role.HOD) {
        Optional<Teacher> teacher = teacherRepository.findByUser(user);
        if (teacher.isPresent()) {
            departmentId = teacher.get().getDepartment() != null ? teacher.get().getDepartment().getId() : null;
        }
    }
    return new ProfileResponse(user.getId(), user.getFirstName(), user.getLastName(),
            user.getEmail(), user.getPhone(), user.getRole(), departmentId, semester, user.getPhotoUrl());
}

    public ProfileResponse updateProfile(String currentEmail, ProfileUpdateRequest request) {
     User user = userRepository.findByEmail(currentEmail)
             .orElseThrow(() -> new RuntimeException("User not found."));
     String newEmail = request.email() == null ? "" : request.email().trim().toLowerCase();
     if (newEmail.isBlank()) throw new IllegalArgumentException("Email is required.");
     if (!newEmail.equalsIgnoreCase(user.getEmail())) {
         userRepository.findByEmail(newEmail).ifPresent(existing -> {
             if (!existing.getId().equals(user.getId())) throw new IllegalArgumentException("That email is already in use.");
         });
         user.setEmail(newEmail);
     }
     user.setFirstName(request.firstName() == null ? user.getFirstName() : request.firstName().trim());
     user.setLastName(request.lastName() == null ? user.getLastName() : request.lastName().trim());
     user.setPhone(request.phone() == null ? null : request.phone().trim());
     userRepository.save(user);

     if (user.getRole() == Role.STUDENT) {
         studentRepository.findByUser(user).ifPresent(student -> {
             student.setFirstName(user.getFirstName());
             student.setLastName(user.getLastName());
             student.setEmail(user.getEmail());
             studentRepository.save(student);
         });
     } else if (user.getRole() == Role.TEACHER || user.getRole() == Role.HOD) {
         teacherRepository.findByUser(user).ifPresent(teacher -> {
             teacher.setFirstName(user.getFirstName());
             teacher.setLastName(user.getLastName());
             teacher.setEmail(user.getEmail());
             teacherRepository.save(teacher);
         });
     }
     return getProfile(user.getEmail());
 }

    public ProfileResponse updatePhoto(String email, String photoUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (user.getPhotoUrl() != null && !user.getPhotoUrl().equals(photoUrl)) {
            cloudinaryService.deleteByUrl(user.getPhotoUrl());
        }
        user.setPhotoUrl(photoUrl);
        userRepository.save(user);
        return getProfile(user.getEmail());
    }

    public ProfileResponse removePhoto(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (user.getPhotoUrl() != null) {
            cloudinaryService.deleteByUrl(user.getPhotoUrl());
            user.setPhotoUrl(null);
            userRepository.save(user);
        }
        return getProfile(user.getEmail());
    }


public String getLastRoute(String email) {
    return userRepository.findByEmail(email)
            .map(User::getLastRoute)
            .orElse(null);
}

public void saveLastRoute(String email, String route) {
    if (route == null || route.isBlank()) return;
    String clean = route.trim();
    if (!clean.startsWith("/") || clean.startsWith("//") || clean.length() > 255) return;
    if (clean.startsWith("/login") || clean.startsWith("/register") || clean.startsWith("/forgot-password")) return;

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found."));
    user.setLastRoute(clean);
    userRepository.save(user);
}

    public boolean principalExists() {
        return userRepository.countByRole(Role.PRINCIPAL) > 0;
    }

    @Transactional
    public void deleteOwnAccount(String email) {
        User me = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found."));
        if (me.getRole() != Role.PRINCIPAL) {
            throw new RuntimeException("Only Principal can delete own account via this operation.");
        }
        // Single institution reset. Delete in child -> parent order so FK constraints
        // are never violated (MySQL & PostgreSQL compatible). The only cycle is
        // departments <-> teachers (departments.hod_teacher_id -> teachers), which we
        // break by nulling hod_teacher_id before deleting teachers/departments.
        try {
            entityManager.createNativeQuery("DELETE FROM assignment_submissions").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM notifications").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM assignments").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM leave_requests").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM faculty_assignments").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM exams").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM academic_calendar").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM timetable").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM notices").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM attendance").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM subjects").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM students").executeUpdate();
            // Break the departments <-> teachers cycle before deleting either.
            entityManager.createNativeQuery("UPDATE departments SET hod_teacher_id = NULL").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM teachers").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM departments").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM users").executeUpdate();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to delete principal account: " + ex.getMessage());
        }
    }

}
