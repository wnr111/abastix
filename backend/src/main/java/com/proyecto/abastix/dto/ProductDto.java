package com.proyecto.abastix.dto;

import java.math.BigDecimal;

public record ProductDto(
        Integer id,
        Integer categoryId,
        String categoryName,
        String name,
        String sku,
        BigDecimal price,
        Integer stock,
        Integer minStock,
        Boolean active) {
}
