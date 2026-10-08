package com.proyecto.abastix.rabbit;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.proyecto.abastix.config.RabbitMQConfig;
import com.proyecto.abastix.entity.Evento;
import com.proyecto.abastix.entity.Log;
import com.proyecto.abastix.entity.User;
import com.proyecto.abastix.repository.LogRepository;
import com.proyecto.abastix.repository.UserRepository;

@Service
public class RabbitMQConsumer {

    private static final Logger log = LoggerFactory.getLogger(RabbitMQConsumer.class);

    private final LogRepository logRepository;
    private final UserRepository userRepository;

    public RabbitMQConsumer(LogRepository logRepository, UserRepository userRepository) {
        this.logRepository = logRepository;
        this.userRepository = userRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    @Transactional
    public void recibirData(Evento evento) {
        if (evento.getUserId() == null) {
            log.warn("Evento descartado: userId nulo (accion={}, tabla={})",
                    evento.getAccion(), evento.getTabla());
            return;
        }
        User user = userRepository.findById(evento.getUserId()).orElse(null);
        if (user == null) {
            log.warn("Evento descartado: no existe user_id={} (accion={}, tabla={})",
                    evento.getUserId(), evento.getAccion(), evento.getTabla());
            return;
        }
        Log audit = new Log();
        audit.setUser(user);
        audit.setAction(evento.getAccion() + " - " + evento.getDescripcion());
        audit.setEntity(evento.getTabla());
        audit.setCreatedAt(LocalDateTime.now());
        logRepository.save(audit);
    }
}
