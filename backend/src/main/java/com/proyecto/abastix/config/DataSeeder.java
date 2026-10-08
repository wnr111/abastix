package com.proyecto.abastix.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.proyecto.abastix.entity.Role;
import com.proyecto.abastix.entity.User;
import com.proyecto.abastix.repository.RoleRepository;
import com.proyecto.abastix.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_ADMIN")));
        Role empleadoRole = roleRepository.findByName("ROLE_EMPLEADO")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_EMPLEADO")));

        createIfMissing("admin@abastix.com", "Administrador Abastix", adminRole);
        createIfMissing("empleado@abastix.com", "Empleado Abastix", empleadoRole);
    }

    private void createIfMissing(String email, String fullName, Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("123456"));
        user.setRole(role);
        user.setActive(true);
        userRepository.save(user);
    }
}
