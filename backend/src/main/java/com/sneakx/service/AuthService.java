package com.sneakx.service;

import com.sneakx.dto.AuthRequest;
import com.sneakx.dto.AuthResponse;
import com.sneakx.dto.RegisterRequest;
import com.sneakx.dto.UserDto;
import com.sneakx.entity.Cart;
import com.sneakx.entity.Role;
import com.sneakx.entity.User;
import com.sneakx.entity.Wishlist;
import com.sneakx.exception.BadRequestException;
import com.sneakx.exception.ResourceNotFoundException;
import com.sneakx.repository.CartRepository;
import com.sneakx.repository.RoleRepository;
import com.sneakx.repository.UserRepository;
import com.sneakx.repository.WishlistRepository;
import com.sneakx.security.JwtTokenProvider;
import com.sneakx.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       CartRepository cartRepository,
                       WishlistRepository wishlistRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.cartRepository = cartRepository;
        this.wishlistRepository = wishlistRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists.");
        }

        User user = new User(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone()
        );

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));

        user.setRoles(new HashSet<>(Collections.singletonList(userRole)));
        User savedUser = userRepository.save(user);

        // Pre-initialize empty user cart & wishlist
        Cart cart = new Cart(savedUser);
        cartRepository.save(cart);

        Wishlist wishlist = new Wishlist(savedUser);
        wishlistRepository.save(wishlist);

        // Authenticate new user automatically
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        List<String> roles = savedUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return new AuthResponse(jwt, savedUser.getId(), savedUser.getFirstName(), savedUser.getLastName(), savedUser.getEmail(), roles);
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new AuthResponse(jwt, userPrincipal.getId(), userPrincipal.getFirstName(), userPrincipal.getLastName(), userPrincipal.getUsername(), roles);
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UserPrincipal principal) {
        if (principal == null) {
            throw new BadRequestException("No authenticated user in context");
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return new UserDto(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getPhone(), roles);
    }
}
