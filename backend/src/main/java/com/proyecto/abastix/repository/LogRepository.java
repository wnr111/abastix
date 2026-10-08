package com.proyecto.abastix.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.proyecto.abastix.entity.Log;

@Repository
public interface LogRepository extends JpaRepository<Log, Integer> {
}
