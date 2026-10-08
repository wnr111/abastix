package com.proyecto.abastix.dto;

public record CustomerDto(
        Integer id,
        String fullName,
        String document,
        String phone,
        String email,
        Boolean active) {
}
