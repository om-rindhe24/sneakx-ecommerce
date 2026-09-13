package com.sneakx.service;

import com.sneakx.entity.Address;
import com.sneakx.entity.Order;
import com.sneakx.entity.OrderItem;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender autowiredMailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.mail.from:orders@sneakx.com}")
    private String mailFrom;

    @Value("${app.mail.from-name:SneakX Orders}")
    private String mailFromName;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // Concurrency protection: prevent duplicate confirmation emails for the same order
    private final Set<String> processedOrderDispatches = ConcurrentHashMap.newKeySet();

    public EmailService(@Autowired(required = false) JavaMailSender autowiredMailSender) {
        this.autowiredMailSender = autowiredMailSender;
    }

    /**
     * Sends an order confirmation email to the authenticated customer's actual registered email address.
     * Guaranteed to execute only after the order transaction is successfully committed.
     * If SMTP is not configured, logs a formatted receipt to the console as a safe development fallback.
     * If SMTP delivery fails, logs safely without rolling back the customer's completed order.
     *
     * @param order the committed order entity
     * @return true if notification was dispatched (real SMTP or safe fallback), false on error
     */
    public boolean sendOrderConfirmation(Order order) {
        if (order == null || order.getUser() == null) {
            log.warn("[EMAIL-SERVICE] Cannot dispatch confirmation: Order or User entity is null");
            return false;
        }

        String orderNumber = order.getOrderNumber();

        // 1. Duplicate email protection
        if (Boolean.TRUE.equals(order.getConfirmationEmailSent()) || !processedOrderDispatches.add(orderNumber)) {
            log.info("[EMAIL-SERVICE] Duplicate confirmation email dispatch prevented for order #{}", orderNumber);
            return true;
        }

        // 2. Real customer email address extraction
        String recipientEmail = order.getUser().getEmail();
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            log.warn("[EMAIL-SERVICE] Customer email is missing for order #{}", orderNumber);
            return false;
        }
        recipientEmail = recipientEmail.trim();

        String customerName = getCustomerDisplayName(order);
        String subject = "Order Confirmed #" + orderNumber + " | SneakX";
        String htmlContent = buildOrderEmailHtml(order, customerName);

        JavaMailSender sender = getEffectiveMailSender();

        // Safe console fallback for development when SMTP credentials are not supplied
        if (sender == null) {
            log.warn("[EMAIL-SERVICE] SMTP NOT CONFIGURED: Set MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD in environment to enable real inbox delivery.");
            logDevFallbackReceipt(order, recipientEmail, customerName, subject);
            order.setConfirmationEmailSent(false);
            return true;
        }

        // Real SMTP delivery
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            String fromAddress = resolveFromAddress();
            String fromDisplayName = mailFromName != null && !mailFromName.trim().isEmpty() ? mailFromName.trim() : "SneakX Orders";
            helper.setFrom(new InternetAddress(fromAddress, fromDisplayName));
            helper.setTo(recipientEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            sender.send(message);
            order.setConfirmationEmailSent(true);
            log.info("[EMAIL-SERVICE] Real order confirmation email successfully delivered to {} for order #{}",
                    recipientEmail, orderNumber);
            return true;
        } catch (Exception ex) {
            // NEVER let SMTP failure break or roll back the successful order
            log.error("[EMAIL-SERVICE] Failed to deliver real SMTP email to {} for order #{}: {}",
                    recipientEmail, orderNumber, sanitizeErrorMessage(ex.getMessage()));
            logDevFallbackReceipt(order, recipientEmail, customerName, subject);
            order.setConfirmationEmailSent(false);
            return false;
        }
    }

    private JavaMailSender getEffectiveMailSender() {
        if (autowiredMailSender != null && mailHost != null && !mailHost.trim().isEmpty()) {
            return autowiredMailSender;
        }

        if (mailHost != null && !mailHost.trim().isEmpty()) {
            JavaMailSenderImpl impl = new JavaMailSenderImpl();
            impl.setHost(mailHost.trim());
            impl.setPort(mailPort > 0 ? mailPort : 587);
            if (mailUsername != null && !mailUsername.trim().isEmpty()) {
                impl.setUsername(mailUsername.trim());
            }
            String password = resolvePassword();
            if (!password.isEmpty()) {
                impl.setPassword(password);
            }
            impl.setDefaultEncoding("UTF-8");

            Properties props = impl.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", !password.isEmpty() ? "true" : "false");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.connectiontimeout", "10000");
            props.put("mail.smtp.timeout", "10000");
            props.put("mail.smtp.writetimeout", "10000");
            return impl;
        }

        return null;
    }

    private String resolveFromAddress() {
        if (mailFrom != null && mailFrom.contains("@")) {
            return mailFrom.trim();
        }
        if (mailUsername != null && mailUsername.contains("@")) {
            return mailUsername.trim();
        }
        return "orders@sneakx.com";
    }

    private String resolvePassword() {
        if (mailPassword != null && !mailPassword.trim().isEmpty()) {
            return mailPassword.trim();
        }
        if (mailFrom != null && !mailFrom.contains("@") && mailFrom.trim().length() >= 14) {
            return mailFrom.trim();
        }
        return "";
    }

    private String getCustomerDisplayName(Order order) {
        if (order.getUser() == null) return "Sneakerhead";
        String first = order.getUser().getFirstName();
        String last = order.getUser().getLastName();
        if (first != null && !first.trim().isEmpty()) {
            return last != null && !last.trim().isEmpty() ? first.trim() + " " + last.trim() : first.trim();
        }
        return "Sneakerhead";
    }

    private String formatInr(BigDecimal amount) {
        if (amount == null) return "0.00";
        NumberFormat nf = NumberFormat.getNumberInstance(new Locale("en", "IN"));
        nf.setMinimumFractionDigits(2);
        nf.setMaximumFractionDigits(2);
        return nf.format(amount);
    }

    private String sanitizeErrorMessage(String msg) {
        if (msg == null) return "Unknown email provider error";
        // Scrub any potential passwords or credentials from error logs
        if (mailPassword != null && !mailPassword.trim().isEmpty()) {
            msg = msg.replace(mailPassword, "******");
        }
        return msg;
    }

    private void logDevFallbackReceipt(Order order, String recipientEmail, String customerName, String subject) {
        StringBuilder itemsSummary = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                String brand = resolveItemBrand(item);
                itemsSummary.append(String.format("   • [%s] %s | Size: UK %s | Qty: %d | Unit: ₹%s | Total: ₹%s\n",
                        brand,
                        item.getProductName(),
                        item.getSize(),
                        item.getQuantity(),
                        formatInr(item.getPrice()),
                        formatInr(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))));
            }
        }

        Address addr = order.getAddress();
        String addressStr = addr != null
                ? String.format("%s, %s, %s, %s - %s (%s)",
                addr.getStreetAddress(), addr.getCity(), addr.getState(), addr.getCountry(), addr.getPostalCode(), addr.getPhone())
                : "Address on file";

        String paymentMethodDisplay = resolvePaymentMethodDisplay(order.getPaymentMethod());
        String paymentStatusDisplay = resolvePaymentStatusDisplay(order.getPaymentMethod(), order.getPaymentStatus());

        String logOutput = "\n" +
                "========================================================================================\n" +
                " [SNEAKX EMAIL SERVICE] ORDER CONFIRMATION DISPATCHED (DEVELOPMENT FALLBACK LOG)\n" +
                "========================================================================================\n" +
                " To:          " + recipientEmail + " (" + customerName + ")\n" +
                " From:        " + (mailFrom != null ? mailFrom : "orders@sneakx.com") + "\n" +
                " Subject:     " + subject + "\n" +
                " Order ID:    #" + order.getOrderNumber() + "\n" +
                " Status:      " + order.getStatus() + "\n" +
                " Payment:     " + paymentMethodDisplay + " | Status: " + paymentStatusDisplay + "\n" +
                " Total Billed: ₹" + formatInr(order.getTotalAmount()) + "\n" +
                " Shipping To: " + addressStr + "\n" +
                " Items Ordered:\n" + itemsSummary.toString() +
                " CTA Action:  " + frontendUrl + "/orders\n" +
                " Note:        To send real emails via SMTP, set MAIL_HOST, MAIL_PORT, MAIL_USERNAME,\n" +
                "              MAIL_PASSWORD in your environment.\n" +
                "========================================================================================\n";

        log.info(logOutput);
    }

    private String resolveItemBrand(OrderItem item) {
        if (item.getBrand() != null && !item.getBrand().trim().isEmpty()) {
            return item.getBrand().trim();
        }
        if (item.getVariant() != null && item.getVariant().getProduct() != null
                && item.getVariant().getProduct().getBrand() != null) {
            return item.getVariant().getProduct().getBrand().getName();
        }
        return "SNEAKX";
    }

    private String resolvePaymentMethodDisplay(String rawMethod) {
        if (rawMethod == null) return "Credit/Debit Card";
        String upper = rawMethod.toUpperCase();
        if (upper.contains("CARD")) {
            return "Credit/Debit Card";
        } else if (upper.contains("UPI")) {
            return "UPI";
        } else if (upper.contains("COD")) {
            return "Cash on Delivery";
        }
        return rawMethod;
    }

    private String resolvePaymentStatusDisplay(String rawMethod, String rawStatus) {
        if (rawMethod != null && rawMethod.toUpperCase().contains("COD")) {
            return "CASH ON DELIVERY";
        }
        return "PAID";
    }

    private String buildOrderEmailHtml(Order order, String customerName) {
        BigDecimal subtotal = BigDecimal.ZERO;
        StringBuilder itemsRows = new StringBuilder();

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                BigDecimal lineTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                subtotal = subtotal.add(lineTotal);

                String brand = resolveItemBrand(item);
                String imageUrl = item.getImageUrl();

                // Safe image inclusion: ONLY include if URL is present and secure http/https.
                // Never use wrong brand fallback or placeholders.
                String imageCell = "";
                if (imageUrl != null && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
                    imageCell = "<td style='width: 64px; vertical-align: top; padding: 12px 10px 12px 0; border-bottom: 1px solid #23262B;'>" +
                            "<img src='" + escapeHtml(imageUrl) + "' alt='" + escapeHtml(item.getProductName()) + "' " +
                            "width='56' height='56' style='width: 56px; height: 56px; border-radius: 6px; object-fit: cover; display: block; border: 1px solid #27272A; background-color: #18181B;' />" +
                            "</td>";
                }

                itemsRows.append("<tr>")
                        .append(imageCell)
                        .append("<td style='padding: 12px 8px; border-bottom: 1px solid #23262B; vertical-align: top;'>")
                        .append("<div style='font-size: 11px; font-weight: 700; color: #E6FF00; text-transform: uppercase; letter-spacing: 0.05em;'>").append(escapeHtml(brand)).append("</div>")
                        .append("<div style='font-size: 14px; font-weight: 700; color: #FFFFFF; margin-top: 2px;'>").append(escapeHtml(item.getProductName())).append("</div>")
                        .append("<div style='font-size: 12px; color: #71717A; margin-top: 2px;'>Size: <span style='color: #D4D4D8; font-family: monospace;'>UK ").append(item.getSize()).append("</span></div>")
                        .append("</td>")
                        .append("<td style='padding: 12px 8px; border-bottom: 1px solid #23262B; text-align: center; vertical-align: top; color: #A1A1AA; font-size: 13px;'>")
                        .append(item.getQuantity())
                        .append("</td>")
                        .append("<td style='padding: 12px 8px; border-bottom: 1px solid #23262B; text-align: right; vertical-align: top; color: #A1A1AA; font-size: 13px; font-family: monospace;'>₹")
                        .append(formatInr(item.getPrice()))
                        .append("</td>")
                        .append("<td style='padding: 12px 0 12px 8px; border-bottom: 1px solid #23262B; text-align: right; vertical-align: top; color: #FFFFFF; font-weight: 700; font-size: 13px; font-family: monospace;'>₹")
                        .append(formatInr(lineTotal))
                        .append("</td>")
                        .append("</tr>");
            }
        }

        BigDecimal grandTotal = order.getTotalAmount() != null ? order.getTotalAmount() : subtotal;
        BigDecimal shipping = grandTotal.subtract(subtotal);
        if (shipping.compareTo(BigDecimal.ZERO) < 0) shipping = BigDecimal.ZERO;

        String shippingDisplay = shipping.compareTo(BigDecimal.ZERO) == 0
                ? "<span style='color: #10B981; font-weight: 700;'>FREE</span>"
                : "₹" + formatInr(shipping);

        Address addr = order.getAddress();
        String shippingDetails = addr != null
                ? String.format("<strong style='color: #FFFFFF;'>%s</strong><br/>%s<br/>%s, %s %s<br/>%s<br/><span style='color: #71717A;'>Phone:</span> %s",
                escapeHtml(addr.getFullName()),
                escapeHtml(addr.getStreetAddress()),
                escapeHtml(addr.getCity()),
                escapeHtml(addr.getState()),
                escapeHtml(addr.getPostalCode()),
                escapeHtml(addr.getCountry() != null ? addr.getCountry() : "India"),
                escapeHtml(addr.getPhone()))
                : "Standard Delivery Address";

        LocalDateTime createdAt = order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now();
        String orderDateStr = createdAt.format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
        String estDeliveryStart = createdAt.toLocalDate().plusDays(3).format(DateTimeFormatter.ofPattern("dd MMM"));
        String estDeliveryEnd = createdAt.toLocalDate().plusDays(5).format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
        String estimatedDelivery = estDeliveryStart + " – " + estDeliveryEnd;

        String paymentMethodDisplay = resolvePaymentMethodDisplay(order.getPaymentMethod());
        String paymentStatusDisplay = resolvePaymentStatusDisplay(order.getPaymentMethod(), order.getPaymentStatus());

        String ordersUrl = (frontendUrl != null ? frontendUrl.replaceAll("/$", "") : "http://localhost:5173") + "/orders";

        return "<!DOCTYPE html>\n" +
                "<html lang='en'>\n" +
                "<head>\n" +
                "  <meta charset='UTF-8'/>\n" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1.0'/>\n" +
                "  <title>Order Confirmed #" + escapeHtml(order.getOrderNumber()) + " | SneakX</title>\n" +
                "</head>\n" +
                "<body style='margin: 0; padding: 32px 12px; background-color: #0A0B0D; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; color: #FAFAFA; line-height: 1.5;'>\n" +
                "  <div style='max-width: 600px; margin: 0 auto; background-color: #121316; border: 1px solid #24272D; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.6);'>\n" +
                "\n" +
                "    <!-- Header / Branding -->\n" +
                "    <div style='background-color: #16181D; padding: 24px 32px; border-bottom: 2px solid #FF3B30; text-align: center;'>\n" +
                "      <div style='font-size: 26px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF;'>\n" +
                "        SNEAK<span style='color: #FF3B30;'>X</span>\n" +
                "      </div>\n" +
                "      <div style='font-size: 11px; font-weight: 700; color: #E6FF00; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 4px;'>\n" +
                "        Verified Authentic Sneaker Drop\n" +
                "      </div>\n" +
                "    </div>\n" +
                "\n" +
                "    <!-- Main Card Body -->\n" +
                "    <div style='padding: 32px 28px;'>\n" +
                "\n" +
                "      <!-- Greeting & Confirmation Hero Banner -->\n" +
                "      <div style='background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.28); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 28px;'>\n" +
                "        <div style='display: inline-block; background-color: #10B981; color: #000000; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 10px; border-radius: 20px; margin-bottom: 10px;'>\n" +
                "          Order Confirmed ✓\n" +
                "        </div>\n" +
                "        <h1 style='margin: 0; font-size: 22px; font-weight: 800; color: #FFFFFF;'>Thanks, " + escapeHtml(customerName) + "!</h1>\n" +
                "        <p style='margin: 6px 0 0 0; font-size: 14px; color: #10B981; font-weight: 600;'>Your order has been confirmed.</p>\n" +
                "        <p style='margin: 6px 0 0 0; font-size: 13px; color: #A1A1AA;'>Inventory reservation locked into the SneakX system. Deadstock verification in progress.</p>\n" +
                "      </div>\n" +
                "\n" +
                "      <!-- Order Information Grid -->\n" +
                "      <div style='background-color: #181A1F; border: 1px solid #24272D; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;'>\n" +
                "        <table style='width: 100%; border-collapse: collapse; font-size: 13px;'>\n" +
                "          <tr>\n" +
                "            <td style='padding: 6px 0; color: #71717A;'>Order ID:</td>\n" +
                "            <td style='padding: 6px 0; text-align: right; color: #E6FF00; font-family: monospace; font-weight: 700;'>#" + escapeHtml(order.getOrderNumber()) + "</td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style='padding: 6px 0; color: #71717A;'>Order Date:</td>\n" +
                "            <td style='padding: 6px 0; text-align: right; color: #FFFFFF;'> " + orderDateStr + "</td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style='padding: 6px 0; color: #71717A;'>Order Status:</td>\n" +
                "            <td style='padding: 6px 0; text-align: right; color: #10B981; font-weight: 700; text-transform: uppercase;'>" + escapeHtml(order.getStatus()) + "</td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style='padding: 6px 0; color: #71717A;'>Estimated Delivery:</td>\n" +
                "            <td style='padding: 6px 0; text-align: right; color: #FFFFFF; font-weight: 600;'>" + estimatedDelivery + "</td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </div>\n" +
                "\n" +
                "      <!-- Items Ordered Table -->\n" +
                "      <div style='margin-bottom: 28px;'>\n" +
                "        <div style='font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #A1A1AA; margin-bottom: 12px;'>\n" +
                "          Items Ordered\n" +
                "        </div>\n" +
                "        <table style='width: 100%; border-collapse: collapse; font-size: 13px;'>\n" +
                "          <thead>\n" +
                "            <tr style='background-color: #181A1F; color: #71717A; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;'>\n" +
                "              <th colspan='" + (order.getItems() != null && !order.getItems().isEmpty() && order.getItems().get(0).getImageUrl() != null ? "2" : "1") + "' style='padding: 10px 8px; text-align: left;'>Sneaker</th>\n" +
                "              <th style='padding: 10px 8px; text-align: center;'>Qty</th>\n" +
                "              <th style='padding: 10px 8px; text-align: right;'>Unit Price</th>\n" +
                "              <th style='padding: 10px 0 10px 8px; text-align: right;'>Total</th>\n" +
                "            </tr>\n" +
                "          </thead>\n" +
                "          <tbody>\n" +
                itemsRows.toString() +
                "          </tbody>\n" +
                "        </table>\n" +
                "      </div>\n" +
                "\n" +
                "      <!-- Price Summary -->\n" +
                "      <div style='background-color: #181A1F; border: 1px solid #24272D; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;'>\n" +
                "        <table style='width: 100%; border-collapse: collapse; font-size: 13px;'>\n" +
                "          <tr>\n" +
                "            <td style='padding: 5px 0; color: #A1A1AA;'>Subtotal:</td>\n" +
                "            <td style='padding: 5px 0; text-align: right; color: #FFFFFF; font-family: monospace;'>₹" + formatInr(subtotal) + "</td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style='padding: 5px 0; color: #A1A1AA;'>Tax:</td>\n" +
                "            <td style='padding: 5px 0; text-align: right; color: #71717A; font-size: 12px;'>Included in price (18% GST)</td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style='padding: 5px 0; color: #A1A1AA;'>Shipping:</td>\n" +
                "            <td style='padding: 5px 0; text-align: right;'>" + shippingDisplay + "</td>\n" +
                "          </tr>\n" +
                "          <tr>\n" +
                "            <td style='padding: 12px 0 0 0; font-size: 16px; font-weight: 800; color: #FFFFFF; border-top: 1px solid #24272D;'>Grand Total:</td>\n" +
                "            <td style='padding: 12px 0 0 0; text-align: right; font-size: 18px; font-weight: 800; color: #E6FF00; font-family: monospace; border-top: 1px solid #24272D;'>₹" + formatInr(grandTotal) + "</td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </div>\n" +
                "\n" +
                "      <!-- Payment & Shipping Details Grid -->\n" +
                "      <div style='margin-bottom: 32px;'>\n" +
                "        <table style='width: 100%; border-collapse: collapse;'>\n" +
                "          <tr>\n" +
                "            <td style='width: 50%; vertical-align: top; padding-right: 8px;'>\n" +
                "              <div style='background-color: #181A1F; border: 1px solid #24272D; border-radius: 8px; padding: 16px; min-height: 120px;'>\n" +
                "                <div style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #71717A; margin-bottom: 8px;'>\n" +
                "                  Payment Details\n" +
                "                </div>\n" +
                "                <div style='font-size: 13px; color: #A1A1AA;'>Method:</div>\n" +
                "                <div style='font-size: 13px; font-weight: 700; color: #FFFFFF; margin-bottom: 6px;'>" + escapeHtml(paymentMethodDisplay) + "</div>\n" +
                "                <div style='font-size: 13px; color: #A1A1AA;'>Status:</div>\n" +
                "                <div style='font-size: 12px; font-weight: 700; color: " + (paymentStatusDisplay.equals("PAID") ? "#10B981" : "#E6FF00") + ";'>" + escapeHtml(paymentStatusDisplay) + "</div>\n" +
                "              </div>\n" +
                "            </td>\n" +
                "            <td style='width: 50%; vertical-align: top; padding-left: 8px;'>\n" +
                "              <div style='background-color: #181A1F; border: 1px solid #24272D; border-radius: 8px; padding: 16px; min-height: 120px;'>\n" +
                "                <div style='font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #71717A; margin-bottom: 8px;'>\n" +
                "                  Shipping Address\n" +
                "                </div>\n" +
                "                <div style='font-size: 12px; color: #D4D4D8; line-height: 1.5;'>" + shippingDetails + "</div>\n" +
                "              </div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </div>\n" +
                "\n" +
                "      <!-- CTA Button: View My Orders -->\n" +
                "      <div style='text-align: center; margin: 32px 0 20px 0;'>\n" +
                "        <a href='" + escapeHtml(ordersUrl) + "' style='display: inline-block; background-color: #E6FF00; color: #0A0B0D; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; text-decoration: none; padding: 14px 32px; border-radius: 6px; box-shadow: 0 4px 14px rgba(230, 255, 0, 0.3);'>\n" +
                "          View My Orders →\n" +
                "        </a>\n" +
                "      </div>\n" +
                "\n" +
                "    </div>\n" +
                "\n" +
                "    <!-- Footer -->\n" +
                "    <div style='background-color: #16181D; padding: 24px; text-align: center; border-top: 1px solid #24272D; font-size: 12px;'>\n" +
                "      <div style='font-weight: 700; color: #FFFFFF; letter-spacing: 0.04em;'>SneakX</div>\n" +
                "      <div style='color: #71717A; margin-top: 2px;'>Premium Sneaker Marketplace · 100% Deadstock Verified</div>\n" +
                "      <div style='color: #52525B; font-size: 11px; margin-top: 8px;'>\n" +
                "        This is an automated order confirmation receipt. Questions? Contact support@sneakx.com\n" +
                "      </div>\n" +
                "    </div>\n" +
                "\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    /**
     * Dispatches a VIP Drop Alert welcome email to a new newsletter subscriber.
     *
     * @param recipientEmail the subscriber's email address
     * @return true if dispatched, false on error
     */
    public boolean sendNewsletterWelcome(String recipientEmail) {
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            log.warn("[EMAIL-SERVICE] Cannot dispatch newsletter welcome: recipient email is empty");
            return false;
        }

        recipientEmail = recipientEmail.trim().toLowerCase();
        String subject = "⚡ Welcome to SneakX VIP Drop Alerts | Early Access Unlocked";
        String htmlContent = buildNewsletterWelcomeHtml(recipientEmail);

        JavaMailSender sender = getEffectiveMailSender();

        if (sender == null) {
            log.warn("[EMAIL-SERVICE] SMTP NOT CONFIGURED: Newsletter welcome email logged to console fallback.");
            log.info("\n" +
                    "========================================================================================\n" +
                    " [SNEAKX EMAIL SERVICE] NEWSLETTER WELCOME DISPATCHED (DEVELOPMENT FALLBACK LOG)\n" +
                    "========================================================================================\n" +
                    " To:          " + recipientEmail + "\n" +
                    " From:        SneakX Alerts <" + resolveFromAddress() + ">\n" +
                    " Subject:     " + subject + "\n" +
                    " Status:      VIP Early Access Granted\n" +
                    "========================================================================================\n");
            return true;
        }

        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            String fromAddress = resolveFromAddress();
            helper.setFrom(new InternetAddress(fromAddress, "SneakX Alerts"));
            helper.setTo(recipientEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            sender.send(message);
            log.info("[EMAIL-SERVICE] Real VIP newsletter welcome email successfully delivered to {}", recipientEmail);
            return true;
        } catch (Exception ex) {
            log.error("[EMAIL-SERVICE] Failed to deliver VIP newsletter welcome to {}: {}",
                    recipientEmail, sanitizeErrorMessage(ex.getMessage()));
            return false;
        }
    }

    private String buildNewsletterWelcomeHtml(String recipientEmail) {
        String catalogueUrl = (frontendUrl != null ? frontendUrl.replaceAll("/$", "") : "http://localhost:5173") + "/catalogue";

        return "<!DOCTYPE html>\n" +
                "<html lang='en'>\n" +
                "<head>\n" +
                "  <meta charset='UTF-8'/>\n" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1.0'/>\n" +
                "  <title>Welcome to SneakX VIP Drop Alerts</title>\n" +
                "</head>\n" +
                "<body style='margin: 0; padding: 32px 12px; background-color: #0A0B0D; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; color: #FAFAFA; line-height: 1.5;'>\n" +
                "  <div style='max-width: 600px; margin: 0 auto; background-color: #121316; border: 1px solid #24272D; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.6);'>\n" +
                "\n" +
                "    <!-- Header / Branding -->\n" +
                "    <div style='background-color: #16181D; padding: 26px 32px; border-bottom: 2px solid #FF3B30; text-align: center;'>\n" +
                "      <div style='font-size: 28px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF;'>\n" +
                "        SNEAK<span style='color: #FF3B30;'>X</span>\n" +
                "      </div>\n" +
                "      <div style='font-size: 11px; font-weight: 800; color: #E6FF00; letter-spacing: 0.14em; text-transform: uppercase; margin-top: 4px;'>\n" +
                "        VIP Shock Drop Alerts • Early Access Member\n" +
                "      </div>\n" +
                "    </div>\n" +
                "\n" +
                "    <!-- Body Content -->\n" +
                "    <div style='padding: 36px 32px;'>\n" +
                "\n" +
                "      <!-- Hero Badge -->\n" +
                "      <div style='background-color: rgba(255, 59, 48, 0.08); border: 1px solid rgba(255, 59, 48, 0.28); border-radius: 8px; padding: 22px 20px; text-align: center; margin-bottom: 28px;'>\n" +
                "        <div style='display: inline-block; background-color: #FF3B30; color: #FFFFFF; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 12px; border-radius: 20px; margin-bottom: 12px;'>\n" +
                "          ACCESS UNLOCKED ✓\n" +
                "        </div>\n" +
                "        <h1 style='margin: 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em;'>You're In The Inner Circle</h1>\n" +
                "        <p style='margin: 8px 0 0 0; font-size: 14px; color: #A1A1AA; line-height: 1.6;'>\n" +
                "          Your email <strong style='color: #E6FF00; font-family: monospace;'>" + escapeHtml(recipientEmail) + "</strong> is now registered for live shock drops, authenticated restocks, and private deadstock releases.\n" +
                "        </p>\n" +
                "      </div>\n" +
                "\n" +
                "      <!-- 3 VIP Perks -->\n" +
                "      <div style='margin-bottom: 30px;'>\n" +
                "        <div style='font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #71717A; margin-bottom: 14px;'>\n" +
                "          YOUR VIP MEMBER PRIVILEGES\n" +
                "        </div>\n" +
                "\n" +
                "        <div style='background-color: #181A1F; border: 1px solid #24272D; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 12px;'>\n" +
                "          <div style='font-size: 18px; line-height: 1;'>🚨</div>\n" +
                "          <div>\n" +
                "            <div style='font-size: 13px; font-weight: 700; color: #FFFFFF;'>Instant Shock Drop Alerts</div>\n" +
                "            <div style='font-size: 12px; color: #A1A1AA; margin-top: 2px;'>Real-time notifications the millisecond hyped grails enter inventory.</div>\n" +
                "          </div>\n" +
                "        </div>\n" +
                "\n" +
                "        <div style='background-color: #181A1F; border: 1px solid #24272D; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 12px;'>\n" +
                "          <div style='font-size: 18px; line-height: 1;'>🛡️</div>\n" +
                "          <div>\n" +
                "            <div style='font-size: 13px; font-weight: 700; color: #FFFFFF;'>100% Deadstock Verified</div>\n" +
                "            <div style='font-size: 12px; color: #A1A1AA; margin-top: 2px;'>Every pair passes physical multi-point authentication before dispatch.</div>\n" +
                "          </div>\n" +
                "        </div>\n" +
                "\n" +
                "        <div style='background-color: #181A1F; border: 1px solid #24272D; border-radius: 8px; padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px;'>\n" +
                "          <div style='font-size: 18px; line-height: 1;'>⚡</div>\n" +
                "          <div>\n" +
                "            <div style='font-size: 13px; font-weight: 700; color: #FFFFFF;'>Double-Box Delivery Assurance</div>\n" +
                "            <div style='font-size: 12px; color: #A1A1AA; margin-top: 2px;'>Original sneaker boxes kept pristine inside reinforced protective shipping outer boxes.</div>\n" +
                "          </div>\n" +
                "        </div>\n" +
                "      </div>\n" +
                "\n" +
                "      <!-- CTA Button -->\n" +
                "      <div style='text-align: center; margin: 36px 0 20px 0;'>\n" +
                "        <a href='" + escapeHtml(catalogueUrl) + "' style='display: inline-block; background-color: #E6FF00; color: #0A0B0D; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; text-decoration: none; padding: 14px 32px; border-radius: 6px; box-shadow: 0 4px 14px rgba(230, 255, 0, 0.3);'>\n" +
                "          Explore Live Grails →\n" +
                "        </a>\n" +
                "      </div>\n" +
                "\n" +
                "    </div>\n" +
                "\n" +
                "    <!-- Footer -->\n" +
                "    <div style='background-color: #16181D; padding: 24px; text-align: center; border-top: 1px solid #24272D; font-size: 12px;'>\n" +
                "      <div style='font-weight: 700; color: #FFFFFF; letter-spacing: 0.04em;'>SneakX VIP Network</div>\n" +
                "      <div style='color: #71717A; margin-top: 2px;'>Authentic Deadstock Marketplace</div>\n" +
                "      <div style='color: #52525B; font-size: 11px; margin-top: 8px;'>\n" +
                "        You received this because you subscribed to drop alerts. Questions? Reach us at support@sneakx.com\n" +
                "      </div>\n" +
                "    </div>\n" +
                "\n" +
                "  </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
