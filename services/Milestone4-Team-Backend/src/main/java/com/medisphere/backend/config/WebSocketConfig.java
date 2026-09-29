package com.medisphere.backend.config;

import com.medisphere.backend.websocket.VitalsWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final VitalsWebSocketHandler vitalsWebSocketHandler;

    private static final Pattern PATIENT_ID_PATTERN = Pattern.compile("/ws/vitals/([^/]+)");

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Matches the contract documented in src/api/vitalsService.js:
        //   WS /ws/vitals/{patientId} -> { patientId, heartRate, spo2, systolic, diastolic, temp, ts }
        registry.addHandler(vitalsWebSocketHandler, "/ws/vitals/*")
                .addInterceptors(patientIdInterceptor())
                .setAllowedOriginPatterns("*"); // tighten to your deployed frontend origin in production
    }

    /** Pulls {patientId} out of the raw URL path and stashes it in the WebSocket session attributes. */
    private HandshakeInterceptor patientIdInterceptor() {
return new HttpSessionHandshakeInterceptor() {
            @Override
            public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                            WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
                Matcher m = PATIENT_ID_PATTERN.matcher(request.getURI().getPath());
                if (m.find()) {
                    attributes.put("patientId", m.group(1));
                }
                return super.beforeHandshake(request, response, wsHandler, attributes);
            }
        };
    }
}
