package com.medisphere.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ConsentVerifyResponse {
    private String status; // SUCCESS | ERROR
    private String message;
    private List<String> errors;
}
