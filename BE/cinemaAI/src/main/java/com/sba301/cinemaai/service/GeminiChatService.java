package com.sba301.cinemaai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * Thin HTTP client for Google Gemini Generative Language API.
 * Uses OkHttp (already in pom.xml) so no new dependencies are required.
 *
 * Endpoint: POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
 */
@Slf4j
@Service
public class GeminiChatService {

    private static final String API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";
    private static final MediaType JSON_MEDIA = MediaType.parse("application/json; charset=utf-8");

    @Value("${app.gemini.enabled:false}")
    private boolean enabled;

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-2.0-flash}")
    private String model;

    @Value("${app.gemini.temperature:0.3}")
    private double temperature;

    @Value("${app.gemini.max-output-tokens:1024}")
    private int maxOutputTokens;

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeminiChatService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
    }

    /**
     * Send a text prompt to Gemini and return the generated text.
     *
     * @return Optional.empty() when Gemini is disabled, API key is missing, or the call fails.
     */
    public Optional<String> chat(String prompt) {
        if (!enabled) {
            log.debug("Gemini API is disabled (app.gemini.enabled=false)");
            return Optional.empty();
        }
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key is not configured (app.gemini.api-key). Gemini calls will be skipped.");
            return Optional.empty();
        }

        try {
            String url = API_URL.formatted(model, apiKey);
            String body = buildRequestBody(prompt);

            Request request = new Request.Builder()
                    .url(url)
                    .post(RequestBody.create(body, JSON_MEDIA))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "(empty)";
                    log.warn("Gemini API returned HTTP {}: {}", response.code(), errorBody);
                    return Optional.empty();
                }
                if (response.body() == null) {
                    log.warn("Gemini API returned empty response body");
                    return Optional.empty();
                }
                String responseBody = response.body().string();
                String text = extractText(responseBody);
                log.debug("Gemini response length: {} chars", text.length());
                return Optional.of(text);
            }
        } catch (IOException e) {
            log.error("Gemini API call failed (IO): {}", e.getMessage());
            return Optional.empty();
        } catch (Exception e) {
            log.error("Gemini API call failed (unexpected): {}", e.getMessage());
            return Optional.empty();
        }
    }

    public boolean isEnabled() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }

    // -------------------------------------------------------------------------

    private String buildRequestBody(String prompt) throws Exception {
        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> generationConfig = Map.of(
                "temperature", temperature,
                "maxOutputTokens", maxOutputTokens
        );
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(content),
                "generationConfig", generationConfig
        );
        return objectMapper.writeValueAsString(requestBody);
    }

    private String extractText(String responseBody) throws IOException {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode textNode = root
                .path("candidates").path(0)
                .path("content").path("parts").path(0)
                .path("text");
        if (textNode.isMissingNode()) {
            log.warn("Unexpected Gemini response structure: {}", responseBody);
            return "";
        }
        return textNode.asText();
    }
}
