package com.proyecto.abastix.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.proyecto.abastix.dto.ProductDto;
import com.proyecto.abastix.dto.ProductRequest;
import com.proyecto.abastix.entity.Category;
import com.proyecto.abastix.entity.Product;
import com.proyecto.abastix.repository.CategoryRepository;
import com.proyecto.abastix.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AuditPublisher audit;

    public ProductService(ProductRepository productRepository,
            CategoryRepository categoryRepository,
            AuditPublisher audit) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> listar(Boolean active) {
        List<Product> products;
        if (isAdmin()) {
            products = active == null ? productRepository.findAll() : productRepository.findByActive(active);
        } else {
            // Empleado: solo activos, ignora el filtro
            products = productRepository.findByActive(true);
        }
        return products.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ProductDto obtener(Integer id) {
        return toDto(findVisible(id));
    }

    @Transactional
    public ProductDto crear(ProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria no existe"));
        Product product = new Product();
        apply(product, category, request);
        product.setActive(true);
        Product saved = productRepository.save(product);
        audit.publicar("INSERTAR", "products", "Se inserto " + saved.getName() + " (" + saved.getSku() + ")");
        return toDto(saved);
    }

    @Transactional
    public ProductDto actualizar(Integer id, ProductRequest request) {
        Product product = findVisible(id);
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria no existe"));
        apply(product, category, request);
        Product saved = productRepository.save(product);
        audit.publicar("ACTUALIZAR", "products", "Se actualizo " + saved.getName() + " (" + saved.getSku() + ")");
        return toDto(saved);
    }

    @Transactional
    public ProductDto desactivar(Integer id) {
        Product product = findVisible(id);
        product.setActive(false);
        Product saved = productRepository.save(product);
        audit.publicar("DESACTIVAR", "products", "Se desactivo " + saved.getName() + " (" + saved.getSku() + ")");
        return toDto(saved);
    }

    @Transactional
    public ProductDto activar(Integer id) {
        Product product = findVisible(id);
        product.setActive(true);
        Product saved = productRepository.save(product);
        audit.publicar("ACTIVAR", "products", "Se activo " + saved.getName() + " (" + saved.getSku() + ")");
        return toDto(saved);
    }

    private Product findVisible(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        if (!isAdmin() && Boolean.FALSE.equals(product.getActive())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado");
        }
        return product;
    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private void apply(Product product, Category category, ProductRequest request) {
        product.setCategory(category);
        product.setName(request.name().trim());
        product.setSku(request.sku().trim());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setMinStock(request.minStock());
    }

    private ProductDto toDto(Product product) {
        return new ProductDto(product.getId(),
                product.getCategory().getId(), product.getCategory().getName(),
                product.getName(), product.getSku(), product.getPrice(),
                product.getStock(), product.getMinStock(), product.getActive());
    }
}
