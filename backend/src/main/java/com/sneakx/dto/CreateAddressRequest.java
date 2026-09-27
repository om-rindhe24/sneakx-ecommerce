package com.sneakx.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateAddressRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private String phoneNumber;

    @NotBlank(message = "Street address is required")
    private String streetAddress;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    private String postalCode;
    private String pinCode;

    private String country = "India";
    private Boolean isDefault = false;
    private Boolean saveAddress = true;

    public CreateAddressRequest() {}

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone != null && !phone.isBlank() ? phone : phoneNumber;
    }

    public void setPhone(String phone) {
        this.phone = phone;
        if (this.phoneNumber == null) {
            this.phoneNumber = phone;
        }
    }

    public String getPhoneNumber() {
        return phoneNumber != null && !phoneNumber.isBlank() ? phoneNumber : phone;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
        if (this.phone == null) {
            this.phone = phoneNumber;
        }
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode != null && !postalCode.isBlank() ? postalCode : pinCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
        if (this.pinCode == null) {
            this.pinCode = postalCode;
        }
    }

    public String getPinCode() {
        return pinCode != null && !pinCode.isBlank() ? pinCode : postalCode;
    }

    public void setPinCode(String pinCode) {
        this.pinCode = pinCode;
        if (this.postalCode == null) {
            this.postalCode = pinCode;
        }
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Boolean getIsDefault() {
        return isDefault != null ? isDefault : false;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public Boolean getSaveAddress() {
        return saveAddress != null ? saveAddress : true;
    }

    public void setSaveAddress(Boolean saveAddress) {
        this.saveAddress = saveAddress;
    }
}
