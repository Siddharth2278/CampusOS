package com.campusos.backend.controller;

import com.campusos.backend.dto.CollegeSummaryDto;
import com.campusos.backend.repository.CollegeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colleges")
public class CollegeController {

    private final CollegeRepository collegeRepository;

    public CollegeController(CollegeRepository collegeRepository) {
        this.collegeRepository = collegeRepository;
    }

    // Public: used on the registration page so Students/Teachers can pick their college
    // before they have an account or a login token.
    @GetMapping
    public List<CollegeSummaryDto> listColleges() {
        return collegeRepository.findAll().stream()
                .map(c -> new CollegeSummaryDto(c.getId(), c.getName(), c.getType(), c.getTotalSemesters()))
                .toList();
    }
}
