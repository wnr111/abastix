package com.proyecto.abastix.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank @Size(max = 150) String fullName,
        @NotBlank @Size(max = 30) String document,
        @Size(max = 30) String phone,
        @Size(max = 150) @Email String email) {
}
