package com.proyecto.abastix.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.proyecto.abastix.dto.CategoryDto;
import com.proyecto.abastix.dto.CategoryRequest;
import com.proyecto.abastix.entity.Category;
import com.proyecto.abastix.repository.CategoryRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuditPublisher audit;

    public CategoryService(CategoryRepository categoryRepository, AuditPublisher audit) {
        this.categoryRepository = categoryRepository;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> listar(Boolean active) {
        List<Category> categories;
        if (isAdmin()) {
            categories = active == null ? categoryRepository.findAll() : categoryRepository.findByActive(active);
        } else {
            categories = categoryRepository.findByActive(true);
        }
        return categories.stream().map(this::toDto).toList();
    }

    @Transactional
    public CategoryDto crear(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name().trim());
        category.setActive(true);
        Category saved = categoryRepository.save(category);
        audit.publicar("INSERTAR", "categories", "Se inserto la categoria " + saved.getName());
        return toDto(saved);
    }

    @Transactional
    public CategoryDto actualizar(Integer id, CategoryRequest request) {
        Category category = findVisible(id);
        category.setName(request.name().trim());
        Category saved = categoryRepository.save(category);
        audit.publicar("ACTUALIZAR", "categories", "Se actualizo la categoria " + saved.getName());
        return toDto(saved);
    }

    @Transactional
    public CategoryDto desactivar(Integer id) {
        Category category = findVisible(id);
        category.setActive(false);
        Category saved = categoryRepository.save(category);
        audit.publicar("DESACTIVAR", "categories", "Se desactivo la categoria " + saved.getName());
        return toDto(saved);
    }

    @Transactional
    public CategoryDto activar(Integer id) {
        Category category = findVisible(id);
        category.setActive(true);
        Category saved = categoryRepository.save(category);
        audit.publicar("ACTIVAR", "categories", "Se activo la categoria " + saved.getName());
        return toDto(saved);
    }

    private Category findVisible(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada"));
        if (!isAdmin() && Boolean.FALSE.equals(category.getActive())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria no encontrada");
        }
        return category;
    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private CategoryDto toDto(Category category) {
        return new CategoryDto(category.getId(), category.getName(), category.getActive());
    }
}
