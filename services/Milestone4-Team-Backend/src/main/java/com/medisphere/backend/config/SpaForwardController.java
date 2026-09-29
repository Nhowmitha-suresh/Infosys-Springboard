package com.medisphere.backend.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * The built React app (Vite) is served as static resources from
 * src/main/resources/static (see index.html there). This forwards any
 * non-API, non-WebSocket, non-asset route back to index.html so
 * React Router can handle client-side routes like /patients/101/360
 * on a hard refresh or direct link, instead of getting a 404 from
 * Spring's default resource handler.
 */
@Controller
public class SpaForwardController {

@GetMapping({
            "/",
            "/{path:^(?!api|ws|assets|index\\.html|favicon\\.ico).*$}",
            "/{path:^(?!api|ws|assets|index\\.html|favicon\\.ico).*$}/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
