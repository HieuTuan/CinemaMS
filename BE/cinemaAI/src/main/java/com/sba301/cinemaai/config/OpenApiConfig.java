package com.sba301.cinemaai.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cineAiOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("CineAI API")
                        .version("v1")
                        .description("Cinema booking platform with AI movie analysis"));
    }
}
