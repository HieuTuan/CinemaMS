package com.sba301.cinemaai.analysis;

public interface MovieAnalysisStrategy {

    MovieAnalysisResult analyze(MovieAnalysisPrompt prompt);

    String providerName();
}
