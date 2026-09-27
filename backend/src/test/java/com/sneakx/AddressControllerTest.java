package com.sneakx;

import com.sneakx.controller.AddressController;
import com.sneakx.dto.AddressDto;
import com.sneakx.dto.ApiResponse;
import com.sneakx.dto.CreateAddressRequest;
import com.sneakx.entity.Role;
import com.sneakx.entity.User;
import com.sneakx.exception.UnauthorizedException;
import com.sneakx.repository.AddressRepository;
import com.sneakx.repository.RoleRepository;
import com.sneakx.repository.UserRepository;
import com.sneakx.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
@Transactional
public class AddressControllerTest {

    @Autowired
    private AddressController addressController;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private User testUser1;
    private User testUser2;
    private UserPrincipal principal1;
    private UserPrincipal principal2;

    @BeforeEach
    void setUp() {
        Role role = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));

        testUser1 = new User("Rahul", "Sharma", "rahul.test" + System.currentTimeMillis() + "@sneakx.com", "hash", "+91 98765 43210");
        testUser1.setRoles(new HashSet<>(Collections.singletonList(role)));
        testUser1 = userRepository.save(testUser1);
        principal1 = UserPrincipal.create(testUser1);

        testUser2 = new User("Other", "User", "other.test" + System.currentTimeMillis() + "@sneakx.com", "hash", "+91 91234 56789");
        testUser2.setRoles(new HashSet<>(Collections.singletonList(role)));
        testUser2 = userRepository.save(testUser2);
        principal2 = UserPrincipal.create(testUser2);
    }

    @Test
    @DisplayName("CASE 1: Create address and list user addresses")
    void testCreateAndListAddresses() {
        CreateAddressRequest req = new CreateAddressRequest();
        req.setFullName("Rahul Sharma");
        req.setPhone("+91 98765 43210");
        req.setStreetAddress("123 MG Road");
        req.setCity("Bengaluru");
        req.setState("Karnataka");
        req.setPostalCode("560001");
        req.setIsDefault(true);

        ResponseEntity<ApiResponse<AddressDto>> response = addressController.createAddress(principal1, req);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        AddressDto created = response.getBody().getData();
        assertEquals("Rahul Sharma", created.getFullName());
        assertTrue(created.getIsDefault());

        ResponseEntity<ApiResponse<List<AddressDto>>> listResponse = addressController.getUserAddresses(principal1);
        assertEquals(HttpStatus.OK, listResponse.getStatusCode());
        List<AddressDto> addresses = listResponse.getBody().getData();
        assertFalse(addresses.isEmpty());
        assertEquals(created.getId(), addresses.get(0).getId());
    }

    @Test
    @DisplayName("CASE 2: Setting default address unmarks previous default")
    void testSetDefaultAddress() {
        CreateAddressRequest req1 = new CreateAddressRequest();
        req1.setFullName("Address 1");
        req1.setPhone("+91 98765 43210");
        req1.setStreetAddress("Street 1");
        req1.setCity("Mumbai");
        req1.setState("Maharashtra");
        req1.setPostalCode("400001");
        req1.setIsDefault(true);
        AddressDto addr1 = addressController.createAddress(principal1, req1).getBody().getData();

        CreateAddressRequest req2 = new CreateAddressRequest();
        req2.setFullName("Address 2");
        req2.setPhone("+91 98765 43210");
        req2.setStreetAddress("Street 2");
        req2.setCity("Pune");
        req2.setState("Maharashtra");
        req2.setPostalCode("411001");
        req2.setIsDefault(false);
        AddressDto addr2 = addressController.createAddress(principal1, req2).getBody().getData();

        // Switch default to Address 2
        addressController.setDefaultAddress(principal1, addr2.getId());

        List<AddressDto> addresses = addressController.getUserAddresses(principal1).getBody().getData();
        for (AddressDto a : addresses) {
            if (a.getId().equals(addr2.getId())) {
                assertTrue(a.getIsDefault());
            } else if (a.getId().equals(addr1.getId())) {
                assertFalse(a.getIsDefault());
            }
        }
    }

    @Test
    @DisplayName("CASE 3: User cannot update or delete another user's address")
    void testOwnershipSecurity() {
        CreateAddressRequest req = new CreateAddressRequest();
        req.setFullName("User 1 Secret Address");
        req.setPhone("+91 98765 43210");
        req.setStreetAddress("Private Lane");
        req.setCity("Delhi");
        req.setState("Delhi");
        req.setPostalCode("110001");
        AddressDto addr = addressController.createAddress(principal1, req).getBody().getData();

        // User 2 attempts to update User 1's address
        assertThrows(UnauthorizedException.class, () -> {
            addressController.updateAddress(principal2, addr.getId(), req);
        });

        // User 2 attempts to delete User 1's address
        assertThrows(UnauthorizedException.class, () -> {
            addressController.deleteAddress(principal2, addr.getId());
        });

        // User 2 attempts to set default User 1's address
        assertThrows(UnauthorizedException.class, () -> {
            addressController.setDefaultAddress(principal2, addr.getId());
        });
    }
}
