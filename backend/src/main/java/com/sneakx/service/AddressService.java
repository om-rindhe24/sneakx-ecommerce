package com.sneakx.service;

import com.sneakx.dto.AddressDto;
import com.sneakx.dto.CreateAddressRequest;
import com.sneakx.entity.Address;
import com.sneakx.entity.User;
import com.sneakx.exception.BadRequestException;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.exception.UnauthorizedException;
import com.sneakx.repository.AddressRepository;
import com.sneakx.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AddressDto> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescIdDesc(userId).stream()
                .map(AddressDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AddressDto getAddressById(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to this address.");
        }
        return AddressDto.fromEntity(address);
    }

    @Transactional
    public AddressDto createAddress(Long userId, CreateAddressRequest request) {
        validateAddressRequest(request);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<Address> existing = addressRepository.findByUserId(userId);
        boolean isFirst = existing.isEmpty();
        boolean makeDefault = Boolean.TRUE.equals(request.getIsDefault()) || isFirst;

        if (makeDefault) {
            for (Address a : existing) {
                if (Boolean.TRUE.equals(a.getIsDefault())) {
                    a.setIsDefault(false);
                    addressRepository.save(a);
                }
            }
        }

        Address address = new Address();
        address.setUser(user);
        address.setFullName(request.getFullName().trim());
        address.setPhone(request.getPhone().trim());
        address.setStreetAddress(request.getStreetAddress().trim());
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        address.setCountry(request.getCountry() != null && !request.getCountry().isBlank() ? request.getCountry().trim() : "India");
        address.setIsDefault(makeDefault);

        Address saved = addressRepository.save(address);
        return AddressDto.fromEntity(saved);
    }

    @Transactional
    public AddressDto updateAddress(Long userId, Long addressId, CreateAddressRequest request) {
        validateAddressRequest(request);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to update this address.");
        }

        if (Boolean.TRUE.equals(request.getIsDefault()) && !Boolean.TRUE.equals(address.getIsDefault())) {
            List<Address> userAddresses = addressRepository.findByUserId(userId);
            for (Address a : userAddresses) {
                if (!a.getId().equals(addressId) && Boolean.TRUE.equals(a.getIsDefault())) {
                    a.setIsDefault(false);
                    addressRepository.save(a);
                }
            }
            address.setIsDefault(true);
        } else if (request.getIsDefault() != null) {
            address.setIsDefault(request.getIsDefault());
        }

        address.setFullName(request.getFullName().trim());
        address.setPhone(request.getPhone().trim());
        address.setStreetAddress(request.getStreetAddress().trim());
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        if (request.getCountry() != null && !request.getCountry().isBlank()) {
            address.setCountry(request.getCountry().trim());
        }

        Address saved = addressRepository.save(address);
        return AddressDto.fromEntity(saved);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to delete this address.");
        }

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserIdOrderByIsDefaultDescIdDesc(userId);
            if (!remaining.isEmpty() && remaining.stream().noneMatch(a -> Boolean.TRUE.equals(a.getIsDefault()))) {
                Address newDefault = remaining.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    @Transactional
    public AddressDto setDefaultAddress(Long userId, Long addressId) {
        Address target = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!target.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to modify this address.");
        }

        List<Address> userAddresses = addressRepository.findByUserId(userId);
        for (Address a : userAddresses) {
            boolean shouldBeDefault = a.getId().equals(addressId);
            if (!Objects.equals(a.getIsDefault(), shouldBeDefault)) {
                a.setIsDefault(shouldBeDefault);
                addressRepository.save(a);
            }
        }

        target.setIsDefault(true);
        Address saved = addressRepository.save(target);
        return AddressDto.fromEntity(saved);
    }

    private void validateAddressRequest(CreateAddressRequest request) {
        if (request == null) {
            throw new BadRequestException("Address payload cannot be null.");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new BadRequestException("Full name is required.");
        }
        if (request.getPhone() == null || request.getPhone().isBlank()) {
            throw new BadRequestException("Phone number is required.");
        }
        if (request.getStreetAddress() == null || request.getStreetAddress().isBlank()) {
            throw new BadRequestException("Street address is required.");
        }
        if (request.getCity() == null || request.getCity().isBlank()) {
            throw new BadRequestException("City is required.");
        }
        if (request.getState() == null || request.getState().isBlank()) {
            throw new BadRequestException("State is required.");
        }
        if (request.getPostalCode() == null || request.getPostalCode().isBlank()) {
            throw new BadRequestException("Postal/PIN code is required.");
        }
    }
}
