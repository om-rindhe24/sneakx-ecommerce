package com.sneakx.dto;

import com.sneakx.entity.Address;

public class AddressDto {
    private Long id;
    private String fullName;
    private String phone;
    private String phoneNumber;
    private String streetAddress;
    private String city;
    private String state;
    private String postalCode;
    private String pinCode;
    private String country;
    private Boolean isDefault;

    public AddressDto() {}

    public static AddressDto fromEntity(Address address) {
        if (address == null) return null;
        AddressDto dto = new AddressDto();
        dto.setId(address.getId());
        dto.setFullName(address.getFullName());
        dto.setPhone(address.getPhone());
        dto.setPhoneNumber(address.getPhone());
        dto.setStreetAddress(address.getStreetAddress());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setPostalCode(address.getPostalCode());
        dto.setPinCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        dto.setIsDefault(Boolean.TRUE.equals(address.getIsDefault()));
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone != null ? phone : phoneNumber;
    }

    public void setPhone(String phone) {
        this.phone = phone;
        if (this.phoneNumber == null) {
            this.phoneNumber = phone;
        }
    }

    public String getPhoneNumber() {
        return phoneNumber != null ? phoneNumber : phone;
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
        return postalCode != null ? postalCode : pinCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
        if (this.pinCode == null) {
            this.pinCode = postalCode;
        }
    }

    public String getPinCode() {
        return pinCode != null ? pinCode : postalCode;
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
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}
