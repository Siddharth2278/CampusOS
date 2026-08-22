package com.campusos.backend.repository;

import com.campusos.backend.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CollegeRepository extends JpaRepository<College, Long> {
    Optional<College> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
