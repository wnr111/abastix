package com.proyecto.abastix.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.proyecto.abastix.entity.Evento;
import com.proyecto.abastix.entity.User;
import com.proyecto.abastix.rabbit.RabbitMQProducer;
import com.proyecto.abastix.repository.UserRepository;

/**
 * Centraliza la auditoria best-effort: publicar nunca rompe el flujo de negocio.
 * Cuando hay sesion (JWT) resuelve el userId desde el SecurityContext;
 * en login se pasa el userId explicito porque aun no hay sesion.
 */
@Service
public class AuditPublisher {

    private static final Logger log = LoggerFactory.getLogger(AuditPublisher.class);

    private final RabbitMQProducer producer;
    private final UserRepository userRepository;

    public AuditPublisher(RabbitMQProducer producer, UserRepository userRepository) {
        this.producer = producer;
        this.userRepository = userRepository;
    }

    public void publicar(String accion, String tabla, String descripcion) {
        publicar(accion, tabla, descripcion, currentUserId());
    }

    public void publicar(String accion, String tabla, String descripcion, Integer userId) {
        try {
            if (userId == null) {
                log.warn("Auditoria omitida: sin userId (accion={}, tabla={})", accion, tabla);
                return;
            }
            Evento evento = new Evento();
            evento.setAccion(accion);
            evento.setTabla(tabla);
            evento.setDescripcion(descripcion);
            evento.setUserId(userId);
            producer.enviarDatos(evento);
        } catch (Exception e) {
            log.warn("No se pudo publicar evento de auditoria {} en {}: {}", accion, tabla, e.getMessage());
        }
    }

    private Integer currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof String email)) {
            return null;
        }
        return userRepository.findByEmail(email).map(User::getId).orElse(null);
    }
}
