package com.sneakx.util;

import com.sneakx.entity.*;
import com.sneakx.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Value("${app.admin.initial-password:${ADMIN_INITIAL_PASSWORD:ChangeMe123!}}")
    private String adminInitialPassword;

    @Value("${app.demo.customer-password:${DEMO_CUSTOMER_PASSWORD:ChangeMe123!}}")
    private String demoCustomerPassword;

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final ReviewRepository reviewRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           BrandRepository brandRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           ProductVariantRepository variantRepository,
                           ProductImageRepository imageRepository,
                           ReviewRepository reviewRepository,
                           AddressRepository addressRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.imageRepository = imageRepository;
        this.reviewRepository = reviewRepository;
        this.addressRepository = addressRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            log.info("[DataInitializer] Seeding initial roles...");
            seedRoles();
        }

        seedUsers();
        seedBrands();
        seedCategories();

        long productCount = productRepository.count();
        if (productCount == 0) {
            log.info("[DataInitializer] Database is empty. Seeding initial 37 products, variants, and reviews...");
            seedProducts();
            log.info("[DataInitializer] Seeding completed successfully. Total products: {}", productRepository.count());
        } else {
            log.info("[DataInitializer] Database already initialized with {} products. Skipping product seeding to ensure immediate port binding.", productCount);
        }
    }

    private void seedRoles() {
        roleRepository.save(new Role("ROLE_USER"));
        roleRepository.save(new Role("ROLE_ADMIN"));
    }

    private void seedUsers() {
        boolean adminExists = userRepository.findByEmail("admin@sneakx.in").isPresent() ||
                userRepository.findByEmail("admin@sneakx.com").isPresent();
        boolean customerExists = userRepository.findByEmail("rohan.sharma@sneakx.in").isPresent() ||
                userRepository.findByEmail("customer@sneakx.com").isPresent();

        if (adminExists && customerExists) {
            userRepository.findByEmail("admin@sneakx.in").ifPresent(existingAdmin -> {
                boolean updated = false;
                if ("Alex".equalsIgnoreCase(existingAdmin.getFirstName())) {
                    existingAdmin.setFirstName("Om");
                    existingAdmin.setLastName("Rindhe");
                    existingAdmin.setPhone("+91 98765 43210");
                    updated = true;
                    log.info("[DataInitializer] Migrated legacy admin account details.");
                }
                if (updated) {
                    userRepository.save(existingAdmin);
                }
            });
            log.debug("[DataInitializer] Seed users already exist. Skipping user seeding.");
            return;
        }

        Role userRole = roleRepository.findByName("ROLE_USER").orElseThrow();
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseThrow();

        // 1. Production Admin Account
        User admin = userRepository.findByEmail("admin@sneakx.in")
                .orElseGet(() -> userRepository.findByEmail("admin@sneakx.com")
                        .orElse(new User("Admin", "User", "admin@sneakx.in", "", "+91 98765 43210")));
        admin.setFirstName("Om");
        admin.setLastName("Rindhe");
        admin.setEmail("admin@sneakx.in");
        admin.setPasswordHash(passwordEncoder.encode(adminInitialPassword));
        admin.setPhone("+91 98765 43210");
        admin.setRoles(new HashSet<>(Arrays.asList(userRole, adminRole)));
        userRepository.save(admin);

        // 2. Realistic Sample Customer Account
        User customer = userRepository.findByEmail("rohan.sharma@sneakx.in")
                .orElseGet(() -> userRepository.findByEmail("customer@sneakx.com")
                        .orElse(new User("Rohan", "Sharma", "rohan.sharma@sneakx.in", "", "+91 9123456780")));
        customer.setFirstName("Rohan");
        customer.setLastName("Sharma");
        customer.setEmail("rohan.sharma@sneakx.in");
        customer.setPasswordHash(passwordEncoder.encode(demoCustomerPassword));
        customer.setPhone("+91 9123456780");
        customer.setRoles(new HashSet<>(Collections.singletonList(userRole)));
        User savedCustomer = userRepository.save(customer);

        // Default Address for Customer
        if (addressRepository.findByUserId(savedCustomer.getId()).isEmpty()) {
            Address address = new Address();
            address.setUser(savedCustomer);
            address.setFullName("Rohan Sharma");
            address.setPhone("+91 9123456780");
            address.setStreetAddress("402 Skyline Heights, MG Road");
            address.setCity("Bengaluru");
            address.setState("Karnataka");
            address.setPostalCode("560001");
            address.setCountry("India");
            address.setIsDefault(true);
            addressRepository.save(address);
        }
    }

    private void seedBrands() {
        if (brandRepository.count() >= 7) {
            log.debug("[DataInitializer] Brands already exist. Skipping brand seeding.");
            return;
        }
        saveBrandIfMissing("Nike", "nike", "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg");
        saveBrandIfMissing("Jordan", "jordan", "https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg");
        saveBrandIfMissing("Adidas", "adidas", "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg");
        saveBrandIfMissing("Yeezy", "yeezy", "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg");
        saveBrandIfMissing("New Balance", "new-balance", "https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg");
        saveBrandIfMissing("Converse", "converse", "https://upload.wikimedia.org/wikipedia/commons/3/30/Converse_logo.svg");
        saveBrandIfMissing("Puma", "puma", "https://upload.wikimedia.org/wikipedia/en/3/37/Puma_AG.svg");
    }

    private void saveBrandIfMissing(String name, String slug, String logoUrl) {
        if (brandRepository.findBySlug(slug).isEmpty()) {
            brandRepository.save(new Brand(name, slug, logoUrl));
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() >= 4) {
            log.debug("[DataInitializer] Categories already exist. Skipping category seeding.");
            return;
        }
        saveCategoryIfMissing("Basketball", "basketball", "High-performance hardwood silhouettes and retro court icons");
        saveCategoryIfMissing("Lifestyle", "lifestyle", "Iconic streetwear staples, everyday comfort, and hype grails");
        saveCategoryIfMissing("Running", "running", "Responsive cushioning, breathable mesh uppers, and road warriors");
        saveCategoryIfMissing("Skateboarding", "skateboarding", "Durable vulcanized soles, reinforced toe-caps, and board feel");
    }

    private void saveCategoryIfMissing(String name, String slug, String description) {
        if (categoryRepository.findBySlug(slug).isEmpty()) {
            categoryRepository.save(new Category(name, slug, description));
        }
    }

    private void seedProducts() {
        Brand jordan = brandRepository.findBySlug("jordan").orElseThrow();
        Brand nike = brandRepository.findBySlug("nike").orElseThrow();
        Brand adidas = brandRepository.findBySlug("adidas").orElseThrow();
        Brand yeezy = brandRepository.findBySlug("yeezy").orElseThrow();
        Brand newBalance = brandRepository.findBySlug("new-balance").orElseThrow();
        Brand converse = brandRepository.findBySlug("converse").orElseThrow();
        Brand puma = brandRepository.findBySlug("puma").orElseThrow();

        Category basketball = categoryRepository.findBySlug("basketball").orElseThrow();
        Category lifestyle = categoryRepository.findBySlug("lifestyle").orElseThrow();
        Category running = categoryRepository.findBySlug("running").orElseThrow();
        Category skateboarding = categoryRepository.findBySlug("skateboarding").orElseThrow();

        User demoUser = userRepository.findByEmail("rohan.sharma@sneakx.in")
                .orElseGet(() -> userRepository.findByEmail("customer@sneakx.com").orElse(null));

        // Standard size runs
        List<Double> fullRun = Arrays.asList(7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0);
        List<Double> standardRun = Arrays.asList(7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0);
        List<Double> womenRun = Arrays.asList(5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0);

        // ==========================================
        // 1. JORDAN (7 Silhouettes)
        // ==========================================
        createSneaker(
                jordan, basketball,
                "Air Jordan 1 Retro High OG Chicago",
                "air-jordan-1-retro-high-og-chicago",
                "The silhouette that sparked global sneaker counter-culture. Featuring original 1985 Chicago high-cut collar specifications, premium full-grain Varsity Red leather, and signature encapsulated Nike Air cushioning.",
                new BigDecimal("16999.00"), "Varsity Red / White / Black", "Men", true,
                Arrays.asList("/images/products/air-jordan-1-retro-high-og-chicago.jpg"),
                standardRun, demoUser, "Unbelievable silhouette and materials",
                "The leather quality is top-tier. Fits true to size and looks incredible with raw denim."
        );

        createSneaker(
                jordan, basketball,
                "Air Jordan 4 Retro Military Black",
                "air-jordan-4-retro-military-black",
                "Adopting the legendary 1989 Tinker Hatfield color-blocking with smooth white leather uppers, light neutral grey suede toe-caps, and contrasting black TPU molded wings and heel pull tab.",
                new BigDecimal("21499.00"), "White / Black / Neutral Grey", "Men", true,
                Arrays.asList("/images/products/air-jordan-4-retro-military-black.jpg"),
                fullRun, demoUser, "Grail status silhouette",
                "The AJ4 shape is legendary. Fits snug, sturdy leather build, looks pristine."
        );

        createSneaker(
                jordan, basketball,
                "Air Jordan 3 Retro White Cement Reimagined",
                "air-jordan-3-retro-white-cement",
                "Engineered to 1988 original specs with pre-yellowed vintage midsoles, iconic elephant print mudguards, and authentic Nike Air heel branding.",
                new BigDecimal("19295.00"), "Summit White / Fire Red / Cement Grey", "Men", false,
                Arrays.asList("/images/products/air-jordan-3-retro-white-cement.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                jordan, basketball,
                "Air Jordan 11 Retro Gratitude",
                "air-jordan-11-retro-gratitude",
                "A luxurious tribute to Jordan heritage featuring ultra-glossy black patent leather mudguards, soft premium tumble leather upper, and metallic gold Jumpman accents.",
                new BigDecimal("20295.00"), "White / Metallic Gold / Black", "Unisex", true,
                Arrays.asList("/images/products/air-jordan-11-retro-gratitude.jpg"),
                fullRun, null, null, null
        );

        createSneaker(
                jordan, lifestyle,
                "Travis Scott x Air Jordan 1 Low Reverse Mocha",
                "travis-scott-air-jordan-1-low-reverse-mocha",
                "The defining collaborative grail. Reverse oversized leather Swoosh, supple mocha nubuck base, aged sail midsoles, and Cactus Jack embroidery.",
                new BigDecimal("89999.00"), "Sail / Ridgerock / University Red", "Men", true,
                Arrays.asList("/images/products/travis-scott-air-jordan-1-low-reverse-mocha.jpg"),
                standardRun, demoUser, "The holy grail of sneaker collecting",
                "Unreal in person. The materials are unlike any standard Jordan release."
        );

        createSneaker(
                jordan, basketball,
                "Air Jordan 4 Retro Bred Reimagined",
                "air-jordan-4-retro-bred-reimagined",
                "A bold elevation of the 1989 'Black Cement' grail, replacing traditional nubuck with water-resistant supple black leather and original Nike Air heel stamps.",
                new BigDecimal("21499.00"), "Black / Fire Red / Cement Grey", "Men", false,
                Arrays.asList("/images/products/air-jordan-4-retro-bred-reimagined.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                jordan, basketball,
                "Air Jordan 1 High OG Lost and Found",
                "air-jordan-1-high-lost-and-found",
                "Paying homage to mom-and-pop sneaker shops of the 1980s with cracked leather collars, aged Muslin outsoles, and vintage box detailing.",
                new BigDecimal("18499.00"), "Varsity Red / Black / Sail / Muslin", "Unisex", true,
                Arrays.asList("/images/products/air-jordan-1-high-lost-and-found.jpg"),
                fullRun, null, null, null
        );

        // ==========================================
        // 2. NIKE (8 Silhouettes)
        // ==========================================
        createSneaker(
                nike, lifestyle,
                "Nike Dunk Low Retro Panda",
                "nike-dunk-low-retro-panda",
                "The undisputed streetwear classic. Clean monochrome two-tone leather overlays, padded low-cut collar, and timeless basketball DNA.",
                new BigDecimal("9999.00"), "Black / White", "Unisex", true,
                Arrays.asList("/images/products/nike-dunk-low-retro-panda.jpg"),
                fullRun, demoUser, "Essential daily driver",
                "Goes with literally any outfit. Fits true to size and surprisingly comfortable for daily commute."
        );

        createSneaker(
                nike, lifestyle,
                "Nike Air Force 1 07 Triple White",
                "nike-air-force-1-07-triple-white",
                "The radiant icon of hip-hop and streetwear culture since 1982. Pristine crisp leather overlays, encapsulated full-length Air unit, and silver dubrae lace deubré.",
                new BigDecimal("8499.00"), "White / White / White", "Unisex", false,
                Arrays.asList("/images/products/nike-air-force-1-07-triple-white.jpg"),
                fullRun, null, null, null
        );

        createSneaker(
                nike, running,
                "Nike Air Max 90 Infrared",
                "nike-air-max-90-infrared",
                "Tinker Hatfield's running masterpiece featuring visible Air window cassette, ribbed thermoplastic accents, and blazing Infrared color accents.",
                new BigDecimal("12995.00"), "White / Cement Grey / Infrared / Black", "Men", true,
                Arrays.asList("/images/products/nike-air-max-90-infrared.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                nike, skateboarding,
                "Nike SB Dunk Low Pro Chicago",
                "nike-sb-dunk-low-pro-chicago",
                "Engineered for heavy board sessions with Zoom Air heel pods, padded fat tongue, and iconic Chicago Bulls team colorway.",
                new BigDecimal("11995.00"), "Varsity Red / White / Black", "Unisex", true,
                Arrays.asList("/images/products/nike-sb-dunk-low-pro-chicago.jpg"),
                fullRun, null, null, null
        );

        createSneaker(
                nike, running,
                "Nike Zoom Vomero 5 Photon Dust",
                "nike-zoom-vomero-5-photon-dust",
                "The pinnacle of Y2K tech runner aesthetics with breathable TecTuff mesh, plastic cage ventilation, and dual Zoom Air cushioning units.",
                new BigDecimal("14995.00"), "Photon Dust / Metallic Silver / University Blue", "Unisex", true,
                Arrays.asList("/images/products/nike-zoom-vomero-5-photon-dust.jpg"),
                fullRun, null, null, null
        );

        createSneaker(
                nike, basketball,
                "Nike Ja 1 Day One",
                "nike-ja-1-day-one",
                "Ja Morant's explosive debut signature model featuring forefoot Zoom Air responsiveness and dynamic lockdown sidewall wraps for rim-running guards.",
                new BigDecimal("10295.00"), "Cobalt Bliss / Citron Tint", "Men", false,
                Arrays.asList("/images/products/nike-ja-1-day-one.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                nike, lifestyle,
                "Nike Air Max 1 86 Original Big Bubble",
                "nike-air-max-1-86-big-bubble",
                "Recreating the elusive 1986 original prototype with a significantly larger Air bubble window and classic grey-and-red micro-suede panelling.",
                new BigDecimal("13995.00"), "White / University Red / Neutral Grey", "Unisex", false,
                Arrays.asList("/images/products/nike-air-max-1-86-big-bubble.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                nike, running,
                "Nike Air Zoom Pegasus 40",
                "nike-air-zoom-pegasus-40",
                "The workhorse with wings. Engineered mesh upper, dual Zoom Air units at forefoot and heel, and Nike React foam for reliable daily training mileage.",
                new BigDecimal("11895.00"), "White / Glacier Blue / Total Orange", "Women", false,
                Arrays.asList("/images/products/nike-air-zoom-pegasus-40.jpg"),
                womenRun, null, null, null
        );

        // ==========================================
        // 3. ADIDAS (6 Silhouettes)
        // ==========================================
        createSneaker(
                adidas, lifestyle,
                "Adidas Samba Classic Cloud White",
                "adidas-samba-classic-white",
                "Born on indoor soccer pitches and now the epicenter of global casual style. Smooth leather upper, suede T-toe bumper, and heritage gum rubber outsole.",
                new BigDecimal("9999.00"), "Cloud White / Core Black / Gum", "Unisex", true,
                Arrays.asList("/images/products/adidas-samba-classic-white.jpg"),
                fullRun, null, null, null
        );

        createSneaker(
                adidas, lifestyle,
                "Adidas Gazelle Indoor Blue Fusion",
                "adidas-gazelle-indoor-blue",
                "1970s terrace culture icon wrapped in rich plush suede, translucent gum tooling, and contrasting crisp white leather serrated 3-Stripes.",
                new BigDecimal("10999.00"), "Blue Fusion / Footwear White / Gum", "Unisex", false,
                Arrays.asList("/images/products/adidas-gazelle-indoor-blue.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                adidas, running,
                "Adidas Ultraboost Light Core Black",
                "adidas-ultraboost-light-core-black",
                "The lightest Ultraboost ever made. Light BOOST molecule cushioning, Primeknit+ forged textile upper, and Linear Energy Push propulsion system.",
                new BigDecimal("14999.00"), "Core Black / Grey Five / Solar Red", "Men", false,
                Arrays.asList("/images/products/adidas-ultraboost-light-core-black.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                adidas, lifestyle,
                "Adidas Superstar OG White Black",
                "adidas-superstar-og",
                "The quintessential shell-toe sneaker. Five decades of hip-hop and basketball legacy built in tough smooth leather with serrated side stripes.",
                new BigDecimal("8999.00"), "Cloud White / Core Black", "Unisex", false,
                Arrays.asList("/images/products/adidas-superstar-og.jpg"),
                fullRun, null, null, null
        );

        createSneaker(
                adidas, basketball,
                "Adidas Forum Low Royal Blue",
                "adidas-forum-low-royal",
                "1984 hardwood titan boasting criss-cross ankle strap design, layered leather panels, and retro royal blue color accents.",
                new BigDecimal("9999.00"), "Cloud White / Royal Blue / Cream White", "Men", false,
                Arrays.asList("/images/products/adidas-forum-low-royal.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                adidas, skateboarding,
                "Adidas Campus 00s Core Black",
                "adidas-campus-00s-black",
                "Chunky Y2K skate proportions with exaggerated padded collar, fat skate laces, and durable premium suede quarter panels.",
                new BigDecimal("10999.00"), "Core Black / Cloud White / Off White", "Unisex", true,
                Arrays.asList("/images/products/adidas-campus-00s-black.jpg"),
                fullRun, null, null, null
        );

        // ==========================================
        // 4. YEEZY (5 Silhouettes)
        // ==========================================
        createSneaker(
                yeezy, lifestyle,
                "Yeezy Boost 350 V2 Zebra",
                "yeezy-boost-350-v2-zebra",
                "Revolutionary engineered Primeknit upper with zebra striping, red SPLY-350 reverse typography, and full-length encapsulated BOOST midsole.",
                new BigDecimal("22999.00"), "White / Core Black / Red", "Unisex", true,
                Arrays.asList("/images/products/yeezy-boost-350-v2-zebra.jpg"),
                standardRun, demoUser, "Cloud-like comfort, make sure to size up!",
                "Extremely comfortable shoe. As recommended by the size advisor, I went half a size up and it fits like a glove."
        );

        createSneaker(
                yeezy, lifestyle,
                "Yeezy Boost 700 Wave Runner",
                "yeezy-boost-700-wave-runner",
                "The undisputed king of dad-shoe silhouette luxury. Layered grey and teal suede overlays, 3M reflective accents, sculpted chunky midsole, and full BOOST cushioning.",
                new BigDecimal("27999.00"), "Solid Grey / Chalk White / Core Black", "Unisex", true,
                Arrays.asList("/images/products/yeezy-boost-700-wave-runner.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                yeezy, lifestyle,
                "Yeezy Slide Onyx",
                "yeezy-slide-onyx",
                "Minimalist one-piece injected EVA foam construction offering lightweight durability and serrated strategic tread grooves for optimal grip.",
                new BigDecimal("7999.00"), "Onyx / Onyx / Onyx", "Unisex", false,
                Arrays.asList("/images/products/yeezy-slide-onyx.jpg"),
                Arrays.asList(7.0, 8.0, 9.0, 10.0, 11.0, 12.0), null, null, null
        );

        createSneaker(
                yeezy, lifestyle,
                "Yeezy Foam Runner Onyx",
                "yeezy-foam-runner-onyx",
                "Futuristic biomimetic sculpture crafted from harvested algae and EVA foam. Dynamic flowing cut-out ventilation ports for maximum airflow.",
                new BigDecimal("9999.00"), "Onyx / Dark Charcoal", "Unisex", false,
                Arrays.asList("/images/products/yeezy-foam-runner-onyx.jpg"),
                Arrays.asList(7.0, 8.0, 9.0, 10.0, 11.0, 12.0), null, null, null
        );

        createSneaker(
                yeezy, lifestyle,
                "Yeezy Boost 350 V2 Bone",
                "yeezy-boost-350-v2-bone",
                "Pristine triple-cream Primeknit design with monofilament translucent side stripe, matching heel pull tab, and ribbed milky TPU midsole casing.",
                new BigDecimal("22999.00"), "Bone / Bone / Bone", "Unisex", false,
                Arrays.asList("/images/products/yeezy-boost-350-v2-bone.jpg"),
                standardRun, null, null, null
        );

        // ==========================================
        // 5. NEW BALANCE (5 Silhouettes)
        // ==========================================
        createSneaker(
                newBalance, lifestyle,
                "New Balance 550 White Green",
                "new-balance-550-white-green",
                "Archival 1989 basketball court tribute. Heavy full-grain leather, perforated side panels, forest green accents, and vintage off-white midsole.",
                new BigDecimal("11499.00"), "Sea Salt / Team Forest Green", "Unisex", true,
                Arrays.asList("/images/products/new-balance-550-white-green.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                newBalance, running,
                "New Balance 990v6 Made in USA Grey",
                "new-balance-990v6-grey",
                "The pinnacle of American footwear craftsmanship. FuelCell foam midsole cushioning, ENCAP rim support, and pigskin suede overlays.",
                new BigDecimal("22999.00"), "Castlerock Grey / Marblehead", "Men", true,
                Arrays.asList("/images/products/new-balance-990v6-grey.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                newBalance, lifestyle,
                "New Balance 2002R Protection Pack Rain Cloud",
                "new-balance-2002r-rain-cloud",
                "Refined distressed aesthetic with deconstructed jagged raw suede overlays, ABZORB shock absorption, and N-ergy stability outsoles.",
                new BigDecimal("14999.00"), "Rain Cloud / Magnet Grey", "Unisex", true,
                Arrays.asList("/images/products/new-balance-2002r-rain-cloud.jpg"),
                fullRun, null, null, null
        );

        createSneaker(
                newBalance, running,
                "New Balance 1906R Silver Metallic",
                "new-balance-1906r-silver",
                "High-tech 2000s runner with N-lock lacing ribbon system, open mesh respiratory upper, and supportive heel TPU stability counter.",
                new BigDecimal("13999.00"), "Silver Metallic / Blue / Castlerock", "Unisex", false,
                Arrays.asList("/images/products/new-balance-1906r-silver.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                newBalance, lifestyle,
                "New Balance 9060 Sea Salt Concrete",
                "new-balance-9060-sea-salt",
                "Futuristic exaggerated wave proportions blending 99X heritage with millennium tech. Sculpted dual-density ABZORB SBS pod cushioning.",
                new BigDecimal("15499.00"), "Sea Salt / Concrete / Silver", "Women", false,
                Arrays.asList("/images/products/new-balance-9060-sea-salt.jpg"),
                womenRun, null, null, null
        );

        // ==========================================
        // 6. CONVERSE (3 Silhouettes)
        // ==========================================
        createSneaker(
                converse, lifestyle,
                "Converse Chuck 70 High Top Black White",
                "converse-chuck-70-high-black",
                "Premium vintage remake of the world's most iconic sneaker. 12oz heavy organic canvas, archival winged tongue stitching, and glossy egret foxing tape.",
                new BigDecimal("6499.00"), "Black / Egret / White", "Unisex", true,
                Arrays.asList("/images/products/converse-chuck-70-high-black.jpg"),
                fullRun, null, null, null
        );

        createSneaker(
                converse, lifestyle,
                "Converse Chuck Taylor All Star Low Optical White",
                "converse-chuck-taylor-all-star-low",
                "The timeless low-top canvas staple with dual medial eyelets, red and navy midsole pinstriping, and vulcanized rubber diamond tread.",
                new BigDecimal("4999.00"), "Optical White", "Unisex", false,
                Arrays.asList("/images/products/converse-chuck-taylor-all-star-low.jpg"),
                fullRun, null, null, null
        );

        createSneaker(
                converse, lifestyle,
                "Converse Run Star Hike Platform",
                "converse-run-star-hike-platform",
                "Chunky platform twist on the classic Chuck with two-tone exaggerated sawtooth jagged traction lug sole and rounded heel star patch.",
                new BigDecimal("7999.00"), "Black / White / Gum", "Women", false,
                Arrays.asList("/images/products/converse-run-star-hike-platform.jpg"),
                womenRun, null, null, null
        );

        // ==========================================
        // 7. PUMA (3 Silhouettes)
        // ==========================================
        createSneaker(
                puma, lifestyle,
                "Puma Suede Classic XXI Black White",
                "puma-suede-classic-xxi",
                "Since 1968, the foundation of breakdancing and streetwear culture. Rich velvety suede upper, clean white Puma Formstrip, and heritage gold foil branding.",
                new BigDecimal("6999.00"), "Puma Black / Puma White", "Unisex", true,
                Arrays.asList("/images/products/puma-suede-classic-xxi.jpg"),
                fullRun, null, null, null
        );

        createSneaker(
                puma, lifestyle,
                "Puma Palermo Vapour Grey Gum",
                "puma-palermo-vapour-grey",
                "The European football terrace icon with vintage T-toe construction, soft suede overlays, classic signature lateral Palermo tag, and retro gum cupsole.",
                new BigDecimal("7499.00"), "Vapour Grey / Gum", "Unisex", false,
                Arrays.asList("/images/products/puma-palermo-vapour-grey.jpg"),
                standardRun, null, null, null
        );

        createSneaker(
                puma, basketball,
                "Puma MB.03 LaMelo Ball Toxic",
                "puma-mb-03-toxic",
                "LaMelo Ball's extraterrestrial performance shoe featuring NITRO infused foam responsive cushioning, slime claw scratch upper cuts, and rare iridescent accents.",
                new BigDecimal("12999.00"), "Purple Glimmer / Green Gecko", "Men", true,
                Arrays.asList("/images/products/puma-mb-03-toxic.jpg"),
                standardRun, null, null, null
        );
    }

    private void createSneaker(Brand brand, Category category, String name, String slug, String description,
                              BigDecimal price, String colorway, String gender, boolean isFeatured,
                              List<String> imageUrls, List<Double> sizes,
                              User reviewer, String reviewTitle, String reviewComment) {
        Optional<Product> existingOpt = productRepository.findBySlug(slug);
        if (existingOpt.isPresent()) {
            Product existing = existingOpt.get();
            List<ProductImage> existingImages = imageRepository.findByProductIdOrderByDisplayOrderAsc(existing.getId());
            if (!existingImages.isEmpty() && !imageUrls.isEmpty()) {
                for (int i = 0; i < existingImages.size(); i++) {
                    ProductImage img = existingImages.get(i);
                    img.setImageUrl(imageUrls.get(0));
                    img.setIsPrimary(i == 0);
                    imageRepository.save(img);
                }
            } else if (existingImages.isEmpty() && !imageUrls.isEmpty()) {
                for (int i = 0; i < imageUrls.size(); i++) {
                    ProductImage img = new ProductImage(existing, imageUrls.get(i), i == 0, i);
                    imageRepository.save(img);
                }
            }
            return;
        }

        Product p = new Product();
        p.setBrand(brand);
        p.setCategory(category);
        p.setName(name);
        p.setSlug(slug);
        p.setDescription(description);
        p.setBasePrice(price);
        p.setColorway(colorway);
        p.setGender(gender);
        p.setIsFeatured(isFeatured);
        p.setIsActive(true);

        Product savedProduct = productRepository.save(p);

        // Variants
        List<ProductVariant> variants = new ArrayList<>();
        int stockIndex = 0;
        for (Double size : sizes) {
            // Give some sizes low stock (e.g. 2 or 3) to test low-stock badging!
            int stock = (stockIndex % 3 == 0) ? 2 : (stockIndex % 2 == 0 ? 8 : 15);
            stockIndex++;

            ProductVariant v = new ProductVariant(
                    savedProduct,
                    BigDecimal.valueOf(size),
                    "SKU-" + savedProduct.getId() + "-" + size,
                    stock,
                    BigDecimal.ZERO
            );
            variants.add(variantRepository.save(v));
        }
        savedProduct.setVariants(variants);

        // Images
        List<ProductImage> images = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            ProductImage img = new ProductImage(savedProduct, imageUrls.get(i), i == 0, i);
            images.add(imageRepository.save(img));
        }
        savedProduct.setImages(images);

        // Sample Review
        if (reviewer != null && reviewTitle != null) {
            Review r = new Review(reviewer, savedProduct, 5, reviewTitle, reviewComment, true);
            reviewRepository.save(r);
        }
    }
}
