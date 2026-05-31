package com.sba301.cinemaai.service;

import com.sba301.cinemaai.config.VnpayProperties;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VnpayService {

    private final VnpayProperties vnpayProperties;

    public String buildPaymentUrl(String txnRef, BigDecimal amount, String orderInfo, String clientIp) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpayProperties.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount.multiply(BigDecimal.valueOf(100)).longValue()));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnpayProperties.getReturnUrl());
        params.put("vnp_IpAddr", clientIp != null ? clientIp : "127.0.0.1");
        params.put("vnp_CreateDate", currentDateTime());

        String queryString = buildQueryString(params);
        String secureHash = hmacSha512(vnpayProperties.getHashSecret(), queryString);
        return vnpayProperties.getApiUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifySignature(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) return false;

        Map<String, String> filtered = new HashMap<>(params);
        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");

        String queryString = buildQueryString(filtered);
        String expectedHash = hmacSha512(vnpayProperties.getHashSecret(), queryString);
        return expectedHash.equalsIgnoreCase(receivedHash);
    }

    private String buildQueryString(Map<String, String> params) {
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);
        StringBuilder sb = new StringBuilder();
        for (String key : keys) {
            String value = params.get(key);
            if (value != null && !value.isEmpty()) {
                if (!sb.isEmpty()) sb.append("&");
                sb.append(URLEncoder.encode(key, StandardCharsets.US_ASCII));
                sb.append("=");
                sb.append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
            }
        }
        return sb.toString();
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : bytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute HMAC-SHA512", e);
        }
    }

    private String currentDateTime() {
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        return new SimpleDateFormat("yyyyMMddHHmmss").format(cal.getTime());
    }
}
