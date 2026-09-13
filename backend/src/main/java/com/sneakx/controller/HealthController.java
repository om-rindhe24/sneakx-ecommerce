package com.sneakx.controller;

import com.sneakx.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        Map<String, Object> details = new HashMap<>();
        details.put("status", "UP");
        details.put("service", "SneakX Backend REST API");
        details.put("version", "1.0.0");
        details.put("serverTime", LocalDateTime.now().toString());
        return ResponseEntity.ok(ApiResponse.success("SneakX service is operational", details));
    }
}
