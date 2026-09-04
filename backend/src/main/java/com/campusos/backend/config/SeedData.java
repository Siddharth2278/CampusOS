package com.campusos.backend.config;

import com.campusos.backend.entity.*;
import com.campusos.backend.enums.*;
import com.campusos.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class SeedData implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyAssignmentRepository facultyAssignmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final NoticeRepository noticeRepository;
    private final AcademicCalendarRepository academicCalendarRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedData(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            TeacherRepository teacherRepository,
            StudentRepository studentRepository,
            SubjectRepository subjectRepository,
            FacultyAssignmentRepository facultyAssignmentRepository,
            AssignmentRepository assignmentRepository,
            NoticeRepository noticeRepository,
            AcademicCalendarRepository academicCalendarRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.facultyAssignmentRepository = facultyAssignmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.noticeRepository = noticeRepository;
        this.academicCalendarRepository = academicCalendarRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        String pw = passwordEncoder.encode("password");

        User principal = saveUser("Amit", "Verma", "principal@campus.edu", pw, "9000000001", Role.PRINCIPAL, UserStatus.APPROVED);
        User u2 = saveUser("Rahul", "Sharma", "rahul.sharma@campus.edu", pw, "9000000010", Role.TEACHER, UserStatus.APPROVED);
        User u3 = saveUser("Priya", "Singh", "priya.singh@campus.edu", pw, "9000000011", Role.TEACHER, UserStatus.APPROVED);
        User u4 = saveUser("Arun", "Kumar", "arun.kumar@campus.edu", pw, "9000000012", Role.TEACHER, UserStatus.APPROVED);
        User u5 = saveUser("Neha", "Gupta", "neha.gupta@campus.edu", pw, "9000000013", Role.TEACHER, UserStatus.APPROVED);
        User u6 = saveUser("Vikram", "Patel", "vikram.patel@campus.edu", pw, "9000000014", Role.TEACHER, UserStatus.APPROVED);
        User u7 = saveUser("Sonia", "Reddy", "sonia.reddy@campus.edu", pw, "9000000015", Role.TEACHER, UserStatus.APPROVED);
        User u8 = saveUser("Deepak", "Joshi", "deepak.joshi@campus.edu", pw, "9000000016", Role.TEACHER, UserStatus.APPROVED);
        User u9 = saveUser("Kavita", "Nair", "kavita.nair@campus.edu", pw, "9000000017", Role.TEACHER, UserStatus.APPROVED);
        User u10 = saveUser("Rohan", "Mehta", "rohan.mehta@campus.edu", pw, "9000000018", Role.TEACHER, UserStatus.APPROVED);

        Department cse = dept("Computer Science & Engineering", "CSE");
        Department it = dept("Information Technology", "IT");
        Department ece = dept("Electronics & Communication", "ECE");

        Teacher t1 = makeTeacher("T001", "Rahul", "Sharma", u2, cse, true, 1, true);
        Teacher t2 = makeTeacher("T002", "Priya", "Singh", u3, cse, true, 2, false);
        Teacher t3 = makeTeacher("T003", "Arun", "Kumar", u4, cse, true, 3, false);
        Teacher t4 = makeTeacher("T004", "Neha", "Gupta", u5, it, true, 1, true);
        Teacher t5 = makeTeacher("T005", "Vikram", "Patel", u6, it, true, 2, false);
        Teacher t6 = makeTeacher("T006", "Sonia", "Reddy", u7, it, true, 3, false);
        Teacher t7 = makeTeacher("T007", "Deepak", "Joshi", u8, ece, true, 1, true);
        Teacher t8 = makeTeacher("T008", "Kavita", "Nair", u9, ece, true, 2, false);
        Teacher t9 = makeTeacher("T009", "Rohan", "Mehta", u10, ece, true, 3, false);

        cse.setHod(t1); departmentRepository.save(cse);
        it.setHod(t4); departmentRepository.save(it);
        ece.setHod(t7); departmentRepository.save(ece);

        u2.setRole(Role.HOD); userRepository.save(u2);
        u5.setRole(Role.HOD); userRepository.save(u5);
        u8.setRole(Role.HOD); userRepository.save(u8);

        makeStudent("CSE24001", 1, "Suresh", "Yadav", 1, 2024, cse, pw);
        makeStudent("CSE24002", 2, "Pooja", "Mishra", 1, 2024, cse, pw);
        makeStudent("CSE24003", 1, "Amit", "Tiwari", 2, 2024, cse, pw);
        makeStudent("CSE24004", 2, "Nisha", "Choudhary", 2, 2024, cse, pw);
        makeStudent("CSE23001", 1, "Ravi", "Shankar", 3, 2023, cse, pw);
        makeStudent("CSE23002", 2, "Meena", "Devi", 3, 2023, cse, pw);
        makeStudent("CSE23003", 3, "Sanjay", "Mishra", 4, 2023, cse, pw);
        makeStudent("CSE23004", 4, "Geeta", "Pandey", 4, 2023, cse, pw);
        makeStudent("CSE22001", 1, "Manoj", "Tripathi", 5, 2022, cse, pw);
        makeStudent("CSE22002", 2, "Sunita", "Rao", 5, 2022, cse, pw);
        makeStudent("CSE22003", 3, "Prakash", "Raj", 6, 2022, cse, pw);
        makeStudent("CSE22004", 4, "Kamini", "Singh", 6, 2022, cse, pw);

        makeStudent("IT24001", 1, "Vishal", "Verma", 1, 2024, it, pw);
        makeStudent("IT24002", 2, "Ritu", "Agarwal", 1, 2024, it, pw);
        makeStudent("IT24003", 1, "Ankit", "Saxena", 2, 2024, it, pw);
        makeStudent("IT24004", 2, "Pallavi", "Mishra", 2, 2024, it, pw);
        makeStudent("IT23001", 1, "Mohit", "Garg", 3, 2023, it, pw);
        makeStudent("IT23002", 2, "Shreya", "Kapoor", 3, 2023, it, pw);
        makeStudent("IT23003", 3, "Tarun", "Bajaj", 4, 2023, it, pw);
        makeStudent("IT23004", 4, "Nandini", "Iyer", 4, 2023, it, pw);
        makeStudent("IT22001", 1, "Ashish", "Chauhan", 5, 2022, it, pw);
        makeStudent("IT22002", 2, "Divya", "Bhatt", 5, 2022, it, pw);
        makeStudent("IT22003", 3, "Karan", "Malhotra", 6, 2022, it, pw);
        makeStudent("IT22004", 4, "Tanya", "Sinha", 6, 2022, it, pw);

        makeStudent("ECE24001", 1, "Nitin", "Chandra", 1, 2024, ece, pw);
        makeStudent("ECE24002", 2, "Rashmi", "Kulkarni", 1, 2024, ece, pw);
        makeStudent("ECE24003", 1, "Saurabh", "Tiwari", 2, 2024, ece, pw);
        makeStudent("ECE24004", 2, "Payal", "Jain", 2, 2024, ece, pw);
        makeStudent("ECE23001", 1, "Yogesh", "Pandey", 3, 2023, ece, pw);
        makeStudent("ECE23002", 2, "Aarti", "Srivastava", 3, 2023, ece, pw);
        makeStudent("ECE23003", 3, "Abhishek", "Rai", 4, 2023, ece, pw);
        makeStudent("ECE23004", 4, "Sapna", "Pandey", 4, 2023, ece, pw);
        makeStudent("ECE22001", 1, "Pankaj", "Dubey", 5, 2022, ece, pw);
        makeStudent("ECE22002", 2, "Rekha", "Yadav", 5, 2022, ece, pw);
        makeStudent("ECE22003", 3, "Siddharth", "Mishra", 6, 2022, ece, pw);
        makeStudent("ECE22004", 4, "Usha", "Pillai", 6, 2022, ece, pw);

        Subject s1 = makeSubject("Data Structures", "CS101", cse, 1);
        Subject s2 = makeSubject("DBMS", "CS102", cse, 2);
        Subject s3 = makeSubject("Operating Systems", "CS201", cse, 3);
        Subject s4 = makeSubject("Computer Networks", "CS202", cse, 4);
        Subject s5 = makeSubject("Software Engineering", "CS301", cse, 5);
        Subject s6 = makeSubject("Machine Learning", "CS302", cse, 6);
        Subject s7 = makeSubject("Web Technologies", "IT101", it, 1);
        Subject s8 = makeSubject("Cloud Computing", "IT102", it, 2);
        Subject s9 = makeSubject("Cyber Security", "IT201", it, 3);
        Subject s10 = makeSubject("IoT", "IT202", it, 4);
        Subject s11 = makeSubject("DevOps", "IT301", it, 5);
        Subject s12 = makeSubject("Blockchain", "IT302", it, 6);
        Subject s13 = makeSubject("Digital Electronics", "EC101", ece, 1);
        Subject s14 = makeSubject("Signal Processing", "EC102", ece, 2);
        Subject s15 = makeSubject("VLSI Design", "EC201", ece, 3);
        Subject s16 = makeSubject("Embedded Systems", "EC202", ece, 4);
        Subject s17 = makeSubject("Wireless Communication", "EC301", ece, 5);
        Subject s18 = makeSubject("5G Technology", "EC302", ece, 6);

        fa(t1, s1); fa(t1, s2); fa(t2, s3); fa(t2, s4); fa(t3, s5); fa(t3, s6);
        fa(t4, s7); fa(t4, s8); fa(t5, s9); fa(t5, s10); fa(t6, s11); fa(t6, s12);
        fa(t7, s13); fa(t7, s14); fa(t8, s15); fa(t8, s16); fa(t9, s17); fa(t9, s18);

        Notice n1 = new Notice();
        n1.setTitle("Mid-Term Schedule");
        n1.setDescription("Mid-term exams start from Oct 1.");
        n1.setReceiverRole(ReceiverRole.ALL);
        n1.setPriority(NoticePriority.IMPORTANT);
        n1.setCreatedBy(principal);
        n1.setCreatedAt(LocalDateTime.now());
        noticeRepository.save(n1);

        Notice n2 = new Notice();
        n2.setTitle("Lab Report Submission");
        n2.setDescription("All CSE Sem1 students must submit Lab Report 1 by Sept 15.");
        n2.setReceiverRole(ReceiverRole.STUDENT);
        n2.setPriority(NoticePriority.URGENT);
        n2.setDepartment(cse);
        n2.setSemester(1);
        n2.setCreatedBy(t1.getUser());
        n2.setCreatedAt(LocalDateTime.now());
        noticeRepository.save(n2);

        Notice n3 = new Notice();
        n3.setTitle("Faculty Meeting");
        n3.setDescription("Monthly faculty meeting on Sept 20 at 3 PM.");
        n3.setReceiverRole(ReceiverRole.TEACHER);
        n3.setPriority(NoticePriority.NORMAL);
        n3.setCreatedBy(principal);
        n3.setCreatedAt(LocalDateTime.now());
        noticeRepository.save(n3);

        AcademicCalendar ac1 = new AcademicCalendar();
        ac1.setTitle("Independence Day");
        ac1.setDescription("College closed");
        ac1.setType(CalendarType.HOLIDAY);
        ac1.setAudience(EventAudience.ALL);
        ac1.setEventDate(LocalDate.of(2026, 8, 15));
        ac1.setCreatedBy(principal);
        ac1.setCreatedAt(LocalDate.now());
        academicCalendarRepository.save(ac1);

        AcademicCalendar ac2 = new AcademicCalendar();
        ac2.setTitle("Tech Symposium");
        ac2.setDescription("Annual tech symposium");
        ac2.setType(CalendarType.WORKSHOP);
        ac2.setAudience(EventAudience.ALL);
        ac2.setVenue("Main Auditorium");
        ac2.setEventDate(LocalDate.of(2026, 9, 25));
        ac2.setStartTime(LocalTime.of(9, 0));
        ac2.setEndTime(LocalTime.of(17, 0));
        ac2.setCreatedBy(principal);
        ac2.setCreatedAt(LocalDate.now());
        academicCalendarRepository.save(ac2);

        Assignment a1 = new Assignment();
        a1.setTitle("Lab Report 1");
        a1.setDescription("Write a lab report on Arrays and Linked Lists");
        a1.setDueDate(LocalDateTime.of(2026, 9, 15, 23, 59));
        a1.setSubject(s1);
        a1.setTeacher(t1);
        a1.setCreatedAt(LocalDateTime.now());
        assignmentRepository.save(a1);

        Assignment a2 = new Assignment();
        a2.setTitle("DBMS Project");
        a2.setDescription("Design a normalized database");
        a2.setDueDate(LocalDateTime.of(2026, 9, 20, 23, 59));
        a2.setSubject(s2);
        a2.setTeacher(t1);
        a2.setCreatedAt(LocalDateTime.now());
        assignmentRepository.save(a2);

        System.out.println("=== Seed data loaded successfully ===");
    }

    private User saveUser(String fn, String ln, String email, String pw, String phone, Role role, UserStatus status) {
        User u = User.builder().firstName(fn).lastName(ln).email(email).password(pw).phone(phone).role(role).status(status).build();
        return userRepository.save(u);
    }

    private Department dept(String name, String code) {
        Department d = new Department();
        d.setName(name);
        d.setCode(code);
        d.setDescription(name);
        return departmentRepository.save(d);
    }

    private Teacher makeTeacher(String tid, String fn, String ln, User user, Department dept, boolean ct, Integer ctSem, boolean isHod) {
        Teacher t = new Teacher();
        t.setTeacherId(tid);
        t.setFirstName(fn);
        t.setLastName(ln);
        t.setEmail(user.getEmail());
        t.setPhone(user.getPhone());
        t.setDepartment(dept);
        t.setClassTeacher(ct);
        t.setClassTeacherSemester(ctSem);
        t.setHod(isHod);
        t.setUser(user);
        return teacherRepository.save(t);
    }

    private void makeStudent(String enr, int roll, String fn, String ln, int sem, int year, Department dept, String pw) {
        User u = saveUser(fn, ln, fn.toLowerCase() + "." + ln.toLowerCase() + "@campus.edu", pw, "91000000" + String.format("%02d", roll + (sem - 1) * 2), Role.STUDENT, UserStatus.APPROVED);
        Student s = new Student();
        s.setEnrollmentNumber(enr);
        s.setRollNumber(roll);
        s.setFirstName(fn);
        s.setLastName(ln);
        s.setEmail(u.getEmail());
        s.setPhone(u.getPhone());
        s.setSemester(sem);
        s.setAdmissionYear(year);
        s.setDepartment(dept);
        s.setUser(u);
        studentRepository.save(s);
    }

    private Subject makeSubject(String name, String code, Department dept, int sem) {
        Subject s = new Subject();
        s.setName(name);
        s.setCode(code);
        s.setDepartment(dept);
        s.setSemester(sem);
        s.setAcademicYear("2026");
        return subjectRepository.save(s);
    }

    private void fa(Teacher t, Subject s) {
        FacultyAssignment fa = new FacultyAssignment();
        fa.setTeacher(t);
        fa.setSubject(s);
        facultyAssignmentRepository.save(fa);
    }
}
