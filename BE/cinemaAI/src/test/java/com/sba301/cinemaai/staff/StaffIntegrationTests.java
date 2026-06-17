package com.sba301.cinemaai.staff;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sba301.cinemaai.dto.request.auth.LoginRequest;
import com.sba301.cinemaai.dto.request.staff.CreateShiftRequest;
import com.sba301.cinemaai.dto.request.staff.CreateStaffRequest;
import com.sba301.cinemaai.dto.request.staff.UpdateShiftRequest;
import com.sba301.cinemaai.dto.request.staff.UpdateStaffRequest;
import com.sba301.cinemaai.dto.request.staff.UpdateStaffStatusRequest;
import com.sba301.cinemaai.entity.Role;
import com.sba301.cinemaai.entity.User;
import com.sba301.cinemaai.entity.UserRole;
import com.sba301.cinemaai.enums.RoleName;
import com.sba301.cinemaai.enums.StaffStatus;
import com.sba301.cinemaai.repository.RoleRepository;
import com.sba301.cinemaai.repository.UserRepository;
import com.sba301.cinemaai.repository.UserRoleRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class StaffIntegrationTests {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired UserRoleRepository userRoleRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void shouldCreateStaffProfileAndManageShifts() throws Exception {
        String adminToken = loginAsAdmin();
        String suffix = String.valueOf(System.nanoTime());

        // Create a regular user to become staff
        Long userId = createActiveUser("staff.user." + suffix + "@example.com", "Staff User " + suffix);

        // Create staff profile
        String createResponse = mockMvc.perform(post("/api/v1/admin/staff")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateStaffRequest(
                                userId, null, "EMP-" + suffix, "Ticket Seller"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.employeeCode").value("EMP-" + suffix))
                .andExpect(jsonPath("$.data.position").value("Ticket Seller"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andReturn().getResponse().getContentAsString();

        Long staffId = objectMapper.readTree(createResponse).at("/data/id").asLong();

        // Get staff by ID
        mockMvc.perform(get("/api/v1/admin/staff/{staffId}", staffId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(staffId));

        // Duplicate employee code should conflict
        Long userId2 = createActiveUser("staff.user2." + suffix + "@example.com", "Staff User2 " + suffix);
        mockMvc.perform(post("/api/v1/admin/staff")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateStaffRequest(
                                userId2, null, "EMP-" + suffix, "Another Position"
                        ))))
                .andExpect(status().isConflict());

        // Update staff
        mockMvc.perform(put("/api/v1/admin/staff/{staffId}", staffId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateStaffRequest(null, "Supervisor"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.position").value("Supervisor"));

        // Change status to INACTIVE
        mockMvc.perform(patch("/api/v1/admin/staff/{staffId}/status", staffId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateStaffStatusRequest(StaffStatus.INACTIVE))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INACTIVE"));

        // Search staff list
        mockMvc.perform(get("/api/v1/admin/staff")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isArray());

        // Create a shift
        LocalDateTime shiftStart = LocalDateTime.now().plusDays(1).withHour(8).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime shiftEnd   = shiftStart.plusHours(8);

        String shiftResponse = mockMvc.perform(post("/api/v1/admin/staff-shifts")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateShiftRequest(
                                staffId, shiftStart, shiftEnd, "Morning shift"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.staffProfileId").value(staffId))
                .andReturn().getResponse().getContentAsString();

        Long shiftId = objectMapper.readTree(shiftResponse).at("/data/id").asLong();

        // Get shifts for staff
        mockMvc.perform(get("/api/v1/admin/staff/{staffId}/shifts", staffId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        // Overlapping shift should fail
        mockMvc.perform(post("/api/v1/admin/staff-shifts")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateShiftRequest(
                                staffId, shiftStart.plusHours(2), shiftEnd.plusHours(2), "Overlapping"
                        ))))
                .andExpect(status().isBadRequest());

        // Update shift
        LocalDateTime newStart = shiftStart.plusDays(1);
        LocalDateTime newEnd   = newStart.plusHours(6);
        mockMvc.perform(put("/api/v1/admin/staff-shifts/{shiftId}", shiftId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateShiftRequest(
                                newStart, newEnd, "Updated shift note"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.note").value("Updated shift note"));

        // Search shifts
        mockMvc.perform(get("/api/v1/admin/staff-shifts")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("staffProfileId", staffId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isArray());

        // Delete shift
        mockMvc.perform(delete("/api/v1/admin/staff-shifts/{shiftId}", shiftId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/v1/admin/staff-shifts/{shiftId}", shiftId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateShiftRequest(
                                newStart, newEnd, "Should fail"
                        ))))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectInvalidShiftTimes() throws Exception {
        String token = loginAsAdmin();
        String suffix = String.valueOf(System.nanoTime());
        Long userId  = createActiveUser("staff.bad." + suffix + "@example.com", "Staff Bad " + suffix);

        String createResp = mockMvc.perform(post("/api/v1/admin/staff")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateStaffRequest(
                                userId, null, "BAD-" + suffix, "Tester"
                        ))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long staffId = objectMapper.readTree(createResp).at("/data/id").asLong();

        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end   = start.minusHours(1); // end before start

        mockMvc.perform(post("/api/v1/admin/staff-shifts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateShiftRequest(
                                staffId, start, end, "Bad times"
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRequireAdminForStaffEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/staff"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 401 || status == 403 : "Expected 401 or 403, got " + status;
                });

        mockMvc.perform(get("/api/v1/admin/staff-shifts"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 401 || status == 403 : "Expected 401 or 403, got " + status;
                });

        mockMvc.perform(get("/api/v1/admin/audit-logs"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 401 || status == 403 : "Expected 401 or 403, got " + status;
                });
    }

    @Test
    void shouldSearchAuditLogs() throws Exception {
        String token = loginAsAdmin();

        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .header("Authorization", "Bearer " + token)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isArray());
    }

    // ---- helpers ----

    private String loginAsAdmin() throws Exception {
        String email    = "staff.admin." + System.nanoTime() + "@example.com";
        String password = "Password123";
        Role adminRole  = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ADMIN)));

        User admin = new User(email, passwordEncoder.encode(password), "Staff Admin", "0900999111");
        admin.activateEmail();
        User saved = userRepository.save(admin);
        userRoleRepository.save(new UserRole(saved, adminRole));

        String response = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).at("/data/accessToken").asText();
    }

    private Long createActiveUser(String email, String fullName) {
        User user = new User(email, passwordEncoder.encode("Password123"), fullName, "0900000000");
        user.activateEmail();
        return userRepository.save(user).getId();
    }
}
