package com.sneakx.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class SizeAdvisorRequest {

    @NotNull(message = "Target product ID is required")
    private Long targetProductId;

    @NotBlank(message = "Reference brand is required (e.g., Nike, Adidas, Jordan, Yeezy)")
    private String referenceBrand;

    @NotNull(message = "Reference size is required")
    @DecimalMin(value = "4.0", message = "Size must be at least US 4.0")
    private BigDecimal referenceSize;

    public SizeAdvisorRequest() {}

    public Long getTargetProductId() {
        return targetProductId;
    }

    public void setTargetProductId(Long targetProductId) {
        this.targetProductId = targetProductId;
    }

    public String getReferenceBrand() {
        return referenceBrand;
    }

    public void setReferenceBrand(String referenceBrand) {
        this.referenceBrand = referenceBrand;
    }

    public BigDecimal getReferenceSize() {
        return referenceSize;
    }

    public void setReferenceSize(BigDecimal referenceSize) {
        this.referenceSize = referenceSize;
    }
}
