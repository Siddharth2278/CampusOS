package com.campusos.backend.service;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.campusos.backend.dto.*;
import com.campusos.backend.entity.*;
import com.campusos.backend.enums.EventAudience;
import com.campusos.backend.repository.*;

@Service
public class AcademicCalendarService {

    private final AcademicCalendarRepository academicCalendarRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public AcademicCalendarService(
            AcademicCalendarRepository academicCalendarRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository) {
        this.academicCalendarRepository = academicCalendarRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    public String createAcademicCalendar(AcademicCalendarRequest request,String email) {
        AcademicCalendar item = new AcademicCalendar();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setType(request.getType());
        item.setAudience(request.getAudience());
        item.setSemester(request.getSemester());
        item.setVenue(request.getVenue());
        item.setEventDate(request.getEventDate());
        item.setStartTime(request.getStartTime());
        item.setEndTime(request.getEndTime());
        item.setCreatedAt(LocalDate.now());

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            item.setDepartment(department);
        }

        User user = userRepository.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        item.setCreatedBy(user);

        academicCalendarRepository.save(item);
        return "Academic Calendar item created successfully.";
    }

    public List<AcademicCalendarResponse> getAllAcademicCalendar() {
        return academicCalendarRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AcademicCalendarResponse> getStudentCalendar(Long departmentId,Integer semester){
        Set<AcademicCalendar> items=new LinkedHashSet<>();
        items.addAll(academicCalendarRepository.findByAudienceOrderByEventDateAsc(EventAudience.ALL));
        for(AcademicCalendar item:academicCalendarRepository.findByAudienceOrderByEventDateAsc(EventAudience.STUDENT)){
            boolean dep=item.getDepartment()==null||item.getDepartment().getId().equals(departmentId);
            boolean sem=item.getSemester()==null||item.getSemester().equals(semester);
            if(dep&&sem) items.add(item);
        }
        return items.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AcademicCalendarResponse> getTeacherCalendar(Long departmentId){
        Set<AcademicCalendar> items=new LinkedHashSet<>();
        items.addAll(academicCalendarRepository.findByAudienceOrderByEventDateAsc(EventAudience.ALL));
        for(AcademicCalendar item:academicCalendarRepository.findByAudienceOrderByEventDateAsc(EventAudience.TEACHER)){
            if(item.getDepartment()==null||item.getDepartment().getId().equals(departmentId)) items.add(item);
        }
        return items.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AcademicCalendarResponse> getHodCalendar(Long departmentId){
        Set<AcademicCalendar> items=new LinkedHashSet<>();
        items.addAll(academicCalendarRepository.findByAudienceOrderByEventDateAsc(EventAudience.ALL));
        for(AcademicCalendar item:academicCalendarRepository.findByAudienceOrderByEventDateAsc(EventAudience.HOD)){
            if(item.getDepartment()==null||item.getDepartment().getId().equals(departmentId)) items.add(item);
        }
        return items.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private AcademicCalendarResponse mapToResponse(AcademicCalendar item){
        return new AcademicCalendarResponse(
            item.getId(),item.getTitle(),item.getDescription(),item.getType(),
            item.getAudience(),
            item.getDepartment()!=null?item.getDepartment().getName():null,
            item.getSemester(),item.getVenue(),item.getEventDate(),
            item.getStartTime(),item.getEndTime(),
            item.getCreatedBy()!=null?item.getCreatedBy().getFirstName()+" "+item.getCreatedBy().getLastName():null
        );
    }
}
