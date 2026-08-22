package com.campusos.backend.service; import com.campusos.backend.entity.FacultyAssignment; import com.campusos.backend.entity.User; import com.campusos.backend.entity.Teacher; import com.campusos.backend.entity.Subject; import com.campusos.backend.repository.UserRepository; import com.campusos.backend.repository.TeacherRepository; import com.campusos.backend.repository.SubjectRepository; import com.campusos.backend.repository.FacultyAssignmentRepository; import org.springframework.stereotype.Service; import java.util.List;

@Service public class FacultyAssignmentService {
    private final FacultyAssignmentRepository r; private final UserRepository users; private final TeacherRepository teachers; private final SubjectRepository subjects;

    public FacultyAssignmentService(FacultyAssignmentRepository r, UserRepository users, TeacherRepository teachers, SubjectRepository subjects) {
        this.r = r; this.users = users; this.teachers = teachers; this.subjects = subjects;
    }

    // The incoming entity from the controller only ever has teacher.id and
    // subject.id set (that's all the JSON body contains) — every other
    // field, including department, is null until re-fetched from the DB.
    // Validating against a.getTeacher().getDepartment() before this
    // re-fetch always saw null and rejected every assignment, valid or not.
    private FacultyAssignment hydrate(FacultyAssignment a) {
        if (a.getTeacher() == null || a.getTeacher().getId() == null
                || a.getSubject() == null || a.getSubject().getId() == null) {
            throw new RuntimeException("Teacher and subject are required");
        }
        Teacher teacher = teachers.findById(a.getTeacher().getId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        Subject subject = subjects.findById(a.getSubject().getId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        FacultyAssignment full = new FacultyAssignment();
        full.setTeacher(teacher);
        full.setSubject(subject);
        return full;
    }

    private void check(FacultyAssignment a, String email) {
        User u = users.findByEmail(email).orElseThrow();
        Teacher h = teachers.findByUser(u).orElseThrow();

        if (!Boolean.TRUE.equals(h.getHod()) || h.getDepartment() == null) {
            throw new RuntimeException("Only an HOD with an assigned department can manage faculty assignments.");
        }
        if (a.getTeacher() == null || a.getSubject() == null
                || a.getTeacher().getDepartment() == null || a.getSubject().getDepartment() == null) {
            throw new RuntimeException("Selected teacher or subject has no department set.");
        }

        Long hodDeptId = h.getDepartment().getId();
        Long teacherDeptId = a.getTeacher().getDepartment().getId();
        Long subjectDeptId = a.getSubject().getDepartment().getId();

        if (!hodDeptId.equals(teacherDeptId) || !hodDeptId.equals(subjectDeptId)) {
            throw new RuntimeException(String.format(
                    "HOD can assign subjects only inside their department. Your department: %s (id %d). Teacher's department: %s (id %d). Subject's department: %s (id %d).",
                    h.getDepartment().getName(), hodDeptId,
                    a.getTeacher().getDepartment().getName(), teacherDeptId,
                    a.getSubject().getDepartment().getName(), subjectDeptId));
        }
    }

    public FacultyAssignment createAssignment(FacultyAssignment a, String email) {
        FacultyAssignment full = hydrate(a);
        check(full, email);

        if (r.findAll().stream().anyMatch(x -> x.getTeacher() != null && x.getSubject() != null
                && x.getTeacher().getId().equals(full.getTeacher().getId())
                && x.getSubject().getId().equals(full.getSubject().getId()))) {
            throw new RuntimeException("This subject is already assigned to this teacher.");
        }
        return r.save(full);
    }

    public List<FacultyAssignment> getAllAssignments(String email) {
        User u = users.findByEmail(email).orElseThrow();
        if (u.getRole() == com.campusos.backend.enums.Role.PRINCIPAL) throw new RuntimeException("Principal does not manage faculty assignments.");
        Teacher h = teachers.findByUser(u).orElseThrow();
        if (!Boolean.TRUE.equals(h.getHod()) || h.getDepartment() == null) throw new RuntimeException("Only an HOD can view faculty assignments.");
        return r.findAll().stream().filter(a -> a.getTeacher() != null && a.getTeacher().getDepartment() != null && a.getTeacher().getDepartment().getId().equals(h.getDepartment().getId())).toList();
    }

    // Any Teacher (or HOD, who is also a teacher) can see their OWN subject
    // assignments — this is what Assignments/Attendance/Timetable actually
    // need for "what do I teach", as opposed to getAllAssignments() above
    // which is the HOD's department-wide management view.
    public List<FacultyAssignment> getMyAssignments(String email) {
        User u = users.findByEmail(email).orElseThrow();
        Teacher t = teachers.findByUser(u)
                .orElseThrow(() -> new RuntimeException("No teacher profile found for this account."));
        return r.findByTeacher(t);
    }

    public List<FacultyAssignment> getAssignmentsByTeacher(Teacher t) { return r.findByTeacher(t); }

    public FacultyAssignment updateAssignment(Long id, FacultyAssignment a, String email) {
        FacultyAssignment full = hydrate(a);
        check(full, email);
        FacultyAssignment x = r.findById(id).orElseThrow(() -> new RuntimeException("Assignment not found"));
        x.setTeacher(full.getTeacher());
        x.setSubject(full.getSubject());
        return r.save(x);
    }

    public void deleteAssignment(Long id, String email) {
        FacultyAssignment a = r.findById(id).orElseThrow();
        check(a, email);
        r.deleteById(id);
    }
}
