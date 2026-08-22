package com.campusos.backend.controller;
import com.campusos.backend.dto.ApprovalRequest; import com.campusos.backend.entity.Student; import com.campusos.backend.entity.Teacher; import com.campusos.backend.service.ApprovalService; import org.springframework.web.bind.annotation.*; import org.springframework.security.core.annotation.AuthenticationPrincipal; import java.util.List;
@RestController @RequestMapping("/api/approvals")
public class ApprovalController { private final ApprovalService s; public ApprovalController(ApprovalService s){this.s=s;}
 @GetMapping("/teachers") public List<Teacher> pendingTeachers(@AuthenticationPrincipal String email){return s.pendingTeachers(email);}
 @PutMapping("/teachers/{id}") public String teacher(@PathVariable Long id,@RequestBody ApprovalRequest r,@AuthenticationPrincipal String email){return s.approveTeacher(id,r.isApproved(),email);}
 @GetMapping("/students") public List<Student> pendingStudents(@AuthenticationPrincipal String email){return s.pendingStudents(email);}
 @PutMapping("/students/{id}") public String student(@PathVariable Long id,@RequestBody ApprovalRequest r,@AuthenticationPrincipal String email){return s.approveStudent(id,r.isApproved(),email);}
 @PutMapping("/teachers/{id}/promote-hod") public String hod(@PathVariable Long id,@AuthenticationPrincipal String email){return s.promoteToHod(id,email);}
}
