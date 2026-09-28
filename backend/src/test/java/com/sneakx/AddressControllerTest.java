package com.sneakx;

import com.sneakx.controller.AddressController;
import com.sneakx.dto.AddressDto;
import com.sneakx.dto.ApiResponse;
import com.sneakx.dto.CreateAddressRequest;
import com.sneakx.entity.Address;
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

    @Test
    @DisplayName("CASE 4: Creating a new default address automatically clears previous default")
    void testCreateNewDefaultClearsPrevious() {
        CreateAddressRequest req1 = new CreateAddressRequest();
        req1.setFullName("Home Address");
        req1.setPhone("+91 98765 43210");
        req1.setStreetAddress("101 MG Road");
        req1.setCity("Bengaluru");
        req1.setState("Karnataka");
        req1.setPostalCode("560001");
        req1.setIsDefault(true);
        AddressDto addr1 = addressController.createAddress(principal1, req1).getBody().getData();
        assertTrue(addr1.getIsDefault());

        CreateAddressRequest req2 = new CreateAddressRequest();
        req2.setFullName("Office Address");
        req2.setPhone("+91 98765 43210");
        req2.setStreetAddress("202 Brigade Road");
        req2.setCity("Bengaluru");
        req2.setState("Karnataka");
        req2.setPostalCode("560025");
        req2.setIsDefault(true);
        AddressDto addr2 = addressController.createAddress(principal1, req2).getBody().getData();
        assertTrue(addr2.getIsDefault());

        // Verify that in DB and API, only addr2 is default
        List<AddressDto> addresses = addressController.getUserAddresses(principal1).getBody().getData();
        long defaultCount = addresses.stream().filter(AddressDto::getIsDefault).count();
        assertEquals(1, defaultCount, "Exactly one address must be default");
        assertEquals(addr2.getId(), addresses.get(0).getId());
        assertTrue(addresses.get(0).getIsDefault());
    }

    @Test
    @DisplayName("CASE 5: Legacy data with multiple defaults is repaired on load so only most recent remains default")
    void testLegacyMultipleDefaultsRepairedOnLoad() {
        // Manually persist 4 addresses with isDefault = true (simulating legacy corrupt data)
        for (int i = 1; i <= 4; i++) {
            Address legacy = new Address();
            legacy.setUser(testUser1);
            legacy.setFullName("Legacy Address " + i);
            legacy.setPhone("+91 98765 43210");
            legacy.setStreetAddress("Street " + i);
            legacy.setCity("City " + i);
            legacy.setState("State " + i);
            legacy.setPostalCode("56000" + i);
            legacy.setIsDefault(true);
            addressRepository.save(legacy);
        }

        // Before load: verify database indeed has 4 addresses all marked default
        List<Address> beforeLoad = addressRepository.findByUserId(testUser1.getId());
        assertEquals(4, beforeLoad.size());
        assertEquals(4, beforeLoad.stream().filter(a -> Boolean.TRUE.equals(a.getIsDefault())).count());

        // Call getUserAddresses to trigger auto-repair
        ResponseEntity<ApiResponse<List<AddressDto>>> response = addressController.getUserAddresses(principal1);
        List<AddressDto> repairedDtos = response.getBody().getData();

        // Exactly 1 address in response should be default (and it must be the most recent one)
        assertEquals(4, repairedDtos.size());
        long defaultCountInDto = repairedDtos.stream().filter(AddressDto::getIsDefault).count();
        assertEquals(1, defaultCountInDto, "Only one address must be default in API response");
        assertTrue(repairedDtos.get(0).getIsDefault());

        // Verify the database was repaired in place
        List<Address> afterLoad = addressRepository.findByUserId(testUser1.getId());
        long defaultCountInDb = afterLoad.stream().filter(a -> Boolean.TRUE.equals(a.getIsDefault())).count();
        assertEquals(1, defaultCountInDb, "Database must be repaired so exactly one record has is_default = true");
    }
}

