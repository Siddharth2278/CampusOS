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
import com.campusos.backend.entity.College;
import com.campusos.backend.enums.CollegeType;
import com.campusos.backend.repository.CollegeRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final TeacherRepository teacherRepository;
    private final CollegeRepository collegeRepository;

public AuthService(UserRepository userRepository,
                   StudentRepository studentRepository,
                   DepartmentRepository departmentRepository,
                   TeacherRepository teacherRepository,
                   CollegeRepository collegeRepository,
                   BCryptPasswordEncoder passwordEncoder,
                   JwtService jwtService) {

    this.userRepository = userRepository;
    this.studentRepository = studentRepository;
    this.departmentRepository = departmentRepository;
    this.teacherRepository = teacherRepository;
    this.collegeRepository = collegeRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
}
public User register(RegisterRequest request, Role role) {

    if (role == Role.HOD) throw new RuntimeException("HOD accounts are not self-registered. An approved teacher is promoted by the Principal.");

    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
        throw new RuntimeException("This email is already registered. Please use the Login option.");
    }

    User user = new User();

    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setRole(role);
    user.setStatus(role == Role.PRINCIPAL ? UserStatus.APPROVED : UserStatus.PENDING);

    if (role == Role.PRINCIPAL) {

        if (request.getCollegeName() == null || request.getCollegeName().trim().isEmpty()) {
            throw new RuntimeException("College name is required.");
        }
        if (request.getCollegeType() == null || request.getCollegeType().trim().isEmpty()) {
            throw new RuntimeException("Please specify whether this is a Diploma or Degree college.");
        }

        String collegeName = request.getCollegeName().trim();

        if (collegeRepository.existsByNameIgnoreCase(collegeName)) {
            throw new RuntimeException("This college is already registered on CampusOS. Ask your Principal to add you as HOD or Teacher, or contact them for access.");
        }

        CollegeType type;
        try {
            type = CollegeType.valueOf(request.getCollegeType().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("College type must be either DIPLOMA or DEGREE.");
        }

        College college = new College();
        college.setName(collegeName);
        college.setType(type);
        college = collegeRepository.save(college);

        user.setCollege(college);
    }

    user = userRepository.save(user);

    if (role == Role.STUDENT) {

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        if (department.getCollege() != null && request.getSemester() != null
                && request.getSemester() > department.getCollege().getTotalSemesters()) {
            throw new RuntimeException("This is a " + department.getCollege().getType()
                    + " college — semester must be between 1 and " + department.getCollege().getTotalSemesters() + ".");
        }

        user.setCollege(department.getCollege());
        userRepository.save(user);

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

        user.setCollege(department.getCollege());
        userRepository.save(user);

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
            user.getRole(), profileId, departmentId, semester);
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
            user.getEmail(), user.getPhone(), user.getRole(), departmentId, semester);
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

}
