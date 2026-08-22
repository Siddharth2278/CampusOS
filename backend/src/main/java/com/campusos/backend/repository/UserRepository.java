package com.campusos.backend.repository;

import com.campusos.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import com.campusos.backend.enums.Role;
import com.campusos.backend.enums.UserStatus;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    long countByRole(Role role);
    List<User> findByRoleAndStatus(Role role, UserStatus status);

}