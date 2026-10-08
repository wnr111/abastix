package com.proyecto.abastix.exception;

public record ApiError(int status, String message) {
}
