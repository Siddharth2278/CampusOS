package com.campusos.backend.service;

import com.campusos.backend.entity.*;
import com.campusos.backend.enums.*;
import com.campusos.backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

import java.time.LocalDateTime;

@Service
public class ApprovalService {
 private final UserRepository users; private final TeacherRepository teachers; private final StudentRepository students; private final DepartmentRepository departments;
 public ApprovalService(UserRepository users, TeacherRepository teachers, StudentRepository students, DepartmentRepository departments){this.users=users;this.teachers=teachers;this.students=students;this.departments=departments;}
 private User current(String email){return users.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));}
 public List<Teacher> pendingTeachers(String email){
   User u=current(email);
   if(u.getRole()==Role.PRINCIPAL) return users.findByRoleAndStatus(Role.TEACHER,UserStatus.PENDING).stream().map(x->teachers.findByUser(x).orElse(null)).filter(x->x!=null).filter(t->t.getDepartment()!=null && departments.findById(t.getDepartment().getId()).orElseThrow().getHod()==null).toList();
   if(u.getRole()==Role.HOD){ Teacher h=teachers.findByUser(u).orElseThrow(); return users.findByRoleAndStatus(Role.TEACHER,UserStatus.PENDING).stream().map(x->teachers.findByUser(x).orElse(null)).filter(x->x!=null && x.getDepartment()!=null && h.getDepartment()!=null && x.getDepartment().getId().equals(h.getDepartment().getId())).toList(); }
   throw new RuntimeException("Not authorized");
 }
 public List<Student> pendingStudents(String email){
   User u=current(email); if(u.getRole()!=Role.TEACHER && u.getRole()!=Role.HOD) throw new RuntimeException("Only a Class Teacher can approve students");
   Teacher t=teachers.findByUser(u).orElseThrow();
   if(!Boolean.TRUE.equals(t.getClassTeacher())) throw new RuntimeException("You are not a Class Teacher");
   return students.findByDepartmentIdAndSemester(t.getDepartment().getId(),t.getClassTeacherSemester()).stream().filter(s->s.getUser()!=null && s.getUser().getStatus()==UserStatus.PENDING).toList();
 }
 public String approveTeacher(Long teacherId, boolean approve, String email){
   User actor=current(email); Teacher target=teachers.findById(teacherId).orElseThrow(()->new RuntimeException("Teacher not found"));
   if(target.getUser().getStatus()!=UserStatus.PENDING) throw new RuntimeException("Teacher is not pending");
   boolean principal=actor.getRole()==Role.PRINCIPAL;
   boolean hod=actor.getRole()==Role.HOD && teachers.findByUser(actor).orElseThrow().getDepartment().getId().equals(target.getDepartment().getId());
   if(!principal && !hod) throw new RuntimeException("You cannot approve this teacher");
   if(principal && target.getDepartment().getHod()!=null) throw new RuntimeException("This department has a HOD. Approval belongs to that HOD.");
    target.getUser().setStatus(approve?UserStatus.APPROVED:UserStatus.REJECTED);
    if (!approve) target.getUser().setRejectedAt(LocalDateTime.now());
    users.save(target.getUser());
    return approve?"Teacher approved":"Teacher rejected";
 }
 public String approveStudent(Long studentId, boolean approve, String email){
   User actor=current(email); Teacher t=teachers.findByUser(actor).orElseThrow();
   if(actor.getRole()!=Role.TEACHER && actor.getRole()!=Role.HOD || !Boolean.TRUE.equals(t.getClassTeacher())) throw new RuntimeException("Only the assigned Class Teacher can approve students");
   Student st=students.findById(studentId).orElseThrow(()->new RuntimeException("Student not found"));
   if(!st.getDepartment().getId().equals(t.getDepartment().getId()) || !st.getSemester().equals(t.getClassTeacherSemester())) throw new RuntimeException("Student is not in your assigned class");
    st.getUser().setStatus(approve?UserStatus.APPROVED:UserStatus.REJECTED);
    if (!approve) st.getUser().setRejectedAt(LocalDateTime.now());
    users.save(st.getUser());
    return approve?"Student approved":"Student rejected";
 }
 public String promoteToHod(Long teacherId, String principalEmail){
   Teacher t=teachers.findById(teacherId).orElseThrow(()->new RuntimeException("Teacher not found")); Department d=t.getDepartment(); if(d==null) throw new RuntimeException("Teacher has no department");
   if(d.getHod()!=null) throw new RuntimeException("This department already has a HOD");
   if(t.getUser().getStatus()!=UserStatus.APPROVED) throw new RuntimeException("Only an approved teacher can become HOD");
   t.setHod(true); t.getUser().setRole(Role.HOD); users.save(t.getUser()); teachers.save(t); d.setHod(t); departments.save(d); return "Teacher promoted to HOD";
 }
}
