package com.sneakx.dto;

import java.math.BigDecimal;

public class SizeAdvisorResponse {
    private BigDecimal recommendedSize;
    private String fitType; // TRUE_TO_SIZE, RUNS_SMALL, RUNS_LARGE
    private String fitNote;
    private String explanation;

    public SizeAdvisorResponse() {}

    public SizeAdvisorResponse(BigDecimal recommendedSize, String fitType, String fitNote, String explanation) {
        this.recommendedSize = recommendedSize;
        this.fitType = fitType;
        this.fitNote = fitNote;
        this.explanation = explanation;
    }

    public BigDecimal getRecommendedSize() {
        return recommendedSize;
    }

    public void setRecommendedSize(BigDecimal recommendedSize) {
        this.recommendedSize = recommendedSize;
    }

    public String getFitType() {
        return fitType;
    }

    public void setFitType(String fitType) {
        this.fitType = fitType;
    }

    public String getFitNote() {
        return fitNote;
    }

    public void setFitNote(String fitNote) {
        this.fitNote = fitNote;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
