package com.campusos.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Without this, every RuntimeException thrown by a service — e.g.
 * "This department already has a HOD.", "Only an approved teacher can
 * become HOD." — turned into an opaque 500 with no usable message in the
 * body, because Spring Boot's default error handling omits the exception
 * message unless told otherwise. The frontend's apiRequest() reads the
 * error response body as plain text and displays it directly, so this
 * turns every business-rule violation into a message the user actually
 * sees, instead of a silent failure or a generic "something went wrong".
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage() != null
                ? ex.getMessage()
                : "Something went wrong. Please try again.";

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.TEXT_PLAIN)
                .body(message);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleUnexpected(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.TEXT_PLAIN)
                .body("An unexpected error occurred. Please try again.");
    }
}
