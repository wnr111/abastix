package com.proyecto.abastix.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.proyecto.abastix.dto.CustomerDto;
import com.proyecto.abastix.dto.CustomerRequest;
import com.proyecto.abastix.entity.Customer;
import com.proyecto.abastix.repository.CustomerRepository;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AuditPublisher audit;

    public CustomerService(CustomerRepository customerRepository, AuditPublisher audit) {
        this.customerRepository = customerRepository;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<CustomerDto> listar(Boolean active) {
        List<Customer> customers;
        if (isAdmin()) {
            customers = active == null ? customerRepository.findAll() : customerRepository.findByActive(active);
        } else {
            customers = customerRepository.findByActive(true);
        }
        return customers.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public CustomerDto obtener(Integer id) {
        return toDto(findVisible(id));
    }

    @Transactional
    public CustomerDto crear(CustomerRequest request) {
        Customer customer = new Customer();
        apply(customer, request);
        customer.setActive(true);
        Customer saved = customerRepository.save(customer);
        audit.publicar("INSERTAR", "customers", "Se inserto el cliente " + saved.getFullName());
        return toDto(saved);
    }

    @Transactional
    public CustomerDto actualizar(Integer id, CustomerRequest request) {
        Customer customer = findVisible(id);
        apply(customer, request);
        Customer saved = customerRepository.save(customer);
        audit.publicar("ACTUALIZAR", "customers", "Se actualizo el cliente " + saved.getFullName());
        return toDto(saved);
    }

    @Transactional
    public CustomerDto desactivar(Integer id) {
        Customer customer = findVisible(id);
        customer.setActive(false);
        Customer saved = customerRepository.save(customer);
        audit.publicar("DESACTIVAR", "customers", "Se desactivo el cliente " + saved.getFullName());
        return toDto(saved);
    }

    @Transactional
    public CustomerDto activar(Integer id) {
        Customer customer = findVisible(id);
        customer.setActive(true);
        Customer saved = customerRepository.save(customer);
        audit.publicar("ACTIVAR", "customers", "Se activo el cliente " + saved.getFullName());
        return toDto(saved);
    }

    private Customer findVisible(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        if (!isAdmin() && Boolean.FALSE.equals(customer.getActive())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado");
        }
        return customer;
    }

    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private void apply(Customer customer, CustomerRequest request) {
        customer.setFullName(request.fullName().trim());
        customer.setDocument(request.document().trim());
        customer.setPhone(request.phone() == null || request.phone().isBlank() ? null : request.phone().trim());
        customer.setEmail(request.email() == null || request.email().isBlank() ? null : request.email().trim());
    }

    private CustomerDto toDto(Customer customer) {
        return new CustomerDto(customer.getId(), customer.getFullName(), customer.getDocument(),
                customer.getPhone(), customer.getEmail(), customer.getActive());
    }
}
