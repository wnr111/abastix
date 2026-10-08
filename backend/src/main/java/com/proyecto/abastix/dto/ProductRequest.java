package com.proyecto.abastix.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProductRequest(
        @NotNull Integer categoryId,
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 50) String sku,
        @NotNull @DecimalMin(value = "0.01") BigDecimal price,
        @NotNull @Min(0) Integer stock,
        @NotNull @Min(0) Integer minStock) {
}
