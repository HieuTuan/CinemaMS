package com.sba301.cinemaai.analysis;

public class GeminiMovieAnalysisStrategy implements MovieAnalysisStrategy {

    @Override
    public MovieAnalysisResult analyze(MovieAnalysisPrompt prompt) {
        throw new UnsupportedOperationException("Gemini analysis provider is not enabled in mock-first phase");
    }

    @Override
    public String providerName() {
        return "gemini";
    }
}
