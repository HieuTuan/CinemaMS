package com.sba301.cinemaai.analysis;

public class OpenAIMovieAnalysisStrategy implements MovieAnalysisStrategy {

    @Override
    public MovieAnalysisResult analyze(MovieAnalysisPrompt prompt) {
        throw new UnsupportedOperationException("OpenAI analysis provider is not enabled in mock-first phase");
    }

    @Override
    public String providerName() {
        return "openai";
    }
}
